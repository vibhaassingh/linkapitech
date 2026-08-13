import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SkipLink } from "@/components/chrome/SkipLink";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { RouteTransition } from "@/components/chrome/RouteTransition";

/**
 * Marketing (homepage) layout — the ONLY place the heavy motion stack lives:
 * Lenis smooth scroll (and, later, the lazy Three.js hero). No preloader, no
 * custom cursor — the institutional direction opens on content immediately.
 *
 * `.chrome-main` is the other half of the footer curtain: it makes <main> the
 * opaque, elevated layer that the sticky footer is revealed from under. It
 * sets no size, margin or offset, so it cannot shift layout.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <SkipLink />
      <SiteHeader variant="marketing" />
      {/* tabIndex -1 so the skip link actually moves focus here */}
      <main id="main" tabIndex={-1} className="chrome-main">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
