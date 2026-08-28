const { test, expect } = require('@playwright/test');

function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,a,b){const p=map(r,...a),q=map(r,...b);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y);await page.waitForTimeout(120);await page.mouse.up();}
async function waitFor(page,fn,timeout=12000,arg=null){return page.waitForFunction(fn,arg,{timeout});}
async function logState(page,label){const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());console.log('V5_LAUNDRY_STATE',label,JSON.stringify(st));return st;}

test('v5 laundry restores clean clothes hit input and completes dry cycle',async({page})=>{
  await page.goto('/index.html?game=2&round=2&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='four-floor-free-house');
  const r=await page.locator('canvas').boundingBox();expect(r).toBeTruthy();

  await clickL(page,r,650,345);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().discoveries.includes('washer_open'));
  for(const [i,q] of [[0,[330,205]],[1,[412,205]],[2,[494,205]]]){
    await dragL(page,r,q,[650,345]);
    await waitFor(page,n=>window.__ADUGAME_DEBUG__().loaded>=n,7000,i+1);
  }
  await clickL(page,r,650,345);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().discoveries.includes('washer_close'));
  await clickL(page,r,650,345);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().discoveries.includes('wash_done'),12000);
  await page.waitForTimeout(350);

  const clean=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    return [...s.mission.loaded].map(o=>({kind:o.kind,state:o.state,visible:o.visible,input:!!o.input?.enabled,x:o.x,y:o.y}));
  });
  console.log('V5_LAUNDRY_CLEAN_INPUT',JSON.stringify(clean));
  expect(clean).toHaveLength(3);
  expect(clean.every(o=>o.state==='clean'&&o.visible&&o.input)).toBe(true);

  for(const [i,q] of [[1,[760,520]],[2,[818,520]],[3,[876,520]]]){
    await dragL(page,r,q,[930,420]);
    await waitFor(page,n=>window.__ADUGAME_DEBUG__().dried>=n,7000,i);
  }
  let st=await logState(page,'dried');
  expect(st.dried).toBe(3);expect(st.milestone).toBe(true);
  await clickL(page,r,650,555);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__().roundComplete===true,7000);
  st=await logState(page,'complete');expect(st.roundComplete).toBe(true);
});