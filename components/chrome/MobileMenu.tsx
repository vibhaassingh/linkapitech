"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/components/motion/SmoothScrollProvider";
import { SOLUTIONS_MENU, WORK_MENU, NAV_PAGES, CTA, CONTACT } from "@/lib/site";
import { cn } from "@/lib/cn";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile navigation sheet (<1024px). role=dialog + aria-modal,
 * focus moved in on open and restored on close, Tab cycles inside, Esc
 * closes, body scroll locked while open. Solutions/Work render as
 * disclosure accordions.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useScrollLock(open);

  // Route change closes.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Focus in on open; restore on close; Esc + simple focus cycle.
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && sheet) {
        const focusables = sheet.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      hidden={!open}
      className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-canvas lg:hidden"
    >
      <nav aria-label="Mobile primary" className="flex min-h-full flex-col px-6 pb-10 pt-4">
        <Disclosure label="Solutions">
          {SOLUTIONS_MENU.flatMap((col) => col.links).map((link) => (
            <MobileLink key={link.href} href={link.href} label={link.label} />
          ))}
        </Disclosure>

        <Disclosure label="Work">
          {WORK_MENU.map((link) => (
            <MobileLink key={link.href} href={link.href} label={link.label} />
          ))}
          <MobileLink href="/work" label="All work →" />
        </Disclosure>

        {NAV_PAGES.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="border-b border-line-soft py-4 font-display text-[17px] font-semibold text-ink"
          >
            {p.label}
          </Link>
        ))}
        <Link
          href="/contact"
          className="border-b border-line-soft py-4 font-display text-[17px] font-semibold text-ink"
        >
          Contact
        </Link>

        <Link
          href={CTA.href}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-sm bg-navy-900 px-6 py-4 text-[15px] font-medium text-ink-inv"
        >
          {CTA.label}
        </Link>

        <div className="mt-10">
          <p className="eyebrow mb-3">Reach us</p>
          {CONTACT.channels.map((ch) => (
            <p key={ch.phone} className="mb-2 text-sm text-ink-2">
              <a href={ch.phoneHref} className="tnum font-medium text-ink">
                {ch.phone}
              </a>
              {" · "}
              <a href={`mailto:${ch.email}`} className="break-all">
                {ch.email}
              </a>
            </p>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = `mobile-group-${label.toLowerCase()}`;
  return (
    <div className={cn("acc-row border-b border-line-soft", open && "is-open")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left font-display text-[17px] font-semibold text-ink"
      >
        {label}
        <span
          aria-hidden="true"
          className={cn("text-steel transition-transform duration-ui", open && "rotate-45")}
        >
          +
        </span>
      </button>
      <div id={id} className="acc-panel">
        <div className="acc-panel-min">
          <div className="acc-inner flex flex-col pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-sm px-1 py-2.5 text-[15px] text-ink-2">
      {label}
    </Link>
  );
}
