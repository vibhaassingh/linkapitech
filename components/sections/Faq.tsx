"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FAQ as FAQ_ITEMS } from "@/content/faq";
import { FAQ_HEADING } from "@/content/home";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { Reveal } from "@/components/motion/Reveal";

/**
 * FAQ styled as a chat conversation (HOMEPAGE-SECTIONS §7 / INTERACTIONS §5.7).
 * Questions are right-aligned dark bubbles; answers arrive from a bot avatar
 * after a brief typing indicator. First question open. One-open-at-a-time.
 */
export function Faq() {
  const [active, setActive] = useState(0);
  const [typing, setTyping] = useState(false);

  const open = (i: number) => {
    if (active === i) {
      setActive(-1);
      return;
    }
    setActive(i);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyping(false);
      return;
    }
    setTyping(true);
    window.setTimeout(() => setTyping(false), 650);
  };

  return (
    <div id="faq" className="mt-24 scroll-mt-28 border-t border-line pt-16">
      <Reveal>
        <MixedHeading
          plain={FAQ_HEADING.plain}
          accent={FAQ_HEADING.accent}
          className="mb-10 text-center text-[clamp(32px,5vw,64px)] leading-[1.05] tracking-tighter"
        />
      </Reveal>

      <div className="mx-auto flex max-w-[760px] flex-col gap-4">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = active === i;
          return (
            <div key={item.q} className="flex flex-col gap-2">
              <button
                onClick={() => open(i)}
                aria-expanded={isOpen}
                className="ml-auto flex max-w-[85%] items-center gap-3 rounded-[20px_20px_6px_20px] bg-ink px-5 py-3.5 text-left text-white"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/25 text-sm leading-none">
                  {isOpen ? "−" : "+"}
                </span>
                <span className="text-[15px] leading-snug">{item.q}</span>
              </button>

              {isOpen && (
                <div className="flex max-w-[92%] items-start gap-3">
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold text-accent-tint">
                    LA
                  </span>
                  {typing ? (
                    <div className="typing rounded-[6px_20px_20px_20px] border border-line bg-bg-2 px-5 py-4">
                      <i />
                      <i />
                      <i />
                    </div>
                  ) : (
                    <div className="rounded-[6px_20px_20px_20px] border border-line bg-bg px-5 py-4 text-[15px] leading-relaxed text-ink-2 shadow-[0_24px_50px_-28px_rgba(0,0,0,.16)]">
                      {withEm(item.a, item.emphasis)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Composer CTA */}
        <a
          href="#contact"
          className="mt-4 flex items-center justify-between rounded-[20px] border border-line bg-bg-2 px-6 py-5 transition-colors hover:border-ink"
        >
          <span className="text-[15px] text-ink-2">Have a different question? Ask us directly.</span>
          <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink">
            Start a conversation
            <span aria-hidden="true">→</span>
          </span>
        </a>
      </div>
    </div>
  );
}

function withEm(text: string, emphasis?: string): ReactNode {
  if (!emphasis || !text.includes(emphasis)) return text;
  const [before, after] = text.split(emphasis);
  return (
    <>
      {before}
      <em className="font-serif italic text-ink">{emphasis}</em>
      {after}
    </>
  );
}
