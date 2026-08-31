const { test, expect } = require('@playwright/test');

test('fast G1R2 visual capture', async ({ page }) => {
  await page.goto('/index.html?game=1&round=2&e2e=1', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const s = window.__ADUGAME_SCENE__?.();
    return s?.scene?.key === 'G1R2' && s?.v13Art === 'external-assets-only-r2';
  }, null, { timeout: 25000 });
  await page.waitForTimeout(900);
  const debug = await page.evaluate(() => {
    const s = window.__ADUGAME_SCENE__?.();
    return {
      v13Art: s?.v13Art,
      bg: !!s?.__g1v13Bg,
      kid: !!s?.__g1v13Kid,
      generatedVisualAssets: window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets,
      step: s?.step
    };
  });
  expect(debug.v13Art).toBe('external-assets-only-r2');
  expect(debug.bg).toBe(true);
  expect(debug.kid).toBe(true);
  expect(debug.generatedVisualAssets).toBe(0);
  await page.screenshot({ path: 'qa/reports/g1r2-fast/G1R2-v13.png', fullPage: true });
});
