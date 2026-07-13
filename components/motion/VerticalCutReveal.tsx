"use client";

import { useEffect, useState, type CSSProperties, type ElementType } from "react";
import { cn } from "@/lib/cn";

interface Props {
  text: string;
  mode?: "chars" | "words";
  stagger?: number;
  baseDelay?: number;
  /** starting translateY of each unit; 170% for oversized hero glyphs. */
  from?: string;
  className?: string;
  as?: ElementType;
}

/**
 * Homegrown "Vertical Cut Reveal" (INTERACTIONS §5.1) — clip-masked per-glyph /
 * per-word rise, pure CSS transitions driven by a `--i` custom property.
 * Reveals on mount (timed off the preloader window); snaps under reduced motion.
 */
export function VerticalCutReveal({
  text,
  mode = "words",
  stagger = 32,
  baseDelay = 0,
  from = "120%",
  className,
  as: Tag = "span",
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      setDone(true);
      return;
    }
    const t1 = setTimeout(() => setRevealed(true), 60);
    const t2 = setTimeout(() => setDone(true), baseDelay + 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [baseDelay]);

  const units = mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
  let i = 0;

  return (
    <Tag
      data-revealed={revealed}
      data-vcr-done={done}
      className={className}
      style={
        {
          "--vcr-stagger": `${stagger}ms`,
          "--vcr-base": `${baseDelay}ms`,
          "--vcr-from": from,
        } as CSSProperties
      }
    >
      {units.map((u, idx) => {
        if (u === "" ) return null;
        if (/^\s+$/.test(u)) return <span key={idx}> </span>;
        const n = i++;
        return (
          <span className="vcr" key={idx}>
            <span
              className={cn("vcr-inner")}
              style={{ "--i": n } as CSSProperties}
            >
              {u}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
