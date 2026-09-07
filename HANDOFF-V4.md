# V4 "Liquid Glass" — handoff

**Branch:** `redesign/liquid-glass-v4` · **HEAD:** see `git log -1` · **Base:** `main` (V3, live at https://linkapitech.kerning.ooo)
**Spec:** `REDESIGN-V4.md` — authoritative. Part J is the running log of every decision made during the build; read it before touching anything.
**Status:** phases 0–9 committed and gate-green. **Phase 10 is all that remains.**

Production is untouched. `main` still serves the live site; nothing here has been deployed.

---

## 1. Do this first

**Next: Phase 10, the close-out** — see §5. Phases 8, 9a and 9b are committed and gate-green.

### The harness needs Node 22, or it lies to you

`WebSocket` only became a Node **global** in v22. This machine's node moved to **v20.20.2** between phases 9a and 9b, and every one of the seven CDP-driven gate steps — the a11y/contrast sweep, motion, WebGL, cascade, geometric layout, keyboard, reduced motion — died with a bare `ReferenceError: WebSocket is not defined` from line 1 of the driver, **before Chrome launched or a page loaded**. `gate.sh` duly printed seven hard failures that read exactly like seven real regressions across the whole site. It cost a full gate run to tell "the site is broken" from "the harness cannot start".

`scripts/qa/lib/cdp.mjs` now guards this at the chokepoint all eight probes share: if the global is missing it re-execs the entry point once with `--experimental-websocket` and propagates the exit code. Runtime-detected, so it vanishes on Node 22+ and survives a future Node dropping the flag; verified to still propagate `exit 3`, to propagate a throw as `exit 1`, and to pass argv through — without that last check every one of those seven steps would have gone **vacuously green**, which is worse than the failure it replaced.

### Two lessons carried from earlier phases

- Extending the pill observer to `footer .section-dark` made inner pages flip tone mid-trace, so Phase 3's `transition: color` became a non-composited animation on `/services`, `/connected-banking` and `/banks/axis`. `/` never showed it (dark hero at scroll 0). **Any new transition on chrome must be checked on an inner page, not just `/`.** Phase 9b widened the composited audit to 7 routes (adding `/about` and `/solutions`) for this reason.
- `RAIL_FROM/TO` and `TYPE_FROM/TO` had silently desynced. No gate assertion covers timing identity — it took reading the diff. They are now single-sourced as `SCRUB_FROM/TO` in `Terminal.tsx`. Note `/solutions`' `RAIL_FROM/TO` (0.32/0.72) is **not sampled**; the next phase to run a server against that section owes it the same measurement.

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

### Homepage — all 13 sections rebuilt
Hero, StatBand (now **dark**, Pools under the odometers), WhatWeDo (the Conduit "manifold" with sequentially lighting Nodes), Challenges (`.liq-sweep` cards, dim Nodes), Ecosystem, ProcessRail (pinned story + glass Ledger), CtaBand, footer pool. Phase 8 added the six light sections: WhyUs (vertical Conduit spine), LogoMarquee (Droplet trust line), ErpBand, WhoWeAre (`.liq-light` Vessel), Testimonials (`.liq-flat`, because `.card-depth` is a backdrop root — §A8), HomeFaq.

### Inner pages — all eight routes (Part G, phases 9a + 9b)
`PageHero.tsx` carries the dark/light tones, the Caustic, the Seam, the Meniscus and the optional Vessel-framed visual slot (`visualFrame={false}` for a visual that brings its own frame). `Card.tsx` plus the motif kit are applied across `/about`, `/services`, `/solutions`, `/connected-banking`, `/industries`, `/banks`, `/banks/[slug]` and `/contact`. Richest compositions: connected-banking's architecture diagram as a Conduit composition, industries' UI mocks in Vessels, /services' SVG service manifold (which replaced the isometric raster — no raster hero remains on the site), and /banks/[slug]'s ConnectionStack.

### The legacy vocabulary is retired (Phase 9b)
`.glass`, `.glass-1/-2/-3` and `.glass-strong` are now pure **aliases** inside the `.liq` recipe's own selector lists, so the old names and the V4 material are the same code and cannot drift; nothing renders them. `.sheen` is **deleted**, not aliased — it has no honest successor (Part J explains why `.liq-spec` would be a silent no-op on the cards it rode and why `.liq-sweep` cannot satisfy their ink). All `--glass-*` **tokens** stay: they are the AA-calibrated source the `--liq-*` fills alias.

### QA harness additions
`qa.mjs` gained an **ink-on-glass** rule enforcing §A6 (proven able to fail). `probe.mjs` went 16 → 22 assertions: draw ceiling, draws ≤ frames + 1, zero buffer uploads after settle, rAF p95, GPU timer — the last two **proven able to fail** by making the shader 512× heavier and by doubling draws. `layout.mjs` gained a lens-registration check (Δ = 0px) and is now a hard gate step. `contract.py` scans all imported stylesheets and strips comments before matching. Phase 9b took the composited audit from 5 routes to **7** (adding `/about` and `/solutions`, §1) and made `lib/cdp.mjs` survive a Node without a global `WebSocket` (§1) — the gate is 27 assertions with `--since` and pixdiff.

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
| `90670ca` | Ecosystem conduits, pinned ProcessRail with glass Ledger, CtaBand pool, footer pool, geometric sweep wired into the gate |
| `e8a7254` | **Phase 8** — the six light homepage sections |
| `0684fa4` | **Phase 9a** — inner-page grammar: `PageHero`, the Card language, connected-banking conduits, industries vessels |
| (see `git log`) | **`fix(qa)`** — `lib/cdp.mjs` re-execs with `--experimental-websocket` on a Node without the global (§1) |
| (see `git log`) | **Phase 9b** — the remaining six inner pages, the `.glass*`/`.sheen` retirement, §A8, and the four carried review findings |

---

## 4. Open findings

**Nothing from the Phase 6 or Phase 8 reviews is still open.** All of it landed in Phase 9b and is recorded in Part J: the `LIT_AT[i]` latent crash (now derived), text over Caustic cores at 4.00/4.27 (promoted to `--ink-inv`, with the arithmetic and why geometry cannot fix it), the Pool's stagger-blind `+120ms`, and `.pin-step` as a backdrop root (`liq-flat`). The Phase 9b review's own findings — three `light`-less Conduits, `NODE_POS`, `360 / 7`, the unpositioned `.glass*` aliases, two wrong blur-budget counts — are fixed in the same phase, also in Part J.

**Still genuinely open:**

1. **The hero shader costs ~5.5ms of GPU per frame on an integrated Intel GPU, against a 2ms budget.** `probe.mjs`'s `hardware GL: GPU time per frame < 2ms` FAILS on this machine: `n=60 min=5.377 median=5.507 p95=5.952ms` on *ANGLE Metal Renderer: Intel(R) UHD Graphics 630*, reproduced identically across two runs, one of them with nothing else on the machine.

   **This is not a regression and not contention — it is the first honest measurement.** The shipped figure the assertion was calibrated against (median **0.87ms**) was taken on an **M1 Max**, and `probe.mjs`'s own comment says so explicitly: *"An M1 Max median is a sanity bound only: it is NOT evidence for F1's integrated-GPU (Iris Xe / HD 4000) budget, which only a run on such a machine can give."* This is such a machine. `createHeroLiquid.ts` and `liquidShaders.ts` are untouched since phase 5 (`c87cfb5`), and phase 9b's only `HeroLens.tsx` change *omits* the WebGL layer for /about's compact variant, so `/`'s render is byte-identical — the cost has been there since the scene landed and no run until now could see it.

   For scale: 5.5ms is a third of a 60Hz frame's 16.7ms, on the GPU side, so it does not appear in TBT (`/` scores perf 93 / TBT 146ms) and every CPU-side rAF assertion passes (median 0.2–0.4ms). What it threatens is dropped frames while scrolling on integrated-GPU hardware, which is a large share of real visitors.

   **Do not silently relax the threshold to get a green gate.** The options are a genuine design call: lower the adaptive DPR floor (currently 1.0), shrink the canvas, cheapen the shader's fbm octave count, or gate the WebGL layer off below a measured GPU class the way it is already gated off on mobile and under reduced motion. Whichever is chosen, the assertion should then grow an integrated-GPU branch with its own *documented, measured* budget rather than one number for all hardware.

2. **StatBand numerals spill ~17px into the padding at 1024×800.** Cosmetic, measured in the Phase 6 review, never fixed. `layout.mjs` sweeps 1024×700 and does not flag it, so decide whether it is a defect or acceptable.
3. **`--lavender-400` affixes measure 3.90–4.42 on glass.** They pass legitimately, as **large** text (`.stat-num` is 700 weight at 21–41.6px, floor 3:1). Recorded because the number looks like a failure to anyone who greps for it, and because it does **not** transfer: `--lavender-400` is never a body-copy colour on glass.
4. **`@supports (backdrop-filter: url(#x))` was never verified false in Safari/Firefox.** If Safari parses-but-doesn't-render, gate `.liq-refract` behind a Chromium probe setting `html[data-refract]`.
5. **`/solutions`' `RAIL_FROM/TO` (0.32/0.72) is not sampled** — see §1.

**Carried, deliberately:**
- `.eco-wire` and `@keyframes ecoWire` have **no rendered call site** anywhere, but both stay in `globals.css` and `ecoWire` stays in `gate.sh`'s `ALLOWED_ANIM`: `contract.py` fails on orphan classes, not on dead rules, and retiring an allowlist entry is a gate change. **Phase 10 deletes both.** `conduitPulse` is then the only allowlist entry.
- The `.glass*` names survive as pure aliases of `.liq` (§A4's mapping) because `contract.py`'s B0 class contract lists `glass-1/2/3`. **Phase 10 may drop the names and that contract entry together.** No `.tsx` renders any of them.
- `public/illus/hub-isometric.webp` (41KB) has no call site since Phase 9a replaced it with the SVG manifold. Retained pending client sign-off; see the `CONTENT-TODO.md` row.
- `README.md` still describes the pre-V4 hero; docs are Phase 10.

---

## 5. Remaining phases

The method that has worked, per phase: **fresh implementer** (a task card naming every deliverable, the constraints, the exact verification to run and paste) → **fresh reviewer** (read-only, combined spec-compliance + quality) → **fix agent** → gate. Every phase ends `GATE PASSED` and one commit. Phases 7, 8, 9a and 9b each had a review that found something the gate could not see, so the reviewer is not optional.

**Phase 10 — close-out. The only phase left.**

1. **Regenerate `scripts/qa/baseline/`** — `pixdiff` exits 2 on any redesign by design, so the V3 baselines are meaningless now. Capture fresh ones with `shot.mjs` and eyeball them before blessing: a baseline captured from a broken build silently becomes the definition of correct.
2. **Run the FULL gate with pixdiff** (no `--skip-pixdiff`), which is the first run to include it since phase 0.
3. **Delete `.eco-wire`, `@keyframes ecoWire` and the `ecoWire` allowlist entry**; decide on the `.glass*` alias names and their `contract.py` entries.
4. **Docs:** `README.md` (still describes the pre-V4 hero), `CLAUDE.md`, `scripts/qa/README.md`. Reconcile the "24 checks" headline — `gate.sh` now reports **27** assertions with `--since` and pixdiff, 26 with `--skip-pixdiff`, 25 without `--since` (the header in `gate.sh` carries the current arithmetic).
5. **`CONTENT-TODO.md`** — add any new rows; the isometric-raster row needs a client decision.
6. **Vercel PREVIEW deploy** for owner review. Note from `CLAUDE.md`: Lighthouse must be measured on the **live domain**, because preview URLs are SSO-gated in a way that silently corrupts the SEO score.

**Production deploy is not part of this.** `vercel --prod --yes` from `linkapitech-site/` replaces a live client-facing site and needs an explicit go-ahead. Merging to `main` does not auto-deploy this project.

---

## 6. Gotchas that cost real time in this build

- **A `next dev` sharing `.next` with a production build corrupts it silently.** The desktop Browser pane kept restarting a `linkapitech-dev` preview on :3000 whose watcher recompiled into `.next`, so every chunk of the freshly built server 400'd and the sweeps ran against unstyled pages — while Lighthouse reported **perf 100 / TBT 0 / 0 allowlisted** (an unstyled page has nothing to audit; a too-perfect Lighthouse is a red flag, not a win). Fixed structurally in `5f4ca7a`: `next.config.ts` returns a phase-based `distDir`, so dev writes `.next-dev`. Still: check the three ports before any gate, and `preview_stop` **plus** closing the pane tab, or it comes back.
- **A subagent's foreground process dies when its turn ends.** A gate parked behind a wait was killed mid-sweep. Subagents must run the gate with `run_in_background: true` and poll from the foreground.
- **`\s` inside an untagged JS template literal reaches the page as `/s+/`** — it splits on the letter *s*. `qa.mjs`'s injected `AUDIT` string must double-escape.
- **`.gitignore` has no inline comments** — `pattern   # note` silently matches nothing.
- **`grep --include` does nothing on this machine** (grep is ugrep); use `git grep -- '*.tsx'` pathspecs. **zsh does not word-split unquoted `$VAR`** — use `while IFS= read -r`.
- **Never pipe `npm run build`** — SIGPIPE truncates it and leaves no BUILD_ID, which then looks like a server bug.
- **A check must be proven able to fail before its green is trusted.** Two probe assertions passed vacuously until forced to fail (a 512× heavier shader; doubled draws). The ink-on-glass rule was proven the same way, and so was phase 9b's `cdp.mjs` re-exec (it must propagate a non-zero exit, or seven steps go silently green).
- **A harness that cannot start looks exactly like a codebase that is broken.** Seven gate steps reported hard failures on a Node with no global `WebSocket` (§1). Read the first failure's actual output before believing its label: `✗ qa sweep findings` said nothing about findings, it said `ReferenceError` at `cdp.mjs:73`.
- **Nothing in the gate can see a motif that paints its own background invisibly.** A `Conduit` missing `light` on a near-white section is white-on-white: the contrast walk measures text, `layout.mjs` measures boxes, and neither looks at whether a decorative channel is visible. Phase 9b shipped two of these, one of them under a comment claiming it was fixed. **A comment asserting a fix is not a fix** — `git diff --numstat` on that file was `12 0`.
- **Measurements taken under load are not evidence.** A concurrent agent on the same machine was enough to produce a `ChunkLoadError` on a 350KB chunk that serves `200` perfectly (→ 0 GL draws → two dependent probe assertions failed), a GPU median of 5.46ms against a 2ms budget, and TBT 485ms on `/`. Re-run timing-sensitive steps with nothing else running before treating any of it as real.
- `motifs.css` classes that set `position: relative` (`.seam`, `.conduit`) out-rank a Tailwind `absolute` at equal specificity — they always need a positioning wrapper. Caustics need their own `absolute inset-0 overflow-hidden` clip box, and their `x`/`y` are **top-left**, not centre.
- Tailwind opacity modifiers do nothing on `var()` colours — every translucent needs an explicit token.

---

## 7. Handoff prompt

Paste this into a fresh session in `/Users/vibhaassingh/Downloads/Linkapitech`:

> Continue the V4 "Liquid Glass" redesign of the LinkAPI site. Read `linkapitech-site/HANDOFF-V4.md` first, then `linkapitech-site/REDESIGN-V4.md` (the authoritative spec — Part J is the running decision log, read it in full before editing).
>
> State: branch `redesign/liquid-glass-v4`. **Phases 0–9 are committed and gate-green** (`GATE PASSED`, `--since main --skip-pixdiff`). Only **Phase 10, the close-out**, remains — HANDOFF-V4.md §5 lists its six items in order. The short version: regenerate `scripts/qa/baseline/` and eyeball the captures before blessing them, run the **full** gate *with* pixdiff for the first time since phase 0, delete `.eco-wire`/`@keyframes ecoWire`/the `ecoWire` allowlist entry and decide on the `.glass*` alias names, update `README.md` / `CLAUDE.md` / `scripts/qa/README.md` (the "24 checks" headline is now **27** assertions), add the `CONTENT-TODO.md` rows, then ship a **Vercel preview** URL for owner review.
>
> Before any gate: verify ports 3000/3100/3411 are free, and check `node -v`. **The harness needs a global `WebSocket`** — `lib/cdp.mjs` re-execs with `--experimental-websocket` on Node 20/21, but if a step fails, read its real output before believing its label (§1, §6).
>
> Constraints that are not negotiable: animate transform/opacity/filter only; never put `filter` — or an animated `opacity`, a `mask`, or `mix-blend-mode` — on an ancestor of glass (§A8); respect the §A6 AA matrix and the §A7 blur budget; every string comes from `content/` (no invented facts — flag gaps `TODO: client to confirm` and add a `CONTENT-TODO.md` row); reduced motion everywhere; the gate green at the end. §6's gotchas each cost real debugging time.
>
> **Do not run `vercel --prod --yes`.** Production replaces a live client-facing site and is the owner's call.
