import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { PLUGIN_MOCK } from "@/content/plugin";
import { PluginMotionStyles } from "./plugin-motion";
import { cn } from "@/lib/cn";

interface PluginMockupProps {
  /** Homepage spotlight: no sidebar, tighter padding. */
  compact?: boolean;
  /**
   * Two floating product chips at the window's corners — a "statement
   * fetched" note top-right and a "payment succeeded" note bottom-left. The
   * hero's micro-illustrations; off by default so the compact homepage
   * variant and any future dense placement stay clean. `lg` and up only:
   * on a phone the chips would sit on top of the window's own content.
   */
  chips?: boolean;
  className?: string;
}

/**
 * The product mockup — an ERP window with the plugin's panel open, drawn
 * entirely in HTML/CSS with design tokens. It replaces the red stock
 * illustrations on the bank portals, which do not belong in the plum system.
 *
 * All figures are `PLUGIN_MOCK` — illustrative sample data, flagged in
 * CONTENT-TODO §2. Purely presentational: `aria-hidden` on the wrapper, the
 * caption under it carries the accessible description, and nothing animates
 * except the `.pulse-dot` (transform/opacity only; the global reduced-motion
 * block already freezes it).
 *
 * `text-left` on the figure is load-bearing, not decoration: the plugin
 * hero's column is `text-center`, and a UI mockup that inherits it centres
 * every payee name and label inside the window chrome.
 *
 * THE CHIPS float on `.chip-float` (globals.css — translateY only, 7s), each
 * with its own `--float-delay` so they never bob in step. They are ABSOLUTE
 * children of the `relative` figure, so they add no height and cannot shift
 * the layout; the figure's own `overflow` is untouched, so they may overhang
 * the window edge by design. They are `aria-hidden`: their content is a
 * restatement of what the window already shows, not new information.
 *
 * Server component — no state, no effects.
 */
export function PluginMockup({ compact, chips, className }: PluginMockupProps) {
  const m = PLUGIN_MOCK;
  const pct = Math.round((m.reconcile.matched / m.reconcile.total) * 1000) / 10;
  const ring = {
    background: `conic-gradient(var(--plum-600) 0 ${pct}%, var(--lavender-200) 0)`,
  } as CSSProperties;

  return (
    <figure className={cn("relative mx-auto w-full text-left", className)}>
      {chips && (
        <>
          <PluginMotionStyles />
          {/* top-right: the balance / statement moment */}
          <span
            aria-hidden="true"
            className="chip-float absolute -top-5 right-6 z-[1] hidden items-center gap-2 rounded-pill border border-line-soft bg-surface px-4 py-2 text-[13px] font-medium text-ink-2 shadow-card lg:inline-flex"
          >
            <span className="pulse-dot" />
            Statement fetched · {m.accounts.length} accounts
          </span>
          {/* bottom-left: the payment moment */}
          <span
            aria-hidden="true"
            style={{ "--float-delay": "2.6s" } as CSSProperties}
            className="chip-float absolute -bottom-5 left-6 z-[1] hidden items-center gap-2 rounded-pill border border-line-soft bg-surface px-4 py-2 text-[13px] font-medium text-ink-2 shadow-card lg:inline-flex"
          >
            <span
              className="grid h-4 w-4 place-items-center rounded-full"
              style={{ background: "var(--success)" }}
            >
              <svg viewBox="0 0 20 20" width="10" height="10" fill="none" aria-hidden="true">
                <path d="m5 10.4 3.2 3.2L15.5 6.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="tnum">{m.payments[0].amount}</span> · {m.payments[0].status}
          </span>
        </>
      )}
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-xl border border-line bg-surface shadow-float"
      >
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-line-soft bg-canvas-2 px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-lavender-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-lavender-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-lavender-300" />
          </span>
          <span className="truncate text-[12px] font-medium text-ink-3">
            {m.window}
          </span>
          <span className="ml-auto hidden items-center gap-1.5 text-[11.5px] text-ink-3 sm:inline-flex">
            <span className="pulse-dot" />
            Connected
          </span>
        </div>

        <div
          className={cn(
            "grid grid-cols-1",
            !compact && "md:grid-cols-[176px_1fr]",
          )}
        >
          {/* Sidebar — desktop, full variant only */}
          {!compact && (
            <aside className="hidden border-r border-line-soft bg-canvas px-3 py-4 md:block">
              <p className="px-2 text-[10.5px] font-semibold uppercase tracking-eyebrow text-ink-3">
                Bank plugin
              </p>
              <ul className="mt-3 space-y-1">
                {m.menu.map((item, i) => (
                  <li
                    key={item}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-[12.5px] font-medium",
                      i === 0
                        ? "bg-plum-600 text-ink-inv"
                        : "text-ink-2",
                    )}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Main pane */}
          <div className={cn("p-4 md:p-5", compact && "md:p-4")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[13px] font-semibold text-ink">{m.company}</p>
              <p className="text-[11.5px] text-ink-3">Refreshed just now</p>
            </div>

            {/* Balances */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {m.accounts.map((a, i) => (
                <div
                  key={a.label}
                  className={cn(
                    "rounded-lg border p-3.5",
                    i === 0
                      ? "grad-tile border-transparent text-ink-inv"
                      : "border-line-soft bg-canvas",
                  )}
                >
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      i === 0 ? "text-ink-on-violet-2" : "text-ink-3",
                    )}
                  >
                    {a.label}
                  </p>
                  <p className="tnum mt-1 text-[18px] font-semibold leading-none md:text-[20px]">
                    {a.balance}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_168px]">
              {/* Payments */}
              <div className="rounded-lg border border-line-soft bg-surface">
                <div className="flex items-center justify-between border-b border-line-soft px-3.5 py-2">
                  <p className="text-[11.5px] font-semibold text-ink">
                    Vendor payments
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-pill bg-plum-600 px-2.5 py-1 text-[10.5px] font-semibold text-ink-inv">
                    <Icon name="cash" size={11} /> New payment
                  </span>
                </div>
                <ul className="divide-y divide-line-soft">
                  {m.payments.map((p) => (
                    <li
                      key={p.payee}
                      /* Below sm the amount + status drop to a second row so a
                         long payee never truncates to "Nim…" on a 390px phone. */
                      className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 px-3.5 py-2 text-[12px] sm:flex sm:gap-3"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lavender-200 text-[10px] font-semibold text-plum-700">
                        {p.payee.charAt(0)}
                      </span>
                      <span className="min-w-0 truncate font-medium text-ink sm:flex-1">
                        {p.payee}
                      </span>
                      {/* From sm this is a normal flex item pushed to the row's
                          end (ml-auto) — NOT `display: contents`, which the
                          layout sweep flags as a 0×0 box with a painting
                          subtree. Below sm it spans both grid columns as the
                          second row. */}
                      <span className="col-span-2 flex items-center justify-between gap-2 pl-9 sm:col-auto sm:ml-auto sm:gap-3 sm:pl-0">
                        <span className="tnum text-ink-2">{p.amount}</span>
                        <StatusPill status={p.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reconciliation ring */}
              <div className="flex items-center gap-3 rounded-lg border border-line-soft bg-canvas p-3.5 lg:flex-col lg:items-start">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
                  style={ring}
                >
                  <span className="tnum grid h-11 w-11 place-items-center rounded-full bg-surface text-[12px] font-semibold text-plum-700">
                    {pct}%
                  </span>
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-ink">
                    Reconciliation
                  </p>
                  <p className="tnum mt-0.5 text-[11.5px] leading-snug text-ink-3">
                    {m.reconcile.matched} of {m.reconcile.total} matched
                    <br />
                    {m.reconcile.total - m.reconcile.matched} to review
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        Mockup of the plugin panel inside an ERP window, showing account
        balances, a vendor-payments list with live statuses and a
        reconciliation progress ring. Figures are illustrative.
      </figcaption>
    </figure>
  );
}

/**
 * Status pills. The "Success" text uses `--success-text`, the darkened variant
 * the token file requires for small text on white; the fill colour is only
 * ever used for the dot.
 */
export function StatusPill({ status }: { status: string }) {
  const ok = status === "Success";
  const pending = status === "Processing";
  return (
    <span
      className={cn(
        "tnum inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2 py-0.5 text-[10.5px] font-semibold",
        ok && "bg-canvas-2",
        pending && "bg-lavender-200 text-plum-700",
        !ok && !pending && "border border-line text-ink-2",
      )}
      style={ok ? { color: "var(--success-text)" } : undefined}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", pending && "pf-blink")}
        style={{
          background: ok
            ? "var(--success)"
            : pending
              ? "var(--violet-500)"
              : "var(--ink-3)",
        }}
      />
      {status}
    </span>
  );
}
