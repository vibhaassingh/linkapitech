/**
 * Services page content — client Figma (2026-08, page 37).
 *
 * WHAT_WE_OFFER is the delivery-support timeline; SERVICES is the Core Services
 * grid. `id` doubles as the deep-link anchor. Descriptions follow the Figma;
 * where it was terse, wording is extended in LinkAPI's own service language
 * without adding new claims.
 */
import type { IconName } from "@/components/ui/Icon";

export const SERVICES_HERO = {
  titlePlain1: "Services that turn",
  titleAccent: "integration complexity",
  titlePlain2: "into go-live confidence.",
  lead: "We help banks, NBFCs and enterprises implement innovative process models that drive revenue and reduce cost — from first API call to full production and beyond.",
};

/** "What We Offer" — six engagement commitments, shown as a zig-zag timeline. */
export interface OfferStep {
  num: string;
  body: string;
  icon: IconName;
}

export const WHAT_WE_OFFER: OfferStep[] = [
  { num: "01", body: "End-to-end API integration support, from UAT to production", icon: "chip" },
  { num: "02", body: "Secure connectivity setup (including basic Telnet services)", icon: "sync" },
  { num: "03", body: "Bank configuration setup and client-end empanelment", icon: "spark" },
  {
    num: "04",
    body: "Technical coordination between the bank and the client's technology partner",
    icon: "share",
  },
  {
    num: "05",
    body: "Support with bank prerequisites (static IP and SSL certificates — procured by the client where required)",
    icon: "shield",
  },
  { num: "06", body: "Ongoing post-live support, on demand", icon: "heart" },
];

export interface Service {
  num: string;
  id: string;
  title: string;
  description: string;
  icon: IconName;
  /** Emphasised card in the bento grid (Figma tints two of the seven). */
  feature?: boolean;
}

export const SERVICES: Service[] = [
  {
    num: "01",
    id: "it-consulting",
    title: "Strategic IT & BFSI Consulting",
    description:
      "Business-process improvement and technology consulting tailored to your banking and financial operations.",
    icon: "chip",
    feature: true,
  },
  {
    num: "02",
    id: "erp-plugins",
    title: "ERP Reconciliation Plugins",
    description:
      "Plugins that sync and reconcile your transactions directly within Tally, Busy, Zoho, SAP, NetSuite and Odoo.",
    icon: "sync",
    feature: true,
  },
  {
    num: "03",
    id: "reconciliation",
    title: "Transaction Reconciliation",
    description:
      "Automated reconciliation that removes manual matching and keeps ledgers accurate in real time.",
    icon: "receipt",
  },
  {
    num: "04",
    id: "data-integration",
    title: "Adapters, Converters & Parsers",
    description:
      "Custom middleware for easy communication and reliable data synchronisation across systems.",
    icon: "layers",
  },
  {
    num: "05",
    id: "security",
    title: "Custom Security Solutions",
    description: "Security protocols designed to suit your platform, application and environment.",
    icon: "shield",
  },
  {
    num: "06",
    id: "wan-lan",
    title: "WAN / LAN Setup & Support",
    description:
      "Network setup and ongoing support that keeps critical banking operations connected and secure.",
    icon: "globe",
  },
  {
    num: "07",
    id: "api-integration",
    title: "API Integration & Bank Connectivity",
    description:
      "End-to-end API integration from UAT to production — secure connectivity, bank configuration, empanelment and post-live support.",
    icon: "link",
  },
];

/** Partner & Influencer Program band (Figma page 37). */
export const PARTNER_PROGRAM = {
  eyebrow: "Partnership opportunities",
  heading: "Partner & Influencer Program",
  body: "Grow with us. Our partner program supports web developers, ERP resellers, plugin resellers, chartered accountants and cloud resellers with the tools and incentives to bring connected banking to more businesses — an inorganic sales channel that scales BFSI product adoption.",
  nodes: ["Web Developers", "Chartered Accountants", "ERP Resellers", "Plugin Resellers", "Cloud Resellers"],
};

/** Engagement & Pricing card (Figma page 37). */
export const ENGAGEMENT = {
  heading: "Engagement & Pricing",
  lead: "Flexible, transparent models:",
  boldA: "fixed-bid pricing",
  midA: "for well-defined scopes, or a",
  boldB: "dedicated development team",
  tail: "on a time-and-material basis for evolving products.",
};

/** Convenience: nav/aria label for a service. */
export const serviceHeading = (s: Service) => s.title;
