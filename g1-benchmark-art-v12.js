// ADUGAME G1 R2 character replacement v12.0
// Character: Red Hat Boy by pzUH / GameArt2D, CC0 via OpenGameArt.
// GitHub mirror keeps the original CC0 attribution in-repo.
(() => {
  if (typeof G1R2 !== 'function') return;

  const REDHAT='https://raw.githubusercontent.com/Saba-Burduli/Petty/master/Petty/Petty/Resources/Characters/GameArt2DRedHatBoy/Frames/Idle/Idle_001.png';

  const oldPreload=G1R2.prototype.preload;
  G1R2.prototype.preload=function(){
    if(oldPreload) oldPreload.call(this);
    if(!this.textures.exists('g1v12_redhat_idle')) this.load.image('g1v12_redhat_idle',REDHAT);
  };

  function replaceCharacter(scene){
    if(scene.scene?.key!=='G1R2' || !scene.face || !scene.textures.exists('g1v12_redhat_idle')) return;

    // Face container is retained as the semantic/feedback anchor, but all old character children are removed.
    if(scene.face.removeAll) scene.face.removeAll(true);
    scene.children.list.filter(o=>['g1v10_kid_shadow','g1v71_character_shadow','g1v7_character_shadow','g1v12_shadow'].includes(o?.name)).forEach(o=>o.destroy());

    scene.add.ellipse(790,531,168,24,0x000000,.09).setDepth(5.8).setName('g1v12_shadow');
    const sp=scene.add.image(0,0,'g1v12_redhat_idle').setOrigin(.5,.5).setName('g1v12_redhat');
    const scale=Math.min(218/sp.width,330/sp.height);
    sp.setScale(scale);

    // Position the authored child sprite so its face sits near the existing brushing logic at 790,365.
    scene.face.add(sp);
    scene.face.setPosition(790,382).setDepth(8);
    scene.face.visualIdentity='licensed-character';
    scene.face.semanticLabel='양치하는 어린이';
    scene.__g1v12Kid=sp;

    // Detached mouth / tooth-grid visuals never render. The invisible mouth object remains only as a mechanic target.
    if(scene.mouth){
      scene.mouth.setAlpha(0).setScale(.08);
      scene.mouth.visualIdentity='illustrated';
    }
    scene.children.list.filter(o=>o?.name==='g1v10_teeth').forEach(o=>o.setVisible(false));

    // Small plaque indicators only during active brushing, positioned at the child's face area.
    const spots=[[-18,-5],[18,-5],[-18,8],[18,8]];
    (scene.stains||[]).forEach((s,i)=>{
      const p=spots[i]||[0,0];
      s.setPosition(790+p[0],365+p[1]).setScale(.16).setDepth(18).setVisible(scene.step===1);
    });

    // Tool art stays scene-native. Nail hand is only revealed for the nail-trimming step.
    [scene.paste,scene.brush,scene.cloth,scene.clipper].filter(Boolean).forEach(o=>o.visualIdentity='illustrated');
    if(scene.hand){scene.hand.visualIdentity='illustrated';scene.hand.setVisible(scene.step>=3);}
    (scene.nails||[]).forEach(n=>n.setVisible(scene.step>=3));
    scene.children.list.filter(o=>o?.name==='g1v10_arm').forEach(o=>o.setVisible(scene.step>=3));

    scene.v12Art='redhat-child-r2';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      character:{name:'Red Hat Boy',author:'pzUH',source:'OpenGameArt / GameArt2D',license:'CC0'},
      mirror:'Saba-Burduli/Petty',
      version:'v12.0'
    };
  }

  function sync(scene){
    if(scene.scene?.key!=='G1R2') return;
    const brushing=scene.step===1;
    (scene.stains||[]).forEach(s=>{if(s?.active)s.setVisible(brushing);});
    const nails=scene.step>=3;
    if(scene.hand?.active) scene.hand.setVisible(nails);
    (scene.nails||[]).forEach(n=>{if(n?.active)n.setVisible(nails);});
    scene.children.list.filter(o=>o?.name==='g1v10_arm').forEach(o=>o.setVisible(nails));
  }

  const oldCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    oldCreate.call(this);
    this.time.delayedCall(420,()=>replaceCharacter(this));
    this.time.delayedCall(850,()=>replaceCharacter(this));
    this.events.on('postupdate',()=>sync(this));
  };

  window.__ADUGAME_G1_BENCHMARK_ART_V12__={loaded:true,version:'12.0',character:'Red Hat Boy',license:'CC0'};
})();
