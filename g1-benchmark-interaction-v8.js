// G1 benchmark interaction hardening v8.8
// Late visual rebuilding makes Container/GameObject pointer hit testing unreliable in Chromium.
// Use the scene pointer stream itself and test visible activity bounds mathematically. Dedicated
// transparent hit zones remain for hint/actionability QA while real mouse/touch behavior is scene-level.
(() => {
  if (typeof G1R1 !== 'function') return;

  function attach(scene){
    if(scene.scene?.key!=='G1R1' || !scene.soap || scene.__g1v8PointerDragAttached) return;
    const soap=scene.soap;
    scene.__g1v8PointerDragAttached=true;

    scene.children.list.filter(o=>['g1v8_soap_target','g1v8_faucet_hit'].includes(o?.name)).forEach(o=>o.destroy());
    if(soap.input) soap.disableInteractive();
    if(scene.faucet?.input) scene.faucet.disableInteractive();

    const target=scene.add.ellipse(soap.x,soap.y+3,140,110,0xffa9c2,.10)
      .setStrokeStyle(3,0xffffff,.46)
      .setDepth(10.8)
      .setName('g1v8_soap_target');
    target.semanticLabel='비누';
    target.visualIdentity='illustrated-target';
    scene.soapInputTarget=target;

    const faucet=scene.faucet;
    const faucetHit=scene.add.zone(faucet?.x??400,faucet?.y??300,180,180)
      .setInteractive({useHandCursor:true})
      .setDepth(120)
      .setName('g1v8_faucet_hit');
    faucetHit.semanticLabel='수도꼭지';
    faucetHit.visualIdentity='interaction-surface';
    scene.faucetInputTarget=faucetHit;

    let soapPointerId=null;
    let scrubPointerId=null;
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
    const insideFaucet=p=>{
      const f=scene.faucet;
      if(!f) return false;
      return Math.abs(p.x-f.x)<=90 && Math.abs(p.y-f.y)<=90;
    };

    scene.input.on('pointerdown',p=>{
      if(scene.interactionLocked || scene.roundComplete) return;
      if([1,4].includes(scene.step) && insideFaucet(p)){
        scene.__g1FaucetPointerDown=(scene.__g1FaucetPointerDown||0)+1;
        scene.tapFaucet();
        return;
      }
      if(scene.step===3 && scrubPointerId===null && insideHands(p)){
        scrubPointerId=p.id;
        scene.__g1ScrubPointerDown=(scene.__g1ScrubPointerDown||0)+1;
        scene.lastScrub=null;
        scene.markMeaningfulInput?.('scrub_start',{id:'hands'});
        return;
      }
      if(soapPointerId!==null || scene.step!==2 || !insideSoap(p)) return;
      scene.__g1SoapPointerDown=(scene.__g1SoapPointerDown||0)+1;
      soapPointerId=p.id;
      scene.markMeaningfulInput?.('drag_start',{id:'soap'});
      soap.setDepth(1000);target.setDepth(999);
    });

    scene.input.on('pointermove',p=>{
      if(soapPointerId!==null && p.id===soapPointerId){
        scene.__g1SoapPointerMove=(scene.__g1SoapPointerMove||0)+1;
        soap.setPosition(p.x,p.y);
        target.setPosition(p.x,p.y+3);
        return;
      }
      if(scene.step!==3 || scrubPointerId===null || p.id!==scrubPointerId) return;
      if(!insideHands(p)){
        scene.lastScrub=null;
        return;
      }
      scene.__g1ScrubPointerMove=(scene.__g1ScrubPointerMove||0)+1;
      // G1R1.scrub only needs logical x/y plus a held-pointer flag. The explicit pointer id above
      // is the source of truth for the held gesture; force isDown here so Phaser's transient flag
      // cannot discard a real mouse/touch drag after late visual restyling.
      scene.scrub({x:p.x,y:p.y,isDown:true});
    });

    scene.input.on('pointerup',p=>{
      if(soapPointerId!==null && p.id===soapPointerId){
        soapPointerId=null;
        scene.__g1SoapPointerUp=(scene.__g1SoapPointerUp||0)+1;
        scene.dropSoap(soap);
        scene.time.delayedCall(230,()=>{
          if(!soap.active || !target.active) return;
          target.setPosition(soap.x,soap.y+3).setDepth(10.8);
          soap.setDepth(11);
        });
      }
      if(scrubPointerId!==null && p.id===scrubPointerId){
        scrubPointerId=null;
        scene.__g1ScrubPointerUp=(scene.__g1ScrubPointerUp||0)+1;
        scene.lastScrub=null;
      }
    });

    scene.time.addEvent({delay:40,loop:true,callback:()=>{
      if(target.active && soapPointerId===null && soap.active && (Math.abs(target.x-soap.x)>2 || Math.abs((target.y-3)-soap.y)>2)) target.setPosition(soap.x,soap.y+3);
      if(faucetHit.active && faucet?.active && (Math.abs(faucetHit.x-faucet.x)>2 || Math.abs(faucetHit.y-faucet.y)>2)) faucetHit.setPosition(faucet.x,faucet.y);
    }});
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    priorCreate.call(this);
    this.time.delayedCall(140,()=>attach(this));
  };
})();
