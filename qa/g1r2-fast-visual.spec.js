const { test, expect } = require('@playwright/test');
const fs=require('fs');
const OFFICIAL='https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296';
const NAILS=[[825,223],[845,194],[863,181],[884,188],[903,207]];
const PASTE_HOME=[980,490], BRUSH_PASTE_TARGET=[780,590], BRUSH_HOME=[1000,450], FACE_HOME=[640,260], CLIPPER_HOME=[985,250];
const FACE_LOOP=[[790,330],[735,330],[845,330],[735,345],[845,345],[735,315],[845,315],[790,330]];

async function p(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};},{x,y});}
async function drag(page,pts,steps=1){const q=[];for(const a of pts)q.push(await p(page,a[0],a[1]));await page.mouse.move(q[0].x,q[0].y);await page.mouse.down();for(const a of q.slice(1))await page.mouse.move(a.x,a.y,{steps});await page.mouse.up();}
async function waitStep(page,n){await page.waitForFunction(step=>window.__ADUGAME_DEBUG__?.()?.step===step,n,{timeout:12000});}
async function snap(page,name){await page.waitForTimeout(80);await page.screenshot({path:`qa/reports/g1r2-fast/${name}.png`});}
async function debug(page,name){const d=await page.evaluate(()=>({
  state:window.__ADUGAME_DEBUG__?.(),version:window.__ADUGAME_ART_SOURCE__?.G1R2?.version,generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,
  ready:document.querySelector('#g1r2-v17-overlay')?.dataset.ready,rootVersion:document.querySelector('#g1r2-v17-overlay')?.dataset.version,
  nailRaiseReady:document.querySelector('#g1r2-v17-overlay')?.dataset.nailRaiseReady,faceWashReady:document.querySelector('#g1r2-v17-overlay')?.dataset.faceWashReady,
  pasteDisplay:document.querySelector('.g1v17-paste')?.style.display,brushDisplay:document.querySelector('.g1v17-brush')?.style.display,clothDisplay:document.querySelector('.g1v17-cloth')?.style.display,
  washFeedbackOpacity:document.querySelector('.g1v17-wash-feedback')?.style.opacity,
  objects:(()=>{const s=window.__ADUGAME_SCENE__?.();return {paste:s?.paste?{x:s.paste.x,y:s.paste.y,home:s.paste.home}:null,brush:s?.brush?{x:s.brush.x,y:s.brush.y,home:s.brush.home}:null,cloth:s?.cloth?{x:s.cloth.x,y:s.cloth.y,home:s.cloth.home}:null,clipper:s?.clipper?{x:s.clipper.x,y:s.clipper.y,home:s.clipper.home}:null,nails:(s?.nails||[]).map(n=>({x:n.x,y:n.y,i:n.nailIndex,active:n.active}))};})()
}));fs.writeFileSync(`qa/reports/g1r2-fast/${name}.json`,JSON.stringify(d,null,2));return d;}
async function ready(page){
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const r=document.querySelector('#g1r2-v17-overlay');return r?.dataset.ready==='1'&&r?.dataset.nailRaiseReady==='1'&&r?.dataset.faceWashReady==='1'&&r?.dataset.version==='17.22'&&window.__ADUGAME_ART_SOURCE__?.G1R2?.version==='v17.22';},null,{timeout:30000});
  await page.waitForTimeout(180);const d=await debug(page,'DEBUG-ready');expect(d.generated).toBe(0);expect(d.version).toBe('v17.22');expect(d.rootVersion).toBe('17.22');expect(d.nailRaiseReady).toBe('1');expect(d.faceWashReady).toBe('1');expect(d.state?.benchmarkV5).toBe('brush-face-nails');expect(d.state?.g1r2V17Input).toBeTruthy();
  expect(d.pasteDisplay).toBe('none');expect(d.brushDisplay).toBe('none');return d;
}
async function brushQuadrant(page,name,pts,index){
  await drag(page,[BRUSH_HOME,...pts]);await page.waitForTimeout(80);const d=await debug(page,`DEBUG-brush-${name}`);expect(d.state.mouthProgress[index]).toBeGreaterThanOrEqual(115);await page.waitForTimeout(180);
}
async function washFaceWithDragEvidence(page){
  const start=await p(page,FACE_HOME[0],FACE_HOME[1]);const first=await p(page,735,330);
  await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(first.x,first.y,{steps:2});await page.waitForTimeout(70);
  const moving=await debug(page,'DEBUG-facewash-dragging');expect(moving.state.g1r2V17Input.active).toBe('cloth');expect(moving.clothDisplay).toBe('none');expect(Number(moving.washFeedbackOpacity)).toBeGreaterThan(.5);await snap(page,'STEP-2b-facewash-dragging');
  for(let i=0;i<4;i++){for(const [x,y] of FACE_LOOP){const q=await p(page,x,y);await page.mouse.move(q.x,q.y,{steps:1});}}
  await page.mouse.up();await waitStep(page,3);const done=await debug(page,'DEBUG-facewash-done');expect(done.state.faceWash).toBeGreaterThanOrEqual(360);return done;
}
async function makeCompare(page,initial){const data=`data:image/png;base64,${initial.toString('base64')}`;await page.setViewportSize({width:1280,height:720});await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0;background:#121212;font-family:Arial;color:#fff;overflow:hidden}.w{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px}.s{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden;padding:12px}.l{position:absolute;left:12px;top:10px;background:#000c;border-radius:7px;padding:8px 11px;font-size:15px;font-weight:800;z-index:2}img{max-width:100%;max-height:100%;object-fit:contain}</style><div class=w><div class=s><div class=l>BABY PANDA · ACTION COMPOSITION</div><img id=o src="${OFFICIAL}"></div><div class=s><div class=l>ADUGAME · ACTUAL R2 v17.22</div><img src="${data}"></div></div>`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>{const x=document.getElementById('o');return x?.complete&&x.naturalWidth>0},null,{timeout:12000});await page.screenshot({path:'qa/reports/g1r2-fast/COMPARE-v17.22.png'});}

test('R2 v17.22 immersive authored-tool interaction + visual evidence',async({page})=>{
  test.setTimeout(300000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});
  const start=await ready(page);expect(start.state.step).toBe(0);expect(Math.abs(start.objects.paste.x-PASTE_HOME[0])).toBeLessThan(4);expect(Math.abs(start.objects.brush.x-BRUSH_PASTE_TARGET[0])).toBeLessThan(4);await snap(page,'STEP-0-toothpaste');const initial=await page.screenshot();
  await drag(page,[PASTE_HOME,[900,535],BRUSH_PASTE_TARGET]);await waitStep(page,1);await page.waitForTimeout(180);const brushReady=await debug(page,'DEBUG-brush-ready');expect(Math.abs(brushReady.objects.brush.x-BRUSH_HOME[0])).toBeLessThan(4);expect(Math.abs(brushReady.objects.brush.y-BRUSH_HOME[1])).toBeLessThan(4);expect(brushReady.brushDisplay).toBe('none');await snap(page,'STEP-1-brush');
  await brushQuadrant(page,'q0',[[745,330],[775,330],[735,345],[775,345],[735,330],[775,330],[735,345]],0);
  await brushQuadrant(page,'q1',[[825,330],[865,330],[815,345],[865,345],[815,330],[865,330],[815,345]],1);
  await brushQuadrant(page,'q2',[[745,390],[775,390],[735,410],[775,410],[735,390],[775,390],[735,410]],2);
  await brushQuadrant(page,'q3',[[825,390],[865,390],[815,410],[865,410],[815,390],[865,390],[815,410]],3);
  await waitStep(page,2);await page.waitForTimeout(150);const atFace=await debug(page,'DEBUG-facewash-ready');expect(Math.abs(atFace.objects.cloth.x-FACE_HOME[0])).toBeLessThan(4);expect(Math.abs(atFace.objects.cloth.y-FACE_HOME[1])).toBeLessThan(4);expect(atFace.clothDisplay).toBe('none');expect(Number(atFace.washFeedbackOpacity||0)).toBeLessThan(.1);await snap(page,'STEP-2-facewash');
  await washFaceWithDragEvidence(page);await page.waitForTimeout(120);const nailReady=await debug(page,'DEBUG-nails-ready');expect(Math.abs(nailReady.objects.clipper.x-CLIPPER_HOME[0])).toBeLessThan(4);expect(Math.abs(nailReady.objects.clipper.y-CLIPPER_HOME[1])).toBeLessThan(4);await snap(page,'STEP-3-nails-focused');
  for(let i=0;i<NAILS.length;i++){await drag(page,[CLIPPER_HOME,[950,235],[925,215],NAILS[i]]);await page.waitForTimeout(90);const d=await debug(page,`DEBUG-nail-${i+1}`);expect(d.state.clipped).toBe(i+1);if(i===2)await snap(page,'STEP-3b-nails-3of5');}
  await waitStep(page,4);await snap(page,'STEP-4-done');const done=await debug(page,'DEBUG-done');expect(done.state.g1r2V17Input.pasteDown).toBeGreaterThan(0);expect(done.state.g1r2V17Input.brushMove).toBeGreaterThan(0);expect(done.state.g1r2V17Input.clothMove).toBeGreaterThan(0);expect(done.state.g1r2V17Input.clipperUp).toBeGreaterThanOrEqual(5);expect(done.generated).toBe(0);
  await makeCompare(page,initial);
});
