import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Terminal } from "@/components/sections/home/Terminal";
import { Icon } from "@/components/ui/Icon";
import { SOLUTION_GROUPS, SDK_SAMPLE, type Product } from "@/content/solutions";
import { cn } from "@/lib/cn";

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
              dark ? "section-dark" : gi % 2 === 0 ? "bg-surface" : "bg-canvas",
            )}
          >
            <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
              <Reveal>
                <h2 className={cn("display-2 max-w-[26ch]", dark ? "text-ink-inv" : "text-ink")}>
                  {group.heading}
                </h2>
              </Reveal>

              {dark ? (
                /* developer-tooling band: list beside the SDK terminal */
                <div className="mt-12 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
                  <RevealGroup className="flex flex-col" as="ul" step={100}>
                    {group.products.map((p) => (
                      <li
                        key={p.id}
                        id={p.id}
                        className="border-b border-line-inv py-7 first:pt-0 last:border-b-0"
                      >
                        <h3 className="flex items-center gap-2.5 text-[17px] font-semibold text-ink-inv">
                          <Icon name={p.icon} size={18} className="text-lavender-400" />
                          {p.title}
                        </h3>
                        <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                          {p.body}
                        </p>
                      </li>
                    ))}
                  </RevealGroup>

                  <Reveal delay={180}>
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
                    "mt-12 grid gap-5",
                    group.products.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
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
        "flex h-full flex-col rounded-xl p-7 shadow-card md:p-8",
        solid
          ? "grad-fill text-ink-inv shadow-float"
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
        <Icon name={product.icon} size={19} />
      </span>
      <h3 className={cn("mt-6 text-[17px] font-semibold", solid ? "text-ink-inv" : "text-ink")}>
        {product.title}
      </h3>
      <p
        className={cn(
          "mt-2.5 max-w-[46ch] text-[14.5px] leading-relaxed",
          solid ? "text-ink-inv-2" : "text-ink-2",
        )}
      >
        {product.body}
      </p>
    </article>
  );
}
