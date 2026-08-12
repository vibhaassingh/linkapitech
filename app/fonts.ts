import { Poppins, IBM_Plex_Mono } from "next/font/google";

// Single-family discipline (Figma Purple): Poppins everywhere.
// 700 = display headlines, 600 = headings/buttons/stat numerals,
// 500 = labels/nav, 400 = body. Four files total — the perf budget
// allows exactly four font files on the home route.
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Code terminals only (How We Work / SDK cards). Never for UI text.
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});
