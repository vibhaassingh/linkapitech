"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TESTIMONIALS } from "@/content/testimonials";
import { SECTION_META } from "@/content/home";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Testimonials — the "Approval Ledger" (HOMEPAGE-SECTIONS §6 / INTERACTIONS
 * §5.12). Single-active row over a fixed rail; auto-rotates after entering view
 * until the user interacts once. Cross-fade via grid-stacked layers.
 */
export function Testimonials() {
  const meta = SECTION_META.clients;
  const [active, setActive] = useState(0);
  const interacted = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let interval = 0;
    const startId = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (interacted.current) {
          clearInterval(interval);
          return;
        }
        setActive((a) => (a + 1) % TESTIMONIALS.length);
      }, 5200);
    }, 2000);
    return () => {
      clearTimeout(startId);
      clearInterval(interval);
    };
  }, []);

  const pick = (i: number) => {
    interacted.current = true;
    setActive(i);
  };

  return (
    <section id="clients" className="rsec-pad border-b border-line">
      <Reveal>
        <SectionEyebrow num={meta.num} label={meta.eyebrow} end={meta.end} />
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
        {/* main quote */}
        <div className="relative">
          <span
            className="pointer-events-none absolute -left-2 -top-10 select-none font-serif text-[160px] italic leading-none text-ink/[0.06]"
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <div className="relative grid">
            {TESTIMONIALS.map((t, i) => (
              <blockquote
                key={t.name}
                className={cn(
                  "col-start-1 row-start-1 transition-all duration-700 ease-brand",
                  active === i ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
                )}
                aria-hidden={active !== i}
              >
                <p className="max-w-[820px] text-[clamp(24px,2.8vw,44px)] font-medium leading-[1.18] tracking-[-0.025em]">
                  {withMark(t.quote, t.emphasis)}
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-sm font-semibold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-ink-3">{t.role}</div>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>

        {/* rail */}
        <div className="flex flex-col">
          <ul className="border-t border-line" role="list">
            {TESTIMONIALS.map((t, i) => (
              <li key={t.name}>
                <button
                  onClick={() => pick(i)}
                  onMouseEnter={() => pick(i)}
                  className={cn(
                    "flex w-full items-center gap-4 border-b border-line py-4 text-left transition-colors",
                    active === i ? "text-ink" : "text-ink-3 hover:text-ink-2",
                  )}
                  aria-current={active === i}
                >
                  <span className="font-serif text-sm italic tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium">{t.name}</span>
                    <span className="block text-[12px] text-ink-3">{t.role}</span>
                  </span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      active === i ? "bg-accent" : "bg-line",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-eyebrow text-ink-3">
            <span className="seal inline-grid h-6 w-6 place-items-center text-accent-deep">✓</span>
            {/* TODO: client to confirm — company/role & LinkedIn per testimonial */}
            Client-provided feedback
          </div>
        </div>
      </div>
    </section>
  );
}

function withMark(text: string, emphasis?: string): ReactNode {
  if (!emphasis || !text.includes(emphasis)) return text;
  const [before, after] = text.split(emphasis);
  return (
    <>
      {before}
      <span className="hl-mark font-serif italic">{emphasis}</span>
      {after}
    </>
  );
}
