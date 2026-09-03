// ADUGAME G3 commercial-art v2.32 — ready-order input invariant.
// A valid, unlocked order must always finish the frame with an actionable live serve button.
(() => {
  if(typeof CraftRound!=='function')return;
  const ready=s=>!!s&&!s.roundComplete&&!s.interactionLocked&&!!s.mixed&&s.chosen?.color===s.order?.color&&!!s.order?.deco&&s.chosen?.decos?.includes(s.order.deco)&&(!s.order?.container||s.chosen?.container===s.order.container);
  function attach(scene){
    if(scene.__g3ServeReadyGuard||!scene.scene?.key?.startsWith('G3R'))return;
    scene.__g3ServeReadyGuard=true;
    const sync=()=>{
      if(!scene.sys?.isActive?.())return;
      const b=scene.serveButton;
      if(ready(scene)&&b&&b.visible!==false&&!b.input?.enabled){
        b.setInteractive({useHandCursor:true});
        scene.g3ServeReadyRepairCount=(scene.g3ServeReadyRepairCount||0)+1;
        scene.g3ServeReadyLastRepairAt=scene.time?.now||0;
      }
    };
    // Some legacy visual/guidance wrappers mutate hit state during the scene update.
    // Repair both at scene-postupdate and once more after every scene has completed its step.
    scene.events.on('postupdate',sync);
    scene.game?.events?.on?.('poststep',sync);
    sync();
    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g3ServeDebugWrapped){
      scene.__g3ServeDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),serveReadyInvariant:ready(scene),serveInputEnabled:!!scene.serveButton?.input?.enabled,serveReadyRepairCount:scene.g3ServeReadyRepairCount||0,serveReadyLastRepairAt:scene.g3ServeReadyLastRepairAt||0};};
    }
    const cleanup=()=>{
      scene.game?.events?.off?.('poststep',sync);
      scene.__g3ServeReadyGuard=false;
    };
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const prior=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){prior.call(this);this.time?.delayedCall?.(20,()=>attach(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V2_SERVE_GUARD__={loaded:true,version:'2.32',readyOrderInputInvariant:true,postStepInvariant:true,generatedVisualAssets:0};
})();