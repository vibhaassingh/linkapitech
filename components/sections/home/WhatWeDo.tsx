import type { CSSProperties } from "react";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Caustic, Conduit, Node, Seam } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { HOME_SECTIONS, WHAT_WE_DO } from "@/content/home";
import { SectionHeader } from "./SectionHeader";
import { SectionProgress } from "./SectionProgress";

/**
 * Section progress (0 → 1) at which card `i` of `n`'s Node glow ramp is
 * CENTRED. `.conduit-scroll` moves the 38%-wide band by `-100% + sp × 360%` of
 * its own width, so its centre (≈ 52% along the band) sits at track fraction
 * `f = 0.38·(3.6·sp − 1) + 0.20`. Inverting that at card centre
 * `f = (i + 0.5) / n` gives the sp at which the flow arrives:
 *
 *     sp = (((i + 0.5)/n − 0.20) / 0.38 + 1) / 3.6
 *
 * DERIVED, NOT TABULATED, and that is a fix rather than a tidy-up: this was a
 * hardcoded three-element array indexed by `WHAT_WE_DO`'s length, so a fourth
 * content entry — a one-line edit in `content/home.ts`, by someone who has no
 * reason to open this file — made `LIT_AT[3].toFixed(2)` throw and took the
 * whole homepage down at render. Nothing typechecked it (TS gives `number[]`
 * an unchecked index) and no gate step covers a content shape that does not
 * exist yet.
 *
 * At n = 3 this yields 0.2534 / 0.4971 / 0.7407 → "0.25" / "0.50" / "0.74".
 * Cards 1 and 2 are byte-identical to the array they replace; card 3 moves
 * 0.75 → 0.74, i.e. the array was the outlier — the doc comment above it has
 * said "sp ≈ 0.25, 0.50 and 0.74" since Phase 6 and the true value is 0.7407.
 * The consequence is one hundredth of section progress, about a fifth of
 * `.node-flow`'s own ±0.04 ramp, in the direction that puts the glow back on
 * the band it is supposed to be tracking.
 */
const litAt = (i: number, n: number) =>
  (((i + 0.5) / n - 0.2) / 0.38 + 1) / 3.6;

/**
 * "What We Do" — the MANIFOLD (REDESIGN-V4 Part E §4): one Conduit runs the
 * container width at ~35% height BEHIND three glass cards, so the pipe money
 * travels is seen through the vessels (blurred by their frost) and crisp in
 * the gaps between them. The band crosses all three cards as the section's
 * `--sp` goes 0 → 1, and each card's Node lights in sequence as it passes.
 *
 * `--sp` is written by <SectionProgress> (the section element, a one-hook
 * client wrapper — see that file for why the section itself stays a server
 * component). The Conduit reads it directly (decoration fails closed: no
 * driver = band parked off-track) and the Nodes read it through the
 * `.node-flow` rule in motifs.css — `opacity: clamp(.35, …, 1)` with a
 * per-node `--lit-at`. That is a static computed value, not an animation, so
 * there is nothing for the composited audit to see and no JS per element;
 * reduced motion re-lights every Node by name in the motifs RM block.
 *
 * Cards are tier-2 `.liq liq-spec` (pointer specular masked to the padding
 * frame; `--liq-pad` 40px = the lg padding). Title AND body are `--ink-inv`:
 * tier 2 over band A composites to 4.52:1 for `--ink-inv-2`, the calibrated
 * minimum (§A6) — and this section's Caustic sits behind the third card,
 * which takes it to 4.00. See the call site for the arithmetic and for why
 * moving the disc is not an available fix. The Node is `inset` (veil fill, no second blur) so the blur
 * count stays at 3 cards + pill. The `num` is a `ghost-num` watermark bottom-
 * right in its OWN `scrub-drift drift-far` wrapper: `.ghost-num` already
 * transitions its own `transform` on reveal (globals.css), and two transform
 * drivers cannot share an element. The card reserves its bottom padding for
 * the numeral so the body copy never runs under the .55-white gradient.
 *
 * Mobile: cards stack and the Conduit becomes a vertical track in the LEFT
 * GUTTER (centred in the container's px-6 / md:px-10 padding). Both tracks
 * render — one `hidden lg:block`, one `lg:hidden` — on wrappers, because
 * `.conduit` declares `position: relative; display: block` after Tailwind and
 * would out-rank `absolute` / `hidden` on its own element. The vertical
 * wrapper is `grid` so `.conduit-v`'s `height: auto` stretches to the stage.
 *
 * `.sheet-enter` presents the band like a sheet arriving over the light canvas
 * above; the `sheet-shadow` first child is the shadow it casts upward (Part D
 * i). The section carries NO overflow-hidden — that would clip the shadow's
 * 40px — so the Caustic sits in its own `absolute inset-0 overflow-hidden`
 * clip box instead (no z-index, so the disc still paints at z:-2 inside the
 * `.section-dark` stacking context, under the grain). `.seam` is
 * `position: relative` in motifs.css, hence its own absolute wrapper too.
 */
export function WhatWeDo() {
  return (
    <SectionProgress className="section-dark band-a section-pad sheet-enter">
      <span aria-hidden="true" className="sheet-shadow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <Seam />
      </div>
      {/* Caustic clip box (see the note above). x/y are the TOP-LEFT corner:
          a 480px disc centred at (78%, 42%) of the band, behind the third card. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Caustic
          x="calc(78% - 240px)"
          y="calc(42% - 240px)"
          size="480px"
          drift="mid"
        />
      </span>

      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.what} inverse />

        {/* The stage: the Conduit is positioned against this box, the cards sit
            above it (z-[1]). */}
        <div className="relative mt-12">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[35%] z-0 hidden lg:block"
          >
            <Conduit flow="scroll" />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-y-0 -left-[15px] z-0 grid md:-left-[23px] lg:hidden"
          >
            <Conduit orientation="v" flow="scroll" />
          </div>

          <RevealGroup
            className="relative z-[1] grid grid-cols-1 gap-6 lg:grid-cols-3"
            step={110}
          >
            {WHAT_WE_DO.map((p, i) => (
              <article
                key={p.num}
                className="liq liq-spec relative isolate h-full overflow-hidden rounded-xl p-8 pb-20 lg:p-10 lg:pb-[88px]"
                style={{ "--liq-pad": "40px" } as CSSProperties}
              >
                <Node
                  inset
                  size={48}
                  icon={<Icon name={p.icon} size={22} />}
                  className="node-flow"
                  style={
                    {
                      "--lit-at": litAt(i, WHAT_WE_DO.length).toFixed(2),
                    } as CSSProperties
                  }
                />

                <div className="relative z-[1]">
                  <h3 className="heading-3 mt-6 text-ink-inv">{p.title}</h3>
                  {/* BODY IS `--ink-inv`, NOT `--ink-inv-2` — the Caustic is
                      why (V4 Phase 6 review, fixed in Phase 9b). A `.caustic`
                      is a SIBLING overlay, so the contrast walk composites the
                      band and the glass and never sees it; hand-computed on
                      the walk's own model, `--ink-inv-2` on tier 2 over band A
                      is 4.52 flat and 4.00 with a full `--violet-a24` core
                      beneath — a real AA failure that reports green.
                      Geometry cannot fix it: tier 2's headroom is 0.02, so the
                      largest core alpha this ink survives is 0.0104, i.e. the
                      disc's gradient must be at LITERAL zero over every run,
                      which means its whole 70%-radius influence circle clears
                      every card at every breakpoint. Below lg the three cards
                      stack full-bleed and the disc lands on whichever one sits
                      at 42% of a much taller section, so no placement can
                      promise that — /industries' dark mocks hit the identical
                      wall in Phase 9a and took the identical exit. `--ink-inv`
                      measures 7.36 flat and 6.51 over a full core; hierarchy
                      comes from `heading-3` vs 15px regular instead. */}
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-inv">
                    {p.body}
                  </p>
                </div>

                {/* Watermark numeral. The drift lives on this wrapper, the
                    reveal settle on .ghost-num itself (see the note above).
                    `block` so the settle transform applies (inline boxes do
                    not transform). */}
                <span
                  aria-hidden="true"
                  className="scrub-drift drift-far pointer-events-none absolute -bottom-2 right-6 select-none"
                >
                  <span className="ghost-num block text-[72px]">{p.num}</span>
                </span>
              </article>
            ))}
          </RevealGroup>
        </div>
      </div>
    </SectionProgress>
  );
}
