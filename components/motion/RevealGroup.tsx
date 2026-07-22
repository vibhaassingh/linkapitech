"use client";

import { Children, type CSSProperties, type ReactNode } from "react";
import { useInView } from "./useInView";

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
  /** ms between children; defaults to the --stagger token (80ms). */
  step?: number;
  /** extra delay before the first child, ms */
  baseDelay?: number;
}

/**
 * Staggered reveal: ONE IntersectionObserver on the wrapper; each direct child
 * gets `--reveal-delay: base + i * step`. Children render with data-reveal and
 * inherit data-inview from the wrapper via the CSS descendant hook below.
 */
export function RevealGroup({
  children,
  className,
  as: Tag = "div",
  step = 80,
  baseDelay = 0,
}: RevealGroupProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} data-inview={inView || undefined} className={className}>
      {Children.map(children, (child, i) => (
        <div
          data-reveal=""
          data-inview={inView || undefined}
          style={{ "--reveal-delay": `${baseDelay + i * step}ms` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </Comp>
  );
}
