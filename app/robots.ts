import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * NO `host` FIELD. `Host:` is a Yandex-only extension, not part of the
 * robots.txt standard, and Lighthouse's `robots-txt` audit fails the file for
 * it: "robots.txt is not valid". That single audit is what dropped
 * /banks/axis' live SEO score to 92, under this project's ≥95 bar. The
 * canonical host is already declared where crawlers actually read it — the
 * `<link rel="canonical">` and `og:url` that `pageMetadata()` emits from
 * `SITE.url`, plus `metadataBase` — so the directive bought nothing and cost
 * a valid file.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
