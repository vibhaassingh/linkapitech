import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS } from "@/content/home";
import { CONTACT } from "@/lib/site";

/** Contact — real channels + the working form (zod + honeypot + /api/contact). */
export function ContactCta() {
  return (
    <section id="contact" className="section-pad border-t border-line-soft bg-surface">
      <div className="mx-auto grid w-full max-w-[1240px] gap-14 px-6 md:px-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeader meta={HOME_SECTIONS.contact} />

          <Reveal delay={150}>
            <ul className="mt-10 flex flex-col gap-6">
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
        </div>

        <Reveal delay={200}>
          <div className="rounded-lg border border-line bg-canvas p-7 md:p-10">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
