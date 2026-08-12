/**
 * Connected Banking capabilities — the nine functions the ERP plugin exposes
 * inside the accounting system (client Figma 2026-08, page 31).
 */
import type { IconName } from "@/components/ui/Icon";

export interface Capability {
  title: string;
  body: string;
  icon: IconName;
}

export const CAPABILITIES: Capability[] = [
  {
    title: "Check Balance",
    body: "Real-time bank-balance visibility inside ERP workflows for faster financial decisions.",
    icon: "scale",
  },
  {
    title: "Account Aggregator",
    body: "Secure financial-data aggregation for consolidated account insights and clear cash-flow visibility.",
    icon: "layers",
  },
  {
    title: "GST Payments",
    body: "Direct GST payment workflows built into ERP systems for faster, cleaner compliance.",
    icon: "building",
  },
  {
    title: "Cross Border Payment",
    body: "International payments with centralised tracking and full transaction visibility.",
    icon: "globe",
  },
  {
    title: "Collections",
    body: "Unified collections for invoice-based receipts, fee payments and automated reconciliation.",
    icon: "receipt",
  },
  {
    title: "Bharat Connect",
    body: "Integrated bill payment and collection via seamless BBPS-based transactions inside enterprise workflows.",
    icon: "link",
  },
  {
    title: "Vendor Payments",
    body: "Bulk and single vendor payouts with approval workflows and real-time payment tracking.",
    icon: "user",
  },
  {
    title: "Virtual Account Collections",
    body: "Dedicated virtual accounts for smarter collections, automated settlement and payment identification.",
    icon: "card",
  },
  {
    title: "Account Statement & Reconciliation",
    body: "Instant statement fetch with automated transaction reconciliation and ledger synchronisation.",
    icon: "doc",
  },
];

/** "How It Works" — the routing architecture (Figma page 31). */
export const ARCHITECTURE = {
  lead: "Banks, NBFCs and fintechs connect to the LinkAPI Business Banking Platform via redirection, SSO or direct login. Payments, collections, Bharat Connect and lending/wealth flows route through a central data layer that stays continuously in sync with your ERP — Tally, Busy, Zoho or SAP — through the Connected Banking Server, so every transaction is reflected accurately on both sides.",
  left: {
    heading: "Bank & NBFC gateway",
    items: [
      { label: "Secure SSO Entry", icon: "shield" as IconName },
      { label: "Direct Bank Login", icon: "link" as IconName },
    ],
  },
  centre: {
    title: "LinkAPI Connected Banking Server",
    body: "Centralised ledger routing, real-time API mapping and compliance management.",
  },
  right: {
    heading: "Enterprise ERP ledger",
    items: [
      { label: "SAP & Oracle Suite", icon: "grid" as IconName },
      { label: "Tally, Busy & Zoho", icon: "chart" as IconName },
    ],
  },
};
