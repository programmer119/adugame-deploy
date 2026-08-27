class DiscoveryRound extends BaseRound {
  constructor(key,meta,done){super(key,meta,done);this.discoveries=new Set();}
  discover(id,x,y,msg){if(this.discoveries.has(id))return;this.discoveries.add(id);this.sparkle(x,y,7);const note=this.add.text(x,y-42,'발견! '+msg,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#6c63ff',padding:{left:10,right:10,top:6,bottom:6}}).setOrigin(.5).setDepth(2500);this.tweens.add({targets:note,y:y-72,alpha:0,duration:1050,hold:420,onComplete:()=>note.destroy()});audio.pop();telemetry('discovery',{id,round:this.scene.key});}
  discoveryScore(){return Math.min(100,70+this.discoveries.size*10);}
  debugState(){return {...super.debugState(),discoveries:[...this.discoveries]};}
}

class G2R1 extends DiscoveryRound {
  constructor(done){super('G2R1',{gameTitle:'인터랙티브 하우스',round:1,title:'주방 안의 물건을 자유롭게 만지며 샌드위치를 만들어요'},done);}
  create(){
    super.create();this.face=this.circleFace(1090,305,.76);this.scheduleCharacterIdle();this.stack=[];this.stackDone=false;
    this.counter=this.add.graphics();this.counter.fillStyle(0xd9b07a,1).fillRoundedRect(425,425,560,145,24);this.counter.lineStyle(4,COLORS.brown,.28).strokeRoundedRect(425,425,560,145,24);
    this.plate=this.add.ellipse(710,510,240,70,0xeaf1f5,1).setStrokeStyle(4,COLORS.ink,.15);
    this.fridge=this.makeFridge(255,300);this.toaster=this.makeToaster(470,290);this.sink=this.makeSink(760,285);this.bin=this.makeBin(1120,525);
    this.foods=[this.food('bread',COLORS.yellow,500,610,'빵'),this.food('cheese',0xffd166,620,620,'치즈'),this.food('lettuce',COLORS.green,740,620,'상추'),this.food('tomato',COLORS.red,860,620,'토마토'),this.food('banana',0xffe66d,980,610,'바나나')];
    this.cup=this.food('cup',COLORS.sky,850,320,'컵');this.cup.water=false;this.hintTarget={x:500,y:610};
    this.add.text(705,650,'미션: 접시 위에 3가지 이상 재료를 자유 순서로 쌓아 샌드위치를 완성해요',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
  }
  makeFridge(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0xe9eef2,1).fillRoundedRect(-85,-145,170,290,22);g.lineStyle(3,COLORS.ink,.15).strokeRoundedRect(-85,-145,170,290,22);g.lineStyle(3,COLORS.ink,.15).lineBetween(0,-145,0,145);c.add(g);c.setSize(190,310);c.open=false;c.setInteractive({useHandCursor:true}).on('pointerup',()=>{c.open=!c.open;this.tweens.add({targets:c,scaleX:c.open?1.035:1,duration:120});this.discover('fridge',x,y-155,c.open?'냉장고 문이 열렸어요':'냉장고 문도 닫을 수 있어요');audio.click();});return c;}
  makeToaster(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0xa9c6d9,1).fillRoundedRect(-85,-55,170,110,24);g.fillStyle(COLORS.ink,.5).fillRoundedRect(-48,-34,96,12,6);const lever=this.add.rectangle(91,10,12,44,0x566573,1);c.add([g,lever]);c.setSize(195,150);c.lever=lever;return c;}
  makeSink(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0xc7d6df,1).fillRoundedRect(-100,20,200,75,30);g.lineStyle(13,0x8495a2,1).beginPath().moveTo(-35,20).lineTo(-35,-35).arc(0,-35,35,Math.PI,0).lineTo(35,-10).strokePath();c.add(g);c.setSize(220,150);c.setInteractive({useHandCursor:true}).on('pointerup',()=>{audio.water();this.discover('sink',x,y-85,'수도도 직접 작동해요');for(let i=0;i<7;i++){const d=this.add.circle(x+10,y-5,4,COLORS.aqua,.8);this.tweens.add({targets:d,y:y+70,alpha:0,duration:420,delay:i*35,onComplete:()=>d.destroy()});}});return c;}
  makeBin(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0x9fb7a6,1).fillRoundedRect(-48,-60,96,120,15);g.fillStyle(COLORS.dark,.25).fillRect(-55,-67,110,12);c.add(g);c.setSize(110,140);return c;}
  food(kind,color,x,y,label){const c=this.add.container(x,y).setName(kind);const g=this.add.graphics();if(kind==='banana'){g.lineStyle(18,color,1).beginPath().arc(0,-8,42,.25,2.5).strokePath();}else if(kind==='cup'){g.fillStyle(color,1).fillRoundedRect(-35,-40,70,80,18);g.lineStyle(6,COLORS.ink,.2).strokeCircle(40,-2,18);}else g.fillStyle(color,1).fillRoundedRect(-52,-18,104,36,16);c.add([g,this.add.text(0,42,label,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(120,90);c.width=120;c.height=90;c.kind=kind;c.state='raw';this.dragify(c,{end:o=>this.dropFood(o)});return c;}
  dropFood(o){
    const dPlate=dist(o.x,o.y,710,500),dToast=dist(o.x,o.y,470,290),dMouth=dist(o.x,o.y,1090,305),dBin=dist(o.x,o.y,1120,525),dSink=dist(o.x,o.y,760,285);
    if(o.kind==='bread'&&dToast<125&&o.state==='raw'){this.snap(o,470,245,()=>{this.toaster.lever.y=24;this.discover('toast',470,205,'빵을 토스터에 넣을 수 있어요');this.time.delayedCall(FEEL.toaster.heatMs,()=>{o.state='toast';o.first?.setTint?.(0xc98945);this.toaster.lever.y=10;this.tweens.add({targets:o,y:245-FEEL.toaster.risePx,duration:180,ease:'Back.Out'});audio.pop();});});return;}
    if(o.kind==='cup'&&dSink<125){o.water=true;this.snap(o,815,360,()=>{audio.water();this.discover('cupwater',820,270,'컵에 물도 받을 수 있어요');});return;}
    if(dMouth<FEEL.eat.mouthRadius+35&&o.kind!=='cup'){this.snap(o,1025,330,()=>{this.discover('taste-'+o.kind,1060,220,'캐릭터에게 먹여볼 수도 있어요');this.time.delayedCall(FEEL.eat.biteMs,()=>o.setScale(.86));this.time.delayedCall(FEEL.eat.chewMs,()=>this.happy(this.face));});return;}
    if(dBin<110){this.snap(o,1120,515,()=>{o.setAlpha(.15);this.discover('bin',1120,430,'원하지 않는 물건은 정리할 수 있어요');});return;}
    if(o.kind==='banana'&&dPlate<180){o.state=o.state==='raw'?'peeled':'raw';this.discover('banana',900,460,'바나나를 다른 재료처럼 섞어도 돼요');this.snap(o,710+(this.stack.length%2?14:-14),475-this.stack.length*24,()=>this.addToStack(o));return;}
    if(dPlate<190&&['bread','cheese','lettuce','tomato'].includes(o.kind)){this.snap(o,710+(this.stack.length%2?10:-10),478-this.stack.length*25,()=>this.addToStack(o));return;}
    this.wrongReturn(o,'kitchen_drop',this.plate);
  }
  addToStack(o){if(this.stack.includes(o))return;this.stack.push(o);if(this.stack.length>=4)this.discover('tower',710,390,'높이 쌓으면 캐릭터가 놀라요');if(this.stack.length>=3&&!this.stackDone){this.stackDone=true;this.happy(this.face);this.time.delayedCall(520,()=>this.finish({score:this.discoveryScore()}));}}
  debugState(){return {...super.debugState(),stack:this.stack.length,stackDone:this.stackDone};}
}

class G2R2 extends DiscoveryRound {
  constructor(done){super('G2R2',{gameTitle:'인터랙티브 하우스',round:2,title:'세탁기를 실제 순서로 조작하고 주변 물건도 자유롭게 만져요'},done);}
  create(){
    super.create();this.face=this.circleFace(1060,260,.72);this.scheduleCharacterIdle();this.washerOpen=false;this.loaded=new Set();this.washed=false;this.dried=new Set();this.running=false;
    this.washer=this.makeWasher(650,330);this.rack=this.add.rectangle(925,500,250,135,0xd4c5a9,.35).setStrokeStyle(5,COLORS.brown,.6);this.basket=this.add.rectangle(300,520,180,110,0xbca37f,.4).setStrokeStyle(5,COLORS.brown,.55);
    this.items=[this.item('shirt',305,220,'👕','셔츠'),this.item('pants',305,330,'👖','바지'),this.item('sock',305,440,'🧦','양말'),this.item('detergent',1000,390,'🧴','세제')];this.hintTarget={x:650,y:350};
    this.add.text(650,640,'미션: 문 열기 → 옷+세제 → 문 닫기 → 시작 → 꺼내서 건조대에 널기',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
  }
  makeWasher(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0xcbd5e1,1).fillRoundedRect(-125,-155,250,310,28);g.fillStyle(0x8bb7d9,1).fillCircle(0,25,88);g.lineStyle(8,COLORS.dark,.5).strokeCircle(0,25,88);const door=this.add.circle(0,25,78,0xffffff,.08).setStrokeStyle(4,COLORS.ink,.35).setInteractive({useHandCursor:true});const start=this.add.text(68,-95,'▶',{fontSize:'26px',color:'#24314a',backgroundColor:'#ffffff',padding:{left:9,right:9,top:5,bottom:5}}).setOrigin(.5).setInteractive({useHandCursor:true});c.add([g,door,start]);c.setSize(270,330);door.on('pointerup',()=>{if(this.running)return;this.washerOpen=!this.washerOpen;door.setAlpha(this.washerOpen?.35:.12);audio.click();this.discover('door',x,y-175,'세탁기 문을 직접 열고 닫아요');});start.on('pointerup',()=>this.startWash());c.door=door;c.start=start;return c;}
  item(kind,x,y,emoji,label){const c=this.add.container(x,y).setName(kind),g=this.add.graphics();g.fillStyle(0xffffff,1).fillCircle(0,0,50);g.lineStyle(2,COLORS.ink,.12).strokeCircle(0,0,50);c.add([g,this.add.text(0,-8,emoji,{fontSize:'40px'}).setOrigin(.5),this.add.text(0,40,label,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(105,105);c.width=105;c.height=105;c.kind=kind;this.dragify(c,{end:o=>this.drop(o)});return c;}
  drop(o){
    const dw=dist(o.x,o.y,650,355),dh=dist(o.x,o.y,1060,260),db=dist(o.x,o.y,300,520),dr=dist(o.x,o.y,925,500);
    if(o.kind==='sock'&&dh<105){this.snap(o,1060,180,()=>{this.discover('sockhat',1060,145,'양말이 모자가 됐어요');this.happy(this.face);this.time.delayedCall(850,()=>this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:220}));});return;}
    if(db<120){this.snap(o,300,510,()=>this.discover('basket',300,435,'바구니에는 물건을 자유롭게 넣을 수 있어요'));return;}
    if(this.washed&&dr<165&&['shirt','pants','sock'].includes(o.kind)){const idx=this.dried.size;this.snap(o,850+idx*75,475,()=>{this.dried.add(o.kind);if(this.dried.size>=3)this.finish({score:this.discoveryScore()});});return;}
    if(dw<150){if(!this.washerOpen||this.running){this.curious(this.washer);this.wrongReturn(o,'washer_closed',this.washer);return;}this.loaded.add(o.kind);this.snap(o,650,355,()=>o.setAlpha(.28));return;}
    this.wrongReturn(o,'laundry_drop',this.washer);
  }
  startWash(){
    if(this.running||this.washed)return;if(this.washerOpen){this.curious(this.washer);this.registerFailure('start_open',this.washer);return;}const needed=['shirt','pants','sock','detergent'];if(!needed.every(x=>this.loaded.has(x))){this.curious(this.washer);this.registerFailure('start_missing',this.washer);return;}this.running=true;audio.water();const spin=this.add.arc(650,355,70,0,315,false,0x7bdff2,.22).setStrokeStyle(11,0x5aa9e6,.8);this.tweens.add({targets:spin,angle:1080,duration:1450,ease:'Sine.InOut',onComplete:()=>{spin.destroy();this.running=false;this.washed=true;this.discover('washcycle',650,185,'세탁 사이클이 끝났어요');this.items.filter(o=>['shirt','pants','sock'].includes(o.kind)).forEach((o,i)=>{o.setAlpha(1);o.x=760+i*78;o.y=585;o.home={x:o.x,y:o.y};});this.items.find(o=>o.kind==='detergent').setAlpha(.3);this.hintTarget={x:650,y:355};}});
  }
  debugState(){return {...super.debugState(),open:this.washerOpen,loaded:[...this.loaded],washed:this.washed,dried:[...this.dried]};}
}

class G2R3 extends DiscoveryRound {
  constructor(done){super('G2R3',{gameTitle:'인터랙티브 하우스',round:3,title:'도구를 실제로 써서 장난감 자동차를 수리해요'},done);}
  create(){
    super.create();this.stage=0;this.rotation=0;this.lastAngle=null;this.face=this.circleFace(1070,260,.72);this.scheduleCharacterIdle();
    this.car=this.makeCar(705,405);this.wheelSpot={x:575,y:465};this.wheel=this.item(300,210,'⚙️','바퀴','wheel');this.screw=this.item(300,330,'●','나사','screw');this.driver=this.item(300,455,'🪛','드라이버','driver');this.paint=this.item(1080,390,'🎨','페인트','paint');this.ball=this.item(1080,500,'⚽','공','ball');this.cloth=this.item(900,610,'▰','천','cloth');this.pump=this.item(1080,610,'⇧','펌프','pump');this.box=this.add.rectangle(885,520,165,110,0xc69c6d,.42).setStrokeStyle(4,COLORS.brown,.55);
    [this.wheel,this.screw,this.driver,this.paint,this.ball,this.cloth,this.pump].forEach(o=>this.dragify(o,{drag:(obj,p)=>{if(obj===this.driver&&this.stage===2&&dist(obj.x,obj.y,575,465)<110)this.rotateGesture(p);},end:o=>this.drop(o)}));this.hintTarget={x:300,y:210};
    this.add.text(700,650,'미션: 바퀴 → 나사 → 드라이버를 돌려 조이기',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
  }
  makeCar(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(COLORS.red,1).fillRoundedRect(-150,-55,300,110,30);g.fillStyle(0x8ecae6,1).fillRoundedRect(-58,-105,116,58,18);g.fillStyle(COLORS.dark,1).fillCircle(105,60,42);g.fillStyle(COLORS.dark,.25).fillCircle(-115,60,42);c.add(g);c.setSize(330,220);return c;}
  item(x,y,emoji,label,kind){const c=this.add.container(x,y).setName(kind),g=this.add.graphics();g.fillStyle(0xffffff,1).fillRoundedRect(-68,-44,136,88,18);g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-68,-44,136,88,18);c.add([g,this.add.text(0,-8,emoji,{fontSize:'34px'}).setOrigin(.5),this.add.text(0,29,label,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(136,88);c.width=136;c.height=88;c.kind=kind;return c;}
  drop(o){
    const dWheel=dist(o.x,o.y,575,465),dCar=dist(o.x,o.y,705,405),dBox=dist(o.x,o.y,885,520),dBall=dist(o.x,o.y,this.ball.x,this.ball.y);
    if(o.kind==='ball'&&dBox<120){this.snap(o,885,510,()=>this.discover('ballbox',885,435,'공도 상자에 정리할 수 있어요'));return;}
    if(o.kind==='pump'&&dist(o.x,o.y,this.ball.x,this.ball.y)<130){this.snap(o,this.ball.x+70,this.ball.y,()=>{this.discover('pumpball',1030,430,'펌프로 공에 바람도 넣을 수 있어요');this.tweens.add({targets:this.ball,scale:1.15,yoyo:true,duration:240});});return;}
    if(o.kind==='paint'&&dCar<190){this.snap(o,840,325,()=>{this.discover('paint',750,260,'자동차 색을 꾸밀 수도 있어요');this.car.setTint?.(0x88ccff);});return;}
    if(o.kind==='cloth'&&dCar<190){this.snap(o,810,420,()=>{this.sparkle(705,405,10);this.discover('polish',750,270,'차를 닦으면 반짝여요');});return;}
    if(this.stage===0&&o.kind==='wheel'&&dWheel<125){this.snap(o,575,465,()=>{this.stage=1;this.hintTarget={x:this.screw.home.x,y:this.screw.home.y};});return;}
    if(this.stage===1&&o.kind==='screw'&&dWheel<115){this.snap(o,575,465,()=>{o.setScale(.55);o._baseScaleX=.55;o._baseScaleY=.55;this.stage=2;this.hintTarget={x:this.driver.home.x,y:this.driver.home.y};});return;}
    if(this.stage===2&&o.kind==='driver'&&dWheel<125){this.snap(o,575,405,()=>{this.driver.home={x:575,y:405};this.add.text(720,585,'드라이버 손잡이를 원을 그리듯 돌려 나사를 조여요',{fontFamily:'Arial',fontSize:'16px',color:'#607086'}).setOrigin(.5);});return;}
    this.wrongReturn(o,'repair_wrong',{x:575,y:465});
  }
  rotateGesture(p){const a=Phaser.Math.RadToDeg(Math.atan2(p.y-465,p.x-575));if(this.lastAngle!==null){const d=Math.abs(Phaser.Math.Angle.ShortestBetween(this.lastAngle,a));this.rotation+=d;this.screw.setScale(clamp(.55-this.rotation/1700,.19,.55));this.driver.setAngle(this.driver.angle+d*.6);if(this.rotation>=FEEL.screwdriver.requiredAngle&&this.stage===2){this.stage=3;this.discover('tight',585,340,'나사가 실제로 조여졌어요');this.happy(this.face);this.time.delayedCall(360,()=>this.finish({score:this.discoveryScore()}));}}this.lastAngle=a;}
  debugState(){return {...super.debugState(),stage:this.stage,rotation:this.rotation};}
}
