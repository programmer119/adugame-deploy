const { test, expect } = require('@playwright/test');

test.setTimeout(30000);

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.click(p.x,p.y); }
async function dragPath(page,r,points,pauseMs=0){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y);
  await page.mouse.down();
  for(let i=1;i<ps.length;i++){
    await page.mouse.move(ps[i].x,ps[i].y);
    if(pauseMs) await page.waitForTimeout(pauseMs);
  }
  await page.mouse.up();
}
function quarterCircle(cx,cy,r,turns=3){
  const pts=[]; const steps=Math.ceil(turns*4);
  for(let i=0;i<=steps;i++){
    const a=-Math.PI/2 + i*Math.PI/2;
    pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);
  }
  return pts;
}
async function debug(page,label){
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__?.());
  console.log(`ADUGAME_STATE ${label} ${JSON.stringify(st)}`);
  return st;
}
async function openRound(page,g,r){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key,null,{timeout:10000});
  await page.waitForTimeout(120);
  const rct=await rect(page); expect(rct).toBeTruthy(); return {rct,errors};
}
async function expectComplete(page,errors,label){
  try{
    await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.roundComplete===true,null,{timeout:6000});
  }catch(e){
    await debug(page,`${label}_FAIL`);
    throw e;
  }
  const st=await debug(page,`${label}_PASS`);
  expect(st.roundComplete).toBe(true);
  expect(errors).toEqual([]);
  return st;
}
const settle=(p,ms=210)=>p.waitForTimeout(ms);

const cases=[
  [1,1,async(p,r)=>{
    // Keep brush segment speed below the in-game 1900 px/s acceptance ceiling.
    await dragPath(p,r,[[315,405],[680,285],[840,285],[680,285],[840,285],[680,285]],120);
  }],
  [1,2,async(p,r)=>{
    await clickL(p,r,650,270); await settle(p,520);
    await dragPath(p,r,[[315,350],[650,455]]); await settle(p,210);
    await dragPath(p,r,[[590,455],[710,455],[590,455],[710,455],[590,455],[710,455]]); await settle(p,80);
    await clickL(p,r,650,270); await settle(p,520);
    await dragPath(p,r,[[315,500],[570,455],[730,455],[570,455],[730,455]]);
  }],
  [1,3,async(p,r)=>{
    await clickL(p,r,180,250); await settle(p,80);
    await dragPath(p,r,[[250,255],[350,255],[250,255],[350,255],[250,255]]); await settle(p,80);
    await dragPath(p,r,[[210,405],[500,390],[900,390],[500,500],[900,500]]); await settle(p,210);
    await dragPath(p,r,[[650,630],[730,470]]); await settle(p,210);
    for(const q of [[820,625],[930,625],[1040,625]]){ await dragPath(p,r,[q,[730,450]]); await settle(p,210); }
    await dragPath(p,r,[[1120,500],[1120,390]]);
  }],
  [2,1,async(p,r)=>{
    for(const q of [[500,610],[620,620],[740,620]]){ await dragPath(p,r,[q,[710,500]]); await settle(p,210); }
  }],
  [2,2,async(p,r)=>{
    await clickL(p,r,650,355); await settle(p,100); // open
    for(const q of [[305,220],[305,330],[305,440],[1000,390]]){ await dragPath(p,r,[q,[650,355]]); await settle(p,210); }
    await clickL(p,r,650,355); await settle(p,100); // close
    await clickL(p,r,718,235); // start
    await p.waitForTimeout(1650);
    for(const q of [[760,585],[838,585],[916,585]]){ await dragPath(p,r,[q,[925,500]]); await settle(p,210); }
  }],
  [2,3,async(p,r)=>{
    await dragPath(p,r,[[300,210],[575,465]]); await settle(p,210);
    await dragPath(p,r,[[300,330],[575,465]]); await settle(p,210);
    await dragPath(p,r,[[300,455],[575,465]]); await settle(p,210);
    // Driver snaps to (575,405); rotate around screw center (575,465).
    await dragPath(p,r,quarterCircle(575,465,60,2),80);
  }],
  [3,1,async(p,r)=>{
    await dragPath(p,r,[[230,230],[650,420]]); await settle(p,210);
    await dragPath(p,r,[[360,230],[650,420]]); await settle(p,210);
    await clickL(p,r,210,355); await settle(p,80);
    await dragPath(p,r,quarterCircle(650,420,88,2.75),150); await settle(p,210);
    await dragPath(p,r,[[210,485],[650,420]]); await settle(p,210);
    await clickL(p,r,870,630);
  }],
  [3,2,async(p,r)=>{
    await dragPath(p,r,[[230,230],[650,420]]); await settle(p,210);
    await dragPath(p,r,[[360,230],[650,420]]); await settle(p,210);
    await clickL(p,r,325,355); await settle(p,80);
    await dragPath(p,r,quarterCircle(650,420,88,2.75),150); await settle(p,210);
    await dragPath(p,r,[[305,485],[650,420]]); await settle(p,210);
    await clickL(p,r,230,585); await settle(p,80);
    await clickL(p,r,870,630);
  }],
  [3,3,async(p,r)=>{
    await dragPath(p,r,[[230,230],[650,420]]); await settle(p,210);
    await dragPath(p,r,[[360,230],[650,420]]); await settle(p,210);
    await clickL(p,r,210,355); await settle(p,80);
    await dragPath(p,r,quarterCircle(650,420,88,2.75),150); await settle(p,210);
    await dragPath(p,r,[[210,485],[650,420]]); await settle(p,180);
    await dragPath(p,r,[[495,485],[690,440]]); await settle(p,180);
    await clickL(p,r,870,630);
  }]
];

for(const [g,r,play] of cases){
  test(`full-cycle G${g}R${r}`,async({page})=>{
    const label=`G${g}R${r}`;
    const {rct,errors}=await openRound(page,g,r);
    await play(page,rct);
    await debug(page,`${label}_AFTER_PLAY`);
    const st=await expectComplete(page,errors,label);
    expect(st.score).toBeGreaterThanOrEqual(60);
  });
}

test('touch-sized canvas and all nine rounds boot without runtime errors',async({page})=>{
  for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
    const errs=[]; page.removeAllListeners('pageerror'); page.removeAllListeners('console');
    page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key,null,{timeout:10000});
    expect(errs).toEqual([]);
    const box=await page.locator('canvas').boundingBox();
    expect(box.width).toBeGreaterThan(600); expect(box.height).toBeGreaterThan(300);
  }
});
