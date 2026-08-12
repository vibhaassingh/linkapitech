/**
 * Product ecosystem — the ten modules, grouped exactly as the client Figma
 * (2026-08, page 15) groups them. Each group becomes one section on /solutions;
 * `id` doubles as the deep-link anchor used by the footer and the homepage
 * ecosystem constellation.
 */
import type { IconName } from "@/components/ui/Icon";
import type { TermLine } from "./process";

export interface Product {
  id: string;
  title: string;
  body: string;
  icon: IconName;
  /** Renders as the group's emphasised card (solid plum or violet outline). */
  feature?: "solid" | "outline";
}

export interface ProductGroup {
  id: string;
  heading: string;
  /** Plum band instead of the light default (Figma alternates them). */
  tone?: "light" | "dark";
  products: Product[];
}

export const SOLUTION_GROUPS: ProductGroup[] = [
  {
    id: "core-connectivity",
    heading: "Flagship Core Connectivity",
    products: [
      {
        id: "connected-banking",
        title: "Connected Banking Enterprise Solution",
        body: "ERP-integrated banking that lets SMEs and enterprises access banking services directly inside their accounting systems — no portal-hopping, no re-keying.",
        icon: "layers",
      },
      {
        id: "payments-collections",
        title: "Smart Payments & Collections Engine",
        body: "Automated payment processing, collections and payout workflows with end-to-end transaction management.",
        icon: "chip",
        feature: "outline",
      },
    ],
  },
  {
    id: "ledger-gateway",
    heading: "Ledger Matching & Merchant Gateway Hub",
    products: [
      {
        id: "reconciliation",
        title: "Real-Time Reconciliation Engine",
        body: "Reconciliation infrastructure that automates bank-transaction matching and keeps ledgers continuously in sync.",
        icon: "sync",
      },
      {
        id: "virtual-accounts",
        title: "Virtual Accounts Infrastructure",
        body: "Virtual account systems for automated collections, precise payment mapping and effortless reconciliation.",
        icon: "spark",
        feature: "solid",
      },
      {
        id: "ecommerce",
        title: "Ecommerce Plugins & Integrations",
        body: "Plugins and integrations that embed payment and banking capabilities directly into e-commerce platforms.",
        icon: "cart",
      },
    ],
  },
  {
    id: "front-ends",
    heading: "Enterprise Front-Ends & Developer Tooling",
    tone: "dark",
    products: [
      {
        id: "platforms",
        title: "Enterprise Website & Banking Platforms",
        body: "Scalable enterprise web platforms, banking portals and customer-facing ecosystems.",
        icon: "globe",
      },
      {
        id: "checkout",
        title: "Web Checkout & SDKs",
        body: "Developer-friendly APIs, embedded payment SDKs and checkout infrastructure for businesses and banks.",
        icon: "code",
      },
    ],
  },
  {
    id: "governance",
    heading: "Secure Governance, Billing & AI Chat Orchestration",
    products: [
      {
        id: "access",
        title: "User Access Management",
        body: "Role-based access, maker-checker workflows and enterprise operational controls for secure governance.",
        icon: "shield",
      },
      {
        id: "subscriptions",
        title: "Subscription Hub & Affordability Suite",
        body: "A centralised platform for recurring billing, subscription management and offer/affordability orchestration.",
        icon: "tag",
      },
      {
        id: "chatbot",
        title: "WhatsApp Banking Chatbot",
        body: "An AI-enabled WhatsApp engagement platform that automates citizen services and payment workflows over chat.",
        icon: "chat",
        feature: "outline",
      },
    ],
  },
];

/** SDK sample shown in the developer-tooling band (Figma page 15). */
export const SDK_SAMPLE: { method: string; path: string; lines: TermLine[] } = {
  method: "POST",
  path: "/v1/checkout/initialize",
  lines: [
    { t: "cmt", text: "// SDK initialization payload" },
    { t: "raw", text: "{" },
    { t: "kv", key: "environment", value: '"production"', kind: "str" },
    { t: "kv", key: "integration_module", value: '"checkout_sdk_v4"', kind: "str" },
    {
      t: "kv",
      key: "connected_banking_token",
      value: '"tok_linkapi_827361"',
      kind: "str",
      last: true,
    },
    { t: "raw", text: "}" },
    { t: "raw", text: "" },
    { t: "ok", text: "> LinkAPI SDK Ready" },
  ],
};
