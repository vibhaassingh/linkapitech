import { pageMetadata } from "@/lib/metadata";
import { LegalDocView } from "@/components/sections/LegalDoc";
import { PRIVACY } from "@/content/legal";

export const metadata = pageMetadata({
  title: "Privacy Policy | LinkAPI Tech",
  description:
    "How LinkAPI Tech collects, uses, and protects information submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalDocView doc={PRIVACY} />;
}
