/**
 * Client / partner trust marks.
 *
 * The supplied PNGs are white-on-transparent (they were built for a dark
 * theme and are invisible on this light canvas), so `Wordmark` renders each
 * one as a CSS mask and paints it with a design-system colour. That keeps the
 * real logo shapes while matching the institutional palette exactly, and the
 * same slot accepts licensed vector art later.
 *
 * TODO: client to confirm — supply licensed vector logos (SVG) for each mark.
 */
export interface ClientMark {
  name: string;
  /** White-on-transparent PNG used as a mask; falls back to a text wordmark. */
  logo?: string;
  /** Intrinsic aspect ratio, used to size the mask box. */
  ratio?: number;
  /**
   * Per-logo optical correction. The source PNGs crop differently — some fill
   * their canvas edge to edge, others carry padding — so a uniform box height
   * makes them read at visibly different weights. Tuned by eye on the trust
   * wall; adjust here rather than at any call site.
   */
  scale?: number;
}

export const CLIENTS: ClientMark[] = [
  { name: "HSBC", logo: "/logos/hsbc.png", ratio: 172 / 33, scale: 0.82 },
  { name: "Axis Bank", logo: "/logos/axis.png", ratio: 205 / 69, scale: 1 },
  { name: "IndusInd Bank", logo: "/logos/indus.png", ratio: 205 / 69, scale: 0.94 },
  // The supplied artwork reads "Aditya Birla Capital" (with the group tagline).
  // TODO: client to confirm this is the correct contracting entity.
  { name: "Aditya Birla Capital", logo: "/logos/aditya.png", ratio: 218 / 58, scale: 1.18 },
];
