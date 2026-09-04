import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Pool } from "@/components/motifs";
import { HOME_SECTIONS, WHO_WE_ARE } from "@/content/home";

/**
 * "Who We Are?" — the TSP positioning in one glass Vessel (Part E §3).
 *
 * COMPOSITION. A 12-column asymmetric split: the `display-2` heading holds
 * columns 1–4, the Vessel columns 5–12. Below lg the two stack and the card
 * drops to `p-7`. Reveals at 0 / 120ms.
 *
 * MATERIAL. The card is a tier-2 light Vessel — `.liq liq-light` — with
 * `.liq-spec`, the pointer specular masked to the padding frame. It is NOT
 * the pre-V4 pointer-highlight class the light cards used to carry: that owns
 * `::before` and `.liq` owns both of its own pseudos, so §A6 forbids the two
 * from ever sharing an element. `--liq-pad` is 48px = the `md:p-12` padding
 * exactly, the same pairing WhatWeDo uses; the
 * specular is `display: none` below 1024 and on coarse pointers, so the mobile
 * `p-7` never has to match it.
 *
 * `liq-static-mobile` (no backdrop-filter below 1024) is the §A7 phone budget,
 * and it is a BOUNDARY case rather than a per-section one: this card and
 * WhatWeDo's three `.liq-spec` cards can share a 390×844 viewport at the
 * section join (WhoWeAre's card bottom → 80px pad → 80px pad → the "What We
 * Do" heading → mt-12 ≈ 288px, then two ~330px cards), which would be 4 blurs
 * + the pill = 5 against a budget of 4. Above 1024 the frost stays.
 *
 * THE POOL. Part E row 3 puts a light Pool at the card's bottom-right and
 * keeps `.orb-hand-off` ON THE POOL ELEMENT, so leg 2 of the travelling glow
 * (hero dome → here → ecosystem hub) still runs. Two things make that safe:
 *
 *  • `.pool` is `inset: auto 0 0 0; height: 46%` of a POSITIONED parent, so
 *    the basin's size comes from the wrapper box (overriding the height with a
 *    Tailwind `h-*` would silently lose to motifs.css, which is emitted after
 *    Tailwind). A 176/216px box gives an 81.0/99.4px basin (measured), and the
 *    card reserves 112px (`pb-28`) / 128px (`md:pb-32`) of bottom padding for
 *    it — so the basin clears the last line of copy by 31px / 29px. §A6 allows
 *    only `--ink` over a light Pool and the copy is `--ink-2`, so the pool is
 *    kept geometrically clear of it rather than recoloured. The clearance is
 *    deliberately generous rather than minimal: `.pool::before` is a 1px
 *    lavender meniscus line at the basin's top, and at ~13px it read as an
 *    underline beneath the paragraph instead of as a liquid surface.
 *  • `orbHandOff` cannot break that clearance. Its keyframes are
 *    `translateY(±18%) scale(0.82)` and `.pool`'s `transform-origin` is
 *    `50% 100%`, so at the `to` keyframe the top edge sits at
 *    −0.82h − 0.18h = −1.0h — exactly its resting position — and at `from` it
 *    is LOWER (−0.64h). The pool breathes and dims across the transit without
 *    ever rising into the text.
 *
 * The animation (with `both`) outranks `.pool`'s own `[data-inview]` rise
 * transition wherever `view()` timelines exist; where they do not — and under
 * reduced motion, where `orbHandOff` is killed by name — the reveal rise
 * applies instead and the pool rests full. Both poses are finished poses.
 * The Pool is FIRST in DOM and the copy sits in a `relative z-[1]` wrapper:
 * `.pool` is positioned with no z-index, so it would otherwise paint over
 * in-flow text (the trap StatBand answers the same way).
 */
export function WhoWeAre() {
  return (
    <section className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <h2 className="display-2 text-ink">{HOME_SECTIONS.who.heading}</h2>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-8">
            <div
              className="liq liq-light liq-spec liq-static-mobile relative isolate overflow-hidden rounded-xl p-7 pb-28 md:p-12 md:pb-32"
              style={{ "--liq-pad": "48px" } as CSSProperties}
            >
              {/* Bottom-right basin. See the block comment for the 46%
                  arithmetic and why `.orb-hand-off` rides the pool itself. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 h-[176px] w-[54%] md:h-[216px]"
              >
                <Pool light className="orb-hand-off" />
              </span>

              <p className="relative z-[1] max-w-[68ch] text-[18px] leading-[1.75] text-ink-2">
                {WHO_WE_ARE.lead}{" "}
                <strong className="font-semibold text-violet-text">
                  {WHO_WE_ARE.bold}
                </strong>{" "}
                {WHO_WE_ARE.tail}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
