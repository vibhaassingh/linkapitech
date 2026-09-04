"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroLiquid as Field } from "./scene/createHeroLiquid";

/**
 * Lifecycle harness for the hero's liquid-lens WebGL layer.
 *
 * The scene (scene/createHeroLiquid.ts) is one full-quad fragment-shader lens
 * whose `uWake = 0` pose is the SVG poster's exactly, so the canvas fade below
 * reads as the lens waking up rather than as a swap.
 *
 * Every gate here exists so the layer can never cost a client that won't
 * benefit from it:
 *  - prefers-reduced-motion → never mounts
 *  - viewport < 1024        → never mounts (phones keep the SVG only)
 *  - no WebGL context       → never mounts
 *  - three is dynamically imported on idle, so it stays out of the critical
 *    bundle and cannot delay the hero's LCP text
 *  - rAF is halted whenever the hero scrolls out of view or the tab is hidden
 *  - everything is disposed on unmount
 *
 * The canvas fades in on first frame; because the SVG composition underneath is
 * always present, that fade adds detail rather than swapping one look for
 * another.
 */
export function HeroField() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 1024) return;

    // WebGL probe — some environments throw rather than returning null.
    try {
      const gl =
        canvas.getContext("webgl2") ??
        canvas.getContext("webgl") ??
        canvas.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    let cancelled = false;
    let scene: Field | null = null;
    let runIo: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const onVisibility = () => {
      if (!scene) return;
      if (document.hidden) scene.stop();
      else scene.start();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!scene) return;
      const r = wrap.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      scene.setPointer(
        Math.max(-1, Math.min(1, nx)),
        Math.max(-1, Math.min(1, ny)),
      );
    };

    const boot = async () => {
      if (cancelled) return;
      const { createHeroLiquid } = await import("./scene/createHeroLiquid");
      if (cancelled) return;

      scene = createHeroLiquid(canvas, wrap, () => setLive(true));

      // start/stop with visibility so an off-screen hero costs nothing
      runIo = new IntersectionObserver(
        ([entry]) => {
          if (!scene) return;
          if (entry.isIntersecting && !document.hidden) scene.start();
          else scene.stop();
        },
        { threshold: 0 },
      );
      runIo.observe(wrap);

      ro = new ResizeObserver(() => scene?.resize());
      ro.observe(wrap);

      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    };

    // Defer past first paint so the hero's own LCP text is never held up.
    // requestIdleCallback is in the TS lib but missing on older Safari, so the
    // guard is a runtime typeof rather than a truthiness check.
    const canIdle = typeof window.requestIdleCallback === "function";
    const handle = canIdle
      ? window.requestIdleCallback(() => void boot(), { timeout: 2000 })
      : window.setTimeout(() => void boot(), 900);

    return () => {
      cancelled = true;
      if (canIdle) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
      runIo?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      scene?.dispose();
      scene = null;
    };
  }, []);

  // Poster hand-off. Once the scene has drawn its first frame, flag the lens
  // host so globals.css (`.hero-lens[data-live="true"] [data-poster]`) fades
  // the SVG's poster groups on the same 900ms clock the canvas fades in with.
  // Removed on unmount, so a remount starts from the whole poster again.
  useEffect(() => {
    if (!live) return;
    const host = canvasRef.current?.closest(".hero-lens");
    if (!host) return;
    host.setAttribute("data-live", "true");
    return () => host.removeAttribute("data-live");
  }, [live]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-[900ms] ease-out-expo ${
          live ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
