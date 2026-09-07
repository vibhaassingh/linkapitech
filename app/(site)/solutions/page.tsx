import type { CSSProperties } from "react";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Terminal } from "@/components/sections/home/Terminal";
import { Caustic, Node, Pool, Seam } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { SOLUTION_GROUPS, SDK_SAMPLE, type Product } from "@/content/solutions";
import { cn } from "@/lib/cn";

/**
 * /solutions — V4 Phase 9b (REDESIGN-V4 Part G).
 *
 * ANCHOR IDS ARE LOAD-BEARING AND UNCHANGED. `lib/site.ts`'s footer and
 * `content/home.ts`'s Ecosystem constellation deep-link to nine of them:
 * `#payments-collections`, `#reconciliation`, `#virtual-accounts`,
 * `#ecommerce`, `#checkout`, `#platforms`, `#subscriptions` and `#chatbot` are
 * PRODUCT ids (`id={product.id}` on a card, or on a row of the dark band) and
 * `#governance` is a GROUP id (`id={group.id}` on the section). Both levels
 * survive this rewrite verbatim.
 *
 * ── THE CARD LANGUAGE ─────────────────────────────────────────────────────
 * Three surfaces, per Part G, and the `Card` component is not used because it
 * takes no `id` (and `components/motifs/Card.tsx` is out of scope for this
 * phase) while every card here IS an anchor target. The shells below are its
 * light recipe verbatim, down to the icon tiles:
 *   default            `.liq liq-light liq-flat liq-live liq-spec` — the light
 *                      Vessel, with `card-icon-light`'s 44px `--lavender-200`
 *                      disc (Part C's light Card row).
 *   feature "outline"  the same Vessel with a `--line-violet` RIM. The rim is
 *                      `.liq::before`'s `background: var(--_rim)`, and on the
 *                      light material `--_rim` resolves through the PUBLIC
 *                      `--liq-light-rim` token — so the call site overrides
 *                      that token inline rather than adding a flat `border`,
 *                      which Phase 8 took off every light Vessel (§A2: the rim
 *                      ring IS the border). Private `--_*` properties are
 *                      never touched.
 *   feature "solid"    `grad-fill` + a Pool (kept per Part G). NOT glass and
 *                      NOT `.liq`. Its icon tile is `Node inset` — Part C
 *                      lists "icon tiles on dark" as a Node use, and a
 *                      `--lavender-200` disc on the violet field would be the
 *                      brightest object in the whole grid and out-shout the
 *                      title. `.liq-inset` is a veil fill with NO
 *                      backdrop-filter (globals.css: "no rim, no frost — so it
 *                      is safe on any element"), so it costs no blur layer and
 *                      needs no glass host.
 *
 * `.sheen` RETIRES HERE BY DELETION, not by migration, and both §A4
 * replacements were checked first:
 *   `.liq-spec`  paints `radial-gradient(… var(--_spec) …)`, and `--_spec` is
 *                set only by `.liq` / `.liq-light`. On the solid card — which
 *                cannot be a `.liq`, because `.liq` sets `background-color`
 *                after Tailwind and `grad-fill`'s gradient would be all that
 *                is left — the gradient is invalid and NOTHING paints. A
 *                silent no-op, which is the class of bug this repo has shipped
 *                before.
 *   `.liq-sweep` does read the public `--liq-sweep` token and would work — but
 *                qa.mjs's ink-on-glass rule requires EVERY run inside a
 *                `.liq-sweep` to be `--ink-inv` (the unmasked band adds white
 *                under text), and this card's body must stay
 *                `--ink-on-violet-2`: `--ink-inv-2` measures only 3.95:1 on
 *                `grad-fill`'s #8e24aa stop. The rule would fail the build.
 * So the solid card's decoration is the Pool Part G gives it, plus the hover
 * lift. `.spotlight` is not it either: it is the LIGHT-card counterpart and
 * its `--violet-glow` wash is invisible over a violet gradient.
 *
 * ── §A8, THE BACKDROP-ROOT RULE ───────────────────────────────────────────
 * The only live frost on this route is the Ledger's. Its ancestor chain is
 * `Reveal` → the two-column grid → the container → the `.sheet-enter`
 * `.section-dark`. `sheetEnter` is TRANSFORM-ONLY (globals.css L1153–1160; the
 * border-radius that used to be in those keyframes is gone), so the band is
 * not a backdrop root and the blur samples the real page. `[data-reveal]` is
 * `opacity: 0` + `will-change: opacity` and IS a root while it holds, but
 * `[data-inview]` resolves it to `opacity: 1; will-change: auto` — the
 * sanctioned "ends at 1" case, and the wrapper is invisible for exactly that
 * window anyway. `.section-dark`'s `isolation: isolate` is not disqualifying
 * (`.liq` sets the same property on the very element carrying its own
 * backdrop-filter) and its grain `::after`'s `mix-blend-mode: overlay` is a
 * pseudo-CHILD, not an ancestor. The nine product cards are `liq-flat` and
 * never blur, so the rule cannot bite them at all.
 *
 * ── AA, COMPUTED BY HAND WHERE NO CHECK CAN SEE IT (§A6) ──────────────────
 * The dark band is band A (`--grad-section-a`, plum-700 → plum-950) and the
 * numbers below are on its BRIGHTEST stop, `--plum-700` #42174c, composited
 * the way qa.mjs's contrast walk does it (brightest stop of every layer,
 * source-over). The Caustic is a SIBLING overlay, so the walk is blind to it —
 * every "+ core" figure is hand-computed and is the reason the disc's
 * placement below is an arithmetic decision, not a decorative one.
 *
 *   run                                  flat band   + full --violet-a24 core
 *   h2 / h3  --ink-inv   #f7f3f9          13.13:1          11.22:1
 *   body     --ink-inv-2 #cebcd4           8.07:1           6.90:1   (flat,
 *            not glass — the 4.52 / 4.04 GLASS ceilings do not apply here)
 *   glyph    --lavender-400 #c9b8d8        7.77:1           6.64:1   (a glyph,
 *            never a run; §A4/Phase 9a bars it as text INSIDE `.liq`, where it
 *            is 4.36:1 — on this flat band it is not close to the line)
 *   Ledger   --terminal-cmt #8b93a0        5.44:1           5.32:1
 *            caption #8d97a3               5.69:1           5.57:1
 *
 * Light cards, over `--surface` #ffffff / `--canvas` #faf8fc (both FLAT, which
 * is also why `liq-flat` is free — a Gaussian blur of a constant field is that
 * constant, and `saturate(1.15)` on it is achromatic to the nearest LSB):
 * `--ink` 16.6:1, `--ink-2` 9.28:1, and `--violet-text` #6f257f on the opaque
 * `--lavender-200` #e9dfeb disc 7.22:1. `--ink-3` appears nowhere on the page.
 * Solid card: `--ink-inv` 6.42:1 and `--ink-on-violet-2` 4.98:1 on the #8e24aa
 * stop, against `--ink-inv-2`'s failing 3.95:1 — which is why the body ink
 * cannot be promoted and the Pool has to be kept off the copy geometrically
 * (see ProductCard).
 *
 * ── BLUR BUDGET (§A7), counted per VIEWPORT across the whole route ─────────
 * 1440: the pill (1) + whichever section is on screen — the Ledger band 1,
 * CtaBand 1 (its Droplet is `.liq liq-1`, which DOES blur ≥1024; its glass
 * CTA does NOT count, because `variant="glass"` renders only when a
 * `secondary` CTA is passed and this route passes none). Worst viewport
 * **2 of 8**. 390: the pill (1) alone — the Droplet has no blur below 1024
 * and the Ledger is opaque there. Worst viewport **1 of 4**. The nine
 * product cards and the light PageHero (no eyebrow Droplet, no `visual`
 * plate) contribute nothing; the footer's
 * `.footer-pool` is a background-image.
 */

export const metadata = pageMetadata({
  title: "Solutions",
  description:
    "One connected ecosystem across the money movement lifecycle: connected banking, payments and collections, reconciliation, virtual accounts, checkout SDKs, access governance, subscription billing and WhatsApp banking.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        align="center"
        title={
          <>
            One ecosystem for every step of{" "}
            <span className="accent-word">money movement.</span>
          </>
        }
        lead="From the first payment to the final reconciliation, LinkAPI Tech offers a connected suite of products that plug into your ERP and banking stack. Adopt one module or the whole ecosystem — each is built to scale securely."
      />

      {SOLUTION_GROUPS.map((group, gi) => {
        const dark = group.tone === "dark";
        return (
          <section
            key={group.id}
            id={group.id}
            className={cn(
              "section-pad",
              // `band-a` is spelled out rather than left to `.section-dark`'s
              // default `--grad-section` (globals.css L108/L117 are the same
              // gradient character for character). It is a no-op at paint time
              // and load-bearing at review time: every AA figure in the header
              // is band A's, and the Ledger's whole syntax palette would have
              // to be re-measured if this row ever moved to band B or C
              // (Part J Phase 9a made the same call for /industries' NBFC row).
              //
              // `.sheet-enter` presents the plum band as a sheet sliding under
              // the light page: it rises the last 28px over the first 22% of
              // its transit. TRANSFORM ONLY (globals.css is explicit that
              // border-radius must never come back into those keyframes), so
              // it stays on the compositor, costs no layout — CLS 0 — and,
              // being neither opacity nor filter, it is NOT a backdrop root:
              // the Ledger's frost inside it samples the real page (§A8).
              // globals gates it behind @supports (animation-timeline: view())
              // and names it in the reduced-motion `animation: none` list,
              // where it resolves to the flat, seated band that is also its
              // end state.
              dark
                ? "section-dark band-a sheet-enter"
                : gi % 2 === 0
                  ? "bg-surface"
                  : "bg-canvas",
            )}
          >
            {dark && (
              <>
                {/* Part D (i): `.sheet-shadow` is the other half of `.sheet-enter`
                    and globals.css says in as many words that it belongs FIRST
                    inside the section — its bottom 1px is the sheet's top-edge
                    highlight and the 40px above it is the shadow the sheet casts
                    UPWARD onto the white band it slides over, fading 1 → 0 over
                    the same cover 0–22% window. It is `top: -40px`, so this
                    section must never gain `overflow-hidden`; that is exactly
                    why the Caustic below carries its own clip box instead. */}
                <span aria-hidden="true" className="sheet-shadow" />

                {/* Part C: a Seam at the top of every dark band. The wrapper is
                    mandatory — `.seam` declares `position: relative` in
                    motifs.css, which is emitted after Tailwind and out-ranks an
                    `absolute` utility on the same element (Part J Phase 6).
                    `.section-dark` supplies the positioned parent. With no `--sp`
                    driver on this section the 220px specular segment stays parked
                    off the left edge: decoration fails closed, as it does on
                    /industries' dark rows. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0"
                >
                  <Seam />
                </div>

                {/* One Caustic — centre (24%, 34%); `x`/`y` are the disc's
                    TOP-LEFT corner, because motifs.css deliberately carries no
                    centring transform (`.scrub-drift` owns transform there).
                    Its own clip box, with NO z-index and NO `isolate`: the box
                    is not a stacking context, so the disc's `z-index: -2` still
                    resolves against `.section-dark` (above the band, under the
                    grain) while the box clips the bleed.

                    THE PLACEMENT IS THE ARITHMETIC. At lg the copy column is on
                    the LEFT and the Ledger on the right, so 24% puts the core
                    over FLAT band text — where `--ink-inv-2` costs 8.07 → 6.90:1
                    — and leaves the GLASS its clean composite. That is the
                    /industries rule (Phase 9a) applied to this layout's mirror:
                    a core under glass is what spends the 0.02 of headroom tier 2
                    has. Below lg the columns stack and the disc can land on the
                    Ledger; that case is measured too and still passes
                    (`--terminal-cmt` 5.44 → 5.32:1, Phase 7), so no placement
                    here can fail — the choice is which composite reads best. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                  <Caustic
                    x="calc(24% - 240px)"
                    y="calc(34% - 240px)"
                    size="480px"
                    drift="mid"
                  />
                </span>
              </>
            )}

            <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
              <Reveal>
                <h2
                  className={cn(
                    "display-2 max-w-[26ch]",
                    dark ? "text-ink-inv" : "text-ink",
                  )}
                >
                  {group.heading}
                </h2>
              </Reveal>

              {dark ? (
                /* developer-tooling band: the list beside the LEDGER.
                   `variant="ledger"` is Part C's glass code window — inside a
                   `.section-dark` at ≥1024 the shell goes translucent
                   (`rgba(23,27,33,.78)`) and frosts the plum behind it; on
                   phones globals keeps it the opaque `--terminal`, which is
                   also what keeps the phone blur count at 0 here. Every ink in
                   it is measured on the composite in the file header. */
                <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
                  <RevealGroup className="flex flex-col" as="ul" step={100}>
                    {group.products.map((p, i) => (
                      /* THE DIVIDER IS INDEX-DRIVEN, NOT `first:` / `last:`.
                         RevealGroup wraps each child in its OWN `<li>`, so
                         every one of these divs is both `:first-child` and
                         `:last-child` of its wrapper — `first:pt-0` and
                         `last:border-b-0` therefore matched EVERY row and the
                         hairline rule between the products was silently dead
                         (it has been since the V3 build; nothing in the gate
                         can see a border that is merely absent). Same reason
                         RevealGroup cannot host `:nth-of-type` choreography
                         (Part J Phase 7, the pin steps). */
                      <div
                        key={p.id}
                        id={p.id}
                        className={cn(
                          "border-b border-line-inv py-7",
                          i === 0 && "pt-0",
                          i === group.products.length - 1 && "border-b-0",
                        )}
                      >
                        <h3 className="flex items-center gap-2.5 text-[17px] font-semibold text-ink-inv">
                          <Icon
                            name={p.icon}
                            size={18}
                            className="text-lavender-400"
                          />
                          {p.title}
                        </h3>
                        {/* Flat on the band, not on glass: `--ink-inv-2` is
                            allowed on a plum FLAT (8.07:1 here, 6.90:1 under
                            the Caustic core) and the 4.52/4.04 glass ceilings
                            do not apply. */}
                        <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                          {p.body}
                        </p>
                      </div>
                    ))}
                  </RevealGroup>

                  <Reveal delay={180} className="min-w-0">
                    <Terminal
                      variant="ledger"
                      method={SDK_SAMPLE.method}
                      path={SDK_SAMPLE.path}
                      lines={SDK_SAMPLE.lines}
                    />
                  </Reveal>
                </div>
              ) : (
                <RevealGroup
                  className={cn(
                    "mt-12 grid grid-cols-1 gap-5",
                    group.products.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-3",
                  )}
                  step={90}
                >
                  {group.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </RevealGroup>
              )}
            </div>
          </section>
        );
      })}

      <CtaBand ctaLabel="Request a Product Walkthrough" />
    </>
  );
}

/**
 * One product card. See the file header for which surface each `feature` takes
 * and why `.sheen` has no successor on the solid one.
 *
 * `--liq-pad` IS THE SPECULAR'S TEXT-FREE FRAME, and 28px is the kit's value
 * (`Card.tsx`, `CoreServices.tsx`), not this card's padding at every size. The
 * mask is fully OPAQUE to 28px and feathers to nothing by 46px, while the
 * content column starts at 28px (`p-7`) or 32px (`md:p-8`) — and `.liq-spec`
 * only renders at ≥1024 with a fine pointer, i.e. only at the 32px one. So the
 * solid part of the frame ends 4px INSIDE the padding and the outer ~14px of
 * each line sits under a partly-faded .22 white on hover. That is the safe
 * direction and it is what §A4 means by "any ink allowed" under `.liq-spec`;
 * the failure Phase 6 found in WhatWeDo was the opposite one, a frame LARGER
 * than the padding.
 *
 * THE SOLID CARD'S POOL — bottom-anchored arithmetic, and the tolerance is set
 * by `.pool::before` rather than by AA (Part J Phase 8). §A6 allows only
 * `--ink-inv` over a Pool, and this card's body is `--ink-on-violet-2`
 * (mandatory: `--ink-inv-2` is 3.95:1 on `grad-fill`'s #8e24aa stop, against
 * `--ink-on-violet-2`'s 4.98:1), so the basin is kept OFF the text
 * geometrically rather than promoting the run.
 *
 * `.pool` is the bottom 46% of its positioned box — overriding that height
 * with a Tailwind `h-*` would silently lose to motifs.css, which is emitted
 * after Tailwind — so a 76px box gives a **34.96px** basin whose top, where
 * the 1px lavender meniscus line paints, sits 34.96px above the card floor
 * against the card's `pb-16` = 64px of bottom padding: clearance **29.04px**.
 * (`md:pb-16` is restated because `md:p-8` would otherwise reset
 * `padding-bottom` to 32px at ≥768.) At ~10px that line reads as an underline
 * beneath the paragraph rather than as a liquid surface, which is why the
 * clearance is deliberately generous.
 *
 * The Pool is FIRST in DOM and the content sits on `relative z-[1]`: `.pool` is
 * positioned with no z-index and would otherwise paint OVER in-flow text
 * (StatBand's trap). `overflow-hidden` + `border-radius: inherit` round the
 * basin's bottom corners. It rises with the RevealGroup wrapper's
 * `data-inview` and rests FULL, so no-JS and reduced motion show it settled.
 */
function ProductCard({ product }: { product: Product }) {
  const solid = product.feature === "solid";
  const outline = product.feature === "outline";

  const style: CSSProperties | undefined = solid
    ? undefined
    : ({
        "--liq-pad": "28px",
        // The rim ring's own gradient, overridden to the violet hairline. A
        // public token, not a private `--_*` one.
        ...(outline ? { "--liq-light-rim": "var(--line-violet)" } : null),
      } as CSSProperties);

  return (
    <article
      id={product.id}
      className={cn(
        "icon-draw flex h-full flex-col rounded-lg p-7 md:p-8",
        solid
          ? // An opaque gradient card has no frost and no rim, so it has no
            // `.liq-live` either and the lift is by hand — /about's Vision card
            // verbatim. `isolate` + `overflow-hidden` are for the Pool.
            "grad-fill relative isolate overflow-hidden pb-16 text-ink-inv shadow-float transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 md:pb-16"
          : // `liq-flat` is free rather than a compromise here: both light group
            // tones are FLAT (`bg-surface` / `bg-canvas`), so the frost would be
            // provably zero pixels of difference for real GPU cost (Part J
            // Phase 8). `.liq-live` + `.liq-spec` is a legal pairing — §A4's
            // exclusivity list for `.liq-live` is `.liq-enter` / `.scrub-drift`
            // / `.card-depth` / `[data-tilt]`, and `.liq-sweep` (the one class
            // `.liq-spec` excludes) is absent.
            "liq liq-light liq-flat liq-live liq-spec",
      )}
      style={style}
    >
      {solid && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[76px]"
        >
          <Pool />
        </span>
      )}

      <div className={cn("flex flex-col", solid && "relative z-[1]")}>
        {solid ? (
          <Node
            inset
            size={44}
            icon={<Icon name={product.icon} size={19} draw />}
          />
        ) : (
          <span className="card-icon-light" aria-hidden="true">
            <Icon name={product.icon} size={19} draw />
          </span>
        )}
        <h3
          className={cn(
            "mt-6 text-[17px] font-semibold",
            solid ? "text-ink-inv" : "text-ink",
          )}
        >
          {product.title}
        </h3>
        <p
          className={cn(
            "mt-2.5 max-w-[46ch] text-[14.5px] leading-relaxed",
            solid ? "text-ink-on-violet-2" : "text-ink-2",
          )}
        >
          {product.body}
        </p>
      </div>
    </article>
  );
}
