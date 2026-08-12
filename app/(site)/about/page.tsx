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
import { cn } from "@/lib/cn";

/**
 * Shared card craft for this page: 20px radius (the card step of the radius
 * scale — nested boxes drop to 12, pills to 999), a 4px hover lift on
 * `--spring-smooth`, and `.icon-draw` so any Icon inside that opts in replays
 * its stroke draw on hover.
 *
 * Only `transform` and `box-shadow` transition, so the lift can never move a
 * neighbour (CLS 0). Under reduced motion the global block collapses
 * `transition-duration` to 0.001ms, which turns the lift into an instant state
 * change — and the resting state is the un-lifted card, so nothing is stranded.
 */
const CARD_LIFT =
  "icon-draw h-full rounded-lg transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 hover:shadow-float";

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
          className="mx-auto grid grid-cols-1 w-full max-w-[1240px] gap-6 px-6 md:px-10 lg:grid-cols-2"
          step={120}
        >
          <article className={cn(CARD_LIFT, "border border-line-soft bg-surface p-8 shadow-card md:p-10")}>
            <h2 className="heading-3 text-ink">{MISSION.heading}</h2>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-2">
              {MISSION.body}
            </p>
          </article>
          {/* grad-fill: secondary copy MUST stay --ink-on-violet-2 — --ink-inv-2
              only reaches 3.91:1 on the gradient's #8e24aa stop. */}
          <article className={cn(CARD_LIFT, "grad-fill p-8 shadow-float md:p-10")}>
            <h2 className="heading-3 text-ink-inv">{VISION.heading}</h2>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-on-violet-2">
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
            className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
            as="ul"
            step={90}
          >
            {COMMITMENT.items.map((c) => (
              <div
                key={c.title}
                className={cn(CARD_LIFT, "glass sheen p-7")}
              >
                <span className="glass-strong relative z-[1] grid h-11 w-11 place-items-center rounded-md text-ink-inv">
                  <Icon name={c.icon} size={19} draw />
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
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
            as="ul"
            step={80}
          >
            {APART.items.map((it) => (
              <div
                key={it.body}
                className={cn(
                  CARD_LIFT,
                  "flex items-start gap-4 border border-line-soft bg-surface p-7 shadow-card",
                )}
              >
                <span className="grad-fill grid h-10 w-10 shrink-0 place-items-center rounded-pill text-ink-inv">
                  <Icon name={it.icon} size={18} draw />
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
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            step={80}
          >
            {IMPACT_STATS.map((s) => (
              <article
                key={s.label}
                className={cn(
                  CARD_LIFT,
                  "border border-line-soft bg-tint p-7 shadow-card",
                )}
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

          {/* grad-fill: the labels MUST stay --ink-on-violet-2 (AA on the
              gradient's light #8e24aa stop); --ink-inv-2 only reaches 3.91:1. */}
          <Reveal delay={160}>
            <div className="grad-fill mt-6 grid grid-cols-1 gap-6 rounded-lg p-8 shadow-float sm:grid-cols-3 md:p-10">
              {GROWTH_STATS.map((s) => (
                <StatNumber
                  key={s.label}
                  stat={s}
                  numClassName="!text-ink-inv"
                  labelClassName="!text-ink-on-violet-2"
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

/**
 * Decorative orbit card beside Our Story (Figma page 30).
 *
 * The two rings now turn — very slowly (180s / 140s counter-rotation), so it
 * reads as ambient rather than as a loading spinner — each carrying its node
 * around with it.
 *
 * Two structural notes, both load-bearing:
 *  - the rotating element carries NO other transform. `.orbit-spin`'s keyframe
 *    sets `transform` outright, so a `-translate-x-1/2` on the same element
 *    would be dropped the instant the animation starts and the ring would jump.
 *    Centring is therefore done by the grid parent.
 *  - the rings are `aspect-square`, not `h-[x%] w-[x%]`. On this 4:3 box a
 *    matched percentage pair is an ellipse, and a rotating ellipse wobbles.
 *
 * Reduced motion: the global block forces `animation-duration: 0.001ms` and one
 * iteration, so both rings land on `rotate(360deg)` — visually their authored
 * position — and stop. Nothing else in the card moves.
 */
function OrbitCard() {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line-soft bg-canvas"
      aria-hidden="true"
    >
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="orbit-spin relative aspect-square h-[70%] rounded-pill border border-line-soft"
          style={{ "--orbit-d": "180s" } as React.CSSProperties}
        >
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-plum-700" />
        </span>
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <span
          className="orbit-spin-reverse relative aspect-square h-[46%] rounded-pill border border-line-soft"
          style={{ "--orbit-d": "140s" } as React.CSSProperties}
        >
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-pill bg-violet-500" />
        </span>
      </div>

      <span className="grad-fill absolute left-1/2 top-1/2 grid h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill text-ink-inv shadow-float">
        <Icon name="chip" size={30} />
      </span>
    </div>
  );
}
