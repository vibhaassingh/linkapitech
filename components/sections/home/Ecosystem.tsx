"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { useInView } from "@/components/motion/useInView";
import { useSectionProgress } from "@/components/motion/useSectionProgress";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS, ECOSYSTEM_CHIPS } from "@/content/home";
import { cn } from "@/lib/cn";

/**
 * "Product Ecosystem at a Glance" — ten product chips around a central hub,
 * joined by dotted connectors whose dashes drift toward the middle.
 *
 * The flanked layout is absolute from lg up; below that the same chips render
 * as a plain two-column list, the only legible option at phone widths.
 * Connector geometry is derived from the very same coordinates as the chips,
 * so the two can't drift apart.
 *
 * MOTION (all of it transform / opacity / stroke-dash — never layout)
 * 1. Hub carries `progress × 18°` of rotation from `--sp` (useSectionProgress),
 *    so the constellation's core turns as the section crosses the viewport.
 * 2. Chips stagger-scale in from 0.92 on `--spring-gentle`, growing away from
 *    the hub (transform-origin is the anchored edge), then hand over to the
 *    existing `.chip-float` idle drift.
 * 3. Connector dashes materialise on entry (stroke-dasharray 0 10 → 2 8) while
 *    `.eco-wire`'s standing dashoffset loop streams them toward the hub.
 * 4. A soft violet orb behind the hub carries `.orb-hand-off` — leg 3 of the
 *    hero-dome → who-we-are-card → ecosystem-hub travelling glow.
 * Reduced motion: `useSectionProgress` never registers (so `--sp` keeps its 0
 * default and the hub sits square), `useInView` reports true on first render and
 * globals.css zeroes every transition/animation, so the whole constellation
 * paints in its resting pose — which is exactly the pose the pixel baseline was
 * captured in.
 *
 * WHY THE CHIP MARKUP IS THREE LAYERS
 * `.chip-float`'s keyframes set `transform`, and animations outrank inline
 * styles in the cascade — so while it ran on the <Link> it silently replaced the
 * inline `translate(-100%, -50%)` hub-edge anchor, and every left-column chip
 * grew inward, toward the hub, instead of away from it. (The bug is invisible in
 * the QA baselines because those are captured with --force-prefers-reduced-motion,
 * where the animation is cancelled and the inline anchor applies.) Each
 * transform now owns its own element: Link = anchor, inner span = idle float,
 * pill = entry scale. Do not collapse these back into one element.
 */
const HUB = { x: 50, y: 50 };

/**
 * Chip anchors as % of the stage, in ECOSYSTEM_CHIPS order.
 *
 * Two flanking columns of five rather than a free scatter: chip labels differ
 * in width by ~3×, and any scattered arrangement that looked balanced at one
 * width collided at another. Here `x` is the chip's edge NEAREST the hub (so
 * chips grow outward, never into it) and the five rows are far enough apart
 * that no two can touch. The slight per-row x variance keeps the constellation
 * feel without risking overlap.
 */
const POS: { x: number; y: number; side: "left" | "right" }[] = [
  { x: 34, y: 7, side: "left" },
  { x: 66, y: 7, side: "right" },
  { x: 30, y: 28, side: "left" },
  { x: 70, y: 28, side: "right" },
  { x: 36, y: 50, side: "left" },
  { x: 64, y: 50, side: "right" },
  { x: 30, y: 72, side: "left" },
  { x: 70, y: 72, side: "right" },
  { x: 34, y: 93, side: "left" },
  { x: 66, y: 93, side: "right" },
];

export function Ecosystem() {
  /** `--sp` is written here and inherited by the hub below. */
  const sectionRef = useRef<HTMLElement | null>(null);
  useSectionProgress(sectionRef);
  /** Entry trigger for the chips and wires (one IO for the whole stage). */
  const { ref: stageRef, inView } = useInView<HTMLDivElement>();

  return (
    <section ref={sectionRef} className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.ecosystem} align="center" />

        {/* ---------- lg+: flanked constellation ---------- */}
        <Reveal delay={140} className="mt-12 hidden lg:block">
          <div ref={stageRef} className="relative aspect-[1000/680] w-full">
            {/*
              Travelling orb, leg 3 of 3. First in DOM so it paints under the
              wires and the hub; .orb-hand-off scrubs it low→seated→high across
              the section's transit, receiving the light from the "Who We Are"
              card wash above. The functional hub deliberately does NOT carry
              this class: orbHandOff scales to 0.82 and dips opacity to 0.35 at
              both ends, which on the hub itself would pull it off the point all
              ten connectors converge on.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
            >
              <div
                className="orb-hand-off h-[420px] w-[420px] rounded-pill"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, var(--violet-soft), transparent 70%)",
                }}
              />
            </div>

            <svg
              viewBox="0 0 1000 680"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              focusable="false"
            >
              {POS.map((p, i) => {
                const x1 = (p.x / 100) * 1000;
                const y1 = (p.y / 100) * 680;
                // stop the wire at the hub's rim, not its centre
                const rim = 78;
                const cx = (HUB.x / 100) * 1000;
                const cy = (HUB.y / 100) * 680;
                const dx = cx - x1;
                const dy = cy - y1;
                const len = Math.hypot(dx, dy) || 1;
                const x2 = cx - (dx / len) * rim;
                const y2 = cy - (dy / len) * rim;
                // bow each connector away from the straight line so the ten
                // paths fan out instead of overlapping into a starburst
                const mx = (x1 + x2) / 2 + (y2 - y1) * 0.14;
                const my = (y1 + y2) / 2 - (x2 - x1) * 0.14;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--lavender-400)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="eco-wire"
                    style={
                      {
                        ["--wire-delay" as string]: `${i * -1.1}s`,
                        /*
                          Entry rides on stroke-DASHARRAY, not dashoffset: the
                          standing `.eco-wire` animation already owns dashoffset
                          and an animated property masks any transition on the
                          same property, so a dashoffset transition here would
                          never start. Growing the dash from nothing while that
                          loop runs reads as the dashes streaming inward, and
                          leaves the ambient flow intact afterwards.
                        */
                        strokeDasharray: inView ? "2 8" : "0 10",
                        opacity: inView ? 0.75 : 0,
                        transition:
                          "stroke-dasharray var(--dur-spring-gentle) var(--spring-gentle), opacity var(--dur-spring-gentle) var(--spring-gentle)",
                        transitionDelay: `${140 + i * 45}ms`,
                      } as CSSProperties
                    }
                  />
                );
              })}
            </svg>

            {/* hub */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}
            >
              <div className="grid h-[150px] w-[150px] place-items-center rounded-pill bg-[var(--lavender-200)]">
                <div
                  className="eco-hub grid h-[104px] w-[104px] place-items-center rounded-pill grad-fill text-white shadow-float"
                  style={{ transform: "rotate(calc(var(--sp) * 18deg))" }}
                >
                  <Icon name="share" size={38} />
                </div>
              </div>
            </div>

            {/* chips */}
            {ECOSYSTEM_CHIPS.map((chip, i) => {
              const p = POS[i];
              const left = p.side === "left";
              return (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="absolute"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    // anchor the edge facing the hub, so chips grow outward
                    transform: left
                      ? "translate(-100%, -50%)"
                      : "translate(0, -50%)",
                  }}
                >
                  <span
                    className="chip-float block"
                    style={
                      { "--float-delay": `${i * -0.7}s` } as CSSProperties
                    }
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-2.5 rounded-pill border border-line-soft bg-surface py-2.5 shadow-card hover:shadow-float",
                        left ? "pl-5 pr-3" : "pl-3 pr-5",
                      )}
                      style={{
                        transform: inView ? "none" : "scale(0.92)",
                        // grow away from the hub, so the anchored edge holds
                        transformOrigin: left ? "100% 50%" : "0% 50%",
                        transition: `transform var(--dur-spring-gentle) var(--spring-gentle) ${i * 45}ms, box-shadow var(--dur-ui) ease`,
                      }}
                    >
                      {!left && (
                        <span
                          aria-hidden="true"
                          className="h-5 w-[3px] shrink-0 rounded-pill bg-plum-600"
                        />
                      )}
                      <Icon
                        name={chip.icon as IconName}
                        size={17}
                        className="text-violet-text"
                      />
                      <span className="whitespace-nowrap text-[14px] font-medium text-ink">
                        {chip.label}
                      </span>
                      {left && (
                        <span
                          aria-hidden="true"
                          className="h-5 w-[3px] shrink-0 rounded-pill bg-plum-600"
                        />
                      )}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Reveal>

        {/* ---------- below lg: plain list ----------
            `grid-cols-1` is load-bearing: without an explicit base column the
            implicit one is content-sized and the row overflows the viewport. */}
        <RevealGroup
          className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden"
          step={60}
        >
          {ECOSYSTEM_CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex h-full items-center gap-3 rounded-lg border border-line-soft bg-surface px-4 py-3.5 shadow-card"
            >
              <span className="grad-tile grid h-9 w-9 shrink-0 place-items-center">
                <Icon name={chip.icon as IconName} size={17} />
              </span>
              <span className="text-[14.5px] font-medium leading-snug text-ink">
                {chip.label}
              </span>
            </Link>
          ))}
        </RevealGroup>

        <Reveal delay={200} className="mt-10 text-center">
          <Button href="/solutions">Explore the Full Ecosystem</Button>
        </Reveal>
      </div>
    </section>
  );
}
