const { test, expect } = require('@playwright/test');
const fs=require('fs');
const OFFICIAL='https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296';
const NAILS=[[665,568],[680,558],[695,554],[710,558],[725,568]];

async function p(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};},{x,y});}
async function drag(page,pts,steps=2){const q=[];for(const a of pts)q.push(await p(page,a[0],a[1]));await page.mouse.move(q[0].x,q[0].y);await page.mouse.down();for(const a of q.slice(1))await page.mouse.move(a.x,a.y,{steps});await page.mouse.up();}
async function waitStep(page,n){await page.waitForFunction(step=>window.__ADUGAME_DEBUG__?.()?.step===step,n,{timeout:12000});}
async function snap(page,name){await page.waitForTimeout(100);await page.screenshot({path:`qa/reports/g1r2-fast/${name}.png`,fullPage:true});}
async function debug(page,name){const d=await page.evaluate(()=>({state:window.__ADUGAME_DEBUG__?.(),version:window.__ADUGAME_ART_SOURCE__?.G1R2?.version,generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,ready:document.querySelector('#g1r2-v17-overlay')?.dataset.ready,objects:(()=>{const s=window.__ADUGAME_SCENE__?.();return {paste:s?.paste?{x:s.paste.x,y:s.paste.y}:null,brush:s?.brush?{x:s.brush.x,y:s.brush.y}:null,cloth:s?.cloth?{x:s.cloth.x,y:s.cloth.y}:null,clipper:s?.clipper?{x:s.clipper.x,y:s.clipper.y}:null,nails:(s?.nails||[]).map(n=>({x:n.x,y:n.y,i:n.nailIndex,active:n.active}))};})()}));fs.writeFileSync(`qa/reports/g1r2-fast/${name}.json`,JSON.stringify(d,null,2));return d;}
async function ready(page){await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#g1r2-v17-overlay')?.dataset.ready==='1',null,{timeout:30000});await page.waitForTimeout(220);const d=await debug(page,'DEBUG-ready');expect(d.generated).toBe(0);expect(d.version).toBe('v17.6');expect(d.state?.benchmarkV5).toBe('brush-face-nails');expect(d.state?.g1r2V17Input).toBeTruthy();return d;}
async function brushQuadrant(page,name,pts,index){await drag(page,[[1040,570],...pts],1);await page.waitForTimeout(120);const d=await debug(page,`DEBUG-brush-${name}`);expect(d.state.mouthProgress[index]).toBeGreaterThanOrEqual(115);}
async function washFaceUntilDone(page){let before=-1;for(let i=0;i<4;i++){const state=await page.evaluate(()=>window.__ADUGAME_DEBUG__?.());if(state?.step===3)return state;if(state?.step!==2)throw new Error(`expected facewash step 2, got ${state?.step}`);await drag(page,[[1110,420],[790,330],[735,330],[845,330],[735,345],[845,345],[735,315],[845,315],[790,330]],1);await page.waitForTimeout(130);const d=await debug(page,`DEBUG-facewash-${i+1}`);if(d.state.step===3)return d.state;expect(d.state.faceWash).toBeGreaterThan(before);before=d.state.faceWash;}await waitStep(page,3);return page.evaluate(()=>window.__ADUGAME_DEBUG__?.());}

test('R2 v17.6 toothpaste-brush-facewash chain',async({page})=>{
  test.setTimeout(105000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});const start=await ready(page);expect(start.state.step).toBe(0);await snap(page,'STEP-0-toothpaste');
  await drag(page,[[880,570],[930,570],[985,570],[1040,570]],1);await waitStep(page,1);await snap(page,'STEP-1-brush');
  await brushQuadrant(page,'q0',[[745,330],[775,330],[735,345],[775,345],[735,330],[775,330],[735,345]],0);
  await brushQuadrant(page,'q1',[[825,330],[865,330],[815,345],[865,345],[815,330],[865,330],[815,345]],1);
  await brushQuadrant(page,'q2',[[745,390],[775,390],[735,410],[775,410],[735,390],[775,390],[735,410]],2);
  await brushQuadrant(page,'q3',[[825,390],[865,390],[815,410],[865,410],[815,390],[865,390],[815,410]],3);
  await waitStep(page,2);await snap(page,'STEP-2-facewash');
  const faceDone=await washFaceUntilDone(page);expect(faceDone.step).toBe(3);expect(faceDone.faceWash).toBeGreaterThanOrEqual(360);await snap(page,'STEP-3-nails');const d=await debug(page,'DEBUG-chain-done');
  expect(d.state.g1r2V17Input.pasteDown).toBe(1);expect(d.state.g1r2V17Input.brushMove).toBeGreaterThan(0);expect(d.state.g1r2V17Input.clothMove).toBeGreaterThan(0);
});

test('R2 v17.6 nail clipper input 5 of 5',async({page})=>{
  test.setTimeout(95000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});await ready(page);
  await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__?.();s.step=3;s.clipped.clear();s.clipper.setPosition(1110,270);s.clipper.home={x:1110,y:270};});await page.waitForTimeout(180);await snap(page,'STEP-3-nails-focused');
  for(let i=0;i<NAILS.length;i++){
    await drag(page,[[1110,270],[1000,340],[880,430],[770,510],NAILS[i]],1);await page.waitForTimeout(160);
    const d=await debug(page,`DEBUG-nail-${i+1}`);expect(d.state.clipped).toBe(i+1);if(i===2)await snap(page,'STEP-3b-nails-3of5');
  }
  await waitStep(page,4);await snap(page,'STEP-4-done');const done=await debug(page,'DEBUG-done');expect(done.state.g1r2V17Input.clipperDown).toBeGreaterThanOrEqual(5);expect(done.state.g1r2V17Input.clipperUp).toBeGreaterThanOrEqual(5);
});

test('R2 v17.6 initial frame beside Baby Panda benchmark',async({page})=>{
  test.setTimeout(65000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});await ready(page);const current=await page.screenshot({fullPage:true});const data=`data:image/png;base64,${current.toString('base64')}`;
  await page.setViewportSize({width:1280,height:720});await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0;background:#121212;font-family:Arial;color:#fff;overflow:hidden}.w{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px}.s{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden;padding:12px}.l{position:absolute;left:12px;top:10px;background:#000c;border-radius:7px;padding:8px 11px;font-size:15px;font-weight:800;z-index:2}img{max-width:100%;max-height:100%;object-fit:contain}</style><div class=w><div class=s><div class=l>BABY PANDA · ACTION COMPOSITION</div><img id=o src="${OFFICIAL}"></div><div class=s><div class=l>ADUGAME · ACTUAL R2 v17.6</div><img src="${data}"></div></div>`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>{const x=document.getElementById('o');return x?.complete&&x.naturalWidth>0},null,{timeout:12000});await page.screenshot({path:'qa/reports/g1r2-fast/COMPARE-v17.6.png'});
});
