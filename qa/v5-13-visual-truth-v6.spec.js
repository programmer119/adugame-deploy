const {test,expect}=require('@playwright/test');

async function boot(page,g=3,r=2){
  await page.goto(`/index.html?game=${g}&round=${r}&e2e=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__ADUGAME_VISUAL_V6_TRUTH__?.loaded&&window.__ADUGAME_SCENE__?.()?.v6TruthVisual,{timeout:10000});
}
function overlap(a,b){const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return x*y;}

test('v6 slime visible state uses only the real finished shelf and separated order panel',async({page})=>{
  await boot(page);
  const st=await page.evaluate(()=>{
    const s=window.__ADUGAME_SCENE__();
    const b=o=>{const q=o?.getBounds?.();return q?{left:q.left,right:q.right,top:q.top,bottom:q.bottom}:null;};
    const fakeLabels=s.children.list.filter(o=>o?.type==='Text'&&o.text==='완성 슬라임 진열대');
    const realLabels=s.children.list.filter(o=>o?.type==='Text'&&o.name==='v6_real_store_shelf_label'&&o.visible!==false);
    return {order:b(s.orderBubble),bowl:b(s.bowl),customer:b(s.customer),fakeVisible:fakeLabels.filter(o=>o.visible!==false).length,realLabels:realLabels.length,realShelf:!!s.storeShelf?.active,truth:s.v6TruthVisual};
  });
  expect(st.truth).toBe(true);expect(st.fakeVisible).toBe(0);expect(st.realLabels).toBe(1);expect(st.realShelf).toBe(true);
  expect(st.order).toBeTruthy();expect(st.bowl).toBeTruthy();expect(st.customer).toBeTruthy();
  expect(overlap(st.order,st.bowl)).toBe(0);expect(overlap(st.order,st.customer)).toBe(0);
});
