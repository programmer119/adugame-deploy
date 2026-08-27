const { test, expect } = require('@playwright/test');

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.move(p.x,p.y,{steps:3}); await page.mouse.click(p.x,p.y,{delay:60}); }
async function dragPath(page,r,points,pauseMs=0){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y,{steps:3}); await page.waitForTimeout(30); await page.mouse.down(); await page.waitForTimeout(55);
  for(let i=1;i<ps.length;i++){
    const a=ps[i-1],b=ps[i],d=Math.hypot(b.x-a.x,b.y-a.y);
    await page.mouse.move(b.x,b.y,{steps:Math.max(3,Math.min(7,Math.ceil(d/55)))});
    if(pauseMs) await page.waitForTimeout(pauseMs);
  }
  await page.waitForTimeout(50); await page.mouse.up();
}
function quarterCircle(cx,cy,r,turns=2){const pts=[];for(let i=0;i<=Math.ceil(turns*8);i++){const a=-Math.PI/2+i*Math.PI/4;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
async function openRound(page,g,r){
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key,{timeout:10000});
  await page.waitForTimeout(160);
  return rect(page);
}


test('G1R3 stacked meal items do not keep inventory labels on the plate', async({page})=>{
  const r=await openRound(page,1,3);
  await clickL(page,r,180,250);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===0.5);
  await dragPath(page,r,[[245,255],[280,245],[320,265],[355,250],[320,265],[280,245],[245,255],[285,265],[325,245],[355,255]],10);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===1);
  await dragPath(page,r,[[210,405],[500,390],[900,390],[500,500],[900,500],[520,430],[900,445]],12);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===2);
  await dragPath(page,r,[[650,630],[690,550],[730,470]],8);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===3);
  await dragPath(page,r,[[820,625],[820,570],[780,510],[730,450]],8);
  await page.waitForTimeout(230);
  const visibleLabels=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    const bread=s.foods.find(o=>o.kind==='bread');
    return bread.list.filter(c=>c.type==='Text'&&c.visible).map(c=>c.text);
  });
  expect(visibleLabels).toEqual([]);
});


test('G2R1 assembled sandwich hides source labels while keeping ingredients visible', async({page})=>{
  const r=await openRound(page,2,1);
  for(const q of [
    [[620,620],[650,560],[710,500]],
    [[740,620],[730,560],[710,500]],
    [[860,620],[780,560],[710,500]]
  ]){await dragPath(page,r,q,8);await page.waitForTimeout(210);}
  const state=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    return s.stack.map(o=>({kind:o.kind,visible:o.visible,visibleTexts:o.list.filter(c=>c.type==='Text'&&c.visible).map(c=>c.text)}));
  });
  expect(state.length).toBe(3);
  expect(state.every(o=>o.visible)).toBeTruthy();
  expect(state.every(o=>o.visibleTexts.length===0)).toBeTruthy();
});


test('G2R3 installed parts are compact icons, not stacked source cards', async({page})=>{
  const r=await openRound(page,2,3);
  await dragPath(page,r,[[300,210],[440,340],[575,465]],8); await page.waitForTimeout(230);
  await dragPath(page,r,[[300,330],[450,395],[575,465]],8); await page.waitForTimeout(230);
  await dragPath(page,r,[[300,455],[450,460],[575,465]],8); await page.waitForTimeout(260);
  const installed=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    const read=o=>({
      compact:!!o._v3Compact,
      graphicsVisible:o.list.filter(c=>c.type==='Graphics').some(c=>c.visible),
      texts:o.list.filter(c=>c.type==='Text'&&c.visible).map(c=>c.text)
    });
    return {wheel:read(s.wheel),screw:read(s.screw),driver:read(s.driver)};
  });
  for(const v of [installed.wheel,installed.screw,installed.driver]){
    expect(v.compact).toBeTruthy();
    expect(v.graphicsVisible).toBeFalsy();
    expect(v.texts.length).toBe(1);
  }

  await dragPath(page,r,quarterCircle(575,465,60,2),22);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.stage===3,{timeout:10000});
  await page.waitForTimeout(340);
  const driver=await page.evaluate(()=>{
    const o=window.__ADUGAME_SCENE__().driver;
    return {compact:!!o._v3Compact,graphicsVisible:o.list.filter(c=>c.type==='Graphics').some(c=>c.visible),texts:o.list.filter(c=>c.type==='Text'&&c.visible).map(c=>c.text)};
  });
  expect(driver.compact).toBeFalsy();
  expect(driver.graphicsVisible).toBeTruthy();
  expect(driver.texts).toEqual(expect.arrayContaining(['🪛','드라이버']));
});