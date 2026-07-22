"use client";

import { useEffect, useRef, useState } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

/** Centralized reduced-motion flag (INTERACTIONS-AND-MOTION §7.1). */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(REDUCE);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Count-up on first view. (The reveal system now lives in useInView.ts.) */
export function useCounter(target: number, duration = 1400) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCE).matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    let done = false;
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      setValue(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done) {
            done = true;
            raf = requestAnimationFrame(step);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);
  return { ref, value };
}

/** Which section id currently straddles the mid-viewport line. */
export function useActiveSection(ids: string[], fraction = 0.42) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(",");
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * fraction;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [key, fraction]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/**
 * Scroll-driven fill for the process rail (§5.8). Writes `--fill` (0→1) directly
 * to `railRef`'s style and returns the number of steps whose center has passed
 * the trigger line — never uses React state for the per-frame value.
 */
export function useScrollFill(
  railRef: { current: HTMLElement | null },
  stepRefs: { current: HTMLElement | null }[],
  triggerFraction = 0.62,
) {
  const [passed, setPassed] = useState(0);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia(REDUCE).matches) {
      rail.style.setProperty("--fill", "1");
      setPassed(stepRefs.length);
      return;
    }
    let raf = 0;
    const calc = () => {
      raf = 0;
      const line = window.innerHeight * triggerFraction;
      const r = rail.getBoundingClientRect();
      const total = r.height || 1;
      const fill = Math.max(0, Math.min(1, (line - r.top) / total));
      rail.style.setProperty("--fill", String(fill));
      let count = 0;
      stepRefs.forEach((s) => {
        const el = s.current;
        if (!el) return;
        const rr = el.getBoundingClientRect();
        if (rr.top + rr.height / 2 <= line) count += 1;
      });
      setPassed(count);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [railRef, stepRefs, triggerFraction]);
  return passed;
}
