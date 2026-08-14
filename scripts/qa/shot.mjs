// Full-page screenshot.
// usage: node shot.mjs <url> <outfile> [width] [reducedMotion]
//
// Drives Chrome through the one shared CDP driver in ./lib/cdp.mjs. This file
// used to carry its own copy — one of five — and that duplication is exactly how
// a 9h23m gate hang happened: the unbounded `send` that wedged was in a copy
// that hardening the shared driver never touched.
//
// The capture sequence below is deliberately unchanged from that copy, because
// every PNG in scripts/qa/baseline was produced by it and pixdiff compares
// against those. `disableGpu` (not `gl`) matters here for the same reason: it
// changes how the hero's WebGL layer paints.
import { writeFileSync } from "node:fs";
import { session, sleep } from "./lib/cdp.mjs";

const [url, out, widthArg, rm] = process.argv.slice(2);
const width = Number(widthArg ?? 1440);

const s = await session({
  w: width,
  h: 1000,
  mobile: false,
  disableGpu: true,
  reducedMotion: rm === "rm",
});

await s.goto(url, 5000);

// Two normalisations, both so the capture is a function of OUR code alone:
//
//   [data-reveal] — force every reveal visible, so nothing is caught
//   mid-transition.
//
//   iframe — blank third-party embeds. /contact carries a lazy Google Maps
//   embed, and whether its tiles arrive before the capture depends on the
//   network, not on this repo. Two runs 20 minutes apart off identical source
//   differed on 17.6% of contact-1440's pixels: a 440px band flipped between
//   Maps' land colour (#e5e3df) and bare --canvas. `visibility: hidden` blanks
//   it WITHOUT collapsing it, so page height and every other element's position
//   are untouched — which matters, since pixdiff treats a height change as a
//   redesign signal.
await s.evalJs(
  `document.documentElement.insertAdjacentHTML('beforeend','<style>[data-reveal]{opacity:1!important;transform:none!important;transition:none!important}iframe{visibility:hidden!important}</style>')`,
);
await sleep(400);

const { cssContentSize } = await s.layoutMetrics();
const fullH = Math.min(Math.ceil(cssContentSize.height), 30000);
await s.resize(width, fullH);
await sleep(1200);

writeFileSync(out, await s.screenshot({ beyondViewport: true }));
console.log(`${out} ${width}x${fullH}`);

s.close();
process.exit(0);
