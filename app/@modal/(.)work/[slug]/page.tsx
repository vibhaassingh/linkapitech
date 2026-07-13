import { getCase } from "@/content/cases";
import { WorkQuickView } from "@/components/sections/WorkQuickView";

/**
 * Intercepting route (PLAN §8). On a client-side soft navigation to
 * /work/[slug] — from the homepage Works deck or the /work index — this renders
 * the case study as an overlay instead of a full page load. A hard load / refresh
 * of the URL bypasses interception and renders app/(site)/work/[slug]/page.tsx.
 *
 * `(.)work` matches the same route level as this `@modal` slot (both at root;
 * route groups don't create URL segments).
 */
export default async function WorkQuickViewModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return null; // unknown slug → let nothing overlay (all real links are valid)
  return <WorkQuickView c={c} />;
}
