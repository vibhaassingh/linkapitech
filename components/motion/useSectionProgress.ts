"use client";

import { useEffect, type RefObject } from "react";

/**
 * `useSectionProgress(ref)` — writes `--sp` (0..1) on the element as it crosses
 * the viewport: 0 the instant its top edge touches the viewport bottom, 1 when
 * its bottom edge leaves the top. Nothing is returned and no React state is
 * involved, so a consumer never re-renders; it just reads the variable in CSS:
 *
 *   style={{ transform: "translateY(calc(var(--sp) * -20px))" }}
 *
 * `--sp` is declared on :root, so it inherits — children of the section read
 * the section's progress without their own hook.
 *
 * DESIGN NOTES (this is the shared engine, not one instance per section)
 * - ONE rAF for every consumer on the page, and it only runs while the page is
 *   actually moving (a short tail after the last scroll event). Idle pages do
 *   no work at all.
 * - ONE IntersectionObserver: off-screen sections are skipped entirely, so a
 *   long page costs the same as a short one.
 * - NO layout reads inside the rAF. The only per-frame read is `window.scrollY`.
 *   Each element's document-space top/height is cached and re-measured only on
 *   the events that can change it: visibility change, viewport resize, and
 *   document-height change (an accordion opening above the section would
 *   otherwise leave the cache stale — a ResizeObserver on <html> catches it).
 * - Writes are skipped unless the value actually moved, which keeps the style
 *   recalc off most frames while a tall section creeps past.
 * - A complete no-op under reduced motion: nothing registers, `--sp` keeps its
 *   0 default, and every consumer renders in its neutral pose.
 */

interface Tracked {
  el: HTMLElement;
  /** document-space top, px */
  top: number;
  /** offsetHeight, px */
  h: number;
  visible: boolean;
  last: number;
}

const tracked = new Map<HTMLElement, Tracked>();
let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let raf = 0;
let activeUntil = 0;
let vh = 0;

/** The one layout read in the whole module, and never from inside the rAF. */
function measure(t: Tracked) {
  const r = t.el.getBoundingClientRect();
  t.top = r.top + window.scrollY;
  t.h = r.height;
}

function tick(now: number) {
  raf = 0;
  const y = window.scrollY;
  let live = false;
  for (const t of tracked.values()) {
    if (!t.visible) continue;
    live = true;
    const span = vh + t.h;
    const p = span > 0 ? (y + vh - t.top) / span : 0;
    const v = p < 0 ? 0 : p > 1 ? 1 : p;
    if (Math.abs(v - t.last) >= 0.001) {
      t.last = v;
      t.el.style.setProperty("--sp", v.toFixed(4));
    }
  }
  if (live && now < activeUntil) raf = requestAnimationFrame(tick);
}

function wake() {
  activeUntil = performance.now() + 220;
  if (!raf) raf = requestAnimationFrame(tick);
}

function remeasureAll() {
  vh = window.innerHeight;
  for (const t of tracked.values()) if (t.visible) measure(t);
  wake();
}

function ensureObservers() {
  if (io) return;
  vh = window.innerHeight;
  io = new IntersectionObserver((records) => {
    for (const r of records) {
      const t = tracked.get(r.target as HTMLElement);
      if (!t) continue;
      t.visible = r.isIntersecting;
      if (t.visible) measure(t);
    }
    wake();
  });
  ro = new ResizeObserver(remeasureAll);
  ro.observe(document.documentElement);
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", remeasureAll);
}

function teardown() {
  io?.disconnect();
  ro?.disconnect();
  io = null;
  ro = null;
  window.removeEventListener("scroll", wake);
  window.removeEventListener("resize", remeasureAll);
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

export function useSectionProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ensureObservers();
    const t: Tracked = { el, top: 0, h: 0, visible: false, last: -1 };
    tracked.set(el, t);
    io?.observe(el);

    return () => {
      io?.unobserve(el);
      tracked.delete(el);
      el.style.removeProperty("--sp");
      if (tracked.size === 0) teardown();
    };
  }, [ref]);
}
