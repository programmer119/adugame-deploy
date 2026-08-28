const { test, expect } = require('@playwright/test');

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.click(p.x,p.y); }
async function dragL(page,r,points,duration=300){
  const ps=points.map(([x,y])=>map(r,x,y)); await page.mouse.move(ps[0].x,ps[0].y); await page.mouse.down();
  const seg=Math.max(1,ps.length-1),steps=Math.max(4,Math.floor(20/seg));
  for(let k=1;k<ps.length;k++){
    const a=ps[k-1],b=ps[k];
    for(let i=1;i<=steps;i++){const q=i/steps;await page.mouse.move(a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q);await page.waitForTimeout(duration/(seg*steps));}
  }
  await page.mouse.up();
}
function circle(cx,cy,r,turns=3,steps=24,start=-Math.PI/2){const pts=[];for(let i=0;i<=turns*steps;i++){const a=start+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
async function openRound(page,g,r){
  const errors=[]; page.on('pageerror',e=>errors.push(String(e))); page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key);
  const rct=await rect(page); expect(rct).toBeTruthy(); return {rct,errors};
}
async function expectComplete(page,errors){await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.roundComplete===true,{timeout:18000});const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());expect(st.roundComplete).toBe(true);expect(errors).toEqual([]);return st;}
async function craftOrder(p,r,{colorX,decoX,containerX=null,extraX=null},served){
  await dragL(p,r,[[230,230],[650,420]],300);await dragL(p,r,[[360,230],[650,420]],300);await p.waitForTimeout(180);
  await clickL(p,r,colorX,355);await dragL(p,r,circle(650,420,90,3,24),1750);
  await p.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.mixed===true,{timeout:6000});
  await dragL(p,r,[[decoX,485],[650,420]],300);
  if(extraX!==null)await dragL(p,r,[[extraX,485],[690,440]],300);
  if(containerX!==null)await clickL(p,r,containerX,585);
  await clickL(p,r,870,630);
  await p.waitForFunction(n=>window.__ADUGAME_DEBUG__()?.ordersServed>=n||window.__ADUGAME_DEBUG__()?.roundComplete===true,served,{timeout:7000});
  await p.waitForTimeout(160);
}

const cases=[
  [1,1,async(p,r)=>{
    await clickL(p,r,740,380); await clickL(p,r,790,275); await p.waitForTimeout(520);
    await clickL(p,r,400,300); await p.waitForTimeout(520);
    await dragL(p,r,[[175,430],[290,450],[400,475]],320); await p.waitForTimeout(220);
    await dragL(p,r,[[330,475],[470,475],[330,475],[470,475],[330,475]],850);
    await clickL(p,r,400,300); await p.waitForTimeout(560);
  }],
  [1,2,async(p,r)=>{
    await dragL(p,r,[[205,235],[205,350]],280); await p.waitForTimeout(220);
    await dragL(p,r,[
      [205,350],[730,340],[770,340],[730,340],[770,340],
      [810,340],[850,340],[810,340],[850,340],
      [770,390],[730,390],[770,390],[730,390],
      [810,390],[850,390],[810,390],[850,390]
    ],1850); await p.waitForTimeout(220);
    await dragL(p,r,[[205,480],[700,300],[850,300],[700,360],[850,360],[700,330]],1100); await p.waitForTimeout(220);
    for(const nail of [[1010,438],[1035,443],[1060,438],[1085,443],[1110,438]]){await dragL(p,r,[[205,585],nail],260);await p.waitForTimeout(180);}
  }],
  [1,3,async(p,r)=>{
    for(const q of [[180,235],[315,235],[450,235]]){await dragL(p,r,[q,[255,465]],300);await p.waitForTimeout(200);}
    for(const q of [[560,250],[680,250],[800,250]]){await dragL(p,r,[q,[735,475]],320);await p.waitForTimeout(210);}
    for(const q of [[660,470],[735,465],[810,460]]){await dragL(p,r,[q,[1040,330]],320);await p.waitForTimeout(210);}
  }],
  [2,1,async(p,r)=>{
    await dragL(p,r,[[315,628],[980,500]],420); await p.waitForTimeout(180);
    await dragL(p,r,[[330,205],[690,330]],360); await p.waitForTimeout(220);
    await dragL(p,r,[[690,330],[980,500]],360); await p.waitForTimeout(220);
    await clickL(p,r,650,555);
  }],
  [2,2,async(p,r)=>{
    await clickL(p,r,650,345);
    for(const q of [[330,205],[412,205],[494,205]]){await dragL(p,r,[q,[650,345]],320);await p.waitForTimeout(180);}
    await clickL(p,r,650,345); await clickL(p,r,650,345); await p.waitForTimeout(1450);
    for(const q of [[760,520],[818,520],[876,520]]){await dragL(p,r,[q,[930,420]],320);await p.waitForTimeout(180);}
    await clickL(p,r,650,555);
  }],
  [2,3,async(p,r)=>{for(const q of [[330,205],[412,205],[494,205]]){await dragL(p,r,[q,[720,405]],320);await p.waitForTimeout(190);}await clickL(p,r,650,555);}],
  [3,1,async(p,r)=>{await craftOrder(p,r,{colorX:210,decoX:210},1);await craftOrder(p,r,{colorX:440,decoX:400},2);}],
  [3,2,async(p,r)=>{await craftOrder(p,r,{colorX:325,decoX:305,containerX:230},1);await craftOrder(p,r,{colorX:210,decoX:210,containerX:380},2);await craftOrder(p,r,{colorX:440,decoX:400,containerX:230},3);}],
  [3,3,async(p,r)=>{await craftOrder(p,r,{colorX:210,decoX:210,extraX:495},1);await craftOrder(p,r,{colorX:325,decoX:305},2);await craftOrder(p,r,{colorX:440,decoX:400},3);}]
];

for(const [g,r,play] of cases){
  test(`v5 full-cycle G${g}R${r}`,async({page})=>{const {rct,errors}=await openRound(page,g,r);await play(page,rct);const st=await expectComplete(page,errors);expect(st.score).toBeGreaterThanOrEqual(60);});
}

test('v5 guided habits expose routine identities',async({page})=>{
  for(const [r,id] of [[1,'toilet-handwash'],[2,'brush-face-nails'],[3,'tidy-balanced-meal']]){await page.goto(`/index.html?game=1&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5);expect((await page.evaluate(()=>window.__ADUGAME_DEBUG__().benchmarkV5))).toBe(id);}
});

test('v5 house has four-floor transport semantics, 100 portable items, and 10 characters',async({page})=>{
  const {rct}=await openRound(page,2,1);let st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());expect(st.benchmarkV5).toBe('four-floor-free-house');expect(st.itemCount).toBe(100);expect(st.characterCount).toBe(10);expect(st.currentFloor).toBe(1);
  await dragL(page,rct,[[904,205],[1130,355]],320);await page.waitForTimeout(120);st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());expect(st.elevatorCargo).toBe(1);
  await clickL(page,rct,62,225);await page.waitForTimeout(180);st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());expect(st.currentFloor).toBe(0);expect(st.elevatorCargo).toBe(0);
});

test('v5 slime store persists finished jars and advances customers',async({page})=>{
  const {rct}=await openRound(page,3,1);let st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());expect(st.benchmarkV5).toBe('persistent-slime-store');expect(st.totalOrders).toBe(2);
  await craftOrder(page,rct,{colorX:210,decoX:210},1);st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());expect(st.ordersServed).toBe(1);expect(st.shelfCount).toBe(1);expect(st.orderIndex).toBe(1);
});

test('v5 all nine rounds boot without runtime errors',async({page})=>{
  for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
    const errs=[];page.removeAllListeners('pageerror');page.removeAllListeners('console');page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key);expect(errs).toEqual([]);const box=await page.locator('canvas').boundingBox();expect(box.width).toBeGreaterThan(600);expect(box.height).toBeGreaterThan(300);
  }
});
