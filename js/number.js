(function (window) {
  "use strict";

  var sourceMath = window.math || null;
  var REQUIRED_BACKEND_METHODS = [
    "evaluate",
    "add",
    "sub",
    "mul",
    "div",
    "pow",
    "log10",
    "min",
    "max",
    "abs",
    "floor",
    "format",
    "random",
  ];

  function toNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (value == null) {
      return 0;
    }

    if (typeof value === "string" && value.trim() === "") {
      return 0;
    }

    var parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return parsed;
  }

  function normalizeScientificFormat(value) {
    return String(value).replace(/e\+/g, "e");
  }

  function createNumberBackend() {
    return {
      name: "number",
      evaluate: function (expression, scope) {
        if (typeof expression === "number") {
          return toNumber(expression);
        }

        if (typeof expression === "string" && sourceMath && typeof sourceMath.evaluate === "function") {
          try {
            return toNumber(sourceMath.evaluate(expression, scope));
          } catch (ex) {
            return 0;
          }
        }

        return toNumber(expression);
      },
      add: function (a, b) {
        return toNumber(a) + toNumber(b);
      },
      sub: function (a, b) {
        return toNumber(a) - toNumber(b);
      },
      mul: function (a, b) {
        return toNumber(a) * toNumber(b);
      },
      div: function (a, b) {
        var denominator = toNumber(b);
        if (denominator === 0) {
          return 0;
        }
        return toNumber(a) / denominator;
      },
      pow: function (a, b) {
        return Math.pow(toNumber(a), toNumber(b));
      },
      log10: function (value) {
        var normalized = toNumber(value);
        if (normalized <= 0) {
          return 0;
        }
        return Math.log10(normalized);
      },
      min: function (a, b) {
        return Math.min(toNumber(a), toNumber(b));
      },
      max: function (a, b) {
        return Math.max(toNumber(a), toNumber(b));
      },
      abs: function (value) {
        return Math.abs(toNumber(value));
      },
      floor: function (value) {
        return Math.floor(toNumber(value));
      },
      format: function (value, precision) {
        if (sourceMath && typeof sourceMath.format === "function") {
          try {
            return normalizeScientificFormat(sourceMath.format(toNumber(value), precision));
          } catch (ex) {
            // Fall through to native formatting.
          }
        }

        var digits = typeof precision === "number" ? precision : 3;
        return normalizeScientificFormat(toNumber(value).toExponential(digits));
      },
      random: function (min, max) {
        if (window.__gainzRandom && typeof window.__gainzRandom.random === "function") {
          return window.__gainzRandom.random(min, max);
        }

        if (sourceMath && typeof sourceMath.random === "function") {
          return sourceMath.random(min, max);
        }

        if (typeof min === "undefined" && typeof max === "undefined") {
          return Math.random();
        }

        var normalizedMin = toNumber(min);
        var normalizedMax = toNumber(max);

        if (typeof max === "undefined") {
          normalizedMax = normalizedMin;
          normalizedMin = 0;
        }

        return normalizedMin + (Math.random() * (normalizedMax - normalizedMin));
      },
    };
  }

  function createDecimalBackend() {
    var DecimalCtor = window.Decimal;
    if (typeof DecimalCtor !== "function") {
      return null;
    }

    var maxNumberDecimal = DecimalCtor.fromNumber(Number.MAX_VALUE);
    var minNumberDecimal = DecimalCtor.fromNumber(-Number.MAX_VALUE);

    function decimalFrom(value) {
      if (value instanceof DecimalCtor) {
        return value;
      }

      if (value == null || (typeof value === "string" && value.trim() === "")) {
        return new DecimalCtor(0);
      }

      if (typeof DecimalCtor.fromValue_noAlloc === "function") {
        return DecimalCtor.fromValue_noAlloc(value);
      }

      return new DecimalCtor(value);
    }

    function decimalToNumberSafe(value) {
      var decimalValue = decimalFrom(value);

      if (decimalValue.neq(decimalValue)) {
        return 0;
      }

      if (decimalValue.gt(maxNumberDecimal)) {
        return Number.MAX_VALUE;
      }

      if (decimalValue.lt(minNumberDecimal)) {
        return -Number.MAX_VALUE;
      }

      var numericValue = decimalValue.toNumber();
      if (Number.isFinite(numericValue)) {
        return numericValue;
      }

      return decimalValue.sign() >= 0 ? Number.MAX_VALUE : -Number.MAX_VALUE;
    }

    function decimalRandom(min, max) {
      if (window.__gainzRandom && typeof window.__gainzRandom.random === "function") {
        return window.__gainzRandom.random(min, max);
      }

      if (sourceMath && typeof sourceMath.random === "function") {
        return sourceMath.random(min, max);
      }

      if (typeof min === "undefined" && typeof max === "undefined") {
        return Math.random();
      }

      var normalizedMin = toNumber(min);
      var normalizedMax = toNumber(max);

      if (typeof max === "undefined") {
        normalizedMax = normalizedMin;
        normalizedMin = 0;
      }

      return normalizedMin + (Math.random() * (normalizedMax - normalizedMin));
    }

    return {
      name: "break_infinity",
      evaluate: function (expression, scope) {
        if (typeof expression === "string" && sourceMath && typeof sourceMath.evaluate === "function") {
          try {
            return decimalToNumberSafe(sourceMath.evaluate(expression, scope));
          } catch (ex) {
            return 0;
          }
        }

        return decimalToNumberSafe(expression);
      },
      add: function (a, b) {
        return decimalToNumberSafe(decimalFrom(a).add(decimalFrom(b)));
      },
      sub: function (a, b) {
        return decimalToNumberSafe(decimalFrom(a).sub(decimalFrom(b)));
      },
      mul: function (a, b) {
        return decimalToNumberSafe(decimalFrom(a).mul(decimalFrom(b)));
      },
      div: function (a, b) {
        var denominator = decimalFrom(b);
        if (denominator.eq(0)) {
          return 0;
        }
        return decimalToNumberSafe(decimalFrom(a).div(denominator));
      },
      pow: function (a, b) {
        return decimalToNumberSafe(decimalFrom(a).pow(decimalFrom(b)));
      },
      log10: function (value) {
        var normalized = decimalFrom(value);
        if (normalized.lte(0)) {
          return 0;
        }
        return toNumber(normalized.log10());
      },
      min: function (a, b) {
        return decimalToNumberSafe(decimalFrom(a).min(decimalFrom(b)));
      },
      max: function (a, b) {
        return decimalToNumberSafe(decimalFrom(a).max(decimalFrom(b)));
      },
      abs: function (value) {
        return decimalToNumberSafe(decimalFrom(value).abs());
      },
      floor: function (value) {
        return decimalToNumberSafe(decimalFrom(value).floor());
      },
      format: function (value, precision) {
        var decimalValue = decimalFrom(value);
        var digits = typeof precision === "number" ? precision : 3;

        if (sourceMath && typeof sourceMath.format === "function" && decimalValue.abs().lte(maxNumberDecimal)) {
          try {
            return normalizeScientificFormat(sourceMath.format(decimalValue.toNumber(), precision));
          } catch (ex) {
            // Fall through to Decimal exponential formatting.
          }
        }

        return normalizeScientificFormat(decimalValue.toExponential(digits));
      },
      random: decimalRandom,
    };
  }

  function validateBackend(nextBackend) {
    if (!nextBackend || typeof nextBackend !== "object") {
      throw new Error("GainzMath backend must be an object.");
    }

    for (var i = 0; i < REQUIRED_BACKEND_METHODS.length; i += 1) {
      var method = REQUIRED_BACKEND_METHODS[i];
      if (typeof nextBackend[method] !== "function") {
        throw new Error("GainzMath backend is missing method '" + method + "'.");
      }
    }
  }

  var activeBackend = createDecimalBackend() || createNumberBackend();

  function callBackend(methodName, args) {
    return activeBackend[methodName].apply(activeBackend, args);
  }

  var api = {
    getBackendName: function () {
      return activeBackend.name || "custom";
    },
    setBackend: function (nextBackend) {
      validateBackend(nextBackend);
      activeBackend = nextBackend;
      return api.getBackendName();
    },
    toNumber: toNumber,
    evaluate: function (expression, scope) {
      return callBackend("evaluate", [expression, scope]);
    },
    eval: function (expression, scope) {
      return callBackend("evaluate", [expression, scope]);
    },
    add: function (a, b) {
      return callBackend("add", [a, b]);
    },
    sub: function (a, b) {
      return callBackend("sub", [a, b]);
    },
    mul: function (a, b) {
      return callBackend("mul", [a, b]);
    },
    div: function (a, b) {
      return callBackend("div", [a, b]);
    },
    pow: function (a, b) {
      return callBackend("pow", [a, b]);
    },
    log10: function (value) {
      return callBackend("log10", [value]);
    },
    min: function (a, b) {
      return callBackend("min", [a, b]);
    },
    max: function (a, b) {
      return callBackend("max", [a, b]);
    },
    abs: function (value) {
      return callBackend("abs", [value]);
    },
    floor: function (value) {
      return callBackend("floor", [value]);
    },
    format: function (value, precision) {
      return callBackend("format", [value, precision]);
    },
    random: function (min, max) {
      return callBackend("random", [min, max]);
    },
  };

  window.gainzMath = api;
})(window);
