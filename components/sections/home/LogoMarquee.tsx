import Image from "next/image";
import { CLIENTS } from "@/content/clients";
import { TRUST_LINE } from "@/content/stats";

/**
 * Trust band — an infinite marquee of client marks on white.
 *
 * The row is duplicated in the DOM and the track translates -50%, which loops
 * seamlessly without JS. The copy is aria-hidden so the list is announced once;
 * under reduced motion the animation is neutralised globally and the row simply
 * sits still.
 */
export function LogoMarquee() {
  return (
    <section aria-label={TRUST_LINE} className="border-y border-line-soft bg-surface py-10 md:py-12">
      <p className="mb-8 text-center text-[12px] font-semibold uppercase tracking-eyebrow text-ink-3">
        {TRUST_LINE}
      </p>

      <div className="marquee-mask no-scrollbar mask-fade-x overflow-hidden">
        <div className="marquee items-center" style={{ ["--marquee-d" as string]: "42s" }}>
          <Row />
          <Row aria-hidden dup />
        </div>
      </div>
    </section>
  );
}

/**
 * Every mark sits in the same 150×40 box with object-contain, so wide marks
 * (IndusInd, HDFC) can't outweigh compact ones — constraining height alone
 * made an 8:1 wordmark render twice as wide as the rest. `scale` is the
 * remaining per-logo optical nudge.
 */
function Row({ "aria-hidden": hidden, dup }: { "aria-hidden"?: boolean; dup?: boolean }) {
  return (
    <ul
      className={`flex shrink-0 items-center gap-10 pr-10 md:gap-14 md:pr-14${dup ? " marquee-dup" : ""}`}
      aria-hidden={hidden ? "true" : undefined}
    >
      {CLIENTS.map((c) => (
        <li key={c.name} className="grid h-10 w-[150px] shrink-0 place-items-center">
          <Image
            src={c.logo as string}
            alt={hidden ? "" : c.name}
            width={150}
            height={40}
            style={{ transform: `scale(${c.scale ?? 1})` }}
            className="max-h-10 w-auto max-w-[150px] object-contain opacity-90"
            unoptimized
          />
        </li>
      ))}
    </ul>
  );
}
