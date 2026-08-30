// Final visual-layer guard for v6. Keeps visible art, interactive targets and animated characters on the same live objects.
(() => {
  const patchCreate=(Klass,after)=>{if(!Klass)return;const old=Klass.prototype.create;Klass.prototype.create=function(){old.call(this);after.call(this);};};

  if(typeof G1R1!=='undefined')patchCreate(G1R1,function(){
    this.face?.setDepth(14);this.soap?.setDepth(15);this.water?.setDepth(11);this.toilet?.setDepth(8);this.faucet?.setDepth(12);this.hands?.setDepth(13);
  });
  if(typeof G1R2!=='undefined')patchCreate(G1R2,function(){
    this.face?.setDepth(6);[this.paste,this.brush,this.cloth,this.clipper].forEach(o=>o?.setDepth(15));this.hand?.setDepth(12);this.mouth?.setDepth(8);(this.stains||[]).forEach(o=>o.setDepth(10));(this.nails||[]).forEach(o=>o.setDepth(13));
  });
  if(typeof G1R3!=='undefined')patchCreate(G1R3,function(){
    [...(this.toys||[]),...(this.foods||[])].forEach(o=>o.setDepth(15));
    const bodyCandidate=[...this.children.list].reverse().find(o=>o?.type==='Graphics'&&Number(o.depth)===6&&!o.name);if(bodyCandidate)bodyCandidate.setAlpha(0);
    if(this.face){const body=this.add.graphics().setName('v6_r3_character_body');body.fillStyle(0x5aa9e6,1).fillRoundedRect(-45,58,90,120,32);body.fillStyle(0xffffff,.55).fillRoundedRect(-28,82,56,26,10);body.setPosition(0,0);this.face.add(body);this.face.setDepth(8);}
  });

  if(typeof CraftRound!=='undefined')patchCreate(CraftRound,function(){
    this.bowl?.setDepth(10);this.base?.setDepth(20);this.activator?.setDepth(20);this.customer?.setDepth(7);
    this.children.list.filter(o=>o?.name?.startsWith('deco_')).forEach(o=>o.setDepth(20));
    this.children.list.filter(o=>o?.name==='container_round'||o?.name==='container_square').forEach(o=>o.setDepth(20));
    const staticBody=this.children.list.find(o=>o?.name==='v6_customer_body');if(staticBody)staticBody.destroy();
    if(this.customer){const body=this.add.graphics().setName('v6_customer_torso');body.fillStyle(0x7b62c7,1).fillRoundedRect(-46,58,92,118,34);body.fillStyle(0xffffff,.5).fillRoundedRect(-28,84,56,24,9);body.setPosition(0,0);this.customer.add(body);}
  });

  window.__ADUGAME_VISUAL_V6_FINALIZE__={loaded:true,version:'6.1.2',liveHitArt:true,animatedCharactersVisible:true,bodyFollowsReaction:true};
})();
