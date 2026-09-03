/**
 * lensLayout — the hero lens geometry, SINGLE SOURCE OF TRUTH (REDESIGN-V4 F2).
 *
 * Shared by the server-rendered SVG fallback (components/three/HeroLens.tsx,
 * Phase 4) and the client shader (scene/createHeroLiquid.ts, Phase 5), so the
 * two can never drift: the SVG draws the blobs at `restX/restY`, and the
 * shader's metaball centres evaluate to exactly those numbers at `uFlow = 0`
 * (`c = amp · (sin(phx), cos(phy)) + (0, 14)` about LENS.cx/cy), which is the
 * pose the scene boots in and the pose the 900ms poster fade crosses.
 *
 * Pure TypeScript, NO `three` import: this module is imported by a SERVER
 * component, and `three` must stay in the lazily loaded client chunk
 * (scripts/qa/probe.mjs asserts that). Everything is in the SVG's 500×400
 * viewBox units, y increasing downward.
 *
 * `HERO_SEED` pins the composition: `makeRandom` is a deterministic LCG
 * (ported verbatim from createHeroField.ts, which Phase 5 deletes), evaluated
 * once at module load, identical on server and client. Change the seed and
 * every blob moves — on both renderers at once, which is the point.
 */

export const HERO_SEED = 20260812;

/** The SVG viewBox and the ortho camera's frustum — the shared coordinate space. */
export const VIEW = { w: 500, h: 400 } as const;

/** The lens body: an ellipse 148 × 132 about (250, 205). */
export const LENS = { cx: 250, cy: 205, rx: 148, ry: 132 } as const;

/** DOM chip centres — top, left and right of the lens; two graze the rim. */
export const CHIPS = [
  { id: "top", cx: 256, cy: 50 },
  { id: "left", cx: 76, cy: 170 },
  { id: "right", cx: 434, cy: 186 },
] as const;

/** Specular glints: the key (upper-right, toward --grad-hero's bloom) and a
 *  faint secondary (lower-left). `rot` in degrees. */
export const GLINTS = [
  { cx: 308, cy: 121, rx: 44, ry: 13, rot: 28, alpha: 0.55 },
  { cx: 184, cy: 297, rx: 18, ry: 7, rot: -24, alpha: 0.2 },
] as const;

/** Caustic pools the lens throws on the backdrop: the main one lower-left,
 *  an accent upper-right. */
export const CAUSTICS = [
  { cx: 150, cy: 330, rx: 140, ry: 46, alpha: 0.08 },
  { cx: 360, cy: 95, rx: 90, ry: 30, alpha: 0.04 },
] as const;

/**
 * One metaball on a Lissajous path about the lens centre:
 *   x(t) = ax · sin(2π · kx · t / T + phx)
 *   y(t) = ay · cos(2π · ky · t / T + phy) + 14      (gravity bias)
 * `kx`/`ky` are integer harmonics of the shader's 360s wrap period, so the
 * paths close seamlessly. `r` is the field radius, `w` its weight.
 * `restX/restY` are the absolute positions at t = 0.
 * Named `LensBlob`, not `Blob`: `Blob` would shadow the DOM global.
 */
export interface LensBlob {
  ax: number;
  ay: number;
  kx: number;
  ky: number;
  phx: number;
  phy: number;
  r: number;
  w: number;
  restX: number;
  restY: number;
}

/** Deterministic PRNG — the layout must be identical on every load and on the
 *  server-rendered poster, so Math.random is never used. (LCG, Numerical
 *  Recipes constants; ported from createHeroField.ts.) */
export function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const BLOB_COUNT = 5;
/** Gravity bias: the cluster sits a little low in the lens, so it reads as
 *  liquid rather than as a centred logo. Same constant as the shader's
 *  `vec2(0.0, 14.0)`. */
const GRAVITY_Y = 14;

/**
 * The five blobs. Amplitudes are bounded so every rest pose — and every point
 * on every path — stays inside the lens interior:
 *   |x| ≤ 62, |y| ≤ 44 + 14  →  (62/148)² + (58/132)² ≈ 0.37 < 1.
 */
export const BLOBS: readonly LensBlob[] = (() => {
  const rnd = makeRandom(HERO_SEED);
  const out: LensBlob[] = [];
  for (let i = 0; i < BLOB_COUNT; i++) {
    const ax = 28 + rnd() * 34; // [28, 62]
    const ay = 18 + rnd() * 26; // [18, 44]
    const kx = 2 + Math.floor(rnd() * 6); // integer in [2, 7]
    const ky = 2 + Math.floor(rnd() * 6);
    const phx = rnd() * Math.PI * 2; // [0, 2π)
    const phy = rnd() * Math.PI * 2;
    const r = 26 + rnd() * 18; // [26, 44]
    const w = 0.8 + rnd() * 0.4; // [0.8, 1.2]
    out.push({
      ax,
      ay,
      kx,
      ky,
      phx,
      phy,
      r,
      w,
      restX: LENS.cx + ax * Math.sin(phx),
      restY: LENS.cy + ay * Math.cos(phy) + GRAVITY_Y,
    });
  }
  return out;
})();
