/**
 * Industries We Serve — five segments (client Figma 2026-08, page 32).
 *
 * Each row pairs copy with a small UI mock. The mocks are built as DOM/SVG
 * components (see components/sections/industries/Mocks.tsx) rather than
 * exported images, so they stay crisp, themeable and translatable; `mock`
 * selects which one renders.
 */
export interface Segment {
  id: string;
  title: string;
  body: string;
  mock: "reconciliation" | "nbfc" | "ledger" | "checkout" | "rails";
}

export const SEGMENTS: Segment[] = [
  {
    id: "banks",
    title: "Banks",
    body: "Deepen SME engagement and reduce operational load with ERP-native banking, connected collections and automated reconciliation that make your services stickier and easier to adopt.",
    mock: "reconciliation",
  },
  {
    id: "nbfcs",
    title: "NBFCs",
    body: "Scale lending and collections with compliant, API-driven infrastructure and NPCI-backed B2B integrations.",
    mock: "nbfc",
  },
  {
    id: "smes",
    title: "SMEs & Enterprises",
    body: "Run payments, collections, GST and reconciliation from inside your ERP — with real-time visibility and far less manual work.",
    mock: "ledger",
  },
  {
    id: "ecommerce",
    title: "E-commerce",
    body: "Embed payments and banking into your storefront and checkout with ready plugins and SDKs.",
    mock: "checkout",
  },
  {
    id: "fintech",
    title: "Fintech",
    body: "Launch faster on secure, developer-friendly rails for payments, virtual accounts and reconciliation.",
    mock: "rails",
  },
];

/**
 * Illustrative figures inside the mock UIs. Marked clearly as sample data —
 * they demonstrate the interface, they are not LinkAPI's reported metrics.
 * TODO: client to confirm whether real anonymised figures may be shown here.
 */
export const MOCK_DATA = {
  reconciliation: {
    title: "Connected Core API",
    status: "Active",
    metricLabel: "Monthly corporate inflow reconciliation",
    metricValue: "₹1,42,800 Cr",
    progress: 94,
    footLeft: "94% automated match",
    footRight: "Target: 99%",
  },
  ledger: {
    title: "Tally / SAP ledger sync",
    status: "Live connected",
    rows: [
      { label: "GSTIN validation ID", value: "27AAAAA1111A1Z1" },
      { label: "Pending invoice auto-match", value: "₹18,50,400.00" },
    ],
    tiles: [
      { label: "Reconciled", value: "99.2%" },
      { label: "GST filed", value: "Instant" },
    ],
  },
  checkout: {
    title: "Secure gateway checkout",
    item: "Enterprise subscription",
    qty: "Qty: 1",
    price: "₹4,999",
    method: "LinkAPI Native UPI / Cards",
    cta: "Complete payment",
  },
  rails: {
    heading: "Deployment rails",
    nodes: [
      { kicker: "Fintech client", label: "Fast SDK" },
      { kicker: "Secure router", label: "LinkAPI Core" },
      { kicker: "Partner bank", label: "Virtual Acc" },
    ],
  },
} as const;

/** NBFC code sample (Figma page 32). */
export const NBFC_SAMPLE = {
  title: "NPCI B2B integration stack",
  lines: [
    { t: "cmt" as const, text: "// Initializing compliant NBFC lending pipeline" },
    { t: "raw" as const, text: "const nbfcPipeline = new NpciB2BIntegration({" },
    { t: "kv" as const, key: "compliantMode", value: "true", kind: "num" as const },
    { t: "kv" as const, key: "autoDisburse", value: "true", kind: "num" as const },
    {
      t: "kv" as const,
      key: "routingRegistry",
      value: '"LNKAPI_MUTUAL_POOL_04"',
      kind: "str" as const,
      last: true,
    },
    { t: "raw" as const, text: "});" },
    { t: "ok" as const, text: "● NPCI-backed compliance verified" },
  ],
};
