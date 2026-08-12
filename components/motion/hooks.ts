"use client";

import { useEffect, useRef, useState } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

/*
 * Also in this folder (NOT re-exported from here on purpose — a re-export would
 * pull them into every bundle that imports this module):
 *   useSectionProgress  → ./useSectionProgress   writes --sp on a section
 *   startVelocityBus    → ./velocity             publishes --scroll-velocity
 *   useInView           → ./useInView            the reveal trigger
 */

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

/**
 * Trigger + settle clock for the per-digit odometer in <StatNumber>.
 *
 * Deliberately drives NO per-frame value: the roll itself is a pure CSS
 * animation on each digit column, so all this decides is *when* it may start
 * (first time the block is 40% in view) and when the last column has landed.
 * That is two state updates per stat for the whole effect.
 *
 * `totalMs` must cover the slowest column: duration + (digits − 1) × stagger.
 * Under reduced motion nothing ever rolls and `settled` is true immediately.
 */
export function useOdometer(totalMs: number) {
  const ref = useRef<HTMLElement | null>(null);
  const [rolling, setRolling] = useState(false);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCE).matches) {
      setSettled(true);
      return;
    }
    let timer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(el);
          setRolling(true);
          timer = window.setTimeout(() => setSettled(true), totalMs);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [totalMs]);
  return { ref, rolling, settled };
}

/**
 * Count-up on first view — the numeric (non-odometer) counter, kept for inline
 * figures in body copy where per-digit columns would be overkill.
 * (The reveal system now lives in useInView.ts.)
 */
export function useCounter(target: number, duration = 1400) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  // `settled` lets callers drop tabular figures once counting stops: tabular
  // commas occupy a full digit width, which reads as a gap in the final value.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCE).matches) {
      setValue(target);
      setSettled(true);
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
      else setSettled(true);
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
  return { ref, value, settled };
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
