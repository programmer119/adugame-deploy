// ADUGAME G1R2 v17.17 immersive polish.
// CSS/environment treatment only + reposition existing Public Domain nail clipper. No generated visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const CLIPPER_HOME={x:930,y:300};

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1717Immersive)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    scene.__g1v1717Immersive=true;
    const children=[...root.children];
    const room=children.find(e=>e.tagName==='DIV'&&e.style.overflow==='hidden'&&e.style.borderRadius==='26px');
    const title=children.find(e=>e.tagName==='DIV'&&e.textContent?.trim()==='양치 · 세수 · 손톱 정리');
    const stepbar=children.find(e=>e.tagName==='DIV'&&e.style.display==='flex');
    const people=root.querySelector('.g1v17-scene');
    const face=root.querySelector('.g1v17-facewash-scene');
    const nail=root.querySelector('.g1v17-nailraise-scene');
    const clipper=root.querySelector('.g1v17-clipper');

    root.style.background='#d5f1f7';
    if(room){
      // Transparent tile lines sit above the bathroom gradient so the space reads as a room, not a blank card.
      Object.assign(room.style,{left:'0',right:'0',top:'6.2%',bottom:'0',borderRadius:'0',border:'0',boxShadow:'none',background:'repeating-linear-gradient(0deg,transparent 0 76px,rgba(70,164,184,.105) 76px 78px),repeating-linear-gradient(90deg,transparent 0 92px,rgba(70,164,184,.075) 92px 94px),linear-gradient(180deg,rgba(211,243,249,.99) 0%,rgba(235,249,251,.99) 52%,rgba(255,239,201,.99) 100%)'});
    }
    if(title)Object.assign(title.style,{left:'1.8%',top:'1.35%',fontSize:'25px',letterSpacing:'-1px'});
    if(stepbar)Object.assign(stepbar.style,{right:'1.8%',top:'1.45%',gap:'7px'});

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      if(people&&st!==2&&st!==3)people.style.filter='saturate(1.12) contrast(1.015)';
      if(face)face.style.filter='saturate(1.08) contrast(1.01)';
      if(nail)nail.style.filter='saturate(1.08) contrast(1.01)';
      if(st===3&&scene.clipper){
        if(scene.clipper.home?.x!==CLIPPER_HOME.x||scene.clipper.home?.y!==CLIPPER_HOME.y){scene.clipper.setPosition(CLIPPER_HOME.x,CLIPPER_HOME.y);scene.clipper.home={...CLIPPER_HOME};}
        if(clipper){clipper.style.width='8.4%';clipper.style.transform='translate(-50%,-50%) rotate(-16deg)';clipper.style.filter='saturate(.72) contrast(1.05) brightness(1.04)';}
      }
    };
    scene.events.on('postupdate',sync);sync();

    root.dataset.version='17.17';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.17';
      window.__ADUGAME_ART_SOURCE__.G1R2.immersivePolish={environment:'CSS bathroom tile depth',clipperHome:{...CLIPPER_HOME},generatedVisualAssets:0};
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.17';
    const cleanup=()=>{scene.__g1v1717Immersive=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1240,()=>attach(this));};
})();
