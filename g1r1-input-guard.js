// ADUGAME G1R1 input reliability guard v1.7.
// Keeps the visible faucet and its logical hit area coupled after late visual restyles.
// The authored v8 soap position remains the canonical live target; strict guidance QA tracks it.
(() => {
  if(typeof G1R1!=='function')return;
  const priorTap=G1R1.prototype.tapFaucet;
  G1R1.prototype.tapFaucet=function(...args){
    const accepted=[1,4].includes(this.step);
    if(accepted&&this.__g1r1FaucetPendingStep===this.step)return;
    let pendingStep=null;
    if(accepted){
      pendingStep=this.step;this.__g1r1FaucetPendingStep=pendingStep;
      this.__g1r1FaucetAcceptedCount=(this.__g1r1FaucetAcceptedCount||0)+1;
      const hold=(typeof FEEL!=='undefined'&&FEEL?.wash?.rinseHoldMs)||520;
      const clearPending=()=>{if(this.__g1r1FaucetPendingStep===pendingStep)this.__g1r1FaucetPendingStep=null;};
      this.time?.delayedCall?.(hold+100,clearPending);
      window.setTimeout(clearPending,hold+260);

      // tapFaucet remains the sole owner of validation and state transitions. Mirror only
      // its accepted rinse/wet delayed callback so a stalled Phaser Clock cannot swallow
      // a real click after the canonical method has already accepted it.
      const clock=this.time,originalDelayed=clock?.delayedCall;
      if(typeof originalDelayed==='function'){
        const scene=this;
        clock.delayedCall=function(delay,callback,cbArgs,scope){
          if(Math.abs(Number(delay)-Number(hold))>2||typeof callback!=='function')return originalDelayed.call(clock,delay,callback,cbArgs,scope);
          let fired=false,browserTimer=null;
          const once=function(...runtimeArgs){
            if(fired)return;fired=true;if(browserTimer!==null)window.clearTimeout(browserTimer);
            const invokeArgs=Array.isArray(cbArgs)?cbArgs:runtimeArgs;
            return callback.apply(scope??scene,invokeArgs);
          };
          const evt=originalDelayed.call(clock,delay,once,cbArgs,scope);
          browserTimer=window.setTimeout(()=>once.call(scope??scene),Math.max(0,Number(delay))+140);
          scene.__g1r1FaucetCanonicalWatchdogCount=(scene.__g1r1FaucetCanonicalWatchdogCount||0)+1;
          return evt;
        };
        try{return priorTap.apply(this,args);}finally{clock.delayedCall=originalDelayed;}
      }
    }
    return priorTap.apply(this,args);
  };

  // flushToilet already owns the canonical transition to step 1. Keep the matching
  // instruction/hint synchronized even when a late visual layer or a stalled Phaser
  // delayed callback leaves the visible progress and scene.status temporarily divergent.
  const priorFlush=G1R1.prototype.flushToilet;
  if(typeof priorFlush==='function')G1R1.prototype.flushToilet=function(...args){
    const before=this.step;
    const result=priorFlush.apply(this,args);
    if(before===.5&&this.step===1){
      const sync=()=>{
        if(this.scene?.key!=='G1R1'||this.roundComplete||this.step!==1)return;
        this.status?.setText?.('이제 수도꼭지를 눌러 손을 먼저 적셔요');
        this.hintTarget={x:this.faucet?.x??400,y:this.faucet?.y??300};
        this.v5SetStep?.(2);
        this.__g1r1PostFlushGuidanceSyncCount=(this.__g1r1PostFlushGuidanceSyncCount||0)+1;
      };
      sync();
      this.time?.delayedCall?.(520,sync);
      window.setTimeout(sync,620);
    }
    return result;
  };

  // Register before app-shell boots. This listener is intentionally app-lifetime rather
  // than scene-lifetime: it resolves the current scene dynamically and can therefore
  // survive Phaser shutdown/restart timing without fabricating any accepted action.
  const globalClientFallback=(e,source)=>{
    const scene=window.__ADUGAME_SCENE__?.();
    if(!scene||scene.scene?.key!=='G1R1'||![1,4].includes(scene.step)||scene.roundComplete)return;
    const canvas=scene.game?.canvas,f=scene.faucet;if(!canvas||!f)return;
    const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
    const x=(e.clientX-r.left)/r.width*1280,y=(e.clientY-r.top)/r.height*720;
    scene.__g1r1FaucetGlobalPointerCount=(scene.__g1r1FaucetGlobalPointerCount||0)+1;
    if(Math.abs(x-f.x)>95||Math.abs(y-f.y)>100||scene.__g1r1FaucetPendingStep===scene.step)return;
    scene.__g1r1FaucetFallbackCount=(scene.__g1r1FaucetFallbackCount||0)+1;
    scene.__g1r1FaucetLastFallback=source;
    scene.tapFaucet();
  };
  const globalPointerDown=e=>globalClientFallback(e,'window-pointerdown-capture');
  const globalMouseDown=e=>globalClientFallback(e,'window-mousedown-capture');
  window.addEventListener('pointerdown',globalPointerDown,true);
  window.addEventListener('mousedown',globalMouseDown,true);

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
    const clientFallback=(e,source)=>{
      if(!canvas||![1,4].includes(scene.step)||scene.roundComplete)return;
      const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
      const x=(e.clientX-r.left)/r.width*1280,y=(e.clientY-r.top)/r.height*720;
      scene.__g1r1FaucetDomPointerCount=(scene.__g1r1FaucetDomPointerCount||0)+1;
      if(hit(x,y))trigger(source);
    };
    const canvasFallback=e=>clientFallback(e,'canvas-dom');
    const windowFallback=e=>clientFallback(e,'window-capture');
    const mouseFallback=e=>clientFallback(e,'window-mouse-capture');
    scene.events.on('postupdate',rearm);
    scene.input.on('pointerup',phaserFallback);
    canvas?.addEventListener('pointerup',canvasFallback,true);
    window.addEventListener('pointerup',windowFallback,true);
    window.addEventListener('mouseup',mouseFallback,true);
    rearm();
    const priorDebug=scene.debugState?.bind(scene);
    if(priorDebug&&!scene.__g1r1InputDebugWrapped){
      scene.__g1r1InputDebugWrapped=true;
      scene.debugState=function(){return {...priorDebug(),g1r1InputGuard:{ready:true,faucetEnabled:!!scene.faucet?.input?.enabled,faucetPendingStep:scene.__g1r1FaucetPendingStep??null,faucetAcceptedCount:scene.__g1r1FaucetAcceptedCount||0,faucetFallbackCount:scene.__g1r1FaucetFallbackCount||0,faucetDomPointerCount:scene.__g1r1FaucetDomPointerCount||0,faucetGlobalPointerCount:scene.__g1r1FaucetGlobalPointerCount||0,faucetCanonicalWatchdogCount:scene.__g1r1FaucetCanonicalWatchdogCount||0,faucetLastFallback:scene.__g1r1FaucetLastFallback||'',faucetRearmCount:scene.__g1r1FaucetRearmCount||0,postFlushGuidanceSyncCount:scene.__g1r1PostFlushGuidanceSyncCount||0,soapX:scene.soap?.x??null,soapY:scene.soap?.y??null}};};
    }
    const cleanup=()=>{
      scene.input.off('pointerup',phaserFallback);
      canvas?.removeEventListener('pointerup',canvasFallback,true);
      window.removeEventListener('pointerup',windowFallback,true);
      window.removeEventListener('mouseup',mouseFallback,true);
      scene.__g1r1FaucetInputGuard=false;
    };
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){priorCreate.call(this);this.time?.delayedCall?.(240,()=>attach(this));};
  window.__ADUGAME_G1R1_INPUT_GUARD__={loaded:true,version:'1.7',faucetLiveRearm:true,authoredSoapTargetPreserved:true,phaserPointerFallback:true,nativeCanvasPointerFallback:true,windowCapturePointerFallback:true,windowMouseCaptureFallback:true,globalPointerDownCaptureFallback:true,globalMouseDownCaptureFallback:true,canonicalDelayedCallbackWatchdog:true,reentryGuard:true,postFlushGuidanceCanonicalSync:true,generatedVisualAssets:0};
})();