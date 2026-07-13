import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  children: ReactNode;
  speed?: "normal" | "slow";
  fade?: boolean;
  className?: string;
}

/**
 * Infinite marquee (DESIGN-SYSTEM §5.6): content rendered twice, track animates
 * translateX(0 → -50%), pauses on hover. Reduced motion freezes it (globals.css).
 */
export function Marquee({ children, speed = "normal", fade = false, className }: Props) {
  const anim = speed === "slow" ? "animate-marquee-slow" : "animate-marquee";
  return (
    <div className={cn("group/mq relative overflow-hidden", fade && "mask-fade-x", className)}>
      <div className={cn("flex w-max group-hover/mq:[animation-play-state:paused]", anim)}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
