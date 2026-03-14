import { expect, test, type Page } from "@playwright/test";

async function stubAnalytics(page: Page) {
  await page.route("https://www.googletagmanager.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: "",
      contentType: "application/javascript",
    });
  });
}

test("final passive meta upgrades expose slow per-second generation rates", async ({
  page,
}) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const bwPassive = prestige.bw.upgrades.find((entry) => entry.id === 21);
    const liftingPassive = prestige.lifting.upgrades.find((entry) => entry.id === 20);
    const yogaPassive = prestige.yoga.upgrades.find((entry) => entry.id === 20);
    const cardioPassive = prestige.cardio.upgrades.find((entry) => entry.id === 20);
    if (!bwPassive || !liftingPassive || !yogaPassive || !cardioPassive) {
      return { missingUpgrades: true };
    }

    bwPassive.isPurchased = false;
    liftingPassive.isPurchased = false;
    yogaPassive.isPurchased = false;
    cardioPassive.isPurchased = false;
    const before = {
      confidence: getPassiveConfidencePerSecond(),
      leadership: getPassiveLeadershipPerSecond(),
      flow: getPassiveFlowPerSecond(),
      pace: getPassivePacePerSecond(),
    };

    bwPassive.isPurchased = true;
    liftingPassive.isPurchased = true;
    yogaPassive.isPurchased = true;
    cardioPassive.isPurchased = true;
    const after = {
      confidence: getPassiveConfidencePerSecond(),
      leadership: getPassiveLeadershipPerSecond(),
      flow: getPassiveFlowPerSecond(),
      pace: getPassivePacePerSecond(),
    };

    return {
      missingUpgrades: false,
      before,
      after,
    };
  });

  expect(result.missingUpgrades).toBe(false);
  expect(result.before.confidence).toBe(0);
  expect(result.before.leadership).toBe(0);
  expect(result.before.flow).toBe(0);
  expect(result.before.pace).toBe(0);
  expect(result.after.confidence).toBeCloseTo(0.00003, 10);
  expect(result.after.leadership).toBeCloseTo(0.00003, 10);
  expect(result.after.flow).toBeCloseTo(0.00003, 10);
  expect(result.after.pace).toBeCloseTo(0.00003, 10);
});

test("offline progress applies passive confidence/leadership generation", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const bwPassive = prestige.bw.upgrades.find((entry) => entry.id === 21);
    const liftingPassive = prestige.lifting.upgrades.find((entry) => entry.id === 20);
    if (!bwPassive || !liftingPassive) {
      return { missingUpgrades: true };
    }

    checks.gymType = 0;
    bwPassive.isPurchased = true;
    liftingPassive.isPurchased = true;

    prestige.bw.confidence = 0;
    prestige.lifting.leadership = 0;

    applyOfflineProgress(1000);

    return {
      missingUpgrades: false,
      confidence: prestige.bw.confidence,
      leadership: prestige.lifting.leadership,
    };
  });

  expect(result.missingUpgrades).toBe(false);
  expect(result.confidence).toBeCloseTo(0.03, 8);
  expect(result.leadership).toBeCloseTo(0.03, 8);
});

test("live passive flow and pace generation is visible immediately after application", async ({
  page,
}) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const yogaPassive = prestige.yoga.upgrades.find((entry) => entry.id === 20);
    const cardioPassive = prestige.cardio.upgrades.find((entry) => entry.id === 20);
    if (!yogaPassive || !cardioPassive) {
      return { missingUpgrades: true };
    }

    yogaPassive.isPurchased = true;
    cardioPassive.isPurchased = true;
    prestige.yoga.flow = 0;
    prestige.cardio.pace = 0;
    applyPassiveMetaGeneration(1);

    return {
      missingUpgrades: false,
      flow: prestige.yoga.flow,
      pace: prestige.cardio.pace,
      flowDisplay: formatMetaPoints(prestige.yoga.flow),
      paceDisplay: formatMetaPoints(prestige.cardio.pace),
    };
  });

  expect(result.missingUpgrades).toBe(false);
  expect(result.flow).toBeGreaterThan(0);
  expect(result.pace).toBeGreaterThan(0);
  expect(result.flowDisplay).toBe("0.00003");
  expect(result.paceDisplay).toBe("0.00003");
});

test("passive flow and pace gains refresh repeatable affordability as soon as they cross cost thresholds", async ({
  page,
}) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const yogaPassive = prestige.yoga.upgrades.find((entry) => entry.id === 20);
    const cardioPassive = prestige.cardio.upgrades.find((entry) => entry.id === 20);
    const flowTracking = prestige.yoga.flowUpgrades.find((entry) => entry.id === 0);
    const paceTracking = prestige.cardio.paceUpgrades.find((entry) => entry.id === 0);
    if (!yogaPassive || !cardioPassive || !flowTracking || !paceTracking) {
      return { missingUpgrades: true };
    }

    yogaPassive.isPurchased = true;
    cardioPassive.isPurchased = true;
    flowTracking.isPurchased = true;
    paceTracking.isPurchased = true;
    prestige.yoga.flow = 2.99;
    prestige.cardio.pace = 2.99;
    stats.repeatingUpgrades = {};

    updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
    applyPassiveMetaGeneration(1000);
    updatePrestigeValues();

    return {
      missingUpgrades: false,
      flowRepeatableClass:
        document.querySelector("#repeating_flow_flow_resonance_stack_btn")?.className ?? "",
      paceRepeatableClass:
        document.querySelector("#repeating_pace_pace_negative_split_btn")?.className ?? "",
    };
  });

  expect(result.missingUpgrades).toBe(false);
  expect(result.flowRepeatableClass).toMatch(/btn-success/);
  expect(result.paceRepeatableClass).toMatch(/btn-danger/);
});

test("debug-speed live runtime accrues passive flow and pace after the upgrades are bought", async ({
  page,
}) => {
  await stubAnalytics(page);
  await page.goto("/");

  await page.evaluate(() => {
    const yogaPassive = prestige.yoga.upgrades.find((entry) => entry.id === 20);
    const cardioPassive = prestige.cardio.upgrades.find((entry) => entry.id === 20);
    if (!yogaPassive || !cardioPassive) {
      throw new Error("Missing passive yoga/cardio upgrades.");
    }

    yogaPassive.isPurchased = true;
    cardioPassive.isPurchased = true;
    prestige.yoga.flow = 0;
    prestige.cardio.pace = 0;
    debugPanelEnabled = true;
    setDebugSpeedMultiplier(60);
  });

  await page.waitForTimeout(2000);

  const result = await page.evaluate(() => ({
    flow: prestige.yoga.flow,
    pace: prestige.cardio.pace,
    flowDisplay: document.querySelector("#flow")?.textContent ?? "",
    paceDisplay: document.querySelector("#pace")?.textContent ?? "",
    runSeconds: stats.runTracker?.runSeconds ?? null,
    passiveFlowPerSecond: getPassiveFlowPerSecond(),
    passivePacePerSecond: getPassivePacePerSecond(),
    yogaPassivePurchased: prestige.yoga.upgrades.find((entry) => entry.id === 20)?.isPurchased ?? false,
    cardioPassivePurchased: prestige.cardio.upgrades.find((entry) => entry.id === 20)?.isPurchased ?? false,
    debugSpeed: debugSpeedMultiplier,
  }));

  expect(result.flow).toBeGreaterThan(0);
  expect(result.pace).toBeGreaterThan(0);
  expect(result.flowDisplay).not.toBe("0.00");
  expect(result.paceDisplay).not.toBe("0.00");
});
