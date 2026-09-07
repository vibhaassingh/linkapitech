"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionProgress } from "@/components/sections/home/SectionProgress";
import { Conduit, Node } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { WHAT_WE_OFFER } from "@/content/services";
import { cn } from "@/lib/cn";

/**
 * "What We Offer" — six commitments alternating either side of a centre rail
 * with gradient number nodes (Figma page 37). Below lg the rail moves left and
 * every card sits in one column; a zig-zag at phone width just makes each card
 * half as wide for no gain.
 *
 * ── V4 (Phase 9b): THE RAIL IS A CONDUIT ──────────────────────────────────
 * The 1px `bg-lavender-300` rule becomes a light `Conduit` whose flow element
 * is a FILL growing down the channel as the reader passes —
 * /connected-banking's capabilities rail verbatim (Part J Phase 9a), which is
 * itself ProcessRail's construction. `flow="custom"` is what makes that safe:
 * the kit then emits no `conduit-*` class and declares no transform on the
 * flow element, so `scaleY(var(--fill))` is the only driver and there is
 * nothing to collide with (Part J Phase 7).
 *
 * The six number nodes become `Node`s. Their `useCentreCrossing` pop is kept
 * exactly as it was — see the Node comment for where the transform now lives.
 *
 * Motion, three independent layers:
 *
 *  1. Cards SCRUB in from their own side via `.scrub-fade-side`. That utility
 *     is declared only inside `@media (min-width: 1024px)` and only matches
 *     alongside `[data-reveal="left"|"right"]` — which is exactly what
 *     `<Reveal dir>` emits. Below lg it is completely inert, so the outward
 *     transform that once widened the document on phones cannot come back.
 *     Browsers without `animation-timeline: view()` fall through to the JS
 *     one-shot reveal that `<Reveal>` already provides.
 *
 *  2. Each number node springs up 14% while its own row straddles a 10vh band
 *     at the viewport centre, so the rail reads as a pulse travelling down the
 *     page rather than six unrelated entrances.
 *
 *  3. The rail's liquid fills from `--sp-live` across the window below.
 */

/**
 * Zero-ish-height "crossing line" at the viewport centre, expressed as an
 * IntersectionObserver root inset. 45/45 leaves a 10vh band rather than a
 * mathematically zero-height root, which gives the pulse a moment to dwell and
 * avoids relying on zero-area intersection semantics.
 */
const CENTRE_BAND = "-45% 0px -45% 0px";

/**
 * Sub-range of this section's transit that the rail fills across, and the
 * arithmetic behind it. `useSectionProgress` writes
 * `--sp = (scrollY + vh − sectionTop) / (vh + sectionHeight)`
 * (useSectionProgress.ts L64–66), so an element `d` px below the section's top
 * crosses the viewport CENTRE at `sp = (d + vh/2) / (vh + H)`.
 *
 * Unlike /connected-banking's rail — which spans its whole section, so d runs
 * 0 → H and the window is very nearly the symmetric 0.15 / 0.85 — this rail
 * starts BELOW a heading block and stops short of the bottom padding, so both
 * ends have to be derived from the real geometry:
 *
 *   above the rail  `section-pad` top = clamp(80px, 10vh, 140px)
 *                   + `display-2` = clamp(2rem, 1.1rem + 2.8vw, 3rem) × 1.12
 *                   + `mt-12` (48px) + the rail box's own `top-6` (24px)
 *   the rail        the <ol>'s height less `top-6` + `bottom-6`
 *   below it        `section-pad` bottom, the same clamp
 *
 * The six card heights are `p-6` (48px) + max(lines × 25.2px, the 40px icon
 * tile), and the line counts come from the six real `WHAT_WE_OFFER.body`
 * strings (58/58/51/74/103/36 chars) against the measured text column:
 *
 *   1440×900   pad 90, h2 53.8, rows 2/2/2/2/3/1 lines → cards
 *              98.4/98.4/98.4/98.4/123.6/88 + 5×`lg:gap-2` → <ol> ≈ 645
 *              H ≈ 927, d 216 → 813   ⇒ sp 0.364 → 0.691
 *   390×844    pad 84.4, h2 35.8, rows 3/3/3/4/5/2 lines → <ol> ≈ 952
 *              H ≈ 1205, d 192 → 1096 ⇒ sp 0.300 → 0.741
 *
 * 0.32 / 0.72 is the pair that fits both: the worst end-point error is ~11% of
 * the rail (desktop, where the fill front leads the first node and trails the
 * sixth), and ~5% on the phone. The six nodes light off their OWN centre-band
 * observer rather than off this window, so that drift costs a few points of
 * sync and nothing else — which is the whole reason the two mechanisms are
 * kept independent.
 *
 * DERIVED, NOT SAMPLED. Phase 8's `LIT_AT` and Phase 9a's 0.15 / 0.85 were
 * both wheel-scroll-sampled on the gate server and the samples recorded, and
 * Phase 7's review found a `RAIL_FROM`/`RAIL_TO` pair silently desyncing with
 * no gate assertion covering rail timing. This pair has NOT been sampled — the
 * phase that next runs a server owes it the same treatment.
 */
const RAIL_FROM = 0.32;
const RAIL_TO = 0.72;

/**
 * Fill for the rail Conduit — ProcessRail's mechanism, unchanged: the value is
 * never React state, CSS derives it from the inherited progress, so the cost
 * per frame is one custom-property write on the section.
 *
 * It reads `--sp-live`, not `--sp`, and falls back to 1. `--sp` is `0` on
 * `:root` and the hook is a deliberate no-op under reduced motion, so a
 * consumer reading `--sp` would show an EMPTY rail for reduced-motion users,
 * with JS off and before hydration. `--sp-live` is published by
 * <SectionProgress live> only once a real driver is running, so "no driver"
 * means "finished": a full spine. Content fails open.
 */
function railFillStyle(): CSSProperties {
  return {
    "--fill": `clamp(0, calc((var(--sp-live, 1) - ${RAIL_FROM.toFixed(4)}) / ${(
      RAIL_TO - RAIL_FROM
    ).toFixed(4)}), 1)`,
    transform: "scaleY(var(--fill))",
  } as CSSProperties;
}

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
    /* <SectionProgress live> replaces the plain <section>: it writes `--sp` on
       this element and publishes the `--sp-live` alias the fill reads. This
       component is already "use client", so nesting it costs nothing extra —
       the alternative was duplicating ProcessRail's publish effect here. */
    <SectionProgress
      live
      id="what-we-offer"
      className="section-pad bg-surface"
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">What We Offer</h2>
        </Reveal>

        <div className="relative mt-12">
          {/*
            The rail. `grid` on the wrapper is load-bearing — `.conduit-v` is
            `height: auto`, so a block child would collapse to 0 — and the
            wrapper is required at all because `.conduit` declares
            `position: relative; display: block` in motifs.css, which is
            emitted after Tailwind and out-ranks an `absolute` on the same
            element (Part J Phase 6).

            The 6px track is centred on the 40px Nodes, and the geometry is
            the retired rail's verbatim: below lg the Node sits at `left-0` and
            spans x ∈ [0, 40], so its centre is x = 20 and the track's is
            `left-[17px]`; at lg the Node is centred on the 50% line by a −20px
            margin and the track by −3px. Negative MARGINS, not translates —
            nothing else wants `transform` on these elements, and the pop below
            is the only transform in the composition.

            `light` because this is a white section — the track is
            `--lavender-200` with a `--line-soft` hairline, which is what the
            retired `bg-lavender-300` rule was doing, and the violet fill is
            what moves. /connected-banking's capabilities rail is the
            same construction on the same near-white ground and now carries
            `light` too — it was the one call site that had been missing it.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-[17px] top-6 grid w-1.5 lg:left-1/2 lg:-ml-[3px]"
          >
            <Conduit orientation="v" flow="custom" light>
              <span
                style={railFillStyle()}
                className="absolute inset-0 origin-top rounded-[inherit] bg-[linear-gradient(180deg,var(--lavender-400),var(--violet-500))] opacity-90"
              />
            </Conduit>
          </div>

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

                    {/*
                      The number node is a `Node` now (Part G). Three things had
                      to move, all for the same reason — `.node` declares
                      `position: relative` in motifs.css and out-ranks an
                      `absolute` utility on the same element (Part J Phase 8's
                      general rule):
                        • the placement and the centring margins are on this
                          WRAPPER, not on the Node;
                        • so is the `useCentreCrossing` pop. That is also the
                          safer home for it: `transform` and its transition sit
                          on an element the motif kit declares nothing on, so
                          the scale can never contend with a kit transform, and
                          because the wrapper is absolute the pop still cannot
                          affect layout.
                      The FILL is `--grad-tile` inline with `--ink-inv` ink —
                      `.node-light` sets `background` AND `color` in motifs.css,
                      which is emitted after globals.css and after Tailwind and
                      would win those ties, so `.grad-fill` + a text utility
                      cannot reach it (Part J Phase 7's port-bead precedent,
                      Phase 9a's hub Nodes). `light`, not glass: this is a white
                      section, and a glass disc here would be a blur layer
                      behind an opaque gradient. The `ring-[6px]` lavender halo
                      is kept — it is what lifts the node off the rail.
                    */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -mt-5 [transition:transform_var(--dur-spring-snappy)_var(--spring-snappy)] group-data-[centred=true]:scale-[1.14] lg:left-1/2 lg:-ml-5"
                    >
                      <Node
                        light
                        lit
                        size={40}
                        className="ring-[6px] ring-[color:var(--lavender-200)]"
                        style={{
                          background: "var(--grad-tile)",
                          color: "var(--ink-inv)",
                        }}
                        icon={
                          <span className="text-[13px] font-semibold">
                            {step.num}
                          </span>
                        }
                      />
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </SectionProgress>
  );
}
