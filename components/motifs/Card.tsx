import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Node } from "./Node";

interface CardProps {
  /** Which band the card sits on — decides the glass variant and the ink. */
  tone: "dark" | "light";
  /**
   * Emphasised card. Dark: tier 3 glass (`.liq-3`), and therefore `--ink-inv`
   * for title AND body. Light: the Figma's tinted, lavender-bordered card —
   * a solid `bg-tint` surface, not glass (see the note in the body).
   */
  feature?: boolean;
  /** Icon glyph — an <Icon>, rendered in a Node (dark) or a lavender disc (light). */
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Renders the whole card as a next/link <Link> when given (otherwise a <div>). */
  href?: string;
}

/**
 * Card — the shared card family (REDESIGN-V4 Part C). Replaces the per-page
 * CARD_LIFT strings once the inner pages are rewritten (Phase 9).
 *
 * Dark:  `.liq rounded-lg p-7 md:p-8 liq-live liq-spec` with a `Node inset`
 *        icon tile (no second blur). Title `--ink-inv`, body `--ink-inv-2`.
 *        Feature → `.liq-3`, and then EVERY text run is `--ink-inv`: over
 *        band A, tier 3 composites to a surface where `--ink-inv-2` measures
 *        4.04:1 (§A6) — the qa.mjs "ink on glass" rule fails the build on it.
 * Light: `.liq liq-light rounded-lg p-7 md:p-8 liq-live liq-spec` with a
 *        44px `--lavender-200` disc. Title `--ink`, body `--ink-2`. Uses
 *        `.liq-spec`, never `.spotlight`: `.spotlight` must not share an
 *        element with `.liq-light` (both want a pseudo, and .liq owns both).
 *        Feature → a solid `bg-tint border border-lavender-300` card. NOT
 *        glass: `.liq` sets background-color after Tailwind's utilities, so
 *        `bg-tint` on a `.liq` element would silently lose — exactly the
 *        no-op class this repo has shipped before. `.spotlight` is allowed
 *        there because the element is not `.liq`.
 * `icon-draw` is kept on every variant so an `<Icon draw>` replays on hover.
 *
 * ── MEASURED (Phase 9a, the first call sites) ─────────────────────────────
 * Composited the way qa.mjs's contrast walk does it — brightest stop of every
 * background layer, source-over:
 *   dark tier 2 (.liq)  over band A (plum-700)  --ink-inv-2  4.52:1  ✓
 *                       over band B (its .22 bloom over plum-800)  4.54:1  ✓
 *   dark tier 3 (.liq-3) over band A            --ink-inv-2  4.04:1  ✗
 *                                               --ink-inv    6.56:1  ✓
 *   light tier 2 (.liq liq-light) over the wash --ink-3      5.41:1  ✓
 *                                               --ink-2      9.27:1  ✓
 * Tier 2's 0.02–0.04 of headroom is the whole reason for the two rules below.
 *
 * A CAUSTIC CORE BEHIND A CARD SPENDS THAT HEADROOM. A `.caustic` is a sibling
 * overlay, so the walk cannot see it, and a full `--violet-a24` core under a
 * tier-2 card takes `--ink-inv-2` to 4.01:1 — a fail no check will report.
 * Either keep the disc off the card (Part J Phase 7's CtaBand placement) or
 * promote every run in the card to `--ink-inv` (Part J Phase 9a, the
 * /industries dark mocks).
 *
 * ── BLUR BUDGET (§A7: ≤ 4 layers per phone viewport, ≤ 8 per desktop) ──────
 * A grid of Cards is a glass CLUSTER and will overrun the budget on its own.
 * Both escape hatches ride in through `className`, no prop needed:
 *   `liq-flat`           never blurs. Correct — and free — wherever the card
 *                        sits on a FLAT surface (`--surface`, `--canvas`): a
 *                        Gaussian blur of a constant field is that constant,
 *                        and `saturate(1.15)` on it is achromatic, so the
 *                        frost is provably zero pixels of difference (Part J
 *                        Phase 8). The rim, the wet edge and the shadow are
 *                        what draw the glass.
 *   `liq-static-mobile`  keeps the frost ≥ 1024 and drops it below.
 * `liq-flat` is also the fix — not a nicety — when the card sits inside an
 * ancestor with `opacity < 1` or `contain: paint`: that ancestor is a BACKDROP
 * ROOT in Chromium and the frost samples an empty backdrop (Testimonials'
 * `.card-depth`, Part J Phase 8). A `[data-reveal]` wrapper is only opacity < 1
 * DURING its entry transition and rests at 1, so that case is transient and
 * needs nothing.
 *
 * ── `.liq-live` IS EXCLUSIVE ON ITS ELEMENT ────────────────────────────────
 * It owns `transform`, so `className` must never add `liq-enter`, `card-depth`,
 * `scrub-drift` or `[data-tilt]` here — nest a wrapper instead (§A4). Nothing
 * enforces this; the symptom is a dead hover lift, not an error.
 */
export function Card({
  tone,
  feature,
  icon,
  title,
  children,
  className,
  href,
}: CardProps) {
  const dark = tone === "dark";
  const lightFeature = !dark && feature;

  const shell = cn(
    "group block rounded-lg p-7 md:p-8 icon-draw",
    dark && "liq liq-live liq-spec",
    dark && feature && "liq-3",
    !dark && !feature && "liq liq-light liq-live liq-spec",
    lightFeature && "bg-tint border border-lavender-300 spotlight shadow-card",
    className,
  );
  // --liq-pad is the specular mask's text-free frame; 28px matches p-7 and,
  // with the 18px feather, stays inside md's 32px padding. The light feature
  // card is not glass and has no specular, so it gets none.
  const style = lightFeature ? undefined : ({ "--liq-pad": "28px" } as CSSProperties);

  const titleInk = dark ? "text-ink-inv" : "text-ink";
  // Tier 3 hosts --ink-inv only (§A6); every other tier keeps the secondary ink.
  const bodyInk = dark ? (feature ? "text-ink-inv" : "text-ink-inv-2") : "text-ink-2";

  const body = (
    <>
      {icon &&
        (dark ? (
          <Node inset size={44} icon={icon} className="mb-6" />
        ) : (
          <span className="card-icon-light mb-6" aria-hidden="true">
            {icon}
          </span>
        ))}
      <h3 className={cn("heading-3", titleInk)}>{title}</h3>
      {children && <div className={cn("mt-3 text-[15px] leading-relaxed", bodyInk)}>{children}</div>}
    </>
  );

  // next/link, never a raw <a>: internal links go through the App Router so
  // the RouteTransition view transition fires — it exists only for client
  // navigation (components/chrome/RouteTransition.tsx).
  if (href) {
    return (
      <Link href={href} className={shell} style={style}>
        {body}
      </Link>
    );
  }
  return (
    <div className={shell} style={style}>
      {body}
    </div>
  );
}
