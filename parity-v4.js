// ADUGAME parity-v4: deterministic fixes for state transforms that must not race snap timers.
(() => {
  window.__ADUGAME_PARITY_V4__ = { version: '4.0', loaded: true };

  const texts = o => Array.isArray(o?.list) ? o.list.filter(c => c?.type === 'Text') : [];
  const graphics = o => Array.isArray(o?.list) ? o.list.filter(c => c?.type === 'Graphics') : [];
  const hideAllText = o => texts(o).forEach(t => t.setVisible(false));
  const compactInstalled = o => {
    if (!o) return;
    graphics(o).forEach(g => g.setVisible(false));
    texts(o).forEach((t, i) => t.setVisible(i === 0));
    o._v3Compact = true;
    o._v4Compact = true;
  };

  // G1R3: once an ingredient is accepted on the plate, its inventory label is gone.
  const g1FoodEnd = G1R3.prototype.foodEnd;
  G1R3.prototype.foodEnd = function(o) {
    const accepted = this.step === 3 && dist(o.x, o.y, 730, 450) < 180;
    const result = g1FoodEnd.call(this, o);
    if (accepted) {
      hideAllText(o);
      o._v4Stacked = true;
    }
    return result;
  };

  // G2R1: assembled sandwich ingredients keep the material shape, not source labels.
  const g2FoodDrop = G2R1.prototype.dropFood;
  G2R1.prototype.dropFood = function(o) {
    const accepted = ['bread','cheese','lettuce','tomato','banana'].includes(o.kind) &&
      dist(o.x, o.y, 710, 500) < 190;
    const result = g2FoodDrop.call(this, o);
    if (accepted) {
      hideAllText(o);
      o._v4Stacked = true;
    }
    return result;
  };

  // G2R3: installed parts compact synchronously; paint/cloth always return home.
  const g2Drop = G2R3.prototype.drop;
  G2R3.prototype.drop = function(o) {
    const before = this.stage;
    const dWheel = dist(o.x, o.y, 575, 465);
    const dCar = dist(o.x, o.y, 705, 405);
    const install =
      (before === 0 && o.kind === 'wheel' && dWheel < 125) ||
      (before === 1 && o.kind === 'screw' && dWheel < 115) ||
      (before === 2 && o.kind === 'driver' && dWheel < 125);
    const transient = (o.kind === 'paint' || o.kind === 'cloth') && dCar < 190;

    const result = g2Drop.call(this, o);
    if (install) compactInstalled(o);

    if (transient && o.parityHome) {
      this.time.delayedCall(FEEL.snap.correctDuration + 24, () => {
        if (!o.active) return;
        this.tweens.killTweensOf(o);
        this.tweens.add({
          targets: o,
          x: o.parityHome.x,
          y: o.parityHome.y,
          angle: 0,
          scaleX: o._baseScaleX || 1,
          scaleY: o._baseScaleY || 1,
          duration: 170,
          ease: 'Cubic.Out'
        });
      });
    }
    return result;
  };
})();