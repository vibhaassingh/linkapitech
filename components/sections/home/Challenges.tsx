import { RevealGroup } from "@/components/motion/RevealGroup";
import { Caustic, Node, Seam } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS, CHALLENGES } from "@/content/home";

/**
 * "Challenges We Solve" — six sweep cards on plum (REDESIGN-V4 Part E §6).
 *
 * Cards are `.liq liq-sweep liq-enter`: tier-2 glass whose specular is the
 * scroll-driven sweep band (`.liq-sweep::after`, view()-timed, ≥1024 — the
 * hover highlight it replaces retires here) and whose entry is the depth
 * settle `scale(.96) → 1` (`.liq-enter`, all viewports). The sweep passes
 * UNDER the copy, so every text run on these cards is `--ink-inv` — no
 * secondary ink anywhere inside a `.liq-sweep` (§A6; qa.mjs enforces it).
 *
 * The Nodes are `inset` (veil fill, no second blur — 12 → 6 blur layers, §A7)
 * and deliberately DIM: no `lit`, so the glow rests at .35 — the flow is
 * blocked, which is what these six lines describe. Hovering or focusing a
 * card lights its Node (`.liq:hover .node-glow` in motifs.css): the "we solve
 * it" beat. Part I records the risk that dim reads as disabled; the fallback
 * there is glow .6 and dropping the beat — an owner-review call.
 *
 * `liq-static-mobile` on every card: at 390px a card is ~200px tall, so four
 * can share one phone viewport, and four blurs + the pill nav would exceed
 * §A7's phone budget of 4. Below 1024 the cards keep their fill, edge, rim
 * and depth and lose only the frost.
 *
 * Shell: `.sheet-enter` + a `sheet-shadow` first child (Part D i), a Seam on
 * the top edge, one Caustic lower-left (matching `--grad-section-b`'s bloom)
 * in its own `absolute inset-0 overflow-hidden` clip box — the section itself
 * carries no overflow-hidden, which would clip the shadow's upward 40px. The
 * clip box has no z-index, so the disc still paints at z:-2 inside the
 * `.section-dark` stacking context, under the grain. `.seam` and `.conduit`
 * declare `position: relative` after Tailwind, hence the Seam's wrapper.
 *
 * RevealGroup emits the `<li>` for each child (pass plain children); the grid
 * has its base `grid-cols-1`. Radius: cards on the 20px step (`rounded-lg`).
 */
export function Challenges() {
  return (
    <section className="section-dark band-b section-pad sheet-enter">
      <span aria-hidden="true" className="sheet-shadow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <Seam />
      </div>
      {/* x/y are the TOP-LEFT corner: a 520px disc centred at (16%, 80%). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Caustic
          x="calc(16% - 260px)"
          y="calc(80% - 260px)"
          size="520px"
          drift="mid"
        />
      </span>

      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.challenges} align="center" inverse />

        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          as="ul"
          step={70}
        >
          {CHALLENGES.map((c) => (
            <div
              key={c.body}
              className="liq liq-sweep liq-enter liq-static-mobile relative isolate h-full overflow-hidden rounded-lg p-7"
            >
              <Node inset size={44} icon={<Icon name={c.icon} size={19} />} />
              <p className="mt-6 text-[15px] leading-relaxed text-ink-inv">
                {c.body}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
