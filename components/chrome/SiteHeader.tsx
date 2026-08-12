"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
 * Two motion pieces, both of which try to stay off the main thread:
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
 */
export function SiteHeader(_props: SiteHeaderProps) {
  const [stuck, setStuck] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

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

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-6 md:pt-5">
        <div
          data-stuck={stuck ? "true" : "false"}
          data-menu={mobileOpen ? "true" : "false"}
          className="chrome-pill relative mx-auto flex h-[60px] w-full max-w-[1300px] items-center justify-between gap-6 rounded-[16px] bg-surface pl-5 pr-3 shadow-card md:h-[64px] md:pl-7 md:pr-4"
        >
          <Link
            href="/"
            className="rounded-sm text-plum-950"
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
                    "rounded-sm py-1 text-[14.5px] transition-colors duration-ui",
                    active
                      ? "font-semibold text-violet-text"
                      : "font-medium text-ink-2 hover:text-plum-700",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* One thumb for the whole nav. Decorative: `aria-current` on the
                active link is what carries the state to assistive tech.
                Server-rendered it is invisible without any inline style —
                `.nav-thumb` defaults --thumb-w to 0, i.e. scaleX(0). */}
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
              className="hidden items-center rounded-pill bg-plum-600 px-6 py-2.5 text-[14px] font-semibold text-ink-inv transition-colors duration-ui hover:bg-violet-600 lg:inline-flex"
            >
              {CTA.label}
            </Link>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-pill text-plum-900 lg:hidden"
            >
              <Burger open={mobileOpen} />
            </button>
          </div>
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
