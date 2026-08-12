import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionHeader } from "./SectionHeader";
import { Terminal } from "./Terminal";
import { PROCESS } from "@/content/process";
import { HOME_SECTIONS } from "@/content/home";

/**
 * "How We Work" — the four delivery stages down a connector rail, with the
 * sample request beside them. Server-rendered: no scroll-driven fill here (the
 * Figma shows a static rail), so this stays out of the client bundle.
 */
export function ProcessRail() {
  return (
    <section id="process" className="section-dark section-pad">
      <div className="mx-auto grid w-full max-w-[1240px] items-start gap-12 px-6 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeader meta={HOME_SECTIONS.process} inverse />

          <RevealGroup className="mt-10" as="ol" step={110}>
            {PROCESS.map((p, i) => (
              <li key={p.num} className="relative flex gap-5 pb-9 last:pb-0">
                {/* connector — stops at the last node */}
                {i < PROCESS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2 left-[19px] top-11 w-px bg-line-inv"
                  />
                )}
                <span className="glass relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-pill text-[13px] font-semibold text-ink-inv">
                  <span className="relative z-[1]">{p.num}</span>
                </span>
                <div className="min-w-0 pt-1.5">
                  <h3 className="text-[17px] font-semibold text-ink-inv">{p.title}</h3>
                  <p className="mt-1.5 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                    {p.description}
                  </p>
                </div>
              </li>
            ))}
          </RevealGroup>
        </div>

        <Reveal delay={200} className="lg:pt-4">
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}
