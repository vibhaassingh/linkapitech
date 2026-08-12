/**
 * Skip-to-content link (WCAG 2.4.1 Bypass Blocks).
 *
 * Without this, a keyboard or screen-reader user has to tab through the logo,
 * five nav links and the CTA before reaching the page content — on every page.
 * Visually hidden until focused, then it lands as a pill above the header.
 *
 * Targets #main, which the layouts put on <main>. The target needs a tabindex
 * of -1 so that following the link actually moves focus (browsers only move
 * focus to a non-focusable target inconsistently).
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-plum-600 focus:px-5 focus:py-3 focus:text-[14px] focus:font-semibold focus:text-ink-inv focus:shadow-float"
    >
      Skip to content
    </a>
  );
}
