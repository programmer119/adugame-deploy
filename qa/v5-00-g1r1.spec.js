const { test, expect } = require('@playwright/test');

async function rect(page){return page.locator('canvas').boundingBox();}
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,pts,duration=240){
  const ps=pts.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();
  const pause=Math.max(18,Math.floor(duration/Math.max(1,ps.length-1)));
  for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}
  await page.mouse.up();
}
async function waitFor(page,fn,timeout=8000){return page.waitForFunction(fn,null,{timeout});}
async function state(page,label){const s=await page.evaluate(()=>window.__ADUGAME_DEBUG__());console.log('V5_G1R1_STATE',label,JSON.stringify(s));return s;}

test('v5 G1R1 exact state chain',async({page})=>{
  await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='toilet-handwash');
  const r=await rect(page);

  await clickL(page,r,740,380);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===0.5);
  expect((await state(page,'toilet')).step).toBe(.5);

  await clickL(page,r,790,275);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===1);
  expect((await state(page,'flush')).step).toBe(1);

  await clickL(page,r,400,300);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===2);
  expect((await state(page,'wet')).step).toBe(2);

  await dragL(page,r,[[175,430],[400,475]],180);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===3);
  expect((await state(page,'soap')).step).toBe(3);

  await dragL(page,r,[[330,475],[410,475],[330,475],[410,475],[330,475],[410,475],[330,475]],620);
  const scrubNow=await state(page,'scrub-immediate');
  expect(scrubNow.scrubDistance).toBeGreaterThanOrEqual(340);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===4);
  const scrub=await state(page,'scrub');
  expect(scrub.step).toBe(4);

  await clickL(page,r,400,300);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.roundComplete===true);
  expect((await state(page,'rinse')).roundComplete).toBe(true);
});