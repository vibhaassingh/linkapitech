import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Per-slab parallax ranges for `.scrub-drift`. Three different amplitudes are
 * what create the depth read: the near slab travels most, the far one least.
 * (`--drift-range` is B0's knob; ±22px is the class default.)
 */
const SLAB_NEAR: CSSProperties = { "--drift-range": "22px" } as CSSProperties;
const SLAB_MID: CSSProperties = { "--drift-range": "14px" } as CSSProperties;
const SLAB_FAR: CSSProperties = { "--drift-range": "7px" } as CSSProperties;

interface CtaBandProps {
  /** Capsule label above the headline. */
  eyebrow?: string;
  /** Per-page CTA label — the Figma varies this on every page. */
  ctaLabel: string;
  ctaHref?: string;
  /** Optional second CTA (homepage pairs the demo with a partnership email). */
  secondary?: { label: string; href: string };
}

/**
 * Shared closing CTA band: plum gradient, capsule eyebrow, one headline that
 * repeats site-wide, and a page-specific button. The tilted glass slabs are
 * the Figma's decorative corners.
 *
 * Motion: `.sheet-enter` presents the band as a sheet, and the three slabs
 * drift at three different rates (`.scrub-drift` + `--drift-range`) so the
 * corner decoration reads as depth rather than as flat wallpaper. Both are
 * B0 view()-timeline utilities — scroll-driven, `@supports`-gated and
 * reduced-motion-safe by definition, so no extra gating is needed here.
 *
 * DO NOT REMOVE `overflow-hidden`: the slabs are 130–150% tall and sit at
 * negative insets, and the drift pushes them further out. Clipping is the only
 * thing stopping them from widening the document — that exact horizontal
 * overflow bug has been fixed here once already.
 */
export function CtaBand({
  eyebrow = "Start your journey",
  ctaLabel,
  ctaHref = "/contact",
  secondary,
}: CtaBandProps) {
  return (
    <section className="section-dark sheet-enter relative overflow-hidden">
      {/* decorative tilted glass slabs (Figma corners) — near, mid, far */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          style={SLAB_NEAR}
          className="scrub-drift absolute -left-24 -top-16 h-[130%] w-[280px] rotate-[14deg] bg-white/[0.045]"
        />
        <div
          style={SLAB_MID}
          className="scrub-drift absolute -right-20 -top-24 h-[150%] w-[320px] rotate-[14deg] bg-white/[0.035]"
        />
        {/* Far slab: widest, faintest, slowest — reads as the back plane. */}
        <div
          style={SLAB_FAR}
          className="scrub-drift absolute -right-56 -top-32 h-[170%] w-[420px] rotate-[14deg] bg-white/[0.022]"
        />
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-[1240px] px-6 py-24 text-center md:px-10 md:py-28">
        <Reveal>
          <span className="eyebrow-capsule">{eyebrow}</span>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="display-2 mx-auto mt-7 max-w-[22ch] text-ink-inv">
            Let&rsquo;s build the next generation of banking together.
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href={ctaHref} variant="light">
              {ctaLabel}
            </Button>
            {secondary && (
              <Button href={secondary.href} variant="glass" icon={<MailIcon />}>
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4.5 8 6.6 4.6a1.6 1.6 0 0 0 1.8 0L19.5 8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
