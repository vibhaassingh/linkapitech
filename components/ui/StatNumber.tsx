"use client";

import type { CSSProperties } from "react";
import { useOdometer } from "@/components/motion/hooks";
import { cn } from "@/lib/cn";
import type { Stat } from "@/content/stats";

interface StatNumberProps {
  stat: Stat;
  className?: string;
  /** class for the numeral itself */
  numClassName?: string;
  labelClassName?: string;
  /** Roll duration for a single column, ms (the stagger is added per digit). */
  duration?: number;
}

/** ms between adjacent columns; the rightmost digit leads. */
const STAGGER = 40;
/** Digits in one column's stack. Index 9 is always the target (see stackFor). */
const STACK = 10;

/**
 * A column's digit sequence, ending ON the target so the resting transform is
 * the same −9em for every column: for 7 → 8,9,0,1,…,6,7. The roll therefore
 * reads as a real odometer cycle (one full pass of ten digits) and every column
 * travels exactly the same distance, which is what keeps the row of digits
 * visually locked together while they spin.
 */
function stackFor(digit: number) {
  return Array.from({ length: STACK }, (_, i) => (digit + 1 + i) % 10);
}

/**
 * Count-up stat block, rendered as a per-digit odometer.
 *
 * HOW IT WORKS — and why there is no JS in the animation
 * Each digit is a 1em-tall clipped window containing a vertical stack of ten
 * digits. Its resting transform is `translateY(-9em)`, i.e. the LAST entry,
 * which is the target digit — so the server-rendered HTML, a no-JS visit and
 * reduced motion all paint the correct final number with nothing to do. The
 * roll is a CSS animation with only a `from` keyframe (`translateY(0)`); the
 * implicit `to` is the element's own resting transform, so it can never land
 * anywhere but on the right digit. See the `.odo*` rules in globals.css.
 *
 * Figures are tabular ON THE DIGIT COLUMNS ONLY — a proportional "1" would
 * change a column's width mid-roll. Commas, the ₹ prefix and unit suffixes sit
 * in their own proportional boxes, so the old tabular-comma gap ("5 , 000+")
 * cannot occur and, unlike the previous settled→proportional swap, nothing
 * changes width after the animation: CLS contribution is exactly zero.
 *
 * Accessibility: the odometer is decorative markup (`aria-hidden`), and the
 * accessible value is the real, complete string in a visually hidden span —
 * `aria-label` is not used because naming a <p> is prohibited by ARIA and axe
 * flags it. The numeral never wraps: a broken "₹20,000 / Cr" would push its
 * label out of alignment with the rest of the row.
 */
export function StatNumber({
  stat,
  className,
  numClassName,
  labelClassName,
  duration = 550,
}: StatNumberProps) {
  const digits =
    stat.count != null ? Math.round(stat.count).toLocaleString("en-IN") : "";
  const animated = digits !== "";
  const digitCount = digits.replace(/\D/g, "").length;
  const { ref, rolling, settled } = useOdometer(
    duration + Math.max(0, digitCount - 1) * STAGGER,
  );

  // Right-to-left stagger: the rightmost digit leads with no delay.
  let fromRight = digitCount;

  return (
    <div className={cn("flex flex-col", className)}>
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className={cn("stat-num whitespace-nowrap text-ink", numClassName)}
      >
        {animated ? (
          <>
            <span className="sr-only">{stat.value}</span>
            <span
              aria-hidden="true"
              className="odo"
              data-roll={rolling || undefined}
              data-settled={settled || undefined}
            >
              {stat.prefix && <span className="odo-fix">{stat.prefix}</span>}
              {[...digits].map((ch, i) => {
                if (!/\d/.test(ch)) {
                  return (
                    <span key={i} className="odo-fix">
                      {ch}
                    </span>
                  );
                }
                fromRight -= 1;
                return (
                  <span key={i} className="odo-col">
                    <span
                      className="odo-stack"
                      style={{ "--odo-i": fromRight } as CSSProperties}
                    >
                      {stackFor(Number(ch)).map((d, j) => (
                        <span key={j}>{d}</span>
                      ))}
                    </span>
                  </span>
                );
              })}
              {stat.suffix && <span className="odo-fix">{stat.suffix}</span>}
            </span>
          </>
        ) : (
          stat.value
        )}
      </p>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed text-ink-3",
          labelClassName,
        )}
      >
        {stat.label}
      </p>
    </div>
  );
}
