// ADUGAME G1R2 v17.8 polish — preserve v17.6 mechanics, improve authored scene framing only.
// ZERO generated/drawn image assets. CSS crop/scale only over the existing authored Public Domain scene.
(() => {
  if (typeof G1R2 !== 'function') return;

  function pct(v,base){ return `${v/base*100}%`; }
  function place(e,x,y,w){
    e.style.left=pct(x,1280);e.style.top=pct(y,720);e.style.width=pct(w,1280);e.style.height='auto';
    e.style.transform='translate(-50%,-50%)';
  }

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v178Polish)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){ scene.time.delayedCall(100,()=>attach(scene)); return; }
    const people=root.querySelector('.g1v17-scene');
    if(!people){ scene.time.delayedCall(100,()=>attach(scene)); return; }
    scene.__g1v178Polish=true;
    root.dataset.version='17.8';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.8';
      window.__ADUGAME_ART_SOURCE__.G1R2.polish='step-specific authored-scene crop only';
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.8';

    const apply=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      if(st===2){
        // Lock the same face-wash target at 790,330 while zooming in enough to push the toothbrush/toothpaste action below the crop.
        people.style.clipPath='inset(0 0 22% 60%)';
        place(people,284,252,1250);
        people.style.filter='saturate(.96) brightness(1.035)';
      } else if(st===3){
        // Hidden by the dedicated authored raised-hand nail scene loaded after this patch.
        people.style.clipPath='inset(61% 67% 0 0)';
        place(people,1234,195,1456);
        people.style.filter='saturate(.98) brightness(1.02)';
      }
    };
    scene.events.on('postupdate',apply);apply();
    const cleanup=()=>{scene.__g1v178Polish=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    prior.call(this);
    this.time.delayedCall(820,()=>attach(this));
  };
})();
