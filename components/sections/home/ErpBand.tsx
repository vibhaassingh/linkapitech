import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { ERPS } from "@/content/clients";
import { HOME_SECTIONS } from "@/content/home";

/**
 * "ERP's We Integrate With" — the six platforms LinkAPI's plugins target.
 * A static row (not a marquee): six marks fit one line from md up, and the
 * Figma shows them boxed rather than scrolling.
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
          <ul className="mx-auto mt-12 flex max-w-[1140px] flex-wrap items-center justify-center gap-x-5 gap-y-6 rounded-xl border border-line-soft bg-canvas px-6 py-10 md:gap-x-7">
            {ERPS.map((e) => (
              <li key={e.name} className="grid h-14 w-[140px] place-items-center">
                <Image
                  src={e.logo}
                  alt={e.name}
                  width={140}
                  height={56}
                  style={{ transform: `scale(${e.scale ?? 1})` }}
                  className="max-h-14 w-auto max-w-[140px] object-contain"
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
