import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  plain: ReactNode;
  accent: ReactNode;
  as?: ElementType;
  className?: string;
  accentClassName?: string;
}

/**
 * The signature two-part heading (DESIGN-SYSTEM §2.2): Onest plain text with a
 * trailing italic-serif accent phrase in muted ink.
 */
export function MixedHeading({
  plain,
  accent,
  as: Tag = "h2",
  className,
  accentClassName,
}: Props) {
  return (
    <Tag className={cn("font-sans font-medium", className)}>
      {plain}{" "}
      <span className={cn("font-serif font-normal italic text-ink-2", accentClassName)}>
        {accent}
      </span>
    </Tag>
  );
}
