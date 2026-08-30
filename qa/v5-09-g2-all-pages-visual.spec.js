const {test,expect}=require('@playwright/test');
const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'reports','strict-pages');fs.mkdirSync(OUT,{recursive:true});
function inter(a,b){const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.x+a.width,b.x+b.width),bt=Math.min(a.y+a.height,b.y+b.height);return r<=x||bt<=y?0:(r-x)*(bt-y);}

test('strict clarity: all 12 G2 floor/page inventory views render identifiable and pager-clear',async({page})=>{
  await page.goto('/index.html?game=2&round=1&e2e=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__ADUGAME_DEBUG__?.()?.key==='G2R1');
  const canvas=page.locator('canvas');
  for(let floor=0;floor<4;floor++)for(let pg=0;pg<3;pg++){
    const state=await page.evaluate(({floor,pg})=>{
      const s=window.__ADUGAME_SCENE__();s.showFloor(floor,true);s.setInventoryPage(pg);
      const pager=s.inventoryHud.getBounds();
      const items=s.items.filter(o=>o.floor===floor&&o.inShelf&&o.visible).map(o=>{const b=o.getBounds(),pic=o.list?.filter(x=>x?.type==='Text').find(x=>Number(x.y)<0);return{kind:o.kind,p:o.pictogram||'',label:o.semanticLabel||'',identity:o.visualIdentity||'',rendered:pic?String(pic.text||''):'',b:{x:b.x,y:b.y,width:b.width,height:b.height}};});
      return {items,pager:{x:pager.x,y:pager.y,width:pager.width,height:pager.height},pageText:s.inventoryPageText.text};
    },{floor,pg});
    await page.waitForTimeout(80);
    expect(state.pageText).toBe(`물건 ${pg+1}/3`);
    expect(state.items.length).toBe(pg<2?9:7);
    const bad=state.items.filter(o=>o.identity!=='pictogram'||!o.p||!o.label||o.rendered!==o.p);expect(bad,`F${floor+1} P${pg+1} bad icons ${JSON.stringify(bad)}`).toEqual([]);
    const overlap=state.items.filter(o=>inter(o.b,state.pager)>0);expect(overlap,`F${floor+1} P${pg+1} pager overlap ${JSON.stringify(overlap)}`).toEqual([]);
    await canvas.screenshot({path:path.join(OUT,`G2_F${floor+1}_P${pg+1}.png`)});
  }
});
