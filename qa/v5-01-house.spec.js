const { test, expect } = require('@playwright/test');

async function rect(page){return page.locator('canvas').boundingBox();}
function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,pts,duration=220){const ps=pts.map(([x,y])=>map(r,x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();const pause=Math.max(18,Math.floor(duration/Math.max(1,ps.length-1)));for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}await page.mouse.up();}
async function waitFor(page,fn,timeout=5000){return page.waitForFunction(fn,null,{timeout});}
async function logState(page,label){const st=await page.evaluate(()=>window.__ADUGAME_DEBUG__());console.log('V5_HOUSE_STATE',label,JSON.stringify(st));return st;}

test('v5 house shelf removes hidden hit overlap and cooking can feed a character',async({page})=>{
  await page.goto('/index.html?game=2&round=1&e2e=1',{waitUntil:'networkidle'});
  await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.benchmarkV5==='four-floor-free-house');
  const r=await rect(page);

  let st=await logState(page,'boot');
  expect(st.currentFloor).toBe(1);
  expect(st.visibleShelfItems).toBe(9);
  expect(st.inventoryPage).toBe(0);

  const shelf=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    return {
      floorLabels:s.floorRail.list.map(t=>t.text),
      visible:s.items.filter(o=>o.inShelf&&o.floor===s.currentFloor&&o.visible).map(o=>o.kind),
      hiddenInteractive:s.items.filter(o=>o.inShelf&&o.floor===s.currentFloor&&!o.visible&&o.input?.enabled).map(o=>o.kind)
    };
  });
  expect(shelf.floorLabels[0]).toContain('1F');
  expect(shelf.visible.length).toBe(9);
  expect(shelf.visible).toContain('bread');
  expect(shelf.hiddenInteractive).toEqual([]);

  // Put the first character into the room.
  await dragL(page,r,[[315,628],[980,500]],220);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.discoveries?.includes('character_room'));
  st=await logState(page,'character');
  expect(st.fed).toBe(false);

  // Cook bread. Hidden page-2 objects must not steal the pointer at the stove.
  await dragL(page,r,[[330,205],[690,330]],220);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.cooked===true);
  const cooked=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();const b=s.items.find(o=>o.kind==='bread'&&o.floor===1);const c=s.characters.find(o=>!o.inDock&&!o.inElevator&&o.floor===1);
    return {bread:{x:b.x,y:b.y,state:b.state,visible:b.visible},character:{x:c.x,y:c.y}};
  });
  console.log('V5_HOUSE_GEOMETRY',JSON.stringify(cooked));
  expect(cooked.bread.state).toBe('cooked');
  expect(cooked.bread.visible).toBe(true);
  expect(Math.abs(cooked.bread.x-690)).toBeLessThan(8);
  expect(Math.abs(cooked.character.x-980)).toBeLessThan(8);

  await dragL(page,r,[[cooked.bread.x,cooked.bread.y],[cooked.character.x,cooked.character.y]],220);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.fed===true);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.milestone===true);
  st=await logState(page,'fed');
  expect(st.cooked).toBe(true);expect(st.fed).toBe(true);expect(st.milestone).toBe(true);

  await clickL(page,r,650,555);
  await waitFor(page,()=>window.__ADUGAME_DEBUG__()?.roundComplete===true);
});