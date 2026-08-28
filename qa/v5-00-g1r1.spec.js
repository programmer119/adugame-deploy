const { test, expect } = require('@playwright/test');

async function rect(page){return page.locator('canvas').boundingBox();}
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,pts,duration=300){
  const ps=pts.map(([x,y])=>map(r,x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();
  const seg=Math.max(1,ps.length-1),steps=Math.max(5,Math.floor(24/seg));
  for(let k=1;k<ps.length;k++){const a=ps[k-1],b=ps[k];for(let i=1;i<=steps;i++){const q=i/steps;await page.mouse.move(a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q);await page.waitForTimeout(duration/(seg*steps));}}
  await page.mouse.up();
}
async function state(page,label){const s=await page.evaluate(()=>window.__ADUGAME_DEBUG__());console.log('V5_G1R1_STATE',label,JSON.stringify(s));return s;}

test('v5 G1R1 exact state chain',async({page})=>{
  await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='toilet-handwash');
  const r=await rect(page);

  await clickL(page,r,740,380);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===0.5);
  expect((await state(page,'toilet')).step).toBe(.5);

  await clickL(page,r,790,275);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===1);
  expect((await state(page,'flush')).step).toBe(1);

  await clickL(page,r,400,300);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===2,{timeout:3000});
  expect((await state(page,'wet')).step).toBe(2);

  await dragL(page,r,[[175,430],[290,450],[400,475]],420);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===3,{timeout:3000});
  expect((await state(page,'soap')).step).toBe(3);

  await dragL(page,r,[[330,475],[470,475],[330,475],[470,475],[330,475]],1100);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===4,{timeout:3000});
  const scrub=await state(page,'scrub');
  expect(scrub.scrubDistance).toBeGreaterThanOrEqual(340);

  await clickL(page,r,400,300);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.roundComplete===true,{timeout:3000});
  expect((await state(page,'rinse')).roundComplete).toBe(true);
});