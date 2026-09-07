# linkapitech-site

**linkapitech.com — "Figma Purple".** A deep-plum/orchid corporate site for
LinkAPI Tech Pvt. Ltd., rebuilt ground-up to follow the client-authored Figma
file *"LinkAPI Website"* and then elevated with liquid-glass surfaces and
scroll motion the static Figma can't express. Populated entirely with
**LinkAPI's real content**.

> **Design lineage.** This is the third direction, now in its fourth
> iteration — **V4 "Liquid Glass"**, which rebuilt every surface on the `.liq`
> material and the nine-motif kit. It supersedes *Institutional Light*
> (deep-navy, mega menu), which superseded the *allgoodstudio* design clone.
> The authoritative spec is **`REDESIGN-V4.md`** in this folder (Part J is the
> running decision log); `REDESIGN-V3.md` is the superseded V3 spec, and
> `HANDOFF-V4.md` carries current state, open findings and hard-won gotchas. The
> large spec documents in the parent folder (`DESIGN-SYSTEM.md`,
> `HOMEPAGE-SECTIONS.md`, `INTERACTIONS-AND-MOTION.md`, `PAGES-AND-ROUTING.md`)
> describe the **retired** first direction and are historical reference only.
> `CONTENT-MAPPING.md` is still useful for real contact details and asset
> inventory, but its stats are superseded by `content/stats.ts`.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript, RSC by default)
- **Tailwind CSS v3** + CSS-variable design tokens (`:root` in `globals.css`)
- **Lenis** smooth scroll (marketing route group only, single rAF loop — no GSAP)
- **three** (vanilla, no react-three-fiber) — lazy additive hero haze, see below
- **next/font/google** — **Poppins** 400/500/600/700 (everything) + **IBM Plex
  Mono** 400 (code terminals only); 5 font files, deliberately lean
- **react-hook-form** + **zod** — contact form
- Env-driven analytics; dynamic OG image, favicons, sitemap, robots, JSON-LD

## Palette and type

Primary brand is `--plum-600 #62216F`. Dark sections run `#250D29`–`#42174C`;
light sections sit on `--canvas #FAF8FC`. Two-tone headlines use
`--violet-text #6F257F` (AA-large on white). Full token table in
`REDESIGN-V3.md`; the live values are the `:root` block in `app/globals.css`.

> **Tailwind opacity modifiers do NOT work on `var()` colours.** Every token
> here is a hex/rgba string, so `bg-plum-600/40` compiles to *nothing* — no CSS
> at all, silently. Translucency needs an explicit token (`--line-plum`,
> `--line-violet`, `--violet-soft`). There is a warning comment in `globals.css`.

## Navigation

A **floating white pill navbar** with five flat links. There is deliberately
**no mega menu** — the Figma has none. Below 1024px, `components/chrome/
MobileMenu.tsx` is a `role="dialog"` sheet with focus trap/restore and scroll
lock. It keeps its dialog mounted via `hidden={!open}` rather than unmounting.

## The WebGL hero layer (lazy) — "the lens"

`components/three/` — `HeroLens.tsx` server-renders the hero's SVG lens
(an ellipse in a 500×400 viewBox) and is **the whole composition on its own**.
`HeroField.tsx` / `scene/createHeroLiquid.ts` + `scene/liquidShaders.ts` add
**one full-quad fragment shader** on top — one draw call, zero textures, zero
per-frame buffer uploads. Its rest pose at `uWake = 0` matches the SVG
colorimetrically (measured mean |ΔRGB| 3.8/255), so the 900ms canvas fade reads
as the lens *waking* rather than as a crossfade, and no-WebGL clients lose
nothing. `scene/lensLayout.ts` is the single source of truth for the geometry,
shared by the server SVG and the shader, and `layout.mjs` asserts the two
register to within 1px (measured Δ = 0).

`HeroLens` also takes `compact`, which omits the WebGL layer and the chips —
that is what `/about` renders, so only `/` ever creates a GL context.

The scene is gated on: reduced motion, viewports ≥1024px, a WebGL capability
probe, and an idle dynamic import. It halts its rAF when off-screen
(IntersectionObserver) or the tab is hidden, and fully disposes on unmount. The
ortho camera is mapped 1:1 to the SVG's viewBox so the two cannot drift.

> **Known cost.** On an integrated GPU the shader measures ~5.5ms of GPU time
> per frame against `probe.mjs`'s 2ms budget (the 0.87ms figure it was
> calibrated against was an M1 Max). Shipped as-is by owner decision; see
> `HANDOFF-V4.md` §4 finding 1 for the four mitigation options.

## Motion system

- Reveals are **React-state-driven**: `useInView` (IO threshold 0) renders a
  `data-inview` attribute — re-renders can never wipe the revealed state.
- Spring curves and scroll-scrub tokens live in `lib/springs.ts` +
  `--spring-*`/`--dur-spring-*` in `globals.css`.
- `Magnetic.tsx` gives pill CTAs a 6px pull via **one delegated pointermove
  listener at the root**, which keeps `Button` a server component.
- A global `prefers-reduced-motion` kill-switch snaps everything to its end
  state and prevents the WebGL scene from loading.
- The hero H1 + subhead are **never** reveal-gated (they are the LCP elements).

### Motion gotchas that cost real debugging time

- **`border-radius` in a keyframe silently de-composites the whole animation.**
  Transform/opacity/filter only. CLS-safety and compositing are *different*
  tests. The authoritative check is Lighthouse's `non-composited-animations`
  audit — profiling style recalc does **not** clear a property.
- **CSS animations outrank inline styles.** An element with both `.chip-float`
  and an inline `translate()` anchor silently loses the anchor. `qa:cascade`
  exists to catch exactly this.
- **Responsive grids need a base `grid-cols-1`.** With only `lg:grid-cols-2`
  the implicit mobile column is `auto` — content-sized and free to overflow.
- **`RevealGroup` wraps each child in an element**; that wrapper must be `<li>`
  when `as="ul"/"ol"`. Call sites pass plain children, never their own `<li>`.
- **Outward reveal transforms widen the document** — `[data-reveal=left/right]`
  (±32px) must stay scoped to ≥1024px or phones get a horizontal scrollbar.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: set analytics + email provider
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

### Environment (`.env.example`)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_ANALYTICS_ID` | GA measurement id. Blank = analytics disabled. Never hardcode. |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical/OG/sitemap URLs. |
| `CONTACT_TO_EMAIL` | Destination inbox for contact submissions. |
| `RESEND_API_KEY` | Email provider key. Blank = the API route logs & returns success (dev-safe). |

## Architecture

```
app/
  layout.tsx                 root: fonts, base metadata, analytics, Magnetic
  fonts.ts                   Poppins (400–700) + IBM Plex Mono 400
  globals.css                :root tokens + type scale + reveal/motion CSS
  (marketing)/               homepage route group (Lenis + lazy WebGL haze)
  (site)/                    inner pages (native smooth scroll)
    about  services  solutions  connected-banking  industries
    banks  banks/[slug]  contact  terms  privacy
  api/contact/route.ts       zod + honeypot + Resend-optional form handler
  opengraph-image  icon  apple-icon  sitemap  robots
components/
  chrome/   SiteHeader (pill nav), MobileMenu, SiteFooter, Logo,
            SkipLink, RouteTransition, chrome.css
  sections/ home/* (14 sections), services/*, industries/*,
            PageHero, CtaBand, ContactForm, LegalDoc
  three/    HeroLens (SVG, complete alone; `compact` for /about),
            HeroField (WebGL), scene/createHeroLiquid, scene/liquidShaders,
            scene/lensLayout (geometry, shared with the SVG), scene/palette
  motifs/   the nine-motif kit — Conduit, Node, Pool, Caustic, Seam,
            Meniscus, Card (Vessel), Ledger, Droplet + motifs.css
  ui/       Button, Eyebrow, Field, Icon, StatNumber
  motion/   SmoothScrollProvider, Reveal, RevealGroup, Magnetic, CursorGlow,
            useInView, useSectionProgress, velocity, hooks
content/    services, solutions, industries, banks, capabilities, process,
            testimonials, faq, stats, clients, home, about, legal
            (typed data — single source of truth)
lib/        site (IA + contacts), metadata, analytics, jsonld, cn, springs
scripts/qa/ verification harness — see below
```

### Retired routes

`/work`, `/work/:slug` and `/clients` **308-redirect** to `/industries` and
`/about` (see `next.config.ts`). `content/cases.ts` and `content/benefits.ts`
are **archived**: no route imports them, so they are tree-shaken out of every
bundle. They are retained deliberately in case case studies return.

## Verification

One command runs the whole gate — **27 pass/fail assertions** across 15 named
steps, in dependency order (26 with `--skip-pixdiff`, 25 without `--since`;
`gate.sh`'s header carries the arithmetic):

```bash
npm run gate -- --since <ref>
```

`scripts/qa/gate.sh` covers tsc, the design-token/JS-wiring contract, build +
BUILD_ID assertion, route health across 13 routes, an a11y + layout sweep
(13 pages × 4 viewports), motion, WebGL, cascade conflicts, keyboard,
reduced-motion, a composited-animation audit over 7 routes, and a pixel diff.
The audit contributes two assertions per route (disallowed animations, and TBT).

**The harness needs a global `WebSocket`.** That is Node 22+; on Node 20/21
`lib/cdp.mjs` re-execs itself with `--experimental-websocket`. Without that,
all seven CDP-driven steps fail before Chrome even launches, and the output
looks exactly like seven real regressions.
Individual scripts are documented in `scripts/qa/README.md`; they drive
headless Chrome over CDP and have **no npm dependencies**.

Rules the harness encodes, each from a real failure:

- **Never pipe `npm run build`** — SIGPIPE truncates it and leaves no BUILD_ID,
  which then looks like a server bug.
- **Probe every route for 200 before any sweep** — a sweep against a dead
  server reports zero findings in every category and reads exactly like success.
- **`reporter()` exits 2 if no assertion ran** — a run that asserts nothing is
  a failed run, not a pass.
- **Never run `next dev` and `next start` against one `.next`.** And never
  `rm -rf .next` while a server is running on it.
- `scripts/qa/{baseline,current,review}/` are gitignored — regenerate locally.

Headless Chrome has **no compositor**, so scroll-driven animations there
necessarily tick on the main thread; a headless profile showing style recalc is
an artifact, not jank. Assert compositing via Lighthouse instead.

## Measuring performance

Measure on the **live domain**, not locally: Lighthouse's simulated throttling
is pessimistic without Vercel's edge, so local prod builds read perf 94–98 while
the same pages score 100 in production. Vercel **preview** deployments are
SSO-gated, which silently corrupts measurement — routes 302 to a login page and
Lighthouse's robots-txt gatherer parses that HTML as robots.txt, producing a
bogus "SEO 61". Use the MCP `get_access_to_vercel_url` bypass or a local
production build.

Live mobile Lighthouse: `/`, `/connected-banking`, `/banks/axis` =
**100/100/100/100**; `/services` 95; `/contact` **82** — the last is the Google
Maps embed's ~488KB of third-party JS, a parked product decision (see
`CONTENT-TODO.md` §5).

## Content-truth rules

All facts come from `content/` — real contacts, real service language, and the
Figma's client-authored stats (70,000+ businesses onboarded, ₹60,000 Cr+
monthly volume, 5,000+ API implementations, 300+ clients). These **supersede**
the older published set (45,000+ customers, ₹20,000 Cr/month).

**No outcome claim is attributed to a named bank** — the `/banks` pages are
written as *capability* and carry an explicit "not a claim of official
partnership with, or endorsement by" note. No certifications are claimed (none
exist in the source). Figures inside the industry UI mockups are clearly
illustrative sample data. Draft copy is flagged `TODO: client to confirm`.

## Open items

**`CONTENT-TODO.md` is the sign-off checklist** — 12 items ordered by risk.
The highest-risk one: the homepage marquee asserts a customer relationship for
seven bank and enterprise brands, and each mark needs written permission.
