import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Drift = "far" | "mid" | "near";

interface CausticProps {
  /** CSS `left` — a length or percentage inside the positioned section. Top-left corner, not centre. */
  x: string;
  /** CSS `top`. */
  y: string;
  /** Diameter, a CSS length (380–560px in the spec). */
  size: string;
  /** Light-section variant (`--violet-soft`). */
  light?: boolean;
  /** Scroll parallax tier — adds `scrub-drift drift-*` (half amplitude below 1024). */
  drift?: Drift;
  /** 40s ambient translate loop, desktop (≥ 1024) only. */
  loop?: boolean;
  className?: string;
}

/**
 * Caustic — ambient light on the plum: the light liquid throws on the wall
 * (REDESIGN-V4 Part C). A radial gradient at z-index:-2 inside the isolated
 * `.section-dark`, so the grain dithers over it. Never a blur, never a filter.
 * Max 2 per section; phones get one, scroll-drift only.
 *
 * `drift` and `loop` both animate `transform`, and two animations cannot
 * share one element — so when both are set the loop runs on an inner disc
 * inside a drifting wrapper that owns the position and size. There is no
 * centring transform for the same reason (scripts/qa/cascade.mjs). Decorative:
 * `aria-hidden`. Styles in motifs.css.
 */
export function Caustic({
  x,
  y,
  size,
  light,
  drift,
  loop,
  className,
}: CausticProps) {
  const box: CSSProperties = { left: x, top: y, width: size, height: size };

  if (drift && loop) {
    return (
      <span
        aria-hidden="true"
        className={cn("caustic-wrap scrub-drift", `drift-${drift}`, className)}
        style={box}
      >
        <span className={cn("caustic caustic-loop", light && "caustic-light")} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "caustic",
        light && "caustic-light",
        drift && `scrub-drift drift-${drift}`,
        loop && "caustic-loop",
        className,
      )}
      style={box}
    />
  );
}
