#!/usr/bin/env python3
"""Verify the B0 motion/design contract is DEFINED and WIRED.

    python3 scripts/qa/contract.py

Two failure modes this exists to catch, both of which produce no error anywhere
— they typecheck, they build, and they render silently wrong:

  orphan      a component uses a class/token nothing defines. Tailwind and CSS
              both fail silently, so the effect just never happens. This project
              has already shipped three of these (bg-plum-600/40 and friends
              compiled to nothing at all).
  unwired     the contract defines something, but nothing consumes it — or a
              module exists that nothing imports. A velocity bus that no
              component mounts writes no variable; a [data-tilt] attribute with
              no listener is inert markup.

Exit 1 on any orphan or unwired item.

Scope note: "defined but unused" is only a FAILURE for JS_WIRING and
[data-tilt]. For CLASSES and TOKENS it is merely printed (used_by_components /
referenced) — a class the design system defines ahead of its first call site
is allowed, so the class/token lists guard against orphans, not dead rules.
"""
import os
import re
import subprocess
import sys

ROOT = subprocess.run(["git", "rev-parse", "--show-toplevel"],
                      capture_output=True, text=True).stdout.strip()
GLOBALS = os.path.join(ROOT, "app", "globals.css")
TW = os.path.join(ROOT, "tailwind.config.ts")
# Every stylesheet app/layout.tsx imports, plus the Tailwind theme. chrome.css
# and motifs.css are plain global sheets imported after globals.css; a class
# defined only there is just as "defined" as one in globals — before they were
# read here, a `.chrome-*` hook would have been reported as an orphan.
CSS_FILES = [
    GLOBALS,
    os.path.join(ROOT, "components", "chrome", "chrome.css"),
    os.path.join(ROOT, "components", "motifs", "motifs.css"),
    TW,
]

# The contract, as handed to the seven section agents.
CLASSES = [
    "sheet-enter", "hero-recede", "scrub-drift", "scrub-fade-side",
    "orb-hand-off", "card-depth", "glass-1", "glass-2", "glass-3",
    "nav-thumb", "link-draw", "icon-draw", "shake",
    # V4 Phase 3 — adaptive liquid-glass pill (chrome.css §1b). Each is added
    # the moment its first call site lands (REDESIGN-V4 Part J), so an item is
    # only ever listed once it is both defined and wired.
    "chrome-header", "chrome-nav-link", "chrome-cta", "chrome-mark",
    "chrome-seam",
    # V4 Phase 4 — hero rebuilt around the lens. The first `.liq` call sites
    # (hero chips, Droplet eyebrow, the glass Button), the motifs the hero
    # composes, the hero band + display step, and the poster SVG's animated
    # groups. `caustic` is NOT listed: the hero's two caustics are SVG
    # ellipses inside `.lens-caustic`, no DOM <Caustic> is rendered yet.
    "liq", "liq-1", "liq-refract", "liq-spec-full", "liq-live",
    "droplet", "node", "seam", "meniscus",
    "band-hero", "display-0", "lens-caustic", "lens-glint", "drift-lead",
    "hero-lens",
    # V4 Phase 6 — the dark card language (StatBand dark, WhatWeDo manifold,
    # Challenges sweep cards): the material modifiers these sections are the
    # first to wire, the first DOM <Caustic> / <Pool> / <Conduit> call sites,
    # the three plum bands, the sheet shadow and two drift tiers. `node-flow`
    # is the --sp-sequenced Node glow (motifs.css). `conduit-scroll` is
    # composed at render as `conduit-${flow}` (Conduit.tsx); the `used`
    # regex finds the literal only in WhatWeDo.tsx's doc comment, so its
    # column reads True by that accident — either way it is defined, and the
    # class/token lists only ever fail on orphans.
    "liq-spec", "liq-sweep", "liq-enter", "liq-inset", "liq-static-mobile",
    "pool", "conduit", "conduit-flow", "conduit-scroll", "conduit-v",
    "caustic", "node-glow", "node-flow", "sheet-shadow",
    "drift-far", "drift-mid", "band-a", "band-b", "band-c",
    # V4 Phase 7 — Ecosystem conduits, the pinned ProcessRail with its glass
    # Ledger, the CtaBand pool and the footer pool. Every entry below has its
    # FIRST RENDERED call site in this phase:
    #   liq-light / node-light  the light material and the light Node. Both
    #     were composed in components/motifs/{Card,Droplet,Node}.tsx from
    #     phase 2, but nothing RENDERED either until the Ecosystem chips and
    #     their port beads; Card and `Droplet light` land in phase 9.
    #   liq-flat        the §A7 escape hatch (Ecosystem's ten chips).
    #   conduit-pulse   the SVG packet, allowlisted in gate.sh since phase 2
    #                   and first wired here (Ecosystem's ten connectors).
    #   pin/-stage/-step  Part D (iii)'s pinned story (ProcessRail).
    #   ledger          Part C's glass code window (Terminal variant).
    #   footer-pool     the final dark surface (SiteFooter).
    #   eco-halo        replaces `.eco-hub`'s off-compositor box-shadow pulse.
    #   drift-near      composed at render as `drift-${drift}` by Caustic.tsx,
    #                   so — exactly like `conduit-scroll` in phase 6 — the
    #                   `used` regex finds the literal only in CtaBand.tsx's
    #                   doc comment. A print either way: the class list fails
    #                   on orphans, not on dead rules.
    # `conduit-custom` is deliberately NOT here: `flow="custom"` emits no such
    # class (that is the point — the kit declares no transform on a
    # caller-owned flow element), so listing it would be an orphan by
    # construction.
    "liq-light", "liq-flat", "node-light", "conduit-pulse",
    "pin", "pin-stage", "pin-step", "ledger", "footer-pool", "eco-halo",
    "drift-near",
    # V4 Phase 8 — the six LIGHT home sections (marquee, WhoWeAre, WhyUs,
    # ErpBand, Testimonials, HomeFaq). Every motif in the kit has a light
    # variant that was composed in components/motifs/*.tsx from phase 2 and
    # RENDERED for the first time here — `node-light` above is the one
    # exception (the Ecosystem port beads wired it in phase 7):
    #   conduit-light   WhyUs's vertical spine, ErpBand's underline
    #   pool-light      WhoWeAre's basin, Testimonials' per-card basin
    #   seam-light      LogoMarquee's bottom edge (the only edge it has now —
    #                   the hero's Meniscus owns the top)
    #   caustic-light   HomeFaq's one ambient disc
    #   droplet-light   the LogoMarquee trust line and the FAQ eyebrow
    # Every one is emitted by a `light` prop on its motif, so the `used`
    # regex finds the literal in components/motifs/*.tsx rather than at the
    # call site — the same standing `conduit-scroll` and `drift-near` have.
    "conduit-light", "pool-light", "seam-light", "caustic-light",
    "droplet-light",
]
TOKENS = [
    "--spring-snappy", "--spring-smooth", "--spring-gentle",
    "--dur-spring-snappy", "--dur-spring-smooth", "--dur-spring-gentle",
    "--grain", "--ink-inv-3", "--scroll-velocity",
    "--scrollbar-thumb", "--scrollbar-track",
    "--grad-section-a", "--grad-section-b", "--grad-section-c",
    # V4 Phase 3 — the --liq-* tokens the pill and the mobile sheet consume.
    "--liq-pill-light", "--liq-pill-dark", "--liq-pill-blur",
    "--liq-rim", "--liq-light-rim", "--liq-rim-w", "--liq-light-shadow",
    # V4 Phase 4 — the material tokens the `.liq` recipe reads now that it has
    # call sites: the tier-1/2 fill + blur aliases (of --glass-1/2-*), edge,
    # depth, shadow, both speculars (`.liq-spec` reads --liq-spec,
    # `.liq-spec-full` the soft one) and `.liq-live`'s lift/press scales.
    "--liq-1-fill", "--liq-1-blur", "--liq-2-fill", "--liq-2-blur",
    "--liq-edge", "--liq-depth", "--liq-shadow",
    "--liq-spec", "--liq-spec-soft",
    "--liq-lift", "--liq-hover-scale", "--liq-press-scale",
    # V4 Phase 6 — the frame width the .liq-spec mask reads (set inline per
    # card), the sweep band's gradient, the Pool/Caustic alpha, the Node glow,
    # and the veil .liq-inset fills with. `--lit-at` is NOT a token: it is a
    # per-element inline value read with a fallback (`var(--lit-at, 0)`).
    "--liq-pad", "--liq-sweep", "--violet-a24", "--violet-glow", "--veil-2",
    # V4 Phase 7 — the palette entries phase 7's components name DIRECTLY in
    # an inline style or an SVG presentation attribute, which is what makes
    # them orphan-checkable here (`used` is `tok in app_code`):
    #   --lavender-300  ConduitPath's light base stroke (Ecosystem ×10)
    #   --lavender-400  the ProcessRail rail fill's top stop
    #   --violet-500    the same fill's bottom stop, and the Ecosystem chips'
    #                   port bead — the colour of the packet arriving at it
    #   --terminal-cmt  the Ledger's comment ink; the AA-critical one (5.44:1
    #                   on the translucent composite, measured in Terminal.tsx)
    # --line-inv is the footer's hairline. It reaches components only through
    # the Tailwind `border-line-inv` utility, so the orphan test cannot see it
    # and this entry is documentation plus the `defined` assertion — the same
    # standing this token had before, now with a call site.
    "--lavender-300", "--lavender-400", "--violet-500", "--terminal-cmt",
    "--line-inv",
    # V4 Phase 8 — the LIGHT half of the material, first rendered by the six
    # light home sections. The tier-1 fill/blur pair reached the page in phase
    # 7 (the Ecosystem chips) and tier 2 does so here (the WhoWeAre, HomeFaq
    # and Testimonials Vessels); the edge and the violet specular are read by
    # `.liq-light` itself, which had no rendered instance before phase 7.
    # `--violet-soft` is the light Pool's and light Caustic's alpha (the
    # counterpart of phase 6's `--violet-a24`), `--lavender-200` is the light
    # Conduit's track and the light Node's disc, and `--line-violet` is the
    # light Seam's specular segment — white is invisible on a light band.
    # All six reach the page through CSS rather than an inline style, so
    # `used` resolves via `var(--tok)` in the stylesheets, as `--line-inv`
    # does. `--marquee-d` is deliberately NOT listed: `.marquee` only ever
    # READS it (`var(--marquee-d, 36s)`) and LogoMarquee sets it inline, so it
    # is never `--marquee-d:`-declared in a stylesheet and listing it would be
    # an orphan by construction — the same standing as `--lit-at`.
    "--liq-light-1-fill", "--liq-light-1-blur",
    "--liq-light-2-fill", "--liq-light-2-blur",
    "--liq-light-edge", "--liq-light-spec",
    "--violet-soft", "--lavender-200", "--line-violet",
]
# JS contract: module path -> a symbol that proves a real consumer exists.
JS_WIRING = {
    "components/motion/velocity.ts": "the --scroll-velocity writer must be mounted",
    "components/motion/Magnetic.tsx": "must implement [data-tilt] (rotateX/rotateY)",
}


def read(path):
    try:
        with open(path) as fh:
            return fh.read()
    except FileNotFoundError:
        return ""


def strip_css_comments(text):
    """Drop every /* ... */ block. `defined` below is a plain substring test,
    and chrome.css's header comment LISTS its §1b hooks by name — so without
    this a deleted `.chrome-seam` rule would still read as defined. Applied to
    the .css files only: tailwind.config.ts is TypeScript, where `/*` occurs
    legitimately inside its content globs ("./app/**/*.{ts,tsx}")."""
    return re.sub(r"/\*.*?\*/", "", text, flags=re.S)


def sources():
    files = subprocess.run(["git", "ls-files"], capture_output=True, text=True,
                           cwd=ROOT).stdout.split()
    out = {}
    for f in files:
        if f.endswith((".tsx", ".ts")) and not f.startswith("scripts/"):
            out[f] = read(os.path.join(ROOT, f))
    return out


def main():
    css = "".join(strip_css_comments(read(f)) if f.endswith(".css") else read(f)
                  for f in CSS_FILES)
    src = sources()
    app_code = "\n".join(src.values())
    problems = []

    print("=== contract: defined? ===")
    for cls in CLASSES:
        defined = f".{cls}" in css
        used = bool(re.search(rf'(?<![\w-]){re.escape(cls)}(?![\w-])', app_code))
        flag = "ok  " if defined else "MISS"
        if not defined and used:
            problems.append(f"ORPHAN class .{cls} — used in components but never defined")
            flag = "ORPHAN"
        elif not defined:
            flag = "absent"
        print(f"  {flag:7s} .{cls:16s} defined={defined}  used_by_components={used}")

    print("\n=== contract: tokens ===")
    for tok in TOKENS:
        defined = f"{tok}:" in css
        used = (tok in app_code) or (f"var({tok})" in css)
        flag = "ok  " if defined else "MISS"
        if not defined and (tok in app_code):
            problems.append(f"ORPHAN token {tok} — referenced by components but never defined")
            flag = "ORPHAN"
        print(f"  {flag:7s} {tok:22s} defined={defined}  referenced={used}")

    print("\n=== contract: JS wiring (defined is not enough — must be consumed) ===")
    for path, why in JS_WIRING.items():
        full = os.path.join(ROOT, path)
        exists = os.path.exists(full)
        stem = os.path.basename(path).rsplit(".", 1)[0]
        importers = [f for f, body in src.items()
                     if f != path and re.search(rf'from\s+["\'][^"\']*{re.escape(stem)}["\']', body)]
        print(f"  {path}")
        print(f"      exists={exists}  importers={importers or 'NONE'}")
        if not exists:
            problems.append(f"MISSING module {path} — {why}")
        elif not importers:
            problems.append(f"UNWIRED {path} — nothing imports it; {why}")

    # [data-tilt] specifically: markup exists across packets, so a listener must too.
    tilt_users = [f for f, b in src.items() if "data-tilt" in b and "motion/" not in f]
    tilt_impl = [f for f, b in src.items()
                 if "motion/" in f and re.search(r"data-tilt|dataset\.tilt", b)
                 and re.search(r"rotateX|rotateY|perspective", b)]
    print(f"\n  [data-tilt] markup in: {tilt_users or 'none'}")
    print(f"  [data-tilt] handler in: {tilt_impl or 'NONE'}")
    if tilt_users and not tilt_impl:
        problems.append(
            f"UNWIRED [data-tilt] — {len(tilt_users)} component(s) set it but no "
            "listener applies a tilt transform")

    print("\n" + "=" * 62)
    if problems:
        print(f"FAIL — {len(problems)} contract problem(s):")
        for p in problems:
            print(f"  • {p}")
        return 1
    print("OK — every contract item is defined and wired.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
