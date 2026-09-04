import type { CSSProperties } from "react";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Caustic, Conduit, Node, Seam } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { HOME_SECTIONS, WHAT_WE_DO } from "@/content/home";
import { SectionHeader } from "./SectionHeader";
import { SectionProgress } from "./SectionProgress";

/**
 * Section progress (0 → 1) at which each Node's glow ramp is CENTRED. These
 * are where the Conduit band's brightest point crosses the three card centres:
 * `.conduit-scroll` moves the 38%-wide band by `-100% + sp × 360%` of its own
 * width, so its centre (≈ 52% along the band) sits at track fraction
 * 0.38·(3.6·sp − 1) + 0.20 — equal to the card centres 1/6, 1/2 and 5/6 at
 * sp ≈ 0.25, 0.50 and 0.74. A Node lights exactly as the flow reaches it.
 */
const LIT_AT = [0.25, 0.5, 0.75];

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
 * frame; `--liq-pad` 40px = the lg padding). Title `--ink-inv`, body
 * `--ink-inv-2` — tier 2 over band A composites to 4.52:1, the calibrated
 * minimum (§A6). The Node is `inset` (veil fill, no second blur) so the blur
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
                  style={{ "--lit-at": LIT_AT[i].toFixed(2) } as CSSProperties}
                />

                <div className="relative z-[1]">
                  <h3 className="heading-3 mt-6 text-ink-inv">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-inv-2">
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
