import Link from "next/link";
import { CONTACT, SITE, SOCIALS, SOLUTIONS_MENU, NAV_PAGES } from "@/lib/site";

/**
 * Institutional footer — full-bleed navy band. Real contact channels and
 * address only; socials stay hidden until real profile URLs exist.
 */
export function SiteFooter() {
  return (
    <footer className="bg-inverse text-ink-inv">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <p className="font-display text-[19px] font-semibold tracking-tight">
              LinkAPI<span className="ml-1 font-semibold text-steel">Tech</span>
            </p>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-inv-2">
              {SITE.description}
            </p>
          </div>

          {/* Solutions */}
          <nav aria-label="Footer solutions">
            <p className="eyebrow mb-4 !text-steel">Solutions</p>
            <ul className="flex flex-col gap-2.5">
              {SOLUTIONS_MENU.flatMap((col) => col.links).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Footer company">
            <p className="eyebrow mb-4 !text-steel">Company</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/work" className="text-sm text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv">
                  Work
                </Link>
              </li>
              {NAV_PAGES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-sm text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="text-sm text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="eyebrow mb-4 !text-steel">Reach us</p>
            <ul className="flex flex-col gap-4">
              {CONTACT.channels.map((ch) => (
                <li key={ch.phone}>
                  <p className="text-[12.5px] text-steel">{ch.label}</p>
                  <p className="mt-0.5 text-sm">
                    <a
                      href={ch.phoneHref}
                      className="tnum inline-block py-1 font-medium text-ink-inv hover:underline"
                    >
                      {ch.phone}
                    </a>
                  </p>
                  <p className="text-sm">
                    <a
                      href={`mailto:${ch.email}`}
                      className="inline-block break-all py-1 text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                    >
                      {ch.email}
                    </a>
                  </p>
                </li>
              ))}
              <li className="text-sm leading-relaxed text-ink-inv-2">{CONTACT.address.full}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line-inv pt-6 text-[13px] text-ink-inv-2 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-ui hover:text-ink-inv"
            >
              WhatsApp Business
            </a>
            <Link href="/terms" className="transition-colors duration-ui hover:text-ink-inv">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors duration-ui hover:text-ink-inv">
              Privacy
            </Link>
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="transition-colors duration-ui hover:text-ink-inv"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
