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

test("race day generates pace after unlock and respects run cap", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 3;
    prestige.cardio.current = 100;
    prestige.cardio.upgrades.find((upgrade) => upgrade.id === 0)!.isPurchased = true;
    cardio.treadmill.total = 1e40;
    cardio.bike.total = 1e40;
    cardio.row.total = 1e40;
    cardio.sprints.total = 1e40;
    cardio.hills.total = 1e40;
    cardio.recovery.total = 1e40;

    const paceBefore = prestige.cardio.pace;
    selectCardioRace(1, false);

    for (let second = 0; second < 10000; second += 1) {
      const state = ensureCardioIntervalState();
      if (state.activeRaceId !== "") {
        const leader = Math.max(state.rival1Progress ?? 0, state.rival2Progress ?? 0);
        const gap = leader - (state.playerProgress ?? 0);
        if ((state.fatigue ?? 0) > 0.72) {
          recoverCardioRace();
        } else if (gap > 0.06) {
          pushCardioRace();
        } else {
          settleCardioRace();
        }
      } else if (state.runEarned < getCardioPaceRunCap()) {
        selectCardioRace(1, false);
      }
      advanceCardioInterval(1);
    }

    return {
      paceBefore,
      paceAfter: prestige.cardio.pace,
      runEarned: cardio.interval.runEarned,
      runCap: getCardioPaceRunCap(),
      racesCompleted: cardio.interval.totalRaces,
      averageQuality: cardio.interval.averageQuality,
    };
  });

  expect(result.paceAfter).toBeGreaterThan(result.paceBefore);
  expect(result.runEarned).toBeGreaterThan(0);
  expect(result.runEarned).toBeLessThanOrEqual(result.runCap + 0.0001);
  expect(result.racesCompleted).toBeGreaterThan(0);
  expect(result.averageQuality).toBeGreaterThan(0);
});

test("race day actions affect placement pressure and fatigue", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 3;
    prestige.cardio.current = 100;
    prestige.cardio.upgrades.find((upgrade) => upgrade.id === 0)!.isPurchased = true;
    cardio.treadmill.total = 1e18;
    cardio.bike.total = 1e18;
    cardio.row.total = 1e18;
    cardio.sprints.total = 1e18;
    cardio.hills.total = 1e18;
    cardio.recovery.total = 1e18;

    selectCardioRace(2, false);
    settleCardioRace();
    advanceCardioInterval(5);
    const baseline = {
      player: cardio.interval.playerProgress,
      fatigue: cardio.interval.fatigue,
    };

    pushCardioRace();
    advanceCardioInterval(5);
    const afterPush = {
      player: cardio.interval.playerProgress,
      fatigue: cardio.interval.fatigue,
    };

    recoverCardioRace();
    advanceCardioInterval(5);
    const afterRecover = {
      player: cardio.interval.playerProgress,
      fatigue: cardio.interval.fatigue,
    };

    return { baseline, afterPush, afterRecover };
  });

  expect(result.afterPush.player).toBeGreaterThan(result.baseline.player);
  expect(result.afterPush.fatigue).toBeGreaterThan(result.baseline.fatigue);
  expect(result.afterRecover.fatigue).toBeLessThan(result.afterPush.fatigue);
});

test("cardio automation toggles render in cardio gym", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 3;
    checks.cardioUpgradeBuyer = true;
    checks.cardioUpgradeBuyerOn = true;
    checks.cardioGymBuyer = true;
    checks.cardioGymBuyerOn = true;
    checks.cardioAdBuyer = true;
    checks.cardioAdBuyerOn = true;
    checks.paceBuyer = true;
    checks.paceBuyerOn = true;

    updateAutobuyerToggles();

    return {
      hasCardioUpgradeToggle: document.querySelector("#cardioUpgradeBuyer") != null,
      hasCardioGymToggle: document.querySelector("#cardioGymBuyer") != null,
      hasCardioAdToggle: document.querySelector("#cardioAdBuyer") != null,
      hasPaceToggle: document.querySelector("#paceBuyer") != null,
      paceToggleText: document.querySelector("label[for='paceBuyer']")?.textContent ?? "",
    };
  });

  expect(result.hasCardioUpgradeToggle).toBe(true);
  expect(result.hasCardioGymToggle).toBe(true);
  expect(result.hasCardioAdToggle).toBe(true);
  expect(result.hasPaceToggle).toBe(true);
  expect(result.paceToggleText).toContain("Race Day");
});

test("starting a new cardio gym run resets race day progression", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    window.confirm = () => true;

    checks.isPrestige = true;
    checks.gymType = 3;
    cardio.treadmill.total = 500000;
    cardio.treadmill.tier = 4;
    cardio.treadmill.current = 42;
    cardio.hills.total = 300000;
    cardio.hills.tier = 3;
    cardio.interval.playerProgress = 0.67;
    cardio.interval.rival1Progress = 0.72;
    cardio.interval.activeRaceId = "city_circuit";
    cardio.interval.fatigue = 0.33;

    newGym(3);

    return {
      gymType: checks.gymType,
      treadmillTotal: cardio.treadmill.total,
      treadmillTier: cardio.treadmill.tier,
      treadmillCurrent: cardio.treadmill.current,
      hillsTotal: cardio.hills.total,
      hillsTier: cardio.hills.tier,
      playerProgress: cardio.interval.playerProgress,
      rival1Progress: cardio.interval.rival1Progress,
      activeRaceId: cardio.interval.activeRaceId,
      fatigue: cardio.interval.fatigue,
    };
  });

  expect(result.gymType).toBe(3);
  expect(result.treadmillTotal).toBe(0);
  expect(result.treadmillTier).toBe(0);
  expect(result.treadmillCurrent).toBe(0);
  expect(result.hillsTotal).toBe(0);
  expect(result.hillsTier).toBe(0);
  expect(result.playerProgress).toBe(0);
  expect(result.rival1Progress).toBe(0);
  expect(result.activeRaceId).toBe("");
  expect(result.fatigue).toBe(0);
});
