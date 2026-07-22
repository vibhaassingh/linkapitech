import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { CONTACT } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact LinkAPI Tech | Ghaziabad, Uttar Pradesh",
  description:
    "Get in touch with LinkAPI Tech Pvt. Ltd. Call +91-9318373476 (plugin support) or +91-9891121770 (management), email partnership@linkapitech.com, or visit us at SRA 82 A, Shipra Indirapuram, Ghaziabad, Uttar Pradesh.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's connect your systems."
        lead="Tell us about your integration — we'll set up a short discovery call."
      />

      <section className="mx-auto grid w-full max-w-[1240px] gap-14 px-6 py-16 md:px-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <ul className="flex flex-col gap-7">
            {CONTACT.channels.map((ch) => (
              <li key={ch.phone}>
                <p className="eyebrow">{ch.label}</p>
                <p className="mt-2 text-[15px]">
                  <a href={ch.phoneHref} className="tnum font-medium text-ink hover:text-navy-700">
                    {ch.phone}
                  </a>
                </p>
                <p className="text-[15px]">
                  <a
                    href={`mailto:${ch.email}`}
                    className="break-all text-ink-2 transition-colors duration-ui hover:text-ink"
                  >
                    {ch.email}
                  </a>
                </p>
              </li>
            ))}
            <li>
              <p className="eyebrow">Office</p>
              <p className="mt-2 max-w-[32ch] text-[15px] leading-relaxed text-ink-2">
                {CONTACT.address.full}
              </p>
            </li>
            <li>
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14.5px] font-medium text-navy-600 transition-colors duration-ui hover:text-navy-900"
              >
                Message us on WhatsApp <span aria-hidden="true">→</span>
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={140}>
          <div className="rounded-lg border border-line bg-surface p-7 shadow-card md:p-10">
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </>
  );
}
