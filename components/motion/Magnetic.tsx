"use client";

import { useEffect } from "react";

/**
 * Magnetic pull for `[data-magnetic]` elements (the pill CTAs).
 *
 * Mounted once at the root rather than baked into <Button>, which is a server
 * component — turning that into a client component would ship React state to
 * every page for a 6px hover effect. Instead this is a single delegated
 * pointermove listener with all writes batched into one rAF, so adding more
 * magnetic elements costs nothing.
 *
 * Disabled entirely on touch and under reduced motion.
 */
const MAX = 6; // px — deliberately small; a bank audience shouldn't see wobble

export function Magnetic() {
  useEffect(() => {
    if (!window.matchMedia("(any-pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let current: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      if (!current || !rect) return;
      const dx = ((px - (rect.left + rect.width / 2)) / (rect.width / 2)) * MAX;
      const dy =
        ((py - (rect.top + rect.height / 2)) / (rect.height / 2)) * MAX;
      const cx = Math.max(-MAX, Math.min(MAX, dx));
      const cy = Math.max(-MAX, Math.min(MAX, dy));
      current.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    };

    const release = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.transform = "";
    };

    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(
        "[data-magnetic]",
      ) as HTMLElement | null;

      if (target !== current) {
        release(current);
        current = target;
        // Cache the rect on enter; re-read on scroll/resize via the reset below.
        rect = target ? target.getBoundingClientRect() : null;
      }
      if (!current) return;

      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    // A scroll or resize invalidates the cached rect — drop the element and let
    // the next pointermove re-acquire it rather than animating to a stale centre.
    const invalidate = () => {
      release(current);
      current = null;
      rect = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      release(current);
      document.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);

  return null;
}
