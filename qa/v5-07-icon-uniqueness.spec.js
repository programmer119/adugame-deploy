const {test,expect}=require('@playwright/test');

async function open(page){
  await page.goto('/index.html?game=2&round=1&e2e=1',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key==='G2R1');
}

test('strict clarity: every distinct G2 portable kind renders its own visible shelf pictogram',async({page})=>{
  await open(page);
  const s=await page.evaluate(()=>{
    const sc=window.__ADUGAME_SCENE__();
    const items=sc.items.map(o=>{
      const texts=(o.list||[]).filter(x=>x?.type==='Text');
      const pic=texts.find(x=>Number(x.y)<0);
      return {kind:o.kind,label:o.semanticLabel||'',p:o.pictogram||'',identity:o.visualIdentity||'',rendered:pic?String(pic.text||''):'',renderedWidth:pic?Number(pic.width)||0:0,renderedHeight:pic?Number(pic.height)||0:0};
    });
    return {items,patch:window.__ADUGAME_CLARITY_ICONS_V5__||null};
  });
  expect(s.patch?.loaded).toBe(true);
  expect(s.patch?.uniquePortableKinds).toBe(true);
  expect(s.items).toHaveLength(100);
  const bad=s.items.filter(o=>o.identity!=='scene-shelf-item'||!o.label||!o.p||o.rendered!==o.p||o.renderedWidth<=0||o.renderedHeight<=0||o.renderedWidth>58);
  expect(bad,`non-rendered/oversize v6 shelf pictograms: ${JSON.stringify(bad)}`).toEqual([]);

  const byKind=new Map();for(const o of s.items)if(!byKind.has(o.kind))byKind.set(o.kind,o);
  const byPic=new Map();for(const o of byKind.values()){if(!byPic.has(o.p))byPic.set(o.p,[]);byPic.get(o.p).push(o.kind);}
  const duplicateKinds=[...byPic.entries()].filter(([,kinds])=>kinds.length>1).map(([p,kinds])=>({p,kinds}));
  expect(duplicateKinds,`different objects share the same pictogram: ${JSON.stringify(duplicateKinds)}`).toEqual([]);
});
