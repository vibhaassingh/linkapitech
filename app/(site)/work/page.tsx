import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { CASES } from "@/content/cases";
import { PageHero } from "@/components/sections/PageHero";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { CASE_TONES } from "@/components/sections/work/caseToneStyles";

export const metadata = pageMetadata({
  title: "Work | Program Summaries — LinkAPI Tech",
  description:
    "Aggregate, program-level summaries of LinkAPI Tech's BFSI API integration, reconciliation, portal, and infrastructure work.",
  path: "/work",
});

export default function WorkIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="Programs behind the numbers."
        lead="Aggregate, program-level summaries built from LinkAPI's real quantified impact — not confidential client case studies."
        /* TODO: client to confirm — replace with real per-engagement narratives. */
      />

      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 md:px-10">
        <RevealGroup className="grid gap-5 md:grid-cols-2" step={80}>
          {CASES.map((c) => {
            const tone = CASE_TONES[c.tone];
            const lead = c.stats[0];
            return (
              <Link
                key={c.slug}
                href={`/work/${c.slug}`}
                className="group flex flex-col justify-between rounded-md border border-line bg-surface shadow-card transition-all duration-ui hover:-translate-y-0.5 hover:border-steel"
              >
                <div className="rounded-t-md p-8 md:p-10" style={{ background: tone.bg }}>
                  <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                    {c.kicker} · {c.industry}
                  </p>
                  <h2 className="heading-3 mt-4 text-ink">{c.name}</h2>
                  <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-2">{c.intro}</p>
                </div>
                <div className="flex items-end justify-between gap-4 p-8 pt-6 md:px-10">
                  {lead && (
                    <div>
                      <p className="font-display text-3xl font-semibold tnum" style={{ color: tone.accent }}>
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
      </section>
    </>
  );
}
