const {test,expect}=require('@playwright/test');
async function waitFor(p,fn,timeout=7000){return p.waitForFunction(fn,null,{timeout});}
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
test('strict layout: G2 shelf item 9 and inventory pager are physically separated',async({page})=>{
  await page.goto('/index.html?game=2&round=1&e2e=1',{waitUntil:'networkidle'});await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.key==='G2R1');
  const g=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),last=s.items.filter(o=>o.inShelf&&o.floor===s.currentFloor&&o.visible).sort((a,b)=>a.shelfSlot-b.shelfSlot).at(-1),p=s.inventoryHud;const a=last.getBounds(),b=p.getBounds();return{item:{x:a.x,y:a.y,w:a.width,h:a.height},pager:{x:b.x,y:b.y,w:b.width,h:b.height},itemHit:{x:last.x-last.input.hitArea.width/2,y:last.y-last.input.hitArea.height/2,w:last.input.hitArea.width,h:last.input.hitArea.height},pagerX:p.x,pagerScaleX:p.scaleX};});
  expect(intersects(g.item,g.pager),JSON.stringify(g)).toBe(false);expect(g.pager.x).toBeGreaterThan(g.itemHit.x+g.itemHit.w);expect(g.pager.x+g.pager.w).toBeLessThanOrEqual(1175);expect(g.pagerScaleX).toBeLessThan(1);
});
