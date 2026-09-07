import type { CSSProperties } from "react";
import { PluginMotionStyles } from "./plugin-motion";
import { cn } from "@/lib/cn";

/**
 * The ambient finance field behind a Bank Plugin hero — four faint line-art
 * glyphs and a ripple, each with one slow composited animation, each on its
 * own parallax plane.
 *
 * WHAT THEY ARE, and why these four. The brief was "very classy, subtle
 * banking/finance illustrations" — so no coins, no piggy banks, no
 * skyscraper-with-columns. Each glyph is something the plugin actually does,
 * drawn as the hairline diagram a bank's own annual report might use:
 *
 *   ledger    a statement card whose highlight steps down the rows — the
 *             reconciliation cursor matching entries one by one
 *   transfer  bank → ERP: a dot crosses the wire and a tick lands — a
 *             vendor payment leaving Tally and confirming
 *   bars      a small chart breathing — balances moving, nothing dramatic
 *   rupee     the ₹ itself, very faint, drifting — the medium of all of it
 *   ripple    two rings behind the plug icon — the one live point, the
 *             connection itself
 *
 * WHERE THEY SIT, and why it is safe. Every glyph is anchored to the hero's
 * EDGES (2–6% in from either side) at `lg` and above, and the field is
 * `hidden` below `lg` where the centred text column is the full width. The
 * whole thing is `aria-hidden` and `pointer-events-none`, painted in
 * `--lavender-300` at 0.5–0.8 opacity: on `--surface` that composites to
 * roughly #ece5f0, so even where the 1280px h1 brushes a glyph's edge the
 * text is still reading against near-white, and the contrast walk's
 * numbers are untouched (it composites the text's own ancestors, and this
 * is a sibling).
 *
 * TWO TRANSFORM OWNERS, TWO ELEMENTS. The parallax (`.scrub-drift`, a
 * view()-timeline animation on `transform`) lives on the positioning
 * WRAPPER; the glyph's own float/breathe animation lives on an element
 * INSIDE it. Two animations cannot share `transform` on one element — the
 * second silently wins and the first is gone, which is exactly the trap
 * the Card and WhatWeDo comments warn about. `.drift-far` (7px) for the
 * far plane, `.drift-mid` (14px) for the near one, so the field reads as
 * depth rather than as one sheet sliding.
 *
 * NO `--sp` DRIVER is needed: `.scrub-drift` is `animation-timeline: view()`,
 * self-contained, `@supports`-gated and reduced-motion-safe in globals.css.
 *
 * The keyframes are in ./plugin-motion.tsx, hoisted once per page.
 */
export function PluginHeroField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-0 hidden text-lavender-300 lg:block",
        className,
      )}
    >
      <PluginMotionStyles />

      {/* ── Ripple, behind the lockup / bank mark at the top centre ── */}
      <div
        className="absolute left-[calc(50%-140px)] top-[104px] h-[280px] w-[280px] md:top-[124px]"
      >
        <svg viewBox="0 0 280 280" className="h-full w-full" fill="none">
          <circle
            className="pf-ripple"
            cx="140"
            cy="140"
            r="100"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.8"
          />
          <circle
            className="pf-ripple"
            cx="140"
            cy="140"
            r="100"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.8"
            style={{ "--pf-delay": "2.5s" } as CSSProperties}
          />
        </svg>
      </div>

      {/* ── Ledger card — left, mid ── */}
      <div className="scrub-drift drift-mid absolute left-[3%] top-[34%] w-[128px] opacity-[0.75]">
        <svg viewBox="0 0 128 100" className="h-auto w-full" fill="none">
          <rect x="1" y="1" width="126" height="98" rx="12" stroke="currentColor" strokeWidth="1.3" />
          {/* header rule */}
          <line x1="14" y1="16" x2="52" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* the moving highlight — behind the rows */}
          <rect className="pf-scan" x="8" y="26" width="112" height="16" rx="6" fill="currentColor" />
          {/* three statement rows: description stub · amount stub */}
          {[34, 54, 74].map((y) => (
            <g key={y}>
              <circle cx="18" cy={y} r="3" stroke="currentColor" strokeWidth="1.2" />
              <line x1="28" y1={y} x2="70" y2={y} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="92" y1={y} x2="114" y2={y} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          ))}
          {/* footer tick */}
          <path d="m106 86 4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ── ₹ — left, low ── */}
      <div className="scrub-drift drift-far absolute left-[7%] top-[64%] w-[92px] opacity-[0.5]">
        <div className="pf-float" style={{ "--pf-dur": "10s" } as CSSProperties}>
          <svg viewBox="0 0 92 110" className="h-auto w-full" fill="none">
            <text
              x="46"
              y="88"
              textAnchor="middle"
              fontFamily="var(--font-sans), system-ui, sans-serif"
              fontWeight="600"
              fontSize="96"
              fill="currentColor"
            >
              ₹
            </text>
          </svg>
        </div>
      </div>

      {/* ── Transfer: bank → wire → ERP — right, high ── */}
      <div className="scrub-drift drift-far absolute right-[4%] top-[20%] w-[150px] opacity-[0.8]">
        <svg viewBox="0 0 150 64" className="h-auto w-full" fill="none">
          {/* bank */}
          <rect x="1" y="18" width="30" height="28" rx="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 24h20M11 28v10M16 28v10M21 28v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          {/* the wire */}
          <line x1="37" y1="32" x2="113" y2="32" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 4" strokeLinecap="round" />
          {/* ERP window */}
          <rect x="119" y="18" width="30" height="28" rx="6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M119 26h30" stroke="currentColor" strokeWidth="1.2" />
          <path d="M125 33h12M125 38h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          {/* travelling dot: from x=40 to x=110 → run 70 */}
          <circle
            className="pf-travel"
            cx="40"
            cy="32"
            r="3.2"
            fill="currentColor"
            style={{ "--pf-run": "70px" } as CSSProperties}
          />
          {/* arrival tick, drawn above the ERP window */}
          <path
            className="pf-arrive"
            d="m128 8 4 4 8-8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── Bars — right, low ── */}
      <div className="scrub-drift drift-mid absolute right-[5%] top-[56%] w-[116px] opacity-[0.7]">
        <svg viewBox="0 0 116 84" className="h-auto w-full" fill="none">
          <line x1="2" y1="82" x2="114" y2="82" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          {[
            { x: 8, h: 34, dip: 0.7, d: "0s" },
            { x: 30, h: 52, dip: 0.55, d: "0.9s" },
            { x: 52, h: 42, dip: 0.72, d: "1.8s" },
            { x: 74, h: 66, dip: 0.6, d: "0.4s" },
            { x: 96, h: 58, dip: 0.66, d: "1.3s" },
          ].map((b) => (
            <rect
              key={b.x}
              className="pf-bar"
              x={b.x}
              y={80 - b.h}
              width="12"
              height={b.h}
              rx="3"
              stroke="currentColor"
              strokeWidth="1.3"
              style={{ "--pf-dip": String(b.dip), "--pf-delay": b.d } as CSSProperties}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
