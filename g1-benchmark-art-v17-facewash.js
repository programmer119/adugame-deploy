// ADUGAME G1R2 v17.13 face-wash scene.
// Existing human-authored Openclipart image only; source publicdomainq.net, Public Domain.
// ZERO generated visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC='https://openclipart.org/image/800px/312102'; // Happy Bath Day (#1) — oksmith — Public Domain
  const pct=(v,b)=>`${v/b*100}%`;
  const CLOTH_HOME={x:640,y:260};

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1713FaceWash)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    const people=root.querySelector('.g1v17-scene');
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const face=document.createElement('img');
    face.src=SRC;face.alt='child bath and washing scene';face.draggable=false;face.className='g1v17-facewash-scene';
    // Keep the child's face on the real wash zone while preserving more of the adult helper.
    Object.assign(face.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:'58%',top:'35%',width:'64%',height:'78%',transform:'translate(-50%,-50%)',zIndex:'3',display:'none'});
    root.appendChild(face);scene.__g1v1713FaceWash=face;root.dataset.faceWashReady='0';

    // Put the real draggable sponge over the sponge already held in the authored scene.
    if(scene.cloth){scene.cloth.setPosition(CLOTH_HOME.x,CLOTH_HOME.y);scene.cloth.home={...CLOTH_HOME};}

    let loadedOnce=false;
    const loaded=()=>{
      if(loadedOnce)return;loadedOnce=true;
      root.dataset.faceWashReady='1';root.dataset.version='17.13';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.13';
        window.__ADUGAME_ART_SOURCE__.G1R2.faceWashScene={name:'Happy Bath Day (#1)',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'Public Domain'};
        window.__ADUGAME_ART_SOURCE__.G1R2.faceWashToolHome={...CLOTH_HOME};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.13';
    };
    face.addEventListener('load',loaded,{once:true});
    face.addEventListener('error',()=>{root.dataset.faceWashReady='error';},{once:true});
    if(face.complete&&face.naturalWidth>0)loaded();

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      face.style.display=st===2?'block':'none';
      // Do not touch visibility in step 3: the separate nail-care scene owns it there.
      if(people&&st===2)people.style.visibility='hidden';
      else if(people&&st!==3)people.style.visibility='visible';
      if(st===2){
        if(scene.cloth&&scene.lastCloth==null&&Math.abs(scene.cloth.x-scene.cloth.home.x)<4&&Math.abs(scene.cloth.y-scene.cloth.home.y)<4){scene.cloth.setPosition(CLOTH_HOME.x,CLOTH_HOME.y);scene.cloth.home={...CLOTH_HOME};}
        if(focus){
          focus.style.left=pct(790,1280);focus.style.top=pct(345,720);
          focus.style.width=pct(185,1280);focus.style.height=pct(150,720);focus.style.opacity='1';
        }
      }
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{face.remove();scene.__g1v1713FaceWash=null;if(people)people.style.visibility='visible';};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(980,()=>attach(this));};
})();
