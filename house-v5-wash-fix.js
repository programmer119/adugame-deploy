// ADUGAME benchmark-v5 laundry interaction restore.
// Washer-loaded items have their hit input disabled while hidden. When the wash tween
// completes they become visible/clean again, so their input must be restored in the
// same state transition instead of leaving visible-but-undraggable clothes.
(() => {
  window.__ADUGAME_HOUSE_V5_WASH_FIX__={version:'5.0.1',loaded:true};
  const CLASSES=[G2R1,G2R2,G2R3];

  for(const Klass of CLASSES){
    const originalWasherAction=Klass.prototype.washerAction;
    Klass.prototype.washerAction=function(){
      const beforeRunning=!!this.washer?.running;
      const beforeOpen=!!this.washer?.open;
      const loaded=this.mission?.loaded?.size??0;
      const result=originalWasherAction.call(this);
      const started=!beforeRunning&&!beforeOpen&&loaded>=3&&!!this.washer?.running;
      if(started){
        telemetry('wash_input_restore_scheduled',{loaded});
        this.time.delayedCall(1400,()=>{
          const clean=[...(this.mission?.loaded||[])].filter(o=>o.state==='clean');
          // Refresh shelf visibility first; it is the single source of truth for
          // hidden hit areas. Clean clothes are room objects (inShelf=false), so on
          // the laundry floor they become both visible and interactive again.
          this.refreshInventoryShelf?.();
          clean.forEach(o=>{
            const visible=this.currentFloor===2&&!o.inElevator;
            o.setVisible(visible);
            if(o.input)o.input.enabled=visible;
          });
          telemetry('wash_input_restored',{
            clean:clean.length,
            enabled:clean.filter(o=>o.input?.enabled).length,
            floor:this.currentFloor
          });
        });
      }
      return result;
    };
  }
})();