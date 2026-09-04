import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Caustic, Droplet, Pool, Seam } from "@/components/motifs";

interface CtaBandProps {
  /** Capsule label above the headline. */
  eyebrow?: string;
  /** Per-page CTA label — the Figma varies this on every page. */
  ctaLabel: string;
  ctaHref?: string;
  /** Optional second CTA (homepage pairs the demo with a partnership email). */
  secondary?: { label: string; href: string };
}

/**
 * Shared closing CTA band — the last dark surface before the footer pool, on
 * every one of the 13 routes (REDESIGN-V4 Part E row 13).
 *
 * COMPOSITION. `band-b` plum with `.sheet-enter` + a `sheet-shadow` first
 * child; a Seam at BOTH edges; centred type (Droplet eyebrow, `display-2`
 * headline, CTA row); a wide shallow Pool directly under the buttons; two
 * Caustics for ambience.
 *
 * The BOTTOM Seam is new in V4 and is the reason it exists: the footer below
 * is now dark too (`.footer-pool`), so this edge is no longer a dark/light
 * boundary that reads by itself — it needs the glass hairline to be a rim
 * between two plums rather than an invisible join.
 *
 * `overflow-hidden` STAYS, and here that is a deliberate trade rather than an
 * oversight: `.sheet-shadow` is `top: -40px`, so a clipping parent loses its
 * upward 40px (globals.css and Part J both say so). Every other dark band in
 * the redesign therefore omits `overflow-hidden` and clips its Caustics in
 * their own boxes; this one keeps it because the Pool's radial and the two
 * drifting Caustics all bleed past the section box, and the 1px top-edge
 * highlight of the sheet shadow — the part that survives the clip — is the
 * half that actually reads against the Seam. The Caustics still sit in their
 * own `absolute inset-0 overflow-hidden` box for uniformity with the other
 * bands; that box has no z-index and no `isolate`, so `z-index: -2` keeps
 * resolving against `.section-dark`.
 *
 * The three tilted white slabs are gone. Two Caustics (`.drift-near` 22px and
 * `.drift-far` 7px, half amplitude below 1024) carry the same depth read with
 * a gradient instead of three translucent planes, and they sit at the LEFT and
 * RIGHT edges to keep their cores off the centred column.
 *
 * THE EYEBROW IS `--ink-inv`, NOT `--ink-inv-2`, AND THAT IS MEASURED. The
 * edge placement above does not clear the column at 390px, where the section
 * is only 390 wide and the 480px left disc reaches the middle of it: the
 * Droplet's nearest point is 67px from that disc's centre, i.e. `--violet-a24`
 * at an effective **alpha 0.148** under the pill. The Droplet is `.liq liq-1`,
 * so the stack under the label is band-b's brightest stop (`--plum-800` plus
 * its own .22 bloom) + the Caustic + the tier-1 .05 fill + `--liq-edge`'s .13
 * white — and `--ink-inv-2` on that composite is **4.44:1**, under the AA
 * floor. (Its own baseline WITHOUT the Caustic is 4.80:1, so the disc is what
 * tips it: −0.36.) `--ink-inv` on the same composite is **7.22:1**, and 6.87:1
 * even directly on a full core, so it is safe at any placement. The 12px
 * uppercase tracking and the pill's own rim carry the hierarchy; ink was never
 * doing that work here.
 *
 * The walk cannot see any of this — the disc is a SIBLING OVERLAY, not the
 * text's background, and REDESIGN-V4 §3 lists sibling overlays among the
 * things it is blind to. The arithmetic above is the same one that produces
 * `--ink-inv-2`'s documented 4.52:1 tier-2 calibration exactly, so it is the
 * project's own convention, not a new model. (V4 Phase-7 review.)
 *
 * TEXT OVER THE POOL is `--ink-inv` (§A6). Both CTAs qualify without any
 * change: `variant="light"` is an opaque white pill and `variant="glass"` is
 * `.liq` with `--ink-inv` ink.
 *
 * Motion: `.sheet-enter` presents the band as a sheet, `sheetShadow` fades the
 * cast shadow out over `cover 0% → 22%`, the Caustics drift on `--sp`, the
 * Pool rises with its `Reveal`, and the three reveals stay at 0/90/180ms. All
 * of them are B0 view()-timeline utilities or `[data-reveal]` — scroll-driven,
 * `@supports`-gated and reduced-motion-safe by definition, so no extra gating
 * is needed here.
 */
export function CtaBand({
  eyebrow = "Start your journey",
  ctaLabel,
  ctaHref = "/contact",
  secondary,
}: CtaBandProps) {
  return (
    <section className="section-dark band-b sheet-enter relative overflow-hidden">
      <span aria-hidden="true" className="sheet-shadow" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <Seam />
      </div>

      {/* Caustic clip box (see the note above). x/y are the TOP-LEFT corner:
          a 480px disc centred at (8%, 18%) and a 560px one at (94%, 88%) —
          both clear of the centred text column. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Caustic
          x="calc(8% - 240px)"
          y="calc(18% - 240px)"
          size="480px"
          drift="near"
        />
        <Caustic
          x="calc(94% - 280px)"
          y="calc(88% - 280px)"
          size="560px"
          drift="far"
        />
      </span>

      <div className="relative z-[1] mx-auto w-full max-w-[1240px] px-6 py-24 text-center md:px-10 md:py-28">
        <Reveal>
          {/* text-ink-inv, not -2: the left Caustic reaches this pill at 390px
              and --ink-inv-2 composites to 4.44:1 there. See the block comment. */}
          <Droplet className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
            {eyebrow}
          </Droplet>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="display-2 mx-auto mt-7 max-w-[22ch] text-ink-inv">
            Let&rsquo;s build the next generation of banking together.
          </h2>
        </Reveal>
        <Reveal delay={180} className="relative mt-9">
          {/*
            The Pool: a wide shallow basin under the buttons. `.pool` is
            `inset: auto 0 0 0; height: 46%` of a POSITIONED parent, so the
            120px depth Part E asks for comes from a 260px box rather than
            from overriding the class (motifs.css is emitted after Tailwind
            and would win a plain `h-*`). `left-[20%] w-[60%]` centres it with
            no transform — a motif never carries a centring transform.

            Anchored by `bottom`, not `top`, so it is independent of how many
            lines the button row wraps to: bottom = row + 72px puts the
            basin's 120px from the buttons' top edge to 72px below them — the
            CTAs sit IN the pool, and 72px stays inside the section's own
            96/112px bottom padding, so `overflow-hidden` never clips the
            radial's brightest edge. FIRST in DOM order: `.pool` is positioned
            with no z-index, so it would otherwise paint over the in-flow
            buttons (the same trap StatBand's `relative z-[1]` answers).
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-72px] left-[20%] h-[260px] w-[60%]"
          >
            <Pool />
          </span>
          <div className="relative z-[1] flex flex-wrap items-center justify-center gap-3">
            <Button href={ctaHref} variant="light">
              {ctaLabel}
            </Button>
            {secondary && (
              <Button href={secondary.href} variant="glass" icon={<MailIcon />}>
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </div>

      {/* Bottom Seam — the rim between this band and the footer pool. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <Seam />
      </div>
    </section>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4.5 8 6.6 4.6a1.6 1.6 0 0 0 1.8 0L19.5 8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
