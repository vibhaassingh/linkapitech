/**
 * FAQ — 7 Q&A pairs (CONTENT-MAPPING §5.4). No FAQ content exists in the source,
 * so these are net-new, drafted for enterprise/BFSI API-integration buyers and
 * grounded in LinkAPI's real service language. No timelines are invented.
 *
 * TODO: client to confirm — LinkAPI to review/approve answers before publishing.
 */
export interface FaqItem {
  q: string;
  a: string;
  emphasis?: string; // exact substring of `a` to emphasise (italic-serif)
}

export const FAQ: FaqItem[] = [
  {
    q: "What does an integration engagement typically involve?",
    a: "It usually runs from UAT to production: establishing secure connectivity, configuring the bank and completing empanelment, coordinating between the bank and your technology partner, and staying on for post-live support.",
    emphasis: "UAT to production",
  },
  {
    q: "How long does a typical API or bank integration take?",
    a: "It depends on the bank, the prerequisites — static IPs, SSL certificates — and the state of your systems. We scope realistic timelines during discovery rather than quote a fixed number up front.",
  },
  {
    q: "Do you support ongoing reconciliation after go-live?",
    a: "Yes. Our ERP plugins sync and reconcile transactions continuously, and ongoing post-live support is available on demand.",
    emphasis: "on demand",
  },
  {
    q: "What security and compliance standards do you follow?",
    a: "We shape security protocols to your platform and environment, handle prerequisites like static IPs and SSL certificates, and harden the surfaces that carry sensitive financial data.",
  },
  {
    q: "Can you work alongside our internal IT or engineering team?",
    a: "Absolutely. We coordinate directly with your technology partner and internal teams, and our engagement model flexes from fixed-bid scope to a dedicated team on time-and-material.",
  },
  {
    q: "Which industries and platforms do you know best?",
    a: "BFSI, Fintech, Agritech, and Edutech — with 5000+ API implementations and reconciliation work spanning banks and ERP systems.",
    emphasis: "BFSI, Fintech, Agritech, and Edutech",
  },
  {
    q: "How do we get started?",
    a: "Reach our team at partnership@linkapitech.com or +91-9318373476, or send the form above. We'll set up a short discovery call to understand your systems and goals.",
  },
];
