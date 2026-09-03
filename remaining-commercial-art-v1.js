// ADUGAME remaining commercial-art v1.02
// Authored-scene pass for G1R1/G1R3/G2R1/G2R2/G2R3, aligned to each round's real mechanic.
// All imagery is human-authored public-domain Openclipart material. generatedVisualAssets=0.
(() => {
  const ASSET={
    bathroom:'https://openclipart.org/image/2000px/201728',
    washHands:'https://openclipart.org/image/800px/312394',
    play:'https://openclipart.org/image/800px/284805', // Children Playing #1 — oksmith/PublicDomainQ — Public Domain
    lunch:'https://openclipart.org/image/800px/335027',
    kitchen:'https://openclipart.org/image/800px/301024',
    laundry:'https://openclipart.org/image/800px/312076',
    mechanic:'https://openclipart.org/image/800px/325532' // Mechanic — culturalibre/Openclipart — Public Domain
  };
  const KEYS=new Set(['G1R1','G1R3','G2R1','G2R2','G2R3']);
  const px=x=>`${x/12.8}%`,py=y=>`${y/7.2}%`;
  const css=(e,s)=>{Object.assign(e.style,s);return e;};
  const el=(tag,cls,text='')=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  const img=(src,cls,alt)=>{const e=el('img',cls);e.src=src;e.alt=alt;e.draggable=false;css(e,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain'});return e;};
  const place=(e,x,y,w,rot=0)=>css(e,{left:px(x),top:py(y),width:px(w),height:'auto',transform:`translate(-50%,-50%) rotate(${rot}deg)`});
  const hide=o=>{try{o?.setAlpha?.(0);}catch{}};
  const hideOnLoad=(image,...objects)=>{const apply=()=>objects.forEach(hide);if(image?.complete&&image?.naturalWidth>0)apply();else image?.addEventListener?.('load',apply,{once:true});};
  function syncRoot(scene,root){const c=scene.game?.canvas;if(!c)return;const r=c.getBoundingClientRect();css(root,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});}
  function pill(root,text,x,y,cls=''){const e=el('div',`remaining-pill ${cls}`,text);css(e,{position:'absolute',left:px(x),top:py(y),transform:'translate(-50%,-50%)',zIndex:'20',padding:'7px 11px',borderRadius:'999px',background:'rgba(255,255,255,.92)',boxShadow:'0 5px 14px rgba(48,56,82,.09)',fontSize:'12px',fontWeight:'900',color:'#38445c',whiteSpace:'nowrap'});root.appendChild(e);return e;}
  function softZone(root,x,y,w,h,label){const z=el('div','remaining-zone');css(z,{position:'absolute',left:px(x),top:py(y),width:px(w),height:py(h),transform:'translate(-50%,-50%)',zIndex:'18',borderRadius:'26px',border:'3px solid rgba(92,194,214,.38)',boxShadow:'0 0 0 6px rgba(92,194,214,.07)',background:'rgba(255,255,255,.035)',transition:'left .12s linear,top .12s linear,width .16s ease,height .16s ease,opacity .16s ease'});const t=el('span','remaining-zone-label',label);css(t,{position:'absolute',left:'50%',top:'-15px',transform:'translateX(-50%)',padding:'4px 8px',borderRadius:'999px',background:'rgba(255,255,255,.9)',fontSize:'10px',fontWeight:'900',color:'#4c6670'});z.appendChild(t);root.appendChild(z);return z;}
  function readiness(root,images){let done=false;const mark=()=>{if(done)return;const ok=images.filter(i=>i.complete&&i.naturalWidth>0).length;root.dataset.loadedImages=String(ok);if(ok>=Math.min(2,images.length)){done=true;root.dataset.ready='1';root.dataset.heroReady='1';}};images.forEach(i=>{i.addEventListener('load',mark,{once:true});i.addEventListener('error',mark,{once:true});});mark();setTimeout(()=>{if(!done){root.dataset.ready='1';root.dataset.heroReady=images.some(i=>i.naturalWidth>0)?'1':'0';root.dataset.loadedImages=String(images.filter(i=>i.naturalWidth>0).length);}},12000);}

  function mount(scene){
    const key=scene.scene?.key;if(!KEYS.has(key)||scene.__remainingCommercialRoot)return;
    const root=el('div','remaining-commercial-root');root.id=`remaining-commercial-${key}`;root.dataset.key=key;root.dataset.ready='0';root.dataset.generatedVisualAssets='0';root.dataset.qualityTarget='g1r2-commercial';root.dataset.version='1.02';
    css(root,{position:'fixed',overflow:'hidden',pointerEvents:'none',zIndex:'83',fontFamily:'Arial,sans-serif',color:'#29344d'});document.body.appendChild(root);scene.__remainingCommercialRoot=root;syncRoot(scene,root);
    const images=[];const addImg=(src,cls,alt,x,y,w,rot=0,extra={})=>{const i=img(src,cls,alt);place(i,x,y,w,rot);css(i,{zIndex:'8',filter:'saturate(1.03) contrast(1.015)',transition:'transform .18s ease,filter .18s ease,opacity .22s ease',...extra});root.appendChild(i);images.push(i);return i;};
    const wash=el('div','remaining-wash');css(wash,{position:'absolute',inset:'0',zIndex:'1'});root.appendChild(wash);
    const title=pill(root,'',155,42,'remaining-title');const progress=pill(root,'',1100,42,'remaining-progress');
    css(title,{fontSize:'15px',padding:'8px 13px'});css(progress,{fontSize:'13px',padding:'8px 13px'});
    const zone=softZone(root,650,420,170,120,'여기');let hero=null,secondary=[];

    if(key==='G1R1'){
      css(wash,{background:'linear-gradient(180deg,rgba(231,246,250,.62),rgba(249,250,246,.58) 60%,rgba(217,229,224,.54) 60.2% 100%)'});
      title.textContent='화장실 사용 · 손 씻기';
      const bg=addImg(ASSET.bathroom,'remaining-bg bathroom-bg','bathroom',650,374,1160,0,{zIndex:'2',width:'100%',height:'100%',objectFit:'cover',opacity:'.22',filter:'saturate(.72) contrast(.98)'});place(bg,640,360,1280);
      hero=addImg(ASSET.washHands,'remaining-hero washhands-hero','child washing hands',930,350,390,0,{zIndex:'7',filter:'saturate(1.04) contrast(1.02) drop-shadow(0 10px 15px rgba(49,83,92,.10))'});
      hideOnLoad(hero,scene.face);zone.querySelector('span').textContent='현재 순서';
    }else if(key==='G1R3'){
      css(wash,{background:'linear-gradient(180deg,rgba(255,248,232,.70),rgba(252,240,219,.64) 57%,rgba(225,190,145,.55) 57.2% 100%)'});
      title.textContent='정리하기 · 건강한 식사';
      hero=addImg(ASSET.play,'remaining-hero play-hero','children playing with blocks',900,350,430,0,{zIndex:'7',filter:'saturate(1.04) contrast(1.015) drop-shadow(0 10px 15px rgba(98,75,53,.08))'});
      const meal=addImg(ASSET.lunch,'remaining-secondary lunch-hero','child ready for a meal',930,355,425,0,{zIndex:'8',opacity:'0',filter:'saturate(1.04) contrast(1.015) drop-shadow(0 10px 15px rgba(98,75,53,.08))'});secondary.push(meal);hideOnLoad(hero,scene.face);zone.querySelector('span').textContent='정리할 장난감';
    }else if(key==='G2R1'){
      css(wash,{background:'linear-gradient(180deg,rgba(238,248,246,.64),rgba(255,248,232,.60) 57%,rgba(217,176,125,.49) 57.2% 100%)'});
      title.textContent='인터랙티브 하우스 · 주방';hero=addImg(ASSET.kitchen,'remaining-hero kitchen-hero','mother and child cooking in a kitchen',930,330,470,0,{zIndex:'7',filter:'saturate(1.04) contrast(1.015) drop-shadow(0 10px 16px rgba(73,94,65,.08))'});hideOnLoad(hero,scene.face);zone.querySelector('span').textContent='현재 목표';
    }else if(key==='G2R2'){
      css(wash,{background:'linear-gradient(180deg,rgba(231,246,249,.68),rgba(250,251,246,.64) 60%,rgba(210,226,219,.54) 60.2% 100%)'});
      title.textContent='인터랙티브 하우스 · 세탁실';hero=addImg(ASSET.laundry,'remaining-hero laundry-hero','person doing laundry',930,350,430,0,{zIndex:'7',filter:'saturate(1.05) contrast(1.015) drop-shadow(0 10px 15px rgba(55,84,92,.08))'});hideOnLoad(hero,scene.face);zone.querySelector('span').textContent='세탁기';
    }else if(key==='G2R3'){
      css(wash,{background:'linear-gradient(180deg,rgba(235,242,247,.62),rgba(248,244,232,.58) 58%,rgba(194,177,151,.48) 58.2% 100%)'});
      title.textContent='인터랙티브 하우스 · 자동차 수리';hero=addImg(ASSET.mechanic,'remaining-hero mechanic-hero','mechanic beside a wheel',1035,345,245,0,{zIndex:'7',filter:'saturate(1.04) contrast(1.02) drop-shadow(0 10px 14px rgba(56,67,83,.08))'});zone.querySelector('span').textContent='수리할 자리';
    }

    const sync=()=>{
      if(!root.isConnected||!scene.sys?.isActive())return;syncRoot(scene,root);const complete=!!scene.roundComplete;let target=scene.hintTarget||{x:650,y:420};zone.style.left=px(target.x||650);zone.style.top=py(target.y||420);zone.style.opacity=complete?'0':'.88';
      if(key==='G1R1'){
        const st=Number(scene.step)||0;progress.textContent=complete?'손 씻기 완료 ✓':st<.5?'화장실 사용':st<1?'물 내리기':st<2?'손 적시기':st<3?'비누 묻히기':st<4?'손 문지르기':'헹구기';root.dataset.progress=String(st);if(hero)hero.style.transform=`translate(-50%,-50%) scale(${st>=2?1.02:1})`;zone.querySelector('span').textContent=st<.5?'변기':st<1?'물내림':st<2?'수도꼭지':st<3?'비누':st<4?'손':'수도꼭지';
      }else if(key==='G1R3'){
        const step=Math.max(0,Number(scene.step)||0),meal=secondary[0];progress.textContent=complete?'식사 준비 완료 ✓':step<1?'장난감 정리':step<2?'건강한 음식 고르기':'맛있게 먹기';root.dataset.progress=String(step);if(hero)hero.style.opacity=step<1?'1':'0';if(meal)meal.style.opacity=step>=1?'1':'0';title.textContent=step<1?'방 정리 · 장난감 제자리':'건강한 식사 · 골고루 먹기';zone.querySelector('span').textContent=step<1?'정리할 장난감':step<2?'고를 음식':'먹을 음식';
      }else if(key==='G2R1'){
        const stack=Number(scene.stack?.length??scene.stack??0);progress.textContent=complete?'주방 목표 완료 ✓':`진행 ${stack}/3`;root.dataset.progress=String(stack);if(hero)hero.style.filter=stack>=3?'saturate(1.1) contrast(1.025) drop-shadow(0 10px 16px rgba(73,94,65,.12))':'saturate(1.04) contrast(1.015) drop-shadow(0 10px 16px rgba(73,94,65,.08))';
      }else if(key==='G2R2'){
        const loaded=scene.mission?.loaded?.size??scene.loaded?.size??0,dried=scene.mission?.dried?.size??scene.dried?.size??0;progress.textContent=complete?'세탁 완료 ✓':scene.washed?`건조 ${dried}/3`:`세탁 준비 ${loaded}/3`;root.dataset.progress=`${loaded}/${dried}`;if(hero)hero.style.transform=`translate(-50%,-50%) scale(${scene.washed?1.025:1})`;zone.querySelector('span').textContent=scene.washed?'건조대':'세탁기';
      }else if(key==='G2R3'){
        const stage=Number(scene.stage??scene.mission?.repair)||0;progress.textContent=complete?'수리 완료 ✓':`수리 ${stage}/3`;root.dataset.progress=String(stage);if(hero)hero.style.transform=`translate(-50%,-50%) scale(${stage>0?1.018:1})`;zone.querySelector('span').textContent=stage<1?'바퀴 자리':stage<2?'나사 자리':'마무리';
      }
      progress.style.background=complete?'rgba(235,250,241,.95)':'rgba(255,255,255,.92)';progress.style.color=complete?'#39705a':'#38445c';root.dataset.roundComplete=String(complete);root.dataset.generatedVisualAssets='0';root.dataset.artQuality='authored-scene';
    };
    scene.events.on('postupdate',sync);sync();readiness(root,images);
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};window.__ADUGAME_ART_SOURCE__.REMAINING={version:'commercial-v1.02',qualityTarget:'G1R2 authored-art scene quality',generatedVisualAssets:0,stageResponsiveArt:true,assets:{...ASSET}};
    const cleanup=()=>{root.remove();scene.__remainingCommercialRoot=null;};scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  function wrap(Ctor){if(typeof Ctor!=='function'||Ctor.prototype.__remainingCommercialWrapped)return;const prior=Ctor.prototype.create;Ctor.prototype.create=function(){prior.call(this);this.time.delayedCall(900,()=>mount(this));};Ctor.prototype.__remainingCommercialWrapped=true;}
  [typeof G1R1!=='undefined'?G1R1:null,typeof G1R3!=='undefined'?G1R3:null,typeof G2R1!=='undefined'?G2R1:null,typeof G2R2!=='undefined'?G2R2:null,typeof G2R3!=='undefined'?G2R3:null].forEach(wrap);
  window.__ADUGAME_REMAINING_COMMERCIAL_ART__={loaded:true,version:'1.02',generatedVisualAssets:0,stageResponsiveArt:true,keys:[...KEYS]};
})();