import Link from "next/link";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionHeader } from "./SectionHeader";
import { CASES } from "@/content/cases";
import { HOME_SECTIONS } from "@/content/home";

/**
 * Work — the four aggregate program summaries, 2×2. The "Program summary"
 * kicker stays: it is the honesty device that keeps these distinct from
 * client-specific case studies.
 */
export function CaseGrid() {
  return (
    <section id="work" className="section-pad border-t border-line-soft">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader meta={HOME_SECTIONS.work} />
          <Link
            href="/work"
            className="mb-2 inline-flex items-center gap-2 text-[14.5px] font-medium text-navy-600 transition-colors duration-ui hover:text-navy-900"
          >
            All work <span aria-hidden="true">→</span>
          </Link>
        </div>

        <RevealGroup className="mt-14 grid gap-5 md:grid-cols-2" step={80}>
          {CASES.map((c) => {
            const lead = c.stats[0];
            return (
              <Link
                key={c.slug}
                href={`/work/${c.slug}`}
                className="group flex flex-col justify-between rounded-md border border-line bg-surface p-8 shadow-card transition-all duration-ui hover:-translate-y-0.5 hover:border-steel md:p-10"
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                    {c.kicker} · {c.year}
                  </p>
                  <h3 className="heading-3 mt-4 text-ink">{c.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-3">{c.intro}</p>
                </div>
                <div className="mt-8 flex items-end justify-between gap-4 border-t border-line-soft pt-6">
                  {lead && (
                    <div>
                      <p className="font-display text-3xl font-semibold tnum text-navy-900">
                        {lead.num}
                      </p>
                      <p className="mt-1 text-[12.5px] text-ink-3">{lead.label}</p>
                    </div>
                  )}
                  <span className="inline-flex items-center gap-2 text-[13.5px] font-medium text-navy-600 transition-colors duration-ui group-hover:text-navy-900">
                    View program <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
