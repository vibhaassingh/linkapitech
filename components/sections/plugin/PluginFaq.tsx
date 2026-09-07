"use client";

import { useState, type CSSProperties } from "react";
import { Node } from "@/components/motifs";
import type { PluginFaqItem } from "@/content/plugin";
import { cn } from "@/lib/cn";

const PANEL_SPRING = (open: boolean): CSSProperties => ({
  transform: open ? "translateY(0)" : "translateY(12px)",
  opacity: open ? 1 : 0,
  transition:
    "transform var(--dur-spring-snappy, 350ms) var(--spring-snappy, cubic-bezier(0.34,1.56,0.64,1)) 60ms," +
    " opacity 320ms var(--ease-out-expo) 60ms",
});

const DOT = (open: boolean): CSSProperties => ({
  background: "var(--violet-500)",
  opacity: open ? 1 : 0.32,
  transition: "opacity var(--dur-ui) var(--ease-out-expo)",
});

const CHEVRON_SPRING: CSSProperties = {
  transitionProperty: "transform",
  transitionDuration: "var(--dur-spring-snappy, 350ms)",
  transitionTimingFunction:
    "var(--spring-snappy, cubic-bezier(0.34,1.56,0.64,1))",
};

/**
 * The plugin page's accordion — HomeFaq's mechanics, lifted verbatim so the
 * two behave identically: `.acc-panel`'s grid-rows height transition, a
 * `useState` index, `aria-expanded` / `aria-controls`, one open at a time.
 * Only the content source differs (props, not the homepage FAQ module), which
 * is why this is its own file rather than a prop on HomeFaq.
 */
export function PluginFaq({
  items,
  idPrefix = "plugin-faq",
}: {
  items: PluginFaqItem[];
  idPrefix?: string;
}) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="flex flex-col">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${idPrefix}-panel-${i}`;
        return (
          <li
            key={item.q}
            className={cn(
              "acc-row border-b border-line-soft",
              isOpen && "is-open",
            )}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16.5px] font-semibold text-ink transition-colors duration-ui hover:text-plum-700"
              >
                <span className="flex min-w-0 items-center gap-3.5">
                  <Node light size={6} lit={isOpen} style={DOT(isOpen)} />
                  <span>{item.q}</span>
                </span>
                <span
                  aria-hidden="true"
                  style={CHEVRON_SPRING}
                  className={cn(
                    "shrink-0 text-ink-3",
                    isOpen ? "rotate-180" : "rotate-0",
                  )}
                >
                  <Chevron />
                </span>
              </button>
            </h3>
            <div id={panelId} className="acc-panel">
              <div className="acc-panel-min">
                <p
                  style={PANEL_SPRING(isOpen)}
                  className="max-w-[68ch] pb-6 text-[15px] leading-relaxed text-ink-2"
                >
                  {item.a}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
