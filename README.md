# linkapitech-site

A faithful design-clone of **allgoodstudio.com**, rebuilt in Next.js and populated
entirely with **LinkAPI Tech's real content**. Built per the plan bundle in the
parent folder (`PLAN.md`, `CLAUDE.md`, and the five spec files).

## Stack

- **Next.js 15** (App Router, React 19, TypeScript, RSC by default)
- **Tailwind CSS v3** + CSS-variable design tokens (`DESIGN-SYSTEM.md §6`)
- **Lenis** (smooth scroll) + **GSAP/ScrollTrigger** — homepage only, one RAF loop
- **next/font/google** — Onest (300–800) + Instrument Serif (italic)
- **react-hook-form** + **zod** — contact form
- Env-driven analytics; dynamic OG image, favicons, sitemap, robots, JSON-LD

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
  layout.tsx                 root: fonts, grain overlay, base metadata, analytics
  globals.css                :root tokens + reveal/VCR/cursor/curtain/accordion CSS
  (marketing)/               heavy-motion route group (Lenis/GSAP/cursor/preloader)
    layout.tsx  page.tsx      homepage
  (site)/                    lightweight route group (CSS smooth scroll only)
    about  services  contact  terms  privacy  work  work/[slug]
    banks  banks/[slug]       bank integration landing pages (Axis, IndusInd, HSBC)
  @modal/                    Works "quick view" parallel slot (Phase 8)
    default.tsx  (.)work/[slug]/page.tsx   intercepts soft-nav to /work/[slug]
  api/contact/route.ts       working form handler (replaces broken template endpoints)
  opengraph-image  icon  apple-icon  sitemap  robots
components/
  chrome/   SiteHeader, MobileMenu, FooterMarquee, SiteFooter
  sections/ Hero, TrustLogos, SplitShell, WorksDeck, ServiceAccordion,
            ProcessStepper, Benefits, Testimonials, ContactSection, ContactForm,
            ContactDetails, Faq, LegalDoc, WorkQuickView
  ui/       Button, Chip, MixedHeading, SectionEyebrow, Marquee, Counter, Field, BankLogo
  motion/   SmoothScrollProvider, Preloader, Cursor, Reveal, VerticalCutReveal,
            HeroAccent, hooks
content/    services, process, benefits, testimonials, faq, cases, stats, clients,
            home, about, legal, banks   (typed data — the single source of truth for copy)
lib/        site, metadata, analytics, jsonld, cn
public/     assets/banks/     bank logos (axis.svg, indusind.svg, hsbc.svg)
```

## What's faithful to the reference

Type system (Onest + italic-serif accent), tokens (`#0d0d0d` / `#ffffff` / rationed
lime `#C6FB50`), hairline borders, global film-grain, the 01–06 numbered-index motif,
sticky index-rail split shell (collapses ≤1100px), palette-inverted Works deck,
7-row services accordion, scroll-driven 4-phase process, 6 benefit cards, testimonial
"approval ledger", chat-style FAQ, footer stats marquee + closing footer. Every
animation is `prefers-reduced-motion`-gated. Reference bugs (PLAN §6) are avoided:
single RAF loop, no auto-firing modal, working form, `#contact` CTA, fixed testimonial.

## What's LinkAPI's real content

Real contacts (Ghaziabad address, +91-9318373476 / partnership@linkapitech.com,
+91-9891121770 / Operations@linkapitech.com, WhatsApp), real trust stats (5000+ API
implementations, 45,000+ customers, ₹20,000 Cr/month, 10L+ transactions), real
About (Mission/Vision/Commitment/Performance), and the real "What we offer?" scope.
No Latin/template filler, no dummy mega-menu.

## Open items — `TODO: client to confirm`

These are drafted on-brand and flagged as **code comments** (not user-facing):

- **Case studies** (`content/cases.ts`) are aggregate, program-level summaries built
  from real stats — **not** client-specific case studies. Replace with real
  per-engagement narratives + real dates when available.
- **Client logos** (`content/clients.ts`) render as text wordmarks; supply licensed
  vector logos and confirm the 4th mark (likely "Aditya Birla").
- **Bank pages** (`content/banks.ts`, `/banks/[slug]`) — copy is deliberately
  capability-framed (no partnership/endorsement claim) and stats are LinkAPI-wide,
  not per-bank. Confirm the real relationship/partner tier per bank, and confirm
  usage rights for the reproduced bank marks (Axis, IndusInd, HSBC logos in
  `public/assets/banks/`).
- **Testimonials** (`content/testimonials.ts`) need real company/role (+ LinkedIn);
  the "Tech Solutions" wrong-company bug is already fixed.
- **FAQ** (`content/faq.ts`) is net-new draft copy — review before publishing.
- **Legal** (`content/legal.ts`) is draft copy — needs legal review + a real date.
- **Service 07** (BFSI Sales Augmentation) may belong as a standalone Partner page.
- Social profile URLs are empty (`lib/site.ts`) — icons stay hidden until supplied.
- Consider commissioning real photography and short benefit clips.

## Phase 8 — optional enhancements

**Built:**

- **Works "quick view" modal** — a root-level `@modal` parallel/intercepting route
  (`app/@modal/(.)work/[slug]`). Clicking a Works card (homepage deck _or_ `/work`
  index) soft-navigates to `/work/[slug]` and opens the case study as an overlay;
  a hard load / refresh of that URL renders the standalone page instead. Escape,
  backdrop, and close-button all `router.back()`; focus is trapped and restored;
  background scroll is frozen via the Lenis singleton (`getLenis()`) + `overflow`
  lock (the slot lives outside the marketing provider). "Open full page" is a plain
  `<a>` (hard load) because the URL already equals the slug while the modal is open.
  Entrance snaps under `prefers-reduced-motion`. See `components/sections/WorkQuickView.tsx`.
- **WebGL hero accent** (`components/motion/HeroAccent.tsx`) — a slow, near-white
  domain-warped fbm field with a rationed lime bloom behind the hero headline.
  Deliberately **dependency-free raw WebGL** (no three.js/R3F) to protect the LCP
  and bundle budget: idle-mounted (never competes with first paint), reduced-motion-
  gated (renders nothing — the static grain stands in), self-degrading when WebGL is
  unavailable, DPR-capped, ~30fps, and paused when the tab is hidden or the hero
  scrolls off-screen.

**Not built:** blog, and the Thread-Nav drag scrubber — reserved as optional polish.
