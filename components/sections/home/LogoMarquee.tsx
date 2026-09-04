import Image from "next/image";
import type { CSSProperties } from "react";
import { Droplet, Seam } from "@/components/motifs";
import { CLIENTS } from "@/content/clients";
import { TRUST_LINE } from "@/content/stats";

/**
 * Trust band — an infinite marquee of client marks on white
 * (REDESIGN-V4 Part E §2).
 *
 * The row is duplicated in the DOM and the track translates -50%, which loops
 * seamlessly without JS. The copy is aria-hidden so the list is announced once;
 * under reduced motion the animation is neutralised globally and the row simply
 * sits still.
 *
 * VELOCITY RESPONSE — and why it is not `animation-duration`
 * The obvious reading of "scale marquee speed with --scroll-velocity" is
 * `--marquee-d: calc(42s - var(--scroll-velocity) * 10.5s)`. That is unusable:
 * a CSS animation keeps its local *time* when its duration changes, so progress
 * (= frac(t / duration)) jumps. With a 42s loop already ~30s in, a single
 * lerp step of the velocity bus (0.12) re-maps progress by ~2% of the track —
 * a ~40px pop per frame, worsening the longer the page stays open.
 *
 * So the base loop keeps a constant duration and the velocity is applied as a
 * lead/lag on the two rows instead (the `.marquee` track itself cannot take a
 * transform — its own keyframes own that property). Both rows shift by the
 * identical amount, so the -50% loop seam stays exact. While the bus ramps, the
 * marks genuinely move faster than the loop and settle back when scrolling
 * stops, which is the effect that was asked for, jump-free.
 * Reduced motion: the bus never starts, so --scroll-velocity keeps its 0
 * default and the translate resolves to 0px.
 *
 * V4 — WHAT CHANGED, AND THE EDGE TREATMENT
 * 1. The trust line is a light `Droplet` centred above the row: the kit's small
 *    liquid capsule, `.liq liq-light liq-1`. Its ink is `--ink-2`, NOT the
 *    `--ink-3` this line used to carry — `--ink-3` on `.liq-light.liq-1`'s
 *    .55 white measures 4.17:1 and is forbidden by §A6 (qa.mjs's ink-on-glass
 *    rule enforces it).
 * 2. `liq-flat` on the capsule. This section is a flat `--surface` (#ffffff),
 *    so there is nothing behind the pill to frost: a blur of a constant field
 *    IS that constant, and `saturate(1.15)` of an achromatic white is white, so
 *    the frost is provably zero pixels of difference for real GPU cost. The
 *    Ecosystem chips are `liq-flat` for exactly this reason (Part J, Phase 7).
 *    `.liq-1` already has no blur below 1024, so the class only removes a
 *    desktop no-op. The capsule still reads as glass — the rim ring, the wet
 *    edge and `--liq-light-shadow` are what draw it, not the frost.
 * 3. The `border-y` is GONE and the only edge is a light `Seam` at the bottom.
 *    The hero's Meniscus lands on this section's top edge (Hero.tsx renders
 *    `Seam` + `Meniscus fill="var(--surface)"` there), so a second hairline
 *    across the top would compete with the curve the liquid already draws —
 *    Part E row 2 asks for "Seam bottom" only, and the marks are meant to read
 *    as floating on the surface the meniscus rises to.
 * `.seam` declares `position: relative` in motifs.css (emitted after Tailwind),
 * so it can never be positioned from its own element — hence the absolute
 * wrapper, and hence `relative` on the section.
 */

/** Lead at full bus saturation. ≈25% of the loop's own per-second advance. */
const LEAD = "24px";

export function LogoMarquee() {
  return (
    <section
      aria-label={TRUST_LINE}
      className="relative bg-surface py-10 md:py-12"
    >
      {/* `.droplet` is `inline-flex`, so the capsule is centred by its parent
          rather than by `mx-auto` (which does nothing to an inline box). */}
      <p className="mb-8 flex justify-center">
        <Droplet
          light
          className="liq-flat px-4 py-1.5 text-[12px] font-semibold uppercase tracking-eyebrow text-ink-2"
        >
          {TRUST_LINE}
        </Droplet>
      </p>

      <div className="marquee-mask no-scrollbar mask-fade-x overflow-hidden">
        <div
          className="marquee items-center"
          style={{ ["--marquee-d" as string]: "42s" }}
        >
          <Row />
          <Row aria-hidden dup />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <Seam light />
      </div>
    </section>
  );
}

/**
 * Every mark sits in the same 150×40 box with object-contain, so wide marks
 * (IndusInd, HDFC) can't outweigh compact ones — constraining height alone
 * made an 8:1 wordmark render twice as wide as the rest. `scale` is the
 * remaining per-logo optical nudge.
 *
 * Three marks (Axis, HSBC, IndusInd) are licensed SVGs and render crisper than
 * the four remaining rasters; that difference is expected — do not try to
 * "correct" the rasters here.
 */
function Row({
  "aria-hidden": hidden,
  dup,
}: {
  "aria-hidden"?: boolean;
  dup?: boolean;
}) {
  return (
    <ul
      className={`flex shrink-0 items-center gap-10 pr-10 md:gap-14 md:pr-14${dup ? " marquee-dup" : ""}`}
      aria-hidden={hidden ? "true" : undefined}
      style={
        {
          transform: `translate3d(calc(var(--scroll-velocity) * -${LEAD}), 0, 0)`,
        } as CSSProperties
      }
    >
      {CLIENTS.map((c) => (
        <li
          key={c.name}
          className="group grid h-10 w-[150px] shrink-0 place-items-center"
        >
          <Image
            src={c.logo as string}
            alt={hidden ? "" : c.name}
            width={150}
            height={40}
            style={{ transform: `scale(${c.scale ?? 1})` }}
            className="max-h-10 w-auto max-w-[150px] object-contain opacity-[0.92] transition-opacity duration-ui group-hover:opacity-100"
            unoptimized
            /* Eager on purpose. next/image defaults to lazy, and this strip
               breaks that assumption: the duplicate row is laid out a full
               track-width off to the right, so its images never enter the
               viewport by scrolling and only begin loading once the CSS
               translate drags them in — measured at 1280px, six of the seven
               duplicates were still unloaded with one already at x=1249, i.e.
               on screen as a blank gap. The seven files are a few KB each and
               the duplicate reuses the primary row's URLs, so making them eager
               costs one small batch of requests and removes the pop-in. */
            loading="eager"
          />
        </li>
      ))}
    </ul>
  );
}
