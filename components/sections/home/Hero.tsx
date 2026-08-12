import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroOrbit } from "@/components/three/HeroOrbit";
import { HERO } from "@/content/home";

/**
 * Homepage hero — plum gradient, capsule eyebrow, two CTAs, and the orbit
 * visual on the right. The H1 and sub are deliberately NOT reveal-gated: the
 * headline is the LCP element and must paint on first frame.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--plum-900)]">
      {/* gradient + radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "var(--grad-hero)" }}
      />

      <div className="relative z-[1] mx-auto grid grid-cols-1 w-full max-w-[1240px] items-center gap-12 px-6 pb-20 pt-[140px] md:px-10 md:pb-28 md:pt-[168px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <span className="eyebrow-capsule">{HERO.eyebrow}</span>

          <h1 className="display-1 mt-7 max-w-[19ch] text-ink-inv">
            {HERO.headline}
          </h1>

          <p className="mt-6 max-w-[54ch] text-[16.5px] leading-relaxed text-ink-inv-2">
            {HERO.sub}
          </p>

          <Reveal
            delay={220}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href={HERO.cta.href} variant="light">
              {HERO.cta.label}
            </Button>
            <Button
              href={HERO.secondaryCta.href}
              variant="glass"
              icon={<SpeakIcon />}
            >
              {HERO.secondaryCta.label}
            </Button>
          </Reveal>
        </div>

        <HeroOrbit />
      </div>
    </section>
  );
}

function SpeakIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9.5" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 19.5c0-3.2 2.7-5 6-5s6 1.8 6 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M17.5 7.5a4 4 0 0 1 0 5M20 5.5a7 7 0 0 1 0 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
