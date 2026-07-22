"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "./hooks";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis smooth-scroll provider — one requestAnimationFrame loop, no GSAP
 * (the institutional motion system is CSS + IntersectionObserver only).
 * Disabled entirely under reduced motion; mount only in the (marketing)
 * layout, never the root.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const l = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(l);

    let raf = 0;
    const loop = (time: number) => {
      l.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/**
 * Freeze page scroll while a full-screen overlay is open. Stops Lenis when
 * present, and always locks body overflow as a fallback.
 */
export function useScrollLock(active: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!active) return;
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = prev;
    };
  }, [active, lenis]);
}
