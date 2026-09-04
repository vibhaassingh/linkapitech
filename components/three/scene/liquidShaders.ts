import { GLINTS, LENS, VIEW } from "./lensLayout";
import { LIQUID, PALETTE, glsl } from "./palette";

/**
 * The liquid-lens shaders (REDESIGN-V4 Part F, F4).
 *
 * One full-quad fragment shader draws the whole hero scene: the backdrop as
 * seen through the lens, the metaball liquid, the fresnel rim, two glints and
 * the caustic spill outside the glass. GLSL ES 1.00 — `gl_FragColor`, constant
 * loop bounds, no derivatives, no `#extension`, and NO `precision` line: three
 * injects `precision highp float` itself (falling back to mediump on hardware
 * without fragment highp, which is why every quantity below is bounded — see
 * the fp16 notes).
 *
 * The palette arrives as `#define` literals from palette.ts, and the lens
 * geometry (VIEW, LENS, GLINTS) from lensLayout.ts, both built once at module
 * load — so the shader and the SVG poster read the same hexes and the same
 * numbers, and neither can drift from the other.
 */

/** A number as a GLSL float literal: `250` → `"250.0"`, `0.55` → `"0.55"`. */
const f = (n: number) => (Number.isInteger(n) ? `${n}.0` : `${n}`);
const v2 = (x: number, y: number) => `vec2(${f(x)}, ${f(y)})`;
const rad = (deg: number) => ((deg * Math.PI) / 180).toFixed(4);
const [KEY_GLINT, SOFT_GLINT] = GLINTS;

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
  `#define L_GLASS_TINT ${LIQUID.glassTint.toFixed(3)}`,
  `#define L_BODY_A0 ${LIQUID.bodyAlpha[0].toFixed(3)}`,
  `#define L_BODY_A1 ${LIQUID.bodyAlpha[1].toFixed(3)}`,
  `#define L_CAUSTIC ${LIQUID.caustic.toFixed(3)}`,
  `#define L_SPECULAR ${LIQUID.specular.toFixed(3)}`,
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
// Noise lattice period P and flow period T. Every time-varying term is either
// periodic in T (integer harmonics of W = 2π/T) or advects an exact multiple
// of P cells per T, so uFlow and uTime can wrap at T without a visible seam,
// and no argument ever grows past a few hundred — safe in fp16 for days.
const float P = 16.0, T = 360.0, TAU = 6.2831853, W = 6.2831853 / 360.0;
// Toward --grad-hero's key bloom (78%/30%): normalize(vec2(0.55, -0.83)),
// written out because GLSL ES 1.00 does not allow built-ins in const initialisers.
const vec2  KEY = vec2(0.5524, -0.8336);

// Sin-free hash on a P-periodic lattice: no sin() precision cliff on mediump,
// and mod(p, P) is what makes the advection wrap seamless.
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

// Five metaballs on Lissajous paths + the 14u gravity bias; the field is ≈1 at
// a blob's radius. At uFlow = 0 the centres are exactly lensLayout.ts's
// restX/restY (same formula), i.e. where the SVG poster draws them.
float mass(vec2 q) {
  float f = 0.0;
  for (int i = 0; i < 5; i++) {
    vec4 A = uBlobA[i], B = uBlobB[i];
    vec2 c = A.xy * vec2(sin(TAU * A.z * uFlow / T + B.x), cos(TAU * A.w * uFlow / T + B.y)) + vec2(0.0, 14.0);
    vec2 e = q - c;
    f += B.w * B.z * B.z / (dot(e, e) + 1.0);
  }
  return f;
}
float glint(vec2 q, vec2 r, float rot) {
  float c = cos(rot), s = sin(rot);
  q = mat2(c, -s, s, c) * q;
  return pow(max(0.0, 1.0 - length(q / r)), 2.0);
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
  float rimT = smoothstep(-16.0, 0.0, d);            // 0 deep inside → 1 at the edge

  // Slosh: the whole liquid frame tilts ≤ ~6° and lifts 8u with the spring
  // output. Gated by uWake so the wake pose is the SVG's exactly.
  float tilt = uVelocity * 0.105 * uWake;
  vec2  ql   = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * q + vec2(0.0, -8.0 * uVelocity * uWake);

  // Refraction: sample the backdrop bent inward toward the rim, then the
  // glass-3 tint lift inside the lens.
  vec3 bg = backdrop((p - n * rimT * rimT * 14.0 + uBackdrop.xy) / uBackdrop.zw);
  bg += L_GLASS_TINT * inside;

  // Liquid body. adv is P/T cells per second so it wraps with uFlow; the warp
  // and the detail noise are ×uWake so the boot frame is the pure rest pose.
  vec2  lp  = ql / 120.0, adv = vec2(1.0, -1.0) * (P / T) * uFlow;
  vec2  wrp = (vec2(fbm2(lp * 1.7 + adv), fbm2(lp * 1.7 - adv.yx + 5.2)) - 0.5) * 0.55 * uWake;
  float m   = mass(ql + wrp * 40.0) + (fbm2(lp * 2.2 + adv) - 0.5) * 0.35 * uWake;
  // Density → opacity, fitted to the poster's radial-gradient blobs (α .92 at
  // the centre, .5 at 60%, 0 at the edge, composited): 0 below m ≈ 1.8, .4 at
  // m ≈ 3, .6 at 4, .97 at 11. A soft cloud that is densest where blobs
  // overlap, never a thresholded amoeba — the field itself is the liquid.
  float body = 1.0 - exp(-max(m - 1.8, 0.0) / 2.6);
  // violet-600 at the thin edge → violet-500 in the dense core, as the poster.
  // No plum darkening keyed to m: the 1/(d²+1) kernel spikes at every blob
  // centre, so that would blacken exactly the points the poster paints brightest.
  vec3 liquid = mix(C_VIOLET600, C_VIOLET500, smoothstep(2.0, 8.0, m));
  vec3 col = mix(bg, liquid, body * 0.92);

  // Fresnel rim: dark band, bright line (1.2u in), inner reflection (9u in),
  // all keyed toward KEY. breathe is 1.0 at t = 0 (the SVG's .34 line) and
  // dips 15% on a 15.7s cycle — harmonic 23 of W, so it wraps with uTime.
  float breathe = 0.925 + 0.075 * cos(23.0 * W * uTime);
  float facing  = 0.5 + 0.5 * dot(n, KEY);
  float dark  = smoothstep(-18.0, -2.0, d) * L_RIM_DARK;
  float line  = 1.0 - smoothstep(0.0, 1.6 + aa, abs(d + 1.2));
  float inner = (1.0 - smoothstep(0.0, 1.2 + aa, abs(d + 9.0))) * L_RIM_INNER;
  col = mix(col, C_PLUM950, dark);
  col += C_INKINV * ((line * L_RIM_LINE * mix(0.35, 1.0, facing) + inner) * breathe + pow(rimT, 3.0) * 0.10 * facing);

  // Two glints at GLINTS[0]/[1] (relative to CEN). The key one wanders ±4u on
  // harmonics 18/13 of W — sin on both axes so it sits at rest at t = 0.
  vec2 s1 = ${v2(KEY_GLINT.cx - LENS.cx, KEY_GLINT.cy - LENS.cy)} + uPointer * vec2(18.0, 10.0) + vec2(sin(18.0 * W * uTime), sin(13.0 * W * uTime)) * 4.0;
  vec2 s2 = ${v2(SOFT_GLINT.cx - LENS.cx, SOFT_GLINT.cy - LENS.cy)} - uPointer * vec2(8.0, 5.0);
  float g1 = glint(q - s1, ${v2(KEY_GLINT.rx, KEY_GLINT.ry)}, ${rad(KEY_GLINT.rot)}), g2 = glint(q - s2, ${v2(SOFT_GLINT.rx, SOFT_GLINT.ry)}, ${rad(SOFT_GLINT.rot)}) * 0.35;
  col += C_LAV400 * (g1 * L_SPECULAR + g2) + C_INKINV * g1 * g1 * 0.25;

  // Caustics outside the lens: warped noise, pooled lower-left (toward the
  // secondary bloom), decaying with distance from the rim. The advection is
  // 2·adv — an integer multiple, so it too wraps at T.
  float fall = exp(-max(d, 0.0) / 70.0) * smoothstep(-40.0, 60.0, q.y) * (0.6 + 0.4 * (1.0 - smoothstep(-120.0, 60.0, q.x)));
  float cw   = fbm2(p / 46.0 + adv * 2.0 + wrp * 0.3);
  float caus = pow(smoothstep(0.42, 0.78, cw), 2.2) * fall * (0.4 + 0.6 * uWake) * (1.0 + 0.5 * abs(uVelocity));
  vec3  cCol = mix(C_VIOLET500, C_LAV400, caus * 0.4);

  // Alpha: the body's opacity range inside, a 3px fade at the rim so the
  // refracted backdrop can never show a seam under the line; caustic alpha
  // outside. Output is PREMULTIPLIED and the material uses NoBlending: the
  // quad overwrites the framebuffer, the browser compositor does the one
  // source-over onto the page — no double blend, no dark halos at the edge.
  float aIn = mix(L_BODY_A0, L_BODY_A1, body) * (1.0 - smoothstep(-3.0 * uPx, 0.0, d) * 0.6);
  float a   = mix(caus * L_CAUSTIC, aIn, inside);
  vec3  rgb = mix(cCol, col, inside);
  // Static triangular dither, ±0.5/255: breaks 8-bit banding in the smooth
  // gradients without shimmering, since it is keyed to the pixel, not time.
  float dth = (hash21(gl_FragCoord.xy * 0.37) - 0.5) / 255.0;
  gl_FragColor = vec4(rgb * a + dth, a);
}
`;
