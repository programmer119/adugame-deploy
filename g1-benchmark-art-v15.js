// ADUGAME G1R2 v15.1 — existing authored assets only; ZERO generated/drawn visuals.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC={
    bathroom:'https://img.itch.zone/aW1nLzIzODI0MTMxLnBuZw==/original/7Lpf5J.png',
    bathroomFallback:'https://img.itch.zone/aW1nLzE3MzI0NjU3LnBuZw==/original/QX1mok.png',
    toothbrush:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/1FAA5.svg',
    toothpaste:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/1F9F4.svg',
    sponge:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/1F9FD.svg',
    clipper:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/2702.svg',
    hand:'https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/270B.svg'
  };
  function apply(scene){
    const dom=scene?.__g1v14Dom;
    if(scene?.scene?.key!=='G1R2'||!dom?.root)return false;
    dom.bg.src=SRC.bathroom;
    dom.bg.onerror=()=>{ if(dom.bg.src!==SRC.bathroomFallback) dom.bg.src=SRC.bathroomFallback; };
    dom.paste.src=SRC.toothpaste;
    dom.brush.src=SRC.toothbrush;
    dom.cloth.src=SRC.sponge;
    dom.clipper.src=SRC.clipper;
    dom.hand.src=SRC.hand;
    dom.kid.style.height='58%';
    dom.kid.style.width='auto';
    dom.kid.style.left='68%';
    dom.kid.style.top='61%';
    dom.kid.style.transform='translate(-50%,-50%)';
    [dom.paste,dom.brush,dom.cloth,dom.clipper].forEach(el=>el.style.filter='drop-shadow(0 7px 7px rgba(20,40,70,.16))');
    scene.v15Art='existing-assets-only-r2';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={background:{name:'Tiny Treats - Bubbly Bathroom scene',author:'Tiny Treats',license:'CC0'},character:{name:'Red Hat Boy',author:'pzUH / GameArt2D',license:'CC0'},props:{name:'OpenMoji existing SVG assets',license:'CC BY-SA 4.0'},generatedVisualAssets:0,version:'v15.1',rendering:'existing external images only'};
    return true;
  }
  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){priorCreate.call(this);const tryApply=()=>{if(!apply(this))this.time.delayedCall(120,tryApply);};this.time.delayedCall(430,tryApply);};
  window.__ADUGAME_G1_BENCHMARK_ART_V15__={loaded:true,version:'15.1',generatedVisualAssets:0};
})();
