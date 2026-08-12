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
