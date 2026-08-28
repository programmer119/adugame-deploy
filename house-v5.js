// ADUGAME v5 interactive-house rebuild.
// Structural target: Pepi House current public baseline. Artwork/content is original.
// Exact feel values remain T-REPRO until target-build O-PLAY measurement is available.
(() => {
  const FLOOR_NAMES=['차고·마당','주방·거실','욕실·세탁실','아이방·테라스'];
  const PORTABLES=[
    ['wheel','screw','driver','wrench','hammer','paint','cloth','pump','ball','cone','helmet','rake','shovel','hose','plant','wateringcan','picnic','box','kite','skateboard','bucket','brush','oil','sparewheel','gloves'],
    ['bread','cheese','lettuce','tomato','apple','banana','carrot','cup','plate','spoon','pan','pot','towel','book','cushion','remote','mug','cereal','egg','milk','bowl','fork','knife','napkin','bottle'],
    ['shirt','pants','sock','dress','towel','soap','detergent','brush','toothbrush','toothpaste','cup','duck','sponge','basket','hanger','shampoo','comb','toiletpaper','cloth','slipper','robe','toyboat','hairdryer','bucket','washcloth'],
    ['blocks','doll','toycar','book','pencil','paper','drum','guitar','train','puzzle','shirt','hat','shoes','teddy','ball','plant','wateringcan','plate','snack','cup','pillow','blanket','robot','cube','crayon']
  ];
  const LABEL={
    wheel:'바퀴',screw:'나사',driver:'드라이버',wrench:'렌치',hammer:'망치',paint:'페인트',cloth:'천',pump:'펌프',ball:'공',cone:'콘',helmet:'헬멧',rake:'갈퀴',shovel:'삽',hose:'호스',plant:'화분',wateringcan:'물뿌리개',picnic:'돗자리',box:'상자',kite:'연',skateboard:'보드',bucket:'양동이',brush:'솔',oil:'오일',sparewheel:'예비바퀴',gloves:'장갑',
    bread:'빵',cheese:'치즈',lettuce:'상추',tomato:'토마토',apple:'사과',banana:'바나나',carrot:'당근',cup:'컵',plate:'접시',spoon:'숟가락',pan:'팬',pot:'냄비',towel:'수건',book:'책',cushion:'쿠션',remote:'리모컨',mug:'머그',cereal:'시리얼',egg:'달걀',milk:'우유',bowl:'그릇',fork:'포크',knife:'나이프',napkin:'냅킨',bottle:'병',
    shirt:'셔츠',pants:'바지',sock:'양말',dress:'원피스',soap:'비누',detergent:'세제',toothbrush:'칫솔',toothpaste:'치약',duck:'오리장난감',sponge:'스펀지',basket:'바구니',hanger:'옷걸이',shampoo:'샴푸',comb:'빗',toiletpaper:'휴지',slipper:'슬리퍼',robe:'가운',toyboat:'배',hairdryer:'드라이어',washcloth:'세안천',
    blocks:'블록',doll:'인형',toycar:'자동차',pencil:'연필',paper:'종이',drum:'북',guitar:'기타',train:'기차',puzzle:'퍼즐',hat:'모자',shoes:'신발',teddy:'곰인형',snack:'간식',pillow:'베개',blanket:'담요',robot:'로봇',cube:'큐브',crayon:'크레용'
  };
  const FOOD=new Set(['bread','cheese','lettuce','tomato','apple','banana','carrot','cereal','egg','milk','snack']);
  const CLOTHES=new Set(['shirt','pants','sock','dress','towel','robe','washcloth']);

  class HouseWorldV5 extends DiscoveryRound {
    constructor(key,round,done){super(key,{gameTitle:'인터랙티브 하우스',round,title:['4층 집에서 요리하고 가족에게 먹여봐요','집 안을 오가며 빨래를 직접 해봐요','차고에서 자동차를 고치고 자유롭게 실험해요'][round-1]},done);this.focusRound=round;}
    create(){
      super.create();this.currentFloor=this.focusRound===1?1:this.focusRound===2?2:0;this.items=[];this.characters=[];this.floorObjects=[[],[],[],[]];this.elevatorCargo=[];this.mission={cooked:false,fed:false,loaded:new Set(),dried:new Set(),repair:0};this.milestone=false;this.finishButton=null;
      this.houseBg=this.add.graphics().setDepth(1);this.roomDecor=this.add.container(0,0).setDepth(2);
      this.buildFloorRail();this.buildElevator();this.buildCharacterDock();this.buildFixtures();this.buildPortableInventory();this.showFloor(this.currentFloor,true);this.updateMission();
      GAMES[1].rounds=['4층 자유 주방','4층 자유 세탁','4층 자유 수리'];GAMES[1].dna='4층 자유조작 · 캐릭터 · 엘리베이터 · 발견';
    }
    buildFloorRail(){
      this.floorRail=this.add.container(62,225).setDepth(250);
      FLOOR_NAMES.forEach((name,i)=>{
        const b=this.add.text(0,i*78,`${4-i}F\n${name}`,{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',align:'center',color:'#24314a',backgroundColor:'#ffffffee',padding:{left:8,right:8,top:7,bottom:7}}).setOrigin(.5).setInteractive({useHandCursor:true});
        b.on('pointerup',()=>this.showFloor(i));b.floor=i;this.floorRail.add(b);
      });
    }
    buildElevator(){
      this.elevator=this.add.container(1130,355).setDepth(20).setName('elevator');const g=this.add.graphics();g.fillStyle(0xdce6ef,.95).fillRoundedRect(-70,-120,140,240,20);g.lineStyle(4,COLORS.ink,.18).strokeRoundedRect(-70,-120,140,240,20);g.lineStyle(3,COLORS.ink,.15).lineBetween(0,-112,0,112);this.elevator.add(g);this.elevator.setSize(150,250);this.elevatorLabel=this.add.text(1130,495,'엘리베이터 · 물건/캐릭터 이동',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#607086'}).setOrigin(.5).setDepth(30);this.cargoText=this.add.text(1130,355,'0',{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5).setDepth(35);
    }
    buildCharacterDock(){
      this.dockBg=this.add.rectangle(665,628,850,88,0xeef2ff,.9).setStrokeStyle(3,COLORS.purple,.25).setDepth(15);this.add.text(230,628,'CHARACTER\nDOCK',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',align:'center',color:'#607086'}).setOrigin(.5).setDepth(20);
      const names=['엄마','아빠','할머니','할아버지','아이1','아이2','아이3','아기','강아지','고양이'];
      names.forEach((name,i)=>{const x=315+i*74,y=628,c=this.add.container(x,y).setName('character_'+i).setDepth(30);const g=this.add.graphics();const color=[0xffb4a2,0x8ecae6,0xffd166,0xb2f7ef,0xb8a1ff][i%5];g.fillStyle(color,1).fillCircle(0,-6,24);g.fillStyle(COLORS.ink,.8).fillCircle(-8,-10,2).fillCircle(8,-10,2);g.lineStyle(2,COLORS.ink,.7).beginPath().arc(0,-2,9,.2,Math.PI-.2).strokePath();if(i>=8){g.fillStyle(color,1).fillTriangle(-20,-24,-8,-45,0,-22).fillTriangle(20,-24,8,-45,0,-22);}const t=this.add.text(0,29,name,{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5);c.add([g,t]);c.setSize(58,70);c.width=58;c.height=70;c.kind='character';c.charName=name;c.inDock=true;c.floor=this.currentFloor;this.dragify(c,{end:o=>this.dropCharacter(o)});this.characters.push(c);});
    }
    buildFixtures(){
      for(let f=0;f<4;f++){const title=this.add.text(640,145,FLOOR_NAMES[f],{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#24314a',backgroundColor:'#ffffffcc',padding:{left:12,right:12,top:6,bottom:6}}).setOrigin(.5).setDepth(10);this.floorObjects[f].push(title);}
      this.car=this.fixture(0,720,405,'CAR',250,120,0xff8b8b);this.car.repair=0;this.toolbox=this.fixture(0,350,470,'TOOL BOX',160,100,0xc69c6d);this.yardBox=this.fixture(0,920,470,'YARD BOX',150,105,0x9fb7a6);
      this.stove=this.fixture(1,690,330,'STOVE',180,120,0xa9c6d9);this.sink=this.fixture(1,930,330,'SINK',170,110,0xc7d6df);this.fridge=this.fixture(1,430,330,'FRIDGE',150,220,0xe9eef2);this.sofa=this.fixture(1,760,500,'SOFA',270,90,0xc7b7e5);
      this.washer=this.fixture(2,650,345,'WASHER',220,240,0xcbd5e1);this.washer.open=false;this.washer.running=false;this.rack=this.fixture(2,930,420,'DRY RACK',220,150,0xd4c5a9);this.bath=this.fixture(2,390,390,'BATH',210,120,0xbde0fe);this.washer.setInteractive({useHandCursor:true}).on('pointerup',()=>this.washerAction());
      this.toyBox=this.fixture(3,410,455,'TOY BOX',190,120,0xc69c6d);this.bed=this.fixture(3,730,430,'BED',270,130,0xffc6df);this.patio=this.fixture(3,975,400,'PATIO',170,180,0xb7e4c7);
    }
    fixture(f,x,y,label,w,h,color){const c=this.add.container(x,y).setName('fixture_'+label.toLowerCase().replace(/\s/g,'_')).setDepth(5);const g=this.add.graphics();g.fillStyle(color,.88).fillRoundedRect(-w/2,-h/2,w,h,20);g.lineStyle(3,COLORS.ink,.15).strokeRoundedRect(-w/2,-h/2,w,h,20);const t=this.add.text(0,0,label,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#24314a'}).setOrigin(.5);c.add([g,t]);c.setSize(w,h);c.floor=f;this.floorObjects[f].push(c);return c;}
    buildPortableInventory(){PORTABLES.forEach((list,f)=>list.forEach((kind,i)=>{const col=i%9,row=Math.floor(i/9),x=330+col*82,y=205+row*78;const item=this.makeItem(kind,x,y,f,i);this.items.push(item);}));}
    makeItem(kind,x,y,f,i){const c=this.add.container(x,y).setName('item_'+kind+'_'+f+'_'+i).setDepth(12);const g=this.add.graphics();const palette=[0xffe66d,0xb2f7ef,0xffc6df,0xb8a1ff,0x8ecae6,0xffb4a2];c.itemColor=palette[i%palette.length];c.body=g;const draw=()=>{g.clear();g.fillStyle(c.itemColor,.96).fillRoundedRect(-27,-25,54,50,14);g.lineStyle(2,COLORS.ink,.13).strokeRoundedRect(-27,-25,54,50,14);};draw();const label=LABEL[kind]||kind;const t=this.add.text(0,0,label.length>4?label.slice(0,4):label,{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#24314a',align:'center',wordWrap:{width:48}}).setOrigin(.5);c.add([g,t]);c.setSize(62,58);c.width=62;c.height=58;c.kind=kind;c.floor=f;c.state='default';c.drawItem=draw;this.dragify(c,{end:o=>this.dropItem(o)});return c;}
    showFloor(f,initial=false){
      if(f<0||f>3)return;this.currentFloor=f;this.houseBg.clear();const floorColors=[0xf4eee5,0xfff4e8,0xeaf7ff,0xf4f0ff];this.houseBg.fillStyle(floorColors[f],1).fillRoundedRect(105,125,1065,455,30);this.houseBg.lineStyle(4,COLORS.ink,.08).strokeRoundedRect(105,125,1065,455,30);
      this.floorObjects.forEach((arr,idx)=>arr.forEach(o=>o.setVisible(idx===f)));this.items.forEach(o=>o.setVisible(!o.inElevator&&o.floor===f&&o.state!=='washer_loaded'));this.characters.forEach(o=>o.setVisible(o.inDock||(!o.inElevator&&o.floor===f)));
      if(this.elevatorCargo.length){const cargo=[...this.elevatorCargo];this.elevatorCargo.length=0;cargo.forEach((o,i)=>{o.inElevator=false;o.floor=f;o.setVisible(true);o.x=1040+(i%2)*70;o.y=340+Math.floor(i/2)*70;if(o.home)o.home={x:o.x,y:o.y};});this.cargoText.setText('0');audio.pop();this.discover('elevator_floor_'+f,1130,245,'엘리베이터로 다른 층까지 물건과 캐릭터를 옮겼어요');}
      this.updateMission();if(!initial)telemetry('floor_change',{floor:f});
    }
    dropCharacter(o){if(dist(o.x,o.y,1130,355)<115){o.inDock=false;o.inElevator=true;o.setVisible(false);this.elevatorCargo.push(o);this.cargoText.setText(String(this.elevatorCargo.length));this.discover('char_elevator',1130,235,'캐릭터도 엘리베이터를 탈 수 있어요');return;}if(o.y>585){o.inDock=true;o.inElevator=false;o.x=o.home.x;o.y=o.home.y;o.setVisible(true);return;}o.inDock=false;o.floor=this.currentFloor;o.home={x:o.x,y:o.y};this.discover('character_room',o.x,o.y-35,'캐릭터를 방 안 원하는 곳에 둘 수 있어요');}
    dropItem(o){
      if(dist(o.x,o.y,1130,355)<115){o.inElevator=true;o.setVisible(false);this.elevatorCargo.push(o);this.cargoText.setText(String(this.elevatorCargo.length));this.discover('item_elevator',1130,235,'물건도 다른 층으로 옮길 수 있어요');return;}
      o.floor=this.currentFloor;
      const char=this.characters.find(c=>!c.inDock&&!c.inElevator&&c.floor===this.currentFloor&&dist(o.x,o.y,c.x,c.y)<82);if(char&&FOOD.has(o.kind)){this.feedCharacter(o,char);return;}
      if(this.currentFloor===1&&FOOD.has(o.kind)&&dist(o.x,o.y,this.stove.x,this.stove.y)<130){this.cook(o);return;}
      if(this.currentFloor===1&&o.kind==='cup'&&dist(o.x,o.y,this.sink.x,this.sink.y)<125){o.state='water';o.itemColor=COLORS.aqua;o.drawItem();audio.water();this.discover('cup_water',this.sink.x,this.sink.y-80,'컵에 물을 받을 수 있어요');return;}
      if(this.currentFloor===2&&CLOTHES.has(o.kind)&&dist(o.x,o.y,this.washer.x,this.washer.y)<145&&this.washer.open){o.state='washer_loaded';o.setVisible(false);this.mission.loaded.add(o);this.discover('washer_load',this.washer.x,this.washer.y-145,'옷을 세탁기에 넣었어요');this.updateMission();return;}
      if(this.currentFloor===2&&o.state==='clean'&&dist(o.x,o.y,this.rack.x,this.rack.y)<150){o.state='dry';o.x=860+this.mission.dried.size*52;o.y=420;this.mission.dried.add(o);this.discover('dry_clothes',this.rack.x,this.rack.y-110,'깨끗한 옷을 건조대에 널 수 있어요');this.checkMilestone();return;}
      if(this.currentFloor===0&&['wheel','screw','driver','wrench'].includes(o.kind)&&dist(o.x,o.y,this.car.x,this.car.y)<170){this.repairCar(o);return;}
      if(this.currentFloor===0&&o.kind==='pump'){const ball=this.items.find(x=>x.floor===0&&x.kind==='ball'&&x.visible);if(ball&&dist(o.x,o.y,ball.x,ball.y)<110){ball.setScale(1.18);ball.state='inflated';this.discover('pump_ball',ball.x,ball.y-50,'펌프로 공에 바람을 넣었어요');return;}}
      if(o.kind==='wateringcan'||o.kind==='hose'){const plant=this.items.find(x=>x.floor===this.currentFloor&&x.kind==='plant'&&x.visible);if(plant&&dist(o.x,o.y,plant.x,plant.y)<110){plant.setScale(1.12);plant.state='watered';audio.water();this.discover('water_plant_'+this.currentFloor,plant.x,plant.y-45,'화분에 물을 줄 수 있어요');return;}}
      if(this.currentFloor===3&&['blocks','doll','toycar','train','puzzle','teddy','robot','cube'].includes(o.kind)&&dist(o.x,o.y,this.toyBox.x,this.toyBox.y)<145){o.state='tidied';o.setScale(.72);this.discover('toybox',this.toyBox.x,this.toyBox.y-90,'장난감을 상자에 정리할 수 있어요');return;}
      o.home={x:o.x,y:o.y};telemetry('free_drop',{kind:o.kind,floor:this.currentFloor,x:Math.round(o.x),y:Math.round(o.y)});
    }
    cook(o){o.state='cooked';o.itemColor=0xe6a15d;o.drawItem();audio.scrub();this.tweens.add({targets:o,angle:3,yoyo:true,repeat:4,duration:70});this.mission.cooked=true;this.discover('cook_'+o.kind,this.stove.x,this.stove.y-90,'음식을 조리하면 모양과 소리가 바뀌어요');this.checkMilestone();}
    feedCharacter(o,char){const cooked=o.state==='cooked';o.state='tasted';this.tweens.add({targets:o,scale:.7,yoyo:true,duration:FEEL.eat.biteMs});this.happy(char);audio.pop();if(cooked||this.mission.cooked)this.mission.fed=true;this.discover('feed_character',char.x,char.y-55,'준비한 음식을 캐릭터에게 먹일 수 있어요');this.checkMilestone();}
    washerAction(){if(this.washer.running)return;if(!this.washer.open){if(this.mission.loaded.size>=3){this.washer.running=true;const spin=this.add.arc(this.washer.x,this.washer.y,62,0,320,false,COLORS.aqua,.18).setStrokeStyle(9,COLORS.blue,.7).setDepth(25);this.tweens.add({targets:spin,angle:1080,duration:1250,onComplete:()=>{spin.destroy();this.washer.running=false;[...this.mission.loaded].forEach((o,i)=>{o.state='clean';o.floor=2;o.setVisible(this.currentFloor===2);o.x=760+i*58;o.y=520;o.home={x:o.x,y:o.y};});this.discover('wash_done',this.washer.x,this.washer.y-145,'세탁이 끝나면 깨끗한 옷을 꺼낼 수 있어요');this.updateMission();}});return;}this.washer.open=true;this.discover('washer_open',this.washer.x,this.washer.y-145,'문을 열고 빨랫감을 넣어요');}else{this.washer.open=false;audio.click();this.discover('washer_close',this.washer.x,this.washer.y-145,'문을 닫으면 세탁을 시작할 수 있어요');}}
    repairCar(o){const order=['wheel','screw','driver'];const expected=order[this.mission.repair];if(o.kind===expected){this.mission.repair++;o.state='installed';o.x=this.car.x-105+this.mission.repair*18;o.y=this.car.y+55;o.setScale(.72);o.home={x:o.x,y:o.y};audio.click();this.sparkle(o.x,o.y,4);this.discover('repair_'+o.kind,this.car.x,this.car.y-100,`${LABEL[o.kind]||o.kind}를 자동차에 사용했어요`);this.checkMilestone();return;}if(o.kind==='wrench'){this.car.setScale(1.02);this.time.delayedCall(180,()=>this.car.setScale(1));this.discover('wrench_free',this.car.x,this.car.y-100,'렌치도 자동차에 자유롭게 써볼 수 있어요');return;}o.home={x:o.x,y:o.y};}
    checkMilestone(){if(this.milestone)return;const ok=this.focusRound===1?(this.mission.cooked&&this.mission.fed):this.focusRound===2?(this.mission.loaded.size>=3&&this.mission.dried.size>=3):this.mission.repair>=3;if(!ok)return;this.milestone=true;this.sparkle(650,170,10);this.finishButton=this.add.text(650,555,'자유놀이 계속   ·   라운드 완료 ›',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#ffffff',backgroundColor:'#6c63ff',padding:{left:18,right:18,top:10,bottom:10}}).setOrigin(.5).setDepth(300).setInteractive({useHandCursor:true}).on('pointerup',()=>this.finish({score:this.discoveryScore()}));this.updateMission();}
    updateMission(){if(this.missionText)this.missionText.destroy();const text=this.milestone?'목표 달성 · 더 놀거나 완료 버튼을 눌러요':this.focusRound===1?'자유 목표: 음식을 조리하고 방 안 캐릭터에게 먹여보기':this.focusRound===2?`자유 목표: 빨래 3개 이상 세탁하고 건조대에 널기 (${this.mission.dried.size}/3)`:`자유 목표: 바퀴 → 나사 → 드라이버로 자동차 수리 (${this.mission.repair}/3)`;this.missionText=this.add.text(650,95,text,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#607086',backgroundColor:'#ffffffcc',padding:{left:10,right:10,top:5,bottom:5}}).setOrigin(.5).setDepth(100);}
    debugState(){return {...super.debugState(),benchmarkV5:'four-floor-free-house',focusRound:this.focusRound,currentFloor:this.currentFloor,itemCount:this.items.length,characterCount:this.characters.length,elevatorCargo:this.elevatorCargo.length,milestone:this.milestone,cooked:this.mission.cooked,fed:this.mission.fed,loaded:this.mission.loaded.size,dried:this.mission.dried.size,repair:this.mission.repair};}
  }

  class G2R1HouseV5 extends HouseWorldV5{constructor(done){super('G2R1',1,done);}}
  class G2R2HouseV5 extends HouseWorldV5{constructor(done){super('G2R2',2,done);}}
  class G2R3HouseV5 extends HouseWorldV5{constructor(done){super('G2R3',3,done);}}
  G2R1=G2R1HouseV5;G2R2=G2R2HouseV5;G2R3=G2R3HouseV5;
})();