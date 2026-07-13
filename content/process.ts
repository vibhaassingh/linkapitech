/**
 * Process stepper — 4 phases (CONTENT-MAPPING §5.3), consolidated from the
 * source's bare 6-step icon list and tailored to API-integration delivery.
 * No real timeline exists in the source, so phases are labelled "Phase N / 4"
 * rather than inventing week counts (PLAN §6 / CONTENT-MAPPING §4.4).
 */
export interface ProcessPhase {
  num: string;
  title: string;
  accent?: string;
  description: string;
  phaseLabel: string;
  deliverables: string[];
}

export const PROCESS: ProcessPhase[] = [
  {
    num: "01",
    title: "Discovery &",
    accent: "Analysis",
    description:
      "We map your systems, endpoints, and data flows — and surface the compliance and security requirements that will shape the integration before a line of code is written.",
    phaseLabel: "Phase 01 / 04",
    deliverables: ["Systems Audit", "Endpoint Map", "Compliance Review"],
  },
  {
    num: "02",
    title: "Solution Design &",
    accent: "Architecture",
    description:
      "We design the integration approach — the adapters, connectors, and security protocols — and agree the architecture with your team so there are no surprises during the build.",
    phaseLabel: "Phase 02 / 04",
    deliverables: ["Integration Design", "Adapter Spec", "Security Plan"],
  },
  {
    num: "03",
    title: "Development &",
    accent: "Integration",
    description:
      "Comprehensive API integration support from UAT to production — we build and configure bank and API connectivity, handling empanelment and the technical coordination in between.",
    phaseLabel: "Phase 03 / 04",
    deliverables: ["Bank Config", "UAT Build", "Connectivity"],
  },
  {
    num: "04",
    title: "Testing, Go-Live &",
    accent: "Support",
    description:
      "We test thoroughly, cut over to production, and stay on afterward. Ongoing post-live support is available on demand, so the system keeps performing well past launch.",
    phaseLabel: "Phase 04 / 04",
    deliverables: ["Production Cutover", "Testing", "Ongoing Support"],
  },
];

export const PROCESS_SIGNOFF = {
  lead: "Beyond go-live —",
  accent: "ongoing post-live support, on demand.",
};
