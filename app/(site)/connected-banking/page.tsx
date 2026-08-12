import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
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
            Your <span className="accent-word">bank account,</span> inside your ERP.
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

            <RevealGroup className="flex flex-col gap-6 lg:gap-3" as="ul" step={70}>
              {CAPABILITIES.map((c, i) => {
                const right = i % 2 === 1;
                return (
                  <div key={c.title} className="relative">
                    {/* The rail dot is absolute, so it takes no grid cell — the
                        card is placed by explicit column rather than `order`,
                        which would have nothing in flow to swap with. */}
                    <div className="grid items-center gap-x-12 lg:grid-cols-2">
                      <div
                        className={cn(
                          "pl-9 lg:pl-0",
                          right ? "lg:col-start-2 lg:pl-12" : "lg:col-start-1 lg:pr-12",
                        )}
                      >
                        <article className="rounded-xl border border-line-soft bg-surface p-6 shadow-card md:p-7">
                          <span className="grad-fill grid h-11 w-11 place-items-center rounded-md text-ink-inv">
                            <Icon name={c.icon} size={19} />
                          </span>
                          <h3 className="mt-5 text-[17px] font-semibold text-ink">{c.title}</h3>
                          <p className="mt-2 max-w-[46ch] text-[14.5px] leading-relaxed text-ink-2">
                            {c.body}
                          </p>
                        </article>
                      </div>

                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-pill bg-plum-700 ring-4 ring-[color:var(--violet-soft)] lg:left-1/2 lg:-translate-x-1/2"
                      />
                    </div>
                  </div>
                );
              })}
            </RevealGroup>
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
                <li key={e.name} className="grid h-12 w-[130px] place-items-center">
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
            <div className="section-dark mt-12 grid items-center gap-8 rounded-xl p-8 md:p-10 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr]">
              <Column heading={ARCHITECTURE.left.heading} items={ARCHITECTURE.left.items} />

              <Flow />

              <div className="glass rounded-xl p-7 text-center">
                <span className="glass-strong relative z-[1] mx-auto grid h-12 w-12 place-items-center rounded-md text-ink-inv">
                  <Icon name="chip" size={22} />
                </span>
                <h3 className="relative z-[1] mt-5 text-[16.5px] font-semibold text-ink-inv">
                  {ARCHITECTURE.centre.title}
                </h3>
                <p className="relative z-[1] mx-auto mt-2 max-w-[34ch] text-[14px] leading-relaxed text-ink-inv-2">
                  {ARCHITECTURE.centre.body}
                </p>
              </div>

              <Flow />

              <Column heading={ARCHITECTURE.right.heading} items={ARCHITECTURE.right.items} />
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
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((it) => (
          <li
            key={it.label}
            className="glass flex items-center gap-3 rounded-lg px-4 py-3 text-[14px] font-medium text-ink-inv"
          >
            <Icon name={it.icon} size={17} className="relative z-[1] text-lavender-400" />
            <span className="relative z-[1]">{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Dashed connector between architecture columns — horizontal on lg, vertical below. */
function Flow() {
  return (
    <span aria-hidden="true" className="mx-auto grid place-items-center text-lavender-400">
      <svg
        viewBox="0 0 60 12"
        width="60"
        height="12"
        fill="none"
        className="hidden lg:block"
      >
        <path
          d="M0 6h44"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        <path
          d="m46 1.5 5 4.5-5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg viewBox="0 0 12 40" width="12" height="40" fill="none" className="lg:hidden">
        <path
          d="M6 0v28"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
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
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[520px]" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-pill border border-dashed border-lavender-400" />
      <span className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-pill border border-line-soft" />

      <span className="grad-fill absolute left-1/2 top-1/2 grid h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-pill text-[15px] font-semibold text-ink-inv shadow-float">
        <Icon name="link" size={32} />
      </span>

      <Pill className="left-1/2 top-[6%] -translate-x-1/2" label="Partner bank" dot />
      <Pill className="left-0 top-1/2 -translate-y-1/2" label="LinkAPI platform" />
      <Pill className="right-0 top-1/2 -translate-y-1/2" label="Bank infrastructure" />

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
        "absolute inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-line-soft bg-surface px-3.5 py-2 text-[12.5px] font-medium text-ink shadow-card",
        className,
      )}
    >
      {dot && <span className="h-2.5 w-2.5 rounded-[3px] bg-plum-700" />}
      {label}
    </span>
  );
}
