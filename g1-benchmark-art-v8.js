// ADUGAME G1 benchmark art pass v8.1
// Character source: Kenney Toon Characters (CC0-1.0), mirrored at Tiddybub/2d-assets.
// All visible bathroom props in this pass are scene-native flat vectors drawn in one palette so the
// round reads as one cartoon game scene instead of a collage of unrelated emoji/assets.
(() => {
  if (typeof G1R1 !== 'function') return;

  const KENNEY='https://cdn.jsdelivr.net/gh/Tiddybub/2d-assets@main/characters/toon-characters/Female%20person/PNG/Poses%20HD/';
  const CHILD={
    idle: KENNEY+'character_femalePerson_idle.png',
    interact: KENNEY+'character_femalePerson_interact.png',
    cheer: KENNEY+'character_femalePerson_cheer0.png'
  };
  const P={ink:0x31546a,deep:0x4b7890,sky:0xdff6fb,sky2:0xbfe9f2,cream:0xfff7e5,floor:0xffe7bd,white:0xffffff,
    mint:0x9ee2c4,mint2:0x6fc7a0,pink:0xffa9c2,pink2:0xf47fa1,yellow:0xffd76a,blue:0x69bce4,peach:0xffc2a6,brown:0xb97854};

  const priorPreload=G1R1.prototype.preload;
  G1R1.prototype.preload=function(){
    if(priorPreload) priorPreload.call(this);
    if(!this.textures.exists('g1v8_child_idle')) this.load.image('g1v8_child_idle',CHILD.idle);
    if(!this.textures.exists('g1v8_child_interact')) this.load.image('g1v8_child_interact',CHILD.interact);
    if(!this.textures.exists('g1v8_child_cheer')) this.load.image('g1v8_child_cheer',CHILD.cheer);
  };

  function clearContainer(c){ if(c?.removeAll) c.removeAll(true); }
  function kill(scene,name){scene.children.list.filter(o=>o?.name===name).forEach(o=>o.destroy());}

  function hidePrototypeChrome(scene){
    scene.children.list.forEach(o=>{
      if(o?.type!=='Text') return;
      const t=String(o.text||'').trim();
      if(t==='도구 보기' || t.startsWith('생활도구')) o.setVisible(false);
      if(t.startsWith('생활 실습') && (t.includes('ROUND')||t.includes('단계'))) o.setVisible(false);
      if(t===scene.meta?.title) o.setVisible(false);
      if(['변기','세면대','거울','휴지','비누'].includes(t)) o.setVisible(false);
    });
    scene.children.list.filter(o=>o?.type==='Text' && String(o.text||'').trim()==='⌂').forEach(o=>o.setAlpha(.28));
  }

  function makeRoom(scene){
    const old=scene.children.list.find(o=>o?.name==='g1v7_bathroom_world'); if(old) old.setVisible(false);
    ['g1v8_scene_join','g1v8_flat_world'].forEach(n=>kill(scene,n));
    const c=scene.add.container(0,0).setDepth(3).setName('g1v8_flat_world');
    const g=scene.add.graphics();

    // One coherent room: tiled wall, warm floor and a chunky rounded game-scene frame.
    g.fillStyle(P.white,1).fillRoundedRect(88,145,1104,457,34);
    g.fillStyle(P.sky,1).fillRoundedRect(101,158,1078,279,25);
    g.fillStyle(P.floor,1).fillRoundedRect(101,407,1078,182,0);
    g.lineStyle(2,P.white,.75);
    for(let x=118;x<1170;x+=74) g.lineBetween(x,158,x,407);
    for(let y=204;y<407;y+=48) g.lineBetween(101,y,1179,y);
    g.lineStyle(4,P.deep,.18).strokeRoundedRect(88,145,1104,457,34);

    // Mirror and shelf directly over the real sink station.
    g.fillStyle(P.white,1).fillRoundedRect(268,178,264,132,28);
    g.lineStyle(7,P.blue,.38).strokeRoundedRect(268,178,264,132,28);
    g.fillStyle(0xcdf2fa,.78).fillRoundedRect(284,194,232,100,20);
    g.fillStyle(P.white,.7).fillRoundedRect(302,210,92,13,7);
    g.fillStyle(P.deep,.18).fillRoundedRect(270,331,260,15,8);
    // Small toothbrush cup and bottle as non-interactive dressing.
    g.fillStyle(P.yellow,1).fillRoundedRect(469,306,30,35,9);
    g.fillStyle(P.blue,1).fillRoundedRect(479,276,5,35,3);
    g.fillStyle(P.pink,1).fillRoundedRect(454,289,8,46,4);

    // Towel rack and towel.
    g.lineStyle(7,P.deep,.7).lineBetween(135,250,225,250);
    g.fillStyle(P.pink,1).fillRoundedRect(151,252,58,88,13);
    g.fillStyle(P.pink2,.38).fillRoundedRect(164,266,32,60,9);

    // Toilet paper and wall picture: scene detail, not a target.
    g.fillStyle(P.white,1).fillCircle(920,276,28);g.lineStyle(4,P.deep,.24).strokeCircle(920,276,28);
    g.fillStyle(P.sky2,1).fillCircle(920,276,11);g.fillStyle(P.white,1).fillRoundedRect(918,286,34,42,6);
    g.fillStyle(P.white,.94).fillRoundedRect(1002,185,116,85,18);g.lineStyle(5,P.mint2,.35).strokeRoundedRect(1002,185,116,85,18);
    g.fillStyle(P.yellow,.75).fillCircle(1038,218,17);g.fillStyle(P.mint,.7).fillEllipse(1074,228,42,26);

    // Plant and rubber duck make the room feel lived-in without competing with the targets.
    g.fillStyle(P.white,1).fillRoundedRect(1082,352,58,49,12);g.fillStyle(P.mint2,1).fillEllipse(1096,329,22,46).fillEllipse(1121,325,23,50).fillEllipse(1108,311,19,45);
    g.fillStyle(P.yellow,1).fillCircle(865,535,18);g.fillStyle(P.yellow,1).fillEllipse(850,546,42,25);g.fillStyle(P.brown,1).fillRoundedRect(878,528,13,7,4);

    // Grounding mats beneath the two major activity stations.
    g.fillStyle(P.pink,.18).fillEllipse(400,558,345,52);
    g.fillStyle(P.blue,.16).fillEllipse(740,558,260,48);
    g.fillStyle(P.mint,.16).fillEllipse(1030,557,220,44);
    c.add(g);
    return c;
  }

  function styleSink(scene){
    if(!scene.sink?.clear) return;
    const g=scene.sink;g.clear();g.setDepth(5.2);
    g.fillStyle(0x31546a,.08).fillEllipse(400,554,326,34);
    g.fillStyle(P.deep,1).fillRoundedRect(270,469,260,93,18);
    g.fillStyle(P.blue,1).fillRoundedRect(282,482,236,67,13);
    g.fillStyle(P.white,1).fillRoundedRect(240,417,320,68,31);
    g.lineStyle(5,P.deep,.28).strokeRoundedRect(240,417,320,68,31);
    g.fillStyle(P.sky2,1).fillEllipse(400,450,225,48);
    g.fillStyle(P.white,.72).fillEllipse(400,445,164,25);
    g.fillStyle(P.deep,.22).fillCircle(400,452,8);
    g.fillStyle(P.white,.55).fillRoundedRect(300,495,200,9,5).fillRoundedRect(300,523,200,9,5);
  }

  function styleFaucet(scene){
    const c=scene.faucet;if(!c)return;clearContainer(c);
    const g=scene.add.graphics();
    g.lineStyle(24,P.deep,1).beginPath().moveTo(-46,69).lineTo(-46,8).arc(0,8,46,Math.PI,0).lineTo(46,34).strokePath();
    g.lineStyle(11,P.sky2,1).beginPath().moveTo(-40,65).lineTo(-40,12).arc(0,12,40,Math.PI,0).lineTo(40,31).strokePath();
    g.fillStyle(P.deep,1).fillRoundedRect(-31,-31,62,18,9);g.fillStyle(P.sky2,1).fillRoundedRect(-19,-45,38,16,7);
    g.fillStyle(P.deep,1).fillRoundedRect(35,27,25,18,8);
    c.add(g);c.setDepth(9);c.visualIdentity='illustrated';c.semanticLabel='수도꼭지';c.licensedArt=false;
  }

  function styleToilet(scene){
    const c=scene.toilet;if(!c)return;clearContainer(c);
    const g=scene.add.graphics();
    g.fillStyle(P.ink,.08).fillEllipse(0,99,215,31);
    g.fillStyle(P.white,1).fillRoundedRect(-70,-112,140,96,22);g.lineStyle(5,P.deep,.25).strokeRoundedRect(-70,-112,140,96,22);
    g.fillStyle(P.sky2,.7).fillRoundedRect(-56,-96,112,17,8);
    g.fillStyle(P.white,1).fillEllipse(0,31,210,112);g.lineStyle(5,P.deep,.27).strokeEllipse(0,31,210,112);
    g.fillStyle(P.sky2,1).fillEllipse(0,24,160,61);g.fillStyle(P.white,1).fillEllipse(0,20,126,40);
    g.fillStyle(P.white,1).fillRoundedRect(-58,57,116,57,23);g.lineStyle(4,P.deep,.18).strokeRoundedRect(-58,57,116,57,23);
    // Visible flush button is exactly over the real invisible flush hit target (global 790,275).
    g.fillStyle(P.yellow,1).fillRoundedRect(28,-120,44,30,12);g.lineStyle(4,P.deep,.3).strokeRoundedRect(28,-120,44,30,12);
    g.fillStyle(P.white,.85).fillCircle(50,-105,7);
    c.add(g);c.setDepth(8);c.visualIdentity='illustrated';c.semanticLabel='변기';c.licensedArt=false;
    if(scene.flush) scene.flush.setAlpha(.001);
    kill(scene,'g1v7_flush_art');
  }

  function styleHands(scene){
    const c=scene.hands;if(!c)return;clearContainer(c);
    const g=scene.add.graphics();
    g.fillStyle(P.ink,.07).fillEllipse(0,42,188,24);
    // Two simplified cartoon palms with visible fingers; same outline/palette as the room props.
    [-55,55].forEach((cx,idx)=>{
      g.fillStyle(P.peach,1).fillRoundedRect(cx-39,-18,78,66,30);
      g.lineStyle(4,P.brown,.32).strokeRoundedRect(cx-39,-18,78,66,30);
      for(let i=0;i<4;i++){
        const fx=cx-30+i*20;
        g.fillStyle(P.peach,1).fillRoundedRect(fx-8,-45-(i%2)*6,16,42+(i%2)*6,8);
      }
      g.fillStyle(P.peach,1).fillEllipse(cx+(idx?39:-39),9,29,48);
    });
    c.add(g);c.setDepth(12);c.visualIdentity='illustrated';c.semanticLabel='손';c.licensedArt=false;
  }

  function styleSoap(scene){
    const c=scene.soap;if(!c)return;clearContainer(c);
    const g=scene.add.graphics();
    g.fillStyle(P.ink,.07).fillEllipse(0,40,88,18);
    g.fillStyle(P.pink,1).fillRoundedRect(-48,-31,96,68,25);g.lineStyle(5,P.deep,.24).strokeRoundedRect(-48,-31,96,68,25);
    g.fillStyle(P.white,.62).fillRoundedRect(-28,-17,44,11,6);
    g.lineStyle(4,P.white,.78).strokeCircle(20,7,11);g.strokeCircle(34,-5,7);
    c.add(g);c.setPosition(270,395).setDepth(11);c.home={x:c.x,y:c.y};
    c.visualIdentity='illustrated';c.semanticLabel='비누';c.licensedArt=false;
  }

  function restyleCharacter(scene){
    const c=scene.face;if(!c||!scene.textures.exists('g1v8_child_idle'))return;clearContainer(c);
    const img=scene.add.image(0,0,'g1v8_child_idle').setOrigin(.5,1).setDisplaySize(208,282);c.add(img);
    c.setPosition(1035,555).setDepth(12);c.visualIdentity='illustrated';c.semanticLabel='어린이';c.licensedArtSource='Kenney Toon Characters / CC0-1.0';
    ['g1v7_character_shadow','g1v8_character_shadow'].forEach(n=>kill(scene,n));
    scene.add.ellipse(1035,559,150,25,P.ink,.09).setDepth(4.5).setName('g1v8_character_shadow');
  }

  function miniToilet(scene,x,y){
    const c=scene.add.container(x,y).setDepth(41).setName('g1v8_mini_toilet');const g=scene.add.graphics();
    g.fillStyle(P.white,1).fillRoundedRect(-23,-31,46,31,8);g.lineStyle(3,P.deep,.3).strokeRoundedRect(-23,-31,46,31,8);
    g.fillStyle(P.white,1).fillEllipse(0,12,66,38);g.lineStyle(3,P.deep,.3).strokeEllipse(0,12,66,38);g.fillStyle(P.sky2,1).fillEllipse(0,10,45,18);c.add(g);return c;
  }

  function addThoughtBubble(scene){
    ['g1v8_thought','g1v8_mini_toilet'].forEach(n=>kill(scene,n));
    const c=scene.add.container(1025,178).setDepth(40).setName('g1v8_thought');const g=scene.add.graphics();
    g.fillStyle(P.white,.98).fillEllipse(0,0,156,91);g.lineStyle(5,P.blue,.42).strokeEllipse(0,0,156,91);
    g.fillStyle(P.white,.98).fillCircle(-57,51,12).fillCircle(-72,69,7);c.add(g);miniToilet(scene,1025,180);
    scene.tweens.add({targets:c,y:c.y-4,yoyo:true,repeat:-1,duration:900,ease:'Sine.InOut'});
    scene.time.addEvent({delay:120,loop:true,callback:()=>{if(!c.active)return;const vis=scene.step===0&&!scene.roundComplete;c.setVisible(vis);scene.children.list.filter(o=>o?.name==='g1v8_mini_toilet').forEach(o=>o.setVisible(vis));}});
    if(scene.urge) scene.urge.setAlpha(0);
  }

  function polishStatus(scene){
    if(!scene.status)return;
    scene.status.setPosition(650,630).setFontSize('20px').setColor('#31546a').setBackgroundColor('#ffffffee').setPadding(18,10,18,10).setDepth(340);
  }

  function apply(scene){
    if(scene.scene?.key!=='G1R1'||!scene.textures.exists('g1v8_child_idle'))return;
    hidePrototypeChrome(scene);makeRoom(scene);styleSink(scene);styleFaucet(scene);styleToilet(scene);styleHands(scene);styleSoap(scene);restyleCharacter(scene);addThoughtBubble(scene);polishStatus(scene);
    [scene.toilet,scene.faucet,scene.hands,scene.soap].filter(Boolean).forEach(o=>o.visualIdentity='illustrated');
    scene.__g1BenchmarkArtV8='unified-flat-v8.1';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R1={character:{library:'Kenney Toon Characters',license:'CC0-1.0'},props:{library:'ADUGAME scene-native vector art'},pass:'v8.1'};
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){priorCreate.call(this);apply(this);this.time.delayedCall(90,()=>apply(this));};
})();
