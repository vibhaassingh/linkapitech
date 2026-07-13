import { pageMetadata } from "@/lib/metadata";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/motion/Reveal";
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
      {/* Intro */}
      <section className="rsec-pad border-b border-line">
        <Reveal>
          <SectionEyebrow num="—" label={ABOUT_INTRO.eyebrow} />
        </Reveal>
        <Reveal delay={80}>
          <MixedHeading
            as="h1"
            plain={ABOUT_INTRO.headingPlain}
            accent={ABOUT_INTRO.headingAccent}
            className="mt-8 max-w-[24ch] text-[clamp(34px,5.5vw,72px)] leading-[1.02] tracking-tighter"
          />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-12">
          {ABOUT_INTRO.paragraphs.map((p, i) => (
            <Reveal key={i} delay={120 + i * 60}>
              <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-2">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Impact stats */}
      <section className="rsec-pad border-b border-line">
        <Reveal>
          <SectionEyebrow num="—" label="Our impact" end="Real, published figures" />
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {IMPACT_STATS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="border-t border-line pt-5">
                <div className="font-sans text-[clamp(34px,4vw,52px)] font-medium tracking-tighter">
                  <Counter target={s.count ?? 0} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-2">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="rsec-pad">
        <Reveal>
          <SectionEyebrow num="—" label="The LinkAPI journey" end="Mission · Vision · Commitment · Performance" />
        </Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <div key={pillar.key} className="bg-bg p-8 md:p-10">
              <h2 className="font-sans text-[clamp(22px,2.4vw,30px)] font-medium tracking-[-0.02em]">
                {pillar.title}
              </h2>
              <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-2">{pillar.body}</p>
              {pillar.key === "performance" && (
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {PERFORMANCE_STATS.map((s, i) => (
                    <div key={i}>
                      <div className="font-sans text-[clamp(22px,2.4vw,32px)] font-medium tracking-tighter">
                        <Counter target={s.count ?? 0} prefix={s.prefix} suffix={s.suffix} />
                      </div>
                      <p className="mt-1 text-[12.5px] text-ink-3">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Button href="/#contact">Consult our Growth Experts</Button>
        </div>
      </section>
    </>
  );
}
