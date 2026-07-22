import { RevealGroup } from "@/components/motion/RevealGroup";
import { SectionHeader } from "./SectionHeader";
import { HOME_SECTIONS } from "@/content/home";

/**
 * Security & delivery discipline — full-bleed navy band. Every row is a real,
 * stated practice from LinkAPI's own service language (the "What we offer?"
 * checklist). Deliberately NO certification badges: no ISO/PCI/SOC claims
 * exist in the source and none may be invented.
 */
const PRACTICES = [
  {
    num: "01",
    title: "Secure connectivity, established first",
    body: "Every engagement starts by establishing secure connectivity between the bank and your systems — before any transaction flows.",
  },
  {
    num: "02",
    title: "Bank prerequisites, handled",
    body: "Static IPs, SSL certificates, bank configuration and client-end empanelment — the compliance groundwork is managed as part of delivery.",
  },
  {
    num: "03",
    title: "UAT to production, no shortcuts",
    body: "Comprehensive integration support from UAT through production cutover, with technical coordination between the bank and your technology partner.",
  },
  {
    num: "04",
    title: "Post-live support, on demand",
    body: "Ongoing post-live support keeps integrations healthy long after go-live — monitored, maintained, and ready to change when the bank does.",
  },
];

export function SecurityBand() {
  return (
    <section id="security" className="bg-inverse">
      <div className="section-pad mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <SectionHeader meta={HOME_SECTIONS.security} inverse />

        <RevealGroup className="mt-12 flex flex-col" step={80}>
          {PRACTICES.map((p) => (
            <div
              key={p.num}
              className="grid gap-3 border-t border-line-inv py-7 md:grid-cols-[80px_1fr_1.4fr] md:items-baseline md:gap-8"
            >
              <p className="flex items-center gap-3 font-mono text-xs text-steel">
                <span className="pulse-dot" aria-hidden="true" />
                {p.num}
              </p>
              <h3 className="font-display text-[19px] font-semibold text-ink-inv">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-inv-2">{p.body}</p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
