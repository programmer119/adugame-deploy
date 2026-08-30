const {test,expect}=require('@playwright/test');
function map(box,x,y){return{x:box.x+x/1280*box.width,y:box.y+y/720*box.height};}
async function boot(page){await page.goto('/index.html?game=2&round=3&e2e=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__ADUGAME_VISUAL_V6_DYNAMIC_CLEAN__?.loaded&&window.__ADUGAME_SCENE__?.()?.v6Polish,{timeout:10000});return page.locator('canvas').boundingBox();}
async function state(page){return page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return{floor:s.currentFloor,polish:s.v6Polish,workbench:s.children.list.filter(o=>o?.type==='Text'&&o.text==='작업대'&&o.visible!==false).length,dynamic:s.children.list.filter(o=>o?.name==='v6_house_dynamic_details'&&o.active!==false).length};});}
test('v6 house visual details do not leak when leaving and returning to garage',async({page})=>{
  const box=await boot(page);let st=await state(page);expect(st.floor).toBe(0);expect(st.polish).toBe('house-floor-1');expect(st.workbench).toBe(1);expect(st.dynamic).toBe(1);
  let p=map(box,62,303);await page.mouse.click(p.x,p.y);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.currentFloor===1);await page.waitForTimeout(80);st=await state(page);expect(st.floor).toBe(1);expect(st.polish).toBe('house-floor-2');expect(st.workbench).toBe(0);expect(st.dynamic).toBe(1);
  p=map(box,62,225);await page.mouse.click(p.x,p.y);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__()?.currentFloor===0);await page.waitForTimeout(80);st=await state(page);expect(st.workbench).toBe(1);expect(st.dynamic).toBe(1);
});
