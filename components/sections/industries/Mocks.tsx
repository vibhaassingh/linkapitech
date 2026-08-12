import { Terminal } from "@/components/sections/home/Terminal";
import { Icon } from "@/components/ui/Icon";
import { MOCK_DATA, NBFC_SAMPLE, type Segment } from "@/content/industries";

/**
 * Product-UI mocks shown beside each industry.
 *
 * Built as DOM + SVG rather than exported images: they stay crisp at any DPR,
 * inherit the design tokens, and their text is translatable. Every figure is
 * illustrative sample data (see MOCK_DATA) and is labelled as such for
 * assistive tech via the wrapper's aria-label.
 */
export function SegmentMock({ mock }: { mock: Segment["mock"] }) {
  const inner = () => {
    switch (mock) {
      case "reconciliation":
        return <Reconciliation />;
      case "nbfc":
        return (
          <Terminal
            title={NBFC_SAMPLE.title}
            lines={NBFC_SAMPLE.lines}
            className="w-full"
          />
        );
      case "ledger":
        return <Ledger />;
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

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line-soft bg-canvas p-6 md:p-8">
      <div className="rounded-md border border-line-soft bg-surface p-5 shadow-card md:p-6">
        {children}
      </div>
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

      <div className="mt-4 h-2 overflow-hidden rounded-pill bg-lavender-200">
        <span
          className="mk-bar grad-fill block h-full w-full rounded-pill"
          style={
            { "--mk-fill": String(d.progress / 100) } as React.CSSProperties
          }
        />
      </div>
      <div className="mt-2.5 flex justify-between text-[12.5px]">
        <span className="text-ink-3">{d.footLeft}</span>
        <span className="font-semibold text-violet-text">{d.footRight}</span>
      </div>
    </Shell>
  );
}

function Ledger() {
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

function Checkout() {
  const d = MOCK_DATA.checkout;
  return (
    <Shell>
      <MockFx />
      <p className="text-[14px] font-semibold text-ink">{d.title}</p>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-tint text-violet-text">
          <Icon name="cart" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-medium text-ink">
            {d.item}
          </span>
          <span className="block text-[12px] text-ink-3">{d.qty}</span>
        </span>
        <span className="text-[15px] font-semibold text-ink">{d.price}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-plum-600 px-4 py-3">
        <span className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
          <Icon name="card" size={17} className="text-violet-text" />
          {d.method}
        </span>
        <span className="h-3 w-3 rounded-pill bg-plum-600" />
      </div>

      {/* Sample UI, so this stays a <p>: it must not read to a screen reader or
          a keyboard user as an operable payment control. The press-release is
          therefore played on entry rather than bound to :active. */}
      <p className="mk-press mt-4 rounded-pill bg-plum-700 py-3 text-center text-[14px] font-semibold text-ink-inv">
        {d.cta}
      </p>
    </Shell>
  );
}

function Rails() {
  const d = MOCK_DATA.rails;
  return (
    <Shell>
      <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-3">
        {d.heading}
      </p>

      {/* Below `sm` the three nodes stack: at 390px three 97px nodes plus the
          connectors forced a horizontal scrollbar. The `min-w-0` chain (row →
          node) is what lets `truncate` engage instead of the flex items pushing
          the track wider — do not remove either. */}
      <div className="mt-6 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        {d.nodes.map((n, i) => (
          <div
            key={n.label}
            className="flex min-w-0 items-center gap-2 sm:flex-1"
          >
            <div
              className={
                i === 1
                  ? "min-w-0 flex-1 rounded-md bg-plum-700 px-3 py-3 text-center"
                  : "min-w-0 flex-1 rounded-md border border-line-soft px-3 py-3 text-center"
              }
            >
              <p
                className={
                  i === 1
                    ? "truncate text-[9.5px] font-semibold uppercase tracking-wide text-ink-inv-2"
                    : "truncate text-[9.5px] font-semibold uppercase tracking-wide text-ink-3"
                }
              >
                {n.kicker}
              </p>
              <p
                className={
                  i === 1
                    ? "mt-0.5 truncate text-[12.5px] font-semibold text-ink-inv"
                    : "mt-0.5 truncate text-[12.5px] font-semibold text-violet-text"
                }
              >
                {n.label}
              </p>
            </div>
            {i < d.nodes.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden shrink-0 text-lavender-400 sm:block"
              >
                {/* `.eco-wire` is the project's existing dash-flow primitive
                    (globals.css): it drifts stroke-dashoffset toward the next
                    node. stroke-dashoffset is a paint property — it cannot
                    reflow, so CLS stays 0. Reduced motion: the global rule
                    collapses the duration and pins iterations to 1, leaving a
                    static dashed rail.
                    dasharray is "2 3", not the old "3 4", because ecoWire ends
                    at dashoffset -20 and the pattern period must divide 20 or
                    the loop visibly jumps every cycle. The delay is NEGATIVE,
                    so hop 2 starts mid-cycle and the dashes read as one
                    continuous flow instead of each hop waiting its turn. */}
                <svg viewBox="0 0 24 8" width="24" height="8" fill="none">
                  <path
                    className="eco-wire"
                    style={
                      { "--wire-delay": `${i * -0.85}s` } as React.CSSProperties
                    }
                    d="M0 4h20"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeDasharray="2 3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}
