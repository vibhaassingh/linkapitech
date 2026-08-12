import type { CSSProperties } from "react";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
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
  return (
    <section className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.ecosystem} align="center" />

        {/* ---------- lg+: flanked constellation ---------- */}
        <Reveal delay={140} className="mt-14 hidden lg:block">
          <div className="relative aspect-[1000/680] w-full">
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
                    strokeDasharray="2 8"
                    strokeLinecap="round"
                    opacity="0.75"
                    className="eco-wire"
                    style={{ ["--wire-delay" as string]: `${i * -1.1}s` }}
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
                <div className="eco-hub grid h-[104px] w-[104px] place-items-center rounded-pill grad-fill text-white shadow-float">
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
                  className="chip-float absolute"
                  style={
                    {
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      // anchor the edge facing the hub, so chips grow outward
                      transform: left ? "translate(-100%, -50%)" : "translate(0, -50%)",
                      "--float-delay": `${i * -0.7}s`,
                    } as CSSProperties
                  }
                >
                  <span
                    className={cn(
                      "group inline-flex items-center gap-2.5 rounded-pill border border-line-soft bg-surface py-2.5 shadow-card transition-shadow duration-ui hover:shadow-float",
                      left ? "pl-5 pr-3" : "pl-3 pr-5",
                    )}
                  >
                    {!left && (
                      <span
                        aria-hidden="true"
                        className="h-5 w-[3px] shrink-0 rounded-pill bg-plum-600"
                      />
                    )}
                    <Icon name={chip.icon as IconName} size={17} className="text-violet-text" />
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
                </Link>
              );
            })}
          </div>
        </Reveal>

        {/* ---------- below lg: plain list ---------- */}
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
              <span className="text-[14.5px] font-medium leading-snug text-ink">{chip.label}</span>
            </Link>
          ))}
        </RevealGroup>

        <Reveal delay={200} className="mt-12 text-center">
          <Button href="/solutions">Explore the Full Ecosystem</Button>
        </Reveal>
      </div>
    </section>
  );
}
