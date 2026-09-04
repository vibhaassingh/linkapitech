import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Conduit } from "@/components/motifs";
import { ERPS } from "@/content/clients";
import { HOME_SECTIONS } from "@/content/home";
import { SectionProgress } from "./SectionProgress";

/**
 * "ERPs We Integrate With" — the six platforms LinkAPI's plugins target
 * (REDESIGN-V4 Part E §9).
 *
 * THE HEADING IS FIXED COPY. It stays "ERPs We Integrate With" and must never
 * imply a partnership, certification or endorsement by any of the six vendors
 * (CONTENT-TODO §1). Nothing here adds a word beyond content/*.ts.
 *
 * DELIBERATELY THIN. `py-14` (56px), not `section-pad` (80–140px): this
 * section sits between two dark bands — StatBand above, whose bottom edge is
 * already a Seam over a Meniscus filled with this section's `--surface`, and
 * ProcessRail below — so it IS the seam between them, and its job is to be
 * light and short rather than to be another panel. The `rounded-xl` bordered
 * `--canvas` plate the marks used to sit in is gone for the same reason: Part
 * E row 9 asks for the heading, the marks at their existing sizes, and one
 * Conduit, and a card frame around six logos re-adds the weight the thinness
 * is for.
 *
 * THE CONDUIT. One light horizontal Conduit under the mark strip — the liquid
 * flowing into the ERPs — spanning the strip's full width so it reads as one
 * channel feeding all six rather than a decorative underline. `flow="scroll"`
 * means the band tracks `--sp`, written by <SectionProgress> (the one-hook
 * client `<section>` wrapper, so this file stays a server component). With no
 * driver `--sp` is the `:root` 0 and the band parks off-track, invisible:
 * decoration fails closed by construction.
 *
 * Mark treatment is unchanged: a uniform 140×56 box with object-contain, so a
 * stacked logo (TallyPrime) and a wide one (NetSuite) carry the same weight;
 * 0.92 opacity at rest, 1 on hover, over --dur-ui. Opacity only, so reduced
 * motion just removes the fade (the global transition-duration clamp) and the
 * hover still reads. The row wraps below md.
 */
export function ErpBand() {
  return (
    <SectionProgress className="bg-surface py-14">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="text-center">
          <h2 className="display-2 text-ink">{HOME_SECTIONS.erps.heading}</h2>
        </Reveal>

        <Reveal delay={120}>
          <ul className="mx-auto mt-10 flex max-w-[1140px] flex-wrap items-center justify-center gap-x-6 gap-y-6 md:gap-x-8">
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

        <Reveal delay={200}>
          <div className="mx-auto mt-8 max-w-[1140px]">
            <Conduit light flow="scroll" />
          </div>
        </Reveal>
      </div>
    </SectionProgress>
  );
}
