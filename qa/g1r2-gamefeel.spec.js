const { test, expect } = require('@playwright/test');
const fs=require('fs');
const BRUSH_PATHS=[
  [[765,485],[800,485],[755,500],[800,500],[755,485],[800,485],[755,500]],
  [[850,485],[895,485],[845,500],[895,500],[845,485],[895,485],[845,500]],
  [[765,535],[800,535],[755,555],[800,555],[755,535],[800,535],[755,555]],
  [[850,535],[895,535],[845,555],[895,555],[845,535],[895,535],[845,555]]
];
const NAILS=[[825,223],[845,194],[863,181],[884,188],[903,207]];
const PASTE_HOME=[1155,500],PASTE_TARGET=[1015,645],BRUSH_HOME=[1080,505],FACE_HOME=[575,265],CLIPPER_HOME=[985,250];
const FACE_LOOP=[[790,330],[735,330],[845,330],[735,345],[845,345],[735,315],[845,315],[790,330]];

async function p(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('canvas'),r=c.getBoundingClientRect();return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};},{x,y});}
async function beginDrag(page,pts,steps=2){const q=[];for(const [x,y] of pts)q.push(await p(page,x,y));await page.mouse.move(q[0].x,q[0].y);await page.mouse.down();for(const a of q.slice(1))await page.mouse.move(a.x,a.y,{steps});}
async function drag(page,pts,steps=1){await beginDrag(page,pts,steps);await page.mouse.up();}
async function waitStep(page,n){await page.waitForFunction(step=>window.__ADUGAME_DEBUG__?.()?.step===step,n,{timeout:12000});}
async function snap(page,name){await page.waitForTimeout(55);await page.screenshot({path:`qa/reports/g1r2-fast/${name}.png`});}
async function gf(page){return page.evaluate(()=>{
  const root=document.querySelector('#g1r2-v17-overlay'),rail=document.querySelector('.g1v17-gamefeel-rail'),badge=document.querySelector('.g1v17-gamefeel-badge'),fill=document.querySelector('.g1v17-gamefeel-fill');
  const rr=rail?.getBoundingClientRect(),br=badge?.getBoundingClientRect();
  return{
    state:window.__ADUGAME_DEBUG__?.(),version:window.__ADUGAME_ART_SOURCE__?.G1R2?.version,generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,meta:window.__ADUGAME_ART_SOURCE__?.G1R2?.dynamicGameFeel,
    rootVersion:root?.dataset.version,ready:root?.dataset.gameFeelReady,railState:root?.dataset.gameFeelRail,lastPulse:root?.dataset.gameFeelLastPulse||'',lastText:root?.dataset.gameFeelLastText||'',pulseCount:Number(root?.dataset.gameFeelPulseCount||0),
    rail:{display:rail?getComputedStyle(rail).display:null,opacity:rail?parseFloat(getComputedStyle(rail).opacity):0,mode:rail?.dataset.mode||'',text:rail?.firstElementChild?.textContent||'',box:rr?{left:rr.left,top:rr.top,right:rr.right,bottom:rr.bottom}:null},
    badge:{display:badge?getComputedStyle(badge).display:null,opacity:badge?parseFloat(getComputedStyle(badge).opacity):0,text:badge?.textContent||'',on:badge?.dataset.on||'',box:br?{left:br.left,top:br.top,right:br.right,bottom:br.bottom}:null},
    segments:[...document.querySelectorAll('.g1v17-gamefeel-seg')].map(e=>e.dataset.done),fill:fill?Number(fill.dataset.value||0):null,
    layout:{innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}
  };
});}
async function ready(page){
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const r=document.querySelector('#g1r2-v17-overlay');return r?.dataset.gameFeelReady==='1'&&r?.dataset.motionReady==='1'&&r?.dataset.toolHitAlignmentReady==='1'&&r?.dataset.version==='17.31'&&window.__ADUGAME_ART_SOURCE__?.G1R2?.version==='v17.31';},null,{timeout:60000});
  const d=await gf(page);expect(d.generated).toBe(0);expect(d.meta?.stableVisualProgress).toBe(true);expect(d.meta?.milestoneSuccessBadge).toBe(true);expect(d.meta?.brushFeedbackOnRelease).toBe(true);expect(d.meta?.mobileCompact).toBe(true);expect(d.meta?.progressDomUpdatesOnChangeOnly).toBe(true);expect(d.meta?.milestoneHoldMs).toBe(1250);return d;
}
async function brushQuadrant(page,index){
  const pts=BRUSH_PATHS[index];await beginDrag(page,[BRUSH_HOME,pts[0]],2);for(const a of pts.slice(1)){const q=await p(page,a[0],a[1]);await page.mouse.move(q.x,q.y,{steps:1});}await page.mouse.up();await page.waitForFunction(i=>window.__ADUGAME_DEBUG__?.()?.mouthProgress?.[i]>=115,index,{timeout:3000});
}

test('R2 v17.31 desktop visible progress + success milestones',async({page})=>{
  test.setTimeout(300000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});let d=await ready(page);expect(d.state.step).toBe(0);expect(d.railState).toBe('hidden');
  await drag(page,[PASTE_HOME,[900,500]]);await page.waitForTimeout(120);expect((await gf(page)).state.step).toBe(0);
  await drag(page,[PASTE_HOME,[1110,560],PASTE_TARGET],2);await waitStep(page,1);await page.waitForTimeout(210);d=await gf(page);expect(d.railState).toBe('brush:0/4');expect(d.rail.opacity).toBeGreaterThan(.8);expect(d.rail.text).toContain('양치 0/4');expect(d.segments).toEqual(['0','0','0','0']);await snap(page,'GAMEFEEL-1-brush-rail.png');
  await brushQuadrant(page,0);await page.waitForTimeout(130);d=await gf(page);expect(d.railState).toBe('brush:1/4');expect(d.segments).toEqual(['1','0','0','0']);expect(d.lastPulse).toBe('brush:1');expect(d.lastText).toContain('양치 1/4');expect(d.badge.opacity).toBeGreaterThan(.5);await snap(page,'GAMEFEEL-1b-brush-success.png');
  await brushQuadrant(page,1);await brushQuadrant(page,2);await brushQuadrant(page,3);await waitStep(page,2);await page.waitForTimeout(210);d=await gf(page);expect(d.rail.mode).toBe('wash');expect(d.rail.opacity).toBeGreaterThan(.8);expect(d.rail.text).toContain('세수');await snap(page,'GAMEFEEL-2-facewash-rail.png');
  const start=await p(page,FACE_HOME[0],FACE_HOME[1]);await page.mouse.move(start.x,start.y);await page.mouse.down();
  for(const [x,y] of FACE_LOOP){const q=await p(page,x,y);await page.mouse.move(q.x,q.y,{steps:1});}
  d=await gf(page);expect(d.state.step).toBe(2);expect(d.fill).not.toBeNull();expect(d.fill).toBeGreaterThan(0);expect(d.fill).toBeLessThan(100);await snap(page,'GAMEFEEL-2b-facewash-progress.png');
  for(let i=0;i<6;i++){
    if((await gf(page)).state.step!==2)break;
    for(const [x,y] of FACE_LOOP){const q=await p(page,x,y);await page.mouse.move(q.x,q.y,{steps:1});}
  }
  await page.mouse.up();await waitStep(page,3);await page.waitForTimeout(210);
  d=await gf(page);expect(d.railState).toBe('nails:0/5');expect(d.rail.opacity).toBeGreaterThan(.8);expect(d.segments).toEqual(['0','0','0','0','0']);
  await drag(page,[CLIPPER_HOME,[950,235],NAILS[0]],2);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.clipped===1,null,{timeout:3000});await page.waitForTimeout(130);d=await gf(page);expect(d.railState).toBe('nails:1/5');expect(d.segments).toEqual(['1','0','0','0','0']);expect(d.lastPulse).toBe('nail:1');expect(d.badge.opacity).toBeGreaterThan(.5);await snap(page,'GAMEFEEL-3-nail-success.png');
  for(let i=1;i<NAILS.length;i++){await drag(page,[CLIPPER_HOME,[950,235],NAILS[i]],2);await page.waitForTimeout(65);}await waitStep(page,4);await page.waitForTimeout(130);d=await gf(page);expect(d.state.roundComplete).toBe(true);expect(d.lastPulse).toBe('done');expect(d.lastText).toBe('모두 완료 ✓');expect(d.badge.text).toBe('모두 완료 ✓');expect(d.badge.opacity).toBeGreaterThan(.5);expect(d.pulseCount).toBeGreaterThanOrEqual(6);expect(d.generated).toBe(0);await snap(page,'GAMEFEEL-4-complete.png');
});

test('R2 v17.31 compact mobile keeps game-feel HUD out of action area',async({page})=>{
  test.setTimeout(120000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});await page.setViewportSize({width:844,height:390});let d=await ready(page);expect(d.layout.scrollWidth).toBeLessThanOrEqual(d.layout.innerWidth+2);expect(d.rail.display).toBe('none');expect(d.badge.display).toBe('none');await snap(page,'GAMEFEEL-MOBILE-0-clean.png');
  await drag(page,[PASTE_HOME,[1110,560],PASTE_TARGET],2);await waitStep(page,1);d=await gf(page);expect(d.railState).toBe('brush:0/4');expect(d.rail.display).toBe('none');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#g1r2-v17-overlay')?.dataset.motionReduced==='1',null,{timeout:2500});await brushQuadrant(page,0);d=await gf(page);expect(d.state.mouthProgress[0]).toBeGreaterThanOrEqual(115);expect(d.lastPulse).toBe('brush:1');expect(d.badge.display).toBe('none');expect(d.generated).toBe(0);await snap(page,'GAMEFEEL-MOBILE-1-reduced-clean.png');
});
