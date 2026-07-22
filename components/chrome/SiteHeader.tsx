"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { CTA } from "@/lib/site";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  /** kept for the two layouts' call sites; the institutional header is identical on both */
  variant?: "marketing" | "page";
}

/**
 * Fixed institutional header. Transparent-on-canvas at rest; solid surface
 * with a bottom hairline once scrolled past 24px or while a mega panel is
 * open. All mega menu behavior lives in <MegaMenu>.
 */
export function SiteHeader(_props: SiteHeaderProps) {
  const [stuck, setStuck] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = stuck || panelOpen || mobileOpen;

  return (
    <>
    {/* backdrop-filter creates a fixed-position containing block, so it must be
        OFF whenever a fixed child (mega panel) is open — `solid` guarantees that.
        The mobile sheet renders outside <header> for the same reason. */}
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[72px] transition-colors duration-menu",
        solid
          ? "border-b border-line-soft bg-surface"
          : "border-b border-transparent bg-canvas/80 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="rounded-sm font-display text-[19px] font-bold tracking-tight text-navy-900"
        >
          LinkAPI<span className="ml-1 font-semibold text-steel">Tech</span>
        </Link>

        <MegaMenu onOpenChange={setPanelOpen} />

        <div className="flex items-center gap-3">
          <Link
            href={CTA.href}
            className="hidden items-center gap-2 rounded-sm bg-navy-900 px-5 py-2.5 text-[13.5px] font-medium text-ink-inv transition-colors duration-ui hover:bg-navy-700 lg:inline-flex"
          >
            {CTA.label}
          </Link>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-sm text-ink lg:hidden"
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
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
