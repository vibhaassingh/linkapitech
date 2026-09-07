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
| L6 | Liquid interaction | element `transform` on `--spring-snappy` (lift −2px, scale 1.012, press .985) + existing `[data-tilt]`. `.liq-live` owns `transform`; it is **exclusive on its element** with `.liq-enter`, `.scrub-drift`, `.card-depth` and `[data-tilt]` — nest a wrapper when you need both | transform only |

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
--liq-light-1-blur: 12px; --liq-light-2-blur: 20px; --liq-light-3-blur: 28px;
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
| `.liq-live` | hover lift / press spring (transform only); owns the `transform` transition. `.liq-live` owns `transform`; it is **exclusive on its element** with `.liq-enter`, `.scrub-drift`, `.card-depth` and `[data-tilt]` — nest a wrapper when you need both |
| `.liq-enter` | entry depth `scale(.96)→1` + `opacity .6→1` over `view()` entry 0–45% |
| `.liq-static-mobile` | no backdrop-filter below 1024 (blur-budget escape hatch) |
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

/* L6 — liquid interaction, transform only. The transition lives on .liq-live, NOT .liq:
   Magnetic.tsx writes el.style.transform every rAF for [data-tilt], and a host transition
   would ease every write (rubbery, lagging tilt). Nothing changes box-shadow, so it does
   not transition. */
.liq-live        { transition: transform var(--dur-spring-snappy) var(--spring-snappy); }
.liq-live:hover  { transform: translateY(var(--liq-lift)) scale(var(--liq-hover-scale)); }
.liq-live:active { transform: scale(var(--liq-press-scale)); }

/* nested chips inside glass: no second blur layer */
.liq-inset { background: var(--veil-2); box-shadow: inset 0 1px 0 rgba(255,255,255,.12); }

/* light variant */
.liq-light {
  --_fill: var(--liq-light-2-fill); --_blur: var(--liq-light-2-blur); --_sat: 1.15;   /* 1.4 pinks the lavender */
  --_edge: var(--liq-light-edge); --_depth: none;
  --_rim: var(--liq-light-rim); --_shadow: var(--liq-light-shadow);
  --_spec: var(--liq-light-spec);
}
.liq-light.liq-1 { --_fill: var(--liq-light-1-fill); --_blur: var(--liq-light-1-blur); }
.liq-light.liq-3 { --_fill: var(--liq-light-3-fill); --_blur: var(--liq-light-3-blur); }

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
  .liq-static-mobile { backdrop-filter: none; -webkit-backdrop-filter: none; }
  /* no .liq::before override here: the ≥1024 query on .liq-lens::before is the only gate */
  .liq-3,
  .liq-light.liq-3 { --_blur: 18px; }  /* .liq-light.liq-3 is (0,2,0) and would out-specify the cap */
  /* --drift-scale: .5 lives beside the drift tiers (Part D ii), not here */
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

**≤ 8 backdrop-filtered layers per desktop viewport, ≤ 4 on phones; nested glass never blurs.** `.liq-1` has no blur <1024; `.liq-lens` counts as an extra layer (tier 3 / hero only). Challenges goes 12 → 6 by making icon tiles `.liq-inset`. StatBand tiles carry `liq-static-mobile` (4 tiles + pill would exceed 4 on a phone). Ledger is opaque on mobile. Caustics are gradients, not blur.

`will-change`: none on the material (hover transitions promote for their own duration). `contain: paint` only on `.liq-sweep` and `.pin-stage`.

---


## A8. The backdrop-root rule (a `.liq` ancestor can silently kill the frost)

**A `.liq` must not be a descendant of an element that animates or sets `opacity < 1`, `filter`, `mask` or `mix-blend-mode`.** Any of those makes that ancestor a *backdrop root*: the descendant's backdrop image is restricted to it, so `backdrop-filter` samples nothing and the frost is **silently** absent. No gate check sees this — the fill, rim, shadow and every measured AA ratio are unaffected; only the blur is gone.

Where an opacity or filter treatment is required over glass, the glass takes **`.liq-flat`** (fill + rim + shadow, no `backdrop-filter`) and the note says why.

Known instances, found in the Phase 8 review:
- **`.card-depth`** (`cardDepth` rests at `opacity: 0.75` for off-centre cards) wraps the Testimonials `<figure>` — its frost was dead before Phase 8 made the cards `.liq-flat`. Part E row 11's "frosted Vessels" is therefore unimplementable as written under `.card-depth`.
- **`.pin-step`** (`pinStep` passes through `opacity: 0`) wraps ProcessRail's four step `Node`s, which blur ≥1024 — their frost was dead for most of the pinned stretch. **Resolved in Phase 9b:** the Nodes take `liq-flat`. All three pin keyframes animate opacity with `fill-mode: both`, so the `<li>` is a backdrop root for the whole pinned stretch, not just its ends — the blur was never rendering. Declaring it flat also hands §A7 four layers back (this section's desktop count goes 5 → 1).
- **`.liq-enter`** (`opacity .6 → 1`) and `[data-reveal]`'s `will-change: opacity` are the same family — check before pairing either with glass.

§A4's exclusivity table is *element*-scoped and does not cover this; ancestors matter just as much.

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
| **Caustic** | Ambient light on the plum — the light liquid throws on the wall | 1–2 absolutely positioned 380–560px divs, `radial-gradient(circle, var(--violet-a24), transparent 70%)`, `z-index:-2` inside the isolated `.section-dark` (grain dithers over). Light: `--violet-soft`. **No `filter`, no feTurbulence** | `.scrub-drift` 14–30px; ≥1024 an additional 40s `translate` loop | Every dark band (max 2), Hero fallback, FAQ wash, Footer. The parent MUST be a stacking context — `.section-dark` is; a light section needs Tailwind `isolate` (or `relative z-0`) | Mobile: 1 blob, scroll drift only. RM: static |
| **Seam** | Glass hairline dividing sections — the rim of the vessel | full-width 1px `--glass-3-line` (dark) / `--line-soft` (light) with a 220px child specular segment | segment `translateX` from `--sp` | Top of every dark band, bottom of Hero, top of Footer, under the stuck pill | static line, no segment |
| **Meniscus** | The curved liquid surface where a dark band ends and a light one begins | SVG `<path preserveAspectRatio="none">` 56–80px, filled with the next section's surface colour + 1.2px lavender stroke. **Static geometry — no path morph. Max 3 uses**: Hero→Marquee, StatBand→ErpBand, dark PageHero→first section. Amplitude ≤ 4% of width | stroke opacity via `--sp` (.3→.6) | as listed | Mobile 32px. RM: identical |
| **Vessel** | The glass container — the card family | dark `.liq liq-3 rounded-xl liq-spec`; light `.liq liq-light rounded-xl`. Specular = the rim ring's white key + `.liq-spec` — **no extra static white arc** (constraint 3) | `[data-tilt]` (hero), `.liq-spec`, `.liq-live` 4px lift | Hero, WhoWeAre, FAQ card, Testimonials, Terminal shell, Contact, Industry mocks | Mobile: no tilt/spec. RM: static |
| **Ledger** | Terminal as a glass code window | `.terminal.ledger` = `rgba(23,27,33,.78)` + `backdrop-filter: blur(18px)` **inside `.section-dark` only**; opaque `--terminal` on light + mobile. **Re-measure `--terminal-cmt` (#8b93a0) on the composite; if < 4.5 stay opaque.** | existing `--sp-live` typing + caret | ProcessRail, Solutions dev band, Industries NBFC | Mobile: opaque. RM: existing fail-open |
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

**Shared `components/motifs/Card.tsx`** replaces the per-page `CARD_LIFT` strings (`about/page.tsx` L31, `solutions/page.tsx` L22, `banks/[slug]/page.tsx` L25). Dark: `.liq rounded-lg p-7 md:p-8` + `.liq-inset` Node icon, title `--ink-inv`, body `--ink-inv-2`; feature `.liq-3` — **all text `--ink-inv`**. Light: `.liq liq-light rounded-lg p-7 md:p-8 border-line-soft`, 44px `--lavender-200` icon disc with `--violet-text` glyph; feature = `bg-tint` + `border-lavender-300` or `grad-fill` with `--ink-on-violet-2` (kept). Hover: `.liq-live` + `.liq-spec` (dark) / `.spotlight` (light); `.icon-draw` kept. `href` renders the card as a `next/link` `<Link>`, never a raw `<a>` — internal links go through the App Router so the RouteTransition view transition fires (it exists only for client navigation).

---

# Part D — Scroll choreography upgrades

All within `view()` / `scroll()` / `--sp`. Every new keyframe is transform/opacity only and joins the by-name RM kill list (`globals.css` L1440–1453).

- **(i) Sheet enter.** Keep `.sheet-enter`'s transform (L817–824). Add a child `<span aria-hidden class="sheet-shadow">` — 1px top-edge highlight + 40px upward shadow gradient — whose **opacity** fades 1→0 over `cover 0% cover 22%` (`@keyframes sheetShadow`). All viewports.
- **(ii) Drift tiers.** `.drift-far { --drift-range: 7px } .drift-mid { 14px } .drift-near { 22px } .drift-lead { -22px }`; `scrubDrift` (L859–866) multiplies by `var(--drift-scale)` (.5 <1024 — `:root { --drift-scale: .5 }` sits in its own `@media (max-width: 1023px)` beside the tiers, not in the `.liq` mobile block). All viewports.
- **(iii) Pinned story** — compositor-only via a **named view timeline** (`view()` on a sticky child stalls; the tall wrapper owns the timeline). *Corrected at phase 7 (see Part J): the ranges are `contain`, not bare percentages, and there are **four** steps.*
```css
@supports (animation-timeline: view()) { @media (min-width: 1024px) {
  .pin { view-timeline-name: --pin; view-timeline-axis: block; min-height: 260vh; }
  .pin-stage { position: sticky; top: 0; height: 100vh; contain: paint; }
  /* :nth-of-type counts same-TAG siblings within ONE parent, so the four steps
     must share a parent and be its only children of their tag (a heading or a
     Seam goes outside). A bare `0% 34%` would be the COVER range — the steps
     would play while the wrapper is still scrolling INTO view and be finished
     before the stage ever sticks. `contain` on a subject taller than the
     scrollport runs top-at-top → bottom-at-bottom, which IS the sticky phase:
     260vh − 100vh = 1.6 viewports of scroll, split four ways. */
  .pin-step { animation: pinStep linear both; animation-timeline: --pin; }
  .pin-step:nth-of-type(1) { animation-name: pinStepFirst; animation-range: contain 0%     contain 25.5%; }
  .pin-step:nth-of-type(2) {                               animation-range: contain 24.5%  contain 50.5%; }
  .pin-step:nth-of-type(3) {                               animation-range: contain 49.5%  contain 75.5%; }
  .pin-step:nth-of-type(4) { animation-name: pinStepLast;  animation-range: contain 74.5%  contain 100%; }
  @keyframes pinStep      { 0% { opacity: 0; transform: translateY(24px); } 18%, 82% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-24px); } }
  /* First step starts in place and only leaves; last arrives and then HOLDS —
     otherwise the first viewport of scroll is blank and the stage's exit shows
     lit Nodes beside nothing. */
  @keyframes pinStepFirst { 0%, 82% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-24px); } }
  @keyframes pinStepLast  { 0% { opacity: 0; transform: translateY(24px); } 18%, 100% { opacity: 1; transform: none; } }
}}
@media (prefers-reduced-motion: reduce) {
  .pin-step { animation: none !important; } .pin { min-height: 0 !important; }
  .pin-stage { position: static !important; height: auto !important; }
}
```
  Default markup = stacked blocks, so the fallback is complete with no JS. **One use: ProcessRail** — pin the Ledger terminal on the right while the four stages step on the left; `--sp-live` stays the terminal's driver. (Optional second: connected-banking How-It-Works.) Desktop only — viewport-heights of pinned content are a UX cost on phones.
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
| 1 | **Hero** `Hero.tsx` + `components/three/HeroLens.tsx` (replaces `HeroOrbit.tsx`) | D | `min-h min(92svh,920px)` on lg, content centred; `lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)]`; lens column bleeds 6% right (`lg:-mr-[6%]`, clipped by section `overflow-hidden`). New `.display-0` beside `.display-1` (L337): `clamp(2.75rem, 1.3rem + 5.2vw, 4.9rem) / 1.04 / -0.03em ≥800px`; `HERO.headline` `max-w-[14ch]`; lead 17px/1.65 `max-w-[54ch]` `--ink-inv-2` on plum flat. `HERO.eyebrow` → Droplet (the " · " separators become 3px dots at render; string untouched). CTAs: `variant="light"` (white pill, `data-magnetic`) + `variant="glass"` re-based on `.liq liq-spec-full liq-live`. **H1 + lead never reveal-gated** (LCP). New `band-hero` class carries `--grad-hero` + grain, retiring the hand-rolled grain div (L47–56). `data-surface="dark" data-hero="dark"` | Vessel (lens), Node ×3 chips (`liq liq-1 liq-refract`, aria-labels only, no new copy), Caustic ×2 (fallback backdrop), Seam bottom, Meniscus into Marquee | `.hero-recede`; `.scrub-drift` planes (`drift-lead` on the poster plate, +16…20 on chips); `[data-tilt]` 3° on chips; WebGL (Part F). RM: static, no canvas | Keep `Button`, `Reveal`, `HeroField` harness, `.hero-recede`, drift/float/tilt stack. Replace arcs → lens. Mobile: single column, type first, lens `aspect-[5/4] max-w-[420px]`, no tilt/loops |
| 2 | **LogoMarquee** | L (`--surface`) | as now (`py-10 md:py-12`); trust line → Droplet centred above | Droplet, Seam bottom | existing marquee + `--scroll-velocity` lead (L33, L81) | keep mechanics; RM native-scroll fallback kept |
| 3 | **WhoWeAre** | L (`--canvas`) | 12-col: heading `display-2` cols 1–4, `.liq liq-light` Vessel cols 5–12, `p-10 md:p-12`, radius 24; copy 18px/1.75 `--ink-2`, `WHO_WE_ARE.bold` `--violet-text` semibold | Vessel, Pool-light (keeps `.orb-hand-off` on the Pool element so the leg-2 hand-off survives) | Reveal 0/120; `.liq-spec` | recompose; mobile stacked `p-7` |
| 4 | **WhatWeDo** | D `band-a` + `.sheet-enter` | horizontal **manifold**: one Conduit runs the container width at ~35% height behind 3 `.liq liq-spec` cards `grid-cols-1 lg:grid-cols-3` (`--liq-pad: 40px`); `.liq-inset` Node icon top-left (replaces `grad-tile` L62); `num` as `ghost-num` watermark bottom-right (`text-[72px]`, `.drift-far`); title heading-3; body 15px `--ink-inv-2` | Conduit (`flow="scroll"`), Node ×3, Caustic ×1, Seam | RevealGroup step 110; conduit flow crosses all three cards over `--sp`; Nodes lit in sequence via `--sp` thresholds (ProcessRail `litStyle` pattern) | rewrite. Mobile: cards stack; Conduit `orientation="v"` in the left gutter |
| 5 | **Ecosystem** | L (`--surface`) | flanked constellation (POS L62–73) kept; hub `grad-fill` kept; chips → `.liq liq-light liq-1` pills with a leading 8px Node dot (replaces the 3px bar L220–224) | Conduit-SVG ×10: base stroke `--lavender-300` 1.5px + `.conduit-pulse` `stroke-dasharray="8 92"` with `--pulse-delay: i * -0.9s` — one packet per 6s | chips scale in from the hub-facing edge (kept); hub `rotate(calc(var(--sp) * 18deg))` (kept); pulses ≥1024 only | retune. `.eco-wire` → `conduit-pulse`; `.eco-hub` box-shadow pulse (off-compositor) → Node glow opacity. `grid-cols-1` mobile list kept |
| 6 | **Challenges** | D `band-b` + `.sheet-enter` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, 6 `.liq liq-sweep liq-enter` Vessels `p-7` radius 20; `.liq-inset` Nodes **dim** (glow .35, `data-lit` absent) — flow blocked; hover lights them (the "we solve it" beat) | Node ×6, Caustic ×1 (lower-left, matches `--grad-section-b`), Seam | RevealGroup 70 | restyle (12 → 6 blur layers). Text on `.liq-sweep` cards is `--ink-inv` |
| 7 | **WhyUs** | L (`--surface`) | vertical Conduit spine at `lg:left-1/2` the full height; rows alternate sides (`Reveal dir="left|right"`, ≥1024 only); ghost numeral 64px (`.drift-mid`), title 21px, body 15.5px `--ink-2`; band tints alternate (kept) | Conduit (`flow="scroll"`, `light`), Node ×4 light 12px on the spine, lit on the row's `[data-inview]` | spine flow tracks `--sp`; `.scrub-fade-side` ≥1024 | recompose. Mobile: spine at left gutter, single column |
| 8 | **StatBand** | **D `band-c`** | heading centred; `grid-cols-2 lg:grid-cols-4` of `.liq liq-spec liq-static-mobile` tiles `px-4 py-8 sm:px-6` radius 24; numerals `--ink-inv`, affixes `--lavender-400` (`odo-fix` spans), **labels `--ink-inv`** (they overlap the Pool). `LIVE_PILL` → Droplet row centred below | Pool ×4, Caustic ×1 centred low, Seam top, **Meniscus bottom** into ErpBand, Droplet | RevealGroup 90; `useOdometer` roll kept; Pool `scaleY` +120ms after digits land | rewrite; `ambient-violet` dropped (Caustic replaces it). Mobile 2×2 |
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
`lensLayout.ts` evaluates `makeRandom(20260812)` at module load (pure, identical on server and client), producing 5 `LensBlob` descriptors (`interface LensBlob` — not `Blob`, which would shadow the DOM global) `{ ax, ay, kx, ky, phx, phy, r, w }` plus derived `restX/restY` — the positions at `uFlow = 0`, exactly where the SVG draws them and where the scene boots.

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
| `uWake` | float 0→1 | per frame until 1 | one-shot 1.4s quartic **ease-in** `t^4` after first `start()` — ≈ 0 for the whole 900ms canvas fade (.005 at 300ms, .09 at 800ms, 1 at 1.4s) |
| `uPx` | float | resize | viewBox units per device pixel (analytic AA) |
| `uBackdrop` | vec4 | resize | canvas origin xy + section size zw in viewBox units (`--grad-hero` reproduction); the rect reads happen in the RO callback, never per frame |
| `uBlobA[5]`, `uBlobB[5]` | vec4[5] | **once** | from `lensLayout.ts` |
| palette | `#define` | compile | from `palette.ts` via `glsl()` |

`dt` clamped ≤ 50ms (tab resume never jumps). `resize()`: `setSize(w,h,false)`; letterbox ("meet") `s = min(w/500, h/400)` adjusting the ortho frustum around (250,200) so the camera matches the SVG's `xMidYMid meet`; `uPx = 1/(s·pixelRatio)`. Renderer: `alpha:true, antialias:false, powerPreference:"low-power"`, `setPixelRatio(min(dpr,1.5))`, `setClearColor(0,0)`. Material: `ShaderMaterial({ transparent:false, depthTest:false, depthWrite:false, blending:NoBlending })` writing **premultiplied** RGBA (the quad covers the frustum; the browser compositor does source-over).

## F4. Fragment shader outline (GLSL ES 1.00; three injects `precision highp float`)

*Design outline as written before the build. The shipped shader (`scene/liquidShaders.ts`) deviates where Part J says so — Phase 5's five deviations and the Phase 5 review fixes (the plate gradient and static pools of the rest pose, the optical-depth body, source-over hairlines/glints, alpha-solved premultiplied output, clamped dither) — and the code is authoritative.*

Noise lattice tiles with period `P = 16` and `uFlow` wraps at `T = 360` with every flow frequency an integer multiple of `2π/T` and advection exactly `P/T` cells/s — seamless wrap; WebGL2 mandates fragment highp, and the bounded arguments keep `sin` accurate regardless. No derivatives, no extensions. Maths in sRGB so palette hexes hit the screen exactly as the SVG's stops.

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
- **Wake:** `uWake` 0→1 over 1.4s on the first `start()` only, quartic **ease-in** (`t⁴`); at 0 the shader is the SVG's rest pose, and the ease-in keeps it there (≈ .005 at 300ms, .09 at 800ms) for the whole 900ms canvas fade, so the fade crossfades near-identical images and motion emerges only afterwards. (An ease-out was at .62 by 300ms with the canvas 90% opaque — the rest pose was never on screen.) Tab hide/show does not re-wake.
- **Rest:** everything is still ~1.2s after the last scroll; pointer settles in ~1s; no state is ever discontinuous.

## F6. Boot, dispose, quality

Boot: `WebGLRenderer`, `Scene`, `OrthographicCamera(0,500,0,400,-100,100)`, `PlaneGeometry(500,400,1,1)` at (250,200,0), one `ShaderMaterial`, one `Mesh`. No textures. `compileAsync` started immediately. Dispose: `stop()`; `disposed` flag cancels the compile continuation; `scene.clear()`; geometry/material/renderer `.dispose()`; remove context-loss listeners. **Adaptive quality:** if the median rAF interval > 20ms over 90 frames → `setPixelRatio(1.0)` + `resize()` once (floor 1.0; 0.75 softens the 1.2u rim line). Optional `webglcontextlost` (preventDefault + stop) / `restored` (resize + start).

## F7. Verification hooks (`scripts/qa/probe.mjs`)

Must stay true: hero canvas is the first `<canvas>`; opacity reaches `"1"` at 1440×900; lazy `three` chunk (L4 stays `import type`, L71 stays dynamic; `lensLayout.ts` never imports `three`); `drawElements` > 5 per 500ms visible, ≤ 1 hidden, > 5 resumed; opacity `!== "1"` at 390px and under RM; zero console errors (now also gates shader compile). **Add:** ≤ 35 draws/500ms as an absolute ceiling **and** one draw per scene frame as a ratio (`draws ≤ scene rAF callbacks + 1` in the same window — the ceiling alone cannot fail under swiftshader); **0 `bufferData`/`bufferSubData` after settle**; rAF callback median < 1ms at 4× CPU and p95 < 0.5ms native; GPU time < 2ms via `EXT_disjoint_timer_query_webgl2` when hardware GL is present (skip under swiftshader — and an M1 Max reading is a sanity check, not evidence for F1's integrated-GPU budget). In `layout.mjs`: the SVG lens ellipse's rect equals the canvas rect × 500/400 within 1px. The rest-pose match itself is measured against the poster with `?liquid=rest` (Part J, Phase 5 review fixes).

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
| 2 | `.liq*` classes + mobile/coarse/RM blocks; drift tiers; `sheet-shadow`, `pin*`, `.display-0`, `band-hero`, `.lens-*` keyframes; motif kit; `scene/lensLayout.ts`; CursorGlow selector; `ALLOWED_ANIM="ecoWire,conduitPulse"` (comma-separated — the gate's Python splits on `[,\s]+`); new `qa.mjs` ink-on-glass rule (proven able to fail at the first call-site phase) | `app/globals.css`, `components/motifs/*`, `components/motion/CursorGlow.tsx`, `scripts/qa/{gate.sh,qa.mjs}` | no call sites yet — so **`contract.py` entries land with each call-site phase** (it asserts defined AND wired). **Verify `@supports (backdrop-filter: url(#x))` false in Safari + Firefox** before phase 3 |
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
| Safari parses `backdrop-filter: url()` but renders nothing | Verify in phase 2; Chromium probe → `html[data-refract]`. **Still unverified after phase 3** — `caniuse-lite` and MDN BCD carry no `url()` sub-feature for `backdrop-filter`, so it could not be settled offline. Until a real Safari 18/26 + Firefox check lands (QA TODO, Part J), the pill's `@supports (backdrop-filter: url(#x))` block is Chromium-only by assumption, not by proof. |
| Chromium reference backdrop filter off the GPU fast path | ≤4 opt-in elements, desktop only, never animated; drop from chips if TBT moves. |
| Mobile blur budget | `.liq-1` no blur <1024; `.liq-inset`; `liq-static-mobile`; Ledger opaque; Caustics are gradients. |
| Meniscus reads as a 2010 wavy divider | ≤3 uses, amplitude ≤4% width; fall back to flat Seam. |
| Hero reads as lava lamp | Breathe ≥9s ±4px; violet-500→plum-700 only; no bubbles/ripples anywhere. |
| Caustics read as generic gradient-mesh | ≤2 per section, alpha ≤.24, scroll-drift only on mobile. |
| Ten pulsing conduits in Ecosystem feel busy | One packet per path per 6s, desktop only; if busy, pulse only the four nearest the hub. |
| "Dim Nodes" in Challenges read as broken UI | Glow .35, never grey icons; hover lights them; if it reads as disabled, glow .6 and drop the beat. |
| Metaphor fatigue for CFOs | Liquid implied by light + channels, never illustrated (no water, coins, waves). A section that can't use Conduit/Node/Pool without illustration uses Seam + Vessel only. |
| Pinned story support | `@supports` + ≥1024; stacked fallback complete; Firefox behind a flag — enhancement only. |
| `pixdiff` exit 2 | Expected; `--skip-pixdiff` during build; phase-0 captures for the human comparison; `layout.mjs` + `qa.mjs` stay hard gates. |
| `.liq` collision | Chosen over `.lg` precisely to avoid the `lg:` prefix hazard. |


---

# Part J — Implementation notes (decisions made during the build)

Recorded so later phases and reviewers don't re-litigate them.

**Phase 2 (`b4adff1`, reviewed):**
- `ALLOWED_ANIM` is **comma-separated**; the gate's Python now splits on `[,\s]+` so either form parses.
- `.band-hero` is a plain single-class rule (mirrors `band-a/b/c`), used as `class="section-dark band-hero"`.
- `.display-0` ships **flat** `-0.03em` (no 800px step) — hero-only; clamp is ≥ 3.5rem from ~680px.
- Ledger's mobile override is `.section-dark .terminal.ledger` (0,3,0) so it out-ranks the desktop rule; light sections fall back to `.terminal`'s opaque `--terminal`.
- `.seam-spec` is full-width with the 220px segment as a `background-size`, so the `%` translate spans the seam; `.seam-light .seam-spec` uses a `--line-violet` gradient (white is invisible on lavender). `<1024` hides the segment.
- `Caustic` with both `drift` and `loop` nests `.caustic.caustic-loop` inside `.caustic-wrap.scrub-drift.drift-*` (two transform animations can't share an element). **`x`/`y` are the top-left corner** — call sites compute centres.
- `conduitFlowV` keyframes exist for vertical loops; `.conduit-pulse` is `display:none` below 1024 and under reduced motion.
- `.sheet-shadow` is one element (`top:-40px; height:41px`); a parent `overflow:hidden` clips the upward part (CtaBand — acceptable).
- `Card` light **feature** is solid `bg-tint border-lavender-300 spotlight shadow-card`, not `.liq` (`.liq` sets `background-color` after Tailwind utilities, so `bg-tint` on a `.liq` would be a silent no-op). Light non-feature omits the flat border — the rim ring is the border (§A2). Dark feature renders **all** text `--ink-inv` (§A6).
- `Droplet` is a **capsule, not an Eyebrow**: a plain `<Eyebrow>` (`--ink-3`) inside `Droplet light` trips the ink-on-glass rule — recolour to `--violet-text`/`--ink-2` where it wraps one. Droplet has no `.liq-spec` (a 24px frame mask on a ~30px pill leaves nothing visible).
- `Node`: `light` → `node node-light` (no glass); `inset` → `node liq-inset`; default → `node liq liq-1`; `label` → `role="img"` + `aria-label`, else `aria-hidden`. Its entry `scale(.92→1)` is a **call-site `Reveal`** concern, not built into the component.
- `ConduitPath` (SVG conduit + optional pulse) is exported from `Conduit.tsx`.
- `.liq` lives in `@layer components`; with Tailwind v3 that block is subject to content purging and survives because `liq` appears in `components/motifs/*.tsx` — keep at least one motif using it.
- `.lens-caustic` / `.lens-glint` `<g>` elements must carry **no SVG `transform` attribute** (de-composites in Chromium).
- Later phases must add each newly **wired** class/token to `scripts/qa/contract.py` as its first call site lands; the ink-on-glass rule is proven able to fail at the first `.liq` call site (Phase 4).

**Phase 2 review fixes (follow-up to `c1b4d48`):**
- `.liq-enter` uses fill-mode **`backwards`**, not `both`: `both` kept the `to` keyframe's `transform: none` applied forever after the range and out-ranked `.liq-live:hover`, so the lift was dead. Independently, `.liq-live` is **exclusive on its element** with `.liq-enter`, `.scrub-drift`, `.card-depth` and `[data-tilt]` — nest a wrapper when you need both.
- The `transform` transition lives on **`.liq-live`**, not `.liq`: `Magnetic.tsx` writes `el.style.transform` every rAF for `[data-tilt]`, and a host transition eased every write into a rubbery tilt. Nothing transitions `box-shadow`.
- `Card href` renders a `next/link` `<Link>`, never a raw `<a>` — the RouteTransition view transition exists only for App Router client navigation.
- `Caustic` needs its parent to be a **stacking context** (`.section-dark` is; a light section adds Tailwind `isolate` or `relative z-0`), or `z-index:-2` drops it behind the section background.
- `lensLayout.ts` exports `interface LensBlob` (renamed from `Blob`, which shadowed the DOM global).
- The blur-budget escape hatch is **`.liq-static-mobile`** (renamed: the old `-sm` suffix read as a Tailwind breakpoint). `--liq-light-1/2/3-blur` tokens replace the literal light blur radii. `:root { --drift-scale: .5 }` sits beside the drift tiers, not in the `.liq` mobile block. The redundant mobile `.liq::before { backdrop-filter: none }` is gone — the ≥1024 query on `.liq-lens::before` is the only gate.
- `.pin-step` ranges use `:nth-of-type`; steps must be the only element children of `.pin-stage`.
- `--_*` custom properties are private to the material; call sites use the public `--liq-*` tokens. `.conduit-pulse`'s mobile `display:none` lives in the Conduit section of `motifs.css`. `.terminal` has no wet-edge layer — the Ledger row no longer claims one.

**Phase 3 (adaptive glass pill):**
- The pill's state is **one switch**: private `--_pill-*` custom properties (fill, ink, ink-hover, ink-active, mark, rim, thumb, cta-bg, cta-bg-hover, cta-ink, seam) set by a single dark rule; rim, links, CTA, logo/burger, thumb and seam only read them. Same result as the per-descendant `[data-over="dark"]` rules in Part B, but one specificity contest, no dark override on any descendant, and the no-JS baseline covers every piece.
- The dark rule is `:is(.chrome-pill[data-over="dark"], .chrome-header:has(~ main [data-hero="dark"]) .chrome-pill:not([data-over]))`. `:is()` is a **forgiving** list, so a browser without `:has()` drops that arm instead of the whole rule (a plain selector list would be invalidated wholesale, and a minifier could re-merge two separate rules). Its specificity is the max arm, (0,4,1); the `@supports not (backdrop-filter)` fallback repeats the selector verbatim so it still out-ranks it.
- `<header>` carries `chrome-header` (it had no class); `<main>` is its later sibling in both layouts, so the `~ main` baseline actually matches.
- Logo link and burger get **`chrome-mark`** (`--plum-950` light / `--ink-inv` dark). Both draw in `currentColor`, and without a hook the Tailwind `text-plum-950` / `text-plum-900` utilities would have left a plum mark on the plum pill. The pill's own `color: var(--ink-2)` stays as the inherited default. `chrome-header` and `chrome-mark` are in `contract.py` alongside the three hooks Part B names.
- `--thumb-w` is published **unitless** (`${width}`), so the dot's x is `calc(var(--thumb-x) + var(--thumb-w) * 0.5px - 3px)`; `translate3d` keeps the compositor hint. The override is `.chrome-pill .nav-thumb` (0,2,0) in `chrome.css` §2 — `globals.css` is untouched. **`--thumb-o` now defaults to 0** there: without `scaleX(0)` an unpublished thumb would paint a stray dot at x = −3px before `publish()`; `publish()` always writes 0 | 1, so the default is only seen pre-hydration.
- `isolation: isolate` on the pill (as on `.liq`) so `::before` (rim) and `::after` (elevation) sit above the translucent fill in the no-backdrop-filter fallback too; with backdrop-filter active it is a no-op.
- The seam is a child `<span class="chrome-seam">` inset 22px from each end (inside the radius), on the same `chromeElevate` / `scroll(root block)` 0–120px ramp as `::after`, the same `[data-stuck]` / `[data-menu]` fallback, and the same §6 reduced-motion drop.
- Dark CTA hover is `--lavender-200` (undefined in Part B; `--plum-700` on it is ~10:1).
- `contract.py` now reads **every stylesheet `app/layout.tsx` imports** (`globals.css`, `chrome.css`, `motifs.css`) plus `tailwind.config.ts`; previously only `globals.css` + Tailwind, so any `chrome-*` hook would have been an orphan by construction.
- **`@supports (backdrop-filter: url(#x))` remains unverified** in Safari/Firefox: `caniuse-lite` (no notes) and MDN browser-compat-data (no `url()` sub-feature for `backdrop-filter`) cannot answer it offline. The pill's rule ships with a `TODO(v4-phase3)`; Part I's `html[data-refract]` Chromium probe is the fallback if Safari parses-but-doesn't-render.
- The mobile sheet has **no rim ring** (corrected in the phase-3 review fixes below — the original note claimed "only its top edge is ever visible", which is false once the sheet overflows). Its liquid-glass dressing is `--liq-light-shadow` alone; that token's `inset 0 1px 0 rgba(255,255,255,.95)` layer is the top highlight, painted on the non-scrolling box.
- **Part B's observer snippet has a latent crash:** `rootMargin: \`-${y}px 0px -${innerHeight - y - 1}px 0px\`` produces `--Npx` when the viewport is shorter than the pill's centre (collapsed window, a viewport mid-resize reporting 0), and `new IntersectionObserver` throws `SyntaxError: rootMargin must be specified in pixels or percent` — an uncaught throw in an effect unmounts the whole tree (Next's "Application error" screen). The shipped effect clamps both insets at 0 and wraps construction in try/catch that falls back to the CSS `:has(data-hero)` baseline. The gate's headless viewports never hit it; the Browser-pane viewport emulation did. Do not copy the spec snippet verbatim into later observers.
- Build isolation (`5f4ca7a`, landed mid-phase after a Browser-pane `next dev` on :3000 shared `.next` with the gate): `next.config.ts` exports a phase function so `next dev` writes to **`.next-dev`** while `next build` / `next start` keep `.next`; `.gitignore` ignores `/.next-dev/`. The gate's port check still applies — a dev server no longer corrupts the build, but it still contends for the ports and for `.next-dev`-vs-`.next` type paths in `next-env.d.ts`.

**Phase 3 review fixes (follow-up to `1030fc4`):**
- **`data-over` is reset in a `useLayoutEffect` cleanup**, not the observer's passive cleanup. A Next `<Link>` navigation is a transition update, so a passive cleanup ran after the browser could already paint the new `<main>` with the previous route's state on the pill (`/services` scrolled to a light section → `/about` painted a light pill over the plum hero). The layout cleanup runs synchronously in the commit, so the CSS `:has(data-hero)` baseline decides the first frame of every route; the observer (still created in the passive effect, keyed on `pathname`) takes over on its first delivery. The observer callback also ignores deliveries from an instance that is no longer the live one (`self !== io`), since a disconnected observer can still flush already-queued entries.
- **The observer band deviates from Part B's "1px band at the pill's centre"**: it is the pill's full height (`top` inset = pill top, bottom inset = `clientHeight − pill bottom`), and the bottom inset is measured against **`document.documentElement.clientHeight`**, not `window.innerHeight`. The implicit root's bounds are the layout viewport (`clientHeight`), which excludes a classic scrollbar and differs from `innerHeight` on iOS with the dynamic toolbar; any ≥1px mismatch collapsed the 1px band to nothing and every target reported `isIntersecting:false` → `data-over="light"` everywhere, silently. The pill-height band tolerates drift. Both `≥0` clamps and the try/catch from the earlier note stay; the catch now `console.warn`s outside production.
- **`.chrome-sheet::before` is gone.** `.chrome-sheet` is the scroller, so an `absolute; inset: 0` pseudo sized to the scrollport and travelled with the content — on phones where the menu overflows, the ring's violet-tinted bottom edge rose through the list as a stray hairline. `box-shadow: var(--liq-light-shadow)` stays; its inset top highlight is the only rim edge a full-bleed sheet could show anyway.
- **One crossfade.** `.chrome-mark, .chrome-nav-link, .chrome-cta` transition `color` / `background-color` over `--dur-menu` / `--ease-out-expo` (chrome.css §1b); the JSX no longer carries `transition-colors duration-ui` (200ms) on the links/CTA. `.chrome-pill .nav-thumb` restates B0's `transform` / `opacity` transitions (shorthand — a bare `background-color` entry would have dropped the spring) and adds `background-color` on the same clock. **Consequence:** the first-placement rule had to become `.chrome-pill .nav-thumb[data-animate="false"]` (0,3,0) — at (0,2,0) it was only winning because `.chrome-pill .nav-thumb` declared no `transition`; once it does, source order would have let the thumb spring in from x=0 on every load. The rule keeps only the `background-color` fade (no spring, no fade-in), so a tone flip before the first route change still crossfades with the pill. Hover on links/CTA now rides the 320ms declaration too. `globals.css` untouched.
- `contract.py` strips `/* … */` from the `.css` files before its substring `defined` test — chrome.css's header comment lists every §1b hook by name, so a deleted rule read as defined. `.css` files only: `tailwind.config.ts` has `/*` inside its content globs. Proven able to fail (a commented-out `.chrome-seam` rule → `ORPHAN class .chrome-seam`). Its docstring now records that "defined but unused" only fails for `JS_WIRING` / `[data-tilt]`, not the class/token lists (pre-existing).
- §1b's comment no longer claims the colour transitions "never fire during load": in a browser without `:has()` the baseline arm is dropped, so a dark-hero route paints light and fades to dark over `--dur-menu` at hydration. Lighthouse's browsers all have `:has()`, so no trace sees it.
- **Review item 9 (recorded, not fixed):** the pill's `@supports not (backdrop-filter: blur(1px))` fallback sends prefix-only Safari 16–17 (which support only `-webkit-backdrop-filter`) to the opaque fill — the same form and the same consequence as `.glass` / `.liq` in `globals.css`. A `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` sweep across all three is a separate follow-up, not a phase-3 change.
- **QA TODO (phase 3 → before phase 10):** verify `@supports (backdrop-filter: url(#x))` is false in Safari 18/26 and Firefox on real browsers (chrome.css `TODO(v4-phase3)`, Part I row). If Safari parses-but-doesn't-render, gate the pill's refraction behind `html[data-refract]` from the Chromium probe.
- `Hero.tsx`'s grain comment said `.section-dark::before`; `globals.css` puts the grain on `.section-dark::after`. Comment corrected only.

**Phase 4 (hero rebuilt around the lens):**
- **`HeroLens.tsx` is the whole hero without WebGL.** Every coordinate and every shared rim/chip constant is read from `scene/lensLayout.ts` (`VIEW`, `LENS`, `RIM`, `CHIPS`, `CHIP_SIZE`, `GLINTS`, `CAUSTICS`, `BLOBS`, `BLOB_DRAW_SCALE`); what stays literal in the file is per-layer dressing the shader does not share (gradient stops, opacities, stroke widths). Blobs are `<circle r={r·BLOB_DRAW_SCALE}>` (one radius, so not `<ellipse>`), clipped to the lens ellipse. The rim annulus is one `fill-rule="evenodd"` path (outer + inner at −`RIM.w`). Gradient stops take `var(--violet-500)` etc. through `style={{ stopColor }}`, fills/strokes through presentation attributes; both forms resolve `var()` (presentation attributes are parsed as CSS in every engine), the split is only the motif kit's attribute convention vs. one helper object carrying stop-color + stop-opacity.
- **The animated `<g class="lens-caustic|lens-glint">` carry no `transform` attribute**; the glints' rotation is on each inner `<ellipse>` (`rotate(rot cx cy)`).
- **Chip centres** land on the viewBox points at any rendered size: the wrapper's `left/top` is `calc(<centre %> − 26px)` computed from `CHIPS`, not a percentage of the corner. The chips keep the previous staggered parallax (+20/+16/+18px) as inline `--drift-range` — none of the tiers (7/14/22) matches, and uniform ranges would lose the de-synchronised read. The poster plate is `scrub-drift drift-lead` (−22px, matching the old inline value).
- **The Node is `liq liq-1 liq-refract` + `[data-tilt]` and must never gain `liq-live`** (exclusive on one element); drift and float live on the two wrappers exactly as before.
- **Poster hand-off rule** (`.hero-lens[data-live="true"] [data-poster]`) lives in the "Hero lens idle motion" block beside `.lens-caustic`, not literally beside `.hero-recede`: `.hero-recede` is inside `@supports (animation-timeline: view())`, and the fade must not depend on scroll-timeline support. `data-live` is unset until Phase 5; no fade fires in Phase 4.
- **Seam + Meniscus** sit in-flow inside one `absolute inset-x-0 bottom-0` wrapper (Seam first, so it is spatially above the Meniscus). Two reasons: `.seam` sets `position: relative` in `motifs.css`, which out-ranks a Tailwind `absolute` on the same element; and a Seam at literal `bottom-0` would be under (or over) the Meniscus' white `--surface` fill — invisible either way. Stacked, the hairline is a visible rim across the plum with the surface curve rising beneath it. The pair is 33/57/81px tall; the section's bottom padding (80/112px) keeps it clear of the CTA row and the lens. Neither has a `--sp` driver on the hero, so the seam's specular segment stays parked and the meniscus line rests at .3 — decoration fails closed, as designed.
- **Droplet eyebrow:** the four `HERO.eyebrow` parts render inside ONE inline `<span>` with aria-hidden 3px `bg-lavender-400` dots (and literal spaces around them for assistive tech) — not as flex items. `.droplet` is `inline-flex` without wrap, so flex-item parts would have overflowed at 390px; as one text run the label wraps like the old capsule did. Text is `--ink-inv-2`; the walk measured it clean on `band-hero` (hand arithmetic compositing both blooms over plum-800 predicted ~3.9–4.2, but the walk's actual composite passes — kept per the card, `--ink-inv` is the fallback if a later band change tips it).
- **`band-hero` replaced `bg-[var(--plum-900)]` + the two hand-rolled divs.** `--grad-hero` carries its own opaque plum base layer, so the shorthand-reset `background-color` of `.section-dark` is not a problem. The hero is now a real `.section-dark` (grain via `::after`, inverted ink, plum scrollbar/selection, and the stacking context the motifs rely on).
- **Lens column bleed** is `lg:w-auto lg:-mr-[6%]`: with an explicit `w-full` the negative margin does not widen the box, so the bleed would be a no-op. Mobile `max-w-[420px]` lives on the Hero-side wrapper; `HeroLens` keeps its `max-w-[560px]` box (no CLS vs. HeroOrbit).
- **`Button variant="glass"`** is `liq liq-spec-full liq-live rounded-pill …`, `--ink-inv` text. Cascade note: `.btn-spring` (later in `globals.css`) out-ranks `.liq-live`'s `transition` at equal specificity and `.btn-spring:active:not(:disabled)` (0,3,0) out-ranks `.liq-live:active` (0,2,0), so the press is .97 (not .985) on btn-spring's own `--spring-snappy` list — visually the same physics; `.liq-live:hover` lift applies (btn-spring has no hover transform); `[data-magnetic]` writes `translate`, which composes. No CSS change needed. `CtaBand` inherits the change (its glass CTA is `--ink-inv` too).
- **Blur budget measured** (computed `backdrop-filter !== none` inside the hero + pill): **390px = 2** (glass CTA + pill; chips and Droplet are `.liq-1`, unblurred <1024), **1440px = 6** (Droplet + glass CTA + 3 chips + pill). Part E row 1 states no blur count; the "5" (glass CTA + 3 chips + pill) was the orchestrator's task-card estimate, and it omitted the Droplet, which as `.liq-1` blurs ≥1024. Within §A7's ≤ 8.
- **Ink-on-glass rule proven able to fail** at this first `.liq` call site: a temporary `<span class="text-ink-inv-3">xx</span>` inside a chip produced `✗ ink on glass: 1` — `/ div.scrub-drift.absolute > div.chip-float > span.node.liq > span.text-ink-inv-3 uses --ink-inv-3 inside liq liq-1 liq-refract "xx"` — across all 4 viewports (and the contrast walk independently scored it 3.32:1). Note the walk's `textEls` filter needs `trim().length > 1`: a single `x` is invisible to both rules and would have "passed" vacuously.
- **`contract.py`:** `caustic` is deliberately not listed (the hero's caustics are SVG ellipses inside `.lens-caustic`; no DOM `<Caustic>` yet). It reads `git ls-files`, so a new file must be `git add -N`'d before its first run or the file is skipped silently.
- **Left in place on purpose:** `scene/createHeroField.ts` still mentions HeroOrbit in three comments and still draws its arc pulses over the lens (Phase 5 deletes it — this phase must not touch `HeroField.tsx`/`createHeroField.ts` so the WebGL probe stays meaningful); `README.md` L50/L124 still describe HeroOrbit (docs are Phase 10). `layout.mjs`'s "SVG lens rect equals the canvas rect" check is Phase 5.
- **Gate (`--since main --skip-pixdiff`): PASSED**, qa verdict all zeros over 52 page-views, `/` composited audit 0 disallowed (TBT 22ms, perf 95, CLS 0) with `heroRecede`, `scrubDrift`×4, `lensCausticSway`, `lensGlintFloat`, `chipFloat`×3 all running at the 412px trace size — so the zero is not vacuous. WebGL probe 16/16 with the old scene still mounted (canvas 546×437, three as a lazy chunk). LCP element is the lead `<p>` on mobile and the `display-0` H1 on desktop — neither reveal-gated.

**Phase 5 (liquid-lens WebGL hero):**
- **Scene = `scene/createHeroLiquid.ts` + `scene/liquidShaders.ts`** (F1/F6 as written: one `PlaneGeometry(500,400)`, one `ShaderMaterial`, one indexed draw, no textures, no per-frame uploads; the only per-frame DOM touch is the `--scroll-velocity` string read). `createHeroField.ts` is deleted; `HeroField.tsx` changed only its type import, the dynamic import, the header sentence, and gained the `data-live` promotion as a `[live]`-keyed effect that removes the attribute on unmount.
- **Camera stays F6's y-down `OrthographicCamera(0, 500, 0, 400)` — with `side: DoubleSide`.** three's `PlaneGeometry` pushes `(x, −y)` with `uv.y = 1` on its local *top* edge, which the y-down frustum shows at the screen bottom, so `vUv · VIEW` is SVG y-down with the passthrough vertex shader exactly as F4 assumes (verified by screenshot: key glint upper-right, cluster biased low, rim coincident with the poster's ellipse). The same y-flip reverses the triangle winding; `FrontSide` would back-face-cull the whole quad.
- **The shader reads its geometry from `lensLayout.ts`** — `VIEW`, `LENS` (CEN/RAD), `GLINTS` and (since the phase-4 review fixes) `RIM` (`RIM_W`/`RIM_IN`) are injected into the template alongside the palette/`LIQUID` `#define`s — so nothing is hand-copied twice. Glint rotations are the exact `GLINTS` degrees (0.4887 / −0.4189 rad), not F4's rounded 0.5 / −0.4.
- **Deviations from F4's GLSL, each for a stated reason:**
  1. **Body transfer curve.** F4's `body = smoothstep(0.75, 1.35, m)` + `mix(liquid, plum700, smoothstep(1.9, 2.8, m) · .35)` rendered a flat, opaque magenta amoeba with a darker core — the "ring" read F1 rejects — and nothing like the Phase-4 poster at the crossfade. Measured against `BLOBS` at rest: 56% of the lens interior has `m > 0.75`, 33% has `m > 1.35`, and the `1/(d²+1)` kernel spikes to `m ≈ 1400` at each blob centre, so any darkening keyed to `m` blackens exactly the points the poster paints brightest. The poster's composited alpha along the cluster's centre row is 0 at `m ≈ 2`, .41 at 3.1, .58 at 4.2, .95 at 11; `body = 1 − exp(−max(m − 1.8, 0) / 2.6)` fits it to within a few points everywhere (.39 / .59 / .97). Shipped: that curve, the colour ramp `mix(violet600, violet500, smoothstep(2, 8, m))` (violet-600 thin edge → violet-500 dense core, as the poster's radial stops), and **no plum-700 darkening** (`C_PLUM700` was left defined-unused until the Phase 5 review fixes gave it the plate gradient). The lens now wakes from a soft translucent cloud, densest at the overlaps. **Superseded in the Phase 5 review fixes** by an optical-depth body that is the poster's composite by construction (below) — this curve matched the cluster's centre row and read ~30% tighter than the poster's discs everywhere else.
  2. `smoothstep(60.0, −120.0, q.x)` has `edge0 > edge1` (undefined in GLSL) → `1 − smoothstep(−120, 60, q.x)`.
  3. **The T = 360s wrap is now actually seamless.** F4 asserted it, but `fbm2`'s second-octave lacunarity 2.03 (a shift of P becomes 32.48 cells) and the caustic advection `adv · 1.6` (25.6 ≡ 9.6 mod 16) both jumped at the wrap. Shipped: lacunarity 2.0, caustic advection `adv · 2.0`; and `uTime` also wraps at T, with the breathe / glint-wander frequencies as harmonics 23 / 18 / 13 of `2π/T` (0.401 / 0.314 / 0.227 rad/s for F4's 0.4 / 0.31 / 0.23) so no argument ever grows.
  4. **`breathe` is 1.0 at t = 0.** F4's `0.85 + 0.15·sin(·)` boots the rim line at .34 × .85 — 15% dimmer than the SVG's `#hl-rim` — contradicting the rest-pose guarantee it serves. Shipped: `0.925 + 0.075·cos(·)` (range .85–1.0, equal to the SVG at boot; still a 15% breath). The key glint's wander uses `sin` on both axes so it is (0, 0) at t = 0 (F4's `cos` on y placed it 4u low at boot).
  5. `KEY` is a literal `vec2(0.5524, −0.8336)` — GLSL ES 1.00 does not allow built-in calls in `const` initialisers. `sdEllipse` nudges `|p|` by 1e-4 and the normal is `n /= max(length(n), 1e-6)`: both were 0/0 (a NaN fragment) at the exact centre pixel.
- **Factory:** `scene`/`camera` `.matrixWorldAutoUpdate = false` after one `updateMatrixWorld(true)`, `renderer.sortObjects = false` — nothing in the graph moves. Context loss pauses the loop without touching `running` (the harness's intent); `schedule()` gates on `running && ready && !disposed && !lost`. `uBackdrop` is read from `getBoundingClientRect` in `resize()` only, so it carries the drift wrapper's translate at that moment (≤ 22px in a ~900px gradient — invisible, and refraction hides more).
- **`probe.mjs`, three hardening lessons, all proven able to fail or calibrated on data:**
  - **`Log.entryAdded` never carried `console.error`.** An injected `console.error` arrived only as `Runtime.consoleAPICalled`; the old "no console errors" line could not have seen `THREE.WebGLProgram: Shader Error`. Now `collectErrors()` reads Log + consoleAPICalled(error) + exceptionThrown. Proven: a planted undeclared identifier produced `FAIL desktop: no console errors (incl. shader compile) [console: THREE.WebGLProgram: Shader Error 0 - VALIDATE_STATUS false … ERROR: 0:196: 'undefinedIdentifierForPro…]` with every other line green.
  - **Swiftshader links the full-quad shader ~4.5–5.6s after the 5.2s settle** (LLVM JIT; hardware GL is live inside the settle). The fixed `sleep(3500)` before the opacity check is a poll bounded at 12s — window widened, bar unchanged.
  - **Swiftshader also exposes `EXT_disjoint_timer_query_webgl2`**, so "available ⇒ measure" would have asserted on ~40ms software frames. The GPU check is its own `gl: false` session (headless Chrome reaches the machine's GPU where there is one — here ANGLE Metal / M1 Max) with explicit SKIP notes for no-WebGL, a software renderer string, or no extension. **Asserted on the median:** ANGLE-Metal `TIME_ELAPSED` is command-buffer wall time, not shader time — 156k → 239k fragments (+53%) left the median flat at 0.8–0.9ms and the minimum is 0.07–0.09ms — so it bounds the frame from above; p95 (1.7–2.4ms) is GPU wake/scheduling jitter and is printed, not asserted.
  - **rAF cost: median at 4× CPU (< 1ms) + p95 with the throttle lifted in the same session (< 1ms)**, instead of F7's p95 at 4×. Chrome throttles by suspending the main thread in slices: idle callbacks (Lenis etc., median 0ms) show p95 0.5–0.6ms at 4×, and the scene's p95 swung 1.1 → 1.4 → 1.2ms across runs while its median held at 0.5–0.7ms. p95 of a throttled callback measures the slice, the median measures the callback. Native: **0.1ms median / 0.2ms p95** on both software and hardware GL. Every callback is timed (wrapper installed via `addInitScript`); a callback is the scene's iff it issued a GL draw.
  - `≤ 35 draws / 500ms` (measured 9–12 under swiftshader, 30 on hardware) and `0 bufferData/bufferSubData over 1s` (with the draw count in the same window printed, so the zero is not vacuous). The suite now uses `reporter()` (exit 2 on zero assertions); SKIPs are printed, never counted.
- **`layout.mjs`:** the registration check maps the body `<ellipse>`'s own `cx/cy/rx/ry` through the canvas rect's `meet` letterbox using the `<svg>`'s `viewBox`, and compares with the painted rect (≤ 1px). Reading the SVG's numbers rather than re-typing `LENS` keeps the test independent of the very file it guards. `data-lens-body` on the ellipse is HeroLens.tsx's only Phase-5 edit.
- **Shader size:** ~125 GLSL lines (main ≈ 60). ALU is fbm-dominated: four `fbm2` calls = 32 `hash21` evaluations ≈ 500 of an estimated ~700 ops/fragment — above F1's ~300 guess. Measured fragment cost is at the ~0.07–0.09ms floor on an M1 Max at 546×437; if an integrated-GPU measurement ever runs hot, the first lever is collapsing the two warp `fbm2`s into one (≈ −125 ops), not the DPR.
- **Left for Phase 10 docs:** `createHeroField` is still named in comments in `HeroLens.tsx` L40 and `lensLayout.ts` L17/L75 (both outside this phase's edit permissions) and in `README.md` L50/L124 — the three code comments were corrected in the phase-4 review fixes below; `README.md` remains Phase 10's. `layout.mjs` is **not invoked by `gate.sh`** (pre-existing; Part I calls it a hard gate) — it was run standalone for this phase; wiring it in is a gate.sh change for the orchestrator.
- **`layout.mjs` (standalone, 52 page-views):** `hero lens registers with its WebGL canvas … Δ(cx,cy,w,h)={0,0,0,0} max=0px` — and proven able to fail: a canvas stretched to 92% width reads max=25.86px. The same run reports **22 text-overlap findings** ("LinkAPI Tech" footer heading × CtaBand / legal text at mobile+tablet on 12 routes; `/privacy` anchor headings × "10Changes to This Policy" at laptop+desktop) and **3 sub-10px labels** on `/industries` (the 9.5px mock chrome). None touches the hero, all sit at viewports or on routes where the scene never mounts, and Phase 5's only painted-DOM change is the canvas ≥ 1024 on `/` — pre-existing, unnoticed because the gate does not run this script. **Orchestrator to triage** (footer curtain / `.chrome-main` opacity, and `Mocks.tsx` label size).
- **Gate (`--since main --skip-pixdiff`): PASSED**, probe 21/21 (GPU median 0.60ms / min 0.08ms on the M1 Max; rAF median 0.4ms at 4×, p95 0.2ms native; 9–11 draws/500ms under swiftshader; 0 uploads with 33 draws in the window), `/` composited audit 0 disallowed (TBT 22ms, perf 95) — unchanged from Phase 4, i.e. the scene costs the mobile trace nothing (it never mounts < 1024).

**Phase 4 review fixes (follow-up to `ebcee2d`, applied after Phase 5 `50926aa`):**
- **The rim, chip and blob-draw constants are single-sourced.** `lensLayout.ts` now exports `RIM = { w: 16, inner: 9 }`, `BLOB_DRAW_SCALE = 1.15` and `CHIP_SIZE = 52`; `HeroLens.tsx` imports them (its local `CHIP`/`RIM_W`/`RIM_INNER` and the bare `1.15` are gone), and `liquidShaders.ts` injects `RIM` as `const float RIM_W, RIM_IN` beside `CEN`/`RAD` — `rimT`'s `smoothstep(-16.0, …)` and the inner-reflection band's `abs(d + 9.0)` were hand-copied literals. `f()` emits `16.0`/`9.0`, so the compiled GLSL evaluates identically (GLSL ES 1.00 has no int→float promotion; a bare `16` would not compile). `BLOB_DRAW_SCALE` had no shader counterpart at the time (the body curve was fitted to the poster's *composited* blobs, Phase 5 deviation 1); since the Phase 5 review fixes it is injected as `BLOB_SCALE` — the depth kernel is parameterised on the drawn radius.
- **`.lens-caustic`'s `transform-origin` moved out of `globals.css`** — it was a third literal copy of the lens centre. The keyframes and `transform-box: view-box` stay in CSS; the origin is `style={{ transformOrigin: \`${LENS.cx}px ${LENS.cy}px\` }}` on the `<g>` in `HeroLens.tsx`. `transform-origin` is not `transform`: the no-`transform`-attribute rule is untouched, `cascade.mjs` reads only inline transform/translate/rotate/scale, and the `/` composited audit is the proof the group still composites.
- **`HeroLens` takes `idPrefix` (default `"hl"`)**, threaded through every SVG `id` and every `url(#…)`/`clipPath`. SVG ids are document-global, so Phase 9's compact About lens must pass its own prefix or the two lenses would paint with whichever `<defs>` the browser resolved first. Deterministic (no `useId`) so server and client markup match.
- **Part E row 1's "chips scale in on `--spring-gentle` 200/260/320ms" is dropped** (phrase removed from the row). Any one of three reasons suffices: (1) the chip stack is already three nested transforms, one per concern — `.scrub-drift` scroll parallax → `.chip-float` idle float → `[data-tilt]` written by `Magnetic.tsx` on the Node — none of which can also host an entry animation (both wrappers animate `transform` by keyframes/scroll-timeline; the Node's transform is an inline write), so any entry needs a fourth nested element; (2) the only ready-made entry, `Reveal`, is opacity + `translateY(24px)` on `--ease-out-expo`, not a scale on `--spring-gentle`, so it would ship a different motion from the one the row names; (3) `[data-reveal]` holds `opacity: 0` until hydration + IntersectionObserver, which would make the chips — part of the poster composition, positioned on `CHIPS` viewBox points — the only hero elements that cannot paint from the server, against the "Hero — the no-WebGL composition stands alone" paragraph, which lists the chips without an entry and governs. Revisit only with a CSS-only, wrapper-free scale entry.
- **Part E row 1's "Conduit ×2 short stubs to the ports" is dropped** (phrase removed). The governing "no-WebGL composition stands alone" paragraph enumerates the SVG layers and the chips with no conduits, and the shader has no counterpart, so stubs would have been poster-only marks that vanish at the 900ms hand-off.
- `HeroLens.tsx`'s stop-colour comment no longer claims `style` is needed "so a `var()` is guaranteed to resolve" — the rim's `fill="var(--plum-950)"` presentation attribute on the next layer already relied on the opposite; one story now (both resolve, the split is convention + the stop-opacity helper). The three stale `createHeroField` mentions (`HeroLens.tsx` header, `lensLayout.ts` ×2) now name the WebGL scene (`scene/createHeroLiquid.ts`) or the retired file in the past tense.
- `Hero.tsx`: the eyebrow `Fragment` keys are the index (a static list split from one string); `relative isolate` dropped from the section (`.section-dark` declares `position: relative; isolation: isolate` itself); the dot spacing is `mx-1` — with the literal spaces either side, `mx-1.5` measured ~10px per gap against the old capsule's ~4px.
- **`.sheen` is not dead** — the review's premise was wrong: `git grep sheen -- '*.tsx'` finds four live call sites (`about/page.tsx` L113, `solutions/page.tsx` L37, `Challenges.tsx` L30, `WhatWeDo.tsx` L36). `Button` dropped it; the section cards have not yet. So it is **not** listed for the Phase 9 alias sweep; it retires as those sections are rebuilt on `.liq-sweep` (Part E rows 4/6, Part D iv).
- `contract.py` `TOKENS` gains `--liq-1-fill`, `--liq-1-blur`, `--liq-2-fill`, `--liq-2-blur`, `--liq-spec` (all defined in `:root`, all read by the recipe) — the Phase 4 comment claimed a complete list and was not.
- **Gate (`--since main --skip-pixdiff`): PASSED** — qa verdict all zeros over 52 page-views; WebGL probe **21/21** with the injected `RIM_W`/`RIM_IN` (no shader-compile error; GPU median 0.97ms / min 0.084ms on the M1 Max, rAF median 0.5ms at 4× and p95 0.2ms native, 7–15 draws/500ms, 0 uploads with 45 draws in the window); `/` composited audit 0 disallowed (TBT 21ms, perf 95) — unchanged from Phases 4/5, so the inline `transform-origin` did not de-composite `.lens-caustic`. `layout.mjs` (standalone, 52 page-views): lens registration `Δ(cx,cy,w,h)={0,0,0,0} max=0px`; its 23 text-overlap / 3 sub-10px findings are the pre-existing footer-heading × CtaBand/legal pairs, the fixed pill measured over `content/home.ts` L115 body copy at laptop/desktop, and `/industries`' 9.5px labels (the count moved 22 → 23 since the Phase 5 run) — no listed pair involves hero copy (`HERO.eyebrow/headline/sub`, CTA or chip labels), and nothing in this fix paints outside the hero. Still orchestrator triage.

**Phase 5 review fixes (follow-up to `50926aa` / `279024a`):**
- **The WebGL probe no longer touches the scene's canvas.** `HeroField.tsx` called `canvas.getContext("webgl2")` on the very canvas it later handed to three; a canvas returns its existing context on every later `getContext()` and ignores that call's attributes, so three's `antialias: false` / `powerPreference: "low-power"` were silently dropped (MSAA on, default GPU). Proven in-browser: a second `getContext('webgl2', { antialias: false, powerPreference: 'low-power' })` on a canvas that already holds a context reads back `antialias: true, powerPreference: "default"`; on a fresh canvas, `false` / `"low-power"`. The probe is now `document.createElement("canvas").getContext("webgl2")`, released at once via `WEBGL_lose_context` (Chromium caps live contexts at 16 and a route can mount that often; loseContext on the throwaway logs nothing — 0 console warnings across the rest-pose runs), and the live scene's `getContextAttributes()` reads `antialias: false, powerPreference: "low-power"`. The `webgl` / `experimental-webgl` fallbacks are gone: three r0.185 is WebGL2-only, so a WebGL1-only page would have booted onto a canvas three then throws on; without WebGL2 the SVG poster is the hero. Every other gate is byte-identical.
- **`dispose()` inside the compile window no longer throws.** three's `compileAsync` polls `properties.get(material).currentProgram.isReady()` every 10ms via `setTimeout` while `KHR_parallel_shader_compile` is present (`checkMaterialsReady` in three.module.js); `renderer.dispose()` → `properties.dispose()` empties that WeakMap, so the next poll dereferenced `undefined.isReady` — an uncaught `TypeError` on unmount during a fast navigation off `/`. The promise is kept (`const compiled = …`); `dispose()` sets `disposed = true` at once (start()/frame() inert), removes the context-loss listeners, and runs the GL `teardown()` synchronously if `ready`, else `compiled.then(teardown, teardown)`.
- **Wake is a quartic ease-in (`t⁴`), not an ease-out** (orchestrator decision; F3's row and F5's bullet updated). The ease-out was at .62 by 300ms with the canvas already 90% opaque, so the rest pose the whole hand-off is designed around was never actually on screen; `t⁴` holds ≈ 0 through the fade (.005 at 300ms, .09 at 800ms, 1 at 1.4s).
- **The rest pose is colorimetrically the poster — measured.** New QA affordance: `?liquid=rest` pins `uWake = uTime = uFlow = uVelocity = 0` and the pointer at (0,0) for the page's life (read once at boot in `createHeroLiquid.ts`; harmless in production — the frame renders, it never wakes). The measurement (a scratch `restdiff.mjs` on the repo's CDP driver: hardware GL, 1440×900, poster idle keyframes / drift / transitions off, chips hidden, a canvas-only and a poster-only capture over the lens ellipse's bounding box — 323×288px at that viewport — mean |ΔRGB|): **before 7.589/255** (inside the ellipse 9.03, canvas +4.5 brighter than the poster), **after 3.767/255** (inside 4.44; bar ≤ 8). What changed in the shader, each mirroring one SVG layer:
  1. the plate is the poster's `#hl-body` gradient — violet-600 → violet-500 (55%) → plum-700 — at α .28 (`LIQUID.plate`) at every wake value, replacing the flat `+.09` white lift the poster never had (`glassTint` removed). The SVG gradient is `x1,y1 = 0,0 → x2,y2 = 1,1` in objectBoundingBox units, i.e. **diagonal** (`t = (u + v) / 2`), not vertical as the review described it — the SVG is the reference, so the shader follows the SVG;
  2. `CAUSTICS` is injected (`POOL1/2_C`, `_R`, `_A`) and the two static pools render at rest — source-over of each other, under the plate inside the lens, as the exterior alpha outside — with `mix(pools, liveCaustics, uWake)`;
  3. the body is **optical depth**: each disc contributes `k = −ln(1 − α(ρ))`, `α(ρ)` being the `#hl-blob` gradient itself (.92 → .5 at 60% → 0 at the drawn edge, `ρ = d / (r · BLOB_DRAW_SCALE)` — so `BLOB_DRAW_SCALE` now is a shader constant), and `body = 1 − exp(−Σk)` is exactly the poster's source-over composite of the five discs. A lone blob is .5 at 60% and 0 at the edge by construction, and the cluster's overlaps stack the way the poster's do. `w` applies only once awake (`mix(1, w, uWake)`) — the poster draws every disc with one gradient — and stays in the PRNG sequence. The colour ramp is the same stops (violet-600 → violet-500 as α runs .5 → .92);
  4. hairlines and glints are **source-over** at the poster's alphas — the glint is the `#hl-glint` disc (ink-inv core → lavender-400 at α .85 by 35% → 0), `GLINTS[].alpha` injected, `LIQUID.specular` removed as a duplicate of it — not additive;
  5. the output is **solved through the canvas's alpha**: `pm = col − (1 − aIn)·bg`, so `pm + (1 − aIn)·page = col` wherever the analytic backdrop matches the page. Written as `rgb·a`, everything inside the lens reached the screen at a × its strength (plate .22 for .28, rim line .27 for .34), which was most of the residual flatness. Consequence at wake 1 — intended, and the only look change beyond 1–2: the plate is violet-tinted, and rim, annulus and glints reach their designed strength instead of ~80% of it.
  The residual 3.8/255 is the annulus (the shader's soft fresnel ramp against the poster's hard .26 annulus — kept by design; `LIQUID.rimDark` .28 is "tuned near", not equal) and a faint ring at the cluster's edge (Skia interpolates the half-transparent gradient stops premultiplied; the shader in straight sRGB).
- **Dither clamped:** `gl_FragColor = vec4(clamp(pm + dth, 0.0, a), a)`. Unclamped, half the fully transparent exterior carried `rgb = 1/255` over `a = 0` — invalid premultiplied colour.
- **`probe.mjs`:** (i) "one draw per frame" is a **ratio** — section 1's window now also wraps `requestAnimationFrame` and counts the callbacks that issued a draw; the assertion is `draws ≤ scene frames + 1` (the +1 is the callback already in flight when the counters land). The ≤ 35 ceiling stays as an absolute bound, but it cannot fail under swiftshader (9–12 draws/500ms there). Proven able to fail: with `drawElements` patched to draw twice, the same measurement read 30 draws over 14 scene frames → FAIL, against 19 over 18 as shipped. (ii) The GPU-time check is **proven able to fail**: a temporary 512× `fbm2` loop per fragment read min 4.94 / median 6.17 (5.40 on a rerun) / p95 9.62ms → FAIL, against min 0.094 / median 0.873 / p95 1.878ms as shipped — the ANGLE-Metal `TIME_ELAPSED` does follow shader cost once it clears its ~0.8ms command-buffer floor. **An M1 Max median is a sanity bound, not evidence for F1's integrated-GPU budget** (Iris Xe / HD 4000); only a run on such a machine can give that. (iii) The native rAF p95 bar is 1ms → **0.5ms** (measured 0.2ms; the old bar was five times the measurement). (iv) Sections are numbered 1–5 in reading order (they ran 1, 1c, 1b, 2, 3).
- **Gate (`--since main --skip-pixdiff`): PASSED** — tsc / contract / ownership clean, build `ieapybQ4YxRW8bMq5CeOX`, 13 routes healthy, qa sweep all zeros (incl. ink-on-glass 0), motion / cascade / keyboard / reduced-motion clean; WebGL probe **22/22** — 14 draws/500ms under swiftshader with **14 draws over 13 scene rAF frames, max 1 per callback** (the new ratio line), 0 uploads with 47 draws in the window, no console errors with the rewritten shader, GPU median 0.915ms / min 0.112ms on the M1 Max (sanity bound only, see above), rAF median 0.3ms at 4× and **p95 0.2ms native under the 0.5ms bar**; `/` composited audit 0 disallowed (TBT 21ms, perf 95) — unchanged from Phases 4/5, as expected for a change that paints only inside the hero canvas. `layout.mjs` (standalone, 52 page-views): lens registration `Δ(cx,cy,w,h)={0,0,0,0} max=0px`; its 23 text-overlap / 3 sub-10px findings are the same pre-existing set as the Phase 4 review-fix run (still orchestrator triage; none in the hero).
- **Minor:** the adaptive-quality median (a 90-element copy + sort every 90 frames inside the rAF callback) is a running count of intervals > 20ms — more than half the window slow ⇔ median > 20ms — allocation-free. `palette.ts`: `plum600` (no consumer), `glassTint` and `specular` (both superseded above) are gone, so every entry has a shader consumer; `C_PLUM700` is now used by the plate gradient. `rimDark`'s comment says "tuned near the annulus (.26)" rather than claiming equality. `f()` is `toFixed(6)`-trimmed with a range assert — the `Number.isInteger` form emitted `1e+21.0` for 1e21, and `toFixed` itself goes exponential at 1e21, so the guard is what makes it valid by construction. The shader header no longer says "safe in fp16 for days": WebGL2 mandates fragment highp; the T-wrap still matters for `sin` accuracy at large arguments.

**Phase 6 (dark card language — StatBand dark, WhatWeDo manifold, Challenges sweep cards):**
- **The section carries no `overflow-hidden`; each Caustic sits in its own clip box.** The task card specified `relative overflow-hidden` on all three sections, but `.sheet-shadow` is `top: -40px` and globals.css says in so many words that a parent `overflow: hidden` clips its upward 40px ("put the overflow on an inner wrapper instead") — CtaBand accepted that loss because it needs the clip for its own reasons; these three sections do not. The only thing that overflows a dark band here is a Caustic (a 480–560px disc centred low or at a corner), so it renders inside `<span aria-hidden class="pointer-events-none absolute inset-0 overflow-hidden">`. The box has **no z-index and no `isolate`**: it is not a stacking context, so the disc's `z-index: -2` still resolves against `.section-dark` (above the band's background, under the grain) while the box — the disc's containing block — clips it. Verified on the gate server: every `.caustic`'s `offsetParent` computes `overflow: hidden`. `.section-dark` declares `position: relative` itself, so the `relative` utility the card listed is also omitted.
- **`Seam` and `Conduit` always get a positioning wrapper.** Both declare `position: relative` (and `.conduit` `display: block`) in motifs.css, which is emitted after Tailwind and out-ranks `absolute` / `hidden` at equal specificity on the same element (the Phase 4 Seam note, now general). The top Seam of every dark band is `<div aria-hidden class="pointer-events-none absolute inset-x-0 top-0"><Seam/></div>`. StatBand's bottom edge is the hero's construction verbatim — Seam then Meniscus in-flow inside one `absolute inset-x-0 bottom-0` wrapper — as the card asked (Part E row 8 says "Seam top, Meniscus bottom"; the card's "Seam + Meniscus nesting per Part J Phase 4" reads as the hero pairing, so StatBand carries a Seam at both edges: the top one coincides with the sheet-shadow's 1px highlight and outlives it, the bottom one is the rim the surface rises under).
- **`SectionProgress` (`components/sections/home/SectionProgress.tsx`, V4-owned in `ownership.py`)** is a `"use client"` `<section>` that calls `useSectionProgress` on itself and renders `children` — nothing else. WhatWeDo stays a server component and passes its server-rendered markup through it. The alternative (`"use client"` on WhatWeDo, ProcessRail's pattern) ships `content/home.ts` and every motif it composes to the browser for one effect; ProcessRail pays that because it also needs the `--sp-live` publishing effect. WhatWeDo has no content that reads `--sp` (the Conduit and Node glow are decoration), so no `--sp-live` alias is published there — decoration fails closed by design.
- **Node sequence is CSS-only.** A `data-lit` attribute cannot be driven by a custom property, so `.node-flow .node-glow { opacity: clamp(0.35, 0.35 + (var(--sp) - var(--lit-at, 0) + 0.04) * 8, 1) }` — a static computed value that tracks `--sp`, not an animation; `clamp()` takes raw `<calc-sum>` arguments, no nested `calc()` needed. `--lit-at` (inline per Node, `LIT_AT = [0.25, 0.5, 0.75]`) is the **centre** of a ±0.04 ramp (slope 8). Those three values are not arbitrary: `.conduit-scroll` moves the 38%-wide band by `-100% + sp × 360%` of its own width, so the band's brightest point (≈ 52% along it) sits at track fraction `0.38·(3.6·sp − 1) + 0.20`, which equals the card centres 1/6, 1/2, 5/6 at sp ≈ 0.25, 0.50, 0.74 — each Node lights as the flow reaches it. Unwritten `--sp` → all dim (`var(--sp)` is the `:root` 0), so **the motifs RM block gains `.node-glow { opacity: 1 !important }`** (Part C: RM = static, lit; it did not exist). `.node-glow`'s existing 200ms opacity transition smooths the per-frame steps.
- **`.liq:hover .node-glow, .liq:focus-within .node-glow { opacity: 1 }`** (motifs.css, after `.node-flow` so it wins the (0,2,0) tie) is the Challenges "we solve it" beat — and applies to every glass card, so WhatWeDo's and `Card`'s Nodes light on hover too. Challenges Nodes rest at .35 with no `lit`; on touch devices they stay dim — Part I's "reads as disabled → glow .6 and drop the beat" is an **owner-review** item, not decided here.
- **Challenges cards carry `liq-static-mobile`** (the card's conditional): at 390px a card is ~200px tall (44px Node + 24 + three 15px lines + 56px padding) and 20px gap, so four can share an 844px viewport; four blurs + the pill = 5 > §A7's phone budget of 4. WhatWeDo's cards (~330px tall, three per section) do not need it: ≤ 3 + pill = 4.
- **StatBand Pool paint order.** `.pool` is a positioned sibling of the figure with no z-index, so it would paint OVER in-flow text (a .24 violet + a lavender hairline across the label). The `StatNumber` root is `relative z-[1]`; the Pool keeps its default stacking (above the `.liq` pseudos, below content), and `border-radius: inherit` + the tile's `overflow-hidden` round its bottom corners. The Pool rises through `[data-inview] .pool` — RevealGroup stamps `data-reveal`/`data-inview` on each tile's wrapper `<div>`, so the selector chain in motifs.css matches as written.
- **`StatNumber` gained `affixClassName`** (B0-owned; the redesign reopens it): one optional class merged onto the three `odo-fix` spans (prefix, separators, suffix), no geometry or behaviour change. StatBand uses it for `text-lavender-400` affixes against `text-ink-inv` digits — the two existing props could not colour the affixes apart from the digits. `numClassName="text-ink-inv"` needs no `!`: `cn()`'s tailwind-merge resolves `text-ink` vs `text-ink-inv` last-wins.
- **StatBand's Droplet row** is a `Reveal as="p"` of two `<Droplet>` spans; each fact is ONE inline `<span>` (`<strong>` value `--ink-inv` + a literal space + label, inherited `--ink-inv-2`) because `.droplet` is `inline-flex` and flex items swallow whitespace — the same reasoning as the hero eyebrow. `--ink-inv-2` is allowed there (tier 1 over band C, §A6).
- **WhatWeDo card geometry.** `p-8 pb-20 lg:p-10 lg:pb-[88px]` with `--liq-pad: 40px`: Part E's 40px frame equals the lg padding exactly (a 40px frame over 32px padding would put the .22 specular under the first 8px of every line — the card's `p-8` + 40px pairing was not text-free); the specular is `display: none` below 1024 anyway. The ghost numeral (`text-[72px]`, bottom-right) lives in the reserved bottom padding so body copy never runs under the .55→.12 white gradient; it is wrapped in `<span class="scrub-drift drift-far">` with `.ghost-num` on an inner `block` span, because `.ghost-num` already owns a `transform` transition (the reveal settle) and an inline box cannot transform at all — the old `ghost-num scrub-drift relative` on one inline span was two transform drivers on an element that transformed neither.
- **Dual Conduit for mobile.** Two `aria-hidden` wrappers on the stage — `absolute inset-x-0 top-[35%] z-0 hidden lg:block` (horizontal) and `absolute inset-y-0 -left-[15px] md:-left-[23px] z-0 grid lg:hidden` (vertical, centred in the container's 24/40px gutter). The vertical wrapper is `grid` so `.conduit-v`'s `height: auto` stretches to the stage height (a block child would collapse to 0). Both read the same `--sp`.
- **`data-surface="dark"` is not added**: only heroes carry it (Hero, PageHero); the header observer already targets `main .section-dark`, and the other dark home sections (ProcessRail) carry none.
- **`contract.py`** gains the classes these sections are the first to wire (`liq-spec`, `liq-sweep`, `liq-enter`, `liq-inset`, `liq-static-mobile`, `pool`, `conduit`, `conduit-flow`, `conduit-scroll`, `conduit-v`, `caustic`, `node-glow`, `node-flow`, `sheet-shadow`, `drift-far`, `drift-mid`, `band-a/b/c`) and tokens (`--liq-pad`, `--liq-sweep`, `--violet-a24`, `--violet-glow`, `--veil-2`). `conduit-scroll` is composed as `conduit-${flow}` in Conduit.tsx; the `used` regex happens to find the literal in WhatWeDo.tsx's doc comment, so it prints `used_by_components=True` — a print either way, since the class/token lists only fail on orphans. `--lit-at` is deliberately not a token (per-element inline, read with a fallback).
- **No `loop` on the Caustics.** Part C describes a 40s desktop translate loop; the card specified `drift` only, and that is what shipped (scroll drift ±14/±7px, half on phones). Adding `loop` later is a prop, not a rewrite.
- **Blur budget measured** (computed `backdrop-filter !== none` per section, on the gate server): **390px: WhatWeDo 3** (the three `.liq-spec` cards), **Challenges 0**, **StatBand 0** (tiles `liq-static-mobile`, Droplets `.liq-1`) — plus the pill, so the worst phone viewport is 3 + 1 = 4 (the budget). **1440px: WhatWeDo 3, Challenges 6, StatBand 6** (4 tiles + the 2 Droplets, which as `.liq-1` blur ≥ 1024 — the card's "4 + pill = 5" omitted them, as Phase 4 found for the hero Droplet) — plus the pill: 4 / 7 / 7 of 8. Every `.caustic`'s `offsetParent` computes `overflow: hidden` (the clip boxes hold). The Node sequence was sampled on the same server by wheel-scrolling WhatWeDo: `--sp` .05 → glows [.35 .35 .35]; .45 → [1 .35 .35]; .62 → [1 1 .35]; .92 → [1 1 1], with the desktop Conduit band's `translateX` tracking the same `--sp` (−364px → +1025px). Running animations inside the three bands at the mobile trace size: `sheetEnter` ×3, `sheetShadow` ×3, `scrubDrift` ×6 (3 Caustics + 3 ghost wrappers), `liqEnter` ×6; desktop adds `liqSweep` ×6 — so the composited audit's zero below is not vacuous.
- **Gate (`--since main --skip-pixdiff`):** **PASSED** — tsc / lint / contract / ownership clean, build `Xuti8QTBswm0nyYGtbksM`, 13 routes healthy, qa verdict all zeros over 52 page-views **including `ink on glass: 0` with real `.liq-spec` / `.liq-sweep` hosts now present** (the rule was proven able to fail in Phase 4), motion / WebGL / cascade / keyboard / reduced-motion clean, `/` composited audit **0 disallowed** (TBT 22ms, perf 95, CLS 0 — unchanged from Phases 4/5 with `liqEnter` ×6, `sheetShadow` ×3 and six more `scrubDrift` planes now running on the route), /services 35ms · /connected-banking 18ms · /contact 16ms · /banks/axis 18ms all within the 200ms TBT budget.

**Phase 7 (Ecosystem conduits · pinned ProcessRail + glass Ledger · CtaBand pool · footer pool · the geometric sweep in the gate):**
- **`.footer-pool`** is background-image only, like `band-a/b/c` — `--plum-800` top → `--plum-950` bottom, the bands' gradient run in reverse so the page reads as settling into its deepest plum. Ink, grain and selection come from `.section-dark`.
- **`.liq-flat`** (`backdrop-filter: none` at every size) is the §A7 escape hatch for a glass CLUSTER, next to `.liq-static-mobile`'s per-tile one. Declared after the mobile block so it is the last word at equal specificity. **Never with `.liq-refract`:** both are (0,1,0) and `.liq-refract` sits EARLIER (L1033, inside its `@supports` — an at-rule adds no specificity), so `.liq-flat` wins the tie on source order and would silently delete the refraction. (The first draft of this note had the tie the other way round; the pairing is a contradiction either way, but this is which half actually loses.)
- **Part D (iii)'s ranges are `contain`, and there are four steps** — Part D's CSS block is corrected in place. A bare `0% 34%` is the COVER range: 0% is the wrapper's top edge entering the scrollport BOTTOM, so the steps would play while the wrapper is still scrolling into view and finish before the stage ever sticks. `contain` on a subject taller than the scrollport runs top-at-top → bottom-at-bottom, which is exactly the sticky phase. `min-height` 300vh → **260vh**: four steps at 0.5vh each read slow; 0.4vh keeps the Ledger's typing and the rail in step. `pinStepFirst` (starts in place, only leaves) and `pinStepLast` (arrives, then holds) exist so the first viewport of scroll is not blank and the exit does not show lit Nodes beside nothing. `.pin-step` covers all three animation names in the reduced-motion by-name list, so no new entry was needed there.
- **`.eco-halo` replaces `.eco-hub`.** `ecoHub` animated `box-shadow` — off the compositor, and it had survived every audit because the Ecosystem section renders ≥1024 while the composited audit traces at mobile size. The halo is a radial `--violet-a24` disc whose **opacity** breathes (Node-glow style). It **must** be its own element: `.eco-halo` sets `background` and the hub's background is `grad-fill`, which Part E row 5 keeps — so it is an absolutely-positioned 260px disc behind the 150px hub plate, not a class on the hub. The CSS-only half of that swap landed before the call site did, which left `Ecosystem.tsx` pointing at a deleted `.eco-hub` for one commit-in-progress; wiring it was deliverable 1.
- **`Conduit` gained `flow="custom"`** — the smallest affordance that lets ProcessRail's rail be a Conduit. It renders the track plus a caller-supplied `children` and emits **no** `conduit-*` flow class, which is the point: the kit then declares no `transform` on the flow element, so the caller's `scaleY(var(--fill))` is the only driver and there is nothing to collide with. `conduit-custom` is deliberately not a class and not in `contract.py` — it would be an orphan by construction.
- **ProcessRail's rail is a FILL, not a band.** Part E row 10's "its `.conduit-flow` **is** the existing `fillStyle`" is taken literally for the transform and not for the geometry: `.conduit-flow` is a 38%-long band with transparent ends, and scaling that by `--fill` would grow a band, not fill a channel. The flow child is a full-height `--lavender-400 → --violet-500` gradient at `origin: top`, which is one continuous spine replacing the four per-segment 1px connectors — so `fillStyle` lost its `(i, segments)` arguments and now spans `[RAIL_FROM, RAIL_TO]` once.
- **`RAIL_FROM/TO` = `TYPE_FROM/TO` retuned 0.18 / 0.58 → 0.29 / 0.68.** They had to move: `--sp` is `(scrollY + vh − sectionTop) / (vh + sectionHeight)`, and the pin makes the section 260vh taller, so the old window played almost entirely before the stage stuck. The pin's `contain 0% → 100%` maps to sp `[0.2895, 0.7105]` at 1440×900 and `[0.2899, 0.7100]` at 1024×768 — stable, because 260vh scales with the viewport and only `.section-pad`'s `clamp(80px, 10vh, 140px)` does not. `FROM = 0.29` puts the first drop of fill and the first code line on the frame the stage sticks; `TO = 0.68` lands the last line at ≈93% of the pin, so step 04 has arrived and settled and the tail of the pin holds a finished composition rather than unpinning mid-keystroke. Below 1024 this is simply the middle 39% of an ordinary transit — later and tighter than 0.18–0.58, which suits a stacked column.
- **The pin steps stay IN FLOW.** Nothing about the pinned layout is positioned differently from the stacked one; `.pin-step` only animates opacity + translateY, and the read is one lit row travelling down a fixed spine as the fill front and the code lines advance with it. That is what makes every fallback free — below 1024 and without `view()` support the section IS the stacked column; under reduced motion the animation is killed and four rows are simply visible; and because four text blocks never share one box, `layout.mjs`'s overlap check cannot fire on this section. An absolutely-stacked variant would have needed a `grid-area` reset in the reduced-motion block and would have put a real text pile one CSS mistake away.
- **`RevealGroup` cannot render the pin steps**, and the SectionHeader goes INSIDE `.pin-stage`. RevealGroup wraps each child in its own `<li>`, which would make every step `:nth-of-type(1)` of its own parent; the stagger is therefore hand-rolled (`useInView` + `--reveal-delay`) on an inner `<div>` per row, one element per concern so the pin and the entry never contend for opacity. The rail Conduit is a `<div>` outside the `<ol>` for the same `:nth-of-type` reason. The header sits inside the stage because putting it outside `.pin` would push `.pin`'s top down by the header's height and make the sp↔`contain` mapping above depend on how many lines the lead wraps to.
- **The step Node's lit layer is a SECOND `.node-glow`.** `litStyle` is kept verbatim and still reads `--sp-live`; it lands on a `<span class="node-glow">` passed through `Node`'s `icon` slot, with `opacity: var(--lit)` inline over the kit's dim .35 rest glow. Using the kit's own class rather than a hand-rolled overlay buys two things: `.node > :not(.node-glow)`'s forced `position: relative` skips it (a Tailwind `absolute` there loses (0,1,0) to that (0,2,0) rule), and motifs.css's reduced-motion `.node-glow { opacity: 1 !important }` re-lights it — `!important` beats the inline value, so Part C's "RM: static, lit" holds with no new rule. `.node-flow` + `--lit-at` was the alternative and was rejected: it reads `--sp`, which fails CLOSED, and these Nodes are part of a content choreography that must fail open.
- **`--terminal-cmt` measured on the composite, as globals.css's call-site note demands.** `rgba(23,27,33,.78)` over `band-a`'s brightest stop (`--plum-700` #42174c) is rgb(32.5, 26.1, 42.5); #8b93a0 on it is **5.44:1**. Over the whole band it runs 5.44 (plum-700) → 5.76 (plum-950), against 5.58 on the opaque `--terminal`, and 5.32:1 even with a Caustic core (`--violet-a24` over plum-700) directly behind. The rest of the palette on the worst-case composite: `--t-key` 8.14, `--t-str` 8.61, `--t-num` 9.29, `--t-punct` 9.66, the caption's #8d97a3 5.69. **The Ledger stays translucent; no value was recalibrated.**
- **The Ecosystem chips' port bead deviates from `node-light`'s fill.** It is a `Node light size={8}` — kit position, size, glow child and reduced-motion behaviour — with `background: var(--violet-500)` inline. `.node-light`'s `--lavender-200` disc is designed for a 44px plate carrying a `--violet-text` glyph on `--canvas`; as a bare 8px bead on a `.liq-light.liq-1` chip over `--surface` (#ffffff composites to #ffffff, and `.liq-flat` removes the frost that might have tinted it) it measures 1.16:1 against its own host and simply is not visible. `--violet-500` is also the `.conduit-pulse` packet's colour, so the bead reads as the port the packet lands in.
- **Ecosystem's chips lose `.liq-live`, not their hover.** The entry scale is an INLINE `transform`, which outranks any stylesheet rule, so `.liq-live:hover`'s lift would be dead on arrival; `hover:shadow-float` is (0,2,0) and does out-rank `.liq`'s box-shadow — but its transition has to ride the element's inline `transition`, which would otherwise replace it. The connectors' entry moved from `stroke-dasharray` (which existed only because `.eco-wire` already owned `dashoffset`) to plain opacity on a wrapper `<g>`, since the base stroke is solid now. `.eco-wire` and the `ecoWire` allowlist entry both STAY — /connected-banking and /industries still use it.
- **CtaBand keeps `overflow-hidden`** and therefore loses `.sheet-shadow`'s upward 40px, where the other dark bands omit it (Part J phase 6). The trade is deliberate: the Pool's radial and both drifting Caustics bleed past the section box, and the 1px top-edge highlight that survives the clip is the half that reads against the Seam. The Caustics still sit in their own `absolute inset-0 overflow-hidden` box for uniformity. The **bottom** Seam is new and is why it exists: the footer below is dark now, so that edge is a rim between two plums rather than a dark/light boundary that reads by itself. Both Caustics are at the LEFT and RIGHT edges because the centred column's Droplet is `--ink-inv-2` and a Caustic core under text costs ~0.3–0.5 of its ratio — invisible to the contrast walk, which sees a sibling overlay, not a background.
- **Pool geometry is `bottom`-anchored arithmetic, twice.** `.pool` is the bottom 46% of its box, so a 120px basin needs a 260px box; overriding the height with a Tailwind `h-*` would silently lose to motifs.css, which is emitted after Tailwind. CtaBand's box is `bottom: -72px; left: 20%; width: 60%` — anchored by `bottom` so it is independent of how many lines the button row wraps to, putting the basin from the buttons' top edge to 72px below them (inside the section's own 96/112px bottom padding, so `overflow-hidden` never clips the radial's brightest edge; the CTAs sit IN the pool, both `--ink-inv` per §A6). The footer's is full-width, `bottom: 0`, `h-[139px]` → a 64px pool that lives entirely inside the container's bottom padding, which is what `pb-10` → `pb-16` bought and what lets the legal line stay `--ink-inv-2`: no text overlaps it.
- **The footer nests, it does not merge.** `.chrome-curtain` stays alone on the `<footer>`; `.section-dark footer-pool` is a child. `.section-dark` declares `position: relative` for its grain `::after`, which on the sticky element would overwrite `position: sticky` and silently kill the curtain. chrome.css §3's z-order contract is untouched and `.chrome-main` stays opaque. `.link-draw` needed no dark variant — its underline is `background: currentColor`, so it draws in the link's own `--ink-inv-2`.
- **The pill's tone observer gained `footer .section-dark`.** The footer is a SIBLING of `<main>`, so `main .section-dark, main [data-surface="dark"]` could not see it, and on a short page the curtain is under the pill from the first frame — a white pill over a plum footer.
- **`layout.mjs` is a hard gate step now, and its 68 text overlaps were one false positive with the wrong name on it.** The `a` side of every standing finding is `header.chrome-header > .chrome-pill > a.chrome-mark > span` — the **fixed pill nav's wordmark**, not, as the phase 4/5 notes above recorded, the footer curtain's heading. Both render "LinkAPI Tech", the dedup key is page+textA+textB, and the report printed only the two strings, so the two collapsed into one row and the wrong one got named; the formatter now prints the element labels too. They reached the report because the opaque-layer walk reads only `backgroundColor` and the pill's fill is `rgba(37,13,41,.78)` — under the 0.99 bar, correctly, since a translucent fill alone WOULD let glyphs through. What actually hides them is the frost, which `backgroundColor` cannot see. Two named exemptions:
  1. **frosted fixed chrome** — skip a pair where exactly ONE side has a `position: fixed` ancestor with a `backdrop-filter` at or below it. Both halves are required: a fixed overlay with no frost still reports, and two runs inside the same fixed layer still report.
  2. **the footer curtain under the opaque page** — skip curtain-descendant × `.chrome-main`-descendant. Belt to the brace the opaque walk already provides via `.chrome-main`'s `background: var(--canvas)`, for hit-stack positions that do not put it between the two. Footer-vs-footer still reports.
  **Proven able to fail** against the real extracted `AUDIT` source, baseline 0 in every case: two overlapping runs planted in `<main>` → 3 findings; planted inside `footer.chrome-curtain` → 1; planted inside the frosted pill → 3. So the 0 below is not vacuous.
- **`/industries`' three 9.5px labels were fixed, not allowlisted** — a two-line `text-[9.5px]` → `text-[10px]` in `Mocks.tsx`. Safe at every width: that row is `flex-col` below sm (full-width boxes) and `sm:flex-1` thirds above it, ~186px of inner width at 768px against ~90px of 10px uppercase text, so `truncate` still never engages. The card's `/privacy` "anchor headings" class did not reappear: it was the same pill-wordmark pair.
- **`gate.sh`** gained the sweep after the cascade step, as a hard `ok`/`bad`. Its header now lists all 15 steps and states the assertion count (23 with `--since` and pixdiff, 22 with `--skip-pixdiff`, 21 without `--since` — the composited audit contributes two per route). `README.md`'s headline "24 checks" predates that accounting; reconciling it is Phase 10's docs pass. `package.json` gained `qa:layout`.
- **`contract.py`** gains the classes phase 7 is the first to WIRE (`liq-light`, `liq-flat`, `node-light`, `conduit-pulse`, `pin`, `pin-stage`, `pin-step`, `ledger`, `footer-pool`, `eco-halo`, `drift-near`) and the palette entries its components name directly in an inline style or an SVG presentation attribute (`--lavender-300`, `--lavender-400`, `--violet-500`, `--terminal-cmt`, plus `--line-inv`, which reaches components only through the Tailwind `border-line-inv` utility and so is documentation plus the `defined` assertion). `liq-light`/`node-light` were composed in the motif kit from phase 2 but nothing RENDERED either until the Ecosystem chips and their beads. `drift-near` is composed at render as `drift-${drift}`, so — exactly like `conduit-scroll` in phase 6 — the `used` regex finds the literal only in a doc comment.

**Phase 7 review fixes (the gate FAILED on the first run — recorded because a green gate is not what cleared this phase):**
- **The pill's tone flip no longer animates a non-composited property.** The first gate run failed 3 hard: `/services`, `/connected-banking` and `/banks/axis` each reported `3 non-composited animation(s) not on the allowlist: color`. Cause: extending the observer to `footer .section-dark` means inner pages — which have *light* heroes — now flip the pill as the dark footer scrolls under it, so Phase 3's `transition: color/background-color` on `.chrome-mark`/`.chrome-nav-link`/`.chrome-cta` actually *runs* during the Lighthouse trace. `/` never showed it: its hero is dark at scroll 0, so the pill starts dark and never transitions. `color` has no composited equivalent, and a nav-wide colour fade on every inner page is not an allowlist candidate (the allowlist is for paint-only animations with a measured nil cost). Fix: the flip is now **one frame** — the colour transitions are dropped, and the `.nav-thumb`'s `background-color` entry went with them so the dot cannot lag a flip that no longer fades.
- **`RAIL_FROM/TO` and `TYPE_FROM/TO` are single-sourced.** The phase retuned the rail to `0.29 / 0.68` for the taller pinned section but left `Terminal.tsx` at `0.18 / 0.58`, breaking the identity Part E row 10 calls the whole point — typing would have started at −26% of the pin (before the stage sticks) and finished at +69%, while Node 4 lit over 77–93%. **No gate assertion can see this**; it took a read of the diff. `Terminal.tsx` now exports `SCRUB_FROM = 0.29` / `SCRUB_TO = 0.68` and `ProcessRail.tsx` imports them, so the two cannot drift again — the same remedy commit `279024a` applied to the rim/chip constants.
- **Both `layout.mjs` exemptions were removed, not narrowed.** Exemption 2 (footer-curtain vs page) was redundant by its own comment and would only ever have fired once `.chrome-main` stopped being opaque — i.e. it disabled the single automated guard on that contract, in the phase that made the footer dark. Exemption 1 decided by *membership* in a frosted fixed layer rather than by proven occlusion, short-circuiting `collide()`'s existing hit-stack walk. With both gone the sweep still reports **0 findings across 65 page-views**, so the pass is on merit rather than by suppression. The improved `<tag.cls>` report formatter was kept — it is what made the standing pairs diagnosable in the first place.
- **A `1024x700` narrow-desktop-short viewport joined the sweep** (65 page-views, up from 52): nothing else exercised the pin at its narrowest, where the left column plus the Ledger approaches 100vh. `contain: paint` came off `.pin-stage` in the same change — it is a backdrop root, so it risked flattening the Ledger's and the Nodes' frost against an empty backdrop, and it was a nicety rather than a requirement.
- **The sweep is proven able to fail** (the repo's rule: a green is untrusted until the check has been shown to go red). Baseline `node scripts/qa/layout.mjs http://localhost:3411` → `8/8 passed`, 0 findings. With a single `<span className="text-[9px]">` planted in `CtaBand.tsx` (which renders on every route) → `TEXT UNDER 10PX: 10`, `FAIL no text under 10px [10]`, `7/8 passed`, exit 1. Reverted; no trace remains.
- **pixdiff will read as a redesign** on all 13 routes — the footer goes light→dark and CtaBand loses its three tilted slabs — so this phase gated with `--skip-pixdiff`, as Phase 6 did. Baselines are Phase 10's to regenerate.
- Minor: the ProcessRail Caustic comment no longer claims the disc sits behind the Ledger "for most of the pinned stretch" (it cannot — the Ledger is sticky and travels ~1.6 viewports while the disc is pinned at `y = 50%` with ±14px of drift); the rail track is anchored to the last Node's centre instead of overshooting it by ~30px; the dead `data-inview` came off the `<ol>`; and `SiteFooter`'s ink note cited `--ink-inv-3`'s ratios for `--ink-inv-2` (the real numbers are better: 8.07–10.07:1).

**Phase 8 (the six light home sections — marquee, WhoWeAre vessel, WhyUs spine, ErpBand conduit, Testimonials, FAQ):**
- **`liq-flat` is the default for light glass in this phase, and the reason is arithmetic, not budget.** All six sections sit on a FLAT surface — `--surface` (#ffffff) or `--canvas` (#faf8fc) — with no gradient, image or motif behind the glass, and a Gaussian blur of a constant field IS that constant (Chromium's backdrop sampling duplicates at the edges, so a uniform backdrop stays uniform). The `saturate(1.15)` leg is equally inert: on white it is achromatic, and on `--canvas` rgb(250,248,252) it computes to rgb(250.19, 247.89, 252.49) → rgb(250, 248, 252), the same colour to the nearest LSB. So the frost on these hosts is provably **zero pixels of difference for real GPU cost** — the Ecosystem-chip reasoning from Phase 7, generalised. What still draws the glass is the rim ring, the wet edge and `--liq-light-shadow`, which is why the cards read as glass in the captures.
- **Testimonials' `liq-flat` is CORRECTNESS on top of that.** `.card-depth` animates `opacity` (0.75 → 1 → 0.75, `linear both` on `view(x)`), so an off-centre card **rests** at 0.75 — measured 0.87 / 1.00 / 0.87 for the three cards at 1440 and 0.98 / 0.77 / 0.75 at 390. An ancestor with `opacity < 1` is a **backdrop root** in Chromium, so the figure's `backdrop-filter` inside it would sample an empty backdrop for every card except the one perfectly centred. The frost was not merely invisible here; it was defeated by the card's own depth treatment. Nothing in the gate can see that, which is why it is written down.
- **Not everything got `liq-flat`.** Two tier-2 Vessels keep their frost so the light material still has real call sites with a live L0: **HomeFaq's** (1 blur; its worst shared viewport is with CtaBand — 1 + 2 + pill = 4 of the desktop 8, 1 + 1 + pill = 3 of the phone 4) and **WhoWeAre's**, which takes `liq-static-mobile` instead. That one is a **boundary** case, not a per-section one: WhoWeAre's card bottom → 80px pad → 80px pad → the "What We Do" heading → `mt-12` is ~288px, so at 390×844 the card and two of WhatWeDo's three `.liq-spec` cards can share a viewport — 3 blurs + the pill = 4, exactly §A7's phone budget, with WhoWeAre's frost consuming the last slot. Above 1024 it keeps the frost (1 + 3 + pill = 5 of 8). Three WhatWeDo cards plus WhoWeAre cannot co-occur (3 cards + gaps alone are 1038px).
- **Blur budget measured** (computed `backdrop-filter !== none` per section on the gate server, as Phase 6 did): **390px** — LogoMarquee 0, WhoWeAre 0, WhyUs 0, ErpBand 0, Testimonials 0, HomeFaq 1; unchanged neighbours Hero 1, WhatWeDo 3, Ecosystem 0, Challenges 0, StatBand 0, ProcessRail 0, CtaBand 1. Plus the pill, the worst phone viewport is still **4** (the WhoWeAre → WhatWeDo boundary), i.e. Phase 6's number, not one more. **1440px** — LogoMarquee 0, WhoWeAre 1, WhyUs 0, ErpBand 0, Testimonials 0, HomeFaq 1; neighbours Hero 5, WhatWeDo 3, Challenges 6, StatBand 6, ProcessRail 5, CtaBand 2. Plus the pill the worst desktop viewport is **7 of 8** (Challenges or StatBand alone, unchanged from Phase 6); every Phase-8 boundary is ≤ 5. WhyUs and ErpBand contribute **nothing** — a light `Conduit` is `--lavender-200` + an inset hairline and a light `Node` is `node node-light`, neither of which is glass.
- **WhyUs' Nodes are sequenced by `--sp` + `--lit-at`, not by the row's `[data-inview]`** — a deliberate deviation from the task card. Three reasons: (a) `[data-inview]`-driven lighting needs a NEW global rule, and the obvious one (`[data-inview] .node-glow`) would light Challenges' six deliberately-dim Nodes too, since RevealGroup stamps `data-inview` on every child wrapper — it would silently delete the "we solve it" beat; (b) `--sp` is what the spine's own flow band reads, so the Node lights exactly as the flow front reaches it, which is the read the motif exists for, where `[data-inview]` fires on a 0-threshold observer and would drift out of step with the liquid; (c) it is Phase 6's shipped mechanism, unchanged. Same inversion of the band formula: `0.38·(3.6·sp − 1) + 0.20 = f` at row centres 1/8, 3/8, 5/8, 7/8 → **`LIT_AT = [0.22, 0.41, 0.59, 0.77]`**. Sampled by wheel-scrolling on the gate server at 1440: sp .08 → glows [.35 .35 .35 .35]; .21 → [.35 .35 .35 .35]; .32 → [1 .35 .35 .35]; .45 → [1 .81 .35 .35]; .55 → [1 1 .35 .35]; .68 → [1 1 .99 .35]; .80 → [1 1 1 .76]; .93 → [1 1 1 1]; with the spine flow's `translateY` tracking the same `--sp` (−194px → +700px). The 1/8-step centres assume four equal-height rows; the real rows differ by a line or two of copy and `.node-flow`'s ±0.04 ramp absorbs that.
- **The row entrance is on the INNER GRID, not on the full-bleed `<article>`.** `[data-reveal="left"]` is `translateX(-32px)`, and on a viewport-wide box that pushes past the edge and widens the document — the exact bug the ≥1024 gate on that rule exists for, which the gate would have caught as HORIZONTAL OVERFLOW. So the `<article>` keeps the alternating band tint and the hairline borders (it must stay full-bleed for those), and `Reveal dir` + `.scrub-fade-side` ride the grid INSIDE the padded container, whose box is the container's *content* width: 944px at a 1024 viewport, 40px of slack each side, so ±32px stays on canvas. `scrollWidth === clientWidth` at 390 and 1440, and `qa.mjs` reports 0 horizontal overflow over 52 page-views.
- **The spine is a `<div>` on the rows block, the Nodes live in their rows.** Measured at 390: spine top/bottom 6352 → 7316 == row 1's top and row 4's bottom exactly, `x = 9, w = 6` (the px-6 gutter centre, 12px, less half the track); at 1440 `x = 717` (the 1240px container's centre less 3px, which is also the two-column grid's own 32px gap, so the spine can never cross a text run — col 1 ends at 704, col 2 starts at 736). A Node sits INSIDE its row so it stays centred on it whatever the copy wraps to; it needs a positioning wrapper, because `.node` declares `position: relative` in motifs.css and out-ranks an `absolute` utility on the same element — the general form of the Phase-6 Seam/Conduit rule. Both offsets are negative margins, not translates: nothing else wants `transform` on those elements, and keeping motifs transform-free is what stops `cascade.mjs`-class collisions before they exist.
- **Ghost numerals: drift on a wrapper, `.ghost-num` on an inner `block` span** — Phase 6's WhatWeDo finding applied verbatim (`.ghost-num` already owns a `transform` transition for its reveal settle, and two transform drivers cannot share an element). What is new is that here the wrapper is a **flex item**, so its `display` is blockified and it can transform without an explicit `block` — an inline box cannot transform at all, which is what made the old `ghost-num scrub-drift` single span animate neither. The old inline `--drift-range: 16px` is replaced by Part D (ii)'s `drift-mid` (14px, halved below 1024).
- **Pool clearance is bottom-anchored arithmetic, and the tolerance is set by `.pool::before`, not by AA.** §A6 allows only `--ink` over a light Pool; the WhoWeAre copy is `--ink-2` and the Testimonials role is `--ink-3`, so both pools are kept geometrically off the text. `.pool` is the bottom 46% of its box (overriding that with a Tailwind `h-*` loses to motifs.css), so: **WhoWeAre** 176/216px box → 81.0/99.4px basin (measured) against `pb-28`/`md:pb-32` = **31.0px / 28.6px** clearance; **Testimonials** 120px box → 55.2px basin against `pb-20` = **24.8px**. The first pass used `pb-24`/`md:pb-28` and `pb-16`, which cleared by 15.0/12.6px and 8.8px — numerically fine, but `.pool::before` is a 1px lavender meniscus line at the basin's TOP, and at ~10px it reads as an underline beneath the paragraph and beneath "Customer" rather than as a liquid surface. The clearance is deliberately generous for that reason alone.
- **`.orb-hand-off` on the Pool element cannot break that clearance, and the proof is the transform origin.** `orbHandOff`'s keyframes are `translateY(±18%) scale(0.82)` and `.pool`'s `transform-origin` is `50% 100%`, so at the `to` keyframe the top edge sits at −0.82h − 0.18h = **−1.0h, exactly its resting position**, and at `from` it is LOWER (−0.64h). The pool breathes and dims across the section's transit without ever rising into the text. The animation (fill `both`) out-ranks `.pool`'s own `[data-inview]` rise transition wherever `view()` timelines exist; where they do not, and under reduced motion where `orbHandOff` is killed by name, the reveal rise applies and the pool rests full — both are finished poses. In both cases the Pool is FIRST in DOM with the copy on `relative z-[1]`, because `.pool` is positioned with no z-index and would otherwise paint over in-flow text (StatBand's trap).
- **LogoMarquee loses `border-y` and gains ONE edge.** The hero already renders `Seam` + `Meniscus fill="var(--surface)"` at its own bottom, so the marquee's top edge is drawn by the liquid surface; a second hairline there competed with it. Part E row 2 asks for "Seam bottom", so that is all there is — a light Seam in an `absolute inset-x-0 bottom-0` wrapper (`.seam` declares `position: relative`), whose 220px specular segment is `display: none` below 1024 and `display: block` above it, as designed. The trust line's ink moved `--ink-3` → **`--ink-2`**: inside `Droplet light` it is on `.liq-light.liq-1`'s .55 white, where `--ink-3` is 4.17 and forbidden (§A6). Measured `color: rgb(74, 69, 82)` = `--ink-2`. Everything the card said to keep is untouched: the duplicated row, `--marquee-d: 42s`, the `--scroll-velocity` lead on the ROWS (never on `animation-duration`), the reduced-motion native-scroll fallback and `loading="eager"`.
- **ErpBand drops its panel plate.** Part E row 9 asks for a centred `display-2`, the six marks at their existing sizes and one Conduit; the `rounded-xl border bg-canvas` card the marks used to sit in re-adds exactly the weight `py-14` (56px, down from `section-pad`'s 80–140px) exists to remove — and this section IS the seam between StatBand and ProcessRail, whose upper edge is already a Meniscus filled with this section's `--surface`. The Conduit spans the strip's full 1140px so it reads as one channel feeding all six rather than a decorative underline. The heading string is untouched and must stay "ERPs We Integrate With" (CONTENT-TODO §1 — it must never imply partnership).
- **`SectionProgress` for two more sections.** WhyUs (spine flow + Node sequence) and ErpBand (Conduit flow) both read `--sp` and are otherwise pure server markup, so they use the Phase-6 wrapper rather than becoming client components. Verified fail-closed at rest: with `--sp` unwritten the WhyUs flow parks at `translateY(-366px)` (390) / `-269px` (1440) and the ErpBand flow at `translateX(-130px)` / `-433px` — off-track and invisible in both cases.
- **HomeFaq's Caustic clip box needs `isolate`, which is the OPPOSITE of every dark band's.** `.section-dark` is itself a stacking context, so Phases 6/7 deliberately left the clip box plain and let the disc's `z-index: -2` resolve against the band. A light section is not a stacking context, so without `isolate` on the box that `-2` climbs past the section and the disc paints behind its own `bg-canvas` — invisible. Verified on the gate server: the caustic's `offsetParent` computes `overflow: hidden` **and** `isolation: isolate`, and the content column (`relative`, later in tree order) still paints above it.
- **The FAQ Caustic's AA cost, computed by hand because the walk cannot see it.** A sibling overlay is not a background layer of the text's ancestors, so `qa.mjs`'s contrast walk is blind to it (Phase 6 measured the dark case at 4.52 → 4.00). `--violet-soft` is `rgba(142,36,170,.10)`; over `--canvas` #faf8fc that composites to **rgb(239,227,244)**, relative luminance 0.7982 against the bare canvas's 0.9449. On that core `--ink-2` #4a4552 is **7.49:1** (8.78 without it) and `--ink` #1d1d1f is **13.59:1** — both far above AA, so the disc may sit over the accordion's upper rows. The light case has headroom the dark one does not, where `--ink-inv-2` clears tier 2 by 0.02. For the same reason the light Pool is cheap: `--ink-2` over a `--violet-soft` basin on the WhoWeAre card's fill (rgb(254,253,254)) is **7.76:1**, down from 9.14 — the pools are kept off the text on the §A6 rule, not because the numbers fail.
- **The FAQ row marker has two call-site deviations from `node-light`, both for visibility.** (a) The FILL is `--violet-500` inline: `.node-light`'s `--lavender-200` disc is designed for a 44px plate carrying a `--violet-text` glyph, and as a bare 6px bead on `--canvas` it is ~1.1:1 against its own host — the Ecosystem port-bead precedent verbatim (Phase 7), and `--violet-500` is the palette's flow colour. (b) The STATE is the bead's own **opacity** (0.32 closed → 1 open), as Part E row 12 asks, because `.node-glow` is a `--violet-glow` (.16 alpha) radial and `.35 → 1` on it is not perceptible at 6px; `data-lit` is still passed, so the glow rises too. Measured: closed rows read `opacity 0.32, glow 0.35, data-lit null`; the open row `opacity 1, glow 1, data-lit true`, with `.acc-panel`'s `grid-template-rows` going 0px → 97.1px and back and `aria-expanded` tracking — the mechanics Part E row 12 says to keep are byte-identical. Closed still resolves to a visible pale violet (~rgb(216,183,226) over `--canvas`); the bead is `aria-hidden` and the affordance is the chevron plus `aria-expanded`, so WCAG 1.4.11 does not ride on it.
- **Testimonials' `--ink-3` role line was verified, not assumed.** The cards are `.liq liq-light` **tier 2** with no `liq-1`, where §A6 puts `--ink-3` at 4.56; over this section's `--surface` #ffffff it measures **5.41:1**. `qa.mjs`'s ink-on-glass rule keys on `.closest('.liq-light.liq-1')`, so it would have flagged the same colour one tier down — and it reports **0** with these hosts present. The flat `border-line-soft` and `shadow-card` came off both light Vessel families: on `.liq` the rim ring IS the border and `--liq-light-shadow` is the elevation (§A2, Phase 2). `bg-canvas` came off the Testimonials figure for a harder reason — `.liq` sets `background-color` after Tailwind, so a `bg-*` utility on a `.liq` is a silent no-op (the same trap Phase 2 recorded for `Card`'s light feature).
- **`contract.py`** gains the five classes phase 8 is the first to RENDER — `conduit-light`, `pool-light`, `seam-light`, `caustic-light`, `droplet-light`: every motif's light variant was composed in `components/motifs/*.tsx` from phase 2, but nothing rendered any of them until now (`node-light` is the one exception, wired by the Ecosystem beads in phase 7). Each is emitted by a `light` prop, so the `used` regex finds the literal in the motif rather than at the call site — the standing `conduit-scroll` and `drift-near` already have. Tokens: the light material's fills/blurs/edge/specular (`--liq-light-1-fill`, `--liq-light-1-blur`, `--liq-light-2-fill`, `--liq-light-2-blur`, `--liq-light-edge`, `--liq-light-spec`), plus `--violet-soft` (the light Pool's and Caustic's alpha — the counterpart of phase 6's `--violet-a24`), `--lavender-200` (the light Conduit's track and the light Node's disc) and `--line-violet` (the light Seam's specular segment; white is invisible on a light band). **`--marquee-d` is deliberately NOT listed:** `.marquee` only ever READS it (`var(--marquee-d, 36s)`) and LogoMarquee sets it inline, so it is never declared in a stylesheet and listing it would be an orphan by construction — the same standing as `--lit-at`.
- **Gate (`--since main --skip-pixdiff`): PASSED.** tsc / lint / contract / ownership clean, build `z9_PmAUES4bddbQTQIJQj`, 13 routes healthy, `qa.mjs` all zeros over 52 page-views **including `ink on glass: 0` with the new light-glass hosts present** (three `.liq-light` Vessel families and two `Droplet light` capsules), motion 22/22, WebGL clean, cascade 9/9, the geometric sweep **0 findings across 65 page-views**, keyboard 9/9, reduced motion 15/15 (`/`: reveals visible `hidden=0 moved=0`, marquee `animation: none`, no WebGL canvas), and the composited audit **0 disallowed** on all five routes: `/` TBT 22ms perf 95 · `/services` 45ms perf 90 · `/connected-banking` 16ms perf 96 (3 allowlisted `conduitPulse`) · `/contact` 18ms perf 96 · `/banks/axis` 18ms perf 96.
- **The composited audit's zero is not vacuous.** Animations actually running on `/` after a full scroll-through, at the audit's trace size (390): `scrubDrift` ×19, `liqEnter` ×6, `sheetEnter` ×5, `sheetShadow` ×5, `odoRoll` ×14, `cardDepth` ×3, `chipFloat` ×3, `chromeElevate` ×2, `marquee`, `orbHandOff`, `heroRecede`, `lensCausticSway`, `lensGlintFloat`, `ping`. Phase 8's own contributions are visible in that list: `scrubDrift` went 14 → **19** (WhyUs' four ghost wrappers + HomeFaq's Caustic), `cardDepth` ×3 is Testimonials, `orbHandOff` ×1 is WhoWeAre's Pool (the Ecosystem orb is ≥lg only, hence ×2 at 1440), and 1440 adds `scrubFadeSide` ×4 — one per WhyUs row.
- **QA note for anyone capturing full-page screenshots:** growing the CDP viewport to the document height RE-LAYS-OUT the page, because the hero is `min-height: min(92svh, 920px)` — at 1440×900 it is 828px, and with the viewport grown to ~9000px it becomes 920px and every section below moves down by 92px. Measure section boxes AFTER the resize, not before; the first pass of the phase-8 crops was offset by exactly that 92px and looked like a clip-rect bug.

**Phase 9a (the inner-page grammar — PageHero, the Card language, /connected-banking's conduits, /industries' Vessels):**
- **The Meniscus budget is now spent, and the dark `PageHero` spent the third.** Part C caps it at three uses site-wide; Hero → Marquee and StatBand → ErpBand took two in phases 4 and 6, so `tone="dark"` is the last one and **no later section may add a Meniscus** — 9b's /about and /contact heroes get theirs from this component, not from new call sites. The consequence for the LIGHT tone, which Part G leaves open, is that it ends in a flat `Seam` rather than a curve.
- **The hero's bottom edge is IN FLOW, not absolute — the opposite of the Hero's and StatBand's.** Those two stack `Seam` then `Meniscus` inside one `absolute inset-x-0 bottom-0` wrapper because they have 80–140px of `.section-pad` to hide an 80px curve in. `PageHero`'s bottom padding is the 32/48px of its own rhythm contract (which Part G freezes), so an absolute Meniscus would have painted its opaque `--surface` fill over the bottom 32px of the lead at `md` and above. In flow it is the section's tail: the padding contract is untouched and the plum simply ends in a curve. Neither element needs a positioning wrapper in that arrangement, which is also the only reason it is legal — `.seam` and `.meniscus` declare their own `position`/`display` in motifs.css and out-rank an `absolute` on the same element. The fill is a **`nextSurface` prop** (default `var(--surface)`, which is what both dark-hero routes open on) rather than a literal, because a route opening on `--canvas` would otherwise paint the wrong white.
- **`PageHero` owns `overflow-hidden` and, on the light tone, `isolate` — no Caustic clip box.** Phases 6–8 put every Caustic in its own `absolute inset-0 overflow-hidden` box specifically because those sections carry `.sheet-shadow`, whose upward 40px a section-level `overflow: hidden` would clip. `PageHero` has no sheet shadow, so the clip can live on the section and the disc is a direct child. `isolate` on the light tone is the HomeFaq finding (Phase 8) applied one level up: `.section-dark` is a stacking context and a light section is not, so without it `z-index: -2` climbs past the section and the disc paints behind `--grad-wash`. Verified on the gate server: the caustic's `offsetParent` is the `<header>` with `overflow: hidden` **and** `isolation: isolate` on the light tone, `isolation: auto` inside `.section-dark` on the dark one.
- **Caustic placement, and why the dark hero needs no geometric constraint.** DARK is upper-right per Part G, anchored in **px from the top** (`x: calc(100% - 340px)`, `y: -170px`, 420px) so the geometry is viewport-independent like the padding contract: centre (100% − 130px, 40px), and the gradient's alpha reaches 0 at 70% of the radius = 147px, so its influence ends at y = 187px — above the lead at every width. That placement is aesthetic, not an AA fix: on the FLAT band `--ink-inv-2` (#cebcd4) measures **8.06:1** over band B's brightest composite (rgba(142,36,170,.22) over `--plum-800` = rgb(66,22,79)) and still **6.88:1** with a full `--violet-a24` core beneath it. The 4.5 floor is only in danger where such a core sits under GLASS (below). LIGHT is lower-right (centre 100% − 90px, 100% − 40px, measured at (1350, 583) in a 1440×619 hero): `--grad-wash` already carries violet blooms at 15% 20% **and** 92% 15%, so a third one up there is redundant and the flat corner is the bottom.
- **The Caustic-under-glass arithmetic is the one number this phase turned on, and it is invisible to every check.** A `.caustic` is a sibling overlay, so `qa.mjs`'s contrast walk composites the band and the glass and never sees it. Computed on the walk's own model (brightest stop of every layer, source-over), reproducing the repo's calibrated values exactly (4.52 tier 2 / 4.04 tier 3 over plum-700, 5.41 `--ink-3` on light tier 2):

  | surface | `--ink-inv-2` | `--ink-inv` |
  |---|---|---|
  | `.liq` over band A (plum-700) | 4.52 ✓ | 7.4+ ✓ |
  | `.liq` over band B | 4.54 ✓ | 7.38 ✓ |
  | `.liq` over band A **+ full caustic core** | **4.00 ✗** | 6.51 ✓ |
  | `.liq` over band B **+ full caustic core** | **4.01 ✗** | 6.52 ✓ |
  | `.liq-3` over band A | **4.04 ✗** | 6.56 ✓ |

  Two call sites act on it in opposite ways, and both are honest rather than loopholes. **How It Works gets no Caustic at all** (the task card did not ask for one; adding ambience there would have cost the flanks' 0.02 of headroom). **/industries' dark mocks promote every run to `--ink-inv`** — including the ones that read as secondary on the light mocks — because below `lg` the stacked columns put the row's disc wherever the section is 72% tall, so no placement can guarantee it stays off the Vessel. Hierarchy comes from size and weight instead, which is what a UI mock has anyway. Measured on the gate server: every text run inside `#ecommerce .liq` computes `rgb(247, 243, 249)`.
- **`--lavender-400` is not a text colour inside `.liq`.** On tier 2 over plum-700 it is **4.36:1** — under the 4.5 text floor, comfortably over 1.4.11's 3:1 for non-text. It is therefore used only for glyphs (the architecture chips' icons, the checkout's card icon) and the checkout's radio bead, never for a run. StatBand's `affixClassName="text-lavender-400"` is on band C, a different composite, and passed the walk on its own merits in phase 6 — this is a rule for new call sites, not a re-litigation of that one.
- **`Card`'s first call sites, and the two escape hatches it needs.** `Card` shipped in phase 2 with no consumers; nothing about it had to change to finish it (`href` → `next/link`, the light feature as solid `bg-tint` and not `.liq`, tier 3 → all `--ink-inv` were already right), so this phase only documented the measured matrix above, the `.liq-live` exclusivity that `className` can silently break, and the blur-budget hatches. **`liq-flat` is the default for a Card GRID**, and on `--canvas`/`--surface` it is free by the phase-8 arithmetic rather than a compromise — nine `.liq-light` capability cards would have been nine blur layers. `liq-flat` is also the *fix*, not a nicety, for a Card inside an ancestor with `opacity < 1` or `contain: paint` (a backdrop root); a `[data-reveal]` wrapper is only opacity < 1 during its entry transition and rests at 1, so that case is transient and needs nothing. `card-icon-light` reaches the page for the first time here.
- **The capabilities rail keeps `.orb-hand-off`, mapped onto the Node glow — and the fallback it had could be deleted, not replaced.** The 16px plum dot is a `Node`, and the lighting is the page's existing keyframes on a **second `.node-glow`** passed through `Node`'s `icon` slot (ProcessRail's construction): `view()`-timed over the row's own transit, peaking as the card crosses the viewport centre. Using the kit's class buys `.node > :not(.node-glow)`'s forced `position: relative` skipping it, and motifs.css's reduced-motion `.node-glow { opacity: 1 !important }` re-lighting it. The old `peer-data-[inview]:scale-100` fallback and its `--orb-x` are **gone**: the fallback existed because the bare dot was invisible until it scaled in, whereas a Node is a real disc that paints from the server, and `--orb-x` existed to preserve a centring transform the animation would overwrite — the centring is now a negative margin (`lg:-ml-2`) on the wrapper, which no animation touches. The bead's FILL is `--violet-500` inline: `.node-light`'s `--lavender-200` disc is ~1.1:1 against `--canvas` at that size (the Ecosystem port-bead and FAQ marker precedents), and `--violet-500` is the rail fill's own lower stop.
- **`SectionProgress` gained `live`** — the `--sp-live` publish (matchMedia guard, two-frame wait, removal on unmount) lifted verbatim out of ProcessRail. Without it the capabilities section would have had to become a client component to get one custom property, shipping `content/capabilities.ts` and the motif kit to the browser; with it the section stays server-rendered and the client boundary is one element. It is **off by default** and How It Works does not pass it: that section's two Conduits are decoration and must fail CLOSED, and publishing the alias there would light every decoration for reduced-motion and no-JS visitors.
- **The rail's fill window is `0.15 / 0.85`, and the arithmetic is the section's own.** `--sp = (scrollY + vh − sectionTop) / (vh + H)`, so an element `d` px below the top crosses the viewport CENTRE at `sp = (d + vh/2) / (vh + H)`: with the rail running d ≈ 0 → d ≈ H that is 0.16 → 0.84 at 1440×900 (H ≈ 1900) and 0.14 → 0.86 at 390×844 (H ≈ 2200). Sampled on the gate server by wheel-scrolling: `--sp` 0.56 → rail `scaleY(0.593)` with the nine glows at **[.35 .35 .35 .42 .75 .92 .58 .35 .35]** — one travelling swell, and the fill front and the lit row arriving together. Under reduced motion `--sp-live` is never published, the fill rests at `scaleY(1)` (content fails OPEN) and all nine glows read **1**.
- **The hero diagram is `flow="loop"`, and that is forced.** A hero has no `--sp` driver — it is already mid-transit when the page paints, so a scroll-driven band would sit parked mid-channel and then simply leave. `conduit-loop` is therefore wired for the first time here (≥1024 by design). Below 1024, and under reduced motion where motifs.css kills it by name, `.conduit-flow` has no transform of its own, so the band **rests at the head of its channel at opacity .9** — a visible settled pose, which is what the reduced-motion rule requires; verified: `animation: none`, `transform: none`, `opacity: 0.9` on all four tracks.
- **Two Conduits per run, reversed with `-scale-x-100` on a wrapper.** Mirroring flips the track and its band together so the band's bright leading edge stays leading; there is no animation on that wrapper, so nothing contends for its transform (`cascade.mjs` reads inline transforms, and this is a class). Four tracks total, measured 87px each at 1440 and mirrored on the second of each pair.
- **The hero diagram moved into normal flow, which is what fixed the 0×0 hazard at its root.** The old composition was absolutely positioned inside an aspect-locked box, so its max-content width was genuinely nothing — the case `PageHero`'s `justify-self` note was written for. All three disc centres now line up at one y by construction (the 56px hub's own centre; the 48px endpoints via `mt-1`; the 20px Conduit pair via `mt-[18px]`), measured **cy = 347 for all three**. Widths at the narrowest real case — 390px less the hero's `px-6` and the plate's `p-6` = 294px — are 2×76 + 56 + 4×6 = 224px, leaving 35px per run; `scrollWidth === clientWidth` at 390 and 1440 on both routes. Every label is the previous diagram's verbatim, and **"Partner bank" stays generic** with its `TODO: client to confirm` intact (CONTENT-TODO §2). The diagram stays `aria-hidden`, as it was: it restates the lead beside it.
- **The hub Nodes take an inline `background`/`color` pair, not `.grad-fill`.** `.node-light` sets both properties in motifs.css, which is emitted after globals.css and after Tailwind and wins every one of those ties — the Ecosystem port-bead precedent (Phase 7) generalised. `.liq liq-1` was the alternative and is worse in two ways: `.grad-fill` sits LATER in globals.css than `.liq`, so its `background-image` would silently delete the wet edge, and the frost would be a wasted blur layer behind an opaque gradient.
- **`visualFrame` defaults to TRUE, which means /services and /banks/[slug] pick up the plate before 9b touches them.** Part G's rule is "a Vessel plate only when the visual is a DIAGRAM", and three of the four visuals are diagrams, so `true` is the right default and the raster opts out. This phase may not edit those two pages, so until 9b runs: **/services frames a raster in a `.liq liq-light` plate** (it should pass `visualFrame={false}`), and **/banks/[slug] frames a card that already has its own border and `shadow-float`** (9b replaces it with the vertical Conduit stack Part G specifies, at which point the plate is correct). Neither can fail a check — the plate is a block wrapper, the image keeps `w-full max-w-[620px] h-auto`, and `scrollWidth === clientWidth` holds — but both are interim looks, not the intended ones.
- **`/industries`' row rhythm is ONE exported table, `ROW` in `Mocks.tsx`.** The page needs it for the band and the mocks need it for their ink, and a mock rendered light on plum is invisible with no check able to name the cause — so the tone, the band class and the Caustic geometry are keyed by `mock` in the file that owns the mocks, and the page consumes it. NBFC is specifically `band-a`: phase 7 measured `--terminal-cmt` at 5.44:1 on the Ledger's composite over band A's brightest stop and 5.32:1 with a Caustic core behind it, so moving that row would mean re-measuring the whole syntax palette. Verified on the server: `#nbfcs` band = `linear-gradient(rgb(66,23,76), rgb(26,6,32))`, terminal `rgba(23,27,33,.78)` + `blur(18px)`, `.ledger` present.
- **`Shell` is now one Vessel, and the light rows are `liq-flat` by arithmetic.** The old canvas-card-inside-a-canvas-card is a single `.liq liq-light` (light) / `.liq` (dark) pane on the 24px Vessel radius. No flat `border`, no `shadow-card` (the rim ring is the border, the material owns its elevation) and no `bg-*` utility — `.liq` sets `background-color` after Tailwind, so `bg-canvas` on a `.liq` is the silent no-op phase 2 recorded for `Card`'s light feature. Light rows sit on a flat `--surface`/`--canvas` where the frost is provably zero pixels of difference, so they carry `liq-flat`; dark rows sit on a plum gradient with a Caustic behind them, so their frost does real work.
- **The reconciliation Pool is bottom-anchored arithmetic, and the tolerance is `.pool::before`'s again.** `.pool` is the bottom 46% of its box (a Tailwind `h-*` would lose to motifs.css), so the bar's trough is `pt-3 pb-10` = 12 + 8 + 40 = **60px**, giving a **27.6px** basin whose top — where the 1px lavender meniscus line paints — sits at **32.4px**, a measured **12.4px** below the bar's 20px bottom. Phase 8's finding governs the number: at ~10px that line stops reading as a liquid surface and starts reading as an underline. The foot row stays OUTSIDE the box, because §A6 allows only `--ink` over a light Pool and those two runs are `--ink-3` and `--violet-text` — kept off it geometrically rather than promoted. Pool first in DOM, bar on `relative z-[1]` (StatBand's trap).
- **`Rails` is three Nodes and two `ConduitPath`s, and the middle one keeps the old highlight.** The outer two are `node-light` at its designed size (a 40px `--lavender-200` disc carrying a `--violet-text` glyph); the router keeps the emphasis the `bg-plum-700` box had, as `--grad-tile` inline. The two hops are `pathLength="100"` with `8 92` and a **−3s** delay on the second, so the two packets sit half a 6s period apart — one arrival every 3s. `sm:mt-4` centres each 8px svg on the 40px Node's centre; measured, all three Nodes and all five svgs land at **cy = 447**. `.conduit-pulse` is `display: none` below 1024 and under reduced motion (verified at 800px and with `--force-prefers-reduced-motion`), so at those sizes the connectors are their solid `--lavender-300` base stroke and the composition is complete and static.
- **Phase 7's sub-10px fix is preserved and re-verified.** The `Rails` labels stay `text-[10px]`; a sweep of every computed `font-size < 10px` inside `#fintech` on the gate server returns **[]**.
- **`.eco-wire` now has NO rendered call site anywhere on the site.** This phase replaced the last two: /connected-banking's hero ellipse and `Flow` arrows (which is why the composited audit's *allowlisted* count on that route drops from **3 to 0**) and /industries' `Rails` hops (now `conduitPulse`, which is `display: none` at the audit's 390px trace size, so that route reports 0 allowlisted too). **Nothing was removed:** `.eco-wire`/`@keyframes ecoWire` stay in globals.css and `ecoWire` stays in `gate.sh`'s `ALLOWED_ANIM` — `contract.py`'s class list fails on orphans, not on dead rules, and retiring an allowlist entry is a gate change. **Phase 10 should delete both**, and the globals.css comment claiming /connected-banking and /industries still use it is now stale.
- **Deliberately out of scope, and visible as such:** /connected-banking's ERP-logo strip is untouched (Part G's list for that route covers the hero, the capabilities rail and How It Works; Part E row 9's restyle is the HOMEPAGE ErpBand), so it still carries `border-y` and no Conduit. The `Ledger` mock function was renamed **`LedgerSync`** — Part C's Ledger is the glass code WINDOW this page now uses for NBFC, and two things called Ledger on one page is one grep away from a mistake.
- **`contract.py`** gains the three classes this phase is the first to render or wire — `liq-3` (composed in `Card` since phase 2, first RENDERED by the How-It-Works centre Vessel, which is also what finally gives §A6's tier-3 rule a host for the ink-on-glass check to walk), `card-icon-light` (`Card` had no call sites), `conduit-loop` (composed at render as `conduit-${flow}`, so `used` prints False — the standing `conduit-scroll` / `drift-near` case) — and five tokens: `--liq-3-fill`, `--liq-3-blur`, `--grad-tile`, and `--ink-inv` + `--surface`, both of which components have named directly since phase 4 (`Meniscus fill="var(--surface)"`, HeroLens' glint core) and which the list simply never carried. `mk-bar`/`mk-press` are deliberately NOT listed: they live in a React 19 `<style href precedence>` inside `Mocks.tsx`, not in a stylesheet `app/layout.tsx` imports, so listing them would be an orphan by construction — the standing `--lit-at` and `--marquee-d` have.

**Phase 9b (inner pages, part 2 — `/about`, `/services`, `/solutions`, `/contact`, `/banks`, `/banks/[slug]`, and the legacy-vocabulary retirement):**
- **`.glass*` retires by ALIASING, not by deletion, and `.sheen` retires by deletion.** `.glass`, `.glass-1/-2/-3` and `.glass-strong` no longer have bodies of their own; they are added to the `.liq` recipe's own selector lists (`:is(.glass, .glass-1, .glass-2, .glass-3, .glass-strong)`), so the legacy names and the V4 material are literally the same code and cannot drift. Mapping is §A4's: `.glass`/`.glass-2` → tier 2, `.glass-1` → tier 1, `.glass-3`/`.glass-strong` → tier 3. They are kept rather than dropped because `contract.py`'s original B0 class contract lists `glass-1/2/3`; **Phase 10 may drop the names and that contract entry together, alongside `.eco-wire`.** As of this phase no `.tsx` renders any of them — /about's Commitment cards, /services' PartnerProgram and /solutions' solid card were the last three call sites. `.sheen` has **no honest successor** and so is gone outright: `.liq-spec` reads `--_spec`, which only `.liq`/`.liq-light` set, so on the non-glass gradient cards `.sheen` rode it would paint nothing; and `.liq-sweep`, which does have `.sheen::before`'s geometry, is scroll-driven, desktop-only and forces `--ink-inv` on every run inside the element, which a `grad-fill` card whose body must stay `--ink-on-violet-2` cannot satisfy. A hover sheen is therefore not part of the V4 vocabulary at all: glass hovers with `.liq-spec`/`.liq-spec-full`, scrolls with `.liq-sweep`, and a solid card hovers with `.spotlight` (light) or a Pool + lift (violet). `@keyframes sheenSweep` went with it and `.sheen::before` came off the reduced-motion `display: none` list. All `--glass-*` **tokens** stay — they are the AA-calibrated source the `--liq-*` fills alias (§A2, "never fork the numbers"), `--glass-line`/`--glass-bg` dress `.section-dark .eyebrow-capsule`, and `--glass-3-line` is named directly by `ConduitPath`.
- **The aliases needed `position: relative` and did not get it — found in the 9b review.** Historically the TIER names deliberately set no position, so a tier class stayed safe on an element that is `absolute` (the retired PartnerProgram chips were); that was sound only while they were pseudo-element-free, their wet edge being a background *layer* rather than a pseudo. Aliasing gave all five names the rim ring's `::before` at `position: absolute; inset: 0`, and an unpositioned host resolves that against the nearest positioned **ancestor** — a full-size chromatic ring painted across an unrelated box, strictly worse than the edge it replaced. All five now sit in the `@layer components` position rule with `.liq`, which preserves the original guarantee for a different reason: the components layer loses to a Tailwind `absolute` utility on the call site, exactly as it does for `.liq` itself. Latent only — nothing renders the names — but the comment had asserted safety the code no longer provided.
- **§A8, the backdrop-root rule, is new in this phase** (spec text above) and its one open instance is closed: ProcessRail's four step `Node`s take **`liq-flat`**. All three pin keyframes animate opacity with `fill-mode: both`, so the `<li>` is a backdrop root for the *whole* pinned stretch rather than just its ends — the frost was never rendering, and nothing could report it, because fill, rim, shadow and every measured AA ratio are identical either way. The choice was between a blur the compositor was already discarding and an honest declaration that there is none. It also hands §A7 four layers back: this section's desktop count goes 5 → 1.
- **Three carried findings from the Phase 6/8 reviews are fixed here.** (i) `LIT_AT` is now `litAt(i, n)`, derived by inverting the Conduit band's own position — at n = 3 it yields 0.2534/0.4971/0.7407, byte-identical to the old array at cards 1–2, and the third moves 0.75 → **0.74**, i.e. the array was the outlier and the doc comment above it had said 0.74 since Phase 6. (ii) **Text over a Caustic core is `--ink-inv`.** A Caustic is a sibling overlay, so `qa.mjs` composites the band and the glass and never sees it; on the walk's own model, WhatWeDo body copy at `--ink-inv-2` is 4.52 flat and **4.00** over a full `--violet-a24` core, and StatBand's Droplet labels 4.87 → **4.27**. Geometry cannot fix either: tier 2's headroom is 0.02, so the largest core alpha `--ink-inv-2` survives is 0.0104 — the disc's whole 70%-radius influence circle would have to clear every run at every breakpoint, and below `lg` the cards stack full-bleed so no placement can promise it. Both promote to `--ink-inv` (7.36/6.51 and 7.92/6.95) and take their hierarchy from weight and size instead. The affixes stay `--lavender-400` at 3.90–4.42 because `.stat-num` is 700 weight at 21–41.6px, i.e. **large** text with a 3:1 floor — a rule that does not transfer to body copy. (iii) The Pool's rise is `calc(var(--reveal-delay, 0ms) + 120ms)` on both properties, so it is staggered relative to its own card rather than to the group; the `0ms` fallback keeps a lone `<Reveal>` at the original +120ms, and the reduced-motion block's `transition-delay: 0s !important` still overrides it.
- **Two `light`-less Conduits painted white on near-white, and one of them had a comment claiming the fix — found in the 9b review.** /connected-banking's capabilities rail carried a new paragraph reading "`light` is REQUIRED here and was missing until Phase 9b" while the prop was never added (the file's whole diff was 12 insertions, 0 deletions), and `OfferTimeline` carried a *contradictory* new paragraph calling the omission "a DELIBERATE divergence… Do not 'harmonise' this one back to that." A default track is `--glass-1-bg` (white .05) ringed with `--glass-1-line` (white .16) plus a white .12 top line — three whites on `#faf8fc`, so the channel is invisible and the violet fill reads as a bar floating in space with nothing to fill. Both are now `light`, as are the hero `ConduitRun`'s four tracks, whose near-white ground is `PageHero`'s own `.liq liq-light` plate (the diagram is passed as `visual` with no `visualFrame={false}`). The "deliberate divergence" paragraph is deleted: it existed only to justify the unfixed state. **Nothing in the gate can see a motif that paints its own background invisibly** — this is the second phase to say so and the first to be caught by it.
- **`NODE_POS` was the `LIT_AT` bug in both directions at once, in a file this phase rewrote — found in the 9b review.** `PartnerProgram` mapped `NODE_POS` (five hand-tuned anchors) while keying off `PARTNER_PROGRAM.nodes[i]`, and mapped `PARTNER_PROGRAM.nodes` while reading `NODE_POS[i].x`. A sixth content entry threw `Cannot read properties of undefined` and took `/services` down at render with a 500; a removed one gave a `<ConduitPath>` an `undefined` key and drew a spoke to an endpoint that no longer existed. Both maps are now driven by `PARTNER_PROGRAM.nodes` against `ANCHORS = nodeAnchors(n)`, which returns the tuned table unchanged at n = 5 and otherwise a uniform ellipse on the tuned five's own bounding envelope (centre 47%,49%; radii 34%,35%) — collision-free and honestly a fallback, since a new count wants re-tuning; it just must not crash first. The same family, silent rather than fatal: `/services`' `SATS` used a hardcoded `360 / 7`, where an eighth service resolves `i = 7` to −90 + 360 and stacks two satellite Nodes exactly on top of each other — now `360 / SERVICES.length`. (Its `aria-label` is still a hand-written string naming seven categories, so a content change there still needs a human; the fix only stops the drawing from lying.)
- **The §A7 blur-budget comments are the only §A7 "check" in the repo, so two wrong ones were real findings.** Both over-counted `CtaBand`, whose `variant="glass"` Button renders **only when a `secondary` CTA is passed** — and no route passes one. /about's phone peak is the pill alone (1), not "the pill plus CtaBand's glass CTA = 2"; /solutions is 2 of 8 desktop and 1 of 4 phone, not 3 and 2. Errors in the safe direction, so §A7 was never breached. `banks/page.tsx` gets this right and is the model.
- **The composited-animation audit went 5 routes → 7**, adding `/about` and `/solutions`, because the Phase 7 failure was precisely a route-coverage gap: a chrome `transition: color` that `/` can never expose (its hero is dark at scroll 0) fired on every light-hero inner page and went unseen until three audited routes happened to catch it. /about is the second route ever to render `HeroLens` (so `lensCausticSway`/`lensGlintFloat` run somewhere other than `/`) and the first to put a mid-page `.section-dark` inset under the pill observer; /solutions adds a `.sheet-enter` dark band, a drifting Caustic and the Ledger's live `backdrop-filter`. Both had been argued safe in file comments and verified by nothing. The gate's assertion count goes 23 → 27 with `--since` and pixdiff.
- **`RAIL_FROM/TO` = 0.32/0.72 on /solutions is NOT sampled**, unlike the homepage's, which were measured. The phase that next runs a server against that section owes it the same treatment.
