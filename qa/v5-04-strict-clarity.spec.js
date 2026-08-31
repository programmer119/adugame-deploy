const { test, expect } = require('@playwright/test');

function map(r,x,y){return {x:r.x+x/1280*r.width,y:r.y+y/720*r.height};}
async function clickL(page,r,x,y){const p=map(r,x,y);await page.mouse.click(p.x,p.y);}
async function dragL(page,r,points,duration=240){const ps=points.map(([x,y])=>map(r,x,y));await page.mouse.move(ps[0].x,ps[0].y);await page.mouse.down();const pause=Math.max(15,Math.floor(duration/Math.max(1,ps.length-1)));for(let i=1;i<ps.length;i++){await page.mouse.move(ps[i].x,ps[i].y);await page.waitForTimeout(pause);}await page.mouse.up();}
function circle(cx,cy,r,turns=3.2,steps=4){const pts=[];for(let i=0;i<=turns*steps;i++){const a=-Math.PI/2+2*Math.PI*i/steps;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
async function waitFor(page,fn,timeout=10000,arg=null){return page.waitForFunction(fn,arg,{timeout});}
async function open(page,g,r){await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'networkidle'});await waitFor(page,()=>window.__ADUGAME_DEBUG__?.()?.key);const box=await page.locator('canvas').boundingBox();expect(box).toBeTruthy();return box;}
async function sceneAudit(page){return page.evaluate(()=>{
  const s=window.__ADUGAME_SCENE__();const all=[];let id=0;
  const ht=s.hintTarget?{x:s.hintTarget.x,y:s.hintTarget.y}:null;
  const accepts=(o,p)=>{
    if(!p||!o?.input?.enabled||!o.input.hitArea||typeof o.input.hitAreaCallback!=='function')return false;
    try{
      const m=o.getWorldTransformMatrix?.();
      if(!m)return false;
      const local=new Phaser.Math.Vector2();m.applyInverse(p.x,p.y,local);
      return !!o.input.hitAreaCallback(o.input.hitArea,local.x,local.y,o);
    }catch(_){return false;}
  };
  const walk=(o,parentVisible=true,parentAlpha=1)=>{if(!o)return;const alpha=Number.isFinite(Number(o.alpha))?Number(o.alpha):1;const visible=parentVisible&&o.visible!==false&&parentAlpha*alpha>.02;let b=null;try{b=o.getBounds?.();}catch(_){}const bounds=b&&Number.isFinite(b.x)?{x:b.x,y:b.y,w:b.width,h:b.height}:null;all.push({id:id++,name:o.name||'',kind:o.kind||'',type:o.type||o.constructor?.name||'',text:o.type==='Text'?String(o.text||''):'',visible,interactive:!!o.input?.enabled,bounds,acceptsHint:visible&&accepts(o,ht),visualIdentity:o.visualIdentity||'',semanticLabel:o.semanticLabel||'',pictogram:o.pictogram||''});if(Array.isArray(o.list))o.list.forEach(c=>walk(c,visible,parentAlpha*alpha));};
  s.children.list.forEach(o=>walk(o));
  return {key:s.debugState?.().key,status:String(s.status?.text||''),hintTarget:ht,nodes:all,clarity:window.__ADUGAME_CLARITY_V5__||null,orderConditions:s.clarityOrderConditionKeys||[]};
});}
function contains(b,p,pad=2){return !!b&&p.x>=b.x-pad&&p.x<=b.x+b.w+pad&&p.y>=b.y-pad&&p.y<=b.y+b.h+pad;}

// 1) no actionable control or instruction text is clipped outside the logical 1280x720 stage.
test('strict clarity: all nine rounds keep actionable controls and instruction text inside stage',async({page})=>{
  for(let g=1;g<=3;g++)for(let r=1;r<=3;r++){
    await open(page,g,r);const a=await sceneAudit(page);expect(a.clarity?.loaded).toBe(true);
    const bad=a.nodes.filter(n=>n.visible&&n.bounds&&(n.interactive||n.type==='Text')&&(n.bounds.x<-3||n.bounds.y<-3||n.bounds.x+n.bounds.w>1283||n.bounds.y+n.bounds.h>723));
    expect(bad,`G${g}R${r} clipped nodes: ${JSON.stringify(bad)}`).toEqual([]);
    if(a.hintTarget){const hits=a.nodes.filter(n=>n.acceptsHint);expect(hits.length,`G${g}R${r} hint ${JSON.stringify(a.hintTarget)} must land inside an enabled Phaser hitArea; status=${a.status}; interactive=${JSON.stringify(a.nodes.filter(n=>n.visible&&n.interactive).map(n=>({name:n.name,kind:n.kind,type:n.type,bounds:n.bounds})))}`).toBeGreaterThan(0);}
  }
});

// 2) v6 daily-habit tools must be illustrated scene objects while retaining semantic/pictogram metadata; English code words may never be the primary identity.
test('strict clarity: G1 required tools are illustrated, identifiable and stay inside activity panel',async({page})=>{
  await open(page,1,1);let s=await page.evaluate(()=>{const x=window.__ADUGAME_SCENE__();return {soap:[x.soap.visualIdentity,x.soap.semanticLabel,x.soap.pictogram],flush:[x.flush.visualIdentity,x.flush.semanticLabel,x.flush.text]};});
  expect(s.soap).toEqual(['illustrated','비누','🧼']);expect(s.flush[0]).toBe('pictogram');expect(s.flush[1]).toBe('물내림');expect(s.flush[2]).not.toBe('●');
  await open(page,1,2);s=await page.evaluate(()=>{const x=window.__ADUGAME_SCENE__();const b=x.clipper.getBounds();return {tools:[x.brush,x.paste,x.cloth,x.clipper].map(o=>({kind:o.kind,identity:o.visualIdentity,label:o.semanticLabel,p:o.pictogram})),clipperBounds:{x:b.x,y:b.y,w:b.width,h:b.height}};});
  expect(s.tools.every(o=>o.identity==='illustrated'&&o.label&&o.p&&!/^(BRUSH|PASTE|CLOTH|CLIP)$/.test(o.p))).toBe(true);expect(s.clipperBounds.y+s.clipperBounds.h).toBeLessThanOrEqual(592);
  await open(page,1,3);s=await page.evaluate(()=>{const x=window.__ADUGAME_SCENE__();return [...x.toys,...x.foods].map(o=>({kind:o.kind,identity:o.visualIdentity,label:o.semanticLabel,p:o.pictogram}));});
  expect(s).toHaveLength(8);expect(s.every(o=>o.identity==='illustrated'&&o.label&&o.p)).toBe(true);
});

// 3) all 100 free-play house items and core fixtures must have a non-label visual identity.
test('strict clarity: G2 all portable items and fixtures are pictogram-identifiable',async({page})=>{
  await open(page,2,1);const s=await page.evaluate(()=>{const x=window.__ADUGAME_SCENE__();const fixtures=['car','toolbox','yardBox','stove','sink','fridge','sofa','washer','rack','bath','toyBox','bed','patio'].map(k=>x[k]).filter(Boolean);return {items:x.items.map(o=>({kind:o.kind,identity:o.visualIdentity,label:o.semanticLabel,p:o.pictogram})),fixtures:fixtures.map(o=>({name:o.name,identity:o.visualIdentity,label:o.semanticLabel,p:o.pictogram}))};});
  expect(s.items).toHaveLength(100);
  const badItems=s.items.filter(o=>o.identity!=='pictogram'||!o.label||!o.p);expect(badItems,JSON.stringify(badItems)).toEqual([]);
  const badFixtures=s.fixtures.filter(o=>o.identity!=='pictogram'||!o.label||!o.p);expect(badFixtures,JSON.stringify(badFixtures)).toEqual([]);
});

// 4) the strictest command-target chain: visible condition badges -> requested decoration -> requested container -> serve.
test('strict clarity: G3 visible order conditions, hint and accepted target stay exactly aligned',async({page})=>{
  const r=await open(page,3,2);let a=await sceneAudit(page);
  expect(a.status).toContain('베이스');expect(a.status).toContain('활성액');expect(a.orderConditions).toEqual(['color:green','deco:flower','container:round']);
  let labels=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__();const txt=o=>o.list?.filter(x=>x?.type==='Text').map(x=>x.text).join(' ');return {base:txt(s.base),act:txt(s.activator),order:s.orderLabel.text,serve:s.serveButton.text,badgesVisible:!!s.clarityOrderBadges?.visible,badgeCount:s.clarityOrderBadges?.list?.length||0,oldOrderVisible:s.orderIcons.visible};});
  expect(labels.base).toContain('베이스');expect(labels.act).toContain('활성액');expect(labels.order).toBe('주문 조건');expect(labels.serve).toBe('손님에게 주기');expect(labels.badgesVisible).toBe(true);expect(labels.badgeCount).toBe(3);expect(labels.oldOrderVisible).toBe(false);

  await dragL(page,r,[[230,230],[650,420]],180);await waitFor(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('base'));
  await dragL(page,r,[[360,230],[650,420]],180);await waitFor(page,()=>window.__ADUGAME_DEBUG__().ingredients.includes('activator'));
  await clickL(page,r,325,355);await waitFor(page,()=>window.__ADUGAME_DEBUG__().chosen.color==='green');
  await dragL(page,r,circle(650,420,90),1900);await waitFor(page,()=>window.__ADUGAME_DEBUG__().mixed===true);
  a=await sceneAudit(page);let flower=a.nodes.find(n=>n.name==='deco_flower'&&n.visible&&n.interactive);expect(flower).toBeTruthy();expect(flower.acceptsHint,`mixed hint=${JSON.stringify(a.hintTarget)} flower=${JSON.stringify(flower.bounds)}`).toBe(true);

  await dragL(page,r,[[305,485],[650,420]],220);await waitFor(page,()=>window.__ADUGAME_DEBUG__().chosen.decos.includes('flower'));await page.waitForTimeout(300);
  a=await sceneAudit(page);expect(a.status).toContain('동그란');let round=a.nodes.find(n=>n.name==='container_round'&&n.visible&&n.interactive);expect(round).toBeTruthy();expect(round.acceptsHint).toBe(true);
  await clickL(page,r,230,585);await page.waitForTimeout(100);a=await sceneAudit(page);expect(a.status).toContain('손님에게 주기');let serve=a.nodes.find(n=>n.type==='Text'&&n.text==='손님에게 주기'&&n.visible&&n.interactive);expect(serve).toBeTruthy();expect(serve.acceptsHint).toBe(true);

  // Explicitly probe the second R2 order: the visible condition model must switch to square.
  const probe=await page.evaluate(()=>{const s=window.__ADUGAME_SCENE__(),old=s.order;s.order={color:'blue',deco:'star',container:'square'};s.renderClarityOrderBadges();const keys=[...s.clarityOrderConditionKeys];const n=s.clarityOrderBadges.list.map(o=>o.name);s.order=old;s.renderClarityOrderBadges();return {keys,n};});
  expect(probe.keys).toEqual(['color:blue','deco:star','container:square']);expect(probe.n.some(x=>x==='order_badge_container:square')).toBe(true);expect(probe.n.some(x=>x==='order_badge_container:round')).toBe(false);
});
