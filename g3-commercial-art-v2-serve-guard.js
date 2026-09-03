// ADUGAME G3 commercial-art v2.35 — ready-order input invariant.
// A valid, unlocked order must keep an actionable serve button until the real serve path begins.
(() => {
  if(typeof CraftRound!=='function')return;
  const ready=s=>!!s&&!s.roundComplete&&!s.interactionLocked&&!!s.mixed&&s.chosen?.color===s.order?.color&&!!s.order?.deco&&s.chosen?.decos?.includes(s.order.deco)&&(!s.order?.container||s.chosen?.container===s.order.container);

  // The real serve path intentionally disables the button before setting interactionLocked.
  // Mark only that synchronous call as allowed so all other wrappers remain unable to steal the hit target.
  const priorServe=CraftRound.prototype.serve;
  CraftRound.prototype.serve=function(...args){
    this.__g3ServeDisableAllowed=true;
    try{return priorServe.apply(this,args);}finally{this.__g3ServeDisableAllowed=false;}
  };

  function attach(scene){
    if(scene.__g3ServeReadyGuard||!scene.scene?.key?.startsWith('G3R'))return;
    scene.__g3ServeReadyGuard=true;
    const b=scene.serveButton;

    // Phaser may replace the InteractiveObject when setInteractive() is called. Guard the
    // GameObject.input property itself so every replacement is normalized before any consumer reads it.
    if(b&&!b.__g3InputPropertyGuarded){
      b.__g3InputPropertyGuarded=true;
      let rawInput=b.input||null;
      try{
        Object.defineProperty(b,'input',{
          configurable:true,enumerable:true,
          get(){
            if(ready(scene)&&!scene.__g3ServeDisableAllowed&&rawInput){
              if(rawInput.enabled===false){
                scene.g3ServeReadyReadRepairCount=(scene.g3ServeReadyReadRepairCount||0)+1;
                scene.g3ServeReadyLastRepairAt=scene.time?.now||0;
              }
              rawInput.enabled=true;
            }
            return rawInput;
          },
          set(v){
            rawInput=v||null;
            if(ready(scene)&&!scene.__g3ServeDisableAllowed&&rawInput){
              rawInput.enabled=true;
              scene.g3ServeReadyInputReplacementCount=(scene.g3ServeReadyInputReplacementCount||0)+1;
              scene.g3ServeReadyLastRepairAt=scene.time?.now||0;
            }
          }
        });
      }catch(_){ }
    }

    if(b&&!b.__g3DisableGuarded){
      b.__g3DisableGuarded=true;
      if(typeof b.disableInteractive==='function'){
        const originalDisable=b.disableInteractive.bind(b);
        b.disableInteractive=function(...args){
          if(ready(scene)&&!scene.__g3ServeDisableAllowed){
            scene.g3ServeReadyBlockedDisableCount=(scene.g3ServeReadyBlockedDisableCount||0)+1;
            scene.g3ServeReadyLastBlockedAt=scene.time?.now||0;
            const i=this.input;if(i)i.enabled=true;else this.setInteractive({useHandCursor:true});
            return this;
          }
          return originalDisable(...args);
        };
      }
      if(typeof b.removeInteractive==='function'){
        const originalRemove=b.removeInteractive.bind(b);
        b.removeInteractive=function(...args){
          if(ready(scene)&&!scene.__g3ServeDisableAllowed){
            scene.g3ServeReadyBlockedRemoveCount=(scene.g3ServeReadyBlockedRemoveCount||0)+1;
            scene.g3ServeReadyLastBlockedAt=scene.time?.now||0;return this;
          }
          return originalRemove(...args);
        };
      }
    }

    const sync=()=>{
      if(!scene.sys?.isActive?.())return;
      const live=scene.serveButton;if(!live)return;
      if(ready(scene)&&live.visible!==false&&!live.input){
        live.setInteractive({useHandCursor:true});
        scene.g3ServeReadyRepairCount=(scene.g3ServeReadyRepairCount||0)+1;
        scene.g3ServeReadyLastRepairAt=scene.time?.now||0;
      }
      const input=live.input;
      if(ready(scene)&&live.visible!==false&&input&&!input.enabled){
        input.enabled=true;
        scene.g3ServeReadyRepairCount=(scene.g3ServeReadyRepairCount||0)+1;
        scene.g3ServeReadyLastRepairAt=scene.time?.now||0;
      }
    };
    scene.events.on('postupdate',sync);
    scene.game?.events?.on?.('poststep',sync);
    sync();

    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g3ServeDebugWrapped){
      scene.__g3ServeDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),serveReadyInvariant:ready(scene),serveInputEnabled:!!scene.serveButton?.input?.enabled,serveReadyRepairCount:scene.g3ServeReadyRepairCount||0,serveReadyReadRepairCount:scene.g3ServeReadyReadRepairCount||0,serveReadyInputReplacementCount:scene.g3ServeReadyInputReplacementCount||0,serveReadyBlockedDisableCount:scene.g3ServeReadyBlockedDisableCount||0,serveReadyBlockedRemoveCount:scene.g3ServeReadyBlockedRemoveCount||0,serveReadyLastRepairAt:scene.g3ServeReadyLastRepairAt||0,serveReadyLastBlockedAt:scene.g3ServeReadyLastBlockedAt||0};};
    }
    const cleanup=()=>{
      scene.game?.events?.off?.('poststep',sync);
      scene.__g3ServeReadyGuard=false;
    };
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(20,()=>attach(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V2_SERVE_GUARD__={loaded:true,version:'2.35',readyOrderInputInvariant:true,gameObjectInputPropertyGuard:true,inputReplacementSafe:true,blockedForeignDisable:true,blockedForeignRemove:true,realServeDisableAllowed:true,postStepInvariant:true,generatedVisualAssets:0};
})();