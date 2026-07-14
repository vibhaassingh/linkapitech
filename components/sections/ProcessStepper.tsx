"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/cn";
import { PROCESS, PROCESS_SIGNOFF } from "@/content/process";
import { SECTION_META } from "@/content/home";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/motion/Reveal";
import { useScrollFill } from "@/components/motion/hooks";

/**
 * Process stepper (HOMEPAGE-SECTIONS §4) — scroll-driven rail fill (not click,
 * not auto-advance). Rows intensify from muted to full ink as the fill passes.
 * Reduced motion jumps to the complete state (useScrollFill).
 */
export function ProcessStepper({ standalone = false }: { standalone?: boolean }) {
  const meta = SECTION_META.process;
  const railRef = useRef<HTMLDivElement>(null);
  const stepRefs = useMemo(
    () => PROCESS.map(() => ({ current: null as HTMLElement | null })),
    [],
  );
  const passed = useScrollFill(railRef, stepRefs, 0.62);
  const complete = passed >= PROCESS.length;

  return (
    <section id="process" className={cn("rsec-pad", !standalone && "border-b border-line")}>
      {!standalone && (
        <>
          <Reveal>
            <SectionEyebrow num={meta.num} label={meta.eyebrow} end={meta.end} />
          </Reveal>
          <Reveal delay={80}>
            <MixedHeading
              plain={meta.headingPlain}
              accent={meta.headingAccent}
              className="mb-14 max-w-[20ch] text-[clamp(30px,4.5vw,56px)] leading-[1.05] tracking-tighter"
            />
          </Reveal>
        </>
      )}

      <div className="relative mx-auto max-w-[1000px]">
        {/* continuous rail */}
        <div ref={railRef} className="absolute bottom-4 left-[19px] top-2 w-[2px]">
          <div className="absolute inset-0 border-l border-dashed border-line" />
          <div className="proc-fill absolute inset-0 w-full" />
        </div>

        {PROCESS.map((p, i) => {
          const isPassed = i < passed;
          return (
            <div
              key={p.num}
              ref={(el) => {
                stepRefs[i].current = el;
              }}
              className="relative grid grid-cols-[40px_1fr] gap-x-5 py-8 md:grid-cols-[40px_1fr_clamp(180px,18vw,260px)] md:gap-x-10"
            >
              <div className="relative flex justify-center pt-1">
                <span
                  className={cn(
                    "relative z-10 grid h-4 w-4 place-items-center rounded-full border-2 bg-bg transition-all duration-500",
                    isPassed ? "border-accent" : "border-line",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors duration-500",
                      isPassed ? "bg-accent" : "bg-transparent",
                    )}
                  />
                </span>
              </div>

              <div>
                <span
                  className={cn(
                    "font-serif text-sm italic tabular-nums transition-colors duration-500",
                    isPassed ? "text-accent-deep" : "text-ink-3",
                  )}
                >
                  {p.num}
                </span>
                <h3
                  className={cn(
                    "mt-1 font-sans text-[clamp(22px,2.2vw,30px)] font-medium leading-[1.1] tracking-[-0.02em] transition-colors duration-500",
                    isPassed ? "text-ink" : "text-ink-3",
                  )}
                >
                  {p.title}{" "}
                  <span className="font-serif font-normal italic text-ink-2">{p.accent}</span>
                </h3>
                <p className="mt-2 max-w-[54ch] text-[14.5px] leading-relaxed text-ink-2">
                  {p.description}
                </p>
                <div className="mt-4 md:hidden">
                  <Meta phaseLabel={p.phaseLabel} deliverables={p.deliverables} />
                </div>
              </div>

              <div className="hidden md:block">
                <Meta phaseLabel={p.phaseLabel} deliverables={p.deliverables} />
              </div>
            </div>
          );
        })}

        {/* sign-off */}
        <div className="relative grid grid-cols-[40px_1fr] gap-x-5 pt-6">
          <div className="flex justify-center">
            <span
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full border transition-colors duration-500",
                complete ? "border-accent bg-accent text-white" : "border-line text-ink-3",
              )}
            >
              ✓
            </span>
          </div>
          <p
            className={cn(
              "self-center text-[clamp(16px,1.6vw,20px)] transition-colors duration-500",
              complete ? "text-ink" : "text-ink-3",
            )}
          >
            {PROCESS_SIGNOFF.lead}{" "}
            <span className="font-serif italic text-ink-2">{PROCESS_SIGNOFF.accent}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Meta({ phaseLabel, deliverables }: { phaseLabel: string; deliverables: string[] }) {
  return (
    <>
      <span className="text-[11px] uppercase tracking-eyebrow text-ink-3">{phaseLabel}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {deliverables.map((d) => (
          <Chip key={d} variant="outline" className="px-3 py-1.5 text-[11px]">
            {d}
          </Chip>
        ))}
      </div>
    </>
  );
}
