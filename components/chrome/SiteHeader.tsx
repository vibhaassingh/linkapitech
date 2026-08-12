"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NAV, CTA } from "@/lib/site";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  /** kept for the two layouts' call sites; the header is identical on both */
  variant?: "marketing" | "page";
}

/**
 * Floating pill header (Figma Purple). A white rounded bar inset from the top
 * edge, sitting over whatever the page's hero is — plum gradient or lavender
 * wash. Gains depth once scrolled. No mega menu: every nav item is a page.
 */
export function SiteHeader(_props: SiteHeaderProps) {
  const [stuck, setStuck] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 md:pt-5">
        <div
          className={cn(
            "mx-auto flex h-[60px] w-full max-w-[1300px] items-center justify-between gap-6 rounded-[16px] bg-surface pl-5 pr-3 transition-shadow duration-menu md:h-[64px] md:pl-7 md:pr-4",
            stuck || mobileOpen ? "shadow-menu" : "shadow-card",
          )}
        >
          <Link
            href="/"
            className="rounded-sm text-plum-950"
            aria-label="LinkAPI Tech — home"
          >
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 lg:flex"
          >
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-sm py-1 text-[14.5px] transition-colors duration-ui",
                    active
                      ? "font-semibold text-violet-text"
                      : "font-medium text-ink-2 hover:text-plum-700",
                  )}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-pill bg-violet-text"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={CTA.href}
              className="hidden items-center rounded-pill bg-plum-600 px-6 py-2.5 text-[14px] font-semibold text-ink-inv transition-colors duration-ui hover:bg-violet-600 lg:inline-flex"
            >
              {CTA.label}
            </Link>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-pill text-plum-900 lg:hidden"
            >
              <Burger open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      {open ? (
        <path
          d="M4 4l12 12M16 4L4 16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M2.5 6h15M2.5 10h15M2.5 14h15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
