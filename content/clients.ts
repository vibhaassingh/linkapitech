/**
 * Client / partner trust marks shown in the homepage marquee.
 *
 * Logos are the brands' own colour marks, extracted from the client-authored
 * Figma (2026-08) and served as WebP. Colour (not a monochrome mask) is what
 * the Figma specifies — bank marks read as themselves on the white band.
 *
 * TODO: client to confirm — supply licensed vector logos (SVG) for each mark,
 * and confirm written usage rights for every brand shown. Note these marks sit
 * under "Trusted by India's leading banks and enterprises", which asserts a
 * customer relationship, so each one needs the brand's actual permission — a
 * stronger bar than the ERP marks below, which only assert interoperability.
 */
export interface ClientMark {
  name: string;
  /** Colour logo. Falls back to a text wordmark when absent. */
  logo?: string;
  /** Intrinsic aspect ratio, used to size the image box. */
  ratio?: number;
  /**
   * Per-logo optical correction. The source crops differ — some marks fill
   * their box edge to edge, others carry padding — so a uniform height makes
   * them read at visibly different weights. Tune here, never at a call site.
   */
  scale?: number;
}

/**
 * Three marks (HSBC, IndusInd, Axis) are now licensed vectors shared with the
 * /banks pages; the other four remain Figma-extracted rasters. `ratio` is the
 * SVG's own intrinsic ratio — its root width/height where it declares them,
 * else the viewBox — because that, not the viewBox, is what the browser uses to
 * fit the mark inside the marquee's 150×40 object-contain box.
 *
 * The vectors' bounding boxes differ from the raster crops (Axis carries ~10%
 * vertical padding inside its viewBox; HSBC's is tight), so `scale` was re-tuned
 * against the four fixed rasters: the anchor is wordmark cap-height (~11–15px
 * across the row) with symbol height kept near RBL's.
 */
export const CLIENTS: ClientMark[] = [
  // Wordmark-dominant lockup: at scale 1 its "HSBC" caps render ~26px, roughly
  // double everyone else's. 0.70 puts the hexagon at ~28px, level with RBL's
  // symbol, and the caps at ~18px.
  { name: "HSBC", logo: "/assets/banks/hsbc.svg", ratio: 315.9 / 85, scale: 0.7 },
  { name: "HDFC Bank", logo: "/logos/hdfc-color.webp", ratio: 270 / 49, scale: 0.92 },
  { name: "Jio Financial Services", logo: "/logos/jio-color.webp", ratio: 207 / 92, scale: 1 },
  { name: "Shemaroo", logo: "/logos/shemaroo-color.webp", ratio: 212 / 108, scale: 1 },
  // 9.2:1 wordmark, so width-limited at 150px. 0.96 lifts it off the box edge
  // and brings its caps (~15px) down toward Axis/RBL.
  { name: "IndusInd Bank", logo: "/assets/banks/indusind.svg", ratio: 425 / 46, scale: 0.96 },
  // 0.95 trims the tall "A" symbol to ~33px, between RBL's 29 and Jio's 40,
  // and pulls the mark back from the 150px box edge.
  { name: "Axis Bank", logo: "/assets/banks/axis.svg", ratio: 300 / 78, scale: 0.95 },
  { name: "RBL Bank", logo: "/logos/rbl-color.webp", ratio: 295 / 123, scale: 1 },
];

/**
 * ERP platforms LinkAPI's plugins integrate with (Figma 2026-08). These marks
 * state a factual integration rather than a customer relationship, so they are
 * ordinary nominative use — but the section heading must stay "ERPs we
 * integrate with" and never imply partnership or endorsement.
 */
export interface ErpMark {
  name: string;
  logo: string;
  ratio: number;
  scale?: number;
}

export const ERPS: ErpMark[] = [
  { name: "TallyPrime", logo: "/erps/tallyprime.webp", ratio: 236 / 160, scale: 1 },
  { name: "Busy", logo: "/erps/busy.webp", ratio: 153 / 92, scale: 0.88 },
  { name: "Oracle NetSuite", logo: "/erps/netsuite.webp", ratio: 172 / 59, scale: 0.95 },
  { name: "Zoho", logo: "/erps/zoho.webp", ratio: 187 / 87, scale: 0.88 },
  { name: "SAP", logo: "/erps/sap.webp", ratio: 204 / 106, scale: 0.8 },
  { name: "Odoo", logo: "/erps/odoo.webp", ratio: 160 / 54, scale: 0.9 },
];
