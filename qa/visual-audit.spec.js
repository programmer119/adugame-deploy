const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'reports', 'visual');
fs.mkdirSync(OUT, { recursive: true });
const report = [];

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.click(p.x,p.y); }
async function dragL(page,r,points,duration=240){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y); await page.mouse.down();
  const pause=Math.max(12,Math.floor(duration/Math.max(1,ps.length-1)));
  for(let k=1;k<ps.length;k++){ await page.mouse.move(ps[k].x,ps[k].y); await page.waitForTimeout(pause); }
  await page.mouse.up();
}
function circle(cx,cy,r,turns=3,steps=4,start=-Math.PI/2){
  const pts=[]; for(let i=0;i<=turns*steps;i++){ const a=start+2*Math.PI*i/steps; pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]); } return pts;
}
async function waitFor(page,fn,timeout=12000,arg=null){ return page.waitForFunction(fn,arg,{timeout}); }
async function openRound(page,g,r){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{ if(m.type()==='error')errors.push(m.text()); });
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key);
  const rct=await rect(page); expect(rct).toBeTruthy();
  return {rct,errors};
}
function inter(a,b){
  const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.x+a.w,b.x+b.w),bt=Math.min(a.y+a.h,b.y+b.h);
  if(r<=x||bt<=y)return 0; return (r-x)*(bt-y);
}
function related(a,b){
  if(a.id===b.id)return true;
  if(a.parent!==null && a.parent===b.parent)return true;
  return a.anc.includes(b.id)||b.anc.includes(a.id);
}
function decorativeText(t){
  const s=(t.text||'').trim();
  return !s || /^[✦★✧☝]+$/.test(s);
}
function semanticResource(n){
  return n.type!=='Text' && n.hasBounds && (n.interactive || !!n.name || !!n.kind);
}
function overlapRatio(a,b){ return inter(a,b)/Math.max(1,Math.min(a.w*a.h,b.w*b.h)); }

async function audit(page,label,{afterComplete=false}={}){
  if(afterComplete) await page.waitForTimeout(1950);
  const snap=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__?.();
    if(!s)return {nodes:[],state:null};
    let id=0; const nodes=[];
    const walk=(o,parent=null,anc=[],parentVisible=true,parentAlpha=1)=>{
      if(!o)return;
      const my=id++;
      const ownVisible=o.visible!==false;
      const ownAlpha=Number.isFinite(Number(o.alpha))?Number(o.alpha):1;
      const effectiveVisible=parentVisible && ownVisible && parentAlpha*ownAlpha>0.02;
      let b=null; try{ b=o.getBounds?.(); }catch(_){}
      const hasBounds=!!(b&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.width)&&Number.isFinite(b.height));
      nodes.push({
        id:my,parent,anc,name:o.name||'',kind:o.kind||'',type:o.type||o.constructor?.name||'unknown',
        text:(o.type==='Text'||o.constructor?.name==='Text')?String(o.text||''):'',
        interactive:!!o.input?.enabled,ownVisible,effectiveVisible,alpha:ownAlpha,depth:Number(o.depth)||0,hasBounds,
        x:hasBounds?b.x:0,y:hasBounds?b.y:0,w:hasBounds?b.width:0,h:hasBounds?b.height:0
      });
      if(Array.isArray(o.list)) for(const c of o.list) walk(c,my,[...anc,my],effectiveVisible,parentAlpha*ownAlpha);
    };
    for(const o of s.children.list)walk(o,null,[],true,1);
    return {nodes,state:s.debugState?.()||null,interactionLocked:!!s.interactionLocked};
  });

  const issues=[];
  const visible=snap.nodes.filter(n=>n.effectiveVisible&&n.hasBounds&&n.w>1&&n.h>1);
  const texts=visible.filter(n=>n.type==='Text'&&!decorativeText(n));
  const resources=visible.filter(semanticResource);

  for(const n of snap.nodes){
    if(n.interactive && !n.effectiveVisible){
      issues.push({kind:'hidden-interactive',target:n.name||n.kind||n.type,depth:n.depth});
    }
  }

  for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
    const a=texts[i],b=texts[j]; if(related(a,b))continue;
    const ratio=overlapRatio(a,b);
    if(ratio>.08)issues.push({kind:'text-text',a:a.text,b:b.text,ratio:+ratio.toFixed(3),aBox:[a.x,a.y,a.w,a.h],bBox:[b.x,b.y,b.w,b.h]});
  }

  for(const t of texts)for(const o of resources){
    if(related(t,o))continue;
    const area=inter(t,o); if(!area)continue;
    const textRatio=area/Math.max(1,t.w*t.h);
    if(textRatio>.28){
      issues.push({kind:'text-resource',text:t.text,target:o.name||o.kind||o.type,ratio:+textRatio.toFixed(3),textBox:[t.x,t.y,t.w,t.h],targetBox:[o.x,o.y,o.w,o.h]});
      if(t.parent===null && o.interactive){
        issues.push({kind:'instruction-target',text:t.text,target:o.name||o.kind||o.type,ratio:+textRatio.toFixed(3)});
      }
    }
  }

  const activeResources=resources.filter(n=>n.interactive);
  for(let i=0;i<activeResources.length;i++)for(let j=i+1;j<activeResources.length;j++){
    const a=activeResources[i],b=activeResources[j]; if(related(a,b))continue;
    const ratio=overlapRatio(a,b);
    if(ratio>.35)issues.push({kind:'resource-resource',a:a.name||a.kind||a.type,b:b.name||b.kind||b.type,ratio:+ratio.toFixed(3),aBox:[a.x,a.y,a.w,a.h],bBox:[b.x,b.y,b.w,b.h]});
  }

  if(afterComplete && snap.state?.roundComplete){
    const modalOverlay=visible.find(n=>n.interactive&&n.depth===9997&&n.w>=1200&&n.h>=680);
    if(!modalOverlay)issues.push({kind:'modal-world-interference',reason:'missing full-screen interactive result overlay'});
    else {
      const suspicious=visible.filter(n=>n.depth>=9997&&n.id!==modalOverlay.id&&!((n.type==='Graphics'&&n.depth===9998)||(n.type==='Text'&&n.depth===9999)));
      if(suspicious.length)issues.push({kind:'modal-world-interference',reason:'unexpected object in result-modal depth band',targets:suspicious.map(n=>n.text||n.name||n.kind||n.type)});
    }
    const transient=visible.filter(n=>n.depth>=1000&&n.depth<9997&&!decorativeText(n));
    for(const n of transient){
      if(n.type==='Text'||n.interactive||n.name||n.kind){
        issues.push({kind:'leftover-after-complete',target:n.text||n.name||n.kind||n.type,depth:n.depth,box:[n.x,n.y,n.w,n.h]});
      }
    }
  }

  for(const n of visible){
    if(n.x<20||n.y<16||n.x+n.w>1260||n.y+n.h>704){
      issues.push({kind:'safe-frame',target:n.text||n.name||n.kind||n.type,box:[n.x,n.y,n.w,n.h]});
    }
  }

  const file=label.replace(/[^A-Za-z0-9_-]/g,'_')+'.png';
  await page.locator('canvas').screenshot({path:path.join(OUT,file)});
  report.push({label,state:snap.state,interactionLocked:snap.interactionLocked,issues});
}

async function completeAndAudit(page,errors,label){
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.roundComplete===true,18000);
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(st.roundComplete).toBe(true); expect(errors).toEqual([]);
  await audit(page,label,{afterComplete:true});
}

async function mixBase(p,r,colorX,label){
  const color=colorX===210?'blue':colorX===325?'green':'pink';
  await dragL(p,r,[[230,230],[650,420]],180);
  await waitFor(p,()=>window.__ADUGAME_DEBUG__()?.ingredients?.includes('base'),7000);
  await dragL(p,r,[[360,230],[650,420]],180);
  await waitFor(p,()=>window.__ADUGAME_DEBUG__()?.ingredients?.includes('activator'),7000);
  await audit(p,`${label}_ingredients`);
  await clickL(p,r,colorX,355);
  await waitFor(p,c=>window.__ADUGAME_DEBUG__()?.chosen?.color===c,5000,color);
  await audit(p,`${label}_color`);
  await dragL(p,r,circle(650,420,90,3.2,4),1900);
  await waitFor(p,()=>window.__ADUGAME_DEBUG__()?.mixed===true,7000);
  await audit(p,`${label}_mixed`);
}
async function craftOrder(p,r,{colorX,decoX,containerX=null,extraX=null},served,label){
  await mixBase(p,r,colorX,label);
  await dragL(p,r,[[decoX,485],[650,420]],190);
  if(extraX!==null)await dragL(p,r,[[extraX,485],[690,440]],190);
  if(containerX!==null)await clickL(p,r,containerX,585);
  await audit(p,`${label}_decorated`);
  await clickL(p,r,870,630);
  await waitFor(p,n=>window.__ADUGAME_DEBUG__()?.ordersServed>=n||window.__ADUGAME_DEBUG__()?.roundComplete===true,9000,served);
  await p.waitForTimeout(250);
  await audit(p,`${label}_served`);
  const done=await p.evaluate(()=>window.__ADUGAME_DEBUG__()?.roundComplete===true);
  if(!done){
    await waitFor(p,n=>{const s=window.__ADUGAME_DEBUG__(),sc=window.__ADUGAME_SCENE__();return s.orderIndex===n&&s.ingredients.length===0&&!s.mixed&&!sc.interactionLocked&&!!sc.mixZone?.input?.enabled;},7000,served);
  }
}

test('visual-flow G1R1',async({page})=>{
  const {rct:r,errors}=await openRound(page,1,1); await audit(page,'G1R1_00_initial');
  await clickL(page,r,740,380); await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===0.5,4000); await audit(page,'G1R1_01_toilet');
  await clickL(page,r,790,275); await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===1,4000); await audit(page,'G1R1_02_flush');
  await clickL(page,r,400,300); await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===2,4000); await audit(page,'G1R1_03_wet');
  await dragL(page,r,[[175,430],[400,475]],180); await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===3,4000); await audit(page,'G1R1_04_soap');
  await dragL(page,r,[[330,475],[410,475],[330,475],[410,475],[330,475],[410,475],[330,475]],620); await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===4,4000); await audit(page,'G1R1_05_scrub');
  await clickL(page,r,400,300); await completeAndAudit(page,errors,'G1R1_06_complete');
});

test('visual-flow G1R2',async({page})=>{
  const {rct:r,errors}=await openRound(page,1,2); await audit(page,'G1R2_00_initial');
  await dragL(page,r,[[205,235],[205,350]],160); await page.waitForTimeout(220); await audit(page,'G1R2_01_toothpaste');
  await dragL(page,r,[[205,350],[730,340],[770,340],[730,340],[770,340],[810,340],[850,340],[810,340],[850,340],[770,390],[730,390],[770,390],[730,390],[810,390],[850,390],[810,390],[850,390]],1200);
  await page.waitForTimeout(220); await audit(page,'G1R2_02_brushed');
  await dragL(page,r,[[205,480],[720,320],[790,320],[720,320],[790,320],[720,320],[790,320],[720,320]],760); await page.waitForTimeout(220); await audit(page,'G1R2_03_face');
  let idx=0; for(const nail of [[1010,438],[1035,443],[1060,438],[1085,443],[1110,438]]){await dragL(page,r,[[205,585],nail],150);await page.waitForTimeout(120);if(idx===1||idx===4)await audit(page,`G1R2_04_nails_${idx+1}`);idx++;}
  await completeAndAudit(page,errors,'G1R2_05_complete');
});

test('visual-flow G1R3',async({page})=>{
  const {rct:r,errors}=await openRound(page,1,3); await audit(page,'G1R3_00_initial');
  for(const q of [[180,235],[315,235],[450,235]]){await dragL(page,r,[q,[255,465]],160);await page.waitForTimeout(150);} await audit(page,'G1R3_01_toys');
  for(const q of [[560,250],[680,250],[800,250]]){await dragL(page,r,[q,[735,475]],170);await page.waitForTimeout(160);} await audit(page,'G1R3_02_food');
  for(const q of [[660,470],[735,465],[810,460]]){await dragL(page,r,[q,[1040,330]],170);await page.waitForTimeout(160);}
  await completeAndAudit(page,errors,'G1R3_03_complete');
});

test('visual-flow G2R1',async({page})=>{
  const {rct:r,errors}=await openRound(page,2,1); await audit(page,'G2R1_00_initial');
  await dragL(page,r,[[315,628],[980,500]],180); await page.waitForTimeout(160); await audit(page,'G2R1_01_character');
  await dragL(page,r,[[330,205],[690,330]],170); await page.waitForTimeout(180); await audit(page,'G2R1_02_cooked');
  await dragL(page,r,[[690,330],[980,500]],170); await page.waitForTimeout(180); await audit(page,'G2R1_03_fed');
  await clickL(page,r,650,555); await completeAndAudit(page,errors,'G2R1_04_complete');
});

test('visual-flow G2R2',async({page})=>{
  const {rct:r,errors}=await openRound(page,2,2); await audit(page,'G2R2_00_initial');
  await clickL(page,r,650,345); await page.waitForTimeout(120); await audit(page,'G2R2_01_open');
  for(const q of [[330,205],[412,205],[494,205]]){await dragL(page,r,[q,[650,345]],160);await page.waitForTimeout(150);} await audit(page,'G2R2_02_loaded');
  await clickL(page,r,650,345); await clickL(page,r,650,345); await page.waitForTimeout(1450); await audit(page,'G2R2_03_washed');
  for(const q of [[760,520],[818,520],[876,520]]){await dragL(page,r,[q,[930,420]],160);await page.waitForTimeout(150);} await audit(page,'G2R2_04_dried');
  await clickL(page,r,650,555); await completeAndAudit(page,errors,'G2R2_05_complete');
});

test('visual-flow G2R3',async({page})=>{
  const {rct:r,errors}=await openRound(page,2,3); await audit(page,'G2R3_00_initial');
  let i=0; for(const q of [[330,205],[412,205],[494,205]]){await dragL(page,r,[q,[720,405]],160);await page.waitForTimeout(160);await audit(page,`G2R3_0${i+1}_part`);i++;}
  await clickL(page,r,650,555); await completeAndAudit(page,errors,'G2R3_04_complete');
});

for(const [rnd,orders] of [
  [1,[{colorX:210,decoX:210},{colorX:440,decoX:400}]],
  [2,[{colorX:325,decoX:305,containerX:230},{colorX:210,decoX:210,containerX:380},{colorX:440,decoX:400,containerX:230}]],
  [3,[{colorX:210,decoX:210,extraX:495},{colorX:325,decoX:305},{colorX:440,decoX:400}]]
]){
  test(`visual-flow G3R${rnd}`,async({page})=>{
    const {rct:r,errors}=await openRound(page,3,rnd); await audit(page,`G3R${rnd}_00_initial`);
    let served=0;
    for(const order of orders){ served++; await craftOrder(page,r,order,served,`G3R${rnd}_O${served}`); }
    await completeAndAudit(page,errors,`G3R${rnd}_99_complete`);
  });
}

test.afterAll(async()=>{
  const all=report.flatMap(x=>x.issues.map(i=>({label:x.label,...i})));
  const counts=all.reduce((m,i)=>{m[i.kind]=(m[i.kind]||0)+1;return m;},{});
  fs.mkdirSync(path.join(__dirname,'reports'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'reports','visual-audit.json'),JSON.stringify({summary:counts,frames:report},null,2));
  console.log('ADUGAME_VISUAL_AUDIT_SUMMARY',JSON.stringify(counts));
  console.log('ADUGAME_VISUAL_AUDIT_CANDIDATE_SAMPLE',JSON.stringify(all.filter(i=>i.kind!=='safe-frame').slice(0,80)));
});
