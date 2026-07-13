import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { CASE_SLUGS } from "@/content/cases";
import { BANK_SLUGS } from "@/content/banks";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/services", "/banks", "/contact", "/work", "/terms", "/privacy"];
  const pages = routes.map((r) => ({
    url: `${SITE.url}${r}`,
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : 0.7,
  }));
  const cases = CASE_SLUGS.map((slug) => ({
    url: `${SITE.url}/work/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const banks = BANK_SLUGS.map((slug) => ({
    url: `${SITE.url}/banks/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...cases, ...banks];
}
