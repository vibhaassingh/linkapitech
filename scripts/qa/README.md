# QA harness

Verification scripts that drive headless Chrome over the DevTools protocol.
**No npm dependencies** — they need only a Chrome binary (override the path with
`CHROME_BIN`). Every script exits non-zero when a check fails, so they can gate
CI directly.

**They do need a global `WebSocket`, i.e. Node 22+.** On Node 20/21 it exists
only behind `--experimental-websocket`, and since that flag can only be set at
process start, `lib/cdp.mjs` re-execs its own entry point once with it and
propagates the exit code. Runtime-detected, so it disappears on Node 22+.
Without the guard every CDP-driven script dies on line 1 with
`ReferenceError: WebSocket is not defined`, **before Chrome launches or a page
loads**, and `gate.sh` reports seven hard failures that read exactly like seven
real regressions across the site.

**Kill stray Chromes between runs.** A timed-out or killed script leaves its
Chrome alive. Eight leaked instances made `layout.mjs` hang for 45s on
`Input.dispatchMouseEvent` and fail the gate; the identical sweep passed 8/8
once they were killed. `ps ax | grep -c '[C]hrome'` before believing a CDP
failure, and `rm -rf /tmp/cdp-qa-*` to clear their profiles.

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
| `cascade.mjs [base]` | No CSS animation silently overrides an element's inline `transform` (the failure that made a scrubbed drift cancel a call site's own positioning). |
| `layout.mjs [base]` | Geometry over every page × 5 viewports: collapsed 0×0 boxes whose subtree still paints, media loaded but rendering at zero size, text overlapping text, text clipped by an `overflow:hidden` ancestor, painted text outside the canvas, sub-10px text, and the hero lens registering with its WebGL canvas to within 1px. |
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
wrong while the component was right. Two more of the same family, both from V4
phase 9b: seven steps "failed" because the harness could not start (no global
`WebSocket`), and the layout sweep "failed" because eight leaked Chromes were
wedging each other. Neither was a defect in the site.

3. **A check must be proven able to fail before its green is trusted.** Two
   `probe.mjs` assertions passed vacuously until forced to fail (a 512× heavier
   shader; doubled draws), and `lib/cdp.mjs`'s re-exec was verified to
   propagate `exit 3` as 3 and a throw as 1 — without that, seven gate steps
   would have gone silently green.
4. **A threshold is only as good as the hardware it was calibrated on.**
   `probe.mjs`'s 2ms GPU budget came from an M1 Max; the same shader measures
   ~5.5ms on an integrated Intel GPU. The assertion has one number for all
   hardware, which is why it took until phase 9b to surface. See
   `HANDOFF-V4.md` §4 finding 1.

## Baselines

`baseline/` holds pre-change full-page captures used for pixel-diffing a design
change. Refresh with `shot.mjs` when an intended visual change lands, and treat
every diff as something to explain rather than accept.

## Note on duplication

`qa.mjs`, `probe.mjs`, `kbd1.mjs`, `kbd2.mjs` and `shot.mjs` each embed their own
copy of the CDP plumbing. They are verified as-is and deliberately left alone;
`lib/cdp.mjs` is the shared driver for anything new (`motion.mjs` uses it).
