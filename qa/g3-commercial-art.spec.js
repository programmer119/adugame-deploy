const { test, expect } = require('@playwright/test');
const fs=require('fs');const path=require('path');
const OUT=path.resolve('qa/reports/g3-commercial');fs.mkdirSync(OUT,{recursive:true});
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function dragL(page,r,points,duration=260){const ps=points.map(([x,y])=>map(r,x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();const pause=Math.max(22,Math.floor(duration/Math.max(1,ps.length-1)));for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}await page.mouse.up();}
async function clickL(page,r,x,y,hold=70){const p=map(r,x,y);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.waitForTimeout(hold);await page.mouse.up();}
function circle(cx,cy,rr,turns=3.3,steps=5){const pts=[];for(let i=0;i<=turns*steps;i++){const a=-Math.PI/2+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return pts;}
async function shot(page,name){await page.screenshot({path:path.join(OUT,name),fullPage:true});}
async function waitDebug(page,fn,arg,timeout=12000){return page.waitForFunction(fn,arg,{timeout});}
async function center(page,sel){return page.locator(sel).evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};});}

test('G3 authored commercial art stays aligned through first customer and shop reveal',async({page})=>{
  await page.goto('/index.html?game=3&round=1&e2e=1',{waitUntil:'domcontentloaded'});
  await waitDebug(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='persistent-slime-store',null,30000);
  await waitDebug(page,()=>{const r=document.getElementById('g3-commercial-art-v1');return r&&r.dataset.ready==='1'&&r.dataset.hitAlignment==='1';},null,30000);
  const r=await page.locator('canvas').boundingBox();expect(r).toBeTruthy();
  const meta=await page.evaluate(()=>({root:{...document.getElementById('g3-commercial-art-v1').dataset},art:window.__ADUGAME_ART_SOURCE__?.G3,imgs:[...document.querySelectorAll('#g3-commercial-art-v1 img')].map(x=>({cls:x.className,naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight}))}));
  expect(meta.root.generatedVisualAssets).toBe('0');expect(meta.root.artQuality).toBe('authored-scene');expect(meta.art.generatedVisualAssets).toBe(0);expect(meta.imgs.filter(x=>x.naturalWidth>0).length).toBeGreaterThanOrEqual(6);

  // Visible controls must sit on the actual Phaser hit targets.
  for(const [sel,x,y] of [['.g3-color-blue',210,355],['.g3-color-green',325,355],['.g3-color-pink',440,355],['.g3-supply-soccer',596,188]]){
    const c=await center(page,sel),p=map(r,x,y);expect(Math.abs(c.x-p.x)).toBeLessThan(12);expect(Math.abs(c.y-p.y)).toBeLessThan(12);
  }
  await shot(page,'G3-0-start.png');

  await dragL(page,r,[[230,230],[650,420]],280);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'));
  await dragL(page,r,[[360,230],[650,420]],280);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'));
  await shot(page,'G3-1-ingredients.png');

  await clickL(page,r,210,355,80);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().chosen.color==='blue');
  await dragL(page,r,circle(650,420,88),2100);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().mixed===true,null,10000);
  expect(await page.locator('.g3-slime').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
  await shot(page,'G3-2-mixed.png');

  await dragL(page,r,[[210,485],[650,420]],300);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().chosen.decos.includes('star'));
  await waitDebug(page,()=>document.getElementById('g3-commercial-art-v1')?.dataset.orderReady==='true');
  await shot(page,'G3-3-ready.png');

  const serve=await page.evaluate(()=>{const b=window.__ADUGAME_SCENE__().serveButton;return{x:b.x,y:b.y};});await clickL(page,r,serve.x,serve.y,100);
  await waitDebug(page,()=>{const d=window.__ADUGAME_DEBUG__();return d.ordersServed===1&&d.orderIndex===1;},null,12000);
  await shot(page,'G3-4-next-customer.png');

  // The first sale earns 3 coins; show the consumable supply shop and a purchased stock state.
  await clickL(page,r,596,188,90);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().supplyStock.soccer===2);
  await shot(page,'G3-5-shop-stock.png');
  const end=await page.evaluate(()=>({debug:window.__ADUGAME_DEBUG__(),root:{...document.getElementById('g3-commercial-art-v1').dataset}}));
  expect(end.debug.coinBalance).toBe(1);expect(end.debug.supplyStock.soccer).toBe(2);expect(end.root.generatedVisualAssets).toBe('0');
  fs.writeFileSync(path.join(OUT,'G3-debug.json'),JSON.stringify(end,null,2));
});
