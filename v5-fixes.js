// ADUGAME benchmark-v5 targeted fixes discovered by real Chromium QA.
(() => {
  window.__ADUGAME_V5_FIXES__={version:'5.0.4',loaded:true};

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

  // G1R3: completed toys remain visibly inside the tidy box, but use three distinct
  // slots so their English/Korean labels cannot collapse into one unreadable row.
  const g1r3DropToy=G1R3.prototype.dropToy;
  G1R3.prototype.dropToy=function(o){
    if(this.step!==0||dist(o.x,o.y,255,465)>145){
      this.wrongReturn(o,'tidy_miss',this.box);return;
    }
    this.tidied.add(o.kind);
    const slots=[190,255,320];
    const slot=slots[Math.max(0,this.tidied.size-1)]||255;
    this.snap(o,slot,470,()=>{
      o.setScale(.52);
      if(o.input)o.input.enabled=false;
      this.v5SetStep(this.tidied.size);
      if(this.tidied.size===3){
        this.step=1;
        this.status.setText('정리 완료! 사과·당근·통곡물처럼 균형 잡힌 음식 3가지를 접시에 골라요');
        this.hintTarget={x:560,y:250};
        this.sparkle(255,465,6);
      }
    });
  };

  // House discoveries use the floor-title lane. Hide that floor title while the
  // transient banner is present instead of layering two messages on top of it.
  const FLOOR_TITLES=new Set(['차고·마당','주방·거실','욕실·세탁실','아이방·테라스']);
  function houseDiscover(id,x,y,msg){
    if(this.discoveries.has(id))return;
    this.discoveries.add(id);
    this.sparkle(x,y,7);
    if(this._v5DiscoveryRestore)this._v5DiscoveryRestore();
    if(this._v5DiscoveryNote?.active)this._v5DiscoveryNote.destroy();
    const floorAt=this.currentFloor;
    const title=(this.floorObjects?.[floorAt]||[]).find(o=>o?.type==='Text'&&FLOOR_TITLES.has(String(o.text||'')));
    if(title?.active)title.setVisible(false);
    const restore=()=>{
      if(title?.active)title.setVisible(this.currentFloor===floorAt);
      if(this._v5DiscoveryRestore===restore)this._v5DiscoveryRestore=null;
    };
    this._v5DiscoveryRestore=restore;
    const note=this.add.text(640,145,'발견! '+msg,{
      fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#ffffff',
      backgroundColor:'#6c63ff',padding:{left:10,right:10,top:6,bottom:6}
    }).setOrigin(.5).setDepth(2500).setName('discovery_note');
    this._v5DiscoveryNote=note;
    this.tweens.add({targets:note,y:125,alpha:0,duration:1050,hold:420,onComplete:()=>{
      restore();
      if(this._v5DiscoveryNote===note)this._v5DiscoveryNote=null;
      note.destroy();
    }});
    audio.pop();
    telemetry('discovery',{id,round:this.scene.key});
  }
  [G2R1,G2R2,G2R3].forEach(K=>{K.prototype.discover=houseDiscover;});

  // Invisible floor fixtures must never retain live hit areas. The washer is the
  // only interactive fixed fixture today, so bind its input state to floor 2.
  [G2R1,G2R2,G2R3].forEach(K=>{
    const show=K.prototype.showFloor;
    K.prototype.showFloor=function(f,initial=false){
      const result=show.call(this,f,initial);
      if(this.washer?.input)this.washer.input.enabled=this.currentFloor===2&&!this.roundComplete;
      return result;
    };
  });

  // Cooking keeps the food on the stove, but in a lower serving slot so its label
  // no longer sits directly over the STOVE fixture label.
  const g2r1Cook=G2R1.prototype.cook;
  G2R1.prototype.cook=function(o){
    const result=g2r1Cook.call(this,o);
    if(o?.state==='cooked'){
      o.y=this.stove.y+25;
      o.home={x:o.x,y:o.y};
    }
    return result;
  };

  // Clean laundry is still placed on the rack; use three readable rack slots.
  const g2r2Drop=G2R2.prototype.dropItem;
  G2R2.prototype.dropItem=function(o){
    const before=this.mission?.dried?.size||0;
    const willDry=this.currentFloor===2&&o?.state==='clean'&&dist(o.x,o.y,this.rack.x,this.rack.y)<150;
    const result=g2r2Drop.call(this,o);
    if(willDry&&o?.state==='dry'){
      o.x=850+before*80;
      o.y=455;
      o.home={x:o.x,y:o.y};
    }
    return result;
  };

  // Installed repair parts stay on the car, but occupy three distinct visual slots.
  const g2r3Repair=G2R3.prototype.repairCar;
  G2R3.prototype.repairCar=function(o){
    const before=this.mission?.repair||0;
    const result=g2r3Repair.call(this,o);
    if(o?.state==='installed'&&this.mission.repair===before+1){
      const idx=this.mission.repair-1;
      o.x=this.car.x-80+idx*80;
      o.y=this.car.y+50;
      o.setScale(.62);
      o.home={x:o.x,y:o.y};
    }
    return result;
  };

  // Result modal must be the only active interaction layer. Disable every existing
  // world input before BaseRound creates its new overlay/continue button.
  const baseFinish=BaseRound.prototype.finish;
  BaseRound.prototype.finish=function(extra={}){
    if(!this.roundComplete){
      this.children.list.forEach(o=>{if(o?.input?.enabled)o.input.enabled=false;});
    }
    return baseFinish.call(this,extra);
  };
})();