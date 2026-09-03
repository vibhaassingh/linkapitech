import { Fragment } from "react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Droplet, Meniscus, Seam } from "@/components/motifs";
import { HeroLens } from "@/components/three/HeroLens";
import { HERO } from "@/content/home";

/**
 * Homepage hero (REDESIGN-V4 Part E §1) — a Droplet eyebrow, the display-0
 * headline, two CTAs, and the lens composition on the right. The H1 and lead
 * are deliberately NOT reveal-gated: the headline is the LCP element and must
 * paint on first frame.
 *
 * The section IS a `.section-dark` now (`band-hero` swaps in --grad-hero's two
 * violet blooms over the plum base), so the shared ::after grain dithers it
 * like every other dark band — the hand-rolled gradient + grain divs are gone.
 * `.section-dark` also sets the inverted ink defaults, the plum scrollbar and
 * ::selection colours, and is the stacking context the motifs rely on.
 *
 * `.hero-recede` gives the section the iOS "sheet presenting over the app
 * window" read: as the hero scrolls out it drops a fraction of a percent of
 * scale, so the white band arriving beneath reads as a sheet sliding *over*
 * the hero. Transform only, identity at scroll 0 (the H1 paints untouched),
 * inside the `@supports (animation-timeline: view())` + reduced-motion guards.
 *
 * Bottom edge: a Seam (the vessel's rim) directly above a Meniscus filled with
 * the LogoMarquee's --surface — the dark band ends as a liquid surface. Both
 * are stacked in one absolute wrapper at the bottom; the section's bottom
 * padding (80/112px) is taller than the pair (33/57/81px), so nothing overlaps
 * the CTA row or the lens.
 */
export function Hero() {
  // The " · " separators become 3px dots at render; the content string itself
  // is untouched (content/home.ts stays the single source of copy).
  const eyebrowParts = HERO.eyebrow.split(" · ");

  return (
    <section
      /* data-hero: chrome.css's no-JS / first-frame baseline reads it to paint
         the pill dark; data-surface: the header's tone observer targets it. */
      data-surface="dark"
      data-hero="dark"
      className="section-dark band-hero hero-recede relative isolate overflow-hidden"
    >
      <div className="relative z-[1] mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 px-6 pb-20 pt-[140px] md:px-10 md:pb-28 md:pt-[168px] lg:min-h-[min(92svh,920px)] lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)] lg:gap-10">
        <div>
          {/* Droplet is a capsule, not an Eyebrow: <Eyebrow>'s --ink-3 would
              trip the ink-on-glass rule. --ink-inv-2 is the tier-1 secondary
              ink (§A6). The parts sit in ONE inline span so the label wraps as
              text on narrow viewports (flex items would not wrap). The dots are
              decorative; the surrounding spaces keep the words apart for
              assistive tech. */}
          <Droplet className="text-[0.72rem] font-medium uppercase leading-[1.7] tracking-eyebrow text-ink-inv-2">
            <span>
              {eyebrowParts.map((part, i) => (
                <Fragment key={part}>
                  {i > 0 && (
                    <>
                      {" "}
                      <span
                        aria-hidden="true"
                        className="mx-1.5 inline-block h-[3px] w-[3px] rounded-pill bg-lavender-400 align-middle"
                      />{" "}
                    </>
                  )}
                  {part}
                </Fragment>
              ))}
            </span>
          </Droplet>

          <h1 className="display-0 mt-7 max-w-[14ch] text-ink-inv">
            {HERO.headline}
          </h1>

          <p className="mt-6 max-w-[54ch] text-[17px] leading-[1.65] text-ink-inv-2">
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

        {/* Lens column. Mobile: 420px, centred, after the type. lg: the
            wrapper stretches the cell and bleeds 6% past its right edge
            (width auto + negative margin — an explicit w-full would ignore
            the margin); the section's overflow-hidden clips the bleed. */}
        <div className="mx-auto w-full max-w-[420px] lg:ml-0 lg:-mr-[6%] lg:w-auto lg:max-w-none">
          <HeroLens />
        </div>
      </div>

      {/* Bottom edge: Seam (rim) over the Meniscus (the next band's surface,
          rising). .seam is position:relative in motifs.css and would out-rank
          a Tailwind `absolute`, so both sit in-flow inside one absolute box. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <Seam />
        <Meniscus fill="var(--surface)" />
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
