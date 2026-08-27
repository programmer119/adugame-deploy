// ADUGAME parity-v3: semantic visual cleanup on top of parity-fixes.js.
(() => {
  const childTexts = o => Array.isArray(o?.list) ? o.list.filter(c => c?.type === 'Text') : [];
  const childGraphics = o => Array.isArray(o?.list) ? o.list.filter(c => c?.type === 'Graphics') : [];
  const hideLabel = o => childTexts(o).slice(1).forEach(t => t.setVisible(false));
  const showLabel = o => childTexts(o).slice(1).forEach(t => t.setVisible(true));
  const hideCard = o => childGraphics(o).forEach(g => g.setVisible(false));
  const showCard = o => childGraphics(o).forEach(g => g.setVisible(true));

  // G1R3: once sandwich ingredients are on the plate, their inventory labels no
  // longer belong in the scene. Preserve the food shape, remove only the source label.
  const g1r3FoodEndV3 = G1R3.prototype.foodEnd;
  G1R3.prototype.foodEnd = function(o) {
    const accepted = this.step === 3 && dist(o.x, o.y, 730, 450) < 180;
    const result = g1r3FoodEndV3.call(this, o);
    if (accepted) {
      this.time.delayedCall(FEEL.snap.correctDuration + 12, () => {
        if (this.stack.includes(o)) childTexts(o).forEach(t => t.setVisible(false));
      });
    }
    return result;
  };

  // G2R1: same rule for assembled sandwich. Object remains visible; inventory label
  // disappears after it becomes part of the constructed food state.
  const g2r1DropV3 = G2R1.prototype.dropFood;
  G2R1.prototype.dropFood = function(o) {
    const result = g2r1DropV3.call(this, o);
    this.time.delayedCall(FEEL.snap.correctDuration + 12, () => {
      if (this.stack.includes(o)) childTexts(o).forEach(t => t.setVisible(false));
    });
    return result;
  };

  // G2R2: hide a successfully loaded source card before the next visual-audit frame.
  // parity-fixes creates a compact unique washer badge shortly afterwards.
  const g2r2DropV3 = G2R2.prototype.drop;
  G2R2.prototype.drop = function(o) {
    const wasLoaded = this.loaded.has(o.kind);
    const result = g2r2DropV3.call(this, o);
    if (!wasLoaded && this.loaded.has(o.kind) && !this.washed) {
      this.time.delayedCall(105, () => {
        if (!this.washed && this.loaded.has(o.kind)) {
          o.setVisible(false);
          if (o.input) o.input.enabled = false;
        }
      });
    }
    return result;
  };

  // G2R3: convert source "cards" into installed-part visuals while they are attached
  // to the car. Wheel/screw keep their icon only; driver keeps its icon while rotating.
  // This avoids white card backgrounds and labels piling up on the repair target.
  const compactInstalled = o => {
    if (!o) return;
    hideCard(o); hideLabel(o);
    const icon = childTexts(o)[0];
    if (icon) icon.setVisible(true);
    o._v3Compact = true;
  };
  const restoreToolCard = o => {
    if (!o) return;
    showCard(o); showLabel(o);
    childTexts(o)[0]?.setVisible(true);
    o._v3Compact = false;
  };

  const g2r3DropV3 = G2R3.prototype.drop;
  G2R3.prototype.drop = function(o) {
    const before = this.stage;
    const dWheel = dist(o.x, o.y, 575, 465);
    const wheelOK = before === 0 && o.kind === 'wheel' && dWheel < 125;
    const screwOK = before === 1 && o.kind === 'screw' && dWheel < 115;
    const driverOK = before === 2 && o.kind === 'driver' && dWheel < 125;
    const result = g2r3DropV3.call(this, o);
    if (wheelOK || screwOK || driverOK) {
      this.time.delayedCall(FEEL.snap.correctDuration + 20, () => compactInstalled(o));
    }
    return result;
  };

  const g2r3RotateV3 = G2R3.prototype.rotateGesture;
  G2R3.prototype.rotateGesture = function(p) {
    const before = this.stage;
    const result = g2r3RotateV3.call(this, p);
    if (before < 3 && this.stage >= 3) {
      this.time.delayedCall(280, () => restoreToolCard(this.driver));
    }
    return result;
  };

  // Result screen should read as a modal, not as an accidental pile of active controls.
  // Once the round is complete, disable input on scene objects behind the result panel.
  const baseFinishV3 = BaseRound.prototype.finish;
  BaseRound.prototype.finish = function(opts = {}) {
    if (this.roundComplete) return baseFinishV3.call(this, opts);
    this.children.list.forEach(o => {
      if (o?.input?.enabled && o !== this.homeButton) o.input.enabled = false;
    });
    return baseFinishV3.call(this, opts);
  };
})();