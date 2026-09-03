const { test, expect } = require('@playwright/test');
const fs=require('fs');const path=require('path');
const OUT=path.resolve('qa/reports/g3-commercial');fs.mkdirSync(OUT,{recursive:true});
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function dragL(page,r,points,duration=260){const ps=points.map(([x,y])=>map(r,x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();const pause=Math.max(22,Math.floor(duration/Math.max(1,ps.length-1)));for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}await page.mouse.up();}
async function pressL(page,r,x,y,hold=90){const p=map(r,x,y);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.waitForTimeout(hold);await page.mouse.up();}
async function clickL(page,r,x,y,hold=70){return pressL(page,r,x,y,hold);}
function circle(cx,cy,rr,turns=3.2,steps=4){const pts=[];for(let i=0;i<=turns*steps;i++){const a=-Math.PI/2+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}return pts;}
async function shot(page,name){await page.screenshot({path:path.join(OUT,name),fullPage:false,animations:'disabled'});}
async function waitDebug(page,fn,arg,timeout=12000){return page.waitForFunction(fn,arg,{timeout});}
async function center(page,sel){return page.locator(sel).evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};});}
async function serveLive(page,r,before){
  // Verify the user-visible contract: a valid unlocked order has a visible live target,
  // and releasing on that target advances the actual order. Internal Phaser input objects
  // may be replaced by legacy wrappers, so they are telemetry, not the acceptance criterion.
  await waitDebug(page,()=>{const s=window.__ADUGAME_SCENE__();return !!s&&!s.interactionLocked&&!s.roundComplete&&!!s.mixed&&s.chosen?.color===s.order?.color&&s.chosen?.decos?.includes(s.order?.deco)&&(!s.order?.container||s.chosen?.container===s.order.container)&&s.serveButton?.visible!==false;},null,5000);
  for(let attempt=0;attempt<2;attempt++){
    const b=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),o=s.serveButton,bb=o.getBounds();return{x:bb.centerX,y:bb.centerY,w:bb.width,h:bb.height,input:!!o.input?.enabled,visible:o.visible!==false,locked:!!s.interactionLocked,ready:!!window.__ADUGAME_DEBUG__()?.serveReadyInvariant,nativeCount:window.__ADUGAME_DEBUG__()?.serveNativePointerCount||0};});
    expect(b.visible).toBe(true);expect(b.locked).toBe(false);expect(b.ready).toBe(true);expect(b.w).toBeGreaterThan(90);expect(b.h).toBeGreaterThan(40);
    await pressL(page,r,b.x,b.y,110);
    try{await waitDebug(page,n=>window.__ADUGAME_DEBUG__().ordersServed>n,before,5000);return;}catch(e){
      const diag=await page.evaluate(()=>({debug:window.__ADUGAME_DEBUG__(),input:!!window.__ADUGAME_SCENE__()?.serveButton?.input?.enabled}));console.log('G3_SERVE_DIAG',JSON.stringify(diag));
      if(attempt===1)throw e;await page.waitForTimeout(180);
    }
  }
}

test('G3 authored commercial art stays aligned and visually clean through the full two-customer round',async({page})=>{
  test.setTimeout(210000);
  await page.goto('/index.html?game=3&round=1&e2e=1',{waitUntil:'domcontentloaded'});
  await waitDebug(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='persistent-slime-store',null,30000);
  await waitDebug(page,()=>{const r=document.getElementById('g3-commercial-art-v1');return r&&r.dataset.ready==='1'&&r.dataset.hitAlignment==='1'&&r.dataset.v2HeroReady==='1'&&r.dataset.version==='2.3';},null,30000);
  const r=await page.locator('canvas').boundingBox();expect(r).toBeTruthy();
  const meta=await page.evaluate(()=>({root:{...document.getElementById('g3-commercial-art-v1').dataset},art:window.__ADUGAME_ART_SOURCE__?.G3,imgs:[...document.querySelectorAll('#g3-commercial-art-v1 img')].map(x=>({cls:x.className,naturalWidth:x.naturalWidth,naturalHeight:x.naturalHeight,src:x.src,display:getComputedStyle(x).display}))}));
  expect(meta.root.generatedVisualAssets).toBe('0');expect(meta.root.artQuality).toBe('authored-scene-v2');expect(meta.root.visualPolish).toBe('v2.3');expect(meta.art.generatedVisualAssets).toBe(0);expect(meta.art.version).toBe('commercial-v2.3');expect(meta.imgs.filter(x=>x.naturalWidth>0).length).toBeGreaterThanOrEqual(6);expect(meta.imgs.find(x=>x.cls==='g3-clerk')?.src).toContain('/300873');
  expect(meta.imgs.filter(x=>x.cls==='g3-finished-jar'&&x.display!=='none')).toHaveLength(0);
  expect(await page.locator('.g3-workbench').evaluate(e=>getComputedStyle(e).display)).toBe('none');
  expect(await page.locator('.g3-v23-sold').textContent()).toContain('0/2');
  expect(parseFloat(await page.locator('.g3-focus').evaluate(e=>getComputedStyle(e).borderWidth))).toBeLessThanOrEqual(3);
  expect(parseFloat(await page.locator('.g3-supply-soccer').evaluate(e=>getComputedStyle(e).opacity))).toBeLessThan(.05);

  for(const [sel,x,y] of [['.g3-color-blue',210,355],['.g3-color-green',325,355],['.g3-color-pink',440,355],['.g3-supply-soccer',596,188]]){
    const c=await center(page,sel),p=map(r,x,y);expect(Math.abs(c.x-p.x)).toBeLessThan(12);expect(Math.abs(c.y-p.y)).toBeLessThan(12);
  }
  await shot(page,'G3-0-start.png');

  await dragL(page,r,[[230,230],[650,420]],280);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'));
  await dragL(page,r,[[360,230],[650,420]],280);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'));
  await page.waitForTimeout(520);await shot(page,'G3-1-ingredients.png');
  await clickL(page,r,210,355,80);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().chosen.color==='blue');
  await dragL(page,r,circle(650,420,88),1900);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().mixed===true,null,10000);
  await page.waitForTimeout(220);expect(await page.locator('.g3-slime').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');expect(await page.locator('#g3-commercial-art-v1').getAttribute('data-slime-color')).toBe('blue');
  await shot(page,'G3-2-mixed.png');
  await dragL(page,r,[[210,485],[650,420]],300);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().chosen.decos.includes('star'));
  await waitDebug(page,()=>document.getElementById('g3-commercial-art-v1')?.dataset.orderReady==='true');
  await shot(page,'G3-3-ready.png');
  await serveLive(page,r,0);
  await waitDebug(page,()=>{const d=window.__ADUGAME_DEBUG__();return d.ordersServed===1&&d.orderIndex===1&&d.ingredients.length===0&&!d.mixed;},null,12000);
  await page.waitForTimeout(420);
  expect(await page.locator('.g3-v23-sold').textContent()).toContain('1/2');
  expect(await page.locator('#g3-commercial-art-v1').getAttribute('data-legacy-jar-visible')).toBe('0');
  expect(parseFloat(await page.locator('.g3-supply-soccer').evaluate(e=>getComputedStyle(e).opacity))).toBeGreaterThan(.9);
  await shot(page,'G3-4-next-customer.png');

  await clickL(page,r,596,188,90);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().supplyStock.soccer===2);
  await shot(page,'G3-5-shop-stock.png');

  await dragL(page,r,[[230,230],[650,420]],280);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'));
  await dragL(page,r,[[360,230],[650,420]],280);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'));
  await clickL(page,r,440,355,80);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().chosen.color==='pink');
  await dragL(page,r,circle(650,420,88),1900);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().mixed===true,null,10000);
  await dragL(page,r,[[400,485],[650,420]],300);await waitDebug(page,()=>window.__ADUGAME_DEBUG__().chosen.decos.includes('heart'));
  await waitDebug(page,()=>document.getElementById('g3-commercial-art-v1')?.dataset.orderReady==='true');
  expect(await page.locator('#g3-commercial-art-v1').getAttribute('data-slime-color')).toBe('pink');
  await shot(page,'G3-6-second-ready.png');

  await serveLive(page,r,1);
  await waitDebug(page,()=>{const d=window.__ADUGAME_DEBUG__();const root=document.getElementById('g3-commercial-art-v1');return d.roundComplete===true&&d.ordersServed===2&&root?.dataset.completionCta==='hidden'&&root?.dataset.roundComplete==='true';},null,12000);
  await page.waitForTimeout(420);
  expect(await page.locator('.g3-v23-sold').textContent()).toContain('2/2 · 주문 완료');
  expect(await page.locator('#g3-commercial-art-v1').getAttribute('data-legacy-jar-visible')).toBe('0');
  const completionUi=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),root=document.getElementById('g3-commercial-art-v1');return{serveVisible:s.serveButton?.visible!==false,serveInput:!!s.serveButton?.input?.enabled,serveDomOpacity:parseFloat(getComputedStyle(root.querySelector('.g3-serve')).opacity),focusOpacity:parseFloat(getComputedStyle(root.querySelector('.g3-focus')).opacity),orderOpacity:parseFloat(getComputedStyle(root.querySelector('.g3-order-card')).opacity),completionCta:root.dataset.completionCta};});
  expect(completionUi.serveVisible).toBe(false);expect(completionUi.serveInput).toBe(false);expect(completionUi.serveDomOpacity).toBeLessThan(.05);expect(completionUi.focusOpacity).toBeLessThan(.05);expect(completionUi.orderOpacity).toBeLessThan(.75);expect(completionUi.completionCta).toBe('hidden');
  await shot(page,'G3-7-complete.png');

  const end=await page.evaluate(()=>({debug:window.__ADUGAME_DEBUG__(),root:{...document.getElementById('g3-commercial-art-v1').dataset},art:window.__ADUGAME_ART_SOURCE__?.G3}));
  expect(end.debug.roundComplete).toBe(true);expect(end.debug.ordersServed).toBe(2);expect(end.debug.shelfCount).toBe(2);expect(end.debug.coinEarned).toBe(6);expect(end.debug.coinBalance).toBe(4);expect(end.debug.supplyStock.soccer).toBe(2);expect(end.debug.serveNativePointerCount).toBeGreaterThanOrEqual(2);
  expect(end.root.generatedVisualAssets).toBe('0');expect(end.root.finishedDisplay).toBe('completion-badge');expect(end.root.legacyJarVisible).toBe('0');expect(end.root.completionCta).toBe('hidden');expect(end.root.roundComplete).toBe('true');expect(end.art.generatedVisualAssets).toBe(0);expect(end.art.completionPresentation).toContain('hidden');
  fs.writeFileSync(path.join(OUT,'G3-debug.json'),JSON.stringify({...end,completionUi},null,2));
});
