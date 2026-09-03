import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface NodeProps {
  /** Disc diameter in px — 44–56 in the spec (default 48). */
  size?: number;
  /** Raise the inner glow to full: "the flow reaches this endpoint". */
  lit?: boolean;
  /**
   * Inside a glass card: `.liq-inset` (veil fill, no second blur layer)
   * instead of `.liq liq-1`. This is what keeps nested glass off the §A7 blur
   * budget. Ignored when `light` (a light node is never glass).
   */
  inset?: boolean;
  /** Light sections: lavender disc, violet glyph, no glass. */
  light?: boolean;
  /** Opt into the delegated `[data-tilt]` 3D tilt (components/motion/Magnetic.tsx). */
  tilt?: boolean;
  /** The glyph — an <Icon>, a mark, a numeral. Rendered above the glow. */
  icon?: ReactNode;
  /**
   * Accessible name. With one the node is an image (`role="img"`); without
   * one it is decorative and hidden from the accessibility tree.
   */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Node — an endpoint: ERP, bank, LinkAPI, a step (REDESIGN-V4 Part C).
 * Glow is a child animated on opacity only; `data-lit` raises it. Styles in
 * motifs.css (`.node`, `.node-glow`, `.node-light`).
 */
export function Node({
  size = 48,
  lit,
  inset,
  light,
  tilt,
  icon,
  label,
  className,
  style,
}: NodeProps) {
  return (
    <span
      className={cn(
        "node",
        light ? "node-light" : inset ? "liq-inset" : "liq liq-1",
        className,
      )}
      style={{ "--node-size": `${size}px`, ...style } as CSSProperties}
      data-lit={lit || undefined}
      data-tilt={tilt || undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : "true"}
    >
      <span className="node-glow" />
      {icon}
    </span>
  );
}
