import { pageMetadata } from "@/lib/metadata";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactDetails } from "@/components/sections/ContactDetails";
import { Faq } from "@/components/sections/Faq";

export const metadata = pageMetadata({
  title: "Contact LinkAPI Tech | Ghaziabad, Uttar Pradesh",
  description:
    "Get in touch with LinkAPI Tech Pvt. Ltd. Call +91-9318373476 (plugin support) or +91-9891121770 (management), email partnership@linkapitech.com, or visit us at SRA 82 A, Shipra Indirapuram, Ghaziabad, Uttar Pradesh.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section id="contact" className="rsec-pad">
      <Reveal>
        <SectionEyebrow num="—" label="Contact us" end="Plugin support & inquiries" />
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal delay={80}>
          <MixedHeading
            as="h1"
            plain="Get in touch"
            accent="with us."
            className="text-[clamp(40px,7vw,88px)] leading-[0.98] tracking-tighter"
          />
          <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
            Need assistance or want to explore our services? Reach out to our dedicated team for
            personalized support and solutions tailored to your business needs.
          </p>
          <div className="mt-10">
            <ContactDetails />
          </div>
        </Reveal>

        <Reveal delay={160}>
          <ContactForm />
        </Reveal>
      </div>

      <Faq />
    </section>
  );
}
