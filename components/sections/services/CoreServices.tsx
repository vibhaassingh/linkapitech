import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { SERVICES } from "@/content/services";
import { cn } from "@/lib/cn";

/**
 * Core Services — bento grid. The first two cards span wider (the Figma gives
 * them a full-width row), the rest sit three-up. Featured cards take the
 * lavender tint; the others are light glass Vessels.
 *
 * ── V4 (Phase 9b): THE CARD LANGUAGE, NOT THE `Card` COMPONENT ────────────
 * The shell below is `components/motifs/Card.tsx`'s light recipe verbatim —
 * tier-2 light glass with `liq-live liq-spec` and `--liq-pad` set to the real
 * padding for the non-feature cards, and the solid `bg-tint` +
 * `border-lavender-300` + `.spotlight` card for the two the Figma tints — but
 * it is composed here rather than by calling `Card`. The reason is
 * `service.num`: the bento's cards open with the ordinal in the top-left
 * beside the icon, and `Card` renders icon → h3 → children with no slot above
 * the icon row. Calling `Card` would mean dropping the numerals from the
 * design or moving them below the title. Recorded in Part J.
 *
 * `.spotlight` on the FEATURE cards only, and that is the §A4 exclusivity
 * rather than a taste call: `.spotlight` owns `::before` and must never share
 * an element with `.liq-light` (`.liq` owns both pseudos — ::before is the rim
 * ring, ::after the specular). The feature card is NOT glass — `.liq` sets
 * `background-color` after Tailwind's utilities, so `bg-tint` on a `.liq`
 * would be a silent no-op (Part J Phase 2) — so `.spotlight` is legal there
 * and `.liq-spec` is what the glass cards use instead.
 *
 * `liq-flat` on the glass cards: this section is a flat `--canvas`, where a
 * Gaussian blur of a constant field IS that constant and `saturate(1.15)` on
 * it is achromatic to the nearest LSB — so the frost is provably zero pixels
 * of difference (Part J Phase 8), and five `.liq-light` cards would otherwise
 * be five blur layers against §A7's ≤ 4 phone / ≤ 8 desktop budget. The rim
 * ring, the wet edge and `--liq-light-shadow` are what draw the glass.
 *
 * INK. Light tier 2 clears `--ink-3` at 4.56:1 (§A6) and this card's runs are
 * `--ink` (title), `--ink-2` (body) and `--violet-text` (the numeral, 7.88 on
 * tier 2) — all well inside the matrix.
 */
export function CoreServices() {
  const [a, b, ...rest] = SERVICES;

  return (
    <section id="core-services" className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">Core Services</h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2"
          step={90}
        >
          <Card service={a} wide />
          <Card service={b} wide />
        </RevealGroup>

        <RevealGroup
          className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          step={80}
        >
          {rest.map((s) => (
            <Card key={s.id} service={s} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function Card({
  service,
  wide,
}: {
  service: (typeof SERVICES)[number];
  wide?: boolean;
}) {
  const feature = Boolean(service.feature);
  return (
    <article
      id={service.id}
      className={cn(
        "flex h-full flex-col rounded-lg p-7 md:p-8",
        /* `.icon-draw` is the trigger half of the stroke-draw pair; the tile's
           <Icon draw> is the target half. */
        "icon-draw",
        feature
          ? /* Solid tinted card. The lift is by hand — an opaque card has no
               frost, no rim and therefore no `.liq-live`. transform +
               box-shadow only, so a lift can never move a neighbour (CLS 0);
               under reduced motion the global block collapses the duration to
               0.001ms and the resting state is the flat card.
               The raised-specificity delay makes the light TRAIL the lift by
               80ms — `.spotlight::before`'s `transition` shorthand would
               otherwise reset any plain `before:delay-*` back to 0. */
            "spotlight border border-lavender-300 bg-tint shadow-card [&.spotlight]:before:[transition-delay:80ms] transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 hover:shadow-float"
          : "liq liq-light liq-flat liq-live liq-spec",
      )}
      /* The specular mask's text-free frame. 28px matches `p-7` and, with the
         18px feather, stays inside md's 32px padding — Card.tsx's own value.
         The feature card is not glass and has no specular, so it gets none. */
      style={feature ? undefined : ({ "--liq-pad": "28px" } as CSSProperties)}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[30px] font-bold leading-none text-violet-text">
          {service.num}
        </span>
        {/* The light Card's icon disc, at the bento's 40px rather than
            `.card-icon-light`'s 44 — the numeral beside it is the card's
            optical anchor, so the tile reads as its counterweight. */}
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-md",
            feature ? "bg-lavender-200" : "bg-tint",
            "text-violet-text",
          )}
        >
          <Icon name={service.icon} size={18} draw />
        </span>
      </div>

      <h3
        className={cn(
          "mt-6 font-semibold text-ink",
          wide ? "text-[19px]" : "text-[17px]",
        )}
      >
        {service.title}
      </h3>
      <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-2">
        {service.description}
      </p>
    </article>
  );
}
