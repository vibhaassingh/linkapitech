# LinkAPI v3 — Figma "Purple" Ground-Up Redesign

## Context

The owner has scrapped the Institutional Light design (deployed at linkapitech.kerning.ooo) and supplied a client-authored Figma file ("LinkAPI Website", 39 frames — studied in full via PDF export at `~/Downloads/LinkAPI Website.pdf`). The site must be rebuilt to **follow the Figma's design language exactly**, then elevated with **liquid-glass surfaces, animations, and new-gen motion** the static Figma can't express. This supersedes the Institutional Light direction (navy #0A1F44) the same way that superseded the allgoodstudio clone.

**What the Figma is:** a deep-plum/orchid corporate system — dark aubergine gradient sections alternating with near-white lavender-washed sections, floating white pill navbar, glass cards on dark, violet gradient icon tiles, two-tone headlines (ink + violet), isometric 3D chip-hub illustration, code terminals, orbit/ecosystem diagrams, logo marquees, zig-zag timelines. Final page designs: **Homepage** (pg 36), **Services** (pg 37), **About Us** (pg 30), **Connected Banking** (pg 31), **Industries We Serve** (pg 32), **Solutions** (pg 15 grouped; pg 17 is a flat-grid variant — use the grouped one), **Contact** (pg 16). Pages 38/39 are earlier drafts (contain lorem ipsum) — reference only. Sliced renders live in the session scratchpad `strips/` (`p36-s1..6.png` etc.) — re-render from the PDF if the scratchpad is gone.

**User-locked decisions (2026-08-12):**
1. `/work`, `/work/[slug]`, `/clients` → **retire + redirect** (content stays in repo for reuse).
2. Testimonial carousel uses the **3 existing real quotes** from `content/testimonials.ts` (anonymized roles); Figma's named bankers are placeholders — flag `TODO: client to confirm`.
3. Footer keeps the Figma's 4-column layout but **links map to real pages only** (no dead links, no stubs).
4. **Adopt the Figma's new stats** (70,000+ businesses onboarded · ₹60,000 Cr+ monthly · 5X balance growth · 300+ clients · 35+ APIs integrated · 5+ banks live · 5,000+ API implementations · 2,500+ integration solutions · 100+ portals · 1,000+ partners) with a source comment in `content/stats.ts`.

---

## Design system (Phase 1)

Replace the `:root` block in `app/globals.css` and the mapping in `tailwind.config.ts` (mapping is already 100% var-driven, so this reskins all Tailwind utilities). Colors sampled from the renders — refine by re-sampling during build:

| Token | Value | Use |
|---|---|---|
| `--plum-950` | `#1A0620` | darkest gradient stop, CTA band bottom |
| `--plum-900` | `#250D29` | hero top |
| `--plum-800` | `#2D1235` | hero mid |
| `--plum-700` | `#42174C` | "What We Do"/"Commitment" section bg |
| `--plum-600` | `#62216F` | **primary brand** — buttons, hub nodes, icon circles |
| `--violet-600` | `#7B2D8E` | gradient upper stop, links |
| `--violet-text` | `#6F257F` | two-tone headline accent (AA-large on white ✓) |
| `--lavender-400` | `#C9B8D8` | big ghost numerals (01–04), decorative |
| `--canvas` | `#FAF8FC` | light section bg |
| `--canvas-wash` | `#F6F1F7` → `#F0E8F2` | light hero radial wash |
| `--card-tint` | `#F5EFF9` | lavender-tinted cards |
| `--surface` | `#FFFFFF` | white cards, logo bands |
| `--ink` | `#1D1D1F` | headings on light |
| `--ink-2` | `#4A4552` | body on light (darken from Figma's gray — Figma body fails AA) |
| `--ink-inv` / `--ink-inv-2` | `#F7F3F9` / `#CDBBD4` | text on plum |
| `--glass-*` | rgba(255,255,255,.06–.12) + blur tokens | liquid-glass surfaces |
| `--terminal` | `#171B21` | code windows |
| gradients | `--grad-tile: linear(#8E24AA→#4A148C)`, `--grad-section: linear(#42174C→#1A0620)`, `--grad-num: linear(lavender→transparent)` | icon tiles, dark sections, ghost numerals |

**Type:** Poppins via `next/font/google` — 700 (display), 600 (headings/buttons), 500 (labels), 400 (body) = 4 files, preserving the font-budget rule. Keep IBM Plex Mono 400 for code terminals only. Drop Schibsted Grotesk + Inter. Scale: display-1 clamp(2.6→4.2rem)/1.08 tracking-tight; display-2 clamp(2→3rem); heading-3 ~1.4rem; body 1.0625rem/1.7. Eyebrows = pill-outline capsules (letterspaced caps, NOT bare mono labels).

**Radii/shape:** cards 16–24px (`--r-lg: 20px`), pill buttons everywhere, floating nav pill radius ~14px. Shadows: soft plum-tinted (`0 24px 64px -24px rgba(37,13,41,.25)`).

**Re-theme seams that bypass tokens** (from inventory): `components/three/scene/palette.ts` (hex ints → plum/violet), `HeroPoster.tsx` inline hex, `Field.tsx` error color, `app/layout.tsx` `themeColor` → `#250D29`, and the 3 `ImageResponse` files (icon/apple-icon/og) → plum monogram.

---

## IA & chrome (Phase 2)

**Nav (Figma has NO mega menu — this is a big simplification):** floating white pill header, centered links `About Us · Solutions · Connected Banking · Services · Industries We Serve`, active state = violet text + underline, right CTA pill "Contact Us" (fix Figma's "Contacts Us" typo). Header floats over dark heroes (inset with rounded corners) and gains backdrop-blur + shadow when stuck.
- **Delete** `MegaMenu.tsx`/`MegaPanel.tsx`; simplify `SiteHeader.tsx`; restyle `MobileMenu.tsx` (keep its a11y scaffolding: dialog, focus trap, `useScrollLock`) into a light sheet with the 5 links + CTA.
- `lib/site.ts`: replace `SOLUTIONS_MENU`/`WORK_MENU`/`NAV_PAGES` with a flat `NAV` array + new `FOOTER_COLUMNS` (4 columns, real destinations: Products→/solutions#anchors, Company→/about,/contact, Resources→/connected-banking,/services,/industries, Legal→/privacy,/terms).
- **Footer:** light `#FAF8FC` (inverse of today's navy), logo + one-liner "Powering secure banking & enterprise integrations at scale." + social circles (plum) + 4 columns + legal baseline `© {year} LinkAPI Tech Pvt. Ltd.` (dynamic year, not Figma's 2024).
- **CTA band** (shared component `components/sections/CtaBand.tsx`): plum gradient, "START YOUR JOURNEY" glass capsule, "Let's build the next generation of banking together.", per-page button label (Book a Demo / Request a Quote / See Connected Banking in Action / Find the Right Fit / Request a Product Walkthrough / Partner with us) + floating glass slab decorations.

**Routes:** keep `(marketing)` = homepage w/ Lenis, `(site)` = inner. New: `/solutions`, `/connected-banking`, `/industries`. Restyle: `/about`, `/services`, `/contact`. Retire `/work`, `/work/[slug]`, `/clients` → `next.config.ts` redirects (`/work*` → `/industries`, `/clients` → `/about`). Update `app/sitemap.ts`, JSON-LD, per-page metadata.

---

## Pages (Phases 3–4)

**Homepage** (pg 36) — 13 sections, in order:
1. **Hero** — dark plum, floating pill nav, capsule eyebrow "CONNECTED BANKING · ERP-NATIVE · BANK–ERP CONNECTIVITY · SINCE 2022", H1 "Banking That Lives Inside Your Business.", sub, CTAs (white pill "Book a Demo →" + glass outline "Talk to our Banking Experts"), right = concentric orbit arcs + 3 floating glass icon chips (Three.js scene, poster fallback).
2. **Logo marquee** — white band "TRUSTED BY INDIA'S LEADING BANKS AND ENTERPRISES", color logos (HSBC, HDFC Bank, Jio Financial, Shemaroo, IndusInd, Axis, RBL), infinite CSS marquee, `mask-fade-x`.
3. **Who We Are?** — light, big glass card, violet bold inline copy (TSP positioning, from Figma).
4. **What We Do** — plum, 3 numbered dark-glass cards (TSP / Integrated Banking Services / AI-Powered Accounting) with ghost numerals + gradient icon tiles.
5. **Product Ecosystem at a Glance** — light, central hub node + dashed orbit rings + 10 floating product chips (slow counter-rotation, hover lift), CTA "Explore the Full Ecosystem →" → /solutions.
6. **Challenges We Solve** — plum, 6 outlined glass icon cards.
7. **Why LinkAPI Tech** — light, 4 alternating zig-zag rows with giant lavender ghost numerals, alternating band tints.
8. **By the Numbers** — lavender bg, 4 white stat cards (count-up, existing `StatNumber`/`useCounter`) + plum pill "35+ APIs Integrated · 5+ Banks Live".
9. **ERP's We Integrate With** — white band: TallyPrime, Busy, Oracle NetSuite, Zoho, SAP, Odoo (color logos).
10. **How We Work** — plum, 4-step timeline (Integrate/Configure/Test & Verify/Go Live) beside a **code terminal** (`POST /v1/payments/create` JSON, typing/reveal animation; use a neutral demo email, not Figma's `sara@axisbank.com`).
11. **Trusted by Leaders in Banking & Finance** — light, "CLIENT STORIES" capsule, testimonial carousel (3 real quotes, monogram avatars, Previous/Next pills + dots; drag/swipe). Stars omitted pending client confirmation (`TODO`).
12. **CTA band**.
13. **Footer**.

**Services** (pg 37): light hero w/ two-tone H1 "Services that turn *integration complexity* into go-live confidence." + **isometric 3D hub illustration** (extract from PDF, see Assets); "What We Offer" zig-zag timeline (6 gradient number circles + tinted cards w/ edge accent); "Core Services" bento grid (7 services from `content/services.ts`, big violet numerals, mixed white/tinted cards); "Partner & Influencer Program" plum band w/ glass cluster diagram (Web Developers / CAs / ERP·Plugin·Cloud Resellers around LinkAPI); "Engagement & Pricing" glass card w/ violet bolds; CTA "Request a Quote".

**About Us** (pg 30): plum centered hero "Simplifying banking for a connected, digital-first economy."; Our Story (text + orbit card); Mission (white) / Vision (violet gradient) card pair; Our Commitment — plum, 3 glass cards (fix Figma's truncated sub: list all three principles); What Sets Us Apart — 4 white cards; Our Track Record — stat cards + wide violet gradient stat bar; CTA "Partner with us".

**Connected Banking** (pg 31): light hero "Your *bank account*, inside your ERP." + bank-connection diagram (LinkAPI Platform ↔ hub ↔ bank infra, "Secure API Connection" badge — generic bank label, not AXIS, unless client confirms); **Capabilities** — center glowing rail, 9 alternating cards (Check Balance, Account Aggregator, GST Payments, Cross Border Payment, Collections, Bharat Connect, Vendor Payments, Virtual Account Collections, Account Statement & Reconciliation); ERP logo band; **How It Works** — paragraph + plum architecture diagram (Bank & NBFC Gateway → LinkAPI Connected Banking Server → Enterprise ERP Ledger); CTA "See Connected Banking in Action".

**Solutions** (pg 15): light hero "One ecosystem for every step of *money movement*."; grouped card sections: **Flagship Core Connectivity** (2), **Ledger Matching & Merchant Gateway Hub** (3, middle card solid plum), **Enterprise Front-Ends & Developer Tooling** (plum band, 2 items + SDK terminal), **Secure Governance, Billing & AI Chat Orchestration** (3, WhatsApp card violet-outlined); CTA "Request a Product Walkthrough". Anchor ids per group for footer/ecosystem deep-links.

**Industries** (pg 32): light hero "Purpose-built *financial infrastructure* for the organisations that move India's economy."; 5 alternating rows, each text + a **UI-mockup card** (Banks: reconciliation dashboard; NBFCs: NPCI code terminal; SMEs: Tally/SAP ledger sync; E-commerce: checkout card; Fintech: deployment-rails diagram) — build as small DOM/SVG components (crisp, animatable), not images; CTA "Find the Right Fit for Your Business".

**Contact** (pg 16): plum hero; CONTACT DETAILS card stack (registered address SRA 82 A Shipra Indirapuram Ghaziabad UP; partnerships@linkapitech.com +91 87000 45411; plugin support +91-9318373476; operations@linkapitech.com +91-9891121770 — reconcile against `lib/site.ts` CONTACT, flag mismatches `TODO: client to confirm`) + **Book a Demo** form (First/Last Name, Work Email, Mobile, Company, "What are you looking to solve?") wired to existing `/api/contact` (extend zod schema; keep honeypot) + lazy Google Maps embed (Ghaziabad) with static fallback.

**FAQ section** (pg 24, add to homepage or /about — Figma places it as a component): capsule eyebrow, "Questions? We hear often." (fix typo), left "Still have a question?" card + Send email button, right accordion (reuse `HomeFaq` pattern + `content/faq.ts`).

---

## Motion & liquid glass (Phase 5 — the "new-gen" layer)

Infra survives as-is: Lenis provider, `useInView`/`Reveal`/`RevealGroup`, `useCounter`, `useScrollFill`, CursorGlow (retint to violet), Three.js lifecycle harness (WebGL probe → desktop≥1024 → idle dynamic import → IO rAF gating → dispose).

- **Liquid glass vocabulary** (CSS utilities in globals): `.glass` (rgba white 6–10% + `backdrop-filter: blur(18px) saturate(1.4)` + 1px gradient border via mask + inner top highlight), `.glass-deep` (dark cards on plum), specular sweep on hover (animated 120° gradient sheen), nav pill gains blur+shadow on stick. Graceful fallback where `backdrop-filter` unsupported (solid rgba).
- **Three.js hero** (rebuild `createHeroScene.ts`): concentric orbit arcs + drifting particles + 3 pulse nodes in plum/violet palette; DOM glass chips float with slow parallax tied to pointer (reuse label-projection pattern); poster = static SVG re-draw of same composition (`HeroPoster.tsx`). Budget <25 draw calls; pixelRatio clamp 1.5; mobile/reduced-motion/no-WebGL → poster.
- **Ecosystem orbit** (homepage §5): pure CSS/SVG — dashed rings rotate slowly (60–120s), chips counter-rotate to stay level, hover pause + lift. No WebGL needed.
- **Scroll choreography:** existing reveal system + per-section stagger; capability rail nodes glow as they pass (`useScrollFill`); zig-zag timeline cards slide from their side; ghost numerals parallax-drift slightly (translateY on scroll, transform-only).
- **Micro-interactions:** magnetic pill buttons (small translate toward cursor, ≤6px), arrow-slide on hover, logo marquee pause-on-hover, terminal type-in (staggered line reveal, mono), testimonial carousel with drag + snap, count-ups.
- **Reduced motion:** every new animation inherits the existing global kill-switch block; Lenis + WebGL already decline to mount. Marquee → static row; carousel → static grid of 3.

---

## Content & data (Phase 6)

`content/` stays typed TS. Updates: `home.ts` (new HERO copy + section headings from Figma), `stats.ts` (new numbers per locked decision, source comment "Figma 2026-08 — client-authored"), `services.ts` (keep 7, add Figma descriptions), new `solutions.ts` (10 products, grouped), new `industries.ts` (5 segments), new `capabilities.ts` (9 Connected Banking items), new `whatWeDo.ts`/`challenges.ts`/`whyUs.ts`/`process` update (4 steps), `about.ts` (story/mission/vision/commitment/apart/track record), `clients.ts` (add HDFC, Jio Financial, Shemaroo, RBL — color logos; keep ratio/scale pattern), new `erps.ts` (6 ERP logos), `faq.ts` (merge Figma's 5 questions), `testimonials.ts` unchanged. Every Figma-authored fact that can't be verified gets `// TODO: client to confirm`.

**Copy hygiene** (don't reproduce Figma bugs): "Contacts Us"→"Contact Us"; "Questions ? we here often."→"Questions? We hear often."; "six-stage process" header vs 4 steps → say four; duplicated "Transparency/Collaboration" cards on pg 3 → write distinct principles; `sara@axisbank.com` in code sample → neutral domain; "© 2024" → dynamic year; footer "LinkAPI Technologies" vs legal name "LinkAPI Tech Pvt. Ltd." → use legal name.

## Assets (Phase 1, alongside tokens)

- **Isometric hub illustration** (Services hero): re-rasterize PDF page 37 at ~3000px wide with `sips --resampleWidth`, crop the illustration region with PIL, export AVIF/WebP via `next/image`. `TODO: client to provide source render` for full crispness.
- **New client logos** (HDFC, Jio, Shemaroo, RBL) + **ERP logos** (TallyPrime, Busy, NetSuite, Zoho, SAP, Odoo): crop from high-res page renders → `public/logos/`, served in color (drop the CSS-mask treatment for the marquee; keep `Wordmark` fallback). `TODO: replace with vector brand assets from client`.
- OG image / favicons re-generated in plum via existing `ImageResponse` files.

---

## Phasing & commits

Branch `redesign/figma-purple` off `redesign/institutional-light` (clean tree, commit 3378021). One commit per phase.

0. **Docs**: supersede-note in CLAUDE.md (Institutional Light → Figma Purple), this plan copied to `REDESIGN-V3.md` at repo root.
1. **Foundation**: tokens, Tailwind map, Poppins, glass/gradient/eyebrow utilities, assets extraction, palette.ts/poster/theme-color seams.
2. **Chrome**: header+nav (mega menu deleted), mobile sheet, footer, CtaBand, route redirects. → *site renders coherently in new skin*
3. **Homepage**: all 13 sections w/ static reveals (Three.js placeholder poster).
4. **Inner pages**: Services, About, Connected Banking, Solutions, Industries, Contact (+ form/API extension, sitemap/metadata/JSON-LD).
5. **Motion & glass**: hero scene, ecosystem orbit, terminal typing, carousel, marquee, magnetic buttons, glass polish.
6. **Content pass**: all `content/*.ts` finalized, TODO audit, copy hygiene sweep.
7. **QA**: Lighthouse mobile on `/`, `/services`, `/connected-banking`, `/contact` — gates Perf ≥90 / A11y ≥95 / BP ≥95 / SEO ≥95, CLS 0; reduced-motion walk; keyboard walk; 390/768/1024/1440 sweeps; AA contrast audit (violet-on-white large-only; body ink-2 ≥4.5:1).
8. **Ship**: PR, then `vercel --prod` after owner sign-off (prod alias linkapitech.kerning.ooo).

**Stop for human review after Phase 3 (homepage visible) and Phase 7 (pre-deploy).**

## Verification

- Per phase: `npm run build` + `npx tsc --noEmit` clean (never while dev server runs — shared `.next` corruption gotcha).
- Visual: dev server on :3100 via `.claude/launch.json`; Browser-pane inspection uses the known workaround (force `[data-reveal]{opacity:1}`, translate `main`) since Lenis breaks window scroll.
- Phase 5: verify hero scene defers (LCP = DOM H1), rAF halts off-screen/hidden tab, dispose on route change; FPS trace on throttled CPU.
- Phase 7: full Lighthouse runs + axe; production smoke on the Vercel preview URL before aliasing.
