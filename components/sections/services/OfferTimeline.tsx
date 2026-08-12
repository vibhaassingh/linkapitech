import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { WHAT_WE_OFFER } from "@/content/services";
import { cn } from "@/lib/cn";

/**
 * "What We Offer" — six commitments alternating either side of a centre rail
 * with gradient number nodes (Figma page 37). Below lg the rail moves left and
 * every card sits in one column; a zig-zag at phone width just makes each card
 * half as wide for no gain.
 */
export function OfferTimeline() {
  return (
    <section id="what-we-offer" className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">What We Offer</h2>
        </Reveal>

        <div className="relative mt-14">
          {/* rail */}
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[19px] top-6 w-px bg-lavender-300 lg:left-1/2"
          />

          <ol className="flex flex-col gap-8 lg:gap-2">
            {WHAT_WE_OFFER.map((step, i) => {
              const right = i % 2 === 1;
              return (
                <li key={step.num} className="relative">
                  {/* The number node is absolutely positioned, so it occupies no
                      grid cell — the card must be placed by explicit column,
                      since `order` has nothing in flow to swap with. */}
                  <div className="grid items-center gap-x-10 lg:grid-cols-2">
                    <Reveal
                      delay={60}
                      dir={right ? "right" : "left"}
                      className={cn(
                        "pl-14 lg:pl-0",
                        right ? "lg:col-start-2 lg:pl-14" : "lg:col-start-1 lg:pr-14",
                      )}
                    >
                      <article
                        className={cn(
                          "relative overflow-hidden rounded-lg bg-tint p-6 shadow-card",
                          // accent edge faces the rail
                          right ? "lg:pl-7" : "lg:pr-7",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute inset-y-0 w-[3px] bg-plum-600",
                            right ? "left-0" : "left-0 lg:left-auto lg:right-0",
                          )}
                        />
                        <div className="flex items-start justify-between gap-5">
                          <p className="max-w-[42ch] text-[15.5px] leading-relaxed text-ink">
                            {step.body}
                          </p>
                          <span className="grad-tile grid h-10 w-10 shrink-0 place-items-center">
                            <Icon name={step.icon} size={18} />
                          </span>
                        </div>
                      </article>
                    </Reveal>

                    {/* node — absolute so it lands on the rail regardless of row height */}
                    <span
                      aria-hidden="true"
                      className="grad-fill absolute left-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-pill text-[13px] font-semibold text-ink-inv ring-[6px] ring-[color:var(--lavender-200)] lg:left-1/2 lg:-translate-x-1/2"
                    >
                      {step.num}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
