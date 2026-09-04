import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Caustic, Droplet, Meniscus, Seam } from "@/components/motifs";
import { cn } from "@/lib/cn";

interface PageHeroProps {
  /** Eyebrow — rendered as a Droplet capsule. Omit where the Figma shows none. */
  eyebrow?: string;
  /**
   * Heading. Pass a string, or a node when the Figma splits it two-tone
   * (wrap the accent words in `<span className="accent-word">`).
   */
  title: ReactNode;
  lead?: string;
  /** `dark` = plum band B (About, Contact); `light` = lavender wash. */
  tone?: "dark" | "light";
  align?: "left" | "center";
  /** Right-hand visual (diagram / illustration). Forces the two-column layout. */
  visual?: ReactNode;
  /**
   * Whether `visual` is wrapped in a Vessel plate (`.liq liq-3` on dark /
   * `.liq liq-light` on light, radius 24, `p-6`). TRUE for a DIAGRAM — the
   * plate is the glass the schematic is etched into. FALSE for a raster
   * illustration, which carries its own frame and must pass through unwrapped
   * (`/services`' `hub-isometric.webp`).
   */
  visualFrame?: boolean;
  /**
   * `tone="dark"` only: the surface colour of the section that FOLLOWS, which
   * is the liquid the Meniscus is filled with. Every dark PageHero route opens
   * on `bg-surface` today, hence the default; a route that opens on
   * `--canvas` must say so or the curve paints the wrong white.
   */
  nextSurface?: string;
  className?: string;
}

/**
 * Cross-route title morph.
 *
 * `view-transition-name` is a *declaration*, not a behaviour: on a browser with
 * no View Transition API it is an unknown property and is dropped, so the class
 * costs nothing there. Under reduced motion the name is removed entirely, which
 * un-registers the title from the transition — it is then covered by the root
 * snapshot instead of getting its own animated group, so nothing morphs.
 *
 * Emitted with React 19's `href` + `precedence`, so it is hoisted into <head>
 * and de-duplicated no matter how many heroes a route renders.
 *
 * The name is unique per document by construction: exactly one PageHero renders
 * per route. (`vt-page-title` is reserved for this element site-wide.)
 */
const VT_ID = "s7-vt-page-title";
const VT_CSS =
  ".vt-page-title{view-transition-name:vt-page-title}" +
  "@media (prefers-reduced-motion:reduce){.vt-page-title{view-transition-name:none}}";

/**
 * The one ambient Caustic, per tone. `x`/`y` are the disc's TOP-LEFT corner
 * (motifs.css: there is no centring transform, because `.scrub-drift` owns
 * `transform` on that element), so these are corner values and the comments
 * give the resulting centre.
 *
 * DARK — upper-right (Part G), reinforcing `--grad-section-b`'s own key bloom
 * at 88% 8%. Anchored in px from the top so the geometry is viewport-
 * independent: centre = (100% − 130px, 40px), and the gradient's alpha reaches
 * 0 at 70% of the radius = 147px, so the disc's influence ends at y = 187px —
 * above the lead on every viewport (the header clearance alone is 136/156px,
 * and the h1 sits between). AA is not the reason for that placement, though:
 * on the FLAT band `--ink-inv-2` measures 8.06:1 over band B's brightest
 * composite and still 6.88:1 with a full `--violet-a24` core beneath it (the
 * 4.5 floor is only in danger where such a core sits under GLASS — 4.01:1,
 * §A6 / Part J Phase 6). It is placed off the copy because a violet wash
 * behind a lead paragraph reads as a stain, not as light.
 *
 * LIGHT — lower-right. `--grad-wash` already carries two violet blooms, both
 * in the upper half (15% 20% and 92% 15%), so a third one up there would be
 * redundant; the flat corner is the bottom. Centre = (100% − 90px,
 * 100% − 40px). `--violet-soft` is .10, where `--ink-2` still measures
 * 7.49:1 (Part J Phase 8), so nothing is geometrically constrained here.
 */
const CAUSTIC = {
  dark: { x: "calc(100% - 340px)", y: "-170px" },
  light: { x: "calc(100% - 300px)", y: "calc(100% - 250px)" },
} as const;
const CAUSTIC_SIZE = "420px";

/**
 * Shared inner-page hero (REDESIGN-V4 Part G). Runs full-bleed under the
 * floating header, so it carries the header clearance itself.
 *
 * RHYTHM (one 8-pt scale, derived from the floating header's real footprint):
 *   mobile  header bottom = pt-3 (12) + h-[60px] = 72px → 64px gap → pt-136
 *   ≥md     header bottom = pt-5 (20) + h-[64px] = 84px → 72px gap → pt-156
 * The bottom padding is 32 / 48 rather than 64 / 80: every page that follows a
 * hero opens with `.section-pad` (80–140px of its own top padding), so the old
 * values stacked into a 144–220px dead band — most visible on /banks and
 * /banks/[slug]. 32 + 80 = 112px minimum separation is still a clear break.
 *
 * The title and lead are deliberately NOT reveal-gated: on most routes the h1
 * is the LCP element, and `[data-reveal]` starts at opacity 0.
 *
 * ── V4 (Phase 9a): THE LIQUID SHELL ───────────────────────────────────────
 * `tone="dark"` → `.section-dark band-b` + one Caustic + a Seam and a Meniscus
 * at the bottom edge. `tone="light"` → `.section-wash` + one light Caustic +
 * a light Seam.
 *
 * MENISCUS BUDGET. Part C caps the Meniscus at THREE uses site-wide, and the
 * homepage already spends two (Hero → Marquee, StatBand → ErpBand). The dark
 * PageHero is the third and last — so no other section may add one, and this
 * is why the light tone gets a flat Seam instead of a curve.
 *
 * THE BOTTOM EDGE IS IN FLOW, not absolute. StatBand and the Hero stack their
 * Seam + Meniscus inside one `absolute inset-x-0 bottom-0` wrapper because they
 * have 80–140px of `.section-pad` to hide an 80px curve in. This hero has 32 /
 * 48px, so an absolute Meniscus would paint its opaque `--surface` fill over
 * the bottom 32px of the lead. In flow it is the section's tail instead: the
 * padding contract above is untouched, the plum simply ends in a curve. Both
 * elements need no positioning wrapper for the same reason (`.seam` and
 * `.meniscus` declare their own `position`/`display` in motifs.css, which is
 * emitted after Tailwind and would out-rank an `absolute` on the same element).
 *
 * NO `--sp` DRIVER, deliberately: this is a hero, so it is already at the top
 * of its own transit when the page paints. The Seam's specular segment stays
 * parked off the left edge and the Meniscus' line rests at .3 opacity —
 * decoration fails closed, exactly as it does on the homepage hero.
 *
 * The section owns `overflow-hidden` and, on the light tone, `isolate`: the
 * Caustic is `z-index: -2` and needs an ancestor stacking context or it drops
 * behind the section's own background. `.section-dark` declares
 * `position: relative; isolation: isolate` itself; a light section is not a
 * stacking context (Part J Phase 8, HomeFaq). There is no `.sheet-shadow`
 * here, so — unlike the dark home bands — `overflow-hidden` on the section
 * costs nothing and the Caustic needs no separate clip box.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "center",
  visual,
  visualFrame = true,
  nextSurface = "var(--surface)",
  className,
}: PageHeroProps) {
  const dark = tone === "dark";
  const twoCol = Boolean(visual);
  const centered = align === "center" && !twoCol;

  return (
    <header
      /* data-hero: chrome.css's no-JS / first-frame baseline paints the pill
         dark over a dark hero; data-surface marks it for the header's tone
         observer (which also matches .section-dark — the two overlap here). */
      data-hero={tone}
      data-surface={dark ? "dark" : undefined}
      className={cn(
        "overflow-hidden",
        dark ? "section-dark band-b" : "section-wash relative isolate",
        className,
      )}
    >
      <style href={VT_ID} precedence="default">
        {VT_CSS}
      </style>

      <Caustic
        x={CAUSTIC[tone].x}
        y={CAUSTIC[tone].y}
        size={CAUSTIC_SIZE}
        light={!dark}
        drift="far"
      />

      <div
        className={cn(
          "mx-auto w-full max-w-[1240px] px-6 pb-8 pt-[136px] md:px-10 md:pb-12 md:pt-[156px]",
          twoCol &&
            "grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16",
        )}
      >
        <div className={cn(centered && "mx-auto max-w-[46rem] text-center")}>
          {eyebrow && (
            <Reveal>
              {/* Droplet, not `.eyebrow-capsule`. Ink is the capsule's own, so
                  the colour does not move: `--ink-inv` on dark (§A6 allows
                  `--ink-inv-2` on tier 1, but the primary ink costs nothing
                  and keeps the Caustic arithmetic above irrelevant here), and
                  `--violet-text` on light, which clears `.liq-light.liq-1`'s
                  .55 white at 7.20:1 where `--ink-3` would fail at 4.17. */}
              <Droplet
                light={!dark}
                className={cn(
                  "text-[0.72rem] font-medium uppercase tracking-[0.13em]",
                  dark ? "text-ink-inv" : "text-violet-text",
                )}
              >
                {eyebrow}
              </Droplet>
            </Reveal>
          )}
          <h1
            className={cn(
              "display-1 vt-page-title",
              eyebrow && "mt-6",
              dark ? "text-ink-inv" : "text-ink",
              centered ? "mx-auto" : "max-w-[20ch]",
            )}
          >
            {title}
          </h1>
          {lead && (
            <p
              className={cn(
                "body-lg mt-6 max-w-[62ch]",
                dark ? "text-ink-inv-2" : "text-ink-2",
                centered && "mx-auto",
              )}
            >
              {lead}
            </p>
          )}
        </div>

        {/*
          NO `justify-self-end` here, deliberately. It makes this grid item
          shrink-to-fit, and every visual passed in sizes itself with `w-full`
          plus a `max-w-[…]` cap. A percentage width against a content-sized
          parent is circular: the parent asks the child how wide it wants to be,
          the child answers "100% of you". Chromium resolves that to zero.

          The damage scaled with how much intrinsic width the child had:
            /connected-banking  0x0     — the diagram's contents were ALL
                                          absolutely positioned, so max-content
                                          was genuinely nothing. Its pills and
                                          hub collapsed onto the origin, and
                                          because a zero-height box puts
                                          `bottom-*` items above `top-*` ones,
                                          the labels also rendered in reverse
                                          order. (V4 rebuilt that diagram in
                                          normal flow, but the rule stands for
                                          every other visual.)
            /banks/[slug]       278px   — shrank to its text's max-content
                                          instead of the intended 380px.
            /services           534px   — an <img> has intrinsic width, so it
                                          survived, merely undersized.

          Default `justify-self: stretch` fills the track, and each visual's own
          `mx-auto` centres it within that track — which is what those classes
          were always asking for. The Vessel plate below is a plain block for
          the same reason: it stretches, and the diagram centres inside it.
        */}
        {visual && (
          <Reveal delay={160}>
            {visualFrame ? (
              <div
                className={cn(
                  "rounded-xl p-6",
                  dark ? "liq liq-3" : "liq liq-light",
                )}
              >
                {visual}
              </div>
            ) : (
              visual
            )}
          </Reveal>
        )}
      </div>

      {/* Bottom edge. Dark: the Seam is the vessel's rim and the Meniscus is
          the next section's surface rising under it (Seam first, so it reads
          as spatially above the curve). Light: the rim alone — the Meniscus
          budget is spent, and a wash meeting a white section needs a hairline,
          not a curve. */}
      <div aria-hidden="true" className="pointer-events-none">
        <Seam light={!dark} />
        {dark && <Meniscus fill={nextSurface} />}
      </div>
    </header>
  );
}
