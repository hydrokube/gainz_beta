const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "economy-projection-latest.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const BENCHMARK_WINDOWS = {
  layer0FirstPrestigeSeconds: [7 * 3600, 9 * 3600],
  layer1InitialSeconds: [7 * 3600, 9 * 3600],
  layer1MidSeconds: [5 * 3600, 7 * 3600],
  layer1LateSeconds: [4 * 3600, 6 * 3600],
};

const SIM_POLICY = {
  mode: "human_active_5m_policy_buy_all_wait_meta_points",
  waitForMetaPointsBeforePrestige: true,
};

const SIM_MODEL = {
  checkInSeconds: Number(process.env.PROJECTION_CHECKIN_SECONDS || 300),
  fastForwardTickMs: Number(process.env.PROJECTION_TICK_MS || 250),
  buyPasses: Number(process.env.PROJECTION_BUY_PASSES || 2),
  maxMetaHoldSeconds: Number(process.env.PROJECTION_MAX_META_HOLD_SECONDS || 45 * 60),
  maxMetaStallSeconds: Number(process.env.PROJECTION_MAX_META_STALL_SECONDS || 15 * 60),
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function formatTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function formatDuration(seconds) {
  if (seconds == null) {
    return "not reached";
  }
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

function inWindow(value, [min, max]) {
  if (value == null) {
    return false;
  }
  return value >= min && value <= max;
}

function createStaticServer() {
  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT_DIR, relativePath);

    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    fs.stat(filePath, (statErr, stats) => {
      if (statErr || !stats.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not Found");
        return;
      }

      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Internal Server Error");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
        res.end(data);
      });
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(REQUESTED_PORT, HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address != null ? address.port : REQUESTED_PORT;
      resolve({ server, port });
    });
  });
}

async function closeServer(server) {
  if (!server) {
    return;
  }
  await new Promise((resolve) => {
    server.close(() => resolve());
  });
}

async function createInstrumentedPage(browser, port) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const runtimeErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      runtimeErrors.push(`console: ${msg.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    runtimeErrors.push(`pageerror: ${error.message}`);
  });

  await page.route("https://www.googletagmanager.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: "",
      contentType: "application/javascript",
    });
  });

  await page.goto(`http://${HOST}:${port}/?deterministic=1&seed=1337`);
  await page.waitForFunction(() => !!window.__gainzTest && !!window.__gainzClock);
  return { context, page, runtimeErrors };
}

async function runProjection(browser, port) {
  const { context, page, runtimeErrors } = await createInstrumentedPage(browser, port);
  const startedAt = Date.now();
  const perfStart = process.hrtime.bigint();

  const projection = await page.evaluate((simModel) => {
    window.__gainzTest.fastForward(250, 250);
    window.confirm = () => true;
    if (Array.isArray(window.__gainzAssertLog)) {
      window.__gainzAssertLog.length = 0;
    }
    const META_POINT_EPSILON = 1e-6;

    function getPurchasedCount(upgradeArray) {
      let count = 0;
      for (let i = 0; i < upgradeArray.length; i += 1) {
        if (upgradeArray[i].isPurchased) {
          count += 1;
        }
      }
      return count;
    }

    function getTotalPurchasedCount() {
      let total = 0;
      total += getPurchasedCount(upgrades);
      total += getPurchasedCount(bodyweight.upgrades);
      total += getPurchasedCount(job.upgrades);
      total += getPurchasedCount(research.upgrades);
      total += getPurchasedCount(prestige.upgrades);
      total += getPurchasedCount(prestige.bw.upgrades);
      total += getPurchasedCount(prestige.lifting.upgrades);
      total += getPurchasedCount(prestige.bw.confidenceUpgrades || []);
      total += getPurchasedCount(prestige.lifting.leadershipUpgrades || []);

      if (checks.gymType !== -1) {
        total += getPurchasedCount(gym.upgrades);
        total += getPurchasedCount(gym.gymUpgrades);
        total += getPurchasedCount(gym.adUpgrades);
        if (checks.gymType === 0) {
          total += getPurchasedCount(gym.bw.upgrades);
          total += getPurchasedCount(gym.bw.gymUpgrades);
          total += getPurchasedCount(gym.bw.adUpgrades);
        }
        if (checks.gymType === 1) {
          total += getPurchasedCount(gym.lifting.upgrades);
          total += getPurchasedCount(gym.lifting.gymUpgrades);
          total += getPurchasedCount(gym.lifting.adUpgrades);
        }
      }

      const repeatingApi = window.__gainzRepeatingUpgrades;
      if (repeatingApi && repeatingApi.definitions && typeof repeatingApi.getState === "function") {
        const scopes = Object.keys(repeatingApi.definitions);
        for (let scopeIndex = 0; scopeIndex < scopes.length; scopeIndex += 1) {
          const defs = repeatingApi.definitions[scopes[scopeIndex]];
          if (!Array.isArray(defs)) {
            continue;
          }
          for (let i = 0; i < defs.length; i += 1) {
            const state = repeatingApi.getState(defs[i].id);
            total += Math.max(0, Number(state?.level) || 0);
          }
        }
      }

      return total;
    }

    function buyRepeatingPass() {
      const repeatingApi = window.__gainzRepeatingUpgrades;
      if (!repeatingApi || !repeatingApi.definitions || typeof repeatingUpgradeClick !== "function") {
        return;
      }

      const scopes = ["global", "bodyweight", "lifting", "confidence", "leadership"];
      for (let scopeIndex = 0; scopeIndex < scopes.length; scopeIndex += 1) {
        const defs = repeatingApi.definitions[scopes[scopeIndex]];
        if (!Array.isArray(defs)) {
          continue;
        }
        for (let i = 0; i < defs.length; i += 1) {
          repeatingUpgradeClick(scopes[scopeIndex], defs[i].id);
        }
      }
    }

    function refreshPurchaseStates() {
      if (checks.gymType === -1) {
        checkUpgradeDisable(upgrades, stats.money, "upgrade", false);
        checkUpgradeDisable(bodyweight.upgrades, stats.money, "bwUpgrade", false);
        checkUpgradeDisable(job.upgrades, job.followers, "jobUpgrade", true);
        checkUpgradeDisable(research.upgrades, research.points, "resUpgrade", false);
      }

      checkPrestigeUpgradeDisable(prestige.upgrades, prestige.current, "globalUpgrade");
      checkPrestigeUpgradeDisable(prestige.bw.upgrades, prestige.bw.current, "globalBwUpgrade");
      checkPrestigeUpgradeDisable(prestige.lifting.upgrades, prestige.lifting.current, "globalLiftingUpgrade");
      checkPrestigeUpgradeDisable(
        prestige.bw.confidenceUpgrades || [],
        prestige.bw.confidence,
        "confidenceUpgrade",
      );
      checkPrestigeUpgradeDisable(
        prestige.lifting.leadershipUpgrades || [],
        prestige.lifting.leadership,
        "leadershipUpgrade",
      );

      if (checks.gymType !== -1) {
        checkUpgradeDisable(gym.upgrades, stats.money, "upgrade", false);
        checkUpgradeDisable(gym.gymUpgrades, stats.money, "gymUpgrade", false);
        checkUpgradeDisable(gym.adUpgrades, gym.advertising.influence, "adUpgrade", false);

        if (checks.gymType === 0) {
          checkUpgradeDisable(gym.bw.upgrades, stats.money, "bwUpgrade", false);
          checkUpgradeDisable(gym.bw.gymUpgrades, stats.money, "gymBwUpgrade", false);
          checkUpgradeDisable(gym.bw.adUpgrades, gym.advertising.influence, "adBwUpgrade", false);
        }

        if (checks.gymType === 1) {
          checkUpgradeDisable(gym.lifting.upgrades, stats.money, "liftingUpgrade", false);
          checkUpgradeDisable(gym.lifting.gymUpgrades, stats.money, "gymLiftingUpgrade", false);
          checkUpgradeDisable(gym.lifting.adUpgrades, gym.advertising.influence, "adLiftingUpgrade", false);

          checkLiftingCompDisable(lifting.comps.conferences, "liftingLocalConference", null, null);
          checkLiftingCompDisable(
            lifting.comps.regionalConferences,
            "liftingRegionalConference",
            lifting.comps.conferences,
            "liftingLocalConference",
          );
          checkLiftingCompDisable(
            lifting.comps.stateConferences,
            "liftingStateConference",
            lifting.comps.regionalConferences,
            "liftingRegionalConference",
          );
          checkLiftingCompDisable(
            lifting.comps.nationalConferences,
            "liftingNationalConference",
            lifting.comps.stateConferences,
            "liftingStateConference",
          );
          checkLiftingCompDisable(
            lifting.comps.worldConferences,
            "liftingWorldConference",
            lifting.comps.nationalConferences,
            "liftingNationalConference",
          );
        }

        checkEmployeeDisable(gym.employees.sales, stats.money, "sales");
        checkEmployeeDisable(gym.employees.trainers, stats.money, "trainer");
        checkEmployeeDisable(gym.employees.coordinators, stats.money, "coordinator");
        checkEmployeeDisable(gym.employees.nutritionists, stats.money, "nutritionist");
        checkEmployeeDisable(gym.advertising.employees.coordinators, stats.money, "adCoordinator");
        checkEmployeeDisable(gym.advertising.employees.designers, stats.money, "designer");
        checkEmployeeDisable(gym.advertising.employees.managers, stats.money, "manager");
      }
    }

    function buyAvailablePass() {
      if (checks.gymType === -1) {
        autobuyUpgrades(upgrades, "upgrade", stats.money);
        autobuyUpgrades(bodyweight.upgrades, "bwUpgrade", stats.money);
        autobuyUpgrades(job.upgrades, "jobUpgrade", job.followers);
        autobuyUpgrades(research.upgrades, "resUpgrade", research.points);
      }

      autobuyUpgrades(prestige.upgrades, "globalUpgrade", prestige.current);
      autobuyUpgrades(prestige.bw.upgrades, "globalBwUpgrade", prestige.bw.current);
      autobuyUpgrades(prestige.lifting.upgrades, "globalLiftingUpgrade", prestige.lifting.current);
      autobuyUpgrades(
        prestige.bw.confidenceUpgrades || [],
        "confidenceUpgrade",
        prestige.bw.confidence,
      );
      autobuyUpgrades(
        prestige.lifting.leadershipUpgrades || [],
        "leadershipUpgrade",
        prestige.lifting.leadership,
      );

      if (checks.gymType !== -1) {
        autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
        autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
        autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);

        if (checks.gymType === 0) {
          autobuyUpgrades(gym.bw.upgrades, "bwUpgrade", stats.money);
          autobuyUpgrades(gym.bw.gymUpgrades, "gymBwUpgrade", stats.money);
          autobuyUpgrades(gym.bw.adUpgrades, "adBwUpgrade", gym.advertising.influence);
          if (!$("#gangFightBtn").hasClass("disabled")) {
            $("#gangFightBtn").click();
          }
        }

        if (checks.gymType === 1) {
          autobuyUpgrades(gym.lifting.upgrades, "liftingUpgrade", stats.money);
          autobuyUpgrades(gym.lifting.gymUpgrades, "gymLiftingUpgrade", stats.money);
          autobuyUpgrades(gym.lifting.adUpgrades, "adLiftingUpgrade", gym.advertising.influence);
          autobuyConferences(lifting.comps.worldConferences, "liftingWorldConferenceBtn");
          autobuyConferences(lifting.comps.nationalConferences, "liftingNationalConferenceBtn");
          autobuyConferences(lifting.comps.stateConferences, "liftingStateConferenceBtn");
          autobuyConferences(lifting.comps.regionalConferences, "liftingRegionalConferenceBtn");
          autobuyConferences(lifting.comps.conferences, "liftingLocalConferenceBtn");
          if (!$("#createCompBtn").hasClass("disabled") && !$("#createCompBtn").hasClass("d-none")) {
            $("#createCompBtn").click();
          }
        }

        autobuyEmployees(gym.employees.sales, "salesBtn");
        autobuyEmployees(gym.employees.trainers, "trainerBtn");
        autobuyEmployees(gym.employees.coordinators, "coordinatorBtn");
        autobuyEmployees(gym.employees.nutritionists, "nutritionistBtn");
        autobuyEmployees(gym.advertising.employees.coordinators, "adCoordinatorBtn");
        autobuyEmployees(gym.advertising.employees.designers, "designerBtn");
        autobuyEmployees(gym.advertising.employees.managers, "managerBtn");
      }
    }

    function runBurst() {
      for (let loops = 0; loops < simModel.buyPasses; loops += 1) {
        const purchasedBefore = getTotalPurchasedCount();
        refreshPurchaseStates();
        buyAvailablePass();
        const purchasedAfter = getTotalPurchasedCount();
        if (purchasedAfter <= purchasedBefore) {
          break;
        }
      }

      if (!$("#coffeeBtn").hasClass("disabled")) {
        $("#coffeeBtn").click();
      }
      if (!$("#payDayBtn").hasClass("disabled")) {
        $("#payDayBtn").click();
      }

      buyRepeatingPass();
    }

    function hasGangUnlock() {
      return (
        Array.isArray(prestige.bw.upgrades) &&
        prestige.bw.upgrades.some((upgrade) => upgrade.id === 0 && upgrade.isPurchased)
      );
    }

    function hasCompetitionUnlock() {
      return (
        Array.isArray(prestige.lifting.upgrades) &&
        prestige.lifting.upgrades.some((upgrade) => upgrade.id === 0 && upgrade.isPurchased)
      );
    }

    function shouldHoldForMetaPoints() {
      if (!checks.isPrestige) {
        return false;
      }

      if (checks.gymType === 0 && hasGangUnlock()) {
        return bodyweight.gang.rivals.some((rival) => !rival.isAbsorbed);
      }

      if (checks.gymType === 1 && hasCompetitionUnlock()) {
        return lifting.comps.worldConferences.current < 10;
      }

      return false;
    }

    function getMetaProgressMetric() {
      if (checks.gymType === 0 && hasGangUnlock()) {
        const absorbed = bodyweight.gang.rivals.filter((rival) => rival.isAbsorbed).length;
        return absorbed + prestige.bw.confidence;
      }

      if (checks.gymType === 1 && hasCompetitionUnlock()) {
        return lifting.comps.worldConferences.current + prestige.lifting.leadership;
      }

      return 0;
    }

    function runUntilPrestige(maxSeconds) {
      let elapsed = 0;
      let readySince = null;
      let lastMetaProgressAt = null;
      let lastMetaMetric = null;
      const maxMetaHoldSeconds = simModel.maxMetaHoldSeconds;
      const maxMetaStallSeconds = simModel.maxMetaStallSeconds;
      runBurst();
      while (elapsed < maxSeconds) {
        if (checks.isPrestige) {
          let shouldWaitForMeta = shouldHoldForMetaPoints();
          if (!shouldWaitForMeta) {
            return elapsed;
          }

          if (readySince == null) {
            readySince = elapsed;
            lastMetaProgressAt = elapsed;
            lastMetaMetric = getMetaProgressMetric();
          }
          else {
            let nextMetric = getMetaProgressMetric();
            if (nextMetric > lastMetaMetric + META_POINT_EPSILON) {
              lastMetaMetric = nextMetric;
              lastMetaProgressAt = elapsed;
            }

            let heldFor = elapsed - readySince;
            let stalledFor = elapsed - lastMetaProgressAt;
            if (heldFor >= maxMetaHoldSeconds || stalledFor >= maxMetaStallSeconds) {
              return elapsed;
            }
          }
        }
        else {
          readySince = null;
          lastMetaProgressAt = null;
          lastMetaMetric = null;
        }

        window.__gainzTest.fastForward(simModel.checkInSeconds * 1000, simModel.fastForwardTickMs);
        elapsed += simModel.checkInSeconds;
        runBurst();
      }
      return null;
    }

    const firstLayer0 = runUntilPrestige(12 * 3600);
    if (firstLayer0 == null) {
      assertValidState("economy_projection_final", { strict: true });
      return {
        firstLayer0: null,
        layer1Run1: null,
        layer1Run2: null,
        layer1Run3: null,
        finalGymType: checks.gymType,
        layer1PrestigeUnlockPurchased:
          Array.isArray(gym.adUpgrades) &&
          gym.adUpgrades.some((upgrade) => upgrade.id === 14 && upgrade.isPurchased),
        finalPreviews: {
          global: calculateGlobalPrestigeGain(),
          bodyweight: calculateBodyweightPrestigeGain(),
          lifting: calculateLiftingPrestigeGain(),
        },
        prestigeTotals: {
          global: prestige.total,
          bodyweight: prestige.bw.total,
          lifting: prestige.lifting.total,
        },
        assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
        firstAssertion:
          Array.isArray(window.__gainzAssertLog) && window.__gainzAssertLog.length > 0
            ? window.__gainzAssertLog[0]
            : null,
        policy: {
          waitForMetaPointsBeforePrestige: true,
        },
      };
    }

    newGym(0);
    const layer1Run1 = runUntilPrestige(10 * 3600);

    let layer1Run2 = null;
    let layer1Run3 = null;
    if (layer1Run1 != null) {
      newGym(0);
      layer1Run2 = runUntilPrestige(8 * 3600);
    }
    if (layer1Run2 != null) {
      newGym(0);
      layer1Run3 = runUntilPrestige(6 * 3600);
    }

    assertValidState("economy_projection_final", { strict: true });

    return {
      firstLayer0,
      layer1Run1,
      layer1Run2,
      layer1Run3,
      finalGymType: checks.gymType,
      layer1PrestigeUnlockPurchased:
        Array.isArray(gym.adUpgrades) &&
        gym.adUpgrades.some((upgrade) => upgrade.id === 14 && upgrade.isPurchased),
      finalPreviews: {
        global: calculateGlobalPrestigeGain(),
        bodyweight: calculateBodyweightPrestigeGain(),
        lifting: calculateLiftingPrestigeGain(),
      },
      prestigeTotals: {
        global: prestige.total,
        bodyweight: prestige.bw.total,
        lifting: prestige.lifting.total,
      },
      assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
      firstAssertion:
        Array.isArray(window.__gainzAssertLog) && window.__gainzAssertLog.length > 0
          ? window.__gainzAssertLog[0]
          : null,
      model: simModel,
      policy: {
        waitForMetaPointsBeforePrestige: true,
      },
    };
  }, SIM_MODEL);

  const perfEnd = process.hrtime.bigint();
  const endedAt = Date.now();
  await context.close();

  return {
    startedAt,
    endedAt,
    wallClockElapsedMs: Number(perfEnd - perfStart) / 1_000_000,
    runtimeErrors,
    projection,
  };
}

function buildBenchmarkResults(projection) {
  return [
    {
      id: "layer0_first_prestige_active",
      label: "Layer 0 first prestige (human-active 5m policy)",
      actualSeconds: projection.firstLayer0,
      expectedWindowSeconds: BENCHMARK_WINDOWS.layer0FirstPrestigeSeconds,
      passed: inWindow(projection.firstLayer0, BENCHMARK_WINDOWS.layer0FirstPrestigeSeconds),
    },
    {
      id: "layer1_initial_active",
      label: "Layer 1 initial prestige run (human-active 5m policy)",
      actualSeconds: projection.layer1Run1,
      expectedWindowSeconds: BENCHMARK_WINDOWS.layer1InitialSeconds,
      passed: inWindow(projection.layer1Run1, BENCHMARK_WINDOWS.layer1InitialSeconds),
    },
    {
      id: "layer1_mid_active",
      label: "Layer 1 second prestige run (human-active 5m policy)",
      actualSeconds: projection.layer1Run2,
      expectedWindowSeconds: BENCHMARK_WINDOWS.layer1MidSeconds,
      passed: inWindow(projection.layer1Run2, BENCHMARK_WINDOWS.layer1MidSeconds),
    },
    {
      id: "layer1_late_active",
      label: "Layer 1 third prestige run (human-active 5m policy)",
      actualSeconds: projection.layer1Run3,
      expectedWindowSeconds: BENCHMARK_WINDOWS.layer1LateSeconds,
      passed: inWindow(projection.layer1Run3, BENCHMARK_WINDOWS.layer1LateSeconds),
    },
  ];
}

function buildSafeguardResults(runResult) {
  return [
    {
      id: "assertion_log_clear",
      label: "No invalid-state assertions during projection",
      actual: runResult.projection.assertionCount,
      expected: 0,
      passed: runResult.projection.assertionCount === 0,
      firstIssue: runResult.projection.firstAssertion,
    },
    {
      id: "runtime_error_free",
      label: "No runtime console/page errors during projection",
      actual: runResult.runtimeErrors.length,
      expected: 0,
      passed: runResult.runtimeErrors.length === 0,
      firstIssue: runResult.runtimeErrors.length > 0 ? runResult.runtimeErrors[0] : null,
    },
  ];
}

function summarizeForConsole(runResult, benchmarks) {
  return {
    layer0First: formatDuration(runResult.projection.firstLayer0),
    layer1Run1: formatDuration(runResult.projection.layer1Run1),
    layer1Run2: formatDuration(runResult.projection.layer1Run2),
    layer1Run3: formatDuration(runResult.projection.layer1Run3),
    wallClockMs: Number(runResult.wallClockElapsedMs.toFixed(2)),
    benchmarkPasses: benchmarks.filter((benchmark) => benchmark.passed).length,
    benchmarkTotal: benchmarks.length,
    runtimeErrors: runResult.runtimeErrors.length,
  };
}

async function main() {
  ensureDir(REPORT_DIR);

  const serverInfo = await createStaticServer();
  const server = serverInfo.server;
  const port = serverInfo.port;
  const browser = await chromium.launch({ headless: true });

  let runResult;
  try {
    runResult = await runProjection(browser, port);
  } finally {
    await browser.close();
    await closeServer(server);
  }

  const benchmarks = buildBenchmarkResults(runResult.projection);
  const safeguards = buildSafeguardResults(runResult);
  const report = {
    generatedAt: new Date().toISOString(),
    scenario: SIM_POLICY.mode,
    policy: SIM_POLICY,
    model: SIM_MODEL,
    windows: BENCHMARK_WINDOWS,
    run: runResult,
    benchmarks,
    safeguards,
  };

  const timestampedPath = path.join(
    REPORT_DIR,
    `economy-projection-${formatTimestamp(new Date())}.json`,
  );

  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Economy Projection Summary");
  console.table([summarizeForConsole(runResult, benchmarks)]);
  console.log("Benchmark Results");
  console.table(
    benchmarks.map((benchmark) => ({
      benchmark: benchmark.label,
      actual: formatDuration(benchmark.actualSeconds),
      expected: `${formatDuration(benchmark.expectedWindowSeconds[0])} - ${formatDuration(benchmark.expectedWindowSeconds[1])}`,
      passed: benchmark.passed,
    })),
  );
  console.log("Safeguard Results");
  console.table(
    safeguards.map((check) => ({
      safeguard: check.label,
      actual: check.actual,
      expected: check.expected,
      passed: check.passed,
    })),
  );
  console.log(`Report written: ${timestampedPath}`);
  console.log(`Latest report: ${LATEST_REPORT_PATH}`);

  const hasBenchmarkFailure = benchmarks.some((benchmark) => !benchmark.passed);
  const hasSafeguardFailure = safeguards.some((check) => !check.passed);
  if (hasBenchmarkFailure || hasSafeguardFailure) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
