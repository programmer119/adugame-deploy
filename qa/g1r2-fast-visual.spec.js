const { test, expect } = require('@playwright/test');

test('fast G1R2 selected visual capture', async ({ page }) => {
  test.setTimeout(45000);
  await page.goto('/index.html?game=1&round=2&e2e=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const s=window.__ADUGAME_SCENE__?.();
    const root=document.getElementById('g1r2-v14-overlay');
    return s?.scene?.key==='G1R2' && s?.v15Art==='existing-assets-only-r2' && !!root;
  }, null, { timeout: 20000 });
  await page.waitForTimeout(4500);
  const debug=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__?.();
    const root=document.getElementById('g1r2-v14-overlay');
    const imgs=root?[...root.querySelectorAll('img')].map(i=>({cls:i.className,complete:i.complete,w:i.naturalWidth,h:i.naturalHeight,src:i.currentSrc||i.src})):[];
    return {v15:s?.v15Art,generated:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,imgs,loaded:imgs.filter(i=>i.complete&&i.w>0&&i.h>0).length};
  });
  console.log('G1R2_V15_DEBUG',JSON.stringify(debug));
  await page.screenshot({path:'qa/reports/g1r2-fast/G1R2-selected.png',fullPage:true});
  expect(debug.v15).toBe('existing-assets-only-r2');
  expect(debug.generated).toBe(0);
  expect(debug.loaded).toBeGreaterThanOrEqual(5);
});
