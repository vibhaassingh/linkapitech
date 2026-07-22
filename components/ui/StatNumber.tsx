"use client";

import { useCounter } from "@/components/motion/hooks";
import { cn } from "@/lib/cn";
import type { Stat } from "@/content/stats";

interface StatNumberProps {
  stat: Stat;
  className?: string;
  /** class for the numeral itself */
  numClassName?: string;
  labelClassName?: string;
  duration?: number;
}

/**
 * Count-up stat block.
 *
 * Figures are tabular *while counting* so the column never jitters, then swap
 * to proportional once settled — tabular commas take a full digit advance and
 * read as a gap in the final number ("5 , 000+"). The numeral never wraps:
 * a broken "₹20,000 / Cr" would push its label out of alignment with the rest
 * of the row, so the unit rides along on one line.
 */
export function StatNumber({
  stat,
  className,
  numClassName,
  labelClassName,
  duration = 1400,
}: StatNumberProps) {
  const { ref, value, settled } = useCounter(stat.count ?? 0, duration);
  const animated = stat.count != null;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cn("flex flex-col", className)}>
      <p
        className={cn(
          "stat-num whitespace-nowrap text-ink",
          animated && !settled && "tnum",
          numClassName,
        )}
      >
        {animated && !settled ? (
          <>
            {stat.prefix}
            {Math.round(value).toLocaleString("en-IN")}
            {stat.suffix}
          </>
        ) : (
          stat.value
        )}
      </p>
      <p className={cn("mt-2 text-sm leading-relaxed text-ink-3", labelClassName)}>{stat.label}</p>
    </div>
  );
}
