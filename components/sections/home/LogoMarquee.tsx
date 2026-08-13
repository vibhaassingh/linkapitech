import Image from "next/image";
import type { CSSProperties } from "react";
import { CLIENTS } from "@/content/clients";
import { TRUST_LINE } from "@/content/stats";

/**
 * Trust band — an infinite marquee of client marks on white.
 *
 * The row is duplicated in the DOM and the track translates -50%, which loops
 * seamlessly without JS. The copy is aria-hidden so the list is announced once;
 * under reduced motion the animation is neutralised globally and the row simply
 * sits still.
 *
 * VELOCITY RESPONSE — and why it is not `animation-duration`
 * The obvious reading of "scale marquee speed with --scroll-velocity" is
 * `--marquee-d: calc(42s - var(--scroll-velocity) * 10.5s)`. That is unusable:
 * a CSS animation keeps its local *time* when its duration changes, so progress
 * (= frac(t / duration)) jumps. With a 42s loop already ~30s in, a single
 * lerp step of the velocity bus (0.12) re-maps progress by ~2% of the track —
 * a ~40px pop per frame, worsening the longer the page stays open.
 *
 * So the base loop keeps a constant duration and the velocity is applied as a
 * lead/lag on the two rows instead (the `.marquee` track itself cannot take a
 * transform — its own keyframes own that property). Both rows shift by the
 * identical amount, so the -50% loop seam stays exact. While the bus ramps, the
 * marks genuinely move faster than the loop and settle back when scrolling
 * stops, which is the effect that was asked for, jump-free.
 * Reduced motion: the bus never starts, so --scroll-velocity keeps its 0
 * default and the translate resolves to 0px.
 */

/** Lead at full bus saturation. ≈25% of the loop's own per-second advance. */
const LEAD = "24px";

export function LogoMarquee() {
  return (
    <section
      aria-label={TRUST_LINE}
      className="border-y border-line-soft bg-surface py-10 md:py-12"
    >
      <p className="mb-8 text-center text-[12px] font-semibold uppercase tracking-eyebrow text-ink-3">
        {TRUST_LINE}
      </p>

      <div className="marquee-mask no-scrollbar mask-fade-x overflow-hidden">
        <div
          className="marquee items-center"
          style={{ ["--marquee-d" as string]: "42s" }}
        >
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
 *
 * Three marks (Axis, HSBC, IndusInd) are licensed SVGs and render crisper than
 * the four remaining rasters; that difference is expected — do not try to
 * "correct" the rasters here.
 */
function Row({
  "aria-hidden": hidden,
  dup,
}: {
  "aria-hidden"?: boolean;
  dup?: boolean;
}) {
  return (
    <ul
      className={`flex shrink-0 items-center gap-10 pr-10 md:gap-14 md:pr-14${dup ? " marquee-dup" : ""}`}
      aria-hidden={hidden ? "true" : undefined}
      style={
        {
          transform: `translate3d(calc(var(--scroll-velocity) * -${LEAD}), 0, 0)`,
        } as CSSProperties
      }
    >
      {CLIENTS.map((c) => (
        <li
          key={c.name}
          className="group grid h-10 w-[150px] shrink-0 place-items-center"
        >
          <Image
            src={c.logo as string}
            alt={hidden ? "" : c.name}
            width={150}
            height={40}
            style={{ transform: `scale(${c.scale ?? 1})` }}
            className="max-h-10 w-auto max-w-[150px] object-contain opacity-[0.92] transition-opacity duration-ui group-hover:opacity-100"
            unoptimized
          />
        </li>
      ))}
    </ul>
  );
}
