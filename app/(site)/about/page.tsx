import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { StatNumber } from "@/components/ui/StatNumber";
import { Button } from "@/components/ui/Button";
import { ABOUT_INTRO, PILLARS } from "@/content/about";
import { IMPACT_STATS, PERFORMANCE_STATS } from "@/content/stats";

export const metadata = pageMetadata({
  title: "About LinkAPI Tech | Empowering Businesses with Technology Solutions",
  description:
    "See how LinkAPI Tech Pvt. Ltd. empowers BFSI, Fintech, Agritech, and Edutech businesses with 5000+ API implementations, portal development, and reconciliation solutions built on quality, satisfaction, and timely delivery.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={ABOUT_INTRO.eyebrow}
        title={`${ABOUT_INTRO.headingPlain} ${ABOUT_INTRO.headingAccent}`}
      />

      {/* Intro — two-column editorial */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 md:px-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-14">
          {ABOUT_INTRO.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 70} className={i === 2 ? "md:col-span-2 md:max-w-[62ch]" : ""}>
              <p className="body-lg leading-relaxed text-ink-2">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Impact stats */}
      <section className="border-y border-line-soft bg-surface">
        <RevealGroup
          className="mx-auto grid w-full max-w-[1240px] gap-10 px-6 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-4"
          step={80}
        >
          {IMPACT_STATS.map((s) => (
            <StatNumber key={s.label} stat={s} className="border-t border-line pt-5" />
          ))}
        </RevealGroup>
      </section>

      {/* Pillars */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-20 md:px-10">
        <RevealGroup className="grid gap-5 md:grid-cols-2" step={80}>
          {PILLARS.map((pillar) => (
            <div
              key={pillar.key}
              className="rounded-md border border-line bg-surface p-8 shadow-card md:p-10"
            >
              <h2 className="heading-3 text-ink">{pillar.title}</h2>
              <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
                {pillar.body}
              </p>
              {pillar.key === "performance" && (
                <div className="mt-8 grid grid-cols-2 gap-6">
                  {PERFORMANCE_STATS.map((s) => (
                    <StatNumber
                      key={s.label}
                      stat={s}
                      numClassName="!text-[clamp(1.5rem,2.2vw,2rem)]"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </RevealGroup>

        <Reveal className="mt-14">
          <Button href="/contact">Consult our Growth Experts</Button>
        </Reveal>
      </section>
    </>
  );
}
