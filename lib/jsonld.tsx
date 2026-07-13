import { SITE, CONTACT, SOCIALS } from "./site";
import { SERVICES, serviceHeading } from "@/content/services";

/** Tiny JSON-LD emitter — feed it a typed object, never a hand-written string. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is developer-authored, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** ProfessionalService + WebSite graph for the homepage (PAGES-AND-ROUTING §4.5). */
export function organizationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${SITE.url}/#organization`,
        name: SITE.legalName,
        url: SITE.url,
        description: SITE.description,
        email: CONTACT.primaryEmail,
        telephone: CONTACT.channels[0].phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: CONTACT.address.line1,
          addressLocality: "Ghaziabad",
          addressRegion: "Uttar Pradesh",
          addressCountry: "IN",
        },
        areaServed: "IN",
        knowsAbout: [
          "API Integration",
          "Bank Connectivity",
          "Transaction Reconciliation",
          "Data Integration",
          "BFSI Technology",
        ],
        sameAs: SOCIALS.map((s) => s.href).filter(Boolean),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: SERVICES.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: serviceHeading(s) },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        publisher: { "@id": `${SITE.url}/#organization` },
      },
    ],
  };
}
