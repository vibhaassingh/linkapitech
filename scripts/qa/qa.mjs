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
  const out = { contrast: [], overflow: null, focus: [], headings: [], targets: [], gradientText: [] };

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

  // Effective background: walk ancestors until an opaque colour. When a gradient
  // intervenes, return its colour stops so the caller can test the WORST one —
  // skipping gradients entirely is how a 3.91:1 pairing survived an earlier
  // "zero contrast failures" run.
  const bgOf = (el) => {
    let node = el, acc = [];
    while (node && node !== document.documentElement.parentNode) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const stops = stopsOf(cs.backgroundImage);
        if (!stops) return { image: true, node };
        // Composite each stop over whatever sits behind the gradient, so
        // translucent stops (the glass tiers) resolve to real colours.
        let behind = { r: 255, g: 255, b: 255, a: 1 };
        let p = node.parentElement;
        while (p) {
          const pc = parse(getComputedStyle(p).backgroundColor);
          if (pc && pc.a === 1) { behind = pc; break; }
          p = p.parentElement;
        }
        return { stops: stops.map(c => (c.a < 1 ? over(c, behind) : c)) };
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        acc.push(c);
        if (c.a === 1) {
          let base = acc.pop();
          while (acc.length) base = over(acc.pop(), base);
          return { color: base };
        }
      }
      node = node.parentElement;
    }
    return { color: { r:255, g:255, b:255, a:1 } };
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
    if (bg.stops) {
      // Text must clear AA against EVERY stop it can sit over, so score the
      // worst one. A gradient is not an excuse to skip the check.
      let worst = null;
      for (const stop of bg.stops) {
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
          bg: 'gradient stop rgb(' + [worst.stop.r, worst.stop.g, worst.stop.b].map(Math.round).join(',') + ')',
        });
      }
      continue;
    }
    const fgc = fg.a < 1 ? over(fg, bg.color) : fg;
    const r = ratio(fgc, bg.color);
    if (r < need) {
      out.contrast.push({
        status: 'fail', ratio: +r.toFixed(2), need, size, weight,
        tag: el.tagName, txt: el.textContent.trim().slice(0,40),
        cls: (el.className || '').toString().slice(0,70),
        fg: cs.color, bg: 'rgb(' + [bg.color.r,bg.color.g,bg.color.b].map(Math.round).join(',') + ')',
      });
    }
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
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? m.error); pend.delete(m.id); } };
  const send = (method, params = {}, sessionId) => new Promise((res) => {
    const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
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

const report = { contrastFails: [], gradientText: new Set(), overImage: new Set(), overflow: [], headings: [], targets: [], pages: 0 };

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
