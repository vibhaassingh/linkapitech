import type { Metadata, Viewport } from "next";
import "./globals.css";
import { schibsted, inter, plexMono } from "./fonts";
import { metadataBase } from "@/lib/metadata";
import { SITE } from "@/lib/site";
import { Analytics } from "@/lib/analytics";

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
  themeColor: "#0A1F44",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${schibsted.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
