import Link from "next/link";
import { notFound } from "next/navigation";
import type { CaseBlock } from "@/content/cases";
import { CASES, CASE_SLUGS, getCase } from "@/content/cases";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { CASE_TONES } from "@/components/sections/work/caseToneStyles";

export function generateStaticParams() {
  return CASE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name} | LinkAPI Tech`,
    description: c.intro,
    path: `/work/${c.slug}`,
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  const tone = CASE_TONES[c.tone];
  const related = CASES.filter((x) => x.slug !== c.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: c.name,
        about: c.industry,
        description: c.intro,
        creator: { "@type": "Organization", name: SITE.legalName },
        url: `${SITE.url}/work/${c.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Work", item: `${SITE.url}/work` },
          { "@type": "ListItem", position: 2, name: c.name, item: `${SITE.url}/work/${c.slug}` },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto w-full max-w-[1240px] px-6 pb-24 pt-[clamp(40px,6vh,64px)] md:px-10">
      <JsonLd data={jsonLd} />

      <Link
        href="/work"
        className="text-[13.5px] font-medium text-navy-600 transition-colors duration-ui hover:text-navy-900"
      >
        ← All work
      </Link>

      {/* Header */}
      <header className="mt-8 border-b border-line-soft pb-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-eyebrow text-steel">
            {c.kicker} · {c.year}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="display-2 mt-4 max-w-[24ch] text-ink">{c.name}</h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="body-lg mt-6 max-w-[62ch] text-ink-2">{c.intro}</p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip>{c.industry}</Chip>
            <Chip variant="outline">{c.services}</Chip>
          </div>
        </Reveal>
      </header>

      {/* Aggregate disclaimer — the honesty device */}
      <p className="mt-8 rounded-md border border-line bg-surface-2 px-5 py-4 text-[13px] leading-relaxed text-ink-2">
        This is an aggregate, program-level summary built from LinkAPI&apos;s real quantified
        impact, not a confidential client case study.
        {/* TODO: client to confirm — replace with a real per-engagement narrative. */}
      </p>

      {/* Meta row */}
      <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line-soft py-8 md:grid-cols-4">
        <Meta label="Industry" value={c.industry} />
        <Meta label="Services" value={c.services} />
        <Meta label="Timeline" value={c.timeline} />
        <Meta label="Role" value={c.role} />
      </dl>

      {/* Challenge / Approach / Outcome */}
      <RevealGroup className="mt-12 grid gap-5 lg:grid-cols-3" step={90}>
        {[c.challenge, c.solution, c.outcome].map((block: CaseBlock) => (
          <div key={block.heading} className="rounded-md p-8" style={{ background: tone.bg }}>
            <h2 className="font-display text-[17px] font-semibold text-ink">{block.heading}</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{block.body}</p>
            <p className="mt-6 font-display text-2xl font-semibold tnum" style={{ color: tone.accent }}>
              {block.stat}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-3">{block.statLabel}</p>
          </div>
        ))}
      </RevealGroup>

      {/* Highlights + stats */}
      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="heading-3 text-ink">Highlights</h2>
          <ul className="mt-6 flex flex-col">
            {c.highlights.map((h, i) => (
              <li
                key={h}
                className="flex items-start gap-4 border-b border-line-soft py-3.5 text-[15px] text-ink-2"
              >
                <span className="mt-0.5 font-mono text-xs text-steel">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="heading-3 text-ink">By the numbers</h2>
          <dl className="mt-6 flex flex-col gap-6">
            {c.stats.map((s) => (
              <div key={s.label} className="border-b border-line-soft pb-5">
                <dt className="text-[13px] text-ink-3">{s.label}</dt>
                <dd className="mt-1 font-display text-3xl font-semibold tnum text-navy-900">
                  {s.num}
                </dd>
                {s.body && <p className="mt-1 text-[12.5px] text-ink-3">{s.body}</p>}
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* Related + CTA */}
      <footer className="mt-20 border-t border-line-soft pt-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow">More programs</p>
            <ul className="mt-4 flex flex-col gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/work/${r.slug}`}
                    className="text-[15px] font-medium text-ink transition-colors duration-ui hover:text-navy-700"
                  >
                    {r.name} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Button href="/contact">Consult our Growth Experts</Button>
        </div>
      </footer>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-3">{label}</dt>
      <dd className="mt-1.5 text-[14.5px] font-medium text-ink">{value}</dd>
    </div>
  );
}
