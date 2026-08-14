// Minimal Chrome DevTools Protocol driver — no npm dependencies.
//
// The QA harness talks to headless Chrome over the DevTools websocket rather
// than through Playwright/Puppeteer, so `npm ci` stays lean and CI needs only a
// Chrome binary. The older scripts in this directory each carry their own copy
// of this plumbing (they are verified as-is and left untouched); new probes
// should import from here.
import { spawn } from "node:child_process";

const CHROME =
  process.env.CHROME_BIN ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Launch headless Chrome and attach to a fresh target.
 *
 * @param {object} opts
 * @param {number} opts.w viewport width
 * @param {number} opts.h viewport height
 * @param {boolean} [opts.mobile] mobile emulation
 * @param {boolean} [opts.reducedMotion] force prefers-reduced-motion: reduce
 * @param {boolean} [opts.gl] software WebGL (needed to exercise the hero scene)
 * @param {number}  [opts.cpuThrottle] CPU slowdown multiplier (e.g. 4)
 */
export async function session({
  w = 1440,
  h = 900,
  mobile = false,
  reducedMotion = false,
  gl = false,
  cpuThrottle = 0,
} = {}) {
  const port = 9200 + Math.floor(Math.random() * 700);
  const args = [
    "--headless=new",
    "--hide-scrollbars",
    "--no-first-run",
    `--remote-debugging-port=${port}`,
    `--window-size=${w},${h}`,
    `--user-data-dir=/tmp/cdp-qa-${port}`,
    "about:blank",
  ];
  if (gl) args.splice(1, 0, "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader");
  if (reducedMotion) args.unshift("--force-prefers-reduced-motion");

  const chrome = spawn(CHROME, args, { stdio: "ignore" });

  let wsUrl;
  for (let i = 0; i < 100; i++) {
    try {
      const j = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      if (j.webSocketDebuggerUrl) {
        wsUrl = j.webSocketDebuggerUrl;
        break;
      }
    } catch {}
    await sleep(200);
  }
  if (!wsUrl) {
    chrome.kill();
    throw new Error(`Chrome did not start. Set CHROME_BIN if it lives elsewhere than:\n  ${CHROME}`);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result ?? m.error);
      pending.delete(m.id);
    } else if (m.method) events.push(m);
  };
  // Every CDP call is bounded. Without this a wedged Chrome parks the promise
  // forever and the whole gate hangs, indistinguishable from "still running" —
  // one run sat blocked for 9h23m after the machine slept mid-sweep, with the
  // renderer alive but never answering. A hung check has to be a LOUD failure,
  // because silence reads as progress.
  const CDP_TIMEOUT = Number(process.env.CDP_TIMEOUT_MS || 45000);
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const myId = ++id;
      const timer = setTimeout(() => {
        pending.delete(myId);
        rej(new Error(`CDP timeout after ${CDP_TIMEOUT}ms: ${method}`));
      }, CDP_TIMEOUT);
      pending.set(myId, (v) => { clearTimeout(timer); res(v); });
      try {
        ws.send(JSON.stringify({ id: myId, method, params, sessionId }));
      } catch (e) {
        clearTimeout(timer);
        pending.delete(myId);
        rej(e);
      }
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);

  await S("Page.enable");
  await S("Runtime.enable");
  await S("Network.enable");
  await S("Log.enable");
  await S("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile,
  });
  if (cpuThrottle) await S("Emulation.setCPUThrottlingRate", { rate: cpuThrottle });

  return {
    S,
    events,
    /** Evaluate an expression in the page; awaits promises, returns by value. */
    async evalJs(expression) {
      const r = await S("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r?.exceptionDetails) {
        throw new Error("page eval threw: " + JSON.stringify(r.exceptionDetails).slice(0, 400));
      }
      return r?.result?.value;
    },
    /** Install a script that runs before any page script on the next navigations. */
    addInitScript: (source) => S("Page.addScriptToEvaluateOnNewDocument", { source }),
    async goto(url, settleMs = 4200) {
      await S("Page.navigate", { url });
      await sleep(settleMs);
    },
    mouseTo: (x, y) => S("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, buttons: 0 }),
    /**
     * Scroll by dispatching a real wheel event.
     *
     * Required rather than `window.scrollTo`: Lenis intercepts wheel input and
     * animates scrollTop itself, so a programmatic scrollTo either fights it or
     * is overwritten on the next frame. A wheel event drives the same path a
     * user does, which is also what the scroll-driven timelines observe.
     */
    async wheel(deltaY, { x = Math.round(w / 2), y = Math.round(h / 2), steps = 1 } = {}) {
      for (let i = 0; i < steps; i++) {
        await S("Input.dispatchMouseEvent", {
          type: "mouseWheel",
          x,
          y,
          deltaX: 0,
          deltaY,
          pointerType: "mouse",
        });
        await sleep(16);
      }
    },
    scrollTop: () =>
      S("Runtime.evaluate", {
        expression: "window.scrollY || document.documentElement.scrollTop",
        returnByValue: true,
      }).then((r) => r?.result?.value ?? 0),
    consoleErrors() {
      return events
        .filter((e) => e.method === "Log.entryAdded" && e.params?.entry?.level === "error")
        .map((e) => e.params.entry.text);
    },
    close() {
      ws.close();
      chrome.kill();
    },
  };
}

/** Tiny result collector with a non-zero exit when anything failed. */
export function reporter(title) {
  const rows = [];
  return {
    ok: (name, pass, detail = "") => rows.push({ name, pass, detail }),
    finish() {
      let fail = 0;
      console.log(`\n=== ${title} ===`);
      for (const r of rows) {
        if (!r.pass) fail++;
        console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
      }
      console.log(`\n${rows.length - fail}/${rows.length} passed`);
      if (!rows.length) {
        // A run that asserted nothing is a failed run, not a green one — this
        // guard exists because an earlier link audit reported "all resolve"
        // against zero loaded pages.
        console.log("ABORT: no assertions ran");
        process.exit(2);
      }
      process.exit(fail ? 1 : 0);
    },
  };
}
