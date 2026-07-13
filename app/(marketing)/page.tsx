import { pageMetadata } from "@/lib/metadata";
import { JsonLd, organizationGraph } from "@/lib/jsonld";
import { Hero } from "@/components/sections/Hero";
import { SplitShell } from "@/components/sections/SplitShell";
import { WorksDeck } from "@/components/sections/WorksDeck";
import { ServiceAccordion } from "@/components/sections/ServiceAccordion";
import { ProcessStepper } from "@/components/sections/ProcessStepper";
import { Benefits } from "@/components/sections/Benefits";
import { Testimonials } from "@/components/sections/Testimonials";
import { ContactSection } from "@/components/sections/ContactSection";

export const metadata = pageMetadata({
  title: "LinkAPI Tech Pvt. Ltd. | BFSI API Integration & Technology Services",
  description:
    "LinkAPI Tech Pvt. Ltd. is a technology service provider for corporates and BFSI businesses, delivering API integration, transaction reconciliation, WAN/LAN infrastructure, and data integration solutions. Based in Ghaziabad, India.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationGraph()} />
      <Hero />
      <SplitShell>
        <WorksDeck />
        <ServiceAccordion />
        <ProcessStepper />
        <Benefits />
        <Testimonials />
        <ContactSection />
      </SplitShell>
    </>
  );
}
