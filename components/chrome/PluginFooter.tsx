import Link from "next/link";
import { Logo } from "./Logo";
import { SITE, CONTACT } from "@/lib/site";
import { pluginPageUrl, pluginPageIsExternal } from "@/lib/plugin-hosts";
import { BANK_PLUGIN_PAGES, type BankPluginPage } from "@/content/plugin";

/**
 * The Bank Plugin's own footer — the counterpart to PluginHeader, and again
 * deliberately not the main site's.
 *
 * `SiteFooter` is the "final pool": a sticky dark curtain the page lifts off,
 * a Caustic, a Pool motif, four link columns of site IA. None of that belongs
 * on a single-purpose product page, and the curtain in particular is a
 * z-order contract with `.chrome-main` that the `(plugin)` layout does not
 * set up. This is a plain plum block in normal flow: the bank's own support
 * details, the three sibling landing pages, and the policy documents that
 * bank's portal actually publishes.
 *
 * WHY THE POLICY LINKS POINT AT THE BANK PORTAL. Each portal serves its own
 * Terms, Privacy, Refund and Cancellation PDFs, and those are the documents a
 * plugin customer agrees to at registration — not linkapitech.com's site
 * terms. Linking the main site's `/terms` here would show the wrong contract.
 */
export function PluginFooter({ page }: { page: BankPluginPage }) {
  const year = new Date().getFullYear();
  const siblings = BANK_PLUGIN_PAGES.filter((b) => b.slug !== page.slug);
  const base = page.portal.url.replace(/\/$/, "");

  return (
    <footer className="section-dark footer-pool">
      <div className="relative mx-auto w-full max-w-[1240px] px-6 pb-12 pt-16 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-8">
          {/* Brand + what this site is */}
          <div>
            <a
              href={SITE.url}
              className="inline-block rounded-sm text-ink-inv"
              aria-label={`LinkAPI Tech — ${SITE.domain}`}
            >
              <Logo />
            </a>
            <p className="mt-4 max-w-[34ch] text-[14.5px] leading-relaxed text-ink-inv-2">
              The Bank Plugin brings banking into Tally for {page.bank}{" "}
              business customers. Built and supported by {SITE.legalName}.
            </p>
            <a
              href={SITE.url}
              className="link-draw mt-5 inline-block rounded-sm py-1 text-[14px] font-medium text-ink-inv"
            >
              Visit {SITE.domain}
              <span aria-hidden="true"> →</span>
            </a>
          </div>

          {/* This bank's support desk */}
          <nav aria-label={`${page.shortName} support`}>
            <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
              {page.shortName} support
            </h2>
            <ul className="mt-4 space-y-3 text-[14.5px]">
              <li>
                <a
                  href={`mailto:${page.support.email}`}
                  className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv [overflow-wrap:anywhere]"
                >
                  {page.support.email}
                </a>
              </li>
              <li>
                <a
                  href={page.support.phoneHref}
                  className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                >
                  {page.support.phone}
                </a>
              </li>
              {page.support.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    {...(l.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={CONTACT.whatsapp}
                  className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </nav>

          {/* The other two landing pages, and the policies */}
          <div>
            <nav aria-label="Other banks">
              <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
                Other banks
              </h2>
              <ul className="mt-4 space-y-3 text-[14.5px]">
                {siblings.map((s) => {
                  const href = pluginPageUrl(s.slug);
                  const external = pluginPageIsExternal(s.slug);
                  const cls =
                    "link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv";
                  return (
                    <li key={s.slug}>
                      {external ? (
                        <a href={href} className={cls}>
                          For {s.bank}
                        </a>
                      ) : (
                        <Link href={href} className={cls}>
                          For {s.bank}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <nav aria-label="Policies" className="mt-8">
              <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
                Policies
              </h2>
              {/* The BANK PORTAL's documents, not the main site's — these are
                  what a plugin customer agrees to at registration. */}
              <ul className="mt-4 space-y-3 text-[14.5px]">
                <li>
                  <a
                    href={`${base}/policy/Terms-conditions.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                  >
                    Terms &amp; conditions
                  </a>
                </li>
                <li>
                  <a
                    href={`${base}/documents/Privacy-policy.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                  >
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a
                    href={`${base}/documents/Refund-cancellation-policy.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw rounded-sm py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                  >
                    Refund &amp; cancellation policy
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-line-inv pt-6">
          <div className="flex flex-col gap-2 text-[13px] text-ink-inv-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {SITE.legalName} All rights reserved.
            </p>
            <p className="max-w-[62ch] text-ink-inv-3">
              {/* The honesty line. A page headed with a bank's name must say
                  who published it (CONTENT-TODO §1). */}
              Published by {SITE.legalName}. {page.bank} is named to identify
              whose customers the plugin is offered to.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
