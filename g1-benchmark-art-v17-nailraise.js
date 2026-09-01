// ADUGAME G1R2 v17.9 nail-care candidate.
// Existing human-authored Openclipart image only; Public Domain. No generated visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC='https://openclipart.org/image/800px/305090'; // Choose me — oksmith — publicdomainq.net / Public Domain

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v179NailRaise)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    const people=root.querySelector('.g1v17-scene');
    const nail=document.createElement('img');
    nail.src=SRC;nail.alt='child raising a hand';nail.draggable=false;nail.className='g1v17-nailraise-scene';
    Object.assign(nail.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:'48%',top:'50%',width:'58%',height:'76%',transform:'translate(-50%,-50%)',zIndex:'3',display:'none'});
    root.appendChild(nail);scene.__g1v179NailRaise=nail;root.dataset.nailRaiseReady='0';
    const loaded=()=>{
      root.dataset.nailRaiseReady='1';root.dataset.version='17.9';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.9';
        window.__ADUGAME_ART_SOURCE__.G1R2.nailScene={name:'Choose me',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'Public Domain'};
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
      if(window.__ADUGAME_G1_BENCHMARK_ART_V17__)window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.9';
    };
    nail.addEventListener('load',loaded,{once:true});
    nail.addEventListener('error',()=>{root.dataset.nailRaiseReady='error';},{once:true});
    if(nail.complete&&nail.naturalWidth>0)loaded();
    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const on=scene.step===3;
      nail.style.display=on?'block':'none';
      if(people)people.style.visibility=on?'hidden':'visible';
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{nail.remove();scene.__g1v179NailRaise=null;if(people)people.style.visibility='visible';};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(900,()=>attach(this));};
})();
