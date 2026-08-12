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
 *
 * Each child is wrapped in its own element to carry the delay. That wrapper
 * MUST be an <li> when the group renders a list, otherwise the DOM becomes
 * `<ul><div><li>…`, which is invalid and fails the axe `list`/`listitem`
 * rules — so the tag is derived from `as` rather than hardcoded to a div.
 * Call sites therefore pass plain children (div/article), never their own <li>.
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
  const ChildTag: React.ElementType = Tag === "ul" || Tag === "ol" ? "li" : "div";
  return (
    <Comp ref={ref} data-inview={inView || undefined} className={className}>
      {Children.map(children, (child, i) => (
        <ChildTag
          data-reveal=""
          data-inview={inView || undefined}
          style={{ "--reveal-delay": `${baseDelay + i * step}ms` } as CSSProperties}
        >
          {child}
        </ChildTag>
      ))}
    </Comp>
  );
}
