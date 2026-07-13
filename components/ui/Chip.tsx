import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipVariant = "neutral" | "glass" | "outline";

interface Props {
  children: ReactNode;
  variant?: ChipVariant;
  className?: string;
}

const variants: Record<ChipVariant, string> = {
  neutral:
    "bg-bg-2 text-ink px-3.5 py-2 text-xs font-medium transition-colors duration-300 hover:bg-accent-soft",
  glass:
    "border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-white backdrop-blur-[6px]",
  outline:
    "border border-line px-4 py-2 text-[13px] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink",
};

/** Chip / tag — neutral (light), glass (on imagery), outline (DESIGN-SYSTEM §5.4). */
export function Chip({ children, variant = "neutral", className }: Props) {
  return (
    <span className={cn("inline-flex items-center rounded-pill leading-none", variants[variant], className)}>
      {children}
    </span>
  );
}
