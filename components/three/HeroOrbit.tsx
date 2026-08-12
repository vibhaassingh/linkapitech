import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HeroField } from "@/components/three/HeroField";

/**
 * Hero visual — concentric orbit arcs with three floating glass chips.
 *
 * Server-rendered SVG + DOM: crisp at any density, costs no JS, and paints
 * with the hero so it can never push the LCP. <HeroField> layers an optional
 * WebGL haze between the arcs and the chips on capable desktops; the arcs and
 * chips are the whole composition on their own, so it is purely additive.
 *
 * Depth: the composition is split into two parallax planes via `.scrub-drift`,
 * whose keyframes run translateY(+range) → translateY(−range) across the
 * element's transit. That is EXTRA upward travel on top of the scroll, so the
 * sign reads: positive range = travels further than the page = LEADS it;
 * negative range = travels less = TRAILS it.
 *
 * So the arc plate gets −22px (trails, ≈ 0.9× rate) and the chips get +16…20px
 * (lead, ≈ 1.08×), and the chips visibly separate off the arcs as the hero
 * moves. The two rates are the requested 0.10 deficit / 0.08 surplus about 1.0,
 * scaled onto the utility's 22px base amplitude. Both planes are transform-only
 * and both sit inside `@supports (animation-timeline: view())`, with
 * `.scrub-drift` additionally killed by name under prefers-reduced-motion — so
 * the effect collapses to the flat composition whenever either gate fails.
 */
const CHIPS: {
  icon: IconName;
  className: string;
  delay: string;
  /**
   * Per-chip parallax range. Positive = the chip leads the scroll. The three
   * values are staggered rather than uniform so the chips also hold depth
   * *against each other* and settle at slightly different points in the
   * transit, which is the de-synchronised read the ~60ms lag was after. A
   * literal time lag is not available on this timeline: `animation-delay` is
   * ignored for progress-based timelines, and offsetting `animation-range`
   * instead would move the animation's before-phase boundary and jump the
   * chip by its full range on entry.
   */
  drift: string;
  label: string;
}[] = [
  {
    icon: "bolt",
    className: "left-[46%] top-[6%]",
    delay: "0s",
    drift: "20px",
    label: "Real-time payments",
  },
  {
    icon: "spark",
    className: "left-[10%] top-[36%]",
    delay: "-2.4s",
    drift: "16px",
    label: "AI-powered accounting",
  },
  {
    icon: "layers",
    className: "right-[8%] top-[40%]",
    delay: "-4.6s",
    drift: "18px",
    label: "ERP-native ledger",
  },
];

export function HeroOrbit() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]">
      {/* Arc plate — the trailing parallax plane. The SVG arcs and the WebGL
          haze share one wrapper on purpose: createHeroField maps its camera 1:1
          onto this SVG's 500×400 viewBox and its pulses ride these exact arcs,
          so drifting the two separately would visibly unstick the pulses from
          the strokes they travel. One transform, both layers, always locked. */}
      <div
        className="scrub-drift absolute inset-0"
        style={{ "--drift-range": "-22px" } as CSSProperties}
      >
        {/* Concentric arcs */}
        <svg
          viewBox="0 0 500 400"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="ho-arc" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.16" />
            </linearGradient>
            <radialGradient id="ho-core" cx="50%" cy="100%" r="70%">
              <stop offset="0%" stopColor="#C9B8D8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#C9B8D8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {[210, 158, 106].map((r, i) => (
            <path
              key={r}
              d={`M ${250 - r} 340 A ${r} ${r} 0 0 1 ${250 + r} 340`}
              fill="none"
              stroke="url(#ho-arc)"
              strokeWidth={i === 2 ? 1.4 : 1}
            />
          ))}
          {/* innermost dome, softly filled */}
          <path d="M 170 340 A 80 80 0 0 1 330 340 Z" fill="url(#ho-core)" />
        </svg>

        {/* Ambient WebGL haze — sits above the arcs, below the chips. */}
        <HeroField />
      </div>

      {/* Floating glass chips — the leading parallax plane. Three nested
          transforms, one per concern, so none of them can clobber another:
          outer = scroll parallax (.scrub-drift), middle = the existing
          .chip-float idle animation, inner = the ≤3° pointer tilt ([data-tilt]).
          Kept on `.glass` rather than the explicit `.glass-2`: the contract
          defines `.glass` AS tier 2, so the rename would be churn with no
          visual delta. */}
      {CHIPS.map((c) => (
        <div
          key={c.icon}
          className={`scrub-drift absolute ${c.className}`}
          style={{ "--drift-range": c.drift } as CSSProperties}
        >
          <div
            className="chip-float"
            style={{ "--float-delay": c.delay } as CSSProperties}
          >
            <div
              className="glass grid h-[52px] w-[52px] place-items-center rounded-pill text-ink-inv"
              data-tilt=""
              role="img"
              aria-label={c.label}
            >
              <Icon name={c.icon} size={22} className="relative z-[1]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
