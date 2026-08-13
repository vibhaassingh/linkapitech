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

/*
 * `useScrollFill` used to live here — a scroll-listener hook that wrote `--fill`
 * (0→1) to the process rail. It is removed as dead code: ProcessRail now drives
 * the rail from a CSS scroll-driven animation instead, so the hook had zero
 * consumers and every scroll event it registered was pure cost. The discipline
 * it established (never put a per-frame value through React state) is carried
 * forward in ProcessRail's own comment.
 */
