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

test("bodyweight capstone grants global action-speed bonus across gyms", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    const capstone = prestige.bw.upgrades.find((entry) => entry.id === 20);
    if (!capstone) {
      return { missingCapstone: true };
    }

    capstone.isPurchased = false;
    const baselineDelay = getScaledTimerDelay(1000);

    capstone.isPurchased = true;
    const capstoneDelay = getScaledTimerDelay(1000);

    return {
      missingCapstone: false,
      baselineDelay,
      capstoneDelay,
    };
  });

  expect(result.missingCapstone).toBe(false);
  expect(result.capstoneDelay).toBeLessThan(result.baselineDelay);
  expect(result.capstoneDelay).toBeCloseTo(result.baselineDelay / 1.08, 8);
});

test("lifting capstone preserves overflow progress across all gyms", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const capstone = prestige.lifting.upgrades.find((entry) => entry.id === 19);
    if (!capstone) {
      return { missingCapstone: true };
    }

    const baseSnapshot = window.__gainzTest.snapshot();

    function runBodyweightOverflow(withCapstone: boolean) {
      window.__gainzTest.restore(baseSnapshot);
      const liftingCap = prestige.lifting.upgrades.find((entry) => entry.id === 19);
      if (liftingCap) {
        liftingCap.isPurchased = withCapstone;
      }

      checks.gymType = 0;
      stats.energy.current = stats.energy.max;
      bodyweight.pushups.current = bodyweight.pushups.max + 4;
      exerciseTick(bodyweight.pushups);
      return bodyweight.pushups.current;
    }

    function runLiftingOverflow(withCapstone: boolean) {
      window.__gainzTest.restore(baseSnapshot);
      const liftingCap = prestige.lifting.upgrades.find((entry) => entry.id === 19);
      if (liftingCap) {
        liftingCap.isPurchased = withCapstone;
      }

      checks.gymType = 1;
      stats.energy.current = stats.energy.max;
      lifting.bench.current = lifting.bench.max + 4;
      lifting.bench.repsToNext = 9.5;
      lifting.bench.repsToNextBase = 10;
      exerciseTick(lifting.bench);
      return {
        current: lifting.bench.current,
        repsToNext: lifting.bench.repsToNext,
      };
    }

    const bodyweightWithout = runBodyweightOverflow(false);
    const bodyweightWith = runBodyweightOverflow(true);
    const liftingWithout = runLiftingOverflow(false);
    const liftingWith = runLiftingOverflow(true);

    return {
      missingCapstone: false,
      bodyweightWithout,
      bodyweightWith,
      liftingWithout,
      liftingWith,
    };
  });

  expect(result.missingCapstone).toBe(false);
  expect(result.bodyweightWithout).toBeCloseTo(0, 10);
  expect(result.bodyweightWith).toBeGreaterThan(0);
  expect(result.bodyweightWith).toBeCloseTo(1, 8);

  expect(result.liftingWithout.current).toBeCloseTo(0, 10);
  expect(result.liftingWithout.repsToNext).toBeCloseTo(0, 10);
  expect(result.liftingWith.current).toBeGreaterThan(0);
  expect(result.liftingWith.repsToNext).toBeGreaterThan(0);
});
