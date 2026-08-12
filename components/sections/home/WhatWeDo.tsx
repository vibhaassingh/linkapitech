import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Icon } from "@/components/ui/Icon";
import { HOME_SECTIONS, WHAT_WE_DO } from "@/content/home";

/** "What We Do" — three numbered glass rows on plum. */
export function WhatWeDo() {
  return (
    <section className="section-dark section-pad">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink-inv">{HOME_SECTIONS.what.heading}</h2>
        </Reveal>

        <RevealGroup className="mt-10 flex flex-col gap-5" step={110}>
          {WHAT_WE_DO.map((p) => (
            <article
              key={p.num}
              className="glass sheen flex flex-col gap-3 rounded-xl p-7 sm:flex-row sm:items-center sm:gap-6 md:gap-9 md:p-9"
            >
              <span
                className="ghost-num relative z-[1] text-[44px] leading-none md:text-[52px]"
                aria-hidden="true"
              >
                {p.num}
              </span>

              <div className="relative z-[1] min-w-0 flex-1">
                <h3 className="heading-3 text-ink-inv">{p.title}</h3>
                <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed text-ink-inv-2">
                  {p.body}
                </p>
              </div>

              <span className="grad-tile relative z-[1] hidden h-12 w-12 shrink-0 place-items-center md:grid">
                <Icon name={p.icon} size={22} />
              </span>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
