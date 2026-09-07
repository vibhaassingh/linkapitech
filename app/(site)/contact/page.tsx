import type { CSSProperties } from "react";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { Droplet, Node } from "@/components/motifs";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CONTACT, SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * /contact — V4 Phase 9b (REDESIGN-V4 Part G).
 *
 * Detail cards become light Vessels with `Node` icons; `ContactForm`'s own
 * `<form>` is the Vessel it sits in (see ContactForm.tsx). `.link-draw` is kept
 * on every link.
 *
 * ── `liq-flat` ON EVERY `.liq` HERE, AND IT IS FREE ────────────────────────
 * There are SIX Vessels on this route — five in the detail rail (address, the
 * three `CONTACT.channels` cards, the web/WhatsApp card) plus the `<form>`
 * itself — and one Droplet capsule. All seven sit on a FLAT `--surface`
 * (#ffffff) with nothing but the section colour behind them, and a Gaussian
 * blur of a constant field IS that constant — `.liq-light`'s `saturate(1.15)`
 * on white is achromatic — so the frost is provably zero pixels of difference
 * (Part J Phase 8). It is not only free, it is the §A7 budget: seven blurred
 * elements plus the pill would be 8 of the desktop 8 at 1440, and (the Droplet
 * excepted, since `.liq-1` has no blur below 1024) 7 of the phone 4 at 390.
 *
 * So the ONLY backdrop-filtered layer this route composites is the pill nav —
 * **1 of 8 at 1440, 1 of 4 at 390**. /contact renders no `CtaBand`, and
 * `SiteFooter` carries no `.liq` at all; the closed `.chrome-scrim` is
 * `visibility: hidden` (chrome.css) and composites nothing. What draws the
 * glass instead is the rim ring, the wet edge and `--liq-light-shadow`.
 *
 * §A8 is therefore MOOT on this page: with no `backdrop-filter` anywhere in
 * the body there is no frost for a backdrop root to kill. Worth saying out
 * loud, because `Reveal` wraps both columns and `[data-reveal]` is `opacity: 0`
 * + `will-change: opacity` until `[data-inview]` resets it — transient, resting
 * at 1, which Phase 9a records as needing nothing. Anyone who later drops the
 * `liq-flat` from one of these should re-read §A8 before doing it.
 *
 * ── INK (§A6), COMPUTED ON THIS PAGE'S OWN COMPOSITE ───────────────────────
 * §A6's light matrix (`--ink` 14.18, `--ink-2` 7.82, `--ink-3` 4.56) is the
 * calibration table, not this host. The section is `bg-surface` #ffffff, and
 * `.liq-light`'s .70 white — like `.liq-light.liq-1`'s .55, and like
 * `--liq-light-edge`, which is white → transparent — composites over white
 * back to #ffffff. Every run on glass is therefore measured against pure white:
 *
 *   --ink           #1d1d1f  16.83:1  address body, email, "www.…"
 *   --ink-2         #4a4552   9.27:1  phone, WhatsApp, the form's lead
 *   --violet-text   #6f257f   9.35:1  card labels, the Droplet, two glyphs
 *   --ink-3         #6e6779   5.41:1  Field.tsx's labels — tier 2 allows it,
 *                                     and 5.41 is Card.tsx's own figure for
 *                                     light tier 2
 *   --success-text  #147d52   5.14:1  the sent confirmation
 *   --error         #b3261e   6.54:1  field errors and the failure line
 *   :hover --plum-700 #42174c 14.4:1  every `.link-draw`
 *
 * `--ink-3` is forbidden only on `.liq-light.liq-1`'s .55 white (4.17 in the
 * matrix), and the single tier-1 host on this route is the Droplet, whose ink
 * is `--violet-text`. There is no tier-3 host, no Pool and no Caustic under
 * glass anywhere on the page — so the contrast walk's sibling-overlay blind
 * spot (Phase 9a) has nothing to hide here. The dark hero is not glass either:
 * its `--ink-inv` h1 and `--ink-inv-2` lead sit on `.section-dark band-b`,
 * which Phase 9a measured at 8.06:1 flat and 6.88:1 for the SECONDARY ink with
 * a full `--violet-a24` caustic core beneath it.
 *
 * Non-text (SC 1.4.11, 3:1): the `--ink-inv` glyph on the Nodes' `--grad-tile`
 * disc is 6.42:1 against the gradient's BRIGHTEST stop (`--violet-500`
 * #8e24aa) and 10.82:1 against its #4a148c end.
 *
 * ── WHITE ON WHITE IS THE DELIBERATE READING ──────────────────────────────
 * `.liq-light` over `--surface` composites to the band's own colour, so these
 * cards are drawn by the rim conic, the wet edge and `--liq-light-shadow`
 * alone — no tonal step, and the retired `border border-line-soft` + `bg-canvas`
 * is gone on purpose (§A2: the ring IS the border). That is the shipped
 * Phase-8 `Testimonials` construction (`liq liq-light liq-flat` on
 * `section-pad bg-surface`) and Phase 9a's /industries reconciliation row, so
 * the grammar is consistent — but /contact stacks six of them, which is more
 * than either precedent, and no geometric or contrast check can see "card edge
 * too faint". Left as-is rather than moving the band to `bg-canvas` (which
 * would also mean passing `nextSurface="var(--canvas)"` so the hero's Meniscus
 * keeps painting the right white); flagged for the Part H phase-10 owner pass.
 *
 * ── THE MAP IS UNTOUCHED, DELIBERATELY ────────────────────────────────────
 * It is a parked product decision (CONTENT-TODO §5) and the sole reason this
 * route scores lower than the rest. Do not "fix" it here — see the note at the
 * section itself.
 */

/**
 * Card craft for the contact rail: the light Card recipe (tier-2 glass, radius
 * 20, `--liq-pad` = the real padding so the pointer specular stays in the
 * text-free frame) and `.icon-draw`, so the Node's icon replays its stroke draw
 * on hover.
 *
 * NOT the shared `components/motifs/Card`, and that is a considered deviation
 * from Part C's "replaces the per-page CARD_LIFT strings". `Card` is a title +
 * body block with the icon ABOVE, optionally a link; these are icon-LEFT rows
 * with no title, no body prose, no href and deliberately no lift, at `p-5`
 * rather than `p-7 md:p-8`. Expressing that through `Card` would mean four new
 * props for one call site. It speaks `Card`'s grammar verbatim instead — the
 * same construction /banks and /banks/[slug] use for their icon-left rows.
 *
 * NO `.liq-live` on these, and it is not an oversight: these cards are not
 * links, and lifting a static panel promises an interaction that does not
 * exist. `.liq-spec` is the whole hover — a highlight, not a lift. The links
 * inside carry `.link-draw` (on the `<a>`/`<p>` CHILDREN — `.liq` owns both
 * pseudos and may never share an element with `.link-draw`).
 *
 * `--liq-pad: 20px` matches `p-5` exactly, which is what keeps `.liq-spec`'s
 * four feathered masks over the real padding frame. It carries a geometric
 * floor with it: the masks run solid to 20px and clear at 38px, so a card
 * shorter than ~76px would have no fully-masked interior and the specular
 * would sweep under its text. Every card here is ≥ 100px (a 40px Node between
 * two 20px pads is already 80px), so there is headroom — but a short row added
 * later needs `.liq-spec-full`'s ink rule, not this class.
 */
/** The Vessel recipe every card in this rail shares. */
const DETAIL_SURFACE =
  "liq liq-light liq-flat liq-spec icon-draw rounded-lg p-5";
/** …plus the icon-left row layout, for the four cards that have a Node. */
const DETAIL_CARD = `${DETAIL_SURFACE} flex items-start gap-4`;
const DETAIL_PAD = { "--liq-pad": "20px" } as CSSProperties;

/**
 * `w-fit` matters: `.link-draw` draws its rule from edge to edge of the box, so
 * on a full-width `block` anchor the underline would run past the text. Kept
 * `block` (not `inline-block`) so the email and phone still stack.
 */
const DETAIL_LINK =
  "link-draw block w-fit text-[15px] transition-colors duration-ui hover:text-plum-700";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Talk to LinkAPI Tech about bringing banking inside your business. Partnerships, plugin support and management contacts, plus our registered office in Ghaziabad, Uttar Pradesh.",
  path: "/contact",
});

/** One icon per channel, in CONTACT.channels order. */
const CHANNEL_ICONS: IconName[] = ["share", "plug", "building"];

export default function ContactPage() {
  return (
    <>
      {/* nextSurface is the default `--surface`: the section below is
          bg-surface, so the Meniscus is filled with the white it rises into. */}
      <PageHero
        tone="dark"
        align="center"
        title="Let's build the next generation of banking together."
        lead="Ready to bring banking inside your business? Tell us what you're looking to solve and our team will get back to you with tailored solutions and next steps."
      />

      <section className="section-pad bg-surface">
        <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-start gap-12 px-6 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Contact details */}
          <Reveal>
            {/* The eyebrow becomes a Droplet, matching PageHero's own. Its ink
                is `--violet-text`: on `.liq-light.liq-1`'s .55 white §A6 puts
                that at 7.20:1 where `--ink-3` would fail at 4.17 (and qa.mjs's
                ink-on-glass rule fails the build on it) — the LogoMarquee
                trust-line finding, Part J Phase 8. Over THIS host, a flat
                `--surface`, the .55 white composites back to #ffffff and it
                measures 9.35:1.

                `liq-flat`, for the same reason and by the same precedent as
                that marquee capsule and HomeFaq's eyebrow (Phase 8): a small
                pill on a flat white surface has nothing behind it to frost, so
                the class deletes a 12px `--liq-light-1-blur` that could only
                ever have cost GPU. It is a desktop-only saving — `.liq.liq-1`
                already has no blur below 1024 — and it is what makes the file
                header's "the pill is this route's only blur layer" true rather
                than nearly true. */}
            <Droplet
              light
              className="liq-flat text-[0.72rem] font-medium uppercase tracking-[0.13em] text-violet-text"
            >
              Contact details
            </Droplet>

            <ul className="mt-8 flex flex-col gap-4">
              <li className={DETAIL_CARD} style={DETAIL_PAD}>
                {/* `Node light` — Part G names the Node for THIS route
                    specifically ("Vessels with Nodes"), where /about and
                    /banks/[slug] say only "cards" and use `.card-icon-light`.
                    A light Node is never glass (`Node.tsx`: `node-light`, not
                    `.liq liq-1`), so an icon disc inside a Vessel costs no
                    second blur layer.

                    SIZE 40, outside Part C's stated 44–56: that range is for
                    the standalone GLASS Node. The light disc's shipped size
                    across V4 is 40 — /industries' `Rails` (Phase 9a) and both
                    `card-icon-light h-10 w-10` call sites — and 40 also
                    preserves the retired tile's `h-10 w-10` footprint exactly,
                    so the rail's rhythm is unchanged.

                    `--grad-tile` inline, not `.grad-fill` and not `node-light`'s
                    own lavender: `.node-light` sets `background` AND `color` in
                    motifs.css, which is emitted after globals.css and after
                    Tailwind and wins both ties, so only an inline pair can
                    override it (Part J Phase 7's port-bead precedent, applied
                    by Phase 9a's Rails router). The violet keeps the emphasis
                    the retired `grad-fill` tiles had — the client-authored
                    look for this rail — which is the one place /contact's
                    discs diverge from the lavender ones on its sibling pages.

                    The retired tiles were `rounded-md` squares; a Node is a
                    DISC and cannot be squared from a call site — `.node` sets
                    `border-radius: 999px` in motifs.css, which out-ranks a
                    `rounded-md` utility at equal specificity, so passing one
                    would be a silently dead class.

                    NO `lit`. `data-lit` asserts "the flow reaches this
                    endpoint" (Part C) and nothing flows to a contact card; it
                    would also permanently defeat `.liq:hover .node-glow`, the
                    beat that lights a card's Nodes on hover. Zero pixels
                    either way here — `--violet-glow` is rgba(142,36,170,.16)
                    and this disc is already violet, so .35 and 1 differ by
                    less than an LSB — which is exactly why the honest default
                    is the cheaper claim. */}
                <Node
                  light
                  size={40}
                  style={{
                    background: "var(--grad-tile)",
                    color: "var(--ink-inv)",
                  }}
                  icon={<Icon name="bank" size={18} draw />}
                />
                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-eyebrow text-violet-text">
                    Registered address
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink">
                    {CONTACT.address.line1}
                    <br />
                    {CONTACT.address.line2}
                  </p>
                </div>
              </li>

              {CONTACT.channels.map((ch, i) => (
                <li key={ch.phone} className={DETAIL_CARD} style={DETAIL_PAD}>
                  {/* Same disc as the address card above — see its note for
                      the size, the inline `--grad-tile` pair and the dropped
                      `lit`. */}
                  <Node
                    light
                    size={40}
                    style={{
                      background: "var(--grad-tile)",
                      color: "var(--ink-inv)",
                    }}
                    icon={
                      <Icon name={CHANNEL_ICONS[i] ?? "user"} size={18} draw />
                    }
                  />
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold uppercase tracking-eyebrow text-violet-text">
                      {ch.label}
                    </p>
                    <a
                      href={`mailto:${ch.email}`}
                      className={cn(
                        DETAIL_LINK,
                        "mt-1 text-ink [overflow-wrap:anywhere]",
                      )}
                    >
                      {ch.email}
                    </a>
                    <a href={ch.phoneHref} className={cn(DETAIL_LINK, "text-ink-2")}>
                      {ch.phone}
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            {/* The rail's fifth Vessel: `DETAIL_SURFACE` without the icon-left
                row, because these two lines carry their glyphs inline rather
                than in a Node. Still `.icon-draw` — the trigger is the card,
                and both `<Icon draw>` glyphs replay on hover. */}
            <div className={`${DETAIL_SURFACE} mt-4`} style={DETAIL_PAD}>
              <p className="flex items-center gap-2.5 text-[15px] text-ink">
                <Icon name="globe" size={17} className="text-violet-text" draw />
                www.{SITE.domain}
              </p>
              <a
                href={CONTACT.whatsapp}
                className="link-draw mt-3 inline-flex w-fit items-center gap-2.5 text-[15px] text-ink-2 transition-colors duration-ui hover:text-plum-700"
              >
                <Icon name="chat" size={17} className="text-violet-text" draw />
                Message us on WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={140}>
            {/* The form's own <form> IS the Vessel (ContactForm.tsx) — a card
                inside a card is the construction /industries' `Shell` retired
                in Phase 9a, and `.liq` owns both pseudos, so a wrapper here
                would only add a box. */}
            <ContactForm />
          </Reveal>
        </div>
      </section>

      {/* Map — Google Maps embed, keyboard-reachable via the address links above.
          MEASURED COST, and the old claim here that this adds "no third-party JS"
          was simply wrong: the embed pulls ~488KB of Google script (places.js,
          main.js, init_embed.js, util.js, common.js) and is why this page scores
          perf 82 / LCP 3.8s on the live domain while every other route sits at
          95-100. `loading="lazy"` does NOT save it — Chrome's lazy threshold is
          very generous under throttled conditions, so the iframe loads anyway.
          The fix is a facade (static placeholder that swaps in the iframe on
          click, per Lighthouse's third-party-facades guidance). That changes what
          a visitor sees until they interact, so it is a product decision and is
          flagged in CONTENT-TODO.md rather than made here.
          V4 PHASE 9B LEFT THIS ENTIRELY ALONE — see the file header. */}
      <section aria-label="Our location" className="border-t border-line-soft">
        <iframe
          title="Map of LinkAPI Tech's registered office in Ghaziabad, Uttar Pradesh"
          src="https://www.google.com/maps?q=Shipra+Indirapuram,+Ghaziabad,+Uttar+Pradesh&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[380px] w-full border-0 md:h-[440px]"
        />
      </section>
    </>
  );
}
