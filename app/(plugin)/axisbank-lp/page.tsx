import { notFound } from "next/navigation";
import { BankPluginLanding } from "@/components/sections/plugin/BankPluginLanding";
import { bankPluginMetadata } from "@/components/sections/plugin/bank-plugin-metadata";
import { getBankPlugin } from "@/content/plugin";

/**
 * /axisbank-lp — The Bank Plugin landing page for this bank.
 *
 * A thin route on purpose: the whole page is <BankPluginLanding>, shared with
 * the other two banks, and everything specific lives in content/plugin.ts.
 * The URL is fixed by the client (2026-09) — see lib/plugin-hosts.ts
 * PLUGIN_PATHS, which is the single place that maps a bank to its path and is
 * what every link, the canonical tag and the subdomain middleware all read.
 */
const SLUG = "axis";

export const metadata = bankPluginMetadata(SLUG);

export default function Page() {
  const page = getBankPlugin(SLUG);
  if (!page) notFound();
  return <BankPluginLanding page={page} />;
}
