const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "long-sim-profile-latest.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

const OFFLINE_SCENARIOS = [
  { id: "offline_8h", label: "Offline 8h", durationSeconds: 8 * 60 * 60 },
  { id: "offline_24h", label: "Offline 24h", durationSeconds: 24 * 60 * 60 },
];

const POLICY_SCENARIOS = [
  {
    id: "policy_human_active_5m",
    label: "Human-Active Policy (5m)",
    maxDurationSeconds: 12 * 60 * 60,
    checkInPatternSeconds: [5 * 60],
  },
  {
    id: "policy_semi_active_15_30",
    label: "Semi-Active Policy (15-30m)",
    maxDurationSeconds: 24 * 60 * 60,
    checkInPatternSeconds: [15 * 60, 20 * 60, 25 * 60, 30 * 60],
  },
];

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

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
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
      const port =
        typeof address === "object" && address != null ? address.port : REQUESTED_PORT;
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

function collectMetricsJs() {
  return {
    nowMs: window.__gainzTest.now(),
    money: stats.money,
    strength: stats.strength,
    endurance: stats.endurance,
    agility: stats.agility,
    intelligence: stats.intelligence,
    followers: job.followers,
    views: job.views,
    researchPoints: research.points,
    influence: gym.advertising.influence,
    gymMembers: gym.members.current,
    globalPrestigeCurrent: prestige.current,
    bwPrestigeCurrent: prestige.bw.current,
    liftingPrestigeCurrent: prestige.lifting.current,
    isPrestigeReady: checks.isPrestige,
    story5: checks.story5,
    gymType: checks.gymType,
    assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
  };
}

function diffMetrics(before, after) {
  return {
    money: after.money - before.money,
    strength: after.strength - before.strength,
    endurance: after.endurance - before.endurance,
    agility: after.agility - before.agility,
    intelligence: after.intelligence - before.intelligence,
    followers: after.followers - before.followers,
    views: after.views - before.views,
    researchPoints: after.researchPoints - before.researchPoints,
    influence: after.influence - before.influence,
    gymMembers: after.gymMembers - before.gymMembers,
    globalPrestigeCurrent: after.globalPrestigeCurrent - before.globalPrestigeCurrent,
    bwPrestigeCurrent: after.bwPrestigeCurrent - before.bwPrestigeCurrent,
    liftingPrestigeCurrent: after.liftingPrestigeCurrent - before.liftingPrestigeCurrent,
    assertionCount: after.assertionCount - before.assertionCount,
  };
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

async function runOfflineScenario(browser, scenario, port) {
  const { context, page, runtimeErrors } = await createInstrumentedPage(browser, port);

  await page.evaluate(() => {
    // Seed a stable mid-run profile so long-sim deltas are meaningful.
    stats.money = Math.max(stats.money, 10_000);
    stats.strength = Math.max(stats.strength, 20);
    stats.endurance = Math.max(stats.endurance, 20);
    stats.agility = Math.max(stats.agility, 20);
    stats.intelligence = Math.max(stats.intelligence, 20);

    job.views = Math.max(job.views, 5_000);
    job.followers = Math.max(job.followers, 1_000);
    job.influencers = Math.max(job.influencers, 50);
    job.followerGrowth = Math.max(job.followerGrowth, 100);

    research.posts = Math.max(research.posts, 2_000);
    research.points = Math.max(research.points, 500);
    research.bots = Math.max(research.bots, 25);
    research.postGrowth = Math.max(research.postGrowth, 50);
  });

  const before = await page.evaluate(collectMetricsJs);
  const startedAt = Date.now();
  const perfStart = process.hrtime.bigint();

  await page.evaluate((durationSeconds) => {
    applyOfflineProgress(durationSeconds);
    assertValidState("long_sim_profile_offline");
  }, scenario.durationSeconds);

  const perfEnd = process.hrtime.bigint();
  const endedAt = Date.now();
  const after = await page.evaluate(collectMetricsJs);
  await context.close();

  const elapsedMs = Number(perfEnd - perfStart) / 1_000_000;
  return {
    id: scenario.id,
    label: scenario.label,
    category: "offline_profile",
    simulationMethod: "applyOfflineProgress",
    simDurationSeconds: scenario.durationSeconds,
    startedAt,
    endedAt,
    wallClockElapsedMs: elapsedMs,
    runtimeErrors,
    before,
    after,
    delta: diffMetrics(before, after),
  };
}

async function runPolicyScenario(browser, scenario, port) {
  const { context, page, runtimeErrors } = await createInstrumentedPage(browser, port);

  const before = await page.evaluate(collectMetricsJs);
  const startedAt = Date.now();
  const perfStart = process.hrtime.bigint();

  const simulationOutcome = await page.evaluate(
    ({ maxDurationSeconds, checkInPatternSeconds }) => {
      function totalPurchasedCount() {
        let total = 0;
        const arrays = [upgrades, bodyweight.upgrades, job.upgrades, research.upgrades];
        for (let i = 0; i < arrays.length; i += 1) {
          for (let j = 0; j < arrays[i].length; j += 1) {
            if (arrays[i][j].isPurchased) {
              total += 1;
            }
          }
        }
        return total;
      }

      function runCheckInBurst() {
        let changed = true;
        let loops = 0;

        while (changed && loops < 20) {
          const purchasedBefore = totalPurchasedCount();
          autobuyUpgrades(upgrades, "upgrade", stats.money);
          autobuyUpgrades(bodyweight.upgrades, "bwUpgrade", stats.money);
          autobuyUpgrades(job.upgrades, "jobUpgrade", job.followers);
          autobuyUpgrades(research.upgrades, "resUpgrade", research.points);
          const purchasedAfter = totalPurchasedCount();
          changed = purchasedAfter > purchasedBefore;
          loops += 1;
        }

        if (!$("#coffeeBtn").hasClass("disabled")) {
          $("#coffeeBtn").click();
        }
        if (!$("#payDayBtn").hasClass("disabled")) {
          $("#payDayBtn").click();
        }
      }

      let elapsedSeconds = 0;
      let checkIns = 0;
      let patternIndex = 0;

      runCheckInBurst();
      checkIns += 1;

      while (elapsedSeconds < maxDurationSeconds && !checks.isPrestige) {
        const intervalSeconds =
          checkInPatternSeconds[patternIndex % checkInPatternSeconds.length];
        patternIndex += 1;

        const stepSeconds = Math.min(intervalSeconds, maxDurationSeconds - elapsedSeconds);
        window.__gainzTest.fastForward(stepSeconds * 1000, 250);
        elapsedSeconds += stepSeconds;

        runCheckInBurst();
        checkIns += 1;
      }

      assertValidState("long_sim_profile_policy");
      return {
        elapsedSeconds,
        checkIns,
        prestigeReached: checks.isPrestige,
      };
    },
    {
      maxDurationSeconds: scenario.maxDurationSeconds,
      checkInPatternSeconds: scenario.checkInPatternSeconds,
    },
  );

  const perfEnd = process.hrtime.bigint();
  const endedAt = Date.now();
  const after = await page.evaluate(collectMetricsJs);
  await context.close();

  const elapsedMs = Number(perfEnd - perfStart) / 1_000_000;
  return {
    id: scenario.id,
    label: scenario.label,
    category: "policy_timing",
    simulationMethod: "deterministic_checkin_policy",
    maxDurationSeconds: scenario.maxDurationSeconds,
    checkInPatternSeconds: scenario.checkInPatternSeconds,
    startedAt,
    endedAt,
    wallClockElapsedMs: elapsedMs,
    runtimeErrors,
    before,
    after,
    delta: diffMetrics(before, after),
    checkIns: simulationOutcome.checkIns,
    prestigeReached: simulationOutcome.prestigeReached,
    timeToPrestigeSeconds: simulationOutcome.prestigeReached
      ? simulationOutcome.elapsedSeconds
      : null,
  };
}

function summarizeOfflineForConsole(result) {
  return {
    scenario: result.label,
    simHours: Number((result.simDurationSeconds / 3600).toFixed(1)),
    wallClockMs: Number(result.wallClockElapsedMs.toFixed(2)),
    moneyDelta: Number(result.delta.money.toFixed(2)),
    researchDelta: Number(result.delta.researchPoints.toFixed(2)),
    assertionsAdded: result.delta.assertionCount,
    runtimeErrors: result.runtimeErrors.length,
  };
}

function summarizePolicyForConsole(result) {
  return {
    scenario: result.label,
    checkInPattern: result.checkInPatternSeconds.join("/"),
    checkIns: result.checkIns,
    wallClockMs: Number(result.wallClockElapsedMs.toFixed(2)),
    prestigeReached: result.prestigeReached,
    timeToPrestige: formatDuration(result.timeToPrestigeSeconds),
    runtimeErrors: result.runtimeErrors.length,
  };
}

async function main() {
  ensureDir(REPORT_DIR);

  const startedAt = new Date();
  const serverInfo = await createStaticServer();
  const server = serverInfo.server;
  const port = serverInfo.port;
  const browser = await chromium.launch({ headless: true });
  const offlineResults = [];
  const policyResults = [];

  try {
    for (const scenario of OFFLINE_SCENARIOS) {
      const result = await runOfflineScenario(browser, scenario, port);
      offlineResults.push(result);
    }

    for (const scenario of POLICY_SCENARIOS) {
      const result = await runPolicyScenario(browser, scenario, port);
      policyResults.push(result);
    }
  } finally {
    await browser.close();
    await closeServer(server);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    startedAt: startedAt.toISOString(),
    offlineScenarios: offlineResults,
    policyScenarios: policyResults,
  };

  const timestampedPath = path.join(
    REPORT_DIR,
    `long-sim-profile-${formatTimestamp(new Date())}.json`,
  );

  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Offline Profile Results");
  console.table(offlineResults.map(summarizeOfflineForConsole));
  console.log("Policy Timing Results");
  console.table(policyResults.map(summarizePolicyForConsole));
  console.log(`Report written: ${timestampedPath}`);
  console.log(`Latest report: ${LATEST_REPORT_PATH}`);

  const allResults = offlineResults.concat(policyResults);
  const totalErrors = allResults.reduce(
    (sum, scenario) => sum + scenario.runtimeErrors.length,
    0,
  );
  if (totalErrors > 0) {
    console.error(`Detected ${totalErrors} runtime errors during long-sim profiling.`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
