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
  function patch(Klass){
    const oldCreate=Klass.prototype.create;
    Klass.prototype.create=function(){
      oldCreate.call(this);
      for(const o of this.items||[]){
        const icon=DISTINCT[o.kind];if(!icon)continue;
        const pic=o.list?.filter(x=>x?.type==='Text').find(x=>Number(x.y)<0);
        if(pic){pic.setText(icon).setFontSize(glyphCount(icon)>1?'15px':'21px');}
        o.pictogram=icon;o.visualIdentity='pictogram';
      }
    };
  }
  if(typeof G2R1!=='undefined')[G2R1,G2R2,G2R3].forEach(patch);
  window.__ADUGAME_CLARITY_ICONS_V5__={loaded:true,version:'5.2.4',uniquePortableKinds:true,remapped:Object.keys(DISTINCT).length};
})();
