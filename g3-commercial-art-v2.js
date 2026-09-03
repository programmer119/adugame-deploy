// ADUGAME G3 commercial-art v2.1 — cohesive authored scene pass.
// Reframes the slime shop around one coherent oksmith/PublicDomainQ family-art style.
// No generated/drawn image assets. CSS is limited to environment/layout/feedback.
(() => {
  if(typeof CraftRound!=='function')return;
  const BAKING='https://openclipart.org/image/800px/300873'; // Baking with Mother — oksmith — PublicDomainQ — Public Domain
  const pctX=x=>`${x/12.8}%`,pctY=y=>`${y/7.2}%`;
  const place=(e,x,y,w,rot=0)=>{if(!e)return;Object.assign(e.style,{left:pctX(x),top:pctY(y),right:'auto',bottom:'auto',width:pctX(w),height:'auto',transform:`translate(-50%,-50%) rotate(${rot}deg)`,objectFit:'contain'});};
  const slimeFilter=color=>color==='blue'?'hue-rotate(222deg) saturate(1.15)':color==='green'?'hue-rotate(112deg) saturate(1.12)':'saturate(1.08)';

  function attach(scene){
    if(scene.__g3CommercialV2||!scene.scene?.key?.startsWith('G3R'))return;
    const root=document.getElementById('g3-commercial-art-v1');if(!root){scene.time.delayedCall(120,()=>attach(scene));return;}
    scene.__g3CommercialV2=true;root.dataset.version='2.1';root.dataset.qualityTarget='g1r2-commercial';

    const maker=root.querySelector('.g3-clerk'),customer=root.querySelector('.g3-shoppers'),bowl=root.querySelector('.g3-bowl'),slime=root.querySelector('.g3-slime'),shelf=root.querySelector('.g3-shelf'),counter=root.querySelector('.g3-workbench'),awning=root.querySelector('.g3-shop-awning'),title=root.querySelector('.g3-title'),order=root.querySelector('.g3-order-card'),status=root.querySelector('.g3-status'),round=root.querySelector('.g3-round'),focus=root.querySelector('.g3-focus');
    if(maker){maker.src=BAKING;maker.alt='mother and daughter making slime together';place(maker,720,270,540);Object.assign(maker.style,{zIndex:'5',filter:'saturate(1.04) contrast(1.015)',opacity:'1'});maker.addEventListener('load',()=>{root.dataset.v2HeroReady='1';},{once:true});if(maker.complete&&maker.naturalWidth>0)root.dataset.v2HeroReady='1';}
    if(customer){place(customer,1140,485,245);Object.assign(customer.style,{zIndex:'6',filter:'saturate(1.02) contrast(1.01)',opacity:'.98'});}
    // The hero artwork already contains the same authored bowl. Hide the remix overlay to avoid a doubled bowl rim.
    if(bowl){place(bowl,650,420,154,-1);Object.assign(bowl.style,{zIndex:'9',opacity:'0'});}
    if(slime){place(slime,650,418,104,0);Object.assign(slime.style,{zIndex:'10'});}
    if(shelf)shelf.style.display='none';
    // Keep only a compact service ledge under the submit button; no giant empty dashboard bar.
    if(counter)Object.assign(counter.style,{left:'59%',right:'19.2%',bottom:'3.4%',height:'7.6%',borderRadius:'18px 18px 7px 7px',background:'linear-gradient(180deg,#e8bc94 0%,#cd9568 100%)',boxShadow:'inset 0 6px 0 rgba(255,255,255,.25),0 9px 18px rgba(102,69,48,.1)',zIndex:'4'});
    if(awning)Object.assign(awning.style,{height:'7.2%',background:'linear-gradient(180deg,#f4a9bf,#ea88a5)',boxShadow:'0 5px 14px rgba(118,74,91,.12)'});
    if(title)Object.assign(title.style,{left:'2.4%',top:'1.45%',fontSize:'25px',color:'#29344d',textShadow:'0 2px 0 rgba(255,255,255,.65)'});
    if(round)Object.assign(round.style,{left:'2.5%',top:'9.2%',background:'rgba(255,255,255,.82)',boxShadow:'0 4px 12px rgba(52,54,83,.06)'});
    if(order)Object.assign(order.style,{right:'2.2%',top:'9.4%',width:'15.5%',minHeight:'84px',padding:'11px 10px',borderRadius:'21px',background:'rgba(255,255,255,.93)',border:'3px solid rgba(226,142,170,.38)',boxShadow:'0 8px 18px rgba(92,56,78,.09)'});
    if(status)Object.assign(status.style,{bottom:'1.15%',maxWidth:'48%',padding:'8px 15px',fontSize:'13px',background:'rgba(41,52,77,.88)',boxShadow:'0 6px 14px rgba(41,52,77,.13)'});
    Object.assign(root.style,{background:'linear-gradient(180deg,#fde9ef 0%,#fff8f4 57%,#f8ead6 57.2%,#f2d6b1 100%)'});
    const wall=root.querySelector('.g3-shop-wall');if(wall)Object.assign(wall.style,{background:'radial-gradient(circle at 16% 23%,rgba(255,255,255,.7) 0 6%,transparent 6.3%),linear-gradient(180deg,rgba(253,226,235,.68) 0 57%,rgba(255,249,240,.72) 57% 100%)'});

    // Small physical finished-product shelf replaces the old giant white panel.
    const finishShelf=document.createElement('div');finishShelf.className='g3-v2-finish-shelf';Object.assign(finishShelf.style,{position:'absolute',right:'2.1%',top:'66%',width:'17%',height:'8px',borderRadius:'7px',background:'#a86f52',boxShadow:'0 5px 10px rgba(83,54,45,.18)',zIndex:'5'});root.appendChild(finishShelf);
    const shelfLabel=document.createElement('div');shelfLabel.textContent='완성품';Object.assign(shelfLabel.style,{position:'absolute',right:'7.8%',top:'61.2%',zIndex:'8',fontSize:'12px',fontWeight:'900',color:'#8a5d68',background:'rgba(255,255,255,.74)',padding:'4px 8px',borderRadius:'999px'});root.appendChild(shelfLabel);
    [...root.querySelectorAll('.g3-finished-jar')].forEach((j,i)=>Object.assign(j.style,{right:`${3.4+(i%2)*7.4}%`,top:`${62.5+Math.floor(i/2)*14}%`,width:'5.6%',zIndex:'7'}));

    // Small contextual labels make the controls read as props, not anonymous dashboard widgets.
    const mini=(text,x,y)=>{const e=document.createElement('div');e.textContent=text;Object.assign(e.style,{position:'absolute',left:pctX(x),top:pctY(y),transform:'translate(-50%,-50%)',zIndex:'12',fontSize:'11px',fontWeight:'900',color:'#806070',background:'rgba(255,255,255,.72)',padding:'4px 8px',borderRadius:'999px'});root.appendChild(e);return e;};
    const colorLabel=mini('색 고르기',325,310),decoLabel=mini('장식 고르기',350,438),shopLabel=mini('재료 상점',720,148);

    // Controls become scene props rather than floating dashboard cards.
    [...root.querySelectorAll('.g3-color')].forEach(e=>Object.assign(e.style,{width:'52px',height:'52px',borderRadius:'50%',border:'4px solid rgba(255,255,255,.92)',boxShadow:'0 6px 12px rgba(41,52,77,.1),inset 0 -5px 0 rgba(41,52,77,.06)',fontSize:'9px'}));
    [...root.querySelectorAll('.g3-deco')].forEach(e=>Object.assign(e.style,{width:'58px',height:'58px',borderRadius:'50%',background:'rgba(255,255,255,.88)',border:'3px solid rgba(127,86,111,.09)',boxShadow:'0 5px 11px rgba(64,47,64,.07)'}));
    [...root.querySelectorAll('.g3-container')].forEach(e=>Object.assign(e.style,{padding:'8px 11px',borderRadius:'14px',background:'rgba(255,255,255,.86)',boxShadow:'0 5px 10px rgba(61,44,61,.06)'}));
    [...root.querySelectorAll('.g3-supply')].forEach(e=>Object.assign(e.style,{height:'34px',minWidth:'64px',background:'rgba(255,255,255,.82)',border:'2px solid rgba(83,70,94,.08)',boxShadow:'0 4px 10px rgba(58,48,72,.06)'}));
    const coins=root.querySelector('.g3-coins');if(coins)Object.assign(coins.style,{background:'rgba(255,246,204,.86)',boxShadow:'0 4px 10px rgba(137,93,0,.06)'});

    // Interaction remains entirely owned by Phaser; this layer only changes presentation.
    const sync=()=>{
      if(!root.isConnected||!scene.sys?.isActive())return;
      place(maker,720,270,540);place(customer,1140,485,245);place(bowl,650,420,154,-1);place(slime,650,418,104,0);if(bowl)bowl.style.opacity='0';
      const mixed=!!scene.mixed,ready=root.dataset.orderReady==='true',ingredients=scene.ingredients instanceof Set?[...scene.ingredients]:(scene.ingredients||[]),chosen=scene.chosen||{};
      if(maker)maker.style.filter=mixed?'saturate(1.07) contrast(1.02)':'saturate(1.04) contrast(1.015)';
      if(customer)customer.style.transform=`translate(-50%,-50%) scale(${ready?1.025:1})`;
      if(slime)slime.style.filter=`${slimeFilter(chosen.color)} drop-shadow(0 8px 12px rgba(77,83,125,.16))`;
      if(status)status.textContent=(scene.status?.text||status.textContent||'').replace(/SERVE/g,'손님에게 주기').replace(/BASE/g,'베이스').replace(/ACT/g,'활성액');
      // Reduce the focus halo around the authored source bowl while preserving exact target center.
      if(focus){if(ingredients.length<2||(!mixed&&chosen.color)){focus.style.width=pctX(190);focus.style.height=pctY(122);}else if(!chosen.color){focus.style.width=pctX(270);focus.style.height=pctY(74);}}
      root.dataset.artQuality='authored-scene-v2';root.dataset.generatedVisualAssets='0';root.dataset.slimeColor=chosen.color||'';
    };
    scene.events.on('postupdate',sync);sync();
    if(window.__ADUGAME_ART_SOURCE__?.G3){window.__ADUGAME_ART_SOURCE__.G3.version='commercial-v2.1';window.__ADUGAME_ART_SOURCE__.G3.qualityTarget='G1R2 authored-art scene quality';window.__ADUGAME_ART_SOURCE__.G3.hero={name:'Baking with Mother',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'Public Domain',url:BAKING};window.__ADUGAME_ART_SOURCE__.G3.generatedVisualAssets=0;}
    window.__ADUGAME_G3_COMMERCIAL_ART_V2__={loaded:true,version:'2.1',generatedVisualAssets:0,cohesiveOksmithScene:true,orderColorSynced:true,duplicateBowlRemoved:true};
    const cleanup=()=>{[finishShelf,shelfLabel,colorLabel,decoLabel,shopLabel].forEach(e=>e.remove());scene.__g3CommercialV2=false;};scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const prior=CraftRound.prototype.create;CraftRound.prototype.create=function(){prior.call(this);this.time.delayedCall(1180,()=>attach(this));};
})();
