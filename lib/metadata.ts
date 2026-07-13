import type { Metadata } from "next";
import { SITE } from "./site";

/** Absolute base for canonical + OG URLs (also used by app/opengraph-image). */
export const metadataBase = new URL(SITE.url);

interface PageMetaInput {
  title: string;
  description: string;
  /** Route path beginning with "/", e.g. "/about". Defaults to home. */
  path?: string;
}

/**
 * Per-page metadata builder (PAGES-AND-ROUTING §4.5). Titles/descriptions come
 * from CONTENT-MAPPING §6. OG images are provided globally by app/opengraph-image.
 */
export function pageMetadata({ title, description, path = "/" }: PageMetaInput): Metadata {
  const url = path === "/" ? SITE.url : `${SITE.url}${path}`;
  return {
    // Absolute so the root template isn't appended (CONTENT-MAPPING §6 titles
    // already carry the brand).
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE.legalName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
