(function (window) {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function requireClock() {
    if (!window.__gainzClock) {
      throw new Error("__gainzClock is not available.");
    }
    return window.__gainzClock;
  }

  function requireRandom() {
    if (!window.__gainzRandom) {
      throw new Error("__gainzRandom is not available.");
    }
    return window.__gainzRandom;
  }

  function normalizePositiveInteger(value, fallback) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }
    return Math.floor(parsed);
  }

  function normalizePositiveNumber(value, fallback) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }
    return parsed;
  }

  function snapshot() {
    return {
      stats: clone(window.stats),
      bodyweight: clone(window.bodyweight),
      upgrades: clone(window.upgrades),
      job: clone(window.job),
      research: clone(window.research),
      checks: clone(window.checks),
      gym: clone(window.gym),
      prestige: clone(window.prestige),
      lifting: clone(window.lifting),
    };
  }

  function restore(stateSnapshot) {
    if (!stateSnapshot) {
      throw new Error("restore requires a snapshot object.");
    }

    if (stateSnapshot.stats) window.stats = clone(stateSnapshot.stats);
    if (stateSnapshot.bodyweight) window.bodyweight = clone(stateSnapshot.bodyweight);
    if (stateSnapshot.upgrades) window.upgrades = clone(stateSnapshot.upgrades);
    if (stateSnapshot.job) window.job = clone(stateSnapshot.job);
    if (stateSnapshot.research) window.research = clone(stateSnapshot.research);
    if (stateSnapshot.checks) window.checks = clone(stateSnapshot.checks);
    if (stateSnapshot.gym) window.gym = clone(stateSnapshot.gym);
    if (stateSnapshot.prestige) window.prestige = clone(stateSnapshot.prestige);
    if (stateSnapshot.lifting) window.lifting = clone(stateSnapshot.lifting);

    return true;
  }

  var api = {
    enableDeterministic: function (seed) {
      var clock = requireClock();
      var random = requireRandom();
      clock.setDeterministicMode(true);
      random.setDeterministicMode(true);
      if (typeof seed !== "undefined") {
        random.setSeed(seed);
      }
      return true;
    },
    disableDeterministic: function () {
      var clock = requireClock();
      var random = requireRandom();
      clock.setDeterministicMode(false);
      random.setDeterministicMode(false);
      return true;
    },
    isDeterministic: function () {
      return requireClock().isDeterministic();
    },
    setSeed: function (seed) {
      return requireRandom().setSeed(seed);
    },
    stepTicks: function (count, msPerTick) {
      var clock = requireClock();
      if (!clock.isDeterministic()) {
        throw new Error("stepTicks requires deterministic mode.");
      }

      var ticks = normalizePositiveInteger(count, 0);
      var tickSize = normalizePositiveNumber(msPerTick, 50);

      for (var i = 0; i < ticks; i += 1) {
        clock.step(tickSize);
      }
      return clock.now();
    },
    fastForward: function (ms, msPerTick) {
      var clock = requireClock();
      if (!clock.isDeterministic()) {
        throw new Error("fastForward requires deterministic mode.");
      }

      var totalMs = normalizePositiveNumber(ms, 0);
      var tickSize = normalizePositiveNumber(msPerTick, 50);
      var ticks = Math.floor(totalMs / tickSize);
      var remainder = totalMs - ticks * tickSize;

      for (var i = 0; i < ticks; i += 1) {
        clock.step(tickSize);
      }
      if (remainder > 0) {
        clock.step(remainder);
      }

      return clock.now();
    },
    setNow: function (ms) {
      return requireClock().setNow(ms);
    },
    now: function () {
      return requireClock().now();
    },
    snapshot: snapshot,
    restore: restore,
  };

  window.__gainzTest = api;
})(window);
