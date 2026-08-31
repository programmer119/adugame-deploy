// ADUGAME G1 benchmark art pass v7
// External art source: Microsoft Fluent Emoji (MIT)
// https://github.com/microsoft/fluentui-emoji
// Goal: replace prototype/code-card visuals with scene-native licensed artwork while preserving gameplay hit targets.
(() => {
  if (typeof G1R1 !== 'function') return;

  const CDN='https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';
  const ASSETS={
    g1v7_toilet: CDN+'Toilet/Color/toilet_color.svg',
    g1v7_soap: CDN+'Soap/Color/soap_color.svg',
    g1v7_hands: CDN+'Open%20hands/Default/Color/open_hands_color_default.svg',
    g1v7_child: CDN+'Child/Default/Color/child_color_default.svg',
    g1v7_person: CDN+'Person%20standing/Default/Color/person_standing_color_default.svg',
    g1v7_bathtub: CDN+'Bathtub/Color/bathtub_color.svg',
    g1v7_shower: CDN+'Shower/Color/shower_color.svg'
  };

  const priorPreload=G1R1.prototype.preload;
  G1R1.prototype.preload=function(){
    if(priorPreload) priorPreload.call(this);
    for(const [key,url] of Object.entries(ASSETS)){
      if(!this.textures.exists(key)) this.load.svg(key,url,{width:512,height:512});
    }
  };

  function addLocalImage(scene,container,key,w,h,x=0,y=0){
    const img=scene.add.image(x,y,key).setOrigin(.5).setDisplaySize(w,h);
    container.add(img);
    return img;
  }

  function clearContainer(container){
    if(container?.removeAll) container.removeAll(true);
  }

  function hideLegacyLabels(scene){
    const exact=new Set(['변기','세면대','거울','휴지','비누']);
    scene.children.list.forEach(o=>{
      if(o?.type!=='Text') return;
      const name=String(o.name||'');
      const text=String(o.text||'').trim();
      if(name.startsWith('v6_label_') || exact.has(text)) o.setVisible(false);
      if(text.startsWith('생활도구')){
        o.setText('도구 보기').setFontSize('14px').setPadding(10,7,10,7).setBackgroundColor('#4b78c2').setColor('#ffffff');
      }
    });
  }

  function makeBackdrop(scene){
    scene.children.list.filter(o=>o?.name==='g1v7_bathroom_world').forEach(o=>o.destroy());
    const c=scene.add.container(0,0).setDepth(2.8).setName('g1v7_bathroom_world');
    const g=scene.add.graphics();

    // full-room composition: soft wall, tile band and warm floor.
    g.fillStyle(0xf7fbff,1).fillRoundedRect(92,154,1094,444,30);
    g.fillStyle(0xdff4fb,1).fillRoundedRect(103,165,1072,257,24);
    g.fillStyle(0xf8e7c8,1).fillRoundedRect(103,397,1072,190,0);
    g.lineStyle(2,0xffffff,.72);
    for(let x=113;x<1170;x+=82) g.lineBetween(x,165,x,397);
    for(let y=211;y<397;y+=46) g.lineBetween(103,y,1175,y);
    g.lineStyle(3,0x9ccfdc,.28).strokeRoundedRect(92,154,1094,444,30);

    // mirror + shelf area makes the sink read as a real bathroom station.
    g.fillStyle(0xffffff,.96).fillRoundedRect(258,188,278,146,34);
    g.lineStyle(7,0x9cc7d8,.55).strokeRoundedRect(258,188,278,146,34);
    g.fillStyle(0xcff0fb,.45).fillRoundedRect(274,204,246,114,26);
    g.fillStyle(0xffffff,.7).fillRoundedRect(292,217,92,16,8);
    g.fillStyle(0x7ba5b5,.35).fillRoundedRect(265,354,264,13,7);

    // towel rack, plant and bath mat add lived-in scene detail without creating fake targets.
    g.lineStyle(7,0x8799a5,.75).lineBetween(135,257,228,257);
    g.fillStyle(0xffc8d8,1).fillRoundedRect(147,259,68,86,12);
    g.fillStyle(0xf6a8c0,.65).fillRoundedRect(158,270,46,64,8);
    g.fillStyle(0xffffff,.72).fillEllipse(740,555,250,58);
    g.lineStyle(3,0xe6c48f,.55).strokeEllipse(740,555,250,58);
    g.fillStyle(0xc8e6c9,1).fillRoundedRect(1090,332,50,47,10);
    g.fillStyle(0x75b985,1).fillEllipse(1102,309,22,48).fillEllipse(1127,306,23,52).fillEllipse(1114,292,20,48);

    // subtle wall art/bubbles for the child-game tone.
    [[171,193,9],[194,211,6],[1080,190,11],[1107,214,7],[1129,186,5]].forEach(([x,y,r],i)=>{
      g.fillStyle(i%2?0xffffff:0x9ee8f5,.45).fillCircle(x,y,r);
      g.lineStyle(2,0xffffff,.6).strokeCircle(x,y,r);
    });

    c.add(g);

    if(scene.textures.exists('g1v7_bathtub')){
      const bath=scene.add.image(1035,500,'g1v7_bathtub').setDisplaySize(150,150).setAlpha(.72);
      c.add(bath);
    }
    if(scene.textures.exists('g1v7_shower')){
      const shower=scene.add.image(1110,247,'g1v7_shower').setDisplaySize(84,84).setAlpha(.78);
      c.add(shower);
    }
    return c;
  }

  function styleSink(scene){
    if(!scene.sink?.clear) return;
    const g=scene.sink;g.clear();g.setDepth(5.4);
    g.fillStyle(0x000000,.07).fillEllipse(400,555,340,38);
    g.fillStyle(0x87c8d8,1).fillRoundedRect(258,450,284,112,20);
    g.fillStyle(0x6bb2c5,1).fillRoundedRect(270,482,260,68,15);
    g.fillStyle(0xffffff,1).fillRoundedRect(238,414,324,69,31);
    g.lineStyle(4,0x9ebfca,.55).strokeRoundedRect(238,414,324,69,31);
    g.fillStyle(0xd9f3fb,1).fillEllipse(400,447,226,48);
    g.fillStyle(0xb7e6f4,.55).fillEllipse(400,448,178,28);
    g.fillStyle(0xeff9fc,1).fillRoundedRect(382,492,36,11,6);
    g.fillStyle(0xeff9fc,1).fillRoundedRect(382,520,36,11,6);
  }

  function styleFaucet(scene){
    const c=scene.faucet;if(!c)return;clearContainer(c);
    const g=scene.add.graphics();
    g.fillStyle(0x000000,.07).fillEllipse(0,67,126,22);
    g.lineStyle(22,0x9baab3,1).beginPath().moveTo(-45,64).lineTo(-45,10).arc(0,10,45,Math.PI,0).lineTo(45,34).strokePath();
    g.lineStyle(8,0xe9f3f6,.9).beginPath().moveTo(-39,60).lineTo(-39,13).arc(0,13,39,Math.PI,0).lineTo(39,31).strokePath();
    g.fillStyle(0x8396a2,1).fillRoundedRect(-29,-34,58,16,8);
    g.fillStyle(0xcdd9df,1).fillRoundedRect(-18,-46,36,14,6);
    g.fillStyle(0x6e818c,1).fillRoundedRect(34,28,22,16,7);
    c.add(g);c.setDepth(9);c.visualIdentity='licensed-scene-prop';c.semanticLabel='수도꼭지';
  }

  function styleToilet(scene){
    const c=scene.toilet;if(!c||!scene.textures.exists('g1v7_toilet'))return;
    clearContainer(c);
    const shadow=scene.add.ellipse(0,92,210,32,0x000000,.08);
    c.add(shadow);
    addLocalImage(scene,c,'g1v7_toilet',220,220,0,-6);
    c.setDepth(8);c.visualIdentity='licensed-illustrated';c.semanticLabel='변기';

    // Keep the original invisible interactive flush hit target, but render a proper scene button over it.
    if(scene.flush){
      scene.flush.setAlpha(.001);
      const b=scene.add.container(scene.flush.x,scene.flush.y).setDepth(14).setName('g1v7_flush_art');
      const bg=scene.add.graphics();
      bg.fillStyle(0xffffff,.98).fillRoundedRect(-22,-15,44,30,12);
      bg.lineStyle(3,0x9dbbc7,.7).strokeRoundedRect(-22,-15,44,30,12);
      bg.fillStyle(0x5aa9e6,1).fillCircle(0,0,7);
      b.add(bg);
    }
  }

  function styleHands(scene){
    const c=scene.hands;if(!c||!scene.textures.exists('g1v7_hands'))return;
    clearContainer(c);
    const shadow=scene.add.ellipse(0,38,180,24,0x000000,.06);c.add(shadow);
    addLocalImage(scene,c,'g1v7_hands',182,150,0,-5);
    c.setDepth(12);c.visualIdentity='licensed-illustrated';c.semanticLabel='손';
  }

  function styleSoap(scene){
    const c=scene.soap;if(!c||!scene.textures.exists('g1v7_soap'))return;
    clearContainer(c);
    const shadow=scene.add.ellipse(0,43,92,22,0x000000,.07);c.add(shadow);
    addLocalImage(scene,c,'g1v7_soap',108,108,0,-8);
    c.setDepth(11);c.visualIdentity='licensed-illustrated';c.semanticLabel='비누';
    // Put the real prop on the sink instead of leaving it as a floating card.
    c.setPosition(270,395);c.home={x:c.x,y:c.y};
    if(c.input?.hitArea?.setTo) c.input.hitArea.setTo(-64,-64,128,128);
  }

  function styleCharacter(scene){
    const c=scene.face;if(!c)return;
    clearContainer(c);
    // Full-body Fluent figure underneath, child face on top: same licensed art family, scene-native character.
    if(scene.textures.exists('g1v7_person')) addLocalImage(scene,c,'g1v7_person',178,238,0,92);
    if(scene.textures.exists('g1v7_child')) addLocalImage(scene,c,'g1v7_child',138,138,0,-22);
    c.setPosition(1030,276).setDepth(10);c.visualIdentity='licensed-character';c.semanticLabel='어린이';

    // soft grounding shadow outside the character container so idle bounce still reads naturally.
    scene.children.list.filter(o=>o?.name==='g1v7_character_shadow').forEach(o=>o.destroy());
    scene.add.ellipse(1030,494,156,28,0x000000,.08).setDepth(4.2).setName('g1v7_character_shadow');
  }

  function polishStatus(scene){
    if(!scene.status)return;
    scene.status.setPosition(650,625).setFontSize('20px').setColor('#33455f')
      .setBackgroundColor('#ffffffdd').setPadding(18,10,18,10).setDepth(340);
  }

  function apply(scene){
    if(scene.scene?.key!=='G1R1')return;
    if(!scene.textures.exists('g1v7_toilet')||!scene.textures.exists('g1v7_soap')) return;
    hideLegacyLabels(scene);
    makeBackdrop(scene);
    styleSink(scene);
    styleFaucet(scene);
    styleToilet(scene);
    styleHands(scene);
    styleSoap(scene);
    styleCharacter(scene);
    polishStatus(scene);
    scene.__g1BenchmarkArtV7=true;
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R1={library:'Microsoft Fluent Emoji',license:'MIT',version:'v7'};
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    priorCreate.call(this);
    apply(this);
    // Some older visual layers schedule a same-tick adjustment. Re-assert once after scene startup.
    this.time.delayedCall(80,()=>apply(this));
  };
})();
