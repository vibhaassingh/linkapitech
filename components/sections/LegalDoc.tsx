import type { LegalDoc } from "@/content/legal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/** Numbered-clause legal document — 680px prose column, institutional styling. */
export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-6 pb-24 pt-[clamp(48px,7vh,80px)] md:px-10">
      <Reveal>
        <Eyebrow>{doc.title}</Eyebrow>
      </Reveal>
      <Reveal delay={80}>
        <h1 className="display-2 mt-5 text-ink">{doc.title}</h1>
        <p className="mt-5 max-w-[62ch] leading-relaxed text-ink-2">{doc.intro}</p>
        <p className="mt-3 font-mono text-xs uppercase tracking-eyebrow text-ink-3">
          Last updated: {doc.updated}
        </p>
      </Reveal>

      <div className="mt-12 max-w-[680px]">
        {doc.sections.map((s) => (
          <Reveal key={s.num} className="border-t border-line-soft py-8">
            <h2 className="flex items-baseline gap-4 font-display text-[19px] font-semibold text-ink">
              <span className="font-mono text-[13px] font-normal tabular-nums text-ink-3">
                {s.num}
              </span>
              {s.title}
            </h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-3 text-[15px] leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
