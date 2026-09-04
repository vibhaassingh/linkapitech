# V4 "Liquid Glass" — handoff

**Branch:** `redesign/liquid-glass-v4` · **HEAD:** `6b48aa9` · **Base:** `main` (V3, live at https://linkapitech.kerning.ooo)
**Spec:** `REDESIGN-V4.md` — authoritative. Part J is the running log of every decision made during the build; read it before touching anything.
**Status:** phases 0–6 committed and gate-green. Phase 7 is **implemented but uncommitted and un-gated**. Phases 8–10 remain.

Production is untouched. `main` still serves the live site; nothing here has been deployed.

---

## 1. Do this first

The working tree carries a complete-looking Phase 7 across 14 files. It was written by an agent that was cut off by a spend limit before it could run the gate or commit.

```bash
cd linkapitech-site
git status --short          # expect 14 modified files, nothing staged
npx tsc --noEmit            # verified passing 2026-09-04
npm run lint                # verified passing
python3 scripts/qa/contract.py   # verified passing
```

**What is verified:** tsc, lint, and the contract check pass on this tree. The `.eco-hub` → `.eco-halo` regression is resolved. `layout.mjs` is wired into `gate.sh` as a hard step (`gate.sh:145`) and `package.json` has `qa:layout`.

**What is NOT verified:** the full gate — build, 13-route health, the a11y/contrast sweep, motion, WebGL probe, cascade, keyboard, reduced-motion, the new geometric sweep, and the five Lighthouse composited audits. **Run it before trusting any of Phase 7:**

```bash
# ports must be empty first — a `next dev` sharing .next corrupts the build
for p in 3000 3100 3411; do lsof -ti:$p; done
bash scripts/qa/gate.sh --since main --skip-pixdiff
```

It must print `GATE PASSED`. The new geometric sweep is the risky step: before Phase 7 it reported ~23 text overlaps (footer heading × CtaBand/legal at mobile+tablet on 12 routes; `/privacy` anchors at desktop) and 3 sub-10px labels on `/industries`. Phase 7 was told to diagnose those — most are expected to be the sticky-footer curtain sitting behind the opaque `.chrome-main`, i.e. false positives needing a named exemption in `layout.mjs`. Verify what it actually did there and that no real check was weakened. Then commit as `feat(v4): Ecosystem conduits, pinned ProcessRail with glass Ledger, CtaBand pool, footer pool, geometric sweep in the gate`, and put it through a review pass (§5).

---

## 2. What is built

### The material system (`.liq`) — Part A
Pure-CSS liquid glass: `backdrop-filter` frost + calibrated fill + wet-edge/depth gradients + `box-shadow` bevel + a `mask-composite` rim ring (`::before`) + pointer/scroll specular (`::after`). True SVG refraction (`backdrop-filter: url(#liq-refract)`, `components/ui/LiquidGlassDefs.tsx`) is Chromium-only, desktop-only, static, on ≤4 elements.

Class API: `.liq` base (tier 2) + `.liq-1`/`.liq-3` tiers, `.liq-light` (frosted white for lavender sections), `.liq-inset` (nested chip, no blur), `.liq-spec`/`.liq-spec-full`/`.liq-sweep` (specular variants), `.liq-lens`, `.liq-refract`, `.liq-live`, `.liq-enter`, `.liq-static-mobile`, `.liq-flat`. Tokens are `--liq-*` in `:root`.

**The constraint that shapes everything:** `qa.mjs` composites the brightest stop of every background layer as if text sat on it, so the fills are *aliases* of the AA-calibrated `--glass-1/2/3-bg` and all highlights live in pseudo-elements confined to text-free geometry. Any extra white in an element's own background layers breaks AA. The AA matrix is §A6; the blur budget (≤4 phone / ≤8 desktop) is §A7.

### Motif kit — `components/motifs/` (Part C)
Nine server components + `motifs.css`: **Conduit** (glass channel with a flowing highlight; `ConduitPath` for SVG curves), **Node** (glass disc with inner glow), **Pool** (liquid pooling under a stat), **Caustic** (ambient violet light), **Seam** (glass hairline divider), **Meniscus** (curved dark→light transition, max 3 uses), **Vessel** (the card family, via `Card.tsx`), **Ledger** (terminal as glass), **Droplet** (small liquid pill).

### Chrome
Adaptive two-state glass pill nav — one IntersectionObserver band at the pill's centre watches dark sections and flips `data-over="dark|light"`; a `:has()` CSS baseline covers no-JS and pre-hydration. Active marker is a translate-only 6px droplet dot. Seam appears when stuck.

### Hero — the lens (Parts E/F)
`components/three/HeroLens.tsx` server-renders an SVG lens (ellipse 148×132 at 250,205 in a 500×400 viewBox) that is **complete on its own**. `components/three/scene/createHeroLiquid.ts` + `liquidShaders.ts` add one full-quad fragment shader — one draw call, zero textures, zero per-frame buffer uploads — whose rest pose at `uWake = 0` matches the SVG colorimetrically (measured mean |ΔRGB| 3.8/255), so the 900ms canvas fade reads as the lens waking. `lensLayout.ts` is the single source of truth for all geometry, shared by the server SVG and the shader. Slosh spring on `--scroll-velocity`, ease-in wake, adaptive DPR floor 1.0.

### Homepage sections rebuilt
Hero, StatBand (now **dark**, with Pools under the odometers), WhatWeDo (the Conduit "manifold" with sequentially lighting Nodes), Challenges (`.liq-sweep` cards with dim Nodes). Phase 7 adds Ecosystem, ProcessRail (pinned story + glass Ledger), CtaBand, footer pool.

### QA harness additions
`qa.mjs` gained an **ink-on-glass** rule enforcing §A6 (proven able to fail). `probe.mjs` went 16 → 22 assertions: draw ceiling, draws ≤ frames + 1, zero buffer uploads after settle, rAF p95, GPU timer — the last two **proven able to fail** by making the shader 512× heavier and by doubling draws. `layout.mjs` gained a lens-registration check (Δ = 0px) and is now a hard gate step. `contract.py` scans all imported stylesheets and strips comments before matching.

---

## 3. Commit ledger

| SHA | What |
|---|---|
| `c72a26a` | Rewrote the stale README (it documented a `MegaMenu.tsx` that doesn't exist), untracked a committed `.pyc` |
| `e86d115` | `REDESIGN-V4.md` spec + V4 ownership packet |
| `f051778` | `--liq-*` tokens, Tailwind `liq` colours, refraction filter defs |
| `b4adff1` `c1b4d48` `ab01d9a` | `.liq` classes, motif kit, `lensLayout.ts`, motion primitives + two review-fix rounds |
| `5f4ca7a` | **`next dev` isolated to `.next-dev`** via phase-based `distDir` (see §6) |
| `1030fc4` `5ab4379` | Adaptive glass pill nav + review fixes |
| `ebcee2d` `279024a` | Hero rebuilt around the lens + review fixes |
| `50926aa` `c87cfb5` | Liquid-lens WebGL scene + review fixes |
| `6b48aa9` | Dark card language — StatBand dark, WhatWeDo manifold, Challenges |

---

## 4. Open findings

**From the Phase 6 review — not yet fixed:**

1. **Latent crash.** `WhatWeDo.tsx` does `LIT_AT[i].toFixed(2)` against a hardcoded 3-element array while `WHAT_WE_DO` has exactly three entries. A fourth content entry throws and breaks the homepage. Fix: derive it — `const litAt = (i, n) => (((i + 0.5) / n - 0.2) / 0.38 + 1) / 3.6` — or `(LIT_AT[i] ?? 1)`.
2. **Text over Caustic cores loses contrast the walk cannot see.** A Caustic is a sibling overlay, so `qa.mjs` never composites it. Measured: WhatWeDo body copy `--ink-inv-2` drops 4.52 → **4.00** where the disc is centred behind the third card; StatBand Droplet labels 4.87 → **4.27**. Fix: move the discs off the text, or promote those runs to `--ink-inv`. **Add a rule to §A6/Part C** — "text overlapping a Caustic core is `--ink-inv`" — because every later dark band inherits this question.
3. Minor: the Pool's +120ms rise ignores the RevealGroup stagger (`transition-delay: calc(var(--reveal-delay, 0ms) + 120ms)` fixes it); StatBand numerals spill ~17px into the padding at 1024×800; `--lavender-400` affixes measure 4.42 (passes as large text at 700 weight ≥19.2px, but record it).

**Carried, deliberately:**
- `.sheen` still has four live call sites (`about`, `solutions`, `Challenges`, `WhatWeDo`) — it retires as those sections move to `.liq-sweep`, not in a sweep of its own.
- `.eco-wire` stays (connected-banking and industries still use it); Phase 9 retires it. `ecoWire` and `conduitPulse` are the only entries in `gate.sh`'s non-composited allowlist.
- `README.md` still describes the pre-V4 hero; docs are Phase 10.
- `@supports (backdrop-filter: url(#x))` was never verified false in Safari/Firefox — if Safari parses-but-doesn't-render, gate `.liq-refract` behind a Chromium probe setting `html[data-refract]`.

---

## 5. Remaining phases

The method that has worked, per phase: **fresh implementer** (a task card naming every deliverable, the constraints, the exact verification to run and paste) → **fresh reviewer** (read-only, committed range, combined spec-compliance + quality) → **fix agent** → gate. Every phase ends `GATE PASSED` and one commit.

**Phase 7 — finish it.** Gate, review, fix, commit (§1).

**Phase 8 — six light homepage sections.** WhyUs (vertical Conduit spine, rows alternating sides), LogoMarquee (Droplet trust line), ErpBand (thin, one light Conduit under the marks), WhoWeAre (12-col with a `.liq-light` Vessel), Testimonials (`.liq-light` Vessels, `.card-depth` kept), HomeFaq (light Caustic, Node dots per row). Part E rows 2, 3, 7, 9, 11, 12. These are **six disjoint files** — the best candidate for a parallel fan-out.

**Phase 9 — inner pages.** Rewrite `PageHero.tsx` (dark/light tones, Caustic, Seam, Meniscus, Vessel-framed visual slot), then apply `Card.tsx` + the motifs across `/about`, `/services`, `/solutions`, `/connected-banking`, `/industries`, `/banks`, `/banks/[slug]`, `/contact`. Richest opportunities: connected-banking's architecture diagram (→ Conduit composition) and industries' UI mocks. Then reduce `.glass*` to `.liq*` aliases. Part G. Biggest phase; the page files are disjoint but all consume `PageHero`/`Card`, so those land first.

**Phase 10 — close-out.** Regenerate `scripts/qa/baseline/` (pixdiff exits 2 on any redesign by design), run the **full** gate with pixdiff, update `README.md` / `CLAUDE.md` / `scripts/qa/README.md` (and reconcile the "24 checks" headline — the gate now reports 21–23 assertions depending on flags), add any new `CONTENT-TODO.md` rows, then **Vercel preview deploy** for owner review.

**Production deploy is not part of this.** `vercel --prod --yes` from `linkapitech-site/` replaces a live client-facing site and needs an explicit go-ahead. Merging to `main` does not auto-deploy this project.

---

## 6. Gotchas that cost real time in this build

- **A `next dev` sharing `.next` with a production build corrupts it silently.** The desktop Browser pane kept restarting a `linkapitech-dev` preview on :3000 whose watcher recompiled into `.next`, so every chunk of the freshly built server 400'd and the sweeps ran against unstyled pages — while Lighthouse reported **perf 100 / TBT 0 / 0 allowlisted** (an unstyled page has nothing to audit; a too-perfect Lighthouse is a red flag, not a win). Fixed structurally in `5f4ca7a`: `next.config.ts` returns a phase-based `distDir`, so dev writes `.next-dev`. Still: check the three ports before any gate, and `preview_stop` **plus** closing the pane tab, or it comes back.
- **A subagent's foreground process dies when its turn ends.** A gate parked behind a wait was killed mid-sweep. Subagents must run the gate with `run_in_background: true` and poll from the foreground.
- **`\s` inside an untagged JS template literal reaches the page as `/s+/`** — it splits on the letter *s*. `qa.mjs`'s injected `AUDIT` string must double-escape.
- **`.gitignore` has no inline comments** — `pattern   # note` silently matches nothing.
- **`grep --include` does nothing on this machine** (grep is ugrep); use `git grep -- '*.tsx'` pathspecs. **zsh does not word-split unquoted `$VAR`** — use `while IFS= read -r`.
- **Never pipe `npm run build`** — SIGPIPE truncates it and leaves no BUILD_ID, which then looks like a server bug.
- **A check must be proven able to fail before its green is trusted.** Two probe assertions passed vacuously until forced to fail (a 512× heavier shader; doubled draws). The ink-on-glass rule was proven the same way.
- `motifs.css` classes that set `position: relative` (`.seam`, `.conduit`) out-rank a Tailwind `absolute` at equal specificity — they always need a positioning wrapper. Caustics need their own `absolute inset-0 overflow-hidden` clip box, and their `x`/`y` are **top-left**, not centre.
- Tailwind opacity modifiers do nothing on `var()` colours — every translucent needs an explicit token.

---

## 7. Handoff prompt

Paste this into a fresh session in `/Users/vibhaassingh/Linkapitech`:

> Continue the V4 "Liquid Glass" redesign of the LinkAPI site. Read `linkapitech-site/HANDOFF-V4.md` first, then `linkapitech-site/REDESIGN-V4.md` (the authoritative spec — Part J is the running decision log, read it in full before editing).
>
> State: branch `redesign/liquid-glass-v4`, HEAD `6b48aa9`. Phases 0–6 are committed and gate-green. **Phase 7 is implemented across 14 files but uncommitted and un-gated** — tsc, lint and `contract.py` pass on it, but the full gate has not run. Start there: verify ports 3000/3100/3411 are free, run `bash scripts/qa/gate.sh --since main --skip-pixdiff`, scrutinise the newly-wired geometric sweep step (it must be zero findings without any real check having been weakened — check what exemptions were added to `layout.mjs` and why), then review, fix and commit Phase 7.
>
> Then continue phases 8, 9 and 10 exactly as HANDOFF-V4.md §5 describes. Per phase: a fresh implementer agent with a task card naming every deliverable and the exact verification to paste; then a fresh read-only reviewer over the committed range; then a fix agent; then the gate. Every phase ends `GATE PASSED` and one commit. Phase 8's six light sections are disjoint files and parallelise well; Phase 9's inner pages must land `PageHero` and `Card` first.
>
> Also still open: the two Phase 6 review findings in §4 (the latent `LIT_AT[i]` crash, and text over Caustic cores measuring 4.00–4.27 where the contrast walk is blind).
>
> Constraints that are not negotiable: animate transform/opacity/filter only; never put `filter` on an ancestor of glass; respect the §A6 AA matrix and the §A7 blur budget; every string comes from `content/` (no invented facts — flag gaps `TODO: client to confirm` and add a `CONTENT-TODO.md` row); reduced motion everywhere; the gate green after every phase. Read §6 for the gotchas that have already cost real debugging time — especially the `next dev`/`.next` corruption and running the gate in the background.
>
> Take it to a green gate and a **Vercel preview URL**. Do not run `vercel --prod --yes` — production replaces a live client-facing site and is the owner's call.
