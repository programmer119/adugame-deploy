// ADUGAME v6.2 visual polish. Turns the remaining UI-mockup surfaces into scene-native game spaces.
(() => {
  const INK=0x24314a, MUTED=0x607086;
  const patchCreate=(K,after)=>{if(!K)return;const old=K.prototype.create;K.prototype.create=function(){old.call(this);after.call(this);};};
  const txt=(scene,x,y,text,size=14,depth=30)=>scene.add.text(x,y,text,{fontFamily:'Arial, sans-serif',fontSize:`${size}px`,fontStyle:'bold',color:'#24314a'}).setOrigin(.5).setDepth(depth);
  const shadow=(g,x,y,w,h,a=.08)=>g.fillStyle(0x24314a,a).fillEllipse(x,y,w,h);

  function polishR3(scene){
    const toyX={ball:190,book:305,block:420}, foodX={apple:555,carrot:670,wholegrain:785,cookie:895,soda:985};
    for(const o of scene.toys||[]){if(toyX[o.kind]){o.setPosition(toyX[o.kind],270);o.home={x:o.x,y:o.y};o.setDepth(18);}}
    for(const o of scene.foods||[]){if(foodX[o.kind]){o.setPosition(foodX[o.kind],270);o.home={x:o.x,y:o.y};o.setDepth(18);}}
    const g=scene.add.graphics().setDepth(3).setName('v6_r3_polish');
    g.fillStyle(0xf4dfc6,1).fillRoundedRect(135,185,335,180,24);g.lineStyle(4,0xd1aa7c,.45).strokeRoundedRect(135,185,335,180,24);
    g.fillStyle(0xfaf3e9,1).fillRoundedRect(500,185,525,180,24);g.lineStyle(4,0xdcc7ae,.45).strokeRoundedRect(500,185,525,180,24);
    g.fillStyle(0xc89458,1).fillRoundedRect(155,345,295,18,8);g.fillStyle(0xd8b68d,1).fillRoundedRect(525,345,475,18,8);
    txt(scene,302,202,'정리할 장난감',16,4);txt(scene,762,202,'오늘 먹을 음식',16,4);
    scene.v6Polish='room-native-r3';
  }

  function drawPerson(g,i,pet=false){
    const palette=[0xffad9e,0x7fc8ee,0xffd166,0x86dfce,0xb69df5,0xffa985,0x78bddb,0xffcf63,0x83dac9,0xb693f0], c=palette[i%palette.length];
    if(pet){
      g.fillStyle(c,1).fillEllipse(0,2,48,42);g.fillTriangle(-21,-10,-10,-34,-2,-12).fillTriangle(21,-10,10,-34,2,-12);
      g.fillStyle(INK,.82).fillCircle(-8,0,3).fillCircle(8,0,3);g.lineStyle(2,INK,.7).lineBetween(-3,9,0,11).lineBetween(3,9,0,11);
      g.fillStyle(c,1).fillRoundedRect(-23,16,46,30,15);g.lineStyle(5,c,1).beginPath().arc(22,25,18,-1.2,.9).strokePath();
    }else{
      g.fillStyle(c,1).fillRoundedRect(-22,6,44,39,15);g.fillStyle(0xffc7ab,1).fillCircle(0,-12,22);g.fillStyle(0x654638,1).fillEllipse(0,-28,39,18);
      g.fillStyle(INK,.8).fillCircle(-7,-13,2.5).fillCircle(7,-13,2.5);g.lineStyle(2,INK,.7).beginPath().arc(0,-6,8,.2,Math.PI-.2).strokePath();
      g.lineStyle(7,c,1).lineBetween(-17,34,-18,50).lineBetween(17,34,18,50);
    }
  }
  function polishHouseCharacters(scene){
    (scene.characters||[]).forEach((c,i)=>{
      const g=c.list?.find(x=>x?.type==='Graphics');if(!g)return;g.clear();drawPerson(g,i,i>=8);
      const name=c.list?.find(x=>x?.type==='Text');if(name)name.setY(43).setFontSize('10px').setBackgroundColor('#ffffffdd').setPadding(4,1,4,1);
      c.visualIdentity='illustrated-character';c.semanticLabel=c.charName||`캐릭터${i+1}`;c.setDepth(36);
    });
  }
  function polishElevator(scene){
    const c=scene.elevator,g=c?.list?.find(x=>x?.type==='Graphics');if(!c||!g)return;g.clear();
    shadow(g,0,126,150,24,.08);g.fillStyle(0xdfe7ec,1).fillRoundedRect(-72,-120,144,240,18);g.lineStyle(4,0x9cabb6,.7).strokeRoundedRect(-72,-120,144,240,18);
    g.fillStyle(0xb9c7d0,1).fillRoundedRect(-60,-96,120,190,8);g.lineStyle(3,0x8799a5,.65).lineBetween(0,-94,0,92);
    g.fillStyle(0x334653,1).fillRoundedRect(-32,-113,64,28,8);g.fillStyle(0x81d5ef,1).fillCircle(0,-99,7);
    g.fillStyle(0xffffff,.92).fillTriangle(-22,112,0,96,22,112);g.fillStyle(0xffffff,.92).fillTriangle(-22,132,0,148,22,132);
    c.visualIdentity='illustrated-elevator';scene.elevatorLabel?.setText('엘리베이터').setPosition(1130,508).setFontSize('12px');scene.cargoText?.setPosition(1130,355).setDepth(38);
  }
  function polishInventory(scene){
    const shelf=scene.add.graphics().setDepth(8).setName('v6_inventory_shelf');
    shelf.fillStyle(0xe7d4b9,.95).fillRoundedRect(292,166,790,106,18);shelf.lineStyle(3,0xb89267,.35).strokeRoundedRect(292,166,790,106,18);
    shelf.fillStyle(0xb88652,1).fillRoundedRect(305,244,760,14,6);shelf.fillStyle(0x8d633e,.42).fillRoundedRect(318,258,14,25,4).fillRoundedRect(1038,258,14,25,4);
    for(const o of scene.items||[]){
      const graphics=o.list?.find(x=>x?.type==='Graphics'),texts=o.list?.filter(x=>x?.type==='Text')||[],pic=texts.find(x=>Number(x.y)<0),name=texts.find(x=>Number(x.y)>=0);
      if(graphics){graphics.clear();shadow(graphics,0,22,42,10,.08);}
      if(pic)pic.setFontSize('31px').setY(-5);if(name)name.setY(25).setFontSize('10px').setBackgroundColor('#fff8edee').setPadding(4,1,4,1);
      o.visualIdentity='scene-shelf-item';o.setDepth(16);
    }
    const pager=scene.inventoryHud;if(pager)pager.setDepth(42);
  }
  function polishFloorRail(scene){
    const labels=['1F\n차고·마당','2F\n주방·거실','3F\n욕실·세탁실','4F\n아이방·테라스'];
    (scene.floorRail?.list||[]).forEach((b,i)=>{if(b?.type!=='Text')return;b.setText(labels[i]||b.text).setFontSize('12px').setColor('#42536b').setBackgroundColor(i===scene.currentFloor?'#d9eeff':'#ffffffee').setPadding(9,8,9,8);});
  }
  function polishHouseMission(scene){
    const m=scene.missionText;if(m)m.setFontSize('17px').setColor('#42536b').setBackgroundColor('#ffffffed').setPadding(14,7,14,7).setDepth(120).setWordWrapWidth(650);
  }
  function addHouseDetails(scene){
    const g=scene.add.graphics().setDepth(3).setName('v6_house_details');
    const f=scene.currentFloor;
    if(f===0){g.fillStyle(0xf8fbfd,.9).fillRoundedRect(495,190,250,110,18);g.lineStyle(4,0xb3c2ca,.5).strokeRoundedRect(495,190,250,110,18);g.fillStyle(0x90b8c8,.28).fillRoundedRect(515,210,210,70,12);txt(scene,620,245,'작업대',15,4);}
    if(f===1){g.fillStyle(0xd6b27d,1).fillRoundedRect(590,520,360,18,8);g.fillStyle(0xffe5a8,.62).fillEllipse(770,505,250,55);}
    if(f===2){g.fillStyle(0x9ed9e8,.2).fillRoundedRect(175,188,230,125,16);g.fillStyle(0xffffff,.82).fillRoundedRect(185,198,210,105,14);g.fillStyle(0x83c7db,.42).fillRoundedRect(1005,185,95,225,16);}
    if(f===3){g.fillStyle(0xffffff,.8).fillRoundedRect(500,178,205,145,18);g.fillStyle(0xbce3f4,.6).fillRoundedRect(514,192,177,117,14);g.lineStyle(4,0xffffff,.8).lineBetween(602,195,602,307).lineBetween(516,250,688,250);}
  }
  function polishHouse(scene){
    polishHouseCharacters(scene);polishElevator(scene);polishInventory(scene);polishFloorRail(scene);polishHouseMission(scene);addHouseDetails(scene);
    if(scene.dockBg)scene.dockBg.setFillStyle(0xe9f4ff,.96).setStrokeStyle(3,0x90b4d8,.28).setDepth(14);
    const dock=scene.children.list.find(o=>o?.type==='Text'&&String(o.text).includes('가족·친구'));if(dock)dock.setFontSize('12px').setColor('#607086').setDepth(25);
    scene.v6Polish=`house-floor-${scene.currentFloor+1}`;
  }

  function polishSlimeOrder(scene){
    const bubble=scene.orderBubble;if(!bubble)return;const bg=bubble.list?.find(x=>x?.type==='Graphics');if(bg){bg.clear();bg.fillStyle(0xffffff,.98).fillRoundedRect(-160,-86,320,172,25);bg.lineStyle(4,0xcba8d8,.5).strokeRoundedRect(-160,-86,320,172,25);bg.fillStyle(0xffffff,.98).fillTriangle(120,60,164,72,128,22);}
    bubble.setPosition(905,485).setScale(.9).setDepth(112);
    scene.orderLabel?.setText('손님 주문').setFontSize('15px');
  }
  function polishSlimeShop(scene){
    const g=scene.add.graphics().setDepth(3).setName('v6_slime_polish');
    // shop awning + workbench; keeps all actual hit targets untouched above it.
    g.fillStyle(0xf7e0e7,1).fillRoundedRect(118,160,1028,74,18);for(let x=130,i=0;x<1135;x+=92,i++)g.fillStyle(i%2?0xffffff:0xe887a0,.95).fillRoundedRect(x,164,78,48,10);
    g.fillStyle(0xc58d62,1).fillRoundedRect(470,472,430,102,20);g.fillStyle(0xe3b78d,1).fillRoundedRect(450,452,470,32,12);g.fillStyle(0x9a6748,.55).fillRoundedRect(490,565,26,56,7).fillRoundedRect(855,565,26,56,7);
    // finished slime jars on wall shelf for store identity.
    g.fillStyle(0x8b5b77,.9).fillRoundedRect(935,245,170,16,7);g.fillStyle(0x8b5b77,.9).fillRoundedRect(935,310,170,16,7);
    [[965,280,0x7bdff2],[1015,280,0xff8fab],[1065,280,0xb2f7ef],[965,345,0xb8a1ff],[1015,345,0xffd166],[1065,345,0x8bd17c]].forEach(([x,y,c])=>{g.fillStyle(0xffffff,.9).fillRoundedRect(x-16,y-22,32,44,9);g.fillStyle(c,.75).fillRoundedRect(x-12,y-5,24,23,7);g.fillStyle(0x786b70,.75).fillRoundedRect(x-13,y-27,26,7,3);});
    txt(scene,1020,222,'완성 슬라임 진열대',13,4);
    // make the three color controls read as dye pots instead of abstract circles.
    [['blue',210],['green',325],['pink',440]].forEach(([k,x])=>{const b=scene.children.list.find(o=>o?.name===`color_${k}`);if(!b)return;const cap=scene.add.graphics().setDepth(17);cap.fillStyle(0xffffff,.92).fillRoundedRect(x-23,315,46,18,6);cap.fillStyle(0x748590,1).fillRoundedRect(x-13,306,26,11,4);b.setDepth(18).setRadius(30);});
    polishSlimeOrder(scene);
    if(scene.status)scene.status.setFontSize('19px').setBackgroundColor('#ffffffed').setPadding(14,7,14,7).setDepth(150);
    scene.v6Polish='slime-store-scene';
  }

  if(typeof G1R3!=='undefined')patchCreate(G1R3,function(){polishR3(this);});
  if(typeof G2R1!=='undefined'){
    [G2R1,G2R2,G2R3].forEach(K=>{
      patchCreate(K,function(){polishHouse(this);});
      const oldShow=K.prototype.showFloor;K.prototype.showFloor=function(f,initial=false){const r=oldShow.call(this,f,initial);this.time?.delayedCall?.(0,()=>{polishFloorRail(this);polishHouseMission(this);});return r;};
    });
  }
  if(typeof CraftRound!=='undefined')patchCreate(CraftRound,function(){polishSlimeShop(this);});

  window.__ADUGAME_VISUAL_V6_POLISH__={loaded:true,version:'6.2.0',allNineTight:true,houseSceneNative:true,storeSceneNative:true};
})();