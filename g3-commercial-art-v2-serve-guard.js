// ADUGAME G3 commercial-art v2.34 — ready-order input invariant.
// A valid, unlocked order must keep an actionable serve button until the real serve path begins.
(() => {
  if(typeof CraftRound!=='function')return;
  const ready=s=>!!s&&!s.roundComplete&&!s.interactionLocked&&!!s.mixed&&s.chosen?.color===s.order?.color&&!!s.order?.deco&&s.chosen?.decos?.includes(s.order.deco)&&(!s.order?.container||s.chosen?.container===s.order.container);

  // The real serve path intentionally disables the button before setting interactionLocked.
  // Mark only that synchronous call as allowed so visual/guidance wrappers cannot steal the hit target.
  const priorServe=CraftRound.prototype.serve;
  CraftRound.prototype.serve=function(...args){
    this.__g3ServeDisableAllowed=true;
    try{return priorServe.apply(this,args);}finally{this.__g3ServeDisableAllowed=false;}
  };

  function attach(scene){
    if(scene.__g3ServeReadyGuard||!scene.scene?.key?.startsWith('G3R'))return;
    scene.__g3ServeReadyGuard=true;
    const guardEnabledProperty=live=>{
      const input=live?.input;
      if(!input||input.__g3ReadyEnabledGuard)return;
      const desc=Object.getOwnPropertyDescriptor(input,'enabled');
      if(desc&&desc.configurable===false)return;
      let raw=desc?.get?!!desc.get.call(input):input.enabled!==false;
      try{
        Object.defineProperty(input,'enabled',{
          configurable:true,enumerable:true,
          get(){return ready(scene)&&!scene.__g3ServeDisableAllowed?true:raw;},
          set(v){
            if(v===false&&ready(scene)&&!scene.__g3ServeDisableAllowed){
              scene.g3ServeReadyBlockedEnabledCount=(scene.g3ServeReadyBlockedEnabledCount||0)+1;
              scene.g3ServeReadyLastBlockedAt=scene.time?.now||0;raw=true;return;
            }
            raw=!!v;
          }
        });
        input.__g3ReadyEnabledGuard=true;
      }catch(_){ }
    };
    const b=scene.serveButton;
    if(b&&!b.__g3DisableGuarded){
      b.__g3DisableGuarded=true;
      if(typeof b.disableInteractive==='function'){
        const originalDisable=b.disableInteractive.bind(b);
        b.disableInteractive=function(...args){
          if(ready(scene)&&!scene.__g3ServeDisableAllowed){
            scene.g3ServeReadyBlockedDisableCount=(scene.g3ServeReadyBlockedDisableCount||0)+1;
            scene.g3ServeReadyLastBlockedAt=scene.time?.now||0;
            if(!this.input)this.setInteractive({useHandCursor:true});
            guardEnabledProperty(this);if(this.input)this.input.enabled=true;return this;
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
      guardEnabledProperty(live);
      if(ready(scene)&&live.visible!==false&&live.input&&!live.input.enabled){
        live.input.enabled=true;
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
      scene.debugState=function(){return {...priorDebug(),serveReadyInvariant:ready(scene),serveInputEnabled:!!scene.serveButton?.input?.enabled,serveReadyRepairCount:scene.g3ServeReadyRepairCount||0,serveReadyBlockedDisableCount:scene.g3ServeReadyBlockedDisableCount||0,serveReadyBlockedRemoveCount:scene.g3ServeReadyBlockedRemoveCount||0,serveReadyBlockedEnabledCount:scene.g3ServeReadyBlockedEnabledCount||0,serveReadyLastRepairAt:scene.g3ServeReadyLastRepairAt||0,serveReadyLastBlockedAt:scene.g3ServeReadyLastBlockedAt||0};};
    }
    const cleanup=()=>{
      scene.game?.events?.off?.('poststep',sync);
      scene.__g3ServeReadyGuard=false;
    };
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(20,()=>attach(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V2_SERVE_GUARD__={loaded:true,version:'2.34',readyOrderInputInvariant:true,blockedForeignDisable:true,blockedForeignRemove:true,guardedEnabledProperty:true,realServeDisableAllowed:true,postStepInvariant:true,generatedVisualAssets:0};
})();