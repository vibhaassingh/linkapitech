import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "footer" | "header" | "nav";
  id?: string;
}

/** Page-width container: 1240px column with responsive gutters. */
export function Container({ children, className, as: Tag = "div", id }: ContainerProps) {
  return (
    <Tag id={id} className={cn("mx-auto w-full max-w-[1240px] px-6 md:px-10", className)}>
      {children}
    </Tag>
  );
}
