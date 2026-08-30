// ADUGAME strict G3 stable guidance.
// Re-evaluate the final command after legacy snap/tween callbacks finish so the
// visible instruction can never regress to SERVE before required conditions are met.
(() => {
  if(typeof CraftRound==='undefined')return;
  const decoX={star:210,flower:305,heart:400,banana:495};
  const oldDrop=CraftRound.prototype.dropDeco;
  CraftRound.prototype.dropDeco=function(o){
    const result=oldDrop.call(this,o);
    this.time.delayedCall(520,()=>{
      if(!this.scene?.isActive?.()||!this.mixed)return;
      const requested=this.order?.deco;
      const hasRequested=!!requested&&this.chosen?.decos?.includes(requested);
      if(!hasRequested){
        const x=decoX[requested];
        this.status?.setText(`주문 장식 ${requested==='flower'?'꽃':requested==='heart'?'하트':'별'}을 올려요`);
        if(x)this.hintTarget={x,y:485};
        return;
      }
      if(this.order?.container&&!this.chosen?.container){
        const round=this.order.container==='round',x=round?230:380;
        this.status?.setText(`주문 장식을 올렸어요. 이제 ${round?'동그란':'네모난'} 용기를 선택해요`);
        this.hintTarget={x,y:585};
        return;
      }
      this.status?.setText('주문 조건을 모두 맞췄어요. 손님에게 주기를 눌러요');
      if(this.serveButton)this.hintTarget={x:this.serveButton.x,y:this.serveButton.y};
    });
    return result;
  };
  window.__ADUGAME_CLARITY_G3_STABLE_V5__={loaded:true,version:'5.2.8',stableConditionChain:true};
})();
