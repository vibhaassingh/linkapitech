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
 * Count-up stat block. Numerals use the display face with tabular figures so
 * columns stay steady while counting. Falls back to the verbatim display
 * string when a stat has no numeric target.
 */
export function StatNumber({
  stat,
  className,
  numClassName,
  labelClassName,
  duration = 1400,
}: StatNumberProps) {
  const { ref, value } = useCounter(stat.count ?? 0, duration);
  const animated = stat.count != null;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      <p className={cn("stat-num text-ink", numClassName)}>
        {animated ? (
          <>
            {stat.prefix}
            {Math.round(value).toLocaleString("en-IN")}
            {stat.suffix}
          </>
        ) : (
          stat.value
        )}
      </p>
      <p className={cn("mt-2 text-sm leading-relaxed text-ink-3", labelClassName)}>
        {stat.label}
      </p>
    </div>
  );
}
