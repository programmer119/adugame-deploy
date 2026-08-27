class G1R1 extends BaseRound {
  constructor(done){super('G1R1',{gameTitle:'생활 실습',round:1,title:'빗으로 머리카락을 실제로 빗어 정돈해요'},done);}
  create(){
    super.create();this.face=this.circleFace(760,345,1.28);this.scheduleCharacterIdle();
    this.hair=this.add.graphics().setPosition(760,258).setDepth(4);this.progress=0;this.strokeDistance=0;this.lastHairPoint=null;this.lastHairTime=0;this.lastRewardCut=0;this.drawHair();
    this.comb=this.makeComb(315,405);this.hintTarget={x:315,y:405};
    this.add.text(315,505,'빗을 잡고 머리 위를 천천히 좌우로 빗어요',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
    this.dragify(this.comb,{drag:(o,p)=>this.brushMove(o,p),end:o=>this.brushEnd(o)});
    this.time.delayedCall(700,()=>this.tweens.add({targets:this.comb,scaleX:1.08,scaleY:1.08,yoyo:true,duration:350,ease:'Sine.InOut'}));
  }
  makeComb(x,y){const c=this.add.container(x,y).setName('comb'),g=this.add.graphics();g.fillStyle(COLORS.purple,1).fillRoundedRect(-64,-17,128,34,13);g.fillStyle(0x8d79e8,1).fillRoundedRect(-18,-42,36,28,8);for(let i=-50;i<=50;i+=14)g.fillStyle(COLORS.ink,.8).fillRect(i,14,4,36);c.add(g);c.setSize(148,92);c.width=148;c.height=92;return c;}
  drawHair(){
    const g=this.hair;g.clear();const stage=this.progress<.33?0:this.progress<.66?1:this.progress<1?2:3;const messy=[1,.62,.3,0][stage];
    g.lineStyle(11,COLORS.brown,1);for(let i=-75;i<=75;i+=18){const wob=(i%36===0?1:-1)*28*messy;g.beginPath();g.moveTo(i,-26);g.lineTo(i+wob,12);g.lineTo(i-wob*.45,60);g.strokePath();}
    if(stage>=1){g.lineStyle(4,0xc18a5b,.55);for(let i=-66;i<67;i+=22){g.beginPath();g.moveTo(i,-15);g.lineTo(i,55);g.strokePath();}}
  }
  brushMove(o,p){
    const inside=dist(o.x,o.y,760,285)<FEEL.brush.hairRadius;const t=this.time.now;
    if(!inside){this.lastHairPoint=null;this.lastHairTime=t;return;}
    if(this.lastHairPoint){const d=dist(this.lastHairPoint.x,this.lastHairPoint.y,o.x,o.y),dt=Math.max(16,t-this.lastHairTime),speed=d/dt*1000;if(d>=FEEL.input.dragDeadzonePx&&speed<=FEEL.brush.maxAcceptedSpeedPxPerSec){this.strokeDistance+=d;this.progress=clamp(this.strokeDistance/FEEL.brush.requiredDistance,0,1);this.drawHair();const cut=Math.floor(this.progress*4);if(cut>this.lastRewardCut){this.lastRewardCut=cut;audio.scrub();this.sparkle(o.x,o.y,2);}}}
    this.lastHairPoint={x:o.x,y:o.y};this.lastHairTime=t;
  }
  brushEnd(o){
    this.lastHairPoint=null;
    if(this.progress>=1){this.snap(o,625,500,()=>{this.happy(this.face);this.sparkle(760,245,10);this.time.delayedCall(260,()=>this.finish());});}
    else this.wrongReturn(o,'brush_incomplete',{x:760,y:285});
  }
  debugState(){return {...super.debugState(),progress:this.progress,strokeDistance:this.strokeDistance};}
}

class G1R2 extends BaseRound {
  constructor(done){super('G1R2',{gameTitle:'생활 실습',round:2,title:'물을 쓰고 비누칠하고 문질러 헹군 뒤 닦아요'},done);}
  create(){
    super.create();this.step=0;this.face=this.circleFace(1030,280,.78);this.scheduleCharacterIdle();this.scrubDistance=0;this.towelDistance=0;this.lastMove=null;
    this.sink=this.add.graphics();this.sink.fillStyle(0xdde9f0,1).fillRoundedRect(455,485,400,95,38);this.sink.lineStyle(4,COLORS.ink,.15).strokeRoundedRect(455,485,400,95,38);
    this.faucet=this.makeFaucet(650,270);this.waterStream=this.add.rectangle(650,390,14,185,COLORS.aqua,.55).setAlpha(0);
    this.hands=this.makeHands(650,455);this.soap=this.makeTool(315,350,'🧼','비누','soap');this.towel=this.makeTool(315,500,'▰','수건','towel');
    this.status=this.add.text(650,625,'수도꼭지를 눌러 손을 먼저 적셔요',{fontFamily:'Arial',fontSize:'19px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);this.hintTarget={x:650,y:270};
    this.faucet.setInteractive({useHandCursor:true}).on('pointerup',()=>this.tapFaucet());this.dragify(this.soap,{end:o=>this.dropSoap(o)});this.dragify(this.towel,{drag:(o,p)=>this.towelMove(o,p),end:o=>this.towelEnd(o)});
    this.hands.setInteractive(new Phaser.Geom.Rectangle(-125,-65,250,130),Phaser.Geom.Rectangle.Contains);this.hands.on('pointermove',p=>this.scrubMove(p));
  }
  makeFaucet(x,y){const c=this.add.container(x,y).setName('faucet'),g=this.add.graphics();g.lineStyle(20,0x8797a5,1).beginPath().moveTo(-55,65).lineTo(-55,-5).arc(0,-5,55,Math.PI,0).lineTo(55,25).strokePath();g.fillStyle(0x71828f,1).fillRoundedRect(-36,-55,72,18,8);c.add(g);c.setSize(150,145);c.width=150;c.height=145;return c;}
  makeHands(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(COLORS.peach,1).fillRoundedRect(-105,-48,92,96,38).fillRoundedRect(13,-48,92,96,38);g.lineStyle(3,COLORS.ink,.12).strokeRoundedRect(-105,-48,92,96,38).strokeRoundedRect(13,-48,92,96,38);c.add(g);c.setSize(240,130);return c;}
  makeTool(x,y,emoji,label,kind){const c=this.add.container(x,y).setName(kind);const g=this.add.graphics();g.fillStyle(0xffffff,1).fillRoundedRect(-74,-48,148,96,22);g.lineStyle(2,COLORS.ink,.14).strokeRoundedRect(-74,-48,148,96,22);c.add([g,this.add.text(0,-10,emoji,{fontSize:'38px'}).setOrigin(.5),this.add.text(0,31,label,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(148,96);c.width=148;c.height=96;c.kind=kind;return c;}
  tapFaucet(){
    const expected=[0,3].includes(this.step);if(!expected){this.curious(this.faucet);this.registerFailure('faucet_wrong_step',this.faucet);return;}
    this.markMeaningfulInput('faucet',{step:this.step});audio.water();this.tweens.add({targets:this.faucet,angle:8,yoyo:true,duration:120});this.waterStream.setAlpha(.65);this.time.delayedCall(FEEL.wash.rinseHoldMs,()=>{this.waterStream.setAlpha(0);this.sparkle(650,455,4);if(this.step===0){this.step=1;this.status.setText('비누를 손 위로 가져와 거품을 묻혀요');this.hintTarget={x:this.soap.x,y:this.soap.y};}else if(this.step===3){this.step=4;this.status.setText('수건을 손 위에서 좌우로 움직여 물기를 닦아요');this.hintTarget={x:this.towel.x,y:this.towel.y};}});
  }
  dropSoap(o){if(this.step!==1||dist(o.x,o.y,650,455)>155){this.wrongReturn(o,'soap_wrong',this.hands);return;}this.snap(o,520,465,()=>{audio.plop();this.add.text(650,435,'○   ○  ○   ○',{fontSize:'30px',color:'#7bdff2'}).setOrigin(.5).setName('foam');this.step=2;this.status.setText('손 위를 눌러 좌우로 충분히 문질러요');this.hintTarget={x:650,y:455};this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:180});});}
  scrubMove(p){if(this.step!==2||!p.isDown)return;const cur={x:p.x,y:p.y};if(this.lastMove){const d=dist(cur.x,cur.y,this.lastMove.x,this.lastMove.y);if(d>2){this.scrubDistance+=d;if(Math.floor(this.scrubDistance/80)!==Math.floor((this.scrubDistance-d)/80))audio.scrub();this.hands.setScale(1+Math.sin(this.scrubDistance/28)*.018);if(this.scrubDistance>=FEEL.wash.scrubDistance){this.hands.setScale(1);this.step=3;this.status.setText('깨끗한 물로 한 번 더 헹궈요');this.hintTarget={x:650,y:270};this.sparkle(650,455,6);}}}this.lastMove=cur;}
  towelMove(o,p){if(this.step!==4)return;const inside=dist(o.x,o.y,650,455)<150;if(!inside){this.lastTowel=null;return;}if(this.lastTowel){const d=dist(this.lastTowel.x,this.lastTowel.y,o.x,o.y);this.towelDistance+=d;if(Math.floor(this.towelDistance/75)!==Math.floor((this.towelDistance-d)/75))audio.scrub();}this.lastTowel={x:o.x,y:o.y};}
  towelEnd(o){this.lastTowel=null;if(this.step===4&&this.towelDistance>=FEEL.wash.towelDistance){this.snap(o,790,465,()=>{this.step=5;this.status.setText('깨끗하게 끝!');this.happy(this.face);this.sparkle(650,455,8);this.finish();});}else this.wrongReturn(o,'towel_incomplete',this.hands);}
  debugState(){return {...super.debugState(),step:this.step,scrubDistance:this.scrubDistance,towelDistance:this.towelDistance};}
}

class G1R3 extends BaseRound {
  constructor(done){super('G1R3',{gameTitle:'생활 실습',round:3,title:'식사 전 준비를 실제 행동으로 처음부터 끝까지 해요'},done);}
  create(){
    super.create();this.step=0;this.face=this.circleFace(1080,285,.72);this.scheduleCharacterIdle();this.wipeDistance=0;this.handScrub=0;this.stack=[];
    this.add.text(175,155,'1 손 씻기',{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#607086'});this.faucet=this.makeMiniFaucet(180,250);this.hands=this.makeMiniHands(300,255);
    this.table=this.add.graphics();this.table.fillStyle(0xd6a56e,1).fillRoundedRect(470,330,520,230,24);this.table.lineStyle(4,COLORS.brown,.35).strokeRoundedRect(470,330,520,230,24);
    this.sponge=this.makeCard(210,405,'▰','행주','sponge');this.plate=this.add.ellipse(650,630,180,55,0xeef4f8,1).setStrokeStyle(3,COLORS.ink,.15);this.plate.home={x:650,y:630};this.plate.width=180;this.plate.height=70;this.plate.setName('plate');
    this.foods=[this.makeFood(820,625,'bread',COLORS.yellow,'빵'),this.makeFood(930,625,'cheese',0xffd166,'치즈'),this.makeFood(1040,625,'lettuce',COLORS.green,'상추')];
    this.wrapper=this.makeCard(1120,500,'▱','포장지','wrapper');this.bin=this.add.container(1120,390);const bg=this.add.graphics();bg.fillStyle(0x9fb7a6,1).fillRoundedRect(-52,-65,104,130,16);bg.fillStyle(COLORS.dark,.25).fillRect(-60,-72,120,14);this.bin.add(bg);this.bin.setSize(120,150);
    this.status=this.add.text(650,595,'손을 씻는 것부터 시작해요',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);this.hintTarget={x:180,y:250};
    this.faucet.setInteractive({useHandCursor:true}).on('pointerup',()=>this.startHands());this.hands.setInteractive(new Phaser.Geom.Rectangle(-70,-45,140,90),Phaser.Geom.Rectangle.Contains).on('pointermove',p=>this.handMove(p));
    this.dragify(this.sponge,{drag:(o,p)=>this.wipeMove(o,p),end:o=>this.spongeEnd(o)});this.dragify(this.plate,{end:o=>this.plateEnd(o)});this.foods.forEach(o=>this.dragify(o,{end:f=>this.foodEnd(f)}));this.dragify(this.wrapper,{end:o=>this.wrapperEnd(o)});
  }
  makeMiniFaucet(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.lineStyle(15,0x8797a5,1).beginPath().moveTo(-30,32).lineTo(-30,-2).arc(0,-2,30,Math.PI,0).lineTo(30,15).strokePath();c.add(g);c.setSize(95,90);return c;}
  makeMiniHands(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(COLORS.peach,1).fillRoundedRect(-62,-30,54,60,25).fillRoundedRect(8,-30,54,60,25);c.add(g);c.setSize(140,90);return c;}
  makeCard(x,y,emoji,label,kind){const c=this.add.container(x,y).setName(kind),g=this.add.graphics();g.fillStyle(0xffffff,1).fillRoundedRect(-65,-40,130,80,18);g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-65,-40,130,80,18);c.add([g,this.add.text(-32,0,emoji,{fontSize:'30px'}).setOrigin(.5),this.add.text(20,0,label,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(130,80);c.width=130;c.height=80;c.kind=kind;return c;}
  makeFood(x,y,kind,color,label){const c=this.add.container(x,y).setName(kind),g=this.add.graphics();g.fillStyle(color,1).fillRoundedRect(-46,-18,92,36,14);c.add([g,this.add.text(0,34,label,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(100,72);c.width=100;c.height=72;c.kind=kind;return c;}
  startHands(){if(this.step!==0){this.registerFailure('routine_faucet_wrong',this.faucet);this.curious(this.faucet);return;}audio.water();this.status.setText('손을 좌우로 문질러 씻어요');this.hintTarget={x:300,y:255};this.step=.5;}
  handMove(p){if(this.step!==.5||!p.isDown)return;const cur={x:p.x,y:p.y};if(this.lastHand){const d=dist(cur.x,cur.y,this.lastHand.x,this.lastHand.y);this.handScrub+=d;if(this.handScrub>=220){this.step=1;this.sparkle(300,255,5);this.status.setText('행주로 테이블 전체를 닦아요');this.hintTarget={x:this.sponge.x,y:this.sponge.y};}}this.lastHand=cur;}
  wipeMove(o,p){if(this.step!==1)return;if(o.x>=480&&o.x<=980&&o.y>=340&&o.y<=555){if(this.lastWipe){const d=dist(this.lastWipe.x,this.lastWipe.y,o.x,o.y);this.wipeDistance+=d;if(Math.floor(this.wipeDistance/90)!==Math.floor((this.wipeDistance-d)/90))audio.scrub();}this.lastWipe={x:o.x,y:o.y};}else this.lastWipe=null;}
  spongeEnd(o){this.lastWipe=null;if(this.step===1&&this.wipeDistance>=FEEL.wash.wipeDistance){this.snap(o,520,530,()=>{this.step=2;this.status.setText('접시를 식탁 가운데 놓아요');this.hintTarget={x:this.plate.x,y:this.plate.y};});}else this.wrongReturn(o,'routine_wipe_incomplete',{x:730,y:445});}
  plateEnd(o){if(this.step===2&&dist(o.x,o.y,730,450)<170){this.snap(o,730,470,()=>{this.step=3;this.status.setText('빵·치즈·상추를 접시에 차례로 올려 샌드위치를 만들어요');this.hintTarget={x:this.foods[0].x,y:this.foods[0].y};});}else this.wrongReturn(o,'routine_plate_wrong',{x:730,y:470});}
  foodEnd(o){if(this.step!==3){this.wrongReturn(o,'routine_food_wrong',this.plate);return;}if(dist(o.x,o.y,730,450)<180){const y=445-this.stack.length*24;this.snap(o,730,y,()=>{this.stack.push(o);this.hintTarget=this.stack.length<this.foods.length?{x:this.foods[this.stack.length].home.x,y:this.foods[this.stack.length].home.y}:{x:this.wrapper.x,y:this.wrapper.y};if(this.stack.length===this.foods.length){this.step=4;this.status.setText('마지막으로 포장지를 쓰레기통에 정리해요');this.sparkle(730,430,7);}});}else this.wrongReturn(o,'routine_food_drop',this.plate);}
  wrapperEnd(o){if(this.step===4&&dist(o.x,o.y,this.bin.x,this.bin.y)<130){this.snap(o,this.bin.x,this.bin.y,()=>{o.setAlpha(.2);this.step=5;this.happy(this.face);this.status.setText('준비 완료!');this.finish();});}else this.wrongReturn(o,'routine_cleanup_wrong',this.bin);}
  debugState(){return {...super.debugState(),step:this.step,wipeDistance:this.wipeDistance,stack:this.stack.length};}
}
