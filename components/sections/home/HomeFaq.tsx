"use client";

import { useState, type CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Caustic, Droplet, Node } from "@/components/motifs";
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
 * The row marker. A 6px light `Node` — the kit's endpoint disc, so it brings
 * `data-lit`'s glow, `.node`'s geometry and the reduced-motion re-light for
 * free — with two call-site deviations, both for visibility:
 *
 *  • the FILL is `--violet-500` inline. `.node-light`'s `--lavender-200` disc
 *    is designed for a 44px plate carrying a `--violet-text` glyph; as a bare
 *    6px bead on `--canvas` it measures ~1.1:1 against its own host and simply
 *    is not there. This is the Ecosystem port-bead precedent verbatim (Part J,
 *    Phase 7), and `--violet-500` is the palette's flow colour.
 *  • the STATE is opacity, as Part E row 12 asks: 0.32 closed, 1 open. `.35 →
 *    1` on `.node-glow` (a .16-alpha radial) is invisible at 6px, so the whole
 *    bead fades instead. Closed still resolves to a visible pale violet
 *    (~(216,183,226) over `--canvas`), which is the point — this is quiet
 *    reinforcement, not the affordance. The affordance is the chevron plus
 *    `aria-expanded`, and the bead is `aria-hidden`, so WCAG 1.4.11 does not
 *    ride on it.
 *
 * `opacity` is composited and this transition only ever runs on a click, never
 * inside a Lighthouse trace. Under reduced motion the global 0.001ms clamp
 * makes it an instant state change and the resting pose stays visible.
 */
const DOT = (open: boolean): CSSProperties => ({
  background: "var(--violet-500)",
  opacity: open ? 1 : 0.32,
  transition: "opacity var(--dur-ui) var(--ease-out-expo)",
});

/**
 * FAQ — accordion beside a "still have a question" glass card, per the Figma
 * (REDESIGN-V4 Part E §12). First item open by default.
 *
 * The mechanics are UNCHANGED: `.acc-panel`'s grid-rows height animation,
 * `PANEL_SPRING` on the inner content, `CHEVRON_SPRING` on the flip, one
 * `useState` index, `aria-expanded` / `aria-controls`. What V4 changes is the
 * surface language.
 *
 * LEFT COLUMN. A light `Droplet` eyebrow (replacing `.eyebrow-capsule`),
 * `display-2` heading, then a tier-2 light Vessel holding the mail CTA.
 * The Droplet's ink is `--violet-text`: on `.liq-light.liq-1`'s .55 white,
 * `--ink-3` measures 4.17 and is forbidden (§A6, and qa.mjs enforces it), so a
 * plain eyebrow colour cannot go inside one (Part J, Phase 2). It carries
 * `liq-flat` for the Ecosystem reason — a small pill on a flat surface has
 * nothing behind it to frost, and `.liq-1` has no blur below 1024 anyway, so
 * the class only removes a desktop no-op. The Vessel KEEPS its frost: it is
 * one blur, and the worst viewport it can share (with CtaBand below) is 1 + 2
 * + the pill = 4 of the desktop 8, or 1 + 1 + pill = 3 of the phone 4.
 *
 * THE CAUSTIC. One light disc, upper-right, in its OWN `absolute inset-0
 * overflow-hidden` clip box. The box needs `isolate`, and that is the opposite
 * of what the dark bands do: `.section-dark` is itself a stacking context, so
 * there the clip box is left plain and the disc's `z-index: -2` resolves
 * against the band. A LIGHT section is not a stacking context, so without
 * `isolate` on the box `z-index: -2` would climb past the section and the disc
 * would paint behind its `bg-canvas` — invisible (Part J, Phase 7).
 *
 * The disc sits over the accordion's upper rows, and the contrast walk is
 * BLIND to it (a sibling overlay is not a background layer of the text's
 * ancestors), so the cost is computed by hand: `--violet-soft` is
 * rgba(142,36,170,.10), which over `--canvas` composites to rgb(239,227,244).
 * On that core `--ink-2` is 7.49:1 (8.78 without it) and `--ink` is 13.59:1 —
 * both far above AA. The light case has room the dark one does not, where
 * `--ink-inv-2` has 0.02 of headroom and a Caustic core costs 0.3–0.5.
 */
export function HomeFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-pad relative bg-canvas">
      {/* Caustic clip box — `isolate` for the reason in the block comment.
          x/y are the TOP-LEFT corner: a 520px disc centred at (88%, 16%). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 isolate overflow-hidden"
      >
        <Caustic
          light
          x="calc(88% - 260px)"
          y="calc(16% - 260px)"
          size="520px"
          drift="far"
        />
      </span>

      <div className="relative mx-auto grid grid-cols-1 w-full max-w-[1240px] gap-12 px-6 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <Reveal>
            <Droplet
              light
              className="liq-flat px-4 py-1.5 text-[12px] font-semibold uppercase tracking-eyebrow text-violet-text"
            >
              {HOME_SECTIONS.faq.eyebrow}
            </Droplet>
            <h2 className="display-2 mt-6 max-w-[16ch] text-ink">
              {HOME_SECTIONS.faq.heading}
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <div
              className="liq liq-light liq-spec relative isolate mt-10 rounded-lg p-7"
              style={{ "--liq-pad": "28px" } as CSSProperties}
            >
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
                      <span className="flex min-w-0 items-center gap-3.5">
                        <Node
                          light
                          size={6}
                          lit={isOpen}
                          style={DOT(isOpen)}
                        />
                        <span>{item.q}</span>
                      </span>
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
