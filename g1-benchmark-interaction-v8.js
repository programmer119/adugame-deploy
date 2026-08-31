// G1 benchmark interaction hardening v8.2
// Phaser's drag plugin can lose the rebuilt Container after late visual restyling.
// Keep the visible soap itself as the hit target and drive it directly from pointer events.
(() => {
  if (typeof G1R1 !== 'function') return;

  function attach(scene){
    if(scene.scene?.key!=='G1R1' || !scene.soap || scene.__g1v8PointerDragAttached) return;
    const soap=scene.soap;
    scene.__g1v8PointerDragAttached=true;

    soap.setSize(136,104);
    soap.setInteractive(new Phaser.Geom.Rectangle(-68,-52,136,104),Phaser.Geom.Rectangle.Contains);
    scene.input.setDraggable(soap,false);

    let pointerId=null;
    soap.on('pointerdown',p=>{
      if(scene.interactionLocked || scene.roundComplete) return;
      pointerId=p.id;
      scene.markMeaningfulInput?.('drag_start',{id:'soap'});
      soap.setDepth(1000);
    });

    scene.input.on('pointermove',p=>{
      if(pointerId===null || p.id!==pointerId || !p.isDown) return;
      soap.setPosition(p.x,p.y);
    });

    scene.input.on('pointerup',p=>{
      if(pointerId===null || p.id!==pointerId) return;
      pointerId=null;
      scene.dropSoap(soap);
      scene.time.delayedCall(220,()=>{ if(soap.active) soap.setDepth(11); });
    });
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    priorCreate.call(this);
    this.time.delayedCall(130,()=>attach(this));
  };
})();
