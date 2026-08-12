import { spawn } from "node:child_process";
const CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const results=[]; const ok=(n,p,d="")=>results.push({n,p,d});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function sess({w,h,mobile,rm}){
  const port=9300+Math.floor(Math.random()*600);
  const args=["--headless=new","--hide-scrollbars",`--remote-debugging-port=${port}`,
    `--window-size=${w},${h}`,`--user-data-dir=/tmp/cdp-kb-${port}`,"about:blank"];
  if(rm) args.unshift("--force-prefers-reduced-motion");
  const chrome=spawn(CHROME,args,{stdio:"ignore"});
  let u;for(let i=0;i<90;i++){try{const j=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  if(j.webSocketDebuggerUrl){u=j.webSocketDebuggerUrl;break}}catch{}await sleep(200)}
  const ws=new WebSocket(u); await new Promise(r=>ws.onopen=r);
  let id=0;const pend=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){pend.get(m.id)(m.result??m.error);pend.delete(m.id)}};
  const send=(m,p={},s)=>new Promise(res=>{const i=++id;pend.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}))});
  const {targetId}=await send("Target.createTarget",{url:"about:blank"});
  const {sessionId}=await send("Target.attachToTarget",{targetId,flatten:true});
  const S=(m,p)=>send(m,p,sessionId);
  await S("Page.enable");await S("Runtime.enable");
  await S("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:1,mobile:!!mobile});
  const ev=async x=>(await S("Runtime.evaluate",{expression:x,returnByValue:true,awaitPromise:true}))?.result?.value;
  const key=async(k,code,mods=0)=>{
    for(const type of ["keyDown","keyUp"])
      await S("Input.dispatchKeyEvent",{type,key:k,code,windowsVirtualKeyCode:code==="Tab"?9:27,modifiers:mods});
  };
  return {S,ev,key,
    goto:async p=>{await S("Page.navigate",{url:"http://localhost:3411"+p});await sleep(4200)},
    close:()=>{ws.close();chrome.kill()}};
}

// ---- desktop keyboard walk ----
{
  const s=await sess({w:1440,h:900});
  await s.goto("/");
  // tab through the first 30 stops, recording focus + whether an outline shows
  const walk=await s.ev(`(async () => {
    const seen=[]; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    document.body.focus();
    for(let i=0;i<30;i++){
      // emulate Tab by moving focus through the tabbable set
      const tabbables=[...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')]
        .filter(el=>{const cs=getComputedStyle(el);const r=el.getBoundingClientRect();
          return cs.visibility!=='hidden'&&cs.display!=='none'&&r.width>0&&r.height>0});
      const idx=tabbables.indexOf(document.activeElement);
      const next=tabbables[idx+1]||tabbables[0];
      if(!next) break;
      next.focus();
      await sleep(8);
      const el=document.activeElement;
      seen.push({tag:el.tagName, label:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,26)});
    }
    return seen;
  })()`);
  ok("desktop: tab reaches many stops", (walk?.length??0)>=20, `stops=${walk?.length}`);

  // focus-visible must paint a ring on the first nav link
  const ring=await s.ev(`(() => {
    const a=document.querySelector('header a[href]');
    a.focus();
    // :focus-visible only matches for keyboard focus; force via matches()
    const cs=getComputedStyle(a);
    return { matchesFv: a.matches(':focus-visible'), outline: cs.outlineWidth+' '+cs.outlineStyle+' '+cs.outlineColor };
  })()`);
  ok("focus ring defined on nav link", ring?.outline?.includes("2px") || ring?.matchesFv === true, JSON.stringify(ring));

  // skip link presence (first tabbable should let you jump to content)
  const first=await s.ev(`(() => {
    const t=[...document.querySelectorAll('a[href],button')].filter(el=>{
      const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
      return cs.display!=='none'&&cs.visibility!=='hidden'})[0];
    return { tag:t.tagName, txt:(t.textContent||'').trim().slice(0,30), href:t.getAttribute('href') };
  })()`);
  ok("has a skip-to-content affordance", /skip/i.test(first?.txt||""), JSON.stringify(first));

  // carousel arrows operable and dots update
  const car=await s.ev(`(async () => {
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const next=[...document.querySelectorAll('button')].find(b=>/next/i.test(b.textContent));
    const prev=[...document.querySelectorAll('button')].find(b=>/previous/i.test(b.textContent));
    if(!next||!prev) return {found:false};
    const before=prev.disabled;
    next.click(); await sleep(700);
    const afterPrev=prev.disabled;
    return { found:true, prevDisabledAtStart:before, prevEnabledAfterNext:!afterPrev };
  })()`);
  ok("carousel: arrows work + prev enables", car?.found && car.prevDisabledAtStart && car.prevEnabledAfterNext, JSON.stringify(car));
  s.close();
}

// ---- mobile menu: open, focus trap, Esc restores focus ----
{
  const s=await sess({w:390,h:844,mobile:true});
  await s.goto("/");
  const r=await s.ev(`(async () => {
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const btn=[...document.querySelectorAll('button')].find(b=>/menu/i.test(b.getAttribute('aria-label')||'')||/menu/i.test(b.textContent));
    if(!btn) return {found:false};
    btn.focus(); btn.click(); await sleep(600);
    const dlg=document.querySelector('[role="dialog"]');
    const bodyLocked=getComputedStyle(document.body).overflow;
    const focusInside=dlg?dlg.contains(document.activeElement):false;
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    await sleep(600);
    const d2=document.querySelector('[role="dialog"]');
    const closed = !d2 || d2.hasAttribute('hidden') || getComputedStyle(d2).display==='none';
    const restored=document.activeElement===btn;
    return { found:true, opened:!!dlg, bodyLocked, focusInside, closed, restored };
  })()`);
  ok("mobile menu: opens as dialog", r?.found && r.opened, JSON.stringify(r));
  ok("mobile menu: locks body scroll", r?.bodyLocked === "hidden", `overflow=${r?.bodyLocked}`);
  ok("mobile menu: moves focus inside", r?.focusInside === true, `focusInside=${r?.focusInside}`);
  ok("mobile menu: Esc closes", r?.closed === true, `closed=${r?.closed}`);
  ok("mobile menu: Esc restores focus to trigger", r?.restored === true, `restored=${r?.restored}`);
  s.close();
}

let fail=0;
for(const r of results){ if(!r.p) fail++; console.log(`${r.p?"PASS":"FAIL"}  ${r.n}${r.d?`  [${r.d}]`:""}`); }
console.log(`\n${results.length-fail}/${results.length} passed`);
