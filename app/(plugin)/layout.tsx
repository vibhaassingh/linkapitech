import { SkipLink } from "@/components/chrome/SkipLink";

/**
 * Standalone Bank Plugin layout — the third route group, and the only one
 * with none of the site chrome.
 *
 * The three bank landing pages are a separate product site, each on its own
 * subdomain (client instruction, 2026-09), so this group deliberately renders
 * NO `SiteHeader`, NO `SiteFooter` and NO Lenis. Each page brings its own
 * `PluginHeader` / `PluginFooter` instead, because both are per-bank.
 *
 * WHAT IS DELIBERATELY ABSENT, AND WHY:
 *
 *  • `SiteHeader` — its floating pill, sliding nav thumb and tone observer
 *    are the main site's identity. A visitor arriving on a plugin subdomain
 *    should not be offered About / Solutions / Services: those pages are on
 *    a different origin and are not what they came for.
 *
 *  • `.chrome-main` on <main> — that class exists only to make <main> the
 *    opaque layer the sticky footer curtain is revealed from under
 *    (chrome.css §3). `PluginFooter` is in normal flow with no curtain, so
 *    the class would be an unused stacking context here. Its absence is also
 *    why `PluginHeader` can be plain `sticky` and needs no z-order treaty.
 *
 *  • `RouteTransition` — a cross-route View Transition is meaningless on a
 *    one-page site, and each of these pages is its own origin in production,
 *    where a client-side navigation between them cannot happen at all.
 *
 *  • The header clearance every `(site)` page carries (`pt-[136px]`) — this
 *    group's header is sticky and in flow, so the page starts below it
 *    naturally.
 *
 * `SkipLink` stays: it targets `#main`, which is right here, and skipping the
 * nav is required regardless of which chrome is on the page.
 */
export default function PluginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipLink />
      {/* tabIndex -1 so the skip link actually moves focus here */}
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
