"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "./hooks";

/**
 * Interactive hero graphic (PLAN §2 / §8) — a drifting "connections" network of
 * nodes joined by hairlines that light up and fan toward the cursor, with a few
 * lime accent nodes. It literalises the hero headline ("Secure connections that
 * grow with you") and gives the hero a live, tactile centrepiece.
 *
 * Dependency-free 2D canvas (no three.js/R3F) to protect the LCP + bundle budget
 * (PLAN §5 — Perf ≥ 90). It is:
 *   • lazy — initialised on `requestIdleCallback`, never competing with first paint;
 *   • reduced-motion-safe — draws ONE static constellation, no animation/cursor;
 *   • self-degrading — if the 2D context is unavailable the canvas stays transparent;
 *   • frugal — DPR-capped, ~40fps, O(n²) links over a small node set, and paused
 *     when the tab is hidden or the hero scrolls out of view;
 *   • pointer-gated — cursor interaction only on a fine pointer (desktop).
 *
 * Colours are read from the design tokens (`--ink`, `--accent`) at init, so the
 * canvas never hardcodes a hex a token already covers (CLAUDE.md).
 */
export function HeroAccent() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let idleId = 0;
    let cleanup: (() => void) | undefined;
    const boot = () => {
      cleanup = initNetwork(canvas, reduced, () => setReady(true));
    };

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(boot, { timeout: 1500 });
    } else {
      idleId = window.setTimeout(boot, 700);
    }

    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      cleanup?.();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("hero-canvas", ready && "is-ready")}
    />
  );
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  accent: boolean;
}

function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** "#0d0d0d" | "#4a2545" → {r,g,b}. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Sets up the connections network and a throttled, visibility-aware RAF loop.
 * Returns a cleanup. When `reduced` is true it draws a single static frame.
 */
function initNetwork(
  canvas: HTMLCanvasElement,
  reduced: boolean,
  onReady: () => void,
): (() => void) | undefined {
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  const ink = hexToRgb(readToken("--ink", "#0d0d0d"));
  const lime = hexToRgb(readToken("--accent", "#4a2545"));
  const inkRGBA = (a: number) => `rgba(${ink.r},${ink.g},${ink.b},${a})`;
  const limeRGBA = (a: number) => `rgba(${lime.r},${lime.g},${lime.b},${a})`;

  const fine =
    typeof window !== "undefined" && window.matchMedia("(any-pointer:fine)").matches;

  const LINK_DIST = 142; // px between nodes to draw a link
  const CURSOR_DIST = 220; // px around cursor to fan links + attract
  let dpr = 1;
  let w = 0;
  let h = 0;
  let nodes: Node[] = [];

  const build = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Density scales with area but is capped for perf; ~1 node / 15k px².
    const count = Math.max(18, Math.min(72, Math.round((w * h) / 15000)));
    nodes = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      accent: i % 7 === 0, // ~1 in 7 nodes is a lime accent
    }));
  };
  build();

  const mouse = { x: 0, y: 0, active: false };
  const onMove = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mouse.active = x >= 0 && x <= w && y >= 0 && y <= h;
    mouse.x = x;
    mouse.y = y;
  };
  const onLeave = () => {
    mouse.active = false;
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    // node ↔ node links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = inkRGBA((1 - d / LINK_DIST) * 0.26);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // cursor → node links (brighter, lime) + a soft glow
    if (mouse.active) {
      const grad = ctx.createRadialGradient(
        mouse.x, mouse.y, 0, mouse.x, mouse.y, CURSOR_DIST,
      );
      grad.addColorStop(0, limeRGBA(0.14));
      grad.addColorStop(1, limeRGBA(0));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const n of nodes) {
        const d = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (d < CURSOR_DIST) {
          const t = 1 - d / CURSOR_DIST;
          ctx.strokeStyle = limeRGBA(t * 0.65);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      const near = mouse.active && Math.hypot(n.x - mouse.x, n.y - mouse.y) < CURSOR_DIST;
      if (n.accent) {
        ctx.fillStyle = limeRGBA(near ? 1 : 0.85);
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? 3 : 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = inkRGBA(near ? 0.7 : 0.45);
        ctx.beginPath();
        ctx.arc(n.x, n.y, near ? 2.2 : 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const step = () => {
    for (const n of nodes) {
      // gentle attraction toward the cursor
      if (mouse.active) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < CURSOR_DIST && d > 0.5) {
          const pull = (1 - d / CURSOR_DIST) * 0.045;
          n.vx += (dx / d) * pull;
          n.vy += (dy / d) * pull;
        }
      }
      n.x += n.vx;
      n.y += n.vy;
      // friction keeps drift calm after cursor nudges
      n.vx *= 0.99;
      n.vy *= 0.99;
      // keep a minimum drift so the field never freezes
      if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.05;
      if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.05;
      // bounce off edges
      if (n.x < 0) { n.x = 0; n.vx *= -1; }
      else if (n.x > w) { n.x = w; n.vx *= -1; }
      if (n.y < 0) { n.y = 0; n.vy *= -1; }
      else if (n.y > h) { n.y = h; n.vy *= -1; }
    }
  };

  // Reduced motion: one static frame, no listeners, no loop.
  if (reduced) {
    draw();
    onReady();
    const onResize = () => { build(); draw(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }

  let raf = 0;
  let last = 0;
  let visible = document.visibilityState !== "hidden";
  let onScreen = true;
  const FRAME = 1000 / 40; // ~40fps

  const render = (now: number) => {
    raf = requestAnimationFrame(render);
    if (!visible || !onScreen) return;
    if (now - last < FRAME) return;
    last = now;
    step();
    draw();
  };
  draw(); // paint an immediate first frame so the hero is never blank at load
  raf = requestAnimationFrame(render);
  onReady();

  const onResize = () => build();
  window.addEventListener("resize", onResize);
  if (fine) {
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseout", onLeave, { passive: true });
  }
  const onVisibility = () => { visible = !document.hidden; };
  document.addEventListener("visibilitychange", onVisibility);
  const io = new IntersectionObserver(
    ([entry]) => { onScreen = entry.isIntersecting; },
    { threshold: 0 },
  );
  io.observe(canvas);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseout", onLeave);
    document.removeEventListener("visibilitychange", onVisibility);
    io.disconnect();
  };
}
