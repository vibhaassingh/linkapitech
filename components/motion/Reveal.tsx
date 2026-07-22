"use client";

import type { CSSProperties, ReactNode } from "react";
import { useInView } from "./useInView";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** transition delay in ms (use RevealGroup for index-based staggers) */
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "p" | "header" | "article" | "footer";
  style?: CSSProperties;
  id?: string;
}

/**
 * Scroll reveal driven entirely through React state: `data-inview` is part of
 * the rendered output, so re-renders can never wipe the revealed state (the
 * failure mode of the old imperative classList system).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
  id,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      id={id}
      ref={ref}
      data-reveal=""
      data-inview={inView || undefined}
      className={className}
      style={
        delay
          ? ({ ...(style ?? {}), "--reveal-delay": `${delay}ms` } as CSSProperties)
          : style
      }
    >
      {children}
    </Comp>
  );
}
