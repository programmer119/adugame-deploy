// ADUGAME strict one-glance icon disambiguation.
// Different portable object kinds must not rely on the same pictogram.
(() => {
  const DISTINCT={
    sparewheel:'🛞➕',
    cloth:'🧵',
    washcloth:'🧼💧',
    pump:'🛞💨',
    hairdryer:'♨️💨',
    rake:'🌿🧹',
    picnic:'🧺🌳',
    towel:'🛁🧻',
    napkin:'🍽️◻️',
    cereal:'🥣🌾',
    bottle:'🍶',
    detergent:'🧴🫧',
    toothpaste:'🦷🧴',
    shampoo:'🧴🚿',
    slipper:'🥿'
  };
  const glyphCount=s=>Array.from(String(s||'')).filter(c=>c!=='\ufe0f').length;
  function apply(scene){
    for(const o of scene.items||[]){
      const icon=DISTINCT[o.kind];if(!icon)continue;
      const pic=o.list?.filter(x=>x?.type==='Text').find(x=>Number(x.y)<0);
      if(pic){
        if(String(pic.text||'')!==icon)pic.setText(icon);
        const target=glyphCount(icon)>1?20:31;
        if(Number.parseFloat(pic.style?.fontSize)!==target)pic.setFontSize(`${target}px`);
      }
      o.pictogram=icon;
    }
  }
  function patch(Klass){
    const oldCreate=Klass.prototype.create;
    Klass.prototype.create=function(){
      oldCreate.call(this);
      apply(this);
      // visual-v6-polish runs in an outer create wrapper and intentionally enlarges shelf art.
      // Re-apply once after that wrapper has finished so composite pictograms fit the strict slot
      // without shrinking the single-glyph icons or weakening the QA width limit.
      this.events?.once?.('postupdate',()=>apply(this));
    };
  }
  if(typeof G2R1!=='undefined')[G2R1,G2R2,G2R3].forEach(patch);
  window.__ADUGAME_CLARITY_ICONS_V5__={loaded:true,version:'5.2.5',uniquePortableKinds:true,remapped:Object.keys(DISTINCT).length,compositeShelfFontPx:20,singleShelfFontPx:31,postPolishSync:true};
})();
