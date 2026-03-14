const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "yoga-flow-scenarios-latest.json");

const SIM_CONFIG = {
  stepSeconds: Number(process.env.YOGA_SCENARIO_STEP_SECONDS || 300),
  stepSliceSeconds: Number(process.env.YOGA_SCENARIO_STEP_SLICE_SECONDS || 30),
  fastForwardTickMs: Number(process.env.YOGA_SCENARIO_TICK_MS || 20000),
  checkInPasses: Number(process.env.YOGA_SCENARIO_CHECKIN_PASSES || 4),
};
const SCENARIO_MAX_SECONDS = Number(process.env.YOGA_SCENARIO_MAX_SECONDS || 12 * 60 * 60);

const SCENARIOS = [
  {
    key: "fresh_unlock",
    label: "Fresh Yoga Unlock",
    maxSeconds: SCENARIO_MAX_SECONDS,
  },
  {
    key: "mid_progress",
    label: "Half Yoga Content",
    maxSeconds: SCENARIO_MAX_SECONDS,
  },
  {
    key: "max_content",
    label: "All Prior Content + Max Yoga Prestige",
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
      for (let i = 0; i < upgradeArray.length; i++) {
        upgradeArray[i].isPurchased = allowed.has(upgradeArray[i].id);
      }
    }

    function setPurchasedAll(upgradeArray) {
      if (!Array.isArray(upgradeArray)) {
        return;
      }
      for (let i = 0; i < upgradeArray.length; i++) {
        upgradeArray[i].isPurchased = true;
      }
    }

    function fastForwardWithSlices(seconds) {
      let remaining = Math.max(0, Number(seconds) || 0);
      let slice = Math.max(1, Math.floor(simConfig.stepSliceSeconds || 30));
      while (remaining > 0) {
        const delta = Math.min(slice, remaining);
        window.__gainzTest.fastForward(delta * 1000, simConfig.fastForwardTickMs);
        remaining -= delta;
      }
    }

    function resetToYogaRunState() {
      stats = clone(baseStats);
      bodyweight = clone(baseBodyweight);
      upgrades = clone(baseUpgrades);
      job = clone(baseJob);
      research = clone(baseResearch);
      gym = clone(baseGym);
      lifting = clone(baseLifting);
      yoga = clone(baseYoga);
      prestige = clone(basePrestige);
      checks = clone(baseChecks);

      checks.gymType = 2;
      checks.isPrestige = false;
      checks.debug = false;
      checks.debugSpeedApplied = false;
      stats.repeatingUpgrades = {};

      loadReset();
      load(null, true, false);
    }

    function configureScenario() {
      resetToYogaRunState();

      if (scenario.key === "fresh_unlock") {
        // First run shortly after yoga unlock with a realistic baseline:
        // prior global/bodyweight/lifting progression purchased through normal play,
        // but without deep late-game stockpiling.
        prestige.total = 10;
        prestige.current = 0;
        prestige.bw.total = 6;
        prestige.bw.current = 0;
        prestige.lifting.total = 4;
        prestige.lifting.current = 0;
        prestige.yoga.total = 1;
        prestige.yoga.current = 0;

        setPurchasedByIds(prestige.upgrades, range(0, 22).concat([26, 33]));
        setPurchasedByIds(prestige.bw.upgrades, range(0, 7));
        setPurchasedByIds(prestige.lifting.upgrades, range(0, 6));
        setPurchasedByIds(prestige.yoga.upgrades, [0]);
        setPurchasedByIds(prestige.yoga.flowUpgrades, []);
      }
      else if (scenario.key === "mid_progress") {
        prestige.total = 24;
        prestige.current = 0;
        prestige.bw.total = 10;
        prestige.bw.current = 0;
        prestige.lifting.total = 10;
        prestige.lifting.current = 0;
        prestige.yoga.total = 7;
        prestige.yoga.current = 0;

        setPurchasedByIds(prestige.upgrades, range(0, 30).concat([33]));
        setPurchasedByIds(prestige.bw.upgrades, range(0, 20));
        setPurchasedByIds(prestige.lifting.upgrades, range(0, 19));
        setPurchasedByIds(prestige.yoga.upgrades, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17]);
        setPurchasedByIds(prestige.yoga.flowUpgrades, [0, 1, 2]);
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

        setPurchasedAll(prestige.upgrades);
        setPurchasedAll(prestige.bw.upgrades);
        setPurchasedAll(prestige.lifting.upgrades);
        setPurchasedAll(prestige.yoga.upgrades);
        setPurchasedByIds(prestige.yoga.flowUpgrades, []);
        setPurchasedAll(prestige.bw.confidenceUpgrades || []);
        setPurchasedAll(prestige.lifting.leadershipUpgrades || []);

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
      }

      reapplyPrestige(prestige.upgrades, "globalUpgrade", -1);
      reapplyPrestige(prestige.bw.upgrades, "globalBwUpgrade", 0);
      reapplyPrestige(prestige.lifting.upgrades, "globalLiftingUpgrade", 1);
      reapplyPrestige(prestige.yoga.upgrades, "globalYogaUpgrade", 2);

      updatePrestigeValues();
      updateAutobuyerToggles();
    }

    function countPurchased(upgradeArray) {
      let count = 0;
      if (!Array.isArray(upgradeArray)) {
        return 0;
      }
      for (let i = 0; i < upgradeArray.length; i++) {
        if (upgradeArray[i].isPurchased) {
          count += 1;
        }
      }
      return count;
    }

    function getRunPurchaseCount() {
      return (
        countPurchased(gym.upgrades) +
        countPurchased(gym.gymUpgrades) +
        countPurchased(gym.adUpgrades) +
        countPurchased(gym.yoga.upgrades) +
        countPurchased(gym.yoga.gymUpgrades) +
        countPurchased(gym.yoga.adUpgrades) +
        countPurchased(prestige.yoga.flowUpgrades)
      );
    }

    function refreshPurchaseStates() {
      checkUpgradeDisable(gym.upgrades, stats.money, "upgrade", false);
      checkUpgradeDisable(gym.gymUpgrades, stats.money, "gymUpgrade", false);
      checkUpgradeDisable(gym.adUpgrades, gym.advertising.influence, "adUpgrade", false);
      checkUpgradeDisable(gym.yoga.upgrades, stats.money, "yogaUpgrade", false);
      checkUpgradeDisable(gym.yoga.gymUpgrades, stats.money, "gymYogaUpgrade", false);
      checkUpgradeDisable(gym.yoga.adUpgrades, gym.advertising.influence, "adYogaUpgrade", false);
      checkEmployeeDisable(gym.employees.sales, stats.money, "sales");
      checkEmployeeDisable(gym.employees.trainers, stats.money, "trainer");
      checkEmployeeDisable(gym.employees.coordinators, stats.money, "coordinator");
      checkEmployeeDisable(gym.employees.nutritionists, stats.money, "nutritionist");
      checkEmployeeDisable(gym.advertising.employees.coordinators, stats.money, "adCoordinator");
      checkEmployeeDisable(gym.advertising.employees.designers, stats.money, "designer");
      checkEmployeeDisable(gym.advertising.employees.managers, stats.money, "manager");
      checkPrestigeUpgradeDisable(prestige.yoga.flowUpgrades, prestige.yoga.flow, "flowUpgrade");
    }

    function buyAvailablePass() {
      autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
      autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
      autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
      autobuyUpgrades(gym.yoga.upgrades, "yogaUpgrade", stats.money);
      autobuyUpgrades(gym.yoga.gymUpgrades, "gymYogaUpgrade", stats.money);
      autobuyUpgrades(gym.yoga.adUpgrades, "adYogaUpgrade", gym.advertising.influence);

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

      for (let i = 0; i < prestige.yoga.flowUpgrades.length; i++) {
        if (!prestige.yoga.flowUpgrades[i].isPurchased && prestige.yoga.flow >= prestige.yoga.flowUpgrades[i].cost) {
          flowUpgradeClick($("#flowUpgradeBtn" + prestige.yoga.flowUpgrades[i].id), false);
        }
      }
    }

    function attemptManualRoutePlay() {
      if (!hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0)) {
        return false;
      }

      const flowState = ensureYogaFlowState();
      if (flowState.activeDraftIndex < 0) {
        const preferredIndex = getYogaAutomationRouteIndex(flowState);
        selectYogaRoute(preferredIndex, false);
        return true;
      }

      if (flowState.routeStability < 0.55 || flowState.routeProgress > 0.84) {
        anchorYogaBreathPhase(false);
        return true;
      }
      return false;
    }

    function runBurst() {
      let anchored = false;
      for (let i = 0; i < simConfig.checkInPasses; i++) {
        const before = getRunPurchaseCount();
        refreshPurchaseStates();
        buyAvailablePass();
        if (attemptManualRoutePlay()) {
          anchored = true;
        }
        const after = getRunPurchaseCount();
        if (after <= before && anchored) {
          break;
        }
      }
    }

    function allFlowUpgradesPurchased() {
      return Array.isArray(prestige.yoga.flowUpgrades)
        && prestige.yoga.flowUpgrades.length > 0
        && prestige.yoga.flowUpgrades.every((upgrade) => upgrade.isPurchased);
    }

    configureScenario();

    const purchaseEvents = [];
    let elapsedSeconds = 0;
    let prestigeReadySeconds = null;
    let flowShopCompleteSeconds = allFlowUpgradesPurchased() ? 0 : null;
    let flowCapReachedSeconds = null;
    let cyclesAtPrestige = null;
    let flowAtPrestige = null;
    let averageQualityAtPrestige = null;
    let noPurchaseCheckins = 0;

    purchaseEvents.push({ atSeconds: 0, count: getRunPurchaseCount() });
    runBurst();
    purchaseEvents.push({ atSeconds: 0, count: getRunPurchaseCount() });

    while (elapsedSeconds < scenario.maxSeconds) {
      fastForwardWithSlices(simConfig.stepSeconds);
      elapsedSeconds += simConfig.stepSeconds;

      const beforeCount = getRunPurchaseCount();
      runBurst();
      const afterCount = getRunPurchaseCount();

      if (afterCount > beforeCount) {
        purchaseEvents.push({ atSeconds: elapsedSeconds, count: afterCount });
      }
      else {
        noPurchaseCheckins += 1;
      }

      if (flowShopCompleteSeconds == null && allFlowUpgradesPurchased()) {
        flowShopCompleteSeconds = elapsedSeconds;
      }
      if (flowCapReachedSeconds == null) {
        const flowState = ensureYogaFlowState();
        if (flowState.runEarned + 1e-6 >= getYogaFlowRunCap()) {
          flowCapReachedSeconds = elapsedSeconds;
        }
      }

      if (prestigeReadySeconds == null && checks.isPrestige) {
        prestigeReadySeconds = elapsedSeconds;
        cyclesAtPrestige = yoga.flow.totalCycles;
        flowAtPrestige = prestige.yoga.flow;
        averageQualityAtPrestige = yoga.flow.averageQuality;
      }

      if (prestigeReadySeconds != null && flowCapReachedSeconds != null) {
        break;
      }
    }

    let maxPurchaseGapSeconds = 0;
    for (let i = 1; i < purchaseEvents.length; i++) {
      maxPurchaseGapSeconds = Math.max(
        maxPurchaseGapSeconds,
        purchaseEvents[i].atSeconds - purchaseEvents[i - 1].atSeconds
      );
    }

    return {
      key: scenario.key,
      label: scenario.label,
      elapsedSeconds,
      breathCycleUnlocked: hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0),
      prestigeReadySeconds,
      flowShopCompleteSeconds,
      flowCapReachedSeconds,
      flowShopToPrestigeRatio:
        prestigeReadySeconds != null && flowShopCompleteSeconds != null
          ? flowShopCompleteSeconds / Math.max(1, prestigeReadySeconds)
          : null,
      cyclesAtPrestige,
      flowAtPrestige,
      averageQualityAtPrestige,
      finalFlow: {
        points: prestige.yoga.flow,
        cycles: yoga.flow.totalCycles,
        averageQuality: yoga.flow.averageQuality,
        currentPhase: yoga.flow.currentPhase,
      },
      finalGymType: checks.gymType,
      pacingDiagnostics: {
        noPurchaseCheckins,
        maxPurchaseGapSeconds,
        purchaseEventCount: purchaseEvents.length,
      },
      assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
      firstAssertion:
        Array.isArray(window.__gainzAssertLog) && window.__gainzAssertLog.length > 0
          ? window.__gainzAssertLog[0]
          : null,
    };
  }, { scenario, simConfig });
}

function summarizeScenarioForConsole(result) {
  return {
    scenario: result.label,
    prestigeReady: formatDuration(result.prestigeReadySeconds),
    flowCapReached: formatDuration(result.flowCapReachedSeconds),
    flowShopComplete: formatDuration(result.flowShopCompleteSeconds),
    ratio:
      result.flowShopToPrestigeRatio == null
        ? "n/a"
        : Number(result.flowShopToPrestigeRatio.toFixed(3)),
    cyclesAtPrestige:
      result.cyclesAtPrestige == null
        ? "n/a"
        : Number(result.cyclesAtPrestige.toFixed(2)),
    flowAtPrestige:
      result.flowAtPrestige == null
        ? "n/a"
        : Number(result.flowAtPrestige.toFixed(2)),
    avgQuality:
      result.averageQualityAtPrestige == null
        ? "n/a"
        : Number((result.averageQualityAtPrestige * 100).toFixed(1)),
  };
}

async function main() {
  ensureDir(REPORT_DIR);

  const serverInfo = await createStaticServer();
  const server = serverInfo.server;
  const port = serverInfo.port;
  const browser = await chromium.launch({ headless: true });

  const scenarioResults = [];
  const runtimeErrors = [];
  const startedAt = Date.now();
  const perfStart = process.hrtime.bigint();

  try {
    for (const scenario of SCENARIOS) {
      const { context, page, runtimeErrors: pageRuntimeErrors } = await createInstrumentedPage(
        browser,
        port
      );
      try {
        const result = await runScenario(page, scenario, SIM_CONFIG);
        scenarioResults.push(result);
        runtimeErrors.push(
          ...pageRuntimeErrors.map((msg) => `${scenario.key}: ${msg}`)
        );
      }
      finally {
        await context.close();
      }
    }
  }
  finally {
    await browser.close();
    await closeServer(server);
  }

  const perfEnd = process.hrtime.bigint();
  const endedAt = Date.now();

  const report = {
    generatedAt: new Date().toISOString(),
    scenario: "yoga_flow_three_state_alignment",
    config: SIM_CONFIG,
    run: {
      startedAt,
      endedAt,
      wallClockElapsedMs: Number(perfEnd - perfStart) / 1_000_000,
      runtimeErrors,
    },
    scenarios: scenarioResults,
  };

  const timestampedPath = path.join(
    REPORT_DIR,
    `yoga-flow-scenarios-${formatTimestamp(new Date())}.json`
  );
  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Yoga Flow Scenario Simulation");
  console.table(scenarioResults.map(summarizeScenarioForConsole));
  console.log(`Report written: ${timestampedPath}`);
  console.log(`Latest report: ${LATEST_REPORT_PATH}`);

  const hasFailures =
    runtimeErrors.length > 0 ||
    scenarioResults.some(
      (scenario) =>
        scenario.assertionCount > 0 ||
        scenario.prestigeReadySeconds == null ||
        (scenario.breathCycleUnlocked && scenario.flowCapReachedSeconds == null)
    );
  if (hasFailures) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
