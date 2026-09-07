/**
 * Host mapping for the standalone Bank Plugin landing sites.
 *
 * The three bank landing pages are a SEPARATE SITE from the main one: their
 * own chrome, their own menu bar, and eventually their own subdomain each
 * (client instruction, 2026-09). They live in this codebase and this
 * deployment, one route file per bank under `app/(plugin)/`.
 *
 * ── WHERE THEY ACTUALLY LIVE TODAY ────────────────────────────────────────
 * On the main domain, at the paths the client fixed — see `PLUGIN_PATHS`
 * below:
 *     linkapitech.kerning.ooo/axisbank-lp
 *     linkapitech.kerning.ooo/hsbc-lp
 *     linkapitech.kerning.ooo/indusind-lp
 * That is the shipping arrangement. The subdomain machinery below is the
 * NEXT step, already wired but inert until someone sets the hosts, so moving
 * to it later is configuration rather than a rewrite.
 *
 * ── THE SUBDOMAIN NAMES ARE NOT DECIDED HERE, AND MUST NOT BE GUESSED ──────
 * The obvious names are already taken by live software. `hsbc`,
 * `indusind` and `axisbank`.linkapitech.com each serve the client's existing
 * plugin PORTAL — a Bootstrap application with a working `/login`,
 * registration, OTP and plugin download (all three verified serving HTTP 200
 * on `/` and `/login`, 2026-09-07). Pointing those names at this Next app
 * would take a working product offline, so nothing here defaults to them.
 *
 * Instead every host is read from the environment and the map is EMPTY until
 * someone sets it. While it is empty:
 *   • the pages serve on the main domain at their `PLUGIN_PATHS` paths;
 *   • `pluginPageUrl()` returns that path, so every link keeps working;
 *   • middleware rewrites nothing, because it has no host to match.
 * Set the vars, add the domains in Vercel, and the same code starts serving
 * the subdomains with no edit.
 *
 *   NEXT_PUBLIC_PLUGIN_HOST_AXIS=tally-axis.linkapitech.com
 *   NEXT_PUBLIC_PLUGIN_HOST_HSBC=tally-hsbc.linkapitech.com
 *   NEXT_PUBLIC_PLUGIN_HOST_INDUSIND=tally-indusind.linkapitech.com
 *
 * (`tally-*` is a placeholder in the docs, not a default in code.
 * TODO: client to confirm the real names — and whether the intent is instead
 * to move the existing portal apps to `app.<bank>.linkapitech.com` and give
 * these landing pages the bare `<bank>` names, which is a DNS and portal
 * migration, not a front-end change.)
 *
 * NEXT_PUBLIC_ is required: the host is needed in the browser too, for the
 * canonical URL and the cross-links between the three pages.
 */

/** The plugin landing pages, in the order they should ever be listed. */
export const PLUGIN_SLUGS = ["axis", "hsbc", "indusind"] as const;
export type PluginSlug = (typeof PLUGIN_SLUGS)[number];

const ENV_KEYS: Record<PluginSlug, string> = {
  axis: "NEXT_PUBLIC_PLUGIN_HOST_AXIS",
  hsbc: "NEXT_PUBLIC_PLUGIN_HOST_HSBC",
  indusind: "NEXT_PUBLIC_PLUGIN_HOST_INDUSIND",
};

/**
 * Read at module scope from `process.env` by literal key. Next inlines
 * `NEXT_PUBLIC_*` at build time only for STATIC member expressions, so
 * `process.env[someVariable]` would be `undefined` in the browser bundle —
 * this is why the three reads below are written out rather than looped.
 */
const RAW: Record<PluginSlug, string | undefined> = {
  axis: process.env.NEXT_PUBLIC_PLUGIN_HOST_AXIS,
  hsbc: process.env.NEXT_PUBLIC_PLUGIN_HOST_HSBC,
  indusind: process.env.NEXT_PUBLIC_PLUGIN_HOST_INDUSIND,
};

/** Strip a scheme, any path and a trailing dot, and lowercase. */
function normalizeHost(value: string): string | null {
  const trimmed = value.trim().replace(/^https?:\/\//i, "").split("/")[0];
  const host = trimmed.replace(/\.$/, "").toLowerCase();
  // A bare word with no dot is almost certainly a mistake (a slug pasted in
  // place of a host); refuse it rather than build links to it.
  return host.includes(".") ? host : null;
}

/** slug → host, containing only the entries that are actually configured. */
export const PLUGIN_HOSTS: Partial<Record<PluginSlug, string>> = Object.create(
  null,
);
for (const slug of PLUGIN_SLUGS) {
  const raw = RAW[slug];
  const host = raw ? normalizeHost(raw) : null;
  if (host) PLUGIN_HOSTS[slug] = host;
}

/** host → slug, for middleware. Lowercased keys; port stripped by the caller. */
export const HOST_TO_SLUG: Record<string, PluginSlug> = Object.create(null);
for (const slug of PLUGIN_SLUGS) {
  const host = PLUGIN_HOSTS[slug];
  if (host) HOST_TO_SLUG[host] = slug;
}

export const hasPluginHosts = () => Object.keys(HOST_TO_SLUG).length > 0;

/**
 * The path each bank's landing page is served from ON THE MAIN DOMAIN.
 *
 * Fixed by the client (2026-09): `linkapitech.kerning.ooo/axisbank-lp` and
 * siblings, so these are URLs someone will paste and share — do not rename
 * them without a redirect. Two things to note:
 *   • Axis's segment is `axisbank`, not `axis`, matching both the client's
 *     instruction and the host its live portal actually answers on.
 *   • `-lp` is the client's suffix. It is what keeps these three off the
 *     main site's URL namespace without needing a parent segment.
 * There is one route file per entry (app/(plugin)/<path>/page.tsx) rather
 * than a root `[slug]` catch-all — see BankPluginLanding for why.
 */
export const PLUGIN_PATHS: Record<PluginSlug, string> = {
  axis: "/axisbank-lp",
  hsbc: "/hsbc-lp",
  indusind: "/indusind-lp",
};

/** The in-app path a bank's landing page is served from. */
export const pluginPagePath = (slug: string) =>
  PLUGIN_PATHS[slug as PluginSlug] ?? "/bank-plugin";

/**
 * Where to LINK to a bank's landing page.
 *
 * Absolute (`https://host/`) once that bank's host is configured, because the
 * page is then a different origin and must not be reached through the main
 * domain. Relative otherwise, so dev, previews and an unconfigured production
 * all keep working instead of linking into the void.
 */
export function pluginPageUrl(slug: string): string {
  const host = PLUGIN_HOSTS[slug as PluginSlug];
  return host ? `https://${host}/` : pluginPagePath(slug);
}

/** True when the link `pluginPageUrl` produced leaves the current origin. */
export const pluginPageIsExternal = (slug: string) =>
  Boolean(PLUGIN_HOSTS[slug as PluginSlug]);
