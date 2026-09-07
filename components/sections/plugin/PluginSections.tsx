import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { Droplet, Node, Seam } from "@/components/motifs";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "./PluginMockup";
import {
  PLUGIN,
  PLUGIN_FEATURES,
  PLUGIN_HIGHLIGHTS,
  PLUGIN_MOCK,
  PLUGIN_VALUES,
  type PluginStep,
  type Vignette,
} from "@/content/plugin";
import { CAPABILITIES } from "@/content/capabilities";
import { cn } from "@/lib/cn";

/**
 * The Bank Plugin's shared section kit.
 *
 * Four routes render these: the product hub `/bank-plugin` and the three
 * bank landing pages `/bank-plugin/{axis,hsbc,indusind}`. The features,
 * highlights, value propositions and capability list are IDENTICAL for every
 * bank — it is one product — so they live here once. What differs per bank
 * (onboarding route, support desk, price, portal) is passed in or lives on
 * the bank page itself.
 *
 * All server components. The flat grammar of this kit is deliberate and is
 * the reason the plugin routes carry almost no blur budget: plates are
 * `bg-surface` / `bg-canvas` with a hairline, and the one dark band's cards
 * are `liq liq-flat` — on a flat plum band a Gaussian blur of a constant
 * field is that constant, so the frost is provably zero pixels and the rim
 * plus shadow do all the drawing.
 */

/** The portal's five Highlights, as a quiet pill row. */
export function HighlightPills({
  items = PLUGIN_HIGHLIGHTS,
  className,
}: {
  items?: readonly string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "mx-auto flex max-w-[980px] flex-wrap items-center justify-center gap-2.5",
        className,
      )}
    >
      {items.map((h) => (
        <li
          key={h}
          className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-[13.5px] font-medium text-ink-2"
        >
          <Check />
          {h}
        </li>
      ))}
    </ul>
  );
}

/** "Features of the plugin" — four cards, each over a code-drawn vignette. */
export function FeatureGrid({ lead }: { lead?: string }) {
  return (
    <section id="features" className="section-pad bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <span className="eyebrow-capsule mb-6 inline-flex">
            Features of the plugin
          </span>
          <h2 className="display-2 text-ink">
            Everyday banking,{" "}
            <span className="accent-word">done from the ledger.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-2">
            {/* TODO: client to confirm — drafted section lead; the four
                feature cards below are the portal's own copy. */}
            {lead ??
              "Four things your finance team does every day — now inside the ERP, against live bank data, with no portal-hopping and no re-keying."}
          </p>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2"
          step={100}
        >
          {PLUGIN_FEATURES.map((f) => (
            <article
              key={f.title}
              className="flex h-full flex-col rounded-xl border border-line-soft bg-surface p-7 shadow-card md:p-8"
            >
              <FeatureVignette kind={f.vignette} />
              <div className="mt-6 flex items-start gap-4">
                <span className="card-icon-light shrink-0" aria-hidden="true">
                  <Icon name={f.icon} size={20} />
                </span>
                <div>
                  <h3 className="heading-3 text-ink">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                    {f.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/** "Value propositions" — the portal's five, as five short plates. */
export function ValueGrid({ heading }: { heading?: string }) {
  return (
    <section
      id="why"
      className="section-pad border-y border-line-soft bg-surface"
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="max-w-[52rem]">
          <span className="eyebrow-capsule mb-6 inline-flex">
            Value propositions
          </span>
          <h2 className="display-2 text-ink">
            {/* TODO: client to confirm — drafted heading; the five cards are
                the portal's own "Value Propositions of Plugin". */}
            {heading ?? "Built for the way businesses actually bank."}
          </h2>
        </Reveal>

        <RevealGroup
          as="ul"
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
          step={70}
        >
          {PLUGIN_VALUES.map((v) => (
            <div
              key={v.title}
              className="flex h-full flex-col rounded-lg border border-line-soft bg-canvas p-6"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-full bg-plum-600 text-ink-inv"
                aria-hidden="true"
              >
                <Icon name={v.icon} size={19} />
              </span>
              <p className="mt-5 text-[15px] font-semibold leading-snug text-ink">
                {v.title}
              </p>
            </div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/**
 * "How it works" — the one dark band. `steps` is per-bank: Axis and HSBC
 * register on the LinkAPI portal, IndusInd goes through IndusDirect.
 */
export function StepBand({
  steps,
  heading,
  lead,
  showCapabilities = true,
}: {
  steps: PluginStep[];
  heading?: string;
  lead?: string;
  showCapabilities?: boolean;
}) {
  return (
    <section
      id="how-it-works"
      data-surface="dark"
      className="section-dark band-b section-pad"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
      >
        <Seam />
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
        <Reveal className="mx-auto max-w-[44rem] text-center">
          <Droplet className="liq-flat text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv">
            How it works
          </Droplet>
          <h2 className="display-2 mt-7 text-ink-inv">
            {/* TODO: client to confirm — drafted heading; the steps themselves
                are the portal's own. */}
            {heading ?? "Four steps from sign-up to your first payment."}
          </h2>
          <p className="mx-auto mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-inv-2">
            {lead ?? PLUGIN.fit}
          </p>
        </Reveal>

        <RevealGroup
          as="ol"
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          step={110}
        >
          {steps.map((s) => (
            <div
              key={s.num}
              className="liq liq-flat relative flex h-full flex-col overflow-hidden rounded-lg p-7 pb-16"
            >
              <Node inset size={44} icon={<Icon name={s.icon} size={20} />} />
              <h3 className="heading-3 mt-6 text-ink-inv">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-inv-2">
                {s.body}
              </p>
              {/* Watermark numeral, clipped by the card like WhatWeDo's. */}
              <span
                aria-hidden="true"
                className="ghost-num pointer-events-none absolute -bottom-3 right-5 select-none text-[64px]"
              >
                {s.num}
              </span>
            </div>
          ))}
        </RevealGroup>

        {showCapabilities && (
          <Reveal delay={120} className="mt-16 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-eyebrow text-ink-inv-2">
              Everything the plugin exposes inside your ERP
            </p>
            <ul className="mx-auto mt-6 flex max-w-[900px] flex-wrap items-center justify-center gap-2.5">
              {CAPABILITIES.map((c) => (
                <li key={c.title}>
                  <Droplet
                    as="span"
                    className="liq-flat text-[13px] font-medium text-ink-inv"
                  >
                    {c.title}
                  </Droplet>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <Seam />
      </div>
    </section>
  );
}

/**
 * Small code-drawn UI snippets at the top of each feature card. Same sample
 * data as the hero mockup (PLUGIN_MOCK), same illustrative-figures caveat.
 * Decorative: the card's title and body carry the meaning. `text-left`
 * because a plugin hero column is `text-center` and these are UI, not prose.
 */
export function FeatureVignette({ kind }: { kind: Vignette }) {
  const m = PLUGIN_MOCK;
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-lg border border-line-soft bg-canvas-2 p-4 text-left"
    >
      {kind === "balance" && (
        <ul className="space-y-2">
          {m.accounts.map((a) => (
            <li
              key={a.label}
              className="flex items-center justify-between rounded-md bg-surface px-3.5 py-2.5 text-[13px]"
            >
              <span className="font-medium text-ink-2">{a.label}</span>
              <span className="tnum font-semibold text-ink">{a.balance}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 px-1 pt-1 text-[11.5px] text-ink-3">
            <span className="pulse-dot" /> Statement fetched · refreshed just
            now
          </li>
        </ul>
      )}

      {kind === "payments" && (
        <ul className="space-y-2">
          {m.payments.slice(0, 2).map((p) => (
            <li
              key={p.payee}
              className="flex items-center gap-3 rounded-md bg-surface px-3.5 py-2.5 text-[13px]"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lavender-200 text-[10px] font-semibold text-plum-700">
                {p.payee.charAt(0)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink">
                {p.payee}
              </span>
              <span className="tnum text-ink-2">{p.amount}</span>
              <StatusPill status={p.status} />
            </li>
          ))}
          <li className="flex justify-end pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-plum-600 px-3 py-1.5 text-[11.5px] font-semibold text-ink-inv">
              <Icon name="cash" size={12} /> Initiate from Tally
            </span>
          </li>
        </ul>
      )}

      {kind === "reconcile" && (
        <div>
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="font-medium text-ink-2">
              Bank statement vs ledger
            </span>
            <span className="tnum font-semibold text-ink">
              {m.reconcile.matched}/{m.reconcile.total} matched
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-pill bg-lavender-200">
            <span
              className="block h-full rounded-pill bg-plum-600"
              style={{
                width: `${(m.reconcile.matched / m.reconcile.total) * 100}%`,
              }}
            />
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-[11.5px]">
            <li className="rounded-md bg-surface py-2">
              <span className="tnum block text-[15px] font-semibold text-ink">
                {m.reconcile.matched}
              </span>
              <span className="text-ink-3">auto-matched</span>
            </li>
            <li className="rounded-md bg-surface py-2">
              <span className="tnum block text-[15px] font-semibold text-ink">
                {m.reconcile.total - m.reconcile.matched}
              </span>
              <span className="text-ink-3">to review</span>
            </li>
            <li className="rounded-md bg-surface py-2">
              <span className="tnum block text-[15px] font-semibold text-ink">
                0
              </span>
              <span className="text-ink-3">re-keyed</span>
            </li>
          </ul>
        </div>
      )}

      {kind === "status" && (
        <ol className="relative flex items-start justify-between gap-2 px-1 pt-1">
          <span className="absolute left-4 right-4 top-[15px] h-px bg-lavender-300" />
          {m.timeline.map((t, i, arr) => (
            <li
              key={t}
              className="relative flex flex-1 flex-col items-center gap-2 text-center"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-plum-600 text-ink-inv">
                <Check inverse />
              </span>
              <span
                className={cn(
                  "text-[11.5px] leading-tight",
                  i === arr.length - 1
                    ? "font-semibold text-ink"
                    : "text-ink-2",
                )}
              >
                {t}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function Check({ inverse }: { inverse?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", inverse ? "text-ink-inv" : "text-plum-600")}
    >
      <path
        d="m5 10.4 3.2 3.2L15.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 8.5v7l5.5-3.5L10 8.5Z" fill="currentColor" />
    </svg>
  );
}

export function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 5h5v5M19 5l-8 8M9 6H6.5A1.5 1.5 0 0 0 5 7.5v10A1.5 1.5 0 0 0 6.5 19h10a1.5 1.5 0 0 0 1.5-1.5V15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The ERP marks. THE HEADING IS FIXED COPY (CONTENT-TODO §1). */
export function ErpStrip({ note }: { note?: string }) {
  return (
    <Reveal delay={120} className="text-center">
      <h3 className="heading-3 text-ink">ERPs we integrate with</h3>
      <p className="mx-auto mt-2 max-w-[56ch] text-[14.5px] leading-relaxed text-ink-3">
        {/* TODO: client to confirm — which ERPs this plugin itself supports
            (content/plugin.ts erpToday). */}
        {note ??
          `The Bank Plugin ships for ${PLUGIN.erpToday} today. LinkAPI builds reconciliation plugins for the rest.`}
      </p>
    </Reveal>
  );
}
