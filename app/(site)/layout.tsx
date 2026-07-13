import { SiteHeader } from "@/components/chrome/SiteHeader";
import { FooterMarquee } from "@/components/chrome/FooterMarquee";
import { SiteFooter } from "@/components/chrome/SiteFooter";

/**
 * Inner-page layout — lightweight (INTERACTIONS §0): standard sticky header,
 * native CSS smooth scroll, no Lenis/GSAP/cursor/preloader.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader variant="page" />
      <main className="pt-20">{children}</main>
      <FooterMarquee />
      <SiteFooter />
    </>
  );
}
