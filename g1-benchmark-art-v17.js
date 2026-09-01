// ADUGAME G1R2 v17.1 — actual handwashing mechanic visual.
// ZERO generated/drawn image assets. Authored public-domain images + CSS/UI layout only.
(() => {
  if (typeof G1R2 !== 'function') return;

  const SRC = {
    child: 'https://openclipart.org/image/2000px/312394',
    faucet: 'https://openclipart.org/image/800px/297877',
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
    Object.assign(d.style,{padding:'9px 14px',borderRadius:'999px',fontWeight:'800',fontSize:'14px',lineHeight:'1',whiteSpace:'nowrap',transition:'all .18s ease'});
    return d;
  }
  function makeChip(text){
    const d=document.createElement('div');d.textContent=text;
    Object.assign(d.style,{position:'absolute',transform:'translate(-50%,-50%)',padding:'12px 18px',borderRadius:'18px',fontWeight:'900',fontSize:'18px',letterSpacing:'-.3px',background:'rgba(255,255,255,.97)',border:'3px solid rgba(36,49,74,.15)',boxShadow:'0 9px 20px rgba(36,49,74,.15)',color:'#24314a',pointerEvents:'none',whiteSpace:'nowrap'});
    return d;
  }

  function mount(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v17Root)return;
    const old=scene.__g1v14Dom?.root;
    if(old)old.style.display='none';

    // Align invisible Phaser hit areas with the authored scene/UI.
    scene.faucet?.setPosition(475,440);
    if(scene.soap){scene.soap.setPosition(940,486);scene.soap.home={x:940,y:486};}
    if(scene.towel){scene.towel.setPosition(265,500);scene.towel.home={x:265,y:500};}
    scene.hands?.setPosition(650,455);

    const root=document.createElement('div');
    root.id='g1r2-v17-overlay';root.dataset.generatedVisualAssets='0';root.dataset.ready='0';
    Object.assign(root.style,{position:'fixed',overflow:'hidden',pointerEvents:'none',zIndex:'82',background:'#eaf8fb',fontFamily:'Arial, sans-serif',color:'#24314a'});

    const sceneCard=document.createElement('div');
    Object.assign(sceneCard.style,{position:'absolute',left:'12%',right:'12%',top:'13%',bottom:'10%',background:'#fff',borderRadius:'38px',boxShadow:'0 24px 60px rgba(36,49,74,.15)',border:'3px solid rgba(36,49,74,.08)',overflow:'hidden'});
    root.appendChild(sceneCard);

    const title=document.createElement('div');title.textContent='깨끗하게 손 씻기';
    Object.assign(title.style,{position:'absolute',left:'4.5%',top:'3.8%',fontSize:'29px',fontWeight:'900',letterSpacing:'-1px',zIndex:'5'});root.appendChild(title);
    const subtitle=document.createElement('div');subtitle.textContent='물 → 비누 → 문지르기 → 헹굼 → 수건';
    Object.assign(subtitle.style,{position:'absolute',left:'4.5%',top:'8.7%',fontSize:'15px',fontWeight:'700',color:'#607086',zIndex:'5'});root.appendChild(subtitle);

    const stepbar=document.createElement('div');
    Object.assign(stepbar.style,{position:'absolute',left:'54%',top:'6.8%',transform:'translateX(-50%)',display:'flex',gap:'7px',zIndex:'6'});
    const pills=STEPS.map((s,i)=>{const p=pill(`${i+1} ${s[0]}`);stepbar.appendChild(p);return p;});root.appendChild(stepbar);

    const child=img(SRC.child,'g1v17-child','child washing hands');
    Object.assign(child.style,{height:'90%',width:'auto',left:'51%',top:'41%',transform:'translate(-50%,-50%)',zIndex:'2'});sceneCard.appendChild(child);

    const faucet=img(SRC.faucet,'g1v17-faucet','water faucet');pct(faucet,475,440,140,110);faucet.style.transform='translate(-50%,-50%) scaleX(-1)';faucet.style.zIndex='4';root.appendChild(faucet);
    const towel=img(SRC.towel,'g1v17-towel','towel');pct(towel,265,500,160,160);towel.style.zIndex='4';root.appendChild(towel);
    const soapChip=makeChip('비누');pct(soapChip,940,486,145,0);soapChip.style.zIndex='5';root.appendChild(soapChip);

    const faucetLabel=makeChip('수도 켜기');pct(faucetLabel,475,345,160,0);faucetLabel.style.fontSize='16px';faucetLabel.style.zIndex='5';root.appendChild(faucetLabel);
    const towelLabel=document.createElement('div');towelLabel.textContent='수건';
    Object.assign(towelLabel.style,{position:'absolute',left:`${265/12.8}%`,top:`${575/7.2}%`,transform:'translateX(-50%)',fontWeight:'900',fontSize:'16px',color:'#607086',zIndex:'5'});root.appendChild(towelLabel);

    const target=document.createElement('div');
    Object.assign(target.style,{position:'absolute',width:'190px',height:'118px',borderRadius:'58px',border:'5px solid rgba(66,188,205,.6)',boxShadow:'0 0 0 11px rgba(123,223,242,.17)',left:`${650/12.8}%`,top:`${455/7.2}%`,transform:'translate(-50%,-50%)',zIndex:'3',transition:'opacity .18s ease',opacity:'0'});root.appendChild(target);

    const water=document.createElement('div');
    Object.assign(water.style,{position:'absolute',left:`${535/12.8}%`,top:`${470/7.2}%`,width:'12px',height:'92px',transform:'translateX(-50%)',borderRadius:'9px',background:'rgba(65,190,224,.6)',boxShadow:'0 0 16px rgba(65,190,224,.28)',opacity:'0',zIndex:'3',transition:'opacity .12s ease'});root.appendChild(water);

    const status=document.createElement('div');
    Object.assign(status.style,{position:'absolute',left:'50%',bottom:'2.8%',transform:'translateX(-50%)',minWidth:'460px',maxWidth:'72%',textAlign:'center',padding:'14px 24px',borderRadius:'22px',background:'rgba(36,49,74,.94)',color:'#fff',fontSize:'18px',fontWeight:'800',boxShadow:'0 12px 26px rgba(36,49,74,.18)',zIndex:'7'});root.appendChild(status);

    document.body.appendChild(root);syncRoot(scene,root);
    scene.__g1v17Root=root;scene.v17Art='public-domain-handwashing-scene';

    const loaded=new Promise(resolve=>{
      if(child.complete&&child.naturalWidth>0)return resolve(true);
      const t=setTimeout(()=>resolve(false),10000);child.onload=()=>{clearTimeout(t);resolve(true)};child.onerror=()=>{clearTimeout(t);resolve(false)};
    });
    loaded.then(ok=>{root.dataset.ready=ok?'1':'fallback';});

    const sync=()=>{
      if(!scene.sys?.isActive()||scene.scene?.key!=='G1R2'||!root.isConnected)return;
      syncRoot(scene,root);
      const st=Math.max(0,Math.min(5,Number(scene.step)||0));
      pills.forEach((p,i)=>{
        const active=i===Math.min(st,4),done=i<st||st>=5;
        p.style.background=active?'#24314a':done?'#b2f7ef':'rgba(255,255,255,.88)';
        p.style.color=active?'#fff':'#24314a';
        p.style.border=active?'2px solid #24314a':'2px solid rgba(36,49,74,.10)';
        p.style.transform=active?'translateY(-2px)':'none';
      });
      status.textContent=st>=5?'깨끗하게 끝!':STEPS[st][1];
      target.style.opacity=st===2?'1':'0';

      const waterStep=st===0||st===3;
      faucet.style.display=waterStep?'block':'none';
      faucetLabel.style.display=waterStep?'block':'none';
      soapChip.style.display=st===1?'block':'none';
      towel.style.display=st===4?'block':'none';
      towelLabel.style.display=st===4?'block':'none';
      water.style.opacity=(scene.waterStream?.alpha||0)>.05?'1':'0';

      if(scene.faucet){scene.faucet.setPosition(475,440);if(waterStep)scene.hintTarget={x:475,y:440};}
      if(scene.soap){
        pct(soapChip,scene.soap.x,scene.soap.y,145,0);
        if(st===1)scene.hintTarget={x:scene.soap.x,y:scene.soap.y};
      }
      if(scene.towel){
        pct(towel,scene.towel.x,scene.towel.y,160,160);
        if(st===4)scene.hintTarget={x:scene.towel.x,y:scene.towel.y};
      }
      if(st===2)scene.hintTarget={x:650,y:455};
    };
    sync();scene.events.on('postupdate',sync);scene.scale?.on?.('resize',sync);

    const cleanup=()=>{root.remove();if(old)old.style.display='';scene.__g1v17Root=null;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);

    window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};
    window.__ADUGAME_ART_SOURCE__.G1R2={
      scene:{name:'Wash your hands (#4)',author:'oksmith',source:'Openclipart / publicdomainq.net',license:'public domain'},
      faucet:{name:'Tap (#1)',author:'oksmith',source:'Openclipart / publicdomainvectors.org',license:'public domain'},
      towel:{name:'Towel',author:'mazeo',source:'Openclipart',license:'public domain'},
      mechanic:'wet → soap → scrub → rinse → towel',version:'v17.1',generatedVisualAssets:0,rendering:'authored images + CSS UI'
    };
  }

  const priorCreate=G1R2.prototype.create;
  G1R2.prototype.create=function(){
    priorCreate.call(this);
    const tryMount=()=>{if(this.scene?.key!=='G1R2')return;if(this.__g1v14Dom)mount(this);else this.time.delayedCall(120,tryMount);};
    this.time.delayedCall(650,tryMount);
  };
  window.__ADUGAME_G1_BENCHMARK_ART_V17__={loaded:true,version:'17.1',generatedVisualAssets:0};
})();
