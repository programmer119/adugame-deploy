const { test, expect } = require('@playwright/test');

const BG=[
 ['a','https://img.itch.zone/aW1hZ2UvMTg1MDI3Mi8xMDg2MDYwNi5wbmc=/347x500/2emwcO.png'],
 ['b','https://img.itch.zone/aW1hZ2UvMTg1MDI3Mi8xMDg2MDYwNy5wbmc=/347x500/gFPt7e.png'],
 ['c','https://img.itch.zone/aW1hZ2UvMTg1MDI3Mi8xMDg2MDYwOC5wbmc=/347x500/wVuu2x.png'],
 ['d','https://img.itch.zone/aW1hZ2UvMTg1MDI3Mi8xMDg2MDYwOS5wbmc=/347x500/arRLKm.png']
];
const KID='https://raw.githubusercontent.com/Saba-Burduli/Petty/master/Petty/Petty/Resources/Characters/GameArt2DRedHatBoy/Frames/Idle/Idle_001.png';

test('fast G1R2 2D background candidates', async ({ page }) => {
 test.setTimeout(60000);
 await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!document.querySelector('#g1r2-v14-overlay .g1v14-bg'),null,{timeout:20000});
 await page.waitForTimeout(1800);
 for(const [id,url] of BG){
   const ok=await page.evaluate(async ({url,kid})=>{
     const bg=document.querySelector('#g1r2-v14-overlay .g1v14-bg');
     const k=document.querySelector('#g1r2-v14-overlay .g1v14-kid');
     if(!bg||!k)return false;
     k.onerror=null;k.src=kid;k.style.height='61%';k.style.width='auto';k.style.left='72%';k.style.top='60%';
     return await new Promise(resolve=>{let done=false;const fin=v=>{if(done)return;done=true;resolve(v)};bg.onload=()=>fin(bg.naturalWidth>0);bg.onerror=()=>fin(false);bg.src=url;if(bg.complete&&bg.naturalWidth>0)fin(true);setTimeout(()=>fin(false),6000);});
   },{url,kid:KID});
   console.log(`G1R2_2D_BG_${id}`,ok);
   await page.waitForTimeout(350);
   await page.screenshot({path:`qa/reports/g1r2-fast/G1R2-2d-${id}.png`,fullPage:true});
 }
 const generated=await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets);
 expect(generated).toBe(0);
});
