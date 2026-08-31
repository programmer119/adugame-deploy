// Final live visual spacing/guidance guard for v6.2.
(() => {
  if(typeof G1R3!=='undefined'){
    const center=o=>o?{x:o.x,y:o.y}:null;
    const nextToy=scene=>(scene.toys||[]).find(o=>o?.input?.enabled&&!scene.tidied?.has(o.kind)&&o.visible!==false);
    const nextHealthy=scene=>(scene.foods||[]).find(o=>['apple','carrot','wholegrain'].includes(o.kind)&&o.visible!==false&&!scene.chosen?.includes(o));

    const oldCreate=G1R3.prototype.create;
    G1R3.prototype.create=function(){
      oldCreate.call(this);
      const soda=(this.foods||[]).find(o=>o.kind==='soda');
      if(soda){soda.setPosition(930,270);soda.home={x:930,y:270};soda.setDepth(18);}
      // visual-v6-polish moves the live objects after the habit scene created its old hint.
      // Rebind guidance to the final live object center, never to a pre-polish coordinate.
      const first=nextToy(this);
      if(this.step===0&&first)this.hintTarget=center(first);
    };

    const oldDropToy=G1R3.prototype.dropToy;
    G1R3.prototype.dropToy=function(o){
      const r=oldDropToy.call(this,o);
      this.time?.delayedCall?.(210,()=>{
        if(this.step===0){const next=nextToy(this);if(next)this.hintTarget=center(next);}
        else if(this.step===1){const next=nextHealthy(this);if(next)this.hintTarget=center(next);}
      });
      return r;
    };

    const oldDropFood=G1R3.prototype.dropFood;
    G1R3.prototype.dropFood=function(o){
      const r=oldDropFood.call(this,o);
      this.time?.delayedCall?.(210,()=>{
        if(this.step===1){const next=nextHealthy(this);if(next)this.hintTarget=center(next);}
        else if(this.step===2){const next=(this.chosen||[]).find(x=>x?.visible!==false&&!this.fed?.has(x.kind));if(next)this.hintTarget=center(next);}
      });
      return r;
    };
  }
  window.__ADUGAME_VISUAL_V6_GUARD__={loaded:true,version:'6.2.5',r3CharacterSpacing:true,r3LiveGuidance:true};
})();
