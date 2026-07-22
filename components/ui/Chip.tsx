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
    "bg-navy-050 text-navy-700 px-3.5 py-1.5 text-xs font-medium",
  glass:
    "border border-line-inv bg-white/[0.06] px-3 py-1.5 text-[11px] uppercase tracking-eyebrow text-ink-inv-2",
  outline:
    "border border-line px-3.5 py-1.5 text-[13px] text-ink-2 transition-colors duration-ui hover:border-steel hover:text-ink",
};

/** Tag chip — navy tint (light), glass (on inverse), hairline outline. */
export function Chip({ children, variant = "neutral", className }: Props) {
  return (
    <span className={cn("inline-flex items-center rounded-pill leading-none", variants[variant], className)}>
      {children}
    </span>
  );
}
