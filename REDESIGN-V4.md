# LinkAPI v4 — "Liquid Glass" Ground-Up Redesign

**Status:** authoritative spec for the V4 build. Supersedes `REDESIGN-V3.md` as the
design direction; V3 remains the source for the *palette*, *type* and *IA* it locked.
Branch: `redesign/liquid-glass-v4`. Ships big-bang after full owner sign-off.

## Context

V3 ("Figma Purple") is live at linkapitech.kerning.ooo and passes the full QA gate
(100/100/100/100 Lighthouse mobile). The owner wants the site rebuilt from the ground up
to **feel like a billion-dollar corporate's site**: Apple-grade **Liquid Glass**
(refraction, specular, depth), with **good animations**, keeping the **colour palette as
the base schema**.

## Locked decisions (owner, 2026-09-03)

| Decision | Choice |
|---|---|
| Stays | Colour tokens (`:root` L12–287 of `globals.css`), Poppins 400–700 + IBM Plex Mono 400, the IA (9 routes, 5 flat nav links, no mega menu), all copy/stats in `content/*.ts`. |
| Redesigned | Layout, surfaces, section composition, motion. Ground-up: recompose, don't reskin. |
| Feel | Apple-grade Liquid Glass — dark, cinematic, refractive, premium restraint over flash. |
| Light/dark | Alternating dark/light sections stay; glass on both (refractive over plum, frosted-white over lavender). |
| Motion budget | "Elevated": refraction/specular via CSS + SVG, scroll-choreographed sections, **one** signature WebGL object (homepage hero). Mobile lean. |
| Concept | **Liquid Infrastructure** — money as liquid moving through glass. Conduits connect ERP ↔ bank Nodes; liquid Pools under stats; Caustic light is the ambient. |
| Homepage | All 13 sections, current order, each rebuilt. **StatBand goes dark.** |
| Ship | Big-bang after sign-off; Vercel previews for review; `main` stays live until then. |
| Still in force | Lighthouse mobile ≥ 90/95/95/95 (live domain); reduced-motion everywhere; `gate.sh` green after every phase; content-truth (`TODO: client to confirm` + `CONTENT-TODO.md`); sitesucker folders read-only. |

## Constraints encoded in the repo (each cost real debugging time — read before designing)

1. **Composited-only animation** (`globals.css` L783–801). Keyframes and transitions on scrubbed/animated elements may touch **transform / opacity / filter only**. `border-radius` in a keyframe passes CLS and fails Lighthouse's `non-composited-animations` audit; the gate (`scripts/qa/gate.sh` L133–182) requires **0** disallowed across `/ /services /connected-banking /contact /banks/axis`. Allowlist: `ALLOWED_ANIM` (L149).
2. **`filter` on an ancestor is a backdrop root** (L835–840) and kills every descendant's `backdrop-filter` in Chromium. Never put `filter` above glass.
3. **The contrast walk composites the brightest stop** of every `background-image` layer of every ancestor as if text sat on it (`scripts/qa/qa.mjs` L69–107), and scores a `fixed` header over `--canvas` (it climbs header → body → html). `--ink-inv-2` (#cebcd4) is calibrated against tier-2 glass + wet edge over plum-700 = **4.52:1** (L43–54). **Any further white in an element's own background layers breaks AA** (+0.02 → 4.29). The walk is blind to pseudo-elements, `box-shadow`, `mask`, `backdrop-filter` and sibling overlays — so highlights must live there **and** be geometrically text-free (honest, not a loophole).
4. **Tailwind opacity modifiers do nothing on `var()` colours** (`tailwind.config.ts` L3–7). Every translucent needs an explicit `:root` token (+ config entry if used as a utility).
5. **Pseudo-element budget:** `.section-dark` owns `::after` (grain, L541–559); `.ambient-violet` owns `::before`; `.glass` owns `::after` (wet edge); `.sheen` owns `::before`. `.glass-1/2/3` are pseudo-free (edge as a background layer) and set no `position`.
6. **`.chrome-main` stays opaque** (`chrome.css` L117–124) for the sticky-footer curtain. `MobileMenu` keeps its dialog mounted with `hidden`. `.chrome-scrim` is the only animated backdrop-filter.
7. **Reduced motion:** global kill-switch (`globals.css` L1397–1493) incl. `animation-timeline: auto !important` and a by-name `animation: none` list (L1440–1453); every client primitive re-checks `matchMedia` at effect entry.
8. **Scroll mechanisms:** (a) CSS `animation-timeline: view()` inside `@supports` (L803–949) — primary; (b) `scroll(root block)` for the header ramp (`chrome.css` L58–72); (c) JS-written `--sp` (`useSectionProgress.ts`, one shared rAF) and `--scroll-velocity` (`velocity.ts`). **`--sp-live` fail-open alias** (`ProcessRail.tsx` L63–101): content reveals read `var(--sp-live, 1)` so "no driver" = "finished"; decorative flow reads `--sp` directly so "no driver" = hidden.
9. **Responsive grids need a base `grid-cols-1`**; `[data-reveal=left/right]` only ≥1024; `RevealGroup` emits its own `<li>` — pass plain children.
10. **`pixdiff.py` exits 2 on any redesign** — run `gate.sh --skip-pixdiff` during the build; rebaseline at the end.

---

# Part A — Liquid Glass material system (`.liq`)

Class family **`.liq`** (not `.lg`: collides with Tailwind's `lg:` prefix in JSX and every grep). Tokens **`--liq-*`**.

## A1. Technique

| Option | Verdict |
|---|---|
| `backdrop-filter` + layered gradients + masked rim ring (pure CSS) | **Base recipe for all glass.** Composited, static, both tones, honest to the walk, degrades to the existing dense-fill fallback. |
| SVG `feDisplacementMap` via `filter: url()` on the element | **Rejected.** Jellies the content, creates a backdrop root (constraint 2), software-rasterised, de-composites the element. |
| SVG displacement via `backdrop-filter: url(#liq-refract)` | **Accepted as a Chromium-only, desktop-only, static, opt-in enhancement on ≤ 4 elements** (pill + 3 hero chips). Refracts the *backdrop*, never the content; `filter:` is not involved. Gated `@supports (backdrop-filter: url(#x))` + `(min-width: 1024px)`. Never animated. |
| WebGL glass shader | Hero object only (Part E). |

## A2. Layer stack (bottom → top)

| # | Layer | Mechanism | Animates |
|---|---|---|---|
| L0 | Frost | `backdrop-filter: blur(var(--_blur)) saturate(var(--_sat))` [+ `url(#liq-refract)` on `.liq-refract`] | never |
| L1 | Fill | `background-color: var(--_fill)` — **aliases of the calibrated `--glass-1/2/3-bg`**; do not fork the numbers | never |
| L2 | Wet edge + depth | `background-image: var(--_edge), var(--_depth)`: existing 170° white edge + a bottom-up plum darkening (dark stops only *raise* light-text contrast) | never |
| L3 | Bevel + elevation | `box-shadow`: 1px white inset top, plum inset bottom, contact + ambient outer | never |
| L4 | Rim ring | `::before`, `padding: var(--liq-rim-w)`, `mask-composite: exclude` ring, conic white→lavender→violet→white ("chromatic rim"); on `.liq-lens` ≥1024 the ring adds `backdrop-filter: brightness(1.18) saturate(1.6)` (edge lensing) | never |
| L5 | Specular | `::after`: pointer radial at `--cx/--cy` masked to the padding frame (`.liq-spec`) or unmasked (`.liq-spec-full`), **or** a scroll-driven sweep band (`.liq-sweep`) | **opacity** / **transform** only |
| L6 | Liquid interaction | element `transform` on `--spring-snappy` (lift −2px, scale 1.012, press .985) + existing `[data-tilt]` | transform only |

No flat `border` (the ring is the border). `border-radius` never animates. `isolation: isolate` on `.liq` lets `::before/::after` sit at `z-index:-1` above the fill and below content (children no longer need `relative z-[1]`). `position: relative` is declared only in `@layer components` so a Tailwind `absolute` on the call site still wins.

## A3. Tokens (add to `:root` after `globals.css` L179)

```css
/* ---- Liquid glass (liq) — layers on top of the locked --glass-* tiers ---- */
/* fills/blur are ALIASES of the calibrated tiers; do not fork the numbers */
--liq-1-fill: var(--glass-1-bg);   --liq-1-blur: var(--glass-1-blur);
--liq-2-fill: var(--glass-2-bg);   --liq-2-blur: var(--glass-2-blur);
--liq-3-fill: var(--glass-3-bg);   --liq-3-blur: var(--glass-3-blur);
--liq-edge: var(--glass-edge);
/* bottom-up plum depth: dark stops only, so it can never lower light-ink contrast */
--liq-depth: linear-gradient(0deg, rgba(26, 6, 32, 0.22), transparent 42%);
/* chromatic rim: white key at top-left, lavender fill, violet at the shadow side */
--liq-rim: conic-gradient(from 215deg,
  rgba(255,255,255,.58), rgba(201,184,216,.30) 20%, rgba(255,255,255,.07) 46%,
  rgba(142,36,170,.34) 64%, rgba(255,255,255,.40) 84%, rgba(255,255,255,.58));
--liq-rim-w: 1.25px;
--liq-shadow: inset 0 1px 0 rgba(255,255,255,.14),
  inset 0 -14px 28px -18px rgba(26,6,32,.55),
  0 1px 2px rgba(26,6,32,.28), 0 18px 44px -20px rgba(26,6,32,.55);
/* specular. --liq-spec is masked to the padding frame (text-free); --liq-spec-soft is
   the only alpha allowed under text, and only under --ink-inv (5.65:1 worst) */
--liq-spec: rgba(255,255,255,.22);
--liq-spec-soft: rgba(255,255,255,.10);
--liq-sweep: linear-gradient(100deg, transparent, rgba(255,255,255,.10) 45%,
  rgba(255,255,255,.18) 50%, rgba(255,255,255,.10) 55%, transparent);
--liq-pad: 24px;          /* frame width the specular mask uses; set per element */

/* light variant — frosted white over lavender */
--liq-light-1-fill: rgba(255,255,255,.55);
--liq-light-2-fill: rgba(255,255,255,.70);
--liq-light-3-fill: rgba(255,255,255,.82);
--liq-light-edge: linear-gradient(170deg, rgba(255,255,255,.95), transparent 28%);
--liq-light-rim: conic-gradient(from 215deg,
  rgba(255,255,255,.95), rgba(98,33,111,.14) 22%, rgba(255,255,255,.55) 46%,
  rgba(142,36,170,.20) 64%, rgba(255,255,255,.85) 84%, rgba(255,255,255,.95));
--liq-light-shadow: inset 0 1px 0 rgba(255,255,255,.95),
  inset 0 -1px 0 rgba(98,33,111,.08),
  0 1px 2px rgba(37,13,41,.06), 0 16px 40px -18px rgba(37,13,41,.22);
--liq-light-spec: rgba(142,36,170,.10);   /* violet — white is invisible on white */

/* pill nav */
--liq-pill-light: rgba(255,255,255,.78);
--liq-pill-dark: rgba(37,13,41,.78);
--liq-pill-blur: 22px;

/* liquid interaction */
--liq-lift: -2px; --liq-hover-scale: 1.012; --liq-press-scale: .985;

/* parallax amplitude scale (Part D) */
--drift-scale: 1;
```

Tailwind `colors.liq`: `"light-1"`, `"light-2"`, `"light-3"`, `"pill-light"`, `"pill-dark"` → the matching vars. Dark tier fills are **not** exposed as utilities — the classes carry them.

## A4. Class API — always `.liq` base + modifiers

| Class | Role |
|---|---|
| `.liq` | base = tier 2, dark context; reads private `--_fill/--_blur/--_sat/--_edge/--_depth/--_rim/--_shadow/--_spec` |
| `.liq-1` / `.liq-3` | tier modifiers (re-assign fill/blur/sat only) |
| `.liq-light` | frosted-white variant (re-assigns all private vars); combines with `.liq-1/-3` |
| `.liq-inset` | nested chip **inside** a glass card: veil fill, **no backdrop-filter** (halves blur count) |
| `.liq-spec` | pointer specular masked to the `--liq-pad` frame — any ink allowed |
| `.liq-spec-full` | pointer specular unmasked — **`--ink-inv` text only** |
| `.liq-sweep` | scroll-driven specular band (`view()`), ≥1024, exclusive with the two above, `--ink-inv` surfaces only |
| `.liq-lens` | rim ring gets its own backdrop-filter — tier 3 / hero only, ≥1024 |
| `.liq-refract` | adds `url(#liq-refract)` — Chromium ≥1024, ≤ 4 elements |
| `.liq-live` | hover lift / press spring (transform only) |
| `.liq-enter` | entry depth `scale(.96)→1` + `opacity .6→1` over `view()` entry 0–45% |
| `.liq-static-sm` | no backdrop-filter below 1024 (blur-budget escape hatch) |
| `.glass`, `.glass-1/2/3`, `.glass-strong` | kept through the migration, then reduced to aliases of `.liq*` (`contract.py` L33 lists glass-1/2/3) |

## A5. Recipe (new block in `globals.css` after L695)

```css
/* Only `position` lives in the components layer, so a Tailwind `absolute` on the
   call site still wins (why .glass-1/2/3 set no position — L596–598). */
@layer components { .liq { position: relative; } }

.liq {
  --_fill: var(--liq-2-fill); --_blur: var(--liq-2-blur); --_sat: 1.4;
  --_edge: var(--liq-edge);   --_depth: var(--liq-depth);
  --_rim: var(--liq-rim);     --_shadow: var(--liq-shadow); --_spec: var(--liq-spec);
  isolation: isolate;
  background-color: var(--_fill);
  background-image: var(--_edge), var(--_depth);
  box-shadow: var(--_shadow);
  backdrop-filter: blur(var(--_blur)) saturate(var(--_sat));
  -webkit-backdrop-filter: blur(var(--_blur)) saturate(var(--_sat));
  transition: transform var(--dur-spring-snappy) var(--spring-snappy),
              box-shadow var(--dur-ui) var(--ease-out-expo);
}
.liq-1 { --_fill: var(--liq-1-fill); --_blur: var(--liq-1-blur); --_sat: 1.25; --liq-rim-w: 1px; }
.liq-3 { --_fill: var(--liq-3-fill); --_blur: var(--liq-3-blur); --_sat: 1.5; }

/* L4 — rim ring. Masked to a --liq-rim-w band, so it is text-free by construction. */
.liq::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  border-radius: inherit; pointer-events: none;
  padding: var(--liq-rim-w);
  background: var(--_rim);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
@media (min-width: 1024px) {
  .liq-lens::before {
    backdrop-filter: brightness(1.18) saturate(1.6);
    -webkit-backdrop-filter: brightness(1.18) saturate(1.6);
  }
}

/* L5a — pointer specular, confined to the padding frame (4 feathered edge masks,
   unioned by the default mask-composite: add). Opacity is the ONLY animated property.
   --cx/--cy come from CursorGlow (its .closest() selector gains .liq-spec). */
.liq-spec::after, .liq-spec-full::after {
  content: ""; position: absolute; inset: 0; z-index: -1;
  border-radius: inherit; pointer-events: none; opacity: 0;
  background: radial-gradient(240px circle at var(--cx, 30%) var(--cy, 20%),
              var(--_spec), transparent 62%);
  transition: opacity 420ms var(--ease-out-expo);
}
.liq-spec::after {
  --_f: calc(var(--liq-pad) + 18px);
  -webkit-mask:
    linear-gradient(to bottom, #000 var(--liq-pad), transparent var(--_f)),
    linear-gradient(to top,    #000 var(--liq-pad), transparent var(--_f)),
    linear-gradient(to right,  #000 var(--liq-pad), transparent var(--_f)),
    linear-gradient(to left,   #000 var(--liq-pad), transparent var(--_f));
  mask: /* same four */;
}
.liq-spec-full::after { --_spec: var(--liq-spec-soft); }
.liq-spec:hover::after, .liq-spec:focus-within::after,
.liq-spec-full:hover::after, .liq-spec-full:focus-within::after { opacity: 1; }

/* L6 — liquid interaction, transform only */
.liq-live:hover  { transform: translateY(var(--liq-lift)) scale(var(--liq-hover-scale)); }
.liq-live:active { transform: scale(var(--liq-press-scale)); }

/* nested chips inside glass: no second blur layer */
.liq-inset { background: var(--veil-2); box-shadow: inset 0 1px 0 rgba(255,255,255,.12); }

/* light variant */
.liq-light {
  --_fill: var(--liq-light-2-fill); --_blur: 20px; --_sat: 1.15;   /* 1.4 pinks the lavender */
  --_edge: var(--liq-light-edge); --_depth: none;
  --_rim: var(--liq-light-rim); --_shadow: var(--liq-light-shadow);
  --_spec: var(--liq-light-spec);
}
.liq-light.liq-1 { --_fill: var(--liq-light-1-fill); --_blur: 12px; }
.liq-light.liq-3 { --_fill: var(--liq-light-3-fill); --_blur: 28px; }

/* Chromium-only refraction. `filter:` is never involved, so no backdrop root is created. */
@supports (backdrop-filter: url(#x)) {
  @media (min-width: 1024px) {
    .liq-refract { backdrop-filter: blur(var(--_blur)) saturate(var(--_sat)) url(#liq-refract);
                   -webkit-backdrop-filter: blur(var(--_blur)) saturate(var(--_sat)) url(#liq-refract); }
  }
}

@supports not (backdrop-filter: blur(1px)) {
  .liq { background-color: rgba(66, 23, 76, 0.72); }
  .liq-light { background-color: rgba(255,255,255,.94); }
}

/* mobile downgrade + coarse pointers */
@media (max-width: 1023px) {
  .liq.liq-1 { backdrop-filter: none; -webkit-backdrop-filter: none; }   /* too small for blur to read */
  .liq-static-sm { backdrop-filter: none; -webkit-backdrop-filter: none; }
  .liq::before { backdrop-filter: none; -webkit-backdrop-filter: none; }
  .liq-3 { --_blur: 18px; }
  :root { --drift-scale: .5; }
}
@media (max-width: 1023px), (any-pointer: coarse) {
  .liq-spec::after, .liq-spec-full::after, .liq-sweep::after { display: none; }
}
```

**SVG filter definition** — server component `components/ui/LiquidGlassDefs.tsx`, mounted in `app/layout.tsx` beside `<CursorGlow>`:

```tsx
/* lens map: neutral grey (128,128) in the body, x/y ramps only in the outer ~14%,
   so displacement — i.e. refraction — happens at the rim and nowhere else. */
<svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
  <filter id="liq-refract" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feImage href={LENS_MAP_DATA_URI} preserveAspectRatio="none" result="map" />
    <feDisplacementMap in="SourceGraphic" in2="map" scale="14" xChannelSelector="R" yChannelSelector="G" />
  </filter>
</svg>
```
Before any call site: **verify Safari and Firefox evaluate `@supports (backdrop-filter: url(#x))` as false.** If Safari parses-but-doesn't-render, gate `.liq-refract` behind a Chromium probe that sets `html[data-refract]`.

**Pointer wiring:** `components/motion/CursorGlow.tsx` L53 `target.closest(".spotlight")` → `.closest(".spotlight,.liq-spec,.liq-spec-full")`. Nothing else changes (one rAF, rect cache, scroll invalidation, coarse/RM gating all carry over).

## A6. AA text matrix (from the walk's arithmetic — no recalibration of `--ink-inv-2`, no new ink token)

| Dark surface | `--ink-inv` | `--ink-inv-2` | `--ink-inv-3` |
|---|---|---|---|
| `.liq` / `.liq-1` over any plum band | ✓ 7.4+ | ✓ (4.52 worst, band A) | ✗ never on glass |
| `.liq-3` over band A (plum-700) | ✓ 6.6 | **✗ 4.04** → tier 3 hosts `--ink-inv` only | ✗ |
| `.liq-3` over bands B/C, hero | ✓ | ✓ 4.6–5.5 | ✗ |
| `.liq-spec-full` hovered / `.liq-sweep` | ✓ (5.65 worst) | ✗ | ✗ |
| Text overlapping a **Pool** | `--ink-inv` only | ✗ | ✗ |

| Light surface | `--ink` | `--ink-2` | `--ink-3` | `--violet-text` |
|---|---|---|---|---|
| `.liq-light.liq-1` (.55) | ✓ 12.96 | ✓ 7.14 | **✗ 4.17** | ✓ 7.20 |
| `.liq-light` (.70) | ✓ 14.18 | ✓ 7.82 | ✓ 4.56 | ✓ 7.88 |
| `.liq-light.liq-3` (.82) | ✓ | ✓ | ✓ | ✓ |
| Text overlapping a **Pool-light** | `--ink` only | — | — | — |

`.spotlight` stays for non-glass light cards; never share an element with `.liq-light.liq-spec` (both want `::after`/`::before`).

**Enforced by a new `qa.mjs` rule:** flag `--ink-inv-2`/`-3` inside `.liq-3`; `--ink-inv-3` inside any `.liq`; `--ink-3` inside `.liq-light.liq-1`; non-`--ink-inv` text inside `.liq-spec-full` / `.liq-sweep`.

## A7. Blur budget

**≤ 8 backdrop-filtered layers per desktop viewport, ≤ 4 on phones; nested glass never blurs.** `.liq-1` has no blur <1024; `.liq-lens` counts as an extra layer (tier 3 / hero only). Challenges goes 12 → 6 by making icon tiles `.liq-inset`. StatBand tiles carry `liq-static-sm` (4 tiles + pill would exceed 4 on a phone). Ledger is opaque on mobile. Caustics are gradients, not blur.

`will-change`: none on the material (hover transitions promote for their own duration). `contain: paint` only on `.liq-sweep` and `.pin-stage`.

---

# Part B — Adaptive glass pill nav

**Two-state glass driven by one IntersectionObserver.** Rejected: constant tint (white ≥ .72 needed for AA over plum-950 reads as a milky bar over the hero); `mix-blend-mode: difference` (off-brand inversions, backdrop root, unscoreable).

**The finding:** the walk scores a `fixed` header over `--canvas`. So the dark state must pass AA scored-over-white *and* real-over-plum. Plum-900 at **.78**: `--ink-inv-2` 5.2 scored / 10+ real. (.72 → 4.2, fails.) Light white **.78**: `--ink-2` 9.17 over canvas, 5.63 over plum during the crossfade.

- **Element:** `background-color` = state fill; `backdrop-filter: blur(22px) saturate(1.5)` [+ `.liq-refract`]; `transition: background-color, color var(--dur-menu)` — paint-only, fires on scroll crossings only (outside any Lighthouse trace, like the existing `transition-colors`). Radius 16 → **22px**. `SiteHeader.tsx` L165 drops `bg-surface`; links/CTA get `chrome-nav-link` / `chrome-cta` hooks so state rules override without `!important`.
- **`::before`** = rim ring (same mask recipe; light/dark rim token by state). **`::after`** = the existing `scroll(root block)` elevation ramp (`chrome.css` L58–72) — **unchanged**; a Seam hairline appears when stuck (opacity on a child span, same ramp).
- **Text:** light = `--ink-2` / active `--violet-text`; dark = **`--ink-inv-2` links / `--ink-inv` active**; thumb → `--lavender-400`. CTA: light `bg-plum-600 text-ink-inv`; dark `bg-surface text-plum-700`. Logo/burger are `currentColor` (`Logo.tsx` L5).
- **Active marker:** 2px underline → **6px Droplet dot, translate only** (`--thumb-x + --thumb-w/2`, no `scaleX` — glass must never distort). The tri-state `publish()` + `data-animate` first-placement rule (`SiteHeader.tsx` L78–89, `chrome.css` §2) is unchanged.
- **No-JS / pre-hydration baseline:** `Hero.tsx` L22 gains `data-surface="dark" data-hero="dark"`; `PageHero.tsx` L71 gains `data-hero={tone}`:

```css
.chrome-pill {
  background-color: var(--liq-pill-light); color: var(--ink-2);
  backdrop-filter: blur(var(--liq-pill-blur)) saturate(1.5);
  -webkit-backdrop-filter: blur(var(--liq-pill-blur)) saturate(1.5);
  transition: background-color var(--dur-menu) var(--ease-out-expo), color var(--dur-menu) var(--ease-out-expo);
}
.chrome-pill::before { /* rim ring, identical mask recipe to .liq::before */
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
  padding: var(--liq-rim-w); background: var(--liq-light-rim); pointer-events: none;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
}
.chrome-header:has(~ main [data-hero="dark"]) .chrome-pill:not([data-over]),
.chrome-pill[data-over="dark"] { background-color: var(--liq-pill-dark); color: var(--ink-inv-2); }
.chrome-pill[data-over="dark"]::before { background: var(--liq-rim); }
.chrome-pill[data-over="dark"] .chrome-nav-link[aria-current="page"] { color: var(--ink-inv); }
.chrome-pill[data-over="dark"] .nav-thumb { background: var(--lavender-400); }
.chrome-pill[data-over="dark"] .chrome-cta { background: var(--surface); color: var(--plum-700); }
@supports not (backdrop-filter: blur(1px)) {
  .chrome-pill { background-color: rgba(255,255,255,.96); }
  .chrome-pill[data-over="dark"] { background-color: var(--plum-900); }
}
```

- **Observer** (one new effect in `SiteHeader.tsx`, keyed on `pathname`). Root box = a 1px band at the pill's vertical centre; observes `main .section-dark, main [data-surface="dark"]`; a `Set` of intersecting sections drives `data-over`. Zero per-frame work. **Runs under reduced motion too** (it's a contrast feature; the transitions collapse to 0.001ms). Nested dark surfaces (connected-banking's architecture card) correctly flip it.

```ts
useEffect(() => {
  const pill = pillRef.current; if (!pill) return;
  let io: IntersectionObserver | null = null;
  const under = new Set<Element>();
  const arm = () => {
    io?.disconnect(); under.clear();
    const y = Math.round(pill.getBoundingClientRect().top + pill.offsetHeight / 2);
    io = new IntersectionObserver((records) => {
      for (const r of records) r.isIntersecting ? under.add(r.target) : under.delete(r.target);
      pill.dataset.over = under.size ? "dark" : "light";
    }, { rootMargin: `-${y}px 0px -${window.innerHeight - y - 1}px 0px`, threshold: 0 });
    document.querySelectorAll('main .section-dark, main [data-surface="dark"]').forEach((el) => io!.observe(el));
  };
  arm();
  let raf = 0;
  const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(arm); };
  window.addEventListener("resize", onResize);
  return () => { io?.disconnect(); window.removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
}, [pathname]);
```

- **MobileMenu:** sheet stays opaque `bg-canvas` (a frosted sheet over the already-blurring scrim = two full-viewport blurs on the device class that can't afford it); gains the light rim ring + shadow only. Dialog stays mounted with `hidden`; scrim unchanged.

---

# Part C — Visual vocabulary: 9 motifs (`components/motifs/`)

`components/motifs/motifs.css` is imported in `app/layout.tsx` right after `chrome.css` (same convention: after Tailwind, after the design system, no `!important`). Components are server components in `components/motifs/*.tsx`. **Every motif is a real element** — never a pseudo on the section. Animated properties: transform/opacity only (one paint-only exception, allowlisted).

| Motif | What | Construction | Animates | Where | Mobile / reduced motion |
|---|---|---|---|---|---|
| **Conduit** | Glass channel with a violet highlight flowing through — the pipe money travels | 6px track (`--glass-1-bg` fill, inset 1px `--glass-1-line`, 1px top wet line) containing `.conduit-flow`, a 38%-long band `transparent → lavender-400 → violet-500 → transparent`. SVG variant for curves: `pathLength="100"` path + a `stroke-dasharray="8 92"` pulse path | DOM: band `translateX/Y` from `--sp` (scroll) or 7s loop ≥1024. SVG: `stroke-dashoffset` → **`conduitPulse` joins `ecoWire` in `ALLOWED_ANIM`** (paint-only, same reasoning) | ProcessRail spine, WhatWeDo manifold, WhyUs spine, ErpBand underline, Ecosystem connectors, connected-banking architecture, OfferTimeline rail, banks/[slug] stack | Mobile: scroll-driven only. RM: `--sp` never written → band parked at −100% (invisible); pulse `display:none` |
| **Node** | Glass disc with inner violet glow — an endpoint (ERP, bank, LinkAPI, a step) | standalone: `.liq liq-1 rounded-pill` 44–56px; **inside a glass card: `.liq-inset`**; child `.node-glow` radial `--violet-glow → transparent`; `data-lit` raises glow to 1 | glow `opacity`, entry `scale(.92→1)` on `--spring-gentle`, `[data-tilt]` | Hero chips, icon tiles on dark (replaces `grad-tile`), ProcessRail steps, Ecosystem chip dots, diagrams | Mobile: no tilt, glow static. RM: static, lit |
| **Pool** | Violet liquid pooling at the base of a tile — value accumulating under a number | absolute bottom 46%: `radial-gradient(70% 90% at 50% 100%, var(--violet-a24), transparent 72%)`; `::before` 1px lavender meniscus line at its top. `.pool-light` = `--violet-soft`. **Text overlapping a Pool is `--ink-inv` (dark) / `--ink` (light)** | `scaleY(0→1)` origin bottom + opacity, `--spring-smooth` +120ms after `[data-inview]` | StatBand, About track record, banks aggregate card, CtaBand, Footer | Same everywhere. RM: full, static |
| **Caustic** | Ambient light on the plum — the light liquid throws on the wall | 1–2 absolutely positioned 380–560px divs, `radial-gradient(circle, var(--violet-a24), transparent 70%)`, `z-index:-2` inside the isolated `.section-dark` (grain dithers over). Light: `--violet-soft`. **No `filter`, no feTurbulence** | `.scrub-drift` 14–30px; ≥1024 an additional 40s `translate` loop | Every dark band (max 2), Hero fallback, FAQ wash, Footer | Mobile: 1 blob, scroll drift only. RM: static |
| **Seam** | Glass hairline dividing sections — the rim of the vessel | full-width 1px `--glass-3-line` (dark) / `--line-soft` (light) with a 220px child specular segment | segment `translateX` from `--sp` | Top of every dark band, bottom of Hero, top of Footer, under the stuck pill | static line, no segment |
| **Meniscus** | The curved liquid surface where a dark band ends and a light one begins | SVG `<path preserveAspectRatio="none">` 56–80px, filled with the next section's surface colour + 1.2px lavender stroke. **Static geometry — no path morph. Max 3 uses**: Hero→Marquee, StatBand→ErpBand, dark PageHero→first section. Amplitude ≤ 4% of width | stroke opacity via `--sp` (.3→.6) | as listed | Mobile 32px. RM: identical |
| **Vessel** | The glass container — the card family | dark `.liq liq-3 rounded-xl liq-spec`; light `.liq liq-light rounded-xl`. Specular = the rim ring's white key + `.liq-spec` — **no extra static white arc** (constraint 3) | `[data-tilt]` (hero), `.liq-spec`, `.liq-live` 4px lift | Hero, WhoWeAre, FAQ card, Testimonials, Terminal shell, Contact, Industry mocks | Mobile: no tilt/spec. RM: static |
| **Ledger** | Terminal as a glass code window | `.terminal.ledger` = `rgba(23,27,33,.78)` + `backdrop-filter: blur(18px)` **inside `.section-dark` only**; opaque `--terminal` on light + mobile. **Re-measure `--terminal-cmt` (#8b93a0) on the composite; if < 4.5 stay opaque.** Wet edge kept | existing `--sp-live` typing + caret | ProcessRail, Solutions dev band, Industries NBFC | Mobile: opaque. RM: existing fail-open |
| **Droplet** | The small liquid pill — eyebrows, tags, nav marker | `.liq liq-1 rounded-pill` + a 4px specular dot at the leading edge. Light: `.liq liq-light liq-1` | `.liq-spec` hover only | Eyebrows, LIVE_PILL, nav dot, trust lines | `.liq-1` has no blur <1024 |

**Conduit sketch** (`motifs.css` + `Conduit.tsx`):
```css
.conduit{position:relative;display:block;height:6px;border-radius:999px;overflow:hidden;
  background:var(--glass-1-bg);box-shadow:inset 0 0 0 1px var(--glass-1-line),inset 0 1px 0 rgba(255,255,255,.12)}
.conduit-v{width:6px;height:auto}
.conduit-flow{position:absolute;inset:0;width:38%;border-radius:inherit;opacity:.9;
  background:linear-gradient(90deg,transparent,var(--lavender-400) 45%,var(--violet-500) 60%,transparent)}
.conduit-v .conduit-flow{width:auto;height:38%;
  background:linear-gradient(180deg,transparent,var(--lavender-400) 45%,var(--violet-500) 60%,transparent)}
/* decorative → reads --sp (inherited from the section). Unwritten = parked off-track = invisible. */
.conduit-scroll .conduit-flow{transform:translateX(calc(-100% + var(--sp) * 360%))}
.conduit-v.conduit-scroll .conduit-flow{transform:translateY(calc(-100% + var(--sp) * 360%))}
@media (min-width:1024px){.conduit-loop .conduit-flow{animation:conduitFlow 7s linear infinite}}
@keyframes conduitFlow{from{transform:translateX(-100%)}to{transform:translateX(300%)}}
.conduit-light{background:var(--lavender-200);box-shadow:inset 0 0 0 1px var(--line-soft)}
.conduit-pulse{animation:conduitPulse 6s linear infinite;animation-delay:var(--pulse-delay,0s);opacity:.85}
@keyframes conduitPulse{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
@media (prefers-reduced-motion:reduce){.conduit-pulse{display:none}}
```
```tsx
export function Conduit({ orientation = "h", flow = "scroll", light, className, style }: ConduitProps) {
  return (
    <span aria-hidden="true" style={style}
      className={cn("conduit", orientation === "v" && "conduit-v", `conduit-${flow}`, light && "conduit-light", className)}>
      <span className="conduit-flow" />
    </span>
  );
}
```

**Pool sketch:**
```css
.pool{position:absolute;inset:auto 0 0 0;height:46%;pointer-events:none;border-radius:inherit;
  background:radial-gradient(70% 90% at 50% 100%,var(--violet-a24),transparent 72%);
  transform-origin:50% 100%;transform:scaleY(1)}
.pool::before{content:"";position:absolute;top:0;left:8%;right:8%;height:1px;
  background:linear-gradient(90deg,transparent,rgba(201,184,216,.45),transparent)}
.pool-light{background:radial-gradient(70% 90% at 50% 100%,var(--violet-soft),transparent 72%)}
/* rise with the reveal; resting state is FULL so no-JS / reduced motion show the settled pool */
[data-reveal]:not([data-inview]) .pool{transform:scaleY(0);opacity:0}
[data-inview] .pool{transition:transform var(--dur-spring-smooth) var(--spring-smooth) 120ms,opacity 400ms var(--ease-out-expo) 120ms}
```

**Shared `components/motifs/Card.tsx`** replaces the per-page `CARD_LIFT` strings (`about/page.tsx` L31, `solutions/page.tsx` L22, `banks/[slug]/page.tsx` L25). Dark: `.liq rounded-lg p-7 md:p-8` + `.liq-inset` Node icon, title `--ink-inv`, body `--ink-inv-2`; feature `.liq-3` — **all text `--ink-inv`**. Light: `.liq liq-light rounded-lg p-7 md:p-8 border-line-soft`, 44px `--lavender-200` icon disc with `--violet-text` glyph; feature = `bg-tint` + `border-lavender-300` or `grad-fill` with `--ink-on-violet-2` (kept). Hover: `.liq-live` + `.liq-spec` (dark) / `.spotlight` (light); `.icon-draw` kept.

---

# Part D — Scroll choreography upgrades

All within `view()` / `scroll()` / `--sp`. Every new keyframe is transform/opacity only and joins the by-name RM kill list (`globals.css` L1440–1453).

- **(i) Sheet enter.** Keep `.sheet-enter`'s transform (L817–824). Add a child `<span aria-hidden class="sheet-shadow">` — 1px top-edge highlight + 40px upward shadow gradient — whose **opacity** fades 1→0 over `cover 0% cover 22%` (`@keyframes sheetShadow`). All viewports.
- **(ii) Drift tiers.** `.drift-far { --drift-range: 7px } .drift-mid { 14px } .drift-near { 22px } .drift-lead { -22px }`; `scrubDrift` (L859–866) multiplies by `var(--drift-scale)` (.5 <1024). All viewports.
- **(iii) Pinned story** — compositor-only via a **named view timeline** (`view()` on a sticky child stalls; the tall wrapper owns the timeline):
```css
@supports (animation-timeline: view()) { @media (min-width: 1024px) {
  .pin { view-timeline-name: --pin; view-timeline-axis: block; min-height: 300vh; }
  .pin-stage { position: sticky; top: 0; height: 100vh; contain: paint; }
  .pin-step { animation: pinStep linear both; animation-timeline: --pin; }
  .pin-step:nth-child(1) { animation-range: 0% 34%; }
  .pin-step:nth-child(2) { animation-range: 33% 67%; }
  .pin-step:nth-child(3) { animation-range: 66% 100%; }
  @keyframes pinStep { 0% { opacity: 0; transform: translateY(24px); } 18%, 82% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-24px); } }
}}
@media (prefers-reduced-motion: reduce) {
  .pin-step { animation: none !important; } .pin { min-height: 0 !important; }
  .pin-stage { position: static !important; height: auto !important; }
}
```
  Default markup = stacked blocks, so the fallback is complete with no JS. **One use: ProcessRail** — pin the Ledger terminal on the right while the four stages step on the left; `--sp-live` stays the terminal's driver. (Optional second: connected-banking How-It-Works.) Desktop only — three viewport-heights of pinned content is a UX cost on phones.
- **(iv) `.liq-sweep`** — scroll-driven specular band, same geometry as `.sheen::before` (L661–695; `.sheen` retires where adopted):
```css
@supports (animation-timeline: view()) { @media (min-width: 1024px) {
  .liq-sweep { overflow: hidden; contain: paint; }
  .liq-sweep::after { content: ""; position: absolute; inset: -60% auto -60% -75%; width: 50%; z-index: -1;
    background: var(--liq-sweep); pointer-events: none;
    animation: liqSweep linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }
  @keyframes liqSweep { from { transform: rotate(18deg) translateX(-40%); } to { transform: rotate(18deg) translateX(420%); } }
}}
```
- **(v) `.liq-enter`** — `scale(.96)→1` + `opacity .6→1` over `entry 0% entry 45%`. **Blur-radius ramps rejected** (kills nested glass; most expensive mobile GPU op).

Safety matrix: (i) all · (ii) all, half amplitude <1024 · (iii) ≥1024 · (iv) ≥1024 · (v) all.

---

# Part E — Homepage: 13 sections

Tone rhythm after StatBand goes dark: `D·L·L·D·L·D·L·D·L·D·L·L·D` (breaks the only triple-light run; the Pool needs plum to glow; anchors the midpoint).

| # | Section (`components/sections/home/`) | Tone | Composition | Motifs | Motion | Keep / Replace |
|---|---|---|---|---|---|---|
| 1 | **Hero** `Hero.tsx` + `components/three/HeroLens.tsx` (replaces `HeroOrbit.tsx`) | D | `min-h min(92svh,920px)` on lg, content centred; `lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)]`; lens column bleeds 6% right (`lg:-mr-[6%]`, clipped by section `overflow-hidden`). New `.display-0` beside `.display-1` (L337): `clamp(2.75rem, 1.3rem + 5.2vw, 4.9rem) / 1.04 / -0.03em ≥800px`; `HERO.headline` `max-w-[14ch]`; lead 17px/1.65 `max-w-[54ch]` `--ink-inv-2` on plum flat. `HERO.eyebrow` → Droplet (the " · " separators become 3px dots at render; string untouched). CTAs: `variant="light"` (white pill, `data-magnetic`) + `variant="glass"` re-based on `.liq liq-spec-full liq-live`. **H1 + lead never reveal-gated** (LCP). New `band-hero` class carries `--grad-hero` + grain, retiring the hand-rolled grain div (L47–56). `data-surface="dark" data-hero="dark"` | Vessel (lens), Node ×3 chips (`liq liq-1 liq-refract`, aria-labels only, no new copy), Conduit ×2 short stubs to the ports, Caustic ×2 (fallback backdrop), Seam bottom, Meniscus into Marquee | chips scale in on `--spring-gentle` 200/260/320ms; `.hero-recede`; `.scrub-drift` planes (`drift-lead` on the poster plate, +16…20 on chips); `[data-tilt]` 3° on chips; WebGL (Part F). RM: static, no canvas | Keep `Button`, `Reveal`, `HeroField` harness, `.hero-recede`, drift/float/tilt stack. Replace arcs → lens. Mobile: single column, type first, lens `aspect-[5/4] max-w-[420px]`, no tilt/loops |
| 2 | **LogoMarquee** | L (`--surface`) | as now (`py-10 md:py-12`); trust line → Droplet centred above | Droplet, Seam bottom | existing marquee + `--scroll-velocity` lead (L33, L81) | keep mechanics; RM native-scroll fallback kept |
| 3 | **WhoWeAre** | L (`--canvas`) | 12-col: heading `display-2` cols 1–4, `.liq liq-light` Vessel cols 5–12, `p-10 md:p-12`, radius 24; copy 18px/1.75 `--ink-2`, `WHO_WE_ARE.bold` `--violet-text` semibold | Vessel, Pool-light (keeps `.orb-hand-off` on the Pool element so the leg-2 hand-off survives) | Reveal 0/120; `.liq-spec` | recompose; mobile stacked `p-7` |
| 4 | **WhatWeDo** | D `band-a` + `.sheet-enter` | horizontal **manifold**: one Conduit runs the container width at ~35% height behind 3 `.liq liq-spec` cards `grid-cols-1 lg:grid-cols-3` (`--liq-pad: 40px`); `.liq-inset` Node icon top-left (replaces `grad-tile` L62); `num` as `ghost-num` watermark bottom-right (`text-[72px]`, `.drift-far`); title heading-3; body 15px `--ink-inv-2` | Conduit (`flow="scroll"`), Node ×3, Caustic ×1, Seam | RevealGroup step 110; conduit flow crosses all three cards over `--sp`; Nodes lit in sequence via `--sp` thresholds (ProcessRail `litStyle` pattern) | rewrite. Mobile: cards stack; Conduit `orientation="v"` in the left gutter |
| 5 | **Ecosystem** | L (`--surface`) | flanked constellation (POS L62–73) kept; hub `grad-fill` kept; chips → `.liq liq-light liq-1` pills with a leading 8px Node dot (replaces the 3px bar L220–224) | Conduit-SVG ×10: base stroke `--lavender-300` 1.5px + `.conduit-pulse` `stroke-dasharray="8 92"` with `--pulse-delay: i * -0.9s` — one packet per 6s | chips scale in from the hub-facing edge (kept); hub `rotate(calc(var(--sp) * 18deg))` (kept); pulses ≥1024 only | retune. `.eco-wire` → `conduit-pulse`; `.eco-hub` box-shadow pulse (off-compositor) → Node glow opacity. `grid-cols-1` mobile list kept |
| 6 | **Challenges** | D `band-b` + `.sheet-enter` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, 6 `.liq liq-sweep liq-enter` Vessels `p-7` radius 20; `.liq-inset` Nodes **dim** (glow .35, `data-lit` absent) — flow blocked; hover lights them (the "we solve it" beat) | Node ×6, Caustic ×1 (lower-left, matches `--grad-section-b`), Seam | RevealGroup 70 | restyle (12 → 6 blur layers). Text on `.liq-sweep` cards is `--ink-inv` |
| 7 | **WhyUs** | L (`--surface`) | vertical Conduit spine at `lg:left-1/2` the full height; rows alternate sides (`Reveal dir="left|right"`, ≥1024 only); ghost numeral 64px (`.drift-mid`), title 21px, body 15.5px `--ink-2`; band tints alternate (kept) | Conduit (`flow="scroll"`, `light`), Node ×4 light 12px on the spine, lit on the row's `[data-inview]` | spine flow tracks `--sp`; `.scrub-fade-side` ≥1024 | recompose. Mobile: spine at left gutter, single column |
| 8 | **StatBand** | **D `band-c`** | heading centred; `grid-cols-2 lg:grid-cols-4` of `.liq liq-spec liq-static-sm` tiles `px-4 py-8 sm:px-6` radius 24; numerals `--ink-inv`, affixes `--lavender-400` (`odo-fix` spans), **labels `--ink-inv`** (they overlap the Pool). `LIVE_PILL` → Droplet row centred below | Pool ×4, Caustic ×1 centred low, Seam top, **Meniscus bottom** into ErpBand, Droplet | RevealGroup 90; `useOdometer` roll kept; Pool `scaleY` +120ms after digits land | rewrite; `ambient-violet` dropped (Caustic replaces it). Mobile 2×2 |
| 9 | **ErpBand** | L (`--surface`) | thin (`py-14`) — the Seam between two dark bands; heading `display-2` centred; six marks (kept sizes L33–43); **one** light Conduit (`flow="scroll"`) under the mark strip. Heading stays "ERPs We Integrate With" (CONTENT-TODO §1) | Conduit (light) | — | restyle |
| 10 | **ProcessRail** + `Terminal` | D `band-a` + `.sheet-enter` | `lg:grid-cols-[0.85fr_1.15fr]` kept. Left: four steps down a **vertical Conduit** (replaces the 1px rail L123–131; its `.conduit-flow` **is** the existing `fillStyle` `scaleY(var(--fill))`); step markers → Nodes with `litStyle` (kept). Right: **Ledger** terminal. **Pinned story ≥1024** (Part D iii) | Conduit, Node ×4, Ledger, Caustic ×1 (behind the terminal), Seam | `--sp-live` choreography **unchanged** (L82–101, `RAIL_FROM/TO` = `TYPE_FROM/TO`) | material + pin only. Mobile: terminal opaque, stacked |
| 11 | **Testimonials** | L (`--surface`) | snap track kept (L102–136); cards → `.liq liq-light` Vessels `p-7 md:p-8` radius 20; quote mark `--lavender-300`; avatar monogram `grad-fill` kept; role `--ink-3` | Vessel, Pool-light (faint, under the figcaption) | `.card-depth` (view(x)) kept; dot morph + press springs kept | restyle. Three real quotes, generic roles (CONTENT-TODO §3); no stars |
| 12 | **HomeFaq** | L (`--canvas`) + one light Caustic top-right | `lg:grid-cols-[0.85fr_1.15fr]` kept. Left: Droplet eyebrow + heading + `.liq liq-light` Vessel with the mail CTA. Right: accordion; each row gets a 6px Node-light dot that lights (opacity) on `is-open`; rows separated by `--line-soft` | Caustic, Vessel, Node | `.acc-panel` grid-rows + `PANEL_SPRING`/`CHEVRON_SPRING` kept | restyle |
| 13 | **CtaBand** `components/sections/CtaBand.tsx` | D `band-b` + `.sheet-enter` | centred type (Droplet eyebrow, `display-2`, CTA row); a wide shallow **Pool** (60% width, 120px) directly under the CTA row; Caustics `.drift-near` / `.drift-far` replace the three tilted slabs (L49–63); `sheet-shadow` | Pool, Caustic ×2, Seam ×2 | Reveals 0/90/180 kept; `.liq-spec` on the glass CTA; `overflow-hidden` stays | rewrite (shared by all routes). Props unchanged |

**Hero — the no-WebGL composition stands alone** (`components/three/HeroLens.tsx`, server component; `HeroField` is its only client child). Same outer box as today (`relative mx-auto aspect-[5/4] w-full max-w-[560px]`, `HeroOrbit.tsx` L69 — no layout change, no CLS) and the same two-plane structure: a trailing `.scrub-drift drift-lead` wrapper holding the SVG **and** `<HeroField/>` so they can never unstick (L70–74), chips in their own leading `.scrub-drift` wrappers **after** it (DOM order puts them above the canvas so their `backdrop-filter` blurs the live liquid). SVG `viewBox="0 0 500 400"`, bottom → top:
1. `<g class="lens-caustic">` — ellipse (150, 330) rx 140 ry 46, radialGradient violet-500 α .08 → 0; accent (360, 95) rx 90 ry 30 α .04. Idle: `rotate(±2°)` about (250, 205), 24s alternate.
2. Lens body — `<ellipse cx=250 cy=205 rx=148 ry=132>` linearGradient violet-600 → violet-500 55% → plum-700 at opacity .28; then, clipped to the same ellipse, **5 blob ellipses** at `BLOBS[i].rest` from `lensLayout.ts`, radius `r·1.15`, radialGradient violet-500 α .92 → violet-600 α .5 at 60% → 0. These are the metaballs at `uFlow = 0`.
3. Thick rim — annulus (outer ellipse + inner at −16, `fill-rule="evenodd"`) plum-950 α .26; outer stroke 1.4 linearGradient white .34 (upper-right) → .10 (lower-left); inner ellipse at −9 stroked white .10.
4. `<g class="lens-glint">` — ellipse (308, 121) rx 44 ry 13 rotate 28°, radialGradient lavender-400 α .55 → 0 with an ink-inv core; secondary (184, 297) rx 18 ry 7 α .2. Idle: `translate` float ±3px, 9s.
5. DOM chips at viewBox centres **(256, 50), (76, 170), (434, 186)** — `.liq liq-1 liq-refract`, `.chip-float`, `[data-tilt]`, 52×52. Ports/labels as `HeroOrbit.tsx` L27–65 (aria-label only).

`HeroField` promotes `live` → `data-live="true"` on the wrapper: `.hero-lens[data-live="true"] [data-poster] { opacity: 0; transition: opacity 900ms var(--ease-out-expo) }`. Chips are not posters. No-WebGL / <1024 / RM → the poster **is** the hero; no fade ever fires. `.lens-caustic, .lens-glint` join the RM by-name list.

---

# Part F — Hero WebGL scene: "the lens"

## F1. Decision

**One `PlaneGeometry(500, 400)` under the existing 1:1 ortho camera; everything in one fragment shader.** One draw call, zero textures, zero per-frame buffer uploads. Fragment count is bounded by the composition, not the monitor: inside the `max-w-[560px] aspect-[5/4]` box at DPR ≤ 1.5 the framebuffer is ≤ ~840×672 ≈ 565k fragments; a ~300-ALU shader is ≈ 0.2ms (Apple M-series) / 0.4–0.6ms (Iris Xe) / ~1ms (HD 4000) — inside the 2ms budget on the integrated GPU `powerPreference: "low-power"` selects. Registration with the SVG fallback is exact by construction (same 500×400 numbers). Rejected: 3D torus/slab mesh (3k+ verts, MSAA, alpha sorting, 2–3 draws — for effects that are 2D face-on anyway; the chips' own 3° tilt already exceeds any perceivable parallax), instanced blobs (needs RTT), marching cubes / CPU metaballs (per-frame main-thread work + uploads — exactly what this eliminates).

**Form: an ellipse lens** 148×132 at (250, 205) with a thick refractive rim. Ring → reads as spinner/logo, caustics fall in the hole; slab → "another glass card". Lens → curved rim everywhere so fresnel, refraction band and internal reflection are all legible; chips orbit it (top, left, right), two grazing the rim and blurring the liquid through their `backdrop-filter`. No waterline ("through", not "in a jar"): the mass is a metaball cluster biased low by gravity, advected toward the key light so it reads as flow. Lighting is coherent with the CSS backdrop: `--grad-hero`'s key bloom is at 78%/30% → primary specular upper-right, caustic pool lower-left.

## F2. Module layout

```
components/three/
  HeroField.tsx                 keep (harness). Edit only L4 (type import) and L71 (dynamic import path);
                                add data-live promotion.
  HeroLens.tsx                  NEW server component; replaces HeroOrbit.tsx (Hero.tsx import updates)
  scene/
    palette.ts                  EXTEND; delete L10–16 navy*/steel* compat aliases (no consumers)
    lensLayout.ts               NEW, pure TS, NO `three` import: LENS/GLINT/CAUSTIC literals + makeRandom-seeded BLOBS,
                                imported by BOTH HeroLens.tsx (server) and createHeroLiquid.ts (client)
    createHeroLiquid.ts         NEW factory (renderer/mesh/uniforms/loop/resize/dispose), ~180 LOC
    liquidShaders.ts            NEW vertex + fragment GLSL template strings; palette injected as literals
  (delete) scene/createHeroField.ts, HeroOrbit.tsx
```
`lensLayout.ts` evaluates `makeRandom(20260812)` at module load (pure, identical on server and client), producing 5 blob descriptors `{ ax, ay, kx, ky, phx, phy, r, w }` plus derived `restX/restY` — the positions at `uFlow = 0`, exactly where the SVG draws them and where the scene boots.

**palette.ts:** keep `plum950/900/700/600`, `inkInv`; add `plum800 0x2d1235`, `violet600 0x7b2d8e`, rename `violet → violet500 0x8e24aa`, `lavender → lavender400 0xc9b8d8`; add `LIQUID = { rimLine .34, rimInner .10, rimDark .28, glassTint .09, bodyAlpha [.80,.96], caustic .16, specular .55 }` and `glsl(hex) => "vec3(r, g, b)"`. Zero `three` import stays true.

**Factory contract** (what `HeroField.tsx` calls — L74, L54–55, L80–81, L87, L63–66, L110):
```ts
export interface HeroLiquid { start(): void; stop(): void; resize(): void; setPointer(nx: number, ny: number): void; dispose(): void; }
export function createHeroLiquid(canvas: HTMLCanvasElement, container: HTMLElement, onFirstFrame?: () => void): HeroLiquid
```
Synchronous. Internally kick `renderer.compileAsync(scene, camera)`; `start()` sets `running` and schedules the rAF only once `ready` resolves (and not if `disposed`). First rendered frame fires `onFirstFrame`.

**Pointer:** keep `setPointer` (wrap-normalised −1..1 from the harness, L58–67). **Do not read `--mx/--my`** (viewport-px strings, mouse-only, would need a per-frame rect). The scene reads exactly one custom property per frame: `--scroll-velocity` off `root.style` (L178–193 pattern). Both signals optional — `uVelocity = 0`, `uPointer = (0,0)` is the finished idle scene.

## F3. Uniforms

| Uniform | Type | Cadence | Source |
|---|---|---|---|
| `uTime` | float (s) | per frame | rAF timestamp; only feeds `sin` |
| `uFlow` | float (s) | per frame | `flow += (1 + 0.3·uVelocity)·dt`, **wrapped at T = 360s**; monotonic (factor ∈ [0.7, 1.3]) |
| `uVelocity` | float | per frame | spring output (F5) on the lerped `--scroll-velocity` |
| `uPointer` | vec2 | per frame | `setPointer` target eased with τ ≈ .35s (`k = 1 − exp(−dt/.35)`) |
| `uWake` | float 0→1 | per frame until 1 | one-shot 1.4s ease `1 − (1−t)^4` after first `start()` |
| `uPx` | float | resize | viewBox units per device pixel (analytic AA) |
| `uBackdrop` | vec4 | resize | canvas origin xy + section size zw in viewBox units (`--grad-hero` reproduction); the rect reads happen in the RO callback, never per frame |
| `uBlobA[5]`, `uBlobB[5]` | vec4[5] | **once** | from `lensLayout.ts` |
| palette | `#define` | compile | from `palette.ts` via `glsl()` |

`dt` clamped ≤ 50ms (tab resume never jumps). `resize()`: `setSize(w,h,false)`; letterbox ("meet") `s = min(w/500, h/400)` adjusting the ortho frustum around (250,200) so the camera matches the SVG's `xMidYMid meet`; `uPx = 1/(s·pixelRatio)`. Renderer: `alpha:true, antialias:false, powerPreference:"low-power"`, `setPixelRatio(min(dpr,1.5))`, `setClearColor(0,0)`. Material: `ShaderMaterial({ transparent:false, depthTest:false, depthWrite:false, blending:NoBlending })` writing **premultiplied** RGBA (the quad covers the frustum; the browser compositor does source-over).

## F4. Fragment shader outline (GLSL ES 1.00; three injects `precision highp float`)

Noise lattice tiles with period `P = 16` and `uFlow` wraps at `T = 360` with every flow frequency an integer multiple of `2π/T` and advection exactly `P/T` cells/s — seamless wrap, safe in fp for days. No derivatives, no extensions. Maths in sRGB so palette hexes hit the screen exactly as the SVG's stops.

```glsl
varying vec2 vUv;
uniform float uTime, uFlow, uVelocity, uWake, uPx;
uniform vec2  uPointer;
uniform vec4  uBackdrop;            // canvas origin xy, section size zw (viewBox units)
uniform vec4  uBlobA[5];            // ampX, ampY, kX, kY   (k = integer harmonics of 2π/T)
uniform vec4  uBlobB[5];            // phX, phY, radius, weight
#define C_PLUM950 vec3(...) /* + PLUM900 PLUM800 PLUM700 VIOLET600 VIOLET500 LAV400 INKINV from palette.ts */
const vec2  VIEW = vec2(500.0, 400.0);
const vec2  CEN  = vec2(250.0, 205.0);  const vec2 RAD = vec2(148.0, 132.0);   // same literals as HeroLens.tsx
const float P = 16.0, T = 360.0, TAU = 6.2831853;
const vec2  KEY = normalize(vec2(0.55, -0.83));                                 // toward --grad-hero's 78%/30% bloom

float hash21(vec2 p){ p = mod(p, P); p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x), mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y); }
float fbm2(vec2 p){ return 0.625*vnoise(p) + 0.375*vnoise(p*2.03 + 17.1); }
float sdEllipse(vec2 p, vec2 r){ float k0 = length(p / r), k1 = length(p / (r*r)); return k0 * (k0 - 1.0) / k1; }

vec3 backdrop(vec2 s){                                   // --grad-hero (globals.css L136–146) in SECTION space, s in 0..1
  vec2 px = s * uBackdrop.zw;
  float L = abs(uBackdrop.z*0.087) + abs(uBackdrop.w*0.996);
  float t = clamp(dot(px - 0.5*uBackdrop.zw, vec2(0.087, 0.996)) / L + 0.5, 0.0, 1.0);
  vec3 g = t < 0.45 ? mix(C_PLUM900, C_PLUM800, t/0.45) : mix(C_PLUM800, C_PLUM950, (t-0.45)/0.55);
  float b1 = 1.0 - clamp(length((s - vec2(0.78, 0.30)) / vec2(1.20, 0.90)) / 0.55, 0.0, 1.0);
  float b2 = 1.0 - clamp(length((s - vec2(0.08, 0.96)) / vec2(0.95, 0.80)) / 0.58, 0.0, 1.0);
  return mix(mix(g, C_VIOLET500, b1*0.35), C_VIOLET500, b2*0.18);
}
float mass(vec2 q){                                       // 5 metaballs on Lissajous paths + gravity bias; ≈1 at the boundary
  float f = 0.0;
  for (int i = 0; i < 5; i++){ vec4 A = uBlobA[i], B = uBlobB[i];
    vec2 c = A.xy * vec2(sin(TAU*A.z*uFlow/T + B.x), cos(TAU*A.w*uFlow/T + B.y)) + vec2(0.0, 14.0);  // uFlow=0 == SVG rest pose
    vec2 e = q - c; f += B.w * B.z*B.z / (dot(e, e) + 1.0); }
  return f;
}
float glint(vec2 q, vec2 r, float rot){ float c = cos(rot), s = sin(rot); q = mat2(c, -s, s, c) * q; return pow(max(0.0, 1.0 - length(q / r)), 2.0); }

void main(){
  vec2 p = vUv * VIEW;                                                   // SVG coordinates, y down
  vec2 c = CEN + uPointer * vec2(6.0, 3.0);                              // form parallax (< chips' tilt → chips lead)
  vec2 q = p - c;
  float d  = sdEllipse(q, RAD);                                          // < 0 inside
  float aa = uPx * 1.25;
  float inside = 1.0 - smoothstep(-aa, aa, d);
  vec2  n  = normalize(q / (RAD*RAD));
  float rimT = smoothstep(-16.0, 0.0, d);                                // 0 deep inside → 1 at the edge
  float tilt = uVelocity * 0.105 * uWake;                                // slosh ≈ ±6°
  vec2  ql   = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * q + vec2(0.0, -8.0 * uVelocity * uWake);
  vec3 bg = backdrop((p - n * rimT*rimT * 14.0 + uBackdrop.xy) / uBackdrop.zw);   // refraction: bend inward toward the rim
  bg += 0.09 * inside;                                                    // glass-3 tint
  vec2  lp  = ql / 120.0, adv = vec2(1.0, -1.0) * (P / T) * uFlow;
  vec2  wrp = (vec2(fbm2(lp*1.7 + adv), fbm2(lp*1.7 - adv.yx + 5.2)) - 0.5) * 0.55 * uWake;
  float m   = mass(ql + wrp * 40.0) + (fbm2(lp*2.2 + adv) - 0.5) * 0.35 * uWake;
  float body = smoothstep(0.75, 1.35, m);
  vec3 liquid = mix(C_VIOLET600, C_VIOLET500, smoothstep(0.9, 1.8, m));
  liquid = mix(liquid, C_PLUM700, smoothstep(1.9, 2.8, m) * 0.35);
  vec3 col = mix(bg, liquid, body * 0.92);
  float breathe = 0.85 + 0.15 * sin(uTime * 0.4);
  float facing  = 0.5 + 0.5 * dot(n, KEY);
  float dark  = smoothstep(-18.0, -2.0, d) * 0.28;
  float line  = 1.0 - smoothstep(0.0, 1.6 + aa, abs(d + 1.2));
  float inner = (1.0 - smoothstep(0.0, 1.2 + aa, abs(d + 9.0))) * 0.10;
  col = mix(col, C_PLUM950, dark);
  col += C_INKINV * ((line * 0.34 * mix(0.35, 1.0, facing) + inner) * breathe + pow(rimT, 3.0) * 0.10 * facing);
  vec2 s1 = vec2(58.0, -84.0) + uPointer * vec2(18.0, 10.0) + vec2(sin(uTime*0.31), cos(uTime*0.23)) * 4.0;
  vec2 s2 = vec2(-66.0, 92.0) - uPointer * vec2(8.0, 5.0);
  float g1 = glint(q - s1, vec2(44.0, 13.0), 0.5), g2 = glint(q - s2, vec2(18.0, 7.0), -0.4) * 0.35;
  col += C_LAV400 * (g1 * 0.55 + g2) + C_INKINV * g1*g1 * 0.25;
  float fall = exp(-max(d, 0.0) / 70.0) * smoothstep(-40.0, 60.0, q.y) * (0.6 + 0.4 * smoothstep(60.0, -120.0, q.x));
  float cw   = fbm2(p / 46.0 + adv * 1.6 + wrp * 0.3);
  float caus = pow(smoothstep(0.42, 0.78, cw), 2.2) * fall * (0.4 + 0.6 * uWake) * (1.0 + 0.5 * abs(uVelocity));
  vec3  cCol = mix(C_VIOLET500, C_LAV400, caus * 0.4);
  float aIn = mix(0.80, 0.96, body) * (1.0 - smoothstep(-3.0*uPx, 0.0, d) * 0.6);   // 3px rim fade hides the backdrop seam under the line
  float a   = mix(caus * 0.16, aIn, inside);
  vec3  rgb = mix(cCol, col, inside);
  float dth = (hash21(gl_FragCoord.xy * 0.37) - 0.5) / 255.0;                      // static triangular dither vs banding
  gl_FragColor = vec4(rgb * a + dth, a);
}
```

## F5. Motion design (uniforms only, zero DOM writes)

- **Idle:** blobs orbit on Lissajous paths (periods 51–180s, harmonics 2..7 of T, PRNG-picked); detail noise advects up-right at `P/T` cells/s; rim breathes ±15% on a 15.7s cycle; key glint wanders ±4u on 20/27s cycles. Nothing repeats visibly in a normal dwell.
- **Scroll:** `--scroll-velocity` lerped 0.08 → (a) churn `flow = 1 + 0.3v` (monotonic); (b) slosh via a spring `acc = 38·(v − x) − 6.5·ẋ` (ζ ≈ .53, ~1s period) → `uVelocity` tilts the liquid ±6° and lifts it 8u; overshoots once and settles — the "liquid coming to rest" beat. Caustics ×(1 + .5|v|).
- **Pointer:** key glint moves (18, 10)u, the form (6, 3)u; the chips' `[data-tilt]` moves more, so depth ordering reads chips > glass > backdrop.
- **Wake:** `uWake` 0→1 over 1.4s on the first `start()` only; at 0 the shader is the SVG's exact rest pose, so the 900ms fade crossfades near-identical images and motion then emerges. Tab hide/show does not re-wake.
- **Rest:** everything is still ~1.2s after the last scroll; pointer settles in ~1s; no state is ever discontinuous.

## F6. Boot, dispose, quality

Boot: `WebGLRenderer`, `Scene`, `OrthographicCamera(0,500,0,400,-100,100)`, `PlaneGeometry(500,400,1,1)` at (250,200,0), one `ShaderMaterial`, one `Mesh`. No textures. `compileAsync` started immediately. Dispose: `stop()`; `disposed` flag cancels the compile continuation; `scene.clear()`; geometry/material/renderer `.dispose()`; remove context-loss listeners. **Adaptive quality:** if the median rAF interval > 20ms over 90 frames → `setPixelRatio(1.0)` + `resize()` once (floor 1.0; 0.75 softens the 1.2u rim line). Optional `webglcontextlost` (preventDefault + stop) / `restored` (resize + start).

## F7. Verification hooks (`scripts/qa/probe.mjs`)

Must stay true: hero canvas is the first `<canvas>`; opacity reaches `"1"` at 1440×900; lazy `three` chunk (L4 stays `import type`, L71 stays dynamic; `lensLayout.ts` never imports `three`); `drawElements` > 5 per 500ms visible, ≤ 1 hidden, > 5 resumed; opacity `!== "1"` at 390px and under RM; zero console errors (now also gates shader compile). **Add:** ≤ 35 draws/500ms (one per frame); **0 `bufferData`/`bufferSubData` after settle**; rAF callback p95 < 1ms at 4× CPU; GPU time < 2ms via `EXT_disjoint_timer_query_webgl2` when hardware GL is present (skip under swiftshader). In `layout.mjs`: the SVG lens ellipse's rect equals the canvas rect × 500/400 within 1px.

Risks: banding (static dither), alpha halos (premultiplied + NoBlending, 3px rim fade), Safari derivatives (none used), fp16 (tiling + wrapped flow), fill rate (bounded; DPR floor 1.0), compile stall (`compileAsync`), swiftshader fps (~20–30; widen the probe window if it flakes — test tuning, not regression), 120Hz (dt-based), context loss (handlers).

---

# Part G — Inner pages + chrome

- **`PageHero.tsx`** (rewrite): `tone="dark"` → `.section-dark band-b` + Caustic (upper-right) + Seam bottom + **Meniscus** into the first section; `tone="light"` → `.section-wash` + light Caustic + Seam. Eyebrow → Droplet. H1 `display-1` + lead **not reveal-gated** (L54–55); `vt-page-title` kept; `data-hero={tone}`. `visual` slot wrapped in a Vessel plate (`.liq liq-3` / `.liq liq-light`, radius 24, `p-6`) **only when the visual is a diagram** — `visualFrame?: boolean` (default true); images pass through. Padding contract unchanged.
- **`/connected-banking`:** hero `ConnectionDiagram` (L310–377) → horizontal Conduit composition `[Node "LinkAPI platform"] ═══ [hub Node] ═══ [Node "Bank infrastructure"]` with a "Partner bank" Droplet above the hub (labels verbatim; still generic per CONTENT-TODO §2) and the "Secure API connection" caption below; two Conduits flow in opposite directions. Capabilities rail → vertical Conduit with `--sp-live` fill; the nine dots → Nodes lit by the existing `orb-hand-off` logic (L115–118). How It Works → `.section-dark` inset with three Vessels (`.liq` columns, `.liq-3` centre with a small Pool) joined by two Conduits replacing `Flow` (L254–302); vertical Conduits below lg.
- **`/industries`:** rows alternate **L·D·L·D·L** (NBFC and E-commerce dark). `Mocks.tsx` `Shell` (L92–100) → `.liq liq-light` Vessel on light rows / `.liq` on dark; `.mk-bar scaleX` (kept) sits over a Pool; NBFC → Ledger; `Rails` → 3 Nodes + `conduit-pulse` (replaces `.eco-wire` L284–296).
- **`/services`:** raster `/illus/hub-isometric.webp` → SVG **manifold** (centre LinkAPI Node, seven Conduit-SVG spokes to seven Nodes carrying `SERVICES[].icon`; icon-only; alt text lists categories as today). `OfferTimeline` rail → vertical Conduit with `--sp-live` fill; number nodes → Nodes (`useCentreCrossing` pop kept). `CoreServices` → light bento (`.spotlight` → `.liq liq-light liq-spec`). `PartnerProgram` (dark): panel → `.liq liq-3` Vessel; five chips → Nodes with Conduit-SVG spokes; `<xl` list fallback kept. Engagement → `.liq liq-light` Vessel.
- **`/about`:** dark PageHero. `OrbitCard` (L236–264) → a compact static lens (`HeroLens compact`, no chips) inside a `.liq liq-light` Vessel — the company as reservoir. Mission `.liq liq-light` / Vision `grad-fill` (kept). Commitment (dark): 3 `.liq` cards with `.liq-inset` Nodes. Apart: 4 light cards. Track Record: `bg-tint` cards with Pool-light; growth bar → `.section-dark` inset band with three odometers + a full-width Pool.
- **`/solutions`:** light PageHero centred. Groups: `.liq liq-light` cards; `feature:"solid"` stays `grad-fill` + Pool; `feature:"outline"` → `.liq liq-light` with `--line-violet` rim. Dark band (`front-ends`) → list + Ledger (`SDK_SAMPLE`). Anchor ids unchanged.
- **`/banks`, `/banks/[slug]`:** three cards → `.liq liq-light` Vessels with the licensed marks; disclaimer (L90–99) stays `bg-tint`. Slug hero `ConnectionCard` (L382–404) → vertical Conduit stack (mark → LinkAPI Node `grad-fill` → "Your ERP or platform" Node), flow downward, caption kept. Playbook rail → Conduit with numbered Nodes. Aggregate stats → `grad-fill` band with a Pool; **the "not bank-specific figures" caption stays first inside the card.**
- **`/contact`:** dark PageHero. Detail cards → `.liq liq-light` Vessels with Nodes; `ContactForm` inside a Vessel; `.link-draw` kept. **Map embed untouched** (parked, CONTENT-TODO §5).
- **Footer** (`SiteFooter.tsx`): `<footer class="chrome-curtain">` stays the sticky element; **nest** `<div class="section-dark footer-pool">` inside it (`.section-dark` sets `position: relative` and must never sit on the sticky element — globals L531). Gradient inverted `--plum-800` top → `--plum-950` bottom; one Caustic bottom-centre; a full-width Pool under the legal baseline; Seam at top. Headings `--ink-inv`, links `--ink-inv-2` (plum flats, ≥6:1), `.link-draw` kept. `.chrome-main` stays opaque.

---

# Part H — Build phases (gate green after each; one commit per phase; `--skip-pixdiff` until phase 10)

| # | Work | Files | Gate note |
|---|---|---|---|
| 0 | Branch `redesign/liquid-glass-v4`. Green start confirmed (gate passed on `main` 2026-09-03). Fresh V3-final `baseline/` captures for the human comparison. This spec. `ownership.py`: V4 packet map. | `REDESIGN-V4.md`, `scripts/qa/ownership.py`, `scripts/qa/baseline/*` (local) | — |
| 1 | Tokens + Tailwind entries + `<LiquidGlassDefs>` | `app/globals.css` (`:root`), `tailwind.config.ts`, `components/ui/LiquidGlassDefs.tsx`, `app/layout.tsx` | zero visual change |
| 2 | `.liq*` classes + mobile/coarse/RM blocks; drift tiers; `sheet-shadow`, `pin*`, `.display-0`, `band-hero`, `.lens-*` keyframes; motif kit; `scene/lensLayout.ts`; CursorGlow selector; `ALLOWED_ANIM="ecoWire conduitPulse"`; new `qa.mjs` ink-on-glass rule (proven able to fail at the first call-site phase) | `app/globals.css`, `components/motifs/*`, `components/motion/CursorGlow.tsx`, `scripts/qa/{gate.sh,qa.mjs}` | no call sites yet — so **`contract.py` entries land with each call-site phase** (it asserts defined AND wired). **Verify `@supports (backdrop-filter: url(#x))` false in Safari + Firefox** before phase 3 |
| 3 | Adaptive glass pill (+ `data-hero` on Hero/PageHero) | `chrome.css`, `SiteHeader.tsx`, `Hero.tsx`, `PageHero.tsx` | `qa.mjs` scores dark-hero pages at scroll 0 in the dark state; `kbd1` unchanged |
| 4 | Hero section + `HeroLens` SVG fallback (complete composition); `Button` glass variant → `.liq` | `Hero.tsx`, `components/three/HeroLens.tsx`, `components/ui/Button.tsx` | composited audit on `/`; LCP unchanged |
| 5 | WebGL liquid scene + `HeroField` swap + `data-live`; `probe.mjs` additions | `scene/{createHeroLiquid,liquidShaders,palette}.ts`, `HeroField.tsx`, `scripts/qa/probe.mjs` | probe suite. **Owner review gate (preview URL).** |
| 6 | StatBand (dark) + WhatWeDo + Challenges | `home/{StatBand,WhatWeDo,Challenges}.tsx` | composited audit `/`; contrast walk on glass |
| 7 | Ecosystem; ProcessRail + Ledger + pinned story; CtaBand + footer pool; MobileMenu rim | `Ecosystem.tsx`, `ProcessRail.tsx`, `Terminal.tsx`, `CtaBand.tsx`, `SiteFooter.tsx`, `MobileMenu.tsx` | `kbd2` shows pin steps stacked; TBT ≤ 200 |
| 8 | WhyUs, Marquee, ErpBand, WhoWeAre, Testimonials, HomeFaq | remaining `home/*.tsx` | **Owner review gate — homepage complete.** |
| 9 | PageHero + Card → inner pages: connected-banking, industries, services, about, solutions, banks, contact; then reduce `.glass*` to `.liq*` aliases | `PageHero.tsx`, `app/(site)/**/page.tsx`, `components/sections/{services,industries}/*`, `globals.css` | composited audit ×5 routes; `contract.py` still finds `glass-1/2/3` |
| 10 | QA close-out: regenerate `baseline/`, full gate **with** pixdiff, preview Lighthouse (SSO bypass) on 5 routes, docs (`README.md`, `CLAUDE.md`, `scripts/qa/README.md`, `CONTENT-TODO.md`) | docs, baselines | full gate. **Owner sign-off → `vercel --prod --yes`.** |

# Part I — Risks

| Risk | Mitigation |
|---|---|
| Glass everywhere → AA regressions | Fills alias the calibrated tiers; no extra white in background layers; tier-3 = `--ink-inv`; `--ink-inv-3` never on glass; Pool-overlapped text `--ink-inv`; the new `qa.mjs` rule. |
| Safari parses `backdrop-filter: url()` but renders nothing | Verify in phase 2; Chromium probe → `html[data-refract]`. |
| Chromium reference backdrop filter off the GPU fast path | ≤4 opt-in elements, desktop only, never animated; drop from chips if TBT moves. |
| Mobile blur budget | `.liq-1` no blur <1024; `.liq-inset`; `liq-static-sm`; Ledger opaque; Caustics are gradients. |
| Meniscus reads as a 2010 wavy divider | ≤3 uses, amplitude ≤4% width; fall back to flat Seam. |
| Hero reads as lava lamp | Breathe ≥9s ±4px; violet-500→plum-700 only; no bubbles/ripples anywhere. |
| Caustics read as generic gradient-mesh | ≤2 per section, alpha ≤.24, scroll-drift only on mobile. |
| Ten pulsing conduits in Ecosystem feel busy | One packet per path per 6s, desktop only; if busy, pulse only the four nearest the hub. |
| "Dim Nodes" in Challenges read as broken UI | Glow .35, never grey icons; hover lights them; if it reads as disabled, glow .6 and drop the beat. |
| Metaphor fatigue for CFOs | Liquid implied by light + channels, never illustrated (no water, coins, waves). A section that can't use Conduit/Node/Pool without illustration uses Seam + Vessel only. |
| Pinned story support | `@supports` + ≥1024; stacked fallback complete; Firefox behind a flag — enhancement only. |
| `pixdiff` exit 2 | Expected; `--skip-pixdiff` during build; phase-0 captures for the human comparison; `layout.mjs` + `qa.mjs` stay hard gates. |
| `.liq` collision | Chosen over `.lg` precisely to avoid the `lg:` prefix hazard. |
