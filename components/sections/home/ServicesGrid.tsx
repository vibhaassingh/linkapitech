import Link from "next/link";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Chip } from "@/components/ui/Chip";
import { SectionHeader } from "./SectionHeader";
import { SERVICES, serviceHeading } from "@/content/services";
import { HOME_SECTIONS } from "@/content/home";

/**
 * Services — flagship bank-connectivity practice as a wide featured card,
 * the remaining six in a hairline grid. Every card deep-links to its
 * /services#id section.
 */
export function ServicesGrid() {
  const [flagship, ...rest] = SERVICES;

  return (
    <section id="services" className="section-pad">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.services} />

        <RevealGroup className="mt-14 grid gap-5" step={0}>
          <Link
            href={`/services#${flagship.id}`}
            className="group grid gap-8 rounded-lg bg-navy-050 p-8 transition-colors duration-ui hover:bg-navy-100 md:grid-cols-[1fr_1.2fr] md:p-12"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-eyebrow text-navy-600">
                Flagship · {flagship.num}
              </p>
              <h3 className="heading-3 mt-4 text-navy-900">{serviceHeading(flagship)}</h3>
            </div>
            <div>
              <p className="leading-relaxed text-ink-2">{flagship.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {flagship.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <span className="mt-7 inline-flex items-center gap-2 text-[14.5px] font-medium text-navy-600 transition-colors duration-ui group-hover:text-navy-900">
                Explore the practice <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        </RevealGroup>

        <RevealGroup className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" step={70}>
          {rest.map((s) => (
            <Link
              key={s.id}
              href={`/services#${s.id}`}
              className="group flex flex-col justify-between rounded-md border border-line bg-surface p-7 shadow-card transition-all duration-ui hover:-translate-y-0.5 hover:border-steel"
            >
              <div>
                <p className="font-mono text-xs text-ink-3">{s.num}</p>
                <h3 className="mt-3 font-display text-[18px] font-semibold leading-snug text-ink">
                  {serviceHeading(s)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-3">{s.description}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-[13.5px] font-medium text-navy-600 transition-colors duration-ui group-hover:text-navy-900">
                Learn more <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
