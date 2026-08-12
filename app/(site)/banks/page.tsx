import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { BANKS } from "@/content/banks";

export const metadata = pageMetadata({
  title: "Bank Integrations | Axis, IndusInd & HSBC — LinkAPI Tech",
  description:
    "LinkAPI Tech integrates corporate and BFSI platforms with leading banks — Axis Bank, IndusInd Bank, and HSBC — from secure connectivity through production support.",
  path: "/banks",
});

export default function BanksIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Bank integrations"
        align="center"
        title={
          <>
            The banks we help you{" "}
            <span className="accent-word">connect to.</span>
          </>
        }
        lead="LinkAPI wires your platform to each bank's systems using one proven playbook — secure connectivity, configuration and empanelment, UAT to production, and support after go-live."
      />

      <section className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <RevealGroup
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            step={90}
          >
            {BANKS.map((b) => (
              /* Hover craft: a 4px lift on `--spring-smooth` (its linear() stop
                 list peaks past 1, so the card genuinely overshoots and
                 settles). transform + box-shadow + border-colour only — nothing
                 that reflows, so CLS stays 0. Reduced motion: the global block
                 collapses transition-duration to 0.001ms and the lift becomes an
                 instant state change. */
              <Link
                key={b.slug}
                href={`/banks/${b.slug}`}
                className="group flex h-full flex-col rounded-lg border border-line-soft bg-surface p-7 shadow-card transition-[transform,box-shadow,border-color] duration-[var(--dur-spring-smooth)] ease-[var(--spring-smooth)] hover:-translate-y-1 hover:border-line-violet hover:shadow-float"
              >
                {/* Fixed box + object-contain, so a 9:1 wordmark can't outweigh
                    a compact lockup; logoScale is the optical nudge. */}
                <span className="flex h-9 items-center">
                  <Image
                    src={b.logo}
                    alt={`${b.name} logo`}
                    width={150}
                    height={36}
                    style={{
                      transform: `scale(${b.logoScale})`,
                      transformOrigin: "left center",
                    }}
                    className="max-h-9 w-auto max-w-[150px] object-contain object-left"
                    /* Next already skips the optimizer for SVG; explicit so a
                       future dangerouslyAllowSVG can't rasterise a vector mark. */
                    unoptimized
                  />
                </span>

                <p className="mt-6 text-[14.5px] leading-relaxed text-ink-2">
                  {b.intro}
                </p>

                {/* mt-auto pins the affordance to the card floor, so the three
                    cards' links line up despite different intro lengths. */}
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[14px] font-semibold text-violet-text">
                  {b.shortName} integration
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-ui ease-out-expo group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </RevealGroup>

          {/* Capability framing, stated on the hub as well as each bank page, so
              the grid of marks can never read as a partnership roster. */}
          <Reveal delay={120}>
            <p className="mt-10 max-w-[80ch] rounded-md border border-line-soft bg-tint px-5 py-4 text-[13.5px] leading-relaxed text-ink-2">
              Each page describes LinkAPI Tech&apos;s integration capability for
              that bank&apos;s systems. None is a claim of official partnership
              with, or endorsement by, the bank named.
              {/* TODO: client to confirm — the real relationship with each bank
                  (partner tier, empanelment status) and usage rights for the
                  reproduced bank marks. */}
            </p>
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="Talk to an Integration Specialist" />
    </>
  );
}
