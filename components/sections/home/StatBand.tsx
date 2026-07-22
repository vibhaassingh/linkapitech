import { RevealGroup } from "@/components/motion/RevealGroup";
import { StatNumber } from "@/components/ui/StatNumber";
import { StatFlow } from "./StatFlow";
import { MARQUEE_STATS } from "@/content/stats";

/**
 * Aggregate outcome band — the four defensible headline numbers. Aggregate by
 * design: no figure is attributed to a named bank (content-truth rule).
 * Four-up only from lg, so the widest figure keeps its own line.
 */
export function StatBand() {
  return (
    <section
      aria-label="LinkAPI in numbers"
      className="ambient-violet relative overflow-hidden border-b border-line-soft"
    >
      <StatFlow />
      <RevealGroup
        className="relative z-[1] mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 md:px-10 md:py-16 lg:grid-cols-4"
        step={90}
      >
        {MARQUEE_STATS.map((s) => (
          <StatNumber
            key={s.label}
            stat={s}
            className="min-w-0 items-center border-line-soft px-2 text-center lg:border-l lg:first:border-l-0"
            labelClassName="mx-auto max-w-[22ch]"
          />
        ))}
      </RevealGroup>
    </section>
  );
}
