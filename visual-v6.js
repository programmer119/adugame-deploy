// ADUGAME visual rebuild v6.
// Replaces prototype-like text cards with scene-native illustrated objects while preserving gameplay coordinates/hit targets.
(() => {
  const INK=0x24314a, MUTED=0x607086, WHITE=0xffffff, BLUE=0x5aa9e6, AQUA=0x7bdff2, PEACH=0xffb49f;
  const textStyle={fontFamily:'Arial, sans-serif',fontStyle:'bold',color:'#24314a'};

  function destroyChildren(c){ if(c?.removeAll)c.removeAll(true); }
  function label(scene,x,y,text,w=104){
    const t=scene.add.text(x,y,text,{...textStyle,fontSize:'14px',backgroundColor:'#ffffffee',padding:{left:9,right:9,top:5,bottom:5}}).setOrigin(.5).setDepth(32);
    t.setName('v6_label_'+text); return t;
  }
  function polishChrome(scene){
    const title=scene.children.list.find(o=>o?.type==='Text'&&Math.abs(o.x-54)<2&&Math.abs(o.y-43)<2);
    const subtitle=scene.children.list.find(o=>o?.type==='Text'&&Math.abs(o.x-54)<2&&Math.abs(o.y-79)<2);
    if(title)title.setFontSize('27px').setColor('#24314a');
    if(subtitle)subtitle.setFontSize('18px').setColor('#66758c');
    const vocab=scene.children.list.find(o=>o?.type==='Text'&&String(o.text).startsWith('생활도구'));
    if(vocab){vocab.setPosition(1085,116).setFontSize('15px').setPadding(12,8,12,8).setDepth(180);}
    if(scene.status)scene.status.setFontSize('22px').setPadding(15,9,15,9).setDepth(160);
  }
  function bathroomBackdrop(scene,accent=0x8ecae6){
    const g=scene.add.graphics().setDepth(2);
    g.fillStyle(0xf7fcff,1).fillRoundedRect(108,172,1054,404,26);
    g.fillStyle(0xe8f6fb,1).fillRoundedRect(108,172,1054,220,26);
    g.fillStyle(0xd9edf4,1).fillRect(108,392,1054,184);
    g.lineStyle(2,accent,.18);
    for(let x=150;x<1160;x+=90)g.lineBetween(x,172,x,392);
    for(let y=215;y<392;y+=58)g.lineBetween(108,y,1162,y);
    g.fillStyle(0xffffff,.95).fillRoundedRect(945,205,165,120,22);
    g.lineStyle(5,0xb9d5df,.7).strokeRoundedRect(945,205,165,120,22);
    g.fillStyle(0x90d7f0,.18).fillRoundedRect(956,216,143,98,16);
    return g;
  }
  function restyleToilet(scene){
    const c=scene.toilet;if(!c)return;destroyChildren(c);
    const g=scene.add.graphics();
    g.fillStyle(0x000000,.08).fillEllipse(0,92,205,34);
    g.fillStyle(0xf8fbfd,1).fillRoundedRect(-70,-112,140,103,20);
    g.lineStyle(4,0xb9cad4,.75).strokeRoundedRect(-70,-112,140,103,20);
    g.fillStyle(0xeaf4f8,1).fillRoundedRect(-82,-18,164,28,14);
    g.lineStyle(4,0xaebfc9,.7).strokeRoundedRect(-82,-18,164,28,14);
    g.fillStyle(WHITE,1).fillEllipse(0,43,208,112);
    g.lineStyle(5,0xaebfc9,.62).strokeEllipse(0,43,208,112);
    g.fillStyle(0xcfeefa,.9).fillEllipse(0,42,126,58);
    g.fillStyle(0xf5f8fa,1).fillRoundedRect(-55,83,110,35,14);
    c.add(g);c.setDepth(8);c.semanticLabel='변기';c.visualIdentity='illustrated';
    label(scene,c.x,c.y+118,'변기',88);
  }
  function restyleSink(scene){
    if(scene.sink){scene.sink.clear();scene.sink.setDepth(5);scene.sink.fillStyle(0x000000,.06).fillEllipse(400,540,330,35);scene.sink.fillStyle(0xfdfefe,1).fillRoundedRect(244,423,312,112,38);scene.sink.lineStyle(4,0xb5cad5,.7).strokeRoundedRect(244,423,312,112,38);scene.sink.fillStyle(0xd6eef7,1).fillEllipse(400,465,242,68);scene.sink.fillStyle(0xffffff,.85).fillEllipse(400,456,204,42);scene.sink.fillStyle(0xbccbd4,1).fillRoundedRect(282,510,236,70,14);}
    label(scene,400,565,'세면대',96);
  }
  function restyleFaucet(scene){
    const c=scene.faucet;if(!c)return;destroyChildren(c);
    const g=scene.add.graphics();
    g.fillStyle(0x000000,.08).fillEllipse(0,74,125,24);
    g.fillStyle(0xc8d4da,1).fillRoundedRect(-58,55,116,24,10);
    g.lineStyle(16,0x9cadb7,1).beginPath().moveTo(-42,55).lineTo(-42,0).arc(0,0,42,Math.PI,0).lineTo(42,34).strokePath();
    g.lineStyle(6,0xeaf1f4,.85).beginPath().moveTo(-38,52).lineTo(-38,3).arc(0,3,38,Math.PI,0).lineTo(38,31).strokePath();
    g.fillStyle(0x8fa2ad,1).fillRoundedRect(-22,-18,44,13,6);
    c.add(g);c.setDepth(9);c.semanticLabel='수도꼭지';c.visualIdentity='illustrated';
  }
  function restyleHands(scene){
    const c=scene.hands;if(!c)return;destroyChildren(c);const g=scene.add.graphics();
    g.fillStyle(0x000000,.06).fillEllipse(0,47,205,26);
    g.fillStyle(PEACH,1).fillRoundedRect(-88,-16,76,62,28).fillRoundedRect(12,-16,76,62,28);
    [-76,-58,-40,-22,24,42,60,78].forEach((x,i)=>g.fillRoundedRect(x,-38+(i%4)*2,15,39,8));
    g.lineStyle(3,0xdf8f79,.4).lineBetween(-15,0,15,0);
    c.add(g);c.setDepth(12);c.visualIdentity='illustrated';c.semanticLabel='손';
  }
  function restyleSoap(scene){
    const c=scene.soap;if(!c)return;destroyChildren(c);const g=scene.add.graphics();
    g.fillStyle(0x000000,.07).fillEllipse(0,36,104,19);
    g.fillStyle(0x74d3df,1).fillRoundedRect(-38,-25,76,61,16);g.lineStyle(3,0x3ba6b3,.45).strokeRoundedRect(-38,-25,76,61,16);
    g.fillStyle(0xffffff,.88).fillRoundedRect(-28,-14,56,28,9);
    g.fillStyle(0x9baab4,1).fillRoundedRect(-16,-50,32,22,6).fillRoundedRect(-15,-57,54,8,4);
    g.fillStyle(0x9baab4,1).fillRoundedRect(24,-57,9,17,4);
    c.add(g);c.add(scene.add.text(0,1,'비누',{...textStyle,fontSize:'13px',color:'#287b86'}).setOrigin(.5));
    c.visualIdentity='illustrated';c.semanticLabel='비누';
  }
  function addR1Props(scene){
    const g=scene.add.graphics().setDepth(6);
    g.fillStyle(0xffffff,.9).fillRoundedRect(111,246,92,120,15);g.lineStyle(3,0xbad0dc,.6).strokeRoundedRect(111,246,92,120,15);
    g.fillStyle(0xe3eef3,1).fillRoundedRect(124,258,66,96,10);
    g.fillStyle(0xffffff,1).fillRoundedRect(1005,350,88,48,12);g.lineStyle(3,0xaebfc9,.5).strokeRoundedRect(1005,350,88,48,12);g.fillStyle(0xffffff,1).fillEllipse(1048,375,60,35);
    scene.add.text(157,382,'거울',{...textStyle,fontSize:'13px',color:'#607086'}).setOrigin(.5).setDepth(7);
    scene.add.text(1048,414,'휴지',{...textStyle,fontSize:'13px',color:'#607086'}).setOrigin(.5).setDepth(7);
  }

  function drawTool(scene,c,kind,labelText){
    if(!c)return;destroyChildren(c);const g=scene.add.graphics();
    g.fillStyle(0x000000,.06).fillEllipse(0,31,116,19);
    if(kind==='toothpaste'){
      g.fillStyle(0xffffff,1).fillRoundedRect(-48,-21,86,42,10);g.lineStyle(3,0x79b7d9,.65).strokeRoundedRect(-48,-21,86,42,10);g.fillStyle(0x5aa9e6,1).fillRoundedRect(38,-13,18,26,5);g.fillStyle(0x70d6c8,1).fillRoundedRect(-30,-10,42,20,6);
    } else if(kind==='toothbrush'){
      g.fillStyle(0x55b8d6,1).fillRoundedRect(-50,-7,95,14,7);g.fillStyle(0x2d90b0,1).fillRoundedRect(35,-12,24,24,7);for(let x=39;x<=53;x+=7)g.fillStyle(0xffffff,1).fillRoundedRect(x,-17,4,11,2);
    } else if(kind==='cloth'){
      g.fillStyle(0x8ddfd7,1).fillRoundedRect(-43,-29,86,58,12);g.lineStyle(3,0x43afa6,.45).strokeRoundedRect(-43,-29,86,58,12);g.lineStyle(2,0xffffff,.5).lineBetween(-32,-17,32,17).lineBetween(-32,0,14,24);
    } else if(kind==='clipper'){
      g.lineStyle(11,0x9aa9b2,1).beginPath().moveTo(-34,18).lineTo(28,-22).strokePath();g.lineStyle(8,0xdbe4e9,1).beginPath().moveTo(-28,25).lineTo(34,-15).strokePath();g.lineStyle(5,0x7e8d96,1).strokeCircle(33,-17,8);g.fillStyle(0x7e8d96,1).fillRoundedRect(-39,12,24,14,6);
    }
    c.add(g);c.add(scene.add.text(0,47,labelText,{...textStyle,fontSize:'15px',backgroundColor:'#ffffffdd',padding:{left:8,right:8,top:3,bottom:3}}).setOrigin(.5));
    c.visualIdentity='illustrated';c.semanticLabel=labelText;
  }
  function improveMouth(scene){
    if(scene.mouth){scene.mouth.setSize(220,112).setFillStyle(0x6e2f3f,1).setStrokeStyle(5,0x9f6876,.45);}
    const teeth=[[-55,-20],[-18,-20],[18,-20],[55,-20],[-55,20],[-18,20],[18,20],[55,20]];
    teeth.forEach(([dx,dy])=>scene.add.rectangle(790+dx,365+dy,30,31,0xffffff,1).setStrokeStyle(2,0xe0e8ec,.8).setDepth(8.5));
    (scene.stains||[]).forEach(s=>s.setRadius(10).setFillStyle(0xe6ae6d,.82).setDepth(9.5));
  }
  function restyleNailHand(scene){
    const c=scene.hand;if(c){destroyChildren(c);const g=scene.add.graphics();g.fillStyle(0x000000,.06).fillEllipse(0,50,180,24);g.fillStyle(PEACH,1).fillRoundedRect(-78,-6,156,62,28);[-52,-26,0,26,52].forEach((x,i)=>g.fillRoundedRect(x-10,-49+(i%2)*4,20,55,10));c.add(g);c.setDepth(9);c.visualIdentity='illustrated';c.semanticLabel='손';}
    (scene.nails||[]).forEach(n=>n.setFillStyle(0xfff7f2,1).setStrokeStyle(2,0xd89082,.55).setScale(1.15));
  }
  function addR2Props(scene){
    const g=scene.add.graphics().setDepth(3);g.fillStyle(0xffffff,.96).fillRoundedRect(610,185,360,350,34);g.lineStyle(6,0xbad5df,.72).strokeRoundedRect(610,185,360,350,34);g.fillStyle(0x9fd7ea,.12).fillRoundedRect(625,200,330,320,26);
    g.fillStyle(0xd5e9f0,1).fillRoundedRect(930,535,210,36,18);g.fillStyle(0xbfd8e1,1).fillRoundedRect(954,570,160,16,8);
    label(scene,790,555,'거울 앞에서 천천히 따라 해요',220);
  }

  if(typeof G1R1!=='undefined'){
    const old=G1R1.prototype.create;
    G1R1.prototype.create=function(){old.call(this);bathroomBackdrop(this);restyleToilet(this);restyleSink(this);restyleFaucet(this);restyleHands(this);restyleSoap(this);addR1Props(this);polishChrome(this);this.v6Visual='illustrated-bathroom';};
  }
  if(typeof G1R2!=='undefined'){
    const old=G1R2.prototype.create;
    G1R2.prototype.create=function(){old.call(this);bathroomBackdrop(this,0x9fd5e8);addR2Props(this);drawTool(this,this.paste,'toothpaste','치약');drawTool(this,this.brush,'toothbrush','칫솔');drawTool(this,this.cloth,'cloth','세안천');drawTool(this,this.clipper,'clipper','손톱깎이');improveMouth(this);restyleNailHand(this);polishChrome(this);this.v6Visual='illustrated-hygiene';};
  }
  if(typeof G1R3!=='undefined'){
    const old=G1R3.prototype.create;
    G1R3.prototype.create=function(){old.call(this);polishChrome(this);this.v6Visual='clarity-pictogram';};
  }
  if(typeof G2R1!=='undefined'){
    [G2R1,G2R2,G2R3].forEach(Klass=>{const old=Klass.prototype.create;Klass.prototype.create=function(){old.call(this);polishChrome(this);this.v6Visual='house-pictogram';};});
  }
  if(typeof CraftRound!=='undefined'){
    const old=CraftRound.prototype.create;CraftRound.prototype.create=function(){old.call(this);polishChrome(this);this.v6Visual='store-clarity';};
  }
  window.__ADUGAME_VISUAL_V6__={loaded:true,version:'6.0.0',sceneNativeObjects:true,mobileLandscape:true};
})();
