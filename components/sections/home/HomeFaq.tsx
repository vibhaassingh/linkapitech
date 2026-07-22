"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "./SectionHeader";
import { FAQ } from "@/content/faq";
import { HOME_SECTIONS } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * FAQ — accessible accordion (button + aria-expanded + grid-rows height
 * animation). First item open by default.
 */
export function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-pad border-t border-line-soft">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeader meta={HOME_SECTIONS.faq} />

        <Reveal delay={120}>
          <ul className="flex flex-col">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;
              return (
                <li key={item.q} className={cn("acc-row border-b border-line", isOpen && "is-open")}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-[17px] font-semibold text-ink transition-colors duration-ui hover:text-navy-700"
                    >
                      {item.q}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "text-ink-3 transition-transform duration-ui",
                          isOpen && "rotate-45",
                        )}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <div id={panelId} className="acc-panel">
                    <div className="acc-panel-min">
                      <p className="acc-inner max-w-[62ch] pb-6 text-[15px] leading-relaxed text-ink-2">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
