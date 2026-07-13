import type { LegalDoc } from "@/content/legal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Reveal } from "@/components/motion/Reveal";

/** Renders a numbered-clause legal document (PAGES-AND-ROUTING §1.4). */
export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <section className="rsec-pad">
      <Reveal>
        <SectionEyebrow num="—" label={doc.title} />
      </Reveal>
      <Reveal delay={80}>
        <h1 className="mt-8 font-sans text-[clamp(34px,5vw,64px)] font-medium leading-[1.02] tracking-tighter">
          {doc.title}
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">{doc.intro}</p>
        <p className="mt-3 text-[12px] uppercase tracking-eyebrow text-ink-3">
          Last updated: {doc.updated}
        </p>
      </Reveal>

      <div className="mt-12 max-w-[760px]">
        {doc.sections.map((s) => (
          <Reveal key={s.num} className="border-t border-line py-8">
            <h2 className="flex items-baseline gap-4 font-sans text-[clamp(20px,2vw,26px)] font-medium tracking-[-0.015em]">
              <span className="font-serif text-base italic tabular-nums text-ink-3">{s.num}</span>
              {s.title}
            </h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
