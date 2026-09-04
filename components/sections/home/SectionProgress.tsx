"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useSectionProgress } from "@/components/motion/useSectionProgress";

interface SectionProgressProps {
  children: ReactNode;
  className?: string;
  id?: string;
  "aria-label"?: string;
  style?: CSSProperties;
  /**
   * Also publish `--sp-live: var(--sp)` once a real driver is running, for
   * sections whose CONTENT (not just its decoration) is scrubbed — see the
   * fail-open note below. Off by default: a section that only animates
   * decoration must fail CLOSED, and publishing the alias there would light
   * every decoration for reduced-motion and no-JS visitors.
   */
  live?: boolean;
}

/**
 * SectionProgress — a `<section>` that writes `--sp` (0 → 1 across its own
 * viewport transit) onto itself through useSectionProgress, and nothing else.
 *
 * WHY A WRAPPER (REDESIGN-V4 Part J, Phase 6). The hook needs a ref and an
 * effect, i.e. a client component — but the sections that read `--sp`
 * (WhatWeDo's Conduit flow and its sequenced Nodes) are otherwise pure server
 * markup: content from content/*.ts, the motif kit, RevealGroup. Marking the
 * whole section "use client" would ship its content module and every motif
 * to the browser for one effect. ProcessRail pays that price because its
 * terminal choreography also needs the `--sp-live` publishing effect; here the
 * client boundary is this single element. Server children pass straight
 * through as `children` (React composes them without serialising anything but
 * the tree), so the section stays a server component and the hook is the only
 * JS added.
 *
 * `--sp` inherits, so every descendant reads the section's progress. Under
 * reduced motion the hook is a deliberate no-op and `--sp` keeps its `:root`
 * 0 — every `--sp` consumer rests in its start pose (decoration fails closed;
 * content must read `--sp-live`, which fails open — see ProcessRail).
 *
 * ── `live` (V4 Phase 9a) ──────────────────────────────────────────────────
 * `--sp` is declared `0` on `:root` and this hook is a deliberate no-op under
 * reduced motion, so `var(--sp, …)` can NEVER fall back — a consumer that
 * treats 0 as "not yet" would hide its content outright for reduced-motion
 * users, with JS disabled, and before hydration. `live` therefore publishes
 * `--sp-live: var(--sp)` (a live alias, re-substituted whenever `--sp`
 * changes) only once a real driver is running; consumers read
 * `var(--sp-live, 1)`, so "no driver" means "finished".
 *
 * The effect is ProcessRail's, verbatim in behaviour — same matchMedia guard,
 * same two-frame wait so the shared observer has delivered its first `--sp`
 * write before anything reads it (without it, a deep link landing mid-section
 * shows one frame of completed state), same removal on unmount. It lives here
 * so a section that needs the alias but is otherwise pure server markup
 * (/connected-banking's capabilities rail) does not have to become a client
 * component to get it.
 */
export function SectionProgress({
  children,
  className,
  live,
  ...rest
}: SectionProgressProps) {
  const ref = useRef<HTMLElement | null>(null);
  useSectionProgress(ref);

  useEffect(() => {
    const el = ref.current;
    if (!live || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let outer = 0;
    let inner = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() =>
        el.style.setProperty("--sp-live", "var(--sp)"),
      );
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      el.style.removeProperty("--sp-live");
    };
  }, [live]);

  return (
    <section ref={ref} className={className} {...rest}>
      {children}
    </section>
  );
}
