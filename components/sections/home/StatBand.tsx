import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { StatNumber } from "@/components/ui/StatNumber";
import { HOME_SECTIONS } from "@/content/home";
import { MARQUEE_STATS, LIVE_PILL } from "@/content/stats";

/**
 * "By the Numbers" — four white count-up cards on the lavender canvas, plus
 * the live-integration pill. Figures come from content/stats.ts (Figma 2026-08).
 */
export function StatBand() {
  return (
    <section aria-label="LinkAPI in numbers" className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="text-center">
          <h2 className="display-2 text-ink">
            {HOME_SECTIONS.numbers.heading}
          </h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4"
          step={90}
        >
          {MARQUEE_STATS.map((s) => (
            <StatNumber
              key={s.label}
              stat={s}
              className="h-full items-center justify-center rounded-xl border border-line-soft bg-surface px-5 py-8 text-center shadow-card"
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
