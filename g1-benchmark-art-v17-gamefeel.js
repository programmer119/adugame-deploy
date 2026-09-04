// ADUGAME G1R2 v17.32 game-feel polish.
// Reliable DOM/CSS progress feedback over existing authored assets only.
// No generated/drawn illustration assets. Browser-timer fallback prevents late Phaser-clock stalls
// from leaving the visibly loaded v17.29 composition without its final v17.32 game-feel layer.
(() => {
  if(typeof G1R2!=='function')return;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1732GameFeel)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){
      window.setTimeout(()=>{if(scene.sys?.isActive?.()&&scene.scene?.key==='G1R2')attach(scene);},100);
      return;
    }
    scene.__g1v1732GameFeel=true;

    const style=document.createElement('style');
    style.textContent=`
      @keyframes g1gfRailPulse{0%{transform:translateY(0) scale(1)}45%{transform:translateY(0) scale(1.045)}100%{transform:translateY(0) scale(1)}}
      #g1r2-v17-overlay .g1v17-gamefeel-rail{transition:opacity .16s ease,transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-seg{transition:background .18s ease,transform .18s ease,box-shadow .18s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-fill{transition:width .18s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-motion-veil{transition:opacity .28s ease-out;}
      @media (max-height:480px){#g1r2-v17-overlay .g1v17-gamefeel-rail{display:none!important;}}
      @media (prefers-reduced-motion:reduce){
        #g1r2-v17-overlay .g1v17-gamefeel-rail,#g1r2-v17-overlay .g1v17-gamefeel-seg,#g1r2-v17-overlay .g1v17-gamefeel-fill,#g1r2-v17-overlay .g1v17-gamefeel-motion-veil{animation:none!important;transition:none!important;}
      }
    `;
    document.head.appendChild(style);

    let rail=root.querySelector('.g1v17-gamefeel-rail');
    let label,track,createdRail=false;
    if(!rail){
      createdRail=true;
      rail=document.createElement('div');rail.className='g1v17-gamefeel-rail';rail.dataset.pulse='0';
      Object.assign(rail.style,{position:'absolute',right:'3.2%',top:'9.6%',zIndex:'21',pointerEvents:'none',minWidth:'164px',padding:'8px 10px',borderRadius:'15px',background:'rgba(255,255,255,.90)',border:'2px solid rgba(36,49,74,.10)',boxShadow:'0 7px 18px rgba(36,49,74,.12)',backdropFilter:'blur(5px)',opacity:'0',transform:'translateY(-3px)'});
      label=document.createElement('div');label.className='g1v17-gamefeel-label';
      Object.assign(label.style,{fontSize:'13px',fontWeight:'1000',lineHeight:'1',color:'#24465b',marginBottom:'7px',textAlign:'center',letterSpacing:'-.25px'});
      track=document.createElement('div');track.className='g1v17-gamefeel-track';
      Object.assign(track.style,{height:'10px',display:'flex',gap:'5px',alignItems:'stretch'});
      rail.append(label,track);root.appendChild(rail);
    }else{
      label=rail.querySelector('.g1v17-gamefeel-label')||rail.firstElementChild;
      track=rail.querySelector('.g1v17-gamefeel-track')||rail.lastElementChild;
    }

    let veil=null,createdVeil=false;
    if(root.dataset.motionReady!=='1'){
      createdVeil=true;
      veil=document.createElement('div');veil.className='g1v17-gamefeel-motion-veil';
      Object.assign(veil.style,{position:'absolute',left:'0',right:'0',top:'6.2%',bottom:'0',zIndex:'16',pointerEvents:'none',background:'linear-gradient(180deg,rgba(245,255,255,.72),rgba(255,255,255,.34))',opacity:'0'});
      root.appendChild(veil);
    }

    const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const segmented=(count,done)=>{
      if(!track)return;track.replaceChildren();
      for(let i=0;i<count;i++){
        const s=document.createElement('span');s.className='g1v17-gamefeel-seg';s.dataset.done=i<done?'1':'0';
        Object.assign(s.style,{height:'10px',flex:'1',minWidth:'24px',borderRadius:'999px',background:i<done?'rgba(41,171,126,.92)':'rgba(36,125,164,.15)',boxShadow:i<done?'0 0 0 3px rgba(41,171,126,.10)':'none',transform:i===done-1?'scaleY(1.12)':'none'});track.appendChild(s);
      }
    };
    const continuous=value=>{
      if(!track)return;track.replaceChildren();
      const outer=document.createElement('div');Object.assign(outer.style,{position:'relative',width:'100%',height:'10px',borderRadius:'999px',overflow:'hidden',background:'rgba(36,125,164,.15)'});
      const fill=document.createElement('div');fill.className='g1v17-gamefeel-fill';fill.dataset.value=String(value);Object.assign(fill.style,{height:'100%',width:`${value}%`,borderRadius:'999px',background:'rgba(41,171,126,.92)'});outer.appendChild(fill);track.appendChild(outer);
    };

    let lastStep=Number(scene.step)||0,lastSig='',pulseToken=0,pulseCount=0;
    const pulse=(text,kind)=>{
      pulseCount++;root.dataset.gameFeelPulseCount=String(pulseCount);root.dataset.gameFeelLastPulse=kind;root.dataset.gameFeelLastText=text;
      if(!rail||!label)return;const token=++pulseToken;rail.dataset.pulse='1';rail.style.opacity='1';rail.style.transform='translateY(0)';rail.style.background='rgba(235,255,244,.98)';rail.style.borderColor='rgba(41,171,126,.42)';label.style.color='#155f48';label.textContent=text;
      if(!reduced()){rail.style.animation='none';void rail.offsetWidth;rail.style.animation='g1gfRailPulse .32s ease-out both';}
      window.setTimeout(()=>{if(!rail?.isConnected||token!==pulseToken)return;rail.dataset.pulse='0';rail.style.animation='none';rail.style.background='rgba(255,255,255,.90)';rail.style.borderColor='rgba(36,49,74,.10)';label.style.color='#24465b';lastSig='';},620);
    };
    const stepTransition=st=>{
      if(!veil||reduced())return;
      veil.style.opacity='.30';requestAnimationFrame(()=>requestAnimationFrame(()=>{if(veil?.isConnected)veil.style.opacity='0';}));
      root.dataset.motionTransition='active';window.setTimeout(()=>{if(root.isConnected)root.dataset.motionTransition='idle';},700);
      root.dataset.motionLastStep=String(st);
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0,q=(scene.mouthProgress||[]).filter(v=>v>=115).length,clip=scene.clipped?.size||0,face=Math.max(0,Math.min(100,Math.round((scene.faceWash||0)/360*100)));
      const sig=st===1?`brush:${q}`:st===2?`wash:${face}`:st===3?`nails:${clip}`:st>=4?'done':'hidden';
      if(sig!==lastSig&&rail&&label){
        lastSig=sig;rail.style.background='rgba(255,255,255,.90)';rail.style.borderColor='rgba(36,49,74,.10)';label.style.color='#24465b';
        if(st===1){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='brush';label.textContent=`양치 ${q}/4`;segmented(4,q);root.dataset.gameFeelRail=`brush:${q}/4`;}
        else if(st===2){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='wash';label.textContent=`세수 ${face}%`;continuous(face);root.dataset.gameFeelRail=`wash:${face}`;}
        else if(st===3){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='nails';label.textContent=`손톱 ${clip}/5`;segmented(5,clip);root.dataset.gameFeelRail=`nails:${clip}/5`;}
        else if(st>=4){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='done';label.textContent='모두 완료 ✓';segmented(4,4);root.dataset.gameFeelRail='done';}
        else{rail.style.opacity='0';rail.style.transform='translateY(-3px)';rail.dataset.mode='';root.dataset.gameFeelRail='hidden';}
      }
      if(st!==lastStep){stepTransition(st);pulse(st===1?'치약 완료 ✓':st===2?'양치 완료 ✓':st===3?'세수 완료 ✓':st>=4?'모두 완료 ✓':'좋아요!','step:'+st);lastStep=st;}

      // Only advertise readiness after the visible final layer has actually been mounted.
      root.dataset.gameFeelReady='1';
      if(root.dataset.motionReady!=='1'){root.dataset.motionReady='1';root.dataset.motionFallback='1';}
      root.dataset.version='17.32';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.32';
        window.__ADUGAME_ART_SOURCE__.G1R2.dynamicGameFeel={stableVisualProgress:true,milestoneRailPulse:true,noFloatingBadge:true,donePersistent:true,mobileCompact:true,reducedMotionAware:true,browserTimerAttachFallback:true,motionFallback:createdVeil,generatedVisualAssets:0};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.32';
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{pulseToken++;style.remove();if(createdRail)rail.remove();if(createdVeil)veil?.remove();scene.__g1v1732GameFeel=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    prior.call(this);
    const scene=this,kick=()=>{if(scene.sys?.isActive?.()&&scene.scene?.key==='G1R2')attach(scene);};
    this.time?.delayedCall?.(1940,kick);
    // Headless Chromium can occasionally stop the Phaser scene clock between the v17.29 and
    // v17.32 late passes. This independent browser timer keeps the final visible layer reliable.
    window.setTimeout(kick,2100);
  };
})();