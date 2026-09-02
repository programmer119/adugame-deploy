// ADUGAME G1R2 v17.21 action-density polish.
// CSS/environment/framing treatment only. No generated visual assets; gameplay flow is preserved.
(() => {
  if (typeof G1R2 !== 'function') return;
  const CLIPPER_HOME={x:900,y:260};

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1721Immersive)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    scene.__g1v1721Immersive=true;
    const children=[...root.children];
    const room=children.find(e=>e.tagName==='DIV'&&e.style.overflow==='hidden'&&e.style.borderRadius==='26px');
    const title=children.find(e=>e.tagName==='DIV'&&e.textContent?.trim()==='양치 · 세수 · 손톱 정리');
    const stepbar=children.find(e=>e.tagName==='DIV'&&e.style.display==='flex');
    const progress=children.find(e=>e.tagName==='DIV'&&e.style.bottom==='7.4%');
    const status=children.find(e=>e.tagName==='DIV'&&e.style.minWidth==='500px');
    const people=root.querySelector('.g1v17-scene');
    const face=root.querySelector('.g1v17-facewash-scene');
    const nail=root.querySelector('.g1v17-nailraise-scene');
    const clipper=root.querySelector('.g1v17-clipper');

    root.style.background='linear-gradient(180deg,#c7edf5 0%,#e9f8fb 56%,#f8e7b8 56%,#f4d99a 100%)';
    if(room){
      Object.assign(room.style,{
        left:'0',right:'0',top:'6.2%',bottom:'0',borderRadius:'0',border:'0',
        boxShadow:'inset 0 18px 40px rgba(255,255,255,.34), inset 0 -22px 36px rgba(156,113,49,.08)',
        background:'linear-gradient(180deg,rgba(195,235,244,.98) 0%,rgba(226,247,250,.99) 55%,rgba(255,238,194,.99) 55.2%,rgba(247,218,153,.99) 100%)'
      });
    }
    if(title)Object.assign(title.style,{left:'1.8%',top:'1.35%',fontSize:'24px',letterSpacing:'-1px'});
    if(stepbar)Object.assign(stepbar.style,{right:'1.8%',top:'1.45%',gap:'7px'});
    if(progress)Object.assign(progress.style,{fontSize:'14px',padding:'6px 10px',background:'rgba(255,255,255,.76)',boxShadow:'0 3px 10px rgba(36,49,74,.08)'});
    if(status)Object.assign(status.style,{minWidth:'340px',padding:'8px 18px',fontSize:'15px',background:'rgba(36,49,74,.82)',boxShadow:'0 6px 14px rgba(36,49,74,.12)'});

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;

      if(people&&st===0){
        people.style.clipPath='none';
        people.style.left='48%';people.style.top='53%';people.style.width='96%';people.style.height='auto';
        people.style.transform='translate(-50%,-50%)';
        people.style.filter='saturate(1.13) contrast(1.02)';
      } else if(people&&st===1){
        people.style.clipPath='inset(0 48% 0 0)';
        people.style.left='89%';people.style.top='47%';people.style.width='110%';people.style.height='auto';
        people.style.transform='translate(-50%,-50%)';
        people.style.filter='saturate(1.13) contrast(1.02)';
      } else if(people&&st!==2&&st!==3){
        people.style.filter='saturate(1.1) contrast(1.015)';
      }

      if(face&&st===2){
        face.style.left='55%';face.style.top='34%';face.style.width='74%';face.style.height='84%';
        face.style.transform='translate(-50%,-50%)';face.style.filter='saturate(1.09) contrast(1.015)';
      } else if(face){
        face.style.filter='saturate(1.08) contrast(1.01)';
      }

      // The accepted Public Domain raised-hand art now reads as a close-up action scene instead of a full-body sticker.
      if(nail&&st===3){
        nail.style.left='48.4%';nail.style.top='48.6%';nail.style.width='90%';nail.style.height='106%';
        nail.style.transform='translate(-50%,-50%)';nail.style.filter='saturate(1.09) contrast(1.015)';
      } else if(nail){
        nail.style.filter='saturate(1.08) contrast(1.01)';
      }

      if(status)status.style.opacity=st===3?'.70':'1';
      if(st===3&&scene.clipper){
        if(scene.clipper.home?.x!==CLIPPER_HOME.x||scene.clipper.home?.y!==CLIPPER_HOME.y){scene.clipper.setPosition(CLIPPER_HOME.x,CLIPPER_HOME.y);scene.clipper.home={...CLIPPER_HOME};}
        if(clipper){clipper.style.width='7.2%';clipper.style.transform='translate(-50%,-50%) rotate(-22deg)';clipper.style.filter='saturate(.74) contrast(1.05) brightness(1.04)';}
      }
    };
    scene.events.on('postupdate',sync);sync();

    root.dataset.version='17.21';
    if(window.__ADUGAME_ART_SOURCE__?.G1R2){
      window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.21';
      window.__ADUGAME_ART_SOURCE__.G1R2.immersivePolish={environment:'continuous CSS bathroom wall-floor depth',framing:'balanced face-wash + nail action close-up',clipperHome:{...CLIPPER_HOME},generatedVisualAssets:0};
      window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
    }
    if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.21';
    const cleanup=()=>{scene.__g1v1721Immersive=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1240,()=>attach(this));};
})();
