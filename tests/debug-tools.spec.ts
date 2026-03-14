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

test("debug speed multiplier accelerates timer-driven simulation", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");
  await page.getByRole("tab", { name: "Options" }).click();

  await page.evaluate(() => {
    localStorage.setItem("gainz_debug_enabled", "1");
    setupDebugPanel();
  });

  const result = await page.evaluate(() => {
    bodyweight.pushups.isStopped = true;
    clearInterval(pushupTimerId);

    stats.energy.current = 0;
    stats.energy.max = 1_000_000;
    stats.energy.increase = 1;
    stats.agility = 0;
    stats.agilityBoost = 1;
    stats.energy.coffee.isActive = false;
    stats.energy.coffee.isCooldown = false;

    setDebugSpeedMultiplier(1);
    window.__gainzTest.stepTicks(20, 50);
    const baseline = stats.energy.current;

    stats.energy.current = 0;
    setDebugSpeedMultiplier(5);
    window.__gainzTest.stepTicks(20, 50);
    const boosted = stats.energy.current;

    setDebugSpeedMultiplier(1);
    return { baseline, boosted };
  });

  expect(result.baseline).toBeGreaterThan(0);
  expect(result.boosted).toBeGreaterThan(result.baseline * 2);
});

test("debug speed presets include high-speed options with safe clamping", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");
  await page.getByRole("tab", { name: "Options" }).click();

  await expect(page.locator("#debugSpeed60Btn")).toHaveCount(1);
  await expect(page.locator("#debugSpeed100Btn")).toHaveCount(1);
  await expect(page.locator("#debugSpeed250Btn")).toHaveCount(1);
  await expect(page.locator("#debugSpeed500Btn")).toHaveCount(1);
  await expect(page.locator("#debugSpeed1000Btn")).toHaveCount(1);
  await expect(page.locator("#debugSpeedEffectiveValue")).toHaveCount(1);

  const result = await page.evaluate(() => {
    return {
      speed60: sanitizeDebugSpeedMultiplier(60),
      speed100: sanitizeDebugSpeedMultiplier(100),
      speed250: sanitizeDebugSpeedMultiplier(250),
      speed500: sanitizeDebugSpeedMultiplier(500),
      speed1000: sanitizeDebugSpeedMultiplier(1000),
      capped: sanitizeDebugSpeedMultiplier(999),
      hardCapped: sanitizeDebugSpeedMultiplier(9999),
    };
  });

  expect(result.speed60).toBe(60);
  expect(result.speed100).toBe(100);
  expect(result.speed250).toBe(250);
  expect(result.speed500).toBe(500);
  expect(result.speed1000).toBe(1000);
  expect(result.capped).toBe(999);
  expect(result.hardCapped).toBe(1000);
});

test("debug skip progression advances key layer progression values", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1");
  await page.getByRole("tab", { name: "Options" }).click();

  const before = await page.evaluate(() => {
    return {
      money: stats.money,
      followers: job.followers,
      views: job.views,
      isPrestige: checks.isPrestige,
      story5: checks.story5,
    };
  });

  await page.locator("#debugSkipProgressionBtn").click();

  const after = await page.evaluate(() => {
    return {
      money: stats.money,
      followers: job.followers,
      views: job.views,
      isPrestige: checks.isPrestige,
      story5: checks.story5,
    };
  });

  expect(after.money).toBeGreaterThan(before.money);
  expect(after.followers).toBeGreaterThan(before.followers);
  expect(after.views).toBeGreaterThan(before.views);
  expect(after.isPrestige).toBe(true);
  expect(after.story5).toBe(true);
  await expect(page.locator("#openGym-tab")).not.toHaveClass(/d-none/);
  await expect(page.locator("#debugSkipAlert")).toBeVisible();
});

test("debug force unlocks reveal gated sections and activate upgrade visibility", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1");
  await page.getByRole("tab", { name: "Options" }).click();
  await page.locator("#debugForceUnlocksBtn").click();

  const state = await page.evaluate(() => {
    return {
      workTabHidden: document.getElementById("work-tab")?.classList.contains("d-none"),
      researchTabHidden: document.getElementById("research-tab")?.classList.contains("d-none"),
      openGymTabHidden: document.getElementById("openGym-tab")?.classList.contains("d-none"),
      gymTabHidden: document.getElementById("gym-tab")?.classList.contains("d-none"),
      firstUpgradeActive: upgrades[0]?.isActive,
      firstJobUpgradeActive: job.upgrades[0]?.isActive,
      firstResearchUpgradeActive: research.upgrades[0]?.isActive,
      isPrestige: checks.isPrestige,
    };
  });

  expect(state.workTabHidden).toBe(false);
  expect(state.researchTabHidden).toBe(false);
  expect(state.openGymTabHidden).toBe(false);
  expect(state.gymTabHidden).toBe(false);
  expect(state.firstUpgradeActive).toBe(true);
  expect(state.firstJobUpgradeActive).toBe(true);
  expect(state.firstResearchUpgradeActive).toBe(true);
  expect(state.isPrestige).toBe(true);
  await expect(page.locator("#debugForceUnlockAlert")).toBeVisible();
});

test("debug prestige jump adds deterministic prestige cycles", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1");
  await page.getByRole("tab", { name: "Options" }).click();

  const before = await page.evaluate(() => {
    return {
      globalCurrent: prestige.current,
      globalTotal: prestige.total,
      bwCurrent: prestige.bw.current,
      bwTotal: prestige.bw.total,
    };
  });

  await page.locator("#debugPrestigeJumpBtn").click();

  const after = await page.evaluate(() => {
    return {
      globalCurrent: prestige.current,
      globalTotal: prestige.total,
      bwCurrent: prestige.bw.current,
      bwTotal: prestige.bw.total,
      isPrestige: checks.isPrestige,
    };
  });

  expect(after.globalTotal - before.globalTotal).toBe(5);
  expect(after.globalCurrent - before.globalCurrent).toBe(15);
  expect(after.bwTotal - before.bwTotal).toBe(5);
  expect(after.bwCurrent - before.bwCurrent).toBe(15);
  expect(after.isPrestige).toBe(true);
  await expect(page.locator("#debugPrestigeJumpAlert")).toBeVisible();
});

test("layer 0 unlocked exercises continue running after debug speed restart", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");
  await page.getByRole("tab", { name: "Options" }).click();

  const exerciseProgress = await page.evaluate(() => {
    const bwRowsUpgrade = bodyweight.upgrades.find((upgrade) => upgrade.id === 1);
    const bwPullupUpgrade = bodyweight.upgrades.find((upgrade) => upgrade.id === 4);
    const resDipsUpgrade = research.upgrades.find((upgrade) => upgrade.id === 4);
    const resLowerUpgrade = research.upgrades.find((upgrade) => upgrade.id === 11);

    if (bwRowsUpgrade) bwRowsUpgrade.isPurchased = true;
    if (bwPullupUpgrade) bwPullupUpgrade.isPurchased = true;
    if (resDipsUpgrade) resDipsUpgrade.isPurchased = true;
    if (resLowerUpgrade) resLowerUpgrade.isPurchased = true;

    stats.energy.current = 1_000_000;
    stats.energy.max = 1_000_000;
    checks.isResting = false;

    bodyweight.pushups.isStopped = false;
    bodyweight.rows.isStopped = false;
    bodyweight.dips.isStopped = false;
    bodyweight.pullups.isStopped = false;
    bodyweight.squats.isStopped = false;
    bodyweight.rdl.isStopped = false;

    bodyweight.pushups.energy = 0;
    bodyweight.rows.energy = 0;
    bodyweight.dips.energy = 0;
    bodyweight.pullups.energy = 0;
    bodyweight.squats.energy = 0;
    bodyweight.rdl.energy = 0;

    bodyweight.pushups.speed = 100;
    bodyweight.rows.speed = 100;
    bodyweight.dips.speed = 100;
    bodyweight.pullups.speed = 100;
    bodyweight.squats.speed = 100;
    bodyweight.rdl.speed = 100;
    bodyweight.pushups.max = 1_000_000;
    bodyweight.rows.max = 1_000_000;
    bodyweight.dips.max = 1_000_000;
    bodyweight.pullups.max = 1_000_000;
    bodyweight.squats.max = 1_000_000;
    bodyweight.rdl.max = 1_000_000;

    bodyweight.pushups.current = 0;
    bodyweight.rows.current = 0;
    bodyweight.dips.current = 0;
    bodyweight.pullups.current = 0;
    bodyweight.squats.current = 0;
    bodyweight.rdl.current = 0;

    setDebugSpeedMultiplier(5);
    restartRuntimeIntervalsForDebugSpeed();
    window.__gainzTest.stepTicks(100, 50);

    const progress = {
      pushups: bodyweight.pushups.current,
      rows: bodyweight.rows.current,
      dips: bodyweight.dips.current,
      pullups: bodyweight.pullups.current,
      squats: bodyweight.squats.current,
      rdl: bodyweight.rdl.current,
    };

    setDebugSpeedMultiplier(1);
    return progress;
  });

  expect(exerciseProgress.pushups).toBeGreaterThan(0);
  expect(exerciseProgress.rows).toBeGreaterThan(0);
  expect(exerciseProgress.dips).toBeGreaterThan(0);
  expect(exerciseProgress.pullups).toBeGreaterThan(0);
  expect(exerciseProgress.squats).toBeGreaterThan(0);
  expect(exerciseProgress.rdl).toBeGreaterThan(0);
});
