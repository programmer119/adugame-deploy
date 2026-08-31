// G1 benchmark interaction hardening v8.3
// Late visual rebuilding makes Container-level pointer hit testing unreliable in Phaser.
// Use a visible scene-native halo exactly under the soap as the real pointer target, then move
// the soap and target together. The user still grabs the visible soap region 1:1 on mouse/touch.
(() => {
  if (typeof G1R1 !== 'function') return;

  function attach(scene){
    if(scene.scene?.key!=='G1R1' || !scene.soap || scene.__g1v8PointerDragAttached) return;
    const soap=scene.soap;
    scene.__g1v8PointerDragAttached=true;

    scene.children.list.filter(o=>o?.name==='g1v8_soap_target').forEach(o=>o.destroy());
    if(soap.input) soap.disableInteractive();

    // A soft oval is part of the scene art, not a hidden card/overlay. Its 140x110 target encloses
    // the actual 96x68 soap drawing and is centered on the same coordinates.
    const target=scene.add.ellipse(soap.x,soap.y+3,140,110,0xffa9c2,.10)
      .setStrokeStyle(3,0xffffff,.46)
      .setDepth(10.8)
      .setName('g1v8_soap_target')
      .setInteractive(new Phaser.Geom.Ellipse(70,55,140,110),Phaser.Geom.Ellipse.Contains);
    target.semanticLabel='비누';
    target.visualIdentity='illustrated-target';

    let pointerId=null;
    target.on('pointerdown',p=>{
      if(scene.interactionLocked || scene.roundComplete) return;
      pointerId=p.id;
      scene.__g1SoapPointerDown=(scene.__g1SoapPointerDown||0)+1;
      scene.markMeaningfulInput?.('drag_start',{id:'soap'});
      soap.setDepth(1000);target.setDepth(999);
    });

    scene.input.on('pointermove',p=>{
      if(pointerId===null || p.id!==pointerId || !p.isDown) return;
      soap.setPosition(p.x,p.y);
      target.setPosition(p.x,p.y+3);
    });

    scene.input.on('pointerup',p=>{
      if(pointerId===null || p.id!==pointerId) return;
      pointerId=null;
      scene.__g1SoapPointerUp=(scene.__g1SoapPointerUp||0)+1;
      scene.dropSoap(soap);
      scene.time.delayedCall(230,()=>{
        if(!soap.active || !target.active) return;
        target.setPosition(soap.x,soap.y+3).setDepth(10.8);
        soap.setDepth(11);
      });
    });

    // Keep the target synchronized if a legacy return/snap tween moves the soap.
    scene.time.addEvent({delay:40,loop:true,callback:()=>{
      if(!target.active || pointerId!==null || !soap.active) return;
      if(Math.abs(target.x-soap.x)>2 || Math.abs((target.y-3)-soap.y)>2) target.setPosition(soap.x,soap.y+3);
    }});
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    priorCreate.call(this);
    this.time.delayedCall(140,()=>attach(this));
  };
})();
