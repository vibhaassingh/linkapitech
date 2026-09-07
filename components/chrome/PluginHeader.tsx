import Image from "next/image";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import type { BankPluginPage } from "@/content/plugin";
import { cn } from "@/lib/cn";

/**
 * The Bank Plugin's own menu bar — deliberately NOT the main site's.
 *
 * The three bank landing pages are a separate product site on their own
 * subdomains (client instruction, 2026-09: "the menu bar has to be different
 * for these, not common to the main website"), so this shares nothing with
 * `SiteHeader` but the wordmark. Every difference below is intentional:
 *
 *   SiteHeader (linkapitech.com)      PluginHeader (this)
 *   ────────────────────────────      ─────────────────────────────────────
 *   floating rounded pill, inset      full-width bar, flush to the top edge
 *   frosted two-tone liquid glass     opaque white, one hairline underneath
 *   six site-section links            in-page anchors for THIS page only
 *   sliding nav thumb + tone observer no JS at all — a server component
 *   "Contact Us" CTA                  "Log in" + "Register" on the bank portal
 *   logo only                         logo + the bank's own mark
 *
 * It is `sticky`, not `fixed`: a product page's nav should ride with the
 * document rather than float over a hero, and sticky needs no header
 * clearance from the page below it — which is why these pages do not carry
 * the `pt-[136px]` that every `(site)` route does.
 *
 * NO JAVASCRIPT. The anchor row scrolls horizontally on a phone instead of
 * collapsing into a dialog, so there is no menu state, no focus trap and no
 * hydration cost — and nothing to go wrong under reduced motion. `min-w-0`
 * plus `overflow-x-auto` on the scroller and `shrink-0` on the actions is
 * what keeps the row from pushing the CTAs off a 390px viewport.
 *
 * The top strip is the honest disclosure that this is a LinkAPI product site
 * rather than a bank's own: it names LinkAPI and links back to the main
 * domain. Keep it.
 */

export interface PluginNavAnchor {
  href: string;
  label: string;
}

const ANCHORS: PluginNavAnchor[] = [
  { href: "#features", label: "Features" },
  { href: "#why", label: "Why the plugin" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#support", label: "Support" },
];

export function PluginHeader({
  page,
  /** Absolute URL of the main site — the strip's "back to" link. */
  homeUrl = SITE.url,
}: {
  page: BankPluginPage;
  homeUrl?: string;
}) {
  const extras = page.demo ? [page.demo] : [];

  return (
    <header className="sticky top-0 z-50">
      {/* Disclosure strip — who publishes this page. */}
      <div className="bg-plum-900 text-ink-inv">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-6 py-2 md:px-10">
          <p className="text-[12px] leading-snug text-ink-inv-2">
            A{" "}
            <a
              href={homeUrl}
              className="link-draw rounded-sm font-medium text-ink-inv"
            >
              LinkAPI&nbsp;Tech
            </a>{" "}
            product for {page.bank} business customers
          </p>
          <a
            href={homeUrl}
            className="shrink-0 rounded-sm py-1 text-[12px] font-medium text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
          >
            {SITE.domain}
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>

      {/* The bar. Opaque, so it needs no backdrop-filter and adds nothing to
          the blur budget. */}
      <div className="border-b border-line bg-surface">
        {/* ONE ROW from md, TWO BELOW IT. `flex-wrap` plus `order-3
            w-full` on the nav is what moves the anchor row onto its own
            line on a phone: at 390px a single row squeezed the scroller down
            to one visible link ("Features") with no hint that it scrolled.
            No media-query JS, no menu state — just wrapping. */}
        <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 md:flex-nowrap md:gap-x-6 md:px-10">
          {/* Brand: LinkAPI lockup + the bank's mark, hairline between. */}
          <a
            href={homeUrl}
            aria-label={`LinkAPI Tech — ${SITE.domain}`}
            className="shrink-0 rounded-sm text-ink"
          >
            <Logo />
          </a>
          <span
            aria-hidden="true"
            className="hidden h-8 w-px shrink-0 bg-line sm:block"
          />
          <span className="hidden h-8 w-[96px] shrink-0 place-items-center sm:grid">
            <Image
              src={page.logo}
              alt={`${page.bank} logo`}
              width={96}
              height={32}
              style={{ transform: `scale(${page.logoScale})` }}
              className="max-h-8 w-auto max-w-[96px] origin-left object-contain"
              unoptimized
            />
          </span>

          {/* In-page anchors. Scrolls rather than collapsing — no JS. */}
          <nav
            aria-label={`${PLUGIN_NAV_LABEL} for ${page.bank}`}
            className="no-scrollbar order-3 -mb-1 w-full min-w-0 overflow-x-auto pb-1 md:order-none md:mb-0 md:w-auto md:flex-1 md:pb-0"
          >
            <ul className="flex items-center gap-5 whitespace-nowrap lg:justify-end lg:gap-6">
              {ANCHORS.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    className="rounded-sm py-1.5 text-[14px] font-medium text-ink-2 transition-colors duration-ui hover:text-plum-700"
                  >
                    {a.label}
                  </a>
                </li>
              ))}
              {extras.map((x) => (
                <li key={x.href}>
                  <a
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm py-1.5 text-[14px] font-medium text-ink-2 transition-colors duration-ui hover:text-plum-700"
                  >
                    {x.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Portal actions — the two things a visitor is here to do. */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            {page.loginUrl && (
              <a
                href={page.loginUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hidden rounded-pill border border-line px-4 py-2 text-[13.5px] font-semibold text-ink",
                  "transition-colors duration-ui hover:border-plum-600 hover:text-plum-700 sm:inline-flex",
                )}
              >
                Log in
              </a>
            )}
            <a
              href={page.portal.url}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="btn-spring inline-flex items-center rounded-pill bg-plum-600 px-4 py-2 text-[13.5px] font-semibold text-ink-inv hover:bg-violet-600 md:px-5"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

const PLUGIN_NAV_LABEL = "The Bank Plugin";
