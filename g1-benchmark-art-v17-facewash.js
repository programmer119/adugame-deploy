// ADUGAME G1R2 v17.14 face-wash scene.
// Existing human-authored Openclipart image only; source publicdomainq.net, Public Domain.
// ZERO generated visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC='https://openclipart.org/image/800px/312102'; // Happy Bath Day (#1) — oksmith — Public Domain
  const pct=(v,b)=>`${v/b*100}%`;
  const CLOTH_HOME={x:640,y:260};

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1714FaceWash)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    const people=root.querySelector('.g1v17-scene');
    const clothVisual=root.querySelector('.g1v17-cloth');
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const face=document.createElement('img');
    face.src=SRC;face.alt='child bath and washing scene';face.draggable=false;face.className='g1v17-facewash-scene';
    Object.assign(face.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:'58%',top:'35%',width:'64%',height:'78%',transform:'translate(-50%,-50%)',zIndex:'3',display:'none'});
    root.appendChild(face);scene.__g1v1714FaceWash=face;root.dataset.faceWashReady='0';

    // The authored scene already contains a flat yellow sponge in the helper's hand.
    // The real mechanic starts at exactly that visual location; its separate asset stays hidden at rest.
    if(scene.cloth){scene.cloth.setPosition(CLOTH_HOME.x,CLOTH_HOME.y);scene.cloth.home={...CLOTH_HOME};}
    if(clothVisual){clothVisual.style.transition='opacity .07s ease';clothVisual.style.opacity='0';}

    let loadedOnce=false;
    const loaded=()=>{
      if(loadedOnce)return;loadedOnce=true;
      root.dataset.faceWashReady='1';root.dataset.version='17.14';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.14';
        window.__ADUGAME_ART_SOURCE__.G1R2.faceWashScene={name:'Happy Bath Day (#1)',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'Public Domain'};
        window.__ADUGAME_ART_SOURCE__.G1R2.faceWashToolHome={...CLOTH_HOME};
        window.__ADUGAME_ART_SOURCE__.G1R2.faceWashToolPresentation='authored sponge at rest; small mechanic visual only while dragging';
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.14';
    };
    face.addEventListener('load',loaded,{once:true});
    face.addEventListener('error',()=>{root.dataset.faceWashReady='error';},{once:true});
    if(face.complete&&face.naturalWidth>0)loaded();

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      face.style.display=st===2?'block':'none';
      if(people&&st===2)people.style.visibility='hidden';
      else if(people&&st!==3)people.style.visibility='visible';
      if(st===2){
        if(scene.cloth&&scene.lastCloth==null&&Math.abs(scene.cloth.x-scene.cloth.home.x)<4&&Math.abs(scene.cloth.y-scene.cloth.home.y)<4){scene.cloth.setPosition(CLOTH_HOME.x,CLOTH_HOME.y);scene.cloth.home={...CLOTH_HOME};}
        const dragging=scene.debugState?.()?.g1r2V17Input?.active==='cloth';
        if(clothVisual){
          clothVisual.style.opacity=dragging?'.88':'0';
          clothVisual.style.width=pct(dragging?86:1,1280);
          clothVisual.style.filter='saturate(.72) brightness(1.04)';
        }
        if(focus){
          focus.style.left=pct(790,1280);focus.style.top=pct(345,720);
          focus.style.width=pct(185,1280);focus.style.height=pct(150,720);focus.style.opacity='1';
        }
      } else if(clothVisual){
        clothVisual.style.opacity='0';
      }
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{face.remove();scene.__g1v1714FaceWash=null;if(people)people.style.visibility='visible';if(clothVisual){clothVisual.style.opacity='';clothVisual.style.width='';clothVisual.style.filter='';}};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(980,()=>attach(this));};
})();
