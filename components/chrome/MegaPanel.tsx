"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MegaPanelProps {
  id: string;
  open: boolean;
  labelledBy: string;
  children: ReactNode;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  className?: string;
}

/**
 * Full-width mega menu sheet. Rendered in DOM order directly after its
 * trigger (natural Tab flow, no focus trap); `hidden` removes it from the
 * a11y tree and tab order when closed. Position is fixed so DOM adjacency
 * and full-bleed width coexist.
 */
export function MegaPanel({
  id,
  open,
  labelledBy,
  children,
  onPointerEnter,
  onPointerLeave,
  className,
}: MegaPanelProps) {
  return (
    <div
      id={id}
      hidden={!open}
      aria-labelledby={labelledBy}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn(
        "mega-sheet fixed inset-x-0 top-[72px] z-40 border-t border-line-soft bg-surface shadow-menu",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 py-10 md:px-10">{children}</div>
    </div>
  );
}
