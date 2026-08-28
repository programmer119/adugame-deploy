// ADUGAME v5 guided-habit rebuild.
// Structural target: current Baby Panda's Daily Habits public baseline (2026-08-20).
// Timing/hit values below remain T-REPRO until O-PLAY measurement replaces them.
(() => {
  const font = {fontFamily:'Arial, sans-serif', color:'#24314a'};
  const healthyKinds = new Set(['apple','carrot','wholegrain']);

  function addStatus(scene, text) {
    scene.status = scene.add.text(650, 650, text, {
      ...font, fontSize:'18px', fontStyle:'bold', color:'#607086',
      backgroundColor:'#ffffffdd', padding:{left:12,right:12,top:7,bottom:7},
      align:'center', wordWrap:{width:760}
    }).setOrigin(.5).setDepth(90);
    return scene.status;
  }

  function addStepDots(scene, total) {
    scene.v5Dots = scene.addProgressDots(650, 118, total);
    scene.v5StepTotal = total;
    scene.v5SetStep = n => scene.setProgressDots(scene.v5Dots, Math.max(0, Math.min(total, n)));
  }

  function addVocabulary(scene, names) {
    const button = scene.add.text(1165, 650, `생활도구 ${names.length}`, {
      ...font, fontSize:'14px', fontStyle:'bold', color:'#ffffff', backgroundColor:'#6c63ff',
      padding:{left:10,right:10,top:7,bottom:7}
    }).setOrigin(.5).setDepth(180).setInteractive({useHandCursor:true});
    let panel = null;
    const close = () => { if(panel){ panel.destroy(true); panel=null; } };
    button.on('pointerup', () => {
      if(panel){ close(); return; }
      panel = scene.add.container(1010, 410).setDepth(5000).setName('vocab_panel');
      const bg = scene.add.graphics();
      bg.fillStyle(0xffffff,.98).fillRoundedRect(-205,-205,410,410,26);
      bg.lineStyle(3,COLORS.ink,.16).strokeRoundedRect(-205,-205,410,410,26);
      panel.add(bg);
      panel.add(scene.add.text(0,-174,'생활 속 물건을 찾아봐요',{...font,fontSize:'18px',fontStyle:'bold'}).setOrigin(.5));
      names.forEach((name,i) => {
        const x=-125+(i%3)*125, y=-112+Math.floor(i/3)*72;
        const chip=scene.add.text(x,y,name,{...font,fontSize:'14px',fontStyle:'bold',backgroundColor:'#eef5ff',padding:{left:9,right:9,top:7,bottom:7}}).setOrigin(.5);
        panel.add(chip);
      });
      const x = scene.add.text(165,-174,'×',{...font,fontSize:'24px',fontStyle:'bold'}).setOrigin(.5).setInteractive({useHandCursor:true});
      x.on('pointerup',close); panel.add(x);
    });
    return button;
  }

  function makeCard(scene,x,y,kind,label,glyph,color=0xffffff,w=128,h=86){
    const c=scene.add.container(x,y).setName(kind),g=scene.add.graphics();
    g.fillStyle(color,1).fillRoundedRect(-w/2,-h/2,w,h,18);
    g.lineStyle(2,COLORS.ink,.14).strokeRoundedRect(-w/2,-h/2,w,h,18);
    const mark=scene.add.text(0,-10,glyph,{fontSize:'30px',color:'#24314a'}).setOrigin(.5);
    const text=scene.add.text(0,25,label,{...font,fontSize:'13px',fontStyle:'bold'}).setOrigin(.5);
    c.add([g,mark,text]); c.setSize(w,h); c.width=w;c.height=h;c.kind=kind; return c;
  }

  class G1R1HabitV5 extends BaseRound {
    constructor(done){super('G1R1',{gameTitle:'생활 실습',round:1,title:'화장실을 스스로 이용하고 손까지 깨끗이 씻어요'},done);}
    create(){
      super.create();this.step=0;this.scrubDistance=0;this.lastScrub=null;this.face=this.circleFace(1030,270,.76);this.scheduleCharacterIdle();
      addStepDots(this,6);addStatus(this,'급할 때 참지 않고 변기를 눌러 화장실을 이용해요');
      addVocabulary(this,['변기','물내림','세면대','수도꼭지','비누','수건','휴지','거울','칫솔','치약','컵','빗']);
      const room=this.add.graphics().setDepth(1);room.fillStyle(0xe9f5fb,1).fillRoundedRect(95,160,1080,430,28);room.lineStyle(3,0x8ecae6,.35).strokeRoundedRect(95,160,1080,430,28);
      this.toilet=this.add.container(740,380).setName('toilet');const tg=this.add.graphics();tg.fillStyle(0xffffff,1).fillEllipse(0,30,200,105);tg.fillStyle(0xdcebf2,1).fillRoundedRect(-70,-110,140,110,18);tg.lineStyle(4,COLORS.ink,.12).strokeEllipse(0,30,200,105);this.toilet.add(tg);this.toilet.setSize(220,220).setInteractive({useHandCursor:true}).on('pointerup',()=>this.useToilet());
      this.flush=this.add.text(790,275,'●',{fontSize:'30px',color:'#5aa9e6',backgroundColor:'#ffffff',padding:{left:8,right:8,top:5,bottom:5}}).setOrigin(.5).setDepth(12).setInteractive({useHandCursor:true}).on('pointerup',()=>this.flushToilet());
      this.sink=this.add.graphics();this.sink.fillStyle(0xdde9f0,1).fillRoundedRect(250,440,300,92,35);this.sink.lineStyle(3,COLORS.ink,.13).strokeRoundedRect(250,440,300,92,35);
      this.faucet=this.add.container(400,300).setName('faucet');const fg=this.add.graphics();fg.lineStyle(18,0x8797a5,1).beginPath().moveTo(-45,70).lineTo(-45,5).arc(0,5,45,Math.PI,0).lineTo(45,32).strokePath();this.faucet.add(fg);this.faucet.setSize(140,150).setInteractive({useHandCursor:true}).on('pointerup',()=>this.tapFaucet());
      this.water=this.add.rectangle(445,405,12,145,COLORS.aqua,.58).setAlpha(0);
      this.hands=this.add.container(400,475).setName('hands');const hg=this.add.graphics();hg.fillStyle(COLORS.peach,1).fillRoundedRect(-92,-38,80,76,30).fillRoundedRect(12,-38,80,76,30);this.hands.add(hg);this.hands.setSize(210,105).setInteractive(new Phaser.Geom.Rectangle(-105,-52,210,105),Phaser.Geom.Rectangle.Contains).on('pointermove',p=>this.scrub(p));
      this.soap=makeCard(this,175,430,'soap','비누','SOAP',0xffffff,120,78);this.dragify(this.soap,{end:o=>this.dropSoap(o)});this.hintTarget={x:740,y:380};
      this.urge=this.add.circle(1030,315,13,0xff6b6b,.75).setDepth(20);this.tweens.add({targets:this.urge,alpha:.2,yoyo:true,repeat:-1,duration:650});
    }
    useToilet(){if(this.step!==0){this.registerFailure('toilet_order',this.toilet);this.curious(this.toilet);return;}this.markMeaningfulInput('toilet_use');this.step=.5;this.status.setText('잘했어요. 이제 물을 내려 깨끗하게 마무리해요');this.hintTarget={x:790,y:275};this.v5SetStep(1);this.tweens.add({targets:this.face,y:this.face.y+12,yoyo:true,duration:260});this.urge.destroy();}
    flushToilet(){if(this.step!==.5){this.registerFailure('flush_order',this.flush);this.curious(this.flush);return;}this.markMeaningfulInput('flush');audio.water();this.step=1;const swirl=this.add.arc(740,410,58,0,320,false,COLORS.aqua,.2).setStrokeStyle(9,COLORS.blue,.65).setDepth(8);this.tweens.add({targets:swirl,angle:720,alpha:0,duration:520,onComplete:()=>swirl.destroy()});this.time.delayedCall(470,()=>{this.status.setText('이제 수도꼭지를 눌러 손을 먼저 적셔요');this.hintTarget={x:400,y:300};this.v5SetStep(2);});}
    tapFaucet(){if(![1,4].includes(this.step)){this.registerFailure('faucet_order',this.faucet);this.curious(this.faucet);return;}const rinsing=this.step===4;this.markMeaningfulInput('faucet',{rinsing});audio.water();this.water.setAlpha(.65);this.tweens.add({targets:this.faucet,angle:7,yoyo:true,duration:110});this.time.delayedCall(FEEL.wash.rinseHoldMs,()=>{this.water.setAlpha(0);this.sparkle(400,475,5);if(!rinsing){this.step=2;this.status.setText('비누를 손 위로 가져와 묻혀요');this.hintTarget={x:this.soap.x,y:this.soap.y};this.v5SetStep(3);}else{this.step=5;this.v5SetStep(6);this.status.setText('화장실 사용 뒤 손 씻기까지 완료했어요');this.happy(this.face);this.finish();}});}
    dropSoap(o){if(this.step!==2||dist(o.x,o.y,400,475)>145){this.wrongReturn(o,'soap_order',this.hands);return;}this.snap(o,305,475,()=>{this.add.text(400,458,'○  ○  ○  ○',{fontSize:'27px',color:'#7bdff2'}).setOrigin(.5).setName('foam');this.step=3;this.status.setText('손을 누른 채 좌우로 충분히 문질러요');this.hintTarget={x:400,y:475};this.v5SetStep(4);this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:180});});}
    scrub(p){if(this.step!==3||!p.isDown)return;const cur={x:p.x,y:p.y};if(this.lastScrub){const d=dist(cur.x,cur.y,this.lastScrub.x,this.lastScrub.y);if(d>2&&d<120){this.scrubDistance+=d;if(Math.floor(this.scrubDistance/70)!==Math.floor((this.scrubDistance-d)/70))audio.scrub();if(this.scrubDistance>=340){this.step=4;this.children.list.filter(o=>o?.name==='foam').forEach(o=>o.destroy());this.status.setText('마지막으로 깨끗한 물에 헹궈요');this.hintTarget={x:400,y:300};this.v5SetStep(5);this.sparkle(400,475,6);}}}this.lastScrub=cur;}
    debugState(){return {...super.debugState(),benchmarkV5:'toilet-handwash',step:this.step,scrubDistance:this.scrubDistance};}
  }

  class G1R2HabitV5 extends BaseRound {
    constructor(done){super('G1R2',{gameTitle:'생활 실습',round:2,title:'양치하고 세수하고 손톱을 정리해요'},done);}
    create(){
      super.create();this.step=0;this.face=this.circleFace(790,330,1.05);this.scheduleCharacterIdle();this.mouthProgress=[0,0,0,0];this.lastBrush=null;this.faceWash=0;this.lastCloth=null;this.clipped=new Set();
      addStepDots(this,7);addStatus(this,'치약을 칫솔 위로 가져가 적당히 묻혀요');addVocabulary(this,['칫솔','치약','컵','세면대','물','수건','세안천','손','손톱','손톱깎이','거울','비누']);
      const bg=this.add.graphics();bg.fillStyle(0xf4fbff,1).fillRoundedRect(90,160,1090,430,28);bg.lineStyle(3,0x8ecae6,.25).strokeRoundedRect(90,160,1090,430,28);
      this.mouth=this.add.ellipse(790,365,175,86,0xffffff,1).setStrokeStyle(4,COLORS.ink,.18).setDepth(8);this.stains=[[-42,-18],[42,-18],[-42,18],[42,18]].map(([x,y],i)=>this.add.circle(790+x,365+y,13,0xe0a96d,.78).setDepth(9).setName('tooth_stain_'+i));
      this.brush=makeCard(this,205,350,'toothbrush','칫솔','BRUSH',0xffffff,135,82);this.paste=makeCard(this,205,235,'toothpaste','치약','PASTE',0xffffff,135,82);this.cloth=makeCard(this,205,480,'cloth','세안천','CLOTH',0xffffff,135,82);this.clipper=makeCard(this,205,585,'clipper','손톱깎이','CLIP',0xffffff,135,82);
      this.dragify(this.paste,{end:o=>this.dropPaste(o)});this.dragify(this.brush,{drag:(o,p)=>this.brushMove(o,p),end:o=>this.brushEnd(o)});this.dragify(this.cloth,{drag:(o,p)=>this.clothMove(o,p),end:o=>this.clothEnd(o)});this.dragify(this.clipper,{end:o=>this.clipEnd(o)});
      this.hand=this.add.container(1060,470).setName('nail_hand');const hg=this.add.graphics();hg.fillStyle(COLORS.peach,1).fillRoundedRect(-82,-42,164,84,34);this.hand.add(hg);this.nails=[];for(let i=0;i<5;i++){const x=1010+i*25,y=438+(i%2)*5;const n=this.add.ellipse(x,y,16,11,0xffffff,1).setStrokeStyle(2,COLORS.ink,.18).setDepth(12);n.nailIndex=i;this.nails.push(n);}this.hintTarget={x:this.paste.x,y:this.paste.y};
    }
    dropPaste(o){if(this.step!==0||dist(o.x,o.y,this.brush.x,this.brush.y)>120){this.wrongReturn(o,'paste_order',this.brush);return;}this.snap(o,this.brush.x,this.brush.y-20,()=>{this.add.circle(this.brush.x+35,this.brush.y-15,9,0xffffff,1).setStrokeStyle(2,COLORS.blue,.4).setName('paste_blob');this.step=1;this.status.setText('칫솔을 잡고 위·아래·양쪽 이를 골고루 닦아요');this.hintTarget={x:this.brush.x,y:this.brush.y};this.v5SetStep(1);this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:180});});}
    brushMove(o,p){if(this.step!==1)return;const dx=o.x-790,dy=o.y-365;if(Math.abs(dx)>105||Math.abs(dy)>70){this.lastBrush=null;return;}const q=(dy>=0?2:0)+(dx>=0?1:0);if(this.lastBrush){const d=dist(o.x,o.y,this.lastBrush.x,this.lastBrush.y);if(d>2&&d<90){this.mouthProgress[q]+=d;if(Math.floor(this.mouthProgress[q]/45)!==Math.floor((this.mouthProgress[q]-d)/45))audio.scrub();if(this.mouthProgress[q]>=115&&this.stains[q]?.active){this.stains[q].destroy();this.sparkle(790+(q%2?42:-42),365+(q>1?18:-18),3);}}}this.lastBrush={x:o.x,y:o.y};if(this.mouthProgress.every(v=>v>=115)){this.step=2;this.status.setText('양치 완료! 이제 세안천으로 얼굴을 부드럽게 씻어요');this.hintTarget={x:this.cloth.x,y:this.cloth.y};this.v5SetStep(3);}}
    brushEnd(o){this.lastBrush=null;if(this.step<=1)this.wrongReturn(o,'brush_incomplete',this.mouth);else this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:180});}
    clothMove(o,p){if(this.step!==2)return;const inside=dist(o.x,o.y,790,330)<145;if(!inside){this.lastCloth=null;return;}if(this.lastCloth){const d=dist(o.x,o.y,this.lastCloth.x,this.lastCloth.y);if(d>2&&d<100){this.faceWash+=d;if(Math.floor(this.faceWash/80)!==Math.floor((this.faceWash-d)/80))audio.water();}}this.lastCloth={x:o.x,y:o.y};if(this.faceWash>=360){this.step=3;this.status.setText('마지막으로 손톱 5개를 하나씩 정리해요');this.hintTarget={x:this.clipper.x,y:this.clipper.y};this.v5SetStep(4);this.sparkle(790,330,6);}}
    clothEnd(o){this.lastCloth=null;if(this.step===2)this.wrongReturn(o,'facewash_incomplete',this.face);else this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:180});}
    clipEnd(o){if(this.step!==3){this.wrongReturn(o,'clip_order',this.hand);return;}let best=null,bestD=999;this.nails.forEach(n=>{if(!n.active||this.clipped.has(n.nailIndex))return;const d=dist(o.x,o.y,n.x,n.y);if(d<bestD){best=n;bestD=d;}});if(!best||bestD>70){this.wrongReturn(o,'clip_miss',this.hand);return;}this.clipped.add(best.nailIndex);audio.click();this.tweens.add({targets:best,scaleX:.72,scaleY:.72,duration:110,yoyo:true});this.sparkle(best.x,best.y,2);this.v5SetStep(4+Math.min(3,this.clipped.size));this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:140});if(this.clipped.size===5){this.step=4;this.status.setText('양치·세수·손톱 정리까지 모두 끝냈어요');this.v5SetStep(7);this.happy(this.face);this.finish();}}
    debugState(){return {...super.debugState(),benchmarkV5:'brush-face-nails',step:this.step,mouthProgress:this.mouthProgress,faceWash:this.faceWash,clipped:this.clipped.size};}
  }

  class G1R3HabitV5 extends BaseRound {
    constructor(done){super('G1R3',{gameTitle:'생활 실습',round:3,title:'방을 정리하고 균형 잡힌 음식을 골라 함께 먹어요'},done);}
    create(){
      super.create();this.step=0;this.tidied=new Set();this.chosen=[];this.fed=new Set();this.face=this.circleFace(1040,320,.82);this.scheduleCharacterIdle();addStepDots(this,9);addStatus(this,'먼저 바닥의 장난감 3개를 정리함에 넣어요');addVocabulary(this,['정리함','공','책','블록','접시','숟가락','사과','당근','통곡물빵','채소','과일','물']);
      const bg=this.add.graphics();bg.fillStyle(0xfff4e8,1).fillRoundedRect(80,155,1110,445,28);bg.lineStyle(3,COLORS.brown,.18).strokeRoundedRect(80,155,1110,445,28);this.box=this.add.rectangle(255,465,210,130,0xc69c6d,.55).setStrokeStyle(4,COLORS.brown,.5).setName('tidy_box');this.toys=[makeCard(this,180,235,'ball','공','BALL',0xffffff,110,72),makeCard(this,315,235,'book','책','BOOK',0xffffff,110,72),makeCard(this,450,235,'block','블록','BLOCK',0xffffff,110,72)];this.toys.forEach(o=>this.dragify(o,{end:t=>this.dropToy(t)}));this.plate=this.add.ellipse(735,475,300,90,0xf5f8fa,1).setStrokeStyle(4,COLORS.ink,.14).setName('meal_plate');
      this.foods=[makeCard(this,560,250,'apple','사과','APPLE',0xffe8e8,108,70),makeCard(this,680,250,'carrot','당근','CARROT',0xffedd8,108,70),makeCard(this,800,250,'wholegrain','통곡물빵','BREAD',0xfff2cf,108,70),makeCard(this,920,250,'cookie','쿠키','COOKIE',0xf4e4c1,108,70),makeCard(this,1040,250,'soda','탄산음료','SODA',0xe6f2ff,108,70)];this.foods.forEach(o=>this.dragify(o,{end:f=>this.dropFood(f)}));this.hintTarget={x:this.toys[0].x,y:this.toys[0].y};
    }
    dropToy(o){if(this.step!==0||dist(o.x,o.y,255,465)>145){this.wrongReturn(o,'tidy_miss',this.box);return;}this.tidied.add(o.kind);this.snap(o,210+(this.tidied.size-1)*45,470,()=>{o.setScale(.72);if(o.input)o.input.enabled=false;this.v5SetStep(this.tidied.size);if(this.tidied.size===3){this.step=1;this.status.setText('정리 완료! 사과·당근·통곡물처럼 균형 잡힌 음식 3가지를 접시에 골라요');this.hintTarget={x:560,y:250};this.sparkle(255,465,6);}});}
    dropFood(o){if(this.step!==1){if(this.step===2&&this.chosen.includes(o))return this.feedFood(o);this.wrongReturn(o,'meal_order',this.plate);return;}if(dist(o.x,o.y,735,475)>190){this.wrongReturn(o,'meal_plate',this.plate);return;}if(!healthyKinds.has(o.kind)){this.curious(this.face);this.wrongReturn(o,'balanced_choice',this.plate);this.status.setText('매일 먹는 식사는 과일·채소·통곡물처럼 몸에 좋은 조합으로 골라봐요');return;}if(this.chosen.includes(o))return;const idx=this.chosen.length;this.chosen.push(o);this.snap(o,660+idx*75,470-idx*5,()=>{o.setScale(.72);o.home={x:o.x,y:o.y};this.v5SetStep(4+this.chosen.length);if(this.chosen.length===3){this.step=2;this.status.setText('좋은 조합이에요. 접시의 음식을 하나씩 캐릭터에게 가져가 먹여요');this.hintTarget={x:this.chosen[0].x,y:this.chosen[0].y};this.happy(this.face);}});}
    feedFood(o){if(this.fed.has(o.kind)){this.tweens.add({targets:o,x:o.home.x,y:o.home.y,duration:150});return;}if(dist(o.x,o.y,1040,330)>125){this.wrongReturn(o,'feed_mouth',this.face);return;}this.fed.add(o.kind);audio.pop();this.tweens.add({targets:o,scale:.15,alpha:.05,duration:FEEL.eat.chewMs,onComplete:()=>o.setVisible(false)});this.happy(this.face);this.v5SetStep(7+Math.min(2,this.fed.size));if(this.fed.size===3){this.v5SetStep(9);this.status.setText('정리도 하고 균형 잡힌 식사도 함께 준비했어요');this.finish();}}
    debugState(){return {...super.debugState(),benchmarkV5:'tidy-balanced-meal',step:this.step,tidied:[...this.tidied],chosen:this.chosen.map(o=>o.kind),fed:[...this.fed]};}
  }

  G1R1=G1R1HabitV5;G1R2=G1R2HabitV5;G1R3=G1R3HabitV5;
  GAMES[0].rounds=['화장실·손 씻기','양치·세수·손톱','정리·균형 식사'];GAMES[0].dna='단계 숙달 · 생활습관 · 긍정 피드백';
})();