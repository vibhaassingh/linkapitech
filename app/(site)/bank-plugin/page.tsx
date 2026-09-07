import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { JsonLd } from "@/lib/jsonld";
import { SITE, CONTACT } from "@/lib/site";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Conduit, Droplet, Node, Seam } from "@/components/motifs";
import { CtaBand } from "@/components/sections/CtaBand";
import { PluginMockup } from "@/components/sections/plugin/PluginMockup";
import { PluginFaq } from "@/components/sections/plugin/PluginFaq";
import {
  FeatureGrid,
  ValueGrid,
  StepBand,
  HighlightPills,
  ErpStrip,
  ExternalIcon,
  PlayIcon,
} from "@/components/sections/plugin/PluginSections";
import {
  PLUGIN,
  PLUGIN_STEPS,
  PLUGIN_FAQ,
  PLUGIN_FEATURES,
  BANK_PLUGIN_PAGES,
} from "@/content/plugin";
import { ERPS } from "@/content/clients";
import { pluginPageUrl, pluginPageIsExternal } from "@/lib/plugin-hosts";

export const metadata = pageMetadata({
  title: "The Bank Plugin | Banking Inside Your Tally | LinkAPI Tech",
  description:
    "The Bank Plugin puts your bank account inside Tally — check balances, fetch statements, pay vendors and reconcile automatically without leaving your ERP. Available to Axis Bank, HSBC and IndusInd Bank customers.",
  path: "/bank-plugin",
});

/** The plugin support channel from the real contact list. */
const SUPPORT =
  CONTACT.channels.find((c) => c.label.startsWith("Plugin")) ??
  CONTACT.channels[0];

/**
 * /bank-plugin — the product hub for LinkAPI's hero product.
 *
 * It tells the product story once and then routes to the three bank landing
 * pages, which carry the parts that actually differ per bank: onboarding
 * route, price, support desk, portal. This page is the one linked from the
 * pill nav, the footer and the homepage spotlight, so it is also the entry
 * point for anyone who does not yet know which bank's portal they need.
 *
 * THIS PAGE STAYS ON THE MAIN SITE, the three bank pages do not. They are a
 * separate product site on their own subdomains with their own menu bar
 * (client instruction, 2026-09), so the cards below link ACROSS ORIGINS once
 * those hosts are configured — `pluginPageUrl` decides, and falls back to the
 * in-app path for dev and previews. The main site keeps a product page for
 * the plugin because the brief also asked for it to be highlighted here.
 *
 * DELIBERATELY SIMPLER THAN THE MAIN SITE (client brief 2026-08-27: the
 * "layouting and design can be a little different", reference ringg.ai). Same
 * tokens, type and chrome, but a product-page grammar: a centred hero over a
 * single large product mockup, flat plates instead of glass clusters, one
 * dark band, and no scroll-driven Conduits or Caustics. Shared sections live
 * in components/sections/plugin/PluginSections.
 *
 * The hero is bespoke rather than <PageHero> (which is left-or-two-column and
 * carries the inner-page Caustic/Seam/Meniscus shell), but keeps PageHero's
 * two contracts: `data-hero="light"` so chrome.css paints the pill light on
 * the first frame, and the `pt-[136px] md:pt-[156px]` header clearance. The
 * h1 is the LCP element and is not reveal-gated.
 */
export default function BankPluginPage() {
  return (
    <>
      <JsonLd data={softwareGraph()} />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <header
        data-hero="light"
        className="relative isolate overflow-hidden bg-surface"
      >
        {/* One soft violet bloom, top-centre — a static radial, not a
            Caustic: no drift, no z-index dance. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 0%, var(--violet-soft), transparent 72%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[1240px] px-6 pb-16 pt-[136px] text-center md:px-10 md:pb-20 md:pt-[156px]">
          <Reveal>
            <Lockup />
          </Reveal>

          <Reveal delay={60} className="mt-8">
            <Droplet
              light
              className="text-[0.72rem] font-medium uppercase tracking-[0.13em] text-violet-text"
            >
              {PLUGIN.eyebrow}
            </Droplet>
          </Reveal>

          <h1 className="display-1 mx-auto mt-6 max-w-[17ch] text-ink">
            {PLUGIN.headline.lead}{" "}
            <span className="accent-word">{PLUGIN.headline.accent}</span>
          </h1>
          <p className="body-lg mx-auto mt-6 max-w-[60ch] text-ink-2">
            {PLUGIN.lead}
          </p>

          <Reveal
            delay={120}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href="#portals">Get the plugin</Button>
            <Button
              href={PLUGIN.guide.href}
              variant="outline"
              icon={<PlayIcon />}
            >
              {PLUGIN.guide.label}
            </Button>
          </Reveal>

          <Reveal delay={200} className="mt-14 md:mt-16">
            <PluginMockup className="max-w-[1040px]" />
          </Reveal>

          <Reveal delay={260}>
            <HighlightPills className="mt-10" />
          </Reveal>
        </div>

        <div aria-hidden="true" className="pointer-events-none">
          <Seam light />
        </div>
      </header>

      <FeatureGrid />

      <ValueGrid />

      <StepBand steps={PLUGIN_STEPS} />

      {/* ───────────── Bank landing pages + ERP marks ───────────── */}
      <section id="portals" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="mx-auto max-w-[44rem] text-center">
            <span className="eyebrow-capsule mb-6 inline-flex">
              Get the plugin
            </span>
            <h2 className="display-2 text-ink">Pick your bank.</h2>
            <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-2">
              {/* TODO: client to confirm — drafted; the three portals and
                  their onboarding routes are the banks' own. */}
              The Bank Plugin is offered to business customers through
              bank-branded LinkAPI portals. Onboarding, support and
              commercials differ by bank, so each has its own page.
            </p>
          </Reveal>

          <RevealGroup
            as="ul"
            className="mx-auto mt-12 grid max-w-[980px] grid-cols-1 gap-5 md:grid-cols-3"
            step={90}
          >
            {BANK_PLUGIN_PAGES.map((p) => (
              <div
                key={p.slug}
                className="flex h-full flex-col rounded-xl border border-line-soft bg-surface p-7 shadow-card"
              >
                <div className="grid h-12 w-[140px] place-items-start">
                  <Image
                    src={p.logo}
                    alt={`${p.bank} logo`}
                    width={140}
                    height={48}
                    style={{ transform: `scale(${p.logoScale})` }}
                    className="max-h-12 w-auto max-w-[140px] origin-left object-contain"
                    unoptimized
                  />
                </div>
                <p className="mt-5 text-[15px] font-semibold text-ink">
                  {p.bank} customers
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
                  {p.slug === "indusind"
                    ? "Register through IndusDirect, then install the TCP in Tally."
                    : `Register, download the setup and log in on the ${p.shortName} portal.`}
                </p>
                {p.price && (
                  <p className="mt-3 text-[13.5px] font-semibold text-violet-text">
                    {p.price}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 text-[14.5px] font-semibold">
                  {/* The bank's landing page is the PRIMARY link — it is the
                      page that explains this bank's flow. In production it is
                      a different origin, so this is an <a>; in dev it is an
                      in-app path and stays a <Link>. */}
                  {pluginPageIsExternal(p.slug) ? (
                    <a
                      href={pluginPageUrl(p.slug)}
                      className="link-draw inline-flex items-center gap-1.5 rounded-sm py-1 text-violet-text hover:text-plum-700"
                    >
                      {p.shortName} plugin site
                      <ExternalIcon />
                    </a>
                  ) : (
                    <Link
                      href={pluginPageUrl(p.slug)}
                      className="link-draw rounded-sm py-1 text-violet-text hover:text-plum-700"
                    >
                      {p.shortName} plugin page
                    </Link>
                  )}
                  <a
                    href={p.portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw inline-flex items-center gap-1.5 rounded-sm py-1 text-ink-2 hover:text-ink"
                  >
                    Open portal
                    <ExternalIcon />
                  </a>
                </div>
              </div>
            ))}
          </RevealGroup>

          <div className="mt-20">
            <ErpStrip />
            <Reveal delay={160}>
              <ul className="mx-auto mt-8 flex max-w-[1140px] flex-wrap items-center justify-center gap-x-6 gap-y-6 md:gap-x-8">
                {ERPS.map((e) => (
                  <li
                    key={e.name}
                    className="group grid h-14 w-[140px] place-items-center"
                  >
                    <Image
                      src={e.logo}
                      alt={e.name}
                      width={140}
                      height={56}
                      style={{ transform: `scale(${e.scale ?? 1})` }}
                      className="max-h-14 w-auto max-w-[140px] object-contain opacity-[0.92] transition-opacity duration-ui group-hover:opacity-100"
                      unoptimized
                    />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────────── FAQ + support ───────────────────── */}
      <section
        id="faq"
        className="section-pad border-t border-line-soft bg-surface"
      >
        <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-12 px-6 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="eyebrow-capsule mb-6 inline-flex">
                Questions
              </span>
              <h2 className="display-2 text-ink">
                {/* TODO: client to confirm — drafted heading. */}
                Before you install.
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <div className="mt-8 rounded-xl border border-lavender-300 bg-tint p-7">
                <p className="text-[12px] font-semibold uppercase tracking-eyebrow text-violet-text">
                  {SUPPORT.label}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                  Your bank&rsquo;s own support desk is listed on its plugin
                  page. For anything else, reach the plugin team directly.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed">
                  <a
                    href={SUPPORT.phoneHref}
                    className="link-draw block rounded-sm py-1 font-semibold text-ink"
                  >
                    {SUPPORT.phone}
                  </a>
                  <a
                    href={`mailto:${SUPPORT.email}`}
                    className="link-draw block rounded-sm py-1 text-ink-2 [overflow-wrap:anywhere]"
                  >
                    {SUPPORT.email}
                  </a>
                </p>
                <Button
                  href={CONTACT.whatsapp}
                  className="mt-6"
                  icon={<Icon name="chat" size={16} />}
                >
                  Chat on WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <h2 className="sr-only">Frequently asked questions</h2>
            <PluginFaq items={PLUGIN_FAQ} />
          </Reveal>
        </div>
      </section>

      <CtaBand
        eyebrow="See it in your Tally"
        ctaLabel="Book a plugin demo"
        secondary={{
          label: CONTACT.primaryEmail,
          href: `mailto:${CONTACT.primaryEmail}`,
        }}
      />
    </>
  );
}

/**
 * The hero lockup: bank → plugin → ERP as three light Nodes joined by two
 * short looping Conduits. `flow="loop"` rather than `"scroll"` because a hero
 * has no `--sp` driver. Decorative.
 */
function Lockup() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-[320px] items-center justify-center gap-2"
    >
      <Node light size={52} icon={<Icon name="bank" size={22} />} />
      <span className="min-w-0 flex-1">
        <Conduit light flow="loop" />
      </span>
      <Node light lit size={64} icon={<Icon name="plug" size={26} />} />
      <span className="min-w-0 flex-1">
        <Conduit light flow="loop" className="-scale-x-100" />
      </span>
      <Node light size={52} icon={<Icon name="chart" size={22} />} />
    </div>
  );
}

/** Product JSON-LD — a SoftwareApplication offered by the organisation. */
function softwareGraph() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: PLUGIN.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Accounting and banking add-on",
    url: `${SITE.url}/bank-plugin`,
    description: PLUGIN.lead,
    softwareRequirements: PLUGIN.erpToday,
    featureList: PLUGIN_FEATURES.map((f) => f.title),
    author: { "@id": `${SITE.url}/#organization` },
    provider: { "@id": `${SITE.url}/#organization` },
  };
}
