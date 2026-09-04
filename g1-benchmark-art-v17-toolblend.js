// ADUGAME G1R2 v17.15 tool integration polish.
// No generated/drawn image assets. Reuses authored scene props as the visible tools; mechanics stay Phaser-side.
(() => {
  if (typeof G1R2 !== 'function') return;
  const PASTE_HOME={x:980,y:490};      // authored toothpaste tube in right child's hand
  const BRUSH_PASTE_TARGET={x:780,y:590}; // authored pink toothbrush in step 0
  const BRUSH_HOME={x:1000,y:450};     // authored green toothbrush handle in step 1
  const CLOTH_HOME={x:640,y:260};      // authored sponge in helper's hand
  const pct=(v,b)=>`${v/b*100}%`;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1715ToolBlend)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    scene.__g1v1715ToolBlend=true;
    const pasteImg=root.querySelector('.g1v17-paste');
    const brushImg=root.querySelector('.g1v17-brush');
    const clothImg=root.querySelector('.g1v17-cloth');

    const wash=document.createElement('div');
    wash.className='g1v17-wash-feedback';
    Object.assign(wash.style,{position:'absolute',pointerEvents:'none',zIndex:'8',width:pct(86,1280),height:pct(70,720),transform:'translate(-50%,-50%)',borderRadius:'50%',border:'3px solid rgba(81,190,211,.58)',background:'radial-gradient(circle at 40% 35%,rgba(255,255,255,.72) 0 18%,rgba(178,235,244,.34) 45%,rgba(178,235,244,.06) 72%)',boxShadow:'0 0 0 8px rgba(123,223,242,.12),0 8px 18px rgba(52,180,205,.14)',opacity:'0',transition:'opacity .08s ease'});
    root.appendChild(wash);

    const setHome=(o,p)=>{if(!o)return;o.setPosition(p.x,p.y);o.home={x:p.x,y:p.y};};
    const finalHitAlignmentReady=()=>root.dataset.toolHitAlignmentReady==='1';
    // Legacy authored-prop coordinates are only an early fallback. Once the final v17.29+
    // hit alignment is mounted, never overwrite its live mechanic coordinates even if this
    // older layer attaches late after a stalled Phaser Clock.
    if(!finalHitAlignmentReady()){
      setHome(scene.paste,PASTE_HOME);setHome(scene.brush,BRUSH_PASTE_TARGET);setHome(scene.cloth,CLOTH_HOME);
    }

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      // Hide mismatched standalone art; the authored full scene supplies the visible props.
      if(pasteImg)pasteImg.style.display='none';
      if(brushImg)brushImg.style.display='none';
      if(clothImg)clothImg.style.display='none';

      // Final v17.29+ coordinates own the mechanic as soon as they report ready.
      if(!finalHitAlignmentReady()){
        if(st===0){
          if(scene.paste&&scene.paste.home?.x!==PASTE_HOME.x)setHome(scene.paste,PASTE_HOME);
          if(scene.brush&&scene.brush.home?.x!==BRUSH_PASTE_TARGET.x)setHome(scene.brush,BRUSH_PASTE_TARGET);
        }else if(st===1){
          if(scene.brush&&scene.brush.home?.x!==BRUSH_HOME.x)setHome(scene.brush,BRUSH_HOME);
        }else if(st===2){
          if(scene.cloth&&scene.cloth.home?.x!==CLOTH_HOME.x)setHome(scene.cloth,CLOTH_HOME);
        }
      }

      const washing=st===2&&scene.lastCloth!=null;
      if(washing&&scene.cloth){wash.style.left=pct(scene.cloth.x,1280);wash.style.top=pct(scene.cloth.y,720);wash.style.opacity='1';}
      else wash.style.opacity='0';
    };
    scene.events.on('postupdate',sync);sync();

    if(!finalHitAlignmentReady())root.dataset.version='17.15';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      if(!finalHitAlignmentReady())window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.15';
      window.__ADUGAME_ART_SOURCE__.G1R2.toolIntegration={paste:'authored scene tube',brush:'authored scene toothbrush',facewash:'authored scene sponge + CSS wash feedback',respectsFinalHitAlignment:true};
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    if(window.__ADUGAME_G1_BENCHMARK_ART_V17__&&!finalHitAlignmentReady())window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.15';
    const cleanup=()=>{wash.remove();scene.__g1v1715ToolBlend=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1120,()=>attach(this));};
})();
