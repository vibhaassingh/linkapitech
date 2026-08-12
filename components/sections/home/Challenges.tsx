import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS, CHALLENGES } from "@/content/home";

/**
 * "Challenges We Solve" — six glass cards on plum.
 *
 * Presentation: `.sheet-enter` lifts the whole plum band in as a sheet (B0's
 * view()-timeline utility — translateY + scale + radius settling over the first
 * 22% of its view progress). It is a scroll-driven animation gated behind
 * `@supports (animation-timeline: view())` and disabled under reduced motion by
 * B0's definition, so there is nothing to gate here.
 *
 * Radius: cards land on the 20px card step (`rounded-lg` → --r-lg) with the
 * 12px nested step (`rounded-md`) on the icon tile, per the radius scale.
 */
export function Challenges() {
  return (
    <section className="section-dark section-pad sheet-enter">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.challenges} align="center" inverse />

        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          as="ul"
          step={70}
        >
          {CHALLENGES.map((c) => (
            <div key={c.body} className="glass sheen h-full rounded-lg p-7">
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
