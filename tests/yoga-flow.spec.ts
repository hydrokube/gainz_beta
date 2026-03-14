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

test("yoga route draft generates flow after unlock and respects run cap", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    prestige.yoga.current = 100;
    prestige.yoga.upgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;
    yoga.sun.total = 1e40;
    yoga.vinyasa.total = 1e40;
    yoga.balance.total = 1e40;
    yoga.mobility.total = 1e40;
    yoga.core.total = 1e40;
    yoga.breath.total = 1e40;
    const unlockButton = document.querySelector("#globalYogaUpgradeBtn0");
    if (unlockButton != null) {
      globalYogaUpgradeClick(unlockButton, true);
    }

    const flowBefore = prestige.yoga.flow;
    for (let second = 0; second < 6000; second += 1) {
      const flowState = ensureYogaFlowState();
      if (flowState.activeDraftIndex < 0) {
        selectYogaRoute(getYogaAutomationRouteIndex(flowState), false);
      }
      advanceYogaBreathCycle(1);
      if (flowState.routeStability < 0.55 || flowState.routeProgress > 0.82) {
        anchorYogaBreathPhase(true);
      }
    }

    return {
      flowBefore,
      flowAfter: prestige.yoga.flow,
      runEarned: yoga.flow.runEarned,
      runCap: getYogaFlowRunCap(),
      routesCompleted: yoga.flow.totalCycles,
      currentPhase: yoga.flow.currentPhase,
      activeRouteIndex: yoga.flow.activeDraftIndex,
    };
  });

  expect(result.flowAfter).toBeGreaterThan(result.flowBefore);
  expect(result.runEarned).toBeGreaterThan(0);
  expect(result.runEarned).toBeLessThanOrEqual(result.runCap + 0.0001);
  expect(result.routesCompleted).toBeGreaterThan(0);
  expect(result.currentPhase).toBeGreaterThanOrEqual(0);
  expect(result.activeRouteIndex).toBeGreaterThanOrEqual(-1);
});

test("yoga route draft requires selecting a route before progress advances", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    prestige.yoga.upgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;

    const state = ensureYogaFlowState();
    generateYogaRouteDraftOptions(state);
    state.activeDraftIndex = -1;
    state.routeProgress = 0;

    advanceYogaBreathCycle(20);
    const progressWithoutRoute = state.routeProgress;

    selectYogaRoute(0, false);
    advanceYogaBreathCycle(20);

    return {
      progressWithoutRoute,
      progressWithRoute: state.routeProgress,
      activeDraftIndex: state.activeDraftIndex,
    };
  });

  expect(result.progressWithoutRoute).toBe(0);
  expect(result.progressWithRoute).toBeGreaterThan(0);
  expect(result.activeDraftIndex).toBeGreaterThanOrEqual(0);
});

test("yoga automation toggles render in yoga gym", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.yogaUpgradeBuyer = true;
    checks.yogaUpgradeBuyerOn = true;
    checks.yogaGymBuyer = true;
    checks.yogaGymBuyerOn = true;
    checks.yogaAdBuyer = true;
    checks.yogaAdBuyerOn = true;
    checks.breathBuyer = true;
    checks.breathBuyerOn = true;

    updateAutobuyerToggles();

    return {
      hasYogaUpgradeToggle: document.querySelector("#yogaUpgradeBuyer") != null,
      hasYogaGymToggle: document.querySelector("#yogaGymBuyer") != null,
      hasYogaAdToggle: document.querySelector("#yogaAdBuyer") != null,
      hasBreathToggle: document.querySelector("#breathBuyer") != null,
    };
  });

  expect(result.hasYogaUpgradeToggle).toBe(true);
  expect(result.hasYogaGymToggle).toBe(true);
  expect(result.hasYogaAdToggle).toBe(true);
  expect(result.hasBreathToggle).toBe(true);
});

test("yoga upgrades trigger is visible on open gym tab during yoga runs", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");

  const result = await page.evaluate(() => {
    const trigger = document.querySelector("#globalYogaUpgradesModalTrigger");
    const isInOpenGymTab = trigger?.closest("#openGymTab") != null;

    checks.isPrestige = true;
    checks.gymType = 2;
    const yogaUnlock = prestige.upgrades.find((upgrade) => upgrade.id === 33);
    if (yogaUnlock) {
      yogaUnlock.isPurchased = true;
    }
    if (window.__gainzTest?.stepTicks) {
      window.__gainzTest.stepTicks(4, 50);
    }

    return {
      isInOpenGymTab,
      hidden: trigger?.classList.contains("d-none") ?? true,
    };
  });

  expect(result.isInOpenGymTab).toBe(true);
  expect(result.hidden).toBe(false);
});

test("starting a new yoga gym run resets yoga exercise progression", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    window.confirm = () => true;

    checks.isPrestige = true;
    checks.gymType = 2;
    yoga.sun.total = 500000;
    yoga.sun.tier = 4;
    yoga.sun.current = 42;
    yoga.balance.total = 300000;
    yoga.balance.tier = 3;
    yoga.flow.progress = 19;
    yoga.flow.currentPhase = 2;

    newGym(2);

    return {
      gymType: checks.gymType,
      sunTotal: yoga.sun.total,
      sunTier: yoga.sun.tier,
      sunCurrent: yoga.sun.current,
      balanceTotal: yoga.balance.total,
      balanceTier: yoga.balance.tier,
      flowProgress: yoga.flow.progress,
      flowPhase: yoga.flow.currentPhase,
    };
  });

  expect(result.gymType).toBe(2);
  expect(result.sunTotal).toBe(0);
  expect(result.sunTier).toBe(0);
  expect(result.sunCurrent).toBe(0);
  expect(result.balanceTotal).toBe(0);
  expect(result.balanceTier).toBe(0);
  expect(result.flowProgress).toBe(0);
  expect(result.flowPhase).toBe(0);
});

test("yoga exercise drain pauses while resting and only resumes at full energy", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.isResting = true;
    prestige.yoga.current = 100;
    prestige.yoga.upgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;

    yoga.sun.current = 0;
    stats.energy.current = 0;
    stats.energy.max = 10;

    yogaExerciseTick(yoga.sun, 0.05);
    const energyAfterBlockedTick = stats.energy.current;
    const progressAfterBlockedTick = yoga.sun.current;

    stats.energy.current = stats.energy.max * 0.9;
    yogaExerciseTick(yoga.sun, 0.05);
    const energyAfterNearFullTick = stats.energy.current;
    const progressAfterNearFullTick = yoga.sun.current;

    stats.energy.current = stats.energy.max;
    const resumeStartEnergy = stats.energy.current;
    yogaExerciseTick(yoga.sun, 0.05);

    return {
      energyAfterBlockedTick,
      progressAfterBlockedTick,
      energyAfterNearFullTick,
      progressAfterNearFullTick,
      resumeStartEnergy,
      resumedEnergy: stats.energy.current,
      resumedProgress: yoga.sun.current,
      isResting: checks.isResting,
    };
  });

  expect(result.energyAfterBlockedTick).toBe(0);
  expect(result.progressAfterBlockedTick).toBe(0);
  expect(result.energyAfterNearFullTick).toBeCloseTo(9, 6);
  expect(result.progressAfterNearFullTick).toBe(0);
  expect(result.resumedEnergy).toBeLessThan(result.resumeStartEnergy);
  expect(result.resumedProgress).toBeGreaterThan(0);
  expect(result.isResting).toBe(false);
});

test("yoga shared tick resumes all active exercises together after resting", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.isResting = true;
    stats.energy.current = 0;
    stats.energy.max = 10;

    const exercises = [yoga.sun, yoga.vinyasa, yoga.balance, yoga.mobility, yoga.core, yoga.breath];
    for (const exercise of exercises) {
      exercise.isStopped = false;
      exercise.current = 0;
    }

    runYogaContinuousTick(0.05, exercises);
    const blockedProgress = exercises.map((exercise) => exercise.current);

    stats.energy.current = stats.energy.max;
    runYogaContinuousTick(0.05, exercises);

    return {
      blockedProgress,
      resumedProgress: exercises.map((exercise) => exercise.current),
      isResting: checks.isResting,
    };
  });

  expect(result.blockedProgress.every((value) => value === 0)).toBe(true);
  expect(result.resumedProgress.every((value) => value > 0)).toBe(true);
  expect(result.isResting).toBe(false);
});

test("stopping one yoga exercise does not halt other active yoga timers", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.isResting = false;
    stats.energy.current = 10;
    stats.energy.max = 10;

    yoga.sun.isStopped = false;
    yoga.vinyasa.isStopped = false;
    yoga.balance.isStopped = false;
    yoga.mobility.isStopped = false;
    yoga.core.isStopped = false;
    yoga.breath.isStopped = false;

    setupYogaSunTimer();
    startStop(yoga.sun, yogaSunTimerId, false);

    const vinyasaBefore = yoga.vinyasa.current;
    window.__gainzTest.stepTicks(10, 50);
    const vinyasaAfter = yoga.vinyasa.current;

    return {
      sunStopped: yoga.sun.isStopped,
      vinyasaBefore,
      vinyasaAfter,
      hasSharedTimer: yogaContinuousTimerId != null,
    };
  });

  expect(result.sunStopped).toBe(true);
  expect(result.vinyasaAfter).toBeGreaterThan(result.vinyasaBefore);
  expect(result.hasSharedTimer).toBe(true);
});

test("yoga progress bar briefly shows full on cycle completion before carryover", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.isResting = false;
    stats.energy.max = 10;
    stats.energy.current = 10;

    yoga.sun.current = yoga.sun.max - 0.05;
    yoga.sun.isStopped = false;
    yoga.vinyasa.isStopped = true;
    yoga.balance.isStopped = true;
    yoga.mobility.isStopped = true;
    yoga.core.isStopped = true;
    yoga.breath.isStopped = true;

    runYogaContinuousTick(0.05, [yoga.sun]);
    refreshProgressBarsAndStats("yogaSun", yoga.sun, "", "");
    const firstStyle = String($("#yogaSunProgress").attr("style") || "");

    refreshProgressBarsAndStats("yogaSun", yoga.sun, "", "");
    const secondStyle = String($("#yogaSunProgress").attr("style") || "");
    refreshProgressBarsAndStats("yogaSun", yoga.sun, "", "");
    const thirdStyle = String($("#yogaSunProgress").attr("style") || "");

    return {
      firstStyle,
      secondStyle,
      thirdStyle,
      currentAfterCompletion: yoga.sun.current,
    };
  });

  expect(result.firstStyle).toContain("100%");
  expect(result.secondStyle).toContain("100%");
  expect(result.thirdStyle).not.toContain("100%");
  expect(result.currentAfterCompletion).toBeGreaterThanOrEqual(0);
});

test("debug-speed yoga run still shows energy decreasing while actively training", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.isResting = false;
    stats.energy.max = 20;
    stats.energy.current = 20;
    stats.energy.originalMax = 20;
    stats.energy.increase = 0;

    const exercises = [yoga.sun, yoga.vinyasa, yoga.balance, yoga.mobility, yoga.core, yoga.breath];
    for (const exercise of exercises) {
      exercise.isStopped = false;
      exercise.current = 0;
    }

    setDebugSpeedMultiplier(60);
    restartRuntimeIntervalsForDebugSpeed();

    const displayedEnergy = [];
    for (let i = 0; i < 40; i += 1) {
      window.__gainzTest.stepTicks(1, 50);
      const value = Number($("#energyProgress").attr("aria-valuenow"));
      displayedEnergy.push(Number.isFinite(value) ? value : 0);
    }

    return {
      maxDisplayed: Math.max(...displayedEnergy),
      minDisplayed: Math.min(...displayedEnergy),
      samples: displayedEnergy.slice(0, 12),
    };
  });

  expect(result.maxDisplayed).toBeGreaterThan(result.minDisplayed);
});

test("switching debug speed from high to 1x keeps yoga energy display synchronized", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    checks.isResting = false;
    stats.energy.max = 200;
    stats.energy.current = 200;
    stats.energy.originalMax = 200;
    stats.energy.increase = 0;

    const exercises = [yoga.sun, yoga.vinyasa, yoga.balance, yoga.mobility, yoga.core, yoga.breath];
    for (const exercise of exercises) {
      exercise.isStopped = false;
      exercise.current = 0;
    }

    setDebugSpeedMultiplier(60);
    restartRuntimeIntervalsForDebugSpeed();
    window.__gainzTest.stepTicks(12, 50);

    setDebugSpeedMultiplier(1);
    window.__gainzTest.stepTicks(1, 50);

    const actualAfterSwitch = Number(stats.energy.current);
    const displayedAfterSwitch = Number($("#energyProgress").attr("aria-valuenow"));

    const samples: number[] = [];
    for (let i = 0; i < 20; i += 1) {
      window.__gainzTest.stepTicks(1, 50);
      samples.push(Number($("#energyProgress").attr("aria-valuenow")));
    }

    return {
      actualAfterSwitch,
      displayedAfterSwitch,
      firstSample: samples[0],
      minSample: Math.min(...samples),
      maxSample: Math.max(...samples),
    };
  });

  expect(Math.abs(result.actualAfterSwitch - result.displayedAfterSwitch)).toBeLessThanOrEqual(0.11);
  expect(result.minSample).toBeLessThan(result.firstSample);
  expect(result.maxSample).toBeLessThanOrEqual(result.firstSample + 0.11);
});

test("flow scaling uses diminishing returns to avoid runaway multipliers", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;
    prestige.yoga.upgrades.find((upgrade) => upgrade.id === 1).isPurchased = true;
    prestige.yoga.flowUpgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;
    prestige.yoga.flowBoost = 0.0015;
    prestige.yoga.flow = 200;

    return {
      effectiveFlow: getEffectiveFlowForBonuses(),
      flowMultiplier: getFlowMultiplier(),
      maxEnergyMultiplier: getFlowMaxEnergyMultiplier(),
      recoveryMultiplier: getFlowEnergyRecoveryMultiplier(),
    };
  });

  expect(result.effectiveFlow).toBeLessThan(60);
  expect(result.flowMultiplier).toBeLessThan(1.2);
  expect(result.maxEnergyMultiplier).toBeLessThan(1.4);
  expect(result.recoveryMultiplier).toBeLessThan(1.25);
});
