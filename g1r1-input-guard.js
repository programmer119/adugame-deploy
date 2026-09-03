// ADUGAME G1R1 input reliability guard v1.1.
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
      const hold=(typeof FEEL!=='undefined'&&FEEL?.wash?.rinseHoldMs)||520;
      this.time?.delayedCall?.(hold+100,()=>{if(this.__g1r1FaucetPendingStep===step)this.__g1r1FaucetPendingStep=null;});
    }
    return priorTap.apply(this,args);
  };

  function attach(scene){
    if(scene.__g1r1FaucetInputGuard||scene.scene?.key!=='G1R1')return;
    scene.__g1r1FaucetInputGuard=true;
    const canvas=scene.game?.canvas;
    const rearm=()=>{
      const f=scene.faucet;if(!f||scene.roundComplete)return;
      if(!f.input?.enabled){
        f.setSize(170,170).setInteractive(new Phaser.Geom.Rectangle(-85,-85,170,170),Phaser.Geom.Rectangle.Contains);
        scene.__g1r1FaucetRearmCount=(scene.__g1r1FaucetRearmCount||0)+1;
      }
    };
    const hit=(x,y)=>{
      if(![1,4].includes(scene.step)||scene.roundComplete)return false;
      const f=scene.faucet;if(!f)return false;
      return Math.abs(x-f.x)<=95&&Math.abs(y-f.y)<=100;
    };
    const trigger=source=>{
      if(scene.__g1r1FaucetPendingStep===scene.step)return;
      scene.__g1r1FaucetFallbackCount=(scene.__g1r1FaucetFallbackCount||0)+1;
      scene.__g1r1FaucetLastFallback=source;scene.tapFaucet();
    };
    const phaserFallback=p=>{if(hit(p.x,p.y))trigger('phaser');};
    const domFallback=e=>{
      if(!canvas||![1,4].includes(scene.step)||scene.roundComplete)return;
      const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
      const x=(e.clientX-r.left)/r.width*1280,y=(e.clientY-r.top)/r.height*720;
      scene.__g1r1FaucetDomPointerCount=(scene.__g1r1FaucetDomPointerCount||0)+1;
      if(hit(x,y))trigger('dom');
    };
    scene.events.on('postupdate',rearm);scene.input.on('pointerup',phaserFallback);canvas?.addEventListener('pointerup',domFallback,true);rearm();
    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g1r1InputDebugWrapped){
      scene.__g1r1InputDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),g1r1InputGuard:{ready:true,faucetEnabled:!!scene.faucet?.input?.enabled,faucetPendingStep:scene.__g1r1FaucetPendingStep??null,faucetAcceptedCount:scene.__g1r1FaucetAcceptedCount||0,faucetFallbackCount:scene.__g1r1FaucetFallbackCount||0,faucetDomPointerCount:scene.__g1r1FaucetDomPointerCount||0,faucetLastFallback:scene.__g1r1FaucetLastFallback||'',faucetRearmCount:scene.__g1r1FaucetRearmCount||0}};};
    }
    const cleanup=()=>{scene.input.off('pointerup',phaserFallback);canvas?.removeEventListener('pointerup',domFallback,true);scene.__g1r1FaucetInputGuard=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(240,()=>attach(this));};
  window.__ADUGAME_G1R1_INPUT_GUARD__={loaded:true,version:'1.1',faucetLiveRearm:true,phaserPointerFallback:true,nativeCanvasPointerFallback:true,reentryGuard:true};
})();