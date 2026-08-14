import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { StatNumber } from "@/components/ui/StatNumber";
import { HOME_SECTIONS } from "@/content/home";
import { MARQUEE_STATS, LIVE_PILL } from "@/content/stats";

/**
 * "By the Numbers" — four white odometer cards on the lavender canvas, plus the
 * live-integration pill. Figures come from content/stats.ts (Figma 2026-08).
 *
 * The figures are per-digit odometers (<StatNumber>): each digit column is a
 * fixed 1em window and only the ₹ prefix, the commas and the unit suffix sit in
 * static proportional boxes, so nothing in this band changes width while the
 * digits roll — the four-up cannot reflow and its CLS contribution is zero.
 * That is also why the cards are only ever styled here through padding and the
 * `h-full` stretch: giving a card a width that depends on its numeral would
 * hand the roll a way to move layout.
 *
 * `ambient-violet` adds the pointer-tracked violet section wash (it is disabled
 * on coarse pointers and under reduced motion in globals.css, so it costs
 * nothing where it cannot be seen).
 *
 * Rhythm: heading → cards = mt-12 (48), cards → pill = mt-10 (40), card padding
 * px-6/py-8 (24/32), gaps 16/24 — all on the 8-pt scale.
 */
export function StatBand() {
  return (
    <section
      aria-label="LinkAPI in numbers"
      className="section-pad ambient-violet bg-canvas"
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="text-center">
          <h2 className="display-2 text-ink">
            {HOME_SECTIONS.numbers.heading}
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
          step={90}
        >
          {MARQUEE_STATS.map((s) => (
            <StatNumber
              key={s.label}
              stat={s}
              className="h-full items-center justify-center rounded-xl border border-line-soft bg-surface px-3 py-8 text-center shadow-card sm:px-6"
              numClassName="!text-violet-text"
              labelClassName="mx-auto max-w-[24ch] text-ink-2"
            />
          ))}
        </RevealGroup>

        <Reveal delay={160} className="mt-10 flex justify-center">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-7 gap-y-1 rounded-pill grad-fill px-7 py-3 text-ink-inv">
            {LIVE_PILL.map((p) => (
              <span key={p.label} className="text-[14px]">
                <strong className="font-semibold">{p.value}</strong>{" "}
                <span className="text-ink-on-violet-2">{p.label}</span>
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
