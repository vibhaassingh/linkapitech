"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

interface Options {
  /** IO rootMargin — default reveals slightly before the element bottom-enters. */
  rootMargin?: string;
  /** Fire once and unobserve (default true). */
  once?: boolean;
}

/**
 * In-view flag as REACT STATE. threshold is 0 so wrappers taller than the
 * viewport still fire (the old `.classList.add("in")` system used 0.12 and
 * silently never revealed tall sections). Under reduced motion the flag is
 * true from the first client render, and CSS force-shows everything anyway.
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options: Options = {},
): { ref: RefObject<T | null>; inView: boolean } {
  const { rootMargin = "0px 0px -10% 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia(REDUCE).matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(el);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold: 0, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, once]);

  return { ref, inView };
}
