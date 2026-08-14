// Phase-7 QA sweep over raw CDP: contrast, overflow, focus visibility,
// heading order, touch targets — across every page and viewport.
// usage: node qa.mjs [baseUrl]
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3411";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PAGES = ["/", "/about", "/services", "/solutions", "/connected-banking",
  "/industries", "/contact", "/privacy", "/terms",
  "/banks", "/banks/axis", "/banks/indusind", "/banks/hsbc"];
const VIEWPORTS = [
  { w: 390, h: 844, name: "mobile", mobile: true },
  { w: 768, h: 1024, name: "tablet", mobile: false },
  { w: 1024, h: 800, name: "laptop", mobile: false },
  { w: 1440, h: 900, name: "desktop", mobile: false },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- the in-page audit ---------------------------------------------------
const AUDIT = `(() => {
  const out = { contrast: [], overflow: null, focus: [], headings: [], targets: [], gradientText: [], textSpill: [], collapsed: [] };

  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({r,g,b}) => {
    const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
  };
  const over = (fg, bg) => {
    // composite fg over bg by alpha
    const a = fg.a;
    return { r: fg.r*a + bg.r*(1-a), g: fg.g*a + bg.g*(1-a), b: fg.b*a + bg.b*(1-a), a: 1 };
  };

  // Pull every colour stop out of a background-image gradient. Computed style
  // resolves var() for us, so the stops arrive as rgb()/rgba() literals.
  // Bitmap images stay unmeasurable (returned as {image:true}).
  const stopsOf = (bgImage) => {
    if (/url[(]/.test(bgImage)) return null;
    const found = bgImage.match(/rgba?[(][^)]+[)]/g) || [];
    const stops = found.map(parse).filter(c => c && c.a > 0.02);
    return stops.length ? stops : null;
  };

  // Effective background. Skipping gradients entirely is how a 3.91:1 pairing
  // survived an earlier "zero contrast failures" run, so they are walked.
  //
  // The previous version resolved "what sits behind a translucent layer" by
  // walking ancestors for an opaque backgroundCOLOR only. A gradient section has
  // backgroundColor: transparent, so that walk sailed straight past
  // .section-dark's dark plum and landed on main's near-white — then composited
  // .glass-strong's white sheen over WHITE and reported white-on-white at
  // 1.05:1. Eleven such phantom failures, on chips that are plainly white on
  // dark plum. A gradient is a paint layer like any other and has to be walked
  // as one.
  //
  // So: collect every translucent layer between the text and the first OPAQUE
  // layer (an opaque colour, or a gradient whose stops are opaque), then
  // composite. A layer with several stops branches, because text may sit over
  // any of them; the caller scores the worst branch. Branches are capped so a
  // deep stack cannot blow up.
  const bgOf = (el) => {
    const layers = [];           // nearest-first, each an array of colour stops
    let node = el;
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      const img = cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : null;
      if (img) {
        if (/url[(]/.test(img)) return { image: true, node };
        const stops = stopsOf(img);
        if (stops) {
          const opaque = stops.filter(c => c.a >= 0.999);
          // An opaque gradient terminates the walk: it is the base.
          if (opaque.length) return { bases: opaque, layers };
          layers.push(stops);
        }
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        if (c.a >= 0.999) return { bases: [c], layers };
        layers.push([c]);
      }
      node = node.parentElement;
    }
    return { bases: [{ r: 255, g: 255, b: 255, a: 1 }], layers };
  };

  // Flatten bgOf's layer stack into the set of effective opaque backgrounds the
  // text can actually sit on. Composites from the base upward.
  const effectiveBgs = (bg) => {
    let set = bg.bases.slice();
    for (let i = bg.layers.length - 1; i >= 0; i--) {
      const next = [];
      for (const base of set)
        for (const c of bg.layers[i])
          next.push(c.a >= 0.999 ? c : over(c, base));
      set = next.slice(0, 12);
    }
    return set.length ? set : [{ r: 255, g: 255, b: 255, a: 1 }];
  };

  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // ---- contrast on every text-bearing leaf ----
  const textEls = [...document.querySelectorAll('body *')].filter(el => {
    if (!visible(el)) return false;
    if (el.closest('[aria-hidden="true"]')) return false;
    if (['SCRIPT','STYLE','SVG','PATH','CANVAS','IFRAME','NOSCRIPT'].includes(el.tagName)) return false;
    // direct text content only (avoid double-counting containers)
    return [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
  });

  for (const el of textEls) {
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) continue;
    if (fg.a === 0) continue;
    // gradient-clipped text (ghost numerals) can't be measured — record separately
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') {
      out.gradientText.push({ tag: el.tagName, txt: el.textContent.trim().slice(0,30) });
      continue;
    }
    const bg = bgOf(el);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    if (bg.image) {
      out.contrast.push({
        status: 'image', tag: el.tagName, size, weight,
        txt: el.textContent.trim().slice(0,40),
        cls: (el.className || '').toString().slice(0,60),
      });
      continue;
    }
    // Text must clear AA against EVERY effective background it can sit over,
    // so score the worst branch.
    let worst = null;
    for (const stop of effectiveBgs(bg)) {
      const fgc = fg.a < 1 ? over(fg, stop) : fg;
      const r = ratio(fgc, stop);
      if (!worst || r < worst.r) worst = { r, stop };
    }
    if (worst && worst.r < need) {
      out.contrast.push({
        status: 'fail', ratio: +worst.r.toFixed(2), need, size, weight,
        tag: el.tagName, txt: el.textContent.trim().slice(0,40),
        cls: (el.className || '').toString().slice(0,70),
        fg: cs.color,
        bg: 'rgb(' + [worst.stop.r, worst.stop.g, worst.stop.b].map(Math.round).join(',') + ')',
      });
    }
  }

  // ---- ::placeholder contrast (invisible to the text-node walk above) ----
  for (const el of [...document.querySelectorAll('input, textarea')].filter(visible)) {
    const ph = el.getAttribute('placeholder');
    if (!ph) continue;
    const pcs = getComputedStyle(el, '::placeholder');
    const fg = parse(pcs.color);
    if (!fg || fg.a === 0) continue;
    const bg = bgOf(el);
    if (bg.image) continue;
    const base = effectiveBgs(bg);
    const size = parseFloat(getComputedStyle(el).fontSize);
    const need = size >= 24 ? 3 : 4.5;
    let worst = null;
    for (const stop of base) {
      const fgc = fg.a < 1 ? over(fg, stop) : fg;
      const r = ratio(fgc, stop);
      if (!worst || r < worst.r) worst = { r, stop };
    }
    if (worst && worst.r < need) {
      out.contrast.push({
        status: 'fail', ratio: +worst.r.toFixed(2), need, size, weight: 400,
        tag: 'PLACEHOLDER', txt: ph.slice(0, 40),
        cls: (el.className || '').toString().slice(0, 60),
        fg: pcs.color,
        bg: 'rgb(' + [worst.stop.r, worst.stop.g, worst.stop.b].map(Math.round).join(',') + ')',
      });
    }
  }

  // ---- text overflowing its own container (document stays the same width) ----
  for (const el of [...document.querySelectorAll('body *')].filter(visible)) {
    if (el.children.length) continue;
    const t = (el.textContent || '').trim();
    if (t.length < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.overflow !== 'visible' || cs.whiteSpace === 'nowrap') continue;
    const p = el.parentElement;
    if (!p) continue;
    // Content inside a horizontally scrollable ancestor is SUPPOSED to exceed
    // its box — that is what the scroller is for. The terminal blocks are the
    // real case: two /industries code lines were reported as spilling 51-67px at
    // 390px when they sit in an overflow-x:auto pane and scroll correctly.
    let sc = p, scrollable = false;
    for (let i = 0; sc && i < 5; i++) {
      const ox = getComputedStyle(sc).overflowX;
      if (ox === 'auto' || ox === 'scroll') { scrollable = true; break; }
      sc = sc.parentElement;
    }
    if (scrollable) continue;
    const pr = p.getBoundingClientRect(), r = el.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(p).paddingRight) || 0;
    if (r.right > pr.right - pad + 2 || r.left < pr.left - 2) {
      out.textSpill.push({
        tag: el.tagName, txt: t.slice(0, 34),
        by: Math.round(Math.max(r.right - (pr.right - pad), pr.left - r.left)),
        cls: (el.className || '').toString().slice(0, 56),
      });
    }
  }

  // ---- collapsed containers ----
  // An element measuring 0x0 while its own subtree still paints something. That
  // is the signature of a percentage width resolved against a shrink-to-fit
  // parent: w-full inside a grid item with justify-self:end makes the track
  // content-sized, and if the content is all absolutely positioned there is no
  // content to size FROM, so the box collapses to nothing and its children pile
  // up on the origin.
  //
  // Every other check here was blind to it. Nothing overflows the document (the
  // children are absolute, so they do not widen it), no text spills its own
  // parent, contrast is fine, and the pixel gate compared a broken capture to an
  // equally broken baseline and called them identical. Only measuring the box
  // itself finds it.
  for (const el of [...document.querySelectorAll('body *')]) {
    if (!el.children.length) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0.5 || r.height > 0.5) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    // Only report if something inside actually renders — an intentionally empty
    // wrapper collapsing to 0 is not a bug.
    let painted = null;
    for (const d of el.querySelectorAll('*')) {
      const dr = d.getBoundingClientRect();
      if (dr.width > 2 && dr.height > 2) { painted = { d, dr }; break; }
    }
    if (!painted) continue;
    out.collapsed.push({
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 70),
      childTag: painted.d.tagName,
      childBox: Math.round(painted.dr.width) + 'x' + Math.round(painted.dr.height),
      childCls: (painted.d.className || '').toString().slice(0, 60),
    });
  }

  // ---- horizontal overflow ----
  const de = document.documentElement;
  out.overflow = { scrollW: de.scrollWidth, clientW: de.clientWidth,
                   overflowing: de.scrollWidth > de.clientWidth + 1 };
  if (out.overflow.overflowing) {
    out.overflow.culprits = [...document.querySelectorAll('body *')]
      .filter(el => { const r = el.getBoundingClientRect();
        return r.right > de.clientWidth + 1 && visible(el) && r.width > 4; })
      .slice(0, 6)
      .map(el => ({ tag: el.tagName, cls: (el.className||'').toString().slice(0,60),
                    right: Math.round(el.getBoundingClientRect().right) }));
  }

  // ---- heading order ----
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  out.headings.push({ h1count: hs.filter(h => h.tagName === 'H1').length });
  let prev = 0;
  for (const h of hs) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) out.headings.push({ skip: prev + ' -> ' + lvl, txt: h.textContent.trim().slice(0,40) });
    prev = lvl;
  }

  // ---- interactive: focus visibility + target size ----
  const inter = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(visible);
  for (const el of inter) {
    const r = el.getBoundingClientRect();
    // WCAG 2.2 SC 2.5.8 minimum target 24x24. Exempt: links inline in prose,
    // and visually-hidden affordances (a skip link is 1x1 until focused, when it
    // becomes a full-size pill — measuring its resting box is meaningless).
    const inlineInText = el.tagName === 'A' && el.closest('p,li,figcaption');
    const srOnly = /(^|\s)sr-only(\s|$)/.test((el.className || '').toString())
      || (r.width <= 1 && r.height <= 1);
    if (!inlineInText && !srOnly && (r.width < 24 || r.height < 24)) {
      out.targets.push({ tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height),
        label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0,30),
        cls: (el.className||'').toString().slice(0,50) });
    }
  }
  out.interactiveCount = inter.length;
  return out;
})()`;

// ---- driver -------------------------------------------------------------
async function session({ w, h, mobile, reducedMotion }) {
  const port = 9200 + Math.floor(Math.random() * 700);
  const args = ["--headless=new", "--hide-scrollbars", "--use-gl=angle", "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader", `--remote-debugging-port=${port}`, `--window-size=${w},${h}`,
    `--user-data-dir=/tmp/cdp-qa-${port}`, "about:blank"];
  if (reducedMotion) args.unshift("--force-prefers-reduced-motion");
  const chrome = spawn(CHROME, args, { stdio: "ignore" });
  let url;
  for (let i = 0; i < 100; i++) {
    try { const j = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
      if (j.webSocketDebuggerUrl) { url = j.webSocketDebuggerUrl; break; } } catch {}
    await sleep(200);
  }
  if (!url) throw new Error("chrome failed to start");
  const ws = new WebSocket(url);
  // Bounded socket open. An unreachable renderer used to park here forever.
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("websocket open timed out")), 20000);
    ws.onopen = () => { clearTimeout(t); res(); };
    ws.onerror = (e) => { clearTimeout(t); rej(new Error("websocket error: " + (e && e.message))); };
  });
  let id = 0; const pend = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? m.error); pend.delete(m.id); } };
  // If the renderer dies, fail every outstanding call instead of waiting on a
  // socket that will never answer.
  const killPending = (why) => { for (const [, r] of pend) r({ __cdpError: why }); pend.clear(); };
  ws.onclose = () => killPending("websocket closed");
  // NOTE: this driver is a second, independent copy of scripts/qa/lib/cdp.mjs.
  // Hardening only that one would not have helped: THIS is the send that hung
  // the gate for 9h23m after the machine slept mid-sweep, with Chrome alive but
  // never answering. Worth collapsing the two drivers into one later; bounding
  // both is the immediate fix.
  const CDP_TIMEOUT = Number(process.env.CDP_TIMEOUT_MS || 45000);
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const i = ++id;
    const t = setTimeout(() => { pend.delete(i); rej(new Error(`CDP timeout after ${CDP_TIMEOUT}ms: ${method}`)); }, CDP_TIMEOUT);
    pend.set(i, (v) => { clearTimeout(t); if (v && v.__cdpError) rej(new Error(v.__cdpError + ": " + method)); else res(v); });
    try { ws.send(JSON.stringify({ id: i, method, params, sessionId })); }
    catch (e) { clearTimeout(t); pend.delete(i); rej(e); }
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable");
  await S("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
  return {
    async goto(p) { await S("Page.navigate", { url: BASE + p }); await sleep(4200); },
    async audit() {
      const r = await S("Runtime.evaluate", { expression: AUDIT, returnByValue: true, awaitPromise: true });
      if (r?.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300));
      return r?.result?.value;
    },
    async evalJs(expr) {
      const r = await S("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
      return r?.result?.value;
    },
    close() { ws.close(); chrome.kill(); },
  };
}

const report = { contrastFails: [], textSpill: [], collapsed: [], gradientText: new Set(), overImage: new Set(), overflow: [], headings: [], targets: [], pages: 0 };

for (const vp of VIEWPORTS) {
  const s = await session(vp);
  for (const p of PAGES) {
    await s.goto(p);
    // Refuse to audit a page that did not load. A dead server or a 404 produces
    // zero findings in every category, which reads exactly like success — this
    // guard is why the run aborts instead of reporting a vacuous green.
    const loaded = await s.evalJs(`(() => ({
      url: location.href,
      title: document.title,
      main: !!document.querySelector('main'),
      text: (document.body.innerText || '').trim().length,
    }))()`);
    if (!loaded || !loaded.main || loaded.text < 400 || /chrome-error|about:blank/.test(loaded.url)) {
      console.error(`\nABORT: ${p} did not load properly — ${JSON.stringify(loaded)}`);
      console.error("Start a production server first:  npm run build && PORT=3411 npm start");
      process.exit(2);
    }
    const a = await s.audit();
    report.pages++;
    for (const c of a.contrast) {
      if (c.status === "fail")
        report.contrastFails.push({ vp: vp.name, page: p, ...c });
    }
    for (const g of a.gradientText) report.gradientText.add(`${g.tag}: ${g.txt}`);
    for (const c of a.contrast) if (c.status === 'image') report.overImage.add(`${p} ${c.tag}: ${c.txt}`);
    if (a.overflow.overflowing)
      report.overflow.push({ vp: vp.name, page: p, ...a.overflow });
    const skips = a.headings.filter((h) => h.skip);
    const h1 = a.headings.find((h) => h.h1count !== undefined)?.h1count;
    if (skips.length || h1 !== 1)
      report.headings.push({ vp: vp.name, page: p, h1count: h1, skips });
    for (const t of a.targets) report.targets.push({ vp: vp.name, page: p, ...t });
    for (const t of a.textSpill || []) report.textSpill.push({ vp: vp.name, page: p, ...t });
    for (const c of a.collapsed || []) report.collapsed.push({ vp: vp.name, page: p, ...c });
  }
  s.close();
  console.log(`swept ${vp.name} (${vp.w}px)`);
}

writeFileSync("/tmp/qa-report.json", JSON.stringify(report, null, 2));

const uniq = (arr, key) => {
  const m = new Map();
  for (const x of arr) { const k = key(x); if (!m.has(k)) m.set(k, { ...x, vps: [x.vp] }); else m.get(k).vps.push(x.vp); }
  return [...m.values()];
};

console.log(`\n=== ${report.pages} page-views audited ===`);

const cf = uniq(report.contrastFails, (x) => x.page + x.cls + x.txt);
console.log(`\nCONTRAST failures (unique): ${cf.length}`);
for (const c of cf.slice(0, 25))
  console.log(`  ${c.ratio}:1 (need ${c.need}) ${c.page} <${c.tag} ${c.size}px/${c.weight}> "${c.txt}"\n     fg=${c.fg} bg=${c.bg} cls=${c.cls}`);

const ts = uniq(report.textSpill, (x) => x.page + x.cls + x.txt);
console.log(`\nTEXT SPILLING ITS CONTAINER: ${ts.length}`);
for (const t of ts.slice(0, 12))
  console.log(`  ${t.page} <${t.tag}> +${t.by}px "${t.txt}" cls=${t.cls} [${t.vps.join(",")}]`);

console.log(`\nHORIZONTAL OVERFLOW: ${report.overflow.length}`);
for (const o of report.overflow)
  console.log(`  ${o.vp} ${o.page}: ${o.scrollW} > ${o.clientW}  ${JSON.stringify(o.culprits || []).slice(0,220)}`);

console.log(`\nHEADING issues: ${report.headings.length}`);
for (const h of report.headings) console.log(`  ${h.vp} ${h.page}: h1=${h.h1count} skips=${JSON.stringify(h.skips)}`);

const tg = uniq(report.targets, (x) => x.page + x.cls + x.label);
console.log(`\nSMALL TARGETS (<24px, non-inline): ${tg.length}`);
for (const t of tg.slice(0, 15))
  console.log(`  ${t.page} <${t.tag}> ${t.w}x${t.h} "${t.label}" cls=${t.cls} [${t.vps.join(",")}]`);

console.log(`\nText over a bitmap image (unmeasurable, review by eye): ${report.overImage.size}`);
for (const x of [...report.overImage].slice(0, 8)) console.log("  " + x);

console.log(`\nGradient-clipped text (unmeasurable, review by eye): ${report.gradientText.size}`);
for (const g of [...report.gradientText].slice(0, 8)) console.log("  " + g);

const cl = uniq(report.collapsed, (x) => x.page + x.cls + x.childCls);
console.log(`\nCOLLAPSED CONTAINERS (0x0 box with a rendering subtree): ${cl.length}`);
for (const c of cl.slice(0, 12))
  console.log(`  ${c.page} <${c.tag} class="${c.cls}"> -> child <${c.childTag}> ${c.childBox} cls=${c.childCls} [${c.vps.join(",")}]`);

// ---------------------------------------------------------------- verdict
// This block did not exist, and its absence made the whole sweep decorative:
// the only process.exit was the load guard, so `node qa.mjs` returned 0 with
// findings on screen and gate.sh happily printed "qa sweep clean". A check that
// cannot fail is not a check. Contrast/spill/overflow/heading/target/collapsed
// are hard failures; the two "unmeasurable, review by eye" buckets stay
// advisory, since a human has to judge those.
const hard = {
  "contrast failures": cf.length,
  "text spilling its container": ts.length,
  "horizontal overflow": report.overflow.length,
  "heading issues": report.headings.length,
  "small targets": tg.length,
  "collapsed containers": cl.length,
};
const failed = Object.entries(hard).filter(([, n]) => n > 0);
console.log(`\n=== verdict over ${report.pages} page-views ===`);
for (const [k, n] of Object.entries(hard)) console.log(`  ${n > 0 ? "✗" : "✓"} ${k}: ${n}`);
if (report.pages === 0) {
  console.error("\nFAIL: no page was audited — refusing to report a vacuous pass.");
  process.exit(2);
}
if (failed.length) {
  console.error(`\nFAIL: ${failed.map(([k, n]) => `${n} ${k}`).join(", ")}`);
  process.exit(1);
}
console.log("\nOK — no hard findings.");
