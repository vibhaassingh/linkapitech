/**
 * Bank integration landing pages — modelled once as typed data (mirrors
 * content/cases.ts) and rendered by /banks and /banks/[slug].
 *
 * IMPORTANT — honesty constraints (CLAUDE.md prime directives):
 *   • LinkAPI has NO published, bank-specific content, partnership tier, or
 *     per-bank metrics. Copy here is deliberately *capability-framed* — it
 *     describes what LinkAPI can integrate, NOT a claim to be an official
 *     partner of, or endorsed by, any named bank.
 *   • The stat trio is LinkAPI's real COMPANY-WIDE aggregate (content/stats.ts),
 *     captioned as such so it never reads as a per-bank number.
 *
 * TODO: client to confirm — the real relationship with each bank (partner tier,
 * empanelment status), any bank-specific capabilities/metrics, and usage rights
 * for the reproduced bank marks (Axis, IndusInd, HSBC).
 */

export interface BankStep {
  title: string;
  body: string;
}

export interface BankStat {
  num: string;
  label: string;
}

export interface BankPage {
  slug: string;
  /** Full display name, e.g. "Axis Bank". */
  name: string;
  /** Short name for compact contexts, e.g. "Axis". */
  shortName: string;
  /** Path to a licensed vector logo in /public, or null for a wordmark placeholder. */
  logo: string | null;
  /** Brand hex — used only for a faint hero tint, never for text/CTAs. */
  brand: string;
  eyebrow: string;
  /** Serif italic hero line. */
  tagline: string;
  intro: string;
  overview: string;
  /** What LinkAPI can wire up against this bank's systems (capability, not claim). */
  capabilities: string[];
  /** The repeatable connectivity → go-live playbook (from real /services scope). */
  steps: BankStep[];
  /** LinkAPI COMPANY-WIDE aggregate — captioned as such on the page. */
  stats: BankStat[];
  meta: { title: string; description: string };
  aggregate: true;
}

/** Shared LinkAPI-wide aggregate (content/stats.ts) — NOT per-bank figures. */
const LINKAPI_AGGREGATE: BankStat[] = [
  { num: "5000+", label: "API implementations, across all BFSI work" },
  { num: "₹20,000 Cr", label: "Processed monthly, across all systems" },
  { num: "UAT→Prod", label: "End-to-end delivery scope" },
];

/** The real, repeatable API-integration playbook (CONTENT-MAPPING §2.4 / /services). */
const CONNECTIVITY_STEPS: BankStep[] = [
  {
    title: "Secure connectivity",
    body: "Establish secure connectivity for your environment (Basic Telnet Services), with prerequisites like static IP and SSL certificates handled up front.",
  },
  {
    title: "Configuration & empanelment",
    body: "Bank configuration setup and client-end empanelment, coordinated end to end so the integration clears every prerequisite.",
  },
  {
    title: "UAT → production",
    body: "Comprehensive API integration support from UAT through to production, with technical coordination between the bank and your technology partner.",
  },
  {
    title: "Post-live support",
    body: "Ongoing post-live support on demand — reconciliation, data movement, and connectivity monitored so systems stay in sync at volume.",
  },
];

export const BANKS: BankPage[] = [
  {
    slug: "axis",
    name: "Axis Bank",
    shortName: "Axis",
    logo: "/assets/banks/axis.svg",
    brand: "#ae285d",
    eyebrow: "Bank integration",
    tagline: "Connect to Axis Bank, cleanly.",
    intro:
      "LinkAPI helps corporates and BFSI businesses integrate their platforms with Axis Bank's banking systems — from secure connectivity through production, with reconciliation that holds at scale.",
    overview:
      "Whether you're launching a new product on Axis Bank rails or extending an existing one, LinkAPI handles the connectivity, configuration, and coordination between your team and the bank. The same repeatable integration playbook behind thousands of BFSI implementations, applied to your Axis Bank use case.",
    capabilities: [
      "API integration against Axis Bank banking services",
      "Secure connectivity setup with SSL / static-IP prerequisites",
      "Bank configuration and client-end empanelment",
      "Transaction reconciliation via ERP plugins",
      "Data integration through adapters, converters, and parsers",
    ],
    steps: CONNECTIVITY_STEPS,
    stats: LINKAPI_AGGREGATE,
    meta: {
      title: "Axis Bank Integration | LinkAPI Tech",
      description:
        "LinkAPI Tech integrates corporate and BFSI platforms with Axis Bank — secure connectivity, configuration, reconciliation, and production support, from UAT to go-live.",
    },
    aggregate: true,
  },
  {
    slug: "indusind",
    name: "IndusInd Bank",
    shortName: "IndusInd",
    logo: "/assets/banks/indusind.svg",
    brand: "#98272a",
    eyebrow: "Bank integration",
    tagline: "IndusInd Bank connectivity, delivered.",
    intro:
      "LinkAPI connects your platform to IndusInd Bank's systems — establishing secure connectivity, completing configuration and empanelment, and taking the integration from UAT to production.",
    overview:
      "IndusInd Bank integrations follow LinkAPI's proven delivery model: secure connectivity first, then configuration and empanelment, then a coordinated path to production with support that continues after go-live. Reconciliation and data integration keep high-volume flows accurate.",
    capabilities: [
      "API integration against IndusInd Bank banking services",
      "Secure connectivity setup with SSL / static-IP prerequisites",
      "Bank configuration and client-end empanelment",
      "Transaction reconciliation via ERP plugins",
      "Data integration through adapters, converters, and parsers",
    ],
    steps: CONNECTIVITY_STEPS,
    stats: LINKAPI_AGGREGATE,
    meta: {
      title: "IndusInd Bank Integration | LinkAPI Tech",
      description:
        "LinkAPI Tech integrates corporate and BFSI platforms with IndusInd Bank — secure connectivity, configuration, reconciliation, and production support, from UAT to go-live.",
    },
    aggregate: true,
  },
  {
    slug: "hsbc",
    name: "HSBC",
    shortName: "HSBC",
    logo: "/assets/banks/hsbc.svg",
    brand: "#db0011",
    eyebrow: "Bank integration",
    tagline: "Integrate with HSBC, end to end.",
    intro:
      "LinkAPI helps businesses integrate with HSBC's banking systems — secure connectivity, configuration, and a coordinated path from UAT to production, backed by reconciliation and data integration.",
    overview:
      "HSBC integrations run on the same repeatable playbook LinkAPI applies across BFSI: establish secure connectivity, complete configuration and empanelment, coordinate the bank and your technology partner through UAT to production, then support the integration once it's live.",
    capabilities: [
      "API integration against HSBC banking services",
      "Secure connectivity setup with SSL / static-IP prerequisites",
      "Bank configuration and client-end empanelment",
      "Transaction reconciliation via ERP plugins",
      "Data integration through adapters, converters, and parsers",
    ],
    steps: CONNECTIVITY_STEPS,
    stats: LINKAPI_AGGREGATE,
    meta: {
      title: "HSBC Integration | LinkAPI Tech",
      description:
        "LinkAPI Tech integrates corporate and BFSI platforms with HSBC — secure connectivity, configuration, reconciliation, and production support, from UAT to go-live.",
    },
    aggregate: true,
  },
];

export const BANK_SLUGS = BANKS.map((b) => b.slug);
export const getBank = (slug: string) => BANKS.find((b) => b.slug === slug);
