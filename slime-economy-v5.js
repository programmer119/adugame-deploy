// ADUGAME benchmark-v5 Slime Store economy parity patch.
// O-PUBLIC basis: customers buy specific slime varieties; earned coins procure more slime supplies.
(() => {
  const SUPPLIES=[
    {id:'sparkle',glyph:'✦',cost:2,label:'반짝이'},
    {id:'swirl',glyph:'◌',cost:4,label:'소용돌이'},
    {id:'confetti',glyph:'◆',cost:6,label:'컨페티'}
  ];
  const BONUS_COLOR={sparkle:'#6c63ff',swirl:'#00a6a6',confetti:'#ff7f6a'};

  const originalCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){
    originalCreate.call(this);
    this.coinEarned=0;
    this.supplyUnlocked=new Set();
    this.supplyButtons=new Map();
    this.bonusDecos=[];
    this.buildEconomyUI();
    GAMES[2].dna='고객 주문 · 촉감 · 장식 · 코인 경제 · 진열 · 다음 주문';
  };

  CraftRound.prototype.buildEconomyUI=function(){
    this.economyPanel=this.add.container(1080,132).setName('economy_panel').setDepth(46);
    const pg=this.add.graphics();
    pg.fillStyle(0xffffff,.94).fillRoundedRect(-126,-27,252,54,16);
    pg.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-126,-27,252,54,16);
    const title=this.add.text(-92,0,'STORE',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
    this.coinBalanceText=this.add.text(38,0,'● 0',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#9a6a00'}).setOrigin(.5);
    this.economyPanel.add([pg,title,this.coinBalanceText]);

    this.supplyRail=this.add.container(720,188).setName('supply_shop').setDepth(46);
    SUPPLIES.forEach((s,i)=>{
      const x=(i-1)*124;
      const c=this.add.container(x,0).setName('supply_'+s.id);
      const g=this.add.graphics();
      g.fillStyle(0xffffff,.94).fillRoundedRect(-54,-25,108,50,14);
      g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-54,-25,108,50,14);
      const icon=this.add.text(-30,0,s.glyph,{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:BONUS_COLOR[s.id]}).setOrigin(.5);
      const txt=this.add.text(16,0,`${s.cost} ●`,{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
      c.add([g,icon,txt]);c.setSize(108,50).setInteractive({useHandCursor:true});
      c.supply=s;c.priceText=txt;
      c.on('pointerup',()=>this.purchaseSupply(s.id));
      this.supplyRail.add(c);this.supplyButtons.set(s.id,c);
    });
    this.refreshEconomyUI();
  };

  CraftRound.prototype.refreshEconomyUI=function(){
    this.coinBalanceText?.setText(`● ${this.coinCount||0}`);
    for(const s of SUPPLIES){
      const b=this.supplyButtons?.get(s.id);if(!b)continue;
      const unlocked=this.supplyUnlocked?.has(s.id),affordable=(this.coinCount||0)>=s.cost;
      b.setAlpha(unlocked?1:(affordable?.95:.48));
      b.priceText?.setText(unlocked?'✓':`${s.cost} ●`);
    }
  };

  CraftRound.prototype.purchaseSupply=function(id){
    const s=SUPPLIES.find(x=>x.id===id),button=this.supplyButtons?.get(id);if(!s||!button)return;
    if(this.supplyUnlocked.has(id)){this.tweens.add({targets:button,scale:1.05,yoyo:true,duration:100});audio.click();return;}
    if((this.coinCount||0)<s.cost){this.curious(button);this.status?.setText(`코인 ${s.cost}개가 필요해요. 손님 주문을 완성해 코인을 모아요`);audio.click();return;}
    this.coinCount-=s.cost;this.supplyUnlocked.add(id);audio.coin();this.sparkle(720+(SUPPLIES.indexOf(s)-1)*124,188,5);
    this.makeBonusDeco(s);this.refreshEconomyUI();
    this.status?.setText(`${s.label} 재료를 샀어요. 다음 슬라임에도 자유롭게 쓸 수 있어요`);
    telemetry('supply_purchase',{id,cost:s.cost,balance:this.coinCount});
  };

  CraftRound.prototype.makeBonusDeco=function(s){
    if(this.bonusDecos.some(o=>o.supplyId===s.id&&o.active!==false))return;
    const idx=this.bonusDecos.length,x=565+idx*92,y=550;
    const c=this.add.container(x,y).setName('deco_bonus_'+s.id).setDepth(18),g=this.add.graphics();
    g.fillStyle(0xffffff,1).fillCircle(0,0,34);g.lineStyle(2,COLORS.ink,.12).strokeCircle(0,0,34);
    const t=this.add.text(0,0,s.glyph,{fontFamily:'Arial',fontSize:'25px',fontStyle:'bold',color:BONUS_COLOR[s.id]}).setOrigin(.5);
    c.add([g,t]);c.setSize(76,76);c.width=76;c.height=76;c.kind='bonus_'+s.id;c.supplyId=s.id;
    this.dragify(c,{end:o=>this.dropDeco(o)});this.bonusDecos.push(c);
  };

  const originalCoinBurst=CraftRound.prototype.coinBurst;
  CraftRound.prototype.coinBurst=function(n){
    const before=this.coinCount||0,result=originalCoinBurst.call(this,n);
    this.coinEarned+=(this.coinCount||0)-before;
    this.refreshEconomyUI();
    return result;
  };

  const originalPrepareNextOrder=CraftRound.prototype.prepareNextOrder;
  CraftRound.prototype.prepareNextOrder=function(){
    const result=originalPrepareNextOrder.call(this);
    // Purchased supplies are persistent store inventory, not one-customer consumables.
    for(const s of SUPPLIES)if(this.supplyUnlocked?.has(s.id))this.makeBonusDeco(s);
    this.refreshEconomyUI();
    return result;
  };

  const originalDebugState=CraftRound.prototype.debugState;
  CraftRound.prototype.debugState=function(){
    return {...originalDebugState.call(this),coinBalance:this.coinCount||0,coinEarned:this.coinEarned||0,supplyUnlocked:[...(this.supplyUnlocked||[])],supplyShop:true};
  };
})();
