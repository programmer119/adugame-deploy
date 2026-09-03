// ADUGAME G3 commercial-art v1.0
// Quality target: G1R2 authored-art scene quality, not prototype geometry.
// Human-authored Openclipart/public-domain imagery + CSS/UI composition only. generatedVisualAssets=0.
(() => {
  if (typeof CraftRound !== 'function') return;

  const SRC={
    clerk:'https://openclipart.org/image/800px/284221', // Female Store Clerk #1 — oksmith — publicdomainq.net — CC0/Public Domain
    shoppers:'https://openclipart.org/image/800px/300874', // Shopping with Mother — oksmith — publicdomainq.net — Public Domain
    glue:'https://openclipart.org/image/800px/169423', // Glue — ensarija — Openclipart Public Domain
    bowl:'https://openclipart.org/image/800px/296843', // Baking whisk and bowl — SunKing2 — Openclipart Public Domain
    slime:'https://openclipart.org/image/800px/98317', // Slime — dcatcherex — Openclipart Public Domain
    jar:'https://openclipart.org/image/800px/88927' // jar — PeterBrough — Openclipart Public Domain
  };
  const ORDER_COLOR={blue:'#63b6ff',green:'#6fd39a',pink:'#ff90b6'};
  const DECO={star:['★','별'],flower:['✿','꽃'],heart:['♥','하트'],banana:['◒','바나나']};
  const SUPPLY={soccer:['⚽','축구공',2],butterfly:['🦋','나비',4],animal:['🐰','동물',6]};
  const toPctX=x=>`${x/12.8}%`,toPctY=y=>`${y/7.2}%`;

  function syncRoot(scene,root){const c=scene.game?.canvas;if(!c)return;const r=c.getBoundingClientRect();Object.assign(root.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});}
  function el(tag,cls,text=''){const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
  function css(e,s){Object.assign(e.style,s);return e;}
  function img(src,cls,alt){const e=el('img',cls);e.src=src;e.alt=alt;e.draggable=false;css(e,{position:'absolute',pointerEvents:'none',userSelect:'none',objectFit:'contain'});return e;}
  function place(e,x,y,w,rot=0){css(e,{left:toPctX(x),top:toPctY(y),width:toPctX(w),transform:`translate(-50%,-50%) rotate(${rot}deg)`});}
  function waitImage(e){return new Promise(resolve=>{if(e.complete)return resolve(e.naturalWidth>0);const t=setTimeout(()=>resolve(false),15000);e.addEventListener('load',()=>{clearTimeout(t);resolve(true)},{once:true});e.addEventListener('error',()=>{clearTimeout(t);resolve(false)},{once:true});});}

  function mount(scene){
    if(scene.__g3CommercialRoot||!scene.scene?.key?.startsWith('G3R'))return;
    const root=el('div','g3-commercial-root');root.id='g3-commercial-art-v1';root.dataset.ready='0';root.dataset.generatedVisualAssets='0';root.dataset.version='1.0';
    css(root,{position:'fixed',overflow:'hidden',pointerEvents:'none',zIndex:'84',fontFamily:'Arial, sans-serif',color:'#29344d',background:'linear-gradient(180deg,#fff6fb 0%,#fffdf8 58%,#f7e7d1 58.2%,#f0d3ad 100%)'});
    document.body.appendChild(root);syncRoot(scene,root);scene.__g3CommercialRoot=root;

    // Pastel slime-shop environment. CSS is only environmental framing; all character/tool illustrations below are authored assets.
    const wall=el('div','g3-shop-wall');css(wall,{position:'absolute',inset:'0',background:'radial-gradient(circle at 18% 23%,rgba(255,255,255,.95) 0 7%,transparent 7.2%),radial-gradient(circle at 42% 18%,rgba(255,255,255,.8) 0 5%,transparent 5.2%),linear-gradient(180deg,rgba(255,215,231,.78) 0 58%,rgba(255,249,238,.92) 58% 100%)'});root.appendChild(wall);
    const awning=el('div','g3-shop-awning');css(awning,{position:'absolute',left:'0',right:'0',top:'0',height:'8.5%',background:'repeating-linear-gradient(90deg,#ee8fa8 0 7%,#fff 7% 14%)',boxShadow:'0 6px 18px rgba(118,74,91,.13)',zIndex:'2'});root.appendChild(awning);
    const counter=el('div','g3-workbench');css(counter,{position:'absolute',left:'7%',right:'22%',bottom:'10.2%',height:'22%',borderRadius:'28px 28px 8px 8px',background:'linear-gradient(180deg,#e9bc91,#c98d5e)',boxShadow:'inset 0 8px 0 rgba(255,255,255,.28),0 16px 28px rgba(106,65,44,.14)',zIndex:'3'});root.appendChild(counter);
    const shelf=el('div','g3-shelf');css(shelf,{position:'absolute',right:'2.4%',top:'18%',width:'18%',height:'57%',borderRadius:'22px',background:'rgba(255,255,255,.76)',border:'3px solid rgba(108,76,93,.12)',boxShadow:'0 12px 28px rgba(74,54,70,.1)',zIndex:'3'});root.appendChild(shelf);
    const shelfTitle=el('div','g3-shelf-title','완성 슬라임');css(shelfTitle,{position:'absolute',left:'50%',top:'5%',transform:'translateX(-50%)',fontSize:'15px',fontWeight:'900',color:'#79556d'});shelf.appendChild(shelfTitle);

    const title=el('div','g3-title','말랑 슬라임 공방');css(title,{position:'absolute',left:'2.3%',top:'1.6%',zIndex:'12',fontSize:'27px',fontWeight:'900',letterSpacing:'-1px',textShadow:'0 2px 0 rgba(255,255,255,.8)'});root.appendChild(title);
    const round=el('div','g3-round');css(round,{position:'absolute',left:'2.5%',top:'10.1%',zIndex:'12',padding:'7px 12px',borderRadius:'999px',background:'rgba(255,255,255,.9)',fontSize:'13px',fontWeight:'900',boxShadow:'0 5px 14px rgba(52,54,83,.08)'});root.appendChild(round);

    const clerk=img(SRC.clerk,'g3-clerk','slime shop clerk');css(clerk,{right:'18.5%',bottom:'12%',width:'22%',height:'69%',objectPosition:'center bottom',zIndex:'5',filter:'saturate(.96) contrast(1.02)',transition:'transform .22s ease,filter .22s ease'});root.appendChild(clerk);
    const shoppers=img(SRC.shoppers,'g3-shoppers','mother and child customers');css(shoppers,{right:'-1.5%',bottom:'9%',width:'18%',height:'54%',objectPosition:'center bottom',zIndex:'4',filter:'saturate(1.03) contrast(1.01)',transition:'transform .24s ease,opacity .18s ease'});root.appendChild(shoppers);

    const bowl=img(SRC.bowl,'g3-bowl','mixing bowl and whisk');place(bowl,650,425,300,-1);css(bowl,{zIndex:'8',filter:'saturate(.88) brightness(1.06)',transition:'transform .16s ease,filter .16s ease'});root.appendChild(bowl);
    const slime=img(SRC.slime,'g3-slime','finished slime');place(slime,650,425,168,0);css(slime,{zIndex:'9',opacity:'0',filter:'saturate(1.12)',transition:'opacity .18s ease,transform .18s ease,filter .18s ease'});root.appendChild(slime);

    const base=img(SRC.glue,'g3-base','slime base glue');const activator=img(SRC.glue,'g3-activator','slime activator');css(base,{zIndex:'10',filter:'hue-rotate(315deg) saturate(.82)'});css(activator,{zIndex:'10',filter:'hue-rotate(125deg) saturate(.92)'});root.append(base,activator);
    const baseTag=el('div','g3-tool-label','베이스');const actTag=el('div','g3-tool-label','활성액');[baseTag,actTag].forEach(e=>css(e,{position:'absolute',zIndex:'11',transform:'translate(-50%,-50%)',padding:'5px 9px',borderRadius:'999px',background:'rgba(255,255,255,.92)',boxShadow:'0 4px 12px rgba(45,56,83,.09)',fontSize:'12px',fontWeight:'900'}));root.append(baseTag,actTag);

    const colors=el('div','g3-colors');css(colors,{position:'absolute',left:'8.8%',top:'42.5%',display:'flex',gap:'11px',zIndex:'12'});const colorBtns={};[['blue','#63b6ff','파랑'],['green','#72d69e','초록'],['pink','#ff8daf','분홍']].forEach(([k,c,label])=>{const d=el('div',`g3-color g3-color-${k}`);d.dataset.key=k;css(d,{width:'56px',height:'56px',borderRadius:'20px',background:`radial-gradient(circle at 36% 28%,#fff8 0 13%,transparent 14%),${c}`,border:'4px solid rgba(255,255,255,.9)',boxShadow:'0 7px 16px rgba(41,52,77,.12),inset 0 -6px 0 rgba(41,52,77,.07)',display:'grid',placeItems:'center',fontSize:'10px',fontWeight:'900',color:'#29344d',transition:'transform .14s ease,box-shadow .14s ease'});d.textContent=label;colors.appendChild(d);colorBtns[k]=d;});root.appendChild(colors);

    const decos=el('div','g3-decos');css(decos,{position:'absolute',left:'8.7%',top:'60.2%',display:'flex',gap:'10px',zIndex:'12'});const decoEls={};Object.entries(DECO).forEach(([k,[glyph,label]])=>{const d=el('div',`g3-deco g3-deco-${k}`);d.dataset.key=k;d.innerHTML=`<span style="font-size:27px;line-height:1">${glyph}</span><small style="font-size:9px;font-weight:900">${label}</small>`;css(d,{width:'62px',height:'62px',borderRadius:'21px',background:'linear-gradient(180deg,#fff,#fff7fb)',border:'3px solid rgba(127,86,111,.12)',boxShadow:'0 7px 15px rgba(64,47,64,.09)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px',transition:'transform .14s ease,box-shadow .14s ease'});decos.appendChild(d);decoEls[k]=d;});root.appendChild(decos);

    const containers=el('div','g3-containers');css(containers,{position:'absolute',left:'8.6%',bottom:'6.2%',display:'flex',gap:'10px',zIndex:'12'});root.appendChild(containers);
    const containerEls={};[['round','◯','원형 용기'],['square','▢','네모 용기']].forEach(([k,g,l])=>{const d=el('div',`g3-container g3-container-${k}`,`${g} ${l}`);css(d,{padding:'9px 13px',borderRadius:'16px',background:'rgba(255,255,255,.94)',border:'2px solid rgba(87,71,90,.13)',fontSize:'12px',fontWeight:'900',boxShadow:'0 6px 12px rgba(61,44,61,.08)'});containers.appendChild(d);containerEls[k]=d;});

    const orderCard=el('div','g3-order-card');css(orderCard,{position:'absolute',right:'3.2%',top:'10%',width:'17%',minHeight:'105px',zIndex:'14',padding:'13px 12px',borderRadius:'24px',background:'rgba(255,255,255,.96)',border:'3px solid rgba(222,142,169,.46)',boxShadow:'0 10px 22px rgba(92,56,78,.11)',textAlign:'center'});const orderTitle=el('div','g3-order-title','손님 주문');css(orderTitle,{fontSize:'13px',fontWeight:'900',color:'#8e5b73',marginBottom:'7px'});const orderBody=el('div','g3-order-body');css(orderBody,{display:'flex',justifyContent:'center',gap:'7px',flexWrap:'wrap'});orderCard.append(orderTitle,orderBody);root.appendChild(orderCard);

    const economy=el('div','g3-economy');css(economy,{position:'absolute',left:'39%',top:'10.2%',display:'flex',alignItems:'center',gap:'8px',zIndex:'14'});const coins=el('div','g3-coins','● 0');css(coins,{padding:'8px 11px',borderRadius:'999px',background:'#fff5cc',fontSize:'13px',fontWeight:'900',color:'#9c6a00',boxShadow:'0 5px 12px rgba(137,93,0,.08)'});economy.appendChild(coins);const supplyEls={};Object.entries(SUPPLY).forEach(([k,[glyph,label,cost]])=>{const d=el('div',`g3-supply g3-supply-${k}`);d.dataset.key=k;d.innerHTML=`<span style="font-size:19px">${glyph}</span><span>${cost}●</span>`;css(d,{minWidth:'70px',height:'38px',padding:'0 8px',borderRadius:'14px',background:'rgba(255,255,255,.94)',border:'2px solid rgba(83,70,94,.11)',boxShadow:'0 5px 12px rgba(58,48,72,.08)',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',fontSize:'10px',fontWeight:'900',transition:'opacity .15s ease,transform .15s ease'});economy.appendChild(d);supplyEls[k]=d;});root.appendChild(economy);

    const bonusLayer=el('div','g3-bonus-layer');css(bonusLayer,{position:'absolute',inset:'0',zIndex:'13'});root.appendChild(bonusLayer);const bonusEls={};Object.entries(SUPPLY).forEach(([k,[glyph,label]])=>{const d=el('div',`g3-bonus g3-bonus-${k}`);d.innerHTML=`<span style="font-size:24px">${glyph}</span><small style="font-size:9px;font-weight:900">${label}</small>`;css(d,{position:'absolute',display:'none',width:'60px',height:'60px',transform:'translate(-50%,-50%)',borderRadius:'20px',background:'rgba(255,255,255,.96)',border:'3px solid rgba(112,89,120,.12)',boxShadow:'0 7px 15px rgba(62,49,74,.1)',alignItems:'center',justifyContent:'center',flexDirection:'column'});bonusLayer.appendChild(d);bonusEls[k]=d;});

    const serve=el('div','g3-serve','손님에게 주기');css(serve,{position:'absolute',zIndex:'15',transform:'translate(-50%,-50%)',padding:'13px 22px',borderRadius:'18px',background:'linear-gradient(180deg,#ff9c87,#f57569)',color:'#fff',fontSize:'15px',fontWeight:'900',boxShadow:'0 9px 18px rgba(202,89,77,.24),inset 0 2px 0 rgba(255,255,255,.35)',transition:'transform .14s ease,filter .14s ease,box-shadow .14s ease'});root.appendChild(serve);
    const status=el('div','g3-status');css(status,{position:'absolute',left:'50%',bottom:'1.5%',transform:'translateX(-50%)',zIndex:'16',maxWidth:'54%',padding:'9px 17px',borderRadius:'999px',background:'rgba(41,52,77,.9)',color:'#fff',fontSize:'14px',fontWeight:'900',textAlign:'center',boxShadow:'0 7px 18px rgba(41,52,77,.16)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'});root.appendChild(status);
    const focus=el('div','g3-focus');css(focus,{position:'absolute',zIndex:'7',transform:'translate(-50%,-50%)',width:'110px',height:'92px',borderRadius:'28px',border:'5px solid rgba(70,194,214,.72)',boxShadow:'0 0 0 10px rgba(103,214,229,.16),0 8px 18px rgba(45,97,112,.12)',opacity:'0',transition:'left .16s ease,top .16s ease,opacity .12s ease,transform .12s ease'});root.appendChild(focus);

    const jarImgs=[];for(let i=0;i<4;i++){const j=img(SRC.jar,'g3-finished-jar','finished slime jar');css(j,{position:'absolute',right:`${3.5+(i%2)*7.5}%`,top:`${37+Math.floor(i/2)*18}%`,width:'6.2%',zIndex:'6',opacity:'0',filter:'saturate(.92)',transition:'opacity .2s ease,transform .24s ease'});root.appendChild(j);jarImgs.push(j);}

    const assetImgs=[clerk,shoppers,base,activator,bowl,slime,...jarImgs];Promise.all(assetImgs.map(waitImage)).then(ok=>{root.dataset.ready=ok.slice(0,6).filter(Boolean).length>=4?'1':'fallback';root.dataset.authoredLoaded=String(ok.filter(Boolean).length);});

    let prevOrders=-1,prevMixed=false,prevChosen='';
    const sync=()=>{
      if(!root.isConnected||!scene.sys?.isActive()||!scene.scene?.key?.startsWith('G3R'))return;syncRoot(scene,root);
      const ingredients=scene.ingredients instanceof Set?[...scene.ingredients]:(scene.ingredients||[]);const chosen=scene.chosen||{};const mixed=!!scene.mixed;const orders=Number(scene.ordersServed||0);const order=scene.order||{};
      round.textContent=`${Number(scene.orderIndex||0)+1} / ${Number(scene.orders?.length||1)} 주문`;
      status.textContent=scene.status?.text||'재료를 넣고 주문대로 슬라임을 만들어요';coins.textContent=`● ${Number(scene.coinCount||0)}`;

      // Actual interactive tool positions drive authored DOM art.
      if(scene.base){place(base,scene.base.x,scene.base.y,126,-22);baseTag.style.left=toPctX(scene.base.x);baseTag.style.top=toPctY(scene.base.y+72);}if(scene.activator){place(activator,scene.activator.x,scene.activator.y,126,22);actTag.style.left=toPctX(scene.activator.x);actTag.style.top=toPctY(scene.activator.y+72);}
      base.style.opacity=ingredients.includes('base')?'.38':'1';activator.style.opacity=ingredients.includes('activator')?'.38':'1';
      bowl.style.filter=mixed?'saturate(1.06) brightness(1.03)':'saturate(.88) brightness(1.06)';
      const color=ORDER_COLOR[chosen.color]||'#b49cff';slime.style.opacity=mixed?'1':'0';slime.style.filter=`saturate(1.2) drop-shadow(0 9px 13px ${color}55)`;slime.style.transform=`translate(-50%,-50%) scale(${mixed?1:0.72})`;

      Object.entries(colorBtns).forEach(([k,d])=>{const on=chosen.color===k;d.style.transform=on?'translateY(-4px) scale(1.08)':'none';d.style.boxShadow=on?'0 0 0 5px rgba(78,192,216,.2),0 9px 17px rgba(41,52,77,.14)':'0 7px 16px rgba(41,52,77,.12),inset 0 -6px 0 rgba(41,52,77,.07)';d.style.opacity=ingredients.length<2?'.58':'1';});
      Object.entries(decoEls).forEach(([k,d])=>{const o=scene.children?.list?.find(x=>x?.name===`deco_${k}`);if(o){d.style.position='absolute';d.style.left=toPctX(o.x);d.style.top=toPctY(o.y);d.style.transform=`translate(-50%,-50%) scale(${chosen.decos?.includes(k)?.82:1})`;d.style.opacity=chosen.decos?.includes(k)?'.52':'1';}else d.style.display='none';});
      decos.style.display='contents';
      const hasContainer=!!scene.order?.container||scene.children?.list?.some(x=>x?.name==='container_round'||x?.name==='container_square');containers.style.display=hasContainer?'flex':'none';Object.entries(containerEls).forEach(([k,d])=>{const on=chosen.container===k;d.style.background=on?'#d9f4ff':'rgba(255,255,255,.94)';d.style.boxShadow=on?'0 0 0 4px rgba(87,189,215,.16)':'0 6px 12px rgba(61,44,61,.08)';});

      orderBody.innerHTML='';const addBadge=(html,label,bg='#fff')=>{const b=el('div','g3-order-badge');b.innerHTML=`<div style="font-size:24px;line-height:1">${html}</div><small style="font-size:9px;font-weight:900">${label}</small>`;css(b,{minWidth:'48px',padding:'7px 6px',borderRadius:'14px',background:bg,border:'2px solid rgba(90,68,92,.09)'});orderBody.appendChild(b);};if(order.color)addBadge('●',order.color==='blue'?'파랑':order.color==='green'?'초록':'분홍',`${ORDER_COLOR[order.color]}55`);if(order.deco){const v=DECO[order.deco]||['◆',order.deco];addBadge(v[0],v[1]);}if(order.container)addBadge(order.container==='round'?'◯':'▢',order.container==='round'?'원형':'네모');

      const stock={};for(const [k] of Object.entries(SUPPLY))stock[k]=Number(scene.supplyStock?.get?.(k)||0);Object.entries(supplyEls).forEach(([k,d])=>{const cost=SUPPLY[k][2],n=stock[k];d.lastElementChild.textContent=n>0?`${n}개 · ${cost}●`:`${cost}●`;d.style.opacity=(Number(scene.coinCount||0)>=cost)?'1':'.47';d.style.transform=n>0?'translateY(-2px)':'none';});
      Object.entries(bonusEls).forEach(([k,d])=>{const o=(scene.bonusDecos||[]).find(x=>x.supplyId===k&&x.active!==false&&!x.supplySpent);if(o){d.style.display='flex';d.style.left=toPctX(o.x);d.style.top=toPctY(o.y);}else d.style.display='none';});

      if(scene.serveButton){serve.style.left=toPctX(scene.serveButton.x);serve.style.top=toPctY(scene.serveButton.y);}const ready=mixed&&chosen.color===order.color&&chosen.decos?.includes?.(order.deco)&&(!order.container||chosen.container===order.container);serve.style.filter=ready?'saturate(1.15) brightness(1.03)':'grayscale(.15) brightness(.93)';serve.style.boxShadow=ready?'0 0 0 7px rgba(255,151,132,.16),0 10px 20px rgba(202,89,77,.25)':'0 8px 16px rgba(202,89,77,.16)';
      jarImgs.forEach((j,i)=>{j.style.opacity=i<orders?'1':'0';j.style.transform=i<orders?'translateY(0) scale(1)':'translateY(12px) scale(.82)';});

      // Context focus follows the actual accepted target.
      let fx=null,fy=null,fw=118,fh=96;if(ingredients.length<2){fx=650;fy=420;fw=250;fh=170;}else if(!chosen.color){fx=325;fy=355;fw=300;fh=88;}else if(!mixed){fx=650;fy=420;fw=280;fh=190;}else if(!chosen.decos?.includes?.(order.deco)){const dx={star:210,flower:305,heart:400,banana:495}[order.deco]||305;fx=dx;fy=485;fw=82;fh=82;}else if(order.container&&!chosen.container){fx=order.container==='round'?230:380;fy=585;fw=135;fh=64;}else{fx=scene.serveButton?.x||870;fy=scene.serveButton?.y||630;fw=175;fh=72;}focus.style.left=toPctX(fx);focus.style.top=toPctY(fy);focus.style.width=toPctX(fw);focus.style.height=toPctY(fh);focus.style.opacity='1';

      const chosenKey=`${chosen.color||''}:${(chosen.decos||[]).join(',')}:${chosen.container||''}`;if(mixed&&!prevMixed){bowl.style.transform='translate(-50%,-50%) scale(1.05)';setTimeout(()=>{if(bowl.isConnected)bowl.style.transform='translate(-50%,-50%) scale(1)'},180);}if(orders>prevOrders&&prevOrders>=0){clerk.style.transform='translateY(-5px) scale(1.035)';shoppers.style.transform='translateY(-3px) scale(1.025)';setTimeout(()=>{if(clerk.isConnected)clerk.style.transform='';if(shoppers.isConnected)shoppers.style.transform='';},420);}if(chosenKey!==prevChosen&&chosenKey){root.dataset.lastChoice=chosenKey;}prevMixed=mixed;prevOrders=orders;prevChosen=chosenKey;

      root.dataset.orders=String(orders);root.dataset.mixed=String(mixed);root.dataset.ingredients=ingredients.join(',');root.dataset.orderReady=String(ready);root.dataset.artQuality='authored-scene';root.dataset.generatedVisualAssets='0';
    };
    scene.events.on('postupdate',sync);scene.scale?.on?.('resize',sync);sync();
    scene.vCommercialArt='g3-authored-shop-v1';window.__ADUGAME_ART_SOURCE__=window.__ADUGAME_ART_SOURCE__||{};window.__ADUGAME_ART_SOURCE__.G3={version:'commercial-v1',qualityTarget:'G1R2 authored-art scene quality',generatedVisualAssets:0,assets:[{name:'Female Store Clerk #1',author:'oksmith',source:'Openclipart/publicdomainq.net',license:'CC0/Public Domain',url:SRC.clerk},{name:'Shopping with Mother',author:'oksmith',source:'Openclipart/publicdomainq.net',license:'Public Domain',url:SRC.shoppers},{name:'Glue',author:'ensarija',source:'Openclipart',license:'Public Domain',url:SRC.glue},{name:'Baking whisk and bowl',author:'SunKing2',source:'Openclipart',license:'Public Domain',url:SRC.bowl},{name:'Slime',author:'dcatcherex',source:'Openclipart',license:'Public Domain',url:SRC.slime},{name:'jar',author:'PeterBrough',source:'Openclipart',license:'Public Domain',url:SRC.jar}]};
    const cleanup=()=>{root.remove();scene.__g3CommercialRoot=null;};scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=CraftRound.prototype.create;
  CraftRound.prototype.create=function(){prior.call(this);this.time.delayedCall(900,()=>mount(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V1__={loaded:true,version:'1.0',generatedVisualAssets:0};
})();
