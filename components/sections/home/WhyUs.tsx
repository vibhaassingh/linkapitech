import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Conduit, Node } from "@/components/motifs";
import { HOME_SECTIONS, WHY_US } from "@/content/home";
import { cn } from "@/lib/cn";
import { SectionProgress } from "./SectionProgress";

/**
 * Section progress (0 → 1) at which each spine Node's glow ramp is CENTRED.
 *
 * Same arithmetic as WhatWeDo's manifold (Part J, Phase 6): a
 * `.conduit-scroll` flow band is 38% of the track and translates
 * `-100% + sp × 360%` of its own length, so its brightest point (≈52% along
 * the band) sits at track fraction `0.38·(3.6·sp − 1) + 0.20`. Four rows put
 * their centres at 1/8, 3/8, 5/8 and 7/8 of the track, which inverts to
 * sp ≈ 0.223 / 0.406 / 0.588 / 0.771 — so each Node lights exactly as the
 * flow front reaches it, which is the whole read (liquid arriving at an
 * endpoint), not a generic fade-in.
 *
 * The 1/8-step centres assume four rows of equal height; the real rows differ
 * by a line or two of copy, so a Node can light a few hundredths of progress
 * early or late. `.node-flow`'s ramp is ±0.04 wide, which absorbs that, and
 * the whole thing is decoration.
 */
const LIT_AT = [0.22, 0.41, 0.59, 0.77];

/**
 * "Why LinkAPI Tech" — four zig-zag rows down a liquid spine (Part E §7).
 *
 * THE SPINE. One vertical light `Conduit` runs the full height of the rows
 * block: at the left gutter below lg, dead centre (`lg:left-1/2`) from lg up,
 * where it sits inside the two-column grid's own gap and can never cross a
 * text run. Its flow band tracks `--sp`, written by <SectionProgress> — the
 * one-hook client `<section>` wrapper, so this file stays a server component
 * (Part J, Phase 6: the alternative ships content/home.ts and the motif kit to
 * the browser for one effect). Decoration fails CLOSED: with no driver
 * (reduced motion, no JS) `--sp` keeps its `:root` 0 and the band parks
 * off-track, invisible.
 *
 * Four 12px light `Node`s sit ON the spine, one per row — `node node-light`,
 * no glass and no blur, so this section costs nothing against §A7. Each
 * carries `.node-flow` + an inline `--lit-at`, the CSS-only sequencing from
 * Phase 6 (a static computed `clamp()` that tracks `--sp`, not an animation —
 * nothing for the composited audit to see, no JS per element). Reduced motion
 * re-lights all four by name in motifs.css's RM block.
 *
 * A Node lives INSIDE its row rather than at a fixed percentage of the spine,
 * so it stays vertically centred on the row whatever the copy wraps to. It
 * needs a positioning wrapper: `.node` declares `position: relative` in
 * motifs.css, which is emitted after Tailwind and out-ranks an `absolute`
 * utility on the same element (the general form of the Seam/Conduit rule).
 * Both offsets use negative margins rather than a translate — nothing else
 * wants `transform` here, but keeping the motifs transform-free is the house
 * rule that stops cascade collisions before they start.
 *
 * ROW ENTRANCE — AND WHY THE REVEAL IS NOT ON THE ROW. Rows alternate their
 * entry side (`Reveal dir="left|right"` plus `.scrub-fade-side`, both
 * declared ≥1024 only in globals.css, so phones get the plain vertical rise).
 * The revealed element is the INNER GRID, not the full-bleed `<article>`: an
 * outward ±32px translate on a viewport-wide box pushes past the edge and
 * widens the document, which is the exact bug the ≥1024 gate exists for. The
 * grid's box is the container's CONTENT width (viewport − 80px at md+), so at
 * 1024 it has 40px of slack on each side and ±32px stays inside. The
 * `<article>` keeps the alternating band tint and the hairline borders.
 *
 * GHOST NUMERALS. `.ghost-num` already owns a `transform` transition (its
 * one-shot reveal settle, globals.css), and two transform drivers cannot share
 * an element — so the continuous `scrub-drift drift-mid` (±14px, halved below
 * 1024) rides a WRAPPER and `.ghost-num` sits on an inner `block` span. The
 * wrapper is a flex item, so its display is blockified and it can transform.
 * Where `view()` timelines are unsupported the drift class is inert and the
 * original settle still plays.
 */
export function WhyUs() {
  return (
    <SectionProgress className="bg-surface pt-[clamp(80px,10vh,140px)]">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">{HOME_SECTIONS.why.heading}</h2>
        </Reveal>
      </div>

      {/* The rows block is the spine's track: `inset-y-0` spans all four rows,
          so the `--sp` → track-fraction arithmetic above is measured against
          exactly the box the Nodes sit in. `grid` on the wrapper is
          load-bearing — `.conduit-v` is `height: auto`, so a block child would
          collapse to zero. Left gutter centres: px-6 → 12px, px-10 → 20px,
          less half the 6px track. */}
      <div className="relative mt-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[9px] z-0 grid w-1.5 md:left-[17px] lg:left-1/2 lg:-ml-[3px]"
        >
          <Conduit orientation="v" flow="scroll" light />
        </div>

        {WHY_US.map((row, i) => {
          const mirrored = i % 2 === 1;
          return (
            <article
              key={row.num}
              className={cn(
                "border-t border-line-soft",
                i % 2 === 0 ? "bg-canvas" : "bg-surface",
                i === WHY_US.length - 1 && "border-b",
              )}
            >
              <div className="relative mx-auto w-full max-w-[1240px] px-6 md:px-10">
                {/* On the spine, centred on this row: `left` is the spine's
                    own centre (12 / 20px gutter, 50% from lg) and the −6px
                    margins recentre the 12px disc on it. `.node` needs a
                    positioning wrapper. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 z-[1] -ml-1.5 -mt-1.5 md:left-5 lg:left-1/2"
                >
                  <Node
                    light
                    size={12}
                    className="node-flow"
                    style={{ "--lit-at": LIT_AT[i].toFixed(2) } as CSSProperties}
                  />
                </span>

                <Reveal
                  dir={mirrored ? "right" : "left"}
                  className="scrub-fade-side grid grid-cols-1 items-center gap-x-8 gap-y-4 py-12 md:grid-cols-2 md:py-14"
                >
                  <div
                    className={cn(
                      "flex items-center gap-6",
                      mirrored && "md:order-2 md:flex-row-reverse md:text-right",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="scrub-drift drift-mid pointer-events-none select-none"
                    >
                      <span className="ghost-num block text-[52px] md:text-[64px]">
                        {row.num}
                      </span>
                    </span>
                    <h3 className="text-[19px] font-semibold leading-snug text-ink md:text-[21px]">
                      {row.title}
                    </h3>
                  </div>

                  <p
                    className={cn(
                      "max-w-[54ch] text-[15.5px] leading-relaxed text-ink-2",
                      mirrored && "md:order-1 md:justify-self-end md:text-right",
                    )}
                  >
                    {row.body}
                  </p>
                </Reveal>
              </div>
            </article>
          );
        })}
      </div>
    </SectionProgress>
  );
}
