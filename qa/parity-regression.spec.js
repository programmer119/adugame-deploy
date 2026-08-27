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
function quarterCircle(cx,cy,r,turns=3){const pts=[];for(let i=0;i<=Math.ceil(turns*8);i++){const a=-Math.PI/2+i*Math.PI/4;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
function mixPath(cx,cy,r,turns=2.75){return [[cx,cy],...quarterCircle(cx,cy,r,turns)];}
async function openRound(page,g,r){
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key,{timeout:10000});
  await page.waitForTimeout(160);
  return rect(page);
}
async function waitStep(page,step,timeout=10000){await page.waitForFunction(s=>window.__ADUGAME_DEBUG__?.()?.step===s,step,{timeout});}
function overlap(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.right,b.right),bt=Math.min(a.bottom,b.bottom);return r>x&&bt>y?(r-x)*(bt-y):0;}


test('G1 flow presentation defects stay fixed', async({page})=>{
  let r=await openRound(page,1,2);
  await clickL(page,r,650,270); await waitStep(page,1);
  await dragPath(page,r,[[315,350],[430,385],[540,425],[650,455]],8); await waitStep(page,2);
  await dragPath(page,r,[[575,455],[640,445],[715,455],[640,465],[575,455],[640,445],[715,455],[640,465],[575,455],[640,445],[715,455]],12); await waitStep(page,3);
  await clickL(page,r,650,270); await waitStep(page,4);
  await page.waitForTimeout(260);
  const foamCount=await page.evaluate(()=>window.__ADUGAME_SCENE__().children.list.filter(o=>o.name==='foam'&&o.active!==false&&o.alpha>.02).length);
  expect(foamCount).toBe(0);

  r=await openRound(page,1,3);
  const g1r3=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__(),a=s.status.getBounds(),b=s.plate.getBounds();
    return {status:{x:a.x,y:a.y,right:a.right,bottom:a.bottom},plate:{x:b.x,y:b.y,right:b.right,bottom:b.bottom},statusY:s.status.y};
  });
  expect(overlap(g1r3.status,g1r3.plate)).toBe(0);
  expect(g1r3.statusY).toBeLessThan(200);
});


test('G2R1 mission never sits on ingredient labels', async({page})=>{
  await openRound(page,2,1);
  const result=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    const m=s.missionText.getBounds();
    const labels=s.foods.map(o=>o.list.find(c=>c.type==='Text')).map(t=>({text:t.text,b:t.getBounds()}));
    const inter=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.right,b.right),bt=Math.min(a.bottom,b.bottom);return r>x&&bt>y?(r-x)*(bt-y):0;};
    return {missionY:s.missionText.y, collisions:labels.filter(x=>inter(m,x.b)>0).map(x=>x.text)};
  });
  expect(result.missionY).toBeGreaterThanOrEqual(680);
  expect(result.collisions).toEqual([]);
});


test('G2R2 washer uses compact loaded state and cleans detergent after wash', async({page})=>{
  const r=await openRound(page,2,2);
  await clickL(page,r,650,355);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.open===true);
  for(const q of [
    [[305,220],[450,280],[560,330],[650,355]],
    [[305,330],[470,340],[650,355]],
    [[305,440],[470,400],[650,355]],
    [[1000,390],[820,375],[650,355]]
  ]){await dragPath(page,r,q,7);await page.waitForTimeout(200);}
  await page.waitForTimeout(260);
  const loaded=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    return {hidden:s.items.every(o=>o.visible===false),badges:[...s._loadBadges.values()].map(b=>[b.x,b.y]),missionY:s.missionText.y};
  });
  expect(loaded.hidden).toBeTruthy();
  expect(loaded.badges.length).toBe(4);
  expect(new Set(loaded.badges.map(x=>x.join(','))).size).toBe(4);
  expect(loaded.missionY).toBeGreaterThanOrEqual(680);

  await clickL(page,r,650,425); await clickL(page,r,718,235);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.washed===true,{timeout:6000});
  await page.waitForTimeout(160);
  const washed=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    const clothes=s.items.filter(o=>['shirt','pants','sock'].includes(o.kind));
    const detergent=s.items.find(o=>o.kind==='detergent');
    return {clothes:clothes.map(o=>({visible:o.visible,y:o.y})),detergentVisible:detergent.visible,badges:s._loadBadges.size};
  });
  expect(washed.clothes.every(o=>o.visible&&o.y===565)).toBeTruthy();
  expect(washed.detergentVisible).toBeFalsy();
  expect(washed.badges).toBe(0);
});


test('G2R3 paint changes the car and driver instruction stays out of tool cards', async({page})=>{
  const r=await openRound(page,2,3);
  await dragPath(page,r,[[1080,390],[900,350],[705,405]],8);
  await page.waitForTimeout(480);
  expect((await page.evaluate(()=>window.__ADUGAME_DEBUG__().paintColor))).toBe(0x88ccff);
  const paintHome=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return {x:s.paint.x,y:s.paint.y,h:s.paint.parityHome};});
  expect(Math.abs(paintHome.x-paintHome.h.x)).toBeLessThan(4);
  expect(Math.abs(paintHome.y-paintHome.h.y)).toBeLessThan(4);

  await dragPath(page,r,[[300,210],[440,340],[575,465]],8); await page.waitForTimeout(200);
  await dragPath(page,r,[[300,330],[450,395],[575,465]],8); await page.waitForTimeout(200);
  await dragPath(page,r,[[300,455],[450,460],[575,465]],8); await page.waitForTimeout(260);
  const layout=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__(),a=s.driverInstruction.getBounds(),b=s.cloth.getBounds();
    const inter=(a,b)=>{const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.right,b.right),bt=Math.min(a.bottom,b.bottom);return r>x&&bt>y?(r-x)*(bt-y):0;};
    return {instructionY:s.driverInstruction.y,collision:inter(a,b)};
  });
  expect(layout.instructionY).toBeLessThan(180);
  expect(layout.collision).toBe(0);

  await dragPath(page,r,quarterCircle(575,465,60,2),22);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.stage===3);
  await page.waitForTimeout(300);
  const driver=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return {x:s.driver.x,y:s.driver.y,h:s.driver.parityHome,instruction:!!s.driverInstruction?.active};});
  expect(Math.abs(driver.x-driver.h.x)).toBeLessThan(5);
  expect(Math.abs(driver.y-driver.h.y)).toBeLessThan(5);
  expect(driver.instruction).toBeFalsy();
});


test('G3R3 supports extra decoration and creates a real shelf jar on serve', async({page})=>{
  const r=await openRound(page,3,3);
  await dragPath(page,r,[[230,230],[450,330],[650,420]],7);
  await dragPath(page,r,[[360,230],[520,335],[650,420]],7);
  await clickL(page,r,210,355);
  await dragPath(page,r,mixPath(650,420,82,2.75),62);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.mixed===true,{timeout:10000});
  await dragPath(page,r,[[210,485],[450,455],[650,420]],7);
  await page.waitForTimeout(180);
  await dragPath(page,r,[[400,485],[470,455],[670,420]],7);
  await page.waitForTimeout(220);
  const decorated=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(decorated.chosen.decos).toEqual(expect.arrayContaining(['star','heart']));
  await clickL(page,r,870,630);
  await page.waitForTimeout(1100);
  const served=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(served.shelfCount).toBe(1);
  expect(served.coinCount).toBe(8);
});