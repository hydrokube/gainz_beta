(function (window) {
  "use strict";

  var deterministic = false;
  var state = 0;
  var originalMathRandom = window.Math.random.bind(window.Math);

  function normalizeSeed(seedValue) {
    var parsed = Number(seedValue);
    if (!Number.isFinite(parsed)) {
      parsed = 1;
    }
    return (parsed >>> 0) || 1;
  }

  function setSeed(seedValue) {
    state = normalizeSeed(seedValue);
    return state;
  }

  function getState() {
    return {
      deterministic: deterministic,
      state: state >>> 0,
    };
  }

  function setState(snapshot) {
    if (!snapshot || typeof snapshot !== "object") {
      throw new Error("GainzRandom.setState requires a snapshot object.");
    }

    if (Object.prototype.hasOwnProperty.call(snapshot, "deterministic")) {
      deterministic = !!snapshot.deterministic;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, "state")) {
      state = normalizeSeed(snapshot.state);
    }

    return getState();
  }

  function nextSeededRandom() {
    state = (state + 0x6D2B79F5) >>> 0;
    var t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function rawRandom() {
    if (!deterministic) {
      return originalMathRandom();
    }
    return nextSeededRandom();
  }

  function random(min, max) {
    if (typeof min === "undefined" && typeof max === "undefined") {
      return rawRandom();
    }

    var normalizedMin = Number(min);
    var normalizedMax = Number(max);

    if (typeof max === "undefined") {
      normalizedMax = normalizedMin;
      normalizedMin = 0;
    }

    return normalizedMin + rawRandom() * (normalizedMax - normalizedMin);
  }

  function setDeterministicMode(enabled) {
    deterministic = !!enabled;
  }

  function installMathRandomHook() {
    if (!window.math || typeof window.math.random !== "function") {
      return;
    }

    window.math.random = function (min, max) {
      return random(min, max);
    };
  }

  var api = {
    isDeterministic: function () {
      return deterministic;
    },
    setDeterministicMode: setDeterministicMode,
    setSeed: setSeed,
    getState: getState,
    setState: setState,
    random: random,
  };

  window.GainzRandom = api;
  window.__gainzRandom = api;

  setSeed(1);
  installMathRandomHook();

  try {
    var params = new URL(window.location.href).searchParams;
    if (params.has("seed")) {
      setSeed(params.get("seed"));
    }
    if (params.get("deterministic") === "1") {
      setDeterministicMode(true);
    }
  } catch (e) {
    // Ignore URL parsing errors and keep default random mode.
  }
})(window);
