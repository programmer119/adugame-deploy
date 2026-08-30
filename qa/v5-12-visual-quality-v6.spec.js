const {test,expect}=require('@playwright/test');
const fs=require('fs');
fs.mkdirSync('qa/reports/v6-start',{recursive:true});

async function waitScene(page){await page.waitForFunction(()=>window.__ADUGAME_SCENE__?.()?.v6Visual&&window.__ADUGAME_VISUAL_V6_POLISH__?.loaded&&window.__ADUGAME_VISUAL_V6_DYNAMIC__?.loaded,{timeout:10000});}
async function open(page,g,r){await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'networkidle'});await waitScene(page);return page.locator('canvas').boundingBox();}
async function sceneAudit(page){return page.evaluate(()=>{
  const scene=window.__ADUGAME_SCENE__();const texts=[];
  const walk=o=>{if(!o)return;if(o.type==='Text'&&o.visible!==false&&o.alpha!==0)texts.push(String(o.text||''));if(Array.isArray(o.list))o.list.forEach(walk);};scene.children.list.forEach(walk);
  const forbidden=['SOAP','PASTE','BRUSH','CLOTH','CLIP','SERVE','ORDER','CHARACTER DOCK','SLIME LAB','STORE','ROUND'];
  return {v6:scene.v6Visual,polish:scene.v6Polish||null,texts,forbidden:forbidden.filter(x=>texts.some(t=>t.includes(x)))};
});}
function map(box,x,y){return{x:box.x+x/1280*box.width,y:box.y+y/720*box.height};}

for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
  test(`v6 visual quality start G${g}R${r}`,async({page})=>{
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    const box=await open(page,g,r);expect(box).toBeTruthy();expect(box.width).toBeGreaterThan(700);expect(box.height).toBeGreaterThan(390);
    const a=await sceneAudit(page);expect(a.v6).toContain('illustrated');expect(a.forbidden).toEqual([]);expect(errors).toEqual([]);
    if(g===1&&r===1){const ok=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return [s.toilet,s.faucet,s.hands,s.soap].every(o=>o?.visualIdentity==='illustrated');});expect(ok).toBe(true);}
    if(g===1&&r===2){const ok=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return [s.paste,s.brush,s.cloth,s.clipper,s.hand].every(o=>o?.visualIdentity==='illustrated');});expect(ok).toBe(true);}
    if(g===1&&r===3){const st=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),soda=(s.foods||[]).find(o=>o.kind==='soda');return{ok:[...(s.toys||[]),...(s.foods||[])].every(o=>o?.visualIdentity==='illustrated'),polish:s.v6Polish,dx:soda&&s.face?Math.abs(soda.x-s.face.x):999};});expect(st.ok).toBe(true);expect(st.polish).toBe('room-native-r3');expect(st.dx).toBeGreaterThanOrEqual(90);}
    if(g===2){const st=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),fixtures=[s.car,s.toolbox,s.yardBox,s.stove,s.sink,s.fridge,s.sofa,s.washer,s.rack,s.bath,s.toyBox,s.bed,s.patio].filter(Boolean);return{fixtures:fixtures.every(o=>o.visualIdentity==='illustrated'),items:(s.items||[]).every(o=>o.visualIdentity==='scene-shelf-item'),chars:(s.characters||[]).every(o=>o.visualIdentity==='illustrated-character'),elevator:s.elevator?.visualIdentity,polish:s.v6Polish,dynamic:s.children.list.filter(o=>o?.name==='v6_house_dynamic_details').length};});expect(st.fixtures).toBe(true);expect(st.items).toBe(true);expect(st.chars).toBe(true);expect(st.elevator).toBe('illustrated-elevator');expect(st.polish).toContain('house-floor-');expect(st.dynamic).toBe(1);}
    if(g===3){const st=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),decos=s.children.list.filter(o=>o?.name?.startsWith('deco_')&&!o.name.startsWith('deco_bonus_')),containers=s.children.list.filter(o=>o?.name==='container_round'||o?.name==='container_square');return{ok:s.bowl?.visualIdentity==='illustrated'&&s.base?.visualIdentity==='illustrated'&&s.activator?.visualIdentity==='illustrated'&&decos.every(o=>o.visualIdentity==='illustrated')&&containers.every(o=>o.visualIdentity==='illustrated')&&!!s.serveButton?.input?.enabled,polish:s.v6Polish};});expect(st.ok).toBe(true);expect(st.polish).toBe('slime-store-scene');}
    await page.screenshot({path:`qa/reports/v6-start/G${g}R${r}.png`,fullPage:true});
  });
}

test('v6 house decorative scene follows a real floor change',async({page})=>{
  const box=await open(page,2,1);let st=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return{floor:s.currentFloor,polish:s.v6Polish,dynamic:s.children.list.filter(o=>o?.name==='v6_house_dynamic_details').length};});
  expect(st.floor).toBe(1);expect(st.polish).toBe('house-floor-2');expect(st.dynamic).toBe(1);
  const p=map(box,62,225);await page.mouse.click(p.x,p.y);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.currentFloor===0,{timeout:5000});await page.waitForTimeout(80);
  st=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return{floor:s.currentFloor,polish:s.v6Polish,dynamic:s.children.list.filter(o=>o?.name==='v6_house_dynamic_details').length,garageLabel:s.children.list.filter(o=>o?.type==='Text'&&o?.name==='v6_house_dynamic_label').map(o=>o.text)};});
  expect(st.floor).toBe(0);expect(st.polish).toBe('house-floor-1');expect(st.dynamic).toBe(1);expect(st.garageLabel).toContain('작업대');
  await page.screenshot({path:'qa/reports/v6-start/G2-floor-change.png',fullPage:true});
});

test('v6 portrait refuses tiny gameplay and asks for landscape',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});await waitScene(page);
  const note=page.locator('.rotate-note');await expect(note).toBeVisible();await expect(note).toContainText('가로 화면으로 돌려주세요');
  await expect(page.locator('.phaser-wrap')).toHaveCSS('pointer-events','none');
  await page.screenshot({path:'qa/reports/v6-start/mobile-portrait-guard.png',fullPage:true});
});

test('v6 mobile landscape gives the game the viewport and keeps tap targets live',async({browser})=>{
  const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const page=await context.newPage();
  await page.goto('/index.html?game=1&round=1&e2e=1',{waitUntil:'networkidle'});await waitScene(page);
  const note=page.locator('.rotate-note');await expect(note).toBeHidden();const box=await page.locator('canvas').boundingBox();expect(box.height).toBeGreaterThanOrEqual(370);expect(box.width).toBeGreaterThan(650);
  let p=map(box,740,380);await page.touchscreen.tap(p.x,p.y);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===.5,{timeout:5000});p=map(box,790,275);await page.touchscreen.tap(p.x,p.y);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.step===1,{timeout:5000});
  await page.screenshot({path:'qa/reports/v6-start/mobile-landscape-touch.png',fullPage:true});await context.close();
});
