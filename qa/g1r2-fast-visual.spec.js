const { test, expect } = require('@playwright/test');

const BABY_PANDA_OFFICIAL = [
  'https://play-lh.googleusercontent.com/ZhT3SqfpofaxPlUUSlxPeUb0SbSVlfkA1LcubCNqdkXtb4FT4mZclYzFYC_7LW7eKA=w526-h296',
  'https://play-lh.googleusercontent.com/Ygmfp2LefHxcyKVuK92LA1jIac1Duk8gtALKpK7rMf0ZxdEzE5rgNk6VlqL6lHEVASrA=w526-h296',
  'https://play-lh.googleusercontent.com/WbhsVurvqDNzZrF3EyFF9ro4EHxC0KQvNpFHPfX_sPDAg8LMMbrEsoYvrKGlj8RuCw=w526-h296',
  'https://play-lh.googleusercontent.com/JaK8q_oKfNLVwk3QFOBl-OCv96UY9kR_ytIGchxbzijLzPi6cytOC3N7crpWUtJlvW0=w526-h296',
  'https://play-lh.googleusercontent.com/u86Wz4fwSl35h_eVqiEBcWhrEaW2XAZGvi9qbX_hxhC5Gb2qyka6_mjZb9GaqGILSA=w526-h296',
  'https://play-lh.googleusercontent.com/-cy7huzYf4hF2QQ1XbtAw-ndMD3w9-I5zeMsqc8d2OQHXiyvgYsN7g2r8FAoJ4dq5g=w526-h296',
  'https://play-lh.googleusercontent.com/Sn16_NZNgSPHGmiOffpdbZ5BcDcvR-2vVbo_vKf7vNXN5cyRMOkakzdyMQns3l31j58=w526-h296',
  'https://play-lh.googleusercontent.com/-r_k9_mruAh4nKjk4QmP2o63s0Cl5GoXMxUuJ2mRXU_7niY5PJgtn9Iu0Wn0Bo_VGO4=w526-h296',
  'https://play-lh.googleusercontent.com/AZDOsJivh092mW_Ehg50KhINd9m5YSe4lmEUIdP8IBT7KTd3mfKRYclx3I4r2R5wIIni=w526-h296',
  'https://play-lh.googleusercontent.com/VL3JsenFjFONC4Y9NrOYiIWXfbP90l5GFFU-f6hTFerepg5t6N6CiWJjR_BeFyD8N3A=w526-h296',
  'https://play-lh.googleusercontent.com/AN2VwhPS_w3OnrUGX6NLnnCyLogijnjazVW3W3nx1k1S8KpJJO7wC86MjsvGhnaF3KE=w526-h296',
  'https://play-lh.googleusercontent.com/5hM5b1A7R7xOuZHeYjy7m6VqGoRnJzY00JktbYYsejSwNP-l-1LeBjlfDVdGL4UA5BVY=w526-h296',
  'https://play-lh.googleusercontent.com/_YAWfmpb2aqJT-HiupDUSzKG5PLfkiEU2lg8eG5Lq6NzKysLgxdflLLkLn-4Qq9SGA=w526-h296',
  'https://play-lh.googleusercontent.com/ErtEDwVW6TcCpCAjitTh8dYAA4jnVBMMdVi2jB5f7eHTdM5DFFTgg5jgQEFm0vrhJBU=w526-h296',
  'https://play-lh.googleusercontent.com/en-y4RoPrHN2wjAYp51yR8gdS-263K-HhfzsSGIMnXI4smt6sI2ln6wf6zJYJxUpYQc=w526-h296',
  'https://play-lh.googleusercontent.com/tj_tulij6S4-cyF5JbrfpQ5g4xyrKU_zE502ceSAWx_x8ZENS9jGkXQ_cfLHg6agEXWP=w526-h296',
  'https://play-lh.googleusercontent.com/poliL9oTevdAJAa4b1Nti4hLqc5iyEOrRDVki4a9tkMWZlFgTCe6akaeDsGg9iQ7-g=w526-h296',
  'https://play-lh.googleusercontent.com/e2a1AXlRbFx_njUpaWJJ1ieQV6ABCF5IZxoySrXi8Z69pzfZIR0IBqZ7sNqSh7JQ4YU=w526-h296'
];

test('fast G1R2 current + official benchmark side-by-side', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/index.html?game=1&round=2&e2e=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!document.querySelector('#g1r2-v14-overlay .g1v14-bg'),null,{timeout:20000});
  await page.waitForTimeout(1800);

  const current = await page.screenshot({fullPage:true});
  require('fs').mkdirSync('qa/reports/g1r2-fast',{recursive:true});
  require('fs').writeFileSync('qa/reports/g1r2-fast/G1R2-current.png',current);
  const currentData=`data:image/png;base64,${current.toString('base64')}`;
  const generated=await page.evaluate(()=>window.__ADUGAME_ART_SOURCE__?.G1R2?.generatedVisualAssets);
  expect(generated).toBe(0);

  await page.setViewportSize({width:1280,height:720});
  for(let i=0;i<BABY_PANDA_OFFICIAL.length;i++){
    const official=BABY_PANDA_OFFICIAL[i];
    const num=String(i+1).padStart(2,'0');
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;background:#111;font-family:Arial,sans-serif;color:#fff;overflow:hidden}
      .wrap{width:1280px;height:720px;display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#111}
      .side{position:relative;display:flex;align-items:center;justify-content:center;background:#222;overflow:hidden}
      .label{position:absolute;left:14px;top:12px;z-index:2;background:rgba(0,0,0,.72);padding:7px 10px;border-radius:6px;font-weight:700;font-size:15px}
      img{display:block;max-width:100%;max-height:100%;object-fit:contain}
    </style></head><body><div class="wrap">
      <div class="side"><div class="label">BABY PANDA OFFICIAL #${num}</div><img id="official" src="${official}"></div>
      <div class="side"><div class="label">ADUGAME CURRENT R2</div><img src="${currentData}"></div>
    </div></body></html>`,{waitUntil:'load'});
    const ok=await page.evaluate(()=>new Promise(resolve=>{
      const im=document.getElementById('official');
      if(im.complete) return resolve(im.naturalWidth>0);
      const t=setTimeout(()=>resolve(false),7000);
      im.onload=()=>{clearTimeout(t);resolve(true)};
      im.onerror=()=>{clearTimeout(t);resolve(false)};
    }));
    console.log(`BABY_PANDA_OFFICIAL_${num}`,ok);
    await page.screenshot({path:`qa/reports/g1r2-fast/COMPARE-${num}.png`});
  }
});
