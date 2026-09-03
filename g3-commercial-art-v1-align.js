// ADUGAME G3 commercial-art v1.01 — visual/hit alignment guard.
(() => {
  if(typeof CraftRound!=='function')return;
  const pctX=x=>`${x/12.8}%`,pctY=y=>`${y/7.2}%`;
  const POS={blue:[210,355],green:[325,355],pink:[440,355],round:[230,585],square:[380,585],soccer:[596,188],butterfly:[720,188],animal:[844,188]};
  function attach(scene){
    if(scene.__g3CommercialAlign||!scene.scene?.key?.startsWith('G3R'))return;
    const root=document.getElementById('g3-commercial-art-v1');if(!root){scene.time.delayedCall(120,()=>attach(scene));return;}
    scene.__g3CommercialAlign=true;
    const colors=root.querySelector('.g3-colors'),containers=root.querySelector('.g3-containers'),economy=root.querySelector('.g3-economy'),coins=root.querySelector('.g3-coins');
    if(colors)Object.assign(colors.style,{position:'static',display:'contents'});if(containers)Object.assign(containers.style,{position:'static',display:'contents'});if(economy)Object.assign(economy.style,{position:'static',display:'contents'});
    if(coins)Object.assign(coins.style,{position:'absolute',left:pctX(1080),top:pctY(132),transform:'translate(-50%,-50%)'});
    for(const k of ['blue','green','pink']){const e=root.querySelector(`.g3-color-${k}`),p=POS[k];if(e&&p)Object.assign(e.style,{position:'absolute',left:pctX(p[0]),top:pctY(p[1]),transform:'translate(-50%,-50%)'});}
    for(const k of ['round','square']){const e=root.querySelector(`.g3-container-${k}`),p=POS[k];if(e&&p)Object.assign(e.style,{position:'absolute',left:pctX(p[0]),top:pctY(p[1]),transform:'translate(-50%,-50%)'});}
    for(const k of ['soccer','butterfly','animal']){const e=root.querySelector(`.g3-supply-${k}`),p=POS[k];if(e&&p)Object.assign(e.style,{position:'absolute',left:pctX(p[0]),top:pctY(p[1]),transform:'translate(-50%,-50%)'});}
    const sync=()=>{
      if(!root.isConnected||!scene.sys?.isActive())return;
      for(const k of ['blue','green','pink']){const e=root.querySelector(`.g3-color-${k}`),o=scene.children?.list?.find(x=>x?.name===`color_${k}`),p=POS[k];if(e){const x=o?.x??p[0],y=o?.y??p[1];e.style.left=pctX(x);e.style.top=pctY(y);if(!(scene.chosen?.color===k))e.style.transform='translate(-50%,-50%)';}}
      for(const k of ['round','square']){const e=root.querySelector(`.g3-container-${k}`),o=scene.children?.list?.find(x=>x?.name===`container_${k}`),p=POS[k];if(e){e.style.display=o?'block':'none';e.style.left=pctX(o?.x??p[0]);e.style.top=pctY(o?.y??p[1]);e.style.transform='translate(-50%,-50%)';}}
      for(const k of ['soccer','butterfly','animal']){const e=root.querySelector(`.g3-supply-${k}`),o=scene.supplyButtons?.get?.(k),p=POS[k];if(e){const worldX=o?(scene.supplyRail?.x||720)+o.x:p[0],worldY=o?(scene.supplyRail?.y||188)+o.y:p[1];e.style.left=pctX(worldX);e.style.top=pctY(worldY);const stock=Number(scene.supplyStock?.get?.(k)||0);e.style.transform=`translate(-50%,-50%)${stock>0?' translateY(-2px)':''}`;}}
      root.dataset.hitAlignment='1';root.dataset.generatedVisualAssets='0';
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{scene.__g3CommercialAlign=false;};scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const prior=CraftRound.prototype.create;CraftRound.prototype.create=function(){prior.call(this);this.time.delayedCall(1040,()=>attach(this));};
  window.__ADUGAME_G3_COMMERCIAL_ART_V1_ALIGN__={loaded:true,version:'1.01',generatedVisualAssets:0};
})();
