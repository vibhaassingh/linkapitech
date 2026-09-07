import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { OfferTimeline } from "@/components/sections/services/OfferTimeline";
import { CoreServices } from "@/components/sections/services/CoreServices";
import { PartnerProgram } from "@/components/sections/services/PartnerProgram";
import { Reveal } from "@/components/motion/Reveal";
import { ConduitPath, Node } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { SERVICES_HERO, ENGAGEMENT, SERVICES } from "@/content/services";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "API integration and bank connectivity, ERP reconciliation plugins, transaction reconciliation, adapters and parsers, custom security, and WAN/LAN support for banks, NBFCs and enterprises.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      {/*
        `visualFrame={false}` (Part J Phase 9a's open item, and the task card's
        instruction). Two reasons it stays false now that the visual is a
        DIAGRAM rather than the raster the flag was raised for: the manifold
        below is already a framed composition — the wash IS its ground and a
        `.liq liq-light` plate around it would double the frame the hero's own
        `--grad-wash` provides — and a plate is one more backdrop-filtered layer
        on a route that carries a second glass cluster further down
        (PartnerProgram). Recorded in Part J.
      */}
      <PageHero
        align="left"
        title={
          <>
            {SERVICES_HERO.titlePlain1}{" "}
            <span className="accent-word">{SERVICES_HERO.titleAccent}</span>{" "}
            {SERVICES_HERO.titlePlain2}
          </>
        }
        lead={SERVICES_HERO.lead}
        visual={<ServiceManifold />}
        visualFrame={false}
      />

      <OfferTimeline />
      <CoreServices />
      <PartnerProgram />

      {/* Engagement & pricing */}
      <section id="pricing" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">{ENGAGEMENT.heading}</h2>
          </Reveal>
          <Reveal delay={120}>
            {/* Engagement is a light Vessel (Part G). `liq-flat` is free here:
                the section is a flat `--canvas` and a Gaussian blur of a
                constant field is that constant (Part J Phase 8). No flat
                border and no `shadow-card` — the rim ring is the border and
                `--liq-light-shadow` is the elevation (§A2). */}
            <div className="liq liq-light liq-flat mt-12 rounded-lg p-8 md:p-10">
              <p className="max-w-[88ch] text-[17px] leading-[1.75] text-ink-2">
                {ENGAGEMENT.lead}{" "}
                <strong className="font-semibold text-violet-text">
                  {ENGAGEMENT.boldA}
                </strong>{" "}
                {ENGAGEMENT.midA}{" "}
                <strong className="font-semibold text-violet-text">
                  {ENGAGEMENT.boldB}
                </strong>{" "}
                {ENGAGEMENT.tail}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="Request a Quote" />
    </>
  );
}

/* ── The manifold's geometry ────────────────────────────────────────────────
   One 5:4 viewBox shared by the SVG channels and the DOM Nodes, so a Node's
   centre lands on its channel's endpoint at any rendered size: the SVG scales
   with `xMidYMid meet` on a box whose aspect ratio matches the viewBox exactly,
   so one unit is the same number of px on both axes and a `%` position in the
   DOM is the same point as a unit position in the SVG.

   Seven satellites on an ellipse whose radii are 40% of the viewBox's width
   and height, starting at the top (−90°) and stepping 360/7 = 51.43°, so the
   extreme discs land at x ∈ [110, 890] and y ∈ [80, 688] units — ±22px of
   disc clears the box on both axes at the narrowest real case (342px → the
   discs span x ∈ [15.6, 326.4], y ∈ [5.4, 257.3] of a 342 × 273.6 box), which
   is what keeps `scrollWidth === clientWidth`. RX/RY are in viewBox units. */
const VB = { w: 1000, h: 800 } as const;
const HUB = { x: VB.w / 2, y: VB.h / 2 } as const;
const RX = 400;
const RY = 320;
/** Node diameters, px. The hub is the emphasis; the satellites are endpoints. */
const HUB_SIZE = 64;
const SAT_SIZE = 44;
/**
 * Where each channel stops, in viewBox units — and the rule is that a channel
 * must end UNDER its disc at every rendered size, never short of one.
 *
 * The tension is that the gaps are in viewBox units (they scale with the box)
 * while the discs are a fixed px size (they do not). The box runs 342px at a
 * 390 viewport up to the `max-w-[560px]` cap, i.e. 0.342 → 0.560 px per unit,
 * a factor of 1.64 — so no single pair of numbers can hold a constant px
 * clearance. Overlap, though, is FREE: the SVG is the first child and both
 * discs are opaque (`--lavender-200`, `--grad-tile`) and paint over it, so a
 * channel end tucked inside a disc is simply masked. A channel end left
 * OUTSIDE one is a visible floating gap. So the gaps are sized for the WIDEST
 * case and allowed to sink further in as the box narrows:
 *   satellite  r = 22px → 22 / 0.560 = 39.3 units is the ceiling; 34 units is
 *              19.0px at 560 (3px in) and 11.6px at 342 (10px in)
 *   hub        r = 32px → 32 / 0.560 = 57.1 units is the ceiling; 50 units is
 *              28.0px at 560 (4px in) and 17.1px at 342 (15px in)
 * The shortest run — the top satellite, 320 units from the hub — still leaves
 * 320 − 34 − 50 = 236 units of channel, so nothing collapses at the tight end.
 *
 * A previous pass sized these for CLEARANCE at 342px, which left the widest
 * case 0.6px from the disc edge: one token change away from a visible gap,
 * with the failure invisible in every check. Sizing for occlusion inverts that
 * — the slack now runs in the direction that self-hides.
 */
const SAT_GAP = 34;
const HUB_GAP = 50;

const SATS = SERVICES.map((s, i) => {
  // `SERVICES.length`, NOT a hardcoded 7: at eight services `i = 7` resolves
  // to −90 + 360, the same angle as `i = 0`, and two satellite Nodes render
  // exactly on top of each other at the top of the manifold. Nothing throws,
  // so nothing reports it — the silent half of the `LIT_AT` bug class this
  // phase fixed in WhatWeDo. Note the `aria-label` below is a hand-written
  // string that names seven categories (it is the retired `<img alt>`
  // verbatim), so a content change still needs a human there — this only
  // stops the DRAWING from silently stacking two Nodes.
  const a = (-90 + i * (360 / SERVICES.length)) * (Math.PI / 180);
  return {
    id: s.id,
    icon: s.icon,
    x: HUB.x + RX * Math.cos(a),
    y: HUB.y + RY * Math.sin(a),
  };
});

/**
 * Hero visual — the MANIFOLD (REDESIGN-V4 Part G): LinkAPI at the centre of
 * seven service channels, replacing `/illus/hub-isometric.webp`.
 *
 * ICON-ONLY, and that is the constraint rather than a simplification: the
 * seven `SERVICES[]` titles are the Core Services section's copy and repeating
 * them here would be a second, competing list — so each endpoint carries its
 * category's glyph and nothing else. The retired <img>'s `alt` string listed
 * the seven categories, and that information is preserved VERBATIM as this
 * composition's accessible name (`role="img"` + `aria-label`): the same
 * sentence, moved from an `alt` attribute to an `aria-label`, so a screen
 * reader hears exactly what it heard before. No new copy anywhere on the page.
 *
 * The channels are `ConduitPath`s — the SVG Conduit — bowed away from their
 * chords by 12% of the run so seven spokes fan out instead of collapsing into
 * a starburst (the Ecosystem constellation's construction, Part J Phase 7).
 * Each carries a `.conduit-pulse` packet, `pathLength="100"` normalised so the
 * `8 92` dasharray is one packet per channel whatever its length, staggered
 * `i × −0.857s` across the shared 6s period — one arrival every 857ms.
 * `.conduit-pulse` is `display: none` below 1024 and under reduced motion, so
 * at those sizes the manifold is its solid `--lavender-300` channels and is
 * complete and static (Part J Phase 9a).
 *
 * INK / VISIBILITY, composited by hand — the walk cannot see any of this,
 * because a `.node-glow` is a sibling overlay and `--grad-wash`'s blooms are
 * background layers of the SECTION, not of the glyph's ancestors:
 *   satellite glyph  `--violet-text` #6f257f on `--lavender-200` #e9dfeb
 *                    with the lit `.node-glow` (`--violet-glow`
 *                    rgba(142,36,170,.16)) over it → rgb(218,193,225)
 *                    → 5.66:1   (7.22:1 with the glow at its .35 rest)
 *   hub glyph        `--ink-inv` #f7f3f9 on `--grad-tile`'s brightest stop
 *                    `--violet-500` #8e24aa → 6.42:1. The glow is that same
 *                    violet at .16, so over the bright stop it composites to
 *                    itself and the number does not move.
 *   channels         `--lavender-300` #d9cce3 on the wash's darkest realistic
 *                    point (the 92% 15% bloom, rgba(142,36,170,.14) over
 *                    `--canvas-2`, plus PageHero's `--violet-soft` Caustic) —
 *                    ~1.3:1, the light Conduit's own weight site-wide.
 * Only the glyphs are held to 4.5 and both clear it. The discs and channels
 * carry no information — the composition is ONE `role="img"` whose name is the
 * retired alt sentence — so WCAG 1.4.11's 3:1 does not ride on them (the
 * Ecosystem port-bead and FAQ-marker reasoning, Part J Phases 7/8).
 *
 * The hub Node takes an inline `background`/`color` pair rather than
 * `.grad-fill`, because `.node-light` sets both properties in motifs.css, which
 * is emitted after globals.css and after Tailwind and wins every one of those
 * ties (Part J Phase 7's port-bead precedent, Phase 9a's hub Nodes).
 *
 * EVERY NODE IS `lit`, hub and satellites alike. Part I's standing risk is that
 * dim Nodes read as broken UI, and dimness is only legible where something
 * EARNS the lighting later: Challenges has a hover beat, WhatWeDo and the
 * capabilities rail have an `--sp` sequence. A hero has no `--sp` driver at all
 * — it is already mid-transit when the page paints (Part J Phase 9a) — so
 * seven endpoints resting at the `.node-glow` default of .35 would simply be
 * seven permanently dim discs. It also removes a divergence: motifs.css's
 * reduced-motion block lights every `.node-glow` by name, so dim satellites
 * would have made the reduced-motion composition brighter than everyone
 * else's. PartnerProgram's cluster on this same route made the identical call
 * for the identical reason.
 *
 * The hub and the seventh satellite share the `link` glyph, deliberately. The
 * site's LinkAPI hub mark is `Icon name="link"` on `--grad-tile` — set by
 * /connected-banking's hero in Phase 9a — and `SERVICES[6]` ("API Integration
 * & Bank Connectivity") carries the same glyph from `content/services.ts`,
 * which this phase may not edit. Breaking the hub's site-wide mark to
 * de-duplicate one endpoint costs more than the repetition does: the hub is
 * already separated by size (64 vs 44), fill (gradient vs lavender) and ink,
 * and the whole composition is one `role="img"`, so nothing reads the glyphs
 * as a list. The alternative — inlining `chrome/Logo.tsx`'s three mark paths —
 * would fork a mark that already carries a "client to confirm the official
 * vector" TODO.
 */
function ServiceManifold() {
  return (
    <div
      role="img"
      aria-label="LinkAPI Tech at the centre of an integration network — banks and financial institutions, ERP systems, core banking, payment gateways, cloud infrastructure, third-party applications, and security and compliance."
      className="relative mx-auto aspect-[5/4] w-full max-w-[560px]"
    >
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        {SATS.map((s, i) => {
          const dx = HUB.x - s.x;
          const dy = HUB.y - s.y;
          const len = Math.hypot(dx, dy) || 1;
          const x1 = s.x + (dx / len) * SAT_GAP;
          const y1 = s.y + (dy / len) * SAT_GAP;
          const x2 = HUB.x - (dx / len) * HUB_GAP;
          const y2 = HUB.y - (dy / len) * HUB_GAP;
          // Bow the channel off its chord, perpendicular to the run.
          const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
          const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
          return (
            <ConduitPath
              key={s.id}
              d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`}
              light
              pulse
              pulseDelay={`${(i * -0.857).toFixed(3)}s`}
            />
          );
        })}
      </svg>

      {/* Hub — LinkAPI. `.node` declares `position: relative` in motifs.css and
          out-ranks an `absolute` utility on the same element, so the placement
          lives on a wrapper (the general form of the Phase-6 Seam/Conduit
          rule). Centring is a negative margin, not a translate: nothing else
          wants `transform` on these elements and keeping the motifs
          transform-free is what stops cascade collisions before they exist. */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2"
        style={{ marginLeft: -HUB_SIZE / 2, marginTop: -HUB_SIZE / 2 }}
      >
        <Node
          light
          lit
          size={HUB_SIZE}
          style={{ background: "var(--grad-tile)", color: "var(--ink-inv)" }}
          icon={<Icon name="link" size={26} />}
        />
      </span>

      {/* Seven endpoints, one per SERVICES category. */}
      {SATS.map((s) => (
        <span
          key={s.id}
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${((s.x / VB.w) * 100).toFixed(3)}%`,
            top: `${((s.y / VB.h) * 100).toFixed(3)}%`,
            marginLeft: -SAT_SIZE / 2,
            marginTop: -SAT_SIZE / 2,
          }}
        >
          <Node
            light
            lit
            size={SAT_SIZE}
            icon={<Icon name={s.icon} size={19} />}
          />
        </span>
      ))}
    </div>
  );
}
