import {
  BufferGeometry,
  CanvasTexture,
  EllipseCurve,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  RingGeometry,
  Mesh,
  MeshBasicMaterial,
  CircleGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { PALETTE } from "./palette";

/**
 * "Connective arc network" hero scene — LinkAPI hub, four bank nodes on a
 * shallow 3D arc, fine navy bezier connections, silver pulses traveling
 * them, a faint backdrop ring. Static camera; the whole group drifts ±2°
 * toward the pointer. Runs its own single RAF loop (start/stop from the
 * lifecycle hook); label DOM nodes are positioned here, inside the same
 * frame, to avoid layout thrash.
 *
 * Budget: <25 draw calls, <2ms script/frame.
 */

export interface HeroScene {
  start(): void;
  stop(): void;
  resize(): void;
  setPointer(nx: number, ny: number): void;
  dispose(): void;
}

/** Node layout mirrors HeroPoster.tsx composition (index order = CLIENTS). */
const NODE_POS: [number, number, number][] = [
  [-2.7, 1.35, -0.4],
  [2.55, 1.75, -0.9],
  [2.75, -1.0, 0.15],
  [-2.45, -1.55, -0.25],
];
const HUB = new Vector3(0, -0.15, 0);

const PULSE_COUNT_PER_ARC = 3;

function dotSprite(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.9)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new CanvasTexture(c);
}

export function createHeroScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  labels: (HTMLElement | null)[],
  onFirstFrame: () => void,
): HeroScene {
  const rawDpr = window.devicePixelRatio || 1;
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: rawDpr <= 1.5, // retina already oversamples; skip MSAA there
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(rawDpr, 1.5));

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 9.2);

  const group = new Group();
  scene.add(group);

  const disposables: { dispose(): void }[] = [];

  // Backdrop rings
  const ringPts = new EllipseCurve(0, 0, 3.1, 3.1, 0, Math.PI * 2, false, 0).getPoints(90);
  const ringGeo = new BufferGeometry().setFromPoints(ringPts);
  const ringMat = new LineBasicMaterial({
    color: PALETTE.ink,
    transparent: true,
    opacity: 0.055,
  });
  disposables.push(ringGeo, ringMat);
  const ring = new LineLoop(ringGeo, ringMat);
  const ring2 = new LineLoop(ringGeo, ringMat);
  ring2.scale.setScalar(0.68);
  group.add(ring, ring2);

  // Arcs
  const curves: QuadraticBezierCurve3[] = [];
  const arcMat = new LineBasicMaterial({
    color: PALETTE.navy900,
    transparent: true,
    opacity: 0.22,
  });
  disposables.push(arcMat);
  NODE_POS.forEach(([x, y, z]) => {
    const end = new Vector3(x, y, z);
    const mid = end.clone().lerp(HUB, 0.5);
    mid.y += end.x < 0 ? -0.55 : 0.55;
    mid.z += 0.4;
    const curve = new QuadraticBezierCurve3(end, mid, HUB);
    curves.push(curve);
    const geo = new BufferGeometry().setFromPoints(curve.getPoints(64));
    disposables.push(geo);
    group.add(new Line(geo, arcMat));
  });

  // Nodes: outer ring + core dot per bank node, heavier pair for the hub
  const nodeRingGeo = new RingGeometry(0.115, 0.13, 40);
  const nodeCoreGeo = new CircleGeometry(0.045, 24);
  const hubRingGeo = new RingGeometry(0.16, 0.18, 44);
  const hubCoreGeo = new CircleGeometry(0.06, 24);
  const steelMat = new MeshBasicMaterial({ color: PALETTE.steel, transparent: true, opacity: 0.95 });
  const navyMat = new MeshBasicMaterial({ color: PALETTE.navy900 });
  disposables.push(nodeRingGeo, nodeCoreGeo, hubRingGeo, hubCoreGeo, steelMat, navyMat);
  NODE_POS.forEach(([x, y, z]) => {
    const r = new Mesh(nodeRingGeo, steelMat);
    const c = new Mesh(nodeCoreGeo, steelMat);
    r.position.set(x, y, z);
    c.position.set(x, y, z);
    group.add(r, c);
  });
  const hubRing = new Mesh(hubRingGeo, navyMat);
  const hubCore = new Mesh(hubCoreGeo, navyMat);
  hubRing.position.copy(HUB);
  hubCore.position.copy(HUB);
  group.add(hubRing, hubCore);

  // Pulses — one Points buffer for all arcs
  const pulseTotal = curves.length * PULSE_COUNT_PER_ARC;
  const pulseGeo = new BufferGeometry();
  pulseGeo.setAttribute("position", new Float32BufferAttribute(new Float32Array(pulseTotal * 3), 3));
  const colors = new Float32Array(pulseTotal * 3);
  for (let i = 0; i < pulseTotal; i++) {
    const navy = i % 4 === 1;
    const c = navy ? [0x1e / 0xff, 0x4a / 0xff, 0x94 / 0xff] : [0x8f / 0xff, 0xa1 / 0xff, 0xbc / 0xff];
    colors.set(c, i * 3);
  }
  pulseGeo.setAttribute("color", new Float32BufferAttribute(colors, 3));
  const sprite = dotSprite();
  const pulseMat = new PointsMaterial({
    size: 0.09,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  disposables.push(pulseGeo, pulseMat, sprite);
  const pulses = new Points(pulseGeo, pulseMat);
  group.add(pulses);

  const pulseState = Array.from({ length: pulseTotal }, (_, i) => ({
    arc: i % curves.length,
    t: (i * 0.37 + (i % curves.length) * 0.21) % 1,
    speed: 0.0016 + (i % 5) * 0.0005,
  }));

  // Pointer drift
  let targetRX = 0;
  let targetRY = 0;
  const MAX_TILT = (2 * Math.PI) / 180;

  const nodeWorld = NODE_POS.map(([x, y, z]) => new Vector3(x, y, z));
  const hubLabelPos = HUB.clone().add(new Vector3(0, -0.55, 0));
  const projected = new Vector3();

  let raf = 0;
  let running = false;
  let firstFrame = true;

  const tick = () => {
    // pulses along arcs
    const pos = pulseGeo.getAttribute("position") as Float32BufferAttribute;
    for (let i = 0; i < pulseTotal; i++) {
      const s = pulseState[i];
      s.t = (s.t + s.speed) % 1;
      const p = curves[s.arc].getPointAt(s.t);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;

    // lerped pointer drift
    group.rotation.x += (targetRX - group.rotation.x) * 0.05;
    group.rotation.y += (targetRY - group.rotation.y) * 0.05;
    ring.rotation.z += 0.0004;
    ring2.rotation.z -= 0.0003;

    renderer.render(scene, camera);

    // project labels in the same frame (single write pass, translate3d only)
    const w = container.clientWidth;
    const h = container.clientHeight;
    const place = (world: Vector3, el: HTMLElement | null) => {
      if (!el) return;
      projected.copy(world).applyMatrix4(group.matrixWorld).project(camera);
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };
    nodeWorld.forEach((v, i) => place(v, labels[i]));
    place(hubLabelPos, labels[nodeWorld.length]);

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
      targetRY = nx * MAX_TILT;
      targetRX = ny * MAX_TILT * 0.7;
    },
    dispose() {
      this.stop();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
