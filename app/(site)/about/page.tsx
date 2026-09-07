import type { CSSProperties, ReactNode } from "react";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Card, Pool } from "@/components/motifs";
import { HeroLens } from "@/components/three/HeroLens";
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

/**
 * /about — V4 Phase 9b (REDESIGN-V4 Part G).
 *
 * The page's own `CARD_LIFT` string is gone: `.liq-live` carries the lift on
 * every glass card, and the two solid cards (Vision's gradient, the
 * track-record tints) keep a hand-rolled `transform` + `box-shadow` hover —
 * an opaque card has no frost and no rim, so `.liq-live` has nothing to lift.
 * `.icon-draw` is kept on every card that holds an `<Icon draw>`.
 *
 * ── LIGHT GLASS IS `liq-flat` HERE, AND IT IS FREE ────────────────────────
 * Every light Vessel on this page sits on a FLAT surface (`--surface` #ffffff
 * or `--canvas` #faf8fc) with nothing but the section colour behind it, and a
 * Gaussian blur of a constant field IS that constant (`saturate(1.15)` on it
 * is achromatic to the nearest LSB). So `liq-flat` costs zero pixels of
 * difference and saves a real blur layer — Part J Phase 8's arithmetic, and
 * the reason the whole page contributes 0 blurs at 390px. The rim ring, the
 * wet edge and `--liq-light-shadow` are what draw the glass.
 *
 * ── AA, COMPUTED BY HAND WHERE NO CHECK CAN SEE IT (§A6) ──────────────────
 * The Commitment band is a BARE `.section-dark`, whose `--grad-section`
 * (globals.css L108) is byte-identical to `--grad-section-a` (L117), so the
 * dark cards there take band A's matrix: over plum-700 + `--liq-2-fill` .07 +
 * `--liq-edge` .13 = **rgb(102,67,110)**, where tier 2 `--ink-inv-2` measures
 * **4.54:1** rounded (4.52 on the unrounded composite — the two numbers the
 * repo already publishes, globals.css L49 and §A6, are that rounding and not a
 * disagreement). Either way it is the calibrated minimum.
 * That is why the band carries NO Caustic: a full `--violet-a24` core turns
 * that composite into rgb(117,70,128), where the same ink is **4.00:1**, and
 * the contrast walk cannot see a sibling overlay (Part J Phase 9a's table).
 * PageHero owns the page's one Caustic.
 *
 * Text over a Pool is `--ink-inv` (dark) / `--ink` (light) only. The growth
 * band satisfies that by PROMOTION (every run in it is `--ink-inv`); the
 * track-record cards satisfy it GEOMETRICALLY — see PoolCard's arithmetic.
 *
 * ── §A8 BACKDROP ROOTS: AUDITED, NOTHING TO FIX ───────────────────────────
 * Recorded because the failure mode is silent — an ancestor that animates or
 * rests on `opacity < 1`, `filter`, `mask` or `mix-blend-mode` deletes the
 * frost while every fill, rim, shadow and AA number keeps reading correct.
 * Nine `.liq` elements ship here; six are `liq-flat` and never blur at all, so
 * only the three Commitment Cards (≥1024) have anything to lose. Their chain
 * is `<li data-reveal>` → RevealGroup `<ul>` → the max-w `<div>` → `<section
 * class="section-dark section-pad">` → `main.chrome-main`, and:
 *   · `[data-reveal]` is opacity 0 → 1 only DURING its entry transition;
 *     globals.css L1086–1090 puts it back to `opacity: 1; will-change: auto`,
 *     so the backdrop root is transient and the resting state is clean — the
 *     case Card.tsx L76–78 rules as needing nothing;
 *   · `.section-dark` sets `isolation: isolate`, which makes a STACKING
 *     context, not a backdrop root — the two are easy to conflate and §A8's
 *     list does not include it (phases 6–8 shipped blurring glass on these
 *     bands);
 *   · its `mix-blend-mode: overlay` grain is on `::after` — a pseudo CHILD,
 *     never an ancestor;
 *   · `.chrome-main` (chrome.css L408–415) sets only position, z-index,
 *     background and box-shadow. No `.card-depth`, `.liq-enter`, `.pin-step`
 *     or `contain: paint` anywhere above a `.liq` on this route.
 */

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "LinkAPI Tech Pvt. Ltd. has specialised in Bank–ERP connectivity since 2022, building the infrastructure that lets banks, NBFCs and enterprises run banking inside the systems they already use.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      {/* nextSurface is the default `--surface`: Our Story below is bg-surface,
          so the Meniscus is filled with the white it rises into. */}
      <PageHero
        tone="dark"
        align="center"
        title={ABOUT_HERO.title}
        lead={ABOUT_HERO.lead}
      />

      {/* Our Story — the company as the reservoir */}
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
            {/*
              The retired OrbitCard's two counter-rotating rings become the
              lens: the company as the reservoir the liquid sits in (Part G).
              It is `HeroLens compact` — the SVG composition with no chips and
              no WebGL layer (see the prop's note) — inside a `.liq liq-light`
              Vessel, which is the glass the reservoir is held in.

              `idPrefix="al"` is not optional. SVG ids are document-global and
              HeroLens defines five gradients plus a clipPath (caustic, body,
              blob, rim, glint, clip); the hero's set is the default "hl-*", so
              a second lens without its own prefix would resolve
              the other's paints (Phase 4 added the prop for exactly this
              call site). /about renders no hero lens, but the prefix is what
              makes the component composable rather than singleton-by-luck.

              `liq-flat` per the header note (flat `--surface` behind it), and
              radius 24 (`rounded-xl`) + `p-6` — PageHero's own Vessel-plate
              geometry, so a framed diagram looks the same wherever it appears.
              No flat border and no `shadow-card`: the rim ring IS the border
              and `--liq-light-shadow` IS the elevation (§A2).

              ── THE LENS IS DRESSED FOR PLUM AND THIS GROUND IS WHITE ───────
              Written down because NO check can report it: the SVG is valid,
              `aria-hidden`, decorative, and every AA number on this page is
              unaffected. `--liq-light-2-fill` (.70 white) over `--surface`
              composites to pure #fff, and HeroLens' light-side layers are
              white or near-white light meant for `--grad-hero`. Composited
              here against the same layers over `--plum-900`, for scale:
                · rim key `#al-rim` #fff .34→.10 — 255,255,255 → 255,255,255,
                  a delta of exactly 0/0/0 (on plum, 37,13,41 → 111,95,114).
                  This is the lens's principal edge definition.
                · inner hairline #fff .1 — the same zero.
                · key glint (`--ink-inv` core, .55): the body wash 218,196,223
                  → 234,222,237, a 16/26/14 step, against 61,22,69 → 163,144,168
                  (102/122/99) on plum. Both glints land on the bare body
                  ellipse, not on a metaball — the nearest blob centre is 1.84×
                  its own drawn radius away, where the `#al-blob` gradient has
                  already reached 0 — so there is no saturated ground under
                  them to lift.
                · both caustic pools (`--violet-500` .08 / .04) become a −9/−18/−7
                  violet haze on white instead of light thrown on plum.
              What survives is the drawing's DARK half, and it is enough to
              read: the `--plum-950` .26 annulus (195,190,197 on white), the
              .28 body wash, and the five metaballs, whose `--violet-500` .92
              core lands at 151,54,177. So the panel reads as a violet liquid
              cluster held in a soft plum ring — on-brand and legible, but
              without the specular that makes the same drawing read as GLASS in
              the hero. `.lens-caustic` (24s) and `.lens-glint` (9s) animate
              exactly the layers that lose the most here.

              NOT COMPENSATED FOR AT THIS CALL SITE, deliberately. Every dark
              ground a page can reach is wrong in a nameable way:
                · a `.section-dark` inset flips the PILL. SiteHeader.tsx L331
                  observes `main .section-dark` boxes crossing the pill's own
                  band at ANY width, so this ~45%-wide plate would drive the
                  full-width pill to its dark state over a mostly-white
                  viewport — twice, inside the first screen after the hero.
                  (The page's two real dark surfaces both span the full width
                  where they cross — the Commitment band is full-bleed and the
                  growth band spans the 1240px container — so their crossings
                  are what the observer is for; a half-width plate's is not.)
                · a bare `bg-plum-*` plate breaks the same contract from the
                  other side: a dark surface the tone observer cannot see, with
                  no precedent in the codebase (`data-surface="dark"` is the
                  opt-IN marker for exactly this, used only by the two heroes).
              The honest fix is a light dressing inside HeroLens — its rim,
              glint and caustic stops keyed off the host tone — which is not
              this page's file. Part G's `.liq liq-light` Vessel is kept
              verbatim, and the retired OrbitCard was a light card on this same
              spot, so the light plate is both the spec and the continuity.
            */}
            <div className="liq liq-light liq-flat rounded-xl p-6">
              <HeroLens idPrefix="al" compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="section-pad bg-canvas">
        <RevealGroup
          className="mx-auto grid grid-cols-1 w-full max-w-[1240px] gap-6 px-6 md:px-10 lg:grid-cols-2"
          step={120}
        >
          {/*
            Mission is a light Vessel; `--liq-pad` is its real padding (32px at
            md), so `.liq-spec`'s pointer highlight stays in the text-free frame.
            `.liq-live` owns `transform` on this element and is exclusive with
            `.liq-enter` / `.scrub-drift` / `.card-depth` / `[data-tilt]` (§A4) —
            nothing else here transforms it. §A6 allows `--ink-3` from tier 2
            light down (4.56 in the table); on THIS host — `--liq-light-2-fill`
            .70 over `--canvas` = rgb(254,253,254) — the composite measures
            `--ink-2` **9.13:1**, `--ink` 16.56 and `--ink-3` 5.33, so the body
            keeps the secondary ink with room to spare. The forbidden pairing
            is `--ink-3` on tier ONE light (4.17), and there is no `.liq-1` on
            this page.
          */}
          <article
            className="liq liq-light liq-flat liq-live liq-spec h-full rounded-lg p-8 md:p-10"
            style={{ "--liq-pad": "32px" } as CSSProperties}
          >
            <h2 className="heading-3 text-ink">{MISSION.heading}</h2>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-2">
              {MISSION.body}
            </p>
          </article>

          {/* Vision keeps `grad-fill` (Part G): secondary copy MUST stay
              --ink-on-violet-2, which measures 4.98:1 on `--grad-tile`'s
              bright #8e24aa stop and 8.39:1 at the dark one. --ink-inv-2 there
              is 3.95:1 (globals.css L71 publishes 3.91 for the same pair —
              /banks/[slug] recomputed 3.95 too, so the two 9b pages agree).
              An opaque gradient card has no frost, no rim and therefore no
              `.liq-live`, so the lift is by hand. No specular of any kind on
              it: `.liq-spec` reads `--_spec`, which only `.liq` sets, so on a
              non-glass card it is a silent no-op, and `.spotlight`'s
              `--violet-glow` wash is invisible over a violet gradient (it is
              the LIGHT-card counterpart). No `icon-draw` either — this card
              holds no `<Icon>`, and the class was a leftover of the retired
              `CARD_LIFT` string. */}
          <article className="grad-fill h-full rounded-lg p-8 shadow-float transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 md:p-10">
            <h2 className="heading-3 text-ink-inv">{VISION.heading}</h2>
            <p className="mt-4 max-w-[52ch] text-[15.5px] leading-relaxed text-ink-on-violet-2">
              {VISION.body}
            </p>
          </article>
        </RevealGroup>
      </section>

      {/* Our Commitment — the dark band. `.section-dark` bare = band A. */}
      <section className="section-dark section-pad">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="mx-auto max-w-[44rem] text-center">
            <h2 className="display-2 text-ink-inv">{COMMITMENT.heading}</h2>
            <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-inv-2">
              {COMMITMENT.lead}
            </p>
          </Reveal>

          {/*
            Three `.liq` Cards with `Node inset` icon tiles — the shared Card
            component, which is where `glass sheen` + `glass-strong` retired to:
            the tier-2 material with `.liq-spec` (masked to `--liq-pad`, so the
            .22 white never sits under a glyph) and `.liq-live`'s lift.

            `liq-static-mobile`, not `liq-flat`: this band is a plum GRADIENT,
            so unlike every light Vessel on this page the frost here is real
            pixels, and it is kept ≥1024 (3 cards + the pill = 4 of §A7's
            desktop 8, the route's peak). Below 1024 the three stack into
            roughly 740px and therefore share one 844px viewport, so with the
            pill they would spend the ENTIRE phone budget of 4 on one section —
            Phase 8's WhoWeAre boundary, which took the same hatch at the same
            number. With the hatch, /about contributes ZERO blur layers below
            1024 and its phone peak is the pill ALONE = 1: `CtaBand`'s glass
            CTA renders only when a `secondary` is passed and this route
            passes none, and its Droplet is `.liq liq-1`, which globals.css
            strips below 1024.
          */}
          <RevealGroup
            className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
            as="ul"
            step={90}
          >
            {COMMITMENT.items.map((c) => (
              <Card
                key={c.title}
                tone="dark"
                icon={<Icon name={c.icon} size={19} draw />}
                title={c.title}
                className="liq-static-mobile h-full"
              >
                {c.body}
              </Card>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* What Sets Us Apart — four light cards */}
      <section className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="display-2 text-ink">{APART.heading}</h2>
          </Reveal>

          {/*
            The Card LANGUAGE rather than the `Card` component: these four items
            carry a `body` and an `icon` and no title (content/about.ts), and
            `Card` requires a `title` it renders as an `h3.heading-3` — a
            sentence in a heading is wrong markup for the sake of reusing a
            component. So the shell is Card's verbatim (light tier-2 glass,
            `liq-live liq-spec`, radius 20, `p-7`, `--liq-pad` = 28px) with the
            body as the `<p>` it is.
          */}
          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
            as="ul"
            step={80}
          >
            {APART.items.map((it) => (
              <div
                key={it.body}
                className="liq liq-light liq-flat liq-live liq-spec icon-draw flex h-full items-start gap-4 rounded-lg p-7"
                style={{ "--liq-pad": "28px" } as CSSProperties}
              >
                {/* `.card-icon-light` is Card's own `--lavender-200` disc with
                    a `--violet-text` glyph (7.22:1 — non-text, needs 3:1), AT
                    ITS DESIGNED 44px. A `h-10 w-10` alongside it would NOT make
                    it 40: motifs.css L398 sets width/height at specificity
                    (0,1,0), Tailwind's `.h-10`/`.w-10` are (0,1,0) too, and
                    motifs.css is imported AFTER globals.css (layout.tsx L14 vs
                    L2), so the later source wins the tie and the disc renders 44
                    with the utilities silently doing nothing — the same
                    Tailwind-loses-to-motifs.css trap this file names for `.pool`
                    below. A 40px disc is reachable, but only by hand-rolling one
                    the way CoreServices does; 44 is Card's number and matches
                    the `Node inset size={44}` tiles on the Commitment band
                    above, so the page has one disc size and one glyph size. */}
                <span aria-hidden="true" className="card-icon-light">
                  <Icon name={it.icon} size={19} draw />
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
              <PoolCard key={s.label}>
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
              </PoolCard>
            ))}
          </RevealGroup>

          <Reveal delay={160}>
            <GrowthBand />
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="Partner with us" />
    </>
  );
}

/**
 * One track-record card: the Figma's tinted panel with a light Pool rising in
 * its floor (Part G). Solid `bg-tint`, not glass — `.liq` sets
 * `background-color` after Tailwind's utilities, so `bg-tint` on a `.liq` is a
 * silent no-op (Part J Phase 2, `Card`'s light feature). The hover lift is by
 * hand for the same reason as Vision's card.
 *
 * POOL CLEARANCE — bottom-anchored arithmetic, and the tolerance is set by
 * `.pool::before`, not by AA (Part J Phase 8). §A6 allows only `--ink` over a
 * light Pool, and this card's runs are `--violet-text` (the numeral),
 * `--ink` (the label) and `--ink-2` (the note) — so the basin is kept OFF the
 * text geometrically rather than promoting two of them. On `--card-tint`
 * #f5eff9 those measure 8.28 / 14.90 / 8.21, and the numeral clears the 3:1
 * large-text floor by a wide margin (`.stat-num` is 700-weight, ≥ 1.9rem). Even
 * if a full `--violet-soft` basin DID reach them — rgb(235,219,241) — they
 * would read 7.07 / 12.74 / 7.02, so the geometry below is enforcing §A6's
 * rule, not rescuing a failing number.
 *
 * NO `.spotlight` on this card, and the reason is a cascade trap worth naming:
 * `.spotlight > * { position: relative; z-index: 1 }` is specificity (0,1,0)
 * (the universal selector contributes nothing) and is declared AFTER
 * `@tailwind utilities`, so it wins the tie against an `absolute` utility on a
 * direct child. A `.spotlight` card therefore cannot host a child positioned
 * by a Tailwind UTILITY without an extra nesting level, and the symptom is
 * that child laid out in flow, not an error. (Narrowly: `.pool` itself would
 * survive as a direct child — `.pool { position: absolute }` is also (0,1,0)
 * but lives in motifs.css, which `app/layout.tsx` imports AFTER globals.css,
 * so it wins the tie on source order. The construction used here positions
 * with a Tailwind `absolute` wrapper, which loses it. No `.spotlight` hosts a
 * Pool anywhere, so nothing depends on the distinction.) The retired card carried
 * no `.spotlight` either; the hover lift is what it had.
 *
 * `.pool` is the bottom 46% of its positioned box (overriding that height with
 * a Tailwind `h-*` would silently lose to motifs.css, emitted after Tailwind),
 * so: a 76px box gives a **34.96px** basin whose top — where the 1px lavender
 * meniscus line paints — sits 34.96px above the card floor, against the card's
 * `pb-16` = 64px of bottom padding. Clearance **29.04px**. Phase 8's finding
 * governs the number: at ~10px that line reads as an underline beneath the
 * paragraph rather than as a liquid surface.
 *
 * The Pool is FIRST in DOM with the content on `relative z-[1]`: `.pool` is
 * positioned with no z-index and would otherwise paint over in-flow text
 * (StatBand's trap). `isolate` pins that ordering to the card at REST as well:
 * `hover:-translate-y-1` makes the article a stacking context the moment it is
 * hovered, and without `isolate` the card would enter and leave one on every
 * hover. `overflow-hidden` + `border-radius: inherit` round the basin's bottom
 * corners. It rises with the RevealGroup wrapper's `data-inview` and rests
 * full, so no-JS and reduced motion show it settled.
 *
 * There is no `label` prop: the card's label is `StatNumber`'s own, rendered
 * from the `Stat`, and a second one here would have been a prop nothing read.
 */
function PoolCard({ children }: { children: ReactNode }) {
  return (
    <article className="relative isolate h-full overflow-hidden rounded-lg border border-line-soft bg-tint p-7 pb-16 shadow-card transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 hover:shadow-float">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[76px]"
      >
        <Pool light />
      </span>
      <div className="relative z-[1]">{children}</div>
    </article>
  );
}

/**
 * The growth band (Part G): the wide gradient bar becomes a `.section-dark`
 * INSET — band A, its own grain, the inverted ink defaults and the stacking
 * context the Pool needs — carrying three odometers over one full-width Pool.
 * /connected-banking's How-It-Works panel is the same construction.
 *
 * EVERY RUN IS `--ink-inv`, and that is §A6's categorical rule rather than a
 * preference or a number: the Pool spans the panel's bottom 46%, the labels
 * sit in that band at every width, and text overlapping a Pool is `--ink-inv`
 * only. The numbers say the rule is free here. On band A's brightest stop
 * (`--plum-700` #42174c) `--ink-inv` #f7f3f9 measures **13.12:1** — globals.css
 * L64 publishes the same 13.1 for that pair — and with a full `--violet-a24`
 * Pool core beneath it (rgb(84,26,99)) **11.22:1**. So promotion costs nothing,
 * where geometry would have cost a dead 60px of padding. The affixes are
 * covered too: `.odo-fix` (globals.css L542–551) sets height/line-height/
 * white-space and no colour, so the "₹" prefix and the " Cr+" suffix inherit
 * `.stat-num`'s `!text-ink-inv` rather than needing an `affixClassName`.
 * (The retired `grad-fill` bar needed `--ink-on-violet-2` for its labels
 * because `--ink-inv-2` is only 3.95:1 on the gradient's #8e24aa stop; on plum
 * that constraint disappears.)
 *
 * `overflow-hidden` so `border-radius: inherit` rounds the basin's bottom
 * corners, content on `relative z-[1]` above the unlayered Pool, and the Pool
 * first in DOM (StatBand's trap). No Caustic: see the file header.
 *
 * THIS IS A TONE SOURCE FOR THE PILL, and that is intended. SiteHeader.tsx
 * L331 observes every `main .section-dark`, so the pill flips dark as this
 * panel crosses its band and back after — a mid-page crossing inside a light
 * section, which is new for this page but not for the site: /connected-banking
 * ships the identical `section-dark … rounded-lg` inset from Phase 9a, gate
 * green. It is safe for Lighthouse for the reason Part B gives — a scroll
 * crossing happens outside the load trace, so Phase 3's `transition: color`
 * never lands in it. The panel spans the full 1240px container, so the pill is
 * dark over a dark surface for the whole crossing; a HALF-width dark plate
 * would not be (see the lens Vessel's note).
 */
function GrowthBand() {
  return (
    <div className="section-dark mt-6 overflow-hidden rounded-lg p-8 md:p-10">
      <Pool />
      <div className="relative z-[1] grid grid-cols-1 gap-6 sm:grid-cols-3">
        {GROWTH_STATS.map((s) => (
          <StatNumber
            key={s.label}
            stat={s}
            numClassName="!text-ink-inv"
            labelClassName="!text-ink-inv"
          />
        ))}
      </div>
    </div>
  );
}
