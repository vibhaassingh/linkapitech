import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { ERPS } from "@/content/clients";
import { HOME_SECTIONS } from "@/content/home";

/**
 * "ERP's We Integrate With" — the six platforms LinkAPI's plugins target.
 * A static row (not a marquee): six marks fit one line from md up, and the
 * Figma shows them boxed rather than scrolling.
 *
 * Mark treatment matches <LogoMarquee>: 0.92 at rest, 1 on hover, over
 * --dur-ui. Opacity only, so reduced motion just removes the fade (the global
 * transition-duration clamp) and hover still reads.
 *
 * Rhythm: heading → panel = mt-12 (48), panel padding px-6/py-8 (24/32),
 * gaps 24/32 × 24 — the 8-pt scale used by the rest of the home page.
 */
export function ErpBand() {
  return (
    <section className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="text-center">
          <h2 className="display-2 text-ink">{HOME_SECTIONS.erps.heading}</h2>
        </Reveal>

        <Reveal delay={120}>
          {/* Uniform 140×56 box per mark with object-contain, so a stacked logo
              (TallyPrime) and a wide one (NetSuite) carry the same weight. */}
          <ul className="mx-auto mt-12 flex max-w-[1140px] flex-wrap items-center justify-center gap-x-6 gap-y-6 rounded-xl border border-line-soft bg-canvas px-6 py-8 md:gap-x-8">
            {ERPS.map((e) => (
              <li
                key={e.name}
                className="group grid h-14 w-[140px] place-items-center"
              >
                <Image
                  src={e.logo}
                  alt={e.name}
                  width={140}
                  height={56}
                  style={{ transform: `scale(${e.scale ?? 1})` }}
                  className="max-h-14 w-auto max-w-[140px] object-contain opacity-[0.92] transition-opacity duration-ui group-hover:opacity-100"
                  unoptimized
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
