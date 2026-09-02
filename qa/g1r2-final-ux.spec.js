const { test, expect } = require('@playwright/test');
const fs=require('fs');
const NAILS=[[825,223],[845,194],[863,181],[884,188],[903,207]];
const BRUSH_CENTER=[820,515];
const BRUSH_PATHS=[
  [[765,485],[800,485],[755,500],[800,500],[755,485],[800,485],[755,500]],
  [[850,485],[895,485],[845,500],[895,500],[845,485],[895,485],[845,500]],
  [[765,535],[800,535],[755,555],[800,555],[755,535],[800,535],[755,555]],
  [[850,535],[895,535],[845,555],[895,555],[845,535],[895,535],[845,555]]
];
const PASTE_HOME=[1155,500],BRUSH_PASTE_TARGET=[1015,645],BRUSH_HOME=[1080,505],FACE_HOME=[575,265],CLIPPER_HOME=[985,250];
const FACE_LOOP=[[790,330],[735,330],[845,330],[735,345],[845,345],[735,315],[845,315],[790,330]];

async function p(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('canvas'),r=c.getBoundingClientRect();return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};},{x,y});}
async function beginDrag(page,pts,steps=2){const q=[];for(const a of pts)q.push(await p(page,a[0],a[1]));await page.mouse.move(q[0].x,q[0].y);await page.mouse.down();for(const a of q.slice(1))await page.mouse.move(a.x,a.y,{steps});}
async function drag(page,pts,steps=1){await beginDrag(page,pts,steps);await page.mouse.up();}
async function waitStep(page,n){await page.waitForFunction(step=>window.__ADUGAME_DEBUG__?.()?.step===step,n,{timeout:12000});}
async function waitTransitionCount(page,n){await page.waitForFunction(min=>Number(document.querySelector('#g1r2-v17-overlay')?.dataset.motionTransitionCount||0)>=min,n,{timeout:3000});}
async function snap(page,name){await page.waitForTimeout(90);await page.screenshot({path:`qa/reports/g1r2-fast/${name}.png`});}

async function debug(page,name){
  const d=await page.evaluate(()=>{
    const root=document.querySelector('#g1r2-v17-overlay');
    const vis=sel=>{const e=document.querySelector(sel);return e?{display:getComputedStyle(e).display,opacity:parseFloat(getComputedStyle(e).opacity),left:e.style.left,top:e.style.top,width:e.style.width,height:e.style.height,text:e.textContent,kind:e.dataset.kind,borderColor:e.style.borderColor,background:e.style.background,boxShadow:e.style.boxShadow}:null;};
    const box=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),rr=root?.getBoundingClientRect();return{font:parseFloat(getComputedStyle(e).fontSize),top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,inside:!!rr&&r.left>=rr.left-1&&r.right<=rr.right+1&&r.top>=rr.top-1&&r.bottom<=rr.bottom+1,text:e.textContent};};
    const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const s=window.__ADUGAME_SCENE__?.();
    return{
      state:window.__ADUGAME_DEBUG__?.(),version:window.__ADUGAME_ART_SOURCE__?.G1R2?.version,generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,
      rootVersion:root?.dataset.version,finalReady:root?.dataset.toolHitAlignmentReady,alertReady:root?.dataset.finalAlertReady,visualReady:root?.dataset.visualPolishReady,
      motionReady:root?.dataset.motionReady,motionTransition:root?.dataset.motionTransition,motionTransitionCount:Number(root?.dataset.motionTransitionCount||0),
      motionAnimatedTransitionCount:Number(root?.dataset.motionAnimatedTransitionCount||0),motionReducedTransitionCount:Number(root?.dataset.motionReducedTransitionCount||0),
      motionLastMode:root?.dataset.motionLastMode||'',motionLastStep:root?.dataset.motionLastStep||'',motionNearTarget:root?.dataset.motionNearTarget||'',motionReduced:root?.dataset.motionReduced,
      motionMeta:window.__ADUGAME_ART_SOURCE__?.G1R2?.dynamicMotion,finalFeedback:root?.dataset.finalUxFeedback,finalUx:window.__ADUGAME_ART_SOURCE__?.G1R2?.dynamicUxFinal,
      cursor:vis('.g1v17-ux-cursor'),alert:vis('.g1v17-final-alert'),dropTarget:vis('.g1v17-paste-drop-target'),progressVisual:vis('.g1v17-ux-progress'),statusVisual:vis('.g1v17-ux-status'),faceVisual:vis('.g1v17-facewash-scene'),veil:vis('.g1v17-motion-veil'),
      washFeedbackOpacity:document.querySelector('.g1v17-wash-feedback')?.style.opacity,
      focus:focus?{left:focus.style.left,top:focus.style.top,width:focus.style.width,height:focus.style.height,opacity:focus.style.opacity,boxShadow:focus.style.boxShadow}:null,
      brushGuides:[...document.querySelectorAll('.g1v17-ux-brush-zone')].map(e=>({done:e.dataset.done,boxShadow:e.style.boxShadow})),
      nailGuides:[...document.querySelectorAll('.g1v17-ux-nail-target')].map(e=>({done:e.dataset.done,boxShadow:e.style.boxShadow})),
      readability:{progress:box('.g1v17-ux-progress'),status:box('.g1v17-ux-status'),alert:box('.g1v17-final-alert')},
      layout:{innerWidth,innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,canvas:rect(document.querySelector('canvas')),root:rect(root)},
      objects:{paste:s?.paste?{x:s.paste.x,y:s.paste.y,home:s.paste.home}:null,brush:s?.brush?{x:s.brush.x,y:s.brush.y,home:s.brush.home}:null,cloth:s?.cloth?{x:s.cloth.x,y:s.cloth.y,home:s.cloth.home}:null,clipper:s?.clipper?{x:s.clipper.x,y:s.clipper.y,home:s.clipper.home}:null,mouth:s?.mouth?{x:s.mouth.x,y:s.mouth.y}:null}
    };
  });
  fs.writeFileSync(`qa/reports/g1r2-fast/${name}.json`,JSON.stringify(d,null,2));return d;
}

async function ready(page,label='ready'){
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const r=document.querySelector('#g1r2-v17-overlay');return r?.dataset.ready==='1'&&r?.dataset.nailRaiseReady==='1'&&r?.dataset.faceWashReady==='1'&&r?.dataset.bathroomBackdropReady==='1'&&r?.dataset.uxReady==='1'&&r?.dataset.uxAlignmentReady==='1'&&r?.dataset.toolHitAlignmentReady==='1'&&r?.dataset.finalAlertReady==='1'&&r?.dataset.visualPolishReady==='1'&&r?.dataset.motionReady==='1'&&r?.dataset.version==='17.30'&&window.__ADUGAME_ART_SOURCE__?.G1R2?.version==='v17.30';},null,{timeout:30000});
  await page.waitForTimeout(120);
  const d=await debug(page,`DEBUG-${label}`);
  expect(d.generated).toBe(0);expect(d.motionMeta?.stepTransition).toBe(true);expect(d.motionMeta?.targetProximityFeedback).toBe(true);expect(d.motionMeta?.reducedMotionAware).toBe(true);expect(d.motionMeta?.stableTransitionTelemetry).toBe(true);
  expect(d.finalUx?.visibleToolHitAlignment).toBe(true);expect(d.finalUx?.persistentMissAlert).toBe(true);expect(d.finalUx?.missSingleMessageMode).toBe(true);
  expect(d.finalUx?.faceWashFraming?.width).toBe('78%');expect(d.finalUx?.faceWashBackdropOpacity).toBe(.08);
  expect(Math.abs(d.objects.paste.x-PASTE_HOME[0])).toBeLessThan(3);expect(Math.abs(d.objects.brush.x-BRUSH_PASTE_TARGET[0])).toBeLessThan(3);expect(Math.abs(d.objects.mouth.x-BRUSH_CENTER[0])).toBeLessThan(2);expect(Math.abs(d.objects.mouth.y-BRUSH_CENTER[1])).toBeLessThan(2);
  expect(d.readability.progress.inside).toBe(true);expect(d.readability.status.inside).toBe(true);return d;
}

async function brushQuadrant(page,index,evidence=false,prefix=''){
  const pts=BRUSH_PATHS[index];await beginDrag(page,[BRUSH_HOME,pts[0]],2);await page.waitForTimeout(60);
  if(evidence){const m=await debug(page,`DEBUG-${prefix}brush-dragging`);expect(m.state.g1r2V17Input.active).toBe('brush');expect(m.cursor.display).toBe('flex');expect(m.cursor.kind).toBe('brush');expect(m.motionNearTarget).toBe(`brush:${index}`);expect(m.brushGuides[index].boxShadow).toContain('rgba(41, 171, 126');await snap(page,`${prefix}STEP-1b-brush-dragging`);}
  for(const a of pts.slice(1)){const q=await p(page,a[0],a[1]);await page.mouse.move(q.x,q.y,{steps:1});}
  await page.mouse.up();await page.waitForTimeout(80);const d=await debug(page,`DEBUG-${prefix}brush-q${index}`);expect(d.state.mouthProgress[index]).toBeGreaterThanOrEqual(115);expect(d.brushGuides[index].done).toBe('1');
}

async function washFace(page){
  const start=await p(page,FACE_HOME[0],FACE_HOME[1]),first=await p(page,735,330);await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(first.x,first.y,{steps:2});await page.waitForTimeout(60);
  const m=await debug(page,'DEBUG-facewash-dragging');expect(m.state.g1r2V17Input.active).toBe('cloth');expect(m.cursor.display).toBe('flex');expect(m.cursor.kind).toBe('cloth');expect(Number(m.washFeedbackOpacity)).toBeGreaterThan(.5);expect(m.motionNearTarget).toBe('face');expect(m.focus.boxShadow).toContain('rgba(41, 171, 126');await snap(page,'STEP-2b-facewash-dragging');
  for(let i=0;i<4;i++){for(const [x,y] of FACE_LOOP){const q=await p(page,x,y);await page.mouse.move(q.x,q.y,{steps:1});}}await page.mouse.up();await waitStep(page,3);
}

test('R2 v17.30 desktop full dynamic UX + durable transition evidence',async({page})=>{
  test.setTimeout(300000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});const start=await ready(page,'desktop-ready');expect(start.state.step).toBe(0);await snap(page,'STEP-0-toothpaste');
  await drag(page,[PASTE_HOME,[900,500]]);await page.waitForTimeout(150);let miss=await debug(page,'DEBUG-toothpaste-miss');expect(miss.state.step).toBe(0);expect(miss.finalFeedback).toBe('paste-miss');expect(miss.alert.opacity).toBeGreaterThan(.9);expect(miss.alert.text).toContain('여기가 아니에요');expect(miss.dropTarget.text).toBe('여기');expect(miss.progressVisual.opacity).toBeLessThan(.1);expect(miss.statusVisual.opacity).toBeLessThan(.1);expect(miss.readability.alert.inside).toBe(true);await snap(page,'STEP-0a-toothpaste-miss-feedback');
  await beginDrag(page,[PASTE_HOME,[1110,560]],2);await page.waitForTimeout(50);let pm=await debug(page,'DEBUG-toothpaste-dragging');expect(pm.state.g1r2V17Input.active).toBe('paste');expect(pm.cursor.display).toBe('flex');expect(pm.cursor.kind).toBe('paste');await snap(page,'STEP-0b-toothpaste-dragging');
  const near=await p(page,1045,620);await page.mouse.move(near.x,near.y,{steps:2});await page.waitForTimeout(50);pm=await debug(page,'DEBUG-toothpaste-near-target');expect(pm.motionNearTarget).toBe('paste');expect(pm.dropTarget.opacity).toBeGreaterThan(.9);expect(pm.dropTarget.borderColor).toContain('41, 171, 126');await snap(page,'STEP-0c-toothpaste-target-contact');
  const tgt=await p(page,BRUSH_PASTE_TARGET[0],BRUSH_PASTE_TARGET[1]);await page.mouse.move(tgt.x,tgt.y,{steps:2});await page.mouse.up();await waitStep(page,1);await waitTransitionCount(page,1);await snap(page,'STEP-0d-transition-to-brush');let b=await debug(page,'DEBUG-brush-ready');expect(Math.abs(b.objects.brush.x-BRUSH_HOME[0])).toBeLessThan(3);expect(b.motionLastMode).toBe('animated');expect(b.motionLastStep).toBe('1');expect(b.motionAnimatedTransitionCount).toBeGreaterThanOrEqual(1);await snap(page,'STEP-1-brush');
  await brushQuadrant(page,0,true);await brushQuadrant(page,1);await brushQuadrant(page,2);await brushQuadrant(page,3);await waitStep(page,2);await waitTransitionCount(page,2);const f=await debug(page,'DEBUG-facewash-ready');expect(f.motionLastStep).toBe('2');expect(f.motionLastMode).toBe('animated');expect(Math.abs(f.objects.cloth.x-FACE_HOME[0])).toBeLessThan(3);expect(Math.abs(f.objects.cloth.y-FACE_HOME[1])).toBeLessThan(3);expect(f.faceVisual.left).toBe('54.6%');expect(f.faceVisual.top).toBe('33.6%');expect(f.faceVisual.width).toBe('78%');expect(f.faceVisual.height).toBe('90%');await snap(page,'STEP-2-facewash');
  await washFace(page);await waitTransitionCount(page,3);const n=await debug(page,'DEBUG-nails-ready');expect(n.motionLastStep).toBe('3');expect(Math.abs(n.objects.clipper.x-CLIPPER_HOME[0])).toBeLessThan(4);expect(n.nailGuides.map(x=>x.done)).toEqual(['0','0','0','0','0']);await snap(page,'STEP-3-nails-focused');
  for(let i=0;i<NAILS.length;i++){
    if(i===0){await beginDrag(page,[CLIPPER_HOME,[950,235],NAILS[i]],2);await page.waitForTimeout(60);const activeNail=await debug(page,'DEBUG-nail-target-contact');expect(activeNail.motionNearTarget).toBe('nail:0');expect(activeNail.nailGuides[0].boxShadow).toContain('rgba(41, 171, 126');await snap(page,'STEP-3a-nail-clipping');await page.mouse.up();}
    else await drag(page,[CLIPPER_HOME,[950,235],NAILS[i]]);
    await page.waitForTimeout(80);const d=await debug(page,`DEBUG-nail-${i+1}`);expect(d.state.clipped).toBe(i+1);expect(d.nailGuides.slice(0,i+1).every(x=>x.done==='1')).toBe(true);if(i===2)await snap(page,'STEP-3b-nails-3of5');
  }
  await waitStep(page,4);await waitTransitionCount(page,4);await snap(page,'STEP-4-done');const done=await debug(page,'DEBUG-done');expect(done.state.mouthProgress.every(v=>v>=115)).toBe(true);expect(done.state.faceWash).toBeGreaterThanOrEqual(360);expect(done.state.clipped).toBe(5);expect(done.state.roundComplete).toBe(true);expect(done.motionTransitionCount).toBeGreaterThanOrEqual(4);expect(done.motionLastStep).toBe('4');expect(done.motionAnimatedTransitionCount).toBeGreaterThanOrEqual(4);expect(done.state.g1r2V17Input.pasteDown).toBeGreaterThanOrEqual(2);expect(done.state.g1r2V17Input.brushMove).toBeGreaterThan(0);expect(done.state.g1r2V17Input.clothMove).toBeGreaterThan(0);expect(done.state.g1r2V17Input.clipperUp).toBeGreaterThanOrEqual(5);expect(done.generated).toBe(0);
});

test('R2 v17.30 mobile landscape scaled input + reduced-motion history',async({page})=>{
  test.setTimeout(120000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});await page.setViewportSize({width:844,height:390});const start=await ready(page,'mobile-ready');
  expect(start.layout.scrollWidth).toBeLessThanOrEqual(start.layout.innerWidth+2);expect(start.layout.canvas.width).toBeGreaterThan(300);expect(start.layout.canvas.height).toBeGreaterThan(160);expect(start.readability.status.inside).toBe(true);expect(start.progressVisual.opacity).toBeLessThan(.1);await snap(page,'MOBILE-0-toothpaste');
  await beginDrag(page,[PASTE_HOME,[1045,620]],2);await page.waitForTimeout(50);let near=await debug(page,'DEBUG-mobile-paste-near');expect(near.motionNearTarget).toBe('paste');const tgt=await p(page,BRUSH_PASTE_TARGET[0],BRUSH_PASTE_TARGET[1]);await page.mouse.move(tgt.x,tgt.y,{steps:2});await page.mouse.up();await waitStep(page,1);await waitTransitionCount(page,1);let step1=await debug(page,'DEBUG-mobile-brush-ready');expect(step1.state.step).toBe(1);expect(step1.motionLastMode).toBe('animated');expect(step1.motionLastStep).toBe('1');expect(Math.abs(step1.objects.brush.x-BRUSH_HOME[0])).toBeLessThan(3);expect(step1.progressVisual.opacity).toBeLessThan(.1);await snap(page,'MOBILE-1-brush');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#g1r2-v17-overlay')?.dataset.motionReduced==='1',null,{timeout:2000});
  await brushQuadrant(page,0,true,'MOBILE-');await brushQuadrant(page,1,false,'MOBILE-');await brushQuadrant(page,2,false,'MOBILE-');await brushQuadrant(page,3,false,'MOBILE-');await waitStep(page,2);await waitTransitionCount(page,2);const reducedState=await debug(page,'DEBUG-mobile-reduced-transition');expect(reducedState.motionReduced).toBe('1');expect(reducedState.motionLastMode).toBe('reduced');expect(reducedState.motionLastStep).toBe('2');expect(reducedState.motionReducedTransitionCount).toBeGreaterThanOrEqual(1);expect(reducedState.state.step).toBe(2);expect(reducedState.progressVisual.opacity).toBeLessThan(.1);expect(reducedState.generated).toBe(0);await snap(page,'MOBILE-2-reduced-motion-facewash');
});
