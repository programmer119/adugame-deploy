// ADUGAME G1R2 canonical input completion resilience v1.0.
// Keeps the original dropPaste validation and snap path. Only after canonical validation
// has actually chosen snap(), mirror that snap completion with a single-fire browser timer.
// No state is fabricated and invalid drops never enter this fallback.
(() => {
  if (typeof G1R2 !== 'function') return;
  const priorDropPaste = G1R2.prototype.dropPaste;
  if (typeof priorDropPaste !== 'function') return;

  G1R2.prototype.dropPaste = function (tool, ...args) {
    const scene = this;
    const rawSnap = scene.snap;
    if (typeof rawSnap !== 'function') return priorDropPaste.call(scene, tool, ...args);

    let acceptedSnap = false;
    scene.snap = function (obj, x, y, callback) {
      acceptedSnap = true;
      let fired = false;
      let browserTimer = null;
      const once = (...cbArgs) => {
        if (fired) return;
        fired = true;
        if (browserTimer !== null) window.clearTimeout(browserTimer);
        browserTimer = null;
        scene.__g1r2PasteSnapFallbackPending = false;
        return callback?.(...cbArgs);
      };
      const event = rawSnap.call(scene, obj, x, y, once);
      scene.__g1r2PasteSnapFallbackPending = true;
      browserTimer = window.setTimeout(once, 520);
      const clear = () => {
        if (browserTimer !== null) window.clearTimeout(browserTimer);
        browserTimer = null;
        scene.__g1r2PasteSnapFallbackPending = false;
      };
      scene.events?.once?.('shutdown', clear);
      scene.events?.once?.('destroy', clear);
      return event;
    };

    try {
      return priorDropPaste.call(scene, tool, ...args);
    } finally {
      scene.snap = rawSnap;
      scene.__g1r2PasteAcceptedSnap = acceptedSnap;
    }
  };

  window.__ADUGAME_G1R2_INPUT_GUARD__ = {
    loaded: true,
    version: '1.0',
    canonicalDropPasteValidation: true,
    acceptedSnapOnly: true,
    singleFire: true,
    generatedVisualAssets: 0
  };
})();
