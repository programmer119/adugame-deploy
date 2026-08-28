const { test, expect } = require('@playwright/test');

function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
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
  await clickL(page,r,870,630);
  await waitFor(page,n=>window.__ADUGAME_DEBUG__().ordersServed>=n,9000,served);
}

test('v5 slime second customer fully rearms ingredients, mixer and serving',async({page})=>{
  await page.goto('/index.html?game=3&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='persistent-slime-store');
  const r=await page.locator('canvas').boundingBox();expect(r).toBeTruthy();

  await mixBatch(page,r,210,'order1');
  await serve(page,r,210,1);
  await waitFor(page,()=>{const s=window.__ADUGAME_DEBUG__(),sc=window.__ADUGAME_SCENE__();return s.orderIndex===1&&s.ingredients.length===0&&!s.mixed&&!sc.interactionLocked;},7000);
  let st=await state(page,'order2-ready');
  expect(st.ordersServed).toBe(1);expect(st.orderIndex).toBe(1);expect(st.ingredients).toEqual([]);
  expect(st.baseInput).toBe(true);expect(st.activatorInput).toBe(true);expect(st.mixInput).toBe(true);

  await mixBatch(page,r,440,'order2');
  await serve(page,r,400,2);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().roundComplete===true,9000);
  st=await state(page,'complete');
  expect(st.roundComplete).toBe(true);expect(st.ordersServed).toBe(2);expect(st.shelfCount).toBe(2);
});