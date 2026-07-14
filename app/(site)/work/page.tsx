import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { CASES, TONE_BG } from "@/content/cases";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = pageMetadata({
  title: "Work | Program Summaries — LinkAPI Tech",
  description:
    "Aggregate, program-level summaries of LinkAPI Tech's BFSI API integration, reconciliation, portal, and infrastructure work.",
  path: "/work",
});

export default function WorkIndexPage() {
  return (
    <section className="rsec-pad">
      <Reveal>
        <SectionEyebrow num="—" label="Selected work" end="Aggregate program summaries" />
      </Reveal>
      <Reveal delay={80}>
        <MixedHeading
          as="h1"
          plain="Programs behind the"
          accent="numbers."
          className="mt-8 max-w-[20ch] text-[clamp(34px,5.5vw,72px)] leading-[1.02] tracking-tighter"
        />
        <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
          These are aggregate, program-level summaries built from LinkAPI&apos;s real quantified
          impact — not confidential client case studies.
          {/* TODO: client to confirm — replace with real per-engagement narratives. */}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {CASES.map((c, i) => (
          <Reveal key={c.slug} delay={i * 80}>
            <Link
              href={`/work/${c.slug}`}
              className="group block overflow-hidden rounded-[24px] border border-line"
            >
              <div className="relative aspect-[16/10] w-full" style={{ background: TONE_BG[c.tone] }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,166,197,.16),transparent_55%)]" />
                <span className="absolute left-5 top-5">
                  <Chip variant="glass">{c.industry}</Chip>
                </span>
                <span className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
                  <span className="font-serif text-[clamp(24px,4vw,40px)] italic text-white/85 transition-transform duration-500 group-hover:scale-[1.03]">
                    {c.name}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <div>
                  <div className="text-[13px] text-ink-2">{c.services}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-eyebrow text-ink-3">
                    {c.outcome.stat} · {c.outcome.statLabel}
                  </div>
                </div>
                <span className="text-[13px] font-medium text-ink transition-transform duration-300 group-hover:translate-x-1">
                  View →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
