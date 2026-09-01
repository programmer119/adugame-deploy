// ADUGAME G1R2 v17.7 nail-scene candidate.
// ZERO generated visuals. Existing Openclipart/Public Domain artwork only.
(() => {
  if (typeof G1R2 !== 'function') return;
  const NAIL_SCENE='https://openclipart.org/image/800px/135907';

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v17NailScene)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(120,()=>attach(scene));return;}
    const people=root.querySelector('.g1v17-scene');
    const nail=document.createElement('img');
    nail.src=NAIL_SCENE;nail.alt='cartoon boy with long nails';nail.draggable=false;nail.className='g1v17-nail-scene';
    Object.assign(nail.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:'50%',top:'52%',width:'54%',height:'72%',transform:'translate(-50%,-50%)',zIndex:'3',display:'none'});
    root.appendChild(nail);scene.__g1v17NailScene=nail;root.dataset.nailReady='0';
    const loaded=()=>{root.dataset.nailReady='1';root.dataset.version='17.7';if(window.__ADUGAME_ART_SOURCE__?.G1R2){window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.7';window.__ADUGAME_ART_SOURCE__.G1R2.nailScene={name:'Cartoon boy with long nails',author:'wuhon',source:'Openclipart',license:'Public Domain'};}window.__ADUGAME_G1_BENCHMARK_ART_V17__.version='17.7';};
    nail.addEventListener('load',loaded,{once:true});nail.addEventListener('error',()=>{root.dataset.nailReady='error';},{once:true});if(nail.complete&&nail.naturalWidth>0)loaded();
    const sync=()=>{if(!root.isConnected||scene.scene?.key!=='G1R2')return;const on=scene.step===3;nail.style.display=on?'block':'none';if(people)people.style.visibility=on?'hidden':'visible';};
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{nail.remove();scene.__g1v17NailScene=null;if(people)people.style.visibility='visible';};scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(900,()=>attach(this));};
})();
