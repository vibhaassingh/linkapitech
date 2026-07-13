"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { useLenis } from "@/components/motion/SmoothScrollProvider";
import { SECTIONS, NAV_LINKS, CTA } from "@/lib/site";

interface NavItem {
  href: string;
  num: string;
  label: string;
}

/**
 * Sticky header — the simplified stand-in for the reference Thread Nav
 * (PAGES-AND-ROUTING §4.1). Numbered section links on the homepage; page links
 * elsewhere. Gains a solid/blur background past 60px of scroll (the `.is-stuck`
 * behavior). Full mobile drawer below the lg breakpoint.
 */
export function SiteHeader({ variant = "marketing" }: { variant?: "marketing" | "page" }) {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    const on = () => setStuck(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const links: NavItem[] =
    variant === "marketing"
      ? SECTIONS.map((s) => ({ href: `#${s.id}`, num: s.num, label: s.label }))
      : NAV_LINKS.map((l, i) => ({
          href: l.href,
          num: String(i + 1).padStart(2, "0"),
          label: l.label,
        }));

  const onAnchor = (href: string) => (e: React.MouseEvent) => {
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -80 });
    else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[300] transition-all duration-500 ease-brand",
        stuck ? "border-b border-line bg-bg/85 py-3 backdrop-blur-md" : "py-5",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-10">
        <Link href="/" className="font-serif text-2xl italic leading-none text-ink">
          LinkAPI
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a
                key={l.href}
                href={l.href}
                onClick={onAnchor(l.href)}
                className="group inline-flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                <span className="font-serif text-[11px] italic text-ink-3">{l.num}</span>
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="group inline-flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                <span className="font-serif text-[11px] italic text-ink-3">{l.num}</span>
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Button href={CTA.href} className="px-5 py-3 text-[13px]" magnetic>
              {CTA.label}
            </Button>
          </div>
          <button
            ref={triggerRef}
            className="grid h-11 w-11 place-items-center rounded-pill border border-line text-ink lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu open={open} onClose={closeMenu} links={links} />
    </header>
  );
}
