"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useScrollLock } from "@/components/motion/SmoothScrollProvider";
import { CONTACT } from "@/lib/site";

interface NavItem {
  href: string;
  num: string;
  label: string;
}

/** Full-screen numbered drawer (HOMEPAGE-SECTIONS global chrome). */
export function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: NavItem[];
}) {
  useScrollLock(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    // Move focus into the dialog.
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className={cn(
        "fixed inset-0 z-[400] bg-ink text-white transition-[opacity,visibility] duration-500 ease-brand",
        open ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl italic">LinkAPI</span>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-pill border border-white/20 text-white"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
          {links.map((l, i) => {
            const cls =
              "text-[clamp(34px,9vw,64px)] leading-none tracking-tight transition-colors group-hover:text-accent " +
              (i % 2 ? "font-serif italic" : "font-sans font-medium");
            const inner = (
              <>
                <span className="font-serif text-sm italic text-white/55">{l.num}</span>
                <span className={cls}>{l.label}</span>
              </>
            );
            return l.href.startsWith("#") ? (
              <a key={l.href} href={l.href} onClick={onClose} className="group flex items-baseline gap-4 py-2">
                {inner}
              </a>
            ) : (
              <Link key={l.href} href={l.href} onClick={onClose} className="group flex items-baseline gap-4 py-2">
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1.5 border-t border-white/10 pt-6 text-sm text-white/70">
          <span className="inline-flex items-center gap-2">
            <span className="pulse-dot" /> Plugin support &amp; inquiries
          </span>
          <a href={`mailto:${CONTACT.primaryEmail}`} className="text-white hover:text-accent">
            {CONTACT.primaryEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
