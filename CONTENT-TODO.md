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
| `content/plugin.ts` (`BANK_PLUGIN_PAGES`), `app/(site)/bank-plugin/[bank]/page.tsx` | **Each bank now has its own plugin landing page** (`/bank-plugin/axis`, `/bank-plugin/hsbc`, `/bank-plugin/indusind`), and each reproduces that bank's mark in its hero, on a plate, plus the other two banks' marks in a "banking with someone else?" section. This is a **materially stronger framing than `/banks`**: a whole page headed "The Bank Plugin for <Bank>" asserts that the plugin is *offered to that bank's customers*, which is a commercial relationship, not just interoperability. Confirm written sign-off from each bank for the mark in this context. The pages deliberately stay in the **plum palette** and never adopt Axis burgundy / HSBC red / IndusInd crimson, so the page cannot be mistaken for one the bank published — confirm that is the wanted treatment. |

## 2. Claims and figures

| Where | What to confirm |
|---|---|
| `content/stats.ts` | All headline numbers come from the Figma (70,000+ businesses onboarded, ₹60,000 Cr+ monthly volume, 5X balance growth, 300+ clients, 35+ APIs, 5+ banks live, 5,000+ API implementations, 2,500+ integration solutions, 100+ portals, 1,000+ partners). These **supersede** the older published set (45,000+ customers, ₹20,000 Cr/month) — confirm the newer figures are the ones to publish, and whether any need an "as of" date. |
| `content/industries.ts` (`MOCK_DATA`) | Every number inside the industry UI mockups (₹1,42,800 Cr, 94% automated match, 99.2% reconciled, ₹18,50,400 pending, GSTIN `27AAAAA1111A1Z1`) is **illustrative sample data** demonstrating the interface. Confirm whether real anonymised figures may be shown instead. |
| `app/(site)/connected-banking/page.tsx` | The hero diagram is labelled **"Partner bank"**. The Figma named a specific bank; that was deliberately not shipped, because naming one inside a product architecture diagram reads as an endorsement. Confirm whether a named bank may appear. |
| `content/banks.ts` | **The real relationship with Axis Bank, IndusInd Bank and HSBC** — partner tier, empanelment status — is unconfirmed, so every `/banks` page is written as *capability* ("what LinkAPI can integrate") and carries an explicit "not a claim of official partnership with, or endorsement by" note. Confirm the actual relationship before any of that framing is softened. Also confirm whether **any bank-specific metric** may be published: today the pages show only LinkAPI's company-wide aggregate (pulled from `content/stats.ts`), captioned inside the stat card as "not bank-specific figures". |

| `content/plugin.ts` (`BANK_PLUGIN_PAGES`) | **The per-bank facts, and one broken URL.** Read off each bank's own live portal on 2026-09-07. (a) **The Axis portal host the client supplied is wrong.** `axis.linkapitech.com` does not resolve (checked against two public resolvers; a request to the shared host carrying that `Host` header falls through to the HSBC vhost). The live Axis portal is **`axisbank.linkapitech.com`**, which returns 200 and carries `support.axisbank@linkapitech.com`. The page links the working host — confirm it is canonical, and whether the `axis.` name should be made to redirect. (b) **Only Axis publishes a price**, verbatim "Price : ₹ 5000.00 + GST"; it is shown on the Axis page alone and rendered as "₹5,000 + GST per Tally licence" — **confirm the billing period**, which the portal does not state, and it also appears as an `offers` node in that page's JSON-LD. (c) **IndusInd onboards through IndusDirect**, the bank's net banking, not the LinkAPI portal — steps reproduced from the client's own process-flow image. (d) **IndusInd's desk hours** (9:30am–6:00pm Mon–Sat, excluding 2nd/4th Saturdays) and the **Centralised Service Desk** wording come from that portal's `/support` page. (e) All three portals publish **+91 75696 10750** as the support number, but `lib/site.ts` lists **+91-9318373476** for "Plugin Support & Inquiries", and IndusInd's process-flow image gives a third number (9220588051) — confirm which is canonical per bank. (f) Their `tel:` hrefs are all a placeholder (`1-062-109-9222`); the pages build a correct href from the displayed number. |
| `content/plugin.ts` | **The Bank Plugin, shared product copy.** Product copy is reproduced from LinkAPI's own HSBC and IndusInd plugin portals (supplied 2026-08-27), with grammar closed up. Drafted, not reproduced, and each flagged inline: the two-tone **headline** ("Smart, powerful banking, inside your Tally."), the section leads/headings on `/bank-plugin`, the **five FAQ answers** (the portals' FAQ PDF was not available), and `erpToday` — the page says the plugin **ships for TallyPrime today** and that LinkAPI *builds* plugins for Busy/Zoho/SAP/NetSuite/Odoo; confirm which ERPs this plugin itself supports. `PLUGIN_MOCK` (company name, balances, payees, 128/131 matched) is **illustrative sample data**, same status as the industries mockups. Also: **axis.linkapitech.com did not resolve** from the build machine on 2026-09-07 while hsbc/indusind did — confirm the Axis portal is live before launch, or the card links to a dead host. The product-guide CTA links the portal's own YouTube video (`youtu.be/lqrhdLiG3Wc`) — confirm it is current. |

| `lib/plugin-hosts.ts`, `.env.example` | **The three plugin subdomains are not chosen yet, and the obvious names are taken.** *Not blocking:* the pages ship on the main domain at `/axisbank-lp`, `/hsbc-lp` and `/indusind-lp` (client instruction, 2026-09), and moving to subdomains later is three environment variables with no code change. The obstacle when you do: the landing pages are built to serve one subdomain each, but `hsbc`, `indusind` and `axisbank`.linkapitech.com currently run the client's live plugin **portals** (working `/login`, registration, OTP, download — all three verified 200 on 2026-09-07). Repointing them would take a working product offline. So: confirm either (a) new names for the landing pages, e.g. `tally-<bank>.linkapitech.com`, or (b) that the portal apps move to `app.<bank>…` and the landing pages take the bare names — which is a DNS and portal migration, not a front-end change. Until a name is set the pages serve on the main domain at `/bank-plugin/<slug>`; nothing is blocked, but the separation the brief asked for is not live. |

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
| `app/(site)/contact/page.tsx` | The **Google Maps embed** is ~488KB of third-party Google script, and it sets Google cookies — which may matter for the privacy copy. **The performance premise has changed and this row is now a privacy/product question, not a perf one.** It previously read "the sole reason /contact scores perf 82 / LCP 3.8s"; measured on the live domain after the V4 rebuild (2026-09-07), /contact scores **97 / 94 / 99** across three runs with LCP 1.9–3.0s and TBT 60–80ms, i.e. comfortably inside the ≥90 bar with the embed still in place. So the options are no longer forced by the score: (a) keep it as-is; (b) replace it with a **facade** (static placeholder that swaps in the real map on click) purely to avoid the third-party cookies and bytes; (c) drop the map for the address plus an "open in Maps" link. Still a visitor-facing product call, so it stays parked here rather than decided in code. |

## Not blocking, but worth knowing

- `content/cases.ts` and `content/benefits.ts` are **archived** — no route imports them, so they are tree-shaken out of every bundle. Retained per the retire-and-redirect decision (2026-08-12) in case case studies return. `/work`, `/work/:slug` and `/clients` now 308 to `/industries` and `/about`.
- The isometric hero illustration on `/services` (`public/illus/hub-isometric.webp`, 41KB, a raster extracted from the Figma PDF at ~1374px) **no longer has a call site** — V4 Phase 9a replaced it with the SVG service manifold, and no raster hero remains anywhere on the site. The asset is retained rather than deleted so the client can confirm the manifold reads as well as the illustration did; delete it in Phase 10 if they sign off, and the "a source render or vector from the designer would be better" note retires with it.
