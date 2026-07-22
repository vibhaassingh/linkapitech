import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Wordmark } from "@/components/ui/Wordmark";
import { CLIENTS } from "@/content/clients";
import { TRUST_LINE } from "@/content/stats";

/**
 * Bank trust wall — the narrative center of the page, directly under the
 * hero: "Powering integrations for" + the four marks, monochrome, hairline
 * framed. Logos are text wordmarks until licensed vectors are supplied.
 */
export function TrustWall() {
  return (
    <section aria-label={TRUST_LINE} className="border-y border-line-soft bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-12 md:px-10 md:py-14">
        <Reveal>
          <p className="eyebrow text-center">Powering integrations for</p>
        </Reveal>
        <RevealGroup
          className="mt-8 grid grid-cols-2 gap-y-8 md:grid-cols-4"
          step={90}
          baseDelay={120}
        >
          {CLIENTS.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-center border-line-soft md:border-l md:first:border-l-0"
            >
              <Wordmark client={c} />
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
