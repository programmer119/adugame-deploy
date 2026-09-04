// ADUGAME G1R2 v17.32 game-feel polish.
// CSS/DOM progress feedback over existing authored assets only. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1732GameFeel)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root||root.dataset.motionReady!=='1'){window.setTimeout(()=>attach(scene),80);return;}
    scene.__g1v1732GameFeel=true;

    const style=document.createElement('style');
    style.textContent=`
      @keyframes g1gfRailPulse{0%{transform:translateY(0) scale(1)}45%{transform:translateY(0) scale(1.045)}100%{transform:translateY(0) scale(1)}}
      #g1r2-v17-overlay .g1v17-gamefeel-rail{transition:opacity .16s ease,transform .16s ease,background .16s ease,border-color .16s ease,box-shadow .16s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-seg{transition:background .18s ease,transform .18s ease,box-shadow .18s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-fill{transition:width .18s ease;}
      @media (max-height:480px){#g1r2-v17-overlay .g1v17-gamefeel-rail{display:none!important;}}
      @media (prefers-reduced-motion:reduce){
        #g1r2-v17-overlay .g1v17-gamefeel-rail,#g1r2-v17-overlay .g1v17-gamefeel-seg,#g1r2-v17-overlay .g1v17-gamefeel-fill{animation:none!important;transition:none!important;}
      }
    `;
    document.head.appendChild(style);

    const rail=document.createElement('div');
    rail.className='g1v17-gamefeel-rail';rail.dataset.pulse='0';
    Object.assign(rail.style,{position:'absolute',right:'3.2%',top:'9.6%',zIndex:'21',pointerEvents:'none',minWidth:'164px',padding:'8px 10px',borderRadius:'15px',background:'rgba(255,255,255,.90)',border:'2px solid rgba(36,49,74,.10)',boxShadow:'0 7px 18px rgba(36,49,74,.12)',backdropFilter:'blur(5px)',opacity:'0',transform:'translateY(-3px)'});
    const label=document.createElement('div');
    Object.assign(label.style,{fontSize:'13px',fontWeight:'1000',lineHeight:'1',color:'#24465b',marginBottom:'7px',textAlign:'center',letterSpacing:'-.25px'});
    const track=document.createElement('div');
    Object.assign(track.style,{height:'10px',display:'flex',gap:'5px',alignItems:'stretch'});
    rail.append(label,track);root.appendChild(rail);

    const PULSE_MS=620;
    let lastStep=Number(scene.step)||0,lastQ=(scene.mouthProgress||[]).filter(v=>v>=115).length,lastClip=scene.clipped?.size||0,lastFaceBucket=Math.floor(Math.min(100,(scene.faceWash||0)/360*100)/25),pulseToken=0,pulseCount=0,railSig='',railBaseText='',pendingBrush=0,pendingClip=0;
    const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const segmented=(count,done)=>{
      track.replaceChildren();
      for(let i=0;i<count;i++){
        const s=document.createElement('span');s.className='g1v17-gamefeel-seg';s.dataset.done=i<done?'1':'0';
        Object.assign(s.style,{height:'10px',flex:'1',minWidth:'24px',borderRadius:'999px',background:i<done?'rgba(41,171,126,.92)':'rgba(36,125,164,.15)',boxShadow:i<done?'0 0 0 3px rgba(41,171,126,.10)':'none',transform:i===done-1?'scaleY(1.12)':'none'});track.appendChild(s);
      }
    };
    const continuous=(value)=>{
      track.replaceChildren();
      const outer=document.createElement('div');Object.assign(outer.style,{position:'relative',width:'100%',height:'10px',borderRadius:'999px',overflow:'hidden',background:'rgba(36,125,164,.15)'});
      const fill=document.createElement('div');fill.className='g1v17-gamefeel-fill';fill.dataset.value=String(value);Object.assign(fill.style,{height:'100%',width:`${value}%`,borderRadius:'999px',background:'rgba(41,171,126,.92)',boxShadow:'0 0 0 3px rgba(41,171,126,.08)'});outer.appendChild(fill);track.appendChild(outer);
    };
    const baseRailStyle=()=>{
      rail.dataset.pulse='0';rail.style.animation='none';rail.style.background='rgba(255,255,255,.90)';rail.style.borderColor='rgba(36,49,74,.10)';rail.style.boxShadow='0 7px 18px rgba(36,49,74,.12)';label.style.color='#24465b';
    };
    const renderRail=(st,q,face,clip)=>{
      const sig=st===1?`brush:${q}`:st===2?`wash:${face}`:st===3?`nails:${clip}`:st>=4?'done':'hidden';
      if(sig===railSig)return;railSig=sig;
      if(st===1){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='brush';railBaseText=`양치 ${q}/4`;label.textContent=railBaseText;segmented(4,q);root.dataset.gameFeelRail=`brush:${q}/4`;}
      else if(st===2){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='wash';railBaseText=`세수 ${face}%`;label.textContent=railBaseText;continuous(face);root.dataset.gameFeelRail=`wash:${face}`;}
      else if(st===3){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='nails';railBaseText=`손톱 ${clip}/5`;label.textContent=railBaseText;segmented(5,clip);root.dataset.gameFeelRail=`nails:${clip}/5`;}
      else if(st>=4){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='done';railBaseText='모두 완료 ✓';label.textContent=railBaseText;segmented(4,4);root.dataset.gameFeelRail='done';}
      else{rail.style.opacity='0';rail.style.transform='translateY(-3px)';rail.dataset.mode='';railBaseText='';root.dataset.gameFeelRail='hidden';}
    };
    const pulse=(text,kind)=>{
      pulseCount+=1;root.dataset.gameFeelPulseCount=String(pulseCount);root.dataset.gameFeelLastPulse=kind;root.dataset.gameFeelLastText=text;
      const token=++pulseToken;rail.dataset.pulse='1';rail.style.opacity='1';rail.style.transform='translateY(0)';rail.style.background='rgba(235,255,244,.98)';rail.style.borderColor='rgba(41,171,126,.42)';rail.style.boxShadow='0 8px 22px rgba(28,105,76,.18)';label.style.color='#155f48';label.textContent=text;
      if(kind==='done'){rail.dataset.mode='done';root.dataset.gameFeelRail='done';segmented(4,4);return;}
      if(!reduced()){rail.style.animation='none';void rail.offsetWidth;rail.style.animation='g1gfRailPulse .32s ease-out both';}
      setTimeout(()=>{if(!rail.isConnected||token!==pulseToken)return;baseRailStyle();label.textContent=railBaseText;},PULSE_MS);
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0,q=(scene.mouthProgress||[]).filter(v=>v>=115).length,clip=scene.clipped?.size||0,face=Math.max(0,Math.min(100,Math.round((scene.faceWash||0)/360*100))),faceBucket=Math.floor(face/25);
      const dbg=scene.debugState?.()||{},active=dbg.g1r2V17Input?.active||null;
      renderRail(st,q,face,clip);
      if((st===1||st===2)&&q>lastQ)pendingBrush=q;
      if(pendingBrush&&active!=='brush'){
        const completed=pendingBrush;pendingBrush=0;pulse(completed>=4?'양치 완료 ✓':`양치 ${completed}/4 ✓`,`brush:${completed}`);
      }
      if(st===2&&faceBucket>lastFaceBucket&&faceBucket>0&&faceBucket<4)pulse(`세수 ${Math.min(75,faceBucket*25)}% ✓`,`wash:${faceBucket*25}`);
      if(st===3&&clip>lastClip)pendingClip=clip;
      if(pendingClip&&active!=='clipper'){
        const completed=pendingClip;pendingClip=0;pulse(completed>=5?'손톱 완료 ✓':`손톱 ${completed}/5 ✓`,`nail:${completed}`);
      }
      if(st>=4&&lastStep<4)pulse('모두 완료 ✓','done');
      lastStep=st;lastQ=q;lastClip=clip;lastFaceBucket=faceBucket;

      root.dataset.gameFeelReady='1';root.dataset.version='17.32';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.32';
        window.__ADUGAME_ART_SOURCE__.G1R2.dynamicGameFeel={stableVisualProgress:true,milestoneRailPulse:true,noFloatingBadge:true,brushFeedbackOnRelease:true,nailFeedbackOnRelease:true,donePersistent:true,mobileCompact:true,reducedMotionAware:true,progressDomUpdatesOnChangeOnly:true,pulseMs:PULSE_MS,generatedVisualAssets:0};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.32';
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{pulseToken++;style.remove();rail.remove();scene.__g1v1732GameFeel=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1940,()=>attach(this));};
  const bootstrap=()=>{
    const scene=window.__ADUGAME_SCENE__?.();
    if(scene?.scene?.key==='G1R2'){attach(scene);return;}
    window.setTimeout(bootstrap,120);
  };
  window.setTimeout(bootstrap,0);
})();
