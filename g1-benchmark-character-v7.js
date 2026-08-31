// ADUGAME G1 benchmark character pass v7.1
// Character art: Kenney Toon Characters, CC0/public domain.
// Source mirror: https://github.com/Tiddybub/2d-assets/tree/main/characters/toon-characters
(() => {
  if (typeof G1R1 !== 'function') return;

  const KENNEY='https://cdn.jsdelivr.net/gh/Tiddybub/2d-assets@main/characters/toon-characters/Male%20person/PNG/Poses%20HD/';
  const IDLE=KENNEY+'character_malePerson_idle.png';
  const CHEER=KENNEY+'character_malePerson_cheer0.png';

  const priorPreload=G1R1.prototype.preload;
  G1R1.prototype.preload=function(){
    if(priorPreload) priorPreload.call(this);
    if(!this.textures.exists('g1v71_kenney_idle')) this.load.image('g1v71_kenney_idle',IDLE);
    if(!this.textures.exists('g1v71_kenney_cheer')) this.load.image('g1v71_kenney_cheer',CHEER);
  };

  function rebuildCharacter(scene){
    const c=scene.face;
    if(!c || !scene.textures.exists('g1v71_kenney_idle')) return;
    if(c.removeAll) c.removeAll(true);

    scene.children.list.filter(o=>o?.name==='g1v7_character_shadow').forEach(o=>o.destroy());
    scene.children.list.filter(o=>o?.name==='g1v71_character_shadow').forEach(o=>o.destroy());
    scene.add.ellipse(1035,512,176,30,0x000000,.10).setDepth(4.3).setName('g1v71_character_shadow');

    const sprite=scene.add.image(0,0,'g1v71_kenney_idle').setOrigin(.5,1);
    const maxW=188,maxH=290;
    const scale=Math.min(maxW/sprite.width,maxH/sprite.height);
    sprite.setScale(scale);
    sprite.setName('g1v71_character_art');
    c.add(sprite);
    c.setPosition(1035,507).setDepth(10);
    c.visualIdentity='licensed-character';
    c.semanticLabel='어린이';

    // Existing game code may tint/bounce the face container. Keep that behavior on the new character.
    scene.__g1v71Character=sprite;
  }

  function refreshPose(scene){
    const sprite=scene.__g1v71Character;
    if(!sprite) return;
    const happy=!!scene.happy || !!scene.completed || scene.step>=6;
    const key=happy && scene.textures.exists('g1v71_kenney_cheer') ? 'g1v71_kenney_cheer' : 'g1v71_kenney_idle';
    if(sprite.texture?.key!==key) sprite.setTexture(key);
  }

  const priorCreate=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    priorCreate.call(this);
    rebuildCharacter(this);
    this.time.delayedCall(120,()=>rebuildCharacter(this));
    this.events.on('postupdate',()=>refreshPose(this));

    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R1={
      character:{library:'Kenney Toon Characters',license:'CC0'},
      props:{library:'Microsoft Fluent Emoji',license:'MIT'},
      version:'v7.1'
    };
  };
})();
