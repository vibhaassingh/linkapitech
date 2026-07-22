import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";

/**
 * Marketing (homepage) layout — the ONLY place the heavy motion stack lives:
 * Lenis smooth scroll (and, later, the lazy Three.js hero). No preloader, no
 * custom cursor — the institutional direction opens on content immediately.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <SiteHeader variant="marketing" />
      <main>{children}</main>
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
