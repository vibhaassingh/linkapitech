import { cn } from "@/lib/cn";

interface SeamProps {
  /** Light-section variant (`--line-soft` line, violet segment). */
  light?: boolean;
  className?: string;
}

/**
 * Seam — the glass hairline between sections: the rim of the vessel
 * (REDESIGN-V4 Part C). A full-width 1px line with a 220px specular segment
 * that slides across as the section's `--sp` goes 0 → 1; with no driver the
 * segment sits clipped off the left edge. Below 1024 the segment is hidden and
 * the seam is a static line. Decorative: `aria-hidden`. Styles in motifs.css.
 */
export function Seam({ light, className }: SeamProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("seam", light && "seam-light", className)}
    >
      <span className="seam-spec" />
    </span>
  );
}
