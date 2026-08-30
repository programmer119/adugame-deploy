// Prevent decorative room labels from leaking across house floor changes.
(() => {
  const clean=scene=>{
    scene.children.list.filter(o=>o?.type==='Text'&&o.text==='작업대'&&o.name!=='v6_house_dynamic_label').forEach(o=>o.destroy());
  };
  if(typeof G2R1!=='undefined'){
    [G2R1,G2R2,G2R3].forEach(K=>{
      const oldCreate=K.prototype.create;K.prototype.create=function(){oldCreate.call(this);clean(this);};
      const oldShow=K.prototype.showFloor;K.prototype.showFloor=function(f,initial=false){const r=oldShow.call(this,f,initial);this.time?.delayedCall?.(5,()=>clean(this));return r;};
    });
  }
  window.__ADUGAME_VISUAL_V6_DYNAMIC_CLEAN__={loaded:true,version:'6.2.4',noRoomLabelLeak:true};
})();
