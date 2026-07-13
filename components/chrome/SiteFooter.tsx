import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { CONTACT, NAV_LINKS, SOCIALS, SITE } from "@/lib/site";
import { SERVICES, serviceHeading } from "@/content/services";

/**
 * Closing dark footer panel (HOMEPAGE-SECTIONS Appendix). The reference's D&B
 * verification badge is Allgood-specific and dropped (PAGES-AND-ROUTING §4.2);
 * replaced with LinkAPI's own trust line. Social icons render only when real
 * profile URLs exist (SOCIALS is empty until the client supplies them).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-footer text-white">
      <div className="mx-auto max-w-[1360px] px-6 pb-10 pt-[clamp(72px,8vw,128px)] md:px-10">
        {/* Top band: statement + CTA */}
        <div className="grid gap-10 border-b border-white/10 pb-14 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-eyebrow text-white/50">
              <span className="pulse-dot" /> Open for new integrations · {year}
            </span>
            <MixedHeading
              as="h2"
              plain="Let's connect your"
              accent={
                <>
                  systems<span className="text-accent">.</span>
                </>
              }
              className="mt-5 max-w-[16ch] text-[clamp(40px,5.6vw,92px)] leading-none tracking-tighter text-white"
              accentClassName="text-white"
            />
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/60">
              From bank connectivity to reconciliation and support — tell us what you need to
              integrate, and we&apos;ll map the path to go-live.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <Button href="/#contact" variant="accent" magnetic>
              Start a conversation
            </Button>
            <a
              href={`mailto:${CONTACT.primaryEmail}`}
              className="text-sm text-white/70 hover:text-accent"
            >
              {CONTACT.primaryEmail}
            </a>
          </div>
        </div>

        {/* Nav + services */}
        <div className="grid gap-10 border-b border-white/10 py-12 sm:grid-cols-2 md:grid-cols-4">
          <FootCol title="Company">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="footer-link">
                {l.label}
              </Link>
            ))}
          </FootCol>
          <FootCol title="Services">
            {SERVICES.slice(0, 6).map((s) => (
              <Link key={s.id} href={`/services#${s.id}`} className="footer-link">
                {serviceHeading(s)}
              </Link>
            ))}
          </FootCol>
          <FootCol title="Reach us">
            <span className="text-sm text-white/60">{CONTACT.address.line1}</span>
            <span className="text-sm text-white/60">{CONTACT.address.line2}</span>
            {CONTACT.channels.map((c) => (
              <a key={c.phone} href={c.phoneHref} className="footer-link">
                {c.phone}
              </a>
            ))}
          </FootCol>
          <FootCol title="Email">
            {CONTACT.channels.map((c) => (
              <a key={c.email} href={`mailto:${c.email}`} className="footer-link break-all">
                {c.email}
              </a>
            ))}
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="footer-link">
              WhatsApp
            </a>
          </FootCol>
        </div>

        {/* Verify strip */}
        <div className="flex flex-col gap-3 border-b border-white/10 py-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-accent/40 text-accent">
              ✓
            </span>
            BFSI-grade delivery · 5000+ API implementations
          </span>
          {SOCIALS.length > 0 && (
            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a key={s.href} href={s.href} className="footer-link" target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Legal row */}
        <div className="flex flex-col gap-3 pt-8 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {SITE.legalName}
          </span>
          <span>Ghaziabad, Uttar Pradesh, India</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>

      {/* Signature wordmark, faded into the floor */}
      <div className="footer-signature select-none px-6 pb-6 text-center" aria-hidden="true">
        <span className="font-serif text-[clamp(64px,20vw,260px)] italic leading-none text-white/10">
          LinkAPI
        </span>
      </div>
    </footer>
  );
}

function FootCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] uppercase tracking-eyebrow text-white/55">{title}</span>
      {children}
    </div>
  );
}
