"use client";

import { useState, type CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { FAQ } from "@/content/faq";
import { HOME_SECTIONS } from "@/content/home";
import { CONTACT } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * Spring easings, declared here rather than as utility classes.
 *
 * WHY INLINE: the panel height is still `.acc-panel`'s `grid-template-rows:
 * 0fr → 1fr` — correct, but a grid track CANNOT overshoot (1.05fr is a
 * different track, not an overshoot), so a spring on the height would be
 * wasted. The spring therefore goes on the inner content's `translateY`, where
 * the overshoot is visible and is what actually sells the open. `.acc-inner`'s
 * own 6px/ease-out declarations in globals.css are not ours to edit, so the
 * travel and easing are declared on the element instead (inline beats the
 * class) and the `acc-inner` class is dropped from the node to avoid two
 * competing sources of truth for the same transform.
 *
 * REDUCED MOTION: globals.css's
 * `@media (prefers-reduced-motion: reduce) * { transition-duration: 0.001ms
 * !important }` outranks these inline declarations (important author rules beat
 * inline), so every transition below collapses to an instant state change. No
 * JS involved, nothing to gate in this component.
 */
const PANEL_SPRING = (open: boolean): CSSProperties => ({
  transform: open ? "translateY(0)" : "translateY(12px)",
  opacity: open ? 1 : 0,
  // 350ms spring + 60ms delay lands with .acc-panel's 420ms height transition.
  transition:
    "transform var(--dur-spring-snappy, 350ms) var(--spring-snappy, cubic-bezier(0.34,1.56,0.64,1)) 60ms," +
    " opacity 320ms var(--ease-out-expo) 60ms",
});

/** Chevron rotation retimed to the snappy spring; the flip stays class-driven. */
const CHEVRON_SPRING: CSSProperties = {
  transitionProperty: "transform",
  transitionDuration: "var(--dur-spring-snappy, 350ms)",
  transitionTimingFunction:
    "var(--spring-snappy, cubic-bezier(0.34,1.56,0.64,1))",
};

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
            <div className="mt-10 rounded-lg border border-line-soft bg-surface p-7">
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
                        style={CHEVRON_SPRING}
                        className={cn(
                          "shrink-0 text-ink-3",
                          // Both states declare a rotation so the spring has
                          // two transforms to interpolate, not `none` → matrix.
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
