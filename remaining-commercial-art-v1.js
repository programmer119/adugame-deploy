// ADUGAME remaining commercial-art v1.01
// Raises G1R1/G1R3/G2R1/G2R2/G2R3 to the G1R2 authored-scene quality target.
// All raster/SVG imagery is human-authored public-domain Openclipart material.
// CSS is used only for environment/layout/feedback. generatedVisualAssets=0.
(() => {
  const ASSET={
    hair:'https://openclipart.org/image/800px/299985',
    comb:'https://openclipart.org/image/800px/292342',
    lunch:'https://openclipart.org/image/800px/335027',
    washHands:'https://openclipart.org/image/800px/312394',
    kitchen:'https://openclipart.org/image/800px/301024',
    laundry:'https://openclipart.org/image/800px/312076',
    washer:'https://openclipart.org/image/800px/284300',
    mechanic:'https://openclipart.org/image/800px/314802',
    toyCar:'https://openclipart.org/image/800px/21980',
    tools:'https://openclipart.org/image/800px/295367'
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
  function pill(root,text,x,y,cls=''){const e=el('div',`remaining-pill ${cls}`,text);css(e,{position:'absolute',left:px(x),top:py(y),transform:'translate(-50%,-50%)',zIndex:'20',padding:'7px 11px',borderRadius:'999px',background:'rgba(255,255,255,.9)',boxShadow:'0 5px 14px rgba(48,56,82,.09)',fontSize:'12px',fontWeight:'900',color:'#38445c',whiteSpace:'nowrap'});root.appendChild(e);return e;}
  function softZone(root,x,y,w,h,label){const z=el('div','remaining-zone');css(z,{position:'absolute',left:px(x),top:py(y),width:px(w),height:py(h),transform:'translate(-50%,-50%)',zIndex:'18',borderRadius:'26px',border:'3px solid rgba(92,194,214,.38)',boxShadow:'0 0 0 6px rgba(92,194,214,.07)',background:'rgba(255,255,255,.035)',transition:'left .12s linear,top .12s linear,width .16s ease,height .16s ease,opacity .16s ease'});const t=el('span','remaining-zone-label',label);css(t,{position:'absolute',left:'50%',top:'-15px',transform:'translateX(-50%)',padding:'4px 8px',borderRadius:'999px',background:'rgba(255,255,255,.88)',fontSize:'10px',fontWeight:'900',color:'#4c6670'});z.appendChild(t);root.appendChild(z);return z;}
  function readiness(root,images){let done=false;const mark=()=>{if(done)return;const ok=images.filter(i=>i.complete&&i.naturalWidth>0).length;root.dataset.loadedImages=String(ok);if(ok>=Math.min(2,images.length)){done=true;root.dataset.ready='1';root.dataset.heroReady='1';}};images.forEach(i=>{i.addEventListener('load',mark,{once:true});i.addEventListener('error',mark,{once:true});});mark();setTimeout(()=>{if(!done){root.dataset.ready='1';root.dataset.heroReady=images.some(i=>i.naturalWidth>0)?'1':'0';root.dataset.loadedImages=String(images.filter(i=>i.naturalWidth>0).length);}},12000);}

  function mount(scene){
    const key=scene.scene?.key;if(!KEYS.has(key)||scene.__remainingCommercialRoot)return;
    const root=el('div','remaining-commercial-root');root.id=`remaining-commercial-${key}`;root.dataset.key=key;root.dataset.ready='0';root.dataset.generatedVisualAssets='0';root.dataset.qualityTarget='g1r2-commercial';root.dataset.version='1.01';
    css(root,{position:'fixed',overflow:'hidden',pointerEvents:'none',zIndex:'83',fontFamily:'Arial,sans-serif',color:'#29344d'});document.body.appendChild(root);scene.__remainingCommercialRoot=root;syncRoot(scene,root);
    const images=[];const addImg=(src,cls,alt,x,y,w,rot=0,extra={})=>{const i=img(src,cls,alt);place(i,x,y,w,rot);css(i,{zIndex:'8',filter:'saturate(1.03) contrast(1.015)',transition:'transform .16s ease,filter .18s ease,opacity .18s ease',...extra});root.appendChild(i);images.push(i);return i;};
    const wash=el('div','remaining-wash');css(wash,{position:'absolute',inset:'0',zIndex:'1'});root.appendChild(wash);
    const title=pill(root,'',155,42,'remaining-title');const progress=pill(root,'',1100,42,'remaining-progress');
    css(title,{fontSize:'15px',padding:'8px 13px'});css(progress,{fontSize:'13px',padding:'8px 13px'});
    const zone=softZone(root,650,420,170,120,'여기');let hero=null,toolProxy=null,secondary=[];

    if(key==='G1R1'){
      css(wash,{background:'linear-gradient(180deg,rgba(248,236,246,.94),rgba(250,246,239,.94) 58%,rgba(224,202,181,.88) 58.2% 100%)'});
      title.textContent='아침 준비 · 머리 정돈';hero=addImg(ASSET.hair,'remaining-hero hair-hero','woman combing hair',790,360,520,0,{filter:'saturate(1.02) contrast(1.02)'});toolProxy=addImg(ASSET.comb,'remaining-tool comb-proxy','comb',315,405,150,-8,{zIndex:'13'});hideOnLoad(hero,scene.face,scene.hair);hideOnLoad(toolProxy,scene.comb);zone.querySelector('span').textContent='머리카락';
      const mirror=el('div','remaining-mirror');css(mirror,{position:'absolute',left:'7%',top:'18%',width:'25%',height:'61%',borderRadius:'48% 48% 22% 22%',background:'linear-gradient(145deg,rgba(213,238,248,.82),rgba(255,255,255,.72))',border:'10px solid rgba(176,143,119,.45)',boxShadow:'inset 0 0 28px rgba(255,255,255,.62)',zIndex:'2'});root.appendChild(mirror);
    }else if(key==='G1R3'){
      css(wash,{background:'linear-gradient(180deg,rgba(255,247,229,.9),rgba(250,238,218,.82) 55%,rgba(221,177,126,.68) 55.2% 100%)'});
      title.textContent='식사 준비 · 처음부터 끝까지';hero=addImg(ASSET.lunch,'remaining-hero lunch-hero','child ready for a meal',955,370,430,0,{zIndex:'7'});secondary.push(addImg(ASSET.washHands,'remaining-secondary washhands','child washing hands',210,235,230,0,{zIndex:'8'}));hideOnLoad(hero,scene.face);zone.querySelector('span').textContent='다음 행동';
    }else if(key==='G2R1'){
      css(wash,{background:'linear-gradient(180deg,rgba(238,248,246,.82),rgba(255,248,232,.78) 57%,rgba(217,176,125,.62) 57.2% 100%)'});
      title.textContent='인터랙티브 하우스 · 주방';hero=addImg(ASSET.kitchen,'remaining-hero kitchen-hero','mother and child cooking in a kitchen',930,330,500,0,{zIndex:'7'});hideOnLoad(hero,scene.face);zone.querySelector('span').textContent='현재 목표';
    }else if(key==='G2R2'){
      css(wash,{background:'linear-gradient(180deg,rgba(231,246,249,.92),rgba(250,251,246,.9) 60%,rgba(210,226,219,.72) 60.2% 100%)'});
      title.textContent='인터랙티브 하우스 · 세탁실';hero=addImg(ASSET.laundry,'remaining-hero laundry-hero','person doing laundry',900,360,430,0,{zIndex:'7'});secondary.push(addImg(ASSET.washer,'remaining-secondary washer-proxy','washing machine',650,340,300,0,{zIndex:'8'}));hideOnLoad(hero,scene.face);hideOnLoad(secondary[0],scene.washer);zone.querySelector('span').textContent='세탁기';pill(root,'문 열기 · 시작',650,205,'washer-label');
    }else if(key==='G2R3'){
      css(wash,{background:'linear-gradient(180deg,rgba(235,242,247,.94),rgba(248,244,232,.9) 58%,rgba(194,177,151,.72) 58.2% 100%)'});
      title.textContent='인터랙티브 하우스 · 장난감 수리';hero=addImg(ASSET.mechanic,'remaining-hero mechanic-hero','mechanic with wrench',1000,300,340,0,{zIndex:'7'});secondary.push(addImg(ASSET.toyCar,'remaining-secondary toycar-proxy','toy car',705,410,350,0,{zIndex:'8'}));secondary.push(addImg(ASSET.tools,'remaining-secondary tools-proxy','repair tools',300,340,255,0,{zIndex:'8'}));hideOnLoad(hero,scene.face);hideOnLoad(secondary[0],scene.car);zone.querySelector('span').textContent='바퀴 자리';
    }

    const sync=()=>{
      if(!root.isConnected||!scene.sys?.isActive())return;syncRoot(scene,root);const complete=!!scene.roundComplete;let target=scene.hintTarget||{x:650,y:420};zone.style.left=px(target.x||650);zone.style.top=py(target.y||420);zone.style.opacity=complete?'0':'.9';
      if(key==='G1R1'){
        const p=Math.max(0,Math.min(1,Number(scene.progress)||0));progress.textContent=complete?'정돈 완료 ✓':`머리 정돈 ${Math.round(p*100)}%`;if(toolProxy&&scene.comb){place(toolProxy,scene.comb.x,scene.comb.y,150,scene.comb.angle||-8);}if(hero)hero.style.filter=`saturate(${1.02+p*.08}) contrast(1.02) drop-shadow(0 10px 16px rgba(83,61,78,.${Math.round(8+p*8)}))`;root.dataset.progress=String(p);
      }else if(key==='G1R3'){
        const step=Math.max(0,Number(scene.step)||0);progress.textContent=complete?'식사 준비 완료 ✓':`준비 ${Math.min(5,Math.floor(step))}/5`;root.dataset.progress=String(step);if(secondary[0])secondary[0].style.opacity=step<1?'.98':'.35';if(hero)hero.style.transform=`translate(-50%,-50%) scale(${step>=3?1.025:1})`;
      }else if(key==='G2R1'){
        const stack=Number(scene.stack?.length??scene.stack??0);progress.textContent=complete?'주방 목표 완료 ✓':`진행 ${stack}/3`;root.dataset.progress=String(stack);if(hero)hero.style.filter=stack>=3?'saturate(1.1) contrast(1.025) drop-shadow(0 10px 16px rgba(73,94,65,.12))':'saturate(1.03) contrast(1.015)';
      }else if(key==='G2R2'){
        const loaded=scene.mission?.loaded?.size??scene.loaded?.size??0,dried=scene.mission?.dried?.size??scene.dried?.size??0;progress.textContent=complete?'세탁 완료 ✓':scene.washed?`건조 ${dried}/3`:`세탁 준비 ${loaded}/3`;root.dataset.progress=`${loaded}/${dried}`;if(hero)hero.style.filter=scene.washed?'saturate(1.1) contrast(1.02)':'saturate(1.03) contrast(1.015)';
      }else if(key==='G2R3'){
        const stage=Number(scene.stage??scene.mission?.repair)||0;progress.textContent=complete?'수리 완료 ✓':`수리 ${stage}/3`;root.dataset.progress=String(stage);if(secondary[1])secondary[1].style.transform=`translate(-50%,-50%) rotate(${Math.min(6,(Number(scene.rotation)||0)/180)}deg)`;
      }
      progress.style.background=complete?'rgba(235,250,241,.95)':'rgba(255,255,255,.9)';progress.style.color=complete?'#39705a':'#38445c';root.dataset.roundComplete=String(complete);root.dataset.generatedVisualAssets='0';root.dataset.artQuality='authored-scene';
    };
    scene.events.on('postupdate',sync);sync();readiness(root,images);
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};window.__ADUGAME_ART_SOURCE__.REMAINING={version:'commercial-v1.01',qualityTarget:'G1R2 authored-art scene quality',generatedVisualAssets:0,assets:{...ASSET}};
    const cleanup=()=>{root.remove();scene.__remainingCommercialRoot=null;};scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  function wrap(Ctor){if(typeof Ctor!=='function'||Ctor.prototype.__remainingCommercialWrapped)return;const prior=Ctor.prototype.create;Ctor.prototype.create=function(){prior.call(this);this.time.delayedCall(900,()=>mount(this));};Ctor.prototype.__remainingCommercialWrapped=true;}
  [typeof G1R1!=='undefined'?G1R1:null,typeof G1R3!=='undefined'?G1R3:null,typeof G2R1!=='undefined'?G2R1:null,typeof G2R2!=='undefined'?G2R2:null,typeof G2R3!=='undefined'?G2R3:null].forEach(wrap);
  window.__ADUGAME_REMAINING_COMMERCIAL_ART__={loaded:true,version:'1.01',generatedVisualAssets:0,keys:[...KEYS]};
})();