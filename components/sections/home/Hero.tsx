import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { HeroVisual } from "@/components/three/HeroVisual";
import { HERO } from "@/content/home";

/**
 * Institutional hero — text column left, connective-arc network visual right.
 * The H1 is the LCP element; the visual is a static SVG poster upgraded to a
 * lazy Three.js scene on capable desktops (Phase 4).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-6 pb-[clamp(56px,7vw,96px)] pt-[clamp(120px,15vh,180px)] md:px-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <Eyebrow>{HERO.eyebrow}</Eyebrow>
          </Reveal>
          {/* H1 and sub are LCP candidates — never reveal-gated, paint with first render. */}
          <h1 className="display-1 mt-5 text-ink">{HERO.headline}</h1>
          <p className="body-lg mt-6 max-w-[52ch] text-ink-2">{HERO.sub}</p>
          <Reveal delay={280}>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
              <Button href={HERO.cta.href}>{HERO.cta.label}</Button>
              <Button href={HERO.secondaryCta.href} variant="quiet">
                {HERO.secondaryCta.label}
              </Button>
            </div>
          </Reveal>
          <Reveal delay={380}>
            <p className="mt-10 flex items-center gap-3 text-[13px] text-ink-3">
              <span className="pulse-dot" aria-hidden="true" />
              <span className="font-mono uppercase tracking-eyebrow">{HERO.support.label}</span>
              <a href={HERO.support.href} className="tnum font-medium text-ink-2 hover:text-ink">
                {HERO.support.value}
              </a>
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="hidden lg:block">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
