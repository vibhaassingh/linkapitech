import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this app (a stray parent lockfile confuses inference).
  outputFileTracingRoot: process.cwd(),
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["three"],
    /**
     * Cross-route View Transitions. EXPERIMENTAL — read this before keeping it.
     *
     * WHAT IT ACTUALLY DOES: it does not just unlock an API. Next resolves its
     * bundled React channel to `react-experimental` whenever this (or ppr /
     * taint / routerBFCache) is on — see needsExperimentalReact in
     * next/dist/lib. So the whole app runs on React's experimental build, and
     * `.next` must be rebuilt from cold when this flag changes.
     *
     * Progressive enhancement is handled in the app, not here:
     * components/chrome/RouteTransition.tsx reads `unstable_ViewTransition` off
     * the React namespace and renders its children untouched when it is absent
     * (flag off, or a browser without View Transitions), and chrome.css §6
     * makes every `::view-transition-*` animation `none` under
     * `prefers-reduced-motion`.
     *
     * REVERT RECIPE (perf/jank/CLS gate regressions — pre-authorised):
     *   1. delete the `viewTransition: true` line below;
     *   2. rm -rf .next  (the React channel is baked into the build);
     *   3. optional tidy, not required for correctness — nothing breaks if it
     *      is skipped, RouteTransition becomes a pass-through by itself:
     *      remove <RouteTransition> from app/(marketing)/layout.tsx and
     *      app/(site)/layout.tsx, delete components/chrome/RouteTransition.tsx,
     *      and drop chrome.css §5 plus the three `::view-transition-*`
     *      selectors in its §6 block.
     *   No `view-transition-name` is assigned anywhere in the chrome, so there
     *   is no name to hunt down. (`vt-page-title` on PageHero belongs to S7.)
     */
    viewTransition: true,
  },
  /**
   * Retired routes (Figma Purple has no Work/Clients pages). Permanent so the
   * old URLs' equity transfers to their closest replacements; the case-study
   * content stays in content/cases.ts for reuse.
   */
  async redirects() {
    return [
      { source: "/work", destination: "/industries", permanent: true },
      { source: "/work/:slug", destination: "/industries", permanent: true },
      { source: "/clients", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
