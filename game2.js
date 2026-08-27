class DiscoveryRound extends BaseRound {
  constructor(key,meta,done){ super(key,meta,done); this.discoveries=new Set(); }
  discover(id,x,y,msg){ if(this.discoveries.has(id))return; this.discoveries.add(id); this.sparkle(x,y,7); const note=this.add.text(x,y-35,'발견! '+msg,{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#6c63ff',padding:{left:10,right:10,top:6,bottom:6}}).setOrigin(.5).setDepth(1500).setAlpha(1).setData('born',true); this.tweens.add({targets:note,y:y-55,duration:180,ease:'Back.Out'}); audio.pop(); }
  discoveryScore(){ return Math.min(100,70+this.discoveries.size*10); }
}

class G2R1 extends DiscoveryRound {
  constructor(done){ super('G2R1',{gameTitle:'인터랙티브 하우스',round:1,title:'샌드위치를 만들되, 주방을 마음껏 만져봐요'},done); }
  create(){ super.create(); this.stack=[]; this.face=this.circleFace(1020,330,.8); this.plate=this.add.ellipse(700,500,260,75,0xeef4f8,1).setStrokeStyle(4,COLORS.ink,.2); this.toaster=this.makeToaster(370,305); this.trash=this.makeBin(1080,520); this.hintTarget={x:520,y:520};
    const foods=[['빵',COLORS.yellow,520,500],['치즈',0xffd166,620,560],['토마토',COLORS.red,760,560],['상추',COLORS.green,860,500],['바나나',0xffe66d,950,540]];
    this.foods=foods.map((f,i)=>this.food(f[0],f[1],f[2],f[3],i));
    this.add.text(700,635,'미션: 접시 위에 재료를 3개 이상 쌓아 샌드위치를 완성하세요',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#607086'}).setOrigin(.5);
    this.input.on('pointerup',()=>this.cleanupNotes());
  }
  cleanupNotes(){ this.children.list.filter(o=>o.getData&&o.getData('born')).forEach(o=>this.tweens.add({targets:o,alpha:0,y:o.y-30,duration:900,onComplete:()=>o.destroy()})); }
  makeToaster(x,y){ const c=this.add.container(x,y); const g=this.add.graphics();g.fillStyle(0xa9c6d9,1).fillRoundedRect(-85,-55,170,110,24);g.fillStyle(COLORS.ink,.5).fillRoundedRect(-48,-34,96,12,6); const t=this.add.text(0,72,'토스터',{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5); c.add([g,t]);c.setSize(190,150); return c; }
  makeBin(x,y){ const c=this.add.container(x,y);const g=this.add.graphics();g.fillStyle(0x9fb7a6,1).fillRoundedRect(-48,-60,96,120,15);g.fillStyle(COLORS.dark,.25).fillRect(-55,-67,110,12);c.add(g);c.setSize(110,140);return c; }
  food(name,color,x,y,i){ const c=this.add.container(x,y); const g=this.add.graphics(); if(name==='빵')g.fillStyle(color,1).fillRoundedRect(-54,-24,108,48,18); else if(name==='바나나'){g.lineStyle(18,color,1).beginPath().arc(0,-8,42,.25,2.5).strokePath();} else g.fillStyle(color,1).fillRoundedRect(-52,-18,104,36,16); const t=this.add.text(0,42,name,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5);c.add([g,t]);c.setSize(120,90);c.width=120;c.height=90;c.kind=name;c.idx=i;
    this.dragify(c,{end:o=>this.dropFood(o)}); return c; }
  dropFood(o){ const dPlate=Phaser.Math.Distance.Between(o.x,o.y,700,500), dToast=Phaser.Math.Distance.Between(o.x,o.y,370,305), dMouth=Phaser.Math.Distance.Between(o.x,o.y,1020,330), dBin=Phaser.Math.Distance.Between(o.x,o.y,1080,520);
    if(o.kind==='빵'&&dToast<120){ this.snap(o,370,255,()=>{ this.discover('toast',370,240,'빵이 구워졌어요'); this.time.delayedCall(700,()=>{this.tweens.add({targets:o,y:205,duration:180,ease:'Back.Out'}); audio.pop();});}); return; }
    if(dMouth<105){ this.snap(o,960,350,()=>{this.discover('taste-'+o.kind,1000,300,'먹어볼 수도 있어요');this.happy(this.face);this.time.delayedCall(650,()=>this.tweens.add({targets:o,alpha:.55,scale:.82,duration:180}));});return;}
    if(dBin<100){ this.snap(o,1080,500,()=>{this.discover('bin',1080,430,'정리도 할 수 있어요');this.tweens.add({targets:o,alpha:0,duration:220});});return; }
    if(dPlate<170){ const y=478-this.stack.length*26; const x=700+(this.stack.length%2?8:-8); this.snap(o,x,y,()=>{this.stack.push(o); if(this.stack.length>=4)this.discover('tower',700,400,'높게 쌓으면 더 재밌어요'); if(this.stack.length>=3){ this.time.delayedCall(420,()=>this.finish({score:this.discoveryScore()})); }});return;}
    this.wrongReturn(o);
  }
}

class G2R2 extends DiscoveryRound {
  constructor(done){ super('G2R2',{gameTitle:'인터랙티브 하우스',round:2,title:'세탁 미션과 자유 놀이를 동시에 해요'},done); }
  create(){ super.create(); this.face=this.circleFace(1010,275,.75); this.phase=0; this.washerOpen=false; this.washer=this.add.container(650,330); const wg=this.add.graphics();wg.fillStyle(0xcbd5e1,1).fillRoundedRect(-120,-145,240,290,28);wg.fillStyle(0x8bb7d9,1).fillCircle(0,20,84);wg.lineStyle(8,COLORS.dark,.5).strokeCircle(0,20,84);const door=this.add.circle(0,20,75,0xffffff,.1).setStrokeStyle(4,COLORS.ink,.35).setInteractive({useHandCursor:true});this.washer.add([wg,door]);door.on('pointerup',()=>{this.washerOpen=!this.washerOpen;door.setFillStyle(0xffffff,this.washerOpen?.22:.1);this.discover('door',650,210,'문을 직접 열고 닫을 수 있어요');});
    this.rack=this.add.rectangle(960,475,220,120,0xd4c5a9,.5).setStrokeStyle(5,COLORS.brown,.7); this.basket=this.add.rectangle(330,500,180,110,0xbca37f,.45).setStrokeStyle(5,COLORS.brown,.6);
    const items=[['👕','shirt',320,240],['👖','pants',320,340],['🧦','sock',320,440],['🧴','detergent',940,250]]; this.items=items.map(([e,k,x,y])=>this.item(e,k,x,y)); this.hintTarget={x:320,y:240};
    this.add.text(650,630,'미션: 옷 3개 + 세제를 넣고 세탁한 뒤 건조대에 널어요',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#607086'}).setOrigin(.5); this.loaded=new Set();this.cleaned=false;this.dried=0;
  }
  item(e,k,x,y){ const c=this.add.container(x,y);const g=this.add.graphics();g.fillStyle(0xffffff,1).fillCircle(0,0,48);g.lineStyle(2,COLORS.ink,.12).strokeCircle(0,0,48);const t=this.add.text(0,0,e,{fontSize:'40px'}).setOrigin(.5);c.add([g,t]);c.setSize(100,100);c.width=100;c.height=100;c.kind=k;this.dragify(c,{end:o=>this.drop(o)});return c;}
  drop(o){ const dw=Phaser.Math.Distance.Between(o.x,o.y,650,350), dh=Phaser.Math.Distance.Between(o.x,o.y,1010,275), db=Phaser.Math.Distance.Between(o.x,o.y,330,500), dr=Phaser.Math.Distance.Between(o.x,o.y,960,475);
    if(o.kind==='sock'&&dh<100){this.snap(o,1010,190,()=>{this.discover('sockhat',1010,160,'양말이 모자가 됐어요');this.happy(this.face);this.time.delayedCall(700,()=>this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:220}));});return;}
    if(db<120){this.snap(o,330,500,()=>this.discover('basket',330,420,'바구니도 자유롭게 쓸 수 있어요'));return;}
    if(this.cleaned && dr<150 && ['shirt','pants','sock'].includes(o.kind)){this.snap(o,900+this.dried*58,455,()=>{this.dried++;if(this.dried>=3)this.finish({score:this.discoveryScore()});});return;}
    if(dw<145){ if(!this.washerOpen){this.curious(this.washer);this.wrongReturn(o);return;} this.loaded.add(o.kind);this.snap(o,650,350,()=>{o.setAlpha(.35); if(this.loaded.has('shirt')&&this.loaded.has('pants')&&this.loaded.has('sock')&&this.loaded.has('detergent'))this.startWash();});return; }
    this.wrongReturn(o);
  }
  startWash(){ if(this.cleaned)return; this.cleaned=true; audio.success(); const spin=this.add.arc(650,350,65,0,310,false,0x7bdff2,.3).setStrokeStyle(10,0x5aa9e6,.8);this.tweens.add({targets:spin,angle:720,duration:1200,ease:'Sine.InOut',onComplete:()=>{spin.destroy();this.discover('spin',650,210,'세탁기가 돌아가요'); this.items.filter(i=>['shirt','pants','sock'].includes(i.kind)).forEach((o,i)=>{o.setAlpha(1);o.x=780+i*75;o.y=535;});}}); }
}

class G2R3 extends DiscoveryRound {
  constructor(done){ super('G2R3',{gameTitle:'인터랙티브 하우스',round:3,title:'장난감 자동차를 직접 수리해요'},done); }
  create(){ super.create(); this.car=this.add.container(670,390); const cg=this.add.graphics();cg.fillStyle(COLORS.red,1).fillRoundedRect(-140,-55,280,110,30);cg.fillStyle(0x8ecae6,1).fillRoundedRect(-50,-100,100,55,18);this.car.add(cg); this.wheelSpot={x:550,y:455};this.screwSpot={x:550,y:455};
    this.wheel=this.roundItem(320,260,'⚙️','바퀴'); this.screw=this.roundItem(320,390,'🔩','나사'); this.driver=this.roundItem(320,520,'🪛','드라이버'); this.paint=this.roundItem(1030,260,'🎨','페인트'); this.ball=this.roundItem(1030,390,'⚽','공'); this.cloth=this.roundItem(1030,520,'🧽','천'); this.box=this.add.rectangle(870,540,150,100,0xc69c6d,.45).setStrokeStyle(4,COLORS.brown,.6); this.stage=0;this.rotation=0;this.lastAngle=null;
    [this.wheel,this.screw,this.driver,this.paint,this.ball,this.cloth].forEach(o=>this.dragify(o,{drag:(obj,p)=>{if(obj===this.driver&&this.stage===2&&Phaser.Math.Distance.Between(obj.x,obj.y,550,455)<100)this.rotateGesture(p);},end:o=>this.drop(o)})); this.hintTarget={x:320,y:260};
  }
  roundItem(x,y,e,label){const c=this.add.container(x,y);const g=this.add.graphics();g.fillStyle(0xffffff,1).fillRoundedRect(-68,-44,136,88,18);g.lineStyle(2,COLORS.ink,.12).strokeRoundedRect(-68,-44,136,88,18);c.add([g,this.add.text(0,-7,e,{fontSize:'34px'}).setOrigin(.5),this.add.text(0,28,label,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5)]);c.setSize(136,88);c.width=136;c.height=88;c.kind=label;return c;}
  drop(o){const d=Phaser.Math.Distance.Between(o.x,o.y,550,455);if(o.kind==='공'&&Phaser.Math.Distance.Between(o.x,o.y,870,540)<120){this.snap(o,870,530,()=>this.discover('ballbox',870,460,'공도 정리할 수 있어요'));return;}if(o.kind==='페인트'&&Phaser.Math.Distance.Between(o.x,o.y,670,390)<170){this.snap(o,810,320,()=>{this.car.first.setFillStyle?.();this.car.setAlpha(.98);this.discover('paint',700,255,'차 색도 바꿔볼 수 있어요');});return;}if(o.kind==='천'&&Phaser.Math.Distance.Between(o.x,o.y,670,390)<170){this.snap(o,760,420,()=>{this.sparkle(670,390,9);this.discover('polish',720,280,'반짝반짝 닦였어요');});return;}
    if(this.stage===0&&o.kind==='바퀴'&&d<120){this.snap(o,550,455,()=>{this.stage=1;this.hintTarget={x:320,y:390};});return;}if(this.stage===1&&o.kind==='나사'&&d<120){this.snap(o,550,455,()=>{o.setScale(.55);this.stage=2;this.hintTarget={x:320,y:520};});return;}if(this.stage===2&&o.kind==='드라이버'&&d<120){this.snap(o,550,410,()=>{this.add.text(700,585,'드라이버를 원을 그리듯 돌려 나사를 조여요',{fontFamily:'Arial',fontSize:'17px',color:'#607086'}).setOrigin(.5);});return;}this.wrongReturn(o);}
  rotateGesture(p){const a=Phaser.Math.RadToDeg(Math.atan2(p.y-455,p.x-550));if(this.lastAngle!==null){let d=Phaser.Math.Angle.ShortestBetween(this.lastAngle,a);this.rotation+=Math.abs(d);this.screw.setScale(Math.max(.2,.55-this.rotation/1500));if(this.rotation>=FEEL.screwdriver.requiredAngle){this.stage=3;this.discover('tight',560,350,'손으로 직접 조여서 완성했어요');this.time.delayedCall(350,()=>this.finish({score:this.discoveryScore()}));}}this.lastAngle=a;}
}
