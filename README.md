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

A **floating white pill navbar** with six flat links. There is deliberately
**no mega menu** — the Figma has none. The Figma drew five; **"The Bank
Plugin"** is the sixth, added at the client's request (2026-08-27) so the hero
product is one click from every page. Six is the ceiling: at `lg` (a 976px
pill) the row only fits because the gaps tighten to `gap-4` / 14px there and
every item is `whitespace-nowrap` — without the nowrap a link wrapped and the
64px pill became two lines at exactly 1024px. A seventh link needs a different
header, not another tightening. Below 1024px, `components/chrome/
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
  (plugin)/                  THE BANK PLUGIN landing sites — no site chrome
    axisbank-lp/  hsbc-lp/  indusind-lp/     one page per bank
  (site)/                    inner pages (native smooth scroll)
    about  services  solutions  connected-banking  bank-plugin
    industries  banks  banks/[slug]  contact  terms  privacy
  api/contact/route.ts       zod + honeypot + Resend-optional form handler
  opengraph-image  icon  apple-icon  sitemap  robots
components/
  chrome/   SiteHeader (pill nav), MobileMenu, SiteFooter, Logo,
            SkipLink, RouteTransition, chrome.css,
            PluginHeader + PluginFooter (the plugin sites' own chrome)
  sections/ home/* (15 sections), services/*, industries/*, plugin/*,
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
            testimonials, faq, stats, clients, home, about, legal, plugin
            (typed data — single source of truth)
lib/        site (IA + contacts), metadata, analytics, jsonld, cn, springs,
            plugin-hosts (subdomain map for the plugin landing sites)
middleware.ts  maps a plugin subdomain onto its bank's page
scripts/qa/ verification harness — see below
```

### `/bank-plugin` and the three bank pages — the hero product

Four routes in **two different route groups**, and the split is the point.
`/bank-plugin` is a `(site)` page — the main site's product page, linked from
the pill nav and the homepage. The three bank pages are `(plugin)` pages:
**a separate site each, with its own menu bar and none of the site chrome**
(client instruction, 2026-09).

#### The URLs

Fixed by the client, and live on the main domain today:

| Bank | URL |
|---|---|
| Axis Bank | `linkapitech.kerning.ooo/axisbank-lp` |
| HSBC | `linkapitech.kerning.ooo/hsbc-lp` |
| IndusInd Bank | `linkapitech.kerning.ooo/indusind-lp` |

`PLUGIN_PATHS` in `lib/plugin-hosts.ts` is the **single** place that maps a
bank to its path; the route folders, every cross-link, the canonical tags, the
sitemap and the subdomain middleware all read it. Note Axis's segment is
`axisbank`, not `axis` — matching the client's instruction and the host its
live portal answers on.

Each is **its own route file** (`app/(plugin)/axisbank-lp/page.tsx`, …), about
20 lines, rendering the shared `BankPluginLanding` with its slug. Not one root
`[slug]` segment: at the root of the app that is a catch-all sitting beside
every top-level page, and while static routes still win, every unmatched path
would resolve through it.

#### Moving them to subdomains later

The machinery is already wired and inert. `middleware.ts` maps an incoming
Host onto a bank's page: the subdomain's **root is rewritten** to that bank's
path (a rewrite, so the visitor's URL bar keeps the subdomain), and **every
other path on that host 308s** to it, so one plugin origin serves exactly one
page. Before that last rule existed, `hsbc.…/about` returned the main site's
About page — three extra copies of the main site on origins whose canonicals
point elsewhere.

**No host is hardcoded, and the map is empty until the environment sets it:**

```
NEXT_PUBLIC_PLUGIN_HOST_AXIS=…
NEXT_PUBLIC_PLUGIN_HOST_HSBC=…
NEXT_PUBLIC_PLUGIN_HOST_INDUSIND=…
```

Unset — which is how it ships today — the pages serve at their
`PLUGIN_PATHS` paths on the main domain, `pluginPageUrl()` returns that path
and middleware rewrites nothing. Set, and the same code serves the
subdomains, each page's canonical moves to its own host, and every cross-link
between them becomes absolute. **No code change:** confirm the names, add them
as domains in Vercel, set the three vars, redeploy.

> **The obvious names are already taken by live software.**
> `hsbc`, `indusind` and `axisbank`.linkapitech.com each serve the client's
> existing plugin **portal** — a Bootstrap app with a working `/login`,
> registration, OTP and plugin download (all three verified serving 200 on `/`
> and `/login`, 2026-09-07). Pointing those at this app would take a working
> product offline. That is why nothing defaults to them and why the real names
> are an open question in `CONTENT-TODO.md`.

To exercise it locally: `npm run dev:hosts` (or the `linkapitech-plugin-hosts`
launch config) sets the three vars to `*.plugin.localhost` and you can drive it
with a Host header:

```bash
curl -H "Host: hsbc.plugin.localhost" http://localhost:3000/
```

#### Why three pages rather than one The product is identical everywhere but the three things a buyer needs are
not: Axis and HSBC register on the LinkAPI portal while **IndusInd registers
inside IndusDirect** and receives the TCP by email; **only Axis publishes a
price**; and support is a Google Form (HSBC), an email desk (Axis) or the
bank's own Centralised Service Desk plus a categorised ticket form
(IndusInd). All of that is per-bank data in `content/plugin.ts`; the shared
product story is the section kit in
`components/sections/plugin/PluginSections.tsx`, rendered by all four routes.

#### The plugin chrome

`PluginHeader` / `PluginFooter` share nothing with `SiteHeader` /
`SiteFooter` but the wordmark: a full-width opaque bar flush to the top edge
(not a floating frosted pill), in-page anchors for that page only (not six
site sections), and Log in / Register on the bank's portal (not "Contact
Us"). It is `sticky` and in flow, which is why these pages carry **none** of
the `pt-[136px]` header clearance every `(site)` route needs, and it contains
**no JavaScript at all** — the anchor row wraps onto its own scrollable line
below `md` instead of collapsing into a dialog, so there is no menu state and
no focus trap. A plum strip above it names LinkAPI and links back to the main
domain, which is the honest disclosure that a page headed with a bank's name
was published by LinkAPI.

The `(plugin)` layout renders no `.chrome-main` and no `RouteTransition`; see
its file header for why each is absent rather than forgotten.

**Bank identity is the mark, never the palette.** These pages stay plum and do
not adopt Axis burgundy / HSBC red / IndusInd crimson — recolouring reads as
the bank having published the page (CONTENT-TODO §1), and every AA figure in
`REDESIGN-V4.md` is calibrated against the plum range.

They deliberately **do not** use the site's section grammar. The client asked for a standalone
landing page for the plugin product whose "layouting and design can be a
little different", with ringg.ai as the reference, so it runs the same tokens
and chrome over a product-page structure: a centred hero above one large
product mockup, flat `bg-surface` plates instead of glass clusters, one dark
band, and **no scroll-driven Conduits or Caustics**. Consequences worth
knowing before editing it:

* **The hub keeps the site chrome; the bank pages do not.** `/bank-plugin`
  is a normal `(site)` page with the pill nav and the footer curtain. Moving
  a section between it and a bank page means moving it across route groups.
* **Its hero is bespoke, not `<PageHero>`.** It still honours PageHero's two
  contracts — `data-hero="light"` (chrome.css's first-frame pill tone) and the
  `pt-[136px] md:pt-[156px]` header clearance — and its `h1` is the LCP
  element, so it is not reveal-gated.
* **The hero column is `text-center`.** `PluginMockup` therefore carries an
  explicit `text-left`; without it every payee name centres inside the window
  chrome.
* **The blur budget is nearly free here** — the pill, the hero Droplet and the
  eyebrow capsules only. The dark step cards are `liq liq-flat`: on a flat
  plum band the frost is provably zero pixels of difference, so they get the
  rim and shadow without a backdrop-filter.
* **`components/sections/plugin/` is shared by five surfaces.** The hub, the
  three bank pages, and `PluginSpotlight` (section 2 of the homepage, right
  after the marquee, which renders `PluginMockup compact`). A change there
  lands on all of them.
* **`.pulse-dot` was fixed to reach this page.** It animated `box-shadow`
  spread — off-compositor, and a hard gate failure — but had **no call site
  at all** until the plugin mockup added one, and `contract.py` fails on
  orphan classes, not on a dead rule with a latent defect. It is now a
  `transform`/`opacity` ring; `@keyframes quietpulse-inv` is gone because the
  colour moved out of the keyframes onto the pseudo-element's background.

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
BUILD_ID assertion, route health across 14 routes, an a11y + layout sweep
(14 pages × 4 viewports), motion, WebGL, cascade conflicts, keyboard,
reduced-motion, a composited-animation audit over 8 routes, and a pixel diff.
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
