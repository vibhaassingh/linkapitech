"use client";

import { useRef, useState, type CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Pool } from "@/components/motifs";
import { SectionHeader } from "./SectionHeader";
import { TESTIMONIALS } from "@/content/testimonials";
import { HOME_SECTIONS } from "@/content/home";
import { cn } from "@/lib/cn";

const SPRING_SNAPPY = "var(--spring-snappy, cubic-bezier(0.34,1.56,0.64,1))";
const DUR_SNAPPY = "var(--dur-spring-snappy, 350ms)";

/**
 * Dot morph. The active pill is the only one that widens, so the row's total
 * width is constant whichever dot is active — the Previous/Next buttons never
 * move, and the ~0.5px the spring overshoots past 20px is absorbed inside the
 * row. Retimed from `transition-all duration-ui` so the morph springs.
 */
const DOT_SPRING: CSSProperties = {
  transitionProperty: "width, background-color",
  transitionDuration: DUR_SNAPPY,
  transitionTimingFunction: SPRING_SNAPPY,
};

/**
 * Press feedback: transform springs, colours stay on the 200ms UI ramp (a
 * 350ms spring on a hover colour reads sluggish).
 */
const PRESS_SPRING: CSSProperties = {
  transition:
    `transform ${DUR_SNAPPY} ${SPRING_SNAPPY},` +
    " color var(--dur-ui, 200ms) ease, background-color var(--dur-ui, 200ms) ease," +
    " border-color var(--dur-ui, 200ms) ease, box-shadow var(--dur-ui, 200ms) ease",
};

/**
 * Client-stories carousel.
 *
 * Quotes are LinkAPI's three real testimonials. The Figma's cards named
 * specific executives at named banks with five-star ratings; those read as
 * designer placeholders, so they are not shipped — and no rating is invented.
 * TODO: client to confirm — supply attributable roles/companies (and ratings,
 * if any are real) to replace the generic "Customer" role.
 *
 * Mechanics: a scroll-snap track, so touch/trackpad swiping is native and the
 * arrows just nudge scrollLeft. Cards stay in the DOM and in tab order.
 *
 * Depth: each card carries B0's `.card-depth`, whose own `view(x)` timeline
 * scales/fades it by its position in the track — the centred card sits at
 * scale 1, its neighbours recede. No JS drives it, so swipe, arrow and
 * keyboard scrolling all get the same treatment for free, and the whole effect
 * is behind `@supports (animation-timeline: view())` and reduced-motion-safe by
 * B0's definition. Transforms do not affect `offsetLeft`/`clientWidth`, so the
 * scroll maths below is unchanged by it.
 *
 * `overscroll-x-contain` adds the iOS rubber-band stop at the track ends: the
 * bounce is absorbed here instead of chaining to the page/back-gesture.
 *
 * V4 (Phase 8) — the cards become light glass Vessels (Part E row 11). The
 * snap track, `.card-depth`, the sprung dot morph and the press springs are
 * all unchanged; what changed is the material and one motif.
 *
 * MATERIAL. `.liq liq-light` (tier 2, .70 white) at radius 20 with
 * `.liq-spec` — the pointer specular masked to the padding frame, `--liq-pad`
 * 32px = the `md:p-8` padding exactly (it is `display: none` below 1024 and on
 * coarse pointers, so the mobile `p-7` never has to match). The flat
 * `border-line-soft` and `shadow-card` are gone: on `.liq` the rim ring IS the
 * border and `--liq-light-shadow` is the elevation (§A2, Part J Phase 2). Ink:
 * `--ink` for the name, `--ink-2` for the quote, `--ink-3` for the role —
 * `--ink-3` is legal from `.liq-light` TIER 2 up (§A6 puts it at 4.56; over
 * this section's `--surface` it measures 5.41:1) and is forbidden only on
 * `.liq-light.liq-1`, which these cards are not. The monogram keeps
 * `grad-fill`: one saturated point per card.
 *
 * `liq-flat` — no backdrop-filter at any size — and here that is CORRECTNESS,
 * not just the §A7 budget. `.card-depth`'s keyframes animate `opacity`
 * (0.75 → 1 → 0.75, `both`, so an off-centre card RESTS at 0.75), and an
 * ancestor with opacity < 1 is a backdrop root in Chromium: the frost inside
 * it would sample an empty backdrop for all but the one perfectly centred
 * card. On top of that the track sits on a flat `--surface` (#ffffff), where a
 * blur of a constant field is that constant and `saturate(1.15)` of an
 * achromatic white is white — so the frost was provably zero pixels of
 * difference before `.card-depth` even got to it. The glass still reads: rim
 * ring, wet edge and shadow are what draw it.
 *
 * THE POOL. A faint light Pool per card, in the reserved bottom padding.
 * `.pool` is `inset: auto 0 0 0; height: 46%` of a positioned parent, so a
 * 120px box gives a 55.2px basin (measured) and `pb-20` (80px) reserves the
 * room — the basin clears the figcaption by ~25px. `pb-16` also cleared it,
 * by 8.8px, but `.pool::before`'s 1px lavender meniscus line then read as an
 * underline under the role rather than as a liquid surface. That clearance is
 * the point either way: §A6
 * allows only `--ink` over a light Pool, and the role line is `--ink-3`, so
 * the pool is kept geometrically off the text rather than recoloured. It is
 * FIRST in DOM and the copy carries `relative z-[1]`, because `.pool` is
 * positioned with no z-index and would otherwise paint over in-flow text.
 * The basin rises with the card's `Reveal` (motifs.css `[data-inview] .pool`)
 * and rests full, so reduced motion and no-JS both show the settled pool.
 */
export function Testimonials() {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(TESTIMONIALS.length - 1, i));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card)
      track.scrollTo({
        left: card.offsetLeft - track.offsetLeft,
        behavior: "smooth",
      });
    setActive(clamped);
  };

  // Keep the dots honest when the user swipes instead of using the buttons.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const mid = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(
        c.offsetLeft - track.offsetLeft + c.clientWidth / 2 - mid,
      );
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setActive(nearest);
  };

  return (
    <section className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.voices} align="center" />

        <Reveal delay={140}>
          <ul
            ref={trackRef}
            onScroll={onScroll}
            className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-2"
          >
            {TESTIMONIALS.map((t) => (
              <li
                key={t.name}
                className="card-depth w-[86%] shrink-0 snap-center sm:w-[60%] lg:w-[calc((100%-40px)/3)]"
              >
                <figure
                  className="liq liq-light liq-flat liq-spec relative isolate flex h-full flex-col overflow-hidden rounded-lg p-7 pb-20 md:p-8 md:pb-20"
                  style={{ "--liq-pad": "32px" } as CSSProperties}
                >
                  {/* Basin in the reserved bottom padding — see the block
                      comment for the 46% arithmetic and the §A6 clearance. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px]"
                  >
                    <Pool light />
                  </span>

                  <QuoteMark />
                  <blockquote className="relative z-[1] mt-5 flex-1 text-[15.5px] italic leading-relaxed text-ink-2">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="relative z-[1] mt-7 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-pill grad-fill text-[13px] font-semibold text-ink-inv"
                    >
                      {t.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-ink">
                        {t.name}
                      </span>
                      <span className="block text-[13.5px] text-ink-3">
                        {t.role}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delay={200}
          className="mt-9 flex items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => scrollToIndex(active - 1)}
            disabled={active === 0}
            style={PRESS_SPRING}
            className="inline-flex scale-100 items-center gap-2 rounded-pill border border-line bg-surface px-5 py-2.5 text-[14px] font-medium text-ink hover:border-plum-600 hover:text-plum-700 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          >
            <Chevron dir="left" />
            Previous
          </button>

          <span className="flex items-center gap-1.5" aria-hidden="true">
            {TESTIMONIALS.map((t, i) => (
              <span
                key={t.name}
                style={DOT_SPRING}
                className={cn(
                  "h-[6px] rounded-pill",
                  i === active ? "w-5 bg-plum-600" : "w-[6px] bg-lavender-300",
                )}
              />
            ))}
          </span>

          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            disabled={active === TESTIMONIALS.length - 1}
            style={PRESS_SPRING}
            className="inline-flex scale-100 items-center gap-2 rounded-pill bg-plum-600 px-5 py-2.5 text-[14px] font-semibold text-ink-inv hover:bg-violet-600 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          >
            Next
            <Chevron dir="right" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function QuoteMark() {
  return (
    <svg
      viewBox="0 0 40 30"
      width="40"
      height="30"
      aria-hidden="true"
      className="relative z-[1] text-lavender-300"
    >
      <path
        d="M0 30V16.5C0 7.4 5.6 1.2 15 0v6.4c-4.9 1.1-7.4 4-7.4 8.4H15V30H0Zm25 0V16.5C25 7.4 30.6 1.2 40 0v6.4c-4.9 1.1-7.4 4-7.4 8.4H40V30H25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={dir === "left" ? "M14 6l-6 6 6 6" : "M10 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
