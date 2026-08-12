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
 * Shared inner-page hero. Runs full-bleed under the floating header, so it
 * carries the header clearance itself (pt-[132px]).
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
      <div
        className={cn(
          "mx-auto w-full max-w-[1240px] px-6 pb-16 pt-[132px] md:px-10 md:pb-20 md:pt-[152px]",
          twoCol && "grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16",
        )}
      >
        <div className={cn(centered && "mx-auto max-w-[46rem] text-center")}>
          {eyebrow && (
            <Reveal>
              <span className="eyebrow-capsule">{eyebrow}</span>
            </Reveal>
          )}
          <Reveal delay={eyebrow ? 90 : 0}>
            <h1
              className={cn(
                "display-1",
                eyebrow && "mt-6",
                dark ? "text-ink-inv" : "text-ink",
                centered ? "mx-auto" : "max-w-[20ch]",
              )}
            >
              {title}
            </h1>
          </Reveal>
          {lead && (
            <Reveal delay={180}>
              <p
                className={cn(
                  "body-lg mt-6 max-w-[62ch]",
                  dark ? "text-ink-inv-2" : "text-ink-2",
                  centered && "mx-auto",
                )}
              >
                {lead}
              </p>
            </Reveal>
          )}
        </div>

        {visual && (
          <Reveal delay={220} className="lg:justify-self-end">
            {visual}
          </Reveal>
        )}
      </div>
    </header>
  );
}
