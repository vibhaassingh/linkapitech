/**
 * Motion for The Bank Plugin heroes — one hoisted stylesheet shared by
 * PluginHeroField (the ambient background glyphs) and PluginMockup (the
 * floating chips and the "Processing" blink).
 *
 * Emitted with React 19's `href` + `precedence`, so however many components
 * render it on a page it lands in <head> exactly once. Component-scoped
 * rather than in globals.css because globals is the B0 design system and
 * these keyframes have exactly one consumer family.
 *
 * ── THE TWO RULES EVERY KEYFRAME HERE OBEYS ────────────────────────────────
 *
 * 1. TRANSFORM AND OPACITY ONLY. The gate's composited-animation audit runs
 *    Lighthouse over /bank-plugin and /hsbc-lp and fails the route for any
 *    non-composited animation not on its allowlist. That is not a style
 *    preference: a `box-shadow` or `stroke-dashoffset` keyframe would fail
 *    the build. (The ledger "scan" therefore MOVES a highlight rect rather
 *    than redrawing one, and the transfer "wire" translates a dot rather
 *    than marching a dash.)
 *
 * 2. THE 100% FRAME IS THE RESTING POSE. Under `prefers-reduced-motion`
 *    the global block collapses every animation to one 0.001ms iteration
 *    (globals.css), so an infinite loop simply snaps to its last keyframe
 *    and stays there. Every loop below therefore ends where a static
 *    illustration would sit: the float at translateY(0), the bars at
 *    scaleY(1), the blink at opacity 1, the scan on the first row, and the
 *    travelling dot / ripple INVISIBLE — because a dot frozen mid-wire or
 *    a half-expanded ring is not a still, it is a stuck frame.
 *
 * Amplitudes are deliberately small (≤ 10px, ≤ 15% scale) and periods long
 * (6–11s): "very classy, subtle" was the brief, and on a white surface a
 * lavender hairline that moves fast reads as a glitch, not as life.
 *
 * ── ONE-SHOT REVEALS (the `pf-fill` / `pf-pop` family) ─────────────────────
 * These play ONCE, when the section scrolls into view, and hold their end
 * state. They key off `[data-inview]` — the attribute Reveal / RevealGroup
 * put on their wrappers (components/motion) — so they need no JS of their
 * own and fire exactly when the card they sit in fades up. Two consequences
 * worth knowing:
 *   • Before reveal they sit at their START state (an empty bar, a hidden
 *     tick). That is the same contract as every `[data-reveal]` element on
 *     the site, which is at opacity 0 until observed.
 *   • Under reduced motion, useInView reports in-view immediately and the
 *     global block collapses the duration, so they land on the END state at
 *     once — a full bar, four lit ticks. `both` fill is what holds it.
 * Delays chain off `--reveal-delay`, RevealGroup's per-child stagger, so a
 * disc pops in with its own card rather than with the first one.
 */

export const PLUGIN_MOTION_ID = "plugin-motion";

export const PLUGIN_MOTION_CSS = `
/* Slow vertical float — the ₹ glyph and anything else that hovers. */
@keyframes pfFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.pf-float{animation:pfFloat var(--pf-dur,9s) ease-in-out infinite;animation-delay:var(--pf-delay,0s)}

/* Ledger scan: a highlight rect steps down three rows (20px pitch), pauses
   on each, fades, and returns to row one — the 100% frame. */
@keyframes pfScan{
  0%,18%{transform:translateY(0);opacity:.14}
  28%,46%{transform:translateY(20px);opacity:.14}
  56%,80%{transform:translateY(40px);opacity:.14}
  88%{transform:translateY(40px);opacity:0}
  94%{transform:translateY(0);opacity:0}
  100%{transform:translateY(0);opacity:.14}
}
.pf-scan{animation:pfScan 9s ease-in-out infinite;will-change:transform,opacity}

/* Bars breathe. Origin is the baseline so they grow upward; --pf-dip sets
   how far each one settles, so five bars never move in unison. */
@keyframes pfBar{0%,100%{transform:scaleY(1)}50%{transform:scaleY(var(--pf-dip,.62))}}
.pf-bar{transform-origin:50% 100%;transform-box:fill-box;animation:pfBar var(--pf-dur,6.5s) ease-in-out infinite;animation-delay:var(--pf-delay,0s)}

/* Transfer: a dot leaves the bank, crosses the wire, arrives at the ERP and
   vanishes — invisible at 100%, so reduced motion shows wire and endpoints
   only, never a stranded dot. Distance is the wire length in viewBox units;
   transform-box:fill-box keeps it in the SVG's own coordinate space. */
@keyframes pfTravel{
  0%{transform:translateX(0);opacity:0}
  8%{opacity:1}
  70%{transform:translateX(var(--pf-run,72px));opacity:1}
  82%,100%{transform:translateX(var(--pf-run,72px));opacity:0}
}
.pf-travel{transform-box:fill-box;animation:pfTravel 5.5s cubic-bezier(.4,0,.2,1) infinite}

/* Arrival tick — fades in as the dot lands, holds, then clears with it. */
@keyframes pfArrive{0%,66%{opacity:0;transform:scale(.6)}74%,90%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.6)}}
.pf-arrive{transform-box:fill-box;transform-origin:50% 50%;animation:pfArrive 5.5s ease-out infinite}

/* Ripple behind the plug: two rings expand and fade, staggered. Invisible at
   100% by design — see the header note. */
@keyframes pfRipple{0%{transform:scale(.55);opacity:.42}70%,100%{transform:scale(1.15);opacity:0}}
.pf-ripple{transform-origin:50% 50%;animation:pfRipple 5s ease-out infinite;animation-delay:var(--pf-delay,0s)}

/* ── one-shot reveals ─────────────────────────────────────────────────── */

/* A bar or wire that fills from the left. Set the final width in layout as
   usual; the fill is the transform, so no width is ever animated. */
@keyframes pfFillX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.pf-fill{transform-origin:0 50%;transform:scaleX(0)}
[data-inview] .pf-fill{animation:pfFillX .9s cubic-bezier(.4,0,.2,1) both;animation-delay:calc(var(--reveal-delay,0ms) + var(--pf-delay,240ms))}

/* A disc, tick or chip that pops in. --pf-i staggers siblings (110ms apart);
   --reveal-delay chains it to the owning card's own entrance. */
@keyframes pfPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.pf-pop{transform:scale(.4);opacity:0}
[data-inview] .pf-pop{animation:pfPop .55s cubic-bezier(.34,1.56,.64,1) both;animation-delay:calc(var(--reveal-delay,0ms) + var(--pf-base,160ms) + var(--pf-i,0)*110ms)}

/* The "Processing" status dot — a slow blink, resting fully on. */
@keyframes pfBlink{0%,100%{opacity:1}50%{opacity:.3}}
.pf-blink{animation:pfBlink 1.8s ease-in-out infinite}
`;

/** Render once per page; duplicates dedupe on `href`. */
export function PluginMotionStyles() {
  return (
    <style href={PLUGIN_MOTION_ID} precedence="default">
      {PLUGIN_MOTION_CSS}
    </style>
  );
}
