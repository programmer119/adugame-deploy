// ADUGAME remaining commercial-art v1.04 polish.
// Keeps authored context visible while giving live mechanic targets the strongest visual hierarchy.
(() => {
  const CFG={
    G1R1:{wash:'linear-gradient(180deg,rgba(231,246,250,.07),rgba(249,250,246,.05) 60%,rgba(217,229,224,.07) 60.2% 100%)',hero:{x:1030,y:365,w:292},bgOpacity:'.14'},
    G1R3:{wash:'linear-gradient(180deg,rgba(255,248,232,.15),rgba(252,240,219,.12) 57%,rgba(225,190,145,.15) 57.2% 100%)',hero:{x:1010,y:350,w:350},secondary:{x:1010,y:355,w:350}},
    G2R1:{wash:'linear-gradient(180deg,rgba(238,248,246,.14),rgba(255,248,232,.11) 57%,rgba(217,176,125,.14) 57.2% 100%)',hero:{x:1015,y:330,w:365}},
    G2R2:{wash:'linear-gradient(180deg,rgba(231,246,249,.15),rgba(250,251,246,.11) 60%,rgba(210,226,219,.14) 60.2% 100%)',hero:{x:1015,y:350,w:335}},
    G2R3:{wash:'linear-gradient(180deg,rgba(235,242,247,.08),rgba(248,244,232,.06) 58%,rgba(194,177,151,.08) 58.2% 100%)',hero:{x:1050,y:378,w:190}}
  };
  const px=x=>`${x/12.8}%`,py=y=>`${y/7.2}%`;
  const place=(e,p)=>{if(!e||!p)return;Object.assign(e.style,{left:px(p.x),top:py(p.y),width:px(p.w),height:'auto',transform:'translate(-50%,-50%)'});};
  function apply(scene){
    const key=scene.scene?.key,cfg=CFG[key];if(!cfg)return;
    const root=document.getElementById(`remaining-commercial-${key}`);
    if(!root){scene.time?.delayedCall?.(100,()=>apply(scene));return;}
    if(root.dataset.v104Polished==='1')return;
    root.dataset.v104Polished='1';root.dataset.version='1.04';root.dataset.interactionPriority='live-phaser-first';root.dataset.generatedVisualAssets='0';
    const wash=root.querySelector('.remaining-wash');if(wash)wash.style.background=cfg.wash;
    const hero=root.querySelector('.remaining-hero');place(hero,cfg.hero);
    const secondary=root.querySelector('.remaining-secondary');place(secondary,cfg.secondary);
    const bg=root.querySelector('.remaining-bg');if(bg&&cfg.bgOpacity)bg.style.opacity=cfg.bgOpacity;
    [hero,secondary].filter(Boolean).forEach(e=>{e.style.filter='saturate(1.06) contrast(1.035) drop-shadow(0 9px 14px rgba(48,56,82,.09))';});
    const zone=root.querySelector('.remaining-zone');if(zone){zone.style.background='rgba(255,255,255,.018)';zone.style.boxShadow='0 0 0 4px rgba(92,194,214,.055)';zone.style.borderColor='rgba(65,170,195,.42)';}

    // G2R3: make the actual repair target the hero and keep the authored mechanic as support.
    // Only layout/scale changes are applied; repair state, hit logic and inventory validation stay untouched.
    if(key==='G2R3'){
      try{
        scene.car?.setScale?.(1.28);scene.car?.setDepth?.(8);
        scene.toolbox?.setScale?.(.92);
        scene.yardBox?.setScale?.(.90);
      }catch{}
      root.dataset.sceneHierarchy='live-car-primary-authored-mechanic-support';
    }
    if(key==='G1R1')root.dataset.sceneHierarchy='live-wash-target-primary-authored-child-support';

    if(window.__ADUGAME_ART_SOURCE__?.REMAINING){window.__ADUGAME_ART_SOURCE__.REMAINING.version='commercial-v1.04';window.__ADUGAME_ART_SOURCE__.REMAINING.liveInteractionPriority=true;window.__ADUGAME_ART_SOURCE__.REMAINING.generatedVisualAssets=0;}
  }
  const classes=[typeof G1R1==='function'?G1R1:null,typeof G1R3==='function'?G1R3:null,typeof G2R1==='function'?G2R1:null,typeof G2R2==='function'?G2R2:null,typeof G2R3==='function'?G2R3:null].filter(Boolean);
  classes.forEach(K=>{const prior=K.prototype.create;K.prototype.create=function(){prior.call(this);this.time?.delayedCall?.(1150,()=>apply(this));};});
  window.__ADUGAME_REMAINING_COMMERCIAL_ART_POLISH__={loaded:true,version:'1.04',liveInteractionPriority:true,generatedVisualAssets:0};
})();