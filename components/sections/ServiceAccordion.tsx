"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { SERVICES } from "@/content/services";
import { SECTION_META } from "@/content/home";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Chip } from "@/components/ui/Chip";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Services accordion (HOMEPAGE-SECTIONS §3) — 7 rows, first open, one-open-at-
 * a-time, CSS grid-rows height animation. Row illustrations use a lightweight
 * gradient placeholder (no source illustrations exist — TODO: client to supply).
 */
export function ServiceAccordion({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const meta = SECTION_META.services;
  const [open, setOpen] = useState<string>(SERVICES[0].id);

  return (
    <section id="services" className={cn(!standalone && "rsec-pad border-b border-line", standalone && "rsec-pad")}>
      {!standalone && (
        <>
          <Reveal>
            <SectionEyebrow num={meta.num} label={meta.eyebrow} end={meta.end} />
          </Reveal>
          <Reveal delay={80}>
            <MixedHeading
              plain={meta.headingPlain}
              accent={meta.headingAccent}
              className="mb-4 max-w-[22ch] text-[clamp(30px,4.5vw,56px)] leading-[1.05] tracking-tighter"
            />
          </Reveal>
        </>
      )}

      <Reveal delay={standalone ? 0 : 120} className="mt-10 border-t border-line" as="div">
        <ul role="list">
          {SERVICES.map((s) => {
            const isOpen = open === s.id;
            return (
              <li
                key={s.id}
                id={s.id}
                className={cn("acc-row border-b border-line scroll-mt-28", isOpen && "is-open")}
              >
                <button
                  className="relative flex w-full items-center gap-5 py-6 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? "" : s.id)}
                >
                  <span className="acc-lime absolute left-0 top-1/2 h-[56%] w-[3px] -translate-y-1/2 bg-accent" />
                  <span className="font-serif text-[clamp(18px,2vw,26px)] italic tabular-nums text-ink-3">
                    {s.num}
                  </span>
                  <span className="flex-1 font-sans text-[clamp(19px,2.4vw,32px)] font-medium leading-[1.1] tracking-[-0.02em]">
                    {s.title} <span className="font-serif font-normal italic text-ink-2">{s.accent}</span>
                  </span>
                  <Toggle open={isOpen} />
                </button>

                {/* Collapsed panels are hidden from AT so screen readers don't read all 7 at once. */}
                <div className="acc-panel" aria-hidden={!isOpen}>
                  <div className="acc-panel-min">
                    <div className="acc-inner grid gap-8 pb-9 md:grid-cols-[1.05fr_0.9fr]">
                      <div>
                        <p className="max-w-[56ch] text-[15px] leading-relaxed text-ink-2">
                          {s.description}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {s.tags.map((t) => (
                            <Chip key={t}>{t}</Chip>
                          ))}
                        </div>
                        {/* s.note carries an internal TODO flag (see content/services.ts); not user-facing. */}
                      </div>
                      <div className="ben-poster grid aspect-[16/10] max-h-[240px] place-items-center rounded-[18px] border border-line">
                        <span className="relative z-10 px-4 text-center font-serif text-xl italic text-ink-2">
                          {s.accent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

function Toggle({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-300",
        open ? "border-accent" : "border-line",
      )}
      aria-hidden="true"
    >
      <span className="relative block h-3.5 w-3.5">
        <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink" />
        <span
          className={cn(
            "absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink transition-transform duration-300 ease-brand",
            open && "scale-y-0",
          )}
        />
      </span>
    </span>
  );
}
