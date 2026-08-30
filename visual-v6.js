// ADUGAME visual rebuild v6.
// Scene-native illustrated objects and mobile-first composition across all 9 rounds.
(() => {
  const INK=0x24314a, MUTED=0x607086, WHITE=0xffffff, BLUE=0x5aa9e6, AQUA=0x7bdff2, PEACH=0xffb49f;
  const textStyle={fontFamily:'Arial, sans-serif',fontStyle:'bold',color:'#24314a'};
  const COLORS_V6={wall:0xf8fcff,tile:0xe5f4fa,floor:0xd8ebf2,wood:0xc99562,wood2:0xe7bf8a,green:0x84c9a1,pink:0xffb3c7,yellow:0xffd66b,purple:0xa993df,steel:0x9eb2be};

  function destroyChildren(c){ if(c?.removeAll)c.removeAll(true); }
  function label(scene,x,y,text,w=104,depth=32){
    const t=scene.add.text(x,y,text,{...textStyle,fontSize:'14px',backgroundColor:'#ffffffee',padding:{left:9,right:9,top:5,bottom:5}}).setOrigin(.5).setDepth(depth);
    t.setName('v6_label_'+text); return t;
  }
  function shadow(g,x,y,w,h,a=.08){g.fillStyle(0x000000,a).fillEllipse(x,y,w,h);}
  function polishChrome(scene){
    const title=scene.children.list.find(o=>o?.type==='Text'&&Math.abs(o.x-54)<2&&Math.abs(o.y-43)<2);
    const subtitle=scene.children.list.find(o=>o?.type==='Text'&&Math.abs(o.x-54)<2&&Math.abs(o.y-79)<2);
    if(title)title.setFontSize('27px').setColor('#24314a').setDepth(300);
    if(subtitle)subtitle.setFontSize('18px').setColor('#66758c').setDepth(300);
    const vocab=scene.children.list.find(o=>o?.type==='Text'&&String(o.text).startsWith('생활도구'));
    if(vocab){vocab.setPosition(1085,116).setFontSize('15px').setPadding(12,8,12,8).setDepth(320);}
    if(scene.status)scene.status.setFontSize('22px').setPadding(15,9,15,9).setDepth(330);
  }

  function bathroomBackdrop(scene,accent=0x8ecae6){
    const g=scene.add.graphics().setDepth(2).setName('v6_bathroom_backdrop');
    g.fillStyle(COLORS_V6.wall,1).fillRoundedRect(108,172,1054,404,26);
    g.fillStyle(COLORS_V6.tile,1).fillRoundedRect(108,172,1054,222,26);
    g.fillStyle(COLORS_V6.floor,1).fillRect(108,394,1054,182);
    g.lineStyle(2,accent,.16);for(let x=150;x<1160;x+=90)g.lineBetween(x,172,x,394);for(let y=218;y<394;y+=58)g.lineBetween(108,y,1162,y);
    g.fillStyle(0xffffff,.96).fillRoundedRect(945,205,165,120,22);g.lineStyle(5,0xb9d5df,.7).strokeRoundedRect(945,205,165,120,22);g.fillStyle(0x90d7f0,.16).fillRoundedRect(956,216,143,98,16);
    return g;
  }
  function restyleToilet(scene){
    const c=scene.toilet;if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,92,205,34);
    g.fillStyle(0xf8fbfd,1).fillRoundedRect(-70,-112,140,103,20);g.lineStyle(4,0xb9cad4,.75).strokeRoundedRect(-70,-112,140,103,20);
    g.fillStyle(0xeaf4f8,1).fillRoundedRect(-82,-18,164,28,14);g.lineStyle(4,0xaebfc9,.7).strokeRoundedRect(-82,-18,164,28,14);
    g.fillStyle(WHITE,1).fillEllipse(0,43,208,112);g.lineStyle(5,0xaebfc9,.62).strokeEllipse(0,43,208,112);g.fillStyle(0xcfeefa,.9).fillEllipse(0,42,126,58);g.fillStyle(0xf5f8fa,1).fillRoundedRect(-55,83,110,35,14);
    c.add(g);c.setDepth(8);c.semanticLabel='변기';c.visualIdentity='illustrated';label(scene,c.x,c.y+118,'변기',88);
  }
  function restyleSink(scene){
    if(scene.sink){scene.sink.clear();scene.sink.setDepth(5);shadow(scene.sink,400,540,330,35,.06);scene.sink.fillStyle(0xfdfefe,1).fillRoundedRect(244,423,312,112,38);scene.sink.lineStyle(4,0xb5cad5,.7).strokeRoundedRect(244,423,312,112,38);scene.sink.fillStyle(0xd6eef7,1).fillEllipse(400,465,242,68);scene.sink.fillStyle(0xffffff,.85).fillEllipse(400,456,204,42);scene.sink.fillStyle(0xbccbd4,1).fillRoundedRect(282,510,236,70,14);}label(scene,400,565,'세면대',96);
  }
  function restyleFaucet(scene){
    const c=scene.faucet;if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,74,125,24);g.fillStyle(0xc8d4da,1).fillRoundedRect(-58,55,116,24,10);g.lineStyle(16,0x9cadb7,1).beginPath().moveTo(-42,55).lineTo(-42,0).arc(0,0,42,Math.PI,0).lineTo(42,34).strokePath();g.lineStyle(6,0xeaf1f4,.85).beginPath().moveTo(-38,52).lineTo(-38,3).arc(0,3,38,Math.PI,0).lineTo(38,31).strokePath();g.fillStyle(0x8fa2ad,1).fillRoundedRect(-22,-18,44,13,6);c.add(g);c.setDepth(9);c.semanticLabel='수도꼭지';c.visualIdentity='illustrated';
  }
  function restyleHands(scene){
    const c=scene.hands;if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,47,205,26,.06);g.fillStyle(PEACH,1).fillRoundedRect(-88,-16,76,62,28).fillRoundedRect(12,-16,76,62,28);[-76,-58,-40,-22,24,42,60,78].forEach((x,i)=>g.fillRoundedRect(x,-38+(i%4)*2,15,39,8));g.lineStyle(3,0xdf8f79,.4).lineBetween(-15,0,15,0);c.add(g);c.setDepth(12);c.visualIdentity='illustrated';c.semanticLabel='손';
  }
  function restyleSoap(scene){
    const c=scene.soap;if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,36,104,19,.07);g.fillStyle(0x74d3df,1).fillRoundedRect(-38,-25,76,61,16);g.lineStyle(3,0x3ba6b3,.45).strokeRoundedRect(-38,-25,76,61,16);g.fillStyle(0xffffff,.88).fillRoundedRect(-28,-14,56,28,9);g.fillStyle(0x9baab4,1).fillRoundedRect(-16,-50,32,22,6).fillRoundedRect(-15,-57,54,8,4);g.fillStyle(0x9baab4,1).fillRoundedRect(24,-57,9,17,4);c.add(g);c.add(scene.add.text(0,1,'비누',{...textStyle,fontSize:'13px',color:'#287b86'}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel='비누';
  }
  function addR1Props(scene){const g=scene.add.graphics().setDepth(6);g.fillStyle(0xffffff,.9).fillRoundedRect(111,246,92,120,15);g.lineStyle(3,0xbad0dc,.6).strokeRoundedRect(111,246,92,120,15);g.fillStyle(0xe3eef3,1).fillRoundedRect(124,258,66,96,10);g.fillStyle(0xffffff,1).fillRoundedRect(1005,350,88,48,12);g.lineStyle(3,0xaebfc9,.5).strokeRoundedRect(1005,350,88,48,12);g.fillStyle(0xffffff,1).fillEllipse(1048,375,60,35);scene.add.text(157,382,'거울',{...textStyle,fontSize:'13px',color:'#607086'}).setOrigin(.5).setDepth(7);scene.add.text(1048,414,'휴지',{...textStyle,fontSize:'13px',color:'#607086'}).setOrigin(.5).setDepth(7);}
  function drawTool(scene,c,kind,labelText){
    if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,31,116,19,.06);
    if(kind==='toothpaste'){g.fillStyle(0xffffff,1).fillRoundedRect(-48,-21,86,42,10);g.lineStyle(3,0x79b7d9,.65).strokeRoundedRect(-48,-21,86,42,10);g.fillStyle(0x5aa9e6,1).fillRoundedRect(38,-13,18,26,5);g.fillStyle(0x70d6c8,1).fillRoundedRect(-30,-10,42,20,6);}
    else if(kind==='toothbrush'){g.fillStyle(0x55b8d6,1).fillRoundedRect(-50,-7,95,14,7);g.fillStyle(0x2d90b0,1).fillRoundedRect(35,-12,24,24,7);for(let x=39;x<=53;x+=7)g.fillStyle(0xffffff,1).fillRoundedRect(x,-17,4,11,2);}
    else if(kind==='cloth'){g.fillStyle(0x8ddfd7,1).fillRoundedRect(-43,-29,86,58,12);g.lineStyle(3,0x43afa6,.45).strokeRoundedRect(-43,-29,86,58,12);g.lineStyle(2,0xffffff,.5).lineBetween(-32,-17,32,17).lineBetween(-32,0,14,24);}
    else if(kind==='clipper'){g.lineStyle(11,0x9aa9b2,1).beginPath().moveTo(-34,18).lineTo(28,-22).strokePath();g.lineStyle(8,0xdbe4e9,1).beginPath().moveTo(-28,25).lineTo(34,-15).strokePath();g.lineStyle(5,0x7e8d96,1).strokeCircle(33,-17,8);g.fillStyle(0x7e8d96,1).fillRoundedRect(-39,12,24,14,6);}
    c.add(g);c.add(scene.add.text(0,47,labelText,{...textStyle,fontSize:'15px',backgroundColor:'#ffffffdd',padding:{left:8,right:8,top:3,bottom:3}}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel=labelText;
  }
  function improveMouth(scene){if(scene.mouth){scene.mouth.setSize(220,112).setFillStyle(0x6e2f3f,1).setStrokeStyle(5,0x9f6876,.45);}const teeth=[[-55,-20],[-18,-20],[18,-20],[55,-20],[-55,20],[-18,20],[18,20],[55,20]];teeth.forEach(([dx,dy])=>scene.add.rectangle(790+dx,365+dy,30,31,0xffffff,1).setStrokeStyle(2,0xe0e8ec,.8).setDepth(8.5));(scene.stains||[]).forEach(s=>s.setRadius(10).setFillStyle(0xe6ae6d,.82).setDepth(9.5));}
  function restyleNailHand(scene){const c=scene.hand;if(c){destroyChildren(c);const g=scene.add.graphics();shadow(g,0,50,180,24,.06);g.fillStyle(PEACH,1).fillRoundedRect(-78,-6,156,62,28);[-52,-26,0,26,52].forEach((x,i)=>g.fillRoundedRect(x-10,-49+(i%2)*4,20,55,10));c.add(g);c.setDepth(9);c.visualIdentity='illustrated';c.semanticLabel='손';}(scene.nails||[]).forEach(n=>n.setFillStyle(0xfff7f2,1).setStrokeStyle(2,0xd89082,.55).setScale(1.15));}
  function addR2Props(scene){const g=scene.add.graphics().setDepth(3);g.fillStyle(0xffffff,.96).fillRoundedRect(610,185,360,350,34);g.lineStyle(6,0xbad5df,.72).strokeRoundedRect(610,185,360,350,34);g.fillStyle(0x9fd7ea,.12).fillRoundedRect(625,200,330,320,26);g.fillStyle(0xd5e9f0,1).fillRoundedRect(930,535,210,36,18);g.fillStyle(0xbfd8e1,1).fillRoundedRect(954,570,160,16,8);label(scene,790,555,'거울 앞에서 천천히 따라 해요',220);}

  function drawHabitObject(scene,c,kind){
    if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,35,105,18,.07);
    if(kind==='ball'){g.fillStyle(0xffd34e,1).fillCircle(0,0,34);g.lineStyle(4,0xe09b24,.7).strokeCircle(0,0,34);g.lineStyle(4,0xffffff,.75).beginPath().arc(0,0,25,-.9,.9).strokePath();}
    else if(kind==='book'){g.fillStyle(0x5aa9e6,1).fillRoundedRect(-38,-30,76,60,7);g.fillStyle(0xffffff,.9).fillRect(-28,-19,56,38);g.lineStyle(3,0x2e78aa,.6).lineBetween(0,-28,0,28);}
    else if(kind==='block'){g.fillStyle(0xff8f70,1).fillRoundedRect(-32,-32,64,64,8);g.lineStyle(4,0xd6674e,.55).strokeRoundedRect(-32,-32,64,64,8);g.fillStyle(0xffd76a,1).fillCircle(0,0,14);}
    else if(kind==='apple'){g.fillStyle(0xe74c4c,1).fillCircle(0,4,30);g.fillStyle(0x63a85f,1).fillEllipse(13,-26,23,10);g.lineStyle(5,0x7c5131,1).lineBetween(0,-20,3,-34);}
    else if(kind==='carrot'){g.fillStyle(0xf28c35,1).fillTriangle(-27,-20,27,-20,0,35);g.fillStyle(0x63a85f,1).fillTriangle(-15,-22,-5,-48,2,-22).fillTriangle(0,-22,14,-48,10,-20);}
    else if(kind==='wholegrain'){g.fillStyle(0xd19a55,1).fillRoundedRect(-38,-27,76,54,16);g.lineStyle(3,0x9c6a34,.45).strokeRoundedRect(-38,-27,76,54,16);for(let x=-22;x<=22;x+=22)g.fillStyle(0xf2d79e,1).fillEllipse(x,-4,9,18);}
    else if(kind==='cookie'){g.fillStyle(0xc58a4c,1).fillCircle(0,0,32);[[-13,-12],[10,-14],[-8,11],[14,9]].forEach(([x,y])=>g.fillStyle(0x6d4527,1).fillCircle(x,y,4));}
    else if(kind==='soda'){g.fillStyle(0xe85f6f,1).fillRoundedRect(-24,-34,48,68,10);g.fillStyle(0xffffff,.9).fillRoundedRect(-19,-4,38,23,7);g.fillStyle(0xcbd7df,1).fillRoundedRect(-11,-44,22,11,4);}
    else {g.fillStyle(0xb9c8d5,1).fillRoundedRect(-30,-30,60,60,12);}
    const names={ball:'공',book:'책',block:'블록',apple:'사과',carrot:'당근',wholegrain:'통곡물빵',cookie:'쿠키',soda:'탄산음료'};
    c.add(g);c.add(scene.add.text(0,49,names[kind]||kind,{...textStyle,fontSize:'14px',backgroundColor:'#ffffffdd',padding:{left:7,right:7,top:2,bottom:2}}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel=names[kind]||kind;
  }
  function addR3Scene(scene){
    const g=scene.add.graphics().setDepth(2).setName('v6_r3_room');
    g.fillStyle(0xfef7ef,1).fillRoundedRect(95,160,1080,430,28);g.fillStyle(0xf3e7d8,1).fillRect(95,405,1080,185);
    g.fillStyle(0xd8ecff,1).fillRoundedRect(120,190,390,185,24);g.fillStyle(0xb8dbf3,.45).fillRoundedRect(142,210,346,145,18);g.fillStyle(0xffffff,.88).fillRoundedRect(155,222,320,121,12);
    g.fillStyle(0xd6a46d,1).fillRoundedRect(145,430,220,115,22);g.fillStyle(0xa86e3c,1).fillRoundedRect(165,448,180,78,16);
    g.fillStyle(0xd9b88d,1).fillRoundedRect(580,408,300,122,18);g.fillStyle(0xb98552,1).fillRoundedRect(600,525,20,50,7).fillRoundedRect(840,525,20,50,7);
    g.fillStyle(0x8bc6a0,1).fillRoundedRect(955,420,160,115,18);g.fillStyle(0x6ea685,1).fillRoundedRect(973,438,124,78,14);
    scene.add.text(255,468,'🧺',{fontSize:'50px'}).setOrigin(.5).setDepth(5);scene.add.text(735,468,'🍽️',{fontSize:'46px'}).setOrigin(.5).setDepth(5);
    scene.add.text(255,535,'장난감 정리함',{...textStyle,fontSize:'15px',color:'#6f4d2d'}).setOrigin(.5).setDepth(6);scene.add.text(735,540,'오늘의 건강한 식탁',{...textStyle,fontSize:'15px',color:'#6f4d2d'}).setOrigin(.5).setDepth(6);
    const body=scene.add.graphics().setDepth(6);body.fillStyle(0x5aa9e6,1).fillRoundedRect(995,363,90,125,34);body.fillStyle(0xffd2b8,1).fillCircle(1040,350,48);body.fillStyle(0x5a3e2f,1).fillEllipse(1040,318,83,38);body.fillStyle(INK,.8).fillCircle(1026,347,4).fillCircle(1054,347,4);body.lineStyle(3,INK,.7).beginPath().arc(1040,360,17,.2,Math.PI-.2).strokePath();
    (scene.toys||[]).forEach(o=>drawHabitObject(scene,o,o.kind));(scene.foods||[]).forEach(o=>drawHabitObject(scene,o,o.kind));
  }

  function drawHouseBackdrop(scene,f){
    let g=scene.v6HouseBackdrop;if(!g)g=scene.v6HouseBackdrop=scene.add.graphics().setDepth(1.5).setName('v6_house_backdrop');g.clear();
    const walls=[0xf5eee5,0xfff3e6,0xeaf7ff,0xf4efff], floors=[0xd7b98a,0xd4aa75,0xc7e4ec,0xd9c8e9];
    g.fillStyle(walls[f],1).fillRoundedRect(112,132,1046,440,24);g.fillStyle(floors[f],1).fillRect(112,462,1046,110);
    if(f===0){g.fillStyle(0xe8e3da,1).fillRoundedRect(140,180,310,270,12);g.lineStyle(5,0xb4aba0,.65).strokeRoundedRect(140,180,310,270,12);for(let y=220;y<440;y+=50)g.lineBetween(140,y,450,y);g.fillStyle(0x8fc2a6,1).fillRoundedRect(900,205,170,95,15);g.fillStyle(0x6aa886,1).fillRoundedRect(918,225,134,56,10);g.fillStyle(0x7f9c72,1).fillCircle(978,200,27);}
    else if(f===1){g.fillStyle(0xf9f6ef,1).fillRoundedRect(150,175,365,255,20);g.lineStyle(5,0xe5d6c4,.9).strokeRoundedRect(150,175,365,255,20);g.fillStyle(0xbfe3f4,.75).fillRoundedRect(770,185,285,145,20);g.lineStyle(5,0x9cc9de,.65).strokeRoundedRect(770,185,285,145,20);g.fillStyle(0xf1d0b1,1).fillRoundedRect(580,460,390,70,22);}
    else if(f===2){g.fillStyle(0xf8fdff,1).fillRoundedRect(145,172,920,288,22);g.lineStyle(2,0x9ac7d9,.16);for(let x=180;x<1050;x+=80)g.lineBetween(x,172,x,460);for(let y=215;y<460;y+=55)g.lineBetween(145,y,1065,y);g.fillStyle(0xbfe7f4,.65).fillRoundedRect(160,190,260,150,20);g.fillStyle(0xffffff,.9).fillRoundedRect(175,205,230,120,14);}
    else{g.fillStyle(0xe8dfff,1).fillRoundedRect(150,185,280,210,24);g.fillStyle(0xf8fbff,1).fillRoundedRect(170,205,240,170,18);g.fillStyle(0xffe3a8,1).fillCircle(1030,230,45);g.fillStyle(0x92c8a8,1).fillRoundedRect(950,380,150,95,22);g.fillStyle(0x7bb493,1).fillCircle(1025,365,38);}
  }
  function fixtureLabel(c){return String(c?.name||'').replace('fixture_','');}
  function restyleFixture(scene,c){
    if(!c)return;const key=fixtureLabel(c);destroyChildren(c);const g=scene.add.graphics();shadow(g,0,(c.height||100)/2*.7,(c.width||160)*.9,28,.08);
    if(key==='car'){g.fillStyle(0xe85f63,1).fillRoundedRect(-105,-35,210,70,25);g.fillStyle(0xf28c8e,1).fillRoundedRect(-50,-70,105,45,18);g.fillStyle(0xaed7e5,1).fillRoundedRect(-36,-60,76,26,10);g.fillStyle(0x263746,1).fillCircle(-70,38,25).fillCircle(70,38,25);g.fillStyle(0xc9d3d8,1).fillCircle(-70,38,11).fillCircle(70,38,11);}
    else if(key==='tool_box'){g.fillStyle(0xc57d42,1).fillRoundedRect(-70,-35,140,70,12);g.fillStyle(0x8a552e,1).fillRoundedRect(-38,-55,76,19,8);g.fillStyle(0xe2b27f,1).fillRoundedRect(-58,-18,116,15,6);}
    else if(key==='yard_box'){g.fillStyle(0x8db394,1).fillRoundedRect(-65,-38,130,76,16);g.fillStyle(0x6b9173,1).fillRoundedRect(-72,-48,144,18,8);g.fillStyle(0xffffff,.75).fillCircle(0,4,20);}
    else if(key==='stove'){g.fillStyle(0xe6edf1,1).fillRoundedRect(-85,-55,170,110,15);g.fillStyle(0x596a73,1).fillRoundedRect(-76,-45,152,58,11);[-40,35].forEach(x=>g.fillStyle(0x202a30,1).fillCircle(x,-17,23));g.fillStyle(0xb9c6cd,1).fillRoundedRect(-66,20,132,26,8);}
    else if(key==='sink'){g.fillStyle(0xf7fbfd,1).fillRoundedRect(-80,-45,160,90,20);g.fillStyle(0xcbe8f3,1).fillEllipse(0,-5,118,46);g.lineStyle(10,0x9cabb4,1).beginPath().moveTo(-18,-20).lineTo(-18,-58).arc(8,-58,26,Math.PI,0).lineTo(34,-34).strokePath();}
    else if(key==='fridge'){g.fillStyle(0xf4f7f9,1).fillRoundedRect(-70,-105,140,210,18);g.lineStyle(4,0xbcc8ce,.65).strokeRoundedRect(-70,-105,140,210,18);g.lineStyle(3,0xc7d0d5,.8).lineBetween(-66,-18,66,-18);g.fillStyle(0x9eabb2,1).fillRoundedRect(43,-70,9,43,4).fillRoundedRect(43,12,9,43,4);}
    else if(key==='sofa'){g.fillStyle(0xb8a2df,1).fillRoundedRect(-125,-28,250,70,24);g.fillStyle(0xcdbceb,1).fillRoundedRect(-115,-58,230,50,22);g.fillStyle(0x9d85cc,1).fillRoundedRect(-130,-25,26,58,13).fillRoundedRect(104,-25,26,58,13);}
    else if(key==='washer'){g.fillStyle(0xf8fbfd,1).fillRoundedRect(-105,-112,210,224,24);g.lineStyle(4,0xb9c8d0,.7).strokeRoundedRect(-105,-112,210,224,24);g.fillStyle(0x667985,1).fillRoundedRect(-80,-92,160,28,8);g.fillStyle(0xbce3ee,1).fillCircle(0,28,65);g.lineStyle(10,0x8da3ae,.8).strokeCircle(0,28,65);g.fillStyle(0xffffff,.55).fillCircle(-18,8,22);}
    else if(key==='dry_rack'){g.lineStyle(10,0x9e8b6e,1).lineBetween(-90,50,-65,-58).lineBetween(90,50,65,-58).lineBetween(-66,-45,66,-45).lineBetween(-75,-5,75,-5);[-42,0,42].forEach(x=>{g.lineStyle(5,0x6f92b3,1).lineBetween(x,-45,x,-12);g.fillStyle(0x8ecae6,1).fillRoundedRect(x-24,-8,48,44,8);});}
    else if(key==='bath'){g.fillStyle(0xf8fcfe,1).fillRoundedRect(-100,-25,200,70,32);g.fillStyle(0xbfe7f4,1).fillRoundedRect(-88,-12,176,42,20);g.fillStyle(0x9faeb6,1).fillRoundedRect(70,-70,13,52,6);g.lineStyle(8,0x9faeb6,1).beginPath().moveTo(76,-66).arc(50,-66,26,0,Math.PI).strokePath();}
    else if(key==='toy_box'){g.fillStyle(0xc88a4e,1).fillRoundedRect(-88,-40,176,80,14);g.fillStyle(0xe0ac73,1).fillRoundedRect(-96,-55,192,24,10);g.fillStyle(0xffd45d,1).fillCircle(-30,-8,15);g.fillStyle(0x5aa9e6,1).fillRoundedRect(5,-22,38,38,6);}
    else if(key==='bed'){g.fillStyle(0xf8f4ff,1).fillRoundedRect(-130,-45,260,90,20);g.fillStyle(0xffcad7,1).fillRoundedRect(-120,-35,240,70,17);g.fillStyle(0xffffff,1).fillRoundedRect(-112,-28,80,55,18);g.fillStyle(0xa87bc5,1).fillRoundedRect(-135,-62,15,112,7);}
    else if(key==='patio'){g.fillStyle(0xd9c79f,1).fillRoundedRect(-80,-70,160,140,18);g.fillStyle(0x8fc49e,1).fillRoundedRect(-64,12,128,52,14);[-38,0,38].forEach(x=>{g.fillStyle(0x6ba47d,1).fillRoundedRect(x-12,-14,24,32,8);g.fillStyle(0x5c9a70,1).fillCircle(x,-30,25);});}
    else {g.fillStyle(0xd9e4ea,1).fillRoundedRect(-(c.width||150)/2,-(c.height||100)/2,c.width||150,c.height||100,18);}
    const names={car:'자동차',tool_box:'공구함',yard_box:'마당 상자',stove:'조리대',sink:'싱크대',fridge:'냉장고',sofa:'소파',washer:'세탁기',dry_rack:'건조대',bath:'욕조',toy_box:'장난감 상자',bed:'침대',patio:'테라스'};
    c.add(g);c.add(scene.add.text(0,(c.height||100)/2*.58,names[key]||key,{...textStyle,fontSize:'13px',backgroundColor:'#ffffffd9',padding:{left:7,right:7,top:2,bottom:2}}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel=names[key]||key;
  }
  function restyleHouseItems(scene){
    for(const o of scene.items||[]){const graphics=o.list?.find(x=>x?.type==='Graphics'),texts=o.list?.filter(x=>x?.type==='Text')||[],pic=texts.find(x=>Number(x.y)<0),name=texts.find(x=>Number(x.y)>=0);if(graphics){graphics.clear();shadow(graphics,0,22,54,14,.07);graphics.fillStyle(0xffffff,.72).fillCircle(0,-4,27);graphics.lineStyle(2,INK,.1).strokeCircle(0,-4,27);}if(pic)pic.setFontSize('28px').setY(-7);if(name)name.setFontSize('10px').setY(24).setBackgroundColor('#ffffffcc').setPadding(3,1,3,1);o.visualIdentity='illustrated-token';}
  }
  function restyleHouseRail(scene){for(const b of scene.floorRail?.list||[]){if(b?.type==='Text')b.setFontSize('12px').setBackgroundColor('#ffffffee').setPadding(8,7,8,7).setShadow(0,2,'#7c8a991f',2);}}
  function styleHouseScene(scene){drawHouseBackdrop(scene,scene.currentFloor||0);[scene.car,scene.toolbox,scene.yardBox,scene.stove,scene.sink,scene.fridge,scene.sofa,scene.washer,scene.rack,scene.bath,scene.toyBox,scene.bed,scene.patio].forEach(c=>restyleFixture(scene,c));restyleHouseItems(scene);restyleHouseRail(scene);if(scene.dockBg)scene.dockBg.setFillStyle(0xe9f2ff,.82).setStrokeStyle(3,0x7a8cce,.2);scene.v6Visual='illustrated-four-floor-house';polishChrome(scene);}

  function slimeShopBackdrop(scene){
    const g=scene.add.graphics().setDepth(2).setName('v6_slime_shop');
    g.fillStyle(0xfff5f7,1).fillRoundedRect(95,160,1080,430,28);g.fillStyle(0xf6d8df,1).fillRect(95,405,1080,185);
    g.fillStyle(0x765489,1).fillRoundedRect(95,160,1080,58,20);g.fillStyle(0xf7c75d,1).fillRoundedRect(120,176,250,28,12);g.fillStyle(0xffffff,.96).fillRoundedRect(128,180,234,20,9);
    scene.add.text(245,190,'SLIME LAB',{fontFamily:'Arial',fontSize:'17px',fontStyle:'bold',color:'#6b4d78'}).setOrigin(.5).setDepth(3);
    g.fillStyle(0xffffff,.92).fillRoundedRect(125,235,355,130,22);g.lineStyle(4,0xe5c2cb,.6).strokeRoundedRect(125,235,355,130,22);
    g.fillStyle(0xa9d8ea,.5).fillRoundedRect(520,220,370,270,28);g.fillStyle(0xffffff,.7).fillEllipse(705,390,310,150);
    g.fillStyle(0x8a5c42,1).fillRoundedRect(890,430,240,105,18);g.fillStyle(0xb68058,1).fillRoundedRect(875,415,270,30,12);
    g.fillStyle(0x6f4c82,1).fillRoundedRect(920,230,190,120,20);for(let y=255;y<335;y+=35)g.fillStyle(0xe9d9f2,.9).fillRoundedRect(940,y,150,16,7);
  }
  function restyleBowl(scene){const c=scene.bowl;if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,80,290,34,.09);g.fillStyle(0xffffff,.82).fillEllipse(0,18,330,155);g.lineStyle(6,0x8fb3c2,.48).strokeEllipse(0,18,330,155);g.fillStyle(0xbfeaf3,.34).fillEllipse(0,25,270,95);g.lineStyle(3,0xffffff,.8).beginPath().arc(-40,0,90,3.6,5.5).strokePath();c.add(g);c.visualIdentity='illustrated';c.semanticLabel='믹싱볼';}
  function restyleSlimeBottle(scene,c,kind){if(!c)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,58,92,18,.07);const base=kind==='base'?0xf6f8fb:0xa7e2ef, edge=kind==='base'?0xbcc8d0:0x5db8c9;g.fillStyle(base,1).fillRoundedRect(-34,-45,68,92,16);g.lineStyle(4,edge,.55).strokeRoundedRect(-34,-45,68,92,16);g.fillStyle(0xffffff,.86).fillRoundedRect(-25,-16,50,31,9);g.fillStyle(0x81929c,1).fillRoundedRect(-18,-63,36,18,6);g.fillStyle(0x81929c,1).fillRoundedRect(-13,-70,46,8,4);c.add(g);c.add(scene.add.text(0,-1,kind==='base'?'베이스':'활성액',{...textStyle,fontSize:'12px',color:kind==='base'?'#526574':'#287c8e'}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel=kind==='base'?'베이스':'활성액';}
  function restyleDecos(scene){const nameMap={star:['★','별'],flower:['✿','꽃'],heart:['♥','하트'],banana:['◒','바나나']};scene.children.list.filter(o=>o?.name?.startsWith('deco_')&&!o.name.startsWith('deco_bonus_')).forEach(c=>{const kind=c.name.replace('deco_',''),info=nameMap[kind];if(!info)return;destroyChildren(c);const g=scene.add.graphics();shadow(g,0,30,72,15,.06);g.fillStyle(0xffffff,1).fillEllipse(0,0,74,58);g.lineStyle(3,0xd4b5c7,.5).strokeEllipse(0,0,74,58);c.add(g);c.add(scene.add.text(0,-5,info[0],{fontFamily:'Arial',fontSize:'29px',fontStyle:'bold',color:kind==='heart'?'#e85d79':'#7b62c7'}).setOrigin(.5));c.add(scene.add.text(0,34,info[1],{...textStyle,fontSize:'11px',backgroundColor:'#ffffffdd',padding:{left:5,right:5,top:1,bottom:1}}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel=info[1];});}
  function restyleContainers(scene){for(const c of scene.children.list.filter(o=>o?.name==='container_round'||o?.name==='container_square')){const round=c.name.endsWith('round');destroyChildren(c);const g=scene.add.graphics();shadow(g,0,25,100,16,.07);g.fillStyle(0xf8fbfd,1);if(round){g.fillEllipse(0,0,92,55);g.lineStyle(4,0x9fb3bd,.6).strokeEllipse(0,0,92,55);}else{g.fillRoundedRect(-45,-27,90,54,10);g.lineStyle(4,0x9fb3bd,.6).strokeRoundedRect(-45,-27,90,54,10);}c.add(g);c.add(scene.add.text(0,35,round?'원형 용기':'네모 용기',{...textStyle,fontSize:'11px',backgroundColor:'#ffffffdd',padding:{left:5,right:5,top:1,bottom:1}}).setOrigin(.5));c.visualIdentity='illustrated';c.semanticLabel=round?'원형 용기':'네모 용기';}}
  function styleColorButtons(scene){[['blue','파랑',210],['green','초록',325],['pink','분홍',440]].forEach(([k,labelText,x])=>{const b=scene.children.list.find(o=>o?.name==='color_'+k);if(b){b.setRadius(32).setStrokeStyle(5,0xffffff,.9).setDepth(18);scene.add.text(x,397,labelText,{...textStyle,fontSize:'12px',backgroundColor:'#ffffffd9',padding:{left:6,right:6,top:2,bottom:2}}).setOrigin(.5).setDepth(19);}});}
  function addCustomerBody(scene){const body=scene.add.graphics().setDepth(4).setName('v6_customer_body');body.fillStyle(0x7b62c7,1).fillRoundedRect(1034,298,92,115,34);body.fillStyle(0xffd3b8,1).fillCircle(1080,275,50);body.fillStyle(0x684536,1).fillEllipse(1080,240,86,40);body.fillStyle(INK,.8).fillCircle(1066,273,4).fillCircle(1094,273,4);body.lineStyle(3,INK,.7).beginPath().arc(1080,288,17,.2,Math.PI-.2).strokePath();}
  function polishStore(scene){slimeShopBackdrop(scene);restyleBowl(scene);restyleSlimeBottle(scene,scene.base,'base');restyleSlimeBottle(scene,scene.activator,'activator');restyleDecos(scene);restyleContainers(scene);styleColorButtons(scene);addCustomerBody(scene);if(scene.serveButton)scene.serveButton.setFontSize('18px').setPadding(22,11,22,11).setBackgroundColor('#e85d79').setText('손님에게 주기').setDepth(120);if(scene.orderBubble)scene.orderBubble.setDepth(110);if(scene.economyPanel)scene.economyPanel.setDepth(105);if(scene.supplyRail)scene.supplyRail.setDepth(105);scene.v6Visual='illustrated-slime-shop';polishChrome(scene);}

  if(typeof G1R1!=='undefined'){const old=G1R1.prototype.create;G1R1.prototype.create=function(){old.call(this);bathroomBackdrop(this);restyleToilet(this);restyleSink(this);restyleFaucet(this);restyleHands(this);restyleSoap(this);addR1Props(this);polishChrome(this);this.v6Visual='illustrated-bathroom';};}
  if(typeof G1R2!=='undefined'){const old=G1R2.prototype.create;G1R2.prototype.create=function(){old.call(this);bathroomBackdrop(this,0x9fd5e8);addR2Props(this);drawTool(this,this.paste,'toothpaste','치약');drawTool(this,this.brush,'toothbrush','칫솔');drawTool(this,this.cloth,'cloth','세안천');drawTool(this,this.clipper,'clipper','손톱깎이');improveMouth(this);restyleNailHand(this);polishChrome(this);this.v6Visual='illustrated-hygiene';};}
  if(typeof G1R3!=='undefined'){const old=G1R3.prototype.create;G1R3.prototype.create=function(){old.call(this);addR3Scene(this);polishChrome(this);this.v6Visual='illustrated-tidy-meal';};}
  if(typeof G2R1!=='undefined'){
    [G2R1,G2R2,G2R3].forEach(Klass=>{const oldCreate=Klass.prototype.create;Klass.prototype.create=function(){oldCreate.call(this);styleHouseScene(this);};const oldShow=Klass.prototype.showFloor;Klass.prototype.showFloor=function(f,initial=false){const r=oldShow.call(this,f,initial);if(this.v6HouseBackdrop)drawHouseBackdrop(this,f);return r;};});
  }
  if(typeof CraftRound!=='undefined'){const old=CraftRound.prototype.create;CraftRound.prototype.create=function(){old.call(this);polishStore(this);};}

  window.__ADUGAME_VISUAL_V6__={loaded:true,version:'6.1.0',sceneNativeObjects:true,mobileLandscape:true,allNineRounds:true};
})();
