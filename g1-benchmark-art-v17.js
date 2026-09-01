// ADUGAME G1R2 v17.2 — actual handwashing mechanic visual.
// ZERO generated/drawn image assets. Authored public-domain images + CSS/UI layout only.
(() => {
  if (typeof G1R2 !== 'function') return;

  const SRC = {
    child: 'https://openclipart.org/image/2000px/312394',
    faucet: 'https://openclipart.org/image/800px/297877',
    soap: 'https://openclipart.org/image/800px/307945',
    towel: 'https://openclipart.org/image/800px/63067'
  };
  const STEPS = [
    ['물 묻히기','수도를 눌러 손을 먼저 적셔요'],
    ['비누','비누를 손 위로 가져와요'],
    ['문지르기','손을 좌우로 충분히 문질러요'],
    ['헹구기','깨끗한 물로 한 번 더 헹궈요'],
    ['닦기','수건으로 물기를 닦아요']
  ];

  function img(src, cls, alt=''){
    const el=document.createElement('img');
    el.src=src;el.className=cls;el.alt=alt;el.draggable=false;
    Object.assign(el.style,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain'});
    return el;
  }
  function pct(el,x,y,w,h){
    el.style.left=`${x/12.8}%`;el.style.top=`${y/7.2}%`;
    if(w!=null)el.style.width=`${w/12.8}%`;if(h!=null)el.style.height=`${h/7.2}%`;
    el.style.transform='translate(-50%,-50%)';
  }
  function syncRoot(scene,root){
    const canvas=scene.game?.canvas;if(!canvas)return;
    const r=canvas.getBoundingClientRect();
    Object.assign(root.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
  }
  function pill(text){
    const d=document.createElement('div');d.textContent=text;
    Object.assign(d.style,{padding:'8px 12px',borderRadius:'999px',fontWeight:'900',fontSize:'13px',lineHeight:'1',whiteSpace:'nowrap',transition:'all .18s ease'});
    return d;
  }
  function waitImage(el){
    return new Promise(resolve=>{
      if(el.complete)return resolve(el.naturalWidth>0);
      const t=setTimeout(()=>resolve(false),10000);
      el.onload=()=>{clearTimeout(t);resolve(true)};
      el.onerror=()=>{clearTimeout(t);resolve(false)};
    });
  }

  function mount(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v17Root)return;
    const old=scene.__g1v14Dom?.root;
    if(old)old.style.display='none';

    // Invisible Phaser mechanics remain authoritative; visuals follow them 1:1.
    scene.faucet?.setPosition(470,455);
    if(scene.soap){scene.soap.setPosition(930,500);scene.soap.home={x:930,y:500};}
    if(scene.towel){scene.towel.setPosition(265,500);scene.towel.home={x:265,y:500};}
    scene.hands?.setPosition(650,455);

    const root=document.createElement('div');
    root.id='g1r2-v17-overlay';root.dataset.generatedVisualAssets='0';root.dataset.ready='0';root.dataset.version='17.2';
    Object.assign(root.style,{position:'fixed',overflow:'hidden',pointerEvents:'none',zIndex:'82',background:'#dff4f8',fontFamily:'Arial, sans-serif',color:'#24314a'});

    const sceneCard=document.createElement('div');
    Object.assign(sceneCard.style,{position:'absolute',left:'6.5%',right:'6.5%',top:'9.8%',bottom:'7.5%',background:'#fbfeff',borderRadius:'30px',boxShadow:'0 20px 52px rgba(36,49,74,.13)',border:'3px solid rgba(36,49,74,.07)',overflow:'hidden'});
    root.appendChild(sceneCard);

    const title=document.createElement('div');title.textContent='깨끗하게 손 씻기';
    Object.assign(title.style,{position:'absolute',left:'4%',top:'2.9%',fontSize:'30px',fontWeight:'900',letterSpacing:'-1px',zIndex:'7'});root.appendChild(title);

    const stepbar=document.createElement('div');
    Object.assign(stepbar.style,{position:'absolute',right:'3.8%',top:'3.1%',display:'flex',gap:'6px',zIndex:'7'});
    const pills=STEPS.map((s,i)=>{const p=pill(`${i+1} ${s[0]}`);stepbar.appendChild(p);return p;});root.appendChild(stepbar);

    // The authored handwashing child now owns almost the whole scene.
    const child=img(SRC.child,'g1v17-child','child washing hands');
    Object.assign(child.style,{height:'104%',width:'auto',left:'51.8%',top:'45.8%',transform:'translate(-50%,-50%) scale(1)',transformOrigin:'50% 58%',zIndex:'2',transition:'filter .18s ease'});sceneCard.appendChild(child);

    const faucet=img(SRC.faucet,'g1v17-faucet','water faucet');pct(faucet,470,455,136,106);faucet.style.transform='translate(-50%,-50%) scaleX(-1)';faucet.style.zIndex='5';root.appendChild(faucet);
    const soap=img(SRC.soap,'g1v17-soap','hand soap');pct(soap,930,500,112,132);soap.style.zIndex='6';root.appendChild(soap);
    const towel=img(SRC.towel,'g1v17-towel','towel');pct(towel,265,500,164,164);towel.style.zIndex='6';root.appendChild(towel);

    const focus=document.createElement('div');
    Object.assign(focus.style,{position:'absolute',borderRadius:'34px',border:'5px solid rgba(66,188,205,.72)',boxShadow:'0 0 0 10px rgba(123,223,242,.16)',transform:'translate(-50%,-50%)',zIndex:'4',transition:'left .16s ease,top .16s ease,width .16s ease,height .16s ease,opacity .15s ease',opacity:'0'});root.appendChild(focus);
    const setFocus=(x,y,w,h,on=true)=>{
      focus.style.left=`${x/12.8}%`;focus.style.top=`${y/7.2}%`;
      focus.style.width=`${w/12.8}%`;focus.style.height=`${h/7.2}%`;
      focus.style.opacity=on?'1':'0';
    };

    const water=document.createElement('div');
    Object.assign(water.style,{position:'absolute',left:`${535/12.8}%`,top:`${474/7.2}%`,width:'13px',height:'94px',transform:'translateX(-50%)',borderRadius:'9px',background:'rgba(65,190,224,.66)',boxShadow:'0 0 17px rgba(65,190,224,.32)',opacity:'0',zIndex:'4',transition:'opacity .1s ease'});root.appendChild(water);

    const status=document.createElement('div');
    Object.assign(status.style,{position:'absolute',left:'50%',bottom:'1.9%',transform:'translateX(-50%)',minWidth:'430px',maxWidth:'68%',textAlign:'center',padding:'12px 22px',borderRadius:'20px',background:'rgba(36,49,74,.92)',color:'#fff',fontSize:'17px',fontWeight:'900',boxShadow:'0 10px 24px rgba(36,49,74,.16)',zIndex:'8'});root.appendChild(status);

    document.body.appendChild(root);syncRoot(scene,root);
    scene.__g1v17Root=root;scene.v17Art='public-domain-handwashing-scene';

    Promise.all([waitImage(child),waitImage(faucet),waitImage(soap),waitImage(towel)])
      .then(ok=>{root.dataset.ready=ok.every(Boolean)?'1':'fallback';});

    const sync=()=>{
      if(!scene.sys?.isActive()||scene.scene?.key!=='G1R2'||!root.isConnected)return;
      syncRoot(scene,root);
      const st=Math.max(0,Math.min(5,Number(scene.step)||0));
      pills.forEach((p,i)=>{
        const active=i===Math.min(st,4),done=i<st||st>=5;
        p.style.background=active?'#24314a':done?'#b2f7ef':'rgba(255,255,255,.84)';
        p.style.color=active?'#fff':'#24314a';
        p.style.border=active?'2px solid #24314a':'2px solid rgba(36,49,74,.10)';
        p.style.transform=active?'translateY(-2px)':'none';
      });
      status.textContent=st>=5?'깨끗하게 끝!':STEPS[st][1];

      const waterStep=st===0||st===3;
      faucet.style.display=waterStep?'block':'none';
      soap.style.display=st===1?'block':'none';
      towel.style.display=st===4?'block':'none';
      water.style.opacity=(scene.waterStream?.alpha||0)>.05?'1':'0';

      if(scene.faucet){
        scene.faucet.setPosition(470,455);
        if(waterStep){scene.hintTarget={x:470,y:455};setFocus(470,455,154,124,true);}
      }
      if(scene.soap){
        pct(soap,scene.soap.x,scene.soap.y,112,132);
        if(st===1){scene.hintTarget={x:scene.soap.x,y:scene.soap.y};setFocus(scene.soap.x,scene.soap.y,142,158,true);}
      }
      if(st===2){
        scene.hintTarget={x:650,y:455};setFocus(650,455,220,138,true);
        const pulse=1+Math.sin(scene.time.now/105)*.009;
        child.style.transform=`translate(-50%,-50%) scale(${pulse.toFixed(4)})`;
        child.style.filter='drop-shadow(0 8px 10px rgba(66,188,205,.14))';
      }else{
        child.style.transform=st>=5?'translate(-50%,-50%) scale(1.018)':'translate(-50%,-50%) scale(1)';
        child.style.filter='none';
      }
      if(st===3){setFocus(470,455,154,124,true);}
      if(scene.towel){
        pct(towel,scene.towel.x,scene.towel.y,164,164);
        if(st===4){scene.hintTarget={x:scene.towel.x,y:scene.towel.y};setFocus(scene.towel.x,scene.towel.y,185,185,true);}
      }
      if(st>=5)setFocus(650,455,220,138,false);
    };
    sync();scene.events.on('postupdate',sync);scene.scale?.on?.('resize',sync);

    const cleanup=()=>{root.remove();if(old)old.style.display='';scene.__g1v17Root=null;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);

    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      scene:{name:'Wash your hands (#4)',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'public domain'},
      faucet:{name:'Tap (#1)',author:'oksmith',source:'Openclipart / publicdomainvectors.org',license:'public domain'},
      soap:{name:'Soap Bottle',author:'j4p4n',source:'Openclipart',license:'public domain'},
      towel:{name:'Towel',author:'mazeo',source:'Openclipart',license:'public domain'},
      mechanic:'wet → soap → scrub → rinse → towel',version:'v17.2',generatedVisualAssets:0,rendering:'authored images + CSS UI'
    };
  }

  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    priorCreate.call(this);
    const tryMount=()=>{if(this.scene?.key!=='G1R2')return;if(this.__g1v14Dom)mount(this);else this.time.delayedCall(120,tryMount);};
    this.time.delayedCall(650,tryMount);
  };
  window.__ADUGAME_G1_BENCHMARK_ART_V17__={loaded:true,version:'17.2',generatedVisualAssets:0};
})();
