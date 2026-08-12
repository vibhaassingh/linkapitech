/**
 * Site-wide configuration — LinkAPI Tech's real contact details, navigation,
 * and trust signals. Values come from CONTENT-MAPPING.md §1–2 (verbatim from
 * linkapitech.com) and the client Figma (2026-08). Do not invent facts here.
 */

export const SITE = {
  name: "LinkAPI Tech",
  legalName: "LinkAPI Tech Pvt. Ltd.",
  domain: "linkapitech.com",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://linkapitech.com",
  description:
    "LinkAPI Tech connects banks, NBFCs and enterprises through ERP-native banking infrastructure — so payments, collections and reconciliation happen where your business already works.",
  tagline: "Banking that lives inside your business.",
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
      // New in the Figma (2026-08). Note the plural "partnerships@" here vs
      // the singular "partnership@" on the live site — both are reproduced as
      // given. TODO: client to confirm which mailbox is canonical.
      label: "Partnerships & Product",
      phone: "+91 87000 45411",
      phoneHref: "tel:+918700045411",
      email: "partnerships@linkapitech.com",
    },
    {
      label: "Plugin Support & Inquiries",
      phone: "+91-9318373476",
      phoneHref: "tel:+919318373476",
      email: "partnership@linkapitech.com",
    },
    {
      label: "Management Queries",
      phone: "+91-9891121770",
      phoneHref: "tel:+919891121770",
      email: "operations@linkapitech.com",
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
   Navigation IA — flat five-link pill header (Figma 2026-08).
   The mega menu is retired: the Figma nav has no panels, and every
   destination below is a real page.
   ============================================================ */

export interface NavLink {
  href: string;
  label: string;
}

export const NAV: NavLink[] = [
  { href: "/about", label: "About Us" },
  { href: "/solutions", label: "Solutions" },
  { href: "/connected-banking", label: "Connected Banking" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries We Serve" },
];

export const CTA = {
  label: "Contact Us",
  href: "/contact",
} as const;

/**
 * Footer columns — the Figma's four-column layout, but every href points at a
 * page that exists. Its original labels (Careers, Blog, Press, Pricing, API
 * Reference, Status Page, Community…) had no destinations, so they are mapped
 * onto real sections rather than shipped as dead links.
 */
export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Products",
    links: [
      { href: "/connected-banking", label: "Connected Banking" },
      { href: "/solutions#payments-collections", label: "Payments & Collections" },
      { href: "/solutions#reconciliation", label: "Reconciliation Engine" },
      { href: "/solutions#virtual-accounts", label: "Virtual Accounts" },
      { href: "/solutions#governance", label: "Access & Governance" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { href: "/solutions", label: "Full Ecosystem" },
      { href: "/industries#banks", label: "For Banks" },
      { href: "/industries#nbfcs", label: "For NBFCs" },
      { href: "/industries#smes", label: "For SMEs & Enterprises" },
      { href: "/industries#fintech", label: "For Fintechs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/services", label: "Services" },
      { href: "/services#partner-program", label: "Partner Program" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

