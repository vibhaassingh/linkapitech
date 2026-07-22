/**
 * Services accordion — 7 slots (CONTENT-MAPPING §4.3 / §5.2), flagship first.
 * Copy is authored from LinkAPI's real service language, with the three
 * duplicated source blurbs rewritten as differentiated descriptions and tag
 * chips derived from real phrasing. `title` + `accent` form the full service
 * heading (see serviceHeading below).
 */
export interface Service {
  num: string;
  id: string;
  title: string;
  accent: string;
  description: string;
  tags: string[];
  note?: string;
}

export const SERVICES: Service[] = [
  {
    num: "01",
    id: "api-integration",
    title: "API Integration &",
    accent: "Bank Connectivity",
    description:
      "End-to-end API integration from UAT to production — establishing secure connectivity, handling bank configuration and client empanelment, and coordinating between the bank and your technology partner. We manage prerequisites like static IPs and SSL certificates, then stay on for post-live support.",
    tags: ["UAT to Production", "Secure Connectivity", "Bank Empanelment", "Post-Live Support"],
  },
  {
    num: "02",
    id: "reconciliation",
    title: "Transaction",
    accent: "Reconciliation",
    description:
      "ERP plugins that sync and reconcile transactions automatically — closing accounting gaps, surfacing exceptions early, and bringing measurable process efficiency to high-volume BFSI operations.",
    tags: ["ERP Sync", "Auto-Reconciliation", "Reporting", "Audit Trail"],
  },
  {
    num: "03",
    id: "data-integration",
    title: "Data Integration",
    accent: "Solutions",
    description:
      "Adapters, converters, and parsers that let disparate systems speak the same language — clean, reliable data movement between platforms, banks, and internal tools with no manual re-keying.",
    tags: ["Adapters", "Converters", "Parsers", "Data Sync"],
  },
  {
    num: "04",
    id: "wan-lan",
    title: "WAN / LAN Setup &",
    accent: "Support",
    description:
      "Network infrastructure designed, deployed, and supported for reliability — from branch connectivity to secure internal LANs, kept running with responsive, on-demand support.",
    tags: ["Network Design", "Connectivity", "Monitoring", "Support"],
  },
  {
    num: "05",
    id: "it-consulting",
    title: "Strategic IT",
    accent: "Consulting",
    description:
      "Business-process improvement grounded in technology. We map where operations lose time and cost, then design pragmatic, implementable solutions that fit your real constraints and compliance needs.",
    tags: ["Process Review", "Architecture", "Roadmapping", "Advisory"],
  },
  {
    num: "06",
    id: "security",
    title: "Custom Security",
    accent: "Solutions",
    description:
      "Security protocols shaped to your platform, application, and environment — from SSL and static-IP prerequisites to hardening the surfaces that carry sensitive financial data.",
    tags: ["Protocol Design", "SSL / Static IP", "Platform Hardening"],
  },
  {
    num: "07",
    id: "sales-augmentation",
    title: "BFSI Sales",
    accent: "Augmentation",
    description:
      "An influencer and partner program that extends BFSI product distribution through inorganic sales channels — web developers, ERP and plugin resellers, chartered accountants, and cloud resellers.",
    tags: ["Partner Program", "Channel Sales", "Reseller Network"],
    note: "TODO: client to confirm — may belong as a standalone Partner Program page.",
  },
];

/** Convenience: the full heading string for nav labels / aria. */
export const serviceHeading = (s: Service) => `${s.title} ${s.accent}`;
