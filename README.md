# linkapitech-site

**linkapitech.com — "Institutional Light" redesign.** An ultra-corporate,
bank-audience website for LinkAPI Tech Pvt. Ltd., with the client banks
(HSBC · Axis Bank · IndusInd Bank · Aditya Birla*) as the narrative center of
every page. Near-white canvas, deep-navy accent, typography-led, one signature
vanilla-Three.js hero. Populated entirely with **LinkAPI's real content**.

## Stack

- **Next.js 15** (App Router, React 19, TypeScript, RSC by default)
- **Tailwind CSS v3** + CSS-variable design tokens (`:root` in `globals.css`)
- **Lenis** smooth scroll (homepage only, single rAF loop — no GSAP)
- **three** (vanilla, no react-three-fiber) — lazy hero scene, see below
- **next/font/google** — Schibsted Grotesk 600 (display) + Inter 400/500 (body)
  + IBM Plex Mono 400 (eyebrows/numerals); 4 font files total, deliberately lean
- **react-hook-form** + **zod** — contact form
- Env-driven analytics; dynamic OG image, favicons, sitemap, robots, JSON-LD

## The Three.js hero (lazy-load pattern)

`components/three/` — a "connective arc network": LinkAPI hub, the four bank
nodes on a shallow 3D arc, navy bezier connections, silver data pulses.

- A **static SVG poster** (`HeroPoster.tsx`) is server-rendered in the initial
  HTML — it is the *only* visual under reduced-motion, no-WebGL, or <1024px
  viewports (mobile never downloads three).
- On capable desktops, `HeroVisual.tsx` dynamically imports the scene at
  browser idle (`requestIdleCallback`) and crossfades it in after the first
  rendered frame. three (~110KB gz) stays out of the critical bundle — the
  homepage first-load is unchanged by the scene.
- Bank labels are **HTML text** projected per frame inside the scene's single
  rAF (crisp at any DPR, real text). RAF halts when the hero is off-screen
  (IntersectionObserver) or the tab is hidden; everything disposes on unmount.
- DPR capped at 1.5, antialias off on retina, `powerPreference: "low-power"`.

## Motion system

- Reveals are **React-state-driven**: `useInView` (IO threshold 0) renders a
  `data-inview` attribute — re-renders can never wipe the revealed state, and
  wrappers taller than the viewport still fire.
- Easing/durations are tokens: `--ease-out-expo`, 900ms entrances, 200ms UI,
  80ms staggers. A global `prefers-reduced-motion` kill-switch snaps
  everything to its end state and prevents the WebGL scene from loading.
- The hero H1 + subhead are **never** reveal-gated (they're the LCP elements).

## Mega menu (accessibility contract)

`components/chrome/MegaMenu.tsx` — full-width Solutions/Work panels:
click/Enter/Space toggle; hover-intent (80ms open / 250ms close, one shared
timer across trigger+panel — WCAG 1.4.13 persistent); Esc closes and restores
trigger focus; panels are `hidden` when closed and sit in DOM order directly
after their trigger (natural Tab flow, no focus trap); ArrowDown opens and
focuses the first link; a hover-opened panel absorbs the follow-up click.
Mobile (<1024px): `role="dialog"` sheet with focus trap/restore + scroll lock.

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
  layout.tsx                 root: fonts, base metadata, analytics
  globals.css                :root tokens + type scale + reveal/menu/accordion CSS
  (marketing)/               homepage route group (Lenis + lazy Three.js)
  (site)/                    lightweight inner pages (native smooth scroll)
    about  services  clients  contact  terms  privacy  work  work/[slug]
  api/contact/route.ts       zod + honeypot + Resend-optional form handler
  opengraph-image  icon  apple-icon  sitemap  robots
components/
  chrome/   SiteHeader, MegaMenu, MegaPanel, MobileMenu, SiteFooter
  sections/ home/* (11 homepage sections), PageHero, work/caseToneStyles,
            ContactForm, LegalDoc
  three/    HeroVisual, HeroPoster, scene/ (createHeroScene, palette)
  ui/       Button, Container, Eyebrow, StatNumber, Wordmark, Chip, Field
  motion/   SmoothScrollProvider, useInView, Reveal, RevealGroup, hooks
content/    services, process, benefits, testimonials, faq, cases, stats,
            clients, home, about, legal  (typed data — single source of truth)
lib/        site (IA + contacts), metadata, analytics, jsonld, cn
```

## Quality gates (verified on the production build)

Lighthouse mobile — `/` 90/100/100/100 · `/services` 96/100/100/100 ·
`/work/[slug]` 95/100/100/100 · `/clients` 95/100/100/100
(Perf/A11y/Best-Practices/SEO). CLS 0 on every page. Content fully readable
without JavaScript (RSC HTML, poster included).

## Content-truth rules

All facts come from `content/` — real contacts, real aggregate stats (5000+
API implementations, 45,000+ customers, ₹20,000 Cr/month, 10L+ txns/month),
real service language. **No outcome claim is attributed to a named bank**
(logos are trust signals only), and no certifications are claimed (none
exist in the source). Draft copy is flagged `TODO: client to confirm` in
code comments.

## Open items — `TODO: client to confirm`

- *Aditya Birla wordmark: confirm the exact entity name behind `aditya.png`.
- Licensed vector logos for all four bank marks (`content/clients.ts` —
  `Wordmark` drops SVGs into the same slot).
- Case studies are aggregate program summaries; replace with real
  per-engagement narratives + dates when available.
- Testimonials need real company/role; FAQ and legal copy are drafts.
- Social profile URLs are empty — icons stay hidden until supplied.
