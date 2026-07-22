import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { SERVICES, serviceHeading } from "@/content/services";

export const metadata = pageMetadata({
  title: "Services | API Integration, Reconciliation & IT Consulting — LinkAPI Tech",
  description:
    "Explore LinkAPI Tech's core services: bank API integration, transaction reconciliation, WAN/LAN setup, data integration, custom security solutions, and BFSI sales augmentation — from UAT to production support.",
  path: "/services",
});

// Real "What we offer?" checklist — LinkAPI's most specific content (CONTENT-MAPPING §2.4).
const WHAT_WE_OFFER = [
  "Comprehensive API integration support from UAT to production",
  "Establishing secure connectivity (Basic Telnet Services)",
  "Bank configuration setup and client-end empanelment",
  "Technical coordination between bank and client's technology partner",
  "Assisting with bank prerequisites (e.g., Static IP, SSL Certificates)",
  "Ongoing post-live support on demand",
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="The full integration surface, in one partner."
        lead="Seven services covering how banks and businesses connect, operate, and grow — each scoped to real BFSI constraints and compliance needs."
      />

      {/* 7 stacked service sections — anchor targets for the mega menu */}
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        {SERVICES.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="grid gap-6 border-b border-line-soft py-14 [scroll-margin-top:96px] md:grid-cols-[220px_1fr_1fr] md:gap-10"
          >
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-eyebrow text-steel">
                {s.num} {i === 0 && "· Flagship"}
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="heading-3 text-ink">{serviceHeading(s)}</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <p className="leading-relaxed text-ink-2">{s.description}</p>
            </Reveal>
          </section>
        ))}
      </div>

      {/* What we offer — the real API-integration delivery scope */}
      <section className="mx-auto grid w-full max-w-[1240px] gap-12 px-6 py-20 md:px-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="display-2 text-ink">What we offer.</h2>
          <p className="mt-5 max-w-[46ch] leading-relaxed text-ink-2">
            Our flagship API-integration engagement, end to end — the specific scope behind every
            bank connection we deliver.
          </p>
          <div className="mt-8">
            <Button href="/contact">Consult our Growth Experts</Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <ul className="flex flex-col">
            {WHAT_WE_OFFER.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-4 border-b border-line-soft py-4 text-[15px] text-ink-2"
              >
                <span className="mt-0.5 font-mono text-xs text-steel">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
