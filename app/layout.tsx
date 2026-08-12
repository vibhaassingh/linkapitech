import type { Metadata, Viewport } from "next";
import "./globals.css";
// Chrome-only structural CSS (header ramp, footer curtain, sheet, view
// transitions). Imported AFTER the design system so it can layer on top of it
// without !important; see the file header for why it is not in globals.css.
// Relative, not "@/…": the tsconfig alias resolves for CSS too, but a plain
// path takes the resolver out of the question for a global stylesheet whose
// ORDER is load-bearing.
import "../components/chrome/chrome.css";
import { poppins, plexMono } from "./fonts";
import { metadataBase } from "@/lib/metadata";
import { SITE } from "@/lib/site";
import { Analytics } from "@/lib/analytics";
import { CursorGlow } from "@/components/motion/CursorGlow";
import { Magnetic } from "@/components/motion/Magnetic";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${SITE.legalName} | BFSI API Integration & Technology Services`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "API integration",
    "bank connectivity",
    "transaction reconciliation",
    "BFSI technology",
    "data integration",
    "IT consulting",
    "Ghaziabad",
  ],
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#250D29",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        {/* The footer curtain needs <main> to be a stacking context so it can
            cover the sticky footer, and `.cursor-glow` is `fixed; z-index: 0`
            — it would be buried underneath. This wrapper lifts the decorative
            glow back above main. It is empty and zero-height, so it adds no
            box and cannot shift layout. See chrome.css §3. */}
        <div className="chrome-glow-layer">
          <CursorGlow />
        </div>
        <Magnetic />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
