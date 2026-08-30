// ADUGAME v5 strict layout/feedback patch.
(() => {
  // The 9th shelf card used to sit under the inventory pager. Keep both the
  // visible card and its enlarged drag hit-area clear while retaining the pager inside the room panel.
  if(typeof G2R1!=='undefined'){
    [G2R1,G2R2,G2R3].forEach(Klass=>{
      const oldCreate=Klass.prototype.create;
      Klass.prototype.create=function(){
        oldCreate.call(this);
        if(this.inventoryHud){this.inventoryHud.setX(1098).setScale(.85,1);}
      };
    });
  }

  // The legacy mismatch animation targeted orderIcons, which strict clarity hides.
  // Pulse the actually visible condition badges as well so wrong-order feedback points to the real command UI.
  if(typeof CraftRound!=='undefined'&&CraftRound.prototype.serve){
    const oldServe=CraftRound.prototype.serve;
    CraftRound.prototype.serve=function(){
      const valid=this.mixed&&this.chosen?.color===this.order?.color&&this.chosen?.decos?.includes(this.order?.deco)&&(!this.order?.container||this.chosen?.container===this.order.container);
      if(!valid&&this.clarityOrderBadges){this.tweens.add({targets:this.clarityOrderBadges,scale:1.08,yoyo:true,repeat:1,duration:140});}
      return oldServe.call(this);
    };
  }

  window.__ADUGAME_CLARITY_LAYOUT_V5__={loaded:true,version:'5.2.2',pagerSeparated:true,visibleOrderMismatchFeedback:true};
})();
