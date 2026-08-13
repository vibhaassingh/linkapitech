// Full-page screenshot via CDP over the DevTools websocket — no npm deps.
// usage: node shot.mjs <url> <outfile> [width] [reducedMotion]
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [url, out, widthArg, rm] = process.argv.slice(2);
const width = Number(widthArg ?? 1440);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9222 + Math.floor(Math.random() * 400);

const args = [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--window-size=${width},1000`,
  "--user-data-dir=/tmp/cdp-shot-profile-" + port,
  "about:blank",
];
if (rm === "rm") args.unshift("--force-prefers-reduced-motion");
const chrome = spawn(CHROME, args, { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await getWsUrl());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? m.error);
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) =>
  new Promise((res) => {
    const myId = ++id;
    pending.set(myId, res);
    ws.send(JSON.stringify({ id: myId, method, params, sessionId }));
  });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);

await S("Page.enable");
await S("Emulation.setDeviceMetricsOverride", {
  width,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await S("Page.navigate", { url });
await sleep(5000);

// Two normalisations, both so the capture is a function of OUR code alone:
//
//   [data-reveal] — force every reveal visible, so nothing is caught
//   mid-transition.
//
//   iframe — blank third-party embeds. /contact carries a lazy Google Maps
//   embed, and whether its tiles arrive before the capture depends on the
//   network, not on this repo. Two runs 20 minutes apart off identical source
//   differed on 17.6% of contact-1440's pixels: a 440px band flipped between
//   Maps' land colour (#e5e3df) and bare --canvas. `visibility: hidden` blanks
//   it WITHOUT collapsing it, so page height and every other element's position
//   are untouched — which matters, since pixdiff treats a height change as a
//   redesign signal.
await S("Runtime.evaluate", {
  expression: `document.documentElement.insertAdjacentHTML('beforeend','<style>[data-reveal]{opacity:1!important;transform:none!important;transition:none!important}iframe{visibility:hidden!important}</style>')`,
});
await sleep(400);

const { cssContentSize } = await S("Page.getLayoutMetrics");
const fullH = Math.min(Math.ceil(cssContentSize.height), 30000);
await S("Emulation.setDeviceMetricsOverride", {
  width,
  height: fullH,
  deviceScaleFactor: 1,
  mobile: false,
});
await sleep(1200);

const { data } = await S("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true,
});
writeFileSync(out, Buffer.from(data, "base64"));
console.log(`${out} ${width}x${fullH}`);

ws.close();
chrome.kill();
process.exit(0);
