/**
 * Homepage copy — from the client-authored Figma "LinkAPI Website" (2026-08).
 * Typos in the source are corrected here (see REDESIGN-V3.md "copy hygiene");
 * facts live in the other content modules.
 */

export const HERO = {
  eyebrow: "Connected banking · ERP-native · Bank–ERP connectivity · Since 2022",
  headline: "Banking That Lives Inside Your Business.",
  sub: "LinkAPI Tech connects banks, NBFCs and enterprises through ERP-native banking infrastructure — so payments, collections and reconciliation happen exactly where your business already works. Scalable, compliant and developer-friendly by design.",
  cta: { label: "Book a Demo", href: "/contact" },
  secondaryCta: { label: "Talk to our Banking Experts", href: "/contact" },
};

export interface SectionHeading {
  eyebrow?: string;
  heading: string;
  lead?: string;
}

/** Per-section eyebrow/heading copy for the homepage. */
export const HOME_SECTIONS: Record<string, SectionHeading> = {
  who: { heading: "Who We Are ?" },
  what: { heading: "What We Do" },
  ecosystem: {
    heading: "Product Ecosystem at a Glance",
    lead: "One connected ecosystem across the entire money movement lifecycle:",
  },
  challenges: {
    heading: "Challenges We Solve",
    lead: "Most businesses still run banking outside their core systems. We close that gap.",
  },
  why: { heading: "Why LinkAPI Tech" },
  numbers: { heading: "By the Numbers" },
  erps: { heading: "ERPs We Integrate With" },
  process: {
    heading: "How We Work",
    lead: "A streamlined, four-stage process from integration to go-live:",
  },
  voices: {
    eyebrow: "Client stories",
    heading: "Trusted by Leaders in Banking & Finance",
  },
  faq: {
    eyebrow: "Frequently asked questions",
    heading: "Questions? We hear often.",
  },
};

/** "Who We Are" glass card. `bold` is rendered in violet inside the sentence. */
export const WHO_WE_ARE = {
  lead: "LinkAPI Tech is a Technology Service Provider (TSP) operating in the Bank–ERP connectivity domain since 2022.",
  bold: "We give India's leading banks, NBFCs and businesses a single, secure layer",
  tail: "that embeds banking directly into the systems they use every day — turning fragmented, manual back-office work into seamless, real-time digital operations.",
};

/** "What We Do" — three numbered pillars (Figma 2026-08). */
export interface Pillar3 {
  num: string;
  title: string;
  body: string;
  icon: "chip" | "sync" | "spark";
}

export const WHAT_WE_DO: Pillar3[] = [
  {
    num: "01",
    title: "Technology Service Provider (TSP)",
    body: "A trusted TSP in the Bank–ERP connectivity space, building the secure rails that link financial institutions with enterprise systems.",
    icon: "chip",
  },
  {
    num: "02",
    title: "Integrated Banking Services",
    body: "Powering payments, collections, reconciliation and reporting from one place — eliminating manual processes and repetitive reconciliations.",
    icon: "sync",
  },
  {
    num: "03",
    title: "AI-Powered Accounting",
    body: "AI-driven accounting, banking-API integration, custom ERP–bank solutions and NPCI-backed B2B integrations for banks and NBFCs.",
    icon: "spark",
  },
];

/** "Challenges We Solve" — six pain points (Figma 2026-08). */
export interface Challenge {
  body: string;
  icon: "doc" | "grid" | "cart" | "unlink" | "eye" | "shield";
}

export const CHALLENGES: Challenge[] = [
  { body: "Manual banking, Excel-based reconciliation and fragmented workflows", icon: "doc" },
  { body: "Payments, collections, reporting and accounting scattered across platforms", icon: "grid" },
  { body: "Fragmented checkout and payment experiences", icon: "cart" },
  { body: "Banking that operates separately from ERP systems", icon: "unlink" },
  { body: "Limited real-time visibility into transactions and cash flow", icon: "eye" },
  { body: "Complex, hard-to-govern user access and approvals", icon: "shield" },
];

/** "Why LinkAPI Tech" — four differentiators (Figma 2026-08). */
export interface WhyRow {
  num: string;
  title: string;
  body: string;
}

export const WHY_US: WhyRow[] = [
  {
    num: "01",
    title: "Deep BFSI expertise",
    body: "A seasoned team spanning banking, engineering, product and integrations — purpose-built for regulated financial environments.",
  },
  {
    num: "02",
    title: "Efficient delivery & clear communication",
    body: "Projects delivered on time and on budget, with transparent updates at every stage.",
  },
  {
    num: "03",
    title: "Agile, sprint-based approach",
    body: "Development runs in reviewable sprints, so you see progress early and steer direction as you go.",
  },
  {
    num: "04",
    title: "Flexible engagement models",
    body: "Fixed-scope pricing for well-defined projects, or a dedicated team on a time-and-material basis for evolving needs.",
  },
];

/** Product chips orbiting the ecosystem hub (Figma 2026-08). */
export const ECOSYSTEM_CHIPS: { label: string; icon: string; href: string }[] = [
  { label: "Connected Banking Enterprise Solution", icon: "bank", href: "/connected-banking" },
  { label: "Smart Payments & Collections Engine", icon: "cash", href: "/solutions#payments-collections" },
  { label: "Real-Time Reconciliation Engine", icon: "sync", href: "/solutions#reconciliation" },
  { label: "Virtual Accounts Infrastructure", icon: "card", href: "/solutions#virtual-accounts" },
  { label: "Ecommerce Plugins & Integrations", icon: "plug", href: "/solutions#ecommerce" },
  { label: "Web Checkout & SDKs", icon: "code", href: "/solutions#checkout" },
  { label: "Enterprise Website & Banking Platforms", icon: "globe", href: "/solutions#platforms" },
  { label: "User Access Management", icon: "shield", href: "/solutions#governance" },
  { label: "Subscription Hub & Affordability Suite", icon: "tag", href: "/solutions#subscriptions" },
  { label: "WhatsApp Banking Chatbot", icon: "chat", href: "/solutions#chatbot" },
];
