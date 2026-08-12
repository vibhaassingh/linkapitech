import { pageMetadata } from "@/lib/metadata";
import { JsonLd, organizationGraph } from "@/lib/jsonld";
import { Hero } from "@/components/sections/home/Hero";
import { LogoMarquee } from "@/components/sections/home/LogoMarquee";
import { WhoWeAre } from "@/components/sections/home/WhoWeAre";
import { WhatWeDo } from "@/components/sections/home/WhatWeDo";
import { Ecosystem } from "@/components/sections/home/Ecosystem";
import { Challenges } from "@/components/sections/home/Challenges";
import { WhyUs } from "@/components/sections/home/WhyUs";
import { StatBand } from "@/components/sections/home/StatBand";
import { ErpBand } from "@/components/sections/home/ErpBand";
import { ProcessRail } from "@/components/sections/home/ProcessRail";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { HomeFaq } from "@/components/sections/home/HomeFaq";
import { CtaBand } from "@/components/sections/CtaBand";

export const metadata = pageMetadata({
  title: "LinkAPI Tech Pvt. Ltd. | Banking That Lives Inside Your Business",
  description:
    "LinkAPI Tech connects banks, NBFCs and enterprises through ERP-native banking infrastructure — payments, collections and reconciliation inside the systems your business already uses. Based in Ghaziabad, India.",
  path: "/",
});

/** Homepage — section order follows the client Figma (page 36). */
export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationGraph()} />
      <Hero />
      <LogoMarquee />
      <WhoWeAre />
      <WhatWeDo />
      <Ecosystem />
      <Challenges />
      <WhyUs />
      <StatBand />
      <ErpBand />
      <ProcessRail />
      <Testimonials />
      <HomeFaq />
      <CtaBand
        ctaLabel="Book a Demo"
        secondary={{
          label: "partnership@linkapitech.com",
          href: "mailto:partnership@linkapitech.com",
        }}
      />
    </>
  );
}
