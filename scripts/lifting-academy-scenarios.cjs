const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "lifting-academy-scenarios-latest.json");

const SIM_CONFIG = {
  stepSeconds: Number(process.env.LIFTING_SCENARIO_STEP_SECONDS || 300),
  fastForwardTickMs: Number(process.env.LIFTING_SCENARIO_TICK_MS || 20000),
  checkInPasses: Number(process.env.LIFTING_SCENARIO_CHECKIN_PASSES || 4),
};

const SCENARIOS = [
  {
    key: "fresh_unlock",
    label: "Fresh Lifting Unlock",
    maxSeconds: 12 * 60 * 60,
  },
  {
    key: "mid_progress",
    label: "Half Lifting Content",
    maxSeconds: 12 * 60 * 60,
  },
  {
    key: "max_content",
    label: "All Current Content",
    maxSeconds: 12 * 60 * 60,
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

  await page.goto(`http://${HOST}:${port}/?deterministic=1&seed=7331`);
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

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function setPurchasedByIds(upgradeArray, ids) {
      if (!Array.isArray(upgradeArray)) {
        return;
      }
      let allowed = new Set(ids);
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

    function resetToLiftingRunState() {
      stats = clone(baseStats);
      bodyweight = clone(baseBodyweight);
      upgrades = clone(baseUpgrades);
      job = clone(baseJob);
      research = clone(baseResearch);
      gym = clone(baseGym);
      lifting = clone(baseLifting);
      prestige = clone(basePrestige);
      checks = clone(baseChecks);

      checks.gymType = 1;
      checks.isPrestige = false;
      checks.debug = false;
      checks.debugSpeedApplied = false;
      stats.repeatingUpgrades = {};

      loadReset();
      load(null, true, false);
    }

    function configureScenario() {
      resetToLiftingRunState();

      if (scenario.key === "fresh_unlock") {
        prestige.total = 6;
        prestige.current = 0;
        prestige.bw.total = 5;
        prestige.bw.current = 0;
        prestige.lifting.total = 1;
        prestige.lifting.current = 0;
        setPurchasedByIds(prestige.upgrades, [26]);
        setPurchasedByIds(prestige.lifting.upgrades, [0]);
      }
      else if (scenario.key === "mid_progress") {
        prestige.total = 18;
        prestige.current = 0;
        prestige.bw.total = 10;
        prestige.bw.current = 0;
        prestige.lifting.total = 8;
        prestige.lifting.current = 0;
        setPurchasedByIds(
          prestige.upgrades,
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
        );
        setPurchasedByIds(prestige.lifting.upgrades, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 17]);
        setPurchasedByIds(prestige.lifting.leadershipUpgrades, [0, 1, 2]);
      }
      else {
        prestige.total = 40;
        prestige.current = 0;
        prestige.bw.total = 14;
        prestige.bw.current = 0;
        prestige.lifting.total = 14;
        prestige.lifting.current = 0;
        setPurchasedAll(prestige.upgrades);
        setPurchasedAll(prestige.bw.upgrades);
        setPurchasedAll(prestige.lifting.upgrades);
        setPurchasedAll(prestige.bw.confidenceUpgrades || []);
        setPurchasedAll(prestige.lifting.leadershipUpgrades || []);
      }

      reapplyPrestige(prestige.upgrades, "globalUpgrade", -1);
      reapplyPrestige(prestige.lifting.upgrades, "globalLiftingUpgrade", 1);
      reapplyPrestige(prestige.bw.upgrades, "globalBwUpgrade", 0);

      if (scenario.key === "max_content") {
        if (typeof window.__gainzRepeatingUpgrades?.ensureInitialized === "function") {
          window.__gainzRepeatingUpgrades.ensureInitialized();
        }
        const state = stats.repeatingUpgrades || {};
        if (state.bodyweight_street_tempo) {
          state.bodyweight_street_tempo.level = 8;
        }
        if (state.global_franchise_tempo) {
          state.global_franchise_tempo.level = 8;
        }
      }

      ensureLiftingAcademyState();
      updatePrestigeValues();
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
      const academy = ensureLiftingAcademyState();
      return (
        countPurchased(gym.upgrades) +
        countPurchased(gym.gymUpgrades) +
        countPurchased(gym.adUpgrades) +
        countPurchased(gym.lifting.upgrades) +
        countPurchased(gym.lifting.gymUpgrades) +
        countPurchased(gym.lifting.adUpgrades) +
        countPurchased(academy.upgrades) +
        getAcademyCampPointBoostLevel()
      );
    }

    function refreshPurchaseStates() {
      checkUpgradeDisable(gym.upgrades, stats.money, "upgrade", false);
      checkUpgradeDisable(gym.gymUpgrades, stats.money, "gymUpgrade", false);
      checkUpgradeDisable(gym.adUpgrades, gym.advertising.influence, "adUpgrade", false);
      checkUpgradeDisable(gym.lifting.upgrades, stats.money, "liftingUpgrade", false);
      checkUpgradeDisable(gym.lifting.gymUpgrades, stats.money, "gymLiftingUpgrade", false);
      checkUpgradeDisable(gym.lifting.adUpgrades, gym.advertising.influence, "adLiftingUpgrade", false);
      checkEmployeeDisable(gym.employees.sales, stats.money, "sales");
      checkEmployeeDisable(gym.employees.trainers, stats.money, "trainer");
      checkEmployeeDisable(gym.employees.coordinators, stats.money, "coordinator");
      checkEmployeeDisable(gym.employees.nutritionists, stats.money, "nutritionist");
      checkEmployeeDisable(gym.advertising.employees.coordinators, stats.money, "adCoordinator");
      checkEmployeeDisable(gym.advertising.employees.designers, stats.money, "designer");
      checkEmployeeDisable(gym.advertising.employees.managers, stats.money, "manager");
    }

    function buyAvailablePass() {
      autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
      autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
      autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
      autobuyUpgrades(gym.lifting.upgrades, "liftingUpgrade", stats.money);
      autobuyUpgrades(gym.lifting.gymUpgrades, "gymLiftingUpgrade", stats.money);
      autobuyUpgrades(gym.lifting.adUpgrades, "adLiftingUpgrade", gym.advertising.influence);

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

      // Simulate an engaged player manually progressing academy choices
      // even before the dedicated academy automation unlock is purchased.
      if (hasPurchasedPrestigeUpgrade(prestige.lifting.upgrades, 0)) {
        const academy = ensureLiftingAcademyState();

        if (academy.camp.unspentPoints > 0) {
          autoConfigureAcademyCamp();
        }

        for (let i = 0; i < academy.upgrades.length; i++) {
          if (academy.upgrades[i].isPurchased) {
            continue;
          }
          const upgradeCost = getAcademyUpgradeEffectiveCost(academy.upgrades[i]);
          if (math.evaluate(academy.credits) >= upgradeCost) {
            academyUpgradeClick(academy.upgrades[i].id);
          }
        }

        const allCoreAcademyUpgradesPurchased = academy.upgrades.every((upgrade) => upgrade.isPurchased);
        if (allCoreAcademyUpgradesPurchased) {
          const repeatableCost = getAcademyCampPointBoostCost();
          if (math.evaluate(academy.credits) >= repeatableCost) {
            academyCampPointBoostClick();
            autoConfigureAcademyCamp();
          }
        }
      }
    }

    function runBurst() {
      for (let i = 0; i < simConfig.checkInPasses; i++) {
        const before = getRunPurchaseCount();
        refreshPurchaseStates();
        buyAvailablePass();
        const after = getRunPurchaseCount();
        if (after <= before) {
          break;
        }
      }
    }

    configureScenario();

    const purchaseEvents = [];
    let elapsedSeconds = 0;
    let prestigeReadySeconds = null;
    let academyCapSeconds = null;
    let seasonsAtPrestige = null;
    let expansionLevelAtPrestige = null;
    let creditsAtPrestige = null;
    let campAtPrestige = null;
    let noPurchaseCheckins = 0;

    purchaseEvents.push({ atSeconds: 0, count: getRunPurchaseCount() });
    runBurst();
    purchaseEvents.push({ atSeconds: 0, count: getRunPurchaseCount() });

    while (elapsedSeconds < scenario.maxSeconds) {
      window.__gainzTest.fastForward(simConfig.stepSeconds * 1000, simConfig.fastForwardTickMs);
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

      const academy = ensureLiftingAcademyState();
      if (prestigeReadySeconds == null && checks.isPrestige) {
        prestigeReadySeconds = elapsedSeconds;
        seasonsAtPrestige = academy.seasonsCompleted;
        expansionLevelAtPrestige = getAcademyCampPointBoostLevel();
        creditsAtPrestige = academy.credits;
        campAtPrestige = {
          strength: academy.camp.strength,
          technique: academy.camp.technique,
          recovery: academy.camp.recovery,
          promotion: academy.camp.promotion,
        };
      }

      if (academyCapSeconds == null && academy.seasonsCompleted >= getAcademySeasonCap()) {
        academyCapSeconds = elapsedSeconds;
      }

      if (prestigeReadySeconds != null && academyCapSeconds != null) {
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

    const academy = ensureLiftingAcademyState();
    return {
      key: scenario.key,
      label: scenario.label,
      elapsedSeconds,
      prestigeReadySeconds,
      academyCapSeconds,
      academyToPrestigeRatio:
        prestigeReadySeconds != null && academyCapSeconds != null
          ? academyCapSeconds / Math.max(1, prestigeReadySeconds)
          : null,
      seasonsAtPrestige,
      expansionLevelAtPrestige,
      creditsAtPrestige,
      campAtPrestige,
      finalAcademy: {
        seasonsCompleted: academy.seasonsCompleted,
        phase: academy.phase,
        progress: academy.progress,
        phaseTarget: academy.phaseTarget,
        expansionLevel: getAcademyCampPointBoostLevel(),
        passiveCreditsPerSecond: getAcademyPassiveCreditsPerSecond(),
      },
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
    academyCap: formatDuration(result.academyCapSeconds),
    ratio:
      result.academyToPrestigeRatio == null
        ? "n/a"
        : Number(result.academyToPrestigeRatio.toFixed(3)),
    seasonsAtPrestige: result.seasonsAtPrestige,
    expansionAtPrestige: result.expansionLevelAtPrestige,
    maxPurchaseGap: formatDuration(result.pacingDiagnostics.maxPurchaseGapSeconds),
    noPurchaseCheckins: result.pacingDiagnostics.noPurchaseCheckins,
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
    scenario: "lifting_academy_three_state_alignment",
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
    `lifting-academy-scenarios-${formatTimestamp(new Date())}.json`
  );
  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Lifting Academy Scenario Simulation");
  console.table(scenarioResults.map(summarizeScenarioForConsole));
  console.log(`Report written: ${timestampedPath}`);
  console.log(`Latest report: ${LATEST_REPORT_PATH}`);

  const hasFailures =
    runtimeErrors.length > 0 ||
    scenarioResults.some(
      (scenario) => scenario.assertionCount > 0 || scenario.prestigeReadySeconds == null
    );
  if (hasFailures) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
