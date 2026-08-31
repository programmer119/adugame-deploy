// Final live visual spacing/guidance guard for v6.2.
(() => {
  if(typeof G1R3!=='undefined'){
    const HEALTHY=new Set(['apple','carrot','wholegrain']);
    const center=o=>o?{x:o.x,y:o.y}:null;
    const nextToy=scene=>(scene.toys||[]).find(o=>o?.input?.enabled&&!scene.tidied?.has(o.kind)&&o.visible!==false);
    const nextHealthy=scene=>(scene.foods||[]).find(o=>HEALTHY.has(o.kind)&&o.visible!==false&&!scene.chosen?.includes(o));

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

    // Keep state, visible object and hint aligned. For intermediate successes the next
    // target is known at drop time, so switch guidance immediately while snap feedback plays.
    G1R3.prototype.dropToy=function(o){
      if(this.step!==0||dist(o.x,o.y,255,465)>145){this.wrongReturn(o,'tidy_miss',this.box);return;}
      this.tidied.add(o.kind);
      if(this.tidied.size<3)this.hintTarget=center(nextToy(this));
      this.snap(o,210+(this.tidied.size-1)*45,470,()=>{
        o.setScale(.72);if(o.input)o.input.enabled=false;this.v5SetStep(this.tidied.size);
        if(this.tidied.size===3){
          this.step=1;
          this.status.setText('정리 완료! 사과·당근·통곡물처럼 균형 잡힌 음식 3가지를 접시에 골라요');
          this.hintTarget=center(nextHealthy(this));
          this.sparkle(255,465,6);
        }else{
          this.hintTarget=center(nextToy(this));
        }
      });
    };

    G1R3.prototype.dropFood=function(o){
      if(this.step!==1){if(this.step===2&&this.chosen.includes(o))return this.feedFood(o);this.wrongReturn(o,'meal_order',this.plate);return;}
      if(dist(o.x,o.y,735,475)>190){this.wrongReturn(o,'meal_plate',this.plate);return;}
      if(!HEALTHY.has(o.kind)){this.curious(this.face);this.wrongReturn(o,'balanced_choice',this.plate);this.status.setText('매일 먹는 식사는 과일·채소·통곡물처럼 몸에 좋은 조합으로 골라봐요');this.hintTarget=center(nextHealthy(this));return;}
      if(this.chosen.includes(o))return;
      const idx=this.chosen.length;this.chosen.push(o);
      if(this.chosen.length<3)this.hintTarget=center(nextHealthy(this));
      this.snap(o,660+idx*75,470-idx*5,()=>{
        o.setScale(.72);o.home={x:o.x,y:o.y};this.v5SetStep(4+this.chosen.length);
        if(this.chosen.length===3){
          this.step=2;
          this.status.setText('좋은 조합이에요. 접시의 음식을 하나씩 캐릭터에게 가져가 먹여요');
          this.hintTarget=center(this.chosen[0]);
          this.happy(this.face);
        }else{
          this.hintTarget=center(nextHealthy(this));
        }
      });
    };
  }
  window.__ADUGAME_VISUAL_V6_GUARD__={loaded:true,version:'6.2.7',r3CharacterSpacing:true,r3LiveGuidance:true,r3AtomicGuidance:true,r3ImmediateNextTarget:true};
})();
