// ADUGAME v2 runtime hardening patches.
// Browser-QA fixes only: gameplay FEEL constants remain authoritative in core.js.
(() => {
  const pointerNear = (scene, x, y, radius) => {
    const p = scene.input?.activePointer;
    return !!p && dist(p.x, p.y, x, y) <= radius;
  };

  // 1) Pickup animation must never fight the live drag coordinates.
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

  // 2) G1R2: child-friendly drop acceptance uses either dragged-object overlap or
  // the actual released pointer. This prevents a renderer-frame lag from turning a
  // visually correct soap drop into an error.
  const g1r2DropSoap = G1R2.prototype.dropSoap;
  G1R2.prototype.dropSoap = function(o) {
    const accepted = this.step === 1 && (
      dist(o.x, o.y, 650, 455) <= 175 || pointerNear(this, 650, 455, 175)
    );
    if (!accepted) return g1r2DropSoap.call(this, o);
    this.snap(o, 520, 465, () => {
      audio.plop();
      this.add.text(650, 435, '○   ○  ○   ○', { fontSize: '30px', color: '#7bdff2' }).setOrigin(.5).setName('foam');
      this.step = 2;
      this.status.setText('손 위를 눌러 좌우로 충분히 문질러요');
      this.hintTarget = { x: 650, y: 455 };
      this.tweens.add({ targets: o, x: o.home.x, y: o.home.y, duration: 180 });
    });
  };

  // 3) G1R3: use a dedicated top-layer faucet input zone. Re-setting a Container's
  // input shape was not enough on all Phaser/Chromium combinations.
  const g1r3Create = G1R3.prototype.create;
  G1R3.prototype.create = function() {
    g1r3Create.call(this);
    this.faucetHit = this.add.zone(180, 250, 120, 120)
      .setInteractive(new Phaser.Geom.Rectangle(-60, -60, 120, 120), Phaser.Geom.Rectangle.Contains)
      .setDepth(120)
      .setName('routine_faucet_hit');
    this.faucetHit.on('pointerup', () => this.startHands());
  };

  // 4) G2R2: accept a washer drop by object overlap OR release-pointer overlap,
  // then make loaded items non-intercepting until the cycle finishes.
  const g2r2DropOriginal = G2R2.prototype.drop;
  G2R2.prototype.drop = function(o) {
    const washerRelease = dist(o.x, o.y, 650, 355) < 165 || pointerNear(this, 650, 355, 165);
    if (washerRelease && !this.loaded.has(o.kind) && !this.washed) {
      if (!this.washerOpen || this.running) {
        this.curious(this.washer);
        this.wrongReturn(o, 'washer_closed', this.washer);
        return;
      }
      this.loaded.add(o.kind);
      this.snap(o, 650, 355, () => o.setAlpha(.28));
      this.time.delayedCall(FEEL.snap.correctDuration + 25, () => {
        if (o.input) o.input.enabled = false;
      });
      return;
    }
    g2r2DropOriginal.call(this, o);
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

  // 5) Successful screwdriver release is not an error.
  const g2r3Drop = G2R3.prototype.drop;
  G2R3.prototype.drop = function(o) {
    if (this.stage >= 3 && o.kind === 'driver') return;
    return g2r3Drop.call(this, o);
  };

  // 6) Craft mixing: default Zone hit surface + explicit mathematical ellipse.
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

  // 7) Explicit 88x88 color hit zones.
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

  // 8) Robust tactile-input surface for the deformable blob.
  const craftCompleteMix = CraftRound.prototype.completeMix;
  CraftRound.prototype.completeMix = function() {
    craftCompleteMix.call(this);
    if (this.slimeBlob?.zone) this.slimeBlob.zone.setInteractive();
  };
})();
