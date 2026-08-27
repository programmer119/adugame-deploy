const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname,'reports','visual');
fs.mkdirSync(OUT,{recursive:true});
const report=[];

async function rect(page){ return page.locator('canvas').boundingBox(); }
function map(r,x,y){ return {x:r.x + x/1280*r.width, y:r.y + y/720*r.height}; }
async function clickL(page,r,x,y){ const p=map(r,x,y); await page.mouse.move(p.x,p.y,{steps:3}); await page.mouse.click(p.x,p.y,{delay:70}); }
async function dragPath(page,r,points,pauseMs=0){
  const ps=points.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y,{steps:3}); await page.waitForTimeout(35); await page.mouse.down(); await page.waitForTimeout(70);
  for(let i=1;i<ps.length;i++){ const a=ps[i-1],b=ps[i],d=Math.hypot(b.x-a.x,b.y-a.y); await page.mouse.move(b.x,b.y,{steps:Math.max(3,Math.min(7,Math.ceil(d/55)))}); if(pauseMs)await page.waitForTimeout(pauseMs); }
  await page.waitForTimeout(65); await page.mouse.up();
}
function quarterCircle(cx,cy,r,turns=3){const pts=[];for(let i=0;i<=Math.ceil(turns*8);i++){const a=-Math.PI/2+i*Math.PI/4;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
function mixPath(cx,cy,r,turns=2.75){return [[cx,cy],...quarterCircle(cx,cy,r,turns)];}
async function waitState(page,pred,timeout=10000,arg=null){await page.waitForFunction(pred,arg,{timeout});}
async function openRound(page,g,r){await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'domcontentloaded'});await waitState(page,()=>window.__ADUGAME_DEBUG__?.()?.key,10000);await page.waitForTimeout(180);return rect(page);}

function inter(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.x+a.w,b.x+b.w),bt=Math.min(a.y+a.h,b.y+b.h);if(r<=x||bt<=y)return 0;return (r-x)*(bt-y);}
async function audit(page,label){
  const snap=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__?.(); if(!s)return {nodes:[]}; let id=0; const nodes=[];
    const walk=(o,parent=null,anc=[])=>{
      if(!o||o.visible===false||Number(o.alpha)<=0.02)return; let b=null; try{b=o.getBounds?.();}catch(_){}
      const my=id++; const name=o.name||''; const type=o.type||o.constructor?.name||'unknown';
      if(b&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.width)&&Number.isFinite(b.height))nodes.push({id:my,parent,anc,name,type,text:type==='Text'?String(o.text||''):'',interactive:!!o.input?.enabled,x:b.x,y:b.y,w:b.width,h:b.height,depth:o.depth||0});
      if(Array.isArray(o.list))for(const c of o.list)walk(c,my,[...anc,my]);
    };
    for(const o of s.children.list)walk(o,null,[]); return {nodes,state:s.debugState?.()||null};
  });
  const texts=snap.nodes.filter(n=>n.type==='Text'&&n.text.trim()); const interactive=snap.nodes.filter(n=>n.interactive);
  const issues=[];
  for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
    const a=texts[i],b=texts[j]; if(a.anc.includes(b.id)||b.anc.includes(a.id))continue; const area=inter(a,b); const amin=Math.max(1,Math.min(a.w*a.h,b.w*b.h));
    if(area/amin>.08)issues.push({kind:'text-text',a:a.text,b:b.text,ratio:+(area/amin).toFixed(3),aBox:[a.x,a.y,a.w,a.h],bBox:[b.x,b.y,b.w,b.h]});
  }
  for(const t of texts)for(const o of interactive){ if(t.id===o.id||t.anc.includes(o.id)||o.anc.includes(t.id))continue; const area=inter(t,o); if(area/Math.max(1,t.w*t.h)>.18)issues.push({kind:'text-interactive',text:t.text,target:o.name||o.type,ratio:+(area/(t.w*t.h)).toFixed(3),textBox:[t.x,t.y,t.w,t.h],targetBox:[o.x,o.y,o.w,o.h]}); }
  for(const n of snap.nodes){ if(n.x<20||n.y<16||n.x+n.w>1260||n.y+n.h>704)issues.push({kind:'safe-frame',target:n.text||n.name||n.type,box:[n.x,n.y,n.w,n.h]}); }
  const file=label.replace(/[^A-Za-z0-9_-]/g,'_')+'.png'; await page.locator('canvas').screenshot({path:path.join(OUT,file)});
  report.push({label,state:snap.state,issues});
}

async function g1r1(page,r){await audit(page,'G1R1_00_initial');await dragPath(page,r,[[315,405],[680,285],[760,275],[840,285],[760,295],[680,285]],45);await audit(page,'G1R1_01_partial');await dragPath(page,r,[[315,405],[680,285],[760,275],[840,285],[760,295],[680,285],[760,275],[840,285],[760,295]],45);await page.waitForTimeout(400);await audit(page,'G1R1_02_complete');}
async function g1r2(page,r){await audit(page,'G1R2_00_initial');await clickL(page,r,650,270);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===1);await audit(page,'G1R2_01_wet');await dragPath(page,r,[[315,350],[430,385],[540,425],[650,455]],8);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===2);await audit(page,'G1R2_02_soap');await dragPath(page,r,[[575,455],[640,445],[715,455],[640,465],[575,455],[640,445],[715,455],[640,465],[575,455],[640,445],[715,455]],12);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===3);await audit(page,'G1R2_03_scrub');await clickL(page,r,650,270);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===4);await audit(page,'G1R2_04_rinse');await dragPath(page,r,[[315,500],[460,475],[570,455],[730,455],[570,455],[730,455],[570,455]],12);await page.waitForTimeout(350);await audit(page,'G1R2_05_complete');}
async function g1r3(page,r){await audit(page,'G1R3_00_initial');await clickL(page,r,180,250);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===0.5);await audit(page,'G1R3_01_water');await dragPath(page,r,[[245,255],[280,245],[320,265],[355,250],[320,265],[280,245],[245,255],[285,265],[325,245],[355,255]],10);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===1);await audit(page,'G1R3_02_hands');await dragPath(page,r,[[210,405],[500,390],[900,390],[500,500],[900,500],[520,430],[900,445]],12);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===2);await audit(page,'G1R3_03_table');await dragPath(page,r,[[650,630],[690,550],[730,470]],8);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===3);await audit(page,'G1R3_04_plate');for(const q of [[[820,625],[820,570],[780,510],[730,450]],[[930,625],[880,570],[810,510],[730,450]],[[1040,625],[940,570],[830,510],[730,450]]]){await dragPath(page,r,q,8);await page.waitForTimeout(180);}await waitState(page,()=>window.__ADUGAME_DEBUG__()?.step===4);await audit(page,'G1R3_05_food');await dragPath(page,r,[[1120,500],[1120,440],[1120,390]],8);await page.waitForTimeout(300);await audit(page,'G1R3_06_complete');}
async function g2r1(page,r){await audit(page,'G2R1_00_initial');await clickL(page,r,255,300);await page.waitForTimeout(180);await audit(page,'G2R1_01_fridge');await dragPath(page,r,[[500,610],[470,450],[470,290]],8);await page.waitForTimeout(1500);await audit(page,'G2R1_02_toast');await clickL(page,r,760,285);await page.waitForTimeout(500);await audit(page,'G2R1_03_sink');await dragPath(page,r,[[850,320],[790,300],[760,285]],8);await page.waitForTimeout(300);await audit(page,'G2R1_04_cup');for(const q of [[[620,620],[650,560],[710,500]],[[740,620],[730,560],[710,500]],[[860,620],[780,560],[710,500]]]){await dragPath(page,r,q,8);await page.waitForTimeout(180);}await page.waitForTimeout(700);await audit(page,'G2R1_05_stack_complete');}
async function g2r2(page,r){await audit(page,'G2R2_00_initial');await clickL(page,r,650,355);await waitState(page,()=>window.__ADUGAME_DEBUG__()?.open===true);await audit(page,'G2R2_01_open');for(const q of [[[305,220],[450,280],[560,330],[650,355]],[[305,330],[470,340],[650,355]],[[305,440],[470,400],[650,355]],[[1000,390],[820,375],[650,355]]]){await dragPath(page,r,q,7);await page.waitForTimeout(180);}await audit(page,'G2R2_02_loaded');await clickL(page,r,650,425);await clickL(page,r,718,235);await page.waitForTimeout(500);await audit(page,'G2R2_03_running');await waitState(page,()=>window.__ADUGAME_DEBUG__()?.washed===true,6000);await page.waitForTimeout(180);await audit(page,'G2R2_04_washed');for(const q of [[[760,585],[850,540],[925,500]],[[838,585],[875,540],[970,500]],[[916,585],[910,540],[1020,500]]]){await dragPath(page,r,q,7);await page.waitForTimeout(180);}await audit(page,'G2R2_05_complete');}
async function g2r3(page,r){await audit(page,'G2R3_00_initial');await dragPath(page,r,[[1080,390],[900,350],[705,405]],8);await page.waitForTimeout(250);await audit(page,'G2R3_01_paint');await dragPath(page,r,[[900,610],[820,520],[705,405]],8);await page.waitForTimeout(250);await audit(page,'G2R3_02_polish');await dragPath(page,r,[[300,210],[440,340],[575,465]],8);await page.waitForTimeout(220);await audit(page,'G2R3_03_wheel');await dragPath(page,r,[[300,330],[450,395],[575,465]],8);await page.waitForTimeout(220);await audit(page,'G2R3_04_screw');await dragPath(page,r,[[300,455],[450,460],[575,465]],8);await page.waitForTimeout(250);await audit(page,'G2R3_05_driver_instruction');await dragPath(page,r,quarterCircle(575,465,60,2),22);await page.waitForTimeout(500);await audit(page,'G2R3_06_complete');}
async function g3(page,rnd,r){await audit(page,`G3R${rnd}_00_initial`);await dragPath(page,r,[[230,230],[450,330],[650,420]],7);await dragPath(page,r,[[360,230],[520,335],[650,420]],7);await page.waitForTimeout(250);await audit(page,`G3R${rnd}_01_ingredients`);await clickL(page,r,rnd===2?325:210,355);await page.waitForTimeout(120);await audit(page,`G3R${rnd}_02_color`);await dragPath(page,r,mixPath(650,420,82,2.75),62);await page.waitForTimeout(250);await audit(page,`G3R${rnd}_03_mixed`);await dragPath(page,r,[[rnd===2?305:210,485],[450,455],[650,420]],7);await page.waitForTimeout(180);if(rnd===2){await clickL(page,r,230,585);await page.waitForTimeout(120);}await audit(page,`G3R${rnd}_04_decorated`);await clickL(page,r,870,630);await page.waitForTimeout(1350);await audit(page,`G3R${rnd}_05_served`);}

const flows=[
  [1,1,g1r1],[1,2,g1r2],[1,3,g1r3],[2,1,g2r1],[2,2,g2r2],[2,3,g2r3],
  [3,1,(p,r)=>g3(p,1,r)],[3,2,(p,r)=>g3(p,2,r)],[3,3,(p,r)=>g3(p,3,r)]
];

for(const [g,r,flow] of flows)test(`visual-flow G${g}R${r}`,async({page})=>{const box=await openRound(page,g,r);await flow(page,box);});

test.afterAll(async()=>{fs.mkdirSync(path.join(__dirname,'reports'),{recursive:true});fs.writeFileSync(path.join(__dirname,'reports','visual-audit.json'),JSON.stringify(report,null,2));const severe=report.flatMap(x=>x.issues.map(i=>({label:x.label,...i}))).filter(i=>i.kind==='text-text'||i.kind==='text-interactive');console.log('ADUGAME_VISUAL_AUDIT_ISSUES',JSON.stringify(severe));});
