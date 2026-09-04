// ADUGAME G1R2 late-layer clock resilience guard v1.1.
// Mirrors only the three authored UX initialization delays. Phaser Clock keeps normal
// ownership; the browser timer is a late watchdog that fires only if that Clock stalls.
// Gameplay validation/state is untouched.
(() => {
  if (typeof G1R2 !== 'function') return;
  const MIRRORED_DELAYS = new Set([1380, 1460, 1580]);
  const WATCHDOG_MS = 6000;
  const priorCreate = G1R2.prototype.create;

  G1R2.prototype.create = function (...args) {
    const clock = this.time;
    const rawDelayedCall = clock?.delayedCall;
    if (typeof rawDelayedCall !== 'function') return priorCreate.apply(this, args);

    const scene = this;
    clock.delayedCall = function (delay, callback, callbackArgs, callbackScope) {
      if (!MIRRORED_DELAYS.has(Number(delay)) || typeof callback !== 'function') {
        return rawDelayedCall.call(clock, delay, callback, callbackArgs, callbackScope);
      }

      let fired = false;
      let browserTimer = null;
      const once = (...runtimeArgs) => {
        if (fired) return;
        fired = true;
        if (browserTimer !== null) window.clearTimeout(browserTimer);
        const argsToUse = Array.isArray(callbackArgs) ? callbackArgs : runtimeArgs;
        return callback.apply(callbackScope ?? scene, argsToUse);
      };

      const event = rawDelayedCall.call(clock, delay, once, callbackArgs, callbackScope);
      // Do not race normal Phaser initialization. This exists only as a dead-clock watchdog.
      browserTimer = window.setTimeout(() => once(), WATCHDOG_MS);
      const clear = () => {
        if (browserTimer !== null) window.clearTimeout(browserTimer);
        browserTimer = null;
      };
      scene.events?.once?.('shutdown', clear);
      scene.events?.once?.('destroy', clear);
      return event;
    };

    try {
      return priorCreate.apply(this, args);
    } finally {
      clock.delayedCall = rawDelayedCall;
    }
  };

  window.__ADUGAME_G1R2_LATE_LAYER_GUARD__ = {
    loaded: true,
    version: '1.1',
    mirroredDelays: [...MIRRORED_DELAYS],
    watchdogMs: WATCHDOG_MS,
    singleFire: true,
    normalClockPriority: true,
    generatedVisualAssets: 0
  };
})();
