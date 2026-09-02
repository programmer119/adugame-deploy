// ADUGAME G1R2 v17.27 final dynamic UX alignment.
// Coordinates/UI only over existing authored assets. No generated/drawn illustration assets.
(() => {
  if (typeof G1R2 !== 'function') return;
  const PASTE_HOME={x:1155,y:500};
  const BRUSH_PASTE_TARGET={x:1015,y:645};
  const BRUSH_HOME={x:1080,y:505};
  const CLOTH_HOME={x:575,y:235};
  const BRUSH_CENTER={x:820,y:515};
  const pct=(v,b)=>`${v/b*100}%`;

  function attach(scene){
    if(scene.scene?.key!=='G1R2'||scene.__g1v1727FinalUx)return;
    const root=document.getElementById('g1r2-v17-overlay');
    if(!root){scene.time.delayedCall(80,()=>attach(scene));return;}
    scene.__g1v1727FinalUx=true;
    const canvas=scene.game?.canvas;
    const focus=[...root.querySelectorAll('div')].find(d=>d.style.borderWidth==='5px'&&d.style.position==='absolute'&&d.style.transform.includes('translate'));
    const progress=root.querySelector('.g1v17-ux-progress');
    const status=root.querySelector('.g1v17-ux-status');
    const cursor=root.querySelector('.g1v17-ux-cursor');
    const wash=root.querySelector('.g1v17-wash-feedback');
    let pointer={x:null,y:null,inside:false};
    let prevPasteUp=scene.debugState?.()?.g1r2V17Input?.pasteUp||0;
    let missUntil=0;

    const logical=e=>{
      if(!canvas)return {x:0,y:0,inside:false};
      const r=canvas.getBoundingClientRect();
      return {x:(e.clientX-r.left)*1280/Math.max(1,r.width),y:(e.clientY-r.top)*720/Math.max(1,r.height),inside:e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};
    };
    const track=e=>{const p=logical(e);if(p.inside)pointer=p;};
    window.addEventListener('pointerdown',track,true);
    window.addEventListener('pointermove',track,true);

    const pin=(o,p,activeKind,kind)=>{
      if(!o)return;
      o.home={x:p.x,y:p.y};
      if(activeKind===kind&&pointer.inside&&pointer.x!=null)o.setPosition(pointer.x,pointer.y);
      else if(Math.abs(o.x-p.x)>1||Math.abs(o.y-p.y)>1)o.setPosition(p.x,p.y);
    };

    const sync=()=>{
      if(!root.isConnected||scene.scene?.key!=='G1R2')return;
      const st=Number(scene.step)||0;
      const dbg=scene.debugState?.()||{};
      const input=dbg.g1r2V17Input||{};
      const active=input.active||null;

      if(st===0){
        pin(scene.paste,PASTE_HOME,active,'paste');
        pin(scene.brush,BRUSH_PASTE_TARGET,active,'brush');
      }else if(st===1){
        pin(scene.brush,BRUSH_HOME,active,'brush');
      }else if(st===2){
        pin(scene.cloth,CLOTH_HOME,active,'cloth');
      }
      if(scene.cloth&&st!==2)scene.cloth.home={...CLOTH_HOME};

      if(active&&pointer.inside&&pointer.x!=null&&cursor){
        cursor.style.left=pct(pointer.x,1280);cursor.style.top=pct(pointer.y,720);
      }
      if(active==='cloth'&&pointer.inside&&pointer.x!=null&&wash){
        wash.style.left=pct(pointer.x,1280);wash.style.top=pct(pointer.y,720);wash.style.opacity='1';
      }

      const pasteUp=input.pasteUp||0;
      if(pasteUp>prevPasteUp&&st===0){
        missUntil=performance.now()+1500;
        root.dataset.finalUxFeedback='paste-miss';
      }
      prevPasteUp=pasteUp;

      if(st===0&&focus){
        focus.style.left=pct(PASTE_HOME.x,1280);focus.style.top=pct(PASTE_HOME.y,720);
        focus.style.width=pct(152,1280);focus.style.height=pct(142,720);
        focus.style.borderColor='rgba(52,180,205,.82)';focus.style.opacity=active==='paste'?'.60':'1';
      }else if(st===1&&focus){
        focus.style.left=pct(BRUSH_CENTER.x,1280);focus.style.top=pct(BRUSH_CENTER.y,720);
        focus.style.width=pct(235,1280);focus.style.height=pct(150,720);
      }

      if(st===0&&progress){
        const miss=performance.now()<missUntil;
        progress.textContent=miss?'여기가 아니에요 · 오른쪽 칫솔 솔 위에 놓아 주세요':active==='paste'?'치약을 칫솔로 이동 중':'치약을 잡아 → 오른쪽 칫솔 솔에 놓기';
        progress.style.background=miss?'rgba(255,245,222,.98)':'rgba(255,255,255,.97)';
        progress.style.color=miss?'#734b12':'#24465b';
        progress.style.borderColor=miss?'rgba(227,166,61,.55)':'rgba(36,49,74,.10)';
        progress.style.minWidth=miss?'330px':'230px';
        progress.style.transform=miss?'translateX(-50%) scale(1.045)':'translateX(-50%)';
      }
      if(st===0&&status){
        status.textContent='치약 튜브를 잡고 오른쪽 칫솔의 흰 솔 부분에 놓아 주세요';
      }

      root.dataset.toolHitAlignmentReady='1';
      root.dataset.version='17.27';
      if(window.__ADUGAME_ART_SOURCE__?.G1R2){
        window.__ADUGAME_ART_SOURCE__.G1R2.version='v17.27';
        window.__ADUGAME_ART_SOURCE__.G1R2.dynamicUxFinal={
          pasteHome:{...PASTE_HOME},brushPasteTarget:{...BRUSH_PASTE_TARGET},brushHome:{...BRUSH_HOME},clothHome:{...CLOTH_HOME},
          visibleToolHitAlignment:true,pasteMissFeedback:true,pointerPositionGuard:true,finalDomPointerGuard:true,generatedVisualAssets:0
        };
        window.__ADUGAME_ART_SOURCE__.G1R2.generatedVisualAssets=0;
      }
    };
    scene.events.on('postupdate',sync);sync();

    const cleanup=()=>{
      window.removeEventListener('pointerdown',track,true);window.removeEventListener('pointermove',track,true);
      scene.__g1v1727FinalUx=false;
    };
    scene.events.once('shutdown',cleanup);scene.events.once('destroy',cleanup);
  }

  const prior=G1R2.prototype.create;
  G1R2.prototype.create=function(){prior.call(this);this.time.delayedCall(1580,()=>attach(this));};
})();
