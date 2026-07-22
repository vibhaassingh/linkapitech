import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { RevealGroup } from "@/components/motion/RevealGroup";
import { StatNumber } from "@/components/ui/StatNumber";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { CLIENTS } from "@/content/clients";
import { PERFORMANCE_STATS, IMPACT_STATS, TRUST_LINE } from "@/content/stats";
import { TESTIMONIALS } from "@/content/testimonials";

export const metadata = pageMetadata({
  title: "Clients & Trust | LinkAPI Tech",
  description:
    "LinkAPI Tech powers integrations for leading BFSI institutions — 5000+ API implementations, 45,000+ customers, and ₹20,000 Cr processed monthly across regulated banking environments.",
  path: "/clients",
});

/** Real delivery practices (the "What we offer?" checklist language) — no invented claims. */
const PRACTICES = [
  {
    title: "Secure connectivity first",
    body: "Every engagement begins by establishing secure connectivity between bank and client systems — before any transaction flows.",
  },
  {
    title: "Empanelment & prerequisites handled",
    body: "Bank configuration, client-end empanelment, static IPs, and SSL certificates are managed as part of delivery.",
  },
  {
    title: "Coordinated delivery, UAT to production",
    body: "We coordinate technically between the bank and your technology partner across the full path from UAT to production cutover.",
  },
  {
    title: "Post-live support on demand",
    body: "Integrations stay supported after go-live — maintained and ready to change when the bank does.",
  },
];

export default function ClientsPage() {
  return (
    <>
      <PageHero
        eyebrow="Clients & trust"
        title="The institutions at the center of our work."
        lead={`${TRUST_LINE} — every engagement built for regulated environments, at production scale.`}
      />

      {/* Large-format bank wordmarks */}
      <section aria-label={TRUST_LINE} className="border-b border-line-soft bg-surface">
        <RevealGroup
          className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-y-10 px-6 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-4"
          step={90}
        >
          {CLIENTS.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-center border-line-soft lg:border-l lg:first:border-l-0"
            >
              <Wordmark client={c} size="lg" />
            </div>
          ))}
        </RevealGroup>
        <p className="mx-auto w-full max-w-[1240px] px-6 pb-8 text-center font-mono text-[11px] uppercase tracking-eyebrow text-ink-3 md:px-10">
          Marks shown as wordmarks pending licensed logo assets
          {/* TODO: client to confirm — licensed vector logos + exact "Aditya Birla" entity name */}
        </p>
      </section>

      {/* Aggregate stat wall — no per-bank attribution by design */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 md:px-10">
        <Reveal>
          <h2 className="display-2 max-w-[24ch] text-ink">Proof, in aggregate.</h2>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-2">
            Outcome figures are published in aggregate across our client base — never attributed to
            a named institution without sign-off.
          </p>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4" step={80}>
          {[...PERFORMANCE_STATS, ...IMPACT_STATS.slice(1)].map((s) => (
            <StatNumber key={s.label} stat={s} className="border-t border-line pt-5" />
          ))}
        </RevealGroup>
      </section>

      {/* How we work with banks */}
      <section className="border-y border-line-soft bg-surface">
        <div className="mx-auto w-full max-w-[1240px] px-6 py-16 md:px-10">
          <Reveal>
            <h2 className="display-2 text-ink">How we work with banks.</h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2" step={80}>
            {PRACTICES.map((p, i) => (
              <div key={p.title} className="rounded-md border border-line bg-canvas p-7">
                <p className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-[18px] font-semibold text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{p.body}</p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Voices */}
      <section className="mx-auto w-full max-w-[1240px] px-6 py-16 md:px-10">
        <Reveal>
          <h2 className="display-2 text-ink">In their words.</h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-3" step={90}>
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-md border border-line bg-surface p-8 shadow-card"
            >
              <blockquote className="text-[15px] leading-relaxed text-ink-2">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line-soft pt-5">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-pill bg-navy-100 font-display text-[13px] font-semibold text-navy-900"
                >
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{t.name}</span>
                  <span className="block text-[12.5px] text-ink-3">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </RevealGroup>

        <Reveal className="mt-14">
          <Button href="/contact">Consult our Growth Experts</Button>
        </Reveal>
      </section>
    </>
  );
}
