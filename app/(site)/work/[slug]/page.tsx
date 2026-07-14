import Link from "next/link";
import { notFound } from "next/navigation";
import type { CaseBlock } from "@/content/cases";
import { CASES, CASE_SLUGS, getCase, TONE_BG } from "@/content/cases";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

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
    <article className="rsec-pad">
      <JsonLd data={jsonLd} />

      <Link href="/work" className="text-[13px] text-ink-2 transition-colors hover:text-ink">
        ← All work
      </Link>

      {/* Hero cover */}
      <div
        className="relative mt-6 grid aspect-[1672/720] w-full place-items-center overflow-hidden rounded-[24px]"
        style={{ background: TONE_BG[c.tone] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,166,197,.16),transparent_55%)]" />
        <span className="absolute left-6 top-6">
          <Chip variant="glass">{c.industry}</Chip>
        </span>
        <span className="absolute right-6 top-6 text-[11px] uppercase tracking-eyebrow text-white/60">
          {c.year}
        </span>
        <div className="px-6 text-center">
          <p className="text-[11px] uppercase tracking-eyebrow text-white/50">{c.kicker}</p>
          <h1 className="mt-3 font-serif text-[clamp(32px,6vw,72px)] italic leading-tight text-white">
            {c.name}
          </h1>
        </div>
      </div>

      {/* Aggregate disclaimer */}
      <p className="mt-6 rounded-card border border-line bg-bg-2 px-5 py-4 text-[13px] leading-relaxed text-ink-2">
        This is an aggregate, program-level summary built from LinkAPI&apos;s real quantified impact,
        not a confidential client case study.
        {/* TODO: client to confirm — replace with a real per-engagement narrative. */}
      </p>

      {/* Meta row */}
      <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-8 md:grid-cols-4">
        <Meta label="Industry" value={c.industry} />
        <Meta label="Services" value={c.services} />
        <Meta label="Timeline" value={c.timeline} />
        <Meta label="Role" value={c.role} />
      </dl>

      {/* Intro */}
      <Reveal className="mt-10">
        <p className="max-w-[62ch] text-[clamp(18px,2vw,24px)] leading-relaxed text-ink">{c.intro}</p>
      </Reveal>

      {/* Challenge / Solution / Outcome */}
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[c.challenge, c.solution, c.outcome].map((b) => (
          <CaseBlockCard key={b.heading} block={b} />
        ))}
      </div>

      {/* Highlights */}
      <div className="mt-14 grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-medium tracking-tighter">
          Highlights
        </h2>
        <ul className="flex flex-col">
          {c.highlights.map((h) => (
            <li key={h} className="flex items-start gap-3 border-t border-line py-4 text-[15px] text-ink-2">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] text-white">
                ✓
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="mt-14 grid gap-6 border-t border-line pt-10 sm:grid-cols-3">
        {c.stats.map((s) => (
          <div key={s.label}>
            <div className="font-sans text-[clamp(28px,3.5vw,44px)] font-medium tracking-tighter">
              {s.num}
            </div>
            <div className="mt-1 text-[13px] text-ink-2">{s.label}</div>
            {s.body && <div className="mt-1 text-[12px] text-ink-3">{s.body}</div>}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 border-t border-line pt-10">
        <Button href="/#contact">Consult our Growth Experts</Button>
      </div>

      {/* Related */}
      <div className="mt-16">
        <span className="text-[11px] uppercase tracking-eyebrow text-ink-3">More work</span>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/work/${r.slug}`}
              className="group rounded-[18px] border border-line p-5 transition-colors hover:border-ink"
            >
              <div className="text-[15px] font-medium">{r.name}</div>
              <div className="mt-1 text-[12px] text-ink-3">{r.services}</div>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-eyebrow text-ink-3">{label}</dt>
      <dd className="mt-1.5 text-[14px] text-ink-2">{value}</dd>
    </div>
  );
}

function CaseBlockCard({ block }: { block: CaseBlock }) {
  return (
    <div className="rounded-card border border-line p-6">
      <h2 className="text-[11px] uppercase tracking-eyebrow text-ink-3">{block.heading}</h2>
      <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{block.body}</p>
      <div className="mt-5 border-t border-line pt-4">
        <div className="font-sans text-[clamp(22px,2.4vw,30px)] font-medium tracking-tighter">
          {block.stat}
        </div>
        <div className="mt-1 text-[12px] text-ink-3">{block.statLabel}</div>
      </div>
    </div>
  );
}
