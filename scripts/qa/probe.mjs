// Motion/gating probe. Drives Chrome through the one shared CDP driver.
// usage: node probe.mjs <baseUrl>
import { reporter, session, sleep } from "./lib/cdp.mjs";

const BASE = process.argv[2] ?? "http://localhost:3411";
// reporter() exits 2 when nothing asserted — a probe that silently skipped
// every section must read as a failure, not a green.
const R = reporter("webgl gating + magnetic");
const ok = R.ok;
// A measurement the environment cannot take (e.g. GPU timers under software
// GL) is printed, not counted: a vacuous PASS would hide that it never ran.
const skip = (name, detail) => console.log(`SKIP  ${name}  [${detail}]`);

// Adapter over ./lib/cdp.mjs. This file used to carry its own copy of the
// driver — five scripts had drifted into five copies, so each hardening had to
// be repeated five times and in practice was not. Two details are preserved
// exactly because this suite depends on them:
//   gl: true   software WebGL, or the hero scene cannot be probed at all
//   5200ms     a longer settle than the shared default, since the WebGL layer
//              is dynamically imported on idle and needs the extra beat
async function probeSession({ width, height, reducedMotion, mobile, cpuThrottle }) {
  const s = await session({
    w: width, h: height, mobile, reducedMotion, cpuThrottle, gl: true, base: BASE,
  });
  return { ...s, goto: (path) => s.goto(path, 5200) };
}

// The liquid scene is one full-quad shader (REDESIGN-V4 Part F): exactly one
// indexed draw per frame, no textures, no per-frame buffer uploads. Under
// swiftshader that shader rasterises at ~20–30fps, so a 500ms window sees
// 10–15 draws — comfortably above the >5 floor and below the ≤35 ceiling
// (one per 60Hz frame). If the floor ever flakes here, widen the WINDOW; do
// not lower the bar — that is test tuning, not a regression.
const DRAW_WINDOW_MS = 500;

/** Every error a page can emit, across all three CDP channels (see 1.). */
const collectErrors = (s) => [
  ...s.events
    .filter((e) => e.method === "Log.entryAdded" && e.params?.entry?.level === "error")
    .map((e) => `log: ${e.params.entry.text}`),
  ...s.events
    .filter((e) => e.method === "Runtime.consoleAPICalled" && e.params?.type === "error")
    .map((e) => `console: ${(e.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ")}`),
  ...s.events
    .filter((e) => e.method === "Runtime.exceptionThrown")
    .map((e) => `throw: ${e.params?.exceptionDetails?.exception?.description ?? e.params?.exceptionDetails?.text ?? ""}`),
];

// ---------- 1. desktop ----------
{
  const s = await probeSession({ width: 1440, height: 900 });
  await s.goto("/");
  await s.mouseTo(1100, 420);
  // Poll for the canvas to go live rather than sleeping a fixed beat: under
  // swiftshader the full-quad shader's LLVM link alone takes ~4–5s after the
  // page settles (hardware GL is live within the settle). The bar is unchanged
  // — opacity must reach exactly "1" — only the window is wide enough for the
  // software path. Bounded, so a scene that never boots still fails quickly.
  for (let i = 0; i < 48; i++) {
    const op = await s.evalJs(`(() => { const c = document.querySelector('canvas'); return c ? getComputedStyle(c).opacity : 'absent'; })()`);
    if (op === "1") break;
    await sleep(250);
  }

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
  // *this scene* stopped. Draw calls are issued only by the scene's renderer.
  // The liquid quad is indexed (drawElements); drawArrays stays patched so a
  // future non-indexed draw cannot slip past the ceiling.
  //
  // bufferData/bufferSubData are patched alongside: the scene uploads its one
  // quad at first render and must never touch a GL buffer again — every
  // moving part is a uniform. Counted over 1s after the run/pause/resume
  // dance, i.e. well past the 1s settle the contract asks for.
  const rafCounts = await s.evalJs(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const protos = [window.WebGL2RenderingContext, window.WebGLRenderingContext]
      .filter(Boolean).map(c => c.prototype);
    window.__n = 0;
    window.__b = 0;
    const patched = [];
    for (const p of protos) {
      for (const m of ['drawArrays', 'drawElements']) {
        const orig = p[m];
        if (!orig) continue;
        patched.push([p, m, orig]);
        p[m] = function (...a) { window.__n++; return orig.apply(this, a); };
      }
      for (const m of ['bufferData', 'bufferSubData']) {
        const orig = p[m];
        if (!orig) continue;
        patched.push([p, m, orig]);
        p[m] = function (...a) { window.__b++; return orig.apply(this, a); };
      }
    }
    await sleep(${DRAW_WINDOW_MS});
    const running = window.__n;

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await sleep(200);          // let the current frame drain
    window.__n = 0;
    await sleep(${DRAW_WINDOW_MS});
    const paused = window.__n;

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await sleep(400);
    window.__n = 0;
    await sleep(${DRAW_WINDOW_MS});
    const resumed = window.__n;

    window.__b = 0;
    await sleep(1000);
    const uploads = window.__b;
    const drawsDuringUploadWindow = window.__n;

    for (const [p, m, orig] of patched) p[m] = orig;
    return { running, paused, resumed, uploads, drawsDuringUploadWindow };
  })()`);
  ok(
    "desktop: scene draws while visible",
    (rafCounts?.running ?? 0) > 5,
    `gl draws/${DRAW_WINDOW_MS}ms=${rafCounts?.running}`,
  );
  ok(
    "desktop: one draw per frame (≤ 35 draws per 500ms)",
    (rafCounts?.running ?? 99) <= 35 * (DRAW_WINDOW_MS / 500),
    `gl draws/${DRAW_WINDOW_MS}ms=${rafCounts?.running}`,
  );
  ok(
    "desktop: scene halts when tab hidden",
    (rafCounts?.paused ?? 99) <= 1,
    `gl draws/${DRAW_WINDOW_MS}ms=${rafCounts?.paused}`,
  );
  ok(
    "desktop: scene resumes when tab visible",
    (rafCounts?.resumed ?? 0) > 5,
    `gl draws/${DRAW_WINDOW_MS}ms=${rafCounts?.resumed}`,
  );
  // Proven non-vacuous by the draw count in the same window: the scene WAS
  // rendering while zero uploads were observed.
  ok(
    "desktop: zero GL buffer uploads after settle",
    rafCounts?.uploads === 0 && (rafCounts?.drawsDuringUploadWindow ?? 0) > 5,
    `bufferData+bufferSubData/1s=${rafCounts?.uploads} (draws in window=${rafCounts?.drawsDuringUploadWindow})`,
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

  // Console errors on EVERY channel. Log.entryAdded carries browser-generated
  // entries (network, security, deprecation); a page's own console.error —
  // which is how three reports `THREE.WebGLProgram: Shader Error` — arrives
  // only as Runtime.consoleAPICalled, and an uncaught throw only as
  // Runtime.exceptionThrown. Filtering Log alone was blind to both (verified
  // with an injected console.error: Log saw nothing). This line is what gates
  // the GLSL compile, so it has to see it.
  const errs = collectErrors(s);
  ok("desktop: no console errors (incl. shader compile)", errs.length === 0, errs.join(" | ").slice(0, 220));

  s.close();
}

// ---------- 1c. GPU time per frame (hardware GL only) ----------
// EXT_disjoint_timer_query_webgl2 around the scene's one draw call. This
// session asks for NO software GL: headless Chrome then uses the machine's GPU
// where it can (this Mac: ANGLE Metal), which is the only place the number
// means anything. Three exits are SKIPs with a note, never a vacuous pass:
// no WebGL at all (CI without a GPU), a software renderer (swiftshader also
// exposes the extension, and its ~40ms/frame says nothing about a user), or
// no timer extension.
{
  const s = await session({ w: 1440, h: 900, gl: false, base: BASE });
  await s.goto("/", 5200);
  let live = false;
  for (let i = 0; i < 24 && !live; i++) {
    live = await s.evalJs(`(() => { const c = document.querySelector('canvas'); return !!c && getComputedStyle(c).opacity === '1'; })()`);
    if (!live) await sleep(250);
  }
  const gpu = !live
    ? { skip: "no hardware WebGL in this headless session (canvas never went live)" }
    : await s.evalJs(`(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const c = document.querySelector('canvas');
    const gl = c && c.getContext('webgl2');
    if (!gl) return { skip: 'no WebGL2 context on the hero canvas' };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    if (/swiftshader|llvmpipe|softpipe|software/i.test(renderer)) return { skip: 'software renderer: ' + renderer };
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if (!ext) return { skip: 'EXT_disjoint_timer_query_webgl2 unavailable on ' + renderer };
    const orig = gl.drawElements;
    const queries = [];
    gl.drawElements = function (...a) {
      if (queries.length >= 60) return orig.apply(this, a);
      const q = gl.createQuery();
      gl.beginQuery(ext.TIME_ELAPSED_EXT, q);
      const r = orig.apply(this, a);
      gl.endQuery(ext.TIME_ELAPSED_EXT);
      queries.push(q);
      return r;
    };
    await sleep(1500);
    gl.drawElements = orig;
    await sleep(300);
    const ms = [];
    const disjoint = !!gl.getParameter(ext.GPU_DISJOINT_EXT);
    for (const q of queries) {
      if (gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) ms.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6);
      gl.deleteQuery(q);
    }
    ms.sort((a, b) => a - b);
    const pick = (f) => ms.length ? +ms[Math.min(ms.length - 1, Math.floor(ms.length * f))].toFixed(3) : null;
    return { n: ms.length, min: pick(0), median: pick(0.5), p95: pick(0.95), disjoint, renderer, buffer: c.width + 'x' + c.height };
  })()`);
  // Asserted on the MEDIAN. On ANGLE's Metal backend TIME_ELAPSED is
  // command-buffer wall time, not shader time: it does not scale with pixels
  // (156k → 239k fragments: same 0.8–0.9ms median) and its minimum is ~0.07ms,
  // so the median bounds the frame's GPU cost from above and the p95 (~1.7–2.1
  // on an M1 Max) is GPU wake/scheduling jitter. Both are printed.
  if (gpu?.skip) {
    skip("hardware GL: GPU time per frame < 2ms", gpu.skip + " — not measured");
  } else {
    ok(
      "hardware GL: GPU time per frame < 2ms (median)",
      (gpu?.n ?? 0) >= 10 && (gpu?.median ?? 99) < 2 && !gpu?.disjoint,
      `n=${gpu?.n} min=${gpu?.min}ms median=${gpu?.median}ms p95=${gpu?.p95}ms disjoint=${gpu?.disjoint} buffer=${gpu?.buffer} on ${gpu?.renderer}`,
    );
  }
  s.close();
}

// ---------- 1b. desktop, 4x CPU: main-thread cost of the scene ----------
// Every rAF callback is timed by wrapping requestAnimationFrame BEFORE any page
// script runs. A callback that issues a GL draw is the scene's frame; the rest
// (Lenis, the velocity bus, Magnetic, section progress) are reported alongside
// so a regression in either stands out. Two statistics from one session:
//   • the MEDIAN at 4x CPU throttle (< 1ms). Chrome throttles by suspending the
//     main thread in slices, so at 4x even a trivial callback (the non-scene
//     bucket, median 0ms) shows p95 ≈ 0.5–0.6ms and the scene's p95 swings
//     1.1–1.4ms run to run while its median holds at 0.5ms: the p95 of a
//     throttled callback measures the slice length, the median measures the
//     callback.
//   • the p95 with the throttle lifted (< 1ms; measured 0.2ms on both software
//     and hardware GL). This is the tail the user actually experiences.
// Together they are what "zero per-frame layout reads, zero DOM writes, zero
// uploads" buys; a single getBoundingClientRect per frame trips the first.
{
  const s = await probeSession({ width: 1440, height: 900, cpuThrottle: 4 });
  await s.addInitScript(`(() => {
    window.__raf = { scene: [], other: [] };
    let draws = 0;
    const protos = [window.WebGL2RenderingContext, window.WebGLRenderingContext]
      .filter(Boolean).map(c => c.prototype);
    for (const p of protos) for (const m of ['drawArrays', 'drawElements']) {
      const orig = p[m];
      if (!orig) continue;
      p[m] = function (...a) { draws++; return orig.apply(this, a); };
    }
    const origRaf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => origRaf((ts) => {
      const d0 = draws, t0 = performance.now();
      try { return cb(ts); } finally {
        (draws > d0 ? window.__raf.scene : window.__raf.other).push(performance.now() - t0);
      }
    });
  })()`);
  await s.goto("/");
  // Wait for the canvas to go live (the idle import + compileAsync take longer
  // at 4x), then discard everything measured so far and sample 2s of steady
  // state — boot work (hydration, the lazy chunk, the shader link) must never
  // leak into a per-frame number.
  let live = false;
  for (let i = 0; i < 40 && !live; i++) {
    live = await s.evalJs(`(() => { const c = document.querySelector('canvas'); return !!c && getComputedStyle(c).opacity === '1'; })()`);
    if (!live) await sleep(250);
  }
  const STATS = `(() => {
    const q = (a, f) => { const v = [...a].sort((x, y) => x - y); return v.length ? +v[Math.min(v.length - 1, Math.floor(v.length * f))].toFixed(3) : null; };
    return { nScene: window.__raf.scene.length, medScene: q(window.__raf.scene, 0.5), p95Scene: q(window.__raf.scene, 0.95),
             nOther: window.__raf.other.length, medOther: q(window.__raf.other, 0.5), p95Other: q(window.__raf.other, 0.95) };
  })()`;
  const RESET = "window.__raf.scene.length = 0; window.__raf.other.length = 0;";
  await s.evalJs(RESET);
  await sleep(2000);
  const slow = await s.evalJs(STATS);
  // Lift the throttle in the same session for the native tail.
  await s.S("Emulation.setCPUThrottlingRate", { rate: 1 });
  await sleep(300);
  await s.evalJs(RESET);
  await sleep(2000);
  const fast = await s.evalJs(STATS);
  ok(
    "desktop 4x CPU: scene rAF callback median < 1ms",
    live && (slow?.nScene ?? 0) >= 10 && (slow?.medScene ?? 99) < 1,
    `scene frames=${slow?.nScene} median=${slow?.medScene}ms p95=${slow?.p95Scene}ms; other rAF callbacks=${slow?.nOther} median=${slow?.medOther}ms p95=${slow?.p95Other}ms`,
  );
  ok(
    "desktop 1x CPU: scene rAF callback p95 < 1ms",
    live && (fast?.nScene ?? 0) >= 10 && (fast?.p95Scene ?? 99) < 1,
    `scene frames=${fast?.nScene} median=${fast?.medScene}ms p95=${fast?.p95Scene}ms; other rAF callbacks=${fast?.nOther} p95=${fast?.p95Other}ms`,
  );
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

R.finish();
