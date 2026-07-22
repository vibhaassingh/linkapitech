/**
 * Case studies — modelled once as typed data (PAGES-AND-ROUTING §3.3), rendered
 * both in the homepage Works deck and the /work/[slug] pages.
 *
 * LinkAPI has NO real client case studies (CONTENT-MAPPING §4.2), so these are
 * *aggregate, program-level* summaries built from LinkAPI's real quantified
 * stats — deliberately NOT tied to a specific named bank, to avoid fabricating
 * client-specific outcome claims (real business/legal risk). Each is flagged
 * `aggregate: true`.
 *
 * TODO: client to confirm — replace with real per-engagement narratives and
 * confirm real dates (year/timeline are placeholders).
 */

export interface CaseBlock {
  heading: string;
  body: string;
  stat: string;
  statLabel: string;
}

export type CaseTone = "lime" | "ink" | "slate" | "violet";

export interface CaseStudy {
  slug: string;
  name: string;
  kicker: string;
  industry: string;
  services: string;
  year: string;
  timeline: string;
  role: string;
  intro: string;
  challenge: CaseBlock;
  solution: CaseBlock;
  outcome: CaseBlock;
  highlights: string[];
  stats: { num: string; label: string; body?: string }[];
  tone: CaseTone;
  aggregate: true;
}

export const CASES: CaseStudy[] = [
  {
    slug: "bfsi-api-integration",
    name: "BFSI API Integration Program",
    kicker: "Program summary",
    industry: "BFSI · Fintech · Agritech · Edutech",
    services: "API Integration · Bank Connectivity",
    year: "Ongoing",
    timeline: "Multi-year program",
    role: "Integration & Delivery Partner",
    intro:
      "An aggregate view of LinkAPI's core work: connecting client platforms to banks and financial systems, from UAT through production, across regulated BFSI environments.",
    challenge: {
      heading: "The challenge",
      body: "Enterprises and fintechs need to connect to banks quickly and securely — but empanelment, connectivity prerequisites, and coordination between multiple parties slow every launch.",
      stat: "UAT→Prod",
      statLabel: "End-to-end scope",
    },
    solution: {
      heading: "The approach",
      body: "A repeatable integration playbook: establish secure connectivity, complete bank configuration and client empanelment, coordinate between bank and technology partner, and handle prerequisites like static IP and SSL.",
      stat: "6 steps",
      statLabel: "Delivery playbook",
    },
    outcome: {
      heading: "The outcome",
      body: "A large, growing base of production integrations spanning BFSI, Fintech, Agritech, and Edutech clients.",
      stat: "5000+",
      statLabel: "API implementations",
    },
    highlights: [
      "Secure connectivity established per client environment",
      "Bank configuration and client-end empanelment handled end to end",
      "Technical coordination between bank and client's technology partner",
      "Ongoing post-live support, on demand",
    ],
    stats: [
      { num: "5000+", label: "API implementations" },
      { num: "4", label: "Domains served", body: "BFSI · Fintech · Agritech · Edutech" },
      { num: "UAT→Prod", label: "Delivery scope" },
    ],
    tone: "lime",
    aggregate: true,
  },
  {
    slug: "transaction-reconciliation",
    name: "Transaction Reconciliation Rollout",
    kicker: "Program summary",
    industry: "BFSI · ERP",
    services: "Reconciliation · ERP Plugins",
    year: "Ongoing",
    timeline: "Multi-year program",
    role: "Reconciliation & Delivery Partner",
    intro:
      "How LinkAPI's ERP plugins sync and reconcile high-volume transactions — closing accounting gaps and cutting the manual effort behind month-end close.",
    challenge: {
      heading: "The challenge",
      body: "At BFSI transaction volumes, manual reconciliation is slow and error-prone — exceptions surface late and accounting gaps compound.",
      stat: "10L+/mo",
      statLabel: "Transactions to reconcile",
    },
    solution: {
      heading: "The approach",
      body: "ERP plugins that sync and reconcile automatically, matching transactions, surfacing exceptions early, and producing audit-ready reporting.",
      stat: "Automated",
      statLabel: "Matching & exceptions",
    },
    outcome: {
      heading: "The outcome",
      body: "Reconciliation solutions delivered at scale, bringing measurable process efficiency to high-volume operations.",
      stat: "2500+",
      statLabel: "Solutions delivered",
    },
    highlights: [
      "ERP sync across accounting systems",
      "Automated matching with early exception surfacing",
      "Audit-ready reporting and trails",
      "Process efficiency at BFSI scale",
    ],
    stats: [
      { num: "2500+", label: "Solutions delivered" },
      { num: "10L+", label: "Transactions / month" },
      { num: "70,000+", label: "Transacting current accounts" },
    ],
    tone: "ink",
    aggregate: true,
  },
  {
    slug: "partner-portal-development",
    name: "Partner & Portal Development",
    kicker: "Program summary",
    industry: "BFSI · Partner Programs",
    services: "Portal Development · Partner Enablement",
    year: "Ongoing",
    timeline: "Multi-year program",
    role: "Development & Enablement Partner",
    intro:
      "Building the portals and partner network that carry BFSI products further — for both external customers and internal teams.",
    challenge: {
      heading: "The challenge",
      body: "Reaching more of the market means both better internal tooling and new distribution channels beyond a direct sales team.",
      stat: "Internal + external",
      statLabel: "Portal audiences",
    },
    solution: {
      heading: "The approach",
      body: "Portal development for external and internal clients, paired with an influencer and partner program spanning developers, ERP and plugin resellers, chartered accountants, and cloud resellers.",
      stat: "1000+",
      statLabel: "Active partners",
    },
    outcome: {
      heading: "The outcome",
      body: "A portfolio of portals and a partner network extending BFSI product distribution through inorganic sales channels.",
      stat: "100+",
      statLabel: "Portals built",
    },
    highlights: [
      "Portals for external and internal clients",
      "Partner program across developers, resellers, and CAs",
      "Inorganic BFSI product distribution channels",
      "1000+ active partners under the program",
    ],
    stats: [
      { num: "100+", label: "Portals built" },
      { num: "1000+", label: "Active partners" },
      { num: "5", label: "Partner categories" },
    ],
    tone: "slate",
    aggregate: true,
  },
  {
    slug: "bfsi-transaction-infrastructure",
    name: "BFSI Transaction Infrastructure",
    kicker: "Program summary",
    industry: "BFSI",
    services: "Transaction Infrastructure · Data Integration",
    year: "Ongoing",
    timeline: "Multi-year program",
    role: "Infrastructure & Integration Partner",
    intro:
      "The scale behind the numbers — the integration and data infrastructure supporting LinkAPI's monthly transaction volume.",
    challenge: {
      heading: "The challenge",
      body: "High-volume financial processing demands reliability, clean data movement between systems, and connectivity that stays up.",
      stat: "₹20,000 Cr",
      statLabel: "Monthly volume",
    },
    solution: {
      heading: "The approach",
      body: "Data integration through adapters, converters, and parsers, backed by secure connectivity and responsive support — so systems stay in sync at volume.",
      stat: "45,000+",
      statLabel: "Customers served",
    },
    outcome: {
      heading: "The outcome",
      body: "A processing footprint spanning lakhs of monthly transactions and tens of thousands of current accounts.",
      stat: "10L+",
      statLabel: "Transactions / month",
    },
    highlights: [
      "₹20,000 Cr processed every month",
      "10 lakh+ transactions per month",
      "45,000+ customers served",
      "Reliable data movement across systems",
    ],
    stats: [
      { num: "₹20,000 Cr", label: "Volume / month" },
      { num: "45,000+", label: "Customers" },
      { num: "10L+", label: "Transactions / month" },
    ],
    tone: "violet",
    aggregate: true,
  },
];

export const CASE_SLUGS = CASES.map((c) => c.slug);
export const getCase = (slug: string) => CASES.find((c) => c.slug === slug);
