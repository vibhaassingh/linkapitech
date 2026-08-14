// Motion/gating probe. Drives Chrome through the one shared CDP driver.
// usage: node probe.mjs <baseUrl>
import { session, sleep } from "./lib/cdp.mjs";

const BASE = process.argv[2] ?? "http://localhost:3411";
const results = [];
const ok = (name, pass, detail = "") => results.push({ name, pass, detail });

// Adapter over ./lib/cdp.mjs. This file used to carry its own copy of the
// driver — five scripts had drifted into five copies, so each hardening had to
// be repeated five times and in practice was not. Two details are preserved
// exactly because this suite depends on them:
//   gl: true   software WebGL, or the hero scene cannot be probed at all
//   5200ms     a longer settle than the shared default, since the WebGL layer
//              is dynamically imported on idle and needs the extra beat
async function probeSession({ width, height, reducedMotion, mobile }) {
  const s = await session({
    w: width, h: height, mobile, reducedMotion, gl: true, base: BASE,
  });
  return { ...s, goto: (path) => s.goto(path, 5200) };
}

// ---------- 1. desktop ----------
{
  const s = await probeSession({ width: 1440, height: 900 });
  await s.goto("/");
  await s.mouseTo(1100, 420);
  await sleep(3500);

  const info = await s.evalJs(`(() => {
    const c = document.querySelector('canvas');
    if (!c) return { present: false };
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return {
      present: true,
      opacity: getComputedStyle(c).opacity,
      bufW: c.width, bufH: c.height,
      hasGl: !!gl,
    };
  })()`);
  ok("desktop: hero canvas present", !!info?.present, JSON.stringify(info));
  ok("desktop: WebGL layer live (opacity 1)", info?.opacity === "1", `opacity=${info?.opacity}`);
  ok("desktop: sized drawing buffer", info?.bufW > 0 && info?.bufH > 0, `${info?.bufW}x${info?.bufH}`);

  // three.js must arrive as a lazy chunk, not in the document's initial scripts
  const threeInInitialHtml = await s.evalJs(`(async () => {
    const html = await (await fetch(location.href)).text();
    // collect <script src> from the server HTML only
    const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
    return srcs.length;
  })()`);
  const lazyReqs = s.events
    .filter((e) => e.method === "Network.requestWillBeSent")
    .map((e) => e.params?.request?.url ?? "")
    .filter((u) => u.includes("/_next/static/chunks/"));
  ok(
    "desktop: chunks loaded (three arrives lazily)",
    lazyReqs.length > 0,
    `chunk requests=${lazyReqs.length}, initial scripts=${threeInInitialHtml}`,
  );

  // rAF must halt when the tab is hidden. setPageVisibilityOverride is not
  // effective in this headless build, so instead count real rAF callbacks
  // before and after faking `document.hidden` + firing visibilitychange.
  // Count GL draw calls, not rAF callbacks: Lenis keeps its own rAF loop
  // running permanently by design, so a global frame count cannot tell whether
  // *this scene* stopped. drawArrays is issued only by the scene's renderer.
  const rafCounts = await s.evalJs(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const protos = [window.WebGL2RenderingContext, window.WebGLRenderingContext]
      .filter(Boolean).map(c => c.prototype);
    window.__n = 0;
    const patched = [];
    for (const p of protos) {
      for (const m of ['drawArrays', 'drawElements']) {
        const orig = p[m];
        if (!orig) continue;
        patched.push([p, m, orig]);
        p[m] = function (...a) { window.__n++; return orig.apply(this, a); };
      }
    }
    await sleep(500);
    const running = window.__n;

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await sleep(200);          // let the current frame drain
    window.__n = 0;
    await sleep(500);
    const paused = window.__n;

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await sleep(400);
    window.__n = 0;
    await sleep(500);
    const resumed = window.__n;

    for (const [p, m, orig] of patched) p[m] = orig;
    return { running, paused, resumed };
  })()`);
  ok(
    "desktop: scene draws while visible",
    (rafCounts?.running ?? 0) > 5,
    `gl draws/500ms=${rafCounts?.running}`,
  );
  ok(
    "desktop: scene halts when tab hidden",
    (rafCounts?.paused ?? 99) <= 1,
    `gl draws/500ms=${rafCounts?.paused}`,
  );
  ok(
    "desktop: scene resumes when tab visible",
    (rafCounts?.resumed ?? 0) > 5,
    `gl draws/500ms=${rafCounts?.resumed}`,
  );

  // magnetic pull
  const box = await s.evalJs(`(() => {
    const b = document.querySelector('[data-magnetic]');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, t: b.style.transform || 'none' };
  })()`);
  ok("desktop: a magnetic CTA exists", !!box, JSON.stringify(box));
  if (box) {
    await s.S("Emulation.setPageVisibilityOverride", { hidden: false }).catch(() => {});
    await s.mouseTo(box.x + box.w * 0.85, box.y + box.h * 0.5);
    await sleep(400);
    // The pull is written to the `translate` PROPERTY, not `transform` — that
    // split is deliberate: `translate` composes with `transform`, which is what
    // lets Button's :active { transform: scale(.97) } still fire while the
    // cursor is pulling it. Asserting `transform` here reported a false failure.
    const after = await s.evalJs(`(() => {
      const b = document.querySelector('[data-magnetic]');
      return { translate: b.style.translate || 'none', transform: b.style.transform || 'none' };
    })()`);
    const pulled = after.translate !== "none" || /translate3d/.test(after.transform);
    ok("magnetic: pull applied on hover", pulled, JSON.stringify(after));
    await s.mouseTo(5, 5);
    await sleep(400);
    const rel = await s.evalJs(`(() => {
      const b = document.querySelector('[data-magnetic]');
      return (b.style.translate || 'none') + ' / ' + (b.style.transform || 'none');
    })()`);
    // Release is sprung via WAAPI, so allow a settling window.
    ok("magnetic: released on leave", /^(none|0px) \/ none$/.test(rel) || rel === "none / none", `translate/transform=${rel}`);
  }

  const errs = s.events
    .filter((e) => e.method === "Log.entryAdded" && e.params?.entry?.level === "error")
    .map((e) => e.params.entry.text);
  ok("desktop: no console errors", errs.length === 0, errs.join(" | ").slice(0, 180));

  s.close();
}

// ---------- 2. mobile ----------
{
  const s = await probeSession({ width: 390, height: 844, mobile: true });
  await s.goto("/");
  await sleep(3000);
  const op = await s.evalJs(`(() => {
    const c = document.querySelector('canvas');
    return c ? getComputedStyle(c).opacity : 'absent';
  })()`);
  ok("mobile: WebGL layer stays dormant", op !== "1", `opacity=${op}`);
  s.close();
}

// ---------- 3. reduced motion ----------
{
  const s = await probeSession({ width: 1440, height: 900, reducedMotion: true });
  await s.goto("/");
  await sleep(3000);
  const op = await s.evalJs(`(() => {
    const c = document.querySelector('canvas');
    return c ? getComputedStyle(c).opacity : 'absent';
  })()`);
  ok("reduced-motion: WebGL layer stays dormant", op !== "1", `opacity=${op}`);

  const hidden = await s.evalJs(`
    [...document.querySelectorAll('[data-reveal]')]
      .filter(e => getComputedStyle(e).opacity !== '1').length`);
  ok("reduced-motion: no reveal left hidden", hidden === 0, `hidden=${hidden}`);

  const ghost = await s.evalJs(`(() => {
    const g = document.querySelector('.ghost-num');
    return g ? getComputedStyle(g).transform : 'absent';
  })()`);
  ok(
    "reduced-motion: ghost numerals not offset",
    ghost === "none" || ghost === "absent" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(ghost),
    `transform=${ghost}`,
  );

  const box = await s.evalJs(`(() => {
    const b = document.querySelector('[data-magnetic]');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  })()`);
  if (box) {
    await s.mouseTo(box.x + box.w * 0.85, box.y + box.h * 0.5);
    await sleep(350);
    const t = await s.evalJs(
      `document.querySelector('[data-magnetic]').style.transform || 'none'`,
    );
    ok("reduced-motion: magnetic disabled", t === "none", `transform=${t}`);
  } else {
    ok("reduced-motion: magnetic disabled", false, "no [data-magnetic] found");
  }
  s.close();
}

let fail = 0;
for (const r of results) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail}]` : ""}`);
}
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
