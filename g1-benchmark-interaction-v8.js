// G1 benchmark interaction hardening v8.9
// Late visual rebuilding makes Container/GameObject hit testing unreliable in Chromium.
// Faucet/soap use scene-level logical hit tests. Hand scrubbing uses the canvas DOM Pointer Events
// stream directly, converted back to the 1280x720 logical game space, so mouse and touch share one
// deterministic held-gesture path independent of Phaser's transient pointermove/isDown behavior.
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
      if(soapPointerId!==null || scene.step!==2 || !insideSoap(p)) return;
      scene.__g1SoapPointerDown=(scene.__g1SoapPointerDown||0)+1;
      soapPointerId=p.id;
      scene.markMeaningfulInput?.('drag_start',{id:'soap'});
      soap.setDepth(1000);target.setDepth(999);
    });

    scene.input.on('pointermove',p=>{
      if(soapPointerId===null || p.id!==soapPointerId) return;
      scene.__g1SoapPointerMove=(scene.__g1SoapPointerMove||0)+1;
      soap.setPosition(p.x,p.y);
      target.setPosition(p.x,p.y+3);
    });

    scene.input.on('pointerup',p=>{
      if(soapPointerId===null || p.id!==soapPointerId) return;
      soapPointerId=null;
      scene.__g1SoapPointerUp=(scene.__g1SoapPointerUp||0)+1;
      scene.dropSoap(soap);
      scene.time.delayedCall(230,()=>{
        if(!soap.active || !target.active) return;
        target.setPosition(soap.x,soap.y+3).setDepth(10.8);
        soap.setDepth(11);
      });
    });

    // DOM-level held gesture for the actual hand-scrub activity.
    const canvas=scene.game?.canvas;
    let scrubPointerId=null;
    const logical=e=>{
      const r=canvas.getBoundingClientRect();
      return {
        x:(e.clientX-r.left)*1280/Math.max(1,r.width),
        y:(e.clientY-r.top)*720/Math.max(1,r.height)
      };
    };
    const onDomDown=e=>{
      if(scene.step!==3 || scene.interactionLocked || scene.roundComplete || scrubPointerId!==null) return;
      const p=logical(e);if(!insideHands(p))return;
      scrubPointerId=e.pointerId;
      scene.__g1ScrubPointerDown=(scene.__g1ScrubPointerDown||0)+1;
      scene.lastScrub=null;
      scene.markMeaningfulInput?.('scrub_start',{id:'hands'});
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      e.preventDefault();
    };
    const onDomMove=e=>{
      if(scrubPointerId===null || e.pointerId!==scrubPointerId || scene.step!==3)return;
      const p=logical(e);
      if(!insideHands(p)){scene.lastScrub=null;return;}
      scene.__g1ScrubPointerMove=(scene.__g1ScrubPointerMove||0)+1;
      scene.scrub({x:p.x,y:p.y,isDown:true});
      e.preventDefault();
    };
    const endDom=e=>{
      if(scrubPointerId===null || e.pointerId!==scrubPointerId)return;
      scrubPointerId=null;
      scene.__g1ScrubPointerUp=(scene.__g1ScrubPointerUp||0)+1;
      scene.lastScrub=null;
      try{canvas.releasePointerCapture(e.pointerId);}catch(_){}
    };
    if(canvas){
      canvas.addEventListener('pointerdown',onDomDown,{passive:false});
      canvas.addEventListener('pointermove',onDomMove,{passive:false});
      canvas.addEventListener('pointerup',endDom,{passive:false});
      canvas.addEventListener('pointercancel',endDom,{passive:false});
      scene.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
        canvas.removeEventListener('pointerdown',onDomDown);
        canvas.removeEventListener('pointermove',onDomMove);
        canvas.removeEventListener('pointerup',endDom);
        canvas.removeEventListener('pointercancel',endDom);
      });
    }

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
