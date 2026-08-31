// ADUGAME G1 R2 v14.0 — authored external assets only.
// IMPORTANT: This layer draws ZERO new visual assets. It only positions existing external images.
// Bathroom artwork: Tiny Treats Bubbly Bathroom (CC0).
// Character: Red Hat Boy / GameArt2D (CC0 via OpenGameArt mirror).
// Tool artwork: existing SVGRepo public/CC0 assets.
(() => {
  if (typeof G1R2 !== 'function') return;

  const SRC = {
    bathroom: 'https://img.itch.zone/aW1nLzE3MzQ5OTk0LnBuZw==/original/k%2F%2FRwa.png',
    kid: 'https://raw.githubusercontent.com/Saba-Burduli/Petty/master/Petty/Petty/Resources/Characters/GameArt2DRedHatBoy/Frames/Idle/Idle_001.png',
    toothpaste: 'https://www.svgrepo.com/download/226960/toothpaste.svg',
    toothbrush: 'https://www.svgrepo.com/download/133521/toothbrush.svg',
    sponge: 'https://www.svgrepo.com/download/147347/sponge.svg',
    clipper: 'https://www.svgrepo.com/download/287179/nail-clippers.svg',
    hand: 'https://www.svgrepo.com/download/488985/hand.svg'
  };

  const hiddenNames = new Set([
    'g1v9_r2_world','g1v10_r2_world','g1v10_teeth','g1v10_arm','g1v10_kid_shadow',
    'g1v12_shadow','g1v13_bg','g1v71_character_shadow','g1v7_character_shadow'
  ]);

  function hideLegacy(scene){
    scene.children.list.forEach(o=>{
      if(hiddenNames.has(o?.name)) o.setVisible(false);
      if(o?.type==='Text'){
        const t=String(o.text||'').trim();
        if(t.includes('생활 실습') || t==='세면도구' || t==='거울' || t==='손톱 정리' || t.startsWith('생활도구')) o.setVisible(false);
        if(t===scene.meta?.title) o.setVisible(false);
      }
    });
    // Preserve mechanics while making every legacy hand-drawn visual transparent.
    if(scene.face) scene.face.setAlpha(.001).setVisible(true);
    if(scene.mouth) scene.mouth.setAlpha(.001).setVisible(true);
    (scene.stains||[]).forEach(s=>s.setAlpha(.001).setVisible(true));
    [scene.paste,scene.brush,scene.cloth,scene.clipper,scene.hand].forEach(o=>{
      if(o) o.setAlpha(.001).setVisible(true);
    });
    (scene.nails||[]).forEach(n=>n.setAlpha(.001).setVisible(true));
    if(scene.status) scene.status.setVisible(false);
  }

  function img(src, cls, alt){
    const el=document.createElement('img');
    el.src=src; el.className=cls; el.alt=alt||''; el.draggable=false;
    el.style.position='absolute'; el.style.pointerEvents='none'; el.style.userSelect='none';
    return el;
  }

  function place(el,x,y,w,h,angle=0){
    el.style.left=`${(x/1280)*100}%`;
    el.style.top=`${(y/720)*100}%`;
    if(w) el.style.width=`${(w/1280)*100}%`;
    if(h) el.style.height=`${(h/720)*100}%`;
    el.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
    el.style.objectFit='contain';
  }

  function mount(scene){
    if(scene.scene?.key!=='G1R2') return;
    document.getElementById('g1r2-v14-overlay')?.remove();
    hideLegacy(scene);

    const root=document.createElement('div');
    root.id='g1r2-v14-overlay';
    root.dataset.generatedVisualAssets='0';
    Object.assign(root.style,{
      position:'fixed',pointerEvents:'none',overflow:'hidden',zIndex:'70',
      borderRadius:'26px',transformOrigin:'top left'
    });

    const bg=img(SRC.bathroom,'g1v14-bg','CC0 bathroom');
    Object.assign(bg.style,{left:'0',top:'0',width:'100%',height:'100%',objectFit:'cover',transform:'none'});
    root.appendChild(bg);

    // Existing authored child sprite, deliberately large so the character — not the UI — owns the scene.
    const kid=img(SRC.kid,'g1v14-kid','child character');
    place(kid,835,592,0,650,0);
    root.appendChild(kid);

    const paste=img(SRC.toothpaste,'g1v14-paste','toothpaste');
    const brush=img(SRC.toothbrush,'g1v14-brush','toothbrush');
    const cloth=img(SRC.sponge,'g1v14-cloth','sponge');
    const clipper=img(SRC.clipper,'g1v14-clipper','nail clipper');
    const hand=img(SRC.hand,'g1v14-hand','hand');
    [paste,brush,cloth,clipper,hand].forEach(el=>root.appendChild(el));

    document.body.appendChild(root);
    scene.__g1v14Dom={root,bg,kid,paste,brush,cloth,clipper,hand};
    scene.v14Art='external-dom-assets-only-r2';

    const sync=()=>{
      if(!scene.sys?.isActive() || scene.scene?.key!=='G1R2') return;
      hideLegacy(scene);
      const canvas=scene.game?.canvas;
      if(!canvas) return;
      const r=canvas.getBoundingClientRect();
      Object.assign(root.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});

      // External visual props follow the real Phaser mechanic objects 1:1.
      const p=scene.paste||{x:285,y:500};
      const b=scene.brush||{x:395,y:500};
      const c=scene.cloth||{x:1050,y:305};
      const cl=scene.clipper||{x:1080,y:500};
      place(paste,p.x,p.y,108,108,-8);
      place(brush,b.x,b.y,118,118,-18);
      place(cloth,c.x,c.y,108,108,6);
      place(clipper,cl.x,cl.y,108,108,24);
      place(hand,scene.hand?.x||1005,scene.hand?.y||430,205,205,-10);
      hand.style.display=(scene.step>=3)?'block':'none';

      // Keep visible objects and mechanic hit areas aligned.
      if(scene.mouth?.active) scene.mouth.setPosition(820,350);
      if(scene.face?.active) scene.face.setPosition(820,350);
    };
    sync();
    scene.events.on('postupdate',sync);
    scene.scale?.on?.('resize',sync);
    scene.events.once('shutdown',()=>{root.remove();});
    scene.events.once('destroy',()=>{root.remove();});

    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      background:{name:'Tiny Treats - Bubbly Bathroom',author:'Tiny Treats',license:'CC0'},
      character:{name:'Red Hat Boy',author:'pzUH / GameArt2D',license:'CC0'},
      props:{source:'SVGRepo',kind:'existing external SVG assets'},
      version:'v14.0',generatedVisualAssets:0,rendering:'DOM img only'
    };
  }

  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    priorCreate.call(this);
    this.time.delayedCall(350,()=>mount(this));
    this.time.delayedCall(1100,()=>{ if(this.scene?.key==='G1R2' && !this.__g1v14Dom) mount(this); });
  };

  window.__ADUGAME_G1_BENCHMARK_ART_V14__={loaded:true,version:'14.0',externalAssetsOnly:true,generatedVisualAssets:0};
})();
