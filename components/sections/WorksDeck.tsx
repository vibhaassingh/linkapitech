import Link from "next/link";
import type { CaseStudy, CaseTone } from "@/content/cases";
import { CASES } from "@/content/cases";
import { SECTION_META } from "@/content/home";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";

const toneBg: Record<CaseTone, string> = {
  lime: "linear-gradient(135deg,#1b3a1e,#0d0d0d 72%)",
  ink: "linear-gradient(135deg,#242424,#0d0d0d 72%)",
  slate: "linear-gradient(135deg,#1c2733,#0d0d0d 72%)",
  violet: "linear-gradient(135deg,#2a1c33,#0d0d0d 72%)",
};

/**
 * Works — sticky stacked dark cards (HOMEPAGE-SECTIONS §2). Each card links to
 * its /work/[slug] page. Covers are generated tonal panels (no source imagery).
 */
export function WorksDeck() {
  const meta = SECTION_META.work;
  const total = CASES.length;

  return (
    <section id="work" className="rsec-pad border-b border-line">
      <Reveal>
        <SectionEyebrow num={meta.num} label={meta.eyebrow} end={meta.end} />
      </Reveal>
      <Reveal delay={80}>
        <MixedHeading
          plain={meta.headingPlain}
          accent={meta.headingAccent}
          className="mb-4 max-w-[20ch] text-[clamp(30px,4.5vw,56px)] leading-[1.05] tracking-tighter"
        />
        <p className="mb-14 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
          Aggregate, program-level summaries built from LinkAPI&apos;s real quantified impact —
          not confidential client case studies. {/* TODO: client to confirm — replace with real engagements. */}
        </p>
      </Reveal>

      <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
        {CASES.map((c, i) => (
          <WorkCard key={c.slug} c={c} index={i} total={total} />
        ))}
      </div>
    </section>
  );
}

function WorkCard({ c, index, total }: { c: CaseStudy; index: number; total: number }) {
  return (
    <Link
      href={`/work/${c.slug}`}
      data-cursor="view"
      className="ws-card group block"
      style={{ position: "sticky", top: `calc(86px + ${index * 18}px)` }}
    >
      <article className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-card-dark text-card-dark-ink shadow-[0_40px_90px_-60px_rgba(13,13,13,.7)]">
        <div className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6">
          <span className="text-[11px] uppercase tracking-eyebrow text-white/50">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {c.name}
          </span>
          <span className="rounded-pill bg-accent px-4 py-1.5 text-[11px] font-semibold text-ink transition-transform duration-300 group-hover:-translate-y-0.5">
            View program →
          </span>
        </div>

        <div
          className="relative aspect-[1672/941] w-full overflow-hidden"
          style={{ background: toneBg[c.tone] }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(198,251,80,.14),transparent_55%)]" />
          <span className="absolute left-6 top-6 z-10">
            <Chip variant="glass">{c.services}</Chip>
          </span>
          <span className="absolute right-6 top-6 z-10 text-[11px] uppercase tracking-eyebrow text-white/60">
            {c.year}
          </span>
          <span className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center">
            <span className="font-serif text-[clamp(28px,5vw,64px)] italic leading-tight text-white/85 transition-transform duration-700 group-hover:scale-[1.03]">
              {c.name}
            </span>
          </span>
          <Seal id={c.slug} className="absolute bottom-6 left-6 z-10 text-accent" />
        </div>

        <div className="grid gap-8 border-t border-white/10 px-6 py-8 md:grid-cols-[1.2fr_1fr] md:px-8">
          <p className="text-[clamp(15px,1.4vw,18px)] leading-relaxed text-white/85">{c.intro}</p>
          <div className="grid grid-cols-2 gap-6">
            <InfoBlock label="Scope" body={c.services} />
            <InfoBlock label="Outcome" body={`${c.outcome.stat} — ${c.outcome.statLabel}`} />
          </div>
        </div>
      </article>
    </Link>
  );
}

function InfoBlock({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-eyebrow text-white/55">{label}</span>
      <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">{body}</p>
    </div>
  );
}

function Seal({ id, className }: { id: string; className?: string }) {
  const pathId = `seal-${id}`;
  return (
    <span className={`seal ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 72 72" width="60" height="60">
        <defs>
          <path id={pathId} d="M36,36 m-26,0 a26,26 0 1,1 52,0 a26,26 0 1,1 -52,0" />
        </defs>
        <text className="seal-text">
          <textPath href={`#${pathId}`}>PROGRAM SUMMARY · PROGRAM SUMMARY · </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
    </span>
  );
}
