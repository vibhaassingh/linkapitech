import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { OfferTimeline } from "@/components/sections/services/OfferTimeline";
import { CoreServices } from "@/components/sections/services/CoreServices";
import { PartnerProgram } from "@/components/sections/services/PartnerProgram";
import { Reveal } from "@/components/motion/Reveal";
import { SERVICES_HERO, ENGAGEMENT } from "@/content/services";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "API integration and bank connectivity, ERP reconciliation plugins, transaction reconciliation, adapters and parsers, custom security, and WAN/LAN support for banks, NBFCs and enterprises.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        align="left"
        title={
          <>
            {SERVICES_HERO.titlePlain1}{" "}
            <span className="accent-word">{SERVICES_HERO.titleAccent}</span>{" "}
            {SERVICES_HERO.titlePlain2}
          </>
        }
        lead={SERVICES_HERO.lead}
        visual={
          <Image
            src="/illus/hub-isometric.webp"
            alt="LinkAPI Tech at the centre of an integration network — banks and financial institutions, ERP systems, core banking, payment gateways, cloud infrastructure, third-party applications, and security and compliance."
            width={1374}
            height={1046}
            priority
            className="h-auto w-full max-w-[620px]"
          />
        }
      />

      <OfferTimeline />
      <CoreServices />
      <PartnerProgram />

      {/* Engagement & pricing */}
      <section id="pricing" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">{ENGAGEMENT.heading}</h2>
          </Reveal>
          <Reveal delay={120}>
            {/* mt-12 / r-lg: one heading→content step and one card radius
                across the page (was mt-10 + rounded-xl). */}
            <div className="mt-12 rounded-lg border border-line-soft bg-surface p-8 shadow-card md:p-10">
              <p className="max-w-[88ch] text-[17px] leading-[1.75] text-ink-2">
                {ENGAGEMENT.lead}{" "}
                <strong className="font-semibold text-violet-text">
                  {ENGAGEMENT.boldA}
                </strong>{" "}
                {ENGAGEMENT.midA}{" "}
                <strong className="font-semibold text-violet-text">
                  {ENGAGEMENT.boldB}
                </strong>{" "}
                {ENGAGEMENT.tail}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="Request a Quote" />
    </>
  );
}
