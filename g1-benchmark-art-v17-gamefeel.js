// ADUGAME G1R2 v17.31 game-feel polish.
// CSS/DOM progress feedback over existing authored assets only. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1731GameFeel)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(80,()=>attach(scene));return;}
    scene.__g1v1731GameFeel=true;

    const style=document.createElement('style');
    style.textContent=`
      @keyframes g1gfPop{0%{transform:translate(-50%,-5px) scale(.90)}50%{transform:translate(-50%,0) scale(1.06)}100%{transform:translate(-50%,0) scale(1)}}
      #g1r2-v17-overlay .g1v17-gamefeel-rail{transition:opacity .16s ease,transform .16s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-seg{transition:background .18s ease,transform .18s ease,box-shadow .18s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-fill{transition:width .18s ease;}
      #g1r2-v17-overlay .g1v17-gamefeel-badge[data-on="1"]{animation:g1gfPop .24s ease-out both;}
      @media (max-height:480px){
        #g1r2-v17-overlay .g1v17-gamefeel-rail,#g1r2-v17-overlay .g1v17-gamefeel-badge{display:none!important;}
      }
      @media (prefers-reduced-motion:reduce){
        #g1r2-v17-overlay .g1v17-gamefeel-rail,#g1r2-v17-overlay .g1v17-gamefeel-seg,#g1r2-v17-overlay .g1v17-gamefeel-fill,#g1r2-v17-overlay .g1v17-gamefeel-badge{animation:none!important;transition:none!important;}
      }
    `;
    document.head.appendChild(style);

    const rail=document.createElement('div');
    rail.className='g1v17-gamefeel-rail';
    Object.assign(rail.style,{position:'absolute',right:'3.2%',top:'9.6%',zIndex:'21',pointerEvents:'none',minWidth:'164px',padding:'8px 10px',borderRadius:'15px',background:'rgba(255,255,255,.90)',border:'2px solid rgba(36,49,74,.10)',boxShadow:'0 7px 18px rgba(36,49,74,.12)',backdropFilter:'blur(5px)',opacity:'0',transform:'translateY(-3px)'});
    const label=document.createElement('div');
    Object.assign(label.style,{fontSize:'13px',fontWeight:'1000',lineHeight:'1',color:'#24465b',marginBottom:'7px',textAlign:'center',letterSpacing:'-.25px'});
    const track=document.createElement('div');
    Object.assign(track.style,{height:'10px',display:'flex',gap:'5px',alignItems:'stretch'});
    rail.append(label,track);root.appendChild(rail);

    const badge=document.createElement('div');
    badge.className='g1v17-gamefeel-badge';badge.dataset.on='0';badge.setAttribute('aria-live','polite');
    Object.assign(badge.style,{position:'absolute',left:'17%',top:'10.2%',transform:'translate(-50%,0)',zIndex:'91',pointerEvents:'none',padding:'8px 15px',borderRadius:'999px',background:'rgba(235,255,244,.98)',border:'2px solid rgba(41,171,126,.46)',boxShadow:'0 8px 20px rgba(28,105,76,.16)',fontSize:'14px',fontWeight:'1000',color:'#155f48',opacity:'0',visibility:'hidden',whiteSpace:'nowrap',willChange:'transform,opacity'});
    root.appendChild(badge);

    const MILESTONE_HOLD_MS=1250;
    const DONE_HOLD_MS=1800;
    let lastStep=Number(scene.step)||0,lastQ=(scene.mouthProgress||[]).filter(v=>v>=115).length,lastClip=scene.clipped?.size||0,lastFaceBucket=Math.floor(Math.min(100,(scene.faceWash||0)/360*100)/25),badgeToken=0,pulseCount=0,railSig='',pendingBrush=0;
    const reduced=()=>!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const pulse=(text,kind)=>{
      pulseCount+=1;root.dataset.gameFeelPulseCount=String(pulseCount);root.dataset.gameFeelLastPulse=kind;root.dataset.gameFeelLastText=text;
      const token=++badgeToken;badge.textContent=text;badge.dataset.on='0';badge.style.opacity='1';badge.style.visibility='visible';
      if(!reduced()){void badge.offsetWidth;badge.dataset.on='1';}
      else{badge.dataset.on='1';badge.style.transform='translate(-50%,0)';}
      setTimeout(()=>{if(!badge.isConnected||token!==badgeToken)return;badge.dataset.on='0';badge.style.opacity='0';badge.style.visibility='hidden';},kind==='done'?DONE_HOLD_MS:MILESTONE_HOLD_MS);
    };
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
    const renderRail=(st,q,face,clip)=>{
      const sig=st===1?`brush:${q}`:st===2?`wash:${face}`:st===3?`nails:${clip}`:'hidden';
      if(sig===railSig)return;railSig=sig;
      if(st===1){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='brush';label.textContent=`양치 ${q}/4`;segmented(4,q);root.dataset.gameFeelRail=`brush:${q}/4`;}
      else if(st===2){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='wash';label.textContent=`세수 ${face}%`;continuous(face);root.dataset.gameFeelRail=`wash:${face}`;}
      else if(st===3){rail.style.opacity='1';rail.style.transform='translateY(0)';rail.dataset.mode='nails';label.textContent=`손톱 ${clip}/5`;segmented(5,clip);root.dataset.gameFeelRail=`nails:${clip}/5`;}
      else{rail.style.opacity='0';rail.style.transform='translateY(-3px)';rail.dataset.mode='';root.dataset.gameFeelRail='hidden';}
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0,q=(scene.mouthProgress||[]).filter(v=>v>=115).length,clip=scene.clipped?.size||0,face=Math.max(0,Math.min(100,Math.round((scene.faceWash||0)/360*100))),faceBucket=Math.floor(face/25);
      const dbg=scene.debugState?.()||{},active=dbg.g1r2V17Input?.active||null;
      renderRail(st,q,face,clip);
      if((st===1||st===2)&&q>lastQ)pendingBrush=q;
      if(pendingBrush&&active!=='brush'){
        const completed=pendingBrush;pendingBrush=0;
        pulse(completed>=4?'양치 완료 ✓':`양치 ${completed}/4 ✓`,`brush:${completed}`);
      }
      if(st===2&&faceBucket>lastFaceBucket&&faceBucket>0&&faceBucket<4)pulse(`세수 ${Math.min(75,faceBucket*25)}% ✓`,`wash:${faceBucket*25}`);
      if(st===3&&clip>lastClip)pulse(`손톱 ${clip}/5 ✓`,`nail:${clip}`);
      if(st>=4&&lastStep<4)pulse('모두 완료 ✓','done');
      lastStep=st;lastQ=q;lastClip=clip;lastFaceBucket=faceBucket;

      root.dataset.gameFeelReady='1';root.dataset.version='17.31';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.31';
        window.__ADUGAME_ART_SOURCE__.G1R2.dynamicGameFeel={stableVisualProgress:true,milestoneSuccessBadge:true,brushFeedbackOnRelease:true,stableBadgeOpacity:true,badgeLocation:'upper-left-clear-zone',mobileCompact:true,reducedMotionAware:true,progressDomUpdatesOnChangeOnly:true,milestoneHoldMs:MILESTONE_HOLD_MS,doneHoldMs:DONE_HOLD_MS,generatedVisualAssets:0};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.31';
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{badgeToken++;style.remove();rail.remove();badge.remove();scene.__g1v1731GameFeel=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1940,()=>attach(this));};
})();
