import Link from "next/link";
import { notFound } from "next/navigation";
import { BANKS, BANK_SLUGS, getBank } from "@/content/banks";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { BankLogo } from "@/components/ui/BankLogo";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return BANK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBank(slug);
  if (!b) return {};
  return pageMetadata({ title: b.meta.title, description: b.meta.description, path: `/banks/${b.slug}` });
}

export default async function BankPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBank(slug);
  if (!b) notFound();

  const related = BANKS.filter((x) => x.slug !== b.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `${b.name} Integration`,
        serviceType: "Bank API integration",
        description: b.intro,
        provider: { "@type": "Organization", name: SITE.legalName, url: SITE.url },
        areaServed: "IN",
        url: `${SITE.url}/banks/${b.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Bank integrations", item: `${SITE.url}/banks` },
          { "@type": "ListItem", position: 2, name: b.name, item: `${SITE.url}/banks/${b.slug}` },
        ],
      },
    ],
  };

  return (
    <article className="rsec-pad">
      <JsonLd data={jsonLd} />

      <Link href="/banks" className="text-[13px] text-ink-2 transition-colors hover:text-ink">
        ← All bank integrations
      </Link>

      {/* Hero — logo on a light card over a faint brand tint */}
      <div
        className="relative mt-6 overflow-hidden rounded-[24px] border border-line"
        style={{ background: `linear-gradient(135deg, ${b.brand}14, transparent 70%)` }}
      >
        <div className="flex flex-col items-start gap-8 p-8 md:p-12">
          <SectionEyebrow num="—" label={b.eyebrow} />
          <span className="inline-flex items-center rounded-[14px] border border-line bg-bg px-6 py-5 shadow-[0_20px_50px_-30px_rgba(13,13,13,.4)]">
            <BankLogo name={b.name} logo={b.logo} height={b.logo ? 46 : 40} />
          </span>
          <h1 className="max-w-[18ch] font-sans text-[clamp(32px,5.5vw,64px)] font-medium leading-[1.03] tracking-tighter">
            {b.name}{" "}
            <span className="font-serif font-normal italic text-ink-2">integration.</span>
          </h1>
          <p className="max-w-[56ch] text-[clamp(16px,1.6vw,20px)] leading-relaxed text-ink-2">
            {b.intro}
          </p>
        </div>
      </div>

      {/* Neutral, capability-framed disclaimer (no partnership claim) */}
      <p className="mt-6 rounded-card border border-line bg-bg-2 px-5 py-4 text-[13px] leading-relaxed text-ink-2">
        This page describes LinkAPI Tech&apos;s integration capability for {b.name}&apos;s banking
        systems. It is not a claim of official partnership with, or endorsement by, {b.name}.
        {/* TODO: client to confirm — the real relationship, partner tier, and logo usage rights. */}
      </p>

      {/* Overview */}
      <Reveal className="mt-12">
        <p className="max-w-[64ch] text-[clamp(17px,1.9vw,22px)] leading-relaxed text-ink">
          {b.overview}
        </p>
      </Reveal>

      {/* Capabilities */}
      <div className="mt-14 grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <h2 className="font-sans text-[clamp(24px,3vw,36px)] font-medium tracking-tighter">
          What we integrate
        </h2>
        <ul className="flex flex-col">
          {b.capabilities.map((cap) => (
            <li
              key={cap}
              className="flex items-start gap-3 border-t border-line py-4 text-[15px] text-ink-2"
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] text-white">
                ✓
              </span>
              {cap}
            </li>
          ))}
        </ul>
      </div>

      {/* Connectivity playbook */}
      <div className="mt-16">
        <SectionEyebrow num="—" label="Connectivity playbook" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {b.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="flex h-full flex-col rounded-card border border-line p-6">
                <span className="font-sans text-[13px] font-semibold text-accent-deep">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[16px] font-medium tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Stats — LinkAPI-wide, clearly captioned */}
      <div className="mt-16 border-t border-line pt-10">
        <p className="text-[11px] uppercase tracking-eyebrow text-ink-3">
          LinkAPI, across all BFSI integrations
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {b.stats.map((s) => (
            <div key={s.label}>
              <div className="font-sans text-[clamp(28px,3.5vw,44px)] font-medium tracking-tighter">
                {s.num}
              </div>
              <div className="mt-1 text-[13px] text-ink-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 border-t border-line pt-10">
        <Button href="/#contact">Consult our Growth Experts</Button>
      </div>

      {/* Related banks */}
      <div className="mt-16">
        <span className="text-[11px] uppercase tracking-eyebrow text-ink-3">Other bank integrations</span>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/banks/${r.slug}`}
              className="group flex items-center justify-between gap-4 rounded-[18px] border border-line p-5 transition-colors hover:border-ink"
            >
              <BankLogo name={r.name} logo={r.logo} height={r.logo ? 26 : 22} />
              <span className="text-[13px] font-medium text-ink transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
