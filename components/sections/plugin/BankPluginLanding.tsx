import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/lib/jsonld";
import { SITE } from "@/lib/site";
import { pluginPageUrl, pluginPageIsExternal } from "@/lib/plugin-hosts";
import { PluginHeader } from "@/components/chrome/PluginHeader";
import { PluginFooter } from "@/components/chrome/PluginFooter";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Droplet, Seam } from "@/components/motifs";
import { PluginMockup } from "@/components/sections/plugin/PluginMockup";
import { PluginFaq } from "@/components/sections/plugin/PluginFaq";
import {
  FeatureGrid,
  ValueGrid,
  StepBand,
  HighlightPills,
  ExternalIcon,
  PlayIcon,
  Check,
} from "@/components/sections/plugin/PluginSections";
import {
  PLUGIN,
  PLUGIN_FAQ,
  BANK_PLUGIN_PAGES,
  type BankPluginPage,
} from "@/content/plugin";

/**
 * The Bank Plugin landing page for one bank (axis, hsbc,
 * indusind), one for each bank-branded LinkAPI portal.
 *
 * A SEPARATE SITE, NOT A SECTION OF linkapitech.com (client instruction,
 * 2026-09). It lives in the `(plugin)` route group, which renders none of the
 * site chrome, and brings its own `PluginHeader` / `PluginFooter` — a
 * full-width bar with in-page anchors and the bank's Log in / Register
 * actions, sharing nothing with the main site's floating pill nav. In
 * production each page answers on its own subdomain via `middleware.ts`; see
 * lib/plugin-hosts.ts for why no host is hardcoded (the bare
 * `<bank>.linkapitech.com` names already serve the client's live portal
 * apps).
 *
 * WHY THREE PAGES AND NOT ONE. The product is identical everywhere, but the
 * three things a prospective customer actually needs are not:
 *   • how they onboard   — Axis and HSBC register on the LinkAPI portal;
 *                          IndusInd registers inside IndusDirect, the bank's
 *                          own net banking, and receives the TCP by email.
 *   • what it costs      — only Axis's portal publishes a price.
 *   • who supports them  — a Google Form (HSBC), an email desk (Axis), or the
 *                          bank's own Centralised Service Desk plus a ticket
 *                          form with categories (IndusInd).
 * All of that is per-bank data in content/plugin.ts; the shared product story
 * comes from the section kit in components/sections/plugin/PluginSections.
 *
 * BANK IDENTITY IS THE MARK, NOT THE PALETTE. These pages stay in the plum
 * system and never adopt Axis burgundy / HSBC red / IndusInd crimson. Two
 * reasons, one legal and one technical: recolouring a page in a bank's brand
 * reads as the bank publishing it, which CONTENT-TODO §1 explicitly guards
 * against; and every AA figure in REDESIGN-V4 is calibrated against the plum
 * range, so a foreign accent would need the whole contrast walk redone.
 *
 * Same structural contract as /bank-plugin: `data-hero="light"` for
 * chrome.css's first-frame pill tone, the `pt-[136px] md:pt-[156px]` header
 * clearance carried by the hero itself, and an h1 that is NOT reveal-gated
 * because it is the LCP element.
 */

/**
 * Rendered by three thin routes — app/(plugin)/axisbank-lp, /hsbc-lp and
 * /indusind-lp — rather than by one `[bank]` dynamic segment. Explicit routes
 * because the client fixed the URLs (`linkapitech.kerning.ooo/axisbank-lp`
 * and siblings, 2026-09) and a `[slug]` segment at the ROOT of the app would
 * be a catch-all sitting alongside every top-level page: static routes still
 * win, but every unmatched path would resolve through it. Three files that
 * each name their own bank cost nothing and cannot shadow anything.
 */
export function BankPluginLanding({ page }: { page: BankPluginPage }) {
  const others = BANK_PLUGIN_PAGES.filter((b) => b.slug !== page.slug);

  return (
    <>
      <JsonLd data={bankPluginGraph(page)} />

      <PluginHeader page={page} />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <header
        data-hero="light"
        className="relative isolate overflow-hidden bg-surface"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 0%, var(--violet-soft), transparent 72%)",
          }}
        />

        {/* No `pt-[136px]` here, unlike every (site) route: PluginHeader is
            sticky and in flow, so it already occupies that space. */}
        <div className="relative mx-auto w-full max-w-[1240px] px-6 pb-16 pt-16 text-center md:px-10 md:pb-20 md:pt-20">
          {/* The bank mark, on its own plate. Reproduced as an identifier of
              whose customers this page is for — not as a partnership claim
              (CONTENT-TODO §1). */}
          <Reveal delay={60}>
            <div className="mx-auto grid h-16 w-[200px] place-items-center rounded-xl border border-line-soft bg-surface px-5 shadow-card">
              <Image
                src={page.logo}
                alt={`${page.bank} logo`}
                width={160}
                height={48}
                style={{ transform: `scale(${page.logoScale})` }}
                className="max-h-12 w-auto max-w-[160px] object-contain"
                unoptimized
              />
            </div>
          </Reveal>

          <h1 className="display-1 mx-auto mt-8 max-w-[19ch] text-ink">
            {PLUGIN.name} for{" "}
            <span className="accent-word">{page.bank}.</span>
          </h1>
          <p className="body-lg mx-auto mt-6 max-w-[60ch] text-ink-2">
            {page.intro}
          </p>

          {/* Price — Axis only. Never rendered for a bank whose portal does
              not publish one. */}
          {page.price && (
            <Reveal delay={90} className="mt-7">
              <Droplet
                light
                className="text-[13.5px] font-semibold text-violet-text"
              >
                {page.price}
                <span className="pl-2 font-normal text-ink-3">
                  {/* TODO: client to confirm — the Axis portal's published
                      price; confirm the billing period it covers. */}
                  per Tally licence
                </span>
              </Droplet>
            </Reveal>
          )}

          <Reveal
            delay={120}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href={page.portal.url}>
              Register on the {page.shortName} portal
            </Button>
            {page.demo && (
              <Button href={page.demo.href} variant="outline">
                {page.demo.label}
              </Button>
            )}
            {!page.demo && page.guide && (
              <Button
                href={page.guide.href}
                variant="outline"
                icon={
                  page.guide.href.includes("youtu") ? <PlayIcon /> : <Icon name="doc" size={15} />
                }
              >
                {page.guide.label}
              </Button>
            )}
          </Reveal>

          <Reveal delay={160} className="mt-4">
            <p className="text-[13px] text-ink-3">
              Opens {page.portal.host}
            </p>
          </Reveal>

          <Reveal delay={200} className="mt-14 md:mt-16">
            <PluginMockup className="max-w-[1040px]" />
          </Reveal>

          <Reveal delay={260}>
            <HighlightPills className="mt-10" />
          </Reveal>
        </div>
      </header>

      <FeatureGrid />

      <ValueGrid />

      <StepBand
        steps={page.steps}
        heading={`Getting started with ${page.bank}.`}
        lead={page.stepsLead}
      />

      {/* ─────────────────── Support (per bank) ─────────────────── */}
      <section id="support" className="section-pad bg-canvas">
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-12 px-6 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="eyebrow-capsule mb-6 inline-flex">Support</span>
              <h2 className="display-2 text-ink">
                Help for {page.shortName} customers.
              </h2>
              {page.support.desk && (
                <p className="mt-5 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">
                  {page.support.desk}
                </p>
              )}
            </Reveal>

            <Reveal delay={90}>
              <div className="mt-8 rounded-xl border border-lavender-300 bg-tint p-7">
                <p className="text-[12px] font-semibold uppercase tracking-eyebrow text-violet-text">
                  {page.shortName} plugin support
                </p>
                <p className="mt-4 text-[15px] leading-relaxed">
                  <a
                    href={`mailto:${page.support.email}`}
                    className="link-draw block rounded-sm py-1 font-semibold text-ink [overflow-wrap:anywhere]"
                  >
                    {page.support.email}
                  </a>
                  <a
                    href={page.support.phoneHref}
                    className="link-draw block rounded-sm py-1 text-ink-2"
                  >
                    {page.support.phone}
                  </a>
                </p>
                {page.support.hours && (
                  <p className="mt-4 border-t border-lavender-300 pt-4 text-[14px] leading-relaxed text-ink-2">
                    <span className="font-semibold text-ink">
                      Desk hours.{" "}
                    </span>
                    {page.support.hours}
                  </p>
                )}
                <ul className="mt-5 space-y-2.5">
                  {page.support.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        {...(l.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="link-draw inline-flex items-center gap-1.5 rounded-sm py-1 text-[14.5px] font-semibold text-violet-text hover:text-plum-700"
                      >
                        {l.label}
                        {l.external && <ExternalIcon />}
                      </a>
                      {l.note && (
                        <span className="block text-[13px] leading-snug text-ink-3">
                          {l.note}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {page.support.categories && (
              <Reveal delay={140}>
                <div className="mt-6">
                  <p className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-3">
                    What you can raise a ticket about
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {page.support.categories.map((c) => (
                      <li
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-2"
                      >
                        <Check />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>

          <Reveal delay={120}>
            <h2 className="sr-only">Frequently asked questions</h2>
            <PluginFaq items={PLUGIN_FAQ} idPrefix={`faq-${page.slug}`} />
          </Reveal>
        </div>
      </section>

      {/* ─────────────── Other banks + integration link ─────────────── */}
      <section className="section-pad border-t border-line-soft bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="mx-auto max-w-[44rem] text-center">
            <h2 className="display-2 text-ink">Banking with someone else?</h2>
            <p className="mx-auto mt-4 max-w-[60ch] text-[16px] leading-relaxed text-ink-2">
              The plugin is offered through each bank&rsquo;s own LinkAPI
              portal.
            </p>
          </Reveal>

          <RevealGroup
            as="ul"
            className="mx-auto mt-10 grid max-w-[760px] grid-cols-1 gap-5 sm:grid-cols-2"
            step={90}
          >
            {others.map((o) => (
              <div
                key={o.slug}
                className="flex h-full flex-col rounded-xl border border-line-soft bg-canvas p-7"
              >
                <div className="grid h-11 w-[140px] place-items-start">
                  <Image
                    src={o.logo}
                    alt={`${o.bank} logo`}
                    width={140}
                    height={44}
                    style={{ transform: `scale(${o.logoScale})` }}
                    className="max-h-11 w-auto max-w-[140px] origin-left object-contain"
                    unoptimized
                  />
                </div>
                <p className="mt-5 text-[15px] font-semibold text-ink">
                  {o.bank} customers
                </p>
                <div className="mt-auto pt-5">
                  {/* Absolute once that bank has its own subdomain, relative
                      otherwise (lib/plugin-hosts.ts) — so this is an <a> or a
                      <Link> depending on whether it leaves the origin. */}
                  {pluginPageIsExternal(o.slug) ? (
                    <a
                      href={pluginPageUrl(o.slug)}
                      className="link-draw inline-flex items-center gap-1.5 rounded-sm py-1 text-[14.5px] font-semibold text-violet-text hover:text-plum-700"
                    >
                      See the {o.shortName} plugin page
                      <ExternalIcon />
                    </a>
                  ) : (
                    <Link
                      href={pluginPageUrl(o.slug)}
                      className="link-draw inline-flex items-center gap-1.5 rounded-sm py-1 text-[14.5px] font-semibold text-violet-text hover:text-plum-700"
                    >
                      See the {o.shortName} plugin page
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </RevealGroup>

          <Reveal delay={160} className="mt-10 text-center">
            <p className="text-[14.5px] text-ink-2">
              Integrating your own platform with {page.bank} instead?{" "}
              {/* Absolute: /banks lives on the MAIN site, which is a different
                  origin once this page is on its own subdomain. */}
              <a
                href={`${SITE.url}/banks/${page.slug}`}
                className="link-draw rounded-sm font-semibold text-violet-text hover:text-plum-700"
              >
                See {page.bank} integration services
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA. Not the shared <CtaBand>: that band's headline is the
          main site's ("Let's build the next generation of banking together")
          and its job there is to hand off to /contact. On a product page the
          only two actions that matter are register and log in. */}
      <section className="section-dark band-b relative overflow-hidden py-24 md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0"
        >
          <Seam />
        </div>
        <div className="relative mx-auto w-full max-w-[1240px] px-6 text-center md:px-10">
          <Droplet className="liq-flat text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
            Get started
          </Droplet>
          <h2 className="display-2 mx-auto mt-7 max-w-[24ch] text-ink-inv">
            Put your {page.shortName} account inside Tally.
          </h2>
          {page.price && (
            <p className="mt-5 text-[15px] text-ink-inv-2">
              {page.price} per Tally licence.
            </p>
          )}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href={page.portal.url} variant="light">
              Register on the {page.shortName} portal
            </Button>
            <Button
              href={`mailto:${page.support.email}`}
              variant="glass"
              icon={<Icon name="chat" size={15} />}
            >
              Talk to support
            </Button>
          </div>
        </div>
      </section>

      <PluginFooter page={page} />
    </>
  );
}

/**
 * Per-bank JSON-LD. `SoftwareApplication` with an `offers` node only where
 * the portal publishes a price — an invented `price` would be a fabricated
 * commercial term in structured data, which search engines surface verbatim.
 */
function bankPluginGraph(page: BankPluginPage) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${PLUGIN.name} for ${page.bank}`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Accounting and banking add-on",
    url: `${SITE.url}/bank-plugin/${page.slug}`,
    description: page.meta.description,
    softwareRequirements: PLUGIN.erpToday,
    author: { "@id": `${SITE.url}/#organization` },
    provider: { "@id": `${SITE.url}/#organization` },
    ...(page.price
      ? {
          offers: {
            "@type": "Offer",
            price: "5000",
            priceCurrency: "INR",
            description: `${page.price} per Tally licence`,
            url: page.portal.url,
          },
        }
      : {}),
  };
}
