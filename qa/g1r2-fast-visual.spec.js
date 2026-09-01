const { test, expect } = require('@playwright/test');
const fs=require('fs');
const OFFICIAL='https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296';

async function p(page,x,y){return page.evaluate(({x,y})=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};},{x,y});}
async function drag(page,pts,steps=3){const q=[];for(const a of pts)q.push(await p(page,a[0],a[1]));await page.mouse.move(q[0].x,q[0].y);await page.mouse.down();for(const a of q.slice(1))await page.mouse.move(a.x,a.y,{steps});await page.mouse.up();}
async function waitStep(page,n){await page.waitForFunction(step=>window.__ADUGAME_DEBUG__?.()?.step===step,n,{timeout:12000});}
async function snap(page,name){await page.waitForTimeout(160);await page.screenshot({path:`qa/reports/g1r2-fast/${name}.png`,fullPage:true});}
async function debug(page,name){const d=await page.evaluate(()=>({state:window.__ADUGAME_DEBUG__?.(),version:window.__ADUGAME_ART_SOURCE__?.G1R2?.version,generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,ready:document.querySelector('#g1r2-v17-overlay')?.dataset.ready}));fs.writeFileSync(`qa/reports/g1r2-fast/${name}.json`,JSON.stringify(d,null,2));return d;}
async function ready(page){
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#g1r2-v17-overlay')?.dataset.ready==='1',null,{timeout:30000});
  await page.waitForTimeout(350);
  const d=await debug(page,'DEBUG-ready');expect(d.generated).toBe(0);expect(d.version).toBe('v17.3');expect(d.state?.benchmarkV5).toBe('brush-face-nails');expect(d.state?.step).toBe(0);
}

test('actual G1R2 v17.3 full brush-face-nails interaction',async({page})=>{
  test.setTimeout(110000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});await ready(page);await snap(page,'STEP-0-toothpaste');

  await drag(page,[[910,555],[960,555],[1015,555],[1070,555]],4);await waitStep(page,1);await snap(page,'STEP-1-brush');

  const brushing=[
    [1070,555],[760,335],[720,330],[770,330],[725,345],[770,345],[725,330],
    [825,335],[865,330],[815,330],[860,345],[815,345],[860,330],
    [760,395],[720,390],[770,390],[725,410],[770,410],[725,390],
    [825,395],[865,390],[815,390],[860,410],[815,410],[860,390]
  ];
  await drag(page,brushing,2);await waitStep(page,2);await snap(page,'STEP-2-facewash');

  const washing=[[1060,555],[790,330],[735,315],[835,315],[735,345],[840,345],[740,300],[835,350],[745,330],[835,330],[750,310]];
  await drag(page,washing,3);await waitStep(page,3);await snap(page,'STEP-3-nails');

  const nails=[[894,462],[914,452],[936,450],[958,454],[979,464]];
  for(let i=0;i<nails.length;i++){
    await drag(page,[[1070,555],[1020,520],nails[i]],4);
    await page.waitForTimeout(220);
    const state=await page.evaluate(()=>window.__ADUGAME_DEBUG__?.());expect(state.clipped).toBe(i+1);
    if(i===2)await snap(page,'STEP-3b-nails-3of5');
  }
  await waitStep(page,4);await snap(page,'STEP-4-done');await debug(page,'DEBUG-done');
});

test('R2 v17.3 initial frame beside Baby Panda benchmark',async({page})=>{
  test.setTimeout(90000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});await ready(page);
  const current=await page.screenshot({fullPage:true});const data=`data:image/png;base64,${current.toString('base64')}`;
  await page.setViewportSize({width:1280,height:720});
  await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0;background:#121212;font-family:Arial;color:#fff;overflow:hidden}.w{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px}.s{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden;padding:12px}.l{position:absolute;left:12px;top:10px;background:#000c;border-radius:7px;padding:8px 11px;font-size:15px;font-weight:800;z-index:2}img{max-width:100%;max-height:100%;object-fit:contain}</style><div class=w><div class=s><div class=l>BABY PANDA · ACTION COMPOSITION</div><img id=o src="${OFFICIAL}"></div><div class=s><div class=l>ADUGAME · ACTUAL R2 v17.3</div><img src="${data}"></div></div>`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const x=document.getElementById('o');return x?.complete&&x.naturalWidth>0},null,{timeout:12000});
  await page.screenshot({path:'qa/reports/g1r2-fast/COMPARE-v17.3.png'});
});
