"use client";

import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { WHAT_WE_OFFER } from "@/content/services";
import { cn } from "@/lib/cn";

/**
 * "What We Offer" — six commitments alternating either side of a centre rail
 * with gradient number nodes (Figma page 37). Below lg the rail moves left and
 * every card sits in one column; a zig-zag at phone width just makes each card
 * half as wide for no gain.
 *
 * Motion, two independent layers:
 *
 *  1. Cards SCRUB in from their own side via `.scrub-fade-side`. That utility
 *     is declared only inside `@media (min-width: 1024px)` and only matches
 *     alongside `[data-reveal="left"|"right"]` — which is exactly what
 *     `<Reveal dir>` emits. Below lg it is completely inert, so the outward
 *     transform that once widened the document on phones cannot come back.
 *     Browsers without `animation-timeline: view()` fall through to the JS
 *     one-shot reveal that `<Reveal>` already provides.
 *
 *  2. Each gradient number node springs up 14% while its own row straddles a
 *     10vh band at the viewport centre, so the rail reads as a pulse
 *     travelling down the page rather than six unrelated entrances.
 */

/**
 * Zero-ish-height "crossing line" at the viewport centre, expressed as an
 * IntersectionObserver root inset. 45/45 leaves a 10vh band rather than a
 * mathematically zero-height root, which gives the pulse a moment to dwell and
 * avoids relying on zero-area intersection semantics.
 */
const CENTRE_BAND = "-45% 0px -45% 0px";

/**
 * Which rows currently cross the centre band. One observer for all six rows;
 * state is a boolean array, so a crossing costs one render of this section and
 * nothing per frame.
 */
function useCentreCrossing(count: number) {
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [centred, setCentred] = useState<boolean[]>(() =>
    Array.from({ length: count }, () => false),
  );

  useEffect(() => {
    // REDUCED MOTION: never observe. `centred` stays all-false, so the pulse
    // class is never applied at all and every node renders at rest — nothing
    // is left mid-pose, and no observer runs.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const els = rows.current;
    const io = new IntersectionObserver(
      (entries) => {
        setCentred((prev) => {
          let next = prev;
          for (const entry of entries) {
            const i = els.indexOf(entry.target as HTMLLIElement);
            if (i < 0 || next[i] === entry.isIntersecting) continue;
            if (next === prev) next = [...prev];
            next[i] = entry.isIntersecting;
          }
          return next;
        });
      },
      { rootMargin: CENTRE_BAND, threshold: 0 },
    );
    els.forEach((el) => {
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [count]);

  return { rows, centred };
}

export function OfferTimeline() {
  const { rows, centred } = useCentreCrossing(WHAT_WE_OFFER.length);

  return (
    <section id="what-we-offer" className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">What We Offer</h2>
        </Reveal>

        <div className="relative mt-12">
          {/* rail */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[19px] top-6 w-px bg-lavender-300 lg:left-1/2"
          />

          <ol className="flex flex-col gap-8 lg:gap-2">
            {WHAT_WE_OFFER.map((step, i) => {
              const right = i % 2 === 1;
              return (
                <li
                  key={step.num}
                  ref={(el) => {
                    rows.current[i] = el;
                  }}
                  data-centred={centred[i] ? "true" : undefined}
                  className="group relative"
                >
                  {/* The number node is absolutely positioned, so it occupies no
                      grid cell — the card must be placed by explicit column,
                      since `order` has nothing in flow to swap with. */}
                  <div className="grid grid-cols-1 items-center gap-x-10 lg:grid-cols-2">
                    <Reveal
                      delay={60}
                      dir={right ? "right" : "left"}
                      className={cn(
                        // `.scrub-fade-side` needs the [data-reveal] direction
                        // attribute Reveal renders, and is itself scoped to
                        // ≥1024px in globals — inert below lg by design.
                        "scrub-fade-side pl-14 lg:pl-0",
                        right
                          ? "lg:col-start-2 lg:pl-14"
                          : "lg:col-start-1 lg:pr-14",
                      )}
                    >
                      <article
                        className={cn(
                          "relative overflow-hidden rounded-lg bg-tint p-6 shadow-card",
                          // accent edge faces the rail; the extra 8px keeps the
                          // copy clear of the 3px bar and stays on the 8-pt step
                          right ? "lg:pl-8" : "lg:pr-8",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-y-0 w-[3px] bg-plum-600",
                            right ? "left-0" : "left-0 lg:left-auto lg:right-0",
                          )}
                        />
                        <div className="flex items-start justify-between gap-5">
                          <p className="max-w-[42ch] text-[15.5px] leading-relaxed text-ink">
                            {step.body}
                          </p>
                          <span className="grad-tile grid h-10 w-10 shrink-0 place-items-center">
                            <Icon name={step.icon} size={18} />
                          </span>
                        </div>
                      </article>
                    </Reveal>

                    {/* Node — absolute so it lands on the rail regardless of row
                        height, and so its pulse can never affect layout. The
                        scale composes with the centring translate through
                        Tailwind's single composite transform. */}
                    <span
                      aria-hidden="true"
                      className="grad-fill absolute left-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-pill text-[13px] font-semibold text-ink-inv ring-[6px] ring-[color:var(--lavender-200)] [transition:transform_var(--dur-spring-snappy)_var(--spring-snappy)] group-data-[centred=true]:scale-[1.14] lg:left-1/2 lg:-translate-x-1/2"
                    >
                      {step.num}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
