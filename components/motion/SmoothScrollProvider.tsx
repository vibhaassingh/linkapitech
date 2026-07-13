"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./hooks";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

// Module-level guard so StrictMode double-invoke / Fast Refresh don't re-register.
let registered = false;

/**
 * Module-level handle to the live Lenis instance. Lets components rendered
 * OUTSIDE this provider (e.g. the root-level `@modal` parallel slot, which is
 * not a descendant of the marketing layout) freeze the smooth-scrolled
 * background without needing the React context.
 */
let lenisSingleton: Lenis | null = null;
export const getLenis = () => lenisSingleton;

/**
 * Lenis + GSAP/ScrollTrigger provider (INTERACTIONS-AND-MOTION §1.1, §2).
 * Drives Lenis from `gsap.ticker` ONLY (avoids the source's double-RAF bug),
 * and disables smoothing entirely under reduced motion (native scroll instead).
 * Mount only in the (marketing) layout, never the root.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }
    if (reduced) return;

    const l = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    setLenis(l);
    lenisSingleton = l;

    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
      lenisSingleton = null;
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [reduced]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/**
 * Freeze page scroll while a full-screen overlay is open (INTERACTIONS §2.3).
 * Stops Lenis when present, and always locks body overflow as a fallback.
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
