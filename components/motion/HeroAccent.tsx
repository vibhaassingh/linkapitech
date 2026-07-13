"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "./hooks";

/**
 * Optional WebGL hero accent (PLAN §2 / §8): a slow, near-white domain-warped
 * fbm field with the faintest lime wash, drifting behind the hero headline.
 *
 * Deliberately dependency-free raw WebGL (no three.js/R3F) to protect the LCP
 * and bundle budget (PLAN §5 — Perf ≥ 90). It is:
 *   • lazy — initialised on `requestIdleCallback`, never competing with first paint;
 *   • reduced-motion-gated — renders nothing, the static grain overlay stands in;
 *   • self-degrading — if WebGL is unavailable the canvas stays transparent;
 *   • frugal — DPR-capped, ~30fps, and paused when the tab is hidden or the hero
 *     scrolls out of view.
 */
export function HeroAccent() {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let idleId = 0;
    let cleanup: (() => void) | undefined;

    const boot = () => {
      cleanup = initShader(canvas, () => setReady(true));
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

  // Under reduced motion the static grain overlay is the accent; render nothing.
  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("hero-canvas", ready && "is-ready")}
    />
  );
}

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0) * 1.25;
  float t = u_time * 0.025;

  // domain warp for a slow, flowing mesh-gradient feel
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, -t)));
  float n = fbm(p * 1.3 + q * 1.5 + t);

  // Soft near-white palette: a faint cool mint wash + a rationed lime bloom.
  // Kept light so it never fights the dark (#0d0d0d) headline above it.
  vec3 white = vec3(1.0);
  vec3 cool = vec3(0.855, 0.898, 0.871); // faint mint-gray
  vec3 lime = vec3(0.776, 0.984, 0.314); // ≈ #C6FB50
  vec3 col = mix(white, cool, smoothstep(0.20, 0.90, n) * 0.75);
  col = mix(col, lime, smoothstep(0.55, 1.0, q.x) * 0.16); // ≤16% lime bloom

  // radial vignette fades the field into the page edges
  float vig = smoothstep(1.25, 0.18, length(uv - 0.5));
  gl_FragColor = vec4(col, vig * 0.9);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** Sets up WebGL and a throttled, visibility-aware RAF loop. Returns a cleanup. */
function initShader(canvas: HTMLCanvasElement, onReady: () => void): (() => void) | undefined {
  const gl =
    (canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false }) as
      | WebGLRenderingContext
      | null) ||
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
  if (!gl) return undefined;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return undefined;

  const prog = gl.createProgram();
  if (!prog) return undefined;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return undefined;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // single oversized triangle
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uTime = gl.getUniformLocation(prog, "u_time");

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let last = 0;
  let start = 0;
  let visible = !document.hidden;
  let onScreen = true;
  const FRAME = 1000 / 30; // cap at ~30fps

  const render = (now: number) => {
    raf = requestAnimationFrame(render);
    if (!visible || !onScreen) return;
    if (now - last < FRAME) return;
    last = now;
    if (!start) start = now;
    resize();
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  raf = requestAnimationFrame(render);
  onReady();

  const onVisibility = () => {
    visible = !document.hidden;
  };
  document.addEventListener("visibilitychange", onVisibility);

  // Pause work while the hero is scrolled off-screen.
  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    io.disconnect();
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buf);
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  };
}
