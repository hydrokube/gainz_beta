
const fs = require("fs");
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "content-completion-latest.json");
const CHECKPOINT_DIR = path.join(REPORT_DIR, "checkpoints");
const CHECKPOINT_PATH = path.join(CHECKPOINT_DIR, "content-completion-checkpoint-latest.json");
const CHECKPOINT_VERSION = 1;
const CONTENT_SIM_POLICY_KEY = String(process.env.CONTENT_SIM_POLICY || "human_10m");
const POLICY_LATEST_REPORT_PATH = path.join(
  REPORT_DIR,
  `content-completion-${CONTENT_SIM_POLICY_KEY}-latest.json`,
);
const CONTENT_SIM_CHECKPOINT_EVERY_SECONDS = Number(
  process.env.CONTENT_SIM_CHECKPOINT_EVERY_SECONDS || 2 * 60 * 60
);
const CONTENT_SIM_EXIT_AFTER_CHECKPOINTS = Number(
  process.env.CONTENT_SIM_EXIT_AFTER_CHECKPOINTS || 0
);
const CONTENT_SIM_RESUME_ENABLED = process.env.CONTENT_SIM_RESUME !== "0";
const CONTENT_SIM_CLEAR_CHECKPOINT = process.env.CONTENT_SIM_CLEAR_CHECKPOINT === "1";

const POLICY_PRESETS = {
  active_5m: {
    mode: "human_active_5m_policy_wait_full_meta_repeatables_last",
    stepSeconds: 300,
    stepSliceSeconds: 300,
    checkInPasses: 3,
  },
  human_10m: {
    mode: "human_10m_policy_wait_full_meta_repeatables_last",
    stepSeconds: 600,
    stepSliceSeconds: 600,
    checkInPasses: 3,
  },
  human_15m: {
    mode: "human_15m_policy_wait_full_meta_repeatables_last",
    stepSeconds: 900,
    stepSliceSeconds: 900,
    checkInPasses: 3,
  },
  branch_locked_10m: {
    mode: "human_10m_branch_locked_unlock_samples_then_finish_branches",
    stepSeconds: 600,
    stepSliceSeconds: 600,
    checkInPasses: 3,
  },
};

const selectedPolicyPreset = POLICY_PRESETS[CONTENT_SIM_POLICY_KEY] || POLICY_PRESETS.active_5m;

const SIM_CONFIG = {
  maxSimSeconds: Number(process.env.CONTENT_SIM_MAX_SECONDS || 200 * 60 * 60),
  stepSeconds: Number(process.env.CONTENT_SIM_STEP_SECONDS || selectedPolicyPreset.stepSeconds),
  stepSliceSeconds: Number(
    process.env.CONTENT_SIM_STEP_SLICE_SECONDS || selectedPolicyPreset.stepSliceSeconds
  ),
  fastForwardTickMs: Number(process.env.CONTENT_SIM_TICK_MS || 5000),
  checkInPasses: Number(process.env.CONTENT_SIM_CHECKIN_PASSES || selectedPolicyPreset.checkInPasses),
  maxMetaHoldSeconds: Number(process.env.CONTENT_SIM_MAX_META_HOLD_SECONDS || 24 * 60 * 60),
  maxMetaStallSeconds: Number(process.env.CONTENT_SIM_MAX_META_STALL_SECONDS || 8 * 60 * 60),
};

const SIM_POLICY = {
  key: CONTENT_SIM_POLICY_KEY,
  mode: selectedPolicyPreset.mode,
  waitForMetaPointsBeforePrestige: true,
  buyRepeatablesLast: true,
};

const CONTENT_SIM_FINGERPRINT_FILES = [
  "js/app.js",
  "js/stats.js",
  "js/random.js",
  "js/clock.js",
  "js/test-hooks.js",
  "scripts/content-completion-sim.cjs",
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

const GYM_LABELS = {
  "-1": "Layer 0",
  0: "Bodyweight",
  1: "Lifting",
  2: "Yoga",
  3: "Cardio",
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeFiniteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildContentSimFingerprint() {
  const hash = crypto.createHash("sha256");
  const fingerprintPayload = {
    simConfig: SIM_CONFIG,
    simPolicy: SIM_POLICY,
    fingerprintFiles: CONTENT_SIM_FINGERPRINT_FILES,
  };

  hash.update(JSON.stringify(fingerprintPayload));
  for (const relativePath of CONTENT_SIM_FINGERPRINT_FILES) {
    const filePath = path.join(ROOT_DIR, relativePath);
    hash.update(relativePath);
    hash.update(fs.readFileSync(filePath));
  }

  return hash.digest("hex");
}

const CONTENT_SIM_FINGERPRINT = buildContentSimFingerprint();

function ensureCheckpointDir() {
  ensureDir(CHECKPOINT_DIR);
}

function clearCheckpoint() {
  try {
    fs.rmSync(CHECKPOINT_PATH, { force: true });
  } catch (error) {
    if (error && error.code !== "ENOENT") {
      throw error;
    }
  }
}

function loadCheckpoint() {
  if (!CONTENT_SIM_RESUME_ENABLED || !fs.existsSync(CHECKPOINT_PATH)) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf8"));
  } catch (error) {
    clearCheckpoint();
    return null;
  }

  if (
    !parsed ||
    parsed.version !== CHECKPOINT_VERSION ||
    parsed.fingerprint !== CONTENT_SIM_FINGERPRINT ||
    parsed.simulation == null ||
    parsed.saveObject == null
  ) {
    clearCheckpoint();
    return null;
  }

  return parsed;
}

function writeCheckpoint(checkpoint) {
  ensureCheckpointDir();
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
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

async function runCompletionSimulationWindow(browser, port, resumeCheckpoint, stopAtElapsedSeconds) {
  const { context, page, runtimeErrors } = await createInstrumentedPage(browser, port);
  const startedAt = Date.now();
  const perfStart = process.hrtime.bigint();

  const result = await page.evaluate(({ config, resumeCheckpoint, stopAtElapsedSeconds, simPolicyKey }) => {
    const {
      maxSimSeconds,
      stepSeconds,
      stepSliceSeconds,
      fastForwardTickMs,
      checkInPasses,
      maxMetaHoldSeconds,
      maxMetaStallSeconds,
    } = config;
    const targetElapsedSeconds =
      stopAtElapsedSeconds == null ? maxSimSeconds : Math.max(0, Number(stopAtElapsedSeconds) || 0);

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function normalizeFinite(value, fallback) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    window.confirm = () => true;
    if (Array.isArray(window.__gainzAssertLog)) {
      window.__gainzAssertLog.length = 0;
    }

    if (typeof refreshId !== "undefined" && refreshId != null) {
      clearInterval(refreshId);
      refreshId = null;
    }

    if (resumeCheckpoint != null && resumeCheckpoint.saveObject != null) {
      if (window.__gainzClock && typeof window.__gainzClock.reset === "function") {
        window.__gainzClock.reset();
      }
      loadReset();
      localStorage.setItem(saveName, JSON.stringify(resumeCheckpoint.saveObject));
      if (window.__gainzClock && typeof window.__gainzClock.setNow === "function") {
        const checkpointNow = Math.max(0, Math.floor(Number(resumeCheckpoint.clockNow) || 0));
        if (checkpointNow > 0) {
          window.__gainzClock.setNow(checkpointNow);
        }
      }
      if (window.__gainzRandom && typeof window.__gainzRandom.setState === "function" && resumeCheckpoint.randomState != null) {
        window.__gainzRandom.setState(resumeCheckpoint.randomState);
      }
      else if (window.__gainzRandom && resumeCheckpoint.randomState != null && resumeCheckpoint.randomState.state != null) {
        window.__gainzRandom.setSeed(resumeCheckpoint.randomState.state);
      }
      window.__gainzSkipOfflineOnLoad = true;
      load(null, false, false);
    }
    else {
      window.__gainzTest.fastForward(250, 250);
    }

    // setupStory2 is normally triggered by UI refresh when the first resting event occurs.
    // Long deterministic simulations disable UI refresh for performance, so we bootstrap it.
    if (!checks.story2) {
      checks.story1 = true;
      setupStory2();
    } else if (!makeVideoTimerId) {
      setupMakeVideoTimer();
    }

    const META_POINT_EPSILON = 1e-6;

    function countPurchased(upgradeArray) {
      if (!Array.isArray(upgradeArray)) {
        return 0;
      }
      let count = 0;
      for (let i = 0; i < upgradeArray.length; i += 1) {
        if (upgradeArray[i].isPurchased) {
          count += 1;
        }
      }
      return count;
    }

    function allPurchased(upgradeArray) {
      if (!Array.isArray(upgradeArray)) {
        return true;
      }
      for (let i = 0; i < upgradeArray.length; i += 1) {
        if (!upgradeArray[i].isPurchased) {
          return false;
        }
      }
      return true;
    }

    function getRemainingCost(upgradeArray) {
      if (!Array.isArray(upgradeArray)) {
        return 0;
      }
      let total = 0;
      for (let i = 0; i < upgradeArray.length; i += 1) {
        if (!upgradeArray[i].isPurchased) {
          total += Number(upgradeArray[i].cost) || 0;
        }
      }
      return total;
    }

    function isUpgradePurchased(upgradeArray, upgradeId) {
      if (!Array.isArray(upgradeArray)) {
        return false;
      }
      for (let i = 0; i < upgradeArray.length; i += 1) {
        if (upgradeArray[i].id === upgradeId && upgradeArray[i].isPurchased) {
          return true;
        }
      }
      return false;
    }
    function getCompletionState() {
      const allGlobalPrestigeUpgrades = allPurchased(prestige.upgrades);
      const allBwPrestigeUpgrades = allPurchased(prestige.bw.upgrades);
      const allLiftingPrestigeUpgrades = allPurchased(prestige.lifting.upgrades);
      const allYogaPrestigeUpgrades = allPurchased(prestige.yoga.upgrades);
      const allCardioPrestigeUpgrades = allPurchased(prestige.cardio.upgrades);
      const allConfidenceUpgrades = allPurchased(prestige.bw.confidenceUpgrades || []);
      const allLeadershipUpgrades = allPurchased(prestige.lifting.leadershipUpgrades || []);
      const allFlowUpgrades = allPurchased(prestige.yoga.flowUpgrades || []);
      const allPaceUpgrades = allPurchased(prestige.cardio.paceUpgrades || []);
      const allBwBranch = allBwPrestigeUpgrades && allConfidenceUpgrades;
      const allLiftingBranch = allLiftingPrestigeUpgrades && allLeadershipUpgrades;
      const allYogaBranch = allYogaPrestigeUpgrades && allFlowUpgrades;
      const allCardioBranch = allCardioPrestigeUpgrades && allPaceUpgrades;

      return {
        allGlobalPrestigeUpgrades,
        allBwPrestigeUpgrades,
        allLiftingPrestigeUpgrades,
        allYogaPrestigeUpgrades,
        allCardioPrestigeUpgrades,
        allConfidenceUpgrades,
        allLeadershipUpgrades,
        allFlowUpgrades,
        allPaceUpgrades,
        allBwBranch,
        allLiftingBranch,
        allYogaBranch,
        allCardioBranch,
        allNonRepeatable:
          allGlobalPrestigeUpgrades &&
          allBwBranch &&
          allLiftingBranch &&
          allYogaBranch &&
          allCardioBranch,
      };
    }

    function getPrestigePurchaseCounts() {
      return {
        global: countPurchased(prestige.upgrades),
        bodyweight: countPurchased(prestige.bw.upgrades),
        lifting: countPurchased(prestige.lifting.upgrades),
        yoga: countPurchased(prestige.yoga.upgrades),
        cardio: countPurchased(prestige.cardio.upgrades),
        confidenceShop: countPurchased(prestige.bw.confidenceUpgrades || []),
        leadershipShop: countPurchased(prestige.lifting.leadershipUpgrades || []),
        flowShop: countPurchased(prestige.yoga.flowUpgrades || []),
        paceShop: countPurchased(prestige.cardio.paceUpgrades || []),
      };
    }

    function getTotalUpgradeCount() {
      let total = 0;
      total += countPurchased(upgrades);
      total += countPurchased(bodyweight.upgrades);
      total += countPurchased(job.upgrades);
      total += countPurchased(research.upgrades);

      total += countPurchased(prestige.upgrades);
      total += countPurchased(prestige.bw.upgrades);
      total += countPurchased(prestige.lifting.upgrades);
      total += countPurchased(prestige.yoga.upgrades);
      total += countPurchased(prestige.cardio.upgrades);
      total += countPurchased(prestige.bw.confidenceUpgrades || []);
      total += countPurchased(prestige.lifting.leadershipUpgrades || []);
      total += countPurchased(prestige.yoga.flowUpgrades || []);
      total += countPurchased(prestige.cardio.paceUpgrades || []);

      if (checks.gymType !== -1) {
        total += countPurchased(gym.upgrades);
        total += countPurchased(gym.gymUpgrades);
        total += countPurchased(gym.adUpgrades);

        if (checks.gymType === 0) {
          total += countPurchased(gym.bw.upgrades);
          total += countPurchased(gym.bw.gymUpgrades);
          total += countPurchased(gym.bw.adUpgrades);
        }
        if (checks.gymType === 1) {
          total += countPurchased(gym.lifting.upgrades);
          total += countPurchased(gym.lifting.gymUpgrades);
          total += countPurchased(gym.lifting.adUpgrades);
        }
        if (checks.gymType === 2) {
          total += countPurchased(gym.yoga.upgrades);
          total += countPurchased(gym.yoga.gymUpgrades);
          total += countPurchased(gym.yoga.adUpgrades);
        }
        if (checks.gymType === 3) {
          total += countPurchased(gym.cardio.upgrades);
          total += countPurchased(gym.cardio.gymUpgrades);
          total += countPurchased(gym.cardio.adUpgrades);
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
      const scopes = ["global", "bodyweight", "lifting", "yoga", "cardio", "flow", "pace", "confidence", "leadership"];
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
      checkPrestigeUpgradeDisable(prestige.yoga.upgrades, prestige.yoga.current, "globalYogaUpgrade");
      checkPrestigeUpgradeDisable(prestige.cardio.upgrades, prestige.cardio.current, "globalCardioUpgrade");
      checkPrestigeUpgradeDisable(prestige.bw.confidenceUpgrades || [], prestige.bw.confidence, "confidenceUpgrade");
      checkPrestigeUpgradeDisable(prestige.lifting.leadershipUpgrades || [], prestige.lifting.leadership, "leadershipUpgrade");
      checkPrestigeUpgradeDisable(prestige.yoga.flowUpgrades || [], prestige.yoga.flow, "flowUpgrade");
      checkPrestigeUpgradeDisable(prestige.cardio.paceUpgrades || [], prestige.cardio.pace, "paceUpgrade");

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
        }
        if (checks.gymType === 2) {
          checkUpgradeDisable(gym.yoga.upgrades, stats.money, "yogaUpgrade", false);
          checkUpgradeDisable(gym.yoga.gymUpgrades, stats.money, "gymYogaUpgrade", false);
          checkUpgradeDisable(gym.yoga.adUpgrades, gym.advertising.influence, "adYogaUpgrade", false);
        }
        if (checks.gymType === 3) {
          checkUpgradeDisable(gym.cardio.upgrades, stats.money, "cardioUpgrade", false);
          checkUpgradeDisable(gym.cardio.gymUpgrades, stats.money, "gymCardioUpgrade", false);
          checkUpgradeDisable(gym.cardio.adUpgrades, gym.advertising.influence, "adCardioUpgrade", false);
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

    function runAcademyPurchasePass() {
      if (checks.gymType !== 1 || !isUpgradePurchased(prestige.lifting.upgrades, 0)) {
        return;
      }

      const academy = ensureLiftingAcademyState();
      if (academy.camp.unspentPoints > 0) {
        autoConfigureAcademyCamp();
      }

      for (let i = 0; i < academy.upgrades.length; i += 1) {
        if (academy.upgrades[i].isPurchased) {
          continue;
        }
        const cost = getAcademyUpgradeEffectiveCost(academy.upgrades[i]);
        if (math.evaluate(academy.credits) >= cost) {
          academyUpgradeClick(academy.upgrades[i].id);
        }
      }

      const allCoreBought = academy.upgrades.every((upgrade) => upgrade.isPurchased);
      if (allCoreBought) {
        const repeatableCost = getAcademyCampPointBoostCost();
        if (math.evaluate(academy.credits) >= repeatableCost) {
          academyCampPointBoostClick();
          autoConfigureAcademyCamp();
        }
      }
    }

    function runYogaRouteManualPass() {
      if (checks.gymType !== 2 || !isUpgradePurchased(prestige.yoga.upgrades, 0)) {
        return;
      }

      const flowState = ensureYogaFlowState();
      if (flowState.activeDraftIndex < 0) {
        const pick = getYogaAutomationRouteIndex(flowState);
        selectYogaRoute(pick, false);
        return;
      }

      if (flowState.routeStability < 0.55 || flowState.routeProgress > 0.82) {
        anchorYogaBreathPhase(false);
      }
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
      if (checks.gymType !== 3 || !isUpgradePurchased(prestige.cardio.upgrades, 0)) {
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
      if (checks.gymType === -1) {
        autobuyUpgrades(upgrades, "upgrade", stats.money);
        autobuyUpgrades(bodyweight.upgrades, "bwUpgrade", stats.money);
        autobuyUpgrades(job.upgrades, "jobUpgrade", job.followers);
        autobuyUpgrades(research.upgrades, "resUpgrade", research.points);
      }

      const liftingUnlock = getUpgradeById(prestige.upgrades, 26);
      if (
        liftingUnlock &&
        !liftingUnlock.isPurchased &&
        prestige.current >= liftingUnlock.cost
      ) {
        globalUpgradeClick($("#globalUpgradeBtn26"), false);
      }
      const yogaUnlock = getUpgradeById(prestige.upgrades, 33);
      if (yogaUnlock && !yogaUnlock.isPurchased && prestige.current >= yogaUnlock.cost) {
        globalUpgradeClick($("#globalUpgradeBtn33"), false);
      }
      const cardioUnlock = getUpgradeById(prestige.upgrades, 43);
      if (cardioUnlock && !cardioUnlock.isPurchased && prestige.current >= cardioUnlock.cost) {
        globalUpgradeClick($("#globalUpgradeBtn43"), false);
      }

      autobuyUpgrades(prestige.upgrades, "globalUpgrade", prestige.current);
      autobuyUpgrades(prestige.bw.upgrades, "globalBwUpgrade", prestige.bw.current);
      autobuyUpgrades(prestige.lifting.upgrades, "globalLiftingUpgrade", prestige.lifting.current);
      autobuyUpgrades(prestige.yoga.upgrades, "globalYogaUpgrade", prestige.yoga.current);
      autobuyUpgrades(prestige.cardio.upgrades, "globalCardioUpgrade", prestige.cardio.current);
      autobuyUpgrades(prestige.bw.confidenceUpgrades || [], "confidenceUpgrade", prestige.bw.confidence);
      autobuyUpgrades(prestige.lifting.leadershipUpgrades || [], "leadershipUpgrade", prestige.lifting.leadership);
      autobuyUpgrades(prestige.yoga.flowUpgrades || [], "flowUpgrade", prestige.yoga.flow);
      autobuyUpgrades(prestige.cardio.paceUpgrades || [], "paceUpgrade", prestige.cardio.pace);

      if (checks.gymType !== -1) {
        autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
        autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
        autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);

        if (checks.gymType === 0) {
          autobuyUpgrades(gym.bw.upgrades, "bwUpgrade", stats.money);
          autobuyUpgrades(gym.bw.gymUpgrades, "gymBwUpgrade", stats.money);
          autobuyUpgrades(gym.bw.adUpgrades, "adBwUpgrade", gym.advertising.influence);
          let rival = null;
          for (let rivalIndex = 0; rivalIndex < bodyweight.gang.rivals.length; rivalIndex += 1) {
            if (!bodyweight.gang.rivals[rivalIndex].isAbsorbed) {
              rival = bodyweight.gang.rivals[rivalIndex];
              break;
            }
          }
          let shouldFight = false;
          if (rival != null) {
            const playerPower = gangPower(bodyweight.gang.strength, bodyweight.gang.members);
            const rivalPower = gangPower(rival.strength, rival.members);
            shouldFight = playerPower * 0.4 >= rivalPower;
          }
          if (shouldFight && !$("#gangFightBtn").hasClass("disabled")) {
            $("#gangFightBtn").click();
          }
        }

        if (checks.gymType === 1) {
          autobuyUpgrades(gym.lifting.upgrades, "liftingUpgrade", stats.money);
          autobuyUpgrades(gym.lifting.gymUpgrades, "gymLiftingUpgrade", stats.money);
          autobuyUpgrades(gym.lifting.adUpgrades, "adLiftingUpgrade", gym.advertising.influence);
          runAcademyPurchasePass();
        }

        if (checks.gymType === 2) {
          autobuyUpgrades(gym.yoga.upgrades, "yogaUpgrade", stats.money);
          autobuyUpgrades(gym.yoga.gymUpgrades, "gymYogaUpgrade", stats.money);
          autobuyUpgrades(gym.yoga.adUpgrades, "adYogaUpgrade", gym.advertising.influence);
          runYogaRouteManualPass();
        }

        if (checks.gymType === 3) {
          autobuyUpgrades(gym.cardio.upgrades, "cardioUpgrade", stats.money);
          autobuyUpgrades(gym.cardio.gymUpgrades, "gymCardioUpgrade", stats.money);
          autobuyUpgrades(gym.cardio.adUpgrades, "adCardioUpgrade", gym.advertising.influence);
          runCardioRaceManualPass();
        }

        autobuyEmployees(gym.employees.sales, "salesBtn");
        autobuyEmployees(gym.employees.trainers, "trainerBtn");
        autobuyEmployees(gym.employees.coordinators, "coordinatorBtn");
        autobuyEmployees(gym.employees.nutritionists, "nutritionistBtn");
        autobuyEmployees(gym.advertising.employees.coordinators, "adCoordinatorBtn");
        autobuyEmployees(gym.advertising.employees.designers, "designerBtn");
        autobuyEmployees(gym.advertising.employees.managers, "managerBtn");
      }

      if (!$("#coffeeBtn").hasClass("disabled")) {
        $("#coffeeBtn").click();
      }
      if (!$("#payDayBtn").hasClass("disabled")) {
        $("#payDayBtn").click();
      }
    }

    function runCheckInBurst() {
      for (let loops = 0; loops < checkInPasses; loops += 1) {
        const before = getTotalUpgradeCount();
        refreshPurchaseStates();
        buyAvailablePass();
        const after = getTotalUpgradeCount();
        if (after <= before) {
          break;
        }
      }
    }

    function fastForwardWithSlices(seconds) {
      let remaining = Math.max(0, Number(seconds) || 0);
      const slice = Math.max(1, Math.floor(stepSliceSeconds));
      while (remaining > 0) {
        const delta = Math.min(slice, remaining);
        window.__gainzTest.fastForward(delta * 1000, fastForwardTickMs);
        remaining -= delta;
      }
    }

    function isLiftingUnlocked() {
      return isUpgradePurchased(prestige.upgrades, 26);
    }

    function isYogaUnlocked() {
      return isUpgradePurchased(prestige.upgrades, 33);
    }

    function isCardioUnlocked() {
      return isUpgradePurchased(prestige.upgrades, 43);
    }

    function shouldHoldForMetaPoints() {
      if (!checks.isPrestige) {
        return false;
      }

      if (checks.gymType === 0 && isUpgradePurchased(prestige.bw.upgrades, 0)) {
        return bodyweight.gang.rivals.some((rival) => !rival.isAbsorbed);
      }

      if (checks.gymType === 1 && isUpgradePurchased(prestige.lifting.upgrades, 0)) {
        const academy = ensureLiftingAcademyState();
        return academy.seasonsCompleted < getAcademySeasonCap();
      }

      if (checks.gymType === 2 && isUpgradePurchased(prestige.yoga.upgrades, 0)) {
        const flowState = ensureYogaFlowState();
        return flowState.runEarned + META_POINT_EPSILON < getYogaFlowRunCap();
      }

      if (checks.gymType === 3 && isUpgradePurchased(prestige.cardio.upgrades, 0)) {
        const intervalState = ensureCardioIntervalState();
        return intervalState.runEarned + META_POINT_EPSILON < getCardioPaceRunCap();
      }

      return false;
    }

    function getUpgradeById(upgradeArray, upgradeId) {
      if (!Array.isArray(upgradeArray)) {
        return null;
      }
      for (let i = 0; i < upgradeArray.length; i += 1) {
        if (upgradeArray[i].id === upgradeId) {
          return upgradeArray[i];
        }
      }
      return null;
    }

    function getMetaProgressMetric() {
      if (checks.gymType === 0 && isUpgradePurchased(prestige.bw.upgrades, 0)) {
        const absorbed = bodyweight.gang.rivals.filter((rival) => rival.isAbsorbed).length;
        const nextRival = bodyweight.gang.rivals.find((rival) => !rival.isAbsorbed) || null;
        let nextProgress = 1;
        if (nextRival != null) {
          const rivalPower = gangPower(nextRival.strength, nextRival.members);
          const playerPower = gangPower(bodyweight.gang.strength, bodyweight.gang.members);
          nextProgress = rivalPower > 0 ? Math.min(1, playerPower / rivalPower) : 1;
        }
        return absorbed + nextProgress + prestige.bw.confidence;
      }

      if (checks.gymType === 1 && isUpgradePurchased(prestige.lifting.upgrades, 0)) {
        const academy = ensureLiftingAcademyState();
        const phaseProgress = academy.phaseTarget > 0 ? academy.progress / academy.phaseTarget : 0;
        return academy.seasonsCompleted + phaseProgress + prestige.lifting.leadership;
      }

      if (checks.gymType === 2 && isUpgradePurchased(prestige.yoga.upgrades, 0)) {
        const flowState = ensureYogaFlowState();
        return flowState.runEarned + Math.min(1, flowState.routeProgress || 0) + prestige.yoga.flow;
      }

      if (checks.gymType === 3 && isUpgradePurchased(prestige.cardio.upgrades, 0)) {
        const intervalState = ensureCardioIntervalState();
        return intervalState.runEarned + Math.min(1, intervalState.playerProgress || 0) + prestige.cardio.pace;
      }

      return 0;
    }

    function getBranchRemainingCost(gymType) {
      if (gymType === 0) {
        return getRemainingCost(prestige.bw.upgrades) + getRemainingCost(prestige.bw.confidenceUpgrades || []);
      }
      if (gymType === 1) {
        return getRemainingCost(prestige.lifting.upgrades) + getRemainingCost(prestige.lifting.leadershipUpgrades || []);
      }
      if (gymType === 2) {
        return getRemainingCost(prestige.yoga.upgrades) + getRemainingCost(prestige.yoga.flowUpgrades || []);
      }
      if (gymType === 3) {
        return getRemainingCost(prestige.cardio.upgrades) + getRemainingCost(prestige.cardio.paceUpgrades || []);
      }
      return 0;
    }

    function getCandidateGyms() {
      const candidateGyms = [0];
      if (isLiftingUnlocked()) {
        candidateGyms.push(1);
      }
      if (isYogaUnlocked()) {
        candidateGyms.push(2);
      }
      if (isCardioUnlocked()) {
        candidateGyms.push(3);
      }
      return candidateGyms;
    }

    function hasCompletedRunForGymType(gymType) {
      for (let i = 0; i < runHistory.length; i += 1) {
        if (runHistory[i].gymType === gymType) {
          return true;
        }
      }
      return false;
    }

    function chooseMixedNextGymType(completionState, candidateGyms) {
      if (!completionState.allConfidenceUpgrades) {
        return 0;
      }
      if (!completionState.allLeadershipUpgrades && isLiftingUnlocked()) {
        return 1;
      }
      if (!completionState.allFlowUpgrades && isYogaUnlocked()) {
        return 2;
      }
      if (!completionState.allPaceUpgrades && isCardioUnlocked()) {
        return 3;
      }

      const remaining = [];
      for (let i = 0; i < candidateGyms.length; i += 1) {
        const gymType = candidateGyms[i];
        const cost = getBranchRemainingCost(gymType);
        if (cost > 0) {
          remaining.push({ gymType, cost });
        }
      }

      if (remaining.length > 0) {
        remaining.sort((a, b) => b.cost - a.cost);
        return remaining[0].gymType;
      }

      if (!completionState.allGlobalPrestigeUpgrades) {
        let chosen = candidateGyms[0];
        let minPoints = Infinity;
        for (let i = 0; i < candidateGyms.length; i += 1) {
          const gymType = candidateGyms[i];
          let points = 0;
          if (gymType === 0) {
            points = prestige.bw.current;
          } else if (gymType === 1) {
            points = prestige.lifting.current;
          } else if (gymType === 2) {
            points = prestige.yoga.current;
          } else if (gymType === 3) {
            points = prestige.cardio.current;
          }
          if (points < minPoints) {
            minPoints = points;
            chosen = gymType;
          }
        }
        return chosen;
      }

      return candidateGyms[0];
    }

    function chooseBranchLockedNextGymType(completionState, candidateGyms) {
      let focusGymType = null;
      if (!completionState.allBwBranch) {
        focusGymType = 0;
      } else if (isLiftingUnlocked() && !completionState.allLiftingBranch) {
        focusGymType = 1;
      } else if (isYogaUnlocked() && !completionState.allYogaBranch) {
        focusGymType = 2;
      } else if (isCardioUnlocked() && !completionState.allCardioBranch) {
        focusGymType = 3;
      }

      if (focusGymType != null) {
        for (let i = 0; i < candidateGyms.length; i += 1) {
          const gymType = candidateGyms[i];
          if (gymType === focusGymType) {
            continue;
          }
          if (!hasCompletedRunForGymType(gymType)) {
            return gymType;
          }
        }

        if (candidateGyms.includes(focusGymType)) {
          return focusGymType;
        }
      }

      return chooseMixedNextGymType(completionState, candidateGyms);
    }

    function chooseNextGymType(completionState) {
      const candidateGyms = getCandidateGyms();
      if (simPolicyKey === "branch_locked_10m") {
        return chooseBranchLockedNextGymType(completionState, candidateGyms);
      }
      return chooseMixedNextGymType(completionState, candidateGyms);
    }

    function getGymSnapshotAtPrestige(gymType) {
      if (gymType === 0) {
        return {
          gangsAbsorbed: bodyweight.gang.rivals.filter((rival) => rival.isAbsorbed).length,
          totalRivals: bodyweight.gang.rivals.length,
        };
      }
      if (gymType === 1) {
        const academy = ensureLiftingAcademyState();
        return {
          academySeasonsCompleted: academy.seasonsCompleted,
          academySeasonCap: getAcademySeasonCap(),
          academyPhase: academy.phase,
          academyProgress: academy.progress,
          academyPhaseTarget: academy.phaseTarget,
          academyCampExpansionLevel: getAcademyCampPointBoostLevel(),
        };
      }
      if (gymType === 2) {
        const flowState = ensureYogaFlowState();
        return {
          flowRunEarned: flowState.runEarned,
          flowRunCap: getYogaFlowRunCap(),
          routesCompleted: flowState.totalCycles,
          averageRouteQuality: flowState.averageQuality,
        };
      }
      if (gymType === 3) {
        const intervalState = ensureCardioIntervalState();
        return {
          paceRunEarned: intervalState.runEarned,
          paceRunCap: getCardioPaceRunCap(),
          racesCompleted: intervalState.totalRaces,
          averageRaceQuality: intervalState.averageQuality,
          racePlace: intervalState.currentPlace,
        };
      }
      return null;
    }
    const resumedSimulation =
      resumeCheckpoint != null && resumeCheckpoint.simulation != null
        ? resumeCheckpoint.simulation
        : null;
    const runHistory =
      resumedSimulation && Array.isArray(resumedSimulation.runHistory)
        ? resumedSimulation.runHistory
        : [];
    const prestigePurchaseEvents =
      resumedSimulation && Array.isArray(resumedSimulation.prestigePurchaseEvents)
        ? resumedSimulation.prestigePurchaseEvents
        : [];
    const completionMilestones =
      resumedSimulation && resumedSimulation.completionMilestones != null
        ? resumedSimulation.completionMilestones
        : {
            allGlobalPrestigeUpgradesAt: null,
            allBwPrestigeUpgradesAt: null,
            allLiftingPrestigeUpgradesAt: null,
            allYogaPrestigeUpgradesAt: null,
            allCardioPrestigeUpgradesAt: null,
            allConfidenceUpgradesAt: null,
            allLeadershipUpgradesAt: null,
            allFlowUpgradesAt: null,
            allPaceUpgradesAt: null,
            allBwBranchAt: null,
            allLiftingBranchAt: null,
            allYogaBranchAt: null,
            allCardioBranchAt: null,
            allNonRepeatableAt: null,
          };

    let elapsedSeconds =
      resumedSimulation != null ? normalizeFinite(resumedSimulation.elapsedSeconds, 0) : 0;
    let currentRunStartSeconds =
      resumedSimulation != null ? normalizeFinite(resumedSimulation.currentRunStartSeconds, 0) : 0;
    let currentRunGymType =
      resumedSimulation != null
        ? normalizeFinite(resumedSimulation.currentRunGymType, checks.gymType)
        : checks.gymType;
    let lastPrestigeCounts =
      resumedSimulation != null && resumedSimulation.lastPrestigeCounts != null
        ? resumedSimulation.lastPrestigeCounts
        : getPrestigePurchaseCounts();
    let completionState =
      resumedSimulation != null && resumedSimulation.completionState != null
        ? resumedSimulation.completionState
        : getCompletionState();
    let readySinceSeconds =
      resumedSimulation != null && resumedSimulation.readySinceSeconds != null
        ? normalizeFinite(resumedSimulation.readySinceSeconds, null)
        : null;
    let lastMetaProgressAtSeconds =
      resumedSimulation != null && resumedSimulation.lastMetaProgressAtSeconds != null
        ? normalizeFinite(resumedSimulation.lastMetaProgressAtSeconds, null)
        : null;
    let lastMetaMetric =
      resumedSimulation != null && resumedSimulation.lastMetaMetric != null
        ? normalizeFinite(resumedSimulation.lastMetaMetric, null)
        : null;
    let loopInitialized =
      resumedSimulation != null && resumedSimulation.loopInitialized === true;
    let repeatablesBought =
      resumedSimulation != null && resumedSimulation.repeatablesBought === true;

    function updateMilestones() {
      completionState = getCompletionState();

      if (completionMilestones.allGlobalPrestigeUpgradesAt == null && completionState.allGlobalPrestigeUpgrades) {
        completionMilestones.allGlobalPrestigeUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allBwPrestigeUpgradesAt == null && completionState.allBwPrestigeUpgrades) {
        completionMilestones.allBwPrestigeUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allLiftingPrestigeUpgradesAt == null && completionState.allLiftingPrestigeUpgrades) {
        completionMilestones.allLiftingPrestigeUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allYogaPrestigeUpgradesAt == null && completionState.allYogaPrestigeUpgrades) {
        completionMilestones.allYogaPrestigeUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allCardioPrestigeUpgradesAt == null && completionState.allCardioPrestigeUpgrades) {
        completionMilestones.allCardioPrestigeUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allConfidenceUpgradesAt == null && completionState.allConfidenceUpgrades) {
        completionMilestones.allConfidenceUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allLeadershipUpgradesAt == null && completionState.allLeadershipUpgrades) {
        completionMilestones.allLeadershipUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allFlowUpgradesAt == null && completionState.allFlowUpgrades) {
        completionMilestones.allFlowUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allPaceUpgradesAt == null && completionState.allPaceUpgrades) {
        completionMilestones.allPaceUpgradesAt = elapsedSeconds;
      }
      if (completionMilestones.allBwBranchAt == null && completionState.allBwBranch) {
        completionMilestones.allBwBranchAt = elapsedSeconds;
      }
      if (completionMilestones.allLiftingBranchAt == null && completionState.allLiftingBranch) {
        completionMilestones.allLiftingBranchAt = elapsedSeconds;
      }
      if (completionMilestones.allYogaBranchAt == null && completionState.allYogaBranch) {
        completionMilestones.allYogaBranchAt = elapsedSeconds;
      }
      if (completionMilestones.allCardioBranchAt == null && completionState.allCardioBranch) {
        completionMilestones.allCardioBranchAt = elapsedSeconds;
      }
      if (completionMilestones.allNonRepeatableAt == null && completionState.allNonRepeatable) {
        completionMilestones.allNonRepeatableAt = elapsedSeconds;
      }
    }

    function recordPrestigePurchaseEvent() {
      const nextCounts = getPrestigePurchaseCounts();
      if (
        nextCounts.global !== lastPrestigeCounts.global ||
        nextCounts.bodyweight !== lastPrestigeCounts.bodyweight ||
        nextCounts.lifting !== lastPrestigeCounts.lifting ||
        nextCounts.yoga !== lastPrestigeCounts.yoga ||
        nextCounts.cardio !== lastPrestigeCounts.cardio ||
        nextCounts.confidenceShop !== lastPrestigeCounts.confidenceShop ||
        nextCounts.leadershipShop !== lastPrestigeCounts.leadershipShop ||
        nextCounts.flowShop !== lastPrestigeCounts.flowShop ||
        nextCounts.paceShop !== lastPrestigeCounts.paceShop
      ) {
        prestigePurchaseEvents.push({
          atSeconds: elapsedSeconds,
          ...nextCounts,
          total:
            nextCounts.global +
            nextCounts.bodyweight +
            nextCounts.lifting +
            nextCounts.yoga +
            nextCounts.cardio +
            nextCounts.confidenceShop +
            nextCounts.leadershipShop +
            nextCounts.flowShop +
            nextCounts.paceShop,
        });
        lastPrestigeCounts = nextCounts;
      }
    }

    if (!loopInitialized) {
      prestigePurchaseEvents.push({
        atSeconds: elapsedSeconds,
        ...lastPrestigeCounts,
        total:
          lastPrestigeCounts.global +
          lastPrestigeCounts.bodyweight +
          lastPrestigeCounts.lifting +
          lastPrestigeCounts.yoga +
          lastPrestigeCounts.cardio +
          lastPrestigeCounts.confidenceShop +
          lastPrestigeCounts.leadershipShop +
          lastPrestigeCounts.flowShop +
          lastPrestigeCounts.paceShop,
      });

      runCheckInBurst();
      updateMilestones();
      recordPrestigePurchaseEvent();
      loopInitialized = true;
    }

    while (
      elapsedSeconds < maxSimSeconds &&
      elapsedSeconds < targetElapsedSeconds &&
      !completionState.allNonRepeatable
    ) {
      fastForwardWithSlices(stepSeconds);
      elapsedSeconds += stepSeconds;
      runCheckInBurst();
      updateMilestones();
      recordPrestigePurchaseEvent();

      if (!checks.isPrestige) {
        readySinceSeconds = null;
        lastMetaProgressAtSeconds = null;
        lastMetaMetric = null;
        continue;
      }

      const shouldWait = shouldHoldForMetaPoints();
      if (shouldWait) {
        if (readySinceSeconds == null) {
          readySinceSeconds = elapsedSeconds;
          lastMetaProgressAtSeconds = elapsedSeconds;
          lastMetaMetric = getMetaProgressMetric();
          continue;
        }

        const nextMetric = getMetaProgressMetric();
        if (nextMetric > lastMetaMetric + META_POINT_EPSILON) {
          lastMetaMetric = nextMetric;
          lastMetaProgressAtSeconds = elapsedSeconds;
          continue;
        }

        const heldFor = elapsedSeconds - readySinceSeconds;
        const stalledFor = elapsedSeconds - lastMetaProgressAtSeconds;
        if (heldFor < maxMetaHoldSeconds && stalledFor < maxMetaStallSeconds) {
          continue;
        }
      }

      runHistory.push({
        runIndex: runHistory.length + 1,
        gymType: currentRunGymType,
        runStartSeconds: currentRunStartSeconds,
        runEndSeconds: elapsedSeconds,
        durationSeconds: elapsedSeconds - currentRunStartSeconds,
        gainsPreview: {
          global: calculateGlobalPrestigeGain(),
          bodyweight: calculateBodyweightPrestigeGain(),
          lifting: calculateLiftingPrestigeGain(),
          yoga: checks.gymType === 2 ? prestige.yoga.total + 1 : 0,
          cardio: checks.gymType === 3 ? prestige.cardio.total + 1 : 0,
        },
        metaAtPrestige: {
          confidence: prestige.bw.confidence,
          leadership: prestige.lifting.leadership,
          flow: prestige.yoga.flow,
          pace: prestige.cardio.pace,
        },
        gymSnapshotAtPrestige: getGymSnapshotAtPrestige(currentRunGymType),
        branchRemainingCost: {
          bodyweight: getBranchRemainingCost(0),
          lifting: getBranchRemainingCost(1),
          yoga: getBranchRemainingCost(2),
          cardio: getBranchRemainingCost(3),
        },
      });

      readySinceSeconds = null;
      lastMetaProgressAtSeconds = null;
      lastMetaMetric = null;

      const nextGymType = chooseNextGymType(completionState);
      newGym(nextGymType);
      currentRunGymType = checks.gymType;
      currentRunStartSeconds = elapsedSeconds;

      runCheckInBurst();
      updateMilestones();
      recordPrestigePurchaseEvent();
    }

    if (completionState.allNonRepeatable && !repeatablesBought) {
      buyRepeatingPass();
      repeatablesBought = true;
    }

    assertValidState("content_completion_profile", { strict: true });
    updateMilestones();
    save(true);

    const simulation = {
      config: {
        maxSimSeconds,
        stepSeconds,
        stepSliceSeconds,
        fastForwardTickMs,
        checkInPasses,
        maxMetaHoldSeconds,
        maxMetaStallSeconds,
      },
      finished: completionState.allNonRepeatable,
      elapsedSeconds,
      currentRunStartSeconds,
      currentRunGymType,
      lastPrestigeCounts,
      readySinceSeconds,
      lastMetaProgressAtSeconds,
      lastMetaMetric,
      loopInitialized,
      repeatablesBought,
      finalGymType: checks.gymType,
      runHistory,
      prestigePurchaseEvents,
      completionMilestones,
      completionState,
      finalState: {
        prestigeTotals: {
          global: prestige.total,
          bodyweight: prestige.bw.total,
          lifting: prestige.lifting.total,
          yoga: prestige.yoga.total,
          cardio: prestige.cardio.total,
        },
        prestigeCurrent: {
          global: prestige.current,
          bodyweight: prestige.bw.current,
          lifting: prestige.lifting.current,
          yoga: prestige.yoga.current,
          cardio: prestige.cardio.current,
        },
        metaPoints: {
          confidence: prestige.bw.confidence,
          leadership: prestige.lifting.leadership,
          flow: prestige.yoga.flow,
          pace: prestige.cardio.pace,
        },
      },
      assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
      firstAssertion:
        Array.isArray(window.__gainzAssertLog) && window.__gainzAssertLog.length > 0
          ? window.__gainzAssertLog[0]
          : null,
      policy: {
        waitForMetaPointsBeforePrestige: true,
        buyRepeatablesLast: true,
      },
    };

    return {
      simulation,
      checkpoint: {
        clockNow: typeof window.__gainzTest?.now === "function" ? window.__gainzTest.now() : 0,
        randomState:
          window.__gainzRandom && typeof window.__gainzRandom.getState === "function"
            ? window.__gainzRandom.getState()
            : null,
        saveObject: JSON.parse(localStorage.getItem(saveName)),
        simulation,
      },
    };
  }, { config: SIM_CONFIG, resumeCheckpoint, stopAtElapsedSeconds, simPolicyKey: SIM_POLICY.key });

  const perfEnd = process.hrtime.bigint();
  const endedAt = Date.now();
  await context.close();

  return {
    startedAt,
    endedAt,
    wallClockElapsedMs: Number(perfEnd - perfStart) / 1_000_000,
    runtimeErrors,
    simulation: result.simulation,
    checkpoint: result.checkpoint,
  };
}

async function runCompletionSimulation(browser, port, resumeCheckpoint) {
  let simulationResult = null;
  let latestCheckpoint = resumeCheckpoint;
  let checkpointWrites =
    resumeCheckpoint != null ? normalizeFiniteNumber(resumeCheckpoint.checkpointCount, 0) : 0;
  let stoppedAfterCheckpointLimit = false;
  let resumedFromCheckpoint = resumeCheckpoint != null;
  let invocationStartedAt = null;
  let invocationEndedAt = null;
  let totalWallClockElapsedMs = 0;
  let runtimeErrors = [];

  while (true) {
    const targetElapsedSeconds =
      latestCheckpoint != null && latestCheckpoint.simulation != null
        ? normalizeFiniteNumber(latestCheckpoint.simulation.elapsedSeconds, 0) + Math.max(1, CONTENT_SIM_CHECKPOINT_EVERY_SECONDS)
        : Math.max(1, CONTENT_SIM_CHECKPOINT_EVERY_SECONDS);
    const windowResult = await runCompletionSimulationWindow(
      browser,
      port,
      latestCheckpoint,
      targetElapsedSeconds
    );

    if (invocationStartedAt == null) {
      invocationStartedAt = windowResult.startedAt;
    }
    invocationEndedAt = windowResult.endedAt;
    totalWallClockElapsedMs += windowResult.wallClockElapsedMs;
    runtimeErrors.push(...windowResult.runtimeErrors);
    simulationResult = windowResult.simulation;
    latestCheckpoint = windowResult.checkpoint;

    checkpointWrites += 1;
    writeCheckpoint({
      version: CHECKPOINT_VERSION,
      fingerprint: CONTENT_SIM_FINGERPRINT,
      savedAt: new Date().toISOString(),
      simPolicy: SIM_POLICY,
      simConfig: SIM_CONFIG,
      checkpointCount: checkpointWrites,
      ...latestCheckpoint,
    });

    if (simulationResult.finished || simulationResult.elapsedSeconds >= SIM_CONFIG.maxSimSeconds) {
      clearCheckpoint();
      break;
    }

    if (
      CONTENT_SIM_EXIT_AFTER_CHECKPOINTS > 0 &&
      checkpointWrites >= CONTENT_SIM_EXIT_AFTER_CHECKPOINTS
    ) {
      stoppedAfterCheckpointLimit = true;
      break;
    }
  }

  return {
    startedAt: invocationStartedAt,
    endedAt: invocationEndedAt,
    wallClockElapsedMs: totalWallClockElapsedMs,
    runtimeErrors,
    simulation: simulationResult,
    resumedFromCheckpoint,
    checkpointWrites,
    stoppedAfterCheckpointLimit,
  };
}
function summarizeRunsByGym(runHistory) {
  const summary = {};
  for (let i = 0; i < runHistory.length; i += 1) {
    const run = runHistory[i];
    const key = String(run.gymType);
    if (!summary[key]) {
      summary[key] = {
        gymType: run.gymType,
        gymLabel: GYM_LABELS[key] || `Gym ${run.gymType}`,
        runCount: 0,
        totalDurationSeconds: 0,
        firstThreeDurations: [],
      };
    }

    summary[key].runCount += 1;
    summary[key].totalDurationSeconds += run.durationSeconds;
    if (summary[key].firstThreeDurations.length < 3) {
      summary[key].firstThreeDurations.push(run.durationSeconds);
    }
  }

  return Object.values(summary)
    .sort((a, b) => a.gymType - b.gymType)
    .map((entry) => ({
      gymType: entry.gymType,
      gymLabel: entry.gymLabel,
      runCount: entry.runCount,
      avgRunDurationSeconds:
        entry.runCount > 0 ? entry.totalDurationSeconds / entry.runCount : null,
      firstThreeDurations: entry.firstThreeDurations,
    }));
}

function derivePacingIssues(simulation) {
  const issues = [];
  const layer1Runs = simulation.runHistory.filter((run) => run.gymType !== -1);

  if (layer1Runs.length >= 2) {
    const first = layer1Runs[0].durationSeconds;
    const second = layer1Runs[1].durationSeconds;
    if (second < first * 0.65) {
      issues.push("Layer 1 run 2 is over 35% faster than run 1; acceleration may feel abrupt.");
    }
  }

  const longRuns = layer1Runs.filter((run) => run.durationSeconds > 6 * 60 * 60);
  if (longRuns.length > 0) {
    issues.push("At least one Layer 1 run exceeded 6h; branch pacing drag remains.");
  }

  const veryShortRuns = layer1Runs.filter((run) => run.durationSeconds < 30 * 60);
  if (veryShortRuns.length > 0) {
    issues.push("At least one Layer 1 run is under 30m; late-game pacing may collapse.");
  }

  const yogaRuns = simulation.runHistory.filter((run) => run.gymType === 2);
  if (yogaRuns.length > 0) {
    const weakFlowRuns = yogaRuns.filter((run) => {
      const routesCompleted = Number(run.gymSnapshotAtPrestige?.routesCompleted || 0);
      if (routesCompleted <= 0) {
        return false;
      }
      const earned = Number(run.gymSnapshotAtPrestige?.flowRunEarned || 0);
      const cap = Number(run.gymSnapshotAtPrestige?.flowRunCap || 1);
      return earned + 1e-6 < cap * 0.75;
    });
    if (weakFlowRuns.length > 0) {
      issues.push("Some yoga runs did not reach at least 75% of the Flow run cap before prestige.");
    }
  }

  const cardioRuns = simulation.runHistory.filter((run) => run.gymType === 3);
  if (cardioRuns.length > 0) {
    const weakPaceRuns = cardioRuns.filter((run) => {
      const racesCompleted = Number(run.gymSnapshotAtPrestige?.racesCompleted || 0);
      if (racesCompleted <= 0) {
        return false;
      }
      const earned = Number(run.gymSnapshotAtPrestige?.paceRunEarned || 0);
      const cap = Number(run.gymSnapshotAtPrestige?.paceRunCap || 1);
      return earned + 1e-6 < cap * 0.75;
    });
    if (weakPaceRuns.length > 0) {
      issues.push("Some cardio runs did not reach at least 75% of the Pace run cap before prestige.");
    }
  }

  if (issues.length === 0) {
    issues.push("No major pacing spikes detected under active policy.");
  }

  return issues;
}

function deriveContentGaps(simulation) {
  const gaps = [];
  const milestones = simulation.completionMilestones;
  const contentEnd = milestones.allNonRepeatableAt ?? simulation.elapsedSeconds;

  if (
    milestones.allGlobalPrestigeUpgradesAt != null &&
    contentEnd - milestones.allGlobalPrestigeUpgradesAt > 3 * 60 * 60
  ) {
    gaps.push("Global shop empties over 3h before full completion; add late global sinks or upgrades.");
  }

  if (
    milestones.allYogaPrestigeUpgradesAt != null &&
    milestones.allFlowUpgradesAt != null &&
    milestones.allFlowUpgradesAt - milestones.allYogaPrestigeUpgradesAt > 2 * 60 * 60
  ) {
    gaps.push("Flow shop trails yoga branch completion by over 2h; yoga Flow cadence likely too slow.");
  }

  if (
    milestones.allCardioPrestigeUpgradesAt != null &&
    milestones.allPaceUpgradesAt != null &&
    milestones.allPaceUpgradesAt - milestones.allCardioPrestigeUpgradesAt > 2 * 60 * 60
  ) {
    gaps.push("Pace shop trails cardio branch completion by over 2h; cardio Pace cadence likely too slow.");
  }

  if (gaps.length === 0) {
    gaps.push("No major shop exhaustion gaps detected under active policy.");
  }

  return gaps;
}

function buildTimingSummary(simulation) {
  const layer0Run = simulation.runHistory.find((run) => run.gymType === -1) || null;
  const layer1Runs = simulation.runHistory.filter((run) => run.gymType !== -1);

  return {
    firstLayer0PrestigeSeconds: layer0Run ? layer0Run.durationSeconds : null,
    firstThreeLayer1PrestigeSeconds: [
      layer1Runs[0]?.durationSeconds ?? null,
      layer1Runs[1]?.durationSeconds ?? null,
      layer1Runs[2]?.durationSeconds ?? null,
    ],
    firstGymRunByType: {
      bodyweight: (simulation.runHistory.find((run) => run.gymType === 0) || {}).durationSeconds ?? null,
      lifting: (simulation.runHistory.find((run) => run.gymType === 1) || {}).durationSeconds ?? null,
      yoga: (simulation.runHistory.find((run) => run.gymType === 2) || {}).durationSeconds ?? null,
      cardio: (simulation.runHistory.find((run) => run.gymType === 3) || {}).durationSeconds ?? null,
    },
    completionMilestones: {
      global: simulation.completionMilestones.allGlobalPrestigeUpgradesAt,
      bodyweightBranch: simulation.completionMilestones.allBwBranchAt,
      liftingBranch: simulation.completionMilestones.allLiftingBranchAt,
      yogaBranch: simulation.completionMilestones.allYogaBranchAt,
      cardioBranch: simulation.completionMilestones.allCardioBranchAt,
      allNonRepeatable: simulation.completionMilestones.allNonRepeatableAt,
    },
  };
}

function summarizeForConsole(runResult, pacingIssues, contentGaps) {
  const sim = runResult.simulation;
  return {
    finished: sim.finished,
    simDuration: formatDuration(sim.elapsedSeconds),
    wallClockMs: Number(runResult.wallClockElapsedMs.toFixed(2)),
    totalPrestigeRuns: sim.runHistory.length,
    globalPrestiges: sim.finalState.prestigeTotals.global,
    bodyweightPrestiges: sim.finalState.prestigeTotals.bodyweight,
    liftingPrestiges: sim.finalState.prestigeTotals.lifting,
    yogaPrestiges: sim.finalState.prestigeTotals.yoga,
    cardioPrestiges: sim.finalState.prestigeTotals.cardio,
    confidence: Number(sim.finalState.metaPoints.confidence.toFixed(2)),
    leadership: Number(sim.finalState.metaPoints.leadership.toFixed(2)),
    flow: Number(sim.finalState.metaPoints.flow.toFixed(2)),
    pace: Number(sim.finalState.metaPoints.pace.toFixed(2)),
    assertionCount: sim.assertionCount,
    runtimeErrors: runResult.runtimeErrors.length,
    pacingIssues: pacingIssues.length,
    contentGaps: contentGaps.length,
  };
}

async function main() {
  ensureDir(REPORT_DIR);
  if (CONTENT_SIM_CLEAR_CHECKPOINT) {
    clearCheckpoint();
  }
  const resumeCheckpoint = loadCheckpoint();

  const serverInfo = await createStaticServer();
  const server = serverInfo.server;
  const port = serverInfo.port;
  const browser = await chromium.launch({ headless: true });

  let runResult;
  try {
    runResult = await runCompletionSimulation(browser, port, resumeCheckpoint);
  } finally {
    await browser.close();
    await closeServer(server);
  }

  const runSummaryByGym = summarizeRunsByGym(runResult.simulation.runHistory);
  const pacingIssues = derivePacingIssues(runResult.simulation);
  const contentGaps = deriveContentGaps(runResult.simulation);
  const timingSummary = buildTimingSummary(runResult.simulation);

  const report = {
    generatedAt: new Date().toISOString(),
    scenario: `full_content_completion_${SIM_POLICY.mode}`,
    policy: SIM_POLICY,
    checkpointing: {
      resumedFromCheckpoint: runResult.resumedFromCheckpoint,
      fingerprint: CONTENT_SIM_FINGERPRINT,
      checkpointWrites: runResult.checkpointWrites,
      checkpointPath: CHECKPOINT_PATH,
      checkpointEverySeconds: CONTENT_SIM_CHECKPOINT_EVERY_SECONDS,
      stoppedAfterCheckpointLimit: runResult.stoppedAfterCheckpointLimit,
    },
    run: runResult,
    runSummaryByGym,
    timingSummary,
    pacingIssues,
    contentGapCandidates: contentGaps,
  };

  const timestampedPath = path.join(
    REPORT_DIR,
    `content-completion-${formatTimestamp(new Date())}.json`,
  );

  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2));
  if (runResult.simulation.finished) {
    fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));
    fs.writeFileSync(POLICY_LATEST_REPORT_PATH, JSON.stringify(report, null, 2));
  }

  console.log("Content Completion Simulation");
  console.table([summarizeForConsole(runResult, pacingIssues, contentGaps)]);
  console.log("Run Summary By Gym");
  console.table(
    runSummaryByGym.map((entry) => ({
      gymType: entry.gymType,
      gym: entry.gymLabel,
      runCount: entry.runCount,
      avgRunDuration: formatDuration(entry.avgRunDurationSeconds),
      run1: formatDuration(entry.firstThreeDurations[0]),
      run2: formatDuration(entry.firstThreeDurations[1]),
      run3: formatDuration(entry.firstThreeDurations[2]),
    })),
  );
  console.log("Timing Summary");
  console.table([
    {
      layer0First: formatDuration(timingSummary.firstLayer0PrestigeSeconds),
      layer1Run1: formatDuration(timingSummary.firstThreeLayer1PrestigeSeconds[0]),
      layer1Run2: formatDuration(timingSummary.firstThreeLayer1PrestigeSeconds[1]),
      layer1Run3: formatDuration(timingSummary.firstThreeLayer1PrestigeSeconds[2]),
      bwFirst: formatDuration(timingSummary.firstGymRunByType.bodyweight),
      liftingFirst: formatDuration(timingSummary.firstGymRunByType.lifting),
      yogaFirst: formatDuration(timingSummary.firstGymRunByType.yoga),
      cardioFirst: formatDuration(timingSummary.firstGymRunByType.cardio),
      allNonRepeatable: formatDuration(timingSummary.completionMilestones.allNonRepeatable),
    },
  ]);
  console.log("Pacing Issues");
  pacingIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
  console.log("Content Gap Candidates");
  contentGaps.forEach((gap, index) => {
    console.log(`${index + 1}. ${gap}`);
  });
  console.log(`Report written: ${timestampedPath}`);
  if (runResult.simulation.finished) {
    console.log(`Latest report: ${LATEST_REPORT_PATH}`);
    console.log(`Policy latest report: ${POLICY_LATEST_REPORT_PATH}`);
  } else {
    console.log(`Checkpoint saved: ${CHECKPOINT_PATH}`);
  }

  if (
    runResult.runtimeErrors.length > 0 ||
    runResult.simulation.assertionCount > 0 ||
    (!runResult.simulation.finished && !runResult.stoppedAfterCheckpointLimit)
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
