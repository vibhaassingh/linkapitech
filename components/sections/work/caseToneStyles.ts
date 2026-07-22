import type { CaseTone } from "@/content/cases";

/**
 * Light institutional tints per case tone — replaces the old design's dark
 * TONE_BG gradients. Subtle navy/steel washes, always AA-safe under ink text.
 */
export const CASE_TONES: Record<CaseTone, { bg: string; accent: string }> = {
  lime: { bg: "var(--navy-050)", accent: "var(--navy-600)" },
  ink: { bg: "var(--surface-2)", accent: "var(--navy-900)" },
  slate: { bg: "var(--navy-100)", accent: "var(--navy-700)" },
  violet: { bg: "var(--navy-050)", accent: "var(--navy-600)" },
};
