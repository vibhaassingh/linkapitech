"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { useInView } from "@/components/motion/useInView";
import { useSectionProgress } from "@/components/motion/useSectionProgress";
import { Caustic, Conduit, Node, Seam } from "@/components/motifs";
import { SectionHeader } from "./SectionHeader";
import { SCRUB_FROM, SCRUB_TO, Terminal } from "./Terminal";
import { PROCESS } from "@/content/process";
import { HOME_SECTIONS } from "@/content/home";

/**
 * Sub-range of the section's transit that the rail fills across. It is
 * IMPORTED, not declared: `SCRUB_FROM`/`SCRUB_TO` live in Terminal.tsx as the
 * single source of truth, so the rail and the code lines cannot drift apart
 * again. That identity is the whole point of Part E row 10 — one measure
 * (`--sp-live`) drives both, so a stage lighting up and its payload appearing
 * are the same gesture.
 *
 * Phase 7 originally kept two pairs of literals with a comment in each file
 * asserting they matched, retuned only this one for the pin, and left the
 * terminal on the pre-pin window; see Terminal.tsx's note for the arithmetic
 * behind 0.29 / 0.68 and the sp↔`contain` mapping, and REDESIGN-V4 Part J
 * (Phase 7) for the frame-by-frame reading of the whole measure.
 *
 * Aliased locally so every formula below reads as the rail's own window.
 */
const RAIL_FROM = SCRUB_FROM;
const RAIL_TO = SCRUB_TO;

/** `clamp()`d 0→1 sub-progress of [from, from+span] within `--sp-live`. */
const sub = (from: number, span: number) =>
  `clamp(0, calc((var(--sp-live, 1) - ${from.toFixed(4)}) / ${span.toFixed(4)}), 1)`;

/**
 * Fill for the rail Conduit. `--fill` keeps the name the old `useScrollFill`
 * hook used, and the same discipline: the value is never React state. Here CSS
 * derives it from the inherited progress, so the cost per frame is one
 * custom-property write on the section — no scroll listener, no per-element JS,
 * nothing to clean up.
 *
 * The whole rail is ONE element now (Part E row 10: the Conduit's flow element
 * IS the fill), so there is no per-segment index: it grows from 0 to the full
 * track across [RAIL_FROM, RAIL_TO], reaching each Node exactly as that Node
 * lights.
 */
function fillStyle(): CSSProperties {
  return {
    "--fill": sub(RAIL_FROM, RAIL_TO - RAIL_FROM),
    transform: "scaleY(var(--fill))",
  } as CSSProperties;
}

/**
 * Node "lit" overlay for step `i` — fades up over the last half-segment before
 * the fill arrives, landing exactly as the connector above it completes, so the
 * stages brighten in sequence instead of all reading as current.
 */
function litStyle(i: number, segments: number): CSSProperties {
  const span = (RAIL_TO - RAIL_FROM) / Math.max(1, segments);
  return {
    "--lit": sub(RAIL_FROM + (i - 0.5) * span, span * 0.5),
    opacity: "var(--lit)",
  } as CSSProperties;
}

/**
 * "How We Work" — the four delivery stages down a glass conduit, with the
 * sample request beside them in a Ledger.
 *
 * ONE MEASURE FOR BOTH COLUMNS. `useSectionProgress` writes `--sp` on the
 * section; it inherits, so the rail fill, the node highlights and the
 * terminal's line-by-line typing are all pure CSS derivations of the same
 * number. Nothing here re-renders while scrolling, and there is no second rAF:
 * the hook's shared loop is the only one running.
 *
 * WHY THE `--sp-live` ALIAS. `--sp` is declared `0` on `:root` and the hook is
 * a deliberate no-op under reduced motion, so `var(--sp, …)` can never fall
 * back — a consumer that treats 0 as "not yet revealed" would hide its content
 * outright for reduced-motion users, with JS disabled, and before hydration.
 * The effect below therefore publishes `--sp-live: var(--sp)` (a live alias,
 * re-substituted whenever `--sp` changes) only once a real driver is running.
 * Everything downstream reads `var(--sp-live, 1)`, so "no driver" means
 * "finished": full rail, lit nodes, every code line visible. Fail-open is the
 * only safe default for content.
 *
 * ── V4 (Phase 7): THE PINNED STORY ────────────────────────────────────────
 * Part D (iii) / Part E row 10. `.pin` is a 260vh wrapper that owns a NAMED
 * view timeline (`view()` on a sticky child stalls, because the sticky box
 * does not move through the scrollport); `.pin-stage` sticks at 100vh; the
 * four `PROCESS` phases are `.pin-step` `<li>`s that cross-fade in sequence
 * off that timeline while the Ledger holds still beside them. ≥1024 and
 * `@supports (animation-timeline: view())` only.
 *
 * THE STEPS STAY IN FLOW. Nothing about the pinned layout is positioned
 * differently from the stacked one — the only thing `.pin-step` does is
 * animate opacity + translateY. That is a deliberate choice, and it is what
 * makes every fallback free:
 *   • below 1024, and without `view()` support, none of the `.pin*` rules
 *     match, so the section IS today's stacked column;
 *   • under reduced motion `.pin` un-pins, `.pin-stage` goes static and
 *     `.pin-step`'s animation is killed by name in globals.css — leaving four
 *     visible rows in flow, which is what `kbd2` asserts;
 *   • no absolutely-stacked steps means no configuration in which four text
 *     blocks share one box, so `layout.mjs`'s text-overlap check can never
 *     fire on this section.
 * The read is a single lit row travelling down a fixed spine as the fill
 * front and the code lines advance with it.
 *
 * `:nth-of-type` COUNTS SAME-TAG SIBLINGS WITHIN ONE PARENT, so the four
 * `.pin-step`s are the only `<li>` children of one `<ol>`. Two consequences
 * the markup below is shaped by: the rail Conduit is a `<div>` OUTSIDE the
 * `<ol>` (a same-tag sibling inside it would shift every range), and
 * `RevealGroup` cannot render the list — it wraps each child in its own `<li>`,
 * which would make every step `:nth-of-type(1)` of its own parent. The
 * staggered reveal is therefore hand-rolled on an inner `<div>` per row: one
 * element per concern (the `<li>` owns the pin, the inner div owns the entry),
 * so the two never contend for opacity.
 *
 * The SectionHeader sits INSIDE `.pin-stage`, above the grid. Putting it
 * outside `.pin` would push `.pin`'s top down by the header's height and make
 * the sp↔`contain` mapping above depend on how many lines the lead wraps to;
 * inside the stage, the section is exactly pad + 260vh + pad.
 *
 * Reduced motion, per effect: `.sheet-enter`, `.sheet-shadow` and `.pin-step`
 * — disabled by name in globals.css's reduced-motion block, which also
 * un-pins `.pin`/`.pin-stage`. Rail fill / node lighting / terminal typing —
 * the matchMedia guard below never publishes `--sp-live`, so all three sit at
 * their completed pose. Reveal — the existing `[data-reveal]` rules.
 */
export function ProcessRail() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useSectionProgress(sectionRef);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Two frames, so the shared observer has delivered its first `--sp` write
    // before anything starts reading it. Without the wait, a deep link that
    // lands mid-section would show one frame of completed state.
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() =>
        el.style.setProperty("--sp-live", "var(--sp)"),
      );
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      el.style.removeProperty("--sp-live");
    };
  }, []);

  /**
   * WHERE THE SPINE ENDS. The track must stop at Node 04's CENTRE: the fill
   * front and Node 04's glow complete on the same frame (both at RAIL_TO), so
   * a stub of lit spine continuing past the last marker reads as a measure
   * that has not finished. The old `bottom-9` was carried over from the
   * retired per-segment `pb-9` and, with the last `<li>` on `last:pb-0`, it is
   * short by whatever the last row's copy overhangs its 44px Node by — about
   * 30px at desktop, and different at every width, so no static value can be
   * right (V4 Phase-7 review).
   *
   * So it is measured: `--rail-end` is the distance from this box's bottom
   * edge up to the last Node's centre. ONE ResizeObserver on the box, one
   * layout read per delivery, rAF-deferred so the read never happens inside
   * the observer's own callback — the same discipline as SiteHeader's nav
   * measurement. Nothing here runs per frame, and the Tailwind fallback
   * (2.25rem) keeps the pre-hydration and no-JS pose exactly as it was.
   */
  const railBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const box = railBoxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    const measure = () => {
      const node = box.querySelector<HTMLElement>("li:last-child .node");
      if (!node) return;
      const nr = node.getBoundingClientRect();
      const end = box.getBoundingClientRect().bottom - (nr.top + nr.height / 2);
      box.style.setProperty("--rail-end", `${Math.max(0, Math.round(end))}px`);
    };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    });
    ro.observe(box);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      box.style.removeProperty("--rail-end");
    };
  }, []);

  /**
   * Staggered entry for the four rows — RevealGroup's mechanics (one IO on the
   * list, `--reveal-delay` per child) inlined because its `<li>` wrapper would
   * break `:nth-of-type`. See the block comment above.
   */
  const { ref: listRef, inView } = useInView<HTMLOListElement>();

  const segments = Math.max(1, PROCESS.length - 1);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="section-dark band-a section-pad sheet-enter"
    >
      <span aria-hidden="true" className="sheet-shadow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <Seam />
      </div>
      {/* One Caustic behind the terminal, in its own `absolute inset-0
          overflow-hidden` clip box: the section carries NO overflow-hidden,
          which would clip `.sheet-shadow`'s upward 40px (globals.css says so
          in as many words). The box has no z-index and no `isolate`, so the
          disc's z-index:-2 still resolves against `.section-dark` — above the
          band, under the grain — while the box clips it. x/y are the TOP-LEFT
          corner: a 520px disc centred at (78%, 50%) of the SECTION.

          IT DOES NOT SIT BEHIND THE LEDGER, and the earlier claim that it did
          was geometry that cannot hold (V4 Phase-7 review). This disc is fixed
          at 50% of a ~260vh section with ±14px of `.scrub-drift`, while the
          Ledger is inside the `sticky` stage and therefore travels about 1.6
          viewports relative to that box — it starts a viewport BELOW the disc
          and ends a viewport above it, passing behind it only briefly near the
          middle of the pin. What the disc actually does is light the right half
          of the band, which is the read it was placed for.

          Placing a second, STATIC Caustic inside `.pin-stage` would make one
          travel with the Ledger, and was considered and not taken: it buys
          ambience the travelling disc already supplies and puts a violet core
          permanently under the Ledger's frosted shell, where §A6's
          Caustic-core arithmetic (−0.3…0.5 of a ratio) would have to be
          re-derived for every line of the syntax palette. The disc stays
          OUTSIDE the stage because `.scrub-drift` is a `view()` animation and
          inside a sticky box that timeline stalls, freezing the drift — which
          is the constraint that produced this placement in the first place. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Caustic
          x="calc(78% - 260px)"
          y="calc(50% - 260px)"
          size="520px"
          drift="mid"
        />
      </span>

      <div className="pin">
        <div className="pin-stage flex flex-col justify-center">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-start gap-12 px-6 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <SectionHeader meta={HOME_SECTIONS.process} inverse />

              {/* `relative` for the rail; the rail is a <div> here and the
                  steps are <li>s in the <ol> below, so nothing shares a tag
                  with a `.pin-step`. */}
              <div ref={railBoxRef} className="relative mt-10">
                {/* The vertical Conduit spine, spanning all four rows.
                    `grid` on the wrapper is load-bearing: `.conduit-v` is
                    `height: auto`, so a block child would collapse to 0.
                    left-[19px] centres the 6px track on the 44px Nodes.
                    `flow="custom"` means the kit declares no transform on the
                    flow element — the fill below owns it (Part J, Phase 7).

                    top-11 is Node 01's BOTTOM edge; the bottom is Node 04's
                    CENTRE, measured (see `railBoxRef` above) rather than
                    guessed. The 2.25rem fallback is the old static `bottom-9`
                    and is what paints before hydration and with JS off. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[var(--rail-end,2.25rem)] left-[19px] top-11 grid w-1.5"
                >
                  <Conduit orientation="v" flow="custom">
                    <span
                      style={fillStyle()}
                      className="absolute inset-0 origin-top rounded-[inherit] bg-[linear-gradient(180deg,var(--lavender-400),var(--violet-500))] opacity-90"
                    />
                  </Conduit>
                </div>

                {/* No `data-inview` here: the reveal selector is
                    same-element (`[data-reveal][data-inview]`) and each inner
                    div already carries both, so an attribute on the <ol>
                    matched nothing (V4 Phase-7 review). `listRef` is still
                    what `useInView` observes. */}
                <ol ref={listRef}>
                  {PROCESS.map((p, i) => (
                    <li
                      key={p.num}
                      className="pin-step relative last:pb-0 [&:not(:last-child)]:pb-9"
                    >
                      <div
                        data-reveal=""
                        data-inview={inView || undefined}
                        style={
                          {
                            "--reveal-delay": `${i * 110}ms`,
                          } as CSSProperties
                        }
                        className="flex gap-5"
                      >
                        {/* Step marker: a standalone Node (`node liq liq-1`,
                            44px). The kit's own `.node-glow` is the DIM rest
                            state (.35); a SECOND `.node-glow` carries
                            `litStyle`'s `--lit` as its inline opacity, so the
                            scrubbed lighting composites over the rest glow.
                            Using the kit's class rather than a hand-rolled
                            overlay buys two things for free: `.node >
                            :not(.node-glow)`'s forced `position: relative`
                            skips it (a Tailwind `absolute` there would lose at
                            (0,1,0) to that (0,2,0) rule), and motifs.css's
                            reduced-motion `.node-glow { opacity: 1
                            !important }` re-lights it — `!important` beats the
                            inline value, so Part C's "RM: static, lit" holds
                            with no extra rule. */}
                        <Node
                          size={44}
                          className="z-[1] text-[13px] font-semibold text-ink-inv"
                          icon={
                            <>
                              <span
                                className="node-glow"
                                style={litStyle(i, segments)}
                              />
                              <span>{p.num}</span>
                            </>
                          }
                        />
                        <div className="min-w-0 pt-2.5">
                          <h3 className="text-[17px] font-semibold text-ink-inv">
                            {p.title}
                          </h3>
                          <p className="mt-1.5 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Reveal delay={200} className="min-w-0 lg:pt-4">
              <Terminal progress variant="ledger" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
