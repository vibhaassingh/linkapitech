import { Reveal } from "@/components/motion/Reveal";
import { ConduitPath, Node } from "@/components/motifs";
import { PARTNER_PROGRAM } from "@/content/services";

/**
 * Partner & Influencer Program — plum band with a glass cluster diagram: five
 * partner types on Conduit spokes around a glowing LinkAPI core (Figma page 37).
 *
 * The cluster is gated at `xl:`, not `lg:`: at exactly 1024px the absolutely
 * positioned nodes at percentage offsets overflowed their container. Below xl
 * they fall back to a plain wrapping list — do not widen that gate.
 *
 * ── V4 (Phase 9b) ─────────────────────────────────────────────────────────
 * `glass` → `.liq liq-3` (the Vessel), `glass-strong` chips → `Node`s with
 * `ConduitPath` spokes, and the `<xl` `glass` pills → `.liq liq-1 liq-flat`.
 *
 * TIER 3 OVER BAND A HOSTS `--ink-inv` ONLY, and this section is a BARE
 * `.section-dark`, whose `--grad-section` is band A's gradient verbatim
 * (globals.css L108 / L117). Computed the way qa.mjs's contrast walk does it —
 * brightest stop of every background layer, source-over — tier 3 over
 * plum-700 composites to rgb(109, 75, 116), where:
 *   `--ink-inv`   #f7f3f9   6.56:1  ✓   (the spec's calibrated value, exactly)
 *   `--ink-inv-2` #cebcd4   4.03:1  ✗   — qa.mjs's ink-on-glass rule fails the
 *                                          build on it (§A6)
 * so every run inside the Vessel is `--ink-inv`. The hub's violet core makes
 * that better, not worse: `rgba(142,36,170,.75)` over the same composite is
 * rgb(134, 46, 157), where `--ink-inv` measures **6.64:1** — the core is
 * DARKER than the glass, so the label gains 0.08. (A Caustic would be the
 * opposite case and there is none here.)
 *
 * The `--ink-inv-2` lead below is NOT on glass — it sits on the bare band,
 * where the token's own calibration table measures it at 8.07:1 over
 * `--plum-700` (globals.css L44–54). The tier-3 prohibition is a rule about
 * hosts, not about the token.
 *
 * The `<xl` fallback pills are tier 1, which composites to rgb(99, 63, 107)
 * over the same band: `--ink-inv` **7.79:1** there.
 *
 * BLUR BUDGET (§A7). The Vessel is one layer at xl+ and the Nodes inside it
 * are `.liq-inset` — a veil fill and one inset highlight, never a second
 * backdrop-filter, which is what keeps a panel plus five endpoints at ONE blur
 * instead of six. Below xl the five pills are `.liq liq-1 liq-flat`: `.liq-1`
 * already drops its frost below 1024, but 1024–1279px would otherwise render
 * five blurred pills, so `liq-flat` covers the whole range — the Ecosystem
 * ten-chip precedent (Part J Phase 7).
 *
 * §A8 (BACKDROP ROOT). This Vessel is the ONLY element on /services that
 * actually blurs, so it is the only one the rule can bite. Its ancestors are
 * `<Reveal>`'s `[data-reveal]` and `.section-dark`. `[data-reveal]` is
 * `opacity: 0 → 1` with `will-change: opacity, transform`, but
 * `[data-reveal][data-inview]` resets to `opacity: 1; will-change: auto`
 * (globals.css L1086–1090) — the frost is dead only for the length of the
 * entry transition, which is the case Part J Phase 9a rules acceptable.
 * `.section-dark` sets `position: relative; isolation: isolate` and nothing
 * else; its grain is a `::after`, and a pseudo-element is a SIBLING of the
 * content, not an ancestor, so its `mix-blend-mode: overlay` is out of scope.
 * Nothing here needs `liq-flat`.
 */

/**
 * Node anchors, as percentages of the cluster box. Tuned so a 120px centred
 * label below a 44px disc stays inside the panel at the narrowest xl case
 * (a ~548px column at a 1280px viewport): the extreme x values 13% and 81%
 * put a label's edges at 11px and 504px of 548, and the lowest node's label
 * bottom lands at ~424px of the 438px box.
 */
const NODE_POS = [
  { x: 30, y: 14 },
  { x: 74, y: 24 },
  { x: 13, y: 55 },
  { x: 81, y: 58 },
  { x: 46, y: 84 },
];

/**
 * The anchors actually used, for `n` = however many nodes `content/` carries.
 *
 * DERIVED FROM THE CONTENT LENGTH, and that is a fix rather than a tidy-up —
 * it is the `LIT_AT` bug (WhatWeDo.tsx, fixed earlier this phase) in both
 * directions at once. `NODE_POS` is five hand-tuned entries and this file used
 * to index the two arrays with each other's counter: the spokes mapped
 * `NODE_POS` while keying off `PARTNER_PROGRAM.nodes[i]`, and the labels
 * mapped `PARTNER_PROGRAM.nodes` while reading `NODE_POS[i].x`. A SIXTH entry
 * in `PARTNER_PROGRAM.nodes` — a one-line edit in `content/services.ts`, by
 * someone with no reason to open this file — made `NODE_POS[5].x` throw and
 * took /services down at render with a 500; a fifth removed one gave a
 * `<ConduitPath>` an `undefined` key and drew a spoke to an endpoint that no
 * longer existed. `tsc` sees neither (TS gives `number[]` an unchecked index),
 * and no gate step covers a content shape that does not exist yet.
 *
 * At n = 5 the tuned table is returned UNCHANGED — the designed layout, whose
 * label-inside-the-panel arithmetic is the docblock above. Any other count
 * gets a uniform ellipse on the same envelope as the tuned five (centre
 * 47%,49%; radii 34%,35% — their own bounding box), which cannot collide or
 * overflow the way an appended anchor would, and which is honestly a fallback:
 * a new count wants re-tuning, it just must not crash first.
 */
const nodeAnchors = (n: number) =>
  n === NODE_POS.length
    ? NODE_POS
    : Array.from({ length: n }, (_, i) => {
        const a = (-90 + i * (360 / n)) * (Math.PI / 180);
        return { x: 47 + 34 * Math.cos(a), y: 49 + 35 * Math.sin(a) };
      });

const ANCHORS = nodeAnchors(PARTNER_PROGRAM.nodes.length);

/**
 * One shared coordinate space for the SVG spokes and the DOM nodes: the
 * viewBox is 5:4 and so is the panel, so `xMidYMid meet` maps one unit to the
 * same number of px on both axes and a `%` position in the DOM is the same
 * point as a unit position in the SVG.
 *
 * The scale here is CONSTANT, which is why fixed px gaps against scaled units
 * are safe in this cluster and are not in the hero manifold. The panel only
 * renders from `xl:` (1280px), and by 1280 the container has already hit its
 * `max-w-[1240px]` cap: content = 1240 − 80 (`md:px-10`) = 1160, the
 * `lg:grid-cols-2 lg:gap-16` column is (1160 − 64) / 2 = 548px at EVERY xl
 * width. So one unit is 0.548px, always.
 */
const VB = { w: 1000, h: 800 } as const;
const HUB = { x: VB.w / 2, y: VB.h / 2 } as const;
const NODE_SIZE = 44;
/**
 * Where a spoke stops, in viewBox units, at that fixed 0.548px per unit:
 *   NODE_GAP 46 → 25.2px against the 22px disc radius — a 3.2px hairline gap,
 *                 the etched-channel look the `--glass-3-line` stroke wants.
 *   HUB_GAP 110 → 60.3px against the core's 65px radius, so the spokes stop
 *                 just inside its rim — where the radial has already fallen to
 *                 alpha .05 and is effectively transparent, so they read as
 *                 arriving IN the glow rather than butting against a disc.
 */
const NODE_GAP = 46;
const HUB_GAP = 110;

export function PartnerProgram() {
  return (
    <section id="partner-program" className="section-dark section-pad">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="eyebrow-capsule">{PARTNER_PROGRAM.eyebrow}</span>
          <h2 className="display-2 mt-6 max-w-[18ch] text-ink-inv">
            {PARTNER_PROGRAM.heading}
          </h2>
          <p className="mt-5 max-w-[54ch] text-[15.5px] leading-relaxed text-ink-inv-2">
            {PARTNER_PROGRAM.body}
          </p>
        </Reveal>

        <Reveal delay={160}>
          {/* xl+: the cluster (needs more width than lg gives the absolute
              nodes). `.liq liq-3` is the Vessel — no flat border and no
              `shadow-*`: the rim ring IS the border and `--liq-shadow` IS the
              elevation (§A2).

              NO `.liq-spec`, though Part C's dark Vessel row lists it. That
              modifier is safe with "any ink" only because it is masked to the
              `--liq-pad` FRAME and text lives inside the frame; here the five
              labels sit scattered across the panel's interior, which is
              precisely the unmasked centre. `--liq-spec`'s .22 white over the
              tier-3 composite rgb(109, 75, 116) gives rgb(141, 115, 147),
              where `--ink-inv` measures **3.83:1** — under AA, and on hover
              only, so no static check would ever see it. (`.liq-spec-full`'s
              softer .10 is the modifier designed to sit under text, but it is
              `--ink-inv`-only *and* exclusive with `.liq-spec`; a full-bleed
              highlight on a schematic buys nothing anyway.) `.liq-live` is
              omitted for the plainer reason that a diagram is not a card and
              has nothing to lift toward. */}
          <div className="liq liq-3 relative hidden aspect-[5/4] w-full rounded-lg xl:block">
            {/*
              The spokes. `ConduitPath` draws a `--glass-3-line` base stroke —
              the same white the Vessel's own rim is cut from, so the channels
              read as etched into the glass — plus a `.conduit-pulse` packet in
              `--violet-500`. `pathLength="100"` normalises each path so the
              `8 92` dasharray is one packet per spoke whatever its length, and
              `i × −1.2s` spreads five packets evenly through the shared 6s
              period: one arrival at the core every 1.2s.

              `.conduit-pulse` is `display: none` below 1024 and under reduced
              motion, so where it does not run the spokes are their solid base
              stroke and the cluster is complete and static. (This panel only
              renders from 1280px, so in practice the packets are always
              available except under reduced motion.)
            */}
            <svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              focusable="false"
            >
              {PARTNER_PROGRAM.nodes.map((label, i) => {
                const p = ANCHORS[i];
                const x0 = (p.x / 100) * VB.w;
                const y0 = (p.y / 100) * VB.h;
                const dx = HUB.x - x0;
                const dy = HUB.y - y0;
                const len = Math.hypot(dx, dy) || 1;
                const x1 = x0 + (dx / len) * NODE_GAP;
                const y1 = y0 + (dy / len) * NODE_GAP;
                const x2 = HUB.x - (dx / len) * HUB_GAP;
                const y2 = HUB.y - (dy / len) * HUB_GAP;
                // Bow each spoke off its chord so five paths fan out instead of
                // collapsing into a starburst (the Ecosystem construction).
                const mx = (x1 + x2) / 2 + (y2 - y1) * 0.13;
                const my = (y1 + y2) / 2 - (x2 - x1) * 0.13;
                return (
                  <ConduitPath
                    key={label}
                    d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                    pulse
                    // .toFixed because 3 × −1.2 is −3.5999999999999996 in
                    // binary floating point, and that string would ship into
                    // the DOM verbatim.
                    pulseDelay={`${(i * -1.2).toFixed(2)}s`}
                  />
                );
              })}
            </svg>

            {/*
              The core: a violet glow the spokes arrive at, with LinkAPI's own
              name on it. Kept from the retired cluster verbatim — a static
              background gradient, no filter, no animation.

              DELIBERATELY NOT A `Node`, even though the hero manifold's hub on
              this same route is one. A Node is Part C's "glass disc with an
              inner violet glow" — it has an EDGE, which is what makes it read
              as an endpoint. This is the opposite object: a 130px radial that
              fades to alpha .05 by 70% and has no rim at all, so the five
              endpoints appear to dissolve into it. `Node inset` would draw
              `.liq-inset`'s `inset 0 1px 0 rgba(255,255,255,.12)` across the
              top of a shape with no visible boundary — a 1px white arc
              floating in a glow — and `Node` (`.liq liq-1`) would add both a
              rim ring and a sixth blur layer behind an opaque-ish gradient.
              Two hub-and-spoke diagrams on one route, then, but two different
              objects: a tile the channels stop AT, and a core they arrive IN.
            */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-pill"
              style={{
                background:
                  "radial-gradient(circle, rgba(142,36,170,0.75), rgba(142,36,170,0.05) 70%)",
              }}
            />
            <span className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-inv">
              LinkAPI
            </span>

            {/*
              The five endpoints. Each is a `Node inset` — nested glass never
              blurs (§A7) — with its label below it.

              The placement lives on a WRAPPER, because `.node` declares
              `position: relative` in motifs.css, which is emitted after
              Tailwind and out-ranks an `absolute` utility on the same element
              (Part J Phase 8's general rule). Centring is `-translate-x-1/2`
              on that wrapper and nothing animates it, so there is no second
              transform driver — which is exactly what the retired version got
              wrong: its `-50%` centring was an INLINE transform on the same
              element as `.chip-float`, and an animation declaration out-ranks
              an inline style, so the centring never applied and the two
              longest labels overhung the panel.

              `.chip-float`'s idle bob is deliberately NOT carried over: a
              floating endpoint would drift off the spoke that now terminates
              at it. The composition's motion is the packets travelling down
              the spokes instead — one moving part, and it is the one that
              means something.

              `lit`: five endpoints around a core, all reached. Left dim they
              would read as disabled UI (Part I), and there is no per-node
              sequence here to justify it.
            */}
            {PARTNER_PROGRAM.nodes.map((label, i) => (
              <span
                key={label}
                className="absolute flex w-[120px] -translate-x-1/2 flex-col items-center gap-2 text-center"
                style={{
                  left: `${ANCHORS[i].x}%`,
                  top: `calc(${ANCHORS[i].y}% - ${NODE_SIZE / 2}px)`,
                }}
              >
                <Node inset lit size={NODE_SIZE} />
                {/* 12px, above layout.mjs's 10px floor — these are real labels,
                    not decoration. `--ink-inv` per the tier-3 rule above. */}
                <span className="text-[12px] font-medium leading-tight text-ink-inv">
                  {label}
                </span>
              </span>
            ))}
          </div>

          {/* below xl: pill list. `grid-cols-1` is not needed here (a flex wrap
              has no implicit column to collapse), but `.liq` children no longer
              need `relative z-[1]`: the material is `isolation: isolate` with
              both pseudos at z-index:-1 (§A2). */}
          <ul className="flex flex-wrap gap-3 xl:hidden">
            {PARTNER_PROGRAM.nodes.map((label) => (
              <li
                key={label}
                className="liq liq-1 liq-flat rounded-pill px-4 py-2 text-[13.5px] font-medium text-ink-inv"
              >
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
