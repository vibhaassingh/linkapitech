import {
  DoubleSide,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector4,
  WebGLRenderer,
} from "three";
import { BLOBS, VIEW } from "./lensLayout";
import { FRAGMENT, VERTEX } from "./liquidShaders";

/**
 * Hero liquid lens — the WebGL half of the hero visual (REDESIGN-V4 Part F).
 *
 * One PlaneGeometry(500, 400) under an orthographic camera mapped 1:1 onto the
 * SVG poster's viewBox, one ShaderMaterial, one draw call per frame. Zero
 * textures, zero per-frame buffer uploads, zero per-frame DOM reads or writes
 * except a single string lookup of `--scroll-velocity` off the inline style.
 * Everything that moves is a uniform.
 *
 * The scene boots at `uWake = 0`, which the shader renders as the SVG's rest
 * pose (same palette hexes, same LENS/BLOBS/CAUSTICS literals via
 * lensLayout.ts), and eases to 1 over 1.4s after the first start() with a
 * quartic EASE-IN — so uWake is still ≈ 0 while the harness's 900ms canvas
 * fade and the poster's data-live fade cross. Two near-identical images
 * crossfade, then motion emerges: one lens waking up, not two images swapping.
 * QA pins that pose with `?liquid=rest` (see restPinned below).
 *
 * Budget: ≤ 2ms GPU/frame at 1440p on integrated GPUs (DPR ≤ 1.5, ≤ ~565k
 * fragments inside the 560px lens box), rAF callback well under 1ms.
 */

export interface HeroLiquid {
  start(): void;
  stop(): void;
  resize(): void;
  setPointer(nx: number, ny: number): void;
  dispose(): void;
}

/** Flow/time wrap period, seconds — the shader's `T`. */
const T = 360;
/** dt clamp: a tab resume or a long frame never jumps the liquid. */
const MAX_DT = 0.05;
/** Wake ease length, seconds (F5). */
const WAKE_S = 1.4;
/** Pointer easing time constant, seconds (F3). */
const POINTER_TAU = 0.35;
/** Slosh spring: acc = K·(v − x) − C·ẋ  →  ζ ≈ .53, ~1s period (F5). */
const SPRING_K = 38;
const SPRING_C = 6.5;
/** Second lerp on the (already lerped) velocity bus so the field never steps. */
const VEL_LERP = 0.08;
/** Adaptive quality (F6): over a window of this many frame intervals, more
 *  than half above QUALITY_MS ⇔ the window's median is above it → drop to
 *  DPR 1.0 once. Counted rather than sorted: a running tally is
 *  allocation-free, where a literal median copied and sorted 90 numbers
 *  inside the rAF callback every 90 frames. */
const QUALITY_WINDOW = 90;
const QUALITY_MS = 20;

const clamp1 = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);

export function createHeroLiquid(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  onFirstFrame?: () => void,
): HeroLiquid {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false, // the shader anti-aliases analytically (uPx); MSAA would be pure cost
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  // y-DOWN frustum: top = 0, bottom = 400, so world coordinates ARE the SVG's
  // viewBox coordinates. PlaneGeometry puts uv.y = 1 on its local top edge,
  // which this camera shows at the screen BOTTOM — so `vUv * VIEW` in the
  // shader is y-down without a flip. The same y-flip reverses the triangle
  // winding, hence DoubleSide below (FrontSide would cull the whole quad).
  const camera = new OrthographicCamera(0, VIEW.w, 0, VIEW.h, -100, 100);
  camera.position.z = 10;

  const uniforms = {
    uTime: { value: 0 },
    uFlow: { value: 0 },
    uVelocity: { value: 0 },
    uWake: { value: 0 },
    uPx: { value: 1 },
    uPointer: { value: new Vector2(0, 0) },
    // canvas origin xy + section size zw, viewBox units. Safe default until
    // the first resize(): the canvas IS the section.
    uBackdrop: { value: new Vector4(0, 0, VIEW.w, VIEW.h) },
    // Filled ONCE from lensLayout.ts — the only place randomness lives.
    uBlobA: { value: BLOBS.map((b) => new Vector4(b.ax, b.ay, b.kx, b.ky)) },
    uBlobB: { value: BLOBS.map((b) => new Vector4(b.phx, b.phy, b.r, b.w)) },
  };

  const geometry = new PlaneGeometry(VIEW.w, VIEW.h, 1, 1);
  // The shader writes PREMULTIPLIED rgba and the material does not blend: the
  // quad overwrites the (cleared, transparent) framebuffer and the browser's
  // compositor performs the one source-over onto the page. Blending here as
  // well would double-apply alpha and halo the rim.
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms,
    transparent: false,
    depthTest: false,
    depthWrite: false,
    blending: NoBlending,
    side: DoubleSide,
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.set(VIEW.w / 2, VIEW.h / 2, 0);
  mesh.frustumCulled = false;
  scene.add(mesh);
  // Nothing in the graph ever moves (motion is uniforms), so compute the
  // world matrices once and take the per-frame graph walk, culling test and
  // sort out of the rAF callback. The camera's projection is still refreshed
  // by resize() via updateProjectionMatrix().
  scene.updateMatrixWorld(true);
  scene.matrixWorldAutoUpdate = false;
  camera.updateMatrixWorld(true);
  camera.matrixWorldAutoUpdate = false;
  renderer.sortObjects = false;

  // ---- lifecycle state -----------------------------------------------------
  let raf = 0;
  let running = false; // the harness's intent (start/stop)
  let ready = false; // compileAsync resolved
  let disposed = false;
  let lost = false; // WebGL context currently lost
  let firstFrameSent = false;
  let last = 0; // previous frame timestamp, ms; 0 = none (fresh start)

  // ---- motion state (uniform sources) --------------------------------------
  let flow = 0;
  let time = 0;
  let wake = 0; // linear 0..1; eased into uWake
  let velocity = 0; // lerped --scroll-velocity
  let sloshX = 0; // spring position → uVelocity
  let sloshV = 0; // spring velocity
  let pointerTX = 0; // pointer target from setPointer
  let pointerTY = 0;

  // ---- adaptive quality ----------------------------------------------------
  let intervalCount = 0; // frame intervals seen in the current window
  let slowCount = 0; // of which > QUALITY_MS
  let degraded = false;

  // ---- QA affordance ---------------------------------------------------------
  // `?liquid=rest` pins the scene in its boot pose: uWake, uTime, uFlow,
  // uVelocity and uPointer stay 0 for as long as the page lives, so a test can
  // screenshot the canvas against the SVG poster and measure the rest-pose
  // match (REDESIGN-V4 Part J, Phase 5 review fixes). Read once here, never per
  // frame. Harmless in production — the frame still renders, it never wakes.
  const restPinned =
    new URLSearchParams(window.location.search).get("liquid") === "rest";

  // ---- scroll-velocity coupling -------------------------------------------
  // The velocity bus writes --scroll-velocity (−1..1, already lerped) onto
  // <html> as an inline custom property. Reading it back off `.style` is a
  // string lookup on that inline declaration: no getComputedStyle, no style
  // recalc, no layout. If nothing ever writes it, getPropertyValue returns ""
  // and the liquid idles at velocity 0 — which is the finished idle scene.
  const root = document.documentElement;
  const readVelocity = () => {
    const raw = root.style.getPropertyValue("--scroll-velocity");
    const parsed = raw ? parseFloat(raw) : 0;
    const target = Number.isFinite(parsed) ? clamp1(parsed) : 0;
    velocity += (target - velocity) * VEL_LERP;
    return velocity;
  };

  /**
   * Letterbox ("meet") the 500×400 frustum inside the canvas, matching the
   * SVG's `xMidYMid meet`, and re-derive the two resize-cadence uniforms.
   * The ONLY place layout is read (the harness calls this from a
   * ResizeObserver) — never per frame.
   */
  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const s = Math.min(w / VIEW.w, h / VIEW.h); // CSS px per viewBox unit
    const vw = w / s;
    const vh = h / s;
    camera.left = VIEW.w / 2 - vw / 2;
    camera.right = VIEW.w / 2 + vw / 2;
    camera.top = VIEW.h / 2 - vh / 2; // y-down: top < bottom
    camera.bottom = VIEW.h / 2 + vh / 2;
    camera.updateProjectionMatrix();
    uniforms.uPx.value = 1 / (s * renderer.getPixelRatio());

    // --grad-hero paints the hero <section>; the shader rebuilds it in section
    // space, so it needs where this canvas sits inside that box.
    const section = container.closest("section") ?? container;
    const cr = canvas.getBoundingClientRect();
    const sr = section.getBoundingClientRect();
    if (sr.width > 0 && sr.height > 0) {
      uniforms.uBackdrop.value.set(
        (cr.left - sr.left) / s,
        (cr.top - sr.top) / s,
        sr.width / s,
        sr.height / s,
      );
    } else {
      uniforms.uBackdrop.value.set(0, 0, vw, vh);
    }
  };

  const frame = (now: number) => {
    raf = 0;
    if (!running || disposed || lost) return;

    let dt = 0;
    if (last) {
      const ms = now - last;
      dt = Math.min(MAX_DT, ms / 1000);
      // Adaptive quality: sustained slow frames → DPR 1.0, once. Floor is 1.0
      // (0.75 softens the 1.2u rim line). Intervals straight after a start()
      // are skipped (last = 0), so a resume never trips it.
      if (!degraded) {
        if (ms > QUALITY_MS) slowCount++;
        if (++intervalCount === QUALITY_WINDOW) {
          // More than half the window slow ⇔ its median > QUALITY_MS.
          if (slowCount > QUALITY_WINDOW / 2 && renderer.getPixelRatio() > 1) {
            degraded = true;
            renderer.setPixelRatio(1);
            resize();
          }
          intervalCount = 0;
          slowCount = 0;
        }
      }
    }
    last = now;

    // Pinned at rest (QA): every motion uniform stays at its boot value.
    if (!restPinned) {
      const v = readVelocity();

      // Churn: flow advances at 0.7..1.3 × real time — always positive, so it
      // is monotonic and a fast scroll can never run the liquid backwards.
      // Both clocks wrap at T; the shader is periodic in T by construction.
      flow += (1 + 0.3 * v) * dt;
      if (flow >= T) flow -= T;
      time += dt;
      if (time >= T) time -= T;

      // Slosh spring toward the bus velocity: overshoots once, settles in ~1s —
      // the "liquid coming to rest" beat. Semi-implicit Euler; dt ≤ 50ms keeps
      // it stable (ω·dt ≈ 0.31 worst case).
      const acc = SPRING_K * (v - sloshX) - SPRING_C * sloshV;
      sloshV += acc * dt;
      sloshX += sloshV * dt;

      // Pointer: exponential ease with τ = .35s, frame-rate independent.
      const k = 1 - Math.exp(-dt / POINTER_TAU);
      const pointer = uniforms.uPointer.value;
      pointer.x += (pointerTX - pointer.x) * k;
      pointer.y += (pointerTY - pointer.y) * k;

      // Wake: 0 → 1 over 1.4s with a quartic EASE-IN (t⁴), from the first frame
      // after the first start(), never reset — a tab hide/show does not
      // re-wake. Ease-in, not out: the canvas itself fades in over 900ms, so
      // the pose on screen during that fade must be the rest pose the poster
      // beneath is showing. t⁴ holds uWake at .005 at 300ms and .09 at 800ms;
      // the ease-out it replaces was already .62 at 300ms with the canvas 90%
      // opaque, so the rest pose was never actually on screen.
      if (wake < 1) {
        wake = Math.min(1, wake + dt / WAKE_S);
        const t2 = wake * wake;
        uniforms.uWake.value = t2 * t2;
      }

      uniforms.uTime.value = time;
      uniforms.uFlow.value = flow;
      uniforms.uVelocity.value = sloshX;
    }

    renderer.render(scene, camera);

    if (!firstFrameSent) {
      firstFrameSent = true;
      onFirstFrame?.();
    }
    raf = requestAnimationFrame(frame);
  };

  /** Schedule a frame iff every gate agrees; idempotent. */
  const schedule = () => {
    if (running && ready && !disposed && !lost && !raf) {
      raf = requestAnimationFrame(frame);
    }
  };

  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  // Context loss: pause without touching the harness's intent; three's own
  // listeners rebuild its GL state, ours restarts the loop after a resize.
  const onContextLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const onContextRestored = () => {
    lost = false;
    last = 0;
    resize();
    schedule();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  resize();

  // Compile off the critical path: the rAF loop is only scheduled once the
  // program reports ready, so the first frame never stalls on a link;
  // `disposed` inside schedule() cancels that continuation if the harness
  // unmounted meanwhile. The promise is KEPT because dispose() has to wait on
  // it: with KHR_parallel_shader_compile present, three's compileAsync polls
  // `properties.get(material).currentProgram.isReady()` every 10ms via
  // setTimeout, and renderer.dispose() → properties.dispose() empties that map
  // — so a GL teardown inside the compile window (unmount during a fast
  // navigation off "/") made the next poll throw an uncaught TypeError.
  const compiled = renderer.compileAsync(scene, camera).then(() => {
    ready = true;
    schedule();
  });

  /** The GL teardown proper — only ever run after the compile poller is done. */
  const teardown = () => {
    scene.clear();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      schedule();
    },
    stop,
    resize,
    setPointer(nx, ny) {
      pointerTX = nx;
      pointerTY = ny;
    },
    dispose() {
      stop();
      // Immediate: from here start() and frame() are inert whatever teardown
      // still waits on, so nothing can render into a half-disposed renderer.
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      // `ready` is the synchronous fast path once the compile has resolved;
      // otherwise defer the GL teardown until it has (either way it settles —
      // three's promise never rejects, but the rejection arm costs nothing).
      if (ready) teardown();
      else compiled.then(teardown, teardown);
    },
  };
}
