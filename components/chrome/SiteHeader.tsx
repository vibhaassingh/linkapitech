"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { usePrefersReducedMotion } from "@/components/motion/hooks";
import { NAV, CTA } from "@/lib/site";
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  /** kept for the two layouts' call sites; the header is identical on both */
  variant?: "marketing" | "page";
}

const isActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

/**
 * Floating pill header (Figma Purple). A white rounded bar inset from the top
 * edge, sitting over whatever the page's hero is — plum gradient or lavender
 * wash. No mega menu: every nav item is a page.
 *
 * Three mechanisms, all of which try to stay off the main thread:
 *
 * 1. ELEVATION RAMP. The shadow ramps continuously over the first 120px of
 *    scroll via a CSS `scroll()` timeline (see chrome.css §1) — no scroll
 *    listener at all where that is supported. `data-stuck` is the binary
 *    fallback for Safari/Firefox, and is also the reduced-motion path, so the
 *    listener is attached only when one of those applies.
 *
 * 2. NAV THUMB. One sliding underline for the whole nav instead of five static
 *    ones, so a route change springs it from the old item to the new (B0's
 *    `.nav-thumb` owns the paint and the spring; this component only publishes
 *    --thumb-x / --thumb-w / --thumb-o). Measurement is cached: it happens on
 *    mount, on route change, on a nav resize and once after webfont swap —
 *    never per frame, and never a read after a write in the same task.
 *    V4: the marker is a 6px dot placed by translate only (chrome.css §2);
 *    publish() still writes --thumb-x (px) and --thumb-w (unitless).
 *
 * 3. TONE OBSERVER (REDESIGN-V4 Part B). The pill is two-state liquid glass —
 *    frosted white over lavender sections, plum glass over dark ones — and
 *    `data-over="dark|light"` on the pill is what chrome.css §1b switches on.
 *    It is driven by ONE IntersectionObserver whose root is the viewport
 *    inset (rootMargin) to the pill's own top and bottom edges — a band as
 *    tall as the pill — observing every `.section-dark` /
 *    `[data-surface="dark"]` in <main>, the footer pool (V4 Phase 7:
 *    `footer .section-dark`, a sibling of <main>, not inside it) and
 *    `main.chrome-main` itself. Two Sets and one boolean, because the sticky
 *    curtain's box crosses the band from the FIRST PAINT on every route: the
 *    page's own dark sections decide the tone while the opaque page covers
 *    the band, and the curtain's only once the page has slid off it (V4
 *    Phase-7 review fix — see the callback for the measurement). IO rather
 *    than a scroll listener because it does zero per-frame work — the
 *    intersection test runs on the compositor side and the callback fires
 *    only on a crossing. It runs under reduced motion too: which tone is
 *    under the pill is a CONTRAST feature, not motion (the tone flip itself
 *    is instant — chrome.css §1b). Before hydration, and with JS off,
 *    chrome.css's
 *    `.chrome-header:has(~ main [data-hero="dark"])` baseline reads the
 *    hero's own `data-hero` (Hero.tsx / PageHero.tsx), so a dark-hero route
 *    paints dark on its first frame; the observer only ever confirms or
 *    refines that. On route change the attribute is removed in a LAYOUT
 *    effect cleanup — synchronously inside React's commit, before the browser
 *    paints the new <main> — so the baseline also decides the first frame of
 *    every client navigation, and the observer takes over once its initial
 *    delivery for the new page's sections lands. (A passive-effect cleanup
 *    was too late for that: a Next <Link> navigation is a transition update,
 *    and the browser could paint the new page with the previous route's
 *    data-over still on the pill — /services scrolled to a light section →
 *    /about painted a light pill over the plum hero.)
 */
export function SiteHeader(_props: SiteHeaderProps) {
  const [stuck, setStuck] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  const pillRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const linksRef = useRef<Array<HTMLAnchorElement | null>>([]);
  /** false until the thumb has been positioned once — the first placement
   *  must not animate, every later one must. */
  const placedRef = useRef(false);

  const activeIndex = NAV.findIndex((item) => isActive(pathname, item.href));

  useEffect(() => {
    // Where the elevation ramp is a CSS scroll() timeline there is nothing for
    // JS to do. Reduced motion deliberately opts back INTO the listener: a
    // scroll-driven animation with a collapsed duration resolves to its end
    // state, which would pin the header at full elevation (chrome.css §6).
    const rampInCss =
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timeline: scroll()") &&
      !reduced;
    if (rampInCss) return;

    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  /**
   * Measure the active link and publish the thumb's geometry. One layout read
   * (offsetLeft/offsetWidth of a single element) followed by writes — never
   * interleaved, so this cannot thrash, and it runs four times in a page's
   * life, not per frame.
   *
   * `animate` is tri-state on purpose:
   *   false → write data-animate="false" in the SAME style change as the new
   *           position. CSS Transitions resolve against the after-change
   *           style, so no transition is generated at all (first placement).
   *   true  → arm the spring for this placement (route change).
   *   null  → reposition and leave the animate state alone. This is what the
   *           resize/webfont paths use: flipping to "false" mid-flight would
   *           CANCEL a running route-change spring (a transition whose
   *           property leaves transition-property is removed, not finished),
   *           and the active item's weight swap makes the nav resize on every
   *           route change — so that cancellation would fire every time.
   */
  const publish = useCallback(
    (animate: boolean | null) => {
      const thumb = thumbRef.current;
      if (!thumb) return;

      const link = activeIndex >= 0 ? linksRef.current[activeIndex] : null;
      const width = link ? link.offsetWidth : 0;
      const left = link ? link.offsetLeft : 0;

      if (animate !== null) thumb.dataset.animate = animate ? "true" : "false";
      // width 0 covers both "no active route" (/, /contact) and the nav being
      // display:none below lg, where there is nothing to measure. The x/w are
      // left as they were, so the thumb fades out in place.
      if (width === 0) {
        thumb.style.setProperty("--thumb-o", "0");
        return;
      }
      thumb.style.setProperty("--thumb-x", `${left}px`);
      thumb.style.setProperty("--thumb-w", `${width}`);
      thumb.style.setProperty("--thumb-o", "1");
    },
    [activeIndex],
  );

  // Mount + every route change. The first placement must not animate (the
  // thumb would otherwise slide in from x=0 on every page load).
  useEffect(() => {
    publish(placedRef.current);
    placedRef.current = true;
  }, [publish]);

  /* The observers below are created ONCE and read the latest publish through a
     ref: re-creating a ResizeObserver on every route change would fire its
     initial delivery mid-spring. */
  const publishRef = useRef(publish);
  useEffect(() => {
    publishRef.current = publish;
  }, [publish]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    let raf = 0;
    // rAF-deferred so the layout read never happens inside the observer's own
    // delivery (and so a drag-resize coalesces to one measurement per frame).
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => publishRef.current(null));
    });
    ro.observe(nav);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Poppins is preloaded, but a swap would silently invalidate the cached
  // widths — one more measurement costs nothing.
  useEffect(() => {
    if (!document.fonts) return;
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) publishRef.current(null);
    });
    return () => {
      live = false;
    };
  }, []);

  // Route change: drop data-over BEFORE the browser paints the new <main>.
  // A layout effect's cleanup runs synchronously in React's commit phase; a
  // passive effect's runs after paint — and a Next <Link> navigation is a
  // transition update, so with the reset in the passive cleanup (where it
  // first lived) the browser could paint the new route with the OLD route's
  // state still on the pill. Cleanup-only on purpose: the observer effect
  // below re-arms for the new route and writes the fresh value; between the
  // two, the CSS :has(data-hero) baseline is in charge, which is correct for
  // the first frame of any route.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    return () => {
      if (pill) delete pill.dataset.over;
    };
  }, [pathname]);

  // Tone observer — see mechanism 3 in the header comment. Keyed on pathname
  // so the new route's sections are observed; `arm` is re-run (rAF-coalesced)
  // on resize because the root band is expressed in viewport pixels.
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill || typeof IntersectionObserver === "undefined") return;

    let io: IntersectionObserver | null = null;
    // Dark sections inside <main> that currently cross the pill's band.
    const under = new Set<Element>();
    // Dark sections inside the sticky footer curtain that cross it.
    const curtain = new Set<Element>();
    // Is the OPAQUE page box itself crossing the band? See `next` below.
    let covered = true;

    const arm = () => {
      io?.disconnect();
      under.clear();
      curtain.clear();
      covered = true;
      // The root band is the pill's own vertical extent: rootMargin insets the
      // implicit root to [pill.top, pill.bottom). The header is fixed, so both
      // edges are scroll-invariant.
      //
      // WHY clientHeight, NOT innerHeight. The implicit root's bounds are the
      // LAYOUT viewport — document.documentElement.clientHeight — which
      // excludes a classic scrollbar and, on iOS with the dynamic toolbar,
      // differs from window.innerHeight. The bottom inset is subtracted from
      // the root's REAL height, so measuring it against a different height is
      // an off-by-N: with the original 1px band, any ≥1px discrepancy
      // collapsed the band to nothing, every target reported
      // isIntersecting:false, and the pill read data-over="light" everywhere
      // — silently, with no error to find. A pill-height band is the second
      // half of the same fix: a few px of drift now shave the band instead of
      // erasing it.
      //
      // Both insets are CLAMPED at 0: if the viewport is ever shorter than
      // the pill (a collapsed window, a viewport mid-resize reporting 0) the
      // naive `-${height - bottom}px` becomes `--Npx`, and the
      // IntersectionObserver constructor throws a SyntaxError — an uncaught
      // throw in an effect unmounts the whole tree. Found by the phase-3
      // visual check, not by the gate's headless viewports.
      const rect = pill.getBoundingClientRect();
      const rootHeight = document.documentElement.clientHeight;
      const top = Math.max(0, Math.round(rect.top));
      const below = Math.max(0, Math.round(rootHeight - rect.bottom));
      const page = document.querySelector("main.chrome-main");
      try {
        io = new IntersectionObserver(
          (records, self) => {
            // A disconnected observer can still deliver entries it had already
            // queued (re-arm on resize, or the route-change cleanup below);
            // only the live instance may write.
            if (self !== io) return;
            for (const r of records) {
              if (r.target === page) covered = r.isIntersecting;
              else {
                const set = page?.contains(r.target) ? under : curtain;
                if (r.isIntersecting) set.add(r.target);
                else set.delete(r.target);
              }
            }
            // WHICH SET DECIDES IS THE OCCLUSION QUESTION, not a union.
            // `.chrome-curtain` is `sticky; bottom: 0`, so chrome.css §3's own
            // words are that it is "pinned to the bottom of the viewport from
            // the first paint" — its BOX therefore crosses the pill's band at
            // scroll 0 on every route, while `.chrome-main` (opaque, one layer
            // above) covers it completely. Phase 7 added `footer .section-dark`
            // to the target list and unioned it in, which made the pill read
            // dark over every LIGHT hero on all 12 inner routes from the first
            // frame — measured, not theorised: `data-over="dark"` at scroll 0
            // on /services, /connected-banking and /banks/axis with
            // `[data-hero="light"]`, the footer's rect at [0, 1422] in an 823px
            // viewport. It also made the pre-hydration CSS baseline (light,
            // correctly) disagree with the observer's first delivery, so the
            // §1b tone crossfade RAN at hydration and Lighthouse's trace caught
            // its non-composited `color` leg on those three routes.
            //
            // So: while the opaque page is under the band, only the page's own
            // dark sections can be seen there; once it has slid off the band
            // (the end of the scroll, where the curtain is exposed) the curtain
            // is the surface the pill floats over. `covered` defaults to true
            // and stays true if `.chrome-main` is somehow absent, which is the
            // pre-Phase-7 behaviour rather than a guess.
            const next = (covered ? under.size : curtain.size)
              ? "dark"
              : "light";
            if (pill.dataset.over !== next) pill.dataset.over = next;
          },
          { rootMargin: `-${top}px 0px -${below}px 0px`, threshold: 0 },
        );
      } catch (err) {
        // Never let the header take the page down: without an observer the
        // CSS :has(data-hero) baseline stays in charge, which is correct for
        // the hero and merely static further down. Loud in development so a
        // regression here stays visible instead of degrading silently to
        // that baseline.
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[SiteHeader] tone observer failed to arm; the pill stays on the CSS data-hero baseline.",
            err,
          );
        }
        io = null;
        delete pill.dataset.over;
        return;
      }
      const observer = io;
      // `footer .section-dark` is the footer pool (V4 Phase 7): the footer is a
      // SIBLING of <main>, not a descendant, so the first two arms cannot see
      // it, and at the end of the scroll the exposed curtain IS what the pill
      // floats over. `main.chrome-main` is observed as well — not as a tone
      // source but as the occluder that decides which of the two sets counts
      // (see the callback).
      document
        .querySelectorAll(
          'main .section-dark, main [data-surface="dark"], footer .section-dark',
        )
        .forEach((el) => observer.observe(el));
      if (page) observer.observe(page);
    };
    arm();

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(arm);
    };
    window.addEventListener("resize", onResize);
    return () => {
      io?.disconnect();
      // Null it so a late delivery from the disconnected instance is ignored
      // by the `self !== io` guard above. data-over is NOT reset here — the
      // layout effect above does that, before paint.
      io = null;
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <>
      <header className="chrome-header fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 md:pt-5">
        {/* No background utility: the fill, frost, rim and every state colour
            are chrome.css §1b, switched by data-over (observer) with a
            :has(data-hero) baseline for the first frame. */}
        <div
          ref={pillRef}
          data-stuck={stuck ? "true" : "false"}
          data-menu={mobileOpen ? "true" : "false"}
          className="chrome-pill relative mx-auto flex h-[60px] w-full max-w-[1300px] items-center justify-between gap-6 rounded-[22px] pl-5 pr-3 shadow-card md:h-[64px] md:pl-7 md:pr-4"
        >
          <Link
            href="/"
            className="chrome-mark rounded-sm"
            aria-label="LinkAPI Tech — home"
          >
            <Logo />
          </Link>

          <nav
            ref={navRef}
            aria-label="Primary"
            className="relative hidden items-center gap-7 lg:flex"
          >
            {NAV.map((item, i) => {
              const active = i === activeIndex;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => {
                    linksRef.current[i] = el;
                  }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "chrome-nav-link rounded-sm py-1 text-[14.5px]",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* One thumb for the whole nav. Decorative: `aria-current` on the
                active link is what carries the state to assistive tech.
                Server-rendered it is invisible without any inline style —
                chrome.css §2 defaults --thumb-o to 0 until publish() runs. */}
            <span
              ref={thumbRef}
              aria-hidden="true"
              className="nav-thumb"
              data-animate="false"
            />
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={CTA.href}
              data-magnetic
              /* py-2.5 is off the 8-pt grid on purpose: it is what puts the
                 button at a 44px box inside the 64px pill. The grid pass below
                 the fold only touched spacing that owns no component size. */
              className="chrome-cta hidden items-center rounded-pill px-6 py-2.5 text-[14px] font-semibold lg:inline-flex"
            >
              {CTA.label}
            </Link>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="chrome-mark grid h-11 w-11 place-items-center rounded-pill lg:hidden"
            >
              <Burger open={mobileOpen} />
            </button>
          </div>

          {/* Seam hairline at the bottom edge; chrome.css §1b fades it in on
              the same scroll ramp as the elevation shadow. */}
          <span className="chrome-seam" aria-hidden="true" />
        </div>
      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function Burger({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      {open ? (
        <path
          d="M4 4l12 12M16 4L4 16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M2.5 6h15M2.5 10h15M2.5 14h15"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
