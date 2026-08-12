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
 */
const CHIPS: { icon: IconName; className: string; delay: string; label: string }[] = [
  {
    icon: "bolt",
    className: "left-[46%] top-[6%]",
    delay: "0s",
    label: "Real-time payments",
  },
  {
    icon: "spark",
    className: "left-[10%] top-[36%]",
    delay: "-2.4s",
    label: "AI-powered accounting",
  },
  {
    icon: "layers",
    className: "right-[8%] top-[40%]",
    delay: "-4.6s",
    label: "ERP-native ledger",
  },
];

export function HeroOrbit() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]">
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

      {/* Floating glass chips */}
      {CHIPS.map((c) => (
        <div
          key={c.icon}
          className={`chip-float absolute ${c.className}`}
          style={{ "--float-delay": c.delay } as CSSProperties}
        >
          <div
            className="glass grid h-[52px] w-[52px] place-items-center rounded-pill text-ink-inv"
            role="img"
            aria-label={c.label}
          >
            <Icon name={c.icon} size={22} className="relative z-[1]" />
          </div>
        </div>
      ))}
    </div>
  );
}
