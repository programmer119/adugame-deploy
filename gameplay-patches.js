// ADUGAME v2 runtime hardening patches.
// These patches preserve the reverse-engineered gameplay constants while fixing
// input-race and hit-area defects found by real Chromium pointer QA.
(() => {
  // 1) Drag pickup animation must never fight the user's pointer coordinates.
  BaseRound.prototype.dragify = function(obj, opts = {}) {
    const w = Math.max(FEEL.input.minHitPx, (obj.width || 72) * FEEL.input.hitScale);
    const h = Math.max(FEEL.input.minHitPx, (obj.height || 72) * FEEL.input.hitScale);
    obj.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    this.input.setDraggable(obj);
    obj.home = { x: obj.x, y: obj.y };
    obj._baseScaleX = obj.scaleX;
    obj._baseScaleY = obj.scaleY;

    obj.on('dragstart', p => {
      if (this.interactionLocked) return;
      this.markMeaningfulInput('drag_start', { id: obj.name || obj.kind || 'object' });
      audio.pickup();
      obj.setDepth(1000);
      obj._pickupScaleTween?.stop();
      obj._pickupLiftTween?.stop();
      obj._pickupScaleTween = this.tweens.add({
        targets: obj,
        scaleX: obj._baseScaleX * FEEL.input.pickupScale,
        scaleY: obj._baseScaleY * FEEL.input.pickupScale,
        duration: FEEL.input.pickupDuration,
        ease: 'Cubic.Out'
      });
      obj._pickupLiftTween = this.tweens.add({
        targets: obj,
        y: obj.y + FEEL.input.objectLiftY,
        duration: FEEL.input.pickupDuration,
        ease: 'Cubic.Out'
      });
      opts.start?.(obj, p);
    });

    obj.on('drag', (p, x, y) => {
      if (this.interactionLocked) return;
      // Once the pointer actually moves, it becomes the sole authority for position.
      if (obj._pickupLiftTween) {
        obj._pickupLiftTween.stop();
        obj._pickupLiftTween = null;
      }
      obj.x = x;
      obj.y = y;
      opts.drag?.(obj, p);
    });

    obj.on('dragend', p => {
      if (this.interactionLocked) return;
      if (obj._pickupLiftTween) {
        obj._pickupLiftTween.stop();
        obj._pickupLiftTween = null;
      }
      opts.end?.(obj, p);
      if (!opts.keepDepth) obj.setDepth(10);
    });
    return obj;
  };

  // 2) Mini faucet in G1R3 had only an implicit Container hit area.
  // Give it the same forgiving child-oriented interaction margin as the rest of the game.
  const g1r3Create = G1R3.prototype.create;
  G1R3.prototype.create = function() {
    g1r3Create.call(this);
    this.faucet.setInteractive(
      new Phaser.Geom.Rectangle(-60, -60, 120, 120),
      Phaser.Geom.Rectangle.Contains
    );
  };

  // 3) Loaded laundry objects must stop intercepting the washer door until the wash finishes.
  const g2r2Drop = G2R2.prototype.drop;
  G2R2.prototype.drop = function(o) {
    const alreadyLoaded = this.loaded.has(o.kind);
    g2r2Drop.call(this, o);
    if (!alreadyLoaded && this.loaded.has(o.kind)) {
      this.time.delayedCall(FEEL.snap.correctDuration + 20, () => {
        if (o.input) o.input.enabled = false;
      });
    }
  };
  const g2r2StartWash = G2R2.prototype.startWash;
  G2R2.prototype.startWash = function() {
    g2r2StartWash.call(this);
    this.time.delayedCall(1550, () => {
      if (!this.washed) return;
      this.items
        .filter(o => ['shirt', 'pants', 'sock'].includes(o.kind))
        .forEach(o => { if (o.input) o.input.enabled = true; });
    });
  };

  // 4) A successful screwdriver rotation used to fall through to wrongReturn on dragend.
  const g2r3Drop = G2R3.prototype.drop;
  G2R3.prototype.drop = function(o) {
    if (this.stage >= 3 && o.kind === 'driver') return;
    return g2r3Drop.call(this, o);
  };

  // 5) Phaser custom ellipse hit-test on the mixing Zone was not receiving pointer motion
  // consistently in headless/desktop Chromium. Use a default zone and evaluate the exact
  // ellipse mathematically in world coordinates instead.
  CraftRound.prototype.makeMixSurface = function() {
    const inside = p => {
      const dx = (p.x - 650) / 170;
      const dy = (p.y - 420) / 105;
      return dx * dx + dy * dy <= 1;
    };
    this.mixZone = this.add.zone(650, 420, 340, 210).setInteractive().setDepth(55);
    this.mixZone.on('pointerdown', p => {
      if (!inside(p) || !this.chosen.color || this.ingredients.size < 2) return;
      this.mixStart = this.time.now;
      this.lastAngle = Phaser.Math.RadToDeg(Math.atan2(p.y - 420, p.x - 650));
      telemetry('mix_start');
    });
    this.mixZone.on('pointermove', p => {
      if (!p.isDown || !inside(p) || !this.chosen.color || this.ingredients.size < 2 || this.mixed) return;
      const a = Phaser.Math.RadToDeg(Math.atan2(p.y - 420, p.x - 650));
      if (this.lastAngle !== null) {
        const d = Math.abs(Phaser.Math.Angle.ShortestBetween(this.lastAngle, a));
        this.mixAngle += d;
        if (this.liquid) this.liquid.setRotation(this.liquid.rotation + d * .0022);
        if (Math.floor(this.mixAngle / 120) !== Math.floor((this.mixAngle - d) / 120)) audio.scrub();
        if (this.mixAngle >= FEEL.slime.mixAngle && this.time.now - this.mixStart >= FEEL.slime.minMixTime) this.completeMix();
        this.lastAngle = a;
      }
    });
  };

  // 6) Expand color controls to explicit 88x88 zones, independent of rendered-circle bounds.
  const craftCreate = CraftRound.prototype.create;
  CraftRound.prototype.create = function() {
    craftCreate.call(this);
    [
      ['blue', COLORS.blue, 210],
      ['green', COLORS.green, 325],
      ['pink', 0xff8fab, 440]
    ].forEach(([k, c, x]) => {
      const z = this.add.zone(x, 355, 88, 88)
        .setInteractive(new Phaser.Geom.Rectangle(-44, -44, 88, 88), Phaser.Geom.Rectangle.Contains)
        .setDepth(56)
        .setName(`color_hit_${k}`);
      z.on('pointerup', () => this.pickColor(k, c, z));
    });
  };

  // 7) The deformable blob itself gets a robust rectangular input surface; its visual
  // deformation and spring model remain unchanged.
  const craftCompleteMix = CraftRound.prototype.completeMix;
  CraftRound.prototype.completeMix = function() {
    craftCompleteMix.call(this);
    if (this.slimeBlob?.zone) this.slimeBlob.zone.setInteractive();
  };
})();
