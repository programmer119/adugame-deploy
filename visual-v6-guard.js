// Final live visual spacing guard for v6.2.
(() => {
  if(typeof G1R3!=='undefined'){
    const old=G1R3.prototype.create;
    G1R3.prototype.create=function(){
      old.call(this);
      const soda=(this.foods||[]).find(o=>o.kind==='soda');
      if(soda){soda.setPosition(930,270);soda.home={x:930,y:270};soda.setDepth(18);}
    };
  }
  window.__ADUGAME_VISUAL_V6_GUARD__={loaded:true,version:'6.2.1',r3CharacterSpacing:true};
})();
