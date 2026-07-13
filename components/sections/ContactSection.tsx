import { SECTION_META } from "@/content/home";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "./ContactForm";
import { ContactDetails } from "./ContactDetails";
import { Faq } from "./Faq";

/** Contact + FAQ (HOMEPAGE-SECTIONS §7). */
export function ContactSection() {
  const meta = SECTION_META.contact;
  return (
    <section id="contact" className="rsec-pad border-b border-line">
      <Reveal>
        <SectionEyebrow num={meta.num} label={meta.eyebrow} end={meta.end} />
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal delay={80}>
          <MixedHeading
            plain={meta.headingPlain}
            accent={meta.headingAccent}
            className="text-[clamp(40px,7vw,88px)] leading-[0.98] tracking-tighter"
          />
          <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
            Need assistance or want to explore our services? Reach out to our team for support
            tailored to your business — we&apos;re here to help at every step.
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
