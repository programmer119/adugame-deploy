// ADUGAME G1R2 v17.25 dynamic UX alignment pass.
// UI feedback + mechanic-to-authored-art alignment only. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const BRUSH_CENTER={x:820,y:515};
  const BRUSH_ZONE_POS=[[775,490],[865,490],[775,540],[865,540]];
  const NAIL_POS=[[825,223],[845,194],[863,181],[884,188],[903,207]];
  const pct=(v,b)=>`${v/b*100}%`;

  // The authored brushing crop places the visible mouth lower than the legacy Phaser target.
  // Keep the original mechanic, but align its logical center/quadrants to what the player actually sees.
  G1R2.prototype.brushMove=function(o,p){
    if(this.step!==1)return;
    const dx=o.x-BRUSH_CENTER.x,dy=o.y-BRUSH_CENTER.y;
    if(Math.abs(dx)>125||Math.abs(dy)>82){this.lastBrush=null;return;}
    const q=(dy>=0?2:0)+(dx>=0?1:0);
    if(this.lastBrush){
      const d=dist(o.x,o.y,this.lastBrush.x,this.lastBrush.y);
      if(d>2&&d<90){
        this.mouthProgress[q]+=d;
        if(Math.floor(this.mouthProgress[q]/45)!==Math.floor((this.mouthProgress[q]-d)/45))audio.scrub();
        if(this.mouthProgress[q]>=115&&this.stains[q]?.active){this.stains[q].destroy();this.sparkle(BRUSH_ZONE_POS[q][0],BRUSH_ZONE_POS[q][1],3);}
      }
    }
    this.lastBrush={x:o.x,y:o.y};
    if(this.mouthProgress.every(v=>v>=115)){
      this.step=2;this.status.setText('양치 완료! 이제 세안천으로 얼굴을 부드럽게 씻어요');this.hintTarget={x:this.cloth.x,y:this.cloth.y};this.v5SetStep(3);
    }
  };

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1725Ux)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    scene.__g1v1725Ux=true;

    const paste=root.querySelector('.g1v17-paste');
    const brush=root.querySelector('.g1v17-brush');
    const cloth=root.querySelector('.g1v17-cloth');
    const clipper=root.querySelector('.g1v17-clipper');
    const people=root.querySelector('.g1v17-scene');
    const face=root.querySelector('.g1v17-facewash-scene');
    const nail=root.querySelector('.g1v17-nailraise-scene');
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const direct=[...root.children].filter(e=>e.tagName==='DIV');
    const progress=direct.find(e=>e.style.left==='50%'&&e.style.bottom==='7.4%');
    const status=direct.find(e=>e.style.left==='50%'&&e.style.bottom==='1%');
    if(progress)progress.classList.add('g1v17-ux-progress');
    if(status)status.classList.add('g1v17-ux-status');

    if(scene.mouth)scene.mouth.setPosition(BRUSH_CENTER.x,BRUSH_CENTER.y);
    (scene.stains||[]).forEach((s,i)=>{const p=BRUSH_ZONE_POS[i];if(s?.active&&p)s.setPosition(p[0],p[1]);});

    const style=document.createElement('style');
    style.textContent=`
      @keyframes g1uxPulse{0%,100%{box-shadow:0 0 0 8px rgba(123,223,242,.12)}50%{box-shadow:0 0 0 16px rgba(123,223,242,.23)}}
      @keyframes g1uxDone{0%{transform:translate(-50%,-50%) scale(.82)}55%{transform:translate(-50%,-50%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(1)}}
    `;
    document.head.appendChild(style);

    const cursor=document.createElement('div');
    cursor.className='g1v17-ux-cursor';cursor.dataset.kind='';
    Object.assign(cursor.style,{position:'absolute',width:'54px',height:'54px',transform:'translate(-50%,-50%)',zIndex:'17',pointerEvents:'none',borderRadius:'50%',border:'3px solid rgba(36,125,164,.72)',background:'rgba(255,255,255,.72)',boxShadow:'0 0 0 8px rgba(123,223,242,.16),0 8px 16px rgba(22,38,57,.18)',display:'none',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'1000',color:'#24465b',letterSpacing:'-.5px',backdropFilter:'blur(2px)'});
    root.appendChild(cursor);

    const brushZones=BRUSH_ZONE_POS.map((p,i)=>{
      const d=document.createElement('div');d.className='g1v17-ux-brush-zone';d.dataset.index=String(i);d.dataset.done='0';
      Object.assign(d.style,{position:'absolute',left:pct(p[0],1280),top:pct(p[1],720),width:'42px',height:'34px',transform:'translate(-50%,-50%)',zIndex:'12',pointerEvents:'none',borderRadius:'11px',border:'2px solid rgba(36,125,164,.58)',background:'rgba(235,250,255,.24)',boxShadow:'0 0 0 4px rgba(123,223,242,.09)',opacity:'0',transition:'opacity .15s ease,background .16s ease,border-color .16s ease,transform .16s ease',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'1000',fontSize:'16px',color:'#155f48'});
      root.appendChild(d);return d;
    });
    const nailTargets=NAIL_POS.map((p,i)=>{
      const d=document.createElement('div');d.className='g1v17-ux-nail-target';d.dataset.index=String(i);d.dataset.done='0';
      Object.assign(d.style,{position:'absolute',left:pct(p[0],1280),top:pct(p[1],720),width:'30px',height:'30px',transform:'translate(-50%,-50%)',zIndex:'13',pointerEvents:'none',borderRadius:'50%',border:'2px solid rgba(36,125,164,.58)',background:'rgba(255,255,255,.38)',boxShadow:'0 0 0 5px rgba(123,223,242,.10)',opacity:'0',transition:'opacity .15s ease,background .16s ease,border-color .16s ease,transform .16s ease',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'1000',fontSize:'16px',color:'#12654b'});
      root.appendChild(d);return d;
    });

    if(progress)Object.assign(progress.style,{bottom:'8.8%',fontSize:'15px',lineHeight:'1.15',padding:'7px 12px',background:'rgba(255,255,255,.96)',color:'#24465b',border:'2px solid rgba(36,49,74,.10)',boxShadow:'0 4px 13px rgba(36,49,74,.12)',backdropFilter:'blur(5px)',zIndex:'18',minWidth:'128px',textAlign:'center'});
    if(status)Object.assign(status.style,{bottom:'1.3%',minWidth:'360px',maxWidth:'72%',fontSize:'16px',lineHeight:'1.28',padding:'9px 19px',background:'rgba(22,38,57,.91)',color:'#fff',boxShadow:'0 7px 18px rgba(22,38,57,.19)',backdropFilter:'blur(5px)',zIndex:'19'});
    if(focus){focus.style.animation='g1uxPulse 1.25s ease-in-out infinite';focus.style.zIndex='11';}

    let feedbackText='',feedbackTone='ok',feedbackUntil=0,lastStep=Number(scene.step)||0,lastQ=0,lastClip=0,lastFaceBucket=0;
    let prevCount={pasteUp:0,brushUp:0,clothUp:0,clipperUp:0};
    const announce=(text,tone='ok',ms=1100)=>{feedbackText=text;feedbackTone=tone;feedbackUntil=performance.now()+ms;root.dataset.uxFeedback=text;root.dataset.uxFeedbackTone=tone;};
    const showCursor=(kind,o,on)=>{
      if(!on||!o){cursor.style.display='none';cursor.dataset.kind='';return;}
      cursor.style.display='flex';cursor.dataset.kind=kind;cursor.style.left=pct(o.x,1280);cursor.style.top=pct(o.y,720);
      cursor.textContent=kind==='paste'?'치약':kind==='brush'?'칫솔':'세안';
      cursor.style.width=kind==='brush'?'48px':'54px';cursor.style.height=kind==='brush'?'48px':'54px';
      cursor.style.borderColor=kind==='cloth'?'rgba(41,171,126,.74)':'rgba(36,125,164,.72)';
      cursor.style.background=kind==='cloth'?'rgba(239,255,248,.80)':'rgba(255,255,255,.74)';
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      const dbg=scene.debugState?.()||{};const input=dbg.g1r2V17Input||{};const active=input.active||null;
      const q=(scene.mouthProgress||[]).filter(v=>v>=115).length;
      const clipped=scene.clipped?.size||0;
      const facePct=Math.max(0,Math.min(100,Math.round((scene.faceWash||0)/360*100)));
      const faceBucket=Math.floor(facePct/25);

      // Keep the mismatched standalone paste/brush/cloth art hidden; use one clean pointer-following UX cursor instead.
      if(paste){paste.style.display='none';paste.style.opacity='0';}
      if(brush){brush.style.display='none';brush.style.opacity='0';}
      if(cloth){cloth.style.display='none';cloth.style.opacity='0';}
      if(active==='paste'&&st===0)showCursor('paste',scene.paste,true);
      else if(active==='brush'&&st===1)showCursor('brush',scene.brush,true);
      else if(active==='cloth'&&st===2)showCursor('cloth',scene.cloth,true);
      else showCursor('',null,false);

      if(st===1&&focus){focus.style.left=pct(BRUSH_CENTER.x,1280);focus.style.top=pct(BRUSH_CENTER.y,720);focus.style.width=pct(235,1280);focus.style.height=pct(150,720);}
      brushZones.forEach((d,i)=>{const done=(scene.mouthProgress?.[i]||0)>=115;d.dataset.done=done?'1':'0';d.style.opacity=st===1?(done?'.94':'.72'):'0';d.style.background=done?'rgba(198,250,222,.90)':'rgba(235,250,255,.24)';d.style.borderColor=done?'rgba(41,171,126,.82)':'rgba(36,125,164,.58)';d.textContent=done?'✓':'';if(done)d.style.transform='translate(-50%,-50%) scale(.92)';});
      nailTargets.forEach((d,i)=>{const done=!!scene.clipped?.has(i);d.dataset.done=done?'1':'0';d.style.opacity=st===3?(done?'.98':'.72'):'0';d.style.background=done?'rgba(198,250,222,.96)':'rgba(255,255,255,.38)';d.style.borderColor=done?'rgba(41,171,126,.86)':'rgba(36,125,164,.58)';d.textContent=done?'✓':'';if(done&&d.dataset.animated!=='1'){d.dataset.animated='1';d.style.animation='g1uxDone .34s ease';}});

      if(focus){focus.style.opacity=st>=4?'0':active?'.62':'1';focus.style.animation=active?'none':'g1uxPulse 1.25s ease-in-out infinite';}
      if(status)status.style.opacity=active?'.90':'1';
      if(people&&st===1&&active==='brush')people.style.filter='saturate(1.16) contrast(1.03) brightness(1.025)';
      if(face&&st===2)face.style.filter=`saturate(${1.10+facePct*.0007}) contrast(1.018) brightness(${1+facePct*.00035})`;
      if(nail&&st===3&&clipped>0)nail.style.filter=`saturate(${1.10+clipped*.012}) contrast(1.018) brightness(${1+clipped*.006})`;
      if(st===3&&clipper){clipper.style.opacity=active==='clipper'?'1':'.94';clipper.style.filter=active==='clipper'?'drop-shadow(0 10px 12px rgba(22,38,57,.28)) saturate(.82) contrast(1.10) brightness(1.05)':'saturate(.78) contrast(1.08) brightness(1.04)';}

      if(st!==lastStep){const msg=st===1?'✓ 치약 완료 · 이제 양치!':st===2?'✓ 양치 완료 · 이제 세수!':st===3?'✓ 세수 완료 · 이제 손톱!':st>=4?'✓ 모두 완료!':'좋아요!';announce(msg,'ok',1250);lastStep=st;}
      if(st===1&&q>lastQ)announce(`✓ 양치 ${q}/4 구역 완료`,'ok',900);
      if(st===2&&faceBucket>lastFaceBucket&&faceBucket<4)announce(`세수 ${Math.min(75,faceBucket*25)}% · 잘 하고 있어요`,'ok',850);
      if(st===3&&clipped>lastClip)announce(`✓ 손톱 ${clipped}/5 완료`,'ok',900);
      if((input.pasteUp||0)>prevCount.pasteUp&&st===0)announce('칫솔 위까지 가져가 주세요','hint',1200);
      if((input.brushUp||0)>prevCount.brushUp&&st===1&&q===lastQ)announce('입 주변 네 구역을 골고루 문질러 주세요','hint',1100);
      if((input.clipperUp||0)>prevCount.clipperUp&&st===3&&clipped===lastClip)announce('손톱 끝의 동그라미에 맞춰 주세요','hint',1200);

      if(progress){
        const live=performance.now()<feedbackUntil;
        if(live){progress.textContent=feedbackText;progress.style.background=feedbackTone==='hint'?'rgba(255,249,231,.98)':'rgba(239,255,248,.98)';progress.style.color=feedbackTone==='hint'?'#734b12':'#155f48';progress.style.borderColor=feedbackTone==='hint'?'rgba(227,166,61,.42)':'rgba(41,171,126,.34)';progress.style.transform='translateX(-50%) scale(1.035)';}
        else{progress.style.background='rgba(255,255,255,.96)';progress.style.color='#24465b';progress.style.borderColor='rgba(36,49,74,.10)';progress.style.transform=active?'translateX(-50%) scale(1.025)':'translateX(-50%)';}
      }

      prevCount={pasteUp:input.pasteUp||0,brushUp:input.brushUp||0,clothUp:input.clothUp||0,clipperUp:input.clipperUp||0};lastQ=q;lastClip=clipped;lastFaceBucket=faceBucket;
    };
    scene.events.on('postupdate',sync);sync();

    root.dataset.uxReady='1';root.dataset.version='17.25';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.25';
      window.__ADUGAME_ART_SOURCE__.G1R2.dynamicUx={pointerFeedbackFollowsInput:true,standaloneDragArtHidden:true,brushVisualTarget:{...BRUSH_CENTER},brushQuadrantFeedback:4,nailTargetFeedback:5,successAndMissFeedback:true,readabilityPolish:true,generatedVisualAssets:0};
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.25';
    const cleanup=()=>{style.remove();cursor.remove();brushZones.forEach(d=>d.remove());nailTargets.forEach(d=>d.remove());scene.__g1v1725Ux=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1380,()=>attach(this));};
})();
