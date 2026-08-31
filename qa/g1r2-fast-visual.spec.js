const { test, expect } = require('@playwright/test');

test('fast G1R2 visual capture', async ({ page }) => {
  await page.goto('/index.html?game=1&round=2&e2e=1', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const s = window.__ADUGAME_SCENE__?.();
    return s?.scene?.key === 'G1R2' && s?.v12Art === 'redhat-child-r2';
  }, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const debug = await page.evaluate(() => {
    const s = window.__ADUGAME_SCENE__?.();
    return { v12Art: s?.v12Art, kid: !!s?.__g1v12Kid, step: s?.step };
  });
  expect(debug.v12Art).toBe('redhat-child-r2');
  expect(debug.kid).toBe(true);
  await page.screenshot({ path: 'qa/reports/g1r2-fast/G1R2-v12.png', fullPage: true });
});
