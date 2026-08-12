import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  OrthographicCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import { PALETTE } from "./palette";

/**
 * Hero ambient field — the WebGL half of the hero visual.
 *
 * Deliberately additive: the SVG arcs in HeroOrbit stay visible underneath and
 * define the composition, so this layer only contributes what SVG can't do
 * cheaply — a drifting particle haze and pulses that travel the arcs. Nothing
 * here is required for the hero to read correctly, which is why the poster path
 * needs no crossfade and no-WebGL clients lose nothing structural.
 *
 * The camera is orthographic and mapped 1:1 onto HeroOrbit's 500×400 viewBox
 * (y increasing downward), so positions can be authored in the same
 * coordinates as the SVG and the two can't drift out of alignment.
 *
 * Budget: 2 draw calls, < 1 ms/frame at 1440p.
 */

const VIEW = { w: 500, h: 400 };
/** Arc geometry, identical to HeroOrbit's: upper semicircles about (250, 340). */
const ARC = { cx: 250, cy: 340, radii: [210, 158, 106] };

const PARTICLE_COUNT = 72;
const PULSES_PER_ARC = 3;
const PULSE_COUNT = ARC.radii.length * PULSES_PER_ARC;

export interface HeroField {
  start(): void;
  stop(): void;
  resize(): void;
  setPointer(nx: number, ny: number): void;
  dispose(): void;
}

/** Deterministic PRNG — the layout must be identical on every load and on the
 *  server-rendered poster, so Math.random is never used. */
function makeRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Soft radial sprite — one shared texture for every point. */
function makeDotTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createHeroField(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  onFirstFrame?: () => void,
): HeroField {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new Scene();
  const camera = new OrthographicCamera(0, VIEW.w, 0, VIEW.h, -100, 100);
  camera.position.z = 10;

  const dot = makeDotTexture();
  const disposables: { dispose(): void }[] = [dot];
  const rand = makeRandom(20260812);

  // ---- drifting particle haze -------------------------------------------
  // Seeded inside the dome's bounding band so the haze reads as part of the
  // arc composition rather than a full-frame starfield.
  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  const pSpeed = new Float32Array(PARTICLE_COUNT);
  const pPhase = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = rand() * Math.PI; // upper half only
    const radius = 40 + rand() * (ARC.radii[0] + 10);
    pPos[i * 3] = ARC.cx + Math.cos(angle) * radius;
    pPos[i * 3 + 1] = ARC.cy - Math.sin(angle) * radius;
    pPos[i * 3 + 2] = 0;
    pSpeed[i] = 1.6 + rand() * 3.4;
    pPhase[i] = rand() * Math.PI * 2;
  }
  const particleGeo = new BufferGeometry();
  particleGeo.setAttribute("position", new BufferAttribute(pPos, 3));
  const particleMat = new PointsMaterial({
    size: 3.4,
    map: dot,
    color: new Color(PALETTE.lavender),
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: false,
  });
  const particles = new Points(particleGeo, particleMat);
  scene.add(particles);
  disposables.push(particleGeo, particleMat);

  // ---- pulses travelling the arcs ---------------------------------------
  const uPos = new Float32Array(PULSE_COUNT * 3);
  const uArc = new Int8Array(PULSE_COUNT);
  const uOffset = new Float32Array(PULSE_COUNT);
  const uSpeed = new Float32Array(PULSE_COUNT);
  for (let a = 0; a < ARC.radii.length; a++) {
    for (let k = 0; k < PULSES_PER_ARC; k++) {
      const i = a * PULSES_PER_ARC + k;
      uArc[i] = a;
      uOffset[i] = k / PULSES_PER_ARC + rand() * 0.12;
      uSpeed[i] = 0.055 + a * 0.012 + rand() * 0.02;
    }
  }
  const pulseGeo = new BufferGeometry();
  pulseGeo.setAttribute("position", new BufferAttribute(uPos, 3));
  const pulseMat = new PointsMaterial({
    size: 6,
    map: dot,
    color: new Color(PALETTE.violet),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: AdditiveBlending,
    sizeAttenuation: false,
  });
  const pulses = new Points(pulseGeo, pulseMat);
  scene.add(pulses);
  disposables.push(pulseGeo, pulseMat);

  // ---- loop --------------------------------------------------------------
  let raf = 0;
  let running = false;
  let firstFrameSent = false;
  let t = 0;
  // Pointer parallax, lerped so the layer glides rather than snapping.
  let pointerX = 0;
  let pointerY = 0;
  let driftX = 0;
  let driftY = 0;
  const MAX_DRIFT = 12;

  // ---- scroll-velocity coupling -------------------------------------------
  // The velocity bus writes --scroll-velocity (−1..1, already lerped) onto
  // <html> as an inline custom property. Reading it back off `.style` is a
  // string lookup on that inline declaration: no getComputedStyle, no style
  // recalc, no layout — cheap enough to do once per frame, which is why it is
  // read here and not per-particle.
  //
  // If nothing ever writes it, getPropertyValue returns "" and the factor
  // stays exactly 1 — i.e. the pre-coupling behaviour, unchanged.
  const root = document.documentElement;
  /** Peak speed swing. ±10% is the brief's ceiling and also about where the
   *  haze stops reading as ambient and starts reading as a scroll indicator. */
  const VELOCITY_GAIN = 0.1;
  let velocity = 0;
  const readVelocity = () => {
    const raw = root.style.getPropertyValue("--scroll-velocity");
    const parsed = raw ? parseFloat(raw) : 0;
    const target = Number.isFinite(parsed)
      ? Math.max(-1, Math.min(1, parsed))
      : 0;
    // A second, gentler lerp on top of the bus's own: even if the bus is ever
    // written from a coarser tick than rAF, the field can never step.
    velocity += (target - velocity) * 0.08;
    return velocity;
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
  };

  const frame = () => {
    if (!running) return;

    // 0.9 … 1.1. Advancing `t` by it rather than reading velocity at each use
    // site means the sway and the arc pulses inherit the same modulation for
    // free, and — because the factor is always positive — `t` stays monotonic,
    // so a fast scroll can never make a pulse run backwards along its arc.
    const flow = 1 + readVelocity() * VELOCITY_GAIN;
    t += flow / 60;

    driftX += (pointerX * MAX_DRIFT - driftX) * 0.045;
    driftY += (pointerY * (MAX_DRIFT * 0.5) - driftY) * 0.045;
    particles.position.set(driftX, driftY, 0);
    pulses.position.set(driftX * 0.6, driftY * 0.6, 0);

    // particles rise slowly and wrap back to the dome's base
    const arr = particleGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const iy = i * 3 + 1;
      arr[iy] -= pSpeed[i] * 0.06 * flow;
      // gentle lateral sway keeps the field from looking like falling rain
      arr[i * 3] += Math.sin(t * 0.5 + pPhase[i]) * 0.045;
      if (arr[iy] < ARC.cy - ARC.radii[0] - 20) arr[iy] = ARC.cy - 10;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // pulses ride their arc from left to right, then loop
    const up = pulseGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const prog = (uOffset[i] + t * uSpeed[i]) % 1;
      const angle = Math.PI - prog * Math.PI; // left → right along the top
      const r = ARC.radii[uArc[i]];
      up[i * 3] = ARC.cx + Math.cos(angle) * r;
      up[i * 3 + 1] = ARC.cy - Math.sin(angle) * r;
      up[i * 3 + 2] = 0;
    }
    pulseGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    if (!firstFrameSent) {
      firstFrameSent = true;
      onFirstFrame?.();
    }
    raf = requestAnimationFrame(frame);
  };

  resize();

  return {
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    resize,
    setPointer(nx, ny) {
      pointerX = nx;
      pointerY = ny;
    },
    dispose() {
      this.stop();
      scene.clear();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
