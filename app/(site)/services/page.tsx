import { pageMetadata } from "@/lib/metadata";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { ServiceAccordion } from "@/components/sections/ServiceAccordion";

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
      <section className="rsec-pad border-b border-line">
        <Reveal>
          <SectionEyebrow num="—" label="The cores & values" />
        </Reveal>
        <Reveal delay={80}>
          <MixedHeading
            as="h1"
            plain="Explore our comprehensive range of"
            accent="services."
            className="mt-8 max-w-[22ch] text-[clamp(34px,5.5vw,72px)] leading-[1.02] tracking-tighter"
          />
          <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
            We empower companies to implement innovative process models, driving revenue growth and
            cost efficiency through advanced technology solutions.
          </p>
        </Reveal>
      </section>

      <ServiceAccordion standalone />

      {/* What we offer — the real API-integration delivery scope */}
      <section className="rsec-pad border-t border-line">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <MixedHeading
              plain="What we"
              accent="offer."
              className="text-[clamp(30px,4.5vw,56px)] leading-[1.05] tracking-tighter"
            />
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
              Our flagship API-integration engagement, end to end — the specific scope behind every
              bank connection we deliver.
            </p>
            <div className="mt-8">
              <Button href="/#contact">Consult our Growth Experts</Button>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ul className="flex flex-col gap-4">
              {WHAT_WE_OFFER.map((item) => (
                <li key={item} className="flex items-start gap-3 border-b border-line pb-4 text-[15px] text-ink-2">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] text-white">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
