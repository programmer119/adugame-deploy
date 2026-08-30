const {test,expect}=require('@playwright/test');
function map(r,x,y){return{x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(p,r,x,y){const q=map(r,x,y);await p.mouse.click(q.x,q.y);}
async function dragL(p,r,pts,duration=220){const a=pts.map(([x,y])=>map(r,x,y));await p.mouse.move(a[0].x,a[0].y);await p.mouse.down();const dt=Math.max(14,Math.floor(duration/Math.max(1,a.length-1)));for(let i=1;i<a.length;i++){await p.mouse.move(a[i].x,a[i].y);await p.waitForTimeout(dt);}await p.mouse.up();}
function circle(cx,cy,r,turns=3.2,steps=4){const pts=[];for(let i=0;i<=turns*steps;i++){const a=-Math.PI/2+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
async function waitFor(p,fn,timeout=10000,arg=null){return p.waitForFunction(fn,arg,{timeout});}
async function guide(p){return p.evaluate(()=>{const s=window.__ADUGAME_SCENE__();return{status:String(s.status?.text||''),hint:s.hintTarget?{x:s.hintTarget.x,y:s.hintTarget.y}:null,chosen:s.chosen,guard:window.__ADUGAME_CLARITY_G3_STABLE_V5__||null};});}

test('strict command chain: G3 wrong color/container never advertises an invalid next action',async({page})=>{
  test.setTimeout(120000);
  await page.goto('/index.html?game=3&round=2&e2e=1',{waitUntil:'networkidle'});await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.key==='G3R2');const r=await page.locator('canvas').boundingBox();
  await clickL(page,r,380,585);await page.waitForTimeout(120);let g=await guide(page);expect(g.guard?.wrongContainerGuard).toBe(true);expect(g.status).toContain('베이스');expect(g.status).toContain('활성액');expect(g.status).not.toContain('모두 맞췄');expect(Math.abs(g.hint.x-230)).toBeLessThanOrEqual(3);expect(Math.abs(g.hint.y-230)).toBeLessThanOrEqual(3);
  await dragL(page,r,[[230,230],[650,420]],180);await waitFor(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'));
  await dragL(page,r,[[360,230],[650,420]],180);await waitFor(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'));
  await clickL(page,r,210,355);await page.waitForTimeout(120);g=await guide(page);expect(g.guard?.wrongColorGuard).toBe(true);expect(g.chosen.color).toBeNull();expect(g.status).toContain('초록');expect(Math.abs(g.hint.x-325)).toBeLessThanOrEqual(3);expect(Math.abs(g.hint.y-355)).toBeLessThanOrEqual(3);
  await clickL(page,r,325,355);await waitFor(page,()=>window.__ADUGAME_DEBUG__().chosen.color==='green');
  await dragL(page,r,circle(650,420,90),1900);await waitFor(page,()=>window.__ADUGAME_DEBUG__().mixed===true);
  await dragL(page,r,[[305,485],[650,420]],220);await waitFor(page,()=>window.__ADUGAME_DEBUG__().chosen.decos.includes('flower'));await page.waitForTimeout(650);
  await clickL(page,r,380,585);await page.waitForTimeout(120);g=await guide(page);expect(g.status).toContain('동그란');expect(g.status).not.toContain('손님에게 주기');expect(Math.abs(g.hint.x-230)).toBeLessThanOrEqual(3);expect(Math.abs(g.hint.y-585)).toBeLessThanOrEqual(3);
  await clickL(page,r,230,585);await page.waitForTimeout(120);g=await guide(page);expect(g.status).toContain('손님에게 주기');expect(Math.abs(g.hint.x-870)).toBeLessThanOrEqual(3);expect(Math.abs(g.hint.y-630)).toBeLessThanOrEqual(3);
});
