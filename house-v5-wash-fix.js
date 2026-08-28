// ADUGAME benchmark-v5 laundry interaction restore.
// Washer-loaded items have their hit input disabled while hidden. The original washer
// makes them visible/clean at tween completion, so restore pointer input in that exact
// wash_done state transition. A delayed fallback remains for hosted-frame stalls.
(() => {
  window.__ADUGAME_HOUSE_V5_WASH_FIX__={version:'5.0.2',loaded:true};
  const CLASSES=[G2R1,G2R2,G2R3];

  function restoreClean(scene,source){
    const clean=[...(scene.mission?.loaded||[])].filter(o=>o.state==='clean');
    clean.forEach(o=>{
      o.inShelf=false;
      const visible=scene.currentFloor===2&&!o.inElevator;
      o.setVisible(visible);
      if(!o.input){
        const w=Math.max(FEEL.input.minHitPx,(o.width||62)*FEEL.input.hitScale);
        const h=Math.max(FEEL.input.minHitPx,(o.height||58)*FEEL.input.hitScale);
        o.setInteractive(new Phaser.Geom.Rectangle(-w/2,-h/2,w,h),Phaser.Geom.Rectangle.Contains);
        scene.input.setDraggable(o);
      }
      o.input.enabled=visible;
    });
    telemetry('wash_input_restored',{
      source,clean:clean.length,
      enabled:clean.filter(o=>o.input?.enabled).length,
      floor:scene.currentFloor
    });
    return clean;
  }

  for(const Klass of CLASSES){
    const originalDiscover=Klass.prototype.discover;
    Klass.prototype.discover=function(id,...args){
      // house-v5 sets state='clean' immediately before emitting wash_done.
      if(id==='wash_done')restoreClean(this,'wash_done');
      return originalDiscover.call(this,id,...args);
    };

    const originalWasherAction=Klass.prototype.washerAction;
    Klass.prototype.washerAction=function(){
      const beforeRunning=!!this.washer?.running;
      const beforeOpen=!!this.washer?.open;
      const loaded=this.mission?.loaded?.size??0;
      const result=originalWasherAction.call(this);
      const started=!beforeRunning&&!beforeOpen&&loaded>=3&&!!this.washer?.running;
      if(started){
        telemetry('wash_input_restore_scheduled',{loaded});
        this.time.delayedCall(1600,()=>restoreClean(this,'fallback'));
      }
      return result;
    };
  }
})();