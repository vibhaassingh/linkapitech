import { cn } from "@/lib/cn";

interface PoolProps {
  /** Light-section variant (`--violet-soft`). */
  light?: boolean;
  className?: string;
}

/**
 * Pool — violet liquid pooling at the base of a tile: value accumulating
 * under a number (REDESIGN-V4 Part C). Absolute, bottom 46% of a POSITIONED
 * parent; rises with the parent's `[data-reveal]` and rests full.
 *
 * TEXT THAT OVERLAPS A POOL IS `--ink-inv` (dark) / `--ink` (light) — the pool
 * adds violet under it (§A6). Decorative: `aria-hidden`. Styles in motifs.css.
 */
export function Pool({ light, className }: PoolProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("pool", light && "pool-light", className)}
    />
  );
}
