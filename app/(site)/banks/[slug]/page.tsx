import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BANKS, BANK_SLUGS, getBank, type BankPage } from "@/content/banks";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { StatNumber } from "@/components/ui/StatNumber";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return BANK_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBank(slug);
  if (!b) return {};
  return pageMetadata({
    title: b.meta.title,
    description: b.meta.description,
    path: `/banks/${b.slug}`,
  });
}

export default async function BankDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = getBank(slug);
  if (!b) notFound();

  const related = BANKS.filter((x) => x.slug !== b.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `${b.name} Integration`,
        serviceType: "Bank API integration",
        description: b.intro,
        provider: {
          "@type": "Organization",
          name: SITE.legalName,
          url: SITE.url,
        },
        areaServed: "IN",
        url: `${SITE.url}/banks/${b.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Bank integrations",
            item: `${SITE.url}/banks`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: b.name,
            item: `${SITE.url}/banks/${b.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        eyebrow={b.eyebrow}
        align="left"
        title={
          <>
            {b.name} <span className="accent-word">integration.</span>
          </>
        }
        lead={b.intro}
        visual={<ConnectionCard bank={b} />}
      />

      {/* Overview + the capability-framing note */}
      <section className="section-pad bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">Overview</h2>
            <p className="mt-5 max-w-[80ch] text-[16px] leading-relaxed text-ink-2">
              {b.overview}
            </p>
          </Reveal>

          {/* Neutral, capability-framed disclaimer (no partnership claim). */}
          <Reveal delay={140}>
            <p className="mt-8 max-w-[80ch] rounded-lg border border-line-soft bg-tint px-5 py-4 text-[13.5px] leading-relaxed text-ink-2">
              This page describes LinkAPI Tech&apos;s integration capability for{" "}
              {b.name}&apos;s banking systems. It is not a claim of official
              partnership with, or endorsement by, {b.name}.
              {/* TODO: client to confirm — the real relationship, partner tier,
                  and logo usage rights. */}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">What we integrate</h2>
          </Reveal>

          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            as="ul"
            step={80}
          >
            {b.capabilities.map((c) => (
              <div
                key={c.body}
                className="flex h-full items-start gap-4 rounded-xl border border-line-soft bg-surface p-7 shadow-card"
              >
                <span className="grad-fill grid h-10 w-10 shrink-0 place-items-center rounded-pill text-ink-inv">
                  <Icon name={c.icon} size={18} />
                </span>
                <p className="min-w-0 text-[15.5px] leading-relaxed text-ink-2">
                  {c.body}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Connectivity → go-live playbook */}
      <section id="playbook" className="section-pad bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">From connectivity to go-live</h2>
            <p className="mt-5 max-w-[70ch] text-[16px] leading-relaxed text-ink-2">
              One repeatable playbook, applied to your {b.shortName} use case.
            </p>
          </Reveal>

          <div className="relative mt-14">
            {/* rail */}
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[19px] top-6 w-px bg-lavender-300 lg:left-1/2"
            />

            <ol className="flex flex-col gap-8 lg:gap-2">
              {b.steps.map((step, i) => {
                const right = i % 2 === 1;
                return (
                  <li key={step.title} className="relative">
                    {/* The number node is absolutely positioned, so it occupies
                        no grid cell — the card is placed by explicit column,
                        since `order` has nothing in flow to swap with. */}
                    <div className="grid grid-cols-1 items-center gap-x-10 lg:grid-cols-2">
                      <Reveal
                        delay={60}
                        dir={right ? "right" : "left"}
                        className={cn(
                          "pl-14 lg:pl-0",
                          right
                            ? "lg:col-start-2 lg:pl-14"
                            : "lg:col-start-1 lg:pr-14",
                        )}
                      >
                        <article
                          className={cn(
                            "relative overflow-hidden rounded-lg bg-tint p-6 shadow-card",
                            right ? "lg:pl-7" : "lg:pr-7",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute inset-y-0 w-[3px] bg-plum-600",
                              right
                                ? "left-0"
                                : "left-0 lg:left-auto lg:right-0",
                            )}
                          />
                          <div className="flex items-start justify-between gap-5">
                            <div className="min-w-0">
                              <h3 className="text-[17px] font-semibold text-ink">
                                {step.title}
                              </h3>
                              <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-ink-2">
                                {step.body}
                              </p>
                            </div>
                            <span className="grad-tile grid h-10 w-10 shrink-0 place-items-center">
                              <Icon name={step.icon} size={18} />
                            </span>
                          </div>
                        </article>
                      </Reveal>

                      {/* node — absolute so it lands on the rail regardless of row height */}
                      <span
                        aria-hidden="true"
                        className="grad-fill absolute left-0 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-pill text-[13px] font-semibold text-ink-inv ring-[6px] ring-[color:var(--lavender-200)] lg:left-1/2 lg:-translate-x-1/2"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* LinkAPI-wide aggregate — the caption lives inside the card so the
          figures can never be screenshotted as per-bank metrics. */}
      <section className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <div className="grad-fill rounded-xl p-8 shadow-float md:p-10">
              <p className="max-w-[70ch] text-[14px] font-semibold leading-relaxed text-ink-inv">
                {b.stats.caption}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {b.stats.items.map((s) => (
                  <StatNumber
                    key={s.label}
                    stat={s}
                    numClassName="!text-ink-inv"
                    labelClassName="!text-[14px] !text-ink-inv"
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related banks */}
      <section className="border-t border-line-soft bg-surface py-16">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-3">
              Other bank integrations
            </h2>
            <Link
              href="/banks"
              className="inline-block rounded-sm py-1 text-[14px] font-semibold text-violet-text transition-colors duration-ui hover:text-plum-700"
            >
              All bank integrations &rarr;
            </Link>
          </div>

          <RevealGroup
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
            as="ul"
            step={90}
          >
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/banks/${r.slug}`}
                aria-label={`${r.name} integration`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-line-soft bg-canvas p-6 transition-all duration-ui ease-out-expo hover:border-line-violet hover:shadow-card"
              >
                <span className="flex h-9 min-w-0 items-center">
                  <BankMark bank={r} boxW={150} boxH={36} decorative />
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[15px] font-semibold text-violet-text transition-transform duration-ui ease-out-expo group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            ))}
          </RevealGroup>
        </div>
      </section>

      <CtaBand ctaLabel="See Connected Banking in Action" />
    </>
  );
}

/**
 * A bank mark in a fixed box. `object-contain` does the fitting, so a 9:1
 * wordmark (IndusInd) can never render twice the size of a compact lockup, and
 * `logoScale` is the remaining per-logo optical correction.
 */
function BankMark({
  bank,
  boxW,
  boxH,
  align = "left",
  /** The surrounding link already names the bank, so the mark is decorative. */
  decorative,
}: {
  bank: BankPage;
  boxW: number;
  boxH: number;
  align?: "left" | "center";
  decorative?: boolean;
}) {
  const left = align === "left";
  return (
    <Image
      src={bank.logo}
      alt={decorative ? "" : `${bank.name} logo`}
      width={boxW}
      height={boxH}
      style={{
        maxWidth: boxW,
        maxHeight: boxH,
        transform: `scale(${bank.logoScale})`,
        // The scale must pull toward the same edge object-contain aligns to,
        // or a down-scaled mark drifts away from its own box.
        transformOrigin: left ? "left center" : "center",
      }}
      className={cn("w-auto object-contain", left && "object-left")}
      /* Next already skips the optimizer for SVG; explicit so a future
         dangerouslyAllowSVG can't rasterise a vector mark. */
      unoptimized
    />
  );
}

/**
 * Hero visual — the bank's mark, a secure connection, and the customer's
 * platform, stacked. Deliberately generic below the mark: naming the bank in a
 * product diagram is the only place this page could start to imply endorsement.
 */
function ConnectionCard({ bank }: { bank: BankPage }) {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-xl border border-line-soft bg-surface p-7 shadow-float md:p-8">
      <div className="flex h-14 items-center justify-center">
        <BankMark bank={bank} boxW={200} boxH={56} align="center" />
      </div>

      <Connector label="Secure API connection" />

      <div className="grad-fill flex items-center justify-center gap-3 rounded-lg px-4 py-3.5 text-ink-inv">
        <Icon name="link" size={18} />
        <span className="text-[14.5px] font-semibold">LinkAPI platform</span>
      </div>

      <Connector />

      <div className="flex items-center justify-center gap-3 rounded-lg border border-line bg-canvas px-4 py-3.5 text-ink">
        <Icon name="grid" size={18} className="text-violet-text" />
        <span className="text-[14.5px] font-medium">Your ERP or platform</span>
      </div>
    </div>
  );
}

/** Dashed vertical link between the hero card's three nodes. */
function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3">
      <span aria-hidden="true" className="text-lavender-400">
        <svg viewBox="0 0 12 26" width="12" height="26" fill="none">
          <path
            d="M6 0v16"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="3 5"
            strokeLinecap="round"
          />
          <path
            d="M1.5 18 6 23l4.5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label && (
        <span className="flex items-center gap-1.5 text-center text-[12.5px] text-ink-3">
          <Icon name="shield" size={13} className="text-success" />
          {label}
        </span>
      )}
    </div>
  );
}
