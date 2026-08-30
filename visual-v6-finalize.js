// Final visual-layer guard for v6. Keeps visible art, interactive targets and animated characters on the same live objects.
(() => {
  const patchCreate=(Klass,after)=>{if(!Klass)return;const old=Klass.prototype.create;Klass.prototype.create=function(){old.call(this);after.call(this);};};
  const localizeChrome=scene=>{
    const title=scene.children.list.find(o=>o?.type==='Text'&&Math.abs(o.x-54)<2&&Math.abs(o.y-43)<2);if(title)title.setText(String(title.text).replace(/·\s*ROUND\s*(\d+)/i,'· $1단계'));
    scene.children.list.filter(o=>o?.type==='Text').forEach(t=>{if(t.text==='STORE')t.setText('재료 상점');if(t.text==='SLIME LAB')t.setText('슬라임 가게');});
  };

  if(typeof G1R1!=='undefined')patchCreate(G1R1,function(){
    this.face?.setDepth(14);this.soap?.setDepth(15);this.water?.setDepth(11);this.toilet?.setDepth(8);this.faucet?.setDepth(12);this.hands?.setDepth(13);localizeChrome(this);
  });
  if(typeof G1R2!=='undefined')patchCreate(G1R2,function(){
    this.face?.setDepth(6);[this.paste,this.brush,this.cloth,this.clipper].forEach(o=>o?.setDepth(15));this.hand?.setDepth(12);this.mouth?.setDepth(8);(this.stains||[]).forEach(o=>o.setDepth(10));(this.nails||[]).forEach(o=>o.setDepth(13));localizeChrome(this);
  });
  if(typeof G1R3!=='undefined')patchCreate(G1R3,function(){
    [...(this.toys||[]),...(this.foods||[])].forEach(o=>o.setDepth(15));
    const bodyCandidate=[...this.children.list].reverse().find(o=>o?.type==='Graphics'&&Number(o.depth)===6&&!o.name);if(bodyCandidate)bodyCandidate.setAlpha(0);
    if(this.face){const body=this.add.graphics().setName('v6_r3_character_body');body.fillStyle(0x5aa9e6,1).fillRoundedRect(-45,58,90,120,32);body.fillStyle(0xffffff,.55).fillRoundedRect(-28,82,56,26,10);body.setPosition(0,0);this.face.add(body);this.face.setDepth(8);}localizeChrome(this);
  });

  if(typeof G2R1!=='undefined')[G2R1,G2R2,G2R3].forEach(K=>patchCreate(K,function(){localizeChrome(this);}));

  if(typeof CraftRound!=='undefined'){
    patchCreate(CraftRound,function(){
      this.bowl?.setDepth(10);this.base?.setDepth(20);this.activator?.setDepth(20);this.customer?.setDepth(7);
      this.children.list.filter(o=>o?.name?.startsWith('deco_')).forEach(o=>o.setDepth(20));
      this.children.list.filter(o=>o?.name==='container_round'||o?.name==='container_square').forEach(o=>o.setDepth(20));
      const staticBody=this.children.list.find(o=>o?.name==='v6_customer_body');if(staticBody)staticBody.destroy();
      if(this.customer){const body=this.add.graphics().setName('v6_customer_torso');body.fillStyle(0x7b62c7,1).fillRoundedRect(-46,58,92,118,34);body.fillStyle(0xffffff,.5).fillRoundedRect(-28,84,56,24,9);body.setPosition(0,0);this.customer.add(body);}
      // Keep order information beside, not on top of, the customer.
      this.orderBubble?.setPosition(915,500).setScale(.84).setDepth(110);
      // Text/padding changes after setInteractive can leave a stale Phaser hitArea. Re-arm the actual visible button.
      if(this.serveButton){this.serveButton.disableInteractive();this.serveButton.setInteractive({useHandCursor:true});this.serveButton.setDepth(140);}
      const storeLabel=this.economyPanel?.list?.find(o=>o?.type==='Text'&&o.text==='STORE');if(storeLabel)storeLabel.setText('재료 상점').setFontSize('10px');
      const lab=this.children.list.find(o=>o?.type==='Text'&&o.text==='SLIME LAB');if(lab)lab.setText('슬라임 가게');
      localizeChrome(this);
    });
    const oldNext=CraftRound.prototype.prepareNextOrder;
    CraftRound.prototype.prepareNextOrder=function(){const r=oldNext.call(this);this.time.delayedCall(20,()=>{this.orderBubble?.setPosition(915,500).setScale(.84);if(this.serveButton){this.serveButton.disableInteractive();this.serveButton.setInteractive({useHandCursor:true});}});return r;};
  }

  window.__ADUGAME_VISUAL_V6_FINALIZE__={loaded:true,version:'6.1.3',liveHitArt:true,animatedCharactersVisible:true,bodyFollowsReaction:true,serveHitAreaRearmed:true,orderPanelSeparated:true,koreanGameplayChrome:true};
})();
