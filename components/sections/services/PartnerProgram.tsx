import { Reveal } from "@/components/motion/Reveal";
import { PARTNER_PROGRAM } from "@/content/services";
import { cn } from "@/lib/cn";

/**
 * Partner & Influencer Program — plum band with a glass cluster diagram:
 * five partner types arranged around a glowing LinkAPI core (Figma page 37).
 * Positions are fixed percentages from lg up; below that the cluster becomes
 * a simple chip list.
 */
const NODE_POS = [
  { x: 30, y: 12 },
  { x: 72, y: 22 },
  { x: 12, y: 58 },
  { x: 80, y: 56 },
  { x: 44, y: 86 },
];

export function PartnerProgram() {
  return (
    <section id="partner-program" className="section-dark section-pad">
      <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-center gap-12 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="eyebrow-capsule">{PARTNER_PROGRAM.eyebrow}</span>
          <h2 className="display-2 mt-6 max-w-[18ch] text-ink-inv">
            {PARTNER_PROGRAM.heading}
          </h2>
          <p className="mt-5 max-w-[54ch] text-[15.5px] leading-relaxed text-ink-inv-2">
            {PARTNER_PROGRAM.body}
          </p>
        </Reveal>

        <Reveal delay={160}>
          {/* xl+: cluster (needs more width than lg gives the absolute chips) */}
          <div className="relative hidden aspect-[5/4] w-full glass rounded-xl xl:block">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2 rounded-pill"
              style={{
                background:
                  "radial-gradient(circle, rgba(142,36,170,0.75), rgba(142,36,170,0.05) 70%)",
              }}
            />
            <span className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-inv">
              LinkAPI
            </span>

            {PARTNER_PROGRAM.nodes.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "chip-float glass-strong absolute z-[1] whitespace-nowrap rounded-lg px-4 py-2.5 text-[13.5px] font-medium text-ink-inv",
                )}
                style={{
                  left: `${NODE_POS[i].x}%`,
                  top: `${NODE_POS[i].y}%`,
                  transform: "translate(-50%, -50%)",
                  ["--float-delay" as string]: `${i * -0.9}s`,
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* below xl: chip list */}
          <ul className="flex flex-wrap gap-2.5 xl:hidden">
            {PARTNER_PROGRAM.nodes.map((label) => (
              <li
                key={label}
                className="glass rounded-pill px-4 py-2 text-[13.5px] font-medium text-ink-inv"
              >
                <span className="relative z-[1]">{label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
