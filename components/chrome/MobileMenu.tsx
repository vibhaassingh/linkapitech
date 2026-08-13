"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";
import { useScrollLock } from "@/components/motion/SmoothScrollProvider";
import { NAV, CTA, CONTACT } from "@/lib/site";
import { cn } from "@/lib/cn";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Mobile navigation sheet (<1024px). Flat list — the Figma nav has no
 * sub-levels, so the accordions are gone. Keeps the a11y scaffolding:
 * role=dialog + aria-modal, focus moved in on open and restored on close,
 * Tab cycles inside, Esc closes, scroll locked while open.
 *
 * MOTION (chrome.css §4) is attached entirely through `data-open` and a
 * per-row `--row` index — no extra state, no extra effect, and nothing in the
 * scaffolding above changed: the dialog is still MOUNTED with `hidden`, which
 * is what lets the enter be a restartable `animation` rather than a
 * transition. The scrim is a sibling, not a child, so it can never appear in
 * the focus-trap's `a, button` query or become the element that opening the
 * sheet focuses.
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

  // Focus in on open; restore on close; Esc + focus cycle.
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
    <>
      {/* Decorative backdrop — blurs the strip of page still visible around the
          floating pill while the sheet is open. Never focusable, never
          clickable: the dialog's asserted controls stay the only way out. */}
      <div
        aria-hidden="true"
        data-open={open ? "true" : "false"}
        className="chrome-scrim lg:hidden"
      />

      <div
        id="mobile-menu"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        hidden={!open}
        data-open={open ? "true" : "false"}
        className="chrome-sheet fixed inset-0 top-[76px] z-40 overflow-y-auto bg-canvas [scrollbar-width:thin] lg:hidden"
      >
        <nav
          aria-label="Mobile primary"
          className="flex min-h-full flex-col px-6 pb-12 pt-6"
        >
          {NAV.map((item, i) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{ "--row": i } as CSSProperties}
                className={cn(
                  "chrome-row border-b border-line-soft py-4 text-[18px] font-semibold",
                  active ? "text-violet-text" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href={CTA.href}
            style={{ "--row": NAV.length } as CSSProperties}
            className="chrome-row mt-8 inline-flex items-center justify-center rounded-pill bg-plum-600 px-6 py-4 text-[15px] font-semibold text-ink-inv"
          >
            {CTA.label}
          </Link>

          <div
            className="chrome-row mt-10"
            style={{ "--row": NAV.length + 1 } as CSSProperties}
          >
            <p className="eyebrow mb-3">Reach us</p>
            {CONTACT.channels.map((ch) => (
              <p
                key={ch.phone}
                className="mb-3 text-sm leading-relaxed text-ink-2"
              >
                <a href={ch.phoneHref} className="font-medium text-ink">
                  {ch.phone}
                </a>
                <br />
                {/* break-all would orphan a single character; wrap at the @ instead */}
                <a
                  href={`mailto:${ch.email}`}
                  className="[overflow-wrap:anywhere]"
                >
                  {ch.email}
                </a>
              </p>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
