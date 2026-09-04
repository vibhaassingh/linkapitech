/**
 * Scene colours — mirrors the CSS tokens in globals.css (:root, Figma Purple).
 *
 * Pure TypeScript, NO `three` import: `glsl()` is evaluated while the fragment
 * shader template is built (liquidShaders.ts), and the module must stay
 * importable from anywhere without dragging `three` into a server bundle.
 *
 * The shader does its maths in sRGB and writes these as `#define` literals, so
 * a hex here hits the screen exactly as the SVG poster's `var(--plum-*)` stop
 * does — that equality is what lets the 900ms poster fade read as the lens
 * waking up rather than as a colour shift.
 */
export const PALETTE = {
  plum950: 0x1a0620,
  plum900: 0x250d29,
  plum800: 0x2d1235,
  plum700: 0x42174c,
  plum600: 0x62216f,
  violet600: 0x7b2d8e,
  violet500: 0x8e24aa,
  lavender400: 0xc9b8d8,
  inkInv: 0xf7f3f9,
} as const;

/**
 * Liquid-lens material constants (REDESIGN-V4 F2). Each pairs with a literal
 * in HeroLens.tsx's SVG so the rest pose matches: rimLine/rimInner are the
 * `#hl-rim` stroke opacities, rimDark the annulus alpha, glassTint the
 * `.glass-3` lift, bodyAlpha the liquid's opacity range, caustic the pool
 * alpha ceiling, specular the key glint's `GLINTS[0].alpha`.
 */
export const LIQUID = {
  rimLine: 0.34,
  rimInner: 0.1,
  rimDark: 0.28,
  glassTint: 0.09,
  bodyAlpha: [0.8, 0.96] as const,
  caustic: 0.16,
  specular: 0.55,
} as const;

/** `0x8e24aa` → `"vec3(0.557, 0.141, 0.667)"` — a GLSL literal for `#define`. */
export function glsl(hex: number): string {
  const c = (shift: number) => (((hex >> shift) & 0xff) / 255).toFixed(3);
  return `vec3(${c(16)}, ${c(8)}, ${c(0)})`;
}
