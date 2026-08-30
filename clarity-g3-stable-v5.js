// ADUGAME strict G3 stable guidance.
// Re-evaluate the command after legacy snap/tween/container callbacks finish so the
// visible instruction always points at the next action that can actually advance the order.
(() => {
  if(typeof CraftRound==='undefined')return;
  const decoX={star:210,flower:305,heart:400,banana:495};
  const colorX={blue:210,green:325,pink:440};
  const center=o=>o?{x:o.x,y:o.y}:null;
  function syncGuidance(s){
    if(!s?.scene?.isActive?.()||s.roundComplete)return;
    if((s.ingredients?.size||0)<2){
      const next=s.ingredients?.has('base')?s.activator:s.base;
      s.status?.setText(`${s.ingredients?.size?'이제 ':'먼저 '}베이스와 활성액을 그릇에 넣어요`);
      s.hintTarget=center(next);return;
    }
    if(!s.chosen?.color){
      s.status?.setText('주문과 같은 색을 골라요');
      s.hintTarget={x:colorX[s.order?.color]||325,y:355};return;
    }
    if(!s.mixed){
      s.status?.setText('그릇 안을 원을 그리며 충분히 섞어요');
      s.hintTarget={x:650,y:420};return;
    }
    const requested=s.order?.deco,hasRequested=!!requested&&s.chosen?.decos?.includes(requested);
    if(!hasRequested){
      const x=decoX[requested];
      s.status?.setText(`주문 장식 ${requested==='flower'?'꽃':requested==='heart'?'하트':'별'}을 올려요`);
      if(x)s.hintTarget={x,y:485};return;
    }
    if(s.order?.container&&s.chosen?.container!==s.order.container){
      const round=s.order.container==='round',x=round?230:380;
      s.status?.setText(`주문은 ${round?'동그란':'네모난'} 용기예요. ${round?'동그란':'네모난'} 용기를 선택해요`);
      s.hintTarget={x,y:585};return;
    }
    s.status?.setText('주문 조건을 모두 맞췄어요. 손님에게 주기를 눌러요');
    if(s.serveButton)s.hintTarget={x:s.serveButton.x,y:s.serveButton.y};
  }

  const oldCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){
    oldCreate.call(this);
    this.children.list.filter(o=>o?.name==='container_round'||o?.name==='container_square').forEach(o=>o.on('pointerup',()=>this.time.delayedCall(50,()=>syncGuidance(this))));
  };

  const oldDrop=CraftRound.prototype.dropDeco;
  CraftRound.prototype.dropDeco=function(o){
    const result=oldDrop.call(this,o);
    this.time.delayedCall(520,()=>syncGuidance(this));
    return result;
  };
  window.__ADUGAME_CLARITY_G3_STABLE_V5__={loaded:true,version:'5.2.9',stableConditionChain:true,wrongContainerGuard:true};
})();
