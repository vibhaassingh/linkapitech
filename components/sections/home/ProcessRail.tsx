"use client";

import { useRef } from "react";
import { useScrollFill } from "@/components/motion/hooks";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionHeader } from "./SectionHeader";
import { PROCESS, PROCESS_SIGNOFF } from "@/content/process";
import { HOME_SECTIONS } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * Delivery process — four numbered phases along a scroll-filled rail
 * (vertical on all breakpoints; the fill is written straight to a CSS var,
 * no per-frame React state). No durations are shown: none exist in the
 * source and inventing them is forbidden.
 */
export function ProcessRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef(PROCESS.map(() => ({ current: null as HTMLElement | null })));
  const passed = useScrollFill(railRef, stepRefs.current);

  return (
    <section id="process" className="section-pad border-t border-line-soft">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.process} />

        <div className="relative mt-14 md:mt-16">
          {/* rail */}
          <div
            ref={railRef}
            className="absolute bottom-6 left-[7px] top-2 w-px bg-line-soft md:left-1/2"
            aria-hidden="true"
          >
            <div
              className="w-full origin-top bg-navy-600"
              style={{ height: "100%", transform: "scaleY(var(--fill, 0))" }}
            />
          </div>

          <div className="flex flex-col gap-14 md:gap-20">
            {PROCESS.map((phase, i) => {
              const done = i < passed;
              const left = i % 2 === 0;
              return (
                <div
                  key={phase.num}
                  ref={(el) => {
                    stepRefs.current[i].current = el;
                  }}
                  className={cn(
                    "relative pl-10 md:w-[calc(50%-40px)] md:pl-0",
                    left ? "md:mr-auto md:text-right" : "md:ml-auto",
                  )}
                >
                  {/* node */}
                  <span
                    className={cn(
                      "absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-pill border transition-colors duration-ui md:top-2",
                      left ? "md:left-auto md:-right-[48px]" : "md:-left-[48px]",
                      done ? "border-navy-600 bg-navy-600" : "border-steel-2 bg-surface",
                    )}
                    aria-hidden="true"
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-pill", done ? "bg-surface" : "bg-steel-2")}
                    />
                  </span>

                  <p className="font-mono text-xs uppercase tracking-eyebrow text-ink-3">
                    {phase.phaseLabel}
                  </p>
                  <h3 className="heading-3 mt-2 text-ink">
                    {phase.title}
                    {phase.accent ? ` ${phase.accent}` : ""}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-2">{phase.description}</p>
                  <ul
                    className={cn(
                      "mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-3",
                      left && "md:justify-end",
                    )}
                  >
                    {phase.deliverables.map((d) => (
                      <li key={d} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-pill bg-steel" aria-hidden="true" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <RevealGroup className="mt-16 md:text-center" step={0}>
          <p className="mx-auto max-w-[48ch] text-[15px] leading-relaxed text-ink-2">
            {PROCESS_SIGNOFF.lead}{" "}
            <span className="font-medium text-ink">{PROCESS_SIGNOFF.accent}</span>
          </p>
        </RevealGroup>
      </div>
    </section>
  );
}
