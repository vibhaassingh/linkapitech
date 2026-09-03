import type { CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Node } from "@/components/motifs";
import { HeroField } from "@/components/three/HeroField";
import {
  BLOBS,
  CAUSTICS,
  CHIPS,
  GLINTS,
  LENS,
  VIEW,
} from "@/components/three/scene/lensLayout";

/**
 * Hero visual — the lens (REDESIGN-V4 Part E §1, "the no-WebGL composition
 * stands alone"). Replaces the concentric-arc composition retired in Phase 4.
 *
 * Server-rendered SVG + DOM: crisp at any density, costs no JS, and paints with
 * the hero so it can never push the LCP. Every number comes from
 * scene/lensLayout.ts — the single source of truth the Phase 5 shader shares —
 * so the poster and the live liquid register exactly: the blobs are drawn at
 * their `uFlow = 0` rest pose, which is the pose the scene boots in.
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
 * `data-poster` marks what the live scene replaces: Phase 5's HeroField sets
 * data-live="true" on .hero-lens and globals.css fades those groups out.
 * Without WebGL (phones, reduced motion, no context) data-live never flips and
 * the poster IS the hero. Chips are not posters.
 *
 * Parallax: two planes via `.scrub-drift` (positive range LEADS the scroll,
 * negative TRAILS — see the scrubDrift keyframes). The poster plate and the
 * canvas share ONE `drift-lead` wrapper on purpose: createHeroField maps its
 * camera 1:1 onto this 500×400 viewBox, so drifting the two separately would
 * unstick the canvas from the SVG it registers with. The chips lead at
 * +16…20px in their own wrappers.
 *
 * The animated <g> elements carry NO SVG `transform` attribute: beside a CSS
 * transform animation it de-composites the group in Chromium (Part J). The
 * glints' rotation therefore sits on the inner <ellipse> elements.
 */

/** Chip disc diameter, px. CHIPS[] gives the centres; the wrapper is offset
 *  by half of this so the centre lands on the viewBox point at any size. */
const CHIP = 52;

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

/** Rim geometry (viewBox units): annulus width, and the inner hairline's inset. */
const RIM_W = 16;
const RIM_INNER = 9;

const r2 = (n: number) => Math.round(n * 100) / 100;
const pct = (v: number, of: number) => `${r2((v / of) * 100)}%`;

/** An ellipse as path data — two half-arcs — so the rim annulus can be one
 *  evenodd path (outer + inner). Both sub-paths run the same direction; the
 *  fill rule, not the winding, makes the hole. */
const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${r2(cx - rx)} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

/* Gradient stops take their colour from the CSS tokens (`stop-color` accepts
   var()), so the palette stays single-sourced with globals.css. They go
   through `style` rather than the presentation attribute so a var() is
   guaranteed to resolve; fills/strokes use the attribute form the motif kit
   already relies on (Meniscus, ConduitPath). */
const stop = (color: string, opacity?: number): CSSProperties =>
  opacity === undefined
    ? { stopColor: color }
    : { stopColor: color, stopOpacity: opacity };

export function HeroLens() {
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
            <radialGradient id="hl-caustic">
              <stop offset="0" style={stop("var(--violet-500)", 1)} />
              <stop offset="1" style={stop("var(--violet-500)", 0)} />
            </radialGradient>
            <linearGradient id="hl-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={stop("var(--violet-600)")} />
              <stop offset="0.55" style={stop("var(--violet-500)")} />
              <stop offset="1" style={stop("var(--plum-700)")} />
            </linearGradient>
            <radialGradient id="hl-blob">
              <stop offset="0" style={stop("var(--violet-500)", 0.92)} />
              <stop offset="0.6" style={stop("var(--violet-600)", 0.5)} />
              <stop offset="1" style={stop("var(--violet-600)", 0)} />
            </radialGradient>
            {/* white key upper-right → faint lower-left, matching --grad-hero's bloom */}
            <linearGradient id="hl-rim" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.10" />
            </linearGradient>
            <radialGradient id="hl-glint">
              <stop offset="0" style={stop("var(--ink-inv)", 1)} />
              <stop offset="0.35" style={stop("var(--lavender-400)", 0.85)} />
              <stop offset="1" style={stop("var(--lavender-400)", 0)} />
            </radialGradient>
            <clipPath id="hl-clip">
              <ellipse cx={LENS.cx} cy={LENS.cy} rx={LENS.rx} ry={LENS.ry} />
            </clipPath>
          </defs>

          {/* 1. Caustic pools the lens throws on the plum. The <g> rocks ±2°
              about the lens centre (CSS, transform-box: view-box). */}
          <g className="lens-caustic" data-poster="">
            {CAUSTICS.map((c) => (
              <ellipse
                key={`${c.cx}-${c.cy}`}
                cx={c.cx}
                cy={c.cy}
                rx={c.rx}
                ry={c.ry}
                fill="url(#hl-caustic)"
                fillOpacity={c.alpha}
              />
            ))}
          </g>

          {/* 2. Lens body, then the five metaballs at rest, clipped to it. */}
          <g data-poster="">
            <ellipse
              cx={LENS.cx}
              cy={LENS.cy}
              rx={LENS.rx}
              ry={LENS.ry}
              fill="url(#hl-body)"
              opacity={0.28}
            />
            <g clipPath="url(#hl-clip)">
              {BLOBS.map((b, i) => (
                <circle
                  key={i}
                  cx={r2(b.restX)}
                  cy={r2(b.restY)}
                  r={r2(b.r * 1.15)}
                  fill="url(#hl-blob)"
                />
              ))}
            </g>
          </g>

          {/* 3. Thick refractive rim: a dark annulus, the lit outer edge, and
              an inner hairline where the glass thins. */}
          <g data-poster="">
            <path
              d={`${ellipsePath(LENS.cx, LENS.cy, LENS.rx, LENS.ry)} ${ellipsePath(
                LENS.cx,
                LENS.cy,
                LENS.rx - RIM_W,
                LENS.ry - RIM_W,
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
              stroke="url(#hl-rim)"
              strokeWidth={1.4}
            />
            <ellipse
              cx={LENS.cx}
              cy={LENS.cy}
              rx={LENS.rx - RIM_INNER}
              ry={LENS.ry - RIM_INNER}
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
                fill="url(#hl-glint)"
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
                left: `calc(${pct(c.cx, VIEW.w)} - ${CHIP / 2}px)`,
                top: `calc(${pct(c.cy, VIEW.h)} - ${CHIP / 2}px)`,
                "--drift-range": m.drift,
              } as CSSProperties
            }
          >
            <div
              className="chip-float"
              style={{ "--float-delay": m.delay } as CSSProperties}
            >
              <Node
                size={CHIP}
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
