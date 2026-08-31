const { test, expect } = require('@playwright/test');

const CANDIDATES=[
  ['4','https://img.itch.zone/aW1nLzE3MzI0NjU3LnBuZw==/original/QX1mok.png'],
  ['5','https://img.itch.zone/aW1nLzE3MzUwNTY2LnBuZw==/original/vRzstl.png'],
  ['6','https://img.itch.zone/aW1nLzE3NDI5NjUzLnBuZw==/original/dgjWcq.png']
];

test('fast G1R2 visual capture', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/index.html?game=1&round=2&e2e=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const s=window.__ADUGAME_SCENE__?.();
    return s?.scene?.key==='G1R2' && !!document.querySelector('#g1r2-v14-overlay .g1v14-bg');
  }, null, { timeout: 20000 });
  await page.waitForTimeout(2500);
  for(const [id,url] of CANDIDATES){
    const loaded=await page.evaluate(async ({url})=>{
      const bg=document.querySelector('#g1r2-v14-overlay .g1v14-bg');
      if(!bg) return false;
      return await new Promise(resolve=>{
        const done=ok=>resolve(ok);
        bg.onload=()=>done(bg.naturalWidth>0&&bg.naturalHeight>0);
        bg.onerror=()=>done(false);
        bg.src=url;
        if(bg.complete) done(bg.naturalWidth>0&&bg.naturalHeight>0);
        setTimeout(()=>done(false),7000);
      });
    },{url});
    console.log(`G1R2_BG_${id}_LOADED`,loaded);
    await page.waitForTimeout(500);
    await page.screenshot({path:`qa/reports/g1r2-fast/G1R2-bg-${id}.png`,fullPage:true});
  }
  const generated=await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets);
  expect(generated).toBe(0);
});
