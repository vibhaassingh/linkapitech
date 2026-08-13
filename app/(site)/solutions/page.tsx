import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Terminal } from "@/components/sections/home/Terminal";
import { Icon } from "@/components/ui/Icon";
import { SOLUTION_GROUPS, SDK_SAMPLE, type Product } from "@/content/solutions";
import { cn } from "@/lib/cn";

/**
 * Product-card craft, shared so the four groups stay identical: 4px hover lift
 * with a shadow bloom on `--spring-smooth`, and `.icon-draw` so the icon tile
 * replays its stroke draw under the same hover. Matches the /about card
 * vocabulary exactly.
 *
 * Only `transform` and `box-shadow` transition, so a lift can never move a
 * neighbouring card (CLS 0). Under reduced motion the global block collapses
 * `transition-duration` to 0.001ms, which turns the lift into an instant state
 * change — and the resting state is the un-lifted card, so nothing is stranded.
 */
const CARD_LIFT =
  "icon-draw transition-[transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 hover:shadow-float";

/**
 * The solid feature card. The sheen rides this card ONLY: `--surface` is
 * #ffffff and the sweep is a white gradient, so on the light cards it would be
 * an invisible extra layer (plus an `overflow: hidden` nobody asked for).
 *
 * The 80ms `animation-delay` on the ::before is what makes the lift LEAD the
 * sheen rather than race it. It needs the `!` modifier because
 * `.sheen:hover::before` sets the `animation` SHORTHAND, which resets
 * `animation-delay` to 0 — and that rule is declared after `@tailwind
 * utilities`, so at equal specificity it also wins on source order.
 */
const SOLID_CARD =
  "grad-fill sheen text-ink-inv shadow-float before:![animation-delay:80ms]";

export const metadata = pageMetadata({
  title: "Solutions",
  description:
    "One connected ecosystem across the money movement lifecycle: connected banking, payments and collections, reconciliation, virtual accounts, checkout SDKs, access governance, subscription billing and WhatsApp banking.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        align="center"
        title={
          <>
            One ecosystem for every step of{" "}
            <span className="accent-word">money movement.</span>
          </>
        }
        lead="From the first payment to the final reconciliation, LinkAPI Tech offers a connected suite of products that plug into your ERP and banking stack. Adopt one module or the whole ecosystem — each is built to scale securely."
      />

      {SOLUTION_GROUPS.map((group, gi) => {
        const dark = group.tone === "dark";
        return (
          <section
            key={group.id}
            id={group.id}
            className={cn(
              "section-pad",
              // `.sheet-enter` presents the plum band as a sheet sliding under
              // the light page: it rises the last 28px and un-rounds from 28px
              // to flat over the first 22% of its transit. Scale is down-only,
              // so the band can never overhang the viewport, and border-radius
              // and transform are the only properties involved — no layout, so
              // CLS stays 0. globals.css gates it behind @supports
              // (animation-timeline: view()) and names it in the
              // reduced-motion `animation: none` list, where it resolves to the
              // flat, seated band that is also its end state.
              dark
                ? "section-dark sheet-enter"
                : gi % 2 === 0
                  ? "bg-surface"
                  : "bg-canvas",
            )}
          >
            <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
              <Reveal>
                <h2
                  className={cn(
                    "display-2 max-w-[26ch]",
                    dark ? "text-ink-inv" : "text-ink",
                  )}
                >
                  {group.heading}
                </h2>
              </Reveal>

              {dark ? (
                /* developer-tooling band: list beside the SDK terminal */
                <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
                  <RevealGroup className="flex flex-col" as="ul" step={100}>
                    {group.products.map((p) => (
                      <div
                        key={p.id}
                        id={p.id}
                        className="border-b border-line-inv py-7 first:pt-0 last:border-b-0"
                      >
                        <h3 className="flex items-center gap-2.5 text-[17px] font-semibold text-ink-inv">
                          <Icon
                            name={p.icon}
                            size={18}
                            className="text-lavender-400"
                          />
                          {p.title}
                        </h3>
                        <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                          {p.body}
                        </p>
                      </div>
                    ))}
                  </RevealGroup>

                  <Reveal delay={180} className="min-w-0">
                    <Terminal
                      method={SDK_SAMPLE.method}
                      path={SDK_SAMPLE.path}
                      lines={SDK_SAMPLE.lines}
                    />
                  </Reveal>
                </div>
              ) : (
                <RevealGroup
                  className={cn(
                    "mt-12 grid grid-cols-1 gap-5",
                    group.products.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-3",
                  )}
                  step={90}
                >
                  {group.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </RevealGroup>
              )}
            </div>
          </section>
        );
      })}

      <CtaBand ctaLabel="Request a Product Walkthrough" />
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const solid = product.feature === "solid";
  return (
    <article
      id={product.id}
      className={cn(
        "flex h-full flex-col rounded-lg p-7 shadow-card md:p-8",
        CARD_LIFT,
        solid
          ? SOLID_CARD
          : product.feature === "outline"
            ? "border border-line-violet bg-surface"
            : "border border-line-soft bg-surface",
      )}
    >
      <span
        className={cn(
          "grid h-11 w-11 place-items-center rounded-md",
          solid ? "bg-white/15 text-white" : "bg-tint text-violet-text",
        )}
      >
        <Icon name={product.icon} size={19} draw />
      </span>
      <h3
        className={cn(
          "mt-6 text-[17px] font-semibold",
          solid ? "text-ink-inv" : "text-ink",
        )}
      >
        {product.title}
      </h3>
      <p
        className={cn(
          "mt-2.5 max-w-[46ch] text-[14.5px] leading-relaxed",
          solid ? "text-ink-on-violet-2" : "text-ink-2",
        )}
      >
        {product.body}
      </p>
    </article>
  );
}
