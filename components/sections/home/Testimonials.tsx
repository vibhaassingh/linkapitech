import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionHeader } from "./SectionHeader";
import { TESTIMONIALS } from "@/content/testimonials";
import { HOME_SECTIONS } from "@/content/home";

/**
 * Client voices — three quiet quote cards with monogram avatars (no real
 * headshots exist; monograms beat stock photos for a bank audience).
 */
export function Testimonials() {
  return (
    <section id="voices" className="section-pad border-t border-line-soft bg-surface-2/60">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.voices} />

        <RevealGroup className="mt-14 grid gap-5 md:grid-cols-3" step={90}>
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-md border border-line bg-surface p-8 shadow-card"
            >
              <blockquote className="text-[15px] leading-relaxed text-ink-2">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line-soft pt-5">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-pill bg-navy-100 font-display text-[13px] font-semibold text-navy-900"
                >
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{t.name}</span>
                  <span className="block text-[12.5px] text-ink-3">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
