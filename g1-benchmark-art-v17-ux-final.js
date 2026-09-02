// ADUGAME G1R2 v17.28 final dynamic UX alignment.
// Coordinates/UI only over existing authored assets. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const PASTE_HOME={x:1155,y:500};
  const BRUSH_PASTE_TARGET={x:1015,y:645};
  const BRUSH_HOME={x:1080,y:505};
  const CLOTH_HOME={x:575,y:265};
  const BRUSH_CENTER={x:820,y:515};
  const pct=(v,b)=>`${v/b*100}%`;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1728FinalUx)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(80,()=>attach(scene));return;}
    scene.__g1v1728FinalUx=true;
    const canvas=scene.game?.canvas;
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const progress=root.querySelector('.g1v17-ux-progress');
    const status=root.querySelector('.g1v17-ux-status');
    const cursor=root.querySelector('.g1v17-ux-cursor');
    const wash=root.querySelector('.g1v17-wash-feedback');

    const dropTarget=document.createElement('div');
    dropTarget.className='g1v17-paste-drop-target';
    Object.assign(dropTarget.style,{position:'absolute',left:pct(BRUSH_PASTE_TARGET.x,1280),top:pct(BRUSH_PASTE_TARGET.y,720),width:pct(104,1280),height:pct(62,720),transform:'translate(-50%,-50%)',borderRadius:'20px',border:'3px dashed rgba(42,153,190,.76)',background:'rgba(231,250,255,.18)',boxShadow:'0 0 0 7px rgba(123,223,242,.10)',zIndex:'14',pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'1000',color:'#15556e',opacity:'.62',transition:'opacity .12s ease,transform .12s ease,background .12s ease'});
    root.appendChild(dropTarget);

    const alert=document.createElement('div');
    alert.className='g1v17-final-alert';
    alert.textContent='여기가 아니에요 · 칫솔 솔 위에 놓아 주세요';
    Object.assign(alert.style,{position:'absolute',left:'50%',bottom:'14.1%',transform:'translateX(-50%)',zIndex:'22',pointerEvents:'none',padding:'9px 16px',borderRadius:'16px',border:'2px solid rgba(221,150,40,.48)',background:'rgba(255,246,222,.98)',boxShadow:'0 7px 18px rgba(96,64,16,.16)',fontSize:'15px',fontWeight:'1000',color:'#704812',opacity:'0',transition:'opacity .12s ease,transform .12s ease',whiteSpace:'nowrap'});
    root.appendChild(alert);

    let pointer={x:null,y:null,inside:false};
    let prevPasteUp=scene.debugState?.()?.g1r2V17Input?.pasteUp||0;
    let prevPasteDown=scene.debugState?.()?.g1r2V17Input?.pasteDown||0;
    let pasteMissActive=false;
    const logical=e=>{
      if(!canvas)return{x:0,y:0,inside:false};
      const r=canvas.getBoundingClientRect();
      return{x:(e.clientX-r.left)*1280/Math.max(1,r.width),y:(e.clientY-r.top)*720/Math.max(1,r.height),inside:e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};
    };
    const track=e=>{const p=logical(e);if(p.inside)pointer=p;};
    window.addEventListener('pointerdown',track,true);window.addEventListener('pointermove',track,true);

    const pin=(o,p,activeKind,kind)=>{
      if(!o)return;o.home={x:p.x,y:p.y};
      if(activeKind===kind&&pointer.inside&&pointer.x!=null)o.setPosition(pointer.x,pointer.y);
      else if(Math.abs(o.x-p.x)>1||Math.abs(o.y-p.y)>1)o.setPosition(p.x,p.y);
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0,dbg=scene.debugState?.()||{},input=dbg.g1r2V17Input||{},active=input.active||null;
      if(st===0){pin(scene.paste,PASTE_HOME,active,'paste');pin(scene.brush,BRUSH_PASTE_TARGET,active,'brush');}
      else if(st===1)pin(scene.brush,BRUSH_HOME,active,'brush');
      else if(st===2)pin(scene.cloth,CLOTH_HOME,active,'cloth');
      if(scene.cloth&&st!==2)scene.cloth.home={...CLOTH_HOME};

      if(active&&pointer.inside&&pointer.x!=null&&cursor){cursor.style.left=pct(pointer.x,1280);cursor.style.top=pct(pointer.y,720);}
      if(active==='cloth'&&pointer.inside&&pointer.x!=null&&wash){wash.style.left=pct(pointer.x,1280);wash.style.top=pct(pointer.y,720);wash.style.opacity='1';}

      const pasteDown=input.pasteDown||0,pasteUp=input.pasteUp||0;
      if(pasteDown>prevPasteDown&&pasteMissActive)pasteMissActive=false;
      if(pasteUp>prevPasteUp&&st===0){pasteMissActive=true;root.dataset.finalUxFeedback='paste-miss';}
      if(st!==0)pasteMissActive=false;
      prevPasteDown=pasteDown;prevPasteUp=pasteUp;
      const miss=st===0&&pasteMissActive;

      dropTarget.style.opacity=st===0?(miss?'.98':active==='paste'?'.88':'.62'):'0';
      dropTarget.style.transform=st===0?(miss?'translate(-50%,-50%) scale(1.08)':'translate(-50%,-50%)'):'translate(-50%,-50%)';
      dropTarget.style.background=miss?'rgba(255,247,218,.78)':'rgba(231,250,255,.18)';
      dropTarget.style.borderColor=miss?'rgba(221,150,40,.84)':'rgba(42,153,190,.76)';
      dropTarget.textContent=miss?'여기':'';
      alert.style.opacity=miss?'1':'0';alert.style.transform=miss?'translateX(-50%) scale(1.02)':'translateX(-50%)';

      if(st===0&&focus){focus.style.left=pct(PASTE_HOME.x,1280);focus.style.top=pct(PASTE_HOME.y,720);focus.style.width=pct(152,1280);focus.style.height=pct(142,720);focus.style.borderColor='rgba(52,180,205,.82)';focus.style.opacity=active==='paste'?'.60':'1';}
      else if(st===1&&focus){focus.style.left=pct(BRUSH_CENTER.x,1280);focus.style.top=pct(BRUSH_CENTER.y,720);focus.style.width=pct(235,1280);focus.style.height=pct(150,720);}

      if(st===0&&progress){progress.textContent=active==='paste'?'치약을 칫솔로 이동 중':'치약을 잡아 → 오른쪽 칫솔 솔에 놓기';progress.style.minWidth='230px';}
      if(st===0&&status)status.textContent='치약 튜브를 잡고 오른쪽 칫솔의 흰 솔 부분에 놓아 주세요';

      root.dataset.toolHitAlignmentReady='1';root.dataset.finalAlertReady='1';root.dataset.version='17.28';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.28';window.__ADUGAME_ART_SOURCE__.G1R2.dynamicUxFinal={pasteHome:{...PASTE_HOME},brushPasteTarget:{...BRUSH_PASTE_TARGET},brushHome:{...BRUSH_HOME},clothHome:{...CLOTH_HOME},visibleToolHitAlignment:true,pasteMissFeedback:true,persistentMissAlert:true,missPersistsUntilRetry:true,pasteDropTarget:true,pointerPositionGuard:true,finalDomPointerGuard:true,generatedVisualAssets:0};window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;}
    };
    scene.events.on('postupdate',sync);sync();
    const cleanup=()=>{window.removeEventListener('pointerdown',track,true);window.removeEventListener('pointermove',track,true);dropTarget.remove();alert.remove();scene.__g1v1728FinalUx=false;};
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }
  const prior=G1R2.prototype.create;G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1580,()=>attach(this));};
})();
