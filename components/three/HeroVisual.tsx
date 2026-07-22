import { HeroPoster } from "./HeroPoster";

/**
 * Hero visual slot. Phase 3: static SVG poster only. Phase 4 turns this into
 * the client component that idle-loads the Three.js scene over the poster on
 * capable desktop browsers.
 */
export function HeroVisual() {
  return (
    <div className="relative aspect-[800/560] w-full">
      <HeroPoster className="h-full w-full" />
    </div>
  );
}
