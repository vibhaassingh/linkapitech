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
