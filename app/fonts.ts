import { Schibsted_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";

// Display — engineered grotesk voice for headlines and stat numerals.
export const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: "600", // single display weight — headings, stats, wordmarks
  variable: "--font-display",
  display: "swap",
});

// Body/UI workhorse. Tabular figures are enabled per-element via `tnum`
// (stats, counters) so numerals never jitter during count-up.
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

// Infrastructure accent — eyebrows, stat labels, nav numerals. ≤0.8rem only.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});
