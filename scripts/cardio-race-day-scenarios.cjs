const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "cardio-race-day-scenarios-latest.json");

const SIM_CONFIG = {
  stepSeconds: Number(process.env.CARDIO_SCENARIO_STEP_SECONDS || 300),
  checkInPasses: Number(process.env.CARDIO_SCENARIO_CHECKIN_PASSES || 4),
  fastForwardTickMs: Number(process.env.CARDIO_SCENARIO_TICK_MS || 20000),
};
const SCENARIO_MAX_SECONDS = Number(process.env.CARDIO_SCENARIO_MAX_SECONDS || 12 * 60 * 60);

const SCENARIOS = [
  {
    key: "fresh_unlock",
    label: "Fresh cardio unlock",
    maxSeconds: SCENARIO_MAX_SECONDS,
  },
  {
    key: "mid_progress",
    label: "Mid cardio progression",
    maxSeconds: SCENARIO_MAX_SECONDS,
  },
  {
    key: "max_content",
    label: "End of content",
    maxSeconds: SCENARIO_MAX_SECONDS,
  },
];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
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

  await page.goto(`http://${HOST}:${port}/?deterministic=1&seed=24680`);
  await page.waitForFunction(() => !!window.__gainzTest && !!window.__gainzClock);
  return { context, page, runtimeErrors };
}

async function runScenario(page, scenario, simConfig) {
  return page.evaluate(({ scenario, simConfig }) => {
    window.__gainzTest.fastForward(250, 250);
    window.confirm = () => true;
    if (Array.isArray(window.__gainzAssertLog)) {
      window.__gainzAssertLog.length = 0;
    }

    if (typeof refreshId !== "undefined" && refreshId != null) {
      clearInterval(refreshId);
      refreshId = null;
    }

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function range(start, endInclusive) {
      const values = [];
      for (let i = start; i <= endInclusive; i += 1) {
        values.push(i);
      }
      return values;
    }

    function setPurchasedByIds(upgradeArray, ids) {
      if (!Array.isArray(upgradeArray)) {
        return;
      }
      const allowed = new Set(ids);
      for (let i = 0; i < upgradeArray.length; i += 1) {
        upgradeArray[i].isPurchased = allowed.has(upgradeArray[i].id);
      }
    }

    function setPurchasedAll(upgradeArray) {
      if (!Array.isArray(upgradeArray)) {
        return;
      }
      for (let i = 0; i < upgradeArray.length; i += 1) {
        upgradeArray[i].isPurchased = true;
      }
    }

    function resetToCardioRunState() {
      stats = clone(baseStats);
      bodyweight = clone(baseBodyweight);
      upgrades = clone(baseUpgrades);
      job = clone(baseJob);
      research = clone(baseResearch);
      gym = clone(baseGym);
      lifting = clone(baseLifting);
      yoga = clone(baseYoga);
      cardio = clone(baseCardio);
      prestige = clone(basePrestige);
      checks = clone(baseChecks);

      checks.gymType = 3;
      checks.isPrestige = false;
      checks.debug = false;
      checks.debugSpeedApplied = false;
      stats.repeatingUpgrades = {};

      loadReset();
      load(null, true, false);
    }

    function configureScenario() {
      resetToCardioRunState();

      if (scenario.key === "fresh_unlock") {
        // Approximate the first cardio run shortly after the branch unlocks:
        // prior gyms are established, but cardio-specific pacing tools are still sparse.
        prestige.total = 18;
        prestige.current = 0;
        prestige.bw.total = 6;
        prestige.bw.current = 0;
        prestige.lifting.total = 6;
        prestige.lifting.current = 0;
        prestige.yoga.total = 4;
        prestige.yoga.current = 0;
        prestige.cardio.total = 1;
        prestige.cardio.current = 0;

        setPurchasedByIds(prestige.upgrades, range(0, 32).concat([33, 43]));
        setPurchasedByIds(prestige.bw.upgrades, range(0, 10));
        setPurchasedByIds(prestige.lifting.upgrades, range(0, 10));
        setPurchasedByIds(prestige.yoga.upgrades, range(0, 8));
        setPurchasedByIds(prestige.cardio.upgrades, [0]);
        setPurchasedByIds(prestige.bw.confidenceUpgrades || [], [0]);
        setPurchasedByIds(prestige.lifting.leadershipUpgrades || [], [0]);
        setPurchasedByIds(prestige.yoga.flowUpgrades || [], []);
        setPurchasedByIds(prestige.cardio.paceUpgrades || [], []);
      }
      else if (scenario.key === "mid_progress") {
        prestige.total = 30;
        prestige.current = 0;
        prestige.bw.total = 10;
        prestige.bw.current = 0;
        prestige.lifting.total = 10;
        prestige.lifting.current = 0;
        prestige.yoga.total = 8;
        prestige.yoga.current = 0;
        prestige.cardio.total = 7;
        prestige.cardio.current = 0;

        setPurchasedByIds(prestige.upgrades, range(0, 40).concat([43]));
        setPurchasedByIds(prestige.bw.upgrades, range(0, 18));
        setPurchasedByIds(prestige.lifting.upgrades, range(0, 18));
        setPurchasedByIds(prestige.yoga.upgrades, range(0, 17));
        setPurchasedByIds(prestige.cardio.upgrades, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17]);
        setPurchasedByIds(prestige.bw.confidenceUpgrades || [], [0, 1, 2]);
        setPurchasedByIds(prestige.lifting.leadershipUpgrades || [], [0, 1, 2]);
        setPurchasedByIds(prestige.yoga.flowUpgrades || [], [0, 1, 2]);
        setPurchasedByIds(prestige.cardio.paceUpgrades || [], [0, 1, 2]);
      }
      else {
        prestige.total = 42;
        prestige.current = 0;
        prestige.bw.total = 14;
        prestige.bw.current = 0;
        prestige.lifting.total = 14;
        prestige.lifting.current = 0;
        prestige.yoga.total = 14;
        prestige.yoga.current = 0;
        prestige.cardio.total = 14;
        prestige.cardio.current = 0;

        setPurchasedAll(prestige.upgrades);
        setPurchasedAll(prestige.bw.upgrades);
        setPurchasedAll(prestige.lifting.upgrades);
        setPurchasedAll(prestige.yoga.upgrades);
        setPurchasedAll(prestige.cardio.upgrades);
        setPurchasedAll(prestige.bw.confidenceUpgrades || []);
        setPurchasedAll(prestige.lifting.leadershipUpgrades || []);
        setPurchasedAll(prestige.yoga.flowUpgrades || []);
        setPurchasedAll(prestige.cardio.paceUpgrades || []);

        if (typeof window.__gainzRepeatingUpgrades?.ensureInitialized === "function") {
          window.__gainzRepeatingUpgrades.ensureInitialized();
        }
        const repeatState = stats.repeatingUpgrades || {};
        if (repeatState.bodyweight_street_tempo) {
          repeatState.bodyweight_street_tempo.level = 8;
        }
        if (repeatState.global_franchise_tempo) {
          repeatState.global_franchise_tempo.level = 8;
        }
        if (repeatState.lifting_rep_reclamation) {
          repeatState.lifting_rep_reclamation.level = 8;
        }
        if (repeatState.flow_resonance_stack) {
          repeatState.flow_resonance_stack.level = 6;
        }
        if (repeatState.global_market_engine) {
          repeatState.global_market_engine.level = 6;
        }
        if (repeatState.global_recovery_grid) {
          repeatState.global_recovery_grid.level = 6;
        }
        if (repeatState.cardio_endurance_engine) {
          repeatState.cardio_endurance_engine.level = 6;
        }
        if (repeatState.pace_negative_split) {
          repeatState.pace_negative_split.level = 6;
        }
      }

      reapplyPrestige(prestige.upgrades, "globalUpgrade", -1);
      reapplyPrestige(prestige.bw.upgrades, "globalBwUpgrade", 0);
      reapplyPrestige(prestige.lifting.upgrades, "globalLiftingUpgrade", 1);
      reapplyPrestige(prestige.yoga.upgrades, "globalYogaUpgrade", 2);
      reapplyPrestige(prestige.cardio.upgrades, "globalCardioUpgrade", 3);

      updatePrestigeValues();
      updateAutobuyerToggles();
    }

    function refreshPurchaseStates() {
      checkUpgradeDisable(gym.upgrades, stats.money, "upgrade", false);
      checkUpgradeDisable(gym.gymUpgrades, stats.money, "gymUpgrade", false);
      checkUpgradeDisable(gym.adUpgrades, gym.advertising.influence, "adUpgrade", false);
      checkUpgradeDisable(gym.cardio.upgrades, stats.money, "cardioUpgrade", false);
      checkUpgradeDisable(gym.cardio.gymUpgrades, stats.money, "gymCardioUpgrade", false);
      checkUpgradeDisable(gym.cardio.adUpgrades, gym.advertising.influence, "adCardioUpgrade", false);
      checkEmployeeDisable(gym.employees.sales, stats.money, "sales");
      checkEmployeeDisable(gym.employees.trainers, stats.money, "trainer");
      checkEmployeeDisable(gym.employees.coordinators, stats.money, "coordinator");
      checkEmployeeDisable(gym.employees.nutritionists, stats.money, "nutritionist");
      checkEmployeeDisable(gym.advertising.employees.coordinators, stats.money, "adCoordinator");
      checkEmployeeDisable(gym.advertising.employees.designers, stats.money, "designer");
      checkEmployeeDisable(gym.advertising.employees.managers, stats.money, "manager");
      checkPrestigeUpgradeDisable(prestige.cardio.paceUpgrades || [], prestige.cardio.pace, "paceUpgrade");
    }

    function getPreferredCardioRaceIndex(intervalState) {
      if (hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 17) || hasPurchasedPrestigeUpgrade(prestige.cardio.paceUpgrades || [], 4)) {
        return 2;
      }
      if (hasPurchasedPrestigeUpgrade(prestige.cardio.paceUpgrades || [], 3) || (intervalState.runEarned || 0) > 0.55) {
        return 1;
      }
      return 0;
    }

    function runCardioRaceManualPass() {
      if (checks.gymType !== 3 || !hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 0)) {
        return;
      }

      const intervalState = ensureCardioIntervalState();
      if (intervalState.activeRaceId === "") {
        selectCardioRace(getPreferredCardioRaceIndex(intervalState), false);
        return;
      }

      const lead = Math.max(intervalState.rival1Progress || 0, intervalState.rival2Progress || 0);
      const gap = lead - (intervalState.playerProgress || 0);
      if ((intervalState.fatigue || 0) > 0.72) {
        recoverCardioRace();
        return;
      }
      if (gap > 0.06) {
        pushCardioRace();
        return;
      }
      settleCardioRace();
    }

    function buyAvailablePass() {
      autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
      autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
      autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
      autobuyUpgrades(gym.cardio.upgrades, "cardioUpgrade", stats.money);
      autobuyUpgrades(gym.cardio.gymUpgrades, "gymCardioUpgrade", stats.money);
      autobuyUpgrades(gym.cardio.adUpgrades, "adCardioUpgrade", gym.advertising.influence);
      autobuyUpgrades(prestige.cardio.paceUpgrades || [], "paceUpgrade", prestige.cardio.pace);

      autobuyEmployees(gym.employees.sales, "salesBtn");
      autobuyEmployees(gym.employees.trainers, "trainerBtn");
      autobuyEmployees(gym.employees.coordinators, "coordinatorBtn");
      autobuyEmployees(gym.employees.nutritionists, "nutritionistBtn");
      autobuyEmployees(gym.advertising.employees.coordinators, "adCoordinatorBtn");
      autobuyEmployees(gym.advertising.employees.designers, "designerBtn");
      autobuyEmployees(gym.advertising.employees.managers, "managerBtn");

      if (!$("#coffeeBtn").hasClass("disabled")) {
        $("#coffeeBtn").click();
      }
      if (!$("#payDayBtn").hasClass("disabled")) {
        $("#payDayBtn").click();
      }

      runCardioRaceManualPass();
    }

    function advanceSlice(seconds) {
      window.__gainzTest.fastForward(seconds * 1000, simConfig.fastForwardTickMs);
    }

    configureScenario();
    refreshPurchaseStates();

    let elapsedSeconds = 0;
    let paceCapReachedSeconds = null;
    let racesCompletedAtCap = null;
    let averageQualityAtCap = null;

    while (elapsedSeconds < scenario.maxSeconds) {
      for (let pass = 0; pass < simConfig.checkInPasses; pass += 1) {
        buyAvailablePass();
      }

      advanceSlice(simConfig.stepSeconds);
      refreshPurchaseStates();
      elapsedSeconds += simConfig.stepSeconds;

      const intervalState = ensureCardioIntervalState();
      if (paceCapReachedSeconds == null && math.evaluate(intervalState.runEarned || 0) >= math.evaluate(getCardioPaceRunCap())) {
        paceCapReachedSeconds = elapsedSeconds;
        racesCompletedAtCap = intervalState.totalRaces || 0;
        averageQualityAtCap = intervalState.averageQuality || 0;
      }

      if (paceCapReachedSeconds != null) {
        break;
      }
    }

    const intervalState = ensureCardioIntervalState();
    return {
      key: scenario.key,
      label: scenario.label,
      paceCapReachedSeconds,
      racesCompletedAtCap,
      averageQualityAtCap,
      totalRaces: intervalState.totalRaces || 0,
      averageQuality: intervalState.averageQuality || 0,
      runEarned: math.evaluate(intervalState.runEarned || 0),
      runCap: math.evaluate(getCardioPaceRunCap()),
      pace: math.evaluate(prestige.cardio.pace || 0),
      localRuns: prestige.cardio.total,
      globalRuns: getLayer1CompletedRuns(),
      paceShopUpgradesPurchased: Array.isArray(prestige.cardio.paceUpgrades)
        ? prestige.cardio.paceUpgrades.filter((upgrade) => upgrade.isPurchased).map((upgrade) => upgrade.id)
        : [],
      assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
    };
  }, { scenario, simConfig });
}

function summarizeScenarioForConsole(result) {
  return {
    scenario: result.label,
    paceCapTime: formatDuration(result.paceCapReachedSeconds),
    racesAtCap: result.racesCompletedAtCap == null ? "-" : result.racesCompletedAtCap,
    averageQuality: result.averageQualityAtCap == null ? "-" : Number(result.averageQualityAtCap).toFixed(3),
    runEarned: Number(result.runEarned).toFixed(3),
    assertions: result.assertionCount,
  };
}

async function main() {
  ensureDir(REPORT_DIR);
  const { server, port } = await createStaticServer();
  const browser = await chromium.launch({ headless: true });

  const scenarioResults = [];
  let pageRuntimeErrors = [];

  try {
    const { context, page, runtimeErrors } = await createInstrumentedPage(browser, port);
    pageRuntimeErrors = runtimeErrors;

    for (const scenario of SCENARIOS) {
      const result = await runScenario(page, scenario, SIM_CONFIG);
      scenarioResults.push(result);
    }

    await context.close();
  }
  finally {
    await browser.close();
    await closeServer(server);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    scenario: "cardio_race_day_three_state_alignment",
    simConfig: SIM_CONFIG,
    scenarios: scenarioResults,
    runtimeErrors: pageRuntimeErrors,
  };

  const timestampedReportPath = path.join(
    REPORT_DIR,
    `cardio-race-day-scenarios-${formatTimestamp(new Date())}.json`
  );

  fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(timestampedReportPath, JSON.stringify(report, null, 2));

  console.table(scenarioResults.map(summarizeScenarioForConsole));
  console.log(`Latest report: ${LATEST_REPORT_PATH}`);
  console.log(`Timestamped report: ${timestampedReportPath}`);

  const shouldFail = pageRuntimeErrors.length > 0 ||
    scenarioResults.some((scenario) => scenario.assertionCount > 0 || scenario.paceCapReachedSeconds == null);

  if (shouldFail) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
