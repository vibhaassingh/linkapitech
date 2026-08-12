"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { FAQ } from "@/content/faq";
import { HOME_SECTIONS } from "@/content/home";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * FAQ — accordion (button + aria-expanded + grid-rows height animation) beside
 * a "still have a question" card, per the Figma. First item open by default.
 */
export function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-pad bg-canvas">
      <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] gap-12 px-6 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <Reveal>
            <span className="eyebrow-capsule">{HOME_SECTIONS.faq.eyebrow}</span>
            <h2 className="display-2 mt-6 max-w-[16ch] text-ink">
              {HOME_SECTIONS.faq.heading}
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-10 rounded-xl border border-line-soft bg-surface p-7">
              <h3 className="text-[18px] font-semibold text-ink">
                Still have a question?
              </h3>
              <p className="mt-2 max-w-[34ch] text-[14.5px] leading-relaxed text-ink-2">
                Can&rsquo;t find the answer you&rsquo;re looking for? Send us an
                email and we&rsquo;ll get back to you as soon as possible.
              </p>
              <Button
                href={`mailto:${CONTACT.primaryEmail}`}
                className="mt-6"
                showArrow={false}
              >
                Send email
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <ul className="flex flex-col">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;
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
                      {item.q}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "shrink-0 text-ink-3 transition-transform duration-ui",
                          isOpen && "rotate-180",
                        )}
                      >
                        <Chevron />
                      </span>
                    </button>
                  </h3>
                  <div id={panelId} className="acc-panel">
                    <div className="acc-panel-min">
                      <p className="acc-inner max-w-[68ch] pb-6 text-[15px] leading-relaxed text-ink-2">
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
        d="m6 9.5 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
