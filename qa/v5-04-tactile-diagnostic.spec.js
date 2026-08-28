const { test, expect } = require('@playwright/test');

async function rect(page){return page.locator('canvas').boundingBox();}
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,points,duration=240){const ps=points.map(([x,y])=>map(r,x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();const pause=Math.max(12,Math.floor(duration/Math.max(1,ps.length-1)));for(let k=1;k<ps.length;k++){await page.mouse.move(ps[k].x,ps[k].y);await page.waitForTimeout(pause);}await page.mouse.up();}
function circle(cx,cy,r,turns=3,steps=4,start=-Math.PI/2){const pts=[];for(let i=0;i<=turns*steps;i++){const a=start+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
async function waitFor(page,fn,timeout=12000,arg=null){return page.waitForFunction(fn,arg,{timeout});}

async function mixBase(page,r){
  await dragL(page,r,[[230,230],[650,420]],180);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.ingredients?.includes('base'),7000);
  await dragL(page,r,[[360,230],[650,420]],180);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.ingredients?.includes('activator'),7000);
  await clickL(page,r,210,355);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.chosen?.color==='blue',5000);
  await dragL(page,r,circle(650,420,90,3.2,4),1900);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.mixed===true,7000);
}

test('v5 tactile diagnostic uses the same real mouse pull contract',async({page})=>{
  await page.goto('/index.html?game=3&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.key);
  const r=await rect(page);expect(r).toBeTruthy();
  await mixBase(page,r);
  const before=await page.evaluate(()=>Math.max(...window.__ADUGAME_SCENE__().slimeBlob.points.map(p=>Math.hypot(p.x-p.bx,p.y-p.by))));
  expect(before).toBeLessThan(2);
  const a=map(r,755,420),b=map(r,815,420);
  await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:2});await page.waitForTimeout(80);
  const diag=await page.evaluate(()=>window.__ADUGAME_DEBUG__());
  console.log('V5_TACTILE_TARGET_DIAG',JSON.stringify(diag));
  const pulled=await page.evaluate(()=>Math.max(...window.__ADUGAME_SCENE__().slimeBlob.points.map(p=>Math.hypot(p.x-p.bx,p.y-p.by))));
  expect(pulled).toBeGreaterThan(18);
  await page.mouse.up();await page.waitForTimeout(900);
  const relaxed=await page.evaluate(()=>Math.max(...window.__ADUGAME_SCENE__().slimeBlob.points.map(p=>Math.hypot(p.x-p.bx,p.y-p.by))));
  expect(relaxed).toBeLessThan(pulled);
});
