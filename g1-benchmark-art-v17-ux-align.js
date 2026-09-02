// ADUGAME G1R2 v17.25 dynamic UX alignment guard.
// Mechanic-coordinate correction only; no generated/drawn visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const MOUTH={x:820,y:515};
  const ZONES=[[775,490],[865,490],[775,540],[865,540]];
  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1725Align)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(80,()=>attach(scene));return;}
    scene.__g1v1725Align=true;
    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      if(Number(scene.step)<=1){
        if(scene.mouth?.active&&(scene.mouth.x!==MOUTH.x||scene.mouth.y!==MOUTH.y))scene.mouth.setPosition(MOUTH.x,MOUTH.y);
        (scene.stains||[]).forEach((s,i)=>{const p=ZONES[i];if(s?.active&&p&&(s.x!==p[0]||s.y!==p[1]))s.setPosition(p[0],p[1]);});
      }
    };
    scene.events.on('postupdate',sync);sync();
    root.dataset.uxAlignmentReady='1';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      window.__ADUGAME_ART_SOURCE__.G1R2.dynamicUxAlignment={mouth:{...MOUTH},quadrants:ZONES.map(p=>[...p]),legacyV14OverrideGuard:true,generatedVisualAssets:0};
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    const cleanup=()=>{scene.__g1v1725Align=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1460,()=>attach(this));};
})();
