import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Group,
  LineSegments,
  LineBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { PALETTE } from "./palette";

/**
 * "Secure mesh" ambient field — a wide, calm constellation of nodes joined by
 * fine steel lines, with a few violet/steel pulses moving along the links
 * (encrypted traffic on a private network). Tuned to sit UNDER the dark navy
 * Security band: transparent canvas, low line opacity, slow drift. Fixed edge
 * topology (nearest-neighbour, computed once) so no O(n²) work runs per frame.
 *
 * Budget: 3 draw calls (lines, nodes, pulses); ~34 nodes; <1ms script/frame.
 */

export interface MeshField {
  start(): void;
  stop(): void;
  resize(): void;
  setPointer(nx: number, ny: number): void;
  dispose(): void;
}

const NODE_COUNT = 34;
const NEIGHBOURS = 2; // links each node draws to its nearest peers
const PULSE_COUNT = 9;

// Deterministic pseudo-random so the layout is stable across reloads/SSR-free
// mounts (no Math.random — avoids hydration-adjacent surprises and flicker).
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function dotSprite(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new CanvasTexture(c);
}

export function createMeshField(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  onFirstFrame: () => void,
): MeshField {
  const rand = seeded(20260722);
  const rawDpr = window.devicePixelRatio || 1;
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: rawDpr <= 1.5,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(rawDpr, 1.5));

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  const group = new Group();
  scene.add(group);

  const disposables: { dispose(): void }[] = [];

  // --- Node home positions + per-node drift phase -------------------------
  const HALF_W = 6.6;
  const HALF_H = 2.6;
  const home: Vector3[] = [];
  const phase: number[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    home.push(
      new Vector3(
        (rand() * 2 - 1) * HALF_W,
        (rand() * 2 - 1) * HALF_H,
        (rand() * 2 - 1) * 0.9,
      ),
    );
    phase.push(rand() * Math.PI * 2);
  }
  const live = home.map((v) => v.clone());

  // --- Fixed edge topology: each node → its nearest NEIGHBOURS ------------
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const dists = home
      .map((v, j) => ({ j, d: v.distanceToSquared(home[i]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d);
    for (let k = 0; k < NEIGHBOURS; k++) {
      const j = dists[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([i, j]);
      }
    }
  }

  // --- Lines --------------------------------------------------------------
  const linePos = new Float32Array(edges.length * 6);
  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new Float32BufferAttribute(linePos, 3));
  const lineMat = new LineBasicMaterial({
    color: PALETTE.steel,
    transparent: true,
    opacity: 0.16,
  });
  disposables.push(lineGeo, lineMat);
  group.add(new LineSegments(lineGeo, lineMat));

  // --- Nodes --------------------------------------------------------------
  const nodePos = new Float32Array(NODE_COUNT * 3);
  const nodeGeo = new BufferGeometry();
  nodeGeo.setAttribute("position", new Float32BufferAttribute(nodePos, 3));
  const sprite = dotSprite();
  const nodeMat = new PointsMaterial({
    size: 0.12,
    map: sprite,
    color: PALETTE.steel2,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  disposables.push(nodeGeo, nodeMat, sprite);
  group.add(new Points(nodeGeo, nodeMat));

  // --- Pulses travelling along random edges -------------------------------
  const pulseGeo = new BufferGeometry();
  pulseGeo.setAttribute("position", new Float32BufferAttribute(new Float32Array(PULSE_COUNT * 3), 3));
  const pulseColors = new Float32Array(PULSE_COUNT * 3);
  for (let i = 0; i < PULSE_COUNT; i++) {
    const violet = i % 3 === 0;
    const c = violet
      ? [0x6d / 0xff, 0x5a / 0xff, 0xe6 / 0xff]
      : [0xc3 / 0xff, 0xcd / 0xff, 0xdc / 0xff];
    pulseColors.set(c, i * 3);
  }
  pulseGeo.setAttribute("color", new Float32BufferAttribute(pulseColors, 3));
  const pulseMat = new PointsMaterial({
    size: 0.16,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  disposables.push(pulseGeo, pulseMat);
  group.add(new Points(pulseGeo, pulseMat));

  const pulseState = Array.from({ length: PULSE_COUNT }, (_, i) => ({
    edge: Math.floor(rand() * edges.length),
    t: rand(),
    speed: 0.0022 + rand() * 0.003,
  }));

  // Pointer parallax
  let targetX = 0;
  let targetY = 0;
  const MAX_SHIFT = 0.25;

  let raf = 0;
  let running = false;
  let firstFrame = true;
  let clock = 0;

  const tick = () => {
    clock += 0.01;

    // drift nodes around their home position
    const np = nodeGeo.getAttribute("position") as Float32BufferAttribute;
    for (let i = 0; i < NODE_COUNT; i++) {
      const h = home[i];
      const ph = phase[i];
      live[i].set(
        h.x + Math.sin(clock * 0.5 + ph) * 0.22,
        h.y + Math.cos(clock * 0.42 + ph) * 0.2,
        h.z + Math.sin(clock * 0.3 + ph) * 0.15,
      );
      np.setXYZ(i, live[i].x, live[i].y, live[i].z);
    }
    np.needsUpdate = true;

    // rebuild line endpoints from live node positions
    const lp = lineGeo.getAttribute("position") as Float32BufferAttribute;
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      lp.setXYZ(e * 2, live[a].x, live[a].y, live[a].z);
      lp.setXYZ(e * 2 + 1, live[b].x, live[b].y, live[b].z);
    }
    lp.needsUpdate = true;

    // pulses ride their edge, then hop to another
    const pp = pulseGeo.getAttribute("position") as Float32BufferAttribute;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const s = pulseState[i];
      s.t += s.speed;
      if (s.t >= 1) {
        s.t = 0;
        s.edge = Math.floor(rand() * edges.length);
      }
      const [a, b] = edges[s.edge];
      pp.setXYZ(
        i,
        live[a].x + (live[b].x - live[a].x) * s.t,
        live[a].y + (live[b].y - live[a].y) * s.t,
        live[a].z + (live[b].z - live[a].z) * s.t,
      );
    }
    pp.needsUpdate = true;

    // eased pointer parallax
    group.position.x += (targetX - group.position.x) * 0.04;
    group.position.y += (targetY - group.position.y) * 0.04;

    renderer.render(scene, camera);

    if (firstFrame) {
      firstFrame = false;
      onFirstFrame();
    }
    if (running) raf = requestAnimationFrame(tick);
  };

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  return {
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    resize,
    setPointer(nx: number, ny: number) {
      targetX = nx * MAX_SHIFT;
      targetY = ny * MAX_SHIFT;
    },
    dispose() {
      this.stop();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
