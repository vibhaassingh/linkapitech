import type { CSSProperties } from "react";

/**
 * Decorative "ledger flow" behind the stat band — fine steel connectors with
 * travelling dashes and a few softly pulsing violet nodes. Pure SVG + CSS
 * (no JS, no canvas); animation is neutralised under reduced motion by the
 * global rule in globals.css. Rendered aria-hidden, behind the numbers.
 */
const LINES: { d: string; dur: string; delay: string }[] = [
  { d: "M-20 72 Q 300 52 600 72 T 1220 72", dur: "7s", delay: "0s" },
  { d: "M-20 130 Q 320 150 640 130 T 1220 130", dur: "9.5s", delay: "-2s" },
  { d: "M-20 188 Q 300 168 600 188 T 1220 188", dur: "11s", delay: "-4s" },
];

const NODES: { cx: number; cy: number; r: number; delay: string }[] = [
  { cx: 150, cy: 72, r: 3, delay: "0s" },
  { cx: 600, cy: 72, r: 3.5, delay: "-1.2s" },
  { cx: 1050, cy: 130, r: 3, delay: "-0.6s" },
  { cx: 320, cy: 130, r: 3, delay: "-2.4s" },
  { cx: 600, cy: 188, r: 3.5, delay: "-1.8s" },
  { cx: 900, cy: 188, r: 3, delay: "-3s" },
];

export function StatFlow() {
  return (
    <svg
      className="stat-flow"
      viewBox="0 0 1200 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {LINES.map((l, i) => (
        <path
          key={i}
          className="stat-flow-line"
          d={l.d}
          style={{ "--flow-d": l.dur, animationDelay: l.delay } as CSSProperties}
        />
      ))}
      {NODES.map((n, i) => (
        <circle
          key={i}
          className="stat-flow-node"
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          style={{ animationDelay: n.delay }}
        />
      ))}
    </svg>
  );
}
