/**
 * Benefits / Why Us — 6 cards (CONTENT-MAPPING §4.5). Cards 1–4 are LinkAPI's
 * four real "Why Us" reasons, condensed to the punchier card format. Cards 5–6
 * are authored from other real on-site content (Performance stats + Security
 * service) rather than inventing new claims.
 *
 * The source uses looping video per card; LinkAPI has no video assets, so the
 * media slot renders a lightweight animated poster (see BenefitCard).
 */
export interface Benefit {
  num: string;
  title: string;
  description: string;
  authored?: boolean;
}

export const BENEFITS: Benefit[] = [
  {
    num: "01",
    title: "Skilled Team",
    description:
      "A handpicked team of developers, designers, product managers, and strategists — seasoned professionals committed to solutions built around your needs.",
  },
  {
    num: "02",
    title: "Efficient Delivery & Communication",
    description:
      "Streamlined delivery that lands on time and on budget, with clear, concise communication that keeps you informed at every step.",
  },
  {
    num: "03",
    title: "Agile Approach",
    description:
      "Work runs in focused sprints. Each segment is reviewed with you before we move on — so direction stays right and rework stays low.",
  },
  {
    num: "04",
    title: "Adaptable Collaboration",
    description:
      "Fixed-bid for well-defined scope, or a dedicated team on time-and-material for evolving products. The engagement model bends to fit you.",
  },
  {
    num: "05",
    title: "BFSI-Grade Scale",
    description:
      "Infrastructure proven at scale — 45,000+ customers and ₹20,000 Cr processed every month across 10 lakh+ transactions.",
    authored: true,
  },
  {
    num: "06",
    title: "Security-First Delivery",
    description:
      "Security protocols shaped to your platform and environment — SSL, static IP, and hardening built into every integration we ship.",
    authored: true,
  },
];
