import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { SegmentMock } from "@/components/sections/industries/Mocks";
import { SEGMENTS } from "@/content/industries";
import { cn } from "@/lib/cn";

export const metadata = pageMetadata({
  title: "Industries We Serve",
  description:
    "Purpose-built financial infrastructure for banks, NBFCs, SMEs and enterprises, e-commerce and fintechs — ERP-native banking, compliant lending rails, embedded checkout and automated reconciliation.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        align="center"
        title={
          <>
            Purpose-built <span className="accent-word">financial infrastructure</span> for the
            organisations that move India&rsquo;s economy.
          </>
        }
      />

      {SEGMENTS.map((s, i) => {
        const mockFirst = i % 2 === 1;
        return (
          <section
            key={s.id}
            id={s.id}
            className={cn("section-pad", i % 2 === 0 ? "bg-surface" : "bg-canvas")}
          >
            <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={cn(mockFirst && "lg:order-2")}>
                <h2 className="display-2 text-ink">{s.title}</h2>
                <p className="mt-5 max-w-[50ch] text-[16px] leading-relaxed text-ink-2">{s.body}</p>
              </Reveal>

              <Reveal delay={160} className={cn(mockFirst && "lg:order-1")}>
                <SegmentMock mock={s.mock} />
              </Reveal>
            </div>
          </section>
        );
      })}

      <CtaBand eyebrow="Ready to streamline" ctaLabel="Find the Right Fit for Your Business" />
    </>
  );
}
