const { test, expect } = require('@playwright/test');

test.setTimeout(50000);

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.move(p.x,p.y,{steps:3}); await page.mouse.click(p.x,p.y,{delay:70}); }
async function dragPath(page,r,points,pauseMs=0){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y,{steps:3});
  await page.waitForTimeout(35);
  await page.mouse.down();
  await page.waitForTimeout(70);
  for(let i=1;i<ps.length;i++){
    const a=ps[i-1], b=ps[i];
    const d=Math.hypot(b.x-a.x,b.y-a.y);
    const steps=Math.max(3,Math.min(7,Math.ceil(d/55)));
    await page.mouse.move(b.x,b.y,{steps});
    if(pauseMs) await page.waitForTimeout(pauseMs);
  }
  await page.waitForTimeout(65);
  await page.mouse.up();
}
function quarterCircle(cx,cy,r,turns=3){
  const pts=[]; const steps=Math.ceil(turns*8);
  for(let i=0;i<=steps;i++){
    const a=-Math.PI/2 + i*Math.PI/4;
    pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);
  }
  return pts;
}
function mixPath(cx,cy,r,turns=2.75){ return [[cx,cy],...quarterCircle(cx,cy,r,turns)]; }
async function debug(page,label){
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__?.());
  console.log(`ADUGAME_STATE ${label} ${JSON.stringify(st)}`);
  return st;
}
async function waitState(page,predicate,label,timeout=3000){
  try{ await page.waitForFunction(predicate,null,{timeout}); }
  catch(e){ await debug(page,`${label}_STATE_TIMEOUT`); throw e; }
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
  try{ await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.roundComplete===true,null,{timeout:6500}); }
  catch(e){ await debug(page,`${label}_FAIL`); throw e; }
  const st=await debug(page,`${label}_PASS`);
  expect(st.roundComplete).toBe(true); expect(errors).toEqual([]); return st;
}
const settle=(p,ms=180)=>p.waitForTimeout(ms);

const cases=[
  [1,1,async(p,r)=>{
    await dragPath(p,r,[[315,405],[680,285],[760,275],[840,285],[760,295],[680,285],[760,275],[840,285],[760,295],[680,285]],45);
  }],
  [1,2,async(p,r)=>{
    await clickL(p,r,650,270);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===1,'G1R2_WET');
    await dragPath(p,r,[[315,350],[430,385],[540,425],[650,455]],8);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===2,'G1R2_SOAP');
    await dragPath(p,r,[[575,455],[640,445],[715,455],[640,465],[575,455],[640,445],[715,455],[640,465],[575,455],[640,445],[715,455]],12);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===3,'G1R2_SCRUB');
    await clickL(p,r,650,270);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===4,'G1R2_RINSE');
    await dragPath(p,r,[[315,500],[460,475],[570,455],[730,455],[570,455],[730,455],[570,455]],12);
  }],
  [1,3,async(p,r)=>{
    await clickL(p,r,180,250); await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===0.5,'G1R3_WATER');
    await dragPath(p,r,[[245,255],[280,245],[320,265],[355,250],[320,265],[280,245],[245,255],[285,265],[325,245],[355,255]],10);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===1,'G1R3_HANDS');
    await dragPath(p,r,[[210,405],[500,390],[900,390],[500,500],[900,500],[520,430],[900,445]],12);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===2,'G1R3_TABLE');
    await dragPath(p,r,[[650,630],[690,550],[730,470]],8); await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===3,'G1R3_PLATE');
    for(const q of [[820,625],[930,625],[1040,625]]){ await dragPath(p,r,[q,[850,550],[730,450]],8); await settle(p,170); }
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.step===4,'G1R3_FOOD');
    await dragPath(p,r,[[1120,500],[1120,440],[1120,390]],8);
  }],
  [2,1,async(p,r)=>{
    for(const q of [[500,610],[620,620],[740,620]]){ await dragPath(p,r,[q,[620,555],[710,500]],8); await settle(p,170); }
  }],
  [2,2,async(p,r)=>{
    await clickL(p,r,650,355); await settle(p,100);
    const loads=[
      [[305,220],[450,280],[560,330],[650,355]],
      [[305,330],[470,340],[650,355]],
      [[305,440],[470,400],[650,355]],
      [[1000,390],[820,375],[650,355]]
    ];
    for(const path of loads){ await dragPath(p,r,path,7); await settle(p,170); }
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.loaded?.length===4,'G2R2_LOAD');
    await clickL(p,r,650,425); await waitState(p,()=>window.__ADUGAME_DEBUG__()?.open===false,'G2R2_CLOSE');
    await clickL(p,r,718,235);
    await waitState(p,()=>window.__ADUGAME_DEBUG__()?.washed===true,'G2R2_WASH',3200);
    for(const q of [[760,585],[838,585],[916,585]]){ await dragPath(p,r,[q,[850,540],[925,500]],7); await settle(p,170); }
  }],
  [2,3,async(p,r)=>{
    await dragPath(p,r,[[300,210],[440,340],[575,465]],8); await settle(p,170);
    await dragPath(p,r,[[300,330],[450,395],[575,465]],8); await settle(p,170);
    await dragPath(p,r,[[300,455],[450,460],[575,465]],8); await settle(p,170);
    await dragPath(p,r,quarterCircle(575,465,60,2),22);
  }],
  [3,1,async(p,r)=>{
    await dragPath(p,r,[[230,230],[450,330],[650,420]],7); await settle(p,210);
    await dragPath(p,r,[[360,230],[520,335],[650,420]],7); await settle(p,260);
    await clickL(p,r,210,355); await settle(p,100);
    await dragPath(p,r,mixPath(650,420,82,2.75),62); await settle(p,220);
    await dragPath(p,r,[[210,485],[450,455],[650,420]],7); await settle(p,180);
    await clickL(p,r,870,630);
  }],
  [3,2,async(p,r)=>{
    await dragPath(p,r,[[230,230],[450,330],[650,420]],7); await settle(p,210);
    await dragPath(p,r,[[360,230],[520,335],[650,420]],7); await settle(p,260);
    await clickL(p,r,325,355); await settle(p,100);
    await dragPath(p,r,mixPath(650,420,82,2.75),62); await settle(p,220);
    await dragPath(p,r,[[305,485],[480,455],[650,420]],7); await settle(p,180);
    await clickL(p,r,230,585); await settle(p,90);
    await clickL(p,r,870,630);
  }],
  [3,3,async(p,r)=>{
    await dragPath(p,r,[[230,230],[450,330],[650,420]],7); await settle(p,210);
    await dragPath(p,r,[[360,230],[520,335],[650,420]],7); await settle(p,260);
    await clickL(p,r,210,355); await settle(p,100);
    await dragPath(p,r,mixPath(650,420,82,2.75),62); await settle(p,220);
    await dragPath(p,r,[[210,485],[450,455],[650,420]],7); await settle(p,170);
    await dragPath(p,r,[[495,485],[590,460],[690,440]],7); await settle(p,170);
    await clickL(p,r,870,630);
  }]
];

for(const [g,r,play] of cases){
  test(`full-cycle G${g}R${r}`,async({page})=>{
    const label=`G${g}R${r}`; const {rct,errors}=await openRound(page,g,r);
    await play(page,rct); await debug(page,`${label}_AFTER_PLAY`);
    const st=await expectComplete(page,errors,label); expect(st.score).toBeGreaterThanOrEqual(60);
  });
}

test('touch-sized canvas and all nine rounds boot without runtime errors',async({page})=>{
  for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
    const errs=[]; page.removeAllListeners('pageerror'); page.removeAllListeners('console');
    page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key,null,{timeout:10000});
    expect(errs).toEqual([]); const box=await page.locator('canvas').boundingBox();
    expect(box.width).toBeGreaterThan(600); expect(box.height).toBeGreaterThan(300);
  }
});
