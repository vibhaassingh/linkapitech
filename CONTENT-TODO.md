# Content sign-off checklist

Every item below is live on the site but needs LinkAPI's confirmation before
launch. Each one is also flagged inline with `TODO: client to confirm` at the
listed path. Nothing here is a bug — these are the points where the design or
the Figma implied a fact the code cannot verify.

Ordered by risk, highest first.

## 1. Brand marks — needs written permission

| Where | What to confirm |
|---|---|
| `content/clients.ts` | The homepage marquee sits under **"Trusted by India's leading banks and enterprises"**, which asserts a customer relationship for HSBC, HDFC Bank, Jio Financial, Shemaroo, IndusInd Bank, Axis Bank and RBL Bank. Each needs the brand's actual permission. **3 of the 7 marks (Axis, HSBC, IndusInd) are now vectors** in `public/assets/banks/`, shared with the `/banks` pages; **the other four (HDFC, Jio, Shemaroo, RBL) are still WebP crops extracted from the Figma** and need licensed SVGs. |
| `content/banks.ts`, `public/assets/banks/` | The Axis, HSBC and IndusInd marks are reproduced on `/banks` and on each `/banks/<slug>` page. Confirm **written usage rights** for each mark in this context (a capability page, not a partnership page). |
| `content/clients.ts` (`ERPS`) | TallyPrime, Busy, Oracle NetSuite, Zoho, SAP, Odoo. These state a factual integration, so ordinary nominative use — but the heading must stay "ERPs we integrate with" and never imply partnership. |
| `components/chrome/Logo.tsx` | Wordmark is currently set type, not the official vector mark. |

## 2. Claims and figures

| Where | What to confirm |
|---|---|
| `content/stats.ts` | All headline numbers come from the Figma (70,000+ businesses onboarded, ₹60,000 Cr+ monthly volume, 5X balance growth, 300+ clients, 35+ APIs, 5+ banks live, 5,000+ API implementations, 2,500+ integration solutions, 100+ portals, 1,000+ partners). These **supersede** the older published set (45,000+ customers, ₹20,000 Cr/month) — confirm the newer figures are the ones to publish, and whether any need an "as of" date. |
| `content/industries.ts` (`MOCK_DATA`) | Every number inside the industry UI mockups (₹1,42,800 Cr, 94% automated match, 99.2% reconciled, ₹18,50,400 pending, GSTIN `27AAAAA1111A1Z1`) is **illustrative sample data** demonstrating the interface. Confirm whether real anonymised figures may be shown instead. |
| `app/(site)/connected-banking/page.tsx` | The hero diagram is labelled **"Partner bank"**. The Figma named a specific bank; that was deliberately not shipped, because naming one inside a product architecture diagram reads as an endorsement. Confirm whether a named bank may appear. |
| `content/banks.ts` | **The real relationship with Axis Bank, IndusInd Bank and HSBC** — partner tier, empanelment status — is unconfirmed, so every `/banks` page is written as *capability* ("what LinkAPI can integrate") and carries an explicit "not a claim of official partnership with, or endorsement by" note. Confirm the actual relationship before any of that framing is softened. Also confirm whether **any bank-specific metric** may be published: today the pages show only LinkAPI's company-wide aggregate (pulled from `content/stats.ts`), captioned inside the stat card as "not bank-specific figures". |

## 3. Testimonials

| Where | What to confirm |
|---|---|
| `content/testimonials.ts`, `components/sections/home/Testimonials.tsx` | The carousel ships LinkAPI's three real quotes with generic roles. The Figma's cards named executives at named banks (e.g. "Rajiv Mehta, Chief Data Officer, Axis Bank") with five-star ratings; those read as designer placeholders and were **not** shipped. Supply attributable names/roles/companies with consent — and confirm whether any real rating exists — or the generic attribution stays. |

## 4. Legal and contact

| Where | What to confirm |
|---|---|
| `content/legal.ts` | Terms and Privacy are drafts. Legal counsel must review, and the "last updated" date must be set at publish time (currently a placeholder). |
| `lib/site.ts` | Two mailboxes appear in the Figma (`partnerships@` and `partnership@`, singular and plural). Confirm which is canonical. |
| `lib/site.ts` (`SOCIALS`) | Empty, so no social icons render. Supply real profile URLs or they stay hidden. |
| `content/faq.ts` | Eight answers drafted from the Figma's five questions plus real service copy. LinkAPI to review before publishing. |

## 5. Product decisions with a measured cost

| Where | Decision needed |
|---|---|
| `app/(site)/contact/page.tsx` | The **Google Maps embed** costs ~488KB of third-party Google script and is the sole reason `/contact` scores **perf 82 / LCP 3.8s** on the live domain, where every other route sits at 95–100. `loading="lazy"` does not help: Chrome's lazy threshold is generous under throttled conditions, so the iframe loads regardless. Three options — (a) replace it with a **facade** (static placeholder that swaps in the real map on click, per Lighthouse's third-party-facades guidance) which recovers the score but shows a placeholder until a visitor interacts; (b) drop the map and keep the address plus an "open in Maps" link; (c) accept 82 on this one page. This is a visitor-facing product call, not an engineering one, so it is parked here rather than decided in code. Note also that the embed sets Google cookies, which may matter for the privacy copy. |

## Not blocking, but worth knowing

- `content/cases.ts` and `content/benefits.ts` are **archived** — no route imports them, so they are tree-shaken out of every bundle. Retained per the retire-and-redirect decision (2026-08-12) in case case studies return. `/work`, `/work/:slug` and `/clients` now 308 to `/industries` and `/about`.
- The isometric hero illustration on `/services` is a raster extracted from the Figma PDF at ~1374px. It is sharp at the size it renders, but a source render or vector from the designer would be better on large high-DPR displays.
