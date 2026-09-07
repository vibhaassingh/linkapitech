import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Droplet } from "@/components/motifs";
import { PluginMockup } from "@/components/sections/plugin/PluginMockup";
import { PLUGIN, PLUGIN_HIGHLIGHTS, BANK_PLUGIN_PAGES } from "@/content/plugin";

/**
 * Homepage spotlight for the hero product (client brief 2026-08-27: the plugin
 * page "should be highlighted on the main website"). Sits directly after the
 * logo marquee, before "Who We Are", on the same `bg-surface` so the marquee
 * and the spotlight read as one white opening block.
 *
 * Two columns from lg: copy + three highlights + CTAs on the left, the
 * compact product mockup on the right. Every word is content/plugin.ts —
 * portal copy — except the eyebrow, which is the client's own framing of the
 * product ("hero product").
 *
 * No glass, no Conduit, no Caustic: this is the one section on the homepage
 * that borrows the plugin page's flatter grammar on purpose, so it reads as a
 * window into a different product surface rather than another band of the
 * ecosystem story.
 */
export function PluginSpotlight() {
  return (
    <section
      id="bank-plugin"
      aria-labelledby="plugin-spotlight-heading"
      className="section-pad bg-surface"
    >
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <Reveal>
            <Droplet
              light
              className="text-[0.72rem] font-medium uppercase tracking-[0.13em] text-violet-text"
            >
              Hero product
            </Droplet>
            <h2
              id="plugin-spotlight-heading"
              className="display-2 mt-6 text-ink"
            >
              {PLUGIN.name}:{" "}
              <span className="accent-word">
                {PLUGIN.headline.lead.replace(/[\s,—]+$/, "").toLowerCase()}{" "}
                {PLUGIN.headline.accent}
              </span>
            </h2>
            <p className="mt-5 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">
              {PLUGIN.lead}
            </p>
          </Reveal>

          <Reveal delay={90}>
            <ul className="mt-7 space-y-2.5">
              {PLUGIN_HIGHLIGHTS.slice(0, 3).map((h) => (
                <li
                  key={h}
                  className="flex items-center gap-3 text-[15px] font-medium text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lavender-200 text-plum-700"
                  >
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="none">
                      <path
                        d="m5 10.4 3.2 3.2L15.5 6.5"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={160} className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="/bank-plugin">Explore The Bank Plugin</Button>
            <Button href={PLUGIN.guide.href} variant="quiet">
              {PLUGIN.guide.label}
            </Button>
          </Reveal>

          <Reveal delay={200}>
            {/* Named, not linked: each bank has its own landing site on its
                own subdomain, and /bank-plugin is where a visitor picks one.
                Three cross-origin links in a homepage paragraph would send
                people off-site before they have read what the product is. */}
            <p className="mt-7 text-[14px] leading-relaxed text-ink-3">
              Available to{" "}
              {BANK_PLUGIN_PAGES.map((b) => b.bank).join(", ").replace(/, ([^,]*)$/, " and $1")}{" "}
              customers.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} dir="right">
          <PluginMockup compact />
        </Reveal>
      </div>
    </section>
  );
}
