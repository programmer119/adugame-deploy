// ADUGAME v5 slime-store rebuild.
// Structural target: customer -> craft -> tactile play -> decorate -> serve -> reaction -> jar shelf -> next customer.
(() => {
  const LegacyCraftRound = CraftRound;
  const CUSTOMER_NAMES=['민','루','아리','보','나나','솔'];
  const makeOrders=(round,first)=>{
    if(round===1)return [first,{color:'pink',deco:'heart'}];
    if(round===2)return [first,{color:'blue',deco:'star',container:'square'},{color:'pink',deco:'heart',container:'round'}];
    return [first,{color:'green',deco:'flower',freeExtra:true},{color:'pink',deco:'heart',freeExtra:true}];
  };
  const colorValue={blue:COLORS.blue,green:COLORS.green,pink:0xff8fab};
  const decoGlyph={star:'★',flower:'✿',heart:'♥',banana:'◒'};

  class CraftStoreV5 extends LegacyCraftRound {
    constructor(key,meta,done,order){
      super(key,meta,done,order);this.orders=makeOrders(meta.round,order);this.orderIndex=0;this.order=this.orders[0];this.ordersServed=0;this.finishedJars=[];
    }
    create(){
      super.create();
      this.storeShelf=this.add.container(1080,630).setName('store_shelf').setDepth(25);const g=this.add.graphics();g.fillStyle(0xc69c6d,.32).fillRoundedRect(-135,-38,270,76,17);g.lineStyle(3,COLORS.brown,.5).strokeRoundedRect(-135,-38,270,76,17);g.lineStyle(5,COLORS.brown,.42).lineBetween(-125,20,125,20);this.storeShelf.add(g);
      this.customerName=this.add.text(1080,365,CUSTOMER_NAMES[0],{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#607086',backgroundColor:'#ffffffcc',padding:{left:8,right:8,top:4,bottom:4}}).setOrigin(.5).setDepth(40);
      this.orderCounter=this.add.text(1080,405,`주문 1 / ${this.orders.length}`,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#607086'}).setOrigin(.5).setDepth(40);
      GAMES[2].rounds=['2회 고객 주문','3회 복합 주문','3회 자유 장식 주문'];GAMES[2].dna='고객 주문 · 촉감 · 장식 · 진열 · 다음 주문';
    }
    makeFinishedJar(){
      const jar=this.add.container(650,420).setName('finished_jar_'+this.ordersServed).setDepth(70),g=this.add.graphics(),fill=colorValue[this.chosen.color]||COLORS.purple;
      g.fillStyle(0xffffff,.94).fillRoundedRect(-38,-52,76,104,18);g.lineStyle(3,COLORS.ink,.18).strokeRoundedRect(-38,-52,76,104,18);g.fillStyle(fill,.86).fillRoundedRect(-31,-26,62,66,15);g.fillStyle(COLORS.dark,.28).fillRoundedRect(-32,-60,64,13,5);jar.add(g);
      const marks=this.chosen.decos.slice(0,4).map(k=>decoGlyph[k]||'•').join('');if(marks)jar.add(this.add.text(0,7,marks,{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5));jar.setScale(.9);this.finishedJars.push(jar);return jar;
    }
    serve(){
      const colorOk=this.chosen.color===this.order.color,decoOk=this.chosen.decos.includes(this.order.deco),containerOk=!this.order.container||this.chosen.container===this.order.container,mixOk=this.mixed;
      if(!(colorOk&&decoOk&&containerOk&&mixOk)){
        this.curious(this.customer);this.tweens.add({targets:this.orderIcons,scale:1.14,yoyo:true,repeat:1,duration:140});this.status.setText(!mixOk?'재료를 넣고 충분히 섞어야 해요':'주문 아이콘을 다시 확인해요. 만든 것은 그대로 유지돼요');this.registerFailure('serve_mismatch',this.orderBubble);return;
      }
      if(this.interactionLocked)return;this.serveButton.disableInteractive();this.interactionLocked=true;telemetry('serve_success',{orderIndex:this.orderIndex,color:this.chosen.color,decos:this.chosen.decos,container:this.chosen.container});
      const jar=this.makeFinishedJar(),slot=this.finishedJars.length-1;
      this.time.delayedCall(100,()=>this.tweens.add({targets:this.customer,scaleX:1.05,scaleY:1.05,duration:120}));
      this.time.delayedCall(220,()=>this.happy(this.customer));this.time.delayedCall(320,()=>audio.success());
      const coins=this.meta.round===1?3:this.meta.round===2?5:8;this.time.delayedCall(420,()=>this.coinBurst(coins));
      this.time.delayedCall(600,()=>this.tweens.add({targets:jar,x:1000+(slot%4)*52,y:628,scale:.48,duration:380,ease:'Cubic.InOut'}));
      this.time.delayedCall(980,()=>{
        this.ordersServed++;this.status.setText(`완성품 ${this.ordersServed}개가 진열대에 쌓였어요`);
        if(this.ordersServed<this.orders.length){this.orderIndex++;this.order=this.orders[this.orderIndex];this.prepareNextOrder();}
        else{const creativity=Math.min(10,Math.max(0,this.chosen.decos.length-1)*5);this.interactionLocked=false;this.finish({score:90+creativity});}
      });
    }
    prepareNextOrder(){
      if(this.slimeBlob){this.slimeBlob.zone?.destroy();this.slimeBlob.graphics?.destroy();this.slimeBlob=null;}
      if(this.liquid?.active)this.liquid.destroy();this.liquid=null;this.bowl.setAlpha(1);
      this.ingredients.clear();this.chosen={color:null,decos:[],container:null};this.mixed=false;this.mixAngle=0;this.mixStart=0;this.lastAngle=null;this.liquidColor=null;
      this.children.list.filter(o=>o?.name?.startsWith('deco_')).forEach(o=>{
        o.setVisible(true).setAlpha(1).setScale(1);o.x=o.home?.x??o.x;o.y=o.home?.y??o.y;
        const w=Math.max(FEEL.input.minHitPx,(o.width||82)*FEEL.input.hitScale),h=Math.max(FEEL.input.minHitPx,(o.height||82)*FEEL.input.hitScale);
        o.setInteractive(new Phaser.Geom.Rectangle(-w/2,-h/2,w,h),Phaser.Geom.Rectangle.Contains);this.input.setDraggable(o);
      });
      [this.base,this.activator].forEach(o=>{o.setVisible(true).setAlpha(1);o.x=o.home.x;o.y=o.home.y;});
      this.orderIcons.setText(this.orderText());this.orderCounter.setText(`주문 ${this.orderIndex+1} / ${this.orders.length}`);this.customerName.setText(CUSTOMER_NAMES[this.orderIndex%CUSTOMER_NAMES.length]);
      this.customer.setX(1325).setScale(1);this.tweens.add({targets:this.customer,x:1080,duration:420,ease:'Cubic.Out'});this.orderBubble.setScale(.82);this.tweens.add({targets:this.orderBubble,scale:1,duration:220,ease:'Back.Out'});
      this.status.setText('다음 손님이에요. BASE와 ACT부터 다시 만들어봐요');this.hintTarget={x:this.base.x,y:this.base.y};this.serveButton.setInteractive({useHandCursor:true});this.interactionLocked=false;telemetry('next_order',{orderIndex:this.orderIndex,order:this.order});
    }
    debugState(){return {...super.debugState(),benchmarkV5:'persistent-slime-store',orderIndex:this.orderIndex,totalOrders:this.orders.length,ordersServed:this.ordersServed,shelfCount:this.finishedJars.filter(j=>j.active!==false).length};}
  }

  CraftRound=CraftStoreV5;
})();