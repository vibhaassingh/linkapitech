import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

interface PageHeroProps {
  /** Capsule eyebrow. Omit where the Figma shows none. */
  eyebrow?: string;
  /**
   * Heading. Pass a string, or a node when the Figma splits it two-tone
   * (wrap the accent words in `<span className="accent-word">`).
   */
  title: ReactNode;
  lead?: string;
  /** `dark` = plum gradient (About, Contact); `light` = lavender wash. */
  tone?: "dark" | "light";
  align?: "left" | "center";
  /** Right-hand visual (diagram / illustration). Forces the two-column layout. */
  visual?: ReactNode;
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
 * Shared inner-page hero. Runs full-bleed under the floating header, so it
 * carries the header clearance itself.
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
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "center",
  visual,
  className,
}: PageHeroProps) {
  const dark = tone === "dark";
  const twoCol = Boolean(visual);
  const centered = align === "center" && !twoCol;

  return (
    <header
      className={cn(
        "relative overflow-hidden",
        dark ? "section-dark" : "section-wash",
        className,
      )}
    >
      <style href={VT_ID} precedence="default">
        {VT_CSS}
      </style>

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
              <span className="eyebrow-capsule">{eyebrow}</span>
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

        {visual && (
          <Reveal delay={160} className="lg:justify-self-end">
            {visual}
          </Reveal>
        )}
      </div>
    </header>
  );
}
