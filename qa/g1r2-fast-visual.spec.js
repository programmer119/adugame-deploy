const { test, expect } = require('@playwright/test');

test('fast G1R2 authored visual candidate', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#g1r2-v16-three')?.dataset.ready==='1',null,{timeout:60000});
  await page.waitForTimeout(900);
  await page.screenshot({path:'qa/reports/g1r2-fast/G1R2-v16.png',fullPage:true});
  const state=await page.evaluate(()=>({
    generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,
    version:window.__ADUGAME_ART_SOURCE__?.G1R2?.version,
    ready:document.querySelector('#g1r2-v16-three')?.dataset.ready
  }));
  console.log('G1R2_AUTHORED_VISUAL',state);
  expect(state.generated).toBe(0);
  expect(state.ready).toBe('1');
  expect(state.version).toBe('v16.1');
});
