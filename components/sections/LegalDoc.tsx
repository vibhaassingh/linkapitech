import type { ReactNode } from "react";
import type { LegalDoc } from "@/content/legal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Email addresses and bare URLs inside clause bodies become real links.
 *
 * The clause copy in `content/legal.ts` is plain prose on purpose — legal text
 * should not carry markup — so the linking happens here, at render time, and
 * `content/` stays untouched. Split-and-map rather than `dangerouslySetInnerHTML`:
 * the output is React elements, so nothing in the content file can inject HTML.
 */
const LINKABLE = /([\w.+-]+@[\w-]+\.[\w.]+[\w]|https?:\/\/[^\s,)]+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINKABLE).map((part, i) => {
    // Odd indices are the captured matches — String.split with one capture
    // group interleaves them with the surrounding literal text.
    if (i % 2 === 0) return part;
    const isMail = !part.startsWith("http");
    return (
      <a
        key={i}
        href={isMail ? `mailto:${part}` : part}
        className="link-draw font-medium text-violet-text transition-colors duration-ui hover:text-plum-700 [overflow-wrap:anywhere]"
      >
        {part}
      </a>
    );
  });
}

/**
 * Numbered-clause legal document — 680px prose column, institutional styling.
 *
 * Rhythm: the top padding matches PageHero's exactly (136 / 156), which is the
 * floating header's real footprint plus a 64 / 72px gap, so a legal page and a
 * hero page open on the same line. Block offsets are on the 8-pt scale; the
 * 12px step between a clause heading and its body is deliberate — it is the
 * pairing that makes the clause read as one unit.
 */
export function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-6 pb-24 pt-[136px] md:px-10 md:pt-[156px]">
      <Reveal>
        <Eyebrow>{doc.title}</Eyebrow>
      </Reveal>
      {/* Not reveal-gated below this point for the h1: on a legal page it is the
          LCP element, and [data-reveal] starts at opacity 0. */}
      <h1 className="display-2 mt-6 text-ink">{doc.title}</h1>
      <p className="mt-6 max-w-[62ch] leading-relaxed text-ink-2">
        {doc.intro}
      </p>
      <p className="mt-4 font-mono text-xs uppercase tracking-eyebrow text-ink-3">
        Last updated: {doc.updated}
      </p>

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
              <p
                key={i}
                className="mt-3 text-[15px] leading-relaxed text-ink-2"
              >
                {linkify(p)}
              </p>
            ))}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
