const { test, expect } = require('@playwright/test');

async function canvasRect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function openRound(page,g,r){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{ if(m.type()==='error') errors.push(m.text()); });
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key,null,{timeout:10000});
  const box=await canvasRect(page);
  expect(box).toBeTruthy();
  return {box,errors};
}
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.click(p.x,p.y,{delay:70}); }
async function drag(page,r,from,to){
  const a=map(r,...from), b=map(r,...to);
  await page.mouse.move(a.x,a.y,{steps:3});
  await page.waitForTimeout(50);
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.move(b.x,b.y,{steps:7});
  await page.waitForTimeout(70);
  await page.mouse.up();
}

test('wrong drop is soft, recoverable, and never ends the round',async({page})=>{
  const {box,errors}=await openRound(page,1,2);
  await drag(page,box,[315,350],[1030,520]);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.errors>=1,null,{timeout:4000});
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(st.roundComplete).toBe(false);
  expect(st.score).toBeGreaterThanOrEqual(60);
  expect(errors).toEqual([]);
});

test('idle learner receives a non-blocking hint',async({page})=>{
  const {errors}=await openRound(page,1,1);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.hints>=1,null,{timeout:7000});
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(st.roundComplete).toBe(false);
  expect(st.hints).toBeGreaterThanOrEqual(1);
  expect(st.score).toBeGreaterThanOrEqual(60);
  expect(errors).toEqual([]);
});

test('edge-of-hit-area pickup works for a child-sized laundry target',async({page})=>{
  const {box,errors}=await openRound(page,2,2);
  await clickL(page,box,650,355);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.open===true,null,{timeout:4000});
  // Shirt center is roughly (305,220); start near the right edge of its enlarged hit surface.
  await drag(page,box,[360,220],[650,355]);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.loaded?.includes('shirt'),null,{timeout:5000});
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(st.loaded).toContain('shirt');
  expect(st.roundComplete).toBe(false);
  expect(errors).toEqual([]);
});
