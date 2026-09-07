import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { BANK_SLUGS } from "@/content/banks";
import { PLUGIN_PATHS } from "@/lib/plugin-hosts";

/**
 * Static route map for THIS domain. /work, /work/[slug] and /clients are
 * retired (they now 301 in next.config.ts) so they are deliberately absent.
 *
 * The three bank plugin landing pages ARE listed: they are separate sites in
 * look and chrome, but today they are served from this domain at the paths
 * the client fixed (`/axisbank-lp` and siblings). When a bank gets its own
 * subdomain its canonical moves there, and `PLUGIN_PATHS` is where that
 * decision is read from — so this list follows automatically rather than
 * needing a second edit.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/bank-plugin",
    ...Object.values(PLUGIN_PATHS),
    "/solutions",
    "/connected-banking",
    "/services",
    "/industries",
    "/banks",
    ...BANK_SLUGS.map((slug) => `/banks/${slug}`),
    "/contact",
    "/terms",
    "/privacy",
  ];
  return routes.map((r) => ({
    url: `${SITE.url}${r}`,
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : 0.7,
  }));
}
