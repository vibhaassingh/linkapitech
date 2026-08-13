import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { HOME_SECTIONS, WHAT_WE_DO } from "@/content/home";

/**
 * "What We Do" — three numbered glass rows on plum.
 *
 * `.sheet-enter` presents the whole plum band like an iOS sheet arriving over
 * the light canvas above it: a small rise + scale with a temporary corner
 * radius, scrubbed flat over the first fifth of the band's view progress. The
 * utility is wrapped in @supports (animation-timeline: view()) and neutralised
 * under prefers-reduced-motion in globals.css, so where either is missing the
 * band simply paints flat and full-bleed as before. Transform + radius only —
 * the section keeps its `section-pad`, so page height is untouched.
 *
 * Rhythm: heading → rows = mt-12 (48), row gap = gap-6 (24), row padding =
 * p-8 / md:p-10 (32 / 40) — the same card padding as the "Who We Are" card
 * directly above, which previously ran p-8/md:p-12 against these rows' p-7/p-9.
 */
export function WhatWeDo() {
  return (
    <section className="section-dark section-pad sheet-enter">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink-inv">
            {HOME_SECTIONS.what.heading}
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 flex flex-col gap-6" step={110}>
          {WHAT_WE_DO.map((p) => (
            <article
              key={p.num}
              className="glass sheen flex flex-col gap-3 rounded-xl p-8 sm:flex-row sm:items-center sm:gap-6 md:gap-8 md:p-10"
            >
              {/*
                The ghost numeral is now a continuous background plane rather
                than a one-shot settle: .scrub-drift parallaxes it against the
                copy for as long as the row is in view. --drift-range is pulled
                in to 12px because `.sheen` clips to the card (overflow:hidden)
                and the default ±22px would crop the digits against the 32px
                padding. Reduced motion: .scrub-drift is @supports/reduced-motion
                gated in globals.css and collapses to no transform.
              */}
              <span
                className="ghost-num scrub-drift relative z-[1] text-[44px] leading-none md:text-[52px]"
                style={{ ["--drift-range" as string]: "12px" } as CSSProperties}
                aria-hidden="true"
              >
                {p.num}
              </span>

              <div className="relative z-[1] min-w-0 flex-1">
                <h3 className="heading-3 text-ink-inv">{p.title}</h3>
                <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-ink-inv-2">
                  {p.body}
                </p>
              </div>

              <span className="grad-tile relative z-[1] hidden h-12 w-12 shrink-0 place-items-center md:grid">
                <Icon name={p.icon} size={22} />
              </span>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
