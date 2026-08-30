// ADUGAME strict pager-aware mission guidance.
// If the required mission object is on another inventory page, guide the pager first
// instead of pointing at a hidden object's stale shelf coordinate.
(() => {
  const label=o=>o?.semanticLabel||({bread:'빵',shirt:'셔츠',pants:'바지',sock:'양말',wheel:'바퀴',screw:'나사',driver:'드라이버'}[o?.kind])||o?.kind||'물건';
  function requiredShelfItem(s){
    if(s.milestone)return null;
    const focus=s.focusRound===1?1:s.focusRound===2?2:0;if(s.currentFloor!==focus)return null;
    if(s.focusRound===1){
      const roomChar=s.characters?.find(c=>!c.inDock&&!c.inElevator&&c.floor===1&&c.visible!==false);
      if(!roomChar)return null;
      if(!s.mission.cooked)return s.items?.find(o=>o.floor===1&&o.kind==='bread'&&o.state!=='tasted');
      return null;
    }
    if(s.focusRound===2){
      const loaded=s.mission.loaded?.size||0,clean=[...(s.mission.loaded||[])].filter(o=>o.state==='clean'&&o.visible!==false);
      if(s.washer?.running||clean.length||loaded>=3||!s.washer?.open)return null;
      return s.items?.find(o=>o.floor===2&&['shirt','pants','sock'].includes(o.kind)&&o.state!=='washer_loaded');
    }
    const expected=['wheel','screw','driver'][s.mission.repair||0];
    return s.items?.find(o=>o.floor===0&&o.kind===expected&&o.state!=='installed');
  }
  function patch(Klass){
    const oldUpdate=Klass.prototype.updateMission;
    Klass.prototype.updateMission=function(){
      oldUpdate.call(this);
      const item=requiredShelfItem(this);
      if(!item||!item.inShelf||item.shelfPage===this.inventoryPage)return;
      const targetPage=item.shelfPage,forward=(this.inventoryPage+1)%this.inventoryPageCount===targetPage;
      const dx=(forward?55:-55)*(this.inventoryHud?.scaleX||1);
      this.missionText?.setText(`${label(item)}은 물건 ${targetPage+1}/3에 있어요 · ${forward?'오른쪽':'왼쪽'} 화살표로 이동해요`);
      this.hintTarget={x:(this.inventoryHud?.x||1098)+dx,y:this.inventoryHud?.y||188};
    };
    const oldSet=Klass.prototype.setInventoryPage;
    Klass.prototype.setInventoryPage=function(page){const r=oldSet.call(this,page);this.updateMission();return r;};
  }
  if(typeof G2R1!=='undefined')[G2R1,G2R2,G2R3].forEach(patch);
  window.__ADUGAME_CLARITY_PAGER_V5__={loaded:true,version:'5.2.7',pagerAwareGuidance:true};
})();
