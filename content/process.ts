/**
 * "How We Work" — the Figma's four-stage flow (2026-08). The Figma's own
 * subhead said "six-stage" while showing four steps; four is what ships.
 */
export interface ProcessPhase {
  num: string;
  title: string;
  description: string;
}

export const PROCESS: ProcessPhase[] = [
  {
    num: "01",
    title: "Integrate",
    description:
      "Plug into our REST APIs with detailed SDKs and clear reference docs for every stack.",
  },
  {
    num: "02",
    title: "Configure",
    description:
      "Set up banking rails, payment flows and webhooks through an intuitive dashboard.",
  },
  {
    num: "03",
    title: "Test & Verify",
    description:
      "Run scenarios in a full-fidelity sandbox environment with real-time debugging tools.",
  },
  {
    num: "04",
    title: "Go Live",
    description:
      "Deploy to production and start processing, with ongoing post-live support on demand.",
  },
];

/** One rendered line of the sample request. */
export type TermLine =
  | { t: "cmt"; text: string }
  | { t: "raw"; text: string }
  | { t: "open"; key: string }
  | {
      t: "kv";
      key: string;
      value: string;
      kind: "num" | "str";
      indent?: boolean;
      last?: boolean;
    };

/**
 * Sample request rendered in the terminal beside the steps. Deliberately uses
 * a neutral demo domain — the Figma's sample carried a real bank's address.
 */
export const PROCESS_SAMPLE: { method: string; path: string; lines: TermLine[] } = {
  method: "POST",
  path: "/v1/payments/create",
  lines: [
    { t: "cmt", text: "// Request payload" },
    { t: "raw", text: "{" },
    { t: "kv", key: "amount", value: "50000", kind: "num" },
    { t: "kv", key: "currency", value: '"INR"', kind: "str" },
    { t: "kv", key: "order_id", value: '"order_9K2xPz"', kind: "str" },
    { t: "open", key: "customer" },
    { t: "kv", key: "id", value: '"cust_8372"', kind: "str", indent: true },
    {
      t: "kv",
      key: "email",
      value: '"finance@acme-demo.com"',
      kind: "str",
      indent: true,
      last: true,
    },
    { t: "raw", text: "  }" },
    { t: "raw", text: "}" },
  ],
};
