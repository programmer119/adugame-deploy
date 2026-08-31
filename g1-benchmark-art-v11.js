// ADUGAME G1 R2 safety/character cleanup v11.0
// Keep R2 mechanics, but remove detached-mouth / detached-hand visuals from the normal scene.
(() => {
  if (typeof G1R2 !== 'function') return;

  const KENNEY='https://cdn.jsdelivr.net/gh/Tiddybub/2d-assets@main/characters/toon-characters/Female%20person/PNG/Poses%20HD/';
  const IDLE=KENNEY+'character_femalePerson_idle.png';
  const CHEER=KENNEY+'character_femalePerson_cheer0.png';

  const priorPreload=G1R2.prototype.preload;
  G1R2.prototype.preload=function(){
    if(priorPreload) priorPreload.call(this);
    if(!this.textures.exists('g1v11_kid_idle')) this.load.image('g1v11_kid_idle',IDLE);
    if(!this.textures.exists('g1v11_kid_cheer')) this.load.image('g1v11_kid_cheer',CHEER);
  };

  function cleanR2(scene){
    if(scene.scene?.key!=='G1R2') return;

    // Replace the moustached adult pose with the friendlier CC0 female-person pose.
    const kid=scene.__g1v10Kid;
    if(kid && scene.textures.exists('g1v11_kid_idle')){
      kid.setTexture('g1v11_kid_idle');
      kid.setName('g1v11_kid');
      const scale=Math.min(205/kid.width,320/kid.height);
      if(Number.isFinite(scale)&&scale>0) kid.setScale(scale);
      scene.__g1v11Kid=kid;
    }

    // Never show the detached giant mouth / tooth plate.
    if(scene.mouth){
      scene.mouth.setAlpha(0).setScale(.12);
      scene.mouth.visualIdentity='illustrated'; // keep it as a functional target only.
    }
    scene.children.list.filter(o=>o?.name==='g1v10_teeth').forEach(o=>o.setVisible(false));

    // Plaque markers only appear during the brushing step, and stay tiny.
    (scene.stains||[]).forEach((s,i)=>{
      const pts=[[-18,-5],[18,-5],[-18,8],[18,8]];
      const p=pts[i]||[0,0];
      s.setPosition(790+p[0],365+p[1]).setScale(.20).setDepth(18);
      s.setVisible(scene.step===1);
    });

    // Tool objects are real scene props, not text cards.
    [scene.paste,scene.brush,scene.cloth,scene.clipper].filter(Boolean).forEach(o=>{
      o.visualIdentity='illustrated';
    });

    // Nail hand is a later-step interaction. It must not float beside the child on the opening scene.
    if(scene.hand){
      scene.hand.visualIdentity='illustrated';
      scene.hand.setVisible(scene.step>=3);
    }
    (scene.nails||[]).forEach(n=>n.setVisible(scene.step>=3));
    scene.children.list.filter(o=>o?.name==='g1v10_arm').forEach(o=>o.setVisible(scene.step>=3));

    scene.v11Art='character-integrated-r2';
    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      character:{library:'Kenney Toon Characters / Female person',license:'CC0'},
      props:{type:'scene-native flat game art'},
      version:'v11.0'
    };
  }

  function sync(scene){
    if(scene.scene?.key!=='G1R2') return;
    const brushing=scene.step===1;
    (scene.stains||[]).forEach(s=>{ if(s?.active) s.setVisible(brushing); });
    const nails=scene.step>=3;
    if(scene.hand?.active) scene.hand.setVisible(nails);
    (scene.nails||[]).forEach(n=>{ if(n?.active) n.setVisible(nails); });
    scene.children.list.filter(o=>o?.name==='g1v10_arm').forEach(o=>o.setVisible(nails));

    const kid=scene.__g1v11Kid;
    if(kid){
      const key=(scene.roundComplete||scene.step>=4)&&scene.textures.exists('g1v11_kid_cheer')?'g1v11_kid_cheer':'g1v11_kid_idle';
      if(kid.texture?.key!==key) kid.setTexture(key);
    }
  }

  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    priorCreate.call(this);
    this.time.delayedCall(380,()=>cleanR2(this));
    this.time.delayedCall(700,()=>cleanR2(this));
    this.events.on('postupdate',()=>sync(this));
  };

  window.__ADUGAME_G1_BENCHMARK_ART_V11__={loaded:true,version:'11.0',noDetachedMouth:true,noEarlyDetachedHand:true};
})();
