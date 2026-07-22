/**
 * Homepage copy — LinkAPI's real content adapted to the institutional-light
 * redesign. Facts (stats, contacts, service language) come from the other
 * content files; net-new headline drafts are flagged for client sign-off.
 */

export const HERO = {
  eyebrow: "API infrastructure for Banking & BFSI",
  // TODO: client to confirm — drafted headline for the institutional redesign.
  headline: "Bank-grade integration, delivered.",
  sub: "LinkAPI Tech builds the API integrations, reconciliation, and infrastructure that connect banks and businesses — from UAT to production, and beyond.",
  cta: { label: "Consult our Growth Experts", href: "/contact" },
  secondaryCta: { label: "Explore services", href: "/services" },
  // No real SLA exists (CONTENT-MAPPING §4.1) — show the real live channel
  // rather than inventing a "replies within Nh" figure.
  support: { label: "Plugin support", value: "+91-9318373476", href: "tel:+919318373476" },
};

export interface SectionHeading {
  eyebrow: string;
  heading: string;
  lead?: string;
}

/** Per-section eyebrow/heading copy for the homepage. */
export const HOME_SECTIONS: Record<string, SectionHeading> = {
  services: {
    eyebrow: "Solutions",
    heading: "The full integration surface, in one partner.",
    lead: "Seven services covering how banks and businesses connect, operate, and grow — led by our flagship bank-connectivity practice.",
  },
  process: {
    eyebrow: "How we deliver",
    heading: "A disciplined path to go-live.",
    lead: "Four phases scoped to your systems and compliance needs, with post-live support on demand.",
  },
  work: {
    eyebrow: "Selected work",
    heading: "Programs behind the numbers.",
    lead: "Aggregate, program-level summaries built from LinkAPI's real quantified impact — not confidential client case studies.",
  },
  security: {
    eyebrow: "Security & delivery discipline",
    heading: "Built for regulated environments.",
    lead: "The practices behind every engagement — no shortcuts between UAT and production.",
  },
  why: {
    eyebrow: "Why LinkAPI",
    heading: "Discover the difference.",
  },
  voices: {
    eyebrow: "In their words",
    heading: "What clients say.",
  },
  faq: {
    eyebrow: "FAQ",
    heading: "Questions, answered.",
  },
  contact: {
    eyebrow: "Contact",
    heading: "Let's connect your systems.",
    lead: "Tell us about your integration — we'll set up a short discovery call.",
  },
};

