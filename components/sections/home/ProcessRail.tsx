"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { useSectionProgress } from "@/components/motion/useSectionProgress";
import { SectionHeader } from "./SectionHeader";
import { Terminal } from "./Terminal";
import { PROCESS } from "@/content/process";
import { HOME_SECTIONS } from "@/content/home";

/**
 * Sub-range of the section's transit that the rail fills across. Matches
 * Terminal's TYPE_FROM/TYPE_TO exactly — that identity is the whole point:
 * one measure (`--sp-live`) drives the rail and the code lines together, so a
 * stage lighting up and its payload appearing are the same gesture.
 */
const RAIL_FROM = 0.18;
const RAIL_TO = 0.58;

/** `clamp()`d 0→1 sub-progress of [from, from+span] within `--sp-live`. */
const sub = (from: number, span: number) =>
  `clamp(0, calc((var(--sp-live, 1) - ${from.toFixed(4)}) / ${span.toFixed(4)}), 1)`;

/**
 * Connector fill for the segment below step `i`. `--fill` keeps the name the
 * old `useScrollFill` hook used, and the same discipline: the value is never
 * React state. Here CSS derives it from the inherited progress, so the cost
 * per frame is one custom-property write on the section — no scroll listener,
 * no per-element JS, nothing to clean up.
 */
function fillStyle(i: number, segments: number): CSSProperties {
  const span = (RAIL_TO - RAIL_FROM) / Math.max(1, segments);
  return {
    "--fill": sub(RAIL_FROM + i * span, span),
    transform: "scaleY(var(--fill))",
  } as CSSProperties;
}

/**
 * Node "lit" overlay for step `i` — fades up over the last half-segment before
 * the fill arrives, landing exactly as the connector above it completes, so the
 * stages brighten in sequence instead of all reading as current.
 */
function litStyle(i: number, segments: number): CSSProperties {
  const span = (RAIL_TO - RAIL_FROM) / Math.max(1, segments);
  return {
    "--lit": sub(RAIL_FROM + (i - 0.5) * span, span * 0.5),
    opacity: "var(--lit)",
  } as CSSProperties;
}

/**
 * "How We Work" — the four delivery stages down a connector rail, with the
 * sample request beside them.
 *
 * ONE MEASURE FOR BOTH COLUMNS. `useSectionProgress` writes `--sp` on the
 * section; it inherits, so the rail fill, the node highlights and the
 * terminal's line-by-line typing are all pure CSS derivations of the same
 * number. Nothing here re-renders while scrolling, and there is no second rAF:
 * the hook's shared loop is the only one running.
 *
 * WHY THE `--sp-live` ALIAS. `--sp` is declared `0` on `:root` and the hook is
 * a deliberate no-op under reduced motion, so `var(--sp, …)` can never fall
 * back — a consumer that treats 0 as "not yet revealed" would hide its content
 * outright for reduced-motion users, with JS disabled, and before hydration.
 * The effect below therefore publishes `--sp-live: var(--sp)` (a live alias,
 * re-substituted whenever `--sp` changes) only once a real driver is running.
 * Everything downstream reads `var(--sp-live, 1)`, so "no driver" means
 * "finished": full rail, lit nodes, every code line visible. Fail-open is the
 * only safe default for content.
 *
 * Reduced motion, per effect: `.sheet-enter` — disabled by name in globals.css's
 * reduced-motion block. Rail fill / node lighting / terminal typing — the
 * matchMedia guard below never publishes `--sp-live`, so all three sit at their
 * completed pose. Reveal/RevealGroup — the existing `[data-reveal]` rules.
 */
export function ProcessRail() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useSectionProgress(sectionRef);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Two frames, so the shared observer has delivered its first `--sp` write
    // before anything starts reading it. Without the wait, a deep link that
    // lands mid-section would show one frame of completed state.
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() =>
        el.style.setProperty("--sp-live", "var(--sp)"),
      );
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      el.style.removeProperty("--sp-live");
    };
  }, []);

  const segments = Math.max(1, PROCESS.length - 1);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="section-dark section-pad sheet-enter"
    >
      <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-start gap-12 px-6 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeader meta={HOME_SECTIONS.process} inverse />

          <RevealGroup className="mt-10" as="ol" step={110}>
            {PROCESS.map((p, i) => (
              <div key={p.num} className="relative flex gap-5 pb-9 last:pb-0">
                {/* Connector — stops at the last node. The track stays a
                    hairline; the fill inside it scales from the top.
                    19.5px centres a 1px rail on the 40px node; the 4px gaps
                    top and bottom are symmetric. */}
                {i < PROCESS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-1 left-[19.5px] top-11 w-px bg-line-inv"
                  >
                    <span
                      style={fillStyle(i, segments)}
                      className="absolute inset-0 origin-top bg-ink-inv-3"
                    />
                  </span>
                )}
                <span className="glass relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-pill text-[13px] font-semibold text-ink-inv">
                  <span
                    aria-hidden="true"
                    style={litStyle(i, segments)}
                    className="absolute inset-0 rounded-pill bg-veil-2"
                  />
                  <span className="relative z-[1]">{p.num}</span>
                </span>
                <div className="min-w-0 pt-1.5">
                  <h3 className="text-[17px] font-semibold text-ink-inv">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </RevealGroup>
        </div>

        <Reveal delay={200} className="min-w-0 lg:pt-4">
          <Terminal progress />
        </Reveal>
      </div>
    </section>
  );
}
