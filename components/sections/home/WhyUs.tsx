import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { HOME_SECTIONS, WHY_US } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Ghost-numeral parallax amplitude. 16px rather than `.scrub-drift`'s 22px
 * default: these digits are 52–64px tall and sit beside their own heading, so a
 * full-range drift would visibly break the baseline relationship.
 */
const DRIFT: CSSProperties = { "--drift-range": "16px" } as CSSProperties;

/**
 * "Why LinkAPI Tech" — four zig-zag rows. Odd rows read number → title → body
 * left-to-right; even rows mirror, with alternating band tints, exactly as the
 * Figma lays them out. Each row slides in from its own side.
 *
 * Ghost numerals: the one-shot settle (`.ghost-num`'s translateY(10px) → none
 * on `[data-inview]`) is upgraded to CONTINUOUS parallax via B0's
 * `.scrub-drift`, so the big digits keep reading as a background plane for the
 * whole time the row is on screen instead of freezing after the reveal.
 *
 * Layering, deliberate: `.scrub-drift` lives behind
 * `@supports (animation-timeline: view())`, and while its animation runs it
 * owns `transform`, overriding `.ghost-num`'s declared translate. Where view()
 * timelines are unsupported the class is inert and the original one-shot settle
 * still plays — so this degrades rather than dropping the motion. Reduced
 * motion is handled inside B0's `.scrub-drift` definition, and the existing
 * `@media (prefers-reduced-motion: reduce) .ghost-num { transform: none }` rule
 * still flattens the fallback path.
 */
export function WhyUs() {
  return (
    <section className="bg-surface pt-[clamp(80px,10vh,140px)]">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">{HOME_SECTIONS.why.heading}</h2>
        </Reveal>
      </div>

      <div className="mt-12">
        {WHY_US.map((row, i) => {
          const mirrored = i % 2 === 1;
          return (
            <Reveal
              key={row.num}
              as="article"
              className={cn(
                "border-t border-line-soft",
                i % 2 === 0 ? "bg-canvas" : "bg-surface",
                i === WHY_US.length - 1 && "border-b",
              )}
            >
              <div
                className={cn(
                  "mx-auto grid grid-cols-1 w-full max-w-[1240px] items-center gap-x-8 gap-y-4 px-6 py-12 md:grid-cols-2 md:px-10 md:py-14",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-6",
                    mirrored && "md:order-2 md:flex-row-reverse md:text-right",
                  )}
                >
                  <span
                    className="ghost-num scrub-drift text-[52px] md:text-[64px]"
                    style={DRIFT}
                    aria-hidden="true"
                  >
                    {row.num}
                  </span>
                  <h3 className="text-[19px] font-semibold leading-snug text-ink md:text-[21px]">
                    {row.title}
                  </h3>
                </div>

                <p
                  className={cn(
                    "max-w-[54ch] text-[15.5px] leading-relaxed text-ink-2",
                    mirrored && "md:order-1 md:justify-self-end md:text-right",
                  )}
                >
                  {row.body}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
