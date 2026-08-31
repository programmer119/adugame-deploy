// ADUGAME G1 benchmark art pass v8
// Character source: Kenney Toon Characters (CC0-1.0), mirrored at Tiddybub/2d-assets.
// Props remain from Microsoft Fluent Emoji (MIT) via v7. This pass removes the stitched emoji body,
// gives G1R1 one professional full-body cartoon character, removes decorative clutter, and keeps the
// gameplay targets exactly where the functional layer expects them.
(() => {
  if (typeof G1R1 !== 'function') return;

  const KENNEY='https://cdn.jsdelivr.net/gh/Tiddybub/2d-assets@main/characters/toon-characters/Female%20person/PNG/Poses%20HD/';
  const CHILD={
    idle: KENNEY+'character_femalePerson_idle.png',
    interact: KENNEY+'character_femalePerson_interact.png',
    cheer: KENNEY+'character_femalePerson_cheer0.png'
  };

  const priorPreload=G1R1.prototype.preload;
  G1R1.prototype.preload=function(){
    if(priorPreload) priorPreload.call(this);
    if(!this.textures.exists('g1v8_child_idle')) this.load.image('g1v8_child_idle',CHILD.idle);
    if(!this.textures.exists('g1v8_child_interact')) this.load.image('g1v8_child_interact',CHILD.interact);
    if(!this.textures.exists('g1v8_child_cheer')) this.load.image('g1v8_child_cheer',CHILD.cheer);
  };

  function clearContainer(c){ if(c?.removeAll) c.removeAll(true); }

  function hidePrototypeChrome(scene){
    scene.children.list.forEach(o=>{
      if(o?.type!=='Text') return;
      const t=String(o.text||'').trim();
      if(t==='도구 보기' || t.startsWith('생활도구')) o.setVisible(false);
      if(t.startsWith('생활 실습') && (t.includes('ROUND')||t.includes('단계'))) o.setVisible(false);
      if(t===scene.meta?.title) o.setVisible(false);
    });
    // The generic home glyph remains usable but should not dominate the child-game canvas.
    scene.children.list.filter(o=>o?.type==='Text' && String(o.text||'').trim()==='⌂').forEach(o=>o.setAlpha(.35));
  }

  function simplifyV7Decor(scene){
    const world=scene.children.list.find(o=>o?.name==='g1v7_bathroom_world');
    if(!world?.list) return;
    world.list.forEach(o=>{
      const key=o?.texture?.key;
      if(key==='g1v7_bathtub'||key==='g1v7_shower') o.setVisible(false);
    });
  }

  function restyleCharacter(scene){
    const c=scene.face;
    if(!c || !scene.textures.exists('g1v8_child_idle')) return;
    clearContainer(c);
    const img=scene.add.image(0,0,'g1v8_child_idle').setOrigin(.5,1).setDisplaySize(218,292);
    c.add(img);
    c.setPosition(1035,545).setDepth(12);
    c.visualIdentity='illustrated';
    c.semanticLabel='어린이';
    c.licensedArtSource='Kenney Toon Characters / CC0-1.0';

    scene.children.list.filter(o=>o?.name==='g1v7_character_shadow'||o?.name==='g1v8_character_shadow').forEach(o=>o.destroy());
    scene.add.ellipse(1035,552,150,26,0x000000,.09).setDepth(4.4).setName('g1v8_character_shadow');
  }

  function addThoughtBubble(scene){
    scene.children.list.filter(o=>o?.name==='g1v8_thought').forEach(o=>o.destroy());
    const c=scene.add.container(1025,190).setDepth(40).setName('g1v8_thought');
    const g=scene.add.graphics();
    g.fillStyle(0xffffff,.98).fillEllipse(0,0,158,92);
    g.lineStyle(4,0x92c9d8,.65).strokeEllipse(0,0,158,92);
    g.fillStyle(0xffffff,.98).fillCircle(-57,53,12).fillCircle(-72,72,7);
    c.add(g);
    if(scene.textures.exists('g1v7_toilet')) c.add(scene.add.image(0,0,'g1v7_toilet').setDisplaySize(72,72));
    scene.tweens.add({targets:c,y:c.y-5,yoyo:true,repeat:-1,duration:900,ease:'Sine.InOut'});
    scene.time.addEvent({delay:120,loop:true,callback:()=>{
      if(!c.active) return;
      c.setVisible(scene.step===0 && !scene.roundComplete);
    }});
    if(scene.urge) scene.urge.setAlpha(0);
  }

  function unifyInteractiveIdentity(scene){
    [scene.toilet,scene.faucet,scene.hands,scene.soap].filter(Boolean).forEach(o=>{
      o.visualIdentity='illustrated';
      o.licensedArt=true;
    });
    if(scene.faucet) scene.faucet.licensedArtSource='ADUGAME vector treatment over licensed scene';
    if(scene.toilet) scene.toilet.licensedArtSource='Microsoft Fluent Emoji / MIT';
    if(scene.hands) scene.hands.licensedArtSource='Microsoft Fluent Emoji / MIT';
    if(scene.soap) scene.soap.licensedArtSource='Microsoft Fluent Emoji / MIT';
  }

  function strengthenScene(scene){
    // Add soft foreground shapes so fixtures read as one room rather than floating stickers.
    scene.children.list.filter(o=>o?.name==='g1v8_scene_join').forEach(o=>o.destroy());
    const c=scene.add.container(0,0).setDepth(3.1).setName('g1v8_scene_join');
    const g=scene.add.graphics();
    g.fillStyle(0xffffff,.42).fillRoundedRect(118,118,1090,60,24);
    g.fillStyle(0x8bd17c,.16).fillEllipse(1035,548,210,46);
    g.fillStyle(0x7bdff2,.13).fillEllipse(740,545,250,42);
    g.fillStyle(0xffc6df,.13).fillEllipse(400,556,340,48);
    c.add(g);
  }

  function apply(scene){
    if(scene.scene?.key!=='G1R1') return;
    if(!scene.textures.exists('g1v8_child_idle')) return;
    hidePrototypeChrome(scene);
    simplifyV7Decor(scene);
    strengthenScene(scene);
    restyleCharacter(scene);
    addThoughtBubble(scene);
    unifyInteractiveIdentity(scene);
    scene.__g1BenchmarkArtV8=true;
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R1={
      character:{library:'Kenney Toon Characters',license:'CC0-1.0'},
      props:{library:'Microsoft Fluent Emoji',license:'MIT'},
      pass:'v8'
    };
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    priorCreate.call(this);
    apply(this);
    this.time.delayedCall(90,()=>apply(this));
  };
})();
