/**
 * "The Bank Plugin" — LinkAPI's hero product: the add-on that puts a business's
 * bank account inside its accounting ERP (Tally today). Rendered by
 * /bank-plugin and by the homepage spotlight.
 *
 * SOURCES. Every product claim here is client-authored:
 *   • The bank-branded plugin portals LinkAPI runs — hsbc.linkapitech.com and
 *     indusind.linkapitech.com (URLs supplied by the client, 2026-08-27). The
 *     hero, highlights, value propositions, features and the four-step
 *     "How it works" are reproduced from the HSBC portal's homepage with only
 *     grammar closed up ("that traditional banking experience on Accounting
 *     Platform" → "that brings the banking experience onto your accounting
 *     platform"). Cited inline as `portal 2026-08`.
 *   • content/capabilities.ts — the nine functions the plugin exposes (Figma
 *     2026-08, page 31).
 *   • content/services.ts — the ERP list LinkAPI builds reconciliation plugins
 *     for.
 * The product NAME is the client's ("can be named as 'The Bank Plugin'",
 * 2026-08-27). Anything drafted rather than reproduced carries a
 * `TODO: client to confirm` and a row in CONTENT-TODO.md §2.
 */
import type { IconName } from "@/components/ui/Icon";

export const PLUGIN = {
  name: "The Bank Plugin",
  eyebrow: "The Bank Plugin",
  /**
   * Portal 2026-08: "Smart and Powerful Plugin that integrates banking features
   * on Tally". Split two-tone for the design shell; the words are the portal's.
   * TODO: client to confirm — the tightened phrasing.
   */
  headline: { lead: "Smart, powerful banking", accent: "inside your Tally." },
  /** Portal 2026-08, grammar closed up. */
  lead: "A next-generation banking solution that brings the banking experience onto your accounting platform. Auto reconciliation, vendor payments, account statements and balance checks — all within your ERP. It unifies banking with accounting, making the everyday lives of businesses seamless and simple.",
  cta: { label: "Book a demo", href: "/contact" },
  /** The client's own product-guide video, linked from the portal hero. */
  guide: { label: "Watch the product guide", href: "https://youtu.be/lqrhdLiG3Wc" },
  /** Portal 2026-08 closing line. */
  fit: "Fits in easily for MSME and large-enterprise markets — and helps customers focus on accounting rather than clerical tasks.",
  /**
   * The ERP the plugin ships for today. The portal registration form offers a
   * single ERP type (Tally) and the IndusInd onboarding guide calls it a Tally
   * add-on / TCP. TODO: client to confirm — whether Busy, Zoho, SAP, NetSuite
   * or Odoo builds of THIS plugin exist, or whether those are bespoke.
   */
  erpToday: "TallyPrime",
} as const;

/** Portal 2026-08 — "Highlights". */
export const PLUGIN_HIGHLIGHTS: string[] = [
  "Simple, automated bank statement reconciliation",
  "Initiate and track vendor payments",
  "Real-time transaction updates",
  "Fetch your bank account statement",
  "View your account balance",
];

export type Vignette = "balance" | "payments" | "reconcile" | "status";

export interface PluginFeature {
  title: string;
  body: string;
  icon: IconName;
  /** Which code-drawn UI snippet the feature card shows. */
  vignette: Vignette;
}

/** Portal 2026-08 — "Features of the Plugin". */
export const PLUGIN_FEATURES: PluginFeature[] = [
  {
    title: "Fetch the account balance and bank statement",
    body: "View the account balance and the bank statement for multiple accounts, without leaving the ERP.",
    icon: "scale",
    vignette: "balance",
  },
  {
    title: "Create and initiate vendor payments",
    body: "Initiate payments to your beneficiaries directly from Tally.",
    icon: "cash",
    vignette: "payments",
  },
  {
    title: "Automated bank statement reconciliation",
    body: "Save time and effort by reconciling the bank statement with a few clicks.",
    icon: "sync",
    vignette: "reconcile",
  },
  {
    title: "Real-time transaction updates",
    body: "Check the real-time status of every transaction initiated from the plugin.",
    icon: "bolt",
    vignette: "status",
  },
];

export interface PluginValue {
  title: string;
  icon: IconName;
}

/** Portal 2026-08 — "Value Propositions of Plugin". */
export const PLUGIN_VALUES: PluginValue[] = [
  { title: "‘Do-it-yourself’ registration and onboarding journey", icon: "user" },
  { title: "Directly installed on the customer’s accounting ERP", icon: "plug" },
  { title: "Unified banking and accounting experience", icon: "link" },
  { title: "Secured transaction process through OTP and authorised approvals", icon: "shield" },
  { title: "Reduced human intervention through automated payment and bank reconciliation", icon: "sync" },
];

export interface PluginStep {
  num: string;
  title: string;
  body: string;
  icon: IconName;
}

/** Portal 2026-08 — "How It Works". */
export const PLUGIN_STEPS: PluginStep[] = [
  {
    num: "01",
    title: "Register",
    body: "Register on the LinkAPI Tech portal with your details.",
    icon: "user",
  },
  {
    num: "02",
    title: "Install",
    body: "Download the plugin setup directly from the portal and install it on Tally.",
    icon: "layers",
  },
  {
    num: "03",
    title: "Log in",
    body: "Log in to the plugin with your registered credentials.",
    icon: "shield",
  },
  {
    num: "04",
    title: "Get started",
    body: "Link your bank account with Tally ERP and take advantage of every plugin feature.",
    icon: "bank",
  },
];

export interface PluginFaqItem {
  q: string;
  a: string;
}

/**
 * Drafted from facts on the portals (the registration form's fields, the OTP
 * step, the download-and-install flow) and from content/services.ts and
 * content/faq.ts. The portals link a FAQ PDF that was not available to read.
 * TODO: client to confirm — every answer, before publishing.
 */
export const PLUGIN_FAQ: PluginFaqItem[] = [
  {
    q: "Which ERP does The Bank Plugin work with?",
    a: "The plugin ships as an add-on for Tally today. LinkAPI also builds reconciliation plugins for Busy, Zoho, SAP, NetSuite and Odoo — talk to us about your ERP.",
  },
  {
    q: "How do I get the plugin?",
    a: "Register on your bank's LinkAPI portal, download the plugin setup from the portal, install it on Tally and log in with your registered credentials. Then link your bank account and you are ready to go.",
  },
  {
    q: "What do I need to register?",
    a: "Your name, company name, GST number, mobile number, email address, ERP type, state and ERP serial number. Registration is verified with an OTP sent to your mobile.",
  },
  {
    q: "How are payments kept secure?",
    a: "Every transaction initiated from the plugin is secured through OTP verification and authorised approvals, so nothing leaves your account without sign-off.",
  },
  {
    q: "Is there support after installation?",
    a: "Yes. Our ERP plugins sync and reconcile transactions continuously, and ongoing post-live support is available on demand through the Plugin Support channel.",
  },
];

/**
 * ILLUSTRATIVE SAMPLE DATA for the product mockups — a fictional company and
 * made-up figures that demonstrate the interface, exactly like
 * content/industries.ts MOCK_DATA. Nothing here is a real customer or a real
 * balance. TODO: client to confirm — whether real anonymised figures may be
 * shown instead (CONTENT-TODO §2).
 */
export const PLUGIN_MOCK = {
  company: "Meridian Traders Pvt. Ltd.",
  window: "TallyPrime — LinkAPI Bank Plugin",
  menu: ["Dashboard", "Bank balance", "Vendor payments", "Reconciliation", "Statements"],
  accounts: [
    { label: "Current A/c ··4821", balance: "₹42,18,650.00" },
    { label: "OD A/c ··1177", balance: "₹8,04,210.50" },
  ],
  payments: [
    { payee: "Arjun Textiles", amount: "₹1,25,000", status: "Success" },
    { payee: "Kaveri Logistics", amount: "₹48,300", status: "Processing" },
    { payee: "Nimbus Packaging", amount: "₹2,10,500", status: "Awaiting approval" },
  ],
  reconcile: { matched: 128, total: 131 },
  timeline: ["Initiated", "Approved", "Sent to bank", "Success"],
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   PER-BANK LANDING PAGES

   The plugin is sold to business customers through bank-branded LinkAPI
   portals, and each bank's onboarding, support desk and commercials genuinely
   differ — so each gets its own landing page at /bank-plugin/<slug>.

   Everything below was read off the banks' own live portals on 2026-09-07
   (cited `portal 2026-09`). Where a portal states nothing, the field is
   omitted rather than filled in from a sibling bank.
   ══════════════════════════════════════════════════════════════════════════ */

export interface SupportChannelLink {
  label: string;
  href: string;
  /** External links get target=_blank + the external glyph. */
  external?: boolean;
  note?: string;
}

export interface BankPluginPage {
  slug: string;
  /** Full bank name; mirrors content/banks.ts so /banks can never disagree. */
  bank: string;
  shortName: string;
  logo: string;
  logoScale: number;
  /** The bank-branded portal: register, download, log in. */
  portal: { url: string; host: string };
  /** Deep links into that portal, where the portal actually exposes them. */
  loginUrl?: string;
  /** One-line positioning for this bank's customers. */
  intro: string;
  /**
   * Published price, VERBATIM. Only Axis's portal states one; HSBC's and
   * IndusInd's show no price at all, so those pages must not imply this
   * figure applies to them.
   */
  price?: string;
  /** Product guide — a video on HSBC, a PDF on Axis, absent on IndusInd. */
  guide?: SupportChannelLink;
  /** Calendly demo booking — IndusInd's portal is the only one that has it. */
  demo?: SupportChannelLink;
  /** How a customer gets onboarded. Differs materially per bank. */
  steps: PluginStep[];
  /** A one-line summary of the onboarding route, for the steps section lead. */
  stepsLead: string;
  support: {
    email: string;
    phone: string;
    phoneHref: string;
    /** IndusInd publishes desk hours; the others do not. */
    hours?: string;
    /** Who answers, when the portal says so. */
    desk?: string;
    links: SupportChannelLink[];
    /** IndusInd's ticket form exposes a category list. */
    categories?: string[];
  };
  meta: { title: string; description: string };
}

/** Axis and HSBC share the portal-registration route (portal 2026-09). */
const PORTAL_STEPS: PluginStep[] = PLUGIN_STEPS;

/**
 * IndusInd onboards through the bank's own net banking, NOT the LinkAPI
 * portal — reproduced from the client's one-page process flow published at
 * indusind.linkapitech.com/documents/OnePage_Process_Flow_Indus_pdf_new.jpg
 * (portal 2026-09).
 */
const INDUSDIRECT_STEPS: PluginStep[] = [
  {
    num: "01",
    title: "Log in to IndusDirect",
    body: "Sign in to IndusDirect, IndusInd Bank's business net banking, to begin Tally registration.",
    icon: "bank",
  },
  {
    num: "02",
    title: "Register for Tally integration",
    body: "Open ERP Plugin Registration, fill in the required details and verify with the OTP sent to your registered mobile number.",
    icon: "shield",
  },
  {
    num: "03",
    title: "Download the TCP",
    body: "LinkAPI emails your registered address with the plugin download. Use the link or the attachment to get the TCP file.",
    icon: "layers",
  },
  {
    num: "04",
    title: "Install it in Tally",
    body: "Install the TCP in Tally ERP, then log in with your registered credentials to link your account.",
    icon: "plug",
  },
];

export const BANK_PLUGIN_PAGES: BankPluginPage[] = [
  {
    slug: "axis",
    bank: "Axis Bank",
    shortName: "Axis",
    logo: "/assets/banks/axis.svg",
    logoScale: 0.95,
    /**
     * NOTE THE HOST. The client supplied `axis.linkapitech.com`
     * (2026-08-27), which does NOT resolve — verified 2026-09-07 from two
     * public resolvers, and a request to the shared host with that Host
     * header falls through to the HSBC vhost. The live Axis portal is
     * `axisbank.linkapitech.com`, which returns 200 and carries Axis's own
     * support mailbox. TODO: client to confirm the canonical host, and
     * whether `axis.linkapitech.com` should be made to redirect.
     */
    portal: { url: "https://axisbank.linkapitech.com/", host: "axisbank.linkapitech.com" },
    loginUrl: "https://axisbank.linkapitech.com/login",
    intro:
      "Axis Bank business customers can register for the plugin on the Axis portal, install it on Tally and start banking from inside the ledger.",
    /** Portal 2026-09, verbatim: "Price : ₹ 5000.00 + GST". */
    price: "₹5,000 + GST",
    guide: {
      label: "Product guide (PDF)",
      href: "https://axisbank.linkapitech.com/documents/Product-guide.pdf",
      external: true,
    },
    steps: PORTAL_STEPS,
    stepsLead:
      "Registration happens on the Axis plugin portal — you need your GST number and Tally serial number to hand.",
    support: {
      email: "support.axisbank@linkapitech.com",
      // Displayed on the portal footer. Its own tel: href is a placeholder
      // ("1-062-109-9222"), so the href here is built from the shown number.
      // TODO: client to confirm — lib/site.ts lists +91-9318373476 for
      // "Plugin Support & Inquiries"; the portals all publish this one.
      phone: "+91 75696 10750",
      phoneHref: "tel:+917569610750",
      links: [
        {
          label: "Raise a support query",
          href: "mailto:support.axisbank@linkapitech.com?subject=Support%20Query%20about%20the%20Tally%20Plugin",
          note: "Opens an email to the Axis plugin support desk.",
        },
        { label: "Portal login", href: "https://axisbank.linkapitech.com/login", external: true },
      ],
    },
    meta: {
      title: "The Bank Plugin for Axis Bank | Banking Inside Tally | LinkAPI Tech",
      description:
        "Axis Bank customers can run banking inside Tally with The Bank Plugin — balances, statements, vendor payments and automated reconciliation. Register on the Axis plugin portal.",
    },
  },
  {
    slug: "hsbc",
    bank: "HSBC",
    shortName: "HSBC",
    logo: "/assets/banks/hsbc.svg",
    logoScale: 0.7,
    portal: { url: "https://hsbc.linkapitech.com/", host: "hsbc.linkapitech.com" },
    loginUrl: "https://hsbc.linkapitech.com/login",
    intro:
      "HSBC business customers can register for the plugin on the HSBC portal, install it on Tally and run payments and reconciliation without leaving the ledger.",
    guide: {
      label: "Watch the product guide",
      href: "https://youtu.be/lqrhdLiG3Wc",
      external: true,
    },
    steps: PORTAL_STEPS,
    stepsLead:
      "Registration happens on the HSBC plugin portal — you need your GST number and Tally serial number to hand.",
    support: {
      email: "support.hsbc@linkapitech.com",
      phone: "+91 75696 10750",
      phoneHref: "tel:+917569610750",
      links: [
        {
          label: "Help & support form",
          href: "https://forms.gle/z5VfHqaF5c4aLWjz7",
          external: true,
          note: "The HSBC portal routes support requests through this form.",
        },
        {
          label: "Frequently asked questions (PDF)",
          href: "https://hsbc.linkapitech.com/training/faq.pdf",
          external: true,
        },
        { label: "Portal login", href: "https://hsbc.linkapitech.com/login", external: true },
      ],
    },
    meta: {
      title: "The Bank Plugin for HSBC | Banking Inside Tally | LinkAPI Tech",
      description:
        "HSBC customers can run banking inside Tally with The Bank Plugin — balances, statements, vendor payments and automated reconciliation. Register on the HSBC plugin portal.",
    },
  },
  {
    slug: "indusind",
    bank: "IndusInd Bank",
    shortName: "IndusInd",
    logo: "/assets/banks/indusind.svg",
    logoScale: 0.96,
    portal: { url: "https://indusind.linkapitech.com/", host: "indusind.linkapitech.com" },
    loginUrl: "https://indusind.linkapitech.com/login",
    intro:
      "IndusInd Bank business customers register through IndusDirect, then install the plugin on Tally — with the bank's own service desk behind it.",
    demo: {
      label: "Book a demo",
      href: "https://calendly.com/link-api-tech/indusind-plugin-demo",
      external: true,
    },
    steps: INDUSDIRECT_STEPS,
    stepsLead:
      "IndusInd registration starts inside IndusDirect, the bank's business net banking — not on the LinkAPI portal.",
    support: {
      email: "support.indusind@linkapitech.com",
      phone: "+91 75696 10750",
      phoneHref: "tel:+917569610750",
      /** Portal 2026-09, /support. */
      hours:
        "9:30am to 6:00pm, Monday to Saturday — excluding 2nd and 4th Saturdays, public holidays and other non-working days. Queries raised outside these hours are addressed on the next business day.",
      desk:
        "IndusInd Bank's Centralised Service Desk (CSD) also handles service queries for the Connected Banking solution on Tally, alongside LinkAPI Tech.",
      links: [
        {
          label: "Raise a support ticket",
          href: "https://indusind.linkapitech.com/support",
          external: true,
          note: "The IndusInd portal has its own ticket form with a request ID.",
        },
        { label: "Portal login", href: "https://indusind.linkapitech.com/login", external: true },
      ],
      categories: [
        "Check Balance",
        "Vendor Payment",
        "Beneficiary Management",
        "Statement & Reconciliation",
        "Registration Management",
        "e-Collection",
        "Others",
      ],
    },
    meta: {
      title: "The Bank Plugin for IndusInd Bank | Banking Inside Tally | LinkAPI Tech",
      description:
        "IndusInd Bank customers can run banking inside Tally with The Bank Plugin. Register through IndusDirect, install the TCP and reconcile automatically.",
    },
  },
];

export const BANK_PLUGIN_SLUGS = BANK_PLUGIN_PAGES.map((b) => b.slug);
export const getBankPlugin = (slug: string) =>
  BANK_PLUGIN_PAGES.find((b) => b.slug === slug);
