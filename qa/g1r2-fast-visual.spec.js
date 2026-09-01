const { test, expect } = require('@playwright/test');
const fs=require('fs');
const OFFICIAL='https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296';

test('actual G1R2 v17 + benchmark side-by-side',async({page})=>{
  test.setTimeout(90000);
  fs.mkdirSync('qa/reports/g1r2-fast',{recursive:true});
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#g1r2-v17-overlay')?.dataset.ready==='1',null,{timeout:25000});
  await page.waitForTimeout(800);
  const generated=await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets);
  expect(generated).toBe(0);
  const version=await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.version);
  expect(version).toBe('v17.0');
  const current=await page.screenshot({path:'qa/reports/g1r2-fast/G1R2-v17.png',fullPage:true});
  const data=`data:image/png;base64,${current.toString('base64')}`;

  await page.setViewportSize({width:1280,height:720});
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;background:#121212;font-family:Arial;color:#fff;overflow:hidden}
    .w{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px}
    .s{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden;padding:12px}
    .l{position:absolute;left:12px;top:10px;background:#000c;border-radius:7px;padding:8px 11px;font-size:15px;font-weight:800;z-index:2}
    img{max-width:100%;max-height:100%;object-fit:contain}
  </style></head><body><div class="w"><div class="s"><div class="l">BABY PANDA · ACTION COMPOSITION</div><img id="o" src="${OFFICIAL}"></div><div class="s"><div class="l">ADUGAME · ACTUAL R2 v17</div><img src="${data}"></div></div></body></html>`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const x=document.getElementById('o');return x?.complete&&x.naturalWidth>0},null,{timeout:12000});
  await page.screenshot({path:'qa/reports/g1r2-fast/COMPARE-v17.png'});
});
