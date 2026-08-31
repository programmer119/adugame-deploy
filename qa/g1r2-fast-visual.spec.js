const { test, expect } = require('@playwright/test');

test('fast G1R2 visual capture', async ({ page }) => {
  test.setTimeout(45000);
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{ if(m.type()==='error') errors.push(`console: ${m.text()}`); });
  await page.goto('/index.html?game=1&round=2&e2e=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const s=window.__ADUGAME_SCENE__?.();
    return s?.scene?.key==='G1R2' && s?.v14Art==='external-dom-assets-only-r2' && !!document.getElementById('g1r2-v14-overlay');
  }, null, { timeout: 20000 });
  await page.waitForTimeout(5500);
  const debug = await page.evaluate(() => {
    const s=window.__ADUGAME_SCENE__?.();
    const root=document.getElementById('g1r2-v14-overlay');
    const imgs=root?[...root.querySelectorAll('img')].map(i=>({cls:i.className,complete:i.complete,w:i.naturalWidth,h:i.naturalHeight,src:i.currentSrc||i.src})):[];
    return {
      marker:window.__ADUGAME_G1_BENCHMARK_ART_V14__,
      v14Art:s?.v14Art,
      overlay:!!root,
      imgs,
      loaded:imgs.filter(i=>i.complete&&i.w>0&&i.h>0).length,
      generatedVisualAssets:window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,
      step:s?.step
    };
  });
  console.log('G1R2_V14_DEBUG',JSON.stringify(debug));
  console.log('G1R2_V14_ERRORS',JSON.stringify(errors));
  await page.screenshot({ path: 'qa/reports/g1r2-fast/G1R2-v14.png', fullPage: true });
  expect(debug.marker?.loaded).toBe(true);
  expect(debug.v14Art).toBe('external-dom-assets-only-r2');
  expect(debug.overlay).toBe(true);
  expect(debug.generatedVisualAssets).toBe(0);
});
