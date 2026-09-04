import { BLOB_DRAW_SCALE, CAUSTICS, GLINTS, LENS, RIM, VIEW } from "./lensLayout";
import { LIQUID, PALETTE, glsl } from "./palette";

/**
 * The liquid-lens shaders (REDESIGN-V4 Part F, F4 — shipped deviations are
 * recorded in Part J).
 *
 * One full-quad fragment shader draws the whole hero scene: the backdrop as
 * seen through the lens, the metaball liquid, the fresnel rim, two glints and
 * the caustic spill outside the glass. GLSL ES 1.00 — `gl_FragColor`, constant
 * loop bounds, no derivatives, no `#extension`, and NO `precision` line: three
 * injects `precision highp float` itself, and WebGL2 — the only context the
 * harness boots on (HeroField.tsx) — mandates fragment highp, so every float
 * below is 32-bit. The T-wrap and the bounded arguments are still deliberate:
 * `sin` loses accuracy as its argument grows even at highp.
 *
 * The palette arrives as `#define` literals from palette.ts, and the lens
 * geometry (VIEW, LENS, RIM, GLINTS, CAUSTICS, BLOB_DRAW_SCALE) from
 * lensLayout.ts, both built once at module load — so the shader and the SVG
 * poster read the same hexes and the same numbers, and neither can drift from
 * the other.
 *
 * Rest pose = poster. At uWake = 0 every layer below is the SVG's, composited
 * in the SVG's order (pools → plate → discs → annulus → hairlines → glints)
 * with the analytic backdrop standing in for the page, and the output is
 * solved through the canvas's own alpha so the compositor reproduces that
 * stack (the last block of main()). QA measures the match against the poster
 * with `?liquid=rest` (createHeroLiquid.ts) — REDESIGN-V4 Part J.
 */

/** A number as a GLSL ES 1.00 float literal — always with a decimal point
 *  (`250` → `250.0`, `0.55` → `0.55`, `-66` → `-66.0`). Fixed-point by
 *  construction: toFixed(6) with the trailing zeros trimmed, and the range
 *  asserted because toFixed itself switches to exponent form at 1e21 (the
 *  `Number.isInteger` check this replaces would have emitted `1e+21.0`).
 *  Everything fed through here is viewBox-scale. */
const f = (n: number): string => {
  if (!Number.isFinite(n) || Math.abs(n) >= 1e6) {
    throw new RangeError(`GLSL float literal out of range: ${n}`);
  }
  const s = n.toFixed(6).replace(/0+$/, "");
  return s.endsWith(".") ? `${s}0` : s;
};
const v2 = (x: number, y: number) => `vec2(${f(x)}, ${f(y)})`;
const rad = (deg: number) => ((deg * Math.PI) / 180).toFixed(4);
const [KEY_GLINT, SOFT_GLINT] = GLINTS;
const [POOL_MAIN, POOL_ACCENT] = CAUSTICS;

export const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const defines = [
  `#define C_PLUM950 ${glsl(PALETTE.plum950)}`,
  `#define C_PLUM900 ${glsl(PALETTE.plum900)}`,
  `#define C_PLUM800 ${glsl(PALETTE.plum800)}`,
  `#define C_PLUM700 ${glsl(PALETTE.plum700)}`,
  `#define C_VIOLET600 ${glsl(PALETTE.violet600)}`,
  `#define C_VIOLET500 ${glsl(PALETTE.violet500)}`,
  `#define C_LAV400 ${glsl(PALETTE.lavender400)}`,
  `#define C_INKINV ${glsl(PALETTE.inkInv)}`,
  `#define L_RIM_LINE ${LIQUID.rimLine.toFixed(3)}`,
  `#define L_RIM_INNER ${LIQUID.rimInner.toFixed(3)}`,
  `#define L_RIM_DARK ${LIQUID.rimDark.toFixed(3)}`,
  `#define L_PLATE ${LIQUID.plate.toFixed(3)}`,
  `#define L_BLOB_CORE ${LIQUID.blob.core.toFixed(3)}`,
  `#define L_BLOB_MID ${LIQUID.blob.mid.toFixed(3)}`,
  `#define L_BLOB_MID_AT ${LIQUID.blob.midAt.toFixed(3)}`,
  `#define L_BODY_A0 ${LIQUID.bodyAlpha[0].toFixed(3)}`,
  `#define L_BODY_A1 ${LIQUID.bodyAlpha[1].toFixed(3)}`,
  `#define L_CAUSTIC ${LIQUID.caustic.toFixed(3)}`,
].join("\n");

export const FRAGMENT = /* glsl */ `
${defines}

varying vec2 vUv;
uniform float uTime, uFlow, uVelocity, uWake, uPx;
uniform vec2  uPointer;
uniform vec4  uBackdrop;   // canvas origin xy, section size zw — viewBox units
uniform vec4  uBlobA[5];   // ampX, ampY, kX, kY   (k = integer harmonics of 2π/T)
uniform vec4  uBlobB[5];   // phX, phY, radius, weight

// The SVG's coordinate frame: the viewBox, y down. CEN/RAD are LENS in
// lensLayout.ts — the same numbers HeroLens.tsx draws with, which is what
// makes the wake pose register with the poster.
const vec2  VIEW = ${v2(VIEW.w, VIEW.h)};
const vec2  CEN  = ${v2(LENS.cx, LENS.cy)};
const vec2  RAD  = ${v2(LENS.rx, LENS.ry)};
// Rim geometry is lensLayout.ts's RIM, so the fresnel ramp (RIM_W) and the
// internal-reflection line (RIM_IN) sit exactly where the poster draws its
// annulus and inner hairline. f() always emits a decimal point: GLSL ES 1.00
// has no int→float promotion, so a bare 16 here would fail to compile. (No
// backticks in these comments — this is a JS template literal.)
const float RIM_W = ${f(RIM.w)}, RIM_IN = ${f(RIM.inner)};
// The poster draws each disc at r × BLOB_DRAW_SCALE; depth() below is
// parameterised on that drawn radius, so the scale is the shader's too.
const float BLOB_SCALE = ${f(BLOB_DRAW_SCALE)};
// The poster's two static caustic pools (lensLayout.ts CAUSTICS): centre,
// radii and peak alpha of each radial fill — the spill at rest.
const vec2  POOL1_C = ${v2(POOL_MAIN.cx, POOL_MAIN.cy)}, POOL1_R = ${v2(POOL_MAIN.rx, POOL_MAIN.ry)};
const vec2  POOL2_C = ${v2(POOL_ACCENT.cx, POOL_ACCENT.cy)}, POOL2_R = ${v2(POOL_ACCENT.rx, POOL_ACCENT.ry)};
const float POOL1_A = ${f(POOL_MAIN.alpha)}, POOL2_A = ${f(POOL_ACCENT.alpha)};
// Noise lattice period P and flow period T. Every time-varying term is either
// periodic in T (integer harmonics of W = 2π/T) or advects an exact multiple
// of P cells per T, so uFlow and uTime can wrap at T without a visible seam,
// and no argument ever grows past a few hundred — which is what keeps sin()
// accurate (highp is guaranteed under WebGL2; sin still degrades with size).
const float P = 16.0, T = 360.0, TAU = 6.2831853, W = 6.2831853 / 360.0;
// Toward --grad-hero's key bloom (78%/30%): normalize(vec2(0.55, -0.83)),
// written out because GLSL ES 1.00 does not allow built-ins in const initialisers.
const vec2  KEY = vec2(0.5524, -0.8336);

// Sin-free hash on a P-periodic lattice — no sin() means no precision cliff
// however far the lattice is advected, and mod(p, P) is what makes that
// advection wrap seamlessly.
float hash21(vec2 p) {
  p = mod(p, P);
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
// Two octaves. Lacunarity is exactly 2.0 (not 2.03) so a lattice shift of P
// in the first octave is a shift of 2P in the second — otherwise the second
// octave would jump at the T wrap. The +17.1 offset decorrelates them.
float fbm2(vec2 p) { return 0.625 * vnoise(p) + 0.375 * vnoise(p * 2.0 + 17.1); }

// IQ's cheap ellipse SDF: exact sign, distance accurate to a few % near the
// rim, which is all the fresnel bands need. The 1e-4 nudge keeps k1 > 0 at
// the exact centre pixel (0/0 would paint one NaN fragment).
float sdEllipse(vec2 p, vec2 r) {
  p = abs(p) + 1e-4;
  float k0 = length(p / r), k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

// --grad-hero (globals.css :root) rebuilt in SECTION space, s in 0..1: the
// 175° plum-900 → plum-800 (45%) → plum-950 linear, then the two violet blooms
// (α .35 fading by 55% at 78%/30%; α .18 fading by 58% at 8%/96%). This is
// what the lens refracts — sampling it analytically is what makes the scene
// texture-free and lets the refraction bend a continuous field.
vec3 backdrop(vec2 s) {
  vec2 px = s * uBackdrop.zw;
  float L = abs(uBackdrop.z * 0.087) + abs(uBackdrop.w * 0.996);
  float t = clamp(dot(px - 0.5 * uBackdrop.zw, vec2(0.087, 0.996)) / L + 0.5, 0.0, 1.0);
  vec3 g = t < 0.45 ? mix(C_PLUM900, C_PLUM800, t / 0.45)
                    : mix(C_PLUM800, C_PLUM950, (t - 0.45) / 0.55);
  float b1 = 1.0 - clamp(length((s - vec2(0.78, 0.30)) / vec2(1.20, 0.90)) / 0.55, 0.0, 1.0);
  float b2 = 1.0 - clamp(length((s - vec2(0.08, 0.96)) / vec2(0.95, 0.80)) / 0.58, 0.0, 1.0);
  return mix(mix(g, C_VIOLET500, b1 * 0.35), C_VIOLET500, b2 * 0.18);
}

// One disc of the poster's #hl-blob gradient as OPTICAL DEPTH. α(rho) is the
// radial gradient itself — L_BLOB_CORE at the centre, L_BLOB_MID at
// rho = L_BLOB_MID_AT, 0 at the drawn edge rho = 1, linear between stops as
// SVG interpolates — and k = −ln(1 − α) is what sums: 1 − exp(−Σk) is exactly
// the source-over composite of overlapping discs. So a lone blob reads .5 at
// 60% of its drawn radius and 0 at the edge, and overlaps stack the way the
// poster's do (the 1/(d²+1) kernel this replaces read ~30% tighter than the
// poster's discs and spiked to m ≈ 1400 at each centre).
float depth(float rho) {
  float a = rho < L_BLOB_MID_AT
    ? mix(L_BLOB_CORE, L_BLOB_MID, rho / L_BLOB_MID_AT)
    : mix(L_BLOB_MID, 0.0, (rho - L_BLOB_MID_AT) / (1.0 - L_BLOB_MID_AT));
  return -log(1.0 - clamp(a, 0.0, L_BLOB_CORE));
}
// Five discs on Lissajous paths + the 14u gravity bias, summed as depth. At
// uFlow = 0 the centres are exactly lensLayout.ts's restX/restY (same
// formula), i.e. where the SVG poster draws them. The per-blob weight w only
// bites once awake — the poster draws every disc with the one gradient.
float mass(vec2 q) {
  float k = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 A = uBlobA[i], B = uBlobB[i];
    vec2 c = A.xy * vec2(sin(TAU * A.z * uFlow / T + B.x), cos(TAU * A.w * uFlow / T + B.y)) + vec2(0.0, 14.0);
    k += depth(length(q - c) / (B.z * BLOB_SCALE)) * mix(1.0, B.w, uWake);
  }
  return k;
}
// A caustic pool as the poster draws it: radial violet-500, alpha linear from
// a at the centre to 0 at the ellipse's edge.
float pool(vec2 p, vec2 c, vec2 r, float a) { return a * max(0.0, 1.0 - length((p - c) / r)); }
// A glint as the poster's #hl-glint disc: ink-inv core → lavender-400 at α .85
// by 35% → transparent at the edge; returned as colour + alpha (× the glint's
// own fillOpacity) for a source-over mix.
vec4 glint(vec2 q, vec2 r, float rot, float alpha) {
  float c = cos(rot), s = sin(rot);
  q = mat2(c, -s, s, c) * q;
  float rho = length(q / r);
  float a = rho < 0.35 ? mix(1.0, 0.85, rho / 0.35) : mix(0.85, 0.0, (rho - 0.35) / 0.65);
  return vec4(mix(C_INKINV, C_LAV400, min(rho / 0.35, 1.0)), alpha * clamp(a, 0.0, 1.0));
}

void main() {
  vec2 p = vUv * VIEW;                               // SVG coordinates, y down
  vec2 c = CEN + uPointer * vec2(6.0, 3.0);          // form parallax (< chips' tilt → chips lead)
  vec2 q = p - c;
  float d  = sdEllipse(q, RAD);                      // < 0 inside
  float aa = uPx * 1.25;                             // analytic AA width in viewBox units
  float inside = 1.0 - smoothstep(-aa, aa, d);
  vec2  n  = q / (RAD * RAD);                        // outward normal of the ellipse
  n /= max(length(n), 1e-6);                         // (guarded: normalize(0) is NaN)
  float rimT = smoothstep(-RIM_W, 0.0, d);           // 0 deep inside → 1 at the edge

  // Slosh: the whole liquid frame tilts ≤ ~6° and lifts 8u with the spring
  // output. Gated by uWake so the wake pose is the SVG's exactly.
  float tilt = uVelocity * 0.105 * uWake;
  vec2  ql   = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * q + vec2(0.0, -8.0 * uVelocity * uWake);

  // The poster's layer 1: the two static pools, source-over of each other.
  // Awake, the live caustics take over outside and the pools fade from under
  // the glass (both mixed by uWake below).
  float pools = 1.0 - (1.0 - pool(p, POOL1_C, POOL1_R, POOL1_A)) * (1.0 - pool(p, POOL2_C, POOL2_R, POOL2_A));

  // Refraction: sample the backdrop bent inward toward the rim. From here col
  // is built up in the poster's layer order.
  vec3 bg  = backdrop((p - n * rimT * rimT * 14.0 + uBackdrop.xy) / uBackdrop.zw);
  vec3 col = mix(bg, C_VIOLET500, pools * (1.0 - uWake));

  // Layer 2a, the plate: the poster's #hl-body gradient — violet-600 →
  // violet-500 (55%) → plum-700 along the diagonal of the ellipse's bounding
  // box (the SVG's (0,0)→(1,1) in objectBoundingBox units, i.e. t = (u+v)/2),
  // at L_PLATE over the backdrop. At every wake value: this IS the lens
  // plate's tint (it replaces a flat +.09 white lift the poster never had).
  vec2  bb    = (q + RAD) / (2.0 * RAD);
  float pt    = clamp(0.5 * (bb.x + bb.y), 0.0, 1.0);
  vec3  plate = pt < 0.55 ? mix(C_VIOLET600, C_VIOLET500, pt / 0.55)
                          : mix(C_VIOLET500, C_PLUM700, (pt - 0.55) / 0.45);
  col = mix(col, plate, L_PLATE);

  // Layer 2b, the liquid. adv is P/T cells per second so it wraps with uFlow;
  // the warp and the detail noise are ×uWake so the boot frame is the pure
  // rest pose. m is optical depth (depth()), so 1 − exp(−m) is the discs'
  // composite alpha — a soft cloud densest where they overlap, never a
  // thresholded amoeba — and the colour runs violet-600 at the thin edge →
  // violet-500 in the dense core along the same stops the poster's gradient
  // describes (alpha L_BLOB_MID → L_BLOB_CORE).
  vec2  lp  = ql / 120.0, adv = vec2(1.0, -1.0) * (P / T) * uFlow;
  vec2  wrp = (vec2(fbm2(lp * 1.7 + adv), fbm2(lp * 1.7 - adv.yx + 5.2)) - 0.5) * 0.55 * uWake;
  float m   = mass(ql + wrp * 40.0) + (fbm2(lp * 2.2 + adv) - 0.5) * 0.25 * uWake;
  float body = 1.0 - exp(-m);
  vec3 liquid = mix(C_VIOLET600, C_VIOLET500, clamp((body - L_BLOB_MID) / (L_BLOB_CORE - L_BLOB_MID), 0.0, 1.0));
  col = mix(col, liquid, body);

  // Layer 3, the rim: the dark band (a soft ramp where the poster has its hard
  // annulus), then the two hairlines as source-over white at the poster's
  // stroke alphas (#hl-rim .34 facing KEY → .10 away; the inner line .10), and
  // the shader's own fresnel glow toward KEY. breathe is 1.0 at t = 0 (the
  // SVG's line) and dips 15% on a 15.7s cycle — harmonic 23 of W, so it wraps.
  float breathe = 0.925 + 0.075 * cos(23.0 * W * uTime);
  float facing  = 0.5 + 0.5 * dot(n, KEY);
  float dark  = smoothstep(-18.0, -2.0, d) * L_RIM_DARK;
  float line  = 1.0 - smoothstep(0.0, 1.6 + aa, abs(d + 1.2));
  float inner = 1.0 - smoothstep(0.0, 1.2 + aa, abs(d + RIM_IN));
  col = mix(col, C_PLUM950, dark);
  col = mix(col, C_INKINV, line * L_RIM_LINE * mix(0.35, 1.0, facing) * breathe);
  col = mix(col, C_INKINV, inner * L_RIM_INNER * breathe);
  col += C_INKINV * pow(rimT, 3.0) * 0.10 * facing;

  // Layer 4, two glints at GLINTS[0]/[1] (relative to CEN), source-over at
  // their own alphas. The key one wanders ±4u on harmonics 18/13 of W — sin on
  // both axes so it sits at rest at t = 0.
  vec2 s1 = ${v2(KEY_GLINT.cx - LENS.cx, KEY_GLINT.cy - LENS.cy)} + uPointer * vec2(18.0, 10.0) + vec2(sin(18.0 * W * uTime), sin(13.0 * W * uTime)) * 4.0;
  vec2 s2 = ${v2(SOFT_GLINT.cx - LENS.cx, SOFT_GLINT.cy - LENS.cy)} - uPointer * vec2(8.0, 5.0);
  vec4 g1 = glint(q - s1, ${v2(KEY_GLINT.rx, KEY_GLINT.ry)}, ${rad(KEY_GLINT.rot)}, ${f(KEY_GLINT.alpha)});
  vec4 g2 = glint(q - s2, ${v2(SOFT_GLINT.rx, SOFT_GLINT.ry)}, ${rad(SOFT_GLINT.rot)}, ${f(SOFT_GLINT.alpha)});
  col = mix(col, g1.rgb, g1.a);
  col = mix(col, g2.rgb, g2.a);

  // Live caustics outside the lens: warped noise, pooled lower-left (toward
  // the secondary bloom), decaying with distance from the rim. The advection
  // is 2·adv — an integer multiple, so it too wraps at T.
  float fall = exp(-max(d, 0.0) / 70.0) * smoothstep(-40.0, 60.0, q.y) * (0.6 + 0.4 * (1.0 - smoothstep(-120.0, 60.0, q.x)));
  float cw   = fbm2(p / 46.0 + adv * 2.0 + wrp * 0.3);
  float caus = pow(smoothstep(0.42, 0.78, cw), 2.2) * fall * (0.4 + 0.6 * uWake) * (1.0 + 0.5 * abs(uVelocity));
  vec3  cCol = mix(C_VIOLET500, C_LAV400, caus * 0.4);

  // Output — PREMULTIPLIED, and the material uses NoBlending: the quad
  // overwrites the (cleared) framebuffer and the browser compositor does the
  // one source-over onto the page, so there is no double blend and no halo.
  // Outside the glass: the static pools at rest, the live caustics awake.
  // Inside: col is what the poster composites over the page, with the analytic
  // backdrop standing in for it — but the canvas is not opaque (aIn ≤
  // L_BODY_A1, and it fades over its last 3px so the analytic/real backdrop
  // seam under the line can never show), so the colour is solved THROUGH that
  // alpha:  pm = col − (1 − aIn)·bg  ⇒  pm + (1 − aIn)·page = col wherever
  // bg ≈ page. Written as rgb·a instead, everything inside reached the screen
  // at a × its strength (the plate at .22 for .28, the line at .27 for .34) —
  // most of why the rest pose used to read flatter than the poster.
  float aOut  = mix(pools, caus * L_CAUSTIC, uWake);
  vec3  pmOut = mix(C_VIOLET500 * pools, cCol * (caus * L_CAUSTIC), uWake);
  float aIn   = mix(L_BODY_A0, L_BODY_A1, body) * (1.0 - smoothstep(-3.0 * uPx, 0.0, d) * 0.6);
  vec3  pmIn  = col - (1.0 - aIn) * bg;
  float a  = mix(aOut, aIn, inside);
  vec3  pm = mix(pmOut, pmIn, inside);
  // Static triangular dither, ±0.5/255, keyed to the pixel so it never
  // shimmers. Clamped to [0, a]: unclamped, half the fully transparent
  // exterior carried rgb = 1/255 over a = 0 — invalid premultiplied colour.
  float dth = (hash21(gl_FragCoord.xy * 0.37) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(pm + dth, 0.0, a), a);
}
`;
