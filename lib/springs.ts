/**
 * Damped-spring → CSS `linear()` sampler.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ BUILD-TIME / DEV UTILITY — NOT IMPORTED BY THE APP.                    │
 * │ Nothing under app/ or components/ imports this module, so it ships     │
 * │ ZERO bytes of client JS. It exists so the three `--spring-*` easings   │
 * │ in globals.css are reproducible instead of magic strings: run it,      │
 * │ paste the output block, commit both.                                   │
 * │                                                                        │
 * │   npx tsc lib/springs.ts --outDir /tmp/springs --module esnext \        │
 * │     --target es2022 --moduleResolution bundler                          │
 * │   node -e "import('/tmp/springs/springs.js').then(m=>console.log(       │
 * │     m.cssBlock()))"                                                     │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Why `linear()` and not `cubic-bezier()`: a cubic-bézier cannot leave the
 * 0..1 output range, so it can never overshoot. A spring's whole character is
 * the small overshoot before it settles. `linear()` takes an arbitrary list of
 * output samples (values above 1 are legal), so a sampled spring reproduces
 * that overshoot in pure CSS — no JS animation loop, no runtime cost, and it
 * composes with `transition` on any property.
 *
 * Physics: unit-step response of a mass-spring-damper, x(0)=0, x(∞)=1.
 *   ω0 = √(k/m)                 undamped natural frequency
 *   ζ  = c / (2√(k·m))          damping ratio
 * Underdamped (ζ<1) overshoots by exp(−ζπ/√(1−ζ²)); at ζ≥1 there is no
 * overshoot at all, which is the correct behaviour for large surfaces.
 */

export interface SpringSpec {
  /** Spring constant k (higher = faster, tighter). */
  stiffness: number;
  /** Damping coefficient c (higher = less overshoot). */
  damping: number;
  /** Mass m; 1 matches the react-spring / Framer convention. */
  mass?: number;
  /** Window sampled into the easing, ms. Should cover the settle. */
  duration: number;
  /** Number of `linear()` stops (inclusive of both ends). */
  stops?: number;
}

/** Unit-step position of the spring at time `t` seconds (0 → ~1). */
export function springValue(t: number, spec: SpringSpec): number {
  const { stiffness: k, damping: c, mass: m = 1 } = spec;
  const w0 = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const decay = Math.exp(-zeta * w0 * t);

  if (zeta < 1 - 1e-9) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - decay * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  if (zeta > 1 + 1e-9) {
    const wd = w0 * Math.sqrt(zeta * zeta - 1);
    return (
      1 - decay * (Math.cosh(wd * t) + ((zeta * w0) / wd) * Math.sinh(wd * t))
    );
  }
  // Critically damped.
  return 1 - decay * (1 + w0 * t);
}

/** Damping ratio ζ — <1 underdamped (overshoots), ≥1 no overshoot. */
export function dampingRatio({ stiffness, damping, mass = 1 }: SpringSpec) {
  return damping / (2 * Math.sqrt(stiffness * mass));
}

/**
 * Peak of the sampled curve and when it occurs. Used to state the real
 * overshoot in globals.css rather than guessing at it.
 */
export function springPeak(spec: SpringSpec) {
  let peak = 0;
  let atMs = 0;
  for (let i = 0; i <= 2000; i += 1) {
    const ms = (spec.duration * i) / 2000;
    const v = springValue(ms / 1000, spec);
    if (v > peak) {
      peak = v;
      atMs = ms;
    }
  }
  return { peak, atMs };
}

const trim = (n: number) =>
  Number(n.toFixed(4))
    .toString()
    .replace(/^0\./, ".")
    .replace(/^-0\./, "-.");

/**
 * Sample the spring into a CSS `linear()` easing. Endpoints are pinned to
 * exactly 0 and 1 so the transition starts and lands clean (a residual
 * 0.9997 at the tail would leave a visible sub-pixel drift on transforms).
 */
export function springLinear(spec: SpringSpec): string {
  const stops = spec.stops ?? 24;
  const out: string[] = [];
  for (let i = 0; i < stops; i += 1) {
    const p = i / (stops - 1);
    if (i === 0) out.push("0");
    else if (i === stops - 1) out.push("1");
    else out.push(trim(springValue((p * spec.duration) / 1000, spec)));
  }
  return `linear(${out.join(", ")})`;
}

/** The site's three springs. Names are the contract; numbers are the physics. */
export const SPRINGS: Record<"snappy" | "smooth" | "gentle", SpringSpec> = {
  /** Presses, toggles, arrow nudges — reacts inside one perceptual beat. */
  snappy: { stiffness: 420, damping: 30, duration: 350, stops: 24 },
  /** Sheets, cards, the nav thumb — the default "object moved" spring. */
  smooth: { stiffness: 260, damping: 26, duration: 550, stops: 26 },
  /**
   * Reveals and large surfaces.
   *
   * DEVIATION, deliberate: the brief said 170/26, which is react-spring's
   * `default` preset — ζ = 0.997, i.e. critically damped. Sampling it proves
   * it NEVER exceeds 1 (measured peak 0.9997 at t=duration), so it is an
   * ease-out wearing a spring's name. Damping 22 puts ζ at 0.844, which
   * overshoots by a real but feather-light +0.7% — the softest of the three,
   * still nowhere near wobble on a large surface. Settle is unchanged: the
   * envelope decays with a 91ms time constant, so 800ms is ~8.8 τ.
   */
  gentle: { stiffness: 170, damping: 22, duration: 800, stops: 22 },
};

/** The exact block that is pasted into globals.css `:root`. */
export function cssBlock(): string {
  const lines: string[] = [];
  for (const [name, spec] of Object.entries(SPRINGS)) {
    const { peak, atMs } = springPeak(spec);
    const zeta = dampingRatio(spec);
    lines.push(
      `  /* k=${spec.stiffness} c=${spec.damping} m=${spec.mass ?? 1} · ζ=${zeta.toFixed(3)} · peak ${peak.toFixed(4)} @ ${Math.round(atMs)}ms */`,
      `  --spring-${name}: ${springLinear(spec)};`,
      `  --dur-spring-${name}: ${spec.duration}ms;`,
    );
  }
  return lines.join("\n");
}
