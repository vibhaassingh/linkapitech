import { Reveal } from "@/components/motion/Reveal";
import { HOME_SECTIONS, WHO_WE_ARE } from "@/content/home";

/** "Who We Are?" — one wide card stating the TSP positioning. */
export function WhoWeAre() {
  return (
    <section className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">{HOME_SECTIONS.who.heading}</h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 rounded-xl border border-line-soft bg-surface p-8 shadow-card md:p-12">
            <p className="max-w-[92ch] text-[17px] leading-[1.75] text-ink-2">
              {WHO_WE_ARE.lead}{" "}
              <strong className="font-semibold text-violet-text">
                {WHO_WE_ARE.bold}
              </strong>{" "}
              {WHO_WE_ARE.tail}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
