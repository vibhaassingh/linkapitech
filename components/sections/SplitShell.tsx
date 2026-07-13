"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useActiveSection } from "@/components/motion/hooks";
import { INDEX_PANELS } from "@/content/home";

/**
 * Two-column split shell (HOMEPAGE-SECTIONS SplitShell). Sticky index rail on the
 * left cross-fades per active section; collapses to a single column ≤1100px
 * (the rail is hidden and sections just stack — a fully valid fallback).
 */
export function SplitShell({ children }: { children: ReactNode }) {
  const ids = INDEX_PANELS.map((p) => p.id);
  const active = useActiveSection(ids, 0.42);

  return (
    <div className="grid border-t border-line lg:grid-cols-[560px_1fr]">
      {/* Decorative sticky index — it previews the sections that follow, so it is
          aria-hidden to avoid duplicating their headings in the a11y tree. */}
      <aside
        aria-hidden="true"
        className="sticky top-0 hidden h-screen flex-col justify-center px-[clamp(28px,4vw,64px)] lg:flex"
      >
        <div className="relative grid">
          {INDEX_PANELS.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "col-start-1 row-start-1 flex flex-col justify-center transition-all duration-700 ease-brand",
                active === p.id
                  ? "opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0",
              )}
            >
              <span className="font-serif text-[clamp(96px,10vw,140px)] italic leading-[0.95] tracking-[-0.02em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-2 text-[11px] uppercase tracking-eyebrow text-ink-3">
                {p.eyebrow}
              </span>
              <h2 className="mt-4 text-[32px] font-medium leading-[1.18] tracking-[-0.025em]">
                {p.headingPlain}{" "}
                <span className="font-serif font-normal italic text-ink-2">{p.headingAccent}</span>
              </h2>
              <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-ink-2">{p.desc}</p>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
