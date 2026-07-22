import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionHeader } from "./SectionHeader";
import { BENEFITS } from "@/content/benefits";
import { HOME_SECTIONS } from "@/content/home";

/** Why LinkAPI — six reasons, 3×2 hairline cards. */
export function Benefits() {
  return (
    <section id="why" className="section-pad">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.why} />

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" step={70}>
          {BENEFITS.map((b) => (
            <div
              key={b.num}
              className="rounded-md border border-line bg-surface p-7 shadow-card"
            >
              <p className="font-mono text-xs text-steel">{b.num}</p>
              <h3 className="mt-3 font-display text-[18px] font-semibold leading-snug text-ink">
                {b.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-3">{b.description}</p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
