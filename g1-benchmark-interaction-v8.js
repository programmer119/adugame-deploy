// G1 benchmark interaction hardening v8.6
// Late visual rebuilding makes Container/GameObject pointer hit testing unreliable in Chromium.
// Use the scene pointer stream itself and test the visible activity bounds mathematically. This keeps
// mouse/touch input 1:1 with the drawn scene while avoiding Phaser GameObject hit-area edge cases.
(() => {
  if (typeof G1R1 !== 'function') return;

  function attach(scene){
    if(scene.scene?.key!=='G1R1' || !scene.soap || scene.__g1v8PointerDragAttached) return;
    const soap=scene.soap;
    scene.__g1v8PointerDragAttached=true;

    scene.children.list.filter(o=>o?.name==='g1v8_soap_target').forEach(o=>o.destroy());
    if(soap.input) soap.disableInteractive();

    // Visible halo stays under the soap only as an affordance; it is deliberately non-interactive.
    const target=scene.add.ellipse(soap.x,soap.y+3,140,110,0xffa9c2,.10)
      .setStrokeStyle(3,0xffffff,.46)
      .setDepth(10.8)
      .setName('g1v8_soap_target');
    target.semanticLabel='비누';
    target.visualIdentity='illustrated-target';
    scene.soapInputTarget=target;

    let pointerId=null;
    const insideSoap=p=>{
      const dx=(p.x-soap.x)/70;
      const dy=(p.y-soap.y)/55;
      return dx*dx+dy*dy<=1;
    };
    const insideHands=p=>{
      const h=scene.hands;
      if(!h) return false;
      return Math.abs(p.x-h.x)<=115 && Math.abs(p.y-h.y)<=72;
    };

    scene.input.on('pointerdown',p=>{
      if(pointerId!==null || scene.interactionLocked || scene.roundComplete || scene.step!==2 || !insideSoap(p)) return;
      scene.__g1SoapPointerDown=(scene.__g1SoapPointerDown||0)+1;
      pointerId=p.id;
      scene.markMeaningfulInput?.('drag_start',{id:'soap'});
      soap.setDepth(1000);target.setDepth(999);
    });

    scene.input.on('pointermove',p=>{
      if(pointerId!==null && p.id===pointerId && p.isDown){
        scene.__g1SoapPointerMove=(scene.__g1SoapPointerMove||0)+1;
        soap.setPosition(p.x,p.y);
        target.setPosition(p.x,p.y+3);
        return;
      }
      if(scene.step!==3 || !p.isDown) return;
      if(!insideHands(p)){
        scene.lastScrub=null;
        return;
      }
      scene.__g1ScrubPointerMove=(scene.__g1ScrubPointerMove||0)+1;
      scene.scrub(p);
    });

    scene.input.on('pointerup',p=>{
      if(pointerId!==null && p.id===pointerId){
        pointerId=null;
        scene.__g1SoapPointerUp=(scene.__g1SoapPointerUp||0)+1;
        scene.dropSoap(soap);
        scene.time.delayedCall(230,()=>{
          if(!soap.active || !target.active) return;
          target.setPosition(soap.x,soap.y+3).setDepth(10.8);
          soap.setDepth(11);
        });
      }
      if(scene.step===3) scene.lastScrub=null;
    });

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
