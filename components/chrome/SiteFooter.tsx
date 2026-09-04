import Link from "next/link";
import { Logo } from "./Logo";
import { Caustic, Pool, Seam } from "@/components/motifs";
import { FOOTER_COLUMNS, SITE, CONTACT, SOCIALS } from "@/lib/site";

/**
 * The final pool (REDESIGN-V4 Part G, last bullet): the page's deepest dark
 * surface, brand column + four link columns, hairline baseline.
 *
 * TWO ELEMENTS, NOT ONE. `.chrome-curtain` stays on the `<footer>` — it is
 * `sticky; bottom: 0`, so the page appears to lift off it at the end of the
 * scroll (the opaque, elevated `<main>` covers it until then), and sticky
 * keeps the footer in flow so its full height is still reserved and CLS stays
 * 0. See chrome.css §3 for the z-order contract this depends on; nothing here
 * changes it, and `.chrome-main` stays opaque.
 *
 * `.section-dark footer-pool` is NESTED inside it rather than merged onto it.
 * `.section-dark` declares `position: relative` (it needs to be the containing
 * block for its grain `::after`), which would overwrite `position: sticky` and
 * silently kill the curtain — globals.css L531 says as much. The nested div
 * also gives the Caustic the stacking context it needs for `z-index: -2`.
 *
 * `.footer-pool` runs the band gradient the other way from `band-a/b/c` —
 * `--plum-800` at the top, `--plum-950` at the bottom — so the page reads as
 * settling into its deepest plum. It is background-image only; ink, grain and
 * selection all come from `.section-dark`.
 *
 * INK (§A6): column headings `--ink-inv`, links and legal `--ink-inv-2`, hover
 * `--ink-inv`. `--ink-inv-3` is not used anywhere here.
 *
 * All of it lands on plum FLATS rather than on glass, so the tier-1 matrix
 * does not apply and the numbers are simply the gradient's two stops.
 * MEASURED on #2d1235 (`--plum-800`, the top) → #1a0620 (`--plum-950`, the
 * bottom): `--ink-inv` 15.32 → 17.55:1, `--ink-inv-2` (#cebcd4) **9.42 →
 * 10.79:1**. (This note used to attribute a "≥6:1 calibration on
 * #2d1235–#1a0620" to `--ink-inv-2`, which was two errors in one clause:
 * `--ink-inv-2` is calibrated against the darkest thing it lands on, which is
 * GLASS over plum at 4.54:1, not a flat — globals.css says so at the token —
 * and the figures that run near 6:1 over the plum range are `--ink-inv-3`'s,
 * 4.84 → 6.47:1. The ≥6:1 floor itself comes from Part G's footer bullet and
 * `--ink-inv-2` clears it with 3.4 points to spare, so the conclusion was
 * never in doubt; the citation was. V4 Phase-7 review, corrected here.)
 *
 * `.link-draw` needs no dark variant: its underline is `background:
 * currentColor`, so it draws in whatever the link's own colour is — plum-700
 * on the old light footer, `--ink-inv-2` now. Verified in globals.css L1990.
 *
 * The Pool sits under the legal baseline — the last drop of liquid on the
 * page. It has no `[data-reveal]` ancestor, and motifs.css makes `scaleY(1)`
 * the Pool's RESTING pose, so it is simply always full: right for chrome that
 * is frequently already on screen the first time it paints.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="chrome-curtain">
      <div className="section-dark footer-pool">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0"
        >
          <Seam />
        </div>
        {/* Caustic clip box — the footer has no overflow-hidden of its own
            (and must not get one: the curtain's whole trick is that `<main>`
            slides over it). x/y are the TOP-LEFT corner: a 560px disc centred
            at (50%, 104%), i.e. bottom-centre, mostly below the fold of the
            page's last edge. No z-index on the box, so the disc's z-index:-2
            still resolves against `.section-dark`, under the grain. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <Caustic
            x="calc(50% - 280px)"
            y="calc(104% - 280px)"
            size="560px"
            drift="far"
          />
        </span>

        {/* The page's last Pool: full-width, anchored to the footer's own
            bottom edge, and sized so the whole basin lives inside the
            container's 64px bottom padding. `.pool` is the BOTTOM 46% of its
            box, so a 139px box is a 64px-deep pool — it starts exactly where
            the legal baseline's padding starts and never reaches the copy.
            That is what lets the legal line stay `--ink-inv-2`: §A6 demands
            `--ink-inv` for text that OVERLAPS a Pool, and none does.
            (`pb-10` → `pb-16` above is the 24px this needed.) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[139px]"
        >
          <Pool />
        </span>

        <div className="relative mx-auto w-full max-w-[1240px] px-6 pb-16 pt-16 md:px-10 md:pt-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)] md:gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-block rounded-sm text-ink-inv">
                <Logo />
              </Link>
              <p className="mt-4 max-w-[30ch] text-[14.5px] leading-relaxed text-ink-inv-2">
                Powering secure banking &amp; enterprise integrations at scale.
              </p>

              {SOCIALS.length > 0 && (
                <ul className="mt-5 flex items-center gap-3">
                  {SOCIALS.map((s) => (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        data-magnetic
                        className="grid h-9 w-9 place-items-center rounded-pill bg-plum-600 text-ink-inv transition-colors duration-ui hover:bg-violet-600"
                        aria-label={s.label}
                      >
                        <span
                          aria-hidden="true"
                          className="text-[13px] font-semibold"
                        >
                          {s.label.charAt(0)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 space-y-1 text-[14px] text-ink-inv-2">
                <a
                  href={`mailto:${CONTACT.primaryEmail}`}
                  /* py-1 lifts the hit area to 26px — WCAG 2.2 SC 2.5.8 wants a
                     24px minimum target and the bare line-box was 23.99px. */
                  className="block rounded-sm py-1 transition-colors duration-ui hover:text-ink-inv [overflow-wrap:anywhere]"
                >
                  {CONTACT.primaryEmail}
                </a>
                <p className="max-w-[28ch] leading-relaxed text-ink-inv-2">
                  {CONTACT.address.full}
                </p>
              </div>
            </div>

            {FOOTER_COLUMNS.map((col) => {
              /* The bank-integration hub is reachable only from the footer — the
                 five-link pill nav is fixed by the Figma. It joins Products, next
                 to Connected Banking, since it describes what LinkAPI delivers
                 rather than an audience. Derived here rather than in
                 lib/site.ts so the shared nav data stays untouched. */
              const links =
                col.heading === "Products"
                  ? [...col.links, { href: "/banks", label: "Bank integrations" }]
                  : col.links;
              return (
                <nav key={col.heading} aria-label={col.heading}>
                  <h2 className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
                    {col.heading}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {links.map((l) => (
                      <li key={l.href + l.label}>
                        {/* .link-draw goes on the inline <Link>, never on a block
                            one: its ::after spans the element box, so a block link
                            would draw a rule across the whole column. */}
                        <Link
                          href={l.href}
                          className="link-draw rounded-sm text-[14.5px] text-ink-inv-2 transition-colors duration-ui hover:text-ink-inv"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              );
            })}
          </div>

          {/* Legal baseline. `relative` keeps the row above the Pool below
              (`.pool` is positioned with no z-index, so it paints over
              non-positioned in-flow content — the same trap StatBand's
              `relative z-[1]` answers). */}
          <div className="relative mt-14 border-t border-line-inv pt-6">
            <div className="flex flex-col gap-3 text-[13px] text-ink-inv-2 sm:flex-row sm:items-center sm:justify-between">
              <p>
                © {year} {SITE.legalName} All rights reserved.
              </p>
              <ul className="flex items-center gap-6">
                <li>
                  <Link
                    href="/privacy"
                    className="link-draw rounded-sm transition-colors duration-ui hover:text-ink-inv"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="link-draw rounded-sm transition-colors duration-ui hover:text-ink-inv"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
