"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const CLICK =
  'a[href],button,[role="button"],[data-cursor],summary,label[for],select';
const TEXT = "input,textarea,[contenteditable='true']";

type CurState = "default" | "hand" | "view" | "text";

/**
 * Custom cursor (INTERACTIONS §4 / DESIGN-SYSTEM §5.11). Raw 1:1 follow (no
 * lerp). Simplified faithful version: arrow → hand → lime "VIEW" ring, plus a
 * click ripple. Gated on `any-pointer:fine`; CSS backstop keeps a native cursor
 * if JS never runs. Reduced motion: no ripple.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CurState>("default");

  useEffect(() => {
    if (!window.matchMedia("(any-pointer:fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("cur-on");

    const move = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.opacity = "1";
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !t.closest) return;
      if (t.closest('[data-cursor="view"]')) return setState("view");
      if (t.closest(TEXT)) return setState("text");
      setState(t.closest(CLICK) ? "hand" : "default");
    };
    const down = () => el.classList.add("cur--down");
    const up = () => {
      el.classList.remove("cur--down");
      if (reduced) return;
      const ring = document.createElement("span");
      ring.className = "cur-ring";
      el.appendChild(ring);
      setTimeout(() => ring.remove(), 560);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      document.documentElement.classList.remove("cur-on");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <div ref={ref} className={cn("cur", `cur--${state}`)} aria-hidden="true">
      <svg className="cur-arrow" viewBox="0 0 24 24" width="22" height="22">
        <path
          d="M4 3l6 16 2.5-6.5L19 10 4 3z"
          fill="var(--ink)"
          stroke="#fff"
          strokeWidth="1.2"
        />
      </svg>
      <span className="cur-dot" />
      <span className="cur-view">
        <svg viewBox="0 0 90 90" width="90" height="90">
          <defs>
            <path id="curView" d="M45,45 m-32,0 a32,32 0 1,1 64,0 a32,32 0 1,1 -64,0" />
          </defs>
          <text className="cur-view-text">
            <textPath href="#curView">
              VIEW · VIEW · VIEW · VIEW · VIEW ·
            </textPath>
          </text>
        </svg>
        <span className="cur-view-arrow">→</span>
      </span>
    </div>
  );
}
