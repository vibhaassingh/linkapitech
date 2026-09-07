import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BANKS, BANK_SLUGS, getBank, type BankPage } from "@/content/banks";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionProgress } from "@/components/sections/home/SectionProgress";
import { Conduit, Node, Pool, Seam } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { StatNumber } from "@/components/ui/StatNumber";
import { cn } from "@/lib/cn";

/**
 * /banks/[slug] — V4 Phase 9b (REDESIGN-V4 Part G).
 *
 * The page's `CARD_LIFT` string is retired: `.liq-live` carries the lift on the
 * light Vessels. The two SOLID cards (the playbook steps' `bg-tint`, the
 * aggregate gradient) keep a hand-rolled `transform` + `box-shadow` hover, and
 * the reason is the SHADOW, not the material — `.liq-live` works on anything,
 * frosted or not. It is `transition: transform` plus
 * `translateY(--liq-lift) scale(--liq-hover-scale)` on `:hover`, and it
 * deliberately touches no `box-shadow` (a Vessel's elevation is
 * `--liq-light-shadow` and does not ramp). These two cards DO ramp
 * `shadow-card → shadow-float`, so `.liq-live` would carry half the gesture
 * and leave the other half to a second rule. They also could not be `.liq` at
 * all: `.liq` sets `background-color` after Tailwind's utilities, so `bg-tint`
 * on one is a silent no-op, and `.grad-fill`'s `background-image` sits later
 * in globals.css than `.liq` and would delete the wet edge.
 *
 * TWO MATERIALS, TWO POSES, both intentional: glass lifts −2px (`--liq-lift`)
 * on `--spring-snappy`, opaque cards lift −4px on `--spring-smooth`. The
 * second is the standing site-wide pose for solid cards (/about L147 and
 * L326, /solutions L241, CoreServices L99) — do not "harmonise" it here
 * alone, that would make this the one page out of five that disagrees.
 *
 * LIGHT GLASS IS `liq-flat` THROUGHOUT, and it is free rather than a
 * compromise: every Vessel this page owns — five capability cards on
 * `--canvas`, two related-bank cards on `--surface` — sits on a FLAT fill with
 * nothing but the section colour behind it, and a Gaussian blur of a constant
 * field IS that constant (`saturate(1.15)` on it is achromatic to the nearest
 * LSB) — Part J Phase 8. Frosted, those seven would be seven blur layers on
 * their own against §A7's ≤ 4 phone budget. The rim ring, the wet edge and
 * `--liq-light-shadow` are what draw the glass.
 *
 * The route's ONE blurring Vessel is PageHero's `.liq liq-light` plate, which
 * this page does not set and which is right as it is: `--grad-wash`'s two
 * violet radials and a light Caustic sit behind it, so there is something real
 * to frost. §A7 count for /banks/axis, per viewport, worst case: 3 desktop
 * (pill + the hero's `.liq liq-1` Droplet + the plate) and 2 phone (the
 * Droplet and CtaBand's do not blur below 1024 — `.liq.liq-1`, globals L991).
 *
 * CONTENT-TRUTH, unchanged and load-bearing: the capability-framed disclaimer
 * below the Overview and the aggregate card's "not bank-specific figures"
 * caption are verbatim, and the caption stays FIRST inside its card — it is
 * what stops the three figures reading as per-bank metrics (CONTENT-TODO §2).
 */

export function generateStaticParams() {
  return BANK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBank(slug);
  if (!b) return {};
  return pageMetadata({
    title: b.meta.title,
    description: b.meta.description,
    path: `/banks/${b.slug}`,
  });
}

export default async function BankDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBank(slug);
  if (!b) notFound();

  const related = BANKS.filter((x) => x.slug !== b.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `${b.name} Integration`,
        serviceType: "Bank API integration",
        description: b.intro,
        provider: {
          "@type": "Organization",
          name: SITE.legalName,
          url: SITE.url,
        },
        areaServed: "IN",
        url: `${SITE.url}/banks/${b.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Bank integrations",
            item: `${SITE.url}/banks`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: b.name,
            item: `${SITE.url}/banks/${b.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        eyebrow={b.eyebrow}
        align="left"
        title={
          <>
            {b.name} <span className="accent-word">integration.</span>
          </>
        }
        lead={b.intro}
        visual={<ConnectionStack bank={b} />}
      />

      {/* Overview + the capability-framing note */}
      <section className="section-pad bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">Overview</h2>
            <p className="mt-5 max-w-[80ch] text-[16px] leading-relaxed text-ink-2">
              {b.overview}
            </p>
          </Reveal>

          {/* Neutral, capability-framed disclaimer (no partnership claim). */}
          <Reveal delay={140}>
            <p className="mt-8 max-w-[80ch] rounded-md border border-line-soft bg-tint px-5 py-4 text-[13.5px] leading-relaxed text-ink-2">
              This page describes LinkAPI Tech&apos;s integration capability for{" "}
              {b.name}&apos;s banking systems. It is not a claim of official
              partnership with, or endorsement by, {b.name}.
              {/* TODO: client to confirm — the real relationship, partner tier,
                  and logo usage rights. */}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">What we integrate</h2>
          </Reveal>

          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            as="ul"
            step={80}
          >
            {/*
              The Card LANGUAGE rather than the `Card` component: a capability
              carries a `body` and an `icon` and no title (content/banks.ts),
              and `Card` requires a `title` it renders as an `h3.heading-3` —
              a sentence in a heading is wrong markup for the sake of reusing a
              component. So the shell is Card's light recipe verbatim, with
              `.card-icon-light`'s lavender disc and the body as the `<p>` it
              is. (The same call the /about "What Sets Us Apart" grid makes;
              recorded in Part J.)

              THE DISC TAKES NO SIZE UTILITY, and that is a correction rather
              than a preference. `.card-icon-light` declares `width: 44px;
              height: 44px` in motifs.css — (0,1,0), the SAME specificity as
              `.h-10`/`.w-10` — and motifs.css is imported after
              `@tailwind utilities` (app/layout.tsx L14), so it wins the tie on
              source order. An `h-10 w-10` here would have rendered 44px
              regardless: a silent no-op of exactly the kind this repo keeps
              re-learning (`bg-tint` on a `.liq`, `.grad-fill` under
              `.node-light`). 44px is Card's own disc, which is the whole point
              of borrowing its recipe, so the utility is gone rather than
              fought.
            */}
            {b.capabilities.map((c) => (
              <div
                key={c.body}
                style={{ "--liq-pad": "28px" } as CSSProperties}
                className="liq liq-light liq-flat liq-live liq-spec icon-draw flex h-full items-start gap-4 rounded-lg p-7"
              >
                <span aria-hidden="true" className="card-icon-light">
                  <Icon name={c.icon} size={18} draw />
                </span>
                <p className="min-w-0 text-[15.5px] leading-relaxed text-ink-2">
                  {c.body}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Connectivity → go-live playbook. <SectionProgress> (no `live`) writes
          `--sp` on the section so the rail's band can travel; the band is
          DECORATION and must fail CLOSED, which is exactly what `--sp` does —
          with no driver it is the `:root` 0 and the band parks off-track. What
          remains without it is the Conduit's own `--lavender-200` track with a
          `--line-soft` hairline, i.e. the visible rail the retired 1px
          `bg-lavender-300` rule drew, so nothing is lost.

          THE ANCHOR ID IS CARRIED OVER FROM V3 UNCHANGED, and so is
          `#capabilities` above. Neither is linked from anywhere in the repo —
          `git grep '#playbook'` and `git grep '#capabilities'` are both empty,
          so the earlier note here claiming `lib/site.ts` links to it was
          simply wrong. They are kept anyway: they are shipped public URL
          surface (three live routes × two fragments), and `SectionProgress`
          spreads `...rest` onto its own `<section>`, so `id` survives the swap
          from a plain `<section>` at no cost. */}
      <SectionProgress id="playbook" className="section-pad bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">From connectivity to go-live</h2>
            <p className="mt-5 max-w-[70ch] text-[16px] leading-relaxed text-ink-2">
              One repeatable playbook, applied to your {b.shortName} use case.
            </p>
          </Reveal>

          <div className="relative mt-14">
            {/*
              The rail is a light `Conduit` (Part G): a `--lavender-200` track
              with a `--line-soft` hairline, carrying the 38%-long violet band
              that crosses it as the section's `--sp` goes 0 → 1 — so the
              playbook reads as a direction of travel rather than as a static
              spine.

              Two wrappers' worth of load-bearing detail: `.conduit` declares
              `position: relative; display: block` in motifs.css, which is
              emitted after Tailwind and would out-rank an `absolute` on the
              same element (Part J Phase 6), and `grid` is required because
              `.conduit-v` is `height: auto` — a block child would collapse to
              0 (Part J Phase 6, WhatWeDo's vertical track).

              The 6px track is centred on the 40px number Nodes exactly as the
              retired 1px rule was: below lg a Node spans x ∈ [0, 40] so the
              track's left is 17px; at lg both centre on the 50% line, the Node
              by a −20px margin and the track by −3px. Negative MARGINS, not
              translates — nothing else wants `transform` on these elements.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-[17px] top-6 grid w-1.5 lg:left-1/2 lg:-ml-[3px]"
            >
              <Conduit orientation="v" flow="scroll" light />
            </div>

            <ol className="flex flex-col gap-8 lg:gap-2">
              {b.steps.map((step, i) => {
                const right = i % 2 === 1;
                return (
                  <li key={step.title} className="relative">
                    {/* The number node is absolutely positioned, so it occupies
                        no grid cell — the card is placed by explicit column,
                        since `order` has nothing in flow to swap with. */}
                    <div className="grid grid-cols-1 items-center gap-x-10 lg:grid-cols-2">
                      <Reveal
                        delay={60}
                        dir={right ? "right" : "left"}
                        className={cn(
                          "pl-14 lg:pl-0",
                          right
                            ? "lg:col-start-2 lg:pl-14"
                            : "lg:col-start-1 lg:pr-14",
                        )}
                      >
                        <article
                          className={cn(
                            "icon-draw relative overflow-hidden rounded-lg bg-tint p-6 shadow-card",
                            "transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 hover:shadow-float",
                            right ? "lg:pl-7" : "lg:pr-7",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute inset-y-0 w-[3px] bg-plum-600",
                              right
                                ? "left-0"
                                : "left-0 lg:left-auto lg:right-0",
                            )}
                          />
                          <div className="flex items-start justify-between gap-6">
                            <div className="min-w-0">
                              <h3 className="text-[17px] font-semibold text-ink">
                                {step.title}
                              </h3>
                              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">
                                {step.body}
                              </p>
                            </div>
                            <span className="grad-tile grid h-10 w-10 shrink-0 place-items-center">
                              <Icon name={step.icon} size={18} draw />
                            </span>
                          </div>
                        </article>
                      </Reveal>

                      {/*
                        The numbered node is a `Node` (Part G), absolute so it
                        lands on the rail regardless of row height. The
                        placement and the centring margins are on this WRAPPER
                        because `.node` declares `position: relative` in
                        motifs.css and out-ranks an `absolute` utility on the
                        same element (Part J Phase 8's general rule).

                        The FILL is `--grad-tile` inline with `--ink-inv` ink:
                        `.node-light` sets `background` AND `color` in
                        motifs.css, which is emitted after globals.css and
                        after Tailwind and wins both ties, so `.grad-fill` plus
                        a text utility cannot reach it (Part J Phase 7's
                        port-bead precedent). `light`, not glass — this is a
                        white section, and a frosted disc behind an opaque
                        gradient would be a wasted blur layer. The `ring-[6px]`
                        lavender halo is kept: it is what lifts the node off
                        the rail.
                      */}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -mt-5 lg:left-1/2 lg:-ml-5"
                      >
                        <Node
                          light
                          lit
                          size={40}
                          className="ring-[6px] ring-[color:var(--lavender-200)]"
                          style={{
                            background: "var(--grad-tile)",
                            color: "var(--ink-inv)",
                          }}
                          icon={
                            <span className="text-[13px] font-semibold">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          }
                        />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </SectionProgress>

      {/* LinkAPI-wide aggregate — the caption lives inside the card so the
          figures can never be screenshotted as per-bank metrics. */}
      <section className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            {/*
              The aggregate band gains a full-width Pool (Part G): value
              accumulating under the figures.

              THE CAPTION STAYS FIRST INSIDE THE CARD, verbatim. It is what
              stops the three figures reading as per-bank metrics, and putting
              it above the numbers rather than under them is the whole point
              (CONTENT-TODO §2) — do not move it, and do not move it out of the
              card.

              §A6 IS SATISFIED BY PROMOTION, not geometry, and it costs nothing
              here: the Pool spans the card's bottom 46%, the three labels sit
              in that band at every width, and text overlapping a Pool is
              `--ink-inv` only — which is what every run in this card already
              was.

              THE ARITHMETIC, recomputed (an earlier note here carried three
              wrong figures and an inverted mechanism). `.grad-fill` is
              `--grad-tile`, #8e24aa → #4a148c, and `.pool` is a radial of
              `--violet-a24` = `--violet-500` (#8e24aa) at .24 — the SAME hue
              as the gradient's bright stop, not a darker liquid:
                bright stop #8e24aa   --ink-inv  6.42:1   ← the floor
                  + a full Pool core  #8e24aa    6.42:1   (unchanged: .24 of a
                                                 colour over itself is itself)
                dark stop   #4a148c   --ink-inv 10.82:1
                  + a full Pool core  #5a1893    9.64:1   (the basin LIGHTENS
                                                 the dark end, so the ink loses
                                                 ~1.2 there — and still clears
                                                 AA by more than 2×)
              So the Pool moves the worst case not at all, and the worst case
              is the gradient's own bright stop at 6.42:1. `--ink-inv-2` is
              3.95:1 there (globals.css L71 publishes 3.91 for the same pair)
              and stays out; `--ink-on-violet-2` is the token that would be
              legal on this surface (4.98:1) and is not needed, because every
              run in this card is already `--ink-inv` — including
              StatNumber's affixes, which inherit the parent `<p>`'s
              `!text-ink-inv` since no `affixClassName` is passed.

              The Pool is FIRST in DOM with the content on `relative z-[1]`:
              `.pool` is positioned with no z-index and would otherwise paint
              OVER in-flow text (StatBand's trap). `overflow-hidden` +
              `border-radius: inherit` round the basin's bottom corners. It
              rises with this Reveal's `data-inview` and rests FULL, so no-JS
              and reduced motion show the settled pool.
            */}
            <div className="grad-fill relative isolate overflow-hidden rounded-lg p-8 shadow-float md:p-10">
              <Pool />
              <div className="relative z-[1]">
                <p className="max-w-[70ch] text-[14px] font-semibold leading-relaxed text-ink-inv">
                  {b.stats.caption}
                </p>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {b.stats.items.map((s) => (
                    <StatNumber
                      key={s.label}
                      stat={s}
                      numClassName="!text-ink-inv"
                      labelClassName="!text-[14px] !text-ink-inv"
                    />
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related banks */}
      <section className="relative bg-surface py-16">
        {/* The kit's hairline, not `border-t border-line-soft`: `.seam-light`
            IS `--line-soft`, so the pixels are identical, but the edge between
            two sections is the Seam's job everywhere else on the site (Part C;
            /industries L78 is this exact absolute-top pattern). Its 220px
            specular rides `--sp`, which has no driver on this section, so it
            parks clipped off the left edge — decoration failing closed, and
            `display: none` below 1024 regardless. `relative` on the section is
            what the absolute wrapper needs; it creates no stacking context
            (no z-index), so nothing below it moves. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0"
        >
          <Seam light />
        </div>

        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-3">
              Other bank integrations
            </h2>
            {/* py-1 keeps the target ≥24px tall (14px × 1.7 alone is 23.8 —
                a hair under WCAG 2.5.8, which this link has already failed
                once). Do not drop it for the sake of a tighter baseline. */}
            <Link
              href="/banks"
              className="link-draw inline-block rounded-sm py-1 text-[14px] font-semibold text-violet-text transition-colors duration-ui hover:text-plum-700"
            >
              All bank integrations &rarr;
            </Link>
          </div>

          <RevealGroup
            className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2"
            as="ul"
            step={90}
          >
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/banks/${r.slug}`}
                aria-label={`${r.name} integration`}
                style={{ "--liq-pad": "24px" } as CSSProperties}
                className="liq liq-light liq-flat liq-live liq-spec group flex items-center justify-between gap-4 rounded-lg p-6"
              >
                <span className="flex h-9 min-w-0 items-center">
                  <BankMark bank={r} boxW={150} boxH={36} decorative />
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[15px] font-semibold text-violet-text transition-transform duration-ui ease-out-expo group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand ctaLabel="See Connected Banking in Action" />
    </>
  );
}

/**
 * A bank mark in a fixed box. `object-contain` does the fitting, so a 9:1
 * wordmark (IndusInd) can never render twice the size of a compact lockup, and
 * `logoScale` is the remaining per-logo optical correction.
 */
function BankMark({
  bank,
  boxW,
  boxH,
  align = "left",
  /** The surrounding link already names the bank, so the mark is decorative. */
  decorative,
}: {
  bank: BankPage;
  boxW: number;
  boxH: number;
  align?: "left" | "center";
  decorative?: boolean;
}) {
  const left = align === "left";
  return (
    <Image
      src={bank.logo}
      alt={decorative ? "" : `${bank.name} logo`}
      width={boxW}
      height={boxH}
      style={{
        maxWidth: boxW,
        maxHeight: boxH,
        transform: `scale(${bank.logoScale})`,
        // The scale must pull toward the same edge object-contain aligns to,
        // or a down-scaled mark drifts away from its own box.
        transformOrigin: left ? "left center" : "center",
      }}
      /* `h-full` is load-bearing, not cosmetic. hsbc.svg carries only a viewBox
         and no width/height, so it has NO intrinsic width, and `width: auto`
         with no intrinsic width resolves to 0 — the mark rendered 0x0 and simply
         did not appear in the related-banks row on /banks/axis and
         /banks/indusind. indusind.svg escaped it purely because its file does
         declare width/height.
         `shrink-0` alone does not fix it: that only stops an item shrinking
         BELOW its base size, and the base size was already 0.
         next/image emits width/height attributes, so the element carries
         `aspect-ratio: auto <boxW>/<boxH>`. Giving it a definite height lets that
         ratio resolve the width, and `object-contain` letterboxes the artwork
         inside the resulting box. */
      className={cn(
        "h-full w-auto shrink-0 object-contain",
        left && "object-left",
      )}
      /* Next already skips the optimizer for SVG; explicit so a future
         dangerouslyAllowSVG can't rasterise a vector mark. */
      unoptimized
    />
  );
}

/**
 * Hero visual — the vertical CONDUIT STACK (REDESIGN-V4 Part G), replacing the
 * bordered `ConnectionCard`:
 *
 *     [ bank mark ]
 *          ║ flowing DOWN
 *     [ Node ] LinkAPI platform          (grad-fill, kept)
 *          ║
 *     [ Node ] Your ERP or platform
 *     "Secure API connection"            (kept, with its shield)
 *
 * The composition brings NO frame of its own, which is why `visualFrame` keeps
 * its default `true`: PageHero's `.liq liq-light` plate is the Vessel the
 * schematic is etched into, and Part J Phase 9a's open item — a card with its
 * own border and `shadow-float` sitting inside that plate — is closed by this
 * change rather than by turning the plate off. The old card's border, white
 * fill and `shadow-float` are gone for the same reason Phase 8 took them off
 * every light Vessel: the plate's rim ring is the border and
 * `--liq-light-shadow` is the elevation (§A2).
 *
 * DELIBERATELY GENERIC BELOW THE MARK. Naming the bank in a product
 * architecture diagram is the only place this page could start to imply
 * endorsement, so the two labels below the mark are the retired card's
 * verbatim and neither mentions it.
 *
 * `flow="loop"`, not `"scroll"`, and that is FORCED: a hero has no `--sp`
 * driver — it is already mid-transit when the page paints, so a scroll-driven
 * band would sit parked mid-channel and then simply leave (Part J Phase 9a's
 * finding for /connected-banking's hero diagram). The loop is ≥1024 by design;
 * below it, and under reduced motion where motifs.css kills it by name,
 * `.conduit-flow` has no transform of its own and the band rests at the HEAD
 * of its channel at opacity .9 — a visible settled pose, not an empty pipe.
 * `conduitFlowV`'s keyframes run `translateY(-100%) → 300%`, i.e. downward,
 * which is the direction Part G asks for with no extra work.
 *
 * The two rows are `Node light` — a light Node is never glass, so the stack
 * adds ZERO blur layers inside a plate that is already one. LinkAPI's row
 * keeps `grad-fill`, as an inline `background`/`color` pair rather than the
 * class: `.node-light` sets both properties in motifs.css, which is emitted
 * after globals.css and after Tailwind and wins both ties (Part J Phase 7's
 * port-bead precedent, Phase 9a's hub Nodes). `.grad-fill` was the
 * alternative and is worse twice over — it sits LATER in globals.css than
 * `.liq`, so on a glass Node its `background-image` would silently delete the
 * wet edge.
 *
 * INK, WITH THE CAUSTIC COMPOSITED BY HAND. A `.caustic` is a sibling overlay
 * at `z-index: -2`, so qa.mjs's contrast walk cannot see it and every number
 * below is worst case: the plate sitting over the light Caustic's core with
 * both of `--grad-wash`'s violet radials at full.
 *     --canvas-2                        #f6f1f7
 *       + rgba(142,36,170,.14)       → rgb(231,212,236)
 *       + rgba(142,36,170,.10)       → rgb(222,195,230)
 *       + --violet-soft .10 (Caustic)→ rgb(214,179,224)
 *       + --liq-light-2-fill (.70 W) → rgb(243,232,246)   ← what text sits on
 *   --ink   #1d1d1f  14.18:1  the two row labels
 *   --ink-3 #6e6779   4.56:1  the caption. Allowed on tier 2 and forbidden
 *                             only on `.liq-light.liq-1` (§A6) — and it lands
 *                             exactly on §A6's published tier-2 figure, i.e.
 *                             three violet layers cost it nothing measurable.
 *                             It has 0.06 of headroom: do NOT add a fourth
 *                             violet layer under this plate.
 * The 12.5px caption clears layout.mjs's 10px floor.
 *
 * The shield glyph is `--success` (#1fa971), 2.54:1 on that composite, and it
 * stays: `Icon` renders `aria-hidden="true" focusable="false"`, and the words
 * beside it say the same thing, so it is a decorative redundant graphic and
 * outside SC 1.4.11 rather than a failure of it. `--success-text` (#147d52,
 * 4.33:1) is the token if it ever carries meaning on its own. Kept identical
 * to /connected-banking L508, which pairs the same glyph with the same caption
 * on the same light plate — the two must not drift apart.
 */
function ConnectionStack({ bank }: { bank: BankPage }) {
  return (
    <div className="mx-auto w-full max-w-[380px]">
      <div className="flex h-14 items-center justify-center">
        <BankMark bank={bank} boxW={200} boxH={56} align="center" />
      </div>

      <StackConduit />

      <StackRow icon="link" label="LinkAPI platform" emphasis />

      <StackConduit />

      <StackRow icon="grid" label="Your ERP or platform" />

      <p className="mt-5 flex items-center justify-center gap-2 text-[12.5px] text-ink-3">
        <Icon name="shield" size={14} className="text-success" />
        Secure API connection
      </p>
    </div>
  );
}

/**
 * One rung of the stack: a light Node and its label, centred.
 *
 * `emphasis` is LinkAPI's own rung and takes `--grad-tile` with `--ink-inv`
 * ink; the other takes `.node-light`'s lavender disc with a `--violet-text`
 * glyph, which is that class's designed use at this size (Part J Phase 7).
 *
 * BOTH RUNGS REST `lit`, and that is a fix rather than a flourish. motifs.css
 * L196 lights every Node inside a glass card on `:hover` / `:focus-within`
 * — `.liq:hover .node-glow { opacity: 1 }` — and these Nodes sit inside
 * PageHero's `.liq liq-light` plate, so pointing anywhere on the plate used to
 * bloom the "Your ERP or platform" disc from .35 to full. That rule is the
 * Challenges beat (dim = flow blocked, hover = we solve it); NOTHING on this
 * route is meant to read as blocked, so an inherited hover that says otherwise
 * is an interaction nobody chose. Resting both lit makes the rule a no-op
 * here, matches Part C's "a Node under reduced motion is static AND lit", and
 * costs no hierarchy: the emphasis rung is told apart by its `--grad-tile`
 * fill and its semibold label, not by a glow the gradient hides anyway.
 * Contrast is unaffected either way — the lavender disc's `--violet-text`
 * glyph measures 6.64:1 dim and 5.66:1 lit (`--violet-glow` is
 * rgba(142,36,170,.16) at full), and the gradient rung is 6.42:1 lit or dim
 * because .16 of `--violet-500` over `--violet-500` is `--violet-500`.
 */
function StackRow({
  icon,
  label,
  emphasis,
}: {
  icon: "link" | "grid";
  label: string;
  emphasis?: boolean;
}) {
  return (
    <div className="icon-draw flex items-center justify-center gap-3">
      <Node
        light
        lit
        size={44}
        style={
          emphasis
            ? { background: "var(--grad-tile)", color: "var(--ink-inv)" }
            : undefined
        }
        icon={<Icon name={icon} size={19} draw />}
      />
      <span
        className={cn(
          "text-[14.5px] text-ink",
          emphasis ? "font-semibold" : "font-medium",
        )}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * The channel between two rungs. A 28px vertical Conduit in a `grid` wrapper —
 * `.conduit-v` is `height: auto`, so a block child would collapse to 0 — and
 * the wrapper is required at all because `.conduit` declares
 * `position: relative; display: block` in motifs.css, which is emitted after
 * Tailwind and would out-rank a `mx-auto`-less layout on the same element.
 *
 * `light` is required, not stylistic: the DEFAULT track is `--glass-1-bg`
 * (`rgba(255,255,255,.05)`), which over PageHero's near-white plate composites
 * to white and leaves no channel at all — the travelling band would read as a
 * floating dash rather than as liquid in a pipe. The light track is
 * `--lavender-200` with a `--line-soft` inset hairline (1.25:1 against the
 * plate — a soft channel, exactly as on /services' white rail), and the
 * `--lavender-400 → --violet-500` band inside it is the bright part. The 6px
 * width and the 38% band length are the kit's.
 */
function StackConduit() {
  return (
    <span aria-hidden="true" className="mx-auto my-3 grid h-7 w-1.5">
      <Conduit orientation="v" flow="loop" light />
    </span>
  );
}
