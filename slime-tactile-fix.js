// ADUGAME benchmark-v5 tactile slime input hardening + input-target diagnostics.
// Root cause from Run #66/#68: JellyBlob's custom Ellipse used (0,0) as its center.
// Phaser custom hit-area coordinates are local from the GameObject's top-left, so the
// visible slime center must map to (zone.width/2, zone.height/2). The old ellipse only
// covered a corner of the Zone and real pointerdown at the visible right side never hit it.
(() => {
  window.__ADUGAME_SLIME_TACTILE_FIX__ = { version: '5.0.3', loaded: true };

  const pointerXY = p => ({
    x: Number.isFinite(p?.worldX) ? p.worldX : p?.x,
    y: Number.isFinite(p?.worldY) ? p.worldY : p?.y
  });
  const maxPull = blob => blob ? Math.max(...blob.points.map(p => Math.hypot(p.x - p.bx, p.y - p.by))) : 0;
  const hitInfo = o => {
    const b=o?.getBounds?.();
    return {name:o?.name||'',type:o?.type||'',depth:o?.depth??null,x:o?.x??null,y:o?.y??null,inputEnabled:!!o?.input?.enabled,bounds:b?{x:b.x,y:b.y,width:b.width,height:b.height}:null};
  };

  const originalCompleteMix = CraftRound.prototype.completeMix;
  CraftRound.prototype.completeMix = function() {
    const result=originalCompleteMix.call(this);
    const blob=this.slimeBlob,zone=blob?.zone;
    if(!blob||!zone||blob._v5TactileWired)return result;
    blob._v5TactileWired=true;
    zone.setName('slime_tactile_zone');

    // Real runtime fix: rebuild JellyBlob's hit surface in the coordinate system Phaser
    // actually sends to the hitArea callback. This preserves an elliptical tactile surface
    // aligned to the rendered slime instead of widening the test or mutating vertices.
    zone.removeInteractive();
    const hit=new Phaser.Geom.Ellipse(zone.width/2,zone.height/2,FEEL.slime.baseRx*2.6,FEEL.slime.baseRy*2.9);
    zone.setInteractive(hit,Phaser.Geom.Ellipse.Contains);
    this.input.setDraggable(zone);
    zone.setDepth(65);

    blob._tactileDiag={pointerDown:0,dragStart:0,dragCount:0,scenePointerDown:0,lastPointerX:null,lastPointerY:null,maxVertexPull:0,sceneHits:[],gameObjectDown:null,dragState:null};

    // Diagnostics stay runtime-neutral and verify the actual input target in Chromium.
    const sceneDown=p=>{
      if(this.slimeBlob!==blob)return;
      const q=pointerXY(p);let hits=[];
      try{hits=this.input.hitTestPointer(p).map(hitInfo);}catch(e){hits=[{error:String(e)}];}
      blob._tactileDiag.scenePointerDown++;
      blob._tactileDiag.lastPointerX=q.x;blob._tactileDiag.lastPointerY=q.y;
      blob._tactileDiag.sceneHits=hits;blob._tactileDiag.dragState=this.input.getDragState?.(p)??null;
      telemetry('tactile_scene_pointer_down',{x:Math.round(q.x),y:Math.round(q.y),hits:hits.map(h=>h.name||h.type),dragState:blob._tactileDiag.dragState});
    };
    const objectDown=(p,o)=>{
      if(this.slimeBlob!==blob)return;
      blob._tactileDiag.gameObjectDown=hitInfo(o);
      telemetry('tactile_gameobject_down',{target:o?.name||o?.type||'unknown',depth:o?.depth??null});
    };
    this.input.on('pointerdown',sceneDown);
    this.input.on('gameobjectdown',objectDown);

    // Preserve the exact pointer-down location. Phaser still has to emit a real dragstart;
    // the first deformation is then applied on dragstart so a short mouse/touch pull reacts
    // immediately rather than waiting for an extra object-drag frame.
    zone.removeAllListeners('dragstart');zone.removeAllListeners('drag');zone.removeAllListeners('dragend');
    zone.on('pointerdown',p=>{
      const q=pointerXY(p);blob._pointerDown=q;blob._tactileDiag.pointerDown++;
      blob._tactileDiag.lastPointerX=q.x;blob._tactileDiag.lastPointerY=q.y;
      telemetry('tactile_pointer_down',{x:Math.round(q.x),y:Math.round(q.y)});
    });
    zone.on('dragstart',p=>{
      const q=pointerXY(p),down=blob._pointerDown||q;
      blob._tactileDiag.dragStart++;blob._tactileDiag.lastPointerX=q.x;blob._tactileDiag.lastPointerY=q.y;
      blob.grab({x:down.x,y:down.y});
      blob.drag({x:q.x,y:q.y});
      blob._tactileDiag.maxVertexPull=Math.max(blob._tactileDiag.maxVertexPull,maxPull(blob));
      telemetry('tactile_drag_start',{grabIndex:blob.grabIndex,downX:Math.round(down.x),downY:Math.round(down.y),x:Math.round(q.x),y:Math.round(q.y),maxVertexPull:Math.round(blob._tactileDiag.maxVertexPull)});
    });
    zone.on('drag',p=>{
      const q=pointerXY(p);blob._tactileDiag.dragCount++;
      blob._tactileDiag.lastPointerX=q.x;blob._tactileDiag.lastPointerY=q.y;
      blob.drag({x:q.x,y:q.y});
      blob._tactileDiag.maxVertexPull=Math.max(blob._tactileDiag.maxVertexPull,maxPull(blob));
    });
    zone.on('dragend',p=>{
      const q=pointerXY(p);blob._tactileDiag.lastPointerX=q.x;blob._tactileDiag.lastPointerY=q.y;
      blob.release();blob._pointerDown=null;telemetry('tactile_drag_end',{x:Math.round(q.x),y:Math.round(q.y)});
    });
    zone.on('pointerup',()=>{if(blob.grabIndex<0)blob._pointerDown=null;});
    return result;
  };

  const originalDebugState=CraftRound.prototype.debugState;
  CraftRound.prototype.debugState=function(){
    const state=originalDebugState.call(this),blob=this.slimeBlob,diag=blob?._tactileDiag||{},b=blob?.zone?.getBounds?.(),h=blob?.zone?.input?.hitArea;
    return {...state,
      tactilePointerDown:diag.pointerDown||0,tactileDragStart:diag.dragStart||0,tactileDragCount:diag.dragCount||0,
      tactileScenePointerDown:diag.scenePointerDown||0,tactileSceneHits:diag.sceneHits||[],tactileGameObjectDown:diag.gameObjectDown||null,tactileDragState:diag.dragState??null,
      grabIndex:blob?.grabIndex??-1,lastPointerX:diag.lastPointerX??null,lastPointerY:diag.lastPointerY??null,
      maxVertexPull:Math.max(diag.maxVertexPull||0,maxPull(blob)),
      slimeZoneBounds:b?{x:b.x,y:b.y,width:b.width,height:b.height}:null,
      slimeHitArea:h?{x:h.x,y:h.y,width:h.width,height:h.height,type:h.constructor?.name||''}:null};
  };
})();
