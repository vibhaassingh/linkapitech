import { Reveal } from "@/components/motion/Reveal";
import { HOME_SECTIONS, WHO_WE_ARE } from "@/content/home";

/**
 * "Who We Are?" — one wide card stating the TSP positioning.
 *
 * Vertical rhythm follows the home 8-pt scale: heading → content = mt-12 (48),
 * card padding = p-8 / md:p-10 (32 / 40), the same pair the plum "What We Do"
 * rows use so the two adjacent cards read as one family.
 */
export function WhoWeAre() {
  return (
    <section className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">{HOME_SECTIONS.who.heading}</h2>
        </Reveal>

        <Reveal delay={120}>
          {/* `isolate` makes the card its own stacking context, so the -z-10
              wash paints over the card's white fill but under the copy — the
              same trick .ambient-violet uses at section level. */}
          <div className="relative isolate mt-12 overflow-hidden rounded-xl border border-line-soft bg-surface p-8 shadow-card md:p-10">
            {/*
              Travelling orb, leg 2 of 3 (hero dome glow → here → ecosystem hub).
              Its rest position mirrors --grad-hero's radial (78% 30%) so the
              glow appears to have carried down the page rather than restarted;
              .orb-hand-off scrubs it toward the next section's hub at the seam.
              Pure background/transform — no layout, no CLS — and the class is
              @supports/reduced-motion gated in globals.css, so with motion off
              (or on a browser without view timelines) this is simply a static
              violet wash at --violet-soft, the token defined for exactly this.
            */}
            <span
              aria-hidden="true"
              className="orb-hand-off pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(52% 76% at 78% 24%, var(--violet-soft), transparent 64%)",
              }}
            />

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
