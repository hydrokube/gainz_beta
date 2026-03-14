const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const REPORT_DIR = path.join(ROOT_DIR, "test-results");
const LATEST_REPORT_PATH = path.join(REPORT_DIR, "meta-softcap-stress-latest.json");

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

  await page.goto(`http://${HOST}:${port}/?deterministic=1&seed=9090`);
  await page.waitForFunction(() => !!window.__gainzTest && !!window.__gainzClock);
  return { context, page, runtimeErrors };
}

async function runStress(browser, port) {
  const { context, page, runtimeErrors } = await createInstrumentedPage(browser, port);

  const startedAt = Date.now();
  const perfStart = process.hrtime.bigint();

  const result = await page.evaluate(() => {
    window.__gainzTest.fastForward(250, 250);
    window.confirm = () => true;
    if (Array.isArray(window.__gainzAssertLog)) {
      window.__gainzAssertLog.length = 0;
    }

    function clone(value) {
      return JSON.parse(JSON.stringify(value));
    }

    function resetState() {
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
      loadReset();
      load(null, true, false);
    }

    function setMetaPoints(confidence, leadership, flow) {
      prestige.bw.confidence = confidence;
      prestige.lifting.leadership = leadership;
      prestige.yoga.flow = flow;

      for (let i = 0; i < prestige.bw.upgrades.length; i += 1) {
        if (prestige.bw.upgrades[i].id === 1) {
          prestige.bw.upgrades[i].isPurchased = true;
        }
      }
      for (let i = 0; i < prestige.lifting.upgrades.length; i += 1) {
        if (prestige.lifting.upgrades[i].id === 1) {
          prestige.lifting.upgrades[i].isPurchased = true;
        }
      }
      for (let i = 0; i < prestige.yoga.upgrades.length; i += 1) {
        if (prestige.yoga.upgrades[i].id === 1) {
          prestige.yoga.upgrades[i].isPurchased = true;
        }
      }

      // Ensure corresponding unlock effects are active in multiplier paths.
      prestige.bw.confidenceBoost = 0.02;
      prestige.lifting.leadershipBoost = 0.02;
      prestige.yoga.flowBoost = 0.005;

      assertValidState("meta_softcap_state", { strict: true });
    }

    function snapshotMeta(name, confidence, leadership, flow) {
      resetState();
      setMetaPoints(confidence, leadership, flow);
      const effectiveConfidence = getEffectiveConfidenceForBonuses();
      const effectiveLeadership = getEffectiveLeadershipForBonuses();
      const effectiveFlow = getEffectiveFlowForBonuses();

      return {
        name,
        raw: { confidence, leadership, flow },
        effective: {
          confidence: effectiveConfidence,
          leadership: effectiveLeadership,
          flow: effectiveFlow,
        },
        multipliers: {
          confidence: getConfidenceMultiplier(),
          leadership: getLeadershipMultiplier(),
          flowSpeed: getFlowMultiplier(),
          flowMaxEnergy: getFlowMaxEnergyMultiplier(),
          flowRecovery: getFlowEnergyRecoveryMultiplier(),
        },
      };
    }

    function slopeSnapshot(resource, start, delta) {
      resetState();
      if (resource === "confidence") {
        setMetaPoints(start, 0, 0);
        const base = getEffectiveConfidenceForBonuses();
        setMetaPoints(start + delta, 0, 0);
        const next = getEffectiveConfidenceForBonuses();
        return { resource, start, delta, effectiveDelta: next - base };
      }
      if (resource === "leadership") {
        setMetaPoints(0, start, 0);
        const base = getEffectiveLeadershipForBonuses();
        setMetaPoints(0, start + delta, 0);
        const next = getEffectiveLeadershipForBonuses();
        return { resource, start, delta, effectiveDelta: next - base };
      }
      setMetaPoints(0, 0, start);
      const base = getEffectiveFlowForBonuses();
      setMetaPoints(0, 0, start + delta);
      const next = getEffectiveFlowForBonuses();
      return { resource, start, delta, effectiveDelta: next - base };
    }

    const snapshots = [
      snapshotMeta("baseline", 0, 0, 0),
      snapshotMeta("user_like_high", 20, 13, 42),
      snapshotMeta("high", 60, 60, 120),
      snapshotMeta("extreme", 200, 200, 500),
    ];

    const thresholds = [20, 40, 80, 160];
    const delta = 10;
    const slopeChecks = [];
    for (let i = 0; i < thresholds.length; i += 1) {
      const start = thresholds[i];
      slopeChecks.push(slopeSnapshot("confidence", start, delta));
      slopeChecks.push(slopeSnapshot("leadership", start, delta));
      slopeChecks.push(slopeSnapshot("flow", start, delta));
    }

    assertValidState("meta_softcap_final", { strict: true });

    return {
      snapshots,
      slopeChecks,
      assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
      firstAssertion:
        Array.isArray(window.__gainzAssertLog) && window.__gainzAssertLog.length > 0
          ? window.__gainzAssertLog[0]
          : null,
    };
  });

  const perfEnd = process.hrtime.bigint();
  const endedAt = Date.now();

  await context.close();

  return {
    startedAt,
    endedAt,
    wallClockElapsedMs: Number(perfEnd - perfStart) / 1_000_000,
    runtimeErrors,
    result,
  };
}

function summarize(result) {
  const extreme = result.result.snapshots.find((entry) => entry.name === "extreme");
  return {
    wallClockMs: Number(result.wallClockElapsedMs.toFixed(2)),
    assertionCount: result.result.assertionCount,
    runtimeErrors: result.runtimeErrors.length,
    extremeEffectiveFlow: Number(extreme.effective.flow.toFixed(2)),
    extremeFlowSpeedMultiplier: Number(extreme.multipliers.flowSpeed.toFixed(3)),
    extremeConfidenceMultiplier: Number(extreme.multipliers.confidence.toFixed(3)),
    extremeLeadershipMultiplier: Number(extreme.multipliers.leadership.toFixed(3)),
  };
}

async function main() {
  ensureDir(REPORT_DIR);

  const serverInfo = await createStaticServer();
  const server = serverInfo.server;
  const port = serverInfo.port;
  const browser = await chromium.launch({ headless: true });

  let run;
  try {
    run = await runStress(browser, port);
  } finally {
    await browser.close();
    await closeServer(server);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    scenario: "meta_softcap_stress",
    run,
  };

  const timestampedPath = path.join(
    REPORT_DIR,
    `meta-softcap-stress-${formatTimestamp(new Date())}.json`,
  );

  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(LATEST_REPORT_PATH, JSON.stringify(report, null, 2));

  console.log("Meta Softcap Stress Summary");
  console.table([summarize(run)]);
  console.log(`Report written: ${timestampedPath}`);
  console.log(`Latest report: ${LATEST_REPORT_PATH}`);

  if (run.runtimeErrors.length > 0 || run.result.assertionCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
