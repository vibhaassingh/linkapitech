# QA harness

Verification scripts that drive headless Chrome over the DevTools protocol.
**No npm dependencies** — they need only a Chrome binary (override the path with
`CHROME_BIN`). Every script exits non-zero when a check fails, so they can gate
CI directly.

All of them expect a **production** server (`npm run build && PORT=3411 npm start`),
not the dev server: the dev server serves stale Tailwind CSS after a config
change, which has produced false results before.

> Never `rm -rf .next` while a server is running on it — it kills the server.

| Script | What it proves |
|---|---|
| `qa.mjs [base]` | Sweeps every page × 4 viewports (390/768/1024/1440) for **AA contrast** (computed against the resolved effective background), **horizontal overflow** (with the offending elements named), **heading order**, and **target size** (WCAG 2.2 SC 2.5.8, 24px). |
| `motion.mjs [base]` | Scroll-driven animations track Lenis-smoothed scroll; they collapse to their final state under `prefers-reduced-motion`; no long task >50ms while scrubbing at 4× CPU; INP proxy <200ms. |
| `probe.mjs [base]` | WebGL hero layer: boots and fades in on desktop, stays dormant <1024px and under reduced motion, `three` arrives as a lazy chunk, magnetic hover applies and releases, scene halts when hidden/off-screen. |
| `kbd1.mjs` | Keyboard walk, focus ring, skip link, carousel controls, and the mobile-menu dialog suite (opens, locks body scroll, moves focus in, Esc closes, focus restored). |
| `kbd2.mjs` | Reduced-motion pass across every page. |
| `shot.mjs <url> <out> [width] [rm]` | Full-page screenshot. Used to refresh `baseline/` and to pixel-diff after a change. |

## Two lessons encoded here

1. **A run that asserts nothing is a failed run.** `reporter()` in `lib/cdp.mjs`
   exits 2 when no assertion executed — an earlier link audit reported "all
   links resolve" against zero successfully loaded pages.
2. **Measure the thing, not a proxy for it.** To prove the WebGL scene pauses,
   count **GL draw calls** (`drawArrays`), not rAF callbacks: Lenis keeps its own
   rAF loop running permanently by design, so a global frame count shows ~25
   frames/500ms while the scene is correctly stopped.

Also: a failing assertion is sometimes the *test's* bug. `MobileMenu` keeps its
dialog mounted with `hidden={!open}`, so asserting the node had left the DOM was
wrong while the component was right.

## Baselines

`baseline/` holds pre-change full-page captures used for pixel-diffing a design
change. Refresh with `shot.mjs` when an intended visual change lands, and treat
every diff as something to explain rather than accept.

## Note on duplication

`qa.mjs`, `probe.mjs`, `kbd1.mjs`, `kbd2.mjs` and `shot.mjs` each embed their own
copy of the CDP plumbing. They are verified as-is and deliberately left alone;
`lib/cdp.mjs` is the shared driver for anything new (`motion.mjs` uses it).
