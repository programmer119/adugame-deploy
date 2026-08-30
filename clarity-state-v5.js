// ADUGAME v5 strict state-guidance patch.
// Keeps every displayed instruction and idle hint aligned with a currently valid action.
(() => {
  const korean={bread:'빵',shirt:'셔츠',pants:'바지',sock:'양말',wheel:'바퀴',screw:'나사',driver:'드라이버'};
  const center=o=>o?{x:o.x,y:o.y}:null;

  // G1R3: after eating one plated item, guide the next still-visible plated item,
  // never the food that was just consumed and hidden.
  if(typeof G1R3!=='undefined'&&G1R3.prototype.feedFood){
    const oldFeed=G1R3.prototype.feedFood;
    G1R3.prototype.feedFood=function(o){
      const before=this.fed?.size||0,result=oldFeed.call(this,o);
      this.time.delayedCall(30,()=>{
        if((this.fed?.size||0)<=before||this.fed.size>=3)return;
        const next=this.chosen?.find(x=>x?.visible!==false&&!this.fed.has(x.kind));
        if(next){this.status?.setText(`잘 먹었어요. 다음 ${next.semanticLabel||korean[next.kind]||'음식'}도 캐릭터에게 가져가요`);this.hintTarget=center(next);}
      });
      return result;
    };
  }

  function patchHouse(Klass){
    const focusFloor=function(){return this.focusRound===1?1:this.focusRound===2?2:0;};
    Klass.prototype.updateMission=function(){
      if(this.missionText)this.missionText.destroy();
      const f=focusFloor.call(this);let text='',target=null;
      if(this.milestone){text='목표 달성 · 더 놀거나 아래 완료 버튼을 눌러요';target=this.finishButton?center(this.finishButton):null;}
      else if(this.currentFloor!==f){text=`먼저 ${f+1}F ${['차고·마당','주방·거실','욕실·세탁실','아이방·테라스'][f]}으로 이동해요`;target={x:62,y:225+f*78};}
      else if(this.focusRound===1){
        const roomChar=this.characters?.find(c=>!c.inDock&&!c.inElevator&&c.floor===1&&c.visible!==false);
        const bread=this.items?.find(o=>o.floor===1&&o.kind==='bread'&&o.visible!==false&&o.state!=='tasted');
        const cooked=this.items?.find(o=>o.floor===1&&o.state==='cooked'&&o.visible!==false);
        if(!roomChar){text='먼저 아래 가족·친구 한 명을 방 안으로 끌어와요';target=center(this.characters?.find(c=>c.inDock&&c.visible!==false));}
        else if(!this.mission.cooked){text='빵을 조리대에 끌어 올려 음식을 조리해요';target=center(bread);}
        else if(!this.mission.fed){text='조리한 음식을 방 안 가족·친구에게 가져가 먹여요';target=center(cooked||bread);}
      } else if(this.focusRound===2){
        const loaded=this.mission.loaded?.size||0,dried=this.mission.dried?.size||0;
        const clean=[...(this.mission.loaded||[])].filter(o=>o.state==='clean'&&o.visible!==false);
        if(this.washer?.running){text='세탁 중이에요 · 끝나면 깨끗한 옷을 꺼내요';target=null;}
        else if(clean.length||dried>0){const next=clean[0];text=`깨끗한 옷을 건조대에 끌어 놓아요 (${dried}/3)`;target=center(next||this.rack);}
        else if(this.washer?.open){
          if(loaded<3){const next=this.items?.find(o=>o.floor===2&&['shirt','pants','sock'].includes(o.kind)&&o.state!=='washer_loaded'&&o.visible!==false);text=`셔츠·바지·양말을 세탁기에 넣어요 (${loaded}/3)`;target=center(next);}
          else{text='빨랫감 3개를 넣었어요 · 세탁기를 눌러 문을 닫아요';target=center(this.washer);}
        } else if(loaded>=3){text='문을 닫았어요 · 세탁기를 다시 눌러 세탁을 시작해요';target=center(this.washer);}
        else{text='세탁기 문을 눌러 먼저 열어요';target=center(this.washer);}
      } else {
        const order=['wheel','screw','driver'],expected=order[this.mission.repair||0];
        const item=this.items?.find(o=>o.floor===0&&o.kind===expected&&o.visible!==false&&o.state!=='installed');
        text=`자동차 수리 ${this.mission.repair||0}/3 · 다음 ${korean[expected]||expected}를 자동차에 가져가요`;target=center(item);
      }
      this.missionText=this.add.text(650,95,text,{fontFamily:'Arial',fontSize:'15px',fontStyle:'bold',color:'#607086',backgroundColor:'#ffffffcc',padding:{left:10,right:10,top:5,bottom:5}}).setOrigin(.5).setDepth(100);
      this.hintTarget=target;
    };

    const oldDropCharacter=Klass.prototype.dropCharacter;
    Klass.prototype.dropCharacter=function(o){const r=oldDropCharacter.call(this,o);this.updateMission();return r;};
    const oldDropItem=Klass.prototype.dropItem;
    Klass.prototype.dropItem=function(o){const r=oldDropItem.call(this,o);this.updateMission();return r;};
    const oldWasher=Klass.prototype.washerAction;
    Klass.prototype.washerAction=function(){const r=oldWasher.call(this);this.updateMission();return r;};
    const oldRepair=Klass.prototype.repairCar;
    Klass.prototype.repairCar=function(o){const before=this.mission.repair,r=oldRepair.call(this,o);if(this.mission.repair!==before)this.updateMission();return r;};
  }
  if(typeof G2R1!=='undefined')[G2R1,G2R2,G2R3].forEach(patchHouse);

  // G3: once one ingredient is successfully in the bowl, the next hint must point
  // to the other valid ingredient, not back to a duplicate/invalid repeat action.
  if(typeof CraftRound!=='undefined'&&CraftRound.prototype.dropIngredient){
    const oldDropIngredient=CraftRound.prototype.dropIngredient;
    CraftRound.prototype.dropIngredient=function(o){
      const r=oldDropIngredient.call(this,o);
      this.time.delayedCall(260,()=>{
        if(this.ingredients?.size!==1)return;
        const next=this.ingredients.has('base')?this.activator:this.base;
        if(next){this.status?.setText(`${o.kind==='base'?'베이스':'활성액'}를 넣었어요. 이제 ${next===this.base?'베이스':'활성액'}를 그릇에 넣어요`);this.hintTarget=center(next);}
      });
      return r;
    };
  }

  window.__ADUGAME_CLARITY_STATE_V5__={loaded:true,version:'5.2.1',stateGuidance:true};
})();
