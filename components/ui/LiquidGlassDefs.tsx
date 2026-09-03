/**
 * LiquidGlassDefs — the SVG refraction filter for the `.liq` material
 * (REDESIGN-V4 §A1–A2, layer L0).
 *
 * WHAT IT DOES
 *   `#liq-refract` is a displacement map. Its lens map is exactly neutral
 *   (R=G=128 → zero offset) across the inner 86% of the element, and only in
 *   the outer rim does it ramp outward along the radial direction. Fed to
 *   feDisplacementMap it therefore leaves the body of the backdrop untouched
 *   and samples the backdrop *outward* at the edge — which reads as the
 *   thick-glass edge lensing of Apple-grade liquid glass. `scale="14"` is the
 *   maximum offset in px; the map's 96/128 amplitude puts the real rim shift
 *   at ~10px.
 *
 * HOW IT IS CONSUMED — and how it must NOT be
 *   Only ever via `backdrop-filter: url(#liq-refract)` on `.liq-refract`.
 *   NEVER via `filter: url(...)`: a `filter` on an element makes it a
 *   backdrop root in Chromium, which kills `backdrop-filter` on every
 *   descendant (the hero already lost its glass chips to exactly this — see
 *   globals.css, the heroRecede note at L835–840). `backdrop-filter` refracts
 *   the backdrop, never the element's own content, so text stays crisp.
 *
 *   Call sites gate it behind
 *     @supports (backdrop-filter: url(#x)) and (min-width: 1024px)
 *   — Chromium-only, desktop-only, static (never animated), ≤ 4 elements
 *   (the pill nav + 3 hero chips). Phase 2 owns the `.liq-refract` rule.
 *
 * WHY A SERVER COMPONENT
 *   It is pure static markup with no state, listeners or effects, so it ships
 *   zero client JS. It renders a 0×0 absolutely-positioned <svg>; filter defs
 *   are reached by id, so their position in the DOM is irrelevant, but the
 *   element must NOT be `display: none` (Firefox drops filter references
 *   inside display:none subtrees) — hence the zero-size-but-rendered idiom.
 */

/**
 * LENS_MAP — 128×128 RGB PNG, no alpha, generated ONCE with Pillow and
 * embedded so the filter is self-contained (feImage may not fetch cross-
 * origin, and a data URI keeps it off the network entirely). To regenerate:
 *
 *   N = 128
 *   smoothstep(e0, e1, x): t = clamp((x - e0) / (e1 - e0), 0, 1); t*t*(3 - 2t)
 *   for each pixel (x, y):
 *     u = (x + 0.5) / N - 0.5
 *     v = (y + 0.5) / N - 0.5
 *     r = min(1, sqrt(u² + v²) / 0.5)     # r = 1 at the inscribed circle's edge
 *     t = smoothstep(0.86, 1.0, r)         # neutral in the inner 86%, ramps in the rim
 *     dir = (u, v) / max(r * 0.5, 1e-6)    # unit radial
 *     R = clamp(round(128 + 96 * dir.x * t), 0, 255)
 *     G = clamp(round(128 + 96 * dir.y * t), 0, 255)
 *     B = 128
 *   Image.new("RGB", (N, N)) → img.save(buf, "PNG", optimize=True) → base64.
 *
 * Invariants a regeneration must preserve (checked by the phase-1 verification):
 *   pixel (64, 64)  == (128, 128, 128)   — centre is neutral, zero displacement
 *   pixel (127, 64) has R > 128, G ≈ 128 — right rim displaces along +x only
 * Size: 3850 PNG bytes / 5136 base64 chars.
 */
const LENS_MAP =
  "data:image/png;base64,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";

export function LiquidGlassDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <filter
        id="liq-refract"
        x="0"
        y="0"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feImage href={LENS_MAP} preserveAspectRatio="none" result="map" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale="14"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
