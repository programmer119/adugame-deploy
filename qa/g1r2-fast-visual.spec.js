const { test, expect } = require('@playwright/test');
const fs=require('fs');
const OFFICIAL='https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296';

async function p(page,x,y){
  return page.evaluate(({x,y})=>{const c=document.querySelector('canvas');const r=c.getBoundingClientRect();return{x:r.left+x/1280*r.width,y:r.top+y/720*r.height};},{x,y});
}
async function clickLogical(page,x,y){const q=await p(page,x,y);await page.mouse.click(q.x,q.y);}
async function dragLogical(page,pts){
  const mapped=[];for(const [x,y] of pts)mapped.push(await p(page,x,y));
  await page.mouse.move(mapped[0].x,mapped[0].y);await page.mouse.down();
  for(const q of mapped.slice(1))await page.mouse.move(q.x,q.y,{steps:5});
  await page.mouse.up();
}
async function waitText(page,text){await page.waitForFunction(t=>document.querySelector('#g1r2-v17-overlay')?.textContent?.includes(t),text,{timeout:10000});}
async function ready(page){
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#g1r2-v17-overlay')?.dataset.ready==='1',null,{timeout:25000});
  await page.waitForTimeout(450);
  expect(await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets)).toBe(0);
  expect(await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.version)).toBe('v17.2');
}

test('actual G1R2 v17.2 visual + full wash interaction',async({page})=>{
  test.setTimeout(90000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});
  await ready(page);
  await page.screenshot({path:'qa/reports/g1r2-fast/STEP-0-wet.png',fullPage:true});

  await clickLogical(page,470,455);await waitText(page,'비누를 손 위로 가져와요');await page.waitForTimeout(180);
  await page.screenshot({path:'qa/reports/g1r2-fast/STEP-1-soap.png',fullPage:true});

  await dragLogical(page,[[930,500],[840,490],[750,475],[650,455]]);await waitText(page,'손을 좌우로 충분히 문질러요');await page.waitForTimeout(180);
  await page.screenshot({path:'qa/reports/g1r2-fast/STEP-2-scrub.png',fullPage:true});

  const scrub=[[600,455],[710,455],[585,455],[715,455],[585,455],[715,455],[585,455],[715,455],[590,455]];
  await dragLogical(page,scrub);await waitText(page,'깨끗한 물로 한 번 더 헹궈요');await page.waitForTimeout(180);
  await page.screenshot({path:'qa/reports/g1r2-fast/STEP-3-rinse.png',fullPage:true});

  await clickLogical(page,470,455);await waitText(page,'수건으로 물기를 닦아요');await page.waitForTimeout(180);
  await page.screenshot({path:'qa/reports/g1r2-fast/STEP-4-towel.png',fullPage:true});

  await dragLogical(page,[[265,500],[470,480],[590,460],[710,455],[585,455],[715,455],[585,455],[715,455]]);
  await waitText(page,'깨끗하게 끝!');await page.waitForTimeout(120);
  await page.screenshot({path:'qa/reports/g1r2-fast/STEP-5-done.png',fullPage:true});
});

test('R2 v17.2 initial frame beside benchmark',async({page})=>{
  test.setTimeout(90000);fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});
  await ready(page);
  const current=await page.screenshot({fullPage:true});const data=`data:image/png;base64,${current.toString('base64')}`;
  await page.setViewportSize({width:1280,height:720});
  await page.setContent(`<!doctype html><style>*{box-sizing:border-box}body{margin:0;background:#121212;font-family:Arial;color:#fff;overflow:hidden}.w{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px}.s{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden;padding:12px}.l{position:absolute;left:12px;top:10px;background:#000c;border-radius:7px;padding:8px 11px;font-size:15px;font-weight:800;z-index:2}img{max-width:100%;max-height:100%;object-fit:contain}</style><div class=w><div class=s><div class=l>BABY PANDA · ACTION COMPOSITION</div><img id=o src="${OFFICIAL}"></div><div class=s><div class=l>ADUGAME · ACTUAL R2 v17.2</div><img src="${data}"></div></div>`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const x=document.getElementById('o');return x?.complete&&x.naturalWidth>0},null,{timeout:12000});
  await page.screenshot({path:'qa/reports/g1r2-fast/COMPARE-v17.2.png'});
});
