import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Caustic, Droplet, Meniscus, Pool, Seam } from "@/components/motifs";
import { StatNumber } from "@/components/ui/StatNumber";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS } from "@/content/home";
import { MARQUEE_STATS, LIVE_PILL } from "@/content/stats";

/**
 * "By the Numbers" — DARK now (REDESIGN-V4 Part E §8): band C, four tier-2
 * glass tiles with a violet Pool rising under each figure, the live-integration
 * pill as a row of Droplets, and a Meniscus into ErpBand's white surface.
 * Going dark breaks the homepage's only triple-light run and gives the Pool
 * the plum it needs to glow. Figures come from content/stats.ts (Figma 2026-08).
 *
 * Tiles are `.liq liq-spec liq-static-mobile`: pointer specular masked to the
 * 24px frame (`--liq-pad` = the lg horizontal padding, `sm:px-6`) and NO
 * frost below 1024 — four blurs plus the pill nav would break §A7's phone
 * budget of 4 (desktop: 4 tiles + 2 Droplets + pill = 7 of 8). The Pool is a
 * positioned sibling of the figure, so the figure is `relative z-[1]` to paint
 * above it; it rises `scaleY(0 → 1)` +120ms after the tile's reveal fires
 * (`[data-inview] .pool`, motifs.css — RevealGroup stamps `data-reveal` /
 * `data-inview` on each tile's wrapper) and rests full, so no-JS and reduced
 * motion show the settled pool.
 *
 * INK. Numerals `--ink-inv`, affixes (`odo-fix`: the ₹, the commas, the unit)
 * `--lavender-400`, and the LABELS `--ink-inv` — not the secondary ink: they
 * overlap the Pool, and text over a Pool is `--ink-inv` only (§A6). The
 * Droplets are `.liq liq-1` over band C, where `--ink-inv-2` is allowed, so
 * their labels keep the secondary ink and only the values are `--ink-inv`.
 *
 * Odometer discipline from before still holds: each digit column is a fixed
 * 1em window and only the affixes sit in proportional boxes, so nothing here
 * changes width while the digits roll (CLS 0); the `.stat-num` clamp below
 * 480px still governs numeral width in the 2×2 phone grid. The pointer-tracked
 * violet section wash is gone — the Caustic is the ambience now (and `.liq` must
 * never share an element with that wash's class anyway).
 *
 * Shell: `.sheet-enter` + `sheet-shadow` first child (Part D i); Seam on the
 * top edge; one Caustic centred low in its own `absolute inset-0
 * overflow-hidden` clip box (the section carries no overflow-hidden, which
 * would clip the shadow's upward 40px; the box has no z-index, so the disc
 * still paints at z:-2 under the grain). Bottom edge as the hero's: a Seam
 * (the rim) directly above a Meniscus filled with ErpBand's `--surface`, both
 * in-flow inside one absolute wrapper because `.seam` is `position: relative`
 * in motifs.css. The pair is 33/57/81px tall and sits inside the section's
 * 80–140px bottom padding; the curve's crest leaves ≥ 22px of plum above the
 * white, so the Droplet row never meets the surface.
 */
export function StatBand() {
  return (
    <section
      aria-label="LinkAPI in numbers"
      className="section-dark band-c section-pad sheet-enter"
    >
      <span aria-hidden="true" className="sheet-shadow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <Seam />
      </div>
      {/* x/y are the TOP-LEFT corner: a 560px disc centred at (50%, 72%). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Caustic
          x="calc(50% - 280px)"
          y="calc(72% - 280px)"
          size="560px"
          drift="far"
        />
      </span>

      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.numbers} align="center" inverse />

        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
          step={90}
        >
          {MARQUEE_STATS.map((s) => (
            <div
              key={s.label}
              className="liq liq-spec liq-static-mobile relative isolate h-full overflow-hidden rounded-xl px-4 py-8 text-center sm:px-6"
              style={{ "--liq-pad": "24px" } as CSSProperties}
            >
              <Pool />
              <StatNumber
                stat={s}
                className="relative z-[1] h-full items-center justify-center"
                numClassName="text-ink-inv"
                affixClassName="text-lavender-400"
                labelClassName="mx-auto max-w-[24ch] text-ink-inv"
              />
            </div>
          ))}
        </RevealGroup>

        {/* LIVE_PILL as Droplets. Each fact is ONE inline span (value + label)
            so the literal space between them survives — flex items would swallow
            it — and the row wraps as two capsules on narrow viewports. */}
        <Reveal
          as="p"
          delay={160}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {LIVE_PILL.map((p) => (
            <Droplet
              key={p.label}
              className="px-4 py-2 text-[14px] text-ink-inv-2"
            >
              <span>
                <strong className="font-semibold text-ink-inv">{p.value}</strong>{" "}
                {p.label}
              </span>
            </Droplet>
          ))}
        </Reveal>
      </div>

      {/* Bottom edge: Seam (rim) over the Meniscus (ErpBand's surface, rising). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <Seam />
        <Meniscus fill="var(--surface)" />
      </div>
    </section>
  );
}
