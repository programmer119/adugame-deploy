// ADUGAME G3 commercial-art v2.36 — visible serve-button reliability invariant.
// A valid unlocked order must submit when the user releases on the visible serve button,
// even if a legacy Phaser wrapper replaces/disables its internal InteractiveObject.
(() => {
  if(typeof CraftRound!=='function')return;
  const ready=s=>!!s&&!s.roundComplete&&!s.interactionLocked&&!!s.mixed&&s.chosen?.color===s.order?.color&&!!s.order?.deco&&s.chosen?.decos?.includes(s.order.deco)&&(!s.order?.container||s.chosen?.container===s.order.container);

  const priorServe=CraftRound.prototype.serve;
  CraftRound.prototype.serve=function(...args){
    this.__g3ServeDisableAllowed=true;
    try{return priorServe.apply(this,args);}finally{this.__g3ServeDisableAllowed=false;}
  };

  function attach(scene){
    if(scene.__g3ServeReadyGuard||!scene.scene?.key?.startsWith('G3R'))return;
    scene.__g3ServeReadyGuard=true;
    const b=scene.serveButton,canvas=scene.game?.canvas;

    const sync=()=>{
      if(!scene.sys?.isActive?.())return;
      const live=scene.serveButton;if(!live||scene.roundComplete)return;
      if(ready(scene)&&live.visible!==false&&!live.input){
        live.setInteractive({useHandCursor:true});
        scene.g3ServeReadyRepairCount=(scene.g3ServeReadyRepairCount||0)+1;
      }
      if(ready(scene)&&live.visible!==false&&live.input&&!live.input.enabled){
        live.input.enabled=true;
        scene.g3ServeReadyRepairCount=(scene.g3ServeReadyRepairCount||0)+1;
      }
    };

    if(b&&!b.__g3DisableGuarded){
      b.__g3DisableGuarded=true;
      if(typeof b.disableInteractive==='function'){
        const originalDisable=b.disableInteractive.bind(b);
        b.disableInteractive=function(...args){
          if(ready(scene)&&!scene.__g3ServeDisableAllowed){
            scene.g3ServeReadyBlockedDisableCount=(scene.g3ServeReadyBlockedDisableCount||0)+1;
            if(!this.input)this.setInteractive({useHandCursor:true});else this.input.enabled=true;
            return this;
          }
          return originalDisable(...args);
        };
      }
      if(typeof b.removeInteractive==='function'){
        const originalRemove=b.removeInteractive.bind(b);
        b.removeInteractive=function(...args){
          if(ready(scene)&&!scene.__g3ServeDisableAllowed){scene.g3ServeReadyBlockedRemoveCount=(scene.g3ServeReadyBlockedRemoveCount||0)+1;return this;}
          return originalRemove(...args);
        };
      }
    }

    // User-visible reliability path. It is tied to the same live Phaser button bounds and
    // invokes the same serve() method; it does not bypass order validation or scoring.
    const nativePointerUp=e=>{
      if(!canvas||!ready(scene)||scene.roundComplete)return;
      const cr=canvas.getBoundingClientRect();if(!cr.width||!cr.height)return;
      const x=(e.clientX-cr.left)/cr.width*1280,y=(e.clientY-cr.top)/cr.height*720;
      const live=scene.serveButton;if(!live||live.visible===false)return;
      let bb;try{bb=live.getBounds?.();}catch(_){bb=null;}
      if(!bb||x<bb.left||x>bb.right||y<bb.top||y>bb.bottom)return;
      scene.g3ServeNativePointerCount=(scene.g3ServeNativePointerCount||0)+1;
      scene.g3ServeNativeLast={x:Math.round(x),y:Math.round(y),orderIndex:scene.orderIndex||0};
      scene.serve();
    };

    scene.events.on('postupdate',sync);scene.game?.events?.on?.('poststep',sync);canvas?.addEventListener('pointerup',nativePointerUp,true);sync();
    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g3ServeDebugWrapped){
      scene.__g3ServeDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),serveReadyInvariant:ready(scene),serveInputEnabled:!!scene.serveButton?.input?.enabled,serveReadyRepairCount:scene.g3ServeReadyRepairCount||0,serveReadyBlockedDisableCount:scene.g3ServeReadyBlockedDisableCount||0,serveReadyBlockedRemoveCount:scene.g3ServeReadyBlockedRemoveCount||0,serveNativePointerCount:scene.g3ServeNativePointerCount||0,serveNativeLast:scene.g3ServeNativeLast||null};};
    }
    const cleanup=()=>{scene.game?.events?.off?.('poststep',sync);canvas?.removeEventListener('pointerup',nativePointerUp,true);scene.__g3ServeReadyGuard=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(20,()=>attach(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V2_SERVE_GUARD__={loaded:true,version:'2.36',readyOrderInputInvariant:true,nativeCanvasServeFallback:true,usesLiveButtonBounds:true,usesRealServeMethod:true,blockedForeignDisable:true,blockedForeignRemove:true,realServeDisableAllowed:true,generatedVisualAssets:0};
})();