import { cn } from "@/lib/cn";

/**
 * One gentle crest across a 1000-unit width: 52 at the left edge, peaking at
 * ~21.7 (t ≈ .45), 44 at the right. Crest height ≈ 30 units = 3% of the width
 * (the spec's ceiling is 4%). Asymmetric on purpose — a centred dome reads as
 * a template divider. Static geometry: there is no path morph, ever.
 */
const CURVE = "M0,52 C220,14 640,10 1000,44";

interface MeniscusProps {
  /**
   * The NEXT section's surface colour — the liquid below the curve. A CSS
   * colour or var() string; defaults to `var(--canvas)`.
   */
  fill?: string;
  className?: string;
}

/**
 * Meniscus — the curved liquid surface where a dark band ends and a light one
 * begins (REDESIGN-V4 Part C). Place it at the very bottom of the dark band;
 * the area above the curve stays transparent so the band shows through, the
 * area below is the next section's surface. A 1.2px lavender stroke follows
 * `--sp` (.3 → .6 opacity). Max 3 uses site-wide; 32px on phones, 56px from
 * 640, 80px from 768. Decorative: `aria-hidden`. Styles in motifs.css.
 */
export function Meniscus({ fill = "var(--canvas)", className }: MeniscusProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("meniscus", className)}
      viewBox="0 0 1000 80"
      preserveAspectRatio="none"
    >
      <path d={`${CURVE} L1000,80 L0,80 Z`} fill={fill} />
      <path
        d={CURVE}
        className="meniscus-line"
        fill="none"
        stroke="var(--lavender-400)"
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
