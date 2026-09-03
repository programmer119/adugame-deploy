// ADUGAME G1R1 input reliability guard v1.0.
// Keeps the visible faucet and its logical hit area coupled after late visual restyles.
(() => {
  if(typeof G1R1!=='function')return;
  const priorTap=G1R1.prototype.tapFaucet;
  G1R1.prototype.tapFaucet=function(...args){
    const accepted=[1,4].includes(this.step);
    if(accepted&&this.__g1r1FaucetPendingStep===this.step)return;
    if(accepted){
      const step=this.step;this.__g1r1FaucetPendingStep=step;
      this.__g1r1FaucetAcceptedCount=(this.__g1r1FaucetAcceptedCount||0)+1;
      this.time?.delayedCall?.((FEEL?.wash?.rinseHoldMs||520)+100,()=>{if(this.__g1r1FaucetPendingStep===step)this.__g1r1FaucetPendingStep=null;});
    }
    return priorTap.apply(this,args);
  };

  function attach(scene){
    if(scene.__g1r1FaucetInputGuard||scene.scene?.key!=='G1R1')return;
    scene.__g1r1FaucetInputGuard=true;
    const rearm=()=>{
      const f=scene.faucet;if(!f||scene.roundComplete)return;
      if(!f.input?.enabled){
        f.setSize(170,170).setInteractive(new Phaser.Geom.Rectangle(-85,-85,170,170),Phaser.Geom.Rectangle.Contains);
        scene.__g1r1FaucetRearmCount=(scene.__g1r1FaucetRearmCount||0)+1;
      }
    };
    const fallback=p=>{
      if(![1,4].includes(scene.step)||scene.roundComplete)return;
      const f=scene.faucet;if(!f)return;
      const dx=Math.abs(p.x-f.x),dy=Math.abs(p.y-f.y);
      if(dx>95||dy>100)return;
      if(scene.__g1r1FaucetPendingStep===scene.step)return;
      scene.__g1r1FaucetFallbackCount=(scene.__g1r1FaucetFallbackCount||0)+1;
      scene.tapFaucet();
    };
    scene.events.on('postupdate',rearm);scene.input.on('pointerup',fallback);rearm();
    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g1r1InputDebugWrapped){
      scene.__g1r1InputDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),g1r1InputGuard:{ready:true,faucetEnabled:!!scene.faucet?.input?.enabled,faucetPendingStep:scene.__g1r1FaucetPendingStep??null,faucetAcceptedCount:scene.__g1r1FaucetAcceptedCount||0,faucetFallbackCount:scene.__g1r1FaucetFallbackCount||0,faucetRearmCount:scene.__g1r1FaucetRearmCount||0}};};
    }
    const cleanup=()=>{scene.input.off('pointerup',fallback);scene.__g1r1FaucetInputGuard=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(240,()=>attach(this));};
  window.__ADUGAME_G1R1_INPUT_GUARD__={loaded:true,version:'1.0',faucetLiveRearm:true,logicalPointerFallback:true,reentryGuard:true};
})();