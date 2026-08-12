import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CONTACT, SITE } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Talk to LinkAPI Tech about bringing banking inside your business. Partnerships, plugin support and management contacts, plus our registered office in Ghaziabad, Uttar Pradesh.",
  path: "/contact",
});

/** One icon per channel, in CONTACT.channels order. */
const CHANNEL_ICONS: IconName[] = ["share", "plug", "building"];

export default function ContactPage() {
  return (
    <>
      <PageHero
        tone="dark"
        align="center"
        title="Let's build the next generation of banking together."
        lead="Ready to bring banking inside your business? Tell us what you're looking to solve and our team will get back to you with tailored solutions and next steps."
      />

      <section className="section-pad bg-surface">
        <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-start gap-12 px-6 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Contact details */}
          <Reveal>
            <span className="eyebrow-capsule">Contact details</span>

            <ul className="mt-8 flex flex-col gap-4">
              <li className="flex items-start gap-4 rounded-xl border border-line-soft bg-canvas p-5">
                <span className="grad-fill grid h-10 w-10 shrink-0 place-items-center rounded-md text-ink-inv">
                  <Icon name="bank" size={18} />
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-eyebrow text-violet-text">
                    Registered address
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink">
                    {CONTACT.address.line1}
                    <br />
                    {CONTACT.address.line2}
                  </p>
                </div>
              </li>

              {CONTACT.channels.map((ch, i) => (
                <li
                  key={ch.phone}
                  className="flex items-start gap-4 rounded-xl border border-line-soft bg-canvas p-5"
                >
                  <span className="grad-fill grid h-10 w-10 shrink-0 place-items-center rounded-md text-ink-inv">
                    <Icon name={CHANNEL_ICONS[i] ?? "user"} size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold uppercase tracking-eyebrow text-violet-text">
                      {ch.label}
                    </p>
                    <a
                      href={`mailto:${ch.email}`}
                      className="mt-1 block text-[15px] text-ink transition-colors duration-ui hover:text-plum-700 [overflow-wrap:anywhere]"
                    >
                      {ch.email}
                    </a>
                    <a
                      href={ch.phoneHref}
                      className="block text-[15px] text-ink-2 transition-colors duration-ui hover:text-plum-700"
                    >
                      {ch.phone}
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl border border-line-soft bg-canvas p-5">
              <p className="flex items-center gap-2.5 text-[15px] text-ink">
                <Icon name="globe" size={17} className="text-violet-text" />
                www.{SITE.domain}
              </p>
              <a
                href={CONTACT.whatsapp}
                className="mt-3 inline-flex items-center gap-2.5 text-[15px] text-ink-2 transition-colors duration-ui hover:text-plum-700"
              >
                <Icon name="chat" size={17} className="text-violet-text" />
                Message us on WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Map — lazy iframe, no third-party JS, keyboard-reachable link fallback. */}
      <section aria-label="Our location" className="border-t border-line-soft">
        <iframe
          title="Map of LinkAPI Tech's registered office in Ghaziabad, Uttar Pradesh"
          src="https://www.google.com/maps?q=Shipra+Indirapuram,+Ghaziabad,+Uttar+Pradesh&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[380px] w-full border-0 md:h-[440px]"
        />
      </section>
    </>
  );
}
