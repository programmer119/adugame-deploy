// v6.2 truth-in-visual guard: decorative art must never imply state that the real game does not have.
(() => {
  if(typeof CraftRound!=='undefined'){
    const oldCreate=CraftRound.prototype.create;
    CraftRound.prototype.create=function(){
      oldCreate.call(this);
      // Cover the decorative fake finished-jar shelf from v6 polish; finished jars must appear only on the real persistent storeShelf.
      const cover=this.add.graphics().setDepth(4).setName('v6_fake_shelf_cover');
      cover.fillStyle(0xfff5f7,1).fillRoundedRect(915,215,220,155,20);
      cover.fillStyle(0xf2dbe3,.9).fillRoundedRect(935,238,180,92,18);
      cover.lineStyle(3,0xe3b9c8,.5).strokeRoundedRect(935,238,180,92,18);
      this.children.list.filter(o=>o?.type==='Text'&&o.text==='완성 슬라임 진열대').forEach(o=>o.setVisible(false));
      // Keep the order panel completely between bowl and customer instead of touching either visual.
      this.orderBubble?.setPosition(925,500).setScale(.68).setDepth(112);
      // The only finished-goods shelf is the live persistent shelf where makeFinishedJar() actually moves jars.
      if(this.storeShelf){this.storeShelf.setDepth(28);}
      this.add.text(1080,580,'완성품 진열대',{fontFamily:'Arial, sans-serif',fontSize:'12px',fontStyle:'bold',color:'#6c5260',backgroundColor:'#ffffffd9',padding:{left:7,right:7,top:3,bottom:3}}).setOrigin(.5).setDepth(29).setName('v6_real_store_shelf_label');
      this.v6TruthVisual=true;
    };
    const oldNext=CraftRound.prototype.prepareNextOrder;
    CraftRound.prototype.prepareNextOrder=function(){const r=oldNext.call(this);this.time.delayedCall(30,()=>this.orderBubble?.setPosition(925,500).setScale(.68));return r;};
  }
  window.__ADUGAME_VISUAL_V6_TRUTH__={loaded:true,version:'6.2.3',noFakeStateArt:true,orderPanelSeparated:true,realFinishedShelfOnly:true};
})();
