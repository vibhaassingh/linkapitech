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

import { GROWTH_STATS, IMPACT_STATS, type Stat } from "./stats";
import type { IconName } from "@/components/ui/Icon";

/** One capability card. `body` is the claim; `icon` is purely presentational. */
export interface BankCapability {
  icon: IconName;
  body: string;
}

export interface BankStep {
  title: string;
  body: string;
  icon: IconName;
}

/**
 * The aggregate stat block. `caption` is REQUIRED, not optional: the figures
 * are LinkAPI-wide, so the type makes it impossible to render them without
 * also having the "not a per-bank number" disclaimer in hand.
 */
export interface BankStats {
  caption: string;
  items: Stat[];
}

export interface BankPage {
  slug: string;
  /** Full display name, e.g. "Axis Bank". */
  name: string;
  /** Short name for compact contexts, e.g. "Axis". */
  shortName: string;
  /** Path to a licensed vector logo in /public. */
  logo: string;
  /**
   * Per-logo optical correction, exactly like ClientMark.scale — the three
   * marks have very different lockups (HSBC's wordmark is huge relative to its
   * symbol), so a uniform box makes them read at different weights. Tune here,
   * never at a call site.
   */
  logoScale: number;
  eyebrow: string;
  intro: string;
  overview: string;
  /** What LinkAPI can wire up against this bank's systems (capability, not claim). */
  capabilities: BankCapability[];
  /** The repeatable connectivity → go-live playbook (from real /services scope). */
  steps: BankStep[];
  /** LinkAPI COMPANY-WIDE aggregate — captioned as such on the page. */
  stats: BankStats;
  meta: { title: string; description: string };
}

/**
 * Shared LinkAPI-wide aggregate — the figures themselves come straight from
 * content/stats.ts (client-authored Figma 2026-08), so a bank page can never
 * drift from the homepage or contradict it.
 */
const LINKAPI_AGGREGATE: BankStats = {
  caption:
    "LinkAPI Tech company-wide, across every bank and ERP integration. These are not bank-specific figures.",
  items: [GROWTH_STATS[0], GROWTH_STATS[1], IMPACT_STATS[0]],
};

/**
 * The five capabilities, identical for every bank because the playbook is —
 * only the first line names the bank whose systems are being integrated.
 */
const capabilitiesFor = (bankName: string): BankCapability[] => [
  { icon: "link", body: `API integration against ${bankName} banking services` },
  {
    icon: "shield",
    body: "Secure connectivity setup with SSL / static-IP prerequisites",
  },
  { icon: "bank", body: "Bank configuration and client-end empanelment" },
  { icon: "sync", body: "Transaction reconciliation via ERP plugins" },
  {
    icon: "layers",
    body: "Data integration through adapters, converters, and parsers",
  },
];

/** The real, repeatable API-integration playbook (CONTENT-MAPPING §2.4 / /services). */
const CONNECTIVITY_STEPS: BankStep[] = [
  {
    title: "Secure connectivity",
    icon: "shield",
    body: "Establish secure connectivity for your environment (Basic Telnet Services), with prerequisites like static IP and SSL certificates handled up front.",
  },
  {
    title: "Configuration & empanelment",
    icon: "bank",
    body: "Bank configuration setup and client-end empanelment, coordinated end to end so the integration clears every prerequisite.",
  },
  {
    title: "UAT → production",
    icon: "code",
    body: "Comprehensive API integration support from UAT through to production, with technical coordination between the bank and your technology partner.",
  },
  {
    title: "Post-live support",
    icon: "sync",
    body: "Ongoing post-live support on demand — reconciliation, data movement, and connectivity monitored so systems stay in sync at volume.",
  },
];

export const BANKS: BankPage[] = [
  {
    slug: "axis",
    name: "Axis Bank",
    shortName: "Axis",
    logo: "/assets/banks/axis.svg",
    logoScale: 0.95,
    eyebrow: "Bank integration",
    intro:
      "LinkAPI helps corporates and BFSI businesses integrate their platforms with Axis Bank's banking systems — from secure connectivity through production, with reconciliation that holds at scale.",
    overview:
      "Whether you're launching a new product on Axis Bank rails or extending an existing one, LinkAPI handles the connectivity, configuration, and coordination between your team and the bank. The same repeatable integration playbook behind thousands of BFSI implementations, applied to your Axis Bank use case.",
    capabilities: capabilitiesFor("Axis Bank"),
    steps: CONNECTIVITY_STEPS,
    stats: LINKAPI_AGGREGATE,
    meta: {
      title: "Axis Bank Integration | LinkAPI Tech",
      description:
        "LinkAPI Tech integrates corporate and BFSI platforms with Axis Bank — secure connectivity, configuration, reconciliation, and production support, from UAT to go-live.",
    },
  },
  {
    slug: "indusind",
    name: "IndusInd Bank",
    shortName: "IndusInd",
    logo: "/assets/banks/indusind.svg",
    logoScale: 0.96,
    eyebrow: "Bank integration",
    intro:
      "LinkAPI connects your platform to IndusInd Bank's systems — establishing secure connectivity, completing configuration and empanelment, and taking the integration from UAT to production.",
    overview:
      "IndusInd Bank integrations follow LinkAPI's proven delivery model: secure connectivity first, then configuration and empanelment, then a coordinated path to production with support that continues after go-live. Reconciliation and data integration keep high-volume flows accurate.",
    capabilities: capabilitiesFor("IndusInd Bank"),
    steps: CONNECTIVITY_STEPS,
    stats: LINKAPI_AGGREGATE,
    meta: {
      title: "IndusInd Bank Integration | LinkAPI Tech",
      description:
        "LinkAPI Tech integrates corporate and BFSI platforms with IndusInd Bank — secure connectivity, configuration, reconciliation, and production support, from UAT to go-live.",
    },
  },
  {
    slug: "hsbc",
    name: "HSBC",
    shortName: "HSBC",
    logo: "/assets/banks/hsbc.svg",
    logoScale: 0.7,
    eyebrow: "Bank integration",
    intro:
      "LinkAPI helps businesses integrate with HSBC's banking systems — secure connectivity, configuration, and a coordinated path from UAT to production, backed by reconciliation and data integration.",
    overview:
      "HSBC integrations run on the same repeatable playbook LinkAPI applies across BFSI: establish secure connectivity, complete configuration and empanelment, coordinate the bank and your technology partner through UAT to production, then support the integration once it's live.",
    capabilities: capabilitiesFor("HSBC"),
    steps: CONNECTIVITY_STEPS,
    stats: LINKAPI_AGGREGATE,
    meta: {
      title: "HSBC Integration | LinkAPI Tech",
      description:
        "LinkAPI Tech integrates corporate and BFSI platforms with HSBC — secure connectivity, configuration, reconciliation, and production support, from UAT to go-live.",
    },
  },
];

export const BANK_SLUGS = BANKS.map((b) => b.slug);
export const getBank = (slug: string) => BANKS.find((b) => b.slug === slug);
