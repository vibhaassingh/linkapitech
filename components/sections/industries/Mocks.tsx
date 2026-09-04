import { Fragment } from "react";
import { Terminal } from "@/components/sections/home/Terminal";
import { ConduitPath, Node, Pool } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { MOCK_DATA, NBFC_SAMPLE, type Segment } from "@/content/industries";
import { cn } from "@/lib/cn";

/**
 * THE ROW RHYTHM — L·D·L·D·L (REDESIGN-V4 Part G), single-sourced.
 *
 * The page needs it to pick each section's band, and the mocks need it to pick
 * their ink; keeping one table keyed by `mock` is what stops the two from
 * disagreeing silently — a mock rendered with light ink on a plum band is
 * invisible, and no check would name the cause.
 *
 * NBFC and E-commerce are the dark rows because the terminal and the checkout
 * read best on plum. NBFC is specifically `band-a`: Phase 7 measured the
 * Ledger's worst ink, `--terminal-cmt` #8b93a0, at 5.44:1 on
 * `rgba(23,27,33,.78)` over band A's brightest stop, and 5.32:1 even with a
 * Caustic core behind it — moving that row to another band means re-measuring
 * the whole syntax palette.
 *
 * `caustic` is the disc's TOP-LEFT corner for a 480px disc (motifs.css has no
 * centring transform, because `.scrub-drift` owns transform on that element),
 * so the comments give the centre. Both sit at ~80% of the width, which at lg
 * is the COPY column on these two rows (both are `mockFirst`, so the mock is on
 * the left) — a `--violet-a24` core under flat band text costs `--ink-inv-2`
 * only 8.06 → 6.88:1, whereas under GLASS it costs 4.52 → 4.01:1 and the
 * contrast walk cannot see a sibling overlay (§A6, Part J Phase 6). Below lg
 * the columns stack and the disc can land behind the mock, which is the second
 * reason every text run inside a dark mock Vessel is `--ink-inv`.
 */
export const ROW: Record<
  Segment["mock"],
  { dark: boolean; band: string; caustic?: { x: string; y: string } }
> = {
  /* Banks */
  reconciliation: { dark: false, band: "bg-surface" },
  /* NBFCs — centre (80%, 30%) */
  nbfc: {
    dark: true,
    band: "section-dark band-a",
    caustic: { x: "calc(80% - 240px)", y: "calc(30% - 240px)" },
  },
  /* SMEs & Enterprises */
  ledger: { dark: false, band: "bg-canvas" },
  /* E-commerce — centre (82%, 72%); band B's own bloom is already at 88% 8%,
     so this one lights the flat lower half instead of doubling the key. */
  checkout: {
    dark: true,
    band: "section-dark band-b",
    caustic: { x: "calc(82% - 240px)", y: "calc(72% - 240px)" },
  },
  /* Fintech */
  rails: { dark: false, band: "bg-surface" },
};

/**
 * Product-UI mocks shown beside each industry.
 *
 * Built as DOM + SVG rather than exported images: they stay crisp at any DPR,
 * inherit the design tokens, and their text is translatable. Every figure is
 * illustrative sample data (see MOCK_DATA) and is labelled as such for
 * assistive tech via the wrapper's aria-label.
 *
 * V4: each mock is a Vessel (`Shell` below) and each takes its tone from `ROW`
 * above rather than from a prop, so the page cannot hand a mock the wrong band.
 */
export function SegmentMock({ mock }: { mock: Segment["mock"] }) {
  const inner = () => {
    switch (mock) {
      case "reconciliation":
        return <Reconciliation />;
      case "nbfc":
        /* The Ledger IS the vessel (Part C) — a glass code window, not a
           terminal inside a second glass shell, so it gets no `Shell`. Inside
           `.section-dark` at ≥1024 globals.css makes the shell translucent and
           frosts the plum behind it; on light bands and on phones it stays the
           opaque `--terminal`. No `progress`: the line-by-line scrub belongs
           to ProcessRail, and this row keeps its staggered burst on
           intersection. */
        return (
          <Terminal
            title={NBFC_SAMPLE.title}
            lines={NBFC_SAMPLE.lines}
            variant="ledger"
            className="w-full"
          />
        );
      case "ledger":
        return <LedgerSync />;
      case "checkout":
        return <Checkout />;
      case "rails":
        return <Rails />;
    }
  };

  return (
    <div
      role="img"
      aria-label="Illustrative product interface with sample data"
      className="w-full min-w-0"
    >
      {inner()}
    </div>
  );
}

/* ============================================================
   Mock motion.
   ============================================================
   Two effects, both keyed off the `data-inview` that the surrounding <Reveal>
   already renders — so there is no second observer, no scroll handler, and the
   mocks animate in step with the copy beside them.

   `.mk-bar`   the reconciliation fill. Animates `transform: scaleX`, never
               `width`, so it stays on the compositor and cannot cause CLS. Its
               RESTING state is the filled bar (`scaleX(var(--mk-fill))`): with
               JS off, or before the observer fires, the figure still reads
               correctly — the animation only replays it from zero.
   `.mk-press` the checkout button's press-release. Starts 4% down and settles
               on `--spring-snappy`, whose `linear()` stop list exceeds 1, so the
               release genuinely overshoots. Resting state is `scale(1)`.

   Reduced motion: the global block in globals.css forces
   `animation-duration: 0.001ms !important`, so each animation lands on its `to`
   frame immediately — and both `to` frames ARE the resting state, so nothing is
   left mid-pose. It does NOT reset `animation-delay`, though, and `both` holds
   the `from` frame throughout a delay: without the media query below, the bar
   would sit empty for 120ms and the button 4% small for 340ms before snapping.
   Zeroing the delay removes even that.

   Emitted with React 19's `href` + `precedence` so it is hoisted into <head>
   and de-duplicated across the five mocks on the page. */
const MOCK_FX_ID = "s7-industry-mock-fx";
const MOCK_FX_CSS = `
.mk-bar{transform:scaleX(var(--mk-fill,1));transform-origin:left center}
[data-inview] .mk-bar{animation:mkBar 1s var(--ease-out-expo) .12s both}
@keyframes mkBar{from{transform:scaleX(0)}to{transform:scaleX(var(--mk-fill,1))}}
.mk-press{transform:none}
[data-inview] .mk-press{animation:mkPress var(--dur-spring-snappy) var(--spring-snappy) .34s both}
@keyframes mkPress{from{transform:scale(.96)}to{transform:none}}
@media (prefers-reduced-motion:reduce){
[data-inview] .mk-bar,[data-inview] .mk-press{animation-delay:0s!important}}
`;

function MockFx() {
  return (
    <style href={MOCK_FX_ID} precedence="default">
      {MOCK_FX_CSS}
    </style>
  );
}

/**
 * The mock's container is now a VESSEL (REDESIGN-V4 Part G): one pane of glass
 * instead of the old canvas-card-inside-a-canvas-card. `.liq liq-light` on a
 * light row, `.liq` on a dark one, on the 24px Vessel radius.
 *
 * `liq-flat` on the LIGHT rows is arithmetic, not budget: they sit on a flat
 * `--surface` / `--canvas`, and a Gaussian blur of a constant field IS that
 * constant (Chromium duplicates at the edges, so a uniform backdrop stays
 * uniform), while `saturate(1.15)` on rgb(250,248,252) computes back to the
 * same colour to the nearest LSB. The frost there is provably zero pixels of
 * difference for real GPU cost (Part J Phase 8); the rim ring, the wet edge
 * and `--liq-light-shadow` are what draw the glass. The DARK rows sit on a
 * plum gradient with a Caustic behind it, so their frost does real work and
 * stays — one blur layer per dark row, and the two dark rows are never
 * adjacent (§A7).
 *
 * No flat `border` and no `shadow-card`: on `.liq` the rim ring IS the border
 * and the material owns its elevation (§A2). No `bg-*` utility either — `.liq`
 * sets `background-color` after Tailwind's utilities, so a `bg-canvas` here
 * would be a silent no-op (the trap Phase 2 recorded for `Card`'s light
 * feature and Phase 8 for the Testimonials figure).
 */
function Shell({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "liq rounded-xl p-6 md:p-8",
        !dark && "liq-light liq-flat",
      )}
    >
      {children}
    </div>
  );
}

function Reconciliation() {
  const d = MOCK_DATA.reconciliation;
  return (
    <Shell>
      <MockFx />
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
          <span className="h-2.5 w-2.5 rounded-pill bg-plum-700" />
          {d.title}
        </span>
        {/* color-mix, not `bg-[color:var(--success)]/10`: Tailwind's opacity
            modifier silently compiles to NOTHING on a var() colour, so that
            chip had no fill at all. Where color-mix is unsupported the
            declaration is simply dropped and --success-text still clears AA on
            the white card beneath. */}
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-wide text-[color:var(--success-text)]">
          <span className="h-1.5 w-1.5 rounded-pill bg-[color:var(--success)]" />
          {d.status}
        </span>
      </div>

      <hr className="my-4 border-line-soft" />

      <p className="text-[13px] text-ink-3">{d.metricLabel}</p>
      <p className="mt-1 text-[26px] font-bold tracking-tight text-violet-text">
        {d.metricValue}
      </p>

      {/*
        THE BAR SITS OVER A POOL (V4 Part G): the automated-match fill reads as
        liquid standing in a trough rather than as a progress meter.

        The geometry is bottom-anchored arithmetic, because `.pool` is the
        bottom 46% of its box and overriding that with a Tailwind `h-*` would
        lose to motifs.css (emitted after Tailwind). This box is 12 + 8 + 40 =
        60px, so the basin is 27.6px tall and its top edge — where `.pool::before`
        paints a 1px lavender meniscus line — sits at 32.4px, a clear 12.4px
        below the bar's 20px bottom. That clearance is deliberately generous:
        at ~10px the meniscus line stops reading as a liquid surface and starts
        reading as an underline (Part J Phase 8).

        The foot row stays OUTSIDE the box. §A6 allows only `--ink` over a light
        Pool, and those two runs are `--ink-3` and `--violet-text`, so they are
        kept off it geometrically rather than promoted. The Pool is FIRST in DOM
        with the bar on `relative z-[1]`: `.pool` is positioned with no z-index
        and would otherwise paint over in-flow content (StatBand's trap). It
        rises with the surrounding <Reveal>'s `data-inview` and rests full.
      */}
      <div className="relative mt-4 overflow-hidden rounded-md pb-10 pt-3">
        <Pool light />
        <span className="relative z-[1] block h-2 overflow-hidden rounded-pill bg-lavender-200">
          <span
            className="mk-bar grad-fill block h-full w-full rounded-pill"
            style={
              { "--mk-fill": String(d.progress / 100) } as React.CSSProperties
            }
          />
        </span>
      </div>
      <div className="mt-1 flex justify-between text-[12.5px]">
        <span className="text-ink-3">{d.footLeft}</span>
        <span className="font-semibold text-violet-text">{d.footRight}</span>
      </div>
    </Shell>
  );
}

/**
 * The SMEs & Enterprises mock — the ERP ledger-sync sheet. Named `LedgerSync`
 * and not `Ledger`: Part C's Ledger is the glass code WINDOW (`.terminal.ledger`,
 * which this page uses for the NBFC row), and two things called Ledger on one
 * page is one grep away from a mistake.
 */
function LedgerSync() {
  const d = MOCK_DATA.ledger;
  return (
    <Shell>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[14px] font-semibold text-ink">{d.title}</span>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[color:var(--success-text)]">
          <span className="h-1.5 w-1.5 rounded-pill bg-[color:var(--success)]" />
          {d.status}
        </span>
      </div>

      <dl className="mt-4 divide-y divide-line-soft border-y border-line-soft">
        {d.rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4 py-3"
          >
            <dt className="text-[12.5px] text-ink-3">{r.label}</dt>
            <dd className="text-[13.5px] font-semibold text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {d.tiles.map((t) => (
          <div key={t.label} className="rounded-md bg-tint px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
              {t.label}
            </p>
            <p className="mt-0.5 text-[17px] font-bold text-violet-text">
              {t.value}
            </p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

/**
 * The E-commerce mock, on a DARK row.
 *
 * EVERY TEXT RUN HERE IS `--ink-inv`, including the ones that read as secondary
 * on the light mocks. Tier-2 glass over band B composites to a surface where
 * `--ink-inv-2` measures 4.54:1 — 0.04 of headroom over the floor — and the
 * row's Caustic is a sibling overlay the contrast walk cannot see: a core
 * behind this Vessel takes that to 4.01:1. §A6's remedy is "place the disc off
 * body copy or promote the run", and below lg the stacked columns put the disc
 * wherever the section is 72% tall, so the run is promoted. Hierarchy comes
 * from size and weight instead of from ink, which is what a UI mock has anyway.
 * `--ink-inv` on the same composite is 7.38:1.
 *
 * Surfaces follow: the icon tile is a `Node inset` (nested glass never blurs,
 * §A7) in place of the `bg-tint` square, the method row's `--plum-600` outline
 * becomes `--line-inv`, and the two violet accents become `--lavender-400` —
 * 4.36:1 on this composite, under the 4.5 text floor but well over 1.4.11's
 * 3:1 for non-text, so it is used for glyphs and the radio bead and never for
 * a text run. The CTA inverts to a white pill, as `Button variant="light"`
 * does on every dark band.
 */
function Checkout() {
  const d = MOCK_DATA.checkout;
  return (
    <Shell dark>
      <MockFx />
      <p className="text-[14px] font-semibold text-ink-inv">{d.title}</p>

      <div className="mt-4 flex items-center gap-3">
        <Node
          inset
          size={44}
          className="text-lavender-400"
          icon={<Icon name="cart" size={18} />}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium text-ink-inv">
            {d.item}
          </span>
          <span className="block text-[12px] text-ink-inv">{d.qty}</span>
        </span>
        <span className="text-[15px] font-semibold text-ink-inv">
          {d.price}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-line-inv px-4 py-3">
        <span className="flex items-center gap-2.5 text-[13px] font-medium text-ink-inv">
          <Icon name="card" size={17} className="text-lavender-400" />
          {d.method}
        </span>
        <span className="h-3 w-3 rounded-pill bg-lavender-400" />
      </div>

      {/* Sample UI, so this stays a <p>: it must not read to a screen reader or
          a keyboard user as an operable payment control. The press-release is
          therefore played on entry rather than bound to :active. */}
      <p className="mk-press mt-4 rounded-pill bg-surface py-3 text-center text-[14px] font-semibold text-plum-950">
        {d.cta}
      </p>
    </Shell>
  );
}

/**
 * The Fintech mock — the deployment rails, rebuilt on the motif kit (V4 Part
 * G): three light `Node`s joined by two `ConduitPath`s carrying a
 * `.conduit-pulse` packet, replacing the three bordered boxes and their
 * `.eco-wire` dash hops.
 *
 * `.conduit-pulse` is the kit's one paint-only animation (stroke-dashoffset on
 * a curve has no composited equivalent), allowlisted by name in gate.sh, and
 * `display: none` below 1024 and under reduced motion — so at those sizes the
 * connectors are their solid base stroke and the composition is complete and
 * static. `pathLength="100"` normalises each hop so the `8 92` dasharray is
 * one packet per path whatever its length; the −3s delay on the second hop puts
 * the two packets half a period apart, i.e. one arrival every 3s.
 *
 * The middle Node is the router, so it keeps the highlight the old middle box
 * had — LinkAPI's own `--grad-tile` gradient, inline because `.node-light` sets
 * `background` and `color` in motifs.css and would win both ties (the Ecosystem
 * port-bead precedent, Part J Phase 7). The outer two are `node-light` at its
 * designed size: a `--lavender-200` disc carrying a `--violet-text` glyph.
 *
 * Below `sm` the three stops stack as [disc][label] rows and the connectors are
 * hidden — at 390px three side-by-side stops forced a horizontal scrollbar. The
 * `min-w-0` chain (row → stop → label) is what lets `truncate` engage instead
 * of the flex items pushing the track wider; do not remove any link of it.
 */
function Rails() {
  const d = MOCK_DATA.rails;
  const glyph = ["code", "link", "bank"] as const;
  return (
    <Shell>
      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-3">
        {d.heading}
      </p>

      <div className="mt-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        {d.nodes.map((n, i) => {
          const hub = i === 1;
          return (
            <Fragment key={n.label}>
              <div className="flex min-w-0 items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2 sm:text-center">
                <Node
                  light
                  lit={hub}
                  size={40}
                  style={
                    hub
                      ? {
                          background: "var(--grad-tile)",
                          color: "var(--ink-inv)",
                        }
                      : undefined
                  }
                  icon={<Icon name={glyph[i]} size={17} />}
                />
                <div className="min-w-0">
                  {/* 10px, not 9.5: scripts/qa/layout.mjs flags anything under
                      10px as unreadable, and it is right — these are real
                      labels, not decoration. Safe at every width: below sm each
                      stop is a full-width row, and from sm the stops are
                      `flex-1` thirds (~186px of inner width at 768px against
                      ~90px of 10px uppercase text), so `truncate` never
                      engages. */}
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-ink-3">
                    {n.kicker}
                  </p>
                  <p className="mt-0.5 truncate text-[12.5px] font-semibold text-violet-text">
                    {n.label}
                  </p>
                </div>
              </div>

              {i < d.nodes.length - 1 && (
                /* mt-4 centres the 8px svg on the 40px Node's centre (16 + 4 =
                   20px) once the stops are columns. */
                <span
                  aria-hidden="true"
                  className="hidden shrink-0 sm:mt-4 sm:block"
                >
                  <svg viewBox="0 0 40 8" width="40" height="8" fill="none">
                    <ConduitPath
                      d="M0 4h40"
                      light
                      pulse
                      pulseDelay={`${i * -3}s`}
                    />
                  </svg>
                </span>
              )}
            </Fragment>
          );
        })}
      </div>
    </Shell>
  );
}
