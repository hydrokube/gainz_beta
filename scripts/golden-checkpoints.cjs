const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("@playwright/test");

const ROOT_DIR = process.cwd();
const HOST = "127.0.0.1";
const REQUESTED_PORT = Number(process.env.PORT || 0);
const GOLDEN_PATH = path.join(ROOT_DIR, "tests", "golden", "layer0-checkpoints.json");

const CHECKPOINTS_MS = [
  60_000,
  180_000,
  300_000,
  600_000,
  900_000,
  1_800_000,
  3_600_000,
  7_200_000,
];

const METRIC_KEYS = [
  "money",
  "strength",
  "endurance",
  "agility",
  "intelligence",
  "energyCurrent",
  "energyMax",
  "views",
  "followers",
  "researchPoints",
  "pushupsTotal",
  "pushupsCurrent",
  "assertionCount",
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

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
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
    energyCurrent: stats.energy.current,
    energyMax: stats.energy.max,
    views: job.views,
    followers: job.followers,
    researchPoints: research.points,
    pushupsTotal: bodyweight.pushups.total,
    pushupsCurrent: bodyweight.pushups.current,
    assertionCount: Array.isArray(window.__gainzAssertLog) ? window.__gainzAssertLog.length : 0,
  };
}

async function runDeterministicTrace(browser, port) {
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

  await page.goto(`http://${HOST}:${port}/?deterministic=1&seed=2026`);
  await page.waitForFunction(() => !!window.__gainzTest && !!window.__gainzClock);

  const checkpoints = [];
  let currentMs = 0;

  for (const targetMs of CHECKPOINTS_MS) {
    const deltaMs = targetMs - currentMs;
    if (deltaMs < 0) {
      throw new Error(`Invalid checkpoint order. ${targetMs} < ${currentMs}`);
    }

    await page.evaluate((stepMs) => {
      window.__gainzTest.fastForward(stepMs, 50);
    }, deltaMs);

    const metrics = await page.evaluate(collectMetricsJs);
    checkpoints.push({
      atMs: targetMs,
      metrics,
    });
    currentMs = targetMs;
  }

  await context.close();
  return { checkpoints, runtimeErrors };
}

function parseArgs() {
  return {
    update: process.argv.includes("--update"),
  };
}

function loadGoldenFile() {
  if (!fs.existsSync(GOLDEN_PATH)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf8"));
}

function writeGoldenFile(checkpoints) {
  ensureDir(path.dirname(GOLDEN_PATH));
  const payload = {
    generatedAt: new Date().toISOString(),
    checkpoints,
  };
  fs.writeFileSync(GOLDEN_PATH, JSON.stringify(payload, null, 2));
}

function compareWithGolden(expectedCheckpoints, actualCheckpoints) {
  const failures = [];

  if (!Array.isArray(expectedCheckpoints) || expectedCheckpoints.length !== actualCheckpoints.length) {
    failures.push(
      `Checkpoint count mismatch. expected=${expectedCheckpoints ? expectedCheckpoints.length : "none"} actual=${actualCheckpoints.length}`,
    );
    return failures;
  }

  for (let i = 0; i < actualCheckpoints.length; i += 1) {
    const expected = expectedCheckpoints[i];
    const actual = actualCheckpoints[i];

    if (expected.atMs !== actual.atMs) {
      failures.push(
        `Checkpoint[${i}] time mismatch. expected atMs=${expected.atMs}, actual atMs=${actual.atMs}`,
      );
      continue;
    }

    for (const key of METRIC_KEYS) {
      const expectedValue = Number(expected.metrics[key]);
      const actualValue = Number(actual.metrics[key]);
      const absDiff = Math.abs(actualValue - expectedValue);
      const tolerance = key === "assertionCount"
        ? 0
        : Math.max(1e-6, Math.abs(expectedValue) * 1e-6);

      if (!Number.isFinite(expectedValue) || !Number.isFinite(actualValue)) {
        failures.push(
          `Checkpoint[${i}] ${key} non-finite. expected=${expected.metrics[key]} actual=${actual.metrics[key]}`,
        );
        continue;
      }

      if (absDiff > tolerance) {
        failures.push(
          `Checkpoint[${i}] ${key} mismatch. expected=${expectedValue} actual=${actualValue} diff=${absDiff} tolerance=${tolerance}`,
        );
      }
    }
  }

  return failures;
}

function summarizeCheckpoints(checkpoints) {
  return checkpoints.map((checkpoint) => ({
    atMs: checkpoint.atMs,
    money: Number(checkpoint.metrics.money.toFixed(4)),
    strength: Number(checkpoint.metrics.strength.toFixed(4)),
    followers: Number(checkpoint.metrics.followers.toFixed(4)),
    researchPoints: Number(checkpoint.metrics.researchPoints.toFixed(4)),
    pushupsTotal: Number(checkpoint.metrics.pushupsTotal.toFixed(4)),
    assertionCount: checkpoint.metrics.assertionCount,
  }));
}

async function main() {
  const { update } = parseArgs();
  const serverInfo = await createStaticServer();
  const browser = await chromium.launch({ headless: true });

  let trace;
  try {
    trace = await runDeterministicTrace(browser, serverInfo.port);
  } finally {
    await browser.close();
    await closeServer(serverInfo.server);
  }

  if (trace.runtimeErrors.length > 0) {
    console.error("Runtime errors detected during golden trace:");
    trace.runtimeErrors.forEach((errorLine) => console.error(`- ${errorLine}`));
    process.exit(1);
  }

  if (update) {
    writeGoldenFile(trace.checkpoints);
    console.log(`Golden checkpoints updated: ${GOLDEN_PATH}`);
    console.table(summarizeCheckpoints(trace.checkpoints));
    return;
  }

  const expected = loadGoldenFile();
  if (expected == null) {
    console.error(`Missing golden checkpoint file: ${GOLDEN_PATH}`);
    console.error("Run `npm run profile:golden:update` to create baseline checkpoints.");
    process.exit(1);
  }

  const failures = compareWithGolden(expected.checkpoints, trace.checkpoints);
  if (failures.length > 0) {
    console.error("Golden checkpoint mismatches detected:");
    failures.forEach((line) => console.error(`- ${line}`));
    console.table(summarizeCheckpoints(trace.checkpoints));
    process.exit(1);
  }

  console.log("Golden checkpoints matched.");
  console.table(summarizeCheckpoints(trace.checkpoints));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
