const {test,expect}=require('@playwright/test');
function map(r,x,y){return{x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function dragL(p,r,a,b){const s=map(r,...a),e=map(r,...b);await p.mouse.move(s.x,s.y);await p.mouse.down();await p.mouse.move(e.x,e.y,{steps:8});await p.mouse.up();}
async function clickL(p,r,x,y){const q=map(r,x,y);await p.mouse.click(q.x,q.y);}

test('strict command chain: G3 color selection points exactly at enabled mix surface',async({page})=>{
  await page.goto('/index.html?game=3&round=2&e2e=1',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key==='G3R2');
  const r=await page.locator('canvas').boundingBox();expect(r).toBeTruthy();
  await dragL(page,r,[230,230],[650,420]);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'));
  await dragL(page,r,[360,230],[650,420]);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'));
  await clickL(page,r,325,355);await page.waitForFunction(()=>window.__ADUGAME_DEBUG__().chosen.color==='green');
  const s=await page.evaluate(()=>{
    const sc=window.__ADUGAME_SCENE__(),p=sc.hintTarget,z=sc.mixZone,m=z.getWorldTransformMatrix(),local=new Phaser.Math.Vector2();m.applyInverse(p.x,p.y,local);
    return {status:String(sc.status.text||''),hint:{x:p.x,y:p.y},mixEnabled:!!z.input?.enabled,accepts:!!z.input?.hitAreaCallback?.(z.input.hitArea,local.x,local.y,z),local:{x:local.x,y:local.y}};
  });
  expect(s.status).toContain('섞');expect(s.hint).toEqual({x:650,y:420});expect(s.mixEnabled).toBe(true);expect(s.accepts,JSON.stringify(s)).toBe(true);
});
