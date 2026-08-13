import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { CAPABILITIES, ARCHITECTURE } from "@/content/capabilities";
import { ERPS } from "@/content/clients";
import { cn } from "@/lib/cn";

export const metadata = pageMetadata({
  title: "Connected Banking",
  description:
    "Connected Banking Enterprise Solution brings full banking functionality into the accounting and ERP systems your teams already use — balances, payments, collections and automated reconciliation.",
  path: "/connected-banking",
});

export default function ConnectedBankingPage() {
  return (
    <>
      <PageHero
        eyebrow="Bank integration"
        align="left"
        title={
          <>
            Your <span className="accent-word">bank account,</span> inside your
            ERP.
          </>
        }
        lead="Connected Banking Enterprise Solution brings full banking functionality into the accounting and ERP systems your teams already use. Check balances, make payments, run collections and reconcile automatically — without ever leaving your workflow."
        visual={<ConnectionDiagram />}
      />

      {/* Capabilities */}
      <section id="capabilities" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="display-2 text-ink">Capabilities</h2>
          </Reveal>

          <div className="relative mt-14">
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[7px] top-6 w-px bg-line-plum lg:left-1/2"
            />

            {/*
              One Reveal per row rather than a RevealGroup: the rail is nine
              cards tall, so a single group observer fired on the FIRST card and
              ran the whole stagger while cards 5–9 were still far below the
              fold — they were already revealed by the time you reached them.
              Per-row observers also give `.scrub-fade-side` the per-row
              [data-reveal] direction attribute it keys off.
            */}
            <ul className="flex flex-col gap-6 lg:gap-3">
              {CAPABILITIES.map((c, i) => {
                const right = i % 2 === 1;
                return (
                  <li key={c.title} className="relative">
                    {/* The rail dot is absolute, so it takes no grid cell — the
                        card is placed by explicit column rather than `order`,
                        which would have nothing in flow to swap with. */}
                    <div className="grid grid-cols-1 items-center gap-x-12 lg:grid-cols-2">
                      <Reveal
                        dir={right ? "right" : "left"}
                        className={cn(
                          // .scrub-fade-side upgrades the one-shot side
                          // entrance to a scroll-scrubbed one; it is declared
                          // ONLY from 1024px (and only under @supports
                          // animation-timeline), for the same reason
                          // [data-reveal="left"] is — below lg every card is in
                          // one column, where an outward transform pushes the
                          // card past the viewport, widens the document and
                          // produces a phone scrollbar. `peer` is the hook for
                          // the rail dot below.
                          "scrub-fade-side peer pl-9 lg:pl-0",
                          right
                            ? "lg:col-start-2 lg:pl-12"
                            : "lg:col-start-1 lg:pr-12",
                        )}
                      >
                        <article className="rounded-lg border border-line-soft bg-surface p-6 shadow-card md:p-7">
                          <span className="grad-fill grid h-11 w-11 place-items-center rounded-md text-ink-inv">
                            <Icon name={c.icon} size={19} />
                          </span>
                          <h3 className="mt-5 text-[17px] font-semibold text-ink">
                            {c.title}
                          </h3>
                          <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">
                            {c.body}
                          </p>
                        </article>
                      </Reveal>

                      {/*
                        Rail node. Two layers of the same pulse, one per
                        capability level, and they can never fight because each
                        owns the transform in a state the other does not exist in:

                        - where view() timelines exist, `.orb-hand-off` scrubs
                          the dot from 0.82/0.35 → 1/1 at mid-transit → back,
                          so it peaks exactly as its card crosses the viewport
                          CENTRE. `!important` on the timing function replaces
                          the utility's own `linear` with --spring-snappy, whose
                          overshoot turns the swell into a pop. --orb-x carries
                          the lg rail centring the keyframes would otherwise
                          overwrite (Y centring moved to -mt-2 for the same
                          reason — a margin survives every transform).
                        - everywhere else (no view() support, or reduced motion,
                          where globals.css sets `animation: none`) the keyframes
                          are gone and the element's own transform applies:
                          scale .55 → 1 on --spring-snappy, triggered by the
                          card's reveal state through `peer`.
                      */}
                      <span
                        aria-hidden="true"
                        className="orb-hand-off absolute left-0 top-1/2 -mt-2 h-4 w-4 scale-[0.55] rounded-pill bg-plum-700 ring-4 ring-[color:var(--violet-soft)] transition-transform duration-[var(--dur-spring-snappy)] ease-[var(--spring-snappy)] ![animation-timing-function:var(--spring-snappy)] peer-data-[inview]:scale-100 lg:left-1/2 lg:-translate-x-1/2 lg:[--orb-x:-50%]"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ERP band */}
      <section className="border-y border-line-soft bg-surface py-14">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal className="text-center">
            <h2 className="text-[13px] font-semibold uppercase tracking-eyebrow text-ink-3">
              ERPs we integrate with
            </h2>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 md:gap-x-12">
              {ERPS.map((e) => (
                <li
                  key={e.name}
                  className="grid h-12 w-[130px] place-items-center"
                >
                  <Image
                    src={e.logo}
                    alt={e.name}
                    width={130}
                    height={48}
                    style={{ transform: `scale(${e.scale ?? 1})` }}
                    className="max-h-12 w-auto max-w-[130px] object-contain"
                    unoptimized
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-pad bg-canvas">
        <div className="mx-auto w-full max-w-[1240px] px-6 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">How It Works</h2>
            <p className="mt-5 max-w-[86ch] text-[15.5px] leading-relaxed text-ink-2">
              {ARCHITECTURE.lead}
            </p>
          </Reveal>

          <Reveal delay={160}>
            <div className="section-dark mt-12 grid grid-cols-1 items-center gap-8 rounded-lg p-8 md:p-10 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr]">
              <Column
                heading={ARCHITECTURE.left.heading}
                items={ARCHITECTURE.left.items}
              />

              <Flow />

              {/* Explicit `.glass-2` rather than the `.glass` alias. The tiers
                  paint their wet edge as a background LAYER instead of an
                  absolute ::after, so the `relative z-[1]` that every child used
                  to need in order to sit above that ::after is now dead weight
                  and has been dropped. */}
              <div className="glass-2 rounded-lg p-7 text-center">
                <span className="glass-3 mx-auto grid h-12 w-12 place-items-center rounded-md text-ink-inv">
                  <Icon name="chip" size={22} />
                </span>
                <h3 className="mt-5 text-[16.5px] font-semibold text-ink-inv">
                  {ARCHITECTURE.centre.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-inv-2">
                  {ARCHITECTURE.centre.body}
                </p>
              </div>

              <Flow delay="-1.1s" />

              <Column
                heading={ARCHITECTURE.right.heading}
                items={ARCHITECTURE.right.items}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand ctaLabel="See Connected Banking in Action" />
    </>
  );
}

function Column({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; icon: Parameters<typeof Icon>[0]["name"] }[];
}) {
  return (
    <div>
      <h3 className="text-[11.5px] font-semibold uppercase tracking-eyebrow text-ink-inv-2">
        {heading}
      </h3>
      {/* Rows are nested inside the architecture card, so they take the 12px
          nested step of the radius scale, not the 20px card step. */}
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <li
            key={it.label}
            className="glass-2 flex items-center gap-3 rounded-md px-4 py-3 text-[14px] font-medium text-ink-inv"
          >
            <Icon name={it.icon} size={17} className="text-lavender-400" />
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Dashed connector between architecture columns — horizontal on lg, vertical
 * below. The dashes drift toward the arrowhead so the diagram reads as a
 * direction of travel (bank → server → ledger) rather than a static schematic.
 *
 * Mechanics: `.eco-wire` (globals.css) is the project's dash-drift primitive —
 * `stroke-dashoffset: 0 → -20` on a loop, with `--wire-delay` to de-phase
 * instances. The dash PERIOD is therefore 10 (`3 7`), never 8: -20 has to be a
 * whole number of periods or the loop restart jumps. That also makes the
 * reduced-motion end state (offset -20, i.e. two whole periods) pixel-identical
 * to the resting state, so the global `animation-duration: 0.001ms` collapse
 * leaves the connector looking exactly as it does with motion off.
 *
 * Only one of the two SVGs is ever rendered — the other is `display: none`,
 * which does not run animations — so this costs one animated 1.4px stroke.
 */
function Flow({ delay = "0s" }: { delay?: string }) {
  const dash = {
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeDasharray: "3 7",
    strokeLinecap: "round" as const,
    className: "eco-wire",
    style: { ["--wire-delay" as string]: delay },
  };
  return (
    <span
      aria-hidden="true"
      className="mx-auto grid place-items-center text-lavender-400"
    >
      <svg
        viewBox="0 0 60 12"
        width="60"
        height="12"
        fill="none"
        className="hidden lg:block"
      >
        <path d="M0 6h44" {...dash} />
        <path
          d="m46 1.5 5 4.5-5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        viewBox="0 0 12 40"
        width="12"
        height="40"
        fill="none"
        className="lg:hidden"
      >
        <path d="M6 0v28" {...dash} />
        <path
          d="M1.5 30 6 35l4.5-5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * Hero diagram — the ERP platform and the bank's infrastructure meeting at a
 * LinkAPI hub. The Figma labelled one side "AXIS BANK"; a generic label ships
 * instead, since naming a bank in a product diagram implies an endorsement.
 * TODO: client to confirm whether a named bank may appear here.
 */
function ConnectionDiagram() {
  return (
    <div
      className="relative mx-auto aspect-[5/4] w-full max-w-[520px]"
      aria-hidden="true"
    >
      {/*
        Inner ring: an SVG ellipse instead of a dashed CSS border, so its dashes
        can drift slowly around the ring (`.eco-wire`) and read as an orbit.
        A rotation was the other option and is wrong here: the ring is an
        ELLIPSE (the box is 5:4), and a rotating ellipse sweeps its own bounding
        box, which wobbles. Flowing the dash pattern along the path has no such
        problem and needs no transform at all.

        Geometry is unchanged to the pixel: the viewBox matches the container's
        5:4 aspect, so rx/ry = 58% of each half-axis, exactly the old
        h-[58%] w-[58%]. `pathLength` normalises the perimeter to 820 = 82 whole
        dash periods, which removes the seam where the pattern would otherwise
        wrap, and keeps `.eco-wire`'s -20 offset a whole number of periods.
      */}
      <svg
        viewBox="0 0 500 400"
        fill="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <ellipse
          cx="250"
          cy="200"
          rx="145"
          ry="116"
          pathLength="820"
          stroke="var(--lavender-400)"
          strokeWidth="1"
          strokeDasharray="3 7"
          strokeLinecap="round"
          className="eco-wire"
        />
      </svg>
      <span className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-pill border border-line-soft" />

      <span className="grad-fill absolute left-1/2 top-1/2 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill text-[15px] font-semibold text-ink-inv shadow-float">
        <Icon name="link" size={32} />
      </span>

      <Pill
        className="left-1/2 top-[6%] -translate-x-1/2"
        label="Partner bank"
        dot
      />
      <Pill
        className="left-0 top-1/2 -translate-y-1/2"
        label="LinkAPI platform"
      />
      <Pill
        className="right-0 top-1/2 -translate-y-1/2"
        label="Bank infrastructure"
      />

      <span className="absolute bottom-[4%] left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[12.5px] text-ink-3">
        <Icon name="shield" size={14} className="text-success" />
        Secure API connection
      </span>
    </div>
  );
}

function Pill({
  className,
  label,
  dot,
}: {
  className?: string;
  label: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        // Nested chrome inside the diagram: 12px, the nested step of the radius
        // scale (cards 20 / nested 12 / pills 999).
        "absolute inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-line-soft bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink shadow-card",
        className,
      )}
    >
      {dot && <span className="h-2.5 w-2.5 rounded-pill bg-plum-700" />}
      {label}
    </span>
  );
}
