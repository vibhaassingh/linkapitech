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
 * waking up rather than as a colour shift. Every entry has a shader consumer
 * (plum-950/900/800 build the backdrop, plum-700 ends the plate gradient, the
 * violets are the liquid, lavender-400 and ink-inv the glints and hairlines);
 * a token the shader does not use does not belong here.
 */
export const PALETTE = {
  plum950: 0x1a0620,
  plum900: 0x250d29,
  plum800: 0x2d1235,
  plum700: 0x42174c,
  violet600: 0x7b2d8e,
  violet500: 0x8e24aa,
  lavender400: 0xc9b8d8,
  inkInv: 0xf7f3f9,
} as const;

/**
 * Liquid-lens material constants (REDESIGN-V4 F2). Each pairs with a literal
 * in HeroLens.tsx's SVG so the rest pose matches:
 *  - rimLine / rimInner: the `#hl-rim` stroke's key-side opacity (.34) and the
 *    inner hairline's (.10);
 *  - rimDark: the fresnel band's depth, tuned near the poster's annulus
 *    (`fillOpacity .26`) — the shader draws a soft ramp, not a hard annulus,
 *    so the two are not the same number by design;
 *  - plate: the body ellipse's `opacity={0.28}`;
 *  - blob: the `#hl-blob` radial gradient — α `core` at the centre, `mid` at
 *    `midAt` of the drawn radius, 0 at the edge (the shader turns these into
 *    its optical-depth kernel);
 *  - bodyAlpha: the canvas's opacity range inside the lens;
 *  - caustic: the live caustics' alpha ceiling (the static pools' alphas live
 *    with their geometry in lensLayout.ts CAUSTICS, the glints' in GLINTS).
 */
export const LIQUID = {
  rimLine: 0.34,
  rimInner: 0.1,
  rimDark: 0.28,
  plate: 0.28,
  blob: { core: 0.92, mid: 0.5, midAt: 0.6 } as const,
  bodyAlpha: [0.8, 0.96] as const,
  caustic: 0.16,
} as const;

/** `0x8e24aa` → `"vec3(0.557, 0.141, 0.667)"` — a GLSL literal for `#define`. */
export function glsl(hex: number): string {
  const c = (shift: number) => (((hex >> shift) & 0xff) / 255).toFixed(3);
  return `vec3(${c(16)}, ${c(8)}, ${c(0)})`;
}
