const {test,expect}=require('@playwright/test');
const fs=require('fs');
const rounds=[
  [1,1,'G1R1'],[1,2,'G1R2'],[1,3,'G1R3'],
  [2,1,'G2R1'],[2,2,'G2R2'],[2,3,'G2R3'],
  [3,1,'G3R1'],[3,2,'G3R2'],[3,3,'G3R3']
];
async function waitAuthored(page,key){
  await page.waitForFunction(k=>{
    if(window.__ADUGAME_DEBUG__?.()?.key!==k)return false;
    if(k==='G1R2'){const r=document.querySelector('#g1r2-v17-overlay');return r?.dataset.gameFeelReady==='1'&&r?.dataset.version==='17.32'&&window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets===0;}
    if(k.startsWith('G3')){const r=document.querySelector('#g3-commercial-art-v1');return r?.dataset.version==='2.3'&&r?.dataset.v2HeroReady==='1'&&Number(r?.dataset.generatedVisualAssets||0)===0;}
    const r=document.querySelector(`#remaining-commercial-${k}`);return r?.dataset.ready==='1'&&r?.dataset.heroReady==='1'&&Number(r?.dataset.generatedVisualAssets||0)===0;
  },key,{timeout:45000});
  await page.waitForTimeout(350);
}
for(const [game,round,key] of rounds){
  test(`commercial authored start ${key}`,async({page})=>{
    test.setTimeout(65000);fs.mkdirSync('qa/reports/commercial-nine',{recursive:true});
    await page.goto(`/index.html?game=${game}&round=${round}&e2e=1`,{waitUntil:'domcontentloaded'});
    await waitAuthored(page,key);
    const evidence=await page.evaluate(k=>{
      const root=k==='G1R2'?document.querySelector('#g1r2-v17-overlay'):k.startsWith('G3')?document.querySelector('#g3-commercial-art-v1'):document.querySelector(`#remaining-commercial-${k}`);
      const images=[...root.querySelectorAll('img')].map(i=>({src:i.src,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,display:getComputedStyle(i).display,opacity:getComputedStyle(i).opacity}));
      return {key:k,state:window.__ADUGAME_DEBUG__?.(),root:{version:root.dataset.version,ready:root.dataset.ready||root.dataset.gameFeelReady||root.dataset.v2HeroReady,generated:root.dataset.generatedVisualAssets,quality:root.dataset.qualityTarget||''},images,source:window.__ADUGAME_ART_SOURCE__};
    },key);
    expect(evidence.state.key).toBe(key);expect(Number(evidence.root.generated||0)).toBe(0);
    if(key!=='G1R2')expect(evidence.images.some(i=>i.naturalWidth>0&&i.display!=='none'&&Number(i.opacity)>0)).toBe(true);
    fs.writeFileSync(`qa/reports/commercial-nine/${key}.json`,JSON.stringify(evidence,null,2));
    await page.screenshot({path:`qa/reports/commercial-nine/${key}.png`});
  });
}
