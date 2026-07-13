/**
 * Testimonials — the 3 real named quotes from the source (CONTENT-MAPPING §4.6).
 * Fixes applied per the brief:
 *  - "Tech Solutions" (wrong company in the Lovesh Mishra quote) → "LinkAPI Tech".
 *  - "Link Api Tech" normalized to "LinkAPI Tech"; light grammar cleanup only.
 *  - The single shared, hotlinked stock photo is dropped in favour of monogram
 *    avatars (initials on lime), which need no headshot.
 *  - Role/company metadata is thin in the source (all "Customer") — flagged TODO.
 */
export interface Testimonial {
  name: string;
  role: string;
  tag?: string;
  quote: string;
  emphasis?: string; // exact substring of `quote` to highlight (marker band)
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Varun Singh",
    role: "Customer", // TODO: client to confirm — add company & title.
    quote:
      "The team at LinkAPI Tech was incredibly knowledgeable and helped me select the perfect solution for my needs. Their service was top-notch, and I saw great results within a week.",
    emphasis: "great results within a week",
    initials: "VS",
  },
  {
    name: "Satyender Patel",
    role: "Customer", // TODO: client to confirm — add company & title.
    quote:
      "Customer service was outstanding — always responding to my questions in a timely and helpful manner. The quality of their work was impeccable, and it really showed in the final result.",
    emphasis: "impeccable",
    initials: "SP",
  },
  {
    name: "Lovesh Mishra",
    role: "Customer", // TODO: client to confirm — add company & title.
    quote:
      "The team at LinkAPI Tech has been a lifesaver for our business. Whenever we hit an issue with our systems, they respond quickly and resolve it efficiently. Their expertise has made our operations smoother, and we've seen far fewer technical disruptions since partnering with them.",
    emphasis: "far fewer technical disruptions",
    initials: "LM",
  },
];
