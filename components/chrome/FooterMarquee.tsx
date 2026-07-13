import { Marquee } from "@/components/ui/Marquee";
import { MARQUEE_STATS } from "@/content/stats";

/** Giant stats ticker between Contact and the closing footer (HOMEPAGE-SECTIONS §8). */
export function FooterMarquee() {
  return (
    <section className="border-y border-line bg-bg py-6 md:py-8" aria-label="Key statistics">
      <Marquee speed="slow">
        {MARQUEE_STATS.map((s, i) => (
          <div key={i} className="flex items-center">
            <span className="flex items-baseline gap-3 whitespace-nowrap px-8 md:px-12">
              <span className="font-sans text-[clamp(52px,6.8vw,91px)] font-medium leading-none tracking-tighter">
                {s.value}
              </span>
              <span className="text-[11px] uppercase tracking-eyebrow text-ink-3">{s.label}</span>
            </span>
            <Diamond />
          </div>
        ))}
      </Marquee>
    </section>
  );
}

function Diamond() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="mx-2 animate-spin-slow text-accent-deep"
      aria-hidden="true"
    >
      <path d="M12 2l10 10-10 10L2 12 12 2z" fill="currentColor" />
    </svg>
  );
}
