import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SkipLink } from "@/components/chrome/SkipLink";
import { SiteFooter } from "@/components/chrome/SiteFooter";

/**
 * Inner-page layout — lightweight: floating pill header, native CSS smooth
 * scroll, no Lenis. No top padding: the header floats, and each page's hero
 * runs full-bleed underneath it with its own clearance.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <SiteHeader variant="page" />
      {/* tabIndex -1 so the skip link actually moves focus here */}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
