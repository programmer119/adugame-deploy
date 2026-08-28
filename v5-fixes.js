// ADUGAME benchmark-v5 targeted fixes discovered by real Chromium QA.
(() => {
  window.__ADUGAME_V5_FIXES__={version:'5.0.2',loaded:true};

  // G1R1: the room backdrop lives at depth 1. Several interactive fixtures from the
  // first v5 pass were left at depth 0, making the scene visually wrong even though
  // their hit areas still existed. Put the actual world above its backdrop.
  const g1r1Create=G1R1.prototype.create;
  G1R1.prototype.create=function(){
    g1r1Create.call(this);
    this.toilet?.setDepth(4);
    this.sink?.setDepth(4);
    this.faucet?.setDepth(6);
    this.water?.setDepth(5);
    this.hands?.setDepth(7);
    this.soap?.setDepth(8);
    this.face?.setDepth(6);
    this.flush?.setDepth(12);

    // GameObject-level pointermove was not reliable enough for a continuous child
    // scrub gesture in hosted Chromium. Route the gesture at scene input level,
    // but accept distance only while the pointer is actually inside the hands zone.
    this.hands?.removeAllListeners('pointermove');
    this.input.on('pointerdown',p=>{
      if(this.step!==3)return;
      const inside=Math.abs(p.x-400)<=115&&Math.abs(p.y-475)<=65;
      this.lastScrub=inside?{x:p.x,y:p.y}:null;
    });
    this.input.on('pointermove',p=>this.scrub(p));
    this.input.on('pointerup',()=>{if(this.step===3)this.lastScrub=null;});
  };

  G1R1.prototype.scrub=function(p){
    if(this.step!==3||!p.isDown)return;
    const inside=Math.abs(p.x-400)<=115&&Math.abs(p.y-475)<=65;
    if(!inside){this.lastScrub=null;return;}
    const cur={x:p.x,y:p.y};
    if(this.lastScrub){
      const d=dist(cur.x,cur.y,this.lastScrub.x,this.lastScrub.y);
      if(d>2&&d<120){
        const before=this.scrubDistance;
        this.scrubDistance+=d;
        if(Math.floor(this.scrubDistance/70)!==Math.floor(before/70))audio.scrub();
        if(this.scrubDistance>=340){
          this.step=4;
          this.children.list.filter(o=>o?.name==='foam').forEach(o=>o.destroy());
          this.status.setText('마지막으로 깨끗한 물에 헹궈요');
          this.hintTarget={x:400,y:300};
          this.v5SetStep(5);
          this.sparkle(400,475,6);
          telemetry('habit_scrub_complete',{distance:Math.round(this.scrubDistance)});
        }
      }
    }
    this.lastScrub=cur;
  };
})();