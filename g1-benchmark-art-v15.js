// ADUGAME G1R2 v15.4 — existing authored assets only; ZERO generated/drawn visuals.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC={
    bathroom:'https://img.itch.zone/aW1hZ2UvMTg1MDI3Mi8xMDg2MDYwOS5wbmc=/347x500/arRLKm.png',
    kid:'https://raw.githubusercontent.com/Saba-Burduli/Petty/master/Petty/Petty/Resources/Characters/GameArt2DRedHatBoy/Frames/Idle/Idle_001.png',
    toothbrush:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/1FAA5.svg',
    toothpaste:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Toothpaste%20tube.svg?width=512',
    sponge:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/1F9FD.svg',
    clipper:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Nail%20clipper.svg?width=512',
    hand:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/270B.svg'
  };
  function fullscreen(scene){
    if(scene.__g1v15LayoutRestore)return;
    const topbar=document.querySelector('.topbar.playing');
    const shell=document.querySelector('.stage-shell');
    const canvas=scene.game?.canvas;
    const body=document.body;
    scene.__g1v15LayoutRestore={topbar,shell,canvas,body,topbarCss:topbar?.style.cssText||'',shellCss:shell?.style.cssText||'',canvasCss:canvas?.style.cssText||'',bodyCss:body?.style.cssText||''};
    if(topbar)topbar.style.display='none';
    if(shell){shell.style.height='100dvh';shell.style.minHeight='100dvh';shell.style.padding='0';shell.style.background='#f7f1df';}
    if(canvas){canvas.style.borderRadius='0';canvas.style.boxShadow='none';}
    if(body)body.style.overflow='hidden';
    const restore=()=>{
      const r=scene.__g1v15LayoutRestore;if(!r)return;
      if(r.topbar)r.topbar.style.cssText=r.topbarCss;
      if(r.shell)r.shell.style.cssText=r.shellCss;
      if(r.canvas)r.canvas.style.cssText=r.canvasCss;
      if(r.body)r.body.style.cssText=r.bodyCss;
      scene.__g1v15LayoutRestore=null;
    };
    scene.events.once('shutdown',restore);scene.events.once('destroy',restore);
  }
  function apply(scene){
    const dom=scene?.__g1v14Dom;
    if(scene?.scene?.key!=='G1R2'||!dom?.root)return false;
    fullscreen(scene);
    dom.root.style.borderRadius='0';
    dom.bg.src=SRC.bathroom;dom.bg.onerror=null;
    dom.kid.onerror=null;dom.kid.src=SRC.kid;
    dom.paste.src=SRC.toothpaste;dom.brush.src=SRC.toothbrush;dom.cloth.src=SRC.sponge;dom.clipper.src=SRC.clipper;dom.hand.src=SRC.hand;
    dom.kid.style.height='61%';dom.kid.style.width='auto';dom.kid.style.left='72%';dom.kid.style.top='60%';dom.kid.style.transform='translate(-50%,-50%)';
    [dom.paste,dom.brush,dom.cloth,dom.clipper].forEach(el=>el.style.filter='drop-shadow(0 7px 7px rgba(20,40,70,.16))');
    scene.v15Art='existing-assets-only-r2-2d';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      background:{name:'2D bathroom candidate D',source:'itch.io authored asset',license:'existing external asset'},
      character:{name:'Red Hat Boy',author:'pzUH / GameArt2D',license:'CC0'},
      props:{toothbrush:{source:'OpenMoji',license:'CC BY-SA 4.0'},sponge:{source:'OpenMoji',license:'CC BY-SA 4.0'},hand:{source:'OpenMoji',license:'CC BY-SA 4.0'},toothpaste:{name:'Toothpaste tube.svg',source:'Wikimedia Commons',license:'CC BY-SA 2.5'},clipper:{name:'Nail clipper.svg',source:'Wikimedia Commons/Openclipart',license:'CC0'}},
      generatedVisualAssets:0,version:'v15.4',rendering:'existing external 2D images only'
    };
    return true;
  }
  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){priorCreate.call(this);const tryApply=()=>{if(!apply(this))this.time.delayedCall(120,tryApply);};this.time.delayedCall(430,tryApply);};
  window.__ADUGAME_G1_BENCHMARK_ART_V15__={loaded:true,version:'15.4',generatedVisualAssets:0};
})();
