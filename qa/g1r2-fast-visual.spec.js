const { test, expect } = require('@playwright/test');

test('fast G1R2 current authored visual', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!document.querySelector('#g1r2-v14-overlay .g1v14-bg'),null,{timeout:20000});
  await page.waitForTimeout(1800);
  await page.screenshot({path:'qa/reports/g1r2-fast/G1R2-current.png',fullPage:true});
  const generated=await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets);
  expect(generated).toBe(0);
});
