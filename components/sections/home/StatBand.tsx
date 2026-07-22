import { RevealGroup } from "@/components/motion/RevealGroup";
import { StatNumber } from "@/components/ui/StatNumber";
import { MARQUEE_STATS } from "@/content/stats";

/**
 * Aggregate outcome band — the four defensible headline numbers. Aggregate by
 * design: no figure is attributed to a named bank (content-truth rule).
 */
export function StatBand() {
  return (
    <section aria-label="LinkAPI in numbers" className="border-b border-line-soft">
      <RevealGroup
        className="mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4 md:px-10 md:py-16"
        step={90}
      >
        {MARQUEE_STATS.map((s) => (
          <StatNumber
            key={s.label}
            stat={s}
            className="border-line-soft px-2 text-center md:border-l md:first:border-l-0"
            labelClassName="mx-auto max-w-[22ch]"
          />
        ))}
      </RevealGroup>
    </section>
  );
}
