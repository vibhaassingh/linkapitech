import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { PLUGIN_HOSTS, pluginPagePath, type PluginSlug } from "@/lib/plugin-hosts";
import { getBankPlugin } from "@/content/plugin";

/**
 * Metadata for one bank's landing page.
 *
 * Shared by the three route files so the canonical rule lives in one place.
 * That rule matters: the page has TWO possible homes — its path on the main
 * domain (`/axisbank-lp`, what the client is using today) and its own
 * subdomain (once `NEXT_PUBLIC_PLUGIN_HOST_*` is set). Both stay reachable,
 * so whichever is authoritative has to be declared or the same page competes
 * with itself in search results. The subdomain wins when it exists, because
 * that is the separation the brief asks for; the main-domain path is what
 * ships until then.
 *
 * Not a `generateMetadata`: nothing here is async or request-dependent, so a
 * plain exported object is one less thing for Next to await per request.
 */
export function bankPluginMetadata(slug: PluginSlug | string): Metadata {
  const page = getBankPlugin(slug);
  if (!page) return {};

  const meta = pageMetadata({
    title: page.meta.title,
    description: page.meta.description,
    path: pluginPagePath(slug),
  });

  const host = PLUGIN_HOSTS[slug as PluginSlug];
  if (host) {
    const url = `https://${host}/`;
    meta.alternates = { canonical: url };
    if (meta.openGraph) meta.openGraph.url = url;
  }
  return meta;
}
