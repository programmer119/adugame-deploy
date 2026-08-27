// ADUGAME parity / presentation fixes discovered by full-flow visual audit.
// Loaded after gameplay-patches.js and before app-shell.js.
(() => {
  const allTexts = scene => scene.children.list.filter(o => o?.type === 'Text' && o.active !== false);
  const textStarts = (scene, prefix) => allTexts(scene).find(t => String(t.text || '').startsWith(prefix));
  const clampX = x => Math.max(180, Math.min(1100, x));

  // ---------------------------------------------------------------------------
  // Shared discovery banner lane
  // ---------------------------------------------------------------------------
  // Original implementation placed discoveries directly above the source object.
  // For high objects this collided with the round title. Keep the source sparkle,
  // but render the explanatory banner inside a dedicated safe lane.
  DiscoveryRound.prototype.discover = function(id, x, y, msg) {
    if (this.discoveries.has(id)) return;
    this.discoveries.add(id);
    this.sparkle(x, y, 7);
    const nx = clampX(x);
    const ny = Math.max(148, Math.min(560, y - 42));
    const note = this.add.text(nx, ny, '발견! ' + msg, {
      fontFamily: 'Arial', fontSize: '15px', fontStyle: 'bold', color: '#ffffff',
      backgroundColor: '#6c63ff', padding: { left: 10, right: 10, top: 6, bottom: 6 }
    }).setOrigin(.5).setDepth(2500).setName('discovery_note');
    this.tweens.add({
      targets: note, y: ny - 26, alpha: 0, duration: 1050, hold: 420,
      onComplete: () => note.destroy()
    });
    audio.pop();
    telemetry('discovery', { id, round: this.scene.key });
  };

  // ---------------------------------------------------------------------------
  // G1R2 — foam must disappear during rinse
  // ---------------------------------------------------------------------------
  const g1r2Tap = G1R2.prototype.tapFaucet;
  G1R2.prototype.tapFaucet = function() {
    const rinsing = this.step === 3;
    if (rinsing) {
      const foams = this.children.list.filter(o => o?.name === 'foam' && o.active !== false);
      foams.forEach(foam => {
        this.tweens.add({
          targets: foam,
          alpha: 0,
          scaleX: .82,
          scaleY: .82,
          duration: Math.min(220, FEEL.wash.rinseHoldMs),
          ease: 'Sine.In',
          onComplete: () => foam.destroy()
        });
      });
    }
    return g1r2Tap.call(this);
  };

  // ---------------------------------------------------------------------------
  // G1R3 — instruction text gets its own top-center lane, not the plate lane
  // ---------------------------------------------------------------------------
  const g1r3CreateParity = G1R3.prototype.create;
  G1R3.prototype.create = function() {
    g1r3CreateParity.call(this);
    if (this.status) {
      this.status.setPosition(650, 145).setDepth(80);
      this.status.setFontSize?.(17);
      this.status.setBackgroundColor?.('#ffffffdd');
      this.status.setPadding?.(12, 7, 12, 7);
    }
  };

  // ---------------------------------------------------------------------------
  // G2R1 — mission text below ingredient labels; no title/discovery collision
  // ---------------------------------------------------------------------------
  const g2r1CreateParity = G2R1.prototype.create;
  G2R1.prototype.create = function() {
    g2r1CreateParity.call(this);
    const mission = textStarts(this, '미션:');
    if (mission) {
      mission.setPosition(705, 690).setDepth(40);
      mission.setFontSize?.(15);
      mission.setBackgroundColor?.('#ffffffdd');
      mission.setPadding?.(8, 4, 8, 4);
      this.missionText = mission;
    }
  };

  // ---------------------------------------------------------------------------
  // G2R2 — loaded laundry is represented by compact washer badges, not four
  // full-size labelled cards occupying the exact same coordinates.
  // ---------------------------------------------------------------------------
  const laundryEmoji = { shirt: '👕', pants: '👖', sock: '🧦', detergent: '🧴' };
  const laundrySlots = {
    shirt: [612, 338], pants: [688, 338], sock: [612, 390], detergent: [688, 390]
  };

  const g2r2CreateParity = G2R2.prototype.create;
  G2R2.prototype.create = function() {
    g2r2CreateParity.call(this);
    this._loadBadges = new Map();
    const mission = textStarts(this, '미션:');
    if (mission) {
      mission.setPosition(650, 685).setDepth(40);
      mission.setFontSize?.(15);
      mission.setBackgroundColor?.('#ffffffdd');
      mission.setPadding?.(8, 4, 8, 4);
      this.missionText = mission;
    }
  };

  const g2r2DropParity = G2R2.prototype.drop;
  G2R2.prototype.drop = function(o) {
    const wasLoaded = this.loaded.has(o.kind);
    const result = g2r2DropParity.call(this, o);
    if (!wasLoaded && this.loaded.has(o.kind) && !this.washed) {
      this.time.delayedCall(FEEL.snap.correctDuration + 35, () => {
        if (!o.active || this.washed) return;
        o.setVisible(false);
        if (o.input) o.input.enabled = false;
        if (!this._loadBadges?.has(o.kind)) {
          const [x, y] = laundrySlots[o.kind] || [650, 355];
          const badge = this.add.text(x, y, laundryEmoji[o.kind] || '•', {
            fontSize: '24px',
            backgroundColor: '#ffffffaa',
            padding: { left: 5, right: 5, top: 3, bottom: 3 }
          }).setOrigin(.5).setDepth(45).setName('washer_badge_' + o.kind);
          this._loadBadges?.set(o.kind, badge);
        }
      });
    }
    return result;
  };

  const g2r2StartParity = G2R2.prototype.startWash;
  G2R2.prototype.startWash = function() {
    const result = g2r2StartParity.call(this);
    if (this._parityWashPoll?.active) return result;
    const poll = this.time.addEvent({
      delay: 20,
      loop: true,
      callback: () => {
        if (!this.washed) return;
        this._loadBadges?.forEach(b => b.destroy());
        this._loadBadges?.clear();
        this.items.forEach(o => {
          if (['shirt', 'pants', 'sock'].includes(o.kind)) {
            o.setVisible(true).setAlpha(1);
            o.y = 565;
            o.home = { x: o.x, y: o.y };
          } else if (o.kind === 'detergent') {
            o.setVisible(false);
            if (o.input) o.input.enabled = false;
          }
        });
        poll.remove(false);
        if (this._parityWashPoll === poll) this._parityWashPoll = null;
      }
    });
    this._parityWashPoll = poll;
    return result;
  };

  // ---------------------------------------------------------------------------
  // G2R3 — actual paint state, transient tool cleanup, separate driver instruction
  // ---------------------------------------------------------------------------
  G2R3.prototype.makeCar = function(x, y) {
    const c = this.add.container(x, y).setName('car');
    const body = this.add.graphics();
    const draw = color => {
      body.clear();
      body.fillStyle(color, 1).fillRoundedRect(-150, -55, 300, 110, 30);
      body.fillStyle(0x8ecae6, 1).fillRoundedRect(-58, -105, 116, 58, 18);
      body.fillStyle(COLORS.dark, 1).fillCircle(105, 60, 42);
      body.fillStyle(COLORS.dark, .25).fillCircle(-115, 60, 42);
    };
    draw(COLORS.red);
    c.add(body);
    c.setSize(330, 220);
    c.repaint = color => {
      draw(color);
      c.paintColor = color;
    };
    c.paintColor = COLORS.red;
    return c;
  };

  const g2r3CreateParity = G2R3.prototype.create;
  G2R3.prototype.create = function() {
    g2r3CreateParity.call(this);
    [this.wheel, this.screw, this.driver, this.paint, this.ball, this.cloth, this.pump]
      .filter(Boolean)
      .forEach(o => { o.parityHome = { x: o.home?.x ?? o.x, y: o.home?.y ?? o.y }; });
    const mission = textStarts(this, '미션:');
    if (mission) {
      mission.setPosition(700, 690).setDepth(40);
      mission.setFontSize?.(15);
      mission.setBackgroundColor?.('#ffffffdd');
      mission.setPadding?.(8, 4, 8, 4);
      this.missionText = mission;
    }
  };

  const g2r3DropParity = G2R3.prototype.drop;
  G2R3.prototype.drop = function(o) {
    const beforeStage = this.stage;
    const dCar = dist(o.x, o.y, 705, 405);
    const dWheel = dist(o.x, o.y, 575, 465);
    const paintSuccess = o.kind === 'paint' && dCar < 190;
    const clothSuccess = o.kind === 'cloth' && dCar < 190;
    const driverPlaced = beforeStage === 2 && o.kind === 'driver' && dWheel < 125;
    const result = g2r3DropParity.call(this, o);

    if (paintSuccess) {
      this.time.delayedCall(FEEL.snap.correctDuration + 20, () => {
        this.car?.repaint?.(0x88ccff);
        this.sparkle(705, 365, 7);
        if (o.parityHome) this.tweens.add({ targets: o, x: o.parityHome.x, y: o.parityHome.y, angle: 0, duration: 240, ease: 'Cubic.Out' });
      });
    }
    if (clothSuccess) {
      this.time.delayedCall(FEEL.snap.correctDuration + 220, () => {
        if (o.parityHome) this.tweens.add({ targets: o, x: o.parityHome.x, y: o.parityHome.y, angle: 0, duration: 240, ease: 'Cubic.Out' });
      });
    }
    if (driverPlaced) {
      this.time.delayedCall(FEEL.snap.correctDuration + 30, () => {
        const instruction = textStarts(this, '드라이버 손잡이를');
        if (instruction) {
          instruction.setPosition(700, 132).setDepth(90);
          instruction.setFontSize?.(15);
          instruction.setBackgroundColor?.('#ffffffdd');
          instruction.setPadding?.(10, 6, 10, 6);
          instruction.setName('driver_instruction');
          this.driverInstruction = instruction;
        }
      });
    }
    return result;
  };

  const g2r3RotateParity = G2R3.prototype.rotateGesture;
  G2R3.prototype.rotateGesture = function(p) {
    const beforeStage = this.stage;
    const result = g2r3RotateParity.call(this, p);
    if (beforeStage < 3 && this.stage >= 3) {
      this.driverInstruction?.destroy();
      this.driverInstruction = null;
      const home = this.driver?.parityHome;
      if (this.driver && home) {
        this.driver.disableInteractive?.();
        this.tweens.add({
          targets: this.driver,
          x: home.x,
          y: home.y,
          angle: 0,
          scaleX: this.driver._baseScaleX || 1,
          scaleY: this.driver._baseScaleY || 1,
          duration: 240,
          ease: 'Cubic.Out'
        });
      }
    }
    return result;
  };

  const g2r3DebugParity = G2R3.prototype.debugState;
  G2R3.prototype.debugState = function() {
    return { ...g2r3DebugParity.call(this), paintColor: this.car?.paintColor ?? null };
  };

  // ---------------------------------------------------------------------------
  // G3 — real shelf/jar state instead of a text-only claim, plus lower safe status lane
  // ---------------------------------------------------------------------------
  const makeJar = (scene, x, y) => {
    const c = scene.add.container(x, y).setName('finished_jar').setDepth(70);
    const g = scene.add.graphics();
    const colorMap = { blue: COLORS.blue, green: COLORS.green, pink: 0xff8fab };
    const fill = colorMap[scene.chosen.color] || COLORS.purple;
    g.fillStyle(0xffffff, .9).fillRoundedRect(-34, -46, 68, 92, 18);
    g.lineStyle(3, COLORS.ink, .18).strokeRoundedRect(-34, -46, 68, 92, 18);
    g.fillStyle(fill, .82).fillRoundedRect(-28, -22, 56, 58, 15);
    g.fillStyle(COLORS.dark, .28).fillRoundedRect(-30, -54, 60, 12, 5);
    c.add(g);
    const symbols = scene.chosen.decos.slice(0, 3).map(k => ({ star: '★', flower: '✿', heart: '♥', banana: '◒' }[k] || '•')).join('');
    if (symbols) c.add(scene.add.text(0, 4, symbols, { fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(.5));
    c.setSize(76, 112);
    return c;
  };

  const craftCreateParity = CraftRound.prototype.create;
  CraftRound.prototype.create = function() {
    craftCreateParity.call(this);
    if (this.status) {
      this.status.setPosition(630, 682).setDepth(80);
      this.status.setFontSize?.(15);
      this.status.setBackgroundColor?.('#ffffffdd');
      this.status.setPadding?.(9, 5, 9, 5);
    }
    const shelf = this.add.container(1090, 642).setName('finished_shelf').setDepth(3);
    const sg = this.add.graphics();
    sg.fillStyle(0xc69c6d, .32).fillRoundedRect(-120, -38, 240, 76, 16);
    sg.lineStyle(3, COLORS.brown, .45).strokeRoundedRect(-120, -38, 240, 76, 16);
    sg.lineStyle(5, COLORS.brown, .45).lineBetween(-110, 20, 110, 20);
    shelf.add(sg);
    this.finishedShelf = shelf;
    this.finishedJars = [];
  };

  const craftServeParity = CraftRound.prototype.serve;
  CraftRound.prototype.serve = function() {
    const valid = this.mixed &&
      this.chosen.color === this.order.color &&
      this.chosen.decos.includes(this.order.deco) &&
      (!this.order.container || this.chosen.container === this.order.container);
    if (valid && !this._jarQueued) {
      this._jarQueued = true;
      const jar = makeJar(this, 650, 420).setScale(.92);
      this.finishedJars.push(jar);
      const slot = Math.min(2, this.finishedJars.length - 1);
      this.time.delayedCall(650, () => {
        if (!jar.active) return;
        this.tweens.add({
          targets: jar,
          x: 1030 + slot * 62,
          y: 632,
          scale: .58,
          duration: 360,
          ease: 'Cubic.InOut'
        });
      });
    }
    return craftServeParity.call(this);
  };

  const craftDebugParity = CraftRound.prototype.debugState;
  CraftRound.prototype.debugState = function() {
    return { ...craftDebugParity.call(this), shelfCount: this.finishedJars?.filter(j => j.active).length || 0 };
  };
})();