/**
 * Scroll-velocity bus — publishes `--scroll-velocity` (−1..1, lerped) on <html>.
 *
 * WHY ONE SOURCE FOR BOTH ROUTE GROUPS
 * The marketing route runs Lenis; inner pages do not. Lenis, however, animates
 * the real `scrollTop` (that is also why `animation-timeline: view()` follows
 * it — see scripts/qa/motion.mjs check 1), so measuring `window.scrollY` deltas
 * per frame yields Lenis's own velocity on the homepage and the native scroll
 * velocity everywhere else — in identical units, from identical code. Reading
 * `lenis.velocity` instead would introduce a second unit system to normalise
 * and two code paths to keep in sync, for no extra fidelity.
 *
 * COST
 * One passive scroll listener plus one rAF that runs ONLY while the page is
 * moving (plus a short decay tail) and stops itself when velocity reaches 0.
 * One `scrollY` read and one custom-property write per frame; no layout reads,
 * no React state, no per-frame allocation.
 *
 * Refcounted, so `SmoothScrollProvider` (marketing) and the always-mounted
 * root listener can both start it and there is still exactly one loop.
 * A no-op under `prefers-reduced-motion`, where the token keeps its 0 default.
 */

/** px/frame (at 60fps) that saturates the bus at |1| — a brisk wheel flick. */
const NORM = 55;
/** Lerp factor toward the measured velocity: low enough to kill wheel jitter. */
const LERP = 0.12;
/** How long the loop keeps running after the last scroll event, ms. */
const TAIL = 260;

let refs = 0;
let raf = 0;
let value = 0;
let lastY = 0;
let lastT = 0;
let activeUntil = 0;

const clamp = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);

function frame(now: number) {
  raf = 0;
  // Single read, before any write, so this never forces a layout flush.
  const y = window.scrollY;
  const dt = now - lastT;
  if (dt > 0) {
    const perFrame = ((y - lastY) / dt) * 16.667;
    value += (clamp(perFrame / NORM) - value) * LERP;
    if (Math.abs(value) < 0.001) value = 0;
  }
  lastY = y;
  lastT = now;
  document.documentElement.style.setProperty(
    "--scroll-velocity",
    value.toFixed(3),
  );
  // Keep going while the page is moving, and afterwards until the lerp has
  // fully decayed — otherwise the variable would freeze at a non-zero value.
  if (now < activeUntil || value !== 0) raf = requestAnimationFrame(frame);
}

function onScroll() {
  activeUntil = performance.now() + TAIL;
  if (!raf) {
    lastT = performance.now();
    lastY = window.scrollY;
    raf = requestAnimationFrame(frame);
  }
}

/**
 * Start (or join) the bus. Returns the stop function — use it directly as a
 * `useEffect` cleanup: `useEffect(() => startVelocityBus(), [])`.
 */
export function startVelocityBus(): () => void {
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => {};
  }
  refs += 1;
  if (refs === 1) {
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    refs -= 1;
    if (refs > 0) return;
    window.removeEventListener("scroll", onScroll);
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    value = 0;
    document.documentElement.style.removeProperty("--scroll-velocity");
  };
}
