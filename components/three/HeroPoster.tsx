import { CLIENTS } from "@/content/clients";

/**
 * Static SVG poster of the "connective arc network" — LinkAPI as the hub,
 * the bank marks as nodes. Served in the initial HTML always (LCP-safe,
 * zero CLS); the live Three.js scene (Phase 4) crossfades in over it on
 * capable desktop browsers and this stays as the only visual under
 * reduced-motion, no-WebGL, or mobile.
 *
 * Node order matches CLIENTS: HSBC, Axis Bank, IndusInd Bank, Aditya Birla.
 */
const NODES = [
  { x: 150, y: 150 },
  { x: 640, y: 110 },
  { x: 660, y: 400 },
  { x: 170, y: 440 },
];
const HUB = { x: 400, y: 285 };

export function HeroPoster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 560"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {/* faint backdrop orbits */}
      <circle cx={HUB.x} cy={HUB.y} r="215" stroke="#0B1B33" strokeOpacity="0.05" />
      <circle cx={HUB.x} cy={HUB.y} r="150" stroke="#0B1B33" strokeOpacity="0.04" />

      {/* connection arcs */}
      {NODES.map((n, i) => {
        const mx = (n.x + HUB.x) / 2 + (n.y < HUB.y ? -30 : 30);
        const my = (n.y + HUB.y) / 2 + (n.x < HUB.x ? -36 : 36);
        return (
          <path
            key={i}
            d={`M ${n.x} ${n.y} Q ${mx} ${my} ${HUB.x} ${HUB.y}`}
            stroke="#0A1F44"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
        );
      })}

      {/* data pulses frozen mid-arc */}
      <circle cx="278" cy="200" r="3" fill="#8FA1BC" />
      <circle cx="527" cy="180" r="3" fill="#1E4A94" fillOpacity="0.8" />
      <circle cx="540" cy="360" r="3" fill="#8FA1BC" />
      <circle cx="282" cy="380" r="2.5" fill="#8FA1BC" fillOpacity="0.8" />

      {/* bank nodes + labels */}
      {NODES.map((n, i) => {
        const client = CLIENTS[i];
        if (!client) return null;
        const anchor = n.x < HUB.x ? "end" : "start";
        const tx = n.x < HUB.x ? n.x - 16 : n.x + 16;
        return (
          <g key={client.name}>
            <circle cx={n.x} cy={n.y} r="10" stroke="#8FA1BC" strokeOpacity="0.9" />
            <circle cx={n.x} cy={n.y} r="3.5" fill="#8FA1BC" />
            <text
              x={tx}
              y={n.y + 4}
              textAnchor={anchor}
              fontFamily="var(--font-mono), monospace"
              fontSize="12"
              letterSpacing="0.1em"
              fill="#5E6E86"
            >
              {client.name.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* hub */}
      <circle cx={HUB.x} cy={HUB.y} r="14" stroke="#0A1F44" strokeWidth="1.4" />
      <circle cx={HUB.x} cy={HUB.y} r="5" fill="#0A1F44" />
      <text
        x={HUB.x}
        y={HUB.y + 38}
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
        fontSize="12"
        letterSpacing="0.14em"
        fill="#0B1B33"
      >
        LINKAPI
      </text>
    </svg>
  );
}
