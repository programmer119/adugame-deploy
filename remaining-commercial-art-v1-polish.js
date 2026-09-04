// ADUGAME remaining commercial-art v1.07 polish.
// Keeps authored context visible while giving real mechanic targets the strongest visual hierarchy.
// G2R3 authored toy car: Openclipart 21980 — human-authored Public Domain/CC0 source already approved for this project.
(() => {
  const TOY_CAR='https://openclipart.org/image/800px/21980';
  const CFG={
    G1R1:{wash:'transparent',hero:{x:1030,y:365,w:300},bgOpacity:'0'},
    G1R3:{wash:'linear-gradient(180deg,rgba(255,248,232,.15),rgba(252,240,219,.12) 57%,rgba(225,190,145,.15) 57.2% 100%)',hero:{x:1010,y:350,w:350},secondary:{x:1010,y:355,w:350},hideOverlayTitle:true,hideZoneLabel:true},
    G2R1:{wash:'linear-gradient(180deg,rgba(238,248,246,.14),rgba(255,248,232,.11) 57%,rgba(217,176,125,.14) 57.2% 100%)',hero:{x:1015,y:330,w:365},hideOverlayTitle:true},
    G2R2:{wash:'linear-gradient(180deg,rgba(231,246,249,.15),rgba(250,251,246,.11) 60%,rgba(210,226,219,.14) 60.2% 100%)',hero:{x:1015,y:350,w:335},hideOverlayTitle:true,hideZoneLabel:true},
    G2R3:{wash:'linear-gradient(180deg,rgba(235,242,247,.055),rgba(248,244,232,.035) 58%,rgba(194,177,151,.055) 58.2% 100%)',hero:{x:1055,y:382,w:172},hideOverlayTitle:true}
  };
  const px=x=>`${x/12.8}%`,py=y=>`${y/7.2}%`;
  const place=(e,p)=>{if(!e||!p)return;Object.assign(e.style,{left:px(p.x),top:py(p.y),width:px(p.w),height:'auto',transform:'translate(-50%,-50%)'});};
  function mountAuthoredCar(scene,root){
    if(root.querySelector('.remaining-authored-toycar'))return;
    const car=document.createElement('img');
    car.className='remaining-authored-toycar';car.src=TOY_CAR;car.alt='authored red toy car';car.draggable=false;
    Object.assign(car.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:px(720),top:py(405),width:px(350),height:'auto',transform:'translate(-50%,-50%)',zIndex:'9',filter:'saturate(1.08) contrast(1.04) drop-shadow(0 11px 15px rgba(48,56,82,.12))',opacity:'0',transition:'opacity .16s ease,transform .18s ease'});
    car.addEventListener('load',()=>{
      car.style.opacity='1';
      try{scene.car?.setAlpha?.(0);}catch{}
      root.dataset.authoredCarReady='1';
      root.dataset.carPresentation='authored-openclipart-21980-over-live-hit-target';
    },{once:true});
    car.addEventListener('error',()=>{root.dataset.authoredCarReady='0';root.dataset.carPresentation='live-phaser-fallback';},{once:true});
    root.appendChild(car);
  }
  function apply(scene){
    const key=scene.scene?.key,cfg=CFG[key];if(!cfg)return;
    const root=document.getElementById(`remaining-commercial-${key}`);
    if(!root){scene.time?.delayedCall?.(100,()=>apply(scene));return;}
    if(root.dataset.v107Polished==='1')return;
    root.dataset.v107Polished='1';root.dataset.version='1.07';root.dataset.interactionPriority='live-phaser-hit-targets';root.dataset.generatedVisualAssets='0';
    const wash=root.querySelector('.remaining-wash');if(wash)wash.style.background=cfg.wash;
    const hero=root.querySelector('.remaining-hero');place(hero,cfg.hero);
    const secondary=root.querySelector('.remaining-secondary');place(secondary,cfg.secondary);
    const bg=root.querySelector('.remaining-bg');if(bg&&cfg.bgOpacity!=null)bg.style.opacity=cfg.bgOpacity;
    const overlayTitle=root.querySelector('.remaining-title');
    if(cfg.hideOverlayTitle&&overlayTitle){overlayTitle.style.display='none';overlayTitle.setAttribute('aria-hidden','true');root.dataset.overlayTitle='hidden-existing-scene-title-used';}
    [hero,secondary].filter(Boolean).forEach(e=>{e.style.filter='saturate(1.06) contrast(1.035) drop-shadow(0 9px 14px rgba(48,56,82,.09))';});
    if(key==='G1R1'){
      if(bg){bg.style.opacity='0';bg.style.display='none';}
      if(wash)wash.style.background='transparent';
      if(hero)hero.style.filter='saturate(1.12) contrast(1.075) drop-shadow(0 11px 16px rgba(48,56,82,.13))';
      root.dataset.backgroundComposition='live-authored-bathroom-only-no-duplicate-wash';
    }
    const zone=root.querySelector('.remaining-zone');
    if(zone){
      zone.style.background='rgba(255,255,255,.018)';zone.style.boxShadow='0 0 0 4px rgba(92,194,214,.055)';zone.style.borderColor='rgba(65,170,195,.42)';
      const zoneLabel=zone.querySelector('.remaining-zone-label');
      if(cfg.hideZoneLabel&&zoneLabel){zoneLabel.style.display='none';zoneLabel.setAttribute('aria-hidden','true');root.dataset.zoneLabel='hidden-duplicate-scene-label';}
    }

    // G2R3: authored car visually replaces only the live fixture artwork. The live Phaser
    // object stays in place as the repair/drop target, so repair state and validation are unchanged.
    if(key==='G2R3'){
      try{
        scene.car?.setScale?.(1);scene.car?.setDepth?.(8);
        scene.toolbox?.setScale?.(.90);
        scene.yardBox?.setScale?.(.88);
      }catch{}
      mountAuthoredCar(scene,root);
      root.dataset.sceneHierarchy='authored-toy-car-primary-live-hit-target-authored-mechanic-support';
    }
    if(key==='G1R1')root.dataset.sceneHierarchy='live-wash-target-primary-authored-child-support';

    if(window.__ADUGAME_ART_SOURCE__?.REMAINING){
      window.__ADUGAME_ART_SOURCE__.REMAINING.version='commercial-v1.07';
      window.__ADUGAME_ART_SOURCE__.REMAINING.liveInteractionPriority=true;
      window.__ADUGAME_ART_SOURCE__.REMAINING.generatedVisualAssets=0;
      window.__ADUGAME_ART_SOURCE__.REMAINING.assets={...(window.__ADUGAME_ART_SOURCE__.REMAINING.assets||{}),toyCar:TOY_CAR};
    }
  }
  const classes=[typeof G1R1==='function'?G1R1:null,typeof G1R3==='function'?G1R3:null,typeof G2R1==='function'?G2R1:null,typeof G2R2==='function'?G2R2:null,typeof G2R3==='function'?G2R3:null].filter(Boolean);
  classes.forEach(K=>{const prior=K.prototype.create;K.prototype.create=function(){prior.call(this);this.time?.delayedCall?.(920,()=>apply(this));};});
  window.__ADUGAME_REMAINING_COMMERCIAL_ART_POLISH__={loaded:true,version:'1.07',liveInteractionPriority:true,generatedVisualAssets:0,authoredToyCar:TOY_CAR,g1r1DuplicateBathroomRemoved:true,duplicateSceneLabelsRemoved:true};
})();