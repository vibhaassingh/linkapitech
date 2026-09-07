// Geometric layout-defect sweep: the classes of breakage that contrast,
// heading-order and horizontal-overflow checks are all blind to.
//
//   node scripts/qa/layout.mjs [baseUrl]
//
// Why this exists as its own pass. The /connected-banking hero rendered as a
// pile of overlapping labels on the live site for weeks, through a gate with 24
// green checks. Nothing caught it, because nothing was looking at GEOMETRY:
// the document never overflowed (the pile was absolutely positioned), no text
// spilled its own parent (the parent was 0x0, so nothing could), contrast was
// fine, and the pixel gate compared a broken capture to an equally broken
// baseline and correctly called them identical.
//
// Every check here is deliberately conservative — today's lesson, repeatedly,
// was that a check firing on something innocent is worse than no check, because
// it trains you to ignore it. Each one skips the legitimate patterns it would
// otherwise trip on, and those exemptions are named.
import { session, reporter, sleep } from "./lib/cdp.mjs";

const BASE = process.argv[2] ?? "http://localhost:3411";
const PAGES = ["/", "/about", "/services", "/solutions", "/connected-banking", "/bank-plugin",
  "/axisbank-lp", "/hsbc-lp", "/indusind-lp",
  "/industries", "/contact", "/privacy", "/terms",
  "/banks", "/banks/axis", "/banks/indusind", "/banks/hsbc"];
// 1024×700 is NARROW-DESKTOP-SHORT, and it is here because nothing else
// reaches it: `.pin` and the whole pinned ProcessRail stage exist only at
// ≥1024, so at 1024 they are at their narrowest — the left column plus the
// glass Ledger against a `height: 100vh` sticky stage — and 700px is the
// shortest viewport that combination has to survive. The four viewports above
// miss it from both sides (768 is below the breakpoint, 1280/1440 are wide and
// 900 tall), so the pin was never swept at the size where it is tightest.
const VIEWPORTS = [
  { w: 390, h: 844, name: "mobile", mobile: true },
  { w: 768, h: 1024, name: "tablet", mobile: false },
  { w: 1024, h: 700, name: "narrow-short", mobile: false },
  { w: 1280, h: 900, name: "laptop", mobile: false },
  { w: 1440, h: 900, name: "desktop", mobile: false },
];

const AUDIT = `(() => {
  const out = { collapsed: [], zeroMedia: [], textOverlap: [], clipped: [], offCanvas: [], tinyText: [] };

  const rect = (el) => el.getBoundingClientRect();
  const cs = (el) => getComputedStyle(el);
  const painted = (el) => {
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    if (parseFloat(s.opacity) === 0) return false;
    return true;
  };
  // Deliberately off-screen patterns that must never be reported.
  const intentionallyHidden = (el) =>
    !!el.closest('.sr-only, [hidden], [aria-hidden="true"], dialog:not([open])') ||
    /(^|\\s)sr-only(\\s|$)/.test(el.className || '') ||
    cs(el).clipPath === 'inset(50%)';
  const label = (el) => ({
    tag: el.tagName,
    cls: (el.className || '').toString().slice(0, 62),
    txt: (el.textContent || '').trim().slice(0, 34),
  });

  const all = [...document.querySelectorAll('body *')];

  // ---- 1. collapsed container: 0x0 box whose subtree still paints ----
  for (const el of all) {
    if (!el.children.length || !painted(el) || intentionallyHidden(el)) continue;
    const r = rect(el);
    if (r.width > 0.5 || r.height > 0.5) continue;
    let child = null;
    for (const d of el.querySelectorAll('*')) {
      const dr = rect(d);
      if (dr.width > 2 && dr.height > 2) { child = { d, dr }; break; }
    }
    if (child) out.collapsed.push({ ...label(el), child: child.d.tagName,
      childBox: Math.round(child.dr.width) + 'x' + Math.round(child.dr.height) });
  }

  // ---- 2. media that LOADED but renders at zero size ----
  // The load state matters, and conflating the two wasted a lot of time: an
  // unloaded lazy image below the fold is 0x0 and perfectly correct, whereas an
  // image that has decoded and STILL measures 0x0 is invisible to the user.
  // Only the second is a defect. Real instance: hsbc.svg carries only a viewBox
  // and no intrinsic width, so as a flex item its automatic minimum size was 0
  // and the mark vanished from the related-banks row on two pages.
  for (const el of all) {
    if (!['IMG', 'SVG', 'CANVAS', 'VIDEO'].includes(el.tagName)) continue;
    if (!painted(el) || intentionallyHidden(el)) continue;
    const r = rect(el);
    if (r.width > 0.5 && r.height > 0.5) continue;
    if (el.tagName === 'IMG') {
      if (!el.getAttribute('src')) continue;
      // Not yet fetched => not yet a defect. Say so rather than guessing.
      if (!(el.complete && el.naturalWidth > 0)) continue;
    }
    out.zeroMedia.push({ ...label(el),
      box: Math.round(r.width) + 'x' + Math.round(r.height),
      natural: el.naturalWidth ? el.naturalWidth + 'x' + el.naturalHeight : 'n/a' });
  }

  // ---- 3. text visibly overlapping other text ----
  // The symptom a human notices first. Restricted to LEAF text elements that
  // paint their own glyphs, ignoring ancestor/descendant pairs (which overlap by
  // definition) and anything in a deliberately stacked context.
  // A box intersection is NOT a visual collision. Two things break that naive
  // assumption here, and between them they produced 287 phantom findings:
  //
  //   the footer curtain — SiteFooter is position:sticky BEHIND <main>, so its
  //   rect intersects main's content for the entire page. Geometrically every
  //   footer link overlaps every paragraph; visually main's opaque background
  //   covers it completely.
  //
  //   the testimonial carousel — off-screen slides sit at x=425..913 in a 390px
  //   viewport, clipped by their track.
  //
  // Both are answered by asking the browser what actually PAINTS at a point.
  // An element is only considered if hit-testing at its own centre returns it
  // (or something inside it); anything occluded or off-canvas drops out.
  // Requiring both boxes to hit-test visible does NOT work: in a real collision
  // the covered text is occluded BY the text on top of it, so it fails that test
  // and the very defect being hunted disappears (verified — the covered side
  // reports visible:false). Relaxing to "either one visible" brings the curtain
  // back, since the hero text above it is perfectly visible.
  //
  // The distinction that actually matters is whether an OPAQUE layer separates
  // them. Two texts stacked directly on each other collide; two texts with
  // main's opaque background in between do not. elementsFromPoint gives the full
  // paint stack at a point, so walk between them and look for an opaque layer.
  // "Does this layer hide what is behind it?" Two ways to qualify:
  //
  //   an opaque FILL — alpha >= 0.99, the original test; or
  //   FROST plus a substantial fill — a \`backdrop-filter\` other than \`none\`
  //   AND its own fill at alpha >= 0.7.
  //
  // The second clause is the frosted-chrome case (V4 phase 7, narrowed in its
  // review). The pill nav is \`position: fixed\` with \`backdrop-filter:
  // blur(18px)\` and a fill of \`rgba(37,13,41,.78)\` (dark) or white at .78
  // (light): DESIGNED to float over the page, and what it covers is frosted
  // rather than legible. Under the 0.99 bar, correctly — a translucent fill
  // ALONE would let glyphs through — so what actually hides them is the frost,
  // which \`backgroundColor\` cannot see. Its wordmark therefore geometrically
  // overlapped every text run that scrolls beneath it, on every route, at some
  // scroll position, and that was the large majority of this sweep's standing
  // findings.
  //
  // WHY THIS RATHER THAN A MEMBERSHIP TEST. The first version of the fix was a
  // \`frostedFixedLayer()\` predicate applied BEFORE \`collide()\`: skip the pair
  // if exactly one side is inside a fixed+frosted layer. That decided on
  // MEMBERSHIP in such a layer, never on whether the layer is actually ABOVE
  // the other text at the sampled point — so a frosted fixed panel sitting
  // BEHIND content would have silenced a real pile. Teaching \`opaque()\`
  // instead puts the same knowledge inside the existing between-the-two
  // hit-stack walk, which supplies the occlusion proof for free: the frosted
  // layer only counts when it lies BETWEEN the two runs in
  // \`elementsFromPoint\`'s order, i.e. over the lower one. Content-vs-content
  // pairs are untouched by construction (no frost, no exemption), and two runs
  // inside the SAME frosted layer still report, because the layer is then not
  // between them.
  //
  // The 0.7 floor is empirical and deliberately high: every frosted surface in
  // this design that carries a fill heavy enough to obscure text is at .78
  // (the pill in both tones, \`.ledger\`). The \`.liq\` glass tiers, whose fills
  // run .06–.22, do NOT qualify — a card that faint really would let text
  // through, and the check should say so.
  const occludes = (el) => {
    const s = cs(el);
    const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(',').map(Number);
    const a = parts.length > 3 ? parts[3] : 1;
    if (a >= 0.99) return true;
    return a >= 0.7 && !!s.backdropFilter && s.backdropFilter !== 'none';
  };
  // THERE IS NO SEPARATE FOOTER-CURTAIN EXEMPTION, and there was: a
  // curtain-descendant × \`.chrome-main\`-descendant skip, applied before
  // \`collide()\`. \`footer.chrome-curtain\` is \`sticky; bottom: 0\` BEHIND
  // \`main.chrome-main\` (chrome.css §3), so for the whole page its rect
  // intersects main's content and every footer link geometrically overlaps
  // every paragraph — but the walk below already answers that on its own,
  // because \`.chrome-main\` sets \`background: var(--canvas)\`, an opaque colour,
  // and lands between the two in the hit stack. Its own comment conceded the
  // redundancy and called itself a belt to that brace.
  //
  // A redundant exemption only ever FIRES when the reasoning behind it has
  // failed. If \`.chrome-main\` ever stops being opaque, footer text showing
  // through mid-page is a real defect, this sweep is the only automated thing
  // that would catch it, and an unconditional skip on membership would silence
  // it — in the very phase that made the footer dark. Deleted rather than
  // conditioned on \`opaque('.chrome-main')\`: the sweep reports 0 without it,
  // so the brace holds and the belt was never load-bearing.
  const collide = (a, b, x, y) => {
    if (x < 0 || y < 0 || x > document.documentElement.clientWidth || y > window.innerHeight) return false;
    const stack = document.elementsFromPoint(x, y);
    // "painted here" means the hit entry IS the element or sits inside it —
    // ancestors do not count, or <body> would match everything.
    const idx = (t) => stack.findIndex((e) => e === t || t.contains(e));
    const ia = idx(a), ib = idx(b);
    if (ia < 0 || ib < 0) return false;
    const lo = Math.min(ia, ib), hi = Math.max(ia, ib);
    for (let k = lo + 1; k < hi; k++) if (occludes(stack[k])) return false;
    return true;
  };

  const leaves = all.filter((el) => {
    if (!painted(el) || intentionallyHidden(el)) return false;
    if (['SCRIPT','STYLE','SVG','PATH','CANVAS','IFRAME','NOSCRIPT','BR'].includes(el.tagName)) return false;
    if (el.closest('svg')) return false;
    const t = (el.textContent || '').trim();
    if (t.length < 2) return false;
    // direct text only — containers would double-count
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)) return false;
    const r = rect(el);
    return r.width > 4 && r.height > 4;
  });
  const related = (a, b) => a.contains(b) || b.contains(a);
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i], b = leaves[j];
      if (related(a, b)) continue;
      const ra = rect(a), rb = rect(b);
      const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (ox <= 2 || oy <= 2) continue;
      const overlap = ox * oy;
      const smaller = Math.min(ra.width * ra.height, rb.width * rb.height);
      // A real collision covers most of the smaller box. Decorative near-misses
      // and 1-2px kerning touches are not defects.
      if (overlap / smaller < 0.55) continue;
      // Deliberate stacking: a carousel/marquee/absolute overlay legitimately
      // layers text, and a hover/expand surface sits over its trigger.
      if (a.closest('[data-carousel], .marquee, [role="tablist"], details, summary')) continue;
      if (b.closest('[data-carousel], .marquee, [role="tablist"], details, summary')) continue;
      // Final gate, and the ONLY exemption that is not about deliberate
      // stacking: are they really stacked on each other, with nothing that
      // occludes between them? Sampled at the centre of the intersection. The
      // frosted pill and the opaque page are both answered here, by proven
      // occlusion rather than by membership — see \`occludes()\`.
      const cx = (Math.max(ra.left, rb.left) + Math.min(ra.right, rb.right)) / 2;
      const cy = (Math.max(ra.top, rb.top) + Math.min(ra.bottom, rb.bottom)) / 2;
      if (!collide(a, b, cx, cy)) continue;
      out.textOverlap.push({ a: label(a), b: label(b), coverPct: Math.round(100 * overlap / smaller),
                             atY: Math.round(window.scrollY) });
      if (out.textOverlap.length > 12) break;
    }
    if (out.textOverlap.length > 12) break;
  }

  // ---- 4. text clipped by an overflow:hidden ancestor ----
  for (const el of leaves) {
    let p = el.parentElement;
    for (let d = 0; p && d < 4; d++, p = p.parentElement) {
      const ps = cs(p);
      // A scrollable box is not a clipping box — its content is reachable.
      if (['auto','scroll'].includes(ps.overflowX) || ['auto','scroll'].includes(ps.overflowY)) break;
      const hidesY = ps.overflowY === 'hidden' || ps.overflow === 'hidden';
      const hidesX = ps.overflowX === 'hidden' || ps.overflow === 'hidden';
      if (!hidesY && !hidesX) continue;
      const pr = rect(p), r = rect(el);
      if (pr.height < 2 || pr.width < 2) break;
      const cutY = hidesY ? Math.max(0, r.bottom - pr.bottom, pr.top - r.top) : 0;
      const cutX = hidesX ? Math.max(0, r.right - pr.right, pr.left - r.left) : 0;
      // >4px of a text box lost to a clipping ancestor is a real cut, not
      // sub-pixel rounding or an intentional fade edge.
      if (cutY > 4 || cutX > 4) {
        out.clipped.push({ ...label(el), by: Math.round(Math.max(cutY, cutX)),
          clipper: (p.className || '').toString().slice(0, 50) });
      }
      break;
    }
  }

  // ---- 5. painted content sitting outside the canvas ----
  // Content parked outside the viewport is normal inside a carousel/marquee
  // track — that is what the track is for. Only report text that is off-canvas
  // with NO clipping or scrolling ancestor to explain it.
  const vw = document.documentElement.clientWidth;
  for (const el of leaves) {
    const r = rect(el);
    if (r.right >= 1 && r.left <= vw - 1) continue;
    let p = el.parentElement, tracked = false;
    for (let d = 0; p && d < 6; d++, p = p.parentElement) {
      const ps = cs(p);
      if (['auto','scroll','hidden'].includes(ps.overflowX) || ['auto','scroll','hidden'].includes(ps.overflow)) { tracked = true; break; }
    }
    if (tracked) continue;
    out.offCanvas.push({ ...label(el), left: Math.round(r.left), right: Math.round(r.right), vw });
  }

  // ---- 6. text rendering at an unreadable size ----
  for (const el of leaves) {
    const size = parseFloat(cs(el).fontSize);
    if (size > 0 && size < 10) out.tinyText.push({ ...label(el), size });
  }

  return out;
})()`;

// ---- hero lens registration (REDESIGN-V4 Part F, F7) ----
// The WebGL canvas and the SVG poster share one wrapper and one 500×400
// coordinate space: the shader letterboxes its frustum ("meet") exactly as the
// SVG's xMidYMid meet does, so at uWake = 0 they must be the same picture.
// This checks the geometric half of that promise from the DOM: map the body
// <ellipse>'s own cx/cy/rx/ry through the canvas rect's letterbox and compare
// with where the browser actually painted the ellipse. The ellipse carries
// `data-lens-body` (HeroLens.tsx) so the selector cannot drift onto the
// clipPath's or the rim's ellipse. A 1px tolerance covers sub-pixel rounding
// of the rect; a wrong viewBox, a stretched canvas or a lost `inset-0` would
// miss by tens of px.
const LENS_REGISTRATION = `(() => {
  const body = document.querySelector('.hero-lens [data-lens-body]');
  const canvas = document.querySelector('.hero-lens canvas');
  if (!body || !canvas) return { missing: !body ? 'svg [data-lens-body]' : 'hero canvas' };
  const svg = body.ownerSVGElement;
  const vb = (svg.getAttribute('viewBox') || '').split(/\\s+/).map(Number);
  if (vb.length !== 4 || vb.some(Number.isNaN)) return { missing: 'svg viewBox' };
  const [, , VW, VH] = vb;
  const ex = +body.getAttribute('cx'), ey = +body.getAttribute('cy');
  const erx = +body.getAttribute('rx'), ery = +body.getAttribute('ry');
  const c = canvas.getBoundingClientRect(), b = body.getBoundingClientRect();
  const s = Math.min(c.width / VW, c.height / VH);                 // px per viewBox unit ("meet")
  const ox = c.left + (c.width - VW * s) / 2, oy = c.top + (c.height - VH * s) / 2;
  const exp = { cx: ox + ex * s, cy: oy + ey * s, w: 2 * erx * s, h: 2 * ery * s };
  const got = { cx: b.left + b.width / 2, cy: b.top + b.height / 2, w: b.width, h: b.height };
  const d = {};
  for (const k of Object.keys(exp)) d[k] = +(got[k] - exp[k]).toFixed(2);
  return { canvas: Math.round(c.width) + 'x' + Math.round(c.height), viewBox: VW + 'x' + VH,
           d, max: Math.max(...Object.values(d).map(Math.abs)) };
})()`;

const R = reporter("layout defects");
const found = { collapsed: [], zeroMedia: [], textOverlap: [], clipped: [], offCanvas: [], tinyText: [] };
let audited = 0;
let lensReg = null;

for (const vp of VIEWPORTS) {
  const s = await session({ w: vp.w, h: vp.h, mobile: vp.mobile, gl: true, base: BASE });
  for (const p of PAGES) {
    await s.goto(p);
    const loaded = await s.evalJs(
      `(() => ({ main: !!document.querySelector('main'), text: (document.body.innerText||'').trim().length }))()`,
    );
    if (!loaded?.main || loaded.text < 400) {
      console.error(`ABORT: ${p} @${vp.name} did not load — ${JSON.stringify(loaded)}`);
      s.close();
      process.exit(2);
    }
    // Measured at scroll 0, before the wheel steps below move the parallax
    // wrapper (canvas and SVG move together, but the numbers read cleaner here).
    if (p === "/" && vp.w === 1440) lensReg = await s.evalJs(LENS_REGISTRATION);
    // The overlap check hit-tests, and hit-testing only works on what is
    // currently ON SCREEN. Running it once would therefore audit the first
    // viewport and silently ignore the rest of the page — trading the 287 false
    // positives for a far worse blind spot. So step down the page and re-run at
    // each position, which is also how a person would find these.
    //
    // Scrolling is driven by real wheel events, not window.scrollTo: Lenis owns
    // scroll on the marketing route and overwrites programmatic jumps.
    let a = await s.evalJs(AUDIT);
    audited++;
    for (const k of Object.keys(found)) {
      for (const item of a[k] || []) found[k].push({ vp: vp.name, page: p, ...item });
    }
    let lastY = -1, steps = 0;
    for (;;) {
      await s.wheel(Math.round(vp.h * 0.85), { steps: 6 });
      await sleep(450);
      const y = await s.scrollTop();
      // Stop when the page stops moving (bottom reached) or after a sane cap.
      if (y <= lastY + 4 || steps++ > 16) break;
      lastY = y;
      const more = await s.evalJs(AUDIT);
      for (const item of more.textOverlap || []) found.textOverlap.push({ vp: vp.name, page: p, ...item });
    }
    // Navigation resets scroll for the next page, so no need to rewind here.
  }
  s.close();
  console.log(`swept ${vp.name} (${vp.w}px)`);
}

const uniq = (rows, key) => {
  const m = new Map();
  for (const r of rows) {
    const k = key(r);
    if (!m.has(k)) m.set(k, { ...r, vps: [] });
    m.get(k).vps.push(r.vp);
  }
  return [...m.values()];
};

const groups = [
  ["collapsed containers (0x0 box, subtree still paints)", uniq(found.collapsed, (x) => x.page + x.cls + x.child),
    (x) => `${x.page} <${x.tag} class="${x.cls}"> -> ${x.child} ${x.childBox}`],
  ["media loaded but rendering at zero size", uniq(found.zeroMedia, (x) => x.page + x.cls + x.tag),
    (x) => `${x.page} <${x.tag}> box=${x.box} natural=${x.natural} cls=${x.cls}`],
  // The element labels are printed, not just the two strings: the standing
  // "LinkAPI Tech" findings were recorded in REDESIGN-V4 Part J as the footer
  // curtain's heading for two phases, when they were the fixed pill nav's
  // wordmark. Both render the same text, the dedup key is page+textA+textB, and
  // the report gave a reader nothing else to tell them apart.
  ["text overlapping text", uniq(found.textOverlap, (x) => x.page + x.a.txt + x.b.txt),
    (x) => `${x.page} "${x.a.txt}" <${x.a.tag}.${x.a.cls}> x "${x.b.txt}" <${x.b.tag}.${x.b.cls}> (${x.coverPct}% of the smaller box)`],
  ["text clipped by an overflow:hidden ancestor", uniq(found.clipped, (x) => x.page + x.cls + x.txt),
    (x) => `${x.page} <${x.tag}> cut ${x.by}px "${x.txt}" by .${x.clipper}`],
  ["painted text outside the canvas", uniq(found.offCanvas, (x) => x.page + x.txt),
    (x) => `${x.page} "${x.txt}" left=${x.left} right=${x.right} vw=${x.vw}`],
  ["text under 10px", uniq(found.tinyText, (x) => x.page + x.cls + x.txt),
    (x) => `${x.page} ${x.size}px "${x.txt}" cls=${x.cls}`],
];

console.log(`\n=== layout sweep over ${audited} page-views ===`);
let total = 0;
for (const [name, rows, fmt] of groups) {
  console.log(`\n${name.toUpperCase()}: ${rows.length}`);
  for (const r of rows.slice(0, 14)) console.log(`  ${fmt(r)}  [${[...new Set(r.vps)].join(",")}]`);
  total += rows.length;
}

R.ok(`audited ${audited} page-views`, audited === PAGES.length * VIEWPORTS.length, `${audited}`);
for (const [name, rows] of groups) R.ok(`no ${name}`, rows.length === 0, `${rows.length}`);
R.ok(
  "hero lens registers with its WebGL canvas (SVG body ellipse == canvas letterbox, ≤ 1px) @1440",
  !!lensReg && !lensReg.missing && lensReg.max <= 1,
  lensReg
    ? lensReg.missing
      ? `missing ${lensReg.missing}`
      : `canvas ${lensReg.canvas} viewBox ${lensReg.viewBox} Δ(cx,cy,w,h)=${JSON.stringify(lensReg.d)} max=${lensReg.max}px`
    : "not measured",
);
R.finish();
