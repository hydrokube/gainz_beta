(function (window) {
  "use strict";

  var originalSetInterval = window.setInterval.bind(window);
  var originalClearInterval = window.clearInterval.bind(window);
  var originalSetTimeout = window.setTimeout.bind(window);
  var originalClearTimeout = window.clearTimeout.bind(window);

  var deterministic = false;
  var nowMs = 0;
  var nextTimerId = 1;
  var timers = new Map();

  function toDelay(value) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  }

  function toTimerId(id) {
    var parsed = Number(id);
    if (!Number.isFinite(parsed)) {
      return -1;
    }
    return parsed;
  }

  function createTimer(callback, delay, repeat, args) {
    var id = nextTimerId;
    nextTimerId += 1;

    var normalizedDelay = toDelay(delay);
    timers.set(id, {
      callback: callback,
      args: args,
      delay: normalizedDelay,
      nextAt: nowMs + normalizedDelay,
      repeat: repeat,
    });
    return id;
  }

  function clearTimer(id) {
    timers.delete(toTimerId(id));
  }

  function callTimer(timer) {
    if (typeof timer.callback === "function") {
      timer.callback.apply(window, timer.args);
      return;
    }

    if (typeof timer.callback === "string") {
      // This mirrors browser timer behavior and is only for compatibility.
      window.eval(timer.callback);
    }
  }

  function findNextDueTimer() {
    var chosenId = null;
    var chosenTimer = null;

    timers.forEach(function (timer, id) {
      if (timer.nextAt <= nowMs) {
        if (chosenTimer === null || timer.nextAt < chosenTimer.nextAt || (timer.nextAt === chosenTimer.nextAt && id < chosenId)) {
          chosenId = id;
          chosenTimer = timer;
        }
      }
    });

    return { id: chosenId, timer: chosenTimer };
  }

  function runDueTimers() {
    var maxIterations = 100000;
    var iterations = 0;

    while (iterations < maxIterations) {
      var next = findNextDueTimer();
      if (next.timer === null) {
        return;
      }

      iterations += 1;
      if (next.timer.repeat) {
        next.timer.nextAt += next.timer.delay;
      } else {
        timers.delete(next.id);
      }

      callTimer(next.timer);
    }

    throw new Error("Deterministic clock exceeded max timer iterations.");
  }

  function step(ms) {
    if (!deterministic) {
      throw new Error("Deterministic clock step called while mode is real-time.");
    }

    var delta = Number(ms);
    if (!Number.isFinite(delta) || delta < 0) {
      throw new Error("Deterministic clock step requires a non-negative finite number.");
    }

    nowMs += delta;
    runDueTimers();
    return nowMs;
  }

  function setNow(ms) {
    if (!deterministic) {
      throw new Error("Deterministic clock setNow called while mode is real-time.");
    }

    var target = Number(ms);
    if (!Number.isFinite(target) || target < nowMs) {
      throw new Error("Deterministic clock setNow requires a finite value >= current time.");
    }

    nowMs = target;
    runDueTimers();
    return nowMs;
  }

  function setDeterministicMode(enabled) {
    deterministic = !!enabled;
    if (deterministic) {
      nowMs = 0;
      timers.clear();
      nextTimerId = 1;
    } else {
      timers.clear();
    }
  }

  window.setInterval = function (callback, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (!deterministic) {
      return originalSetInterval(callback, delay, ...args);
    }
    return createTimer(callback, delay, true, args);
  };

  window.clearInterval = function (id) {
    if (!deterministic) {
      originalClearInterval(id);
      return;
    }
    clearTimer(id);
  };

  window.setTimeout = function (callback, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (!deterministic) {
      return originalSetTimeout(callback, delay, ...args);
    }
    return createTimer(callback, delay, false, args);
  };

  window.clearTimeout = function (id) {
    if (!deterministic) {
      originalClearTimeout(id);
      return;
    }
    clearTimer(id);
  };

  var api = {
    isDeterministic: function () {
      return deterministic;
    },
    setDeterministicMode: setDeterministicMode,
    step: step,
    setNow: setNow,
    now: function () {
      return nowMs;
    },
    timerCount: function () {
      return timers.size;
    },
    reset: function () {
      nowMs = 0;
      timers.clear();
      nextTimerId = 1;
    },
  };

  window.GainzClock = api;
  window.__gainzClock = api;

  try {
    var params = new URL(window.location.href).searchParams;
    if (params.get("deterministic") === "1") {
      setDeterministicMode(true);
    }
  } catch (e) {
    // Ignore URL parsing errors and keep default real-time mode.
  }
})(window);
