const { test, expect } = require('@playwright/test');

test.setTimeout(60000);

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.click(p.x,p.y); }
async function dragL(page,r,points,duration=300){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y); await page.mouse.down();
  const seg=Math.max(1,ps.length-1),steps=Math.max(4,Math.floor(20/seg));
  for(let k=1;k<ps.length;k++){
    const a=ps[k-1],b=ps[k];
    for(let i=1;i<=steps;i++){
      const q=i/steps;
      await page.mouse.move(a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q);
      await page.waitForTimeout(Math.max(8,duration/(seg*steps)));
    }
  }
  await page.mouse.up();
}
function circle(cx,cy,r,turns=3,steps=24,start=-Math.PI/2){
  const pts=[];for(let i=0;i<=turns*steps;i++){const a=start+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;
}
async function openRound(page,g,r){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key,{timeout:10000});
  await page.waitForTimeout(180);
  const rct=await rect(page); expect(rct).toBeTruthy(); return {rct,errors};
}
async function expectComplete(page,errors){
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.roundComplete===true,{timeout:12000});
  const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  expect(st.roundComplete).toBe(true); expect(errors).toEqual([]); return st;
}

const settle=(p,ms=260)=>p.waitForTimeout(ms);

const cases=[
  [1,1,async(p,r)=>{
    await dragL(p,r,[[315,405],[680,285],[840,285],[680,285],[840,285],[680,285]],1150);
  }],
  [1,2,async(p,r)=>{
    await clickL(p,r,650,270); await settle(p,560);
    await dragL(p,r,[[315,350],[650,455]],340); await settle(p,240);
    await dragL(p,r,[[590,455],[710,455],[590,455],[710,455],[590,455],[710,455]],1000); await settle(p,120);
    await clickL(p,r,650,270); await settle(p,560);
    await dragL(p,r,[[315,500],[570,455],[730,455],[570,455],[730,455]],900);
  }],
  [1,3,async(p,r)=>{
    await clickL(p,r,180,250); await settle(p,120);
    await dragL(p,r,[[250,255],[350,255],[250,255],[350,255],[250,255],[350,255]],720); await settle(p,160);
    await dragL(p,r,[[210,405],[500,390],[900,390],[500,500],[900,500]],1050); await settle(p,260);
    await dragL(p,r,[[650,630],[730,470]],340); await settle(p,220);
    for(const q of [[820,625],[930,625],[1040,625]]){await dragL(p,r,[q,[730,450]],340);await settle(p,210);}
    await dragL(p,r,[[1120,500],[1120,390]],300);
  }],
  [2,1,async(p,r)=>{
    for(const q of [[520,500],[620,560],[760,560]]){await dragL(p,r,[q,[700,500]],360);await settle(p,230);}
  }],
  [2,2,async(p,r)=>{
    await clickL(p,r,650,350); await settle(p,120);
    for(const q of [[320,240],[320,340],[320,440],[940,250]]){await dragL(p,r,[q,[650,350]],360);await settle(p,220);}
    await p.waitForTimeout(1550);
    for(const q of [[780,535],[855,535],[930,535]]){await dragL(p,r,[q,[960,475]],360);await settle(p,220);}
  }],
  [2,3,async(p,r)=>{
    await dragL(p,r,[[320,260],[550,455]],360); await settle(p,240);
    await dragL(p,r,[[320,390],[550,455]],360); await settle(p,240);
    await dragL(p,r,[[320,520],[550,455]],360); await settle(p,250);
    await dragL(p,r,circle(550,455,62,2.2,24),1250);
  }],
  [3,1,async(p,r)=>{
    await dragL(p,r,[[230,230],[650,420]],360);await settle(p,240);
    await dragL(p,r,[[360,230],[650,420]],360);await settle(p,240);
    await clickL(p,r,210,355);await settle(p,140);
    await dragL(p,r,circle(650,420,88,3.2,24),1850);await settle(p,300);
    await dragL(p,r,[[210,485],[650,420]],360);await settle(p,240);
    await clickL(p,r,870,630);
  }],
  [3,2,async(p,r)=>{
    await dragL(p,r,[[230,230],[650,420]],360);await settle(p,240);
    await dragL(p,r,[[360,230],[650,420]],360);await settle(p,240);
    await clickL(p,r,325,355);await settle(p,140);
    await dragL(p,r,circle(650,420,88,3.2,24),1850);await settle(p,300);
    await dragL(p,r,[[305,485],[650,420]],360);await settle(p,240);
    await clickL(p,r,230,585);await settle(p,120);
    await clickL(p,r,870,630);
  }],
  [3,3,async(p,r)=>{
    await dragL(p,r,[[230,230],[650,420]],360);await settle(p,240);
    await dragL(p,r,[[360,230],[650,420]],360);await settle(p,240);
    await clickL(p,r,210,355);await settle(p,140);
    await dragL(p,r,circle(650,420,88,3.2,24),1850);await settle(p,300);
    await dragL(p,r,[[210,485],[650,420]],360);await settle(p,220);
    await dragL(p,r,[[495,485],[690,440]],360);await settle(p,220);
    await clickL(p,r,870,630);
  }]
];

for(const [g,r,play] of cases){
  test(`full-cycle G${g}R${r}`,async({page})=>{
    const {rct,errors}=await openRound(page,g,r);
    await play(page,rct);
    const st=await expectComplete(page,errors);
    expect(st.score).toBeGreaterThanOrEqual(60);
  });
}

test('touch-sized canvas and all nine rounds boot without runtime errors',async({page})=>{
  for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
    const errs=[];page.removeAllListeners('pageerror');page.removeAllListeners('console');
    page.on('pageerror',e=>errs.push(String(e)));page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.__ADUGAME_DEBUG__ && window.__ADUGAME_DEBUG__()?.key,{timeout:10000});
    expect(errs).toEqual([]);const box=await page.locator('canvas').boundingBox();expect(box.width).toBeGreaterThan(600);expect(box.height).toBeGreaterThan(300);
  }
});
