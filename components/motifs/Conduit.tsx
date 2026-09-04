import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ConduitProps {
  /** Track direction. A vertical track is 6px wide and takes its height from the parent. */
  orientation?: "h" | "v";
  /**
   * `scroll` — the band follows the section's `--sp` (0 → 1, written by
   * useSectionProgress onto the section). With no driver `--sp` is the :root
   * `0`, so the band parks off-track and is invisible: decoration fails closed.
   * `loop` — a 7s ambient loop, desktop (≥ 1024) only; static below.
   * `custom` — the caller supplies the moving part as `children` and owns its
   * geometry and transform; NO `conduit-*` flow class is emitted, so the kit
   * declares no transform on it and there is no second driver to collide with
   * (REDESIGN-V4 Part J, Phase 7). ProcessRail needs this: its rail is a FILL
   * that grows down the track from `--sp-live` (`scaleY(var(--fill))`, origin
   * top), not the 38%-long band travelling on `--sp`.
   */
  flow?: "scroll" | "loop" | "custom";
  /** Light-section palette: lavender track, soft hairline. */
  light?: boolean;
  className?: string;
  style?: CSSProperties;
  /** `flow="custom"` only: the flow element, rendered instead of `.conduit-flow`. */
  children?: ReactNode;
}

/**
 * Conduit — the glass channel money travels through (REDESIGN-V4 Part C).
 * Decorative: `aria-hidden`, and it carries no copy. Styles in motifs.css.
 */
export function Conduit({
  orientation = "h",
  flow = "scroll",
  light,
  className,
  style,
  children,
}: ConduitProps) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "conduit",
        orientation === "v" && "conduit-v",
        flow !== "custom" && `conduit-${flow}`,
        light && "conduit-light",
        className,
      )}
    >
      {flow === "custom" ? children : <span className="conduit-flow" />}
    </span>
  );
}

interface ConduitPathProps {
  /** SVG path data, in the parent <svg>'s viewBox units. */
  d: string;
  /** Light-section palette for the base stroke. */
  light?: boolean;
  /**
   * Add the travelling packet (`.conduit-pulse`, stroke-dashoffset — the
   * kit's one paint-only animation, allowlisted in gate.sh). Desktop only:
   * hidden below 1024 by CSS; call sites may also skip rendering it.
   */
  pulse?: boolean;
  /** Stagger for the packet, e.g. `${i * -0.9}s`; negative values start mid-path. */
  pulseDelay?: string;
  className?: string;
}

/**
 * ConduitPath — the SVG variant for curves: a base stroke plus an optional
 * `.conduit-pulse` path. `pathLength="100"` normalises the path so the
 * `8 92` dasharray is one 8-unit packet per 100 regardless of geometry;
 * `vector-effect: non-scaling-stroke` keeps the stroke 1.5px on any scale.
 * Render inside an `aria-hidden` <svg>.
 */
export function ConduitPath({
  d,
  light,
  pulse,
  pulseDelay,
  className,
}: ConduitPathProps) {
  return (
    <g className={className}>
      <path
        d={d}
        fill="none"
        stroke={light ? "var(--lavender-300)" : "var(--glass-3-line)"}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {pulse && (
        <path
          d={d}
          className="conduit-pulse"
          fill="none"
          stroke="var(--violet-500)"
          strokeWidth={1.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="8 92"
          vectorEffect="non-scaling-stroke"
          style={pulseDelay ? ({ "--pulse-delay": pulseDelay } as CSSProperties) : undefined}
        />
      )}
    </g>
  );
}
