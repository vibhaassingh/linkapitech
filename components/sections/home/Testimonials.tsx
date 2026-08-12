"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "./SectionHeader";
import { TESTIMONIALS } from "@/content/testimonials";
import { HOME_SECTIONS } from "@/content/home";
import { cn } from "@/lib/cn";

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
 */
export function Testimonials() {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(TESTIMONIALS.length - 1, i));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
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
      const d = Math.abs(c.offsetLeft - track.offsetLeft + c.clientWidth / 2 - mid);
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
            className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2"
          >
            {TESTIMONIALS.map((t) => (
              <li
                key={t.name}
                className="w-[86%] shrink-0 snap-center sm:w-[60%] lg:w-[calc((100%-40px)/3)]"
              >
                <figure className="flex h-full flex-col rounded-xl border border-line-soft bg-canvas p-7 shadow-card md:p-8">
                  <QuoteMark />
                  <blockquote className="mt-5 flex-1 text-[15.5px] italic leading-relaxed text-ink-2">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-pill grad-fill text-[13px] font-semibold text-ink-inv"
                    >
                      {t.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-semibold text-ink">{t.name}</span>
                      <span className="block text-[13.5px] text-ink-3">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200} className="mt-9 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => scrollToIndex(active - 1)}
            disabled={active === 0}
            className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-5 py-2.5 text-[14px] font-medium text-ink transition-colors duration-ui hover:border-plum-600 hover:text-plum-700 disabled:pointer-events-none disabled:opacity-40"
          >
            <Chevron dir="left" />
            Previous
          </button>

          <span className="flex items-center gap-1.5" aria-hidden="true">
            {TESTIMONIALS.map((t, i) => (
              <span
                key={t.name}
                className={cn(
                  "h-[6px] rounded-pill transition-all duration-ui",
                  i === active ? "w-5 bg-plum-600" : "w-[6px] bg-lavender-300",
                )}
              />
            ))}
          </span>

          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            disabled={active === TESTIMONIALS.length - 1}
            className="inline-flex items-center gap-2 rounded-pill bg-plum-600 px-5 py-2.5 text-[14px] font-semibold text-ink-inv transition-colors duration-ui hover:bg-violet-600 disabled:pointer-events-none disabled:opacity-40"
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
    <svg viewBox="0 0 40 30" width="40" height="30" aria-hidden="true" className="text-lavender-300">
      <path
        d="M0 30V16.5C0 7.4 5.6 1.2 15 0v6.4c-4.9 1.1-7.4 4-7.4 8.4H15V30H0Zm25 0V16.5C25 7.4 30.6 1.2 40 0v6.4c-4.9 1.1-7.4 4-7.4 8.4H40V30H25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
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
