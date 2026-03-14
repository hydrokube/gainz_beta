import { expect, test } from "@playwright/test";

async function blockAnalytics(page: any) {
  await page.route("https://www.googletagmanager.com/**", async (route: any) => {
    await route.fulfill({
      status: 204,
      body: "",
      contentType: "application/javascript",
    });
  });
}

test("legacy prestige preview gains use total + 1 progression", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    prestige.total = 4;
    prestige.bw.total = 3;
    prestige.lifting.total = 2;

    checks.gymType = -1;
    const layer0Global = calculateGlobalPrestigeGain();
    const layer0Bodyweight = calculateBodyweightPrestigeGain();
    const layer0Lifting = calculateLiftingPrestigeGain();

    checks.gymType = 0;
    const layer1Bodyweight = calculateBodyweightPrestigeGain();

    checks.gymType = 1;
    const layer1Lifting = calculateLiftingPrestigeGain();

    return {
      layer0Global,
      layer0Bodyweight,
      layer0Lifting,
      layer1Bodyweight,
      layer1Lifting,
    };
  });

  expect(result.layer0Global).toBe(5);
  expect(result.layer0Bodyweight).toBe(4);
  expect(result.layer0Lifting).toBe(0);
  expect(result.layer1Bodyweight).toBe(4);
  expect(result.layer1Lifting).toBe(3);
  expect(errors).toEqual([]);
});

test("first reset from Layer 0 grants 1 global and 1 bodyweight point", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    window.confirm = () => true;

    checks.isPrestige = true;
    checks.gymType = -1;
    prestige.current = 0;
    prestige.total = 0;
    prestige.bw.current = 0;
    prestige.bw.total = 0;

    newGym(0);

    return {
      gymType: checks.gymType,
      globalCurrent: prestige.current,
      globalTotal: prestige.total,
      bodyweightCurrent: prestige.bw.current,
      bodyweightTotal: prestige.bw.total,
    };
  });

  expect(result.gymType).toBe(0);
  expect(result.globalCurrent).toBe(1);
  expect(result.globalTotal).toBe(1);
  expect(result.bodyweightCurrent).toBe(1);
  expect(result.bodyweightTotal).toBe(1);
  expect(errors).toEqual([]);
});

test("Layer 2 preview rows are hidden in Open Gym tab", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");
  const hiddenState = await page.evaluate(() => {
    return {
      ownedHidden: document.getElementById("layer2PointsOwnedRow")?.classList.contains("d-none"),
      receivedHidden: document.getElementById("layer2PointsReceivedRow")?.classList.contains("d-none"),
    };
  });

  expect(hiddenState.ownedHidden).toBe(true);
  expect(hiddenState.receivedHidden).toBe(true);

  expect(errors).toEqual([]);
});

test("layer 1 pacing multiplier starts below 1 and scales with completed runs", async ({
  page,
}) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 0;

    prestige.bw.total = 1;
    prestige.lifting.total = 0;
    const firstRunMultiplier = getLayer1PacingMultiplier();

    prestige.bw.total = 3;
    prestige.lifting.total = 2;
    const midRunMultiplier = getLayer1PacingMultiplier();

    prestige.bw.total = 25;
    prestige.lifting.total = 20;
    const lateRunMultiplier = getLayer1PacingMultiplier();

    checks.gymType = -1;
    const layer0Multiplier = getLayer1PacingMultiplier();

    return {
      firstRunMultiplier,
      midRunMultiplier,
      lateRunMultiplier,
      layer0Multiplier,
    };
  });

  expect(result.firstRunMultiplier).toBeGreaterThan(0);
  expect(result.firstRunMultiplier).toBeLessThan(1);
  expect(result.midRunMultiplier).toBeGreaterThan(result.firstRunMultiplier);
  expect(result.lateRunMultiplier).toBeGreaterThan(result.midRunMultiplier);
  expect(result.layer0Multiplier).toBeCloseTo(1, 10);
  expect(errors).toEqual([]);
});

test("cross-gym acceleration budget exposes distinct pacing identities", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    prestige.bw.total = 3;
    prestige.lifting.total = 2;
    prestige.yoga.total = 1;
    prestige.cardio.total = 1;

    checks.gymType = 0;
    const bodyweightMultiplier = getLayer1PacingMultiplier();
    checks.gymType = 1;
    const liftingMultiplier = getLayer1PacingMultiplier();
    checks.gymType = 2;
    const cardioMultiplier = getLayer1PacingMultiplier();
    checks.gymType = 3;
    const yogaMultiplier = getLayer1PacingMultiplier();

    const budget = window.__gainzEconomyBudget.layer1;
    const gymKeys = Object.keys(budget.gyms);
    const profileSignatureSet = new Set(
      gymKeys.map((key) => {
        const profile = budget.gyms[key];
        return `${profile.runScale}|${profile.multiplierScale}|${profile.cap}|${profile.idleScale}`;
      }),
    );

    return {
      gymCount: gymKeys.length,
      uniqueProfileCount: profileSignatureSet.size,
      bodyweightMultiplier,
      liftingMultiplier,
      cardioMultiplier,
      yogaMultiplier,
    };
  });

  expect(result.gymCount).toBe(4);
  expect(result.uniqueProfileCount).toBe(4);
  expect(result.cardioMultiplier).toBeGreaterThan(result.yogaMultiplier);
  expect(result.bodyweightMultiplier).not.toBeCloseTo(result.liftingMultiplier, 10);
  expect(errors).toEqual([]);
});

test("layer progression modifier remains hidden from player-facing stats UI", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");
  await page.getByRole("tab", { name: "Stats" }).click();

  await page.evaluate(() => {
    checks.gymType = -1;
    window.__gainzTest.stepTicks(4, 50);
  });
  await expect(page.locator("#layer1PacingModifierRow")).toHaveClass(/d-none/);

  await page.evaluate(() => {
    checks.gymType = 0;
    prestige.bw.total = 3;
    prestige.lifting.total = 1;
    window.__gainzTest.stepTicks(4, 50);
  });

  await expect(page.locator("#layer1PacingModifierRow")).toHaveClass(/d-none/);
  expect(errors).toEqual([]);
});

test("gym capstone prestige upgrades permanently increase layer progression modifier", async ({
  page,
}) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await blockAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 0;
    prestige.bw.total = 2;
    prestige.lifting.total = 1;

    const bwCapstone = prestige.bw.upgrades.find((entry) => entry.id === 20);
    const liftingCapstone = prestige.lifting.upgrades.find((entry) => entry.id === 19);
    if (!bwCapstone || !liftingCapstone) {
      return { missingCapstones: true };
    }

    bwCapstone.isPurchased = false;
    liftingCapstone.isPurchased = false;
    const baseline = getLayer1PacingMultiplier();

    bwCapstone.isPurchased = true;
    const oneCapstone = getLayer1PacingMultiplier();

    liftingCapstone.isPurchased = true;
    const bothCapstones = getLayer1PacingMultiplier();

    return {
      missingCapstones: false,
      baseline,
      oneCapstone,
      bothCapstones,
    };
  });

  expect(result.missingCapstones).toBe(false);
  expect(result.oneCapstone - result.baseline).toBeCloseTo(0.05, 10);
  expect(result.bothCapstones - result.oneCapstone).toBeCloseTo(0.05, 10);
  expect(errors).toEqual([]);
});
