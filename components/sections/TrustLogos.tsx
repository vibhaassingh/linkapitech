import { Marquee } from "@/components/ui/Marquee";
import { CLIENTS } from "@/content/clients";

/**
 * Client trust marquee (HOMEPAGE-SECTIONS §1). Renders text wordmarks as an
 * interim trust bar — the source's light-only PNG logos are invisible on white
 * and legally sensitive to reproduce (CONTENT-MAPPING §3).
 * TODO: client to confirm — swap in licensed vector logos.
 */
export function TrustLogos() {
  return (
    <Marquee fade className="w-full">
      {CLIENTS.map((c) => (
        <span
          key={c.name}
          className="mx-8 whitespace-nowrap font-sans text-[clamp(18px,2vw,26px)] font-medium tracking-tight text-ink-3 grayscale transition-colors duration-300 hover:text-ink md:mx-12"
        >
          {c.name}
        </span>
      ))}
    </Marquee>
  );
}
