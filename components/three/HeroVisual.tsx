"use client";

import { useEffect, useRef, useState } from "react";
import { HeroPoster } from "./HeroPoster";
import { CLIENTS } from "@/content/clients";
import { cn } from "@/lib/cn";
import type { HeroScene } from "./scene/createHeroScene";

/**
 * Hero visual: the static SVG poster is always server-rendered (LCP-safe,
 * zero CLS). On capable desktop browsers only — width ≥1024, no
 * prefers-reduced-motion, working WebGL — the Three.js scene is dynamically
 * imported at browser idle and crossfaded in over the poster. three never
 * enters the critical bundle; mobile and reduced-motion users keep the
 * poster and never download it.
 */
export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 1024) return;

    // WebGL probe — bail silently to the poster on any failure.
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
      if (!gl) return;
    } catch {
      return;
    }

    let scene: HeroScene | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let idleId = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onPointerMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el || !scene) return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      scene.setPointer(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)));
    };
    const onVisibility = () => {
      if (!scene) return;
      if (document.hidden) scene.stop();
      else scene.start();
    };

    const boot = async () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || cancelled) return;
      const { createHeroScene } = await import("./scene/createHeroScene");
      if (cancelled) return;

      scene = createHeroScene(canvas, container, labelRefs.current, () => {
        // first rendered frame → crossfade poster → canvas
        setLive(true);
      });
      scene.start();

      // RAF halts entirely while the hero is off-screen.
      io = new IntersectionObserver(
        ([entry]) => {
          if (!scene) return;
          if (entry.isIntersecting && !document.hidden) scene.start();
          else scene.stop();
        },
        { threshold: 0 },
      );
      io.observe(container);
      ro = new ResizeObserver(() => scene?.resize());
      ro.observe(container);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => void boot(), { timeout: 2000 });
    } else {
      idleTimer = setTimeout(() => void boot(), 1000);
    }

    return () => {
      cancelled = true;
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (idleTimer) clearTimeout(idleTimer);
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      scene?.dispose();
      scene = null;
    };
  }, []);

  const labelNames = [...CLIENTS.map((c) => c.name.toUpperCase()), "LINKAPI"];

  return (
    <div ref={containerRef} className="relative aspect-[800/560] w-full" aria-hidden="true">
      <HeroPoster
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-[600ms] ease-out-expo",
          live && "opacity-0",
        )}
      />
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[600ms] ease-out-expo",
          live && "opacity-100",
        )}
      />
      {/* HTML labels — real text, crisp at any DPR, positioned per frame by the
          scene (outer span gets the projected translate3d; inner span carries
          the anchor offset so the two transforms never fight). */}
      <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-[600ms]", live && "opacity-100")}>
        {labelNames.map((name, i) => {
          const isHub = i === labelNames.length - 1;
          const leftSide = !isHub && i % 3 === 0; // node order: indexes 0 and 3 sit left of the hub
          return (
            <span
              key={name}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute left-0 top-0 will-change-transform"
            >
              <span
                className={cn(
                  "block whitespace-nowrap font-mono text-[11px] tracking-eyebrow",
                  isHub ? "text-ink" : "text-ink-3",
                )}
                style={{
                  transform: isHub
                    ? "translate(-50%, 6px)"
                    : leftSide
                      ? "translate(calc(-100% - 14px), -50%)"
                      : "translate(14px, -50%)",
                }}
              >
                {name}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
