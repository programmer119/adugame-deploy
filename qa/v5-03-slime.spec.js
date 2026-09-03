const { test, expect } = require('@playwright/test');

function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function pressL(page,r,x,y,hold=90){const p=map(r,x,y);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.waitForTimeout(hold);await page.mouse.up();}
async function dragL(page,r,points,duration=240){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();
  const pause=Math.max(18,Math.floor(duration/Math.max(1,ps.length-1)));
  for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}
  await page.mouse.up();
}
function circle(cx,cy,r,turns=3,steps=4,start=-Math.PI/2){const pts=[];for(let i=0;i<=turns*steps;i++){const a=start+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
async function waitFor(page,fn,timeout=10000,arg=null){return page.waitForFunction(fn,arg,{timeout});}
async function state(page,label){
  const s=await page.evaluate(()=>{const d=window.__ADUGAME_DEBUG__();const sc=window.__ADUGAME_SCENE__();return {...d,locked:!!sc.interactionLocked,baseInput:!!sc.base?.input?.enabled,activatorInput:!!sc.activator?.input?.enabled,mixInput:!!sc.mixZone?.input?.enabled,mixStart:sc.mixStart,now:sc.time?.now};});
  console.log('V5_SLIME_STATE',label,JSON.stringify(s));return s;
}
async function mixBatch(page,r,colorX,label){
  await dragL(page,r,[[230,230],[650,420]],220);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'),7000);
  await state(page,label+'-base');
  await dragL(page,r,[[360,230],[650,420]],220);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'),7000);
  await state(page,label+'-activator');
  await clickL(page,r,colorX,355);
  await waitFor(page,c=>window.__ADUGAME_DEBUG__().chosen.color===c,5000,colorX===210?'blue':colorX===325?'green':'pink');
  await state(page,label+'-color');
  await dragL(page,r,circle(650,420,90,3.2,4),1900);
  const after=await state(page,label+'-mix-gesture');
  expect(after.mixAngle).toBeGreaterThanOrEqual(850);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().mixed===true,7000);
  await state(page,label+'-mixed');
}
async function serve(page,r,decoX,served){
  await dragL(page,r,[[decoX,485],[650,420]],220);
  // Playwright's mouseup can resolve one frame before Phaser dispatches dragend.
  // Wait for the actual requested decoration to enter live game state before submitting.
  await waitFor(page,()=>{const s=window.__ADUGAME_SCENE__(),d=window.__ADUGAME_DEBUG__();return !!s?.order?.deco&&d.chosen.decos.includes(s.order.deco);},5000);
  await waitFor(page,()=>{const s=window.__ADUGAME_SCENE__();return !!s&&!s.interactionLocked&&!!s.serveButton?.input?.enabled&&s.serveButton.visible!==false;},5000);
  // Use the same verified serving path as the dedicated G3 authored-art gate:
  // press the live rendered bounds center, verify state movement, and retry once only
  // if the browser loses a synthetic pointerup between render frames.
  for(let attempt=0;attempt<2;attempt++){
    const button=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),b=s.serveButton,bb=b.getBounds();return {x:bb.centerX,y:bb.centerY,w:bb.width,h:bb.height,input:!!b.input?.enabled,visible:b.visible!==false,locked:!!s.interactionLocked};});
    expect(button.visible).toBe(true);expect(button.input).toBe(true);expect(button.locked).toBe(false);expect(button.w).toBeGreaterThan(90);expect(button.h).toBeGreaterThan(40);
    await pressL(page,r,button.x,button.y,110);
    try{await waitFor(page,n=>window.__ADUGAME_DEBUG__().ordersServed>=n,5000,served);return;}
    catch(e){if(attempt===1)throw e;await page.waitForTimeout(180);}
  }
}

test('v5 slime second customer fully rearms ingredients, mixer, consumable economy and serving',async({page})=>{
  await page.goto('/index.html?game=3&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='persistent-slime-store');
  const r=await page.locator('canvas').boundingBox();expect(r).toBeTruthy();

  let boot=await state(page,'boot');
  expect(boot.supplyShop).toBe(true);expect(boot.supplyMode).toBe('consumable-stock');expect(boot.coinBalance).toBe(0);
  expect(boot.supplyPurchased).toEqual([]);expect(boot.supplyStock).toEqual({soccer:0,butterfly:0,animal:0});

  await mixBatch(page,r,210,'order1');
  await serve(page,r,210,1);
  await waitFor(page,()=>{const s=window.__ADUGAME_DEBUG__(),sc=window.__ADUGAME_SCENE__();return s.orderIndex===1&&s.ingredients.length===0&&!s.mixed&&!sc.interactionLocked;},7000);
  let st=await state(page,'order2-ready');
  expect(st.ordersServed).toBe(1);expect(st.orderIndex).toBe(1);expect(st.ingredients).toEqual([]);
  expect(st.baseInput).toBe(true);expect(st.activatorInput).toBe(true);expect(st.mixInput).toBe(true);
  expect(st.coinEarned).toBe(3);expect(st.coinBalance).toBe(3);

  // O-PUBLIC economy parity + secondary observed-play evidence: coins buy finite slime-supply stock rather than a permanent unlock.
  await clickL(page,r,596,188);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().supplyStock.soccer===2,5000);
  st=await state(page,'soccer-stock-bought');
  expect(st.coinBalance).toBe(1);expect(st.supplyPurchased).toContain('soccer');expect(st.supplyStock.soccer).toBe(2);
  const bonus=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();const o=s.bonusDecos.find(x=>x.supplyId==='soccer'&&!x.supplySpent);return {visible:o?.visible,input:!!o?.input?.enabled,x:o?.x,y:o?.y};});
  expect(bonus.visible).toBe(true);expect(bonus.input).toBe(true);

  await mixBatch(page,r,440,'order2');
  await dragL(page,r,[[565,550],[650,420]],220);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().supplyStock.soccer===1,5000);
  st=await state(page,'soccer-stock-used');expect(st.supplyStock.soccer).toBe(1);
  await serve(page,r,400,2);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().roundComplete===true,9000);
  st=await state(page,'complete');
  expect(st.roundComplete).toBe(true);expect(st.ordersServed).toBe(2);expect(st.shelfCount).toBe(2);
  expect(st.coinEarned).toBe(6);expect(st.supplyPurchased).toContain('soccer');expect(st.supplyStock.soccer).toBe(1);
});