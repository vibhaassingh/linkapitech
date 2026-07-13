import { Onest, Instrument_Serif } from "next/font/google";

// UI + body sans. Headings render at weight 500 (confident-but-light).
export const onest = Onest({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-onest",
  display: "swap",
});

// Editorial accent — every sitewide usage is italic 400 (roman loaded for safety).
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument-serif",
  display: "swap",
});
