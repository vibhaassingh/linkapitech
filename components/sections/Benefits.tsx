import { BENEFITS } from "@/content/benefits";
import { SECTION_META } from "@/content/home";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Benefits / Why (HOMEPAGE-SECTIONS §5) — 6-card grid. The source's looping
 * video-per-card is replaced by a lightweight animated gradient poster (LinkAPI
 * has no video assets); reduced motion freezes it via globals.css.
 */
export function Benefits() {
  const meta = SECTION_META.why;
  return (
    <section id="why" className="rsec-pad border-b border-line">
      <Reveal>
        <SectionEyebrow num={meta.num} label={meta.eyebrow} end={meta.end} />
      </Reveal>
      <Reveal delay={80}>
        <MixedHeading
          plain={meta.headingPlain}
          accent={meta.headingAccent}
          className="mb-4 max-w-[20ch] text-[clamp(30px,4.5vw,56px)] leading-[1.05] tracking-tighter"
        />
        <p className="mb-12 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
          A one-stop partner for the whole delivery cycle — a handpicked team serving diverse leading
          BFSI clients.
        </p>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {BENEFITS.map((b, i) => (
          <Reveal key={b.num} delay={i * 90}>
            <article className="h-full rounded-[18px] border border-line p-6 md:p-8">
              <div className="ben-poster mb-6 aspect-[16/10] rounded-[14px] border border-line" />
              <span className="font-serif text-lg italic tabular-nums text-accent-deep">{b.num}</span>
              <h3 className="mt-1 text-[clamp(20px,1.7vw,24px)] font-medium leading-tight tracking-[-0.015em]">
                {b.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{b.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
