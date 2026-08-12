import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { StatNumber } from "@/components/ui/StatNumber";
import {
  ABOUT_HERO,
  OUR_STORY,
  MISSION,
  VISION,
  COMMITMENT,
  APART,
  TRACK_RECORD,
} from "@/content/about";
import { IMPACT_STATS, IMPACT_NOTES, GROWTH_STATS } from "@/content/stats";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "LinkAPI Tech Pvt. Ltd. has specialised in Bank–ERP connectivity since 2022, building the infrastructure that lets banks, NBFCs and enterprises run banking inside the systems they already use.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        tone="dark"
        align="center"
        title={ABOUT_HERO.title}
        lead={ABOUT_HERO.lead}
      />

      {/* Our Story */}
      <section className="section-pad bg-surface">
        <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <h2 className="display-2 text-ink">{OUR_STORY.heading}</h2>
            {OUR_STORY.paragraphs.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="mt-5 max-w-[58ch] text-[15.5px] leading-relaxed text-ink-2"
              >
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={160}>
            <OrbitCard />
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="section-pad bg-canvas">
        <RevealGroup
          className="mx-auto grid grid-cols-1 w-full max-w-[1240px] gap-5 px-6 md:px-10 lg:grid-cols-2"
          step={120}
        >
          <article className="h-full rounded-xl border border-line-soft bg-surface p-8 shadow-card md:p-10">
            <h2 className="heading-3 text-ink">{MISSION.heading}</h2>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-2">
              {MISSION.body}
            </p>
          </article>
          <article className="grad-fill h-full rounded-xl p-8 shadow-float md:p-10">
            <h2 className="heading-3 text-ink-inv">{VISION.heading}</h2>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-inv-2">
              {VISION.body}
            </p>
          </article>
        </RevealGroup>
      </section>

      {/* Our Commitment */}
      <section className="section-dark section-pad">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="mx-auto max-w-[44rem] text-center">
            <h2 className="display-2 text-ink-inv">{COMMITMENT.heading}</h2>
            <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-inv-2">
              {COMMITMENT.lead}
            </p>
          </Reveal>

          <RevealGroup
            className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3"
            as="ul"
            step={90}
          >
            {COMMITMENT.items.map((c) => (
              <div key={c.title} className="glass sheen h-full rounded-xl p-7">
                <span className="glass-strong relative z-[1] grid h-11 w-11 place-items-center rounded-md text-ink-inv">
                  <Icon name={c.icon} size={19} />
                </span>
                <h3 className="relative z-[1] mt-6 text-[17px] font-semibold text-ink-inv">
                  {c.title}
                </h3>
                <p className="relative z-[1] mt-2 text-[14.5px] leading-relaxed text-ink-inv-2">
                  {c.body}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="display-2 text-ink">{APART.heading}</h2>
          </Reveal>

          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2"
            as="ul"
            step={80}
          >
            {APART.items.map((it) => (
              <div
                key={it.body}
                className="flex h-full items-start gap-4 rounded-xl border border-line-soft bg-surface p-7 shadow-card"
              >
                <span className="grad-fill grid h-10 w-10 shrink-0 place-items-center rounded-pill text-ink-inv">
                  <Icon name={it.icon} size={18} />
                </span>
                <p className="text-[15.5px] leading-relaxed text-ink-2">
                  {it.body}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Our Track Record */}
      <section className="section-pad bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="display-2 text-ink">{TRACK_RECORD.heading}</h2>
          </Reveal>

          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            step={80}
          >
            {IMPACT_STATS.map((s) => (
              <article
                key={s.label}
                className="h-full rounded-xl border border-line-soft bg-tint p-7 shadow-card"
              >
                <StatNumber
                  stat={s}
                  numClassName="!text-violet-text"
                  labelClassName="!text-[15px] !font-semibold !text-ink"
                />
                {IMPACT_NOTES[s.label] && (
                  <p className="mt-2 max-w-[36ch] text-[14px] leading-relaxed text-ink-2">
                    {IMPACT_NOTES[s.label]}
                  </p>
                )}
              </article>
            ))}
          </RevealGroup>

          <Reveal delay={160}>
            <div className="grad-fill mt-5 grid grid-cols-1 gap-6 rounded-xl p-8 shadow-float sm:grid-cols-3 md:p-10">
              {GROWTH_STATS.map((s) => (
                <StatNumber
                  key={s.label}
                  stat={s}
                  numClassName="!text-ink-inv"
                  labelClassName="!text-ink-inv-2"
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="Partner with us" />
    </>
  );
}

/** Decorative orbit card beside Our Story (Figma page 30). */
function OrbitCard() {
  return (
    <div
      className="relative aspect-[4/3] w-full rounded-xl border border-line-soft bg-canvas"
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-pill border border-line-soft" />
      <span className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-pill border border-line-soft" />
      <span className="grad-fill absolute left-1/2 top-1/2 grid h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill text-ink-inv shadow-float">
        <Icon name="chip" size={30} />
      </span>
      <span className="absolute left-[19%] top-[22%] h-2.5 w-2.5 rounded-pill bg-plum-700" />
      <span className="absolute right-[16%] top-[56%] h-2 w-2 rounded-pill bg-violet-500" />
    </div>
  );
}
