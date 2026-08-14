// Detect CSS animations that silently override an element's inline transform.
//
//   node scripts/qa/cascade.mjs [baseUrl]
//
// Why this exists, and why it is a static assertion rather than a screenshot:
//
// `.chip-float`'s keyframes set `transform`, and CSS animations outrank inline
// styles in the cascade. Any element carrying BOTH `.chip-float` and an inline
// translate() anchor silently loses the anchor. That shipped in two separate
// files — the Ecosystem chips (whose left column then grew INTO the hub) and the
// PartnerProgram chips (whose longest labels overhung their panel by 24-37px) —
// and two different agents found it independently while restructuring.
//
// It was invisible to the pixel-diff gate by construction: baselines are
// captured with --force-prefers-reduced-motion, which cancels the animation, so
// the inline anchor applies and the baseline looks correct. Diffing a
// motion-enabled capture instead would be far too noisy to gate on, since the
// floats never settle. Checking the cascade directly is deterministic.
import { session, reporter } from "./lib/cdp.mjs";

const BASE = process.argv[2] ?? "http://localhost:3411";
const R = reporter("cascade conflicts");
const ROUTES = ["/", "/about", "/services", "/solutions", "/connected-banking",
                "/industries", "/contact", "/banks", "/banks/axis"];

const CHECK = `(() => {
  const conflicts = [];
  // Properties whose animation would clobber an inline declaration of the same
  // property. transform/translate/rotate/scale are the ones used for layout
  // anchoring here.
  const RISKY = ['transform', 'translate', 'rotate', 'scale'];

  for (const anim of document.getAnimations()) {
    const el = anim.effect && anim.effect.target;
    if (!el || el.nodeType !== 1) continue;

    // CSS TRANSITIONS are excluded, and that is not a loophole. A transition on
    // transform is DRIVEN BY the inline value changing — it interpolates toward
    // it — so reporting it as "clobbering" that value is backwards. Including
    // them also made this check flaky: whether a transition is mid-flight when
    // the page is sampled depends on scroll timing, so it flagged an innocent
    // trust pill on '/' in one run and passed the same page in the next.
    // Only @keyframes animations can outrank an inline style for the whole time
    // they run, which is the actual bug being hunted.
    if (typeof anim.transitionProperty === "string") continue;

    let frames = [];
    try { frames = anim.effect.getKeyframes() || []; } catch { continue; }

    const animated = new Set();
    for (const f of frames) for (const k of Object.keys(f)) {
      if (RISKY.includes(k)) animated.add(k);
    }
    if (!animated.size) continue;

    for (const prop of animated) {
      const inline = el.style.getPropertyValue(prop);
      if (!inline) continue;
      // 'none' is the property's own default — there is no positional anchor to
      // lose, so an animation covering it costs nothing.
      if (inline.trim() === "none") continue;
      // An inline value on the same property the animation drives: while the
      // animation runs, the inline declaration has no effect.
      conflicts.push({
        prop,
        inline: inline.slice(0, 40),
        animation: anim.animationName || '(script)',
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 64),
        text: (el.textContent || '').trim().slice(0, 30),
      });
    }
  }
  return conflicts;
})()`;

for (const route of ROUTES) {
  const s = await session({ w: 1440, h: 900 });
  await s.goto(BASE + route, 5000);
  // Nudge lazily-started animations into existence before asking.
  await s.wheel(500, { steps: 6 });
  const conflicts = await s.evalJs(CHECK);
  R.ok(
    `${route}: no animation overrides an inline transform`,
    Array.isArray(conflicts) && conflicts.length === 0,
    conflicts && conflicts.length
      ? conflicts.map((c) => `${c.animation} clobbers inline ${c.prop}="${c.inline}" on <${c.tag} class="${c.cls}">`).join(" | ").slice(0, 300)
      : "",
  );
  s.close();
}

R.finish();
