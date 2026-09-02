// ADUGAME G1R2 v17.21 nail-care scene target alignment.
// Existing human-authored Openclipart image only; Public Domain. No generated visual assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const SRC='https://openclipart.org/image/800px/305090'; // Choose me — oksmith — publicdomainq.net / Public Domain
  // Targets follow the five visible fingertips after the v17.21 action close-up crop.
  const NAIL_POS=[[776,226],[791,204],[805,194],[821,200],[836,214]];
  const pct=(v,b)=>`${v/b*100}%`;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1710NailRaise)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(100,()=>attach(scene));return;}
    const people=root.querySelector('.g1v17-scene');
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const nail=document.createElement('img');
    nail.src=SRC;nail.alt='child raising a hand';nail.draggable=false;nail.className='g1v17-nailraise-scene';
    Object.assign(nail.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain',left:'48%',top:'50%',width:'58%',height:'76%',transform:'translate(-50%,-50%)',zIndex:'3',display:'none'});
    root.appendChild(nail);scene.__g1v1710NailRaise=nail;root.dataset.nailRaiseReady='0';
    (scene.nails||[]).forEach((n,i)=>{const p=NAIL_POS[i]||NAIL_POS[2];n.setPosition(p[0],p[1]).setAlpha(.001).setVisible(true);});

    const loaded=()=>{
      root.dataset.nailRaiseReady='1';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.nailScene={name:'Choose me',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'Public Domain'};
        window.__ADUGAME_ART_SOURCE__.G1R2.nailTargets='raised hand 5 fingertips — v17.21 close-up aligned';
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
    };
    nail.addEventListener('load',loaded,{once:true});
    nail.addEventListener('error',()=>{root.dataset.nailRaiseReady='error';},{once:true});
    if(nail.complete&&nail.naturalWidth>0)loaded();

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const on=scene.step===3;
      nail.style.display=on?'block':'none';
      if(people)people.style.visibility=on?'hidden':'visible';
      if(on){
        (scene.nails||[]).forEach((n,i)=>{const p=NAIL_POS[i]||NAIL_POS[2];if(!scene.clipped?.has(i))n.setPosition(p[0],p[1]);});
        if(focus){
          focus.style.left=pct(806,1280);focus.style.top=pct(210,720);
          focus.style.width=pct(112,1280);focus.style.height=pct(86,720);focus.style.opacity='1';
        }
      }
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{nail.remove();scene.__g1v1710NailRaise=null;if(people)people.style.visibility='visible';};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(900,()=>attach(this));};
})();
