import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { BANKS } from "@/content/banks";

export const metadata = pageMetadata({
  title: "Bank Integrations | Axis, IndusInd & HSBC — LinkAPI Tech",
  description:
    "LinkAPI Tech integrates corporate and BFSI platforms with leading banks — Axis Bank, IndusInd Bank, and HSBC — from secure connectivity through production support.",
  path: "/banks",
});

/**
 * Bank integrations hub — the three banks LinkAPI has licensed vector marks
 * for (REDESIGN-V4 Part G).
 *
 * LIGHT PAGEHERO BY INHERITANCE, and it ends in a flat Seam rather than a
 * curve. `PageHero` defaults to `tone="light"` (`.section-wash relative
 * isolate`, one light Caustic lower-right, a light Seam), so this route passes
 * no `tone` at all. The missing Meniscus is a decision, not an oversight: Part
 * C caps it at three uses site-wide and Phase 9a spent the last one on the
 * DARK hero, so no later call site may add a fourth (Part J Phase 9a).
 *
 * THE THREE CARDS ARE THE ONLY GLASS ON THE PAGE, and they deliberately do not
 * route through `Card`. Part C's Card-replaces-`CARD_LIFT` list names /about,
 * /solutions and /banks/[slug] — not this index, whose card is a licensed mark
 * over an intro over a floor-pinned affordance, with no icon or heading slot to
 * hand `Card`. So it speaks `Card`'s grammar verbatim instead (`liq liq-light
 * liq-live liq-spec`, `--liq-pad: 28px`, `p-7`) and the two families stay one
 * language without a prop that only one call site would ever use.
 *
 * THE DISCLAIMER IS LOAD-BEARING. CONTENT-TODO §1/§2: the real relationship
 * with Axis, IndusInd and HSBC is unconfirmed, so every /banks page is written
 * as CAPABILITY, and that note is the only thing standing between a grid of
 * three bank marks and a partnership roster. It stays opaque `bg-tint`, at
 * full reading width, immediately under the grid — never softened, never moved
 * below the fold, never restyled into glass, and its wording is client-facing
 * copy that only the client may change.
 *
 * BLUR BUDGET (§A7 — ≤ 4 layers per phone viewport, ≤ 8 per desktop, counting
 * the chrome that renders on every route). The whole route has THREE
 * backdrop-filtered elements and only one of them blurs on a phone: the pill
 * (always, every size), the hero's eyebrow Droplet and CtaBand's, both
 * `.liq.liq-1`, which globals.css downgrades to `backdrop-filter: none` below
 * 1024. So **390 is 1 of 4** and **1440 is at most 3 of 8** — and 3 only on a
 * desktop viewport tall enough to hold both Droplets at once, which needs
 * ~940px of height at this page's length; the ordinary case is 2. The cards
 * are `liq-flat` and the footer carries no glass. `CtaBand`'s
 * `variant="glass"` Button — the one tier-2 layer here that would blur at
 * every size — is NOT on this page: it renders only when a `secondary` CTA is
 * passed, and this call site passes none.
 */
export default function BanksIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Bank integrations"
        align="center"
        title={
          <>
            The banks we help you{" "}
            <span className="accent-word">connect to.</span>
          </>
        }
        lead="LinkAPI wires your platform to each bank's systems using one proven playbook — secure connectivity, configuration and empanelment, UAT to production, and support after go-live."
      />

      <section className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <RevealGroup
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            step={90}
          >
            {BANKS.map((b) => (
              /*
                Each card is a light Vessel (REDESIGN-V4 Part G): `.liq
                liq-light` with `.liq-live`'s hover pose — `--liq-lift` (−2px)
                plus `--liq-hover-scale` (1.012) on `--spring-snappy`, whose
                linear() stop list peaks past 1 so the card genuinely
                overshoots and settles — and `.liq-spec`'s pointer specular
                masked to `--liq-pad`. That is set to 28px here, exactly this
                card's `p-7`, so the .10 violet highlight is confined to a
                text-free frame and can never sit under the intro copy. The
                flat border and `shadow-card` are gone: the rim ring IS the
                border and `--liq-light-shadow` IS the elevation (§A2, Part J
                Phase 8), and `bg-surface` would have been a silent no-op
                anyway (`.liq` sets `background-color` after Tailwind's
                utilities — the trap Phase 2 recorded for `Card`'s light
                feature). Nothing here reflows — transform and box-shadow only,
                so CLS stays 0 — and under reduced motion the global block
                collapses transition-duration to 0.001ms, so the lift becomes
                an instant state change and `.liq-spec::after` is `display:
                none` outright.

                `.liq-live` owns `transform` on this element and is EXCLUSIVE
                with `.liq-enter` / `.scrub-drift` / `.card-depth` /
                `[data-tilt]` (§A4) — the arrow's `group-hover:translate-x-1`
                is on a CHILD, so it composes rather than contending.

                `liq-flat`, and the reason is arithmetic rather than budget
                (Part J Phase 8; Phase 9a made it the default for a Card GRID
                on the same grounds). This section is a flat `--canvas` with
                nothing behind the cards, and a Gaussian blur of a constant
                field IS that constant, while `saturate(1.15)` on rgb(250, 248,
                252) computes to rgb(250.19, 247.89, 252.49) — the same colour
                to the nearest LSB. The frost here would be provably zero
                pixels of difference for real GPU cost; the rim, the wet edge
                and the shadow are what draw the glass. The budget only agrees:
                three frosted cards plus the pill would be 4 at 390, exactly
                §A7's phone cap with no headroom left for the chrome.

                §A8: the only ancestor between this card and the section is
                `RevealGroup`'s `[data-reveal]` wrapper, whose `opacity: 0` and
                `will-change: opacity` both end at their resting values once
                `data-inview` lands — a TRANSIENT backdrop root, which is the
                case §A8 exempts. `liq-flat` moots the question either way, so
                this card cannot lose a frost it never asks for.

                INK, computed the way qa.mjs's walk composites (brightest stop
                of every layer, source-over). `--liq-light-2-fill` .70 white
                over `--canvas` plus `--liq-light-edge`'s .95 stop is
                rgb(254.9, 254.9, 255.0), L = 0.9992: `--ink-2` (the intro)
                measures 9.27:1 and `--violet-text` (the affordance) 9.34:1 —
                the same 9.27 `Card` recorded for light tier 2 in Phase 9a,
                because the fill and edge composite to near-white whatever the
                host. Worst case with the specular at full strength beneath a
                glyph, `--ink-2` is still 7.87:1. This is tier 2, not `liq-1`,
                so §A6's `--ink-3` prohibition does not even apply (it is 5.41
                here); no run uses it regardless. There is no Pool and no
                Caustic core anywhere on this page, so there is no sibling
                overlay for the walk to be blind to.
              */
              <Link
                key={b.slug}
                href={`/banks/${b.slug}`}
                style={{ "--liq-pad": "28px" } as CSSProperties}
                className="liq liq-light liq-flat liq-live liq-spec group flex h-full flex-col rounded-lg p-7"
              >
                {/* Fixed box + object-contain, so a 9:1 wordmark can't outweigh
                    a compact lockup; logoScale is the optical nudge. */}
                <span className="flex h-9 items-center">
                  <Image
                    src={b.logo}
                    alt={`${b.name} logo`}
                    width={150}
                    height={36}
                    style={{
                      transform: `scale(${b.logoScale})`,
                      transformOrigin: "left center",
                    }}
                    className="max-h-9 w-auto max-w-[150px] object-contain object-left"
                    /* Next already skips the optimizer for SVG; explicit so a
                       future dangerouslyAllowSVG can't rasterise a vector mark. */
                    unoptimized
                  />
                </span>

                <p className="mt-6 text-[14.5px] leading-relaxed text-ink-2">
                  {b.intro}
                </p>

                {/* mt-auto pins the affordance to the card floor, so the three
                    cards' links line up despite different intro lengths. */}
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[14px] font-semibold text-violet-text">
                  {b.shortName} integration
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-ui ease-out-expo group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </RevealGroup>

          {/* Capability framing, stated on the hub as well as each bank page, so
              the grid of marks can never read as a partnership roster.

              DELIBERATELY NOT GLASS. `bg-tint` is opaque `--card-tint`, which
              is why `--ink-2` measures 8.22:1 on it against the material's
              9.27 — the note must be at least as legible as the cards it
              qualifies, and an opaque panel is the one surface on this page
              whose contrast no overlay, blur or hover state can move. It also
              keeps the note visually OUTSIDE the Vessel family: it qualifies
              the grid, it is not a fourth card. `mt-10 max-w-[80ch]` puts it
              directly under the grid at full reading width — CONTENT-TODO
              §1/§2 make this wording load-bearing, so it must never be
              softened, moved below the fold, or restyled into something
              lighter. Only the client may change the words. */}
          <Reveal delay={120}>
            <p className="mt-10 max-w-[80ch] rounded-md border border-line-soft bg-tint px-5 py-4 text-[13.5px] leading-relaxed text-ink-2">
              Each page describes LinkAPI Tech&apos;s integration capability for
              that bank&apos;s systems. None is a claim of official partnership
              with, or endorsement by, the bank named.
              {/* TODO: client to confirm — the real relationship with each bank
                  (partner tier, empanelment status) and usage rights for the
                  reproduced bank marks. */}
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="Talk to an Integration Specialist" />
    </>
  );
}
