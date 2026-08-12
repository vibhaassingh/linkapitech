import Link from "next/link";
import { Logo } from "./Logo";
import { FOOTER_COLUMNS, SITE, CONTACT, SOCIALS } from "@/lib/site";

/**
 * Light footer (Figma Purple): brand column + four link columns over the
 * lavender canvas, hairline baseline. Every href resolves to a real page —
 * the Figma's placeholder links (Careers, Blog, Status Page…) are mapped onto
 * real destinations in lib/site.ts rather than shipped dead.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line-soft bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 pb-10 pt-16 md:px-10 md:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)] md:gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block rounded-sm text-plum-950">
              <Logo />
            </Link>
            <p className="mt-4 max-w-[30ch] text-[14.5px] leading-relaxed text-ink-2">
              Powering secure banking &amp; enterprise integrations at scale.
            </p>

            {SOCIALS.length > 0 && (
              <ul className="mt-5 flex items-center gap-2.5">
                {SOCIALS.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      className="grid h-9 w-9 place-items-center rounded-pill bg-plum-600 text-ink-inv transition-colors duration-ui hover:bg-violet-600"
                      aria-label={s.label}
                    >
                      <span aria-hidden="true" className="text-[13px] font-semibold">
                        {s.label.charAt(0)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 space-y-1 text-[14px] text-ink-2">
              <a
                href={`mailto:${CONTACT.primaryEmail}`}
                className="block rounded-sm transition-colors duration-ui hover:text-plum-700 [overflow-wrap:anywhere]"
              >
                {CONTACT.primaryEmail}
              </a>
              <p className="max-w-[28ch] leading-relaxed text-ink-3">{CONTACT.address.full}</p>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="rounded-sm text-[14.5px] text-ink-2 transition-colors duration-ui hover:text-plum-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line-soft pt-6 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.legalName} All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/privacy" className="rounded-sm hover:text-plum-700">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="rounded-sm hover:text-plum-700">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
