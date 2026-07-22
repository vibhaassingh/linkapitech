import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  /** numbered index rendered before the label, e.g. "01" */
  index?: string;
  as?: "p" | "span" | "div";
}

/** Mono section label — the "infrastructure" voice above every heading. */
export function Eyebrow({ children, className, index, as: Tag = "p" }: EyebrowProps) {
  return (
    <Tag className={cn("eyebrow flex items-center gap-3", className)}>
      {index && <span className="text-ink-3">{index}</span>}
      <span>{children}</span>
    </Tag>
  );
}
