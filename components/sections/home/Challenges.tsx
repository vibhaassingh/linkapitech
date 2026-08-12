import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS, CHALLENGES } from "@/content/home";

/** "Challenges We Solve" — six glass cards on plum. */
export function Challenges() {
  return (
    <section className="section-dark section-pad">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.challenges} align="center" inverse />

        <RevealGroup
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          as="ul"
          step={70}
        >
          {CHALLENGES.map((c) => (
            <div key={c.body} className="glass sheen h-full rounded-xl p-7">
              <span className="glass-strong relative z-[1] grid h-11 w-11 place-items-center rounded-md text-ink-inv">
                <Icon name={c.icon} size={19} />
              </span>
              <p className="relative z-[1] mt-6 text-[15px] leading-relaxed text-ink-inv">
                {c.body}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
