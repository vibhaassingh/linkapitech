"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Preloader curtain (INTERACTIONS §3) — a purely visual z-indexed cover with a
 * min-display / hard-cap gate and a guillotine wipe. It does NOT lock scroll
 * (matches the corrected source behavior). Skipped entirely under reduced motion.
 */
export function Preloader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRemoved(true);
      return;
    }
    const start = performance.now();
    // Brief branded flash rather than the reference's 1.3s hold: a long opaque
    // curtain dominates LCP/Speed-Index on throttled mobile (PLAN §5 perf gate).
    const MIN = 600;
    const CAP = 2400;
    let raf = 0;

    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(99, (elapsed / MIN) * 100);
      setPct(Math.round(p));
      if (elapsed < MIN) {
        raf = requestAnimationFrame(tick);
      } else {
        setPct(100);
        setTimeout(() => setGone(true), 180);
      }
    };
    raf = requestAnimationFrame(tick);
    const capId = setTimeout(() => {
      setPct(100);
      setGone(true);
    }, CAP);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(capId);
    };
  }, []);

  useEffect(() => {
    if (!gone) return;
    const id = setTimeout(() => setRemoved(true), 900);
    return () => clearTimeout(id);
  }, [gone]);

  if (removed) return null;

  return (
    <div className={cn("curtain", gone && "curtain--gone")} aria-hidden="true">
      <div className="flex flex-col items-center gap-4">
        <span className="font-serif text-3xl italic text-ink">LinkAPI</span>
        <span className="font-sans text-xs uppercase tracking-eyebrow text-ink-3 tabular-nums">
          {pct}%
        </span>
      </div>
    </div>
  );
}
