import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Reveal } from "@/components/motion/Reveal";
import { Caustic, Seam } from "@/components/motifs";
import { ROW, SegmentMock } from "@/components/sections/industries/Mocks";
import { SEGMENTS } from "@/content/industries";
import { cn } from "@/lib/cn";

export const metadata = pageMetadata({
  title: "Industries We Serve",
  description:
    "Purpose-built financial infrastructure for banks, NBFCs, SMEs and enterprises, e-commerce and fintechs — ERP-native banking, compliant lending rails, embedded checkout and automated reconciliation.",
  path: "/industries",
});

/**
 * Industries We Serve — five rows on the L·D·L·D·L rhythm (REDESIGN-V4 Part G).
 *
 * The tone of each row, its band and its Caustic geometry all come from `ROW`
 * in Mocks.tsx, keyed by the mock the row carries: the page and the mock have
 * to agree about which band they are on (light ink on plum is invisible), and
 * one table is what makes that structural rather than a convention. NBFC and
 * E-commerce go dark — the Ledger and the checkout read best on plum, and the
 * two dark rows are never adjacent, which is what keeps §A7's blur budget at
 * one Vessel frost per viewport.
 *
 * Each dark row carries the V4 dark-band shell: `.sheet-enter` with a
 * `sheet-shadow` first child (Part D i) so the plum arrives as a sheet over the
 * white above it, a Seam on its top edge, and one Caustic. The section carries
 * NO `overflow-hidden` — that would clip `.sheet-shadow`'s upward 40px, which
 * globals.css says in as many words — so the Caustic sits in its own
 * `absolute inset-0 overflow-hidden` clip box. That box has no z-index and no
 * `isolate`: it is not a stacking context, so the disc's `z-index: -2` still
 * resolves against `.section-dark` (above the band, under the grain) while the
 * box clips it. The Seam and the clip box are both absolute wrappers because
 * `.seam` declares `position: relative` in motifs.css, which is emitted after
 * Tailwind and out-ranks an `absolute` utility on the same element.
 *
 * There is no `--sp` driver on these rows, deliberately: the only `--sp`
 * consumer is the Seam's 220px specular segment, which then stays parked off
 * the left edge. Decoration fails closed, and a client wrapper per row for one
 * sliding highlight is not worth the JS.
 *
 * The anchor ids are `SEGMENTS[].id` and are load-bearing — lib/site.ts
 * deep-links to #banks, #nbfcs, #smes and #fintech from the footer.
 */
export default function IndustriesPage() {
  return (
    <>
      <PageHero
        align="center"
        title={
          <>
            Purpose-built{" "}
            <span className="accent-word">financial infrastructure</span> for
            the organisations that move India&rsquo;s economy.
          </>
        }
      />

      {SEGMENTS.map((s, i) => {
        const row = ROW[s.mock];
        const mockFirst = i % 2 === 1;
        return (
          <section
            key={s.id}
            id={s.id}
            className={cn("section-pad", row.band, row.dark && "sheet-enter")}
          >
            {row.dark && (
              <>
                <span aria-hidden="true" className="sheet-shadow" />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0"
                >
                  <Seam />
                </div>
                {row.caustic && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                  >
                    <Caustic
                      x={row.caustic.x}
                      y={row.caustic.y}
                      size="480px"
                      drift="mid"
                    />
                  </span>
                )}
              </>
            )}

            <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-center gap-12 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
              <Reveal className={cn(mockFirst && "lg:order-2")}>
                <h2
                  className={cn(
                    "display-2",
                    row.dark ? "text-ink-inv" : "text-ink",
                  )}
                >
                  {s.title}
                </h2>
                {/* Flat on the band, not on glass: `--ink-inv-2` measures
                    8.06:1 on band B's brightest composite and still 6.88:1 with
                    a full Caustic core beneath it, so the secondary ink is safe
                    here even though it is not inside the mock Vessel (§A6). */}
                <p
                  className={cn(
                    "mt-5 max-w-[50ch] text-[16px] leading-relaxed",
                    row.dark ? "text-ink-inv-2" : "text-ink-2",
                  )}
                >
                  {s.body}
                </p>
              </Reveal>

              <Reveal
                delay={160}
                className={cn("min-w-0", mockFirst && "lg:order-1")}
              >
                <SegmentMock mock={s.mock} />
              </Reveal>
            </div>
          </section>
        );
      })}

      <CtaBand
        eyebrow="Ready to streamline"
        ctaLabel="Find the Right Fit for Your Business"
      />
    </>
  );
}
