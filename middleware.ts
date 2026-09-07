import { NextResponse, type NextRequest } from "next/server";
import {
  HOST_TO_SLUG,
  PLUGIN_PATHS,
  hasPluginHosts,
  pluginPagePath,
} from "@/lib/plugin-hosts";

/** Is this one of the three landing-page paths (any bank's)? */
const isPluginLandingPath = (pathname: string) =>
  Object.values(PLUGIN_PATHS).includes(pathname);

/**
 * Subdomain routing for the standalone Bank Plugin landing sites.
 *
 * Each bank's landing page is its own site on its own subdomain (client
 * instruction, 2026-09) but lives in this deployment. When a request arrives
 * on a configured plugin host, its ROOT is rewritten to that bank's page:
 *
 *   tally-hsbc.linkapitech.com/        → /hsbc-lp
 *
 * A rewrite, not a redirect: the visitor's URL bar keeps the subdomain, which
 * is the whole point of the separation. See lib/plugin-hosts.ts for why no
 * host is hardcoded — the bare `<bank>.linkapitech.com` names are already
 * serving the client's live portal applications.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO:
 *  • It does not gate the main domain. `/bank-plugin/<slug>` stays reachable
 *    on linkapitech.com so dev, Vercel previews and an unconfigured
 *    production keep working. Once the subdomains are live, the canonical tag
 *    on each page points at the subdomain, so search engines are told which
 *    of the two is authoritative rather than being left to guess.
 *  • It does not touch any other host. An unknown Host falls through
 *    untouched, so the main site is unaffected by a stray DNS record.
 *
 * The matcher excludes `_next`, the API and anything with a file extension,
 * so this runs on document requests only.
 */
export function middleware(request: NextRequest) {
  if (!hasPluginHosts()) return NextResponse.next();

  // `host` includes the port in dev (localhost:3000) — strip it before the
  // lookup, and drop IDN/trailing-dot variance.
  const host = (request.headers.get("host") ?? "")
    .split(":")[0]
    .replace(/\.$/, "")
    .toLowerCase();

  const slug = HOST_TO_SLUG[host];
  if (!slug) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const target = pluginPagePath(slug);

  // Already the right page (a client-side navigation, or a direct hit).
  if (pathname === target) return NextResponse.next();

  // The subdomain's root is the landing page.
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.rewrite(url);
  }

  // A PLUGIN HOST HAS EXACTLY ONE PAGE, and everything else on it goes to
  // that page's own URL. Without this the subdomain also served the entire
  // main site — `hsbc.…/about` returned the main About page, verified 200
  // before this branch existed — which would publish a second and third copy
  // of linkapitech.com on origins whose canonical tags all point elsewhere,
  // and would let a visitor wander out of the product site without ever
  // changing domain.
  //
  // Two destinations, deliberately: another bank's landing path goes to THIS
  // host's page (so one subdomain can never render a different bank), and
  // anything else goes to the host root, which is the page's real URL here.
  // 308 because these are permanent and must not be re-pointed by a client.
  //
  // `/_next`, `/api` and any path containing a dot never reach this function
  // (see `config.matcher`), so assets, robots.txt and sitemap.xml are
  // unaffected.
  const url = request.nextUrl.clone();
  url.pathname = isPluginLandingPath(pathname) ? target : "/";
  url.search = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\.).*)"],
};
