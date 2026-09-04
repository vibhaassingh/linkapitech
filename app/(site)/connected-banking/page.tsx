import Image from "next/image";
import type { CSSProperties } from "react";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { SectionProgress } from "@/components/sections/home/SectionProgress";
import { Card, Conduit, Droplet, Node, Pool } from "@/components/motifs";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CAPABILITIES, ARCHITECTURE } from "@/content/capabilities";
import { ERPS } from "@/content/clients";
import { cn } from "@/lib/cn";

export const metadata = pageMetadata({
  title: "Connected Banking",
  description:
    "Connected Banking Enterprise Solution brings full banking functionality into the accounting and ERP systems your teams already use — balances, payments, collections and automated reconciliation.",
  path: "/connected-banking",
});

/**
 * Sub-range of the capabilities section's transit that the rail Conduit fills
 * across, and the arithmetic behind it. `useSectionProgress` writes
 * `--sp = (scrollY + vh − sectionTop) / (vh + sectionHeight)`, so an element
 * `d` px below the section's top crosses the viewport CENTRE at
 * `sp = (d + vh/2) / (vh + H)`. The rail runs from the first card's centre
 * (d ≈ 0) to the ninth's (d ≈ H): at 1440×900 with H ≈ 1900px that is
 * sp 0.16 → 0.84, and at 390×844 with H ≈ 2200px it is 0.14 → 0.86. 0.15 /
 * 0.85 is the pair that fits both, and the nine Nodes light independently off
 * their own `view()` transits, so a few points of drift costs nothing.
 */
const RAIL_FROM = 0.15;
const RAIL_TO = 0.85;

/**
 * Fill for the rail Conduit — ProcessRail's mechanism, unchanged: the value is
 * never React state, CSS derives it from the inherited progress, so the cost
 * per frame is one custom-property write on the section.
 *
 * It reads `--sp-live`, not `--sp`, and falls back to 1. `--sp` is `0` on
 * `:root` and the hook is a deliberate no-op under reduced motion, so a
 * consumer reading `--sp` would show an EMPTY rail for reduced-motion users,
 * with JS off and before hydration. `--sp-live` is published by
 * <SectionProgress live> only once a real driver is running, so "no driver"
 * means "finished": a full spine. Content fails open; decoration (the
 * horizontal Conduits in How It Works, which read `--sp` directly) fails
 * closed.
 */
function railFillStyle(): CSSProperties {
  return {
    "--fill": `clamp(0, calc((var(--sp-live, 1) - ${RAIL_FROM.toFixed(4)}) / ${(
      RAIL_TO - RAIL_FROM
    ).toFixed(4)}), 1)`,
    transform: "scaleY(var(--fill))",
  } as CSSProperties;
}

export default function ConnectedBankingPage() {
  return (
    <>
      <PageHero
        eyebrow="Bank integration"
        align="left"
        title={
          <>
            Your <span className="accent-word">bank account,</span> inside your
            ERP.
          </>
        }
        lead="Connected Banking Enterprise Solution brings full banking functionality into the accounting and ERP systems your teams already use. Check balances, make payments, run collections and reconcile automatically — without ever leaving your workflow."
        visual={<ConnectionDiagram />}
      />

      {/* Capabilities. <SectionProgress live> is the only client code here: it
          writes `--sp` on the section and publishes the `--sp-live` alias, and
          the rest of the section stays server-rendered. The anchor id is
          load-bearing — the footer deep-links to it. */}
      <SectionProgress
        live
        id="capabilities"
        className="section-pad bg-canvas"
      >
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="display-2 text-ink">Capabilities</h2>
          </Reveal>

          <div className="relative mt-14">
            {/*
              The spine (V4 Part G): a vertical Conduit replacing the 1px
              `bg-line-plum` rule, whose flow element is the FILL that grows
              down the channel as the reader passes — ProcessRail's construction
              verbatim. `flow="custom"` is what makes that safe: the kit then
              emits no `conduit-*` class and declares no transform on the flow
              element, so `scaleY(var(--fill))` below is the only driver and
              there is nothing to collide with (Part J Phase 7).

              `grid` on the wrapper is load-bearing — `.conduit-v` is
              `height: auto`, so a block child would collapse to 0. The 6px
              track is centred on the 16px Nodes: `left-[5px]` puts its centre
              at x = 8px, and `lg:-ml-[3px]` does the same against the 50%
              line. A negative MARGIN, not a translate: nothing else wants
              `transform` on this element and keeping motifs transform-free is
              what stops cascade collisions before they exist (Part J Phase 8).
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-6 left-[5px] top-6 grid w-1.5 lg:left-1/2 lg:-ml-[3px]"
            >
              <Conduit orientation="v" flow="custom">
                <span
                  style={railFillStyle()}
                  className="absolute inset-0 origin-top rounded-[inherit] bg-[linear-gradient(180deg,var(--lavender-400),var(--violet-500))] opacity-90"
                />
              </Conduit>
            </div>

            {/*
              One Reveal per row rather than a RevealGroup: the rail is nine
              cards tall, so a single group observer fired on the FIRST card and
              ran the whole stagger while cards 5–9 were still far below the
              fold — they were already revealed by the time you reached them.
              Per-row observers also give `.scrub-fade-side` the per-row
              [data-reveal] direction attribute it keys off.
            */}
            <ul className="flex flex-col gap-6 lg:gap-3">
              {CAPABILITIES.map((c, i) => {
                const right = i % 2 === 1;
                return (
                  <li key={c.title} className="relative">
                    {/* The rail Node is absolute, so it takes no grid cell —
                        the card is placed by explicit column rather than
                        `order`, which would have nothing in flow to swap
                        with. */}
                    <div className="grid grid-cols-1 items-center gap-x-12 lg:grid-cols-2">
                      <Reveal
                        dir={right ? "right" : "left"}
                        className={cn(
                          // .scrub-fade-side upgrades the one-shot side
                          // entrance to a scroll-scrubbed one; it is declared
                          // ONLY from 1024px (and only under @supports
                          // animation-timeline), for the same reason
                          // [data-reveal="left"] is — below lg every card is in
                          // one column, where an outward transform pushes the
                          // card past the viewport, widens the document and
                          // produces a phone scrollbar.
                          "scrub-fade-side pl-9 lg:pl-0",
                          right
                            ? "lg:col-start-2 lg:pl-12"
                            : "lg:col-start-1 lg:pr-12",
                        )}
                      >
                        {/*
                          `liq-flat` is correct AND free here, not a budget
                          compromise: nine `.liq-light` cards would be nine
                          blur layers against §A7's ≤ 4 phone / ≤ 8 desktop,
                          and they sit on a FLAT `--canvas`, where a Gaussian
                          blur of a constant field is that constant and
                          `saturate(1.15)` is achromatic — provably zero pixels
                          of difference (Part J Phase 8). The rim ring, the wet
                          edge and `--liq-light-shadow` are what draw the glass.
                        */}
                        <Card
                          tone="light"
                          icon={<Icon name={c.icon} size={19} />}
                          title={c.title}
                          className="liq-flat"
                        >
                          {c.body}
                        </Card>
                      </Reveal>

                      {/*
                        Rail Node (V4 Part G). The 16px plum dot is now a
                        `Node`, and the LIGHTING is the page's existing
                        `.orb-hand-off` logic mapped onto the Node's glow —
                        the same keyframes, on a second `.node-glow` passed
                        through the `icon` slot (ProcessRail's construction):
                        `view()`-timed over the row's own transit, so the glow
                        swells from .35/0.82 to 1/1 exactly as the card crosses
                        the viewport CENTRE and falls away after — the light
                        travelling down the rail with the reader.

                        Using the kit's own class rather than a hand-rolled
                        overlay buys two things: `.node > :not(.node-glow)`'s
                        forced `position: relative` skips it, and motifs.css's
                        reduced-motion `.node-glow { opacity: 1 !important }`
                        re-lights it — `!important` beats the animation, so
                        Part C's "RM: static, lit" holds with no new rule.

                        The old `peer-data-[inview]:scale-100` fallback is gone
                        and needs no replacement: it existed because the bare
                        dot was invisible until it scaled in, whereas a Node is
                        a real 16px disc that paints from the server. Without
                        `view()` support the glow simply rests at the kit's dim
                        .35. `--orb-x` is likewise unnecessary now — the
                        centring is on the wrapper's margins, not on the
                        animated element, which is what `--orb-x` existed to
                        preserve.

                        The wrapper is required: `.node` declares
                        `position: relative` in motifs.css, which is emitted
                        after Tailwind and out-ranks an `absolute` utility on
                        the same element.

                        The FILL is `--violet-500` inline. `.node-light`'s
                        `--lavender-200` disc is designed for a 44px plate
                        carrying a `--violet-text` glyph; as a bare 16px bead on
                        `--canvas` it is ~1.1:1 against its own host and is
                        simply not visible (the Ecosystem port-bead and FAQ
                        marker precedents, Part J Phases 7/8). `--violet-500` is
                        also the colour of the rail fill's lower stop, so the
                        bead reads as the channel it sits in.
                      */}
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -mt-2 lg:left-1/2 lg:-ml-2"
                      >
                        <Node
                          light
                          size={16}
                          style={{ background: "var(--violet-500)" }}
                          icon={
                            <span className="node-glow orb-hand-off" />
                          }
                        />
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </SectionProgress>

      {/* ERP band. Deliberately untouched by Phase 9a: Part G's
          /connected-banking list covers the hero, the capabilities rail and
          How It Works, and Part E row 9's restyle is the HOMEPAGE ErpBand.
          Rebuilding this strip on the light Conduit is a later pass. */}
      <section className="border-y border-line-soft bg-surface py-14">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="text-[13px] font-semibold uppercase tracking-eyebrow text-ink-3">
              ERPs we integrate with
            </h2>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12">
              {ERPS.map((e) => (
                <li
                  key={e.name}
                  className="grid h-12 w-[130px] place-items-center"
                >
                  <Image
                    src={e.logo}
                    alt={e.name}
                    width={130}
                    height={48}
                    style={{ transform: `scale(${e.scale ?? 1})` }}
                    className="max-h-12 w-auto max-w-[130px] object-contain"
                    unoptimized
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* How It Works. The section writes `--sp` (no `live`: the two Conduits
          in the inset are DECORATION and must fail closed — no driver means no
          flow). The anchor id is load-bearing. */}
      <SectionProgress id="how-it-works" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">How It Works</h2>
            <p className="mt-5 max-w-[86ch] text-[15.5px] leading-relaxed text-ink-2">
              {ARCHITECTURE.lead}
            </p>
          </Reveal>

          <Reveal delay={160}>
            {/*
              The dark inset: three Vessels joined by two Conduits (V4 Part G),
              replacing the dashed `.eco-wire` arrows. `.section-dark` gives the
              panel the plum band, the grain and the inverted ink defaults, and
              declares `position: relative; isolation: isolate` itself — so the
              `.liq` Vessels inside are on band A and take band A's AA matrix.
              No Caustic here, deliberately: a `--violet-a24` core behind a
              tier-2 Vessel takes `--ink-inv-2` from 4.52 to 4.01:1, and the
              contrast walk cannot see a sibling overlay (§A6, Part J Phase 6).

              Below lg the five items stack in the base `grid-cols-1` and the
              Conduits switch to vertical; at lg they take the two `auto`
              tracks. Only one of each pair is ever rendered — `display: none`
              removes the other from grid layout entirely.
            */}
            <div className="section-dark mt-12 grid grid-cols-1 items-center gap-4 rounded-lg p-6 md:p-8 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] lg:gap-6">
              <Column
                heading={ARCHITECTURE.left.heading}
                items={ARCHITECTURE.left.items}
              />

              <ArchConduit />

              {/*
                The centre Vessel is tier 3 with a Pool: the data layer is where
                value accumulates. Two consequences, both required:
                  • §A6 — tier 3 over band A composites to a surface where
                    `--ink-inv-2` measures 4.04:1, so EVERY run here is
                    `--ink-inv` (the body copy was `--ink-inv-2`; qa.mjs's
                    ink-on-glass rule fails the build on it). Text overlapping a
                    Pool is `--ink-inv` only anyway.
                  • the Pool is positioned with no z-index and would paint OVER
                    in-flow text, so the content is `relative z-[1]` and the
                    Vessel is `overflow-hidden` so `border-radius: inherit`
                    rounds the basin's bottom corners (StatBand's trap).
                It rises with the surrounding <Reveal>'s `data-inview` and rests
                full, so no-JS and reduced motion show the settled pool.
              */}
              <div className="liq liq-3 liq-static-mobile overflow-hidden rounded-lg p-6 text-center md:p-7">
                <Pool />
                <div className="relative z-[1]">
                  <Node
                    inset
                    lit
                    size={48}
                    className="mx-auto"
                    icon={<Icon name="chip" size={22} />}
                  />
                  <h3 className="mt-5 text-[16.5px] font-semibold text-ink-inv">
                    {ARCHITECTURE.centre.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-inv">
                    {ARCHITECTURE.centre.body}
                  </p>
                </div>
              </div>

              <ArchConduit />

              <Column
                heading={ARCHITECTURE.right.heading}
                items={ARCHITECTURE.right.items}
              />
            </div>
          </Reveal>
        </div>
      </SectionProgress>

      <CtaBand ctaLabel="See Connected Banking in Action" />
    </>
  );
}

/**
 * One flank of the architecture inset: a tier-2 Vessel whose rows are
 * `.liq-inset` chips — nested glass never blurs, which is what keeps three
 * Vessels plus nine chips at three blur layers instead of twelve (§A7).
 *
 * `liq-static-mobile`: below lg the three Vessels stack and all three can share
 * an 844px phone viewport, so three blurs plus the pill nav would be exactly
 * §A7's phone budget with nothing left for CtaBand's glass CTA further down.
 * Above 1024 they keep the frost (3 + CtaBand's 2 + the pill = 6 of 8).
 *
 * Tier 2 over band A puts `--ink-inv-2` at 4.52:1 — the calibrated minimum, so
 * the heading keeps the secondary ink and every row label is `--ink-inv`. The
 * row icons stay `--lavender-400`: 4.36:1 on that composite, which is under the
 * 4.5 TEXT floor and comfortably over 1.4.11's 3:1 for a non-text glyph — so
 * `--lavender-400` must not be used for a text run inside this glass.
 */
function Column({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; icon: IconName }[];
}) {
  return (
    <div className="liq liq-static-mobile rounded-lg p-6">
      <h3 className="text-[11.5px] font-semibold uppercase tracking-eyebrow text-ink-inv-2">
        {heading}
      </h3>
      {/* Rows are nested inside the architecture panel, so they take the 12px
          nested step of the radius scale, not the 20px card step. */}
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <li
            key={it.label}
            className="liq-inset flex items-center gap-3 rounded-md px-4 py-3 text-[14px] font-medium text-ink-inv"
          >
            <Icon name={it.icon} size={17} className="text-lavender-400" />
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The channel between two architecture Vessels: horizontal at lg, vertical
 * below it. `flow="scroll"` means the band crosses the track as the section's
 * `--sp` goes 0 → 1, so the diagram reads as a direction of travel (gateway →
 * server → ledger) rather than a static schematic — the read the retired
 * dashed `.eco-wire` arrows were carrying.
 *
 * Both tracks render, one `hidden lg:block` and one `lg:hidden`, on WRAPPERS:
 * `.conduit` declares `position: relative; display: block` in motifs.css,
 * which is emitted after Tailwind and would out-rank `hidden` on its own
 * element. The vertical wrapper is `grid` so `.conduit-v`'s `height: auto`
 * stretches to it; a block child would collapse to 0.
 */
function ArchConduit() {
  return (
    <>
      <span aria-hidden="true" className="hidden w-16 self-center lg:block">
        <Conduit flow="scroll" />
      </span>
      <span aria-hidden="true" className="mx-auto grid h-10 w-1.5 lg:hidden">
        <Conduit orientation="v" flow="scroll" />
      </span>
    </>
  );
}

/**
 * Hero diagram (V4 Part G) — the horizontal Conduit run that replaces the
 * orbiting-pills composition:
 *
 *     [Node "LinkAPI platform"] ═══ [hub] ═══ [Node "Bank infrastructure"]
 *
 * with the "Partner bank" Droplet above the hub and the "Secure API
 * connection" caption below it. Every label is the previous diagram's, VERBATIM
 * — and "Partner bank" stays generic on purpose: the Figma named a bank here,
 * and naming one inside a product architecture diagram reads as an
 * endorsement (CONTENT-TODO §2).
 * TODO: client to confirm whether a named bank may appear here.
 *
 * TWO CONDUITS PER RUN, FLOWING IN OPPOSITE DIRECTIONS — payments out on the
 * upper track, statements back on the lower one. The reversal is a
 * `-scale-x-100` on a wrapper, which mirrors the track and its band together
 * so the band's bright leading edge stays leading; there is no animation on
 * that wrapper, so nothing contends for its transform.
 *
 * `flow="loop"` rather than `"scroll"`: a hero has no `--sp` driver (it is
 * already mid-transit when the page paints, so a scroll-driven band would sit
 * parked mid-channel and then simply leave). The loop is desktop-only by
 * design; below 1024, and under reduced motion where motifs.css kills it by
 * name, `.conduit-flow` has no transform of its own and the band rests at the
 * head of its channel — a visible, settled pose, not an empty pipe.
 *
 * GEOMETRY. Everything is in normal flow (the old version was absolutely
 * positioned inside an aspect-locked box, which is what made it collapse to
 * 0×0 when the grid track was content-sized — see PageHero's note). All three
 * disc CENTRES line up at y = 28px: the 56px hub's own centre, and the 48px
 * endpoints' via `mt-1` on their columns; the Conduit pair is 20px tall and
 * takes `mt-[18px]`. Widths at the narrowest real case — 390px viewport, less
 * the hero's `px-6` and the Vessel plate's `p-6`, is 294px — are 2×76 + 56 +
 * 4×6 of gap = 224px, leaving 35px for each Conduit run; at lg the plate is
 * 472px wide and each run gets ~84px.
 *
 * The whole diagram stays `aria-hidden`, as it was: it restates the lead
 * paragraph beside it, and duplicating that for assistive tech adds noise, not
 * information.
 */
function ConnectionDiagram() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[520px]">
      <div className="flex justify-center">
        <Droplet
          light
          className="px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-violet-text"
        >
          Partner bank
        </Droplet>
      </div>

      <div className="mt-4 flex items-start gap-1.5 sm:gap-3">
        <Endpoint icon="chip" label="LinkAPI platform" />

        <ConduitRun />

        {/* The hub is LinkAPI's mark, so it keeps `grad-fill`'s gradient —
            Part E row 5 keeps it for the Ecosystem hub for the same reason.
            It arrives as an inline `background`/`color` pair rather than the
            `.grad-fill` class because `.node-light` sets both properties in
            motifs.css, which is emitted after globals.css and after Tailwind
            and would win every one of those ties (the Ecosystem port-bead
            precedent, Part J Phase 7). `.liq liq-1` was the alternative and is
            worse: `.grad-fill` is LATER in globals.css than `.liq`, so its
            `background-image` would silently delete the wet edge, and the
            frost would be a wasted blur layer behind an opaque gradient. */}
        <Node
          light
          lit
          size={56}
          className="flex-none"
          style={{ background: "var(--grad-tile)", color: "var(--ink-inv)" }}
          icon={<Icon name="link" size={24} />}
        />

        <ConduitRun />

        <Endpoint icon="bank" label="Bank infrastructure" />
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 whitespace-nowrap text-[12.5px] text-ink-3">
        <Icon name="shield" size={14} className="text-success" />
        Secure API connection
      </p>
    </div>
  );
}

/** One end of the run: a 48px light Node over its label. */
function Endpoint({ icon, label }: { icon: IconName; label: string }) {
  return (
    <span className="mt-1 flex w-[76px] flex-none flex-col items-center gap-2 text-center sm:w-[104px]">
      <Node light size={48} icon={<Icon name={icon} size={20} />} />
      {/* 10px is the floor scripts/qa/layout.mjs enforces, and it is right —
          these are real labels, not decoration. */}
      <span className="text-[10px] font-medium leading-tight text-ink-2 sm:text-[11.5px]">
        {label}
      </span>
    </span>
  );
}

/** Payments out, statements back — see the ConnectionDiagram note. */
function ConduitRun() {
  return (
    <span className="mt-[18px] flex min-w-0 flex-1 flex-col gap-2">
      <Conduit flow="loop" />
      <span className="block -scale-x-100">
        <Conduit flow="loop" />
      </span>
    </span>
  );
}
