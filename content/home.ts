/**
 * Homepage copy — adapted from LinkAPI's real content (CONTENT-MAPPING §4) into
 * allgoodstudio's editorial two-line / italic-serif headline structure.
 * The dead `#about` hero CTA is repointed to `#contact`; the real CTA label
 * ("Consult our Growth Experts") is reused verbatim.
 */

export const HERO = {
  headline: {
    line1: "Secure connections",
    line2Plain: "that",
    line2Accent: "grow with you.",
  },
  subhead: {
    // One sentence, one italic-serif emphasis word (DESIGN-SYSTEM §2.2).
    text: "We're a technology partner for corporates and BFSI businesses — building the API integrations, reconciliation, and infrastructure that make complex systems feel",
    emphasis: "simple.",
  },
  cta: { label: "Consult our Growth Experts", href: "#contact" },
  // No real SLA exists (CONTENT-MAPPING §4.1), so we show a real live channel
  // rather than inventing a "replies within Nh" figure.
  support: { label: "Plugin support", value: "+91-9318373476", href: "tel:+919318373476" },
};

export interface IndexPanel {
  id: string;
  eyebrow: string;
  headingPlain: string;
  headingAccent: string;
  desc: string;
}

/** Sticky index-rail panels (HOMEPAGE-SECTIONS SplitShell) — distinct micro-copy per section. */
export const INDEX_PANELS: IndexPanel[] = [
  {
    id: "work",
    eyebrow: "Selected work",
    headingPlain: "Programs, not",
    headingAccent: "promises.",
    desc: "Aggregate views of the integration, reconciliation, and infrastructure work behind the numbers.",
  },
  {
    id: "services",
    eyebrow: "What we do",
    headingPlain: "Seven ways we",
    headingAccent: "connect.",
    desc: "From bank connectivity to reconciliation and security — the full integration surface, in one place.",
  },
  {
    id: "process",
    eyebrow: "How we work",
    headingPlain: "A calm path to",
    headingAccent: "go-live.",
    desc: "Four phases scoped to your systems and compliance needs, with post-live support included.",
  },
  {
    id: "why",
    eyebrow: "Why LinkAPI",
    headingPlain: "Built for",
    headingAccent: "BFSI-grade trust.",
    desc: "A handpicked team, agile delivery, and infrastructure proven at real scale.",
  },
  {
    id: "clients",
    eyebrow: "In their words",
    headingPlain: "What clients",
    headingAccent: "say.",
    desc: "A few words from the people we've worked with.",
  },
  {
    id: "contact",
    eyebrow: "Get in touch",
    headingPlain: "Let's connect your",
    headingAccent: "systems.",
    desc: "Tell us about your integration — we'll set up a short discovery call.",
  },
];

export interface SectionMeta {
  num: string;
  eyebrow: string;
  end?: string;
  headingPlain: string;
  headingAccent: string;
}

/** In-section eyebrow + heading copy (distinct from the index-rail preview). */
export const SECTION_META: Record<string, SectionMeta> = {
  work: {
    num: "01",
    eyebrow: "Selected work",
    end: "Aggregate program summaries",
    headingPlain: "Programs behind the",
    headingAccent: "numbers.",
  },
  services: {
    num: "02",
    eyebrow: "Services",
    end: "API · Reconciliation · Security · Support",
    headingPlain: "Exceeding expectations, one",
    headingAccent: "integration at a time.",
  },
  process: {
    num: "03",
    eyebrow: "Process",
    end: "4 phases · support included",
    headingPlain: "How the LinkAPI team",
    headingAccent: "works.",
  },
  why: {
    num: "04",
    eyebrow: "Why us",
    end: "Six reasons",
    headingPlain: "Discover the",
    headingAccent: "difference.",
  },
  clients: {
    num: "05",
    eyebrow: "In their words",
    end: "From recent work",
    headingPlain: "Our clients, in their",
    headingAccent: "words.",
  },
  contact: {
    num: "06",
    eyebrow: "Contact",
    end: "Plugin support & inquiries",
    headingPlain: "Let's connect your",
    headingAccent: "systems.",
  },
};

export const FAQ_HEADING = { plain: "Questions, ", accent: "answered." };
