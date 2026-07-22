import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";

/**
 * Inner-page layout — lightweight: standard fixed header, native CSS smooth
 * scroll, no Lenis/GSAP. Top padding clears the 72px fixed header.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader variant="page" />
      <main className="pt-[72px]">{children}</main>
      <SiteFooter />
    </>
  );
}
