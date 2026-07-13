/**
 * Legal pages — simplified numbered-clause structure (PAGES-AND-ROUTING §1.4),
 * grounded in LinkAPI's real details (India governing law, Ghaziabad address,
 * real contact). Draft copy only.
 *
 * TODO: client / legal counsel to review and confirm before publishing.
 */
export interface LegalSection {
  num: string;
  title: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string; // TODO: set real "last updated" date at publish time.
  intro: string;
  sections: LegalSection[];
}

export const TERMS: LegalDoc = {
  title: "Terms & Conditions",
  updated: "July 2026", // TODO: client/legal to confirm the real last-revised date.
  intro:
    "These terms govern your use of the LinkAPI Tech website and any services you engage us for. By using this site, you agree to them.",
  sections: [
    {
      num: "01",
      title: "About These Terms",
      body: [
        "This website is operated by LinkAPI Tech Pvt. Ltd. (“LinkAPI”, “we”, “us”). These terms apply to visitors of the site and to clients engaging our services.",
      ],
    },
    {
      num: "02",
      title: "Use of the Site",
      body: [
        "You may use this site for lawful purposes only. You agree not to misuse it, attempt to disrupt it, or access it in a way that infringes the rights of others.",
      ],
    },
    {
      num: "03",
      title: "Services & Enquiries",
      body: [
        "Information on this site describes our services in general terms and does not constitute a binding offer. Specific scope is agreed in a written proposal for each engagement.",
      ],
    },
    {
      num: "04",
      title: "Proposals & Estimates",
      body: [
        "Estimates are based on the information available at the time and the scope described. Changes in scope, systems, or third-party (e.g. bank) prerequisites may affect timelines and costs.",
      ],
    },
    {
      num: "05",
      title: "Payments",
      body: [
        "Fees, milestones, and payment terms are set out in the applicable proposal or agreement. Certain third-party costs (for example, SSL certificates) may be borne by the client where required.",
      ],
    },
    {
      num: "06",
      title: "Client Responsibilities",
      body: [
        "You agree to provide timely access, information, approvals, and any prerequisites (such as static IPs or bank empanelment inputs) reasonably needed for us to deliver the agreed services.",
      ],
    },
    {
      num: "07",
      title: "Intellectual Property",
      body: [
        "Site content is owned by LinkAPI or its licensors. Ownership of deliverables produced during an engagement is governed by the relevant agreement.",
      ],
    },
    {
      num: "08",
      title: "Third-Party Tools & Banks",
      body: [
        "Integrations often depend on banks and third-party systems outside our control. We coordinate with them in good faith but are not responsible for their availability, changes, or policies.",
      ],
    },
    {
      num: "09",
      title: "No Guarantee of Results",
      body: [
        "We deliver services with reasonable skill and care but do not guarantee specific business outcomes, which depend on factors beyond our control.",
      ],
    },
    {
      num: "10",
      title: "Limitation of Liability",
      body: [
        "To the extent permitted by law, our liability arising from use of this site or our services is limited as set out in the applicable agreement. We are not liable for indirect or consequential losses.",
      ],
    },
    {
      num: "11",
      title: "Changes to These Terms",
      body: [
        "We may update these terms from time to time. The current version is always available on this page.",
      ],
    },
    {
      num: "12",
      title: "Governing Law",
      body: [
        "These terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts at Ghaziabad, Uttar Pradesh.",
      ],
    },
    {
      num: "13",
      title: "Contact",
      body: [
        "Questions about these terms? Email partnership@linkapitech.com or write to SRA 82 A, Shipra Indirapuram, Ghaziabad, Uttar Pradesh, India.",
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  updated: "July 2026", // TODO: client/legal to confirm the real last-revised date.
  intro:
    "This policy explains what information we collect through this website, how we use it, and the choices you have.",
  sections: [
    {
      num: "01",
      title: "Information We Collect",
      body: [
        "We collect the information you provide directly — such as your name, email, phone number, company, and message when you contact us — plus basic technical data your browser sends automatically.",
      ],
    },
    {
      num: "02",
      title: "How We Use Information",
      body: [
        "We use your information to respond to enquiries, provide and improve our services, and communicate with you about an engagement. We do not sell your personal information.",
      ],
    },
    {
      num: "03",
      title: "Contact Forms",
      body: [
        "Details submitted through our contact form are used solely to respond to your request and to follow up about our services.",
      ],
    },
    {
      num: "04",
      title: "Cookies & Analytics",
      body: [
        "This site may use privacy-respecting analytics to understand aggregate usage. Analytics are enabled only via configuration and can be disabled. Where required, we will seek consent before setting non-essential cookies.",
      ],
    },
    {
      num: "05",
      title: "Third-Party Services",
      body: [
        "We may rely on trusted third-party providers (for example, for email delivery or hosting). They process data only as needed to provide their service.",
      ],
    },
    {
      num: "06",
      title: "Data Protection",
      body: [
        "We take reasonable technical and organizational measures to protect your information, in keeping with the security-first approach we bring to client work.",
      ],
    },
    {
      num: "07",
      title: "Data Sharing",
      body: [
        "We do not share your personal information except as needed to deliver a service you've requested, to comply with law, or with your consent.",
      ],
    },
    {
      num: "08",
      title: "Data Retention",
      body: [
        "We keep personal information only as long as necessary for the purposes described here or as required by law.",
      ],
    },
    {
      num: "09",
      title: "Your Rights",
      body: [
        "You may request access to, correction of, or deletion of your personal information. Contact us using the details below to exercise these rights.",
      ],
    },
    {
      num: "10",
      title: "Changes to This Policy",
      body: [
        "We may update this policy from time to time. The current version is always available on this page.",
      ],
    },
    {
      num: "11",
      title: "Contact",
      body: [
        "Questions about privacy? Email partnership@linkapitech.com or write to SRA 82 A, Shipra Indirapuram, Ghaziabad, Uttar Pradesh, India.",
      ],
    },
  ],
};
