// ADUGAME G1R2 v17.11 face-wash candidate.
// Existing human-authored Openclipart image only; source publicdomainq.net, Public Domain.
// ZERO generated visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC='https://openclipart.org/image/800px/312102'; // Happy Bath Day (#1) — oksmith — Public Domain

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1711FaceWash)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    const people=root.querySelector('.g1v17-scene');
    const face=document.createElement('img');
    face.src=SRC;face.alt='child bath and washing scene';face.draggable=false;face.className='g1v17-facewash-scene';
    Object.assign(face.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:'48%',top:'49%',width:'62%',height:'78%',transform:'translate(-50%,-50%)',zIndex:'3',display:'none'});
    root.appendChild(face);scene.__g1v1711FaceWash=face;root.dataset.faceWashReady='0';

    let loadedOnce=false;
    const loaded=()=>{
      if(loadedOnce)return;loadedOnce=true;
      root.dataset.faceWashReady='1';root.dataset.version='17.11';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.11';
        window.__ADUGAME_ART_SOURCE__.G1R2.faceWashScene={name:'Happy Bath Day (#1)',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'Public Domain'};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.11';
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
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{face.remove();scene.__g1v1711FaceWash=null;if(people)people.style.visibility='visible';};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(980,()=>attach(this));};
})();
