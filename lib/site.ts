import { SERVICES, serviceHeading } from "@/content/services";
import { CASES } from "@/content/cases";

/**
 * Site-wide configuration — LinkAPI Tech's real contact details, navigation,
 * and trust signals. Sourced from CONTENT-MAPPING.md §1–2 (all values verbatim
 * from linkapitech.com). Do not invent facts about LinkAPI here.
 */

export const SITE = {
  name: "LinkAPI Tech",
  legalName: "LinkAPI Tech Pvt. Ltd.",
  domain: "linkapitech.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://linkapitech.com",
  description:
    "LinkAPI Tech is a technology service provider for corporates and BFSI businesses — delivering API integration, transaction reconciliation, WAN/LAN infrastructure, and data integration solutions from Ghaziabad, India.",
  tagline: "Systems that connect. Business that grows.",
} as const;

export interface ContactChannel {
  label: string;
  phone: string;
  phoneHref: string;
  email: string;
}

export const CONTACT = {
  address: {
    line1: "SRA 82 A, Shipra Indirapuram",
    line2: "Ghaziabad, Uttar Pradesh",
    country: "India",
    full: "SRA 82 A, Shipra Indirapuram, Ghaziabad, Uttar Pradesh, India",
  },
  channels: [
    {
      label: "Plugin Support & Inquiries",
      phone: "+91-9318373476",
      phoneHref: "tel:+919318373476",
      email: "partnership@linkapitech.com",
    },
    {
      label: "Management-Related Queries",
      phone: "+91-9891121770",
      phoneHref: "tel:+919891121770",
      email: "Operations@linkapitech.com",
    },
  ] as ContactChannel[],
  primaryEmail: "partnership@linkapitech.com",
  // Real, working WhatsApp Business channel (CONTENT-MAPPING §1).
  whatsapp:
    "https://api.whatsapp.com/send?phone=+91-9318373476&text=Hello%20I%20want%20to%20know%20more%20about%20your%20plugin",
} as const;

/**
 * Social profiles. Every icon on the source site had an empty href — treated as
 * a hard gap (CONTENT-MAPPING §1). Leave empty until real handles are supplied
 * so we never link to a dead "#".
 */
export const SOCIALS: { label: string; href: string }[] = [
  // TODO: client to confirm — add real profile URLs, or these stay hidden.
];

/* ============================================================
   Navigation IA — institutional header with two mega panels.
   ============================================================ */

export interface MegaLink {
  label: string;
  href: string;
  description?: string;
}

export interface MegaColumn {
  heading: string;
  links: MegaLink[];
}

const serviceLink = (id: string): MegaLink => {
  const s = SERVICES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown service id: ${id}`);
  return {
    label: serviceHeading(s),
    href: `/services#${s.id}`,
    description: s.tags.slice(0, 2).join(" · "),
  };
};

/** Solutions panel — the 7 real services grouped by what they do for a bank. */
export const SOLUTIONS_MENU: MegaColumn[] = [
  {
    heading: "Connect",
    links: [
      serviceLink("api-integration"),
      serviceLink("data-integration"),
      serviceLink("wan-lan"),
    ],
  },
  {
    heading: "Operate",
    links: [
      serviceLink("reconciliation"),
      serviceLink("security"),
      serviceLink("it-consulting"),
    ],
  },
  {
    heading: "Grow",
    links: [serviceLink("sales-augmentation")],
  },
];

/** Work panel — the 4 aggregate program summaries with their headline stat. */
export const WORK_MENU: MegaLink[] = CASES.map((c) => ({
  label: c.name,
  href: `/work/${c.slug}`,
  description: c.stats[0] ? `${c.stats[0].num} ${c.stats[0].label}` : c.kicker,
}));

/** Plain top-level links (non-mega). */
export const NAV_PAGES = [
  { href: "/clients", label: "Clients" },
  { href: "/about", label: "About" },
] as const;

export const CTA = {
  label: "Consult our Growth Experts",
  href: "/contact",
} as const;

/* ============================================================
   Legacy exports — still imported by the pre-redesign homepage
   sections; removed when those components are rebuilt (Phase 3).
   ============================================================ */

/** @deprecated old homepage numbered-index motif. */
export const SECTIONS = [
  { num: "01", id: "work", label: "Work" },
  { num: "02", id: "services", label: "Services" },
  { num: "03", id: "process", label: "Process" },
  { num: "04", id: "why", label: "Why Us" },
  { num: "05", id: "clients", label: "Clients" },
  { num: "06", id: "contact", label: "Contact" },
] as const;

/** @deprecated superseded by SOLUTIONS_MENU / WORK_MENU / NAV_PAGES. */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;
