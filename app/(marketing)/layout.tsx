import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { Preloader } from "@/components/motion/Preloader";
import { Cursor } from "@/components/motion/Cursor";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { FooterMarquee } from "@/components/chrome/FooterMarquee";
import { SiteFooter } from "@/components/chrome/SiteFooter";

/**
 * Marketing (homepage) layout — the ONLY place the heavy motion stack lives
 * (INTERACTIONS §0): Lenis smooth scroll, custom cursor, preloader.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <Cursor />
      <SiteHeader variant="marketing" />
      <main>{children}</main>
      <FooterMarquee />
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
