const { test, expect } = require('@playwright/test');

async function waitScene(page){
  await page.waitForFunction(()=>window.__ADUGAME_SCENE__?.()?.v6Visual&&window.__ADUGAME_VISUAL_V6_POLISH__?.loaded&&window.__ADUGAME_VISUAL_V6_DYNAMIC__?.loaded,{timeout:12000});
}
async function open(page,g,r){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'networkidle'});
  await waitScene(page);
  const box=await page.locator('canvas').boundingBox();
  expect(box).toBeTruthy();
  expect(box.width).toBeGreaterThan(700);
  expect(box.height).toBeGreaterThan(390);
  const state=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return{key:s.debugState?.().key||'',v6:s.v6Visual||'',polish:s.v6Polish||''};});
  expect(state.v6).toContain('illustrated');
  expect(errors).toEqual([]);
  return box;
}
function map(box,x,y){return{x:box.x+x/1280*box.width,y:box.y+y/720*box.height};}

for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
  test(`webkit v6 start G${g}R${r}`,async({page})=>{
    await open(page,g,r);
  });
}

test('webkit portrait shows rotate guard and blocks game input',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitScene(page);
  await expect(page.locator('.rotate-note')).toBeVisible();
  await expect(page.locator('.rotate-note')).toContainText('가로 화면으로 돌려주세요');
  await expect(page.locator('.phaser-wrap')).toHaveCSS('pointer-events','none');
});

test('webkit mobile landscape touch advances G1R1 live controls',async({browser})=>{
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitScene(page);
  await expect(page.locator('.rotate-note')).toBeHidden();
  const box=await page.locator('canvas').boundingBox();
  expect(box).toBeTruthy();
  expect(box.height).toBeGreaterThanOrEqual(370);
  expect(box.width).toBeGreaterThan(650);
  let p=map(box,740,380);
  await page.touchscreen.tap(p.x,p.y);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.step===.5,{timeout:7000});
  p=map(box,790,275);
  await page.touchscreen.tap(p.x,p.y);
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.step===1,{timeout:7000});
  await context.close();
});
