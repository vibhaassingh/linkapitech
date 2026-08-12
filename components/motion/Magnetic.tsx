"use client";

import { useEffect } from "react";
import { startVelocityBus } from "./velocity";

/**
 * Pointer-reactive micro-motion for `[data-magnetic]` and `[data-tilt]`.
 *
 * Mounted once at the root rather than baked into <Button>, which is a server
 * component — turning that into a client component would ship React state to
 * every page for a 6px hover effect. Instead this is a single delegated
 * pointermove listener with all writes batched into one rAF, so adding more
 * magnetic or tilting elements costs nothing.
 *
 * `[data-magnetic]` — up to 6px of pull toward the cursor.
 * `[data-tilt]`     — up to 3° of pointer tilt. Both may be on one element.
 *
 * WHICH PROPERTY EACH ONE WRITES, AND WHY IT MATTERS
 *   magnetic → the `translate` property
 *   tilt     → `transform` (3D tilt needs `perspective()`, which only exists
 *              inside `transform`)
 * `translate` composes with `transform` instead of replacing it, which is what
 * lets a CTA be pulled by the cursor AND still take `transform: scale(.97)`
 * from its own `:active` rule — writing the pull into `transform` would make
 * the inline style win and the press would silently stop working.
 * Consequence for call sites: `[data-tilt]` must NOT go on an element that
 * relies on a transform utility for its layout (e.g. `-translate-x-1/2`),
 * because the inline transform replaces it. `[data-magnetic]` is safe there.
 *
 * Release is a sprung return (WAAPI, `--spring-smooth`), not a transform wipe:
 * the element springs back to rest with the same overshoot as the rest of the
 * system. WAAPI is used rather than a CSS transition because an inline
 * `transition` would clobber the element's own colour/shadow transitions for
 * half a second, and this way nothing inline survives the animation.
 *
 * Disabled entirely on touch and under reduced motion.
 */
const PULL = 6; // px — deliberately small; a bank audience shouldn't see wobble
const TILT = 3; // deg — ditto
const SEL = "[data-magnetic],[data-tilt]";

const clamp = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);

export function Magnetic() {
  useEffect(() => {
    if (!window.matchMedia("(any-pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Resolve the spring once, at mount: WAAPI needs the literal linear() string
    // and the numeric duration. Two computed-style reads for the page's life.
    const rootStyle = getComputedStyle(document.documentElement);
    const easing =
      rootStyle.getPropertyValue("--spring-smooth").trim() || "ease-out";
    const springMs =
      parseFloat(rootStyle.getPropertyValue("--dur-spring-smooth")) || 550;

    let raf = 0;
    let current: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let mag = false;
    let tilt = false;
    let px = 0;
    let py = 0;
    const returning = new WeakMap<HTMLElement, Animation>();

    const apply = () => {
      raf = 0;
      const el = current;
      if (!el || !rect) return;
      const nx = clamp((px - (rect.left + rect.width / 2)) / (rect.width / 2));
      const ny = clamp((py - (rect.top + rect.height / 2)) / (rect.height / 2));
      if (mag) {
        el.style.translate = `${(nx * PULL).toFixed(2)}px ${(ny * PULL).toFixed(2)}px`;
      }
      if (tilt) {
        el.style.transform = `perspective(700px) rotateX(${(-ny * TILT).toFixed(2)}deg) rotateY(${(nx * TILT).toFixed(2)}deg)`;
      }
    };

    const release = (el: HTMLElement | null) => {
      if (!el) return;
      const fromTranslate = el.style.translate;
      const fromTransform = el.style.transform;
      // Clear inline first, so the animation runs from the captured pose to the
      // element's own resting style and leaves nothing behind when it ends.
      el.style.translate = "";
      el.style.transform = "";
      if (!fromTranslate && !fromTransform) return;
      const from: Keyframe = {};
      const to: Keyframe = {};
      if (fromTranslate) {
        from.translate = fromTranslate;
        to.translate = "none";
      }
      if (fromTransform) {
        from.transform = fromTransform;
        to.transform = "none";
      }
      try {
        const anim = el.animate([from, to], {
          duration: springMs,
          easing,
          fill: "none",
        });
        returning.set(el, anim);
        anim.finished
          .then(() => {
            if (returning.get(el) === anim) returning.delete(el);
          })
          .catch(() => {
            /* cancelled by a re-entry — nothing to clean up */
          });
      } catch {
        // Older engine without linear() easing support: the inline pose is
        // already cleared, so the element is simply back at rest instantly.
      }
    };

    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(SEL) as
        | HTMLElement
        | null;

      if (target !== current) {
        release(current);
        current = target;
        if (target) {
          returning.get(target)?.cancel();
          returning.delete(target);
          // Cache the rect on enter; re-read on scroll/resize via the reset below.
          rect = target.getBoundingClientRect();
          mag = target.hasAttribute("data-magnetic");
          tilt = target.hasAttribute("data-tilt");
        } else {
          rect = null;
          mag = false;
          tilt = false;
        }
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

  // The scroll-velocity bus lives here because this component is the only
  // always-mounted, non-visual motion root in app/layout.tsx (owned by another
  // packet), so hosting it here is what gives BOTH route groups the
  // `--scroll-velocity` token. The bus is refcounted, so the marketing route —
  // where SmoothScrollProvider also starts it — still runs exactly one loop.
  useEffect(() => startVelocityBus(), []);

  return null;
}
