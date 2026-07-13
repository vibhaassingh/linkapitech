import { pageMetadata } from "@/lib/metadata";
import { LegalDocView } from "@/components/sections/LegalDoc";
import { TERMS } from "@/content/legal";

export const metadata = pageMetadata({
  title: "Terms & Conditions | LinkAPI Tech",
  description:
    "The terms and conditions governing use of the LinkAPI Tech website and services.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalDocView doc={TERMS} />;
}
