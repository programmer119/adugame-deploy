// ADUGAME G1R2 v17.24 dynamic UX pass.
// UI/feedback only over existing human-authored Public Domain assets. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const NAIL_POS=[[825,223],[845,194],[863,181],[884,188],[903,207]];
  const BRUSH_ZONE_POS=[[755,338],[840,338],[755,398],[840,398]];
  const pct=(v,b)=>`${v/b*100}%`;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1724Ux)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    scene.__g1v1724Ux=true;

    const paste=root.querySelector('.g1v17-paste');
    const brush=root.querySelector('.g1v17-brush');
    const cloth=root.querySelector('.g1v17-cloth');
    const clipper=root.querySelector('.g1v17-clipper');
    const face=root.querySelector('.g1v17-facewash-scene');
    const nail=root.querySelector('.g1v17-nailraise-scene');
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const direct=[...root.children].filter(e=>e.tagName==='DIV');
    const progress=direct.find(e=>e.style.left==='50%'&&e.style.bottom==='7.4%');
    const status=direct.find(e=>e.style.left==='50%'&&e.style.bottom==='1%');
    if(progress)progress.classList.add('g1v17-ux-progress');
    if(status)status.classList.add('g1v17-ux-status');

    const style=document.createElement('style');
    style.textContent=`
      @keyframes g1uxPulse{0%,100%{box-shadow:0 0 0 8px rgba(123,223,242,.12)}50%{box-shadow:0 0 0 16px rgba(123,223,242,.23)}}
      @keyframes g1uxPop{0%{transform:translate(-50%,10px) scale(.88);opacity:0}34%{transform:translate(-50%,0) scale(1.05);opacity:1}100%{transform:translate(-50%,0) scale(1);opacity:1}}
      @keyframes g1uxDone{0%{transform:translate(-50%,-50%) scale(.82)}55%{transform:translate(-50%,-50%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(1)}}
    `;
    document.head.appendChild(style);

    const feedback=document.createElement('div');
    feedback.className='g1v17-ux-feedback';
    Object.assign(feedback.style,{position:'absolute',left:'50%',top:'11.2%',transform:'translateX(-50%)',zIndex:'20',pointerEvents:'none',padding:'8px 15px',borderRadius:'999px',fontSize:'15px',fontWeight:'900',letterSpacing:'-.3px',color:'#16384a',background:'rgba(255,255,255,.96)',border:'2px solid rgba(52,180,205,.28)',boxShadow:'0 7px 18px rgba(28,66,86,.16)',opacity:'0',transition:'opacity .15s ease',whiteSpace:'nowrap'});
    root.appendChild(feedback);

    const brushZones=BRUSH_ZONE_POS.map((p,i)=>{
      const d=document.createElement('div');d.className='g1v17-ux-brush-zone';d.dataset.index=String(i);d.dataset.done='0';
      Object.assign(d.style,{position:'absolute',left:pct(p[0],1280),top:pct(p[1],720),width:'40px',height:'32px',transform:'translate(-50%,-50%)',zIndex:'12',pointerEvents:'none',borderRadius:'11px',border:'2px solid rgba(36,125,164,.52)',background:'rgba(235,250,255,.24)',boxShadow:'0 0 0 4px rgba(123,223,242,.08)',opacity:'0',transition:'opacity .15s ease,background .16s ease,border-color .16s ease,transform .16s ease',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'1000',fontSize:'16px',color:'#155f48'});
      root.appendChild(d);return d;
    });
    const nailTargets=NAIL_POS.map((p,i)=>{
      const d=document.createElement('div');d.className='g1v17-ux-nail-target';d.dataset.index=String(i);d.dataset.done='0';
      Object.assign(d.style,{position:'absolute',left:pct(p[0],1280),top:pct(p[1],720),width:'30px',height:'30px',transform:'translate(-50%,-50%)',zIndex:'13',pointerEvents:'none',borderRadius:'50%',border:'2px solid rgba(36,125,164,.58)',background:'rgba(255,255,255,.38)',boxShadow:'0 0 0 5px rgba(123,223,242,.10)',opacity:'0',transition:'opacity .15s ease,background .16s ease,border-color .16s ease,transform .16s ease',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'1000',fontSize:'16px',color:'#12654b'});
      root.appendChild(d);return d;
    });

    if(progress)Object.assign(progress.style,{bottom:'8.8%',fontSize:'15px',lineHeight:'1.15',padding:'7px 12px',background:'rgba(255,255,255,.96)',color:'#24465b',border:'2px solid rgba(36,49,74,.10)',boxShadow:'0 4px 13px rgba(36,49,74,.12)',backdropFilter:'blur(5px)',zIndex:'18'});
    if(status)Object.assign(status.style,{bottom:'1.3%',minWidth:'360px',maxWidth:'72%',fontSize:'16px',lineHeight:'1.28',padding:'9px 19px',background:'rgba(22,38,57,.91)',color:'#fff',boxShadow:'0 7px 18px rgba(22,38,57,.19)',backdropFilter:'blur(5px)',zIndex:'19'});
    if(focus){focus.style.animation='g1uxPulse 1.25s ease-in-out infinite';focus.style.zIndex='11';}

    let feedbackUntil=0,lastStep=Number(scene.step)||0,lastQ=0,lastClip=0,lastFaceBucket=0;
    let prevCount={pasteUp:0,brushUp:0,clothUp:0,clipperUp:0};
    const announce=(text,tone='ok',ms=1100)=>{
      feedback.textContent=text;feedback.dataset.tone=tone;
      feedback.style.color=tone==='hint'?'#734b12':'#155f48';
      feedback.style.borderColor=tone==='hint'?'rgba(227,166,61,.42)':'rgba(41,171,126,.34)';
      feedback.style.background=tone==='hint'?'rgba(255,249,231,.97)':'rgba(239,255,248,.97)';
      feedback.style.opacity='1';feedback.style.animation='none';void feedback.offsetWidth;feedback.style.animation='g1uxPop .52s ease';
      feedbackUntil=performance.now()+ms;
    };
    const showTool=(el,o,on,w,rot)=>{
      if(!el||!o)return;
      if(!on){el.style.display='none';el.style.opacity='0';return;}
      el.style.display='block';el.style.opacity='.97';el.style.left=pct(o.x,1280);el.style.top=pct(o.y,720);el.style.width=pct(w,1280);el.style.height='auto';
      el.style.transform=`translate(-50%,-50%) rotate(${rot}deg) scale(1.06)`;
      el.style.filter='drop-shadow(0 9px 10px rgba(22,38,57,.24)) saturate(.92) contrast(1.04) brightness(1.04)';el.style.zIndex='16';
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      const dbg=scene.debugState?.()||{};const input=dbg.g1r2V17Input||{};const active=input.active||null;
      const q=(scene.mouthProgress||[]).filter(v=>v>=115).length;
      const clipped=scene.clipped?.size||0;
      const facePct=Math.max(0,Math.min(100,Math.round((scene.faceWash||0)/360*100)));
      const faceBucket=Math.floor(facePct/25);

      showTool(paste,scene.paste,st===0&&active==='paste',118,-9);
      showTool(brush,scene.brush,st===1&&active==='brush',144,-11);
      showTool(cloth,scene.cloth,st===2&&active==='cloth',92,4);
      if(st===3&&clipper){clipper.style.opacity=active==='clipper'?'1':'.94';clipper.style.filter=active==='clipper'?'drop-shadow(0 10px 12px rgba(22,38,57,.28)) saturate(.82) contrast(1.10) brightness(1.05)':'saturate(.78) contrast(1.08) brightness(1.04)';}

      brushZones.forEach((d,i)=>{const done=(scene.mouthProgress?.[i]||0)>=115;d.dataset.done=done?'1':'0';d.style.opacity=st===1?(done?'.92':'.72'):'0';d.style.background=done?'rgba(198,250,222,.88)':'rgba(235,250,255,.28)';d.style.borderColor=done?'rgba(41,171,126,.78)':'rgba(36,125,164,.52)';d.textContent=done?'✓':'';if(done)d.style.transform='translate(-50%,-50%) scale(.92)';});
      nailTargets.forEach((d,i)=>{const done=!!scene.clipped?.has(i);d.dataset.done=done?'1':'0';d.style.opacity=st===3?(done?'.98':'.72'):'0';d.style.background=done?'rgba(198,250,222,.96)':'rgba(255,255,255,.38)';d.style.borderColor=done?'rgba(41,171,126,.86)':'rgba(36,125,164,.58)';d.textContent=done?'✓':'';if(done&&d.dataset.animated!=='1'){d.dataset.animated='1';d.style.animation='g1uxDone .34s ease';}});

      if(focus){focus.style.opacity=st>=4?'0':active?'.64':'1';focus.style.animation=active?'none':'g1uxPulse 1.25s ease-in-out infinite';}
      if(progress){progress.style.transform=active?'translateX(-50%) scale(1.035)':'translateX(-50%)';progress.style.transition='transform .12s ease,background .16s ease';}
      if(status)status.style.opacity=active?'.88':'1';
      if(face&&st===2)face.style.filter=`saturate(${1.10+facePct*.0007}) contrast(1.018) brightness(${1+facePct*.00035})`;
      if(nail&&st===3&&clipped>0)nail.style.filter=`saturate(${1.10+clipped*.012}) contrast(1.018) brightness(${1+clipped*.006})`;

      if(st!==lastStep){
        const msg=st===1?'✓ 치약 완료 · 이제 양치!':st===2?'✓ 양치 완료 · 이제 세수!':st===3?'✓ 세수 완료 · 이제 손톱!':st>=4?'✓ 모두 완료!':'좋아요!';announce(msg,'ok',1250);lastStep=st;
      }
      if(st===1&&q>lastQ){announce(`✓ 양치 ${q}/4 구역 완료`);}
      if(st===2&&faceBucket>lastFaceBucket&&faceBucket<4){announce(`세수 ${Math.min(75,faceBucket*25)}% · 잘 하고 있어요`,'ok',850);}
      if(st===3&&clipped>lastClip){announce(`✓ 손톱 ${clipped}/5 완료`);}

      if((input.pasteUp||0)>prevCount.pasteUp&&st===0)announce('칫솔 위까지 가져가 주세요','hint',1200);
      if((input.brushUp||0)>prevCount.brushUp&&st===1&&q===lastQ)announce('네 구역을 골고루 문질러 주세요','hint',1100);
      if((input.clipperUp||0)>prevCount.clipperUp&&st===3&&clipped===lastClip)announce('손톱 끝의 동그라미에 맞춰 주세요','hint',1200);
      prevCount={pasteUp:input.pasteUp||0,brushUp:input.brushUp||0,clothUp:input.clothUp||0,clipperUp:input.clipperUp||0};
      lastQ=q;lastClip=clipped;lastFaceBucket=faceBucket;
      if(feedback.style.opacity!=='0'&&performance.now()>feedbackUntil)feedback.style.opacity='0';
    };
    scene.events.on('postupdate',sync);sync();

    root.dataset.uxReady='1';root.dataset.version='17.24';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.24';
      window.__ADUGAME_ART_SOURCE__.G1R2.dynamicUx={toolFollowsPointer:true,brushQuadrantFeedback:4,nailTargetFeedback:5,successAndMissFeedback:true,readabilityPolish:true,generatedVisualAssets:0};
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.24';
    const cleanup=()=>{style.remove();feedback.remove();brushZones.forEach(d=>d.remove());nailTargets.forEach(d=>d.remove());scene.__g1v1724Ux=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1380,()=>attach(this));};
})();
