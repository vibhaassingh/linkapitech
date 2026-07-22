"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { MegaPanel } from "./MegaPanel";
import { SOLUTIONS_MENU, WORK_MENU, NAV_PAGES, type MegaLink } from "@/lib/site";
import { CLIENTS } from "@/content/clients";
import { IMPACT_STATS, MARQUEE_STATS } from "@/content/stats";
import { cn } from "@/lib/cn";

type PanelId = "solutions" | "work";

const OPEN_DELAY = 80; // hover-intent: don't open on a drive-by
const CLOSE_DELAY = 250; // generous close so trigger→panel travel never flickers

/**
 * Desktop navigation with two full-width mega panels.
 *
 * Interaction contract (WCAG 1.4.13-aligned):
 * - click / Enter / Space toggles; hover opens after 80ms, closes 250ms after
 *   the pointer leaves the trigger+panel union (one shared timer pair);
 * - Esc closes and returns focus to the trigger;
 * - panels are `hidden` when closed (out of tab order / a11y tree), sit in
 *   DOM order directly after their trigger, and are never focus-trapped;
 * - focus leaving the nav entirely closes any open panel;
 * - route change closes.
 */
export function MegaMenu({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState<PanelId | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<PanelId, HTMLButtonElement | null>>({
    solutions: null,
    work: null,
  });
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const show = useCallback(
    (id: PanelId | null) => {
      setOpen(id);
      onOpenChange?.(id !== null);
    },
    [onOpenChange],
  );

  // Route change closes.
  useEffect(() => {
    show(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Esc closes and restores focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const trigger = triggerRefs.current[open];
        show(null);
        trigger?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, show]);

  useEffect(() => clearTimers, [clearTimers]);

  // When hover just opened the panel, the user's follow-up click must not
  // toggle it closed — the click "confirms" the hover-open instead.
  const hoverOpenedAt = useRef(0);

  const hoverOpen = (id: PanelId) => (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      hoverOpenedAt.current = Date.now();
      show(id);
    }, OPEN_DELAY);
  };

  const hoverClose = (e?: ReactPointerEvent) => {
    if (e && e.pointerType !== "mouse") return;
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => show(null), CLOSE_DELAY);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const toggle = (id: PanelId) => {
    clearTimers();
    if (open === id && Date.now() - hoverOpenedAt.current < 600) return;
    show(open === id ? null : id);
  };

  // ArrowDown queues a focus move that runs AFTER React commits the unhidden
  // panel (a bare rAF can fire before the commit, when the panel is still
  // display:none and unfocusable).
  const pendingFocus = useRef<PanelId | null>(null);
  useEffect(() => {
    if (open && pendingFocus.current === open) {
      pendingFocus.current = null;
      document.querySelector<HTMLAnchorElement>(`#mega-${open} a`)?.focus();
    }
  }, [open]);

  const onTriggerKeyDown = (id: PanelId) => (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      clearTimers();
      pendingFocus.current = id;
      show(id);
    }
  };

  // Focus leaving the whole nav closes any open panel (no focus return).
  const onBlurCapture = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && navRef.current && !navRef.current.contains(next)) {
      show(null);
    }
  };

  const trigger = (id: PanelId, label: string) => (
    <button
      ref={(el) => {
        triggerRefs.current[id] = el;
      }}
      type="button"
      aria-expanded={open === id}
      aria-controls={`mega-${id}`}
      aria-haspopup="true"
      onClick={() => toggle(id)}
      onKeyDown={onTriggerKeyDown(id)}
      onPointerEnter={hoverOpen(id)}
      onPointerLeave={hoverClose}
      className={cn(
        "flex items-center gap-1.5 rounded-sm px-3 py-2 text-[14.5px] font-medium transition-colors duration-ui",
        open === id ? "text-navy-900" : "text-ink-2 hover:text-ink",
      )}
    >
      {label}
      <Caret open={open === id} />
    </button>
  );

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      onBlurCapture={onBlurCapture}
      className="hidden items-center gap-1 lg:flex"
    >
      {trigger("solutions", "Solutions")}
      <MegaPanel
        id="mega-solutions"
        open={open === "solutions"}
        labelledBy="mega-solutions-label"
        onPointerEnter={cancelClose}
        onPointerLeave={() => hoverClose()}
      >
        <span id="mega-solutions-label" className="sr-only">
          Solutions
        </span>
        <div className="grid grid-cols-[1fr_1fr_1fr_320px] gap-10">
          {SOLUTIONS_MENU.map((col) => (
            <div key={col.heading}>
              <p className="eyebrow mb-4">{col.heading}</p>
              <ul className="flex flex-col gap-1">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <PanelLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <FeaturedCard />
        </div>
      </MegaPanel>

      {trigger("work", "Work")}
      <MegaPanel
        id="mega-work"
        open={open === "work"}
        labelledBy="mega-work-label"
        onPointerEnter={cancelClose}
        onPointerLeave={() => hoverClose()}
      >
        <span id="mega-work-label" className="sr-only">
          Work
        </span>
        <div className="grid grid-cols-[1fr_280px] gap-10">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-1">
            {WORK_MENU.map((link) => (
              <li key={link.href}>
                <PanelLink link={link} />
              </li>
            ))}
            <li className="col-span-2 mt-3 border-t border-line-soft pt-4">
              <Link
                href="/work"
                className="inline-flex items-center gap-2 rounded-sm text-[14px] font-medium text-navy-600 transition-colors duration-ui hover:text-navy-900"
              >
                All work
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
          <div className="border-l border-line-soft pl-8">
            <p className="eyebrow mb-4">Across programs</p>
            <ul className="flex flex-col gap-4">
              {MARQUEE_STATS.slice(2).map((s) => (
                <li key={s.label}>
                  <p className="font-display text-xl font-semibold tnum text-ink">{s.value}</p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-eyebrow text-ink-3">
                    {s.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MegaPanel>

      {NAV_PAGES.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="rounded-sm px-3 py-2 text-[14.5px] font-medium text-ink-2 transition-colors duration-ui hover:text-ink"
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}

function PanelLink({ link }: { link: MegaLink }) {
  return (
    <Link
      href={link.href}
      className="group block rounded-sm px-3 py-2.5 transition-colors duration-ui hover:bg-navy-050"
    >
      <span className="block text-[14.5px] font-medium text-ink transition-colors duration-ui group-hover:text-navy-900">
        {link.label}
      </span>
      {link.description && (
        <span className="mt-0.5 block text-[12.5px] text-ink-3">{link.description}</span>
      )}
    </Link>
  );
}

/** Bank-trust spotlight — the panel's featured card. */
function FeaturedCard() {
  const impl = IMPACT_STATS[0];
  return (
    <Link
      href="/clients"
      className="group flex flex-col justify-between rounded-lg bg-navy-050 p-6 transition-colors duration-ui hover:bg-navy-100"
    >
      <div>
        <p className="eyebrow mb-3">Powering integrations for</p>
        <p className="font-display text-[17px] font-semibold leading-snug text-navy-900">
          {CLIENTS.slice(0, 3)
            .map((c) => c.name)
            .join(" · ")}
        </p>
      </div>
      <div className="mt-8">
        <p className="font-display text-2xl font-semibold tnum text-ink">{impl.value}</p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-3">API implementations</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-medium text-navy-600 transition-colors duration-ui group-hover:text-navy-900">
          Clients &amp; trust
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="10"
      height="10"
      aria-hidden="true"
      className={cn("transition-transform duration-ui", open && "rotate-180")}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
