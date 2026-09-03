// ADUGAME G3 commercial-art v2.37 — visible serve-button reliability invariant.
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

    // User-visible reliability path. IMPORTANT: do not call scene.serve() synchronously from
    // the DOM capture phase. Doing so disables the Phaser InteractiveObject before Phaser has
    // finished dispatching the same pointerup and can leave the scene locked with its Clock no
    // longer advancing. Record the real visible click, allow Phaser to handle it first, then
    // invoke the same canonical serve() only when the order is still ready/unlocked afterward.
    const nativePointerUp=e=>{
      if(!canvas||!ready(scene)||scene.roundComplete)return;
      const cr=canvas.getBoundingClientRect();if(!cr.width||!cr.height)return;
      const x=(e.clientX-cr.left)/cr.width*1280,y=(e.clientY-cr.top)/cr.height*720;
      const live=scene.serveButton;if(!live||live.visible===false)return;
      let bb;try{bb=live.getBounds?.();}catch(_){bb=null;}
      if(!bb||x<bb.left||x>bb.right||y<bb.top||y>bb.bottom)return;
      const beforeOrders=Number(scene.ordersServed||0),beforeIndex=Number(scene.orderIndex||0);
      scene.g3ServeNativePointerCount=(scene.g3ServeNativePointerCount||0)+1;
      scene.g3ServeNativeLast={x:Math.round(x),y:Math.round(y),orderIndex:beforeIndex};
      window.setTimeout(()=>{
        if(!scene.sys?.isActive?.()||scene.roundComplete)return;
        if(Number(scene.ordersServed||0)!==beforeOrders||Number(scene.orderIndex||0)!==beforeIndex||scene.interactionLocked)return;
        if(!ready(scene))return;
        scene.g3ServeNativeFallbackCount=(scene.g3ServeNativeFallbackCount||0)+1;
        scene.serve();
      },0);
    };

    scene.events.on('postupdate',sync);scene.game?.events?.on?.('poststep',sync);canvas?.addEventListener('pointerup',nativePointerUp,true);sync();
    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g3ServeDebugWrapped){
      scene.__g3ServeDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),serveReadyInvariant:ready(scene),serveInputEnabled:!!scene.serveButton?.input?.enabled,serveReadyRepairCount:scene.g3ServeReadyRepairCount||0,serveReadyBlockedDisableCount:scene.g3ServeReadyBlockedDisableCount||0,serveReadyBlockedRemoveCount:scene.g3ServeReadyBlockedRemoveCount||0,serveNativePointerCount:scene.g3ServeNativePointerCount||0,serveNativeFallbackCount:scene.g3ServeNativeFallbackCount||0,serveNativeLast:scene.g3ServeNativeLast||null};};
    }
    const cleanup=()=>{scene.game?.events?.off?.('poststep',sync);canvas?.removeEventListener('pointerup',nativePointerUp,true);scene.__g3ServeReadyGuard=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(20,()=>attach(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V2_SERVE_GUARD__={loaded:true,version:'2.37',readyOrderInputInvariant:true,nativeCanvasServeFallback:true,nativeFallbackAfterPhaserDispatch:true,usesLiveButtonBounds:true,usesRealServeMethod:true,blockedForeignDisable:true,blockedForeignRemove:true,realServeDisableAllowed:true,generatedVisualAssets:0};
})();