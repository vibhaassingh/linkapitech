import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Node } from "@/components/motifs";
import { HeroField } from "@/components/three/HeroField";
import {
  BLOB_DRAW_SCALE,
  BLOBS,
  CAUSTICS,
  CHIP_SIZE,
  CHIPS,
  GLINTS,
  LENS,
  RIM,
  VIEW,
} from "@/components/three/scene/lensLayout";

/**
 * Hero visual — the lens (REDESIGN-V4 Part E §1, "the no-WebGL composition
 * stands alone"). Replaces the concentric-arc composition retired in Phase 4.
 *
 * Server-rendered SVG + DOM: crisp at any density, costs no JS, and paints with
 * the hero so it can never push the LCP. Every coordinate and every constant
 * the shader shares (`LENS`, `RIM`, `CHIP_SIZE`, `BLOB_DRAW_SCALE`, …) comes
 * from scene/lensLayout.ts — the single source of truth the WebGL scene reads
 * too — so the poster and the live liquid register exactly: the blobs are
 * drawn at their `uFlow = 0` rest pose, which is the pose the scene boots in.
 * What stays literal here is per-layer dressing the shader does not share
 * (gradient stops, opacities, stroke widths).
 *
 * Layers, bottom → top:
 *   1. <g.lens-caustic data-poster>  the two caustic pools (24s rock)
 *   2. <g data-poster>               lens body + the five metaballs, clipped
 *   3. <g data-poster>               thick rim: annulus + two hairline strokes
 *   4. <g.lens-glint data-poster>    key + secondary specular (9s float)
 *   5. <HeroField/>                  WebGL, additive, fades in on first frame
 *   6. DOM chips (Nodes)             after the canvas in DOM, so their
 *                                    backdrop-filter blurs the live liquid
 *
 * `data-poster` marks what the live scene replaces: HeroField sets
 * data-live="true" on .hero-lens and globals.css fades those groups out.
 * Without WebGL (phones, reduced motion, no context) data-live never flips and
 * the poster IS the hero. Chips are not posters.
 *
 * Parallax: two planes via `.scrub-drift` (positive range LEADS the scroll,
 * negative TRAILS — see the scrubDrift keyframes). The poster plate and the
 * canvas share ONE `drift-lead` wrapper on purpose: the WebGL scene
 * (`scene/createHeroLiquid.ts`) maps its camera 1:1 onto this VIEW-sized
 * viewBox, so drifting the two separately would unstick the canvas from the
 * SVG it registers with. The chips lead by their own `--drift-range`
 * (CHIP_META) in their own wrappers.
 *
 * The animated <g> elements carry NO SVG `transform` attribute: beside a CSS
 * transform animation it de-composites the group in Chromium (Part J). The
 * glints' rotation therefore sits on the inner <ellipse> elements. An inline
 * `transform-origin` is not `transform` — see the caustic group.
 */

/**
 * Per-chip dressing, keyed by CHIPS[].id so geometry stays in lensLayout.ts.
 * Labels are the previous chip set's aria-labels, verbatim (no new copy). Float phases and
 * parallax ranges are staggered rather than uniform so the chips hold depth
 * against each other and settle at different points of the transit — a literal
 * time lag is not available on a progress-based timeline.
 */
const CHIP_META: Record<
  (typeof CHIPS)[number]["id"],
  { icon: IconName; delay: string; drift: string; label: string }
> = {
  top: { icon: "bolt", delay: "0s", drift: "20px", label: "Real-time payments" },
  left: {
    icon: "spark",
    delay: "-2.4s",
    drift: "16px",
    label: "AI-powered accounting",
  },
  right: {
    icon: "layers",
    delay: "-4.6s",
    drift: "18px",
    label: "ERP-native ledger",
  },
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const pct = (v: number, of: number) => `${r2((v / of) * 100)}%`;

/** An ellipse as path data — two half-arcs — so the rim annulus can be one
 *  evenodd path (outer + inner). Both sub-paths run the same direction; the
 *  fill rule, not the winding, makes the hole. */
const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${r2(cx - rx)} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

/* Colours come from the CSS tokens. `var()` resolves in SVG presentation
   attributes exactly as it does in `style` — presentation attributes are
   parsed as CSS in every engine, and the rim's `fill="var(--plum-950)"` below
   relies on that — so the two forms are interchangeable. Fills/strokes use
   the attribute form the motif kit already relies on (Meniscus, ConduitPath);
   the gradient stops go through `style` only because one small object then
   carries both stop-color and stop-opacity. */
const stop = (color: string, opacity?: number): CSSProperties =>
  opacity === undefined
    ? { stopColor: color }
    : { stopColor: color, stopOpacity: opacity };

interface HeroLensProps {
  /**
   * idPrefix: prefix for the SVG `id`s (gradients, clipPath) and every `url(#…)`
   * that points at them. SVG ids are document-global, so a second lens on one page
   * — Phase 9's compact About lens — must pass its own prefix or the two would
   * resolve each other's paints. Deterministic (no `useId`) so the server and
   * client markup match byte for byte.
   */
  idPrefix?: string;
}

export function HeroLens({ idPrefix = "hl" }: HeroLensProps) {
  return (
    <div className="hero-lens relative mx-auto aspect-[5/4] w-full max-w-[560px]">
      {/* Poster plate — the trailing parallax plane. SVG + canvas, one transform. */}
      <div className="scrub-drift drift-lead absolute inset-0">
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <radialGradient id={`${idPrefix}-caustic`}>
              <stop offset="0" style={stop("var(--violet-500)", 1)} />
              <stop offset="1" style={stop("var(--violet-500)", 0)} />
            </radialGradient>
            <linearGradient id={`${idPrefix}-body`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={stop("var(--violet-600)")} />
              <stop offset="0.55" style={stop("var(--violet-500)")} />
              <stop offset="1" style={stop("var(--plum-700)")} />
            </linearGradient>
            <radialGradient id={`${idPrefix}-blob`}>
              <stop offset="0" style={stop("var(--violet-500)", 0.92)} />
              <stop offset="0.6" style={stop("var(--violet-600)", 0.5)} />
              <stop offset="1" style={stop("var(--violet-600)", 0)} />
            </radialGradient>
            {/* white key upper-right → faint lower-left, matching --grad-hero's bloom */}
            <linearGradient id={`${idPrefix}-rim`} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.10" />
            </linearGradient>
            <radialGradient id={`${idPrefix}-glint`}>
              <stop offset="0" style={stop("var(--ink-inv)", 1)} />
              <stop offset="0.35" style={stop("var(--lavender-400)", 0.85)} />
              <stop offset="1" style={stop("var(--lavender-400)", 0)} />
            </radialGradient>
            <clipPath id={`${idPrefix}-clip`}>
              <ellipse cx={LENS.cx} cy={LENS.cy} rx={LENS.rx} ry={LENS.ry} />
            </clipPath>
          </defs>

          {/* 1. Caustic pools the lens throws on the plum. The <g> rocks ±2°
              about the lens centre: the keyframes and `transform-box: view-box`
              are CSS (.lens-caustic); the origin is LENS, inline, so the centre
              is not copied a third time. transform-origin is not `transform`,
              so the header's no-transform-attribute rule and cascade.mjs (which
              reads only transform/translate/rotate/scale) are unaffected. */}
          <g
            className="lens-caustic"
            data-poster=""
            style={{ transformOrigin: `${LENS.cx}px ${LENS.cy}px` }}
          >
            {CAUSTICS.map((c) => (
              <ellipse
                key={`${c.cx}-${c.cy}`}
                cx={c.cx}
                cy={c.cy}
                rx={c.rx}
                ry={c.ry}
                fill={`url(#${idPrefix}-caustic)`}
                fillOpacity={c.alpha}
              />
            ))}
          </g>

          {/* 2. Lens body, then the five metaballs at rest, clipped to it. */}
          <g data-poster="">
            <ellipse
              data-lens-body=""
              cx={LENS.cx}
              cy={LENS.cy}
              rx={LENS.rx}
              ry={LENS.ry}
              fill={`url(#${idPrefix}-body)`}
              opacity={0.28}
            />
            <g clipPath={`url(#${idPrefix}-clip)`}>
              {BLOBS.map((b, i) => (
                <circle
                  key={i}
                  cx={r2(b.restX)}
                  cy={r2(b.restY)}
                  r={r2(b.r * BLOB_DRAW_SCALE)}
                  fill={`url(#${idPrefix}-blob)`}
                />
              ))}
            </g>
          </g>

          {/* 3. Thick refractive rim: a dark annulus, the lit outer edge, and
              an inner hairline where the glass thins. RIM is the shader's too. */}
          <g data-poster="">
            <path
              d={`${ellipsePath(LENS.cx, LENS.cy, LENS.rx, LENS.ry)} ${ellipsePath(
                LENS.cx,
                LENS.cy,
                LENS.rx - RIM.w,
                LENS.ry - RIM.w,
              )}`}
              fillRule="evenodd"
              fill="var(--plum-950)"
              fillOpacity={0.26}
            />
            <ellipse
              cx={LENS.cx}
              cy={LENS.cy}
              rx={LENS.rx}
              ry={LENS.ry}
              fill="none"
              stroke={`url(#${idPrefix}-rim)`}
              strokeWidth={1.4}
            />
            <ellipse
              cx={LENS.cx}
              cy={LENS.cy}
              rx={LENS.rx - RIM.inner}
              ry={LENS.ry - RIM.inner}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          </g>

          {/* 4. Specular glints. Rotation lives on each <ellipse>, never on
              the animated <g>. */}
          <g className="lens-glint" data-poster="">
            {GLINTS.map((g) => (
              <ellipse
                key={`${g.cx}-${g.cy}`}
                cx={g.cx}
                cy={g.cy}
                rx={g.rx}
                ry={g.ry}
                transform={`rotate(${g.rot} ${g.cx} ${g.cy})`}
                fill={`url(#${idPrefix}-glint)`}
                fillOpacity={g.alpha}
              />
            ))}
          </g>
        </svg>

        {/* 5. WebGL — above the poster, below the chips. Additive. */}
        <HeroField />
      </div>

      {/* 6. Glass chips — the leading parallax plane. Three nested transforms,
          one per concern, so none can clobber another: outer = scroll parallax
          (.scrub-drift), middle = the idle float (.chip-float), inner = the ≤3°
          pointer tilt ([data-tilt] on the Node). The Node is `.liq liq-1` and
          must NOT carry .liq-live: it owns transform on its element and is
          exclusive with [data-tilt]. Positions are the CHIPS centres, offset by
          half the disc, so the centre sits on the viewBox point at any size. */}
      {CHIPS.map((c) => {
        const m = CHIP_META[c.id];
        return (
          <div
            key={c.id}
            className="scrub-drift absolute"
            style={
              {
                left: `calc(${pct(c.cx, VIEW.w)} - ${CHIP_SIZE / 2}px)`,
                top: `calc(${pct(c.cy, VIEW.h)} - ${CHIP_SIZE / 2}px)`,
                "--drift-range": m.drift,
              } as CSSProperties
            }
          >
            <div
              className="chip-float"
              style={{ "--float-delay": m.delay } as CSSProperties}
            >
              <Node
                size={CHIP_SIZE}
                tilt
                label={m.label}
                className="liq-refract text-ink-inv"
                icon={<Icon name={m.icon} size={22} />}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
