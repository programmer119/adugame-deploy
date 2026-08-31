// ADUGAME G1 R2 external-assets-only visual rebuild v13.0
// No scene-native drawn art is introduced here.
// Background: Bathroom01 by Midnight68, CC0 via OpenGameArt.
// Character: Red Hat Boy by pzUH / GameArt2D, CC0 via OpenGameArt (GitHub mirror).
// Props: SVG Repo CC0 vectors.
(() => {
  if (typeof G1R2 !== 'function') return;

  const ASSETS = {
    bg: 'https://opengameart.org/sites/default/files/bathroom.jpg',
    kid: 'https://raw.githubusercontent.com/Saba-Burduli/Petty/master/Petty/Petty/Resources/Characters/GameArt2DRedHatBoy/Frames/Idle/Idle_001.png',
    toothpaste: 'https://www.svgrepo.com/download/226960/toothpaste.svg',
    toothbrush: 'https://www.svgrepo.com/download/133521/toothbrush.svg',
    sponge: 'https://www.svgrepo.com/download/147347/sponge.svg',
    clipper: 'https://www.svgrepo.com/download/287179/nail-clippers.svg',
    hand: 'https://www.svgrepo.com/download/488985/hand.svg'
  };

  const priorPreload = G1R2.prototype.preload;
  G1R2.prototype.preload = function(){
    if (priorPreload) priorPreload.call(this);
    if (!this.textures.exists('g1v13_bg')) this.load.image('g1v13_bg', ASSETS.bg);
    if (!this.textures.exists('g1v13_kid')) this.load.image('g1v13_kid', ASSETS.kid);
    if (!this.textures.exists('g1v13_toothpaste')) this.load.svg('g1v13_toothpaste', ASSETS.toothpaste, {width:180,height:180});
    if (!this.textures.exists('g1v13_toothbrush')) this.load.svg('g1v13_toothbrush', ASSETS.toothbrush, {width:180,height:180});
    if (!this.textures.exists('g1v13_sponge')) this.load.svg('g1v13_sponge', ASSETS.sponge, {width:180,height:180});
    if (!this.textures.exists('g1v13_clipper')) this.load.svg('g1v13_clipper', ASSETS.clipper, {width:180,height:180});
    if (!this.textures.exists('g1v13_hand')) this.load.svg('g1v13_hand', ASSETS.hand, {width:220,height:220});
  };

  const hideNamed = (scene, names) => {
    scene.children.list.forEach(o => {
      if (names.includes(o?.name)) o.setVisible(false);
    });
  };

  const clearContainer = c => {
    if (c?.removeAll) c.removeAll(true);
  };

  function hideOldDrawnArt(scene){
    hideNamed(scene,[
      'g1v9_r2_world','g1v10_r2_world','g1v10_teeth','g1v10_arm',
      'g1v10_kid_shadow','g1v12_shadow','g1v71_character_shadow','g1v7_character_shadow'
    ]);

    // Old stage title / tool-board labels are webpage-like chrome, not part of the play scene.
    scene.children.list.forEach(o=>{
      if(o?.type!=='Text') return;
      const t=String(o.text||'').trim();
      if(t==='세면도구'||t==='거울'||t==='손톱 정리'||t.startsWith('생활도구')) o.setVisible(false);
      if(t.startsWith('생활 실습') && t.includes('ROUND')) o.setVisible(false);
      if(t===scene.meta?.title) o.setVisible(false);
    });
  }

  function addBackground(scene){
    scene.children.list.filter(o=>o?.name==='g1v13_bg').forEach(o=>o.destroy());
    if(!scene.textures.exists('g1v13_bg')) return;
    const bg=scene.add.image(640,373,'g1v13_bg').setName('g1v13_bg').setDepth(2.72);
    bg.setDisplaySize(1110,485);
    bg.setAlpha(.98);
    scene.__g1v13Bg=bg;
  }

  function addCharacter(scene){
    if(!scene.face || !scene.textures.exists('g1v13_kid')) return;
    clearContainer(scene.face);
    const kid=scene.add.image(0,0,'g1v13_kid').setName('g1v13_kid').setOrigin(.5,.5);
    const scale=Math.min(330/kid.width,390/kid.height);
    kid.setScale(scale);
    scene.face.add(kid);
    scene.face.setPosition(845,390).setDepth(12);
    scene.face.visualIdentity='licensed-character';
    scene.face.semanticLabel='양치하는 어린이';
    scene.__g1v13Kid=kid;

    // Keep mechanic targets alive but visually remove all detached-mouth / tooth-grid remnants.
    if(scene.mouth){
      scene.mouth.setVisible(true).setAlpha(0).setScale(.08).setDepth(18);
    }
    (scene.stains||[]).forEach(s=>s.setVisible(false));
  }

  function replaceTool(scene, container, key, x, y, size, angle=0){
    if(!container || !scene.textures.exists(key)) return;
    clearContainer(container);
    const img=scene.add.image(0,0,key).setName(`g1v13_${container.name||key}`).setOrigin(.5);
    img.setDisplaySize(size,size);
    img.setAngle(angle);
    container.add(img);
    container.setPosition(x,y).setDepth(22).setAlpha(1).setVisible(true);
    container.visualIdentity='licensed-prop';
  }

  function replaceHand(scene){
    if(!scene.hand || !scene.textures.exists('g1v13_hand')) return;
    clearContainer(scene.hand);
    const img=scene.add.image(0,0,'g1v13_hand').setName('g1v13_hand').setOrigin(.5);
    img.setDisplaySize(190,190).setAngle(-10);
    scene.hand.add(img);
    scene.hand.setPosition(1005,430).setDepth(21);
    scene.hand.visualIdentity='licensed-prop';
    (scene.nails||[]).forEach(n=>n.setVisible(false));
  }

  function layout(scene){
    if(scene.scene?.key!=='G1R2') return;
    hideOldDrawnArt(scene);
    addBackground(scene);
    addCharacter(scene);

    // Props are placed as scene objects, never inside cards or labeled shelves.
    replaceTool(scene,scene.paste,'g1v13_toothpaste',285,500,96,-8);
    replaceTool(scene,scene.brush,'g1v13_toothbrush',395,500,105,-18);
    replaceTool(scene,scene.cloth,'g1v13_sponge',1050,305,94,6);
    replaceTool(scene,scene.clipper,'g1v13_clipper',1080,500,92,24);
    replaceHand(scene);

    if(scene.status){
      scene.status.setPosition(650,632).setFontSize('18px').setColor('#24314a')
        .setBackgroundColor('#ffffffd9').setPadding(14,7,14,7).setDepth(340);
    }

    scene.v13Art='external-assets-only-r2';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      background:{name:'Bathroom01',author:'Midnight68',source:'OpenGameArt',license:'CC0'},
      character:{name:'Red Hat Boy',author:'pzUH / GameArt2D',source:'OpenGameArt',license:'CC0'},
      props:{source:'SVG Repo',license:'CC0',ids:[226960,133521,147347,287179,488985]},
      version:'v13.0',generatedVisualAssets:0
    };
  }

  function sync(scene){
    if(scene.scene?.key!=='G1R2') return;
    // Keep all legacy detached graphics suppressed even if older postupdate hooks try to revive them.
    hideNamed(scene,['g1v9_r2_world','g1v10_r2_world','g1v10_teeth','g1v10_arm','g1v10_kid_shadow','g1v12_shadow']);
    if(scene.mouth?.active) scene.mouth.setAlpha(0).setVisible(true);
    (scene.stains||[]).forEach(s=>{if(s?.active)s.setVisible(false);});

    const nailStep=scene.step>=3;
    if(scene.hand?.active) scene.hand.setVisible(nailStep);
    if(scene.clipper?.active) scene.clipper.setVisible(nailStep || scene.step<3);
  }

  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    priorCreate.call(this);
    this.time.delayedCall(520,()=>layout(this));
    this.time.delayedCall(1050,()=>layout(this));
    this.events.on('postupdate',()=>sync(this));
  };

  window.__ADUGAME_G1_BENCHMARK_ART_V13__={
    loaded:true,version:'13.0',externalAssetsOnly:true,generatedVisualAssets:0
  };
})();
