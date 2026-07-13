/**
 * Real, defensible LinkAPI trust statistics (CONTENT-MAPPING §2.3 About page).
 * These are the company's own published numbers — reuse verbatim, do not inflate.
 */

export interface Stat {
  value: string; // display string (may contain +, ₹, Cr, etc.)
  count?: number; // numeric target for the count-up animation (optional)
  suffix?: string; // e.g. "+", "L+", "Cr"
  prefix?: string; // e.g. "₹"
  label: string;
}

/** The four headline stats used in the footer marquee ticker (HOMEPAGE-SECTIONS §8). */
export const MARQUEE_STATS: Stat[] = [
  { value: "5000+", count: 5000, suffix: "+", label: "API implementations" },
  { value: "45,000+", count: 45000, suffix: "+", label: "Customers served" },
  { value: "₹20,000 Cr", prefix: "₹", count: 20000, suffix: " Cr", label: "Processed / month" },
  { value: "10L+", count: 10, suffix: "L+", label: "Transactions / month" },
];

/** Wider stat set (About "Performance" + intro cards) for count-up grids. */
export const PERFORMANCE_STATS: Stat[] = [
  { value: "45,000+", count: 45000, suffix: "+", label: "No. of customers" },
  { value: "70,000+", count: 70000, suffix: "+", label: "Transacting current accounts" },
  { value: "10L+", count: 10, suffix: "L+", label: "Transactions / month" },
  { value: "₹20,000 Cr", prefix: "₹", count: 20000, suffix: " Cr", label: "Volume processed / month" },
];

/** About-page intro stat cards (CONTENT-MAPPING §2.3, verbatim labels). */
export const IMPACT_STATS: Stat[] = [
  {
    value: "5000+",
    count: 5000,
    suffix: "+",
    label: "API implementations across BFSI, Fintech, Agritech & Edutech domains",
  },
  {
    value: "2500+",
    count: 2500,
    suffix: "+",
    label: "Reconciliation solutions delivered, driving process efficiency",
  },
  {
    value: "100+",
    count: 100,
    suffix: "+",
    label: "Portals built for external and internal clients",
  },
  {
    value: "1000+",
    count: 1000,
    suffix: "+",
    label: "Active partners across developers, ERP & plugin resellers, and CAs",
  },
];

/** Short trust line shown above the hero logo strip (adapted from real bank clients). */
export const TRUST_LINE = "Trusted by leading BFSI institutions";
