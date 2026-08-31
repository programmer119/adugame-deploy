const { test, expect } = require('@playwright/test');

async function rect(page){return page.locator('canvas').boundingBox();}
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,pts,duration=240){
  const ps=pts.map(([x,y])=>map(r,x,y));
  await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();
  const pause=Math.max(18,Math.floor(duration/Math.max(1,ps.length-1)));
  for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}
  await page.mouse.up();
}
async function livePoint(page,key){
  return page.evaluate(k=>{const s=window.__ADUGAME_SCENE__?.();const o=s?.[k];return o?{x:o.x,y:o.y}:null;},key);
}
async function waitFor(page,fn,timeout=8000){return page.waitForFunction(fn,null,{timeout});}
async function state(page,label){const s=await page.evaluate(()=>window.__ADUGAME_DEBUG__());console.log('V5_G1R1_STATE',label,JSON.stringify(s));return s;}
async function soapDiag(page,label){
  const d=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__?.();
    if(!s)return {scene:false};
    const soap=s.soap,target=s.soapInputTarget;
    const point={x:soap?.x??0,y:soap?.y??0};
    const overlaps=[];
    for(const o of s.children?.list||[]){
      if(!o?.input)continue;
      let b=null,contains=false;
      try{b=o.getBounds?.();contains=!!b&&Phaser.Geom.Rectangle.Contains(b,point.x,point.y);}catch(_){ }
      if(!contains)continue;
      overlaps.push({
        name:String(o.name||''),type:String(o.type||o.constructor?.name||''),depth:Number(o.depth||0),
        visible:o.visible!==false,active:o.active!==false,alpha:Number(o.alpha??1),inputEnabled:o.input?.enabled!==false,
        x:Number(o.x||0),y:Number(o.y||0),bounds:b?{x:b.x,y:b.y,w:b.width,h:b.height}:null
      });
    }
    overlaps.sort((a,b)=>b.depth-a.depth);
    const info=o=>o?{
      name:String(o.name||''),type:String(o.type||o.constructor?.name||''),x:o.x,y:o.y,depth:o.depth,
      visible:o.visible!==false,active:o.active!==false,alpha:o.alpha,inputEnabled:o.input?.enabled!==false,
      inputType:o.input?.hitArea?.type??null
    }:null;
    return {
      scene:true,step:s.step,topOnly:s.input?.topOnly,soap:info(soap),target:info(target),overlaps,
      counters:{down:s.__g1SoapPointerDown||0,move:s.__g1SoapPointerMove||0,up:s.__g1SoapPointerUp||0},
      telemetry:(window.__ADUGAME_TELEMETRY__||[]).slice(-12)
    };
  });
  console.log(`SOAP_DIAG_${label}`,JSON.stringify(d));
  return d;
}

test('v5 G1R1 exact state chain',async({page})=>{
  await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='toilet-handwash');
  const r=await rect(page);

  const toilet=await livePoint(page,'toilet');expect(toilet).toBeTruthy();
  await clickL(page,r,toilet.x,toilet.y);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===0.5);
  expect((await state(page,'toilet')).step).toBe(.5);

  const flush=await livePoint(page,'flush');expect(flush).toBeTruthy();
  await clickL(page,r,flush.x,flush.y);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===1);
  expect((await state(page,'flush')).step).toBe(1);

  const faucet=await livePoint(page,'faucet');expect(faucet).toBeTruthy();
  await clickL(page,r,faucet.x,faucet.y);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===2);
  expect((await state(page,'wet')).step).toBe(2);

  const soap=await livePoint(page,'soap'),hands=await livePoint(page,'hands');
  expect(soap).toBeTruthy();expect(hands).toBeTruthy();
  await soapDiag(page,'BEFORE');
  await dragL(page,r,[[soap.x,soap.y],[hands.x,hands.y]],220);
  await page.waitForTimeout(260);
  await soapDiag(page,'AFTER');
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===3);
  expect((await state(page,'soap')).step).toBe(3);

  const h=await livePoint(page,'hands');expect(h).toBeTruthy();
  // Runtime intentionally ignores single pointer jumps >=120 logical px as non-scrubbing motion.
  // Use a realistic dense left/right gesture: 70px segments accumulate well past the 340px goal.
  await dragL(page,r,[
    [h.x-70,h.y],[h.x,h.y],[h.x+70,h.y],[h.x,h.y],[h.x-70,h.y],
    [h.x,h.y],[h.x+70,h.y],[h.x,h.y],[h.x-70,h.y]
  ],760);
  const scrubNow=await state(page,'scrub-immediate');
  expect(scrubNow.scrubDistance).toBeGreaterThanOrEqual(340);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.step===4);
  const scrub=await state(page,'scrub');
  expect(scrub.step).toBe(4);

  const rinseFaucet=await livePoint(page,'faucet');expect(rinseFaucet).toBeTruthy();
  await clickL(page,r,rinseFaucet.x,rinseFaucet.y);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.roundComplete===true);
  expect((await state(page,'rinse')).roundComplete).toBe(true);
});
