const { test } = require('@playwright/test');

const OFFICIAL='https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296';
const CANDIDATES=[
  ['fira','https://upload.wikimedia.org/wikipedia/commons/f/fd/Aktivitas_Menggosok_Gigi_oleh_Fira.svg','Fira.adiba · CC BY-SA 4.0'],
  ['satria','https://upload.wikimedia.org/wikipedia/commons/4/48/Ilustrasi_anak_sedang_menggosok_gigi.svg','Satriaraspati · CC BY-SA 4.0'],
  ['activity1','https://upload.wikimedia.org/wikipedia/commons/e/ee/Aktivitas-Menggosok-Gigi-1.svg','Commons teaching illustration · CC BY-SA 4.0'],
  ['illustration','https://upload.wikimedia.org/wikipedia/commons/b/b3/Ilustrasi_Menggosok_Gigi.svg','Commons teaching illustration · CC BY-SA 4.0']
];

test('G1R2 licensed authored candidate cut', async ({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1280,height:720});
  require('fs').mkdirSync('qa/reports/g1r2-fast',{recursive:true});
  for(let i=0;i<CANDIDATES.length;i++){
    const [id,url,credit]=CANDIDATES[i];
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;background:#111;font-family:Arial,sans-serif;color:#fff;overflow:hidden}
      .wrap{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#111}
      .side{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden;padding:20px}
      .candidate{background:#f7fbff}
      .label{position:absolute;left:14px;top:12px;z-index:2;background:rgba(0,0,0,.76);padding:7px 10px;border-radius:6px;font-weight:700;font-size:15px}
      .credit{position:absolute;right:14px;bottom:12px;z-index:2;background:rgba(0,0,0,.72);padding:6px 9px;border-radius:6px;font-size:12px}
      img{display:block;max-width:100%;max-height:100%;object-fit:contain}
    </style></head><body><div class="wrap">
      <div class="side"><div class="label">BABY PANDA OFFICIAL · BRUSHING</div><img id="official" src="${OFFICIAL}"></div>
      <div class="side candidate"><div class="label">CANDIDATE ${id.toUpperCase()}</div><img id="candidate" src="${url}"><div class="credit">${credit}</div></div>
    </div></body></html>`,{waitUntil:'domcontentloaded'});
    const loaded=await page.evaluate(()=>Promise.all(['official','candidate'].map(id=>new Promise(resolve=>{const im=document.getElementById(id);if(im.complete)return resolve(im.naturalWidth>0);const t=setTimeout(()=>resolve(false),10000);im.onload=()=>{clearTimeout(t);resolve(true)};im.onerror=()=>{clearTimeout(t);resolve(false)};}))));
    console.log('CANDIDATE',id,loaded);
    await page.waitForTimeout(250);
    await page.screenshot({path:`qa/reports/g1r2-fast/CANDIDATE-${String(i+1).padStart(2,'0')}-${id}.png`});
  }
});
