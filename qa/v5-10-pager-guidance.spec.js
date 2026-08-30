const {test,expect}=require('@playwright/test');

test('strict command chain: hidden G2 mission item redirects hint to the correct pager arrow',async({page})=>{
  await page.goto('/index.html?game=2&round=1&e2e=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key==='G2R1');
  const s=await page.evaluate(()=>{const x=window.__ADUGAME_SCENE__();x.setInventoryPage(1);return{status:x.missionText.text,hint:{x:x.hintTarget.x,y:x.hintTarget.y},page:x.inventoryPage,bread:x.items.find(o=>o.kind==='bread'&&o.floor===1).visible,patch:window.__ADUGAME_CLARITY_PAGER_V5__};});
  expect(s.patch?.loaded).toBe(true);expect(s.page).toBe(1);expect(s.bread).toBe(false);expect(s.status).toContain('빵');expect(s.status).toContain('물건 1/3');expect(s.status).toContain('왼쪽');
  expect(Math.abs(s.hint.x-(1098-55*.85))).toBeLessThanOrEqual(2);expect(Math.abs(s.hint.y-188)).toBeLessThanOrEqual(2);
  const result=await page.evaluate(()=>{const x=window.__ADUGAME_SCENE__();x.setInventoryPage(0);const b=x.items.find(o=>o.kind==='bread'&&o.floor===1);return{status:x.missionText.text,hint:x.hintTarget?{x:x.hintTarget.x,y:x.hintTarget.y}:null,breadVisible:b.visible,bread:{x:b.x,y:b.y}};});
  expect(result.breadVisible).toBe(true);expect(result.status).toContain('빵');expect(result.hint).toEqual(result.bread);
});
