"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { MeshField } from "./scene/createMeshField";

/**
 * Ambient "secure mesh" behind the Security band. Purely decorative — the
 * navy section colour is the always-present fallback, so there is no poster and
 * nothing to lose on mobile / reduced-motion / no-WebGL, where the scene simply
 * never loads. three is dynamically imported only once the band nears the
 * viewport, so it never touches the critical path and never downloads on
 * clients that will not run it.
 */
export function SecurityMesh() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 1024) return;

    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
      if (!gl) return;
    } catch {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let scene: MeshField | null = null;
    let cancelled = false;
    let runIo: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;

    const onPointerMove = (e: PointerEvent) => {
      if (!scene || !containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
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
      if (!canvas || cancelled) return;
      const { createMeshField } = await import("./scene/createMeshField");
      if (cancelled) return;

      scene = createMeshField(canvas, container, () => setLive(true));

      // Render only while the band is on screen.
      runIo = new IntersectionObserver(
        ([entry]) => {
          if (!scene) return;
          if (entry.isIntersecting && !document.hidden) scene.start();
          else scene.stop();
        },
        { threshold: 0 },
      );
      runIo.observe(container);
      ro = new ResizeObserver(() => scene?.resize());
      ro.observe(container);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    };

    // Defer the whole thing until the band is within ~one viewport of entering.
    const bootIo = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          bootIo.disconnect();
          void boot();
        }
      },
      { rootMargin: "300px 0px" },
    );
    bootIo.observe(container);

    return () => {
      cancelled = true;
      bootIo.disconnect();
      runIo?.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      scene?.dispose();
      scene = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full opacity-0 transition-opacity duration-[900ms] ease-out-expo",
          live && "opacity-100",
        )}
      />
    </div>
  );
}
