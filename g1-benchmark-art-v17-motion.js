// ADUGAME G1R2 v17.30 motion/target-feedback polish.
// CSS/DOM interaction feedback only over existing authored assets. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const PASTE_TARGET={x:1015,y:645};
  const BRUSH_CENTER={x:820,y:515};
  const FACE_CENTER={x:790,y:345};
  const NAILS=[[825,223],[845,194],[863,181],[884,188],[903,207]];
  const dist2=(a,b)=>{const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy;};

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1730Motion)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(80,()=>attach(scene));return;}
    scene.__g1v1730Motion=true;
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const dropTarget=root.querySelector('.g1v17-paste-drop-target');
    const brushZones=[...root.querySelectorAll('.g1v17-ux-brush-zone')];
    const nailTargets=[...root.querySelectorAll('.g1v17-ux-nail-target')];
    const baseDropShadow=dropTarget?.style.boxShadow||'';
    const baseFocusShadow=focus?.style.boxShadow||'';
    const baseFocusBorder=focus?.style.borderColor||'';

    const style=document.createElement('style');
    style.textContent=`
      #g1r2-v17-overlay .g1v17-motion-veil{transition:opacity .28s ease-out;}
      @media (max-width:900px) and (max-height:500px){
        #g1r2-v17-overlay .g1v17-ux-status{font-size:13px!important;line-height:1.16!important;padding:6px 12px!important;min-width:0!important;max-width:70%!important;border-radius:15px!important;}
        #g1r2-v17-overlay .g1v17-ux-progress{font-size:12px!important;line-height:1.1!important;padding:5px 9px!important;min-width:0!important;max-width:54%!important;}
        #g1r2-v17-overlay .g1v17-final-alert{font-size:12px!important;padding:6px 10px!important;max-width:72%!important;white-space:normal!important;text-align:center!important;}
      }
      @media (prefers-reduced-motion: reduce){
        #g1r2-v17-overlay *,#g1r2-v17-overlay *::before,#g1r2-v17-overlay *::after{
          animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;
        }
      }
    `;
    document.head.appendChild(style);

    const veil=document.createElement('div');
    veil.className='g1v17-motion-veil';
    Object.assign(veil.style,{position:'absolute',left:'0',right:'0',top:'6.2%',bottom:'0',zIndex:'16',pointerEvents:'none',background:'linear-gradient(180deg,rgba(245,255,255,.72),rgba(255,255,255,.34))',opacity:'0'});
    root.appendChild(veil);

    let lastStep=Number(scene.step)||0;
    let transitionCount=0;
    let transitionToken=0;
    let lastNear='';
    const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const setNear=value=>{if(value===lastNear)return;lastNear=value;root.dataset.motionNearTarget=value;};
    const transition=()=>{
      transitionCount+=1;root.dataset.motionTransitionCount=String(transitionCount);
      const token=++transitionToken;
      if(reduced()){
        veil.style.opacity='0';root.dataset.motionTransition='reduced';
        setTimeout(()=>{if(root.isConnected&&token===transitionToken)root.dataset.motionTransition='idle';},700);
        return;
      }
      root.dataset.motionTransition='active';veil.style.opacity='.30';
      requestAnimationFrame(()=>requestAnimationFrame(()=>{if(root.isConnected&&token===transitionToken)veil.style.opacity='0';}));
      setTimeout(()=>{if(root.isConnected&&token===transitionToken)root.dataset.motionTransition='idle';},700);
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      const dbg=scene.debugState?.()||{},input=dbg.g1r2V17Input||{},active=input.active||null;
      const isReduced=reduced();root.dataset.motionReduced=isReduced?'1':'0';
      if(st!==lastStep){lastStep=st;transition();}

      let near='';
      if(st===0&&active==='paste'&&scene.paste&&dist2(scene.paste,PASTE_TARGET)<=110*110){
        near='paste';
        if(dropTarget){dropTarget.style.opacity='.98';dropTarget.style.borderColor='rgba(41,171,126,.92)';dropTarget.style.background='rgba(214,253,232,.72)';dropTarget.style.boxShadow='0 0 0 10px rgba(41,171,126,.14),0 8px 20px rgba(31,110,79,.14)';}
      } else if(st===1&&active==='brush'&&scene.brush){
        const dx=scene.brush.x-BRUSH_CENTER.x,dy=scene.brush.y-BRUSH_CENTER.y;
        if(Math.abs(dx)<=125&&Math.abs(dy)<=82){
          const q=(dy>=0?2:0)+(dx>=0?1:0);near=`brush:${q}`;
          brushZones.forEach((d,i)=>{d.style.boxShadow=i===q?'0 0 0 8px rgba(41,171,126,.20),0 7px 14px rgba(22,96,68,.12)':'0 0 0 4px rgba(123,223,242,.09)';});
        }
      } else if(st===2&&active==='cloth'&&scene.cloth&&Math.abs(scene.cloth.x-FACE_CENTER.x)<=125&&Math.abs(scene.cloth.y-FACE_CENTER.y)<=90){
        near='face';
        if(focus){focus.style.boxShadow='0 0 0 12px rgba(41,171,126,.16),0 0 28px rgba(87,210,169,.22)';focus.style.borderColor='rgba(41,171,126,.84)';}
      } else if(st===3&&active==='clipper'&&scene.clipper){
        let best=-1,bestD=Infinity;
        NAILS.forEach((p,i)=>{if(scene.clipped?.has(i))return;const d=dist2(scene.clipper,{x:p[0],y:p[1]});if(d<bestD){bestD=d;best=i;}});
        if(best>=0&&bestD<=50*50){near=`nail:${best}`;nailTargets.forEach((d,i)=>{d.style.boxShadow=i===best?'0 0 0 8px rgba(41,171,126,.22),0 6px 13px rgba(22,96,68,.13)':'0 0 0 5px rgba(123,223,242,.10)';});}
      }
      if(!near){
        if(st===0&&dropTarget)dropTarget.style.boxShadow=baseDropShadow;
        if(st===1)brushZones.forEach(d=>{d.style.boxShadow='0 0 0 4px rgba(123,223,242,.09)';});
        if(st===3)nailTargets.forEach(d=>{d.style.boxShadow='0 0 0 5px rgba(123,223,242,.10)';});
        if(focus){focus.style.boxShadow=baseFocusShadow;focus.style.borderColor=baseFocusBorder;}
      }
      setNear(near);
      if(isReduced&&focus)focus.style.animation='none';

      root.dataset.motionReady='1';root.dataset.version='17.30';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.30';
        window.__ADUGAME_ART_SOURCE__.G1R2.dynamicMotion={stepTransition:true,targetProximityFeedback:true,reducedMotionAware:true,generatedVisualAssets:0};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.30';
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{transitionToken++;style.remove();veil.remove();scene.__g1v1730Motion=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1740,()=>attach(this));};
})();
