"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useReveal } from "./hooks";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** stagger delay in ms */
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "p" | "header" | "article";
  style?: CSSProperties;
  id?: string;
}

/** Convenience wrapper around the `.reveal` fade/slide/blur (System A). */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  style,
  id,
}: RevealProps) {
  const ref = useReveal<HTMLElement>();
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      id={id}
      ref={ref}
      className={cn("reveal", className)}
      style={{ ...(style ?? {}), "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Comp>
  );
}
