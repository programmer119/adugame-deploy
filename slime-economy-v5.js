// ADUGAME benchmark-v5 Slime Store economy parity patch.
// O-PUBLIC basis: customers buy specific slime varieties; earned coins procure more slime supplies.
// Secondary observed-play evidence indicates money and ingredients can be depleted, so purchased supplies are stock, not permanent unlocks.
// Exact original prices/pack sizes remain unmeasured; values below are T-REPRO. The reported original dead-end bug is intentionally not reproduced.
(() => {
  const SUPPLIES=[
    {id:'soccer',glyph:'⚽',cost:2,pack:2,label:'축구공'},
    {id:'butterfly',glyph:'🦋',cost:4,pack:2,label:'나비'},
    {id:'animal',glyph:'🐰',cost:6,pack:2,label:'동물 장식'}
  ];
  const BONUS_COLOR={soccer:'#2774d8',butterfly:'#9b5de5',animal:'#ff7f6a'};

  const originalCreate=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){
    originalCreate.call(this);
    this.coinEarned=0;
    this.supplyPurchased=new Set();
    this.supplyStock=new Map(SUPPLIES.map(s=>[s.id,0]));
    this.supplyButtons=new Map();
    this.bonusDecos=[];
    this.buildEconomyUI();
    GAMES[2].dna='고객 주문 · 촉감 · 장식 · 코인 경제 · 재료 재고 · 진열 · 다음 주문';
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
      const txt=this.add.text(16,0,`${s.cost} ●`,{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
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
      const stock=this.supplyStock?.get(s.id)||0,affordable=(this.coinCount||0)>=s.cost;
      b.setAlpha(affordable?1:.55);
      b.priceText?.setText(stock>0?`${stock}개 · ${s.cost}●`:`${s.cost} ●`);
    }
  };

  CraftRound.prototype.purchaseSupply=function(id){
    const s=SUPPLIES.find(x=>x.id===id),button=this.supplyButtons?.get(id);if(!s||!button)return;
    if((this.coinCount||0)<s.cost){
      this.curious(button);this.status?.setText(`코인 ${s.cost}개가 필요해요. 손님 주문을 완성해 코인을 모아요`);audio.click();return;
    }
    this.coinCount-=s.cost;
    this.supplyPurchased.add(id);
    this.supplyStock.set(id,(this.supplyStock.get(id)||0)+s.pack);
    audio.coin();this.sparkle(720+(SUPPLIES.indexOf(s)-1)*124,188,5);
    this.ensureBonusDeco(s);this.refreshEconomyUI();
    this.status?.setText(`${s.label} 재료 ${s.pack}개를 샀어요. 쓰면 재고가 줄어요`);
    telemetry('supply_purchase',{id,cost:s.cost,pack:s.pack,stock:this.supplyStock.get(id),balance:this.coinCount});
  };

  CraftRound.prototype.ensureBonusDeco=function(s){
    const stock=this.supplyStock?.get(s.id)||0;if(stock<=0)return null;
    const live=this.bonusDecos?.find(o=>o.supplyId===s.id&&o.active!==false&&!o.supplySpent&&o.input?.enabled);
    if(live)return live;
    const idx=SUPPLIES.indexOf(s),x=565+idx*92,y=550;
    const c=this.add.container(x,y).setName('deco_bonus_'+s.id).setDepth(18),g=this.add.graphics();
    g.fillStyle(0xffffff,1).fillCircle(0,0,34);g.lineStyle(2,COLORS.ink,.12).strokeCircle(0,0,34);
    const t=this.add.text(0,0,s.glyph,{fontFamily:'Arial',fontSize:'25px',fontStyle:'bold',color:BONUS_COLOR[s.id]}).setOrigin(.5);
    c.add([g,t]);c.setSize(76,76);c.width=76;c.height=76;c.kind='bonus_'+s.id;c.supplyId=s.id;c.supplySpent=false;
    this.dragify(c,{end:o=>this.dropDeco(o)});this.bonusDecos.push(c);return c;
  };

  const originalDropDeco=CraftRound.prototype.dropDeco;
  CraftRound.prototype.dropDeco=function(o){
    const id=o?.supplyId,before=this.chosen?.decos?.length||0,result=originalDropDeco.call(this,o);
    if(id&&(this.chosen?.decos?.length||0)>before&&!o.supplySpent){
      o.supplySpent=true;
      const left=Math.max(0,(this.supplyStock.get(id)||0)-1);this.supplyStock.set(id,left);
      const s=SUPPLIES.find(x=>x.id===id);
      telemetry('supply_use',{id,stock:left});this.refreshEconomyUI();
      this.time.delayedCall(320,()=>{if(left>0&&s&&!this.interactionLocked)this.ensureBonusDeco(s);});
    }
    return result;
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
    // Used purchased decorations are consumables. Remove their old scene objects before rebuilding available stock icons.
    for(const o of [...(this.bonusDecos||[])])if(o.supplySpent&&o.active!==false)o.destroy(true);
    this.bonusDecos=(this.bonusDecos||[]).filter(o=>o.active!==false&&!o.supplySpent);
    for(const s of SUPPLIES)this.ensureBonusDeco(s);
    this.refreshEconomyUI();
    return result;
  };

  const originalDebugState=CraftRound.prototype.debugState;
  CraftRound.prototype.debugState=function(){
    const stock={};for(const s of SUPPLIES)stock[s.id]=this.supplyStock?.get(s.id)||0;
    return {...originalDebugState.call(this),coinBalance:this.coinCount||0,coinEarned:this.coinEarned||0,supplyPurchased:[...(this.supplyPurchased||[])],supplyStock:stock,supplyMode:'consumable-stock',supplyShop:true,deadEndGuard:'required-base-materials-remain-available'};
  };
})();
