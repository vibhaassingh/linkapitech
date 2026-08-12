/**
 * LinkAPI trust statistics.
 *
 * Source: client-authored Figma "LinkAPI Website" (2026-08) — the numbers there
 * supersede the older set published on linkapitech.com (which read 45,000+
 * customers and ₹20,000 Cr/month). Reuse verbatim; do not inflate.
 */

export interface Stat {
  value: string; // display string (may contain +, ₹, Cr, etc.)
  count?: number; // numeric target for the count-up animation (optional)
  suffix?: string; // e.g. "+", "Cr+", "X"
  prefix?: string; // e.g. "₹"
  label: string;
}

/** Homepage "By the Numbers" — the four headline figures (Figma 2026-08). */
export const MARQUEE_STATS: Stat[] = [
  {
    value: "70,000+",
    count: 70000,
    suffix: "+",
    label: "New businesses onboarded by partner banks",
  },
  {
    value: "₹60,000 Cr+",
    prefix: "₹",
    count: 60000,
    suffix: " Cr+",
    label: "Total monthly transaction volume processed",
  },
  { value: "5X", count: 5, suffix: "X", label: "Increase in average monthly balance per business" },
  { value: "300+", count: 300, suffix: "+", label: "Clients supported" },
];

/** The pill under the stat cards (Figma 2026-08). */
export const LIVE_PILL: { value: string; label: string }[] = [
  { value: "35+", label: "APIs Integrated" },
  { value: "5+", label: "Banks Live" },
];

/** About "Our Track Record" — delivery volume (Figma 2026-08). */
export const IMPACT_STATS: Stat[] = [
  {
    value: "5,000+",
    count: 5000,
    suffix: "+",
    label: "API Implementations",
    // Across BFSI, Fintech, Agritech and Edutech sectors.
  },
  {
    value: "2,500+",
    count: 2500,
    suffix: "+",
    label: "Integration Solutions",
  },
  {
    value: "100+",
    count: 100,
    suffix: "+",
    label: "Portals Built",
  },
  {
    value: "1,000+",
    count: 1000,
    suffix: "+",
    label: "Active Partners",
  },
];

/** Supporting body copy for the track-record cards (Figma 2026-08). */
export const IMPACT_NOTES: Record<string, string> = {
  "API Implementations": "Across BFSI, Fintech, Agritech and Edutech sectors.",
  "Integration Solutions": "Solving reconciliation and process-efficiency problems.",
  "Portals Built": "Serving internal and external enterprise clients.",
  "Active Partners":
    "Across developers, ERP resellers, plugin resellers, chartered accountants and cloud resellers.",
};

/** Wide gradient bar beside the track record (Figma 2026-08). */
export const GROWTH_STATS: Stat[] = [
  { value: "70,000+", count: 70000, suffix: "+", label: "Businesses Onboarded" },
  { value: "₹60,000 Cr+", prefix: "₹", count: 60000, suffix: " Cr+", label: "Monthly Volume" },
  { value: "5X", count: 5, suffix: "X", label: "Balance Growth" },
];

/** Trust line above the homepage logo marquee (Figma 2026-08). */
export const TRUST_LINE = "Trusted by India's leading banks and enterprises";
