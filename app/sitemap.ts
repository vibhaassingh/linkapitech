import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { BANK_SLUGS } from "@/content/banks";

/**
 * Static route map. /work, /work/[slug] and /clients are retired (they now
 * 301 in next.config.ts) so they are deliberately absent.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
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
