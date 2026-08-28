// ADUGAME benchmark-v5 tactile slime input hardening.
// Artifact Run #66 showed a real mouse drag reaching the canvas while vertex pull stayed at 0.
// Preserve the actual pointer-down grab location, let Phaser produce the real dragstart,
// and apply the first deformation on dragstart so short/fast drags respond immediately.
(() => {
  window.__ADUGAME_SLIME_TACTILE_FIX__ = { version: '5.0.1', loaded: true };

  const pointerXY = p => ({
    x: Number.isFinite(p?.worldX) ? p.worldX : p?.x,
    y: Number.isFinite(p?.worldY) ? p.worldY : p?.y
  });

  const maxPull = blob => blob ? Math.max(...blob.points.map(p => Math.hypot(p.x - p.bx, p.y - p.by))) : 0;

  const originalCompleteMix = CraftRound.prototype.completeMix;
  CraftRound.prototype.completeMix = function() {
    const result = originalCompleteMix.call(this);
    const blob = this.slimeBlob;
    const zone = blob?.zone;
    if (!blob || !zone || blob._v5TactileWired) return result;
    blob._v5TactileWired = true;
    blob._tactileDiag = {
      pointerDown: 0,
      dragStart: 0,
      dragCount: 0,
      lastPointerX: null,
      lastPointerY: null,
      maxVertexPull: 0
    };

    // Replace only JellyBlob's original drag listeners. The draggable Zone and Phaser's
    // drag manager remain authoritative; this is not a synthetic point mutation path.
    zone.removeAllListeners('dragstart');
    zone.removeAllListeners('drag');
    zone.removeAllListeners('dragend');

    zone.on('pointerdown', p => {
      const q = pointerXY(p);
      blob._pointerDown = q;
      blob._tactileDiag.pointerDown++;
      blob._tactileDiag.lastPointerX = q.x;
      blob._tactileDiag.lastPointerY = q.y;
      telemetry('tactile_pointer_down', { x: Math.round(q.x), y: Math.round(q.y) });
    });

    zone.on('dragstart', p => {
      const q = pointerXY(p);
      const down = blob._pointerDown || q;
      blob._tactileDiag.dragStart++;
      blob._tactileDiag.lastPointerX = q.x;
      blob._tactileDiag.lastPointerY = q.y;

      // The selected vertex is the one the user actually touched, not whichever vertex
      // happens to be nearest after the pointer has already crossed the drag threshold.
      blob.grab({ x: down.x, y: down.y });
      // A dragstart already represents real pointer travel. Reflect that travel immediately;
      // otherwise a quick drag can end before Phaser emits a subsequent object 'drag' event.
      blob.drag({ x: q.x, y: q.y });
      blob._tactileDiag.maxVertexPull = Math.max(blob._tactileDiag.maxVertexPull, maxPull(blob));
      telemetry('tactile_drag_start', {
        grabIndex: blob.grabIndex,
        downX: Math.round(down.x),
        downY: Math.round(down.y),
        x: Math.round(q.x),
        y: Math.round(q.y),
        maxVertexPull: Math.round(blob._tactileDiag.maxVertexPull)
      });
    });

    zone.on('drag', p => {
      const q = pointerXY(p);
      blob._tactileDiag.dragCount++;
      blob._tactileDiag.lastPointerX = q.x;
      blob._tactileDiag.lastPointerY = q.y;
      blob.drag({ x: q.x, y: q.y });
      blob._tactileDiag.maxVertexPull = Math.max(blob._tactileDiag.maxVertexPull, maxPull(blob));
      telemetry('tactile_drag', {
        count: blob._tactileDiag.dragCount,
        grabIndex: blob.grabIndex,
        x: Math.round(q.x),
        y: Math.round(q.y),
        maxVertexPull: Math.round(blob._tactileDiag.maxVertexPull)
      });
    });

    zone.on('dragend', p => {
      const q = pointerXY(p);
      blob._tactileDiag.lastPointerX = q.x;
      blob._tactileDiag.lastPointerY = q.y;
      blob.release();
      blob._pointerDown = null;
      telemetry('tactile_drag_end', { x: Math.round(q.x), y: Math.round(q.y) });
    });

    zone.on('pointerup', () => {
      // If the pointer is released before dragstart there is no active grab to release,
      // but the cached pointer-down location must not leak into the next gesture.
      if (blob.grabIndex < 0) blob._pointerDown = null;
    });

    return result;
  };

  const originalDebugState = CraftRound.prototype.debugState;
  CraftRound.prototype.debugState = function() {
    const state = originalDebugState.call(this);
    const blob = this.slimeBlob;
    const diag = blob?._tactileDiag || {};
    const b = blob?.zone?.getBounds?.();
    return {
      ...state,
      tactilePointerDown: diag.pointerDown || 0,
      tactileDragStart: diag.dragStart || 0,
      tactileDragCount: diag.dragCount || 0,
      grabIndex: blob?.grabIndex ?? -1,
      lastPointerX: diag.lastPointerX ?? null,
      lastPointerY: diag.lastPointerY ?? null,
      maxVertexPull: Math.max(diag.maxVertexPull || 0, maxPull(blob)),
      slimeZoneBounds: b ? { x: b.x, y: b.y, width: b.width, height: b.height } : null
    };
  };
})();
