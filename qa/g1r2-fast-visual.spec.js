const { test, expect } = require('@playwright/test');

test('fast G1R2 visual capture', async ({ page }) => {
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  page.on('console',m=>{ if(m.type()==='error') errors.push(`console: ${m.text()}`); });
  await page.goto('/index.html?game=1&round=2&e2e=1', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ADUGAME_SCENE__?.()?.scene?.key === 'G1R2', null, { timeout: 20000 });
  await page.waitForTimeout(2500);
  const debug = await page.evaluate(() => {
    const s = window.__ADUGAME_SCENE__?.();
    return {
      marker: window.__ADUGAME_G1_BENCHMARK_ART_V13__,
      v10Art:s?.v10Art,v11Art:s?.v11Art,v12Art:s?.v12Art,v13Art:s?.v13Art,
      bg: !!s?.__g1v13Bg,
      kid: !!s?.__g1v13Kid,
      textures:{
        bg:s?.textures?.exists('g1v13_bg'),kid:s?.textures?.exists('g1v13_kid'),
        toothpaste:s?.textures?.exists('g1v13_toothpaste'),toothbrush:s?.textures?.exists('g1v13_toothbrush'),
        sponge:s?.textures?.exists('g1v13_sponge'),clipper:s?.textures?.exists('g1v13_clipper'),hand:s?.textures?.exists('g1v13_hand')
      },
      generatedVisualAssets: window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,
      step: s?.step
    };
  });
  console.log('G1R2_V13_DEBUG',JSON.stringify(debug));
  console.log('G1R2_V13_ERRORS',JSON.stringify(errors));
  await page.screenshot({ path: 'qa/reports/g1r2-fast/G1R2-v13.png', fullPage: true });
  expect(debug.marker?.loaded).toBe(true);
  expect(debug.v13Art).toBe('external-assets-only-r2');
  expect(debug.bg).toBe(true);
  expect(debug.kid).toBe(true);
  expect(debug.generatedVisualAssets).toBe(0);
});
