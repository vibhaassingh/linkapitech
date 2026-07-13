"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useCounter } from "@/components/motion/hooks";

interface Props {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/** Animated count-up (INTERACTIONS §5.11), Indian-grouped formatting. */
export function Counter({ target, prefix = "", suffix = "", duration = 1400, className, style }: Props) {
  const { ref, value } = useCounter(target, duration);
  const display = Math.round(value).toLocaleString("en-IN");
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={cn("tabular-nums", className)} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
