import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { VerticalCutReveal } from "@/components/motion/VerticalCutReveal";
import { HeroAccent } from "@/components/motion/HeroAccent";
import { TrustLogos } from "./TrustLogos";
import { HERO } from "@/content/home";
import { TRUST_LINE } from "@/content/stats";

/**
 * Hero (HOMEPAGE-SECTIONS §1) — centered column, no photo. The signature
 * two-line mixed headline animates in via the VCR per-glyph reveal; supporting
 * copy fades up. No invented SLA — a real support channel is shown instead.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center overflow-hidden px-6 pb-[clamp(72px,10vw,120px)] pt-[clamp(140px,18vw,240px)] text-center"
    >
      <HeroAccent />
      <SpinBadge />

      <div className="relative z-10 flex w-full max-w-[1200px] flex-col items-center">
        <h1 className="font-sans font-medium leading-[1.02] tracking-[-0.035em] text-[clamp(36px,12vw,64px)] xs:text-[clamp(42px,11vw,80px)] md:text-[clamp(48px,9vw,96px)] lg:text-[clamp(56px,8.4vw,132px)]">
          <span className="block">
            <VerticalCutReveal text="Secure connections" mode="chars" stagger={28} from="140%" />
          </span>
          <span className="block">
            <VerticalCutReveal text={`${HERO.headline.line2Plain} `} mode="chars" stagger={28} baseDelay={220} from="140%" />
            <VerticalCutReveal
              text={HERO.headline.line2Accent}
              mode="chars"
              stagger={28}
              baseDelay={340}
              from="140%"
              className="font-serif font-normal italic text-ink-2"
            />
          </span>
        </h1>

        <Reveal delay={900} className="mt-8 max-w-[54ch]">
          <p className="text-[clamp(16px,1.35vw,21px)] leading-relaxed text-ink-2">
            {HERO.subhead.text}{" "}
            <em className="font-serif italic text-ink">{HERO.subhead.emphasis}</em>
          </p>
        </Reveal>

        <Reveal delay={1100} className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <Button href={HERO.cta.href} magnetic>
            {HERO.cta.label}
          </Button>
          <a
            href={HERO.support.href}
            className="inline-flex items-center gap-2.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            <span className="pulse-dot" />
            <span className="uppercase tracking-eyebrow text-ink-3">{HERO.support.label}</span>
            <span className="tabular-nums">{HERO.support.value}</span>
          </a>
        </Reveal>

        <Reveal delay={1350} className="mt-16 w-full">
          <p className="mb-7 text-[11px] uppercase tracking-eyebrow text-ink-3">{TRUST_LINE}</p>
          <TrustLogos />
        </Reveal>
      </div>
    </section>
  );
}

function SpinBadge() {
  return (
    <div className="seal pointer-events-none absolute left-6 top-[clamp(120px,15vw,180px)] hidden text-ink lg:block" aria-hidden="true">
      <svg viewBox="0 0 100 100" width="96" height="96">
        <defs>
          <path id="heroSeal" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <text className="seal-text">
          <textPath href="#heroSeal">LINKAPI TECH · BFSI INTEGRATION · </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
    </div>
  );
}
