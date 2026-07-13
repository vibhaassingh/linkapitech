/**
 * About page content — LinkAPI's real copy, verbatim from CONTENT-MAPPING §2.3.
 * The four real pillars (Mission / Vision / Commitment / Performance) are kept.
 */

export const ABOUT_INTRO = {
  eyebrow: "About us",
  headingPlain: "Empowering businesses with seamless, innovative technology for a",
  headingAccent: "dynamic digital future.",
  paragraphs: [
    "At LinkAPI Tech Pvt. Ltd., we are dedicated to delivering innovative technology solutions that empower businesses to thrive in today's fast-paced digital world. As a trusted service provider, we offer corporate clients and businesses intuitive platforms and tools that streamline both external and internal operations.",
    "We specialize in driving operational and process transformation through cutting-edge technology services. Whether it's enhancing revenue generation or optimizing costs, we partner with our clients to develop solutions that fit their unique needs.",
    "Our approach is simple — supporting our clients to succeed today while preparing them for the opportunities of tomorrow.",
  ],
};

export interface Pillar {
  key: string;
  title: string;
  body: string;
}

export const PILLARS: Pillar[] = [
  {
    key: "mission",
    title: "Our Mission",
    body: "Our mission is to empower businesses and institutions to evolve and excel in the face of rapidly changing market conditions. By providing cutting-edge technology solutions, we enable our clients to embrace new business models, integrate digital channels, optimize customer loyalty strategies, and significantly reduce operational costs.",
  },
  {
    key: "vision",
    title: "Our Vision",
    body: "Our vision is to be at the forefront of technological innovation, enabling businesses to transform their processes and harness the potential of digital transformation — a future where companies seamlessly integrate technology into daily operations, unlocking new avenues for growth, efficiency, and customer satisfaction.",
  },
  {
    key: "commitment",
    title: "Our Commitment",
    body: "Our philosophy is built on three core pillars: delivering the highest quality products, ensuring total client satisfaction, and providing timely solutions. We strive to offer the best quality-to-price ratio in the industry, with a client-first approach focused on measurable impact and long-term success.",
  },
  {
    key: "performance",
    title: "Our Performance",
    body: "The numbers behind the work — a processing footprint and customer base built across BFSI, Fintech, Agritech, and Edutech domains.",
  },
];
