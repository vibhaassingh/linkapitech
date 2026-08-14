const BASE = process.argv[2] ?? "http://localhost:3411";
import { session, sleep } from "./lib/cdp.mjs";
const results=[]; const ok=(n,p,d="")=>results.push({n,p,d});

// One shared driver (./lib/cdp.mjs). This file used to carry its own copy; five
// scripts had drifted into five copies, so every hardening had to be applied
// five times and in practice never was. `ev`/`key` stay as thin aliases so the
// assertions below read unchanged.
async function sess({w,h,mobile,rm}){
  const s = await session({ w, h, mobile, reducedMotion: rm, base: BASE });
  return { ...s, ev: s.evalJs, key: s.press };
}

// ---- reduced motion ----
{
  const s=await sess({w:1440,h:900,rm:true});
  for(const p of ["/","/about","/services","/solutions","/connected-banking","/industries","/contact"]) {
    await s.goto(p);
    const r=await s.ev(`(() => {
      const hidden=[...document.querySelectorAll('[data-reveal]')].filter(e=>getComputedStyle(e).opacity!=='1').length;
      const moved=[...document.querySelectorAll('[data-reveal]')].filter(e=>{
        const t=getComputedStyle(e).transform; return t!=='none'&&t!=='matrix(1, 0, 0, 1, 0, 0)'}).length;
      const marquee=[...document.querySelectorAll('.marquee')].map(e=>getComputedStyle(e).animationName);
      const canvas=document.querySelector('canvas');
      return { hidden, moved, marquee, canvasOpacity: canvas?getComputedStyle(canvas).opacity:'absent' };
    })()`);
    ok(`reduced-motion ${p}: reveals visible`, r.hidden===0 && r.moved===0, `hidden=${r.hidden} moved=${r.moved}`);
    if(r.marquee.length) ok(`reduced-motion ${p}: marquee static`, r.marquee.every(m=>m==='none'), JSON.stringify(r.marquee));
    ok(`reduced-motion ${p}: no WebGL`, r.canvasOpacity!=='1', `canvas=${r.canvasOpacity}`);
  }
  s.close();
}

let fail=0;
for(const r of results){ if(!r.p) fail++; console.log(`${r.p?"PASS":"FAIL"}  ${r.n}${r.d?`  [${r.d}]`:""}`); }
console.log(`\n${results.length-fail}/${results.length} passed`);
