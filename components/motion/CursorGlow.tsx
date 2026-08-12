"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cursor-reactive violet ambience — the site's only chromatic accent.
 *
 * ONE document-level pointermove listener drives everything:
 *   - `--mx` / `--my` on <html>, consumed by `.cursor-glow` (a fixed ambient
 *     blob) and by any `.ambient-violet` section wash;
 *   - `--cx` / `--cy` on the nearest `.spotlight` card, for its hover sheen.
 *
 * Writes are batched into a single rAF so a fast pointer never causes more
 * than one style flush per frame, and never reads layout in the handler
 * (card rects are cached per element until the pointer leaves it).
 * Inert on touch devices and under reduced motion.
 */
export function CursorGlow() {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const card = useRef<{ el: HTMLElement; rect: DOMRect } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(any-pointer: fine)").matches) return;

    const root = document.documentElement;

    const flush = () => {
      frame.current = 0;
      const { x, y } = point.current;
      root.style.setProperty("--mx", `${x}px`);
      root.style.setProperty("--my", `${y}px`);

      const c = card.current;
      if (c) {
        c.el.style.setProperty("--cx", `${x - c.rect.left}px`);
        c.el.style.setProperty("--cy", `${y - c.rect.top}px`);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      point.current = { x: e.clientX, y: e.clientY };

      // e.target is not always an Element (it can be the document itself),
      // and Document has no closest() — guard before calling it.
      const target = e.target;
      const next =
        target instanceof Element
          ? target.closest<HTMLElement>(".spotlight")
          : null;
      if (next !== card.current?.el) {
        card.current = next
          ? { el: next, rect: next.getBoundingClientRect() }
          : null;
      }

      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
        // Position the glow on the very first move rather than a frame later,
        // so it fades in already under the pointer instead of drifting to it.
        flush();
        return;
      }
      if (!frame.current) frame.current = requestAnimationFrame(flush);
    };

    const onLeave = () => {
      card.current = null;
      activeRef.current = false;
      setActive(false);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    // A scroll invalidates the cached card rect.
    const onScroll = () => {
      if (card.current) {
        card.current.rect = card.current.el.getBoundingClientRect();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // Attach once: the visible on/off state is mirrored in activeRef so this
    // effect never re-runs (and never re-binds listeners) as the pointer moves.
  }, []);

  return (
    <div
      className="cursor-glow"
      data-active={active || undefined}
      aria-hidden="true"
    />
  );
}
