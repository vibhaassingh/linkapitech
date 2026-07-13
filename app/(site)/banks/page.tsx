import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { BANKS } from "@/content/banks";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { MixedHeading } from "@/components/ui/MixedHeading";
import { BankLogo } from "@/components/ui/BankLogo";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = pageMetadata({
  title: "Bank Integrations | Axis, IndusInd & HSBC — LinkAPI Tech",
  description:
    "LinkAPI Tech integrates corporate and BFSI platforms with leading banks — Axis Bank, IndusInd Bank, and HSBC — from secure connectivity through production support.",
  path: "/banks",
});

export default function BanksIndexPage() {
  return (
    <section className="rsec-pad">
      <Reveal>
        <SectionEyebrow num="—" label="Bank integrations" end="Secure connectivity, delivered" />
      </Reveal>
      <Reveal delay={80}>
        <MixedHeading
          as="h1"
          plain="The banks we help you"
          accent="connect to."
          className="mt-8 max-w-[20ch] text-[clamp(34px,5.5vw,72px)] leading-[1.02] tracking-tighter"
        />
        <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-ink-2">
          LinkAPI wires your platform to each bank&apos;s systems using one proven playbook — secure
          connectivity, configuration and empanelment, UAT to production, and support after go-live.
          {/* TODO: client to confirm — bank relationships, partner tiers, and logo usage rights. */}
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {BANKS.map((b, i) => (
          <Reveal key={b.slug} delay={i * 80}>
            <Link
              href={`/banks/${b.slug}`}
              className="group flex h-full flex-col justify-between rounded-[24px] border border-line p-7 transition-colors hover:border-ink"
            >
              <div className="flex h-16 items-center">
                <BankLogo name={b.name} logo={b.logo} height={b.logo ? 34 : 30} />
              </div>
              <p className="mt-6 text-[14.5px] leading-relaxed text-ink-2">{b.intro}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-ink">
                {b.shortName} integration
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
