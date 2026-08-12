/**
 * About page content — client Figma (2026-08, page 30). Where the Figma showed
 * placeholder duplicates ("Transparency" twice, an unrelated insurance line),
 * distinct copy is written in LinkAPI's own voice instead of reproducing it.
 */
import type { IconName } from "@/components/ui/Icon";

export const ABOUT_HERO = {
  title: "Simplifying banking for a connected, digital-first economy.",
  lead: "At LinkAPI Tech Pvt. Ltd., we build the technology that lets banking work the way modern businesses do — embedded, automated and always in sync. Since 2022 we've specialised in Bank–ERP connectivity, helping institutions and enterprises move money, reconcile transactions and serve customers without leaving the systems they already trust.",
};

export const OUR_STORY = {
  heading: "Our Story",
  paragraphs: [
    "Banking software and business software have lived in separate worlds for too long. Finance teams juggle bank portals, spreadsheets and ERPs, re-keying the same data and chasing reconciliations that should never have been manual.",
    "LinkAPI Tech was founded to erase that divide. By combining rapid product development, customisable MSME banking solutions and easy-to-integrate APIs, we turn complex back-office operations into simple, scalable digital experiences — delivered as one plugin that lives inside your accounting system.",
  ],
};

export const MISSION = {
  heading: "Our Mission",
  body: "To empower businesses and institutions to evolve and excel amid rapidly changing markets. As technology reshapes industries and regulations tighten, we help organisations adopt new business models, integrate digital channels, deepen customer loyalty and cut operational costs — through banking infrastructure that simply works.",
};

export const VISION = {
  heading: "Our Vision",
  body: "To lead the shift to connected banking — a future where every business runs its financial operations natively inside its own systems, unlocking new growth, efficiency and customer satisfaction.",
};

export interface Commitment {
  title: string;
  body: string;
  icon: IconName;
}

/**
 * The Figma's subhead was cut off mid-sentence ("uncompromising product
 * quality…"); all three principles are stated in full here.
 */
export const COMMITMENT = {
  heading: "Our Commitment",
  lead: "Three principles guide everything we ship: uncompromising product quality, total client satisfaction, and delivery on the date we promised.",
  items: [
    {
      title: "Product Quality",
      body: "Built for regulated environments, reviewed at every sprint, and hardened before it ever touches production traffic.",
      icon: "shield" as IconName,
    },
    {
      title: "Client Satisfaction",
      body: "A client-first engagement model with transparent updates, direct access to the team, and support that continues past go-live.",
      icon: "heart" as IconName,
    },
    {
      title: "Timely Delivery",
      body: "Sprint-based execution with realistic scoping, so commitments are met without quietly trading away quality.",
      icon: "calendar" as IconName,
    },
  ] as Commitment[],
};

export const APART = {
  heading: "What Sets Us Apart?",
  items: [
    {
      body: "A skilled, handpicked team of engineers, product managers and BFSI strategists",
      icon: "user" as IconName,
    },
    { body: "Efficient delivery with clear, consistent communication", icon: "bolt" as IconName },
    { body: "An agile, sprint-based build process with client review at every stage", icon: "heart" as IconName },
    { body: "Adaptable engagement — fixed-bid or dedicated team, on your terms", icon: "share" as IconName },
  ],
};

export const TRACK_RECORD = { heading: "Our Track Record" };
