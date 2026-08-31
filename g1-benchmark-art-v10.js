// ADUGAME G1 R2 character-first rebuild v10.0
// Character: Kenney Toon Characters (CC0). Props are scene-native flat game art.
(() => {
  if (typeof G1R2 !== 'function') return;

  const KENNEY='https://cdn.jsdelivr.net/gh/Tiddybub/2d-assets@main/characters/toon-characters/Male%20person/PNG/Poses%20HD/';
  const IDLE=KENNEY+'character_malePerson_idle.png';
  const CHEER=KENNEY+'character_malePerson_cheer0.png';
  const P={ink:0x31546a,blue:0x66b9df,sky:0xdff6fb,white:0xffffff,mint:0x9ee2c4,mint2:0x6fc7a0,
    pink:0xffa9c2,pink2:0xf47fa1,cream:0xfff7e5,floor:0xffe7bd,peach:0xffc2a6,brown:0xb97854,metal:0x8ea2ad};

  const oldPreload=G1R2.prototype.preload;
  G1R2.prototype.preload=function(){
    if(oldPreload) oldPreload.call(this);
    if(!this.textures.exists('g1v10_kid_idle')) this.load.image('g1v10_kid_idle',IDLE);
    if(!this.textures.exists('g1v10_kid_cheer')) this.load.image('g1v10_kid_cheer',CHEER);
  };

  const clear=c=>{if(c?.removeAll)c.removeAll(true);};
  const kill=(s,n)=>s.children.list.filter(o=>o?.name===n).forEach(o=>o.destroy());

  function rebuildWorld(scene){
    kill(scene,'g1v10_r2_world');
    scene.children.list.forEach(o=>{
      if(o?.type!=='Text')return;
      const t=String(o.text||'').trim();
      if(['세면도구','거울','손톱 정리'].includes(t))o.setVisible(false);
      if(t.startsWith('생활 실습')&&t.includes('ROUND'))o.setVisible(false);
      if(t===scene.meta?.title)o.setVisible(false);
      if(t.startsWith('생활도구'))o.setVisible(false);
    });

    const c=scene.add.container(0,0).setDepth(2.75).setName('g1v10_r2_world');
    const g=scene.add.graphics();
    // full bathroom, not a diagram card
    g.fillStyle(P.sky,1).fillRoundedRect(86,146,1110,452,34);
    g.fillStyle(0xc9edf5,1).fillRoundedRect(98,158,1086,280,25);
    g.fillStyle(P.floor,1).fillRect(98,414,1086,172);
    g.lineStyle(2,P.white,.7);
    for(let x=118;x<1170;x+=78)g.lineBetween(x,158,x,414);
    for(let y=205;y<414;y+=52)g.lineBetween(98,y,1184,y);
    g.lineStyle(4,P.ink,.13).strokeRoundedRect(86,146,1110,452,34);

    // left vanity shelf for real props
    g.fillStyle(0xf8fdff,1).fillRoundedRect(124,184,210,350,26);
    g.lineStyle(4,P.blue,.24).strokeRoundedRect(124,184,210,350,26);
    [292,405,518].forEach(y=>g.fillStyle(P.ink,.10).fillRoundedRect(143,y,172,10,5));

    // central mirror + basin
    g.fillStyle(P.white,1).fillRoundedRect(535,168,500,394,38);
    g.lineStyle(8,P.blue,.35).strokeRoundedRect(535,168,500,394,38);
    g.fillStyle(0xd6f4fa,.74).fillRoundedRect(555,188,460,332,28);
    g.fillStyle(P.white,.72).fillRoundedRect(584,210,170,14,7);
    g.fillStyle(P.white,1).fillRoundedRect(560,515,450,66,30);
    g.lineStyle(4,P.ink,.14).strokeRoundedRect(560,515,450,66,30);
    g.fillStyle(0xbfe9f2,1).fillEllipse(785,548,260,38);
    // faucet
    g.lineStyle(16,P.metal,1).beginPath().moveTo(782,510).lineTo(782,480).arc(810,480,28,Math.PI,0).lineTo(838,498).strokePath();

    // right towel + small plant, enough scenery without icon-board clutter
    g.fillStyle(P.mint,.9).fillRoundedRect(1060,270,82,145,16);
    g.lineStyle(3,P.mint2,.35).strokeRoundedRect(1060,270,82,145,16);
    g.fillStyle(P.white,1).fillRoundedRect(1070,490,62,50,12);
    g.fillStyle(P.mint2,1).fillEllipse(1087,465,24,56).fillEllipse(1113,464,25,60);
    c.add(g);
  }

  function rebuildCharacter(scene){
    const face=scene.face;
    if(!face)return;
    clear(face);
    kill(scene,'g1v10_kid_shadow');
    scene.add.ellipse(790,527,180,28,0x000000,.09).setDepth(5.7).setName('g1v10_kid_shadow');

    if(scene.textures.exists('g1v10_kid_idle')){
      const sp=scene.add.image(0,0,'g1v10_kid_idle').setOrigin(.5,.28);
      const scale=Math.min(205/sp.width,320/sp.height);
      sp.setScale(scale).setName('g1v10_kid');
      face.add(sp);
      face.setPosition(790,330).setDepth(7);
      face.visualIdentity='licensed-character';
      face.semanticLabel='양치하는 어린이';
      scene.__g1v10Kid=sp;
    }else{
      // fallback only if CDN is blocked: friendly whole-body child, never detached mouth.
      const g=scene.add.graphics();
      g.fillStyle(P.peach,1).fillCircle(0,-18,66);
      g.fillStyle(P.brown,1).fillEllipse(0,-74,118,42);
      g.fillStyle(P.blue,1).fillRoundedRect(-62,42,124,130,34);
      g.fillStyle(P.peach,1).fillRoundedRect(-88,55,28,105,14).fillRoundedRect(60,55,28,105,14);
      g.fillStyle(0x4b7890,1).fillRoundedRect(-52,160,40,92,17).fillRoundedRect(12,160,40,92,17);
      g.fillStyle(P.ink,1).fillCircle(-22,-30,5).fillCircle(22,-30,5);
      face.add(g);face.setDepth(7);
    }

    // friendly mouth target: one small smile, not a tooth grid.
    if(scene.mouth){
      scene.mouth.setPosition(790,365).setScale(.62).setFillStyle(0xa64f61,1).setStrokeStyle(4,0x7f4052,.45).setDepth(15);
      kill(scene,'g1v10_teeth');
      const teeth=scene.add.graphics().setDepth(16).setName('g1v10_teeth');
      teeth.fillStyle(P.white,1).fillRoundedRect(754,348,72,15,7);
      teeth.fillStyle(0xffb0bd,.9).fillEllipse(790,378,42,13);
    }
    // dirt spots stay readable but tiny and non-horror.
    const spots=[[-22,-6],[22,-6],[-22,9],[22,9]];
    (scene.stains||[]).forEach((s,i)=>{
      const [dx,dy]=spots[i]||[0,0];
      s.setPosition(790+dx,365+dy).setScale(.42).setFillStyle(0xe8b76e,.8).setDepth(17);
    });
  }

  function drawTool(scene,c,kind){
    if(!c)return;
    clear(c);
    const g=scene.add.graphics();
    g.fillStyle(P.ink,.08).fillEllipse(0,33,92,15);
    if(kind==='toothpaste'){
      g.fillStyle(P.white,1).fillRoundedRect(-48,-18,78,36,11);
      g.lineStyle(4,P.blue,.55).strokeRoundedRect(-48,-18,78,36,11);
      g.fillStyle(P.mint2,1).fillRoundedRect(-29,-8,39,16,6);
      g.fillStyle(P.blue,1).fillRoundedRect(29,-11,18,22,6);
    }else if(kind==='toothbrush'){
      g.fillStyle(P.blue,1).fillRoundedRect(-52,-6,92,12,6);
      g.fillStyle(P.white,1).fillRoundedRect(35,-12,29,24,8);
      g.fillStyle(P.mint2,1).fillRoundedRect(39,-18,4,11,2).fillRoundedRect(47,-18,4,11,2).fillRoundedRect(55,-18,4,11,2);
    }else if(kind==='cloth'){
      g.fillStyle(P.mint,1).fillRoundedRect(-40,-29,80,58,14);
      g.lineStyle(4,P.mint2,.42).strokeRoundedRect(-40,-29,80,58,14);
      g.lineStyle(3,P.white,.65).lineBetween(-26,-13,25,14).lineBetween(-25,8,12,25);
    }else if(kind==='clipper'){
      g.lineStyle(11,P.metal,1).beginPath().moveTo(-35,19).lineTo(28,-20).strokePath();
      g.lineStyle(7,0xdfe9ed,1).beginPath().moveTo(-28,25).lineTo(35,-14).strokePath();
      g.fillStyle(P.ink,.75).fillCircle(33,-17,8);
    }
    c.add(g);c.setDepth(21);c.visualIdentity='illustrated-prop';
  }

  function rebuildNailHand(scene){
    const hand=scene.hand;
    if(!hand)return;
    clear(hand);
    const g=scene.add.graphics();
    // arm visually connects this hand to the same character.
    const arm=scene.add.graphics().setDepth(9).setName('g1v10_arm');
    arm.lineStyle(32,P.peach,1).beginPath().moveTo(870,424).lineTo(980,462).strokePath();
    g.fillStyle(P.peach,1).fillRoundedRect(-74,-25,120,58,27);
    [-48,-24,0,24,48].forEach((x,i)=>g.fillRoundedRect(x-8,-54+(i%2)*4,16,41,8));
    hand.add(g);hand.setDepth(12);hand.visualIdentity='illustrated-hand';
    (scene.nails||[]).forEach((n,i)=>{
      n.setScale(.86).setFillStyle(0xfff6ef,1).setStrokeStyle(2,0xd38f84,.55).setDepth(14);
    });
  }

  function polish(scene){
    if(scene.scene?.key!=='G1R2')return;
    rebuildWorld(scene);
    rebuildCharacter(scene);
    drawTool(scene,scene.paste,'toothpaste');
    drawTool(scene,scene.brush,'toothbrush');
    drawTool(scene,scene.cloth,'cloth');
    drawTool(scene,scene.clipper,'clipper');
    kill(scene,'g1v10_arm');
    rebuildNailHand(scene);
    if(scene.status) scene.status.setPosition(650,630).setFontSize('19px').setColor('#31546a').setBackgroundColor('#ffffffee').setPadding(16,9,16,9).setDepth(340);
    scene.v10Art='character-first-r2';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={character:{library:'Kenney Toon Characters',license:'CC0'},props:{type:'scene-native flat game art'},version:'v10.0'};
  }

  function pose(scene){
    const sp=scene.__g1v10Kid;if(!sp)return;
    const happy=scene.roundComplete||scene.step>=4;
    const key=happy&&scene.textures.exists('g1v10_kid_cheer')?'g1v10_kid_cheer':'g1v10_kid_idle';
    if(sp.texture?.key!==key)sp.setTexture(key);
  }

  const oldCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    oldCreate.call(this);
    this.time.delayedCall(260,()=>polish(this));
    this.events.on('postupdate',()=>pose(this));
  };
  window.__ADUGAME_G1_BENCHMARK_ART_V10__={loaded:true,version:'10.0',r2CharacterFirst:true};
})();