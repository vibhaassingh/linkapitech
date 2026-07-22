import { pageMetadata } from "@/lib/metadata";
import { JsonLd, organizationGraph } from "@/lib/jsonld";
import { Hero } from "@/components/sections/home/Hero";
import { TrustWall } from "@/components/sections/home/TrustWall";
import { StatBand } from "@/components/sections/home/StatBand";
import { ServicesGrid } from "@/components/sections/home/ServicesGrid";
import { ProcessRail } from "@/components/sections/home/ProcessRail";
import { CaseGrid } from "@/components/sections/home/CaseGrid";
import { SecurityBand } from "@/components/sections/home/SecurityBand";
import { Benefits } from "@/components/sections/home/Benefits";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { HomeFaq } from "@/components/sections/home/HomeFaq";
import { ContactCta } from "@/components/sections/home/ContactCta";

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
      <TrustWall />
      <StatBand />
      <ServicesGrid />
      <ProcessRail />
      <CaseGrid />
      <SecurityBand />
      <Benefits />
      <Testimonials />
      <HomeFaq />
      <ContactCta />
    </>
  );
}
