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

test("energy display stays synchronized with runtime values across gyms at high debug speed", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");

  const result = await page.evaluate(() => {
    function stopAllExercises() {
      const all = [
        bodyweight.pushups,
        bodyweight.rows,
        bodyweight.dips,
        bodyweight.pullups,
        bodyweight.squats,
        bodyweight.rdl,
        lifting.bench,
        lifting.rows,
        lifting.ohp,
        lifting.squats,
        lifting.dls,
        lifting.curls,
        yoga.sun,
        yoga.vinyasa,
        yoga.balance,
        yoga.mobility,
        yoga.core,
        yoga.breath,
      ];

      for (const exercise of all) {
        exercise.isStopped = true;
        exercise.current = 0;
      }
    }

    function armSingleExercise(gymType: number) {
      let exercise;
      if (gymType === 0) {
        exercise = bodyweight.pushups;
      } else if (gymType === 1) {
        exercise = lifting.bench;
      } else {
        exercise = yoga.sun;
      }

      exercise.isStopped = false;
      exercise.current = 0;
      exercise.max = 10;
      exercise.increase = 10;
      exercise.speed = 100;
      exercise.speedModifier = 1;
      exercise.energy = 1;
    }

    function runGym(gymType: number) {
      stopAllExercises();
      armSingleExercise(gymType);

      checks.gymType = gymType;
      checks.isResting = false;

      stats.energy.originalMax = 25;
      stats.energy.max = 25;
      stats.energy.current = 25;
      stats.energy.increase = 0.05;
      stats.agility = 0;
      stats.agilityBoost = 1;
      stats.endurance = 0;
      stats.enduranceBoost = 1;
      stats.energy.coffee.isActive = false;
      stats.energy.coffee.isCooldown = false;
      stats.energy.coffee.current = 0;

      setDebugSpeedMultiplier(60);
      restartRuntimeIntervalsForDebugSpeed();

      let maxDiff = 0;
      let minActual = Number.POSITIVE_INFINITY;
      let maxActual = Number.NEGATIVE_INFINITY;
      let sampled = 0;

      for (let i = 0; i < 80; i += 1) {
        window.__gainzTest.stepTicks(1, 50);
        const actual = Number(stats.energy.current);
        const shown = Number($("#energyProgress").attr("aria-valuenow"));
        if (!Number.isFinite(actual) || !Number.isFinite(shown)) {
          continue;
        }
        maxDiff = Math.max(maxDiff, Math.abs(actual - shown));
        minActual = Math.min(minActual, actual);
        maxActual = Math.max(maxActual, actual);
        sampled += 1;
      }

      return {
        gymType,
        sampled,
        maxDiff,
        minActual,
        maxActual,
      };
    }

    const byGym = [0, 1, 2].map(runGym);
    setDebugSpeedMultiplier(1);
    restartRuntimeIntervalsForDebugSpeed();
    return byGym;
  });

  for (const gym of result) {
    expect(gym.sampled).toBeGreaterThan(40);
    expect(gym.maxDiff).toBeLessThanOrEqual(0.11);
    expect(gym.maxActual).toBeGreaterThanOrEqual(gym.minActual);
  }
});

test("energy display remains synchronized during coffee-driven refill behavior at 1x across gyms", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?debug=1&deterministic=1");

  const result = await page.evaluate(() => {
    function stopAllExercises() {
      const all = [
        bodyweight.pushups,
        bodyweight.rows,
        bodyweight.dips,
        bodyweight.pullups,
        bodyweight.squats,
        bodyweight.rdl,
        lifting.bench,
        lifting.rows,
        lifting.ohp,
        lifting.squats,
        lifting.dls,
        lifting.curls,
        yoga.sun,
        yoga.vinyasa,
        yoga.balance,
        yoga.mobility,
        yoga.core,
        yoga.breath,
      ];

      for (const exercise of all) {
        exercise.isStopped = true;
        exercise.current = 0;
      }
    }

    function armSingleExercise(gymType: number) {
      let exercise;
      if (gymType === 0) {
        exercise = bodyweight.pushups;
      } else if (gymType === 1) {
        exercise = lifting.bench;
      } else {
        exercise = yoga.sun;
      }

      exercise.isStopped = false;
      exercise.current = 0;
      exercise.max = 10;
      exercise.increase = 10;
      exercise.speed = 1000;
      exercise.speedModifier = 1;
      exercise.energy = 1;
    }

    function runGym(gymType: number) {
      stopAllExercises();
      armSingleExercise(gymType);

      checks.gymType = gymType;
      checks.isResting = false;

      stats.energy.originalMax = 25;
      stats.energy.max = 25;
      stats.energy.current = 2.5;
      stats.energy.increase = 0.6;
      stats.agility = 0;
      stats.agilityBoost = 1;
      stats.endurance = 0;
      stats.enduranceBoost = 1;
      stats.energy.coffee.isActive = true;
      stats.energy.coffee.isCooldown = true;
      stats.energy.coffee.current = 0;
      stats.energy.coffee.timer = 9999;
      stats.energy.coffee.cooldown = 99999;

      setDebugSpeedMultiplier(1);
      restartRuntimeIntervalsForDebugSpeed();

      const startActual = Number(stats.energy.current);
      let maxDiff = 0;
      let sampled = 0;

      for (let i = 0; i < 120; i += 1) {
        window.__gainzTest.stepTicks(1, 50);
        const actual = Number(stats.energy.current);
        const shown = Number($("#energyProgress").attr("aria-valuenow"));
        if (!Number.isFinite(actual) || !Number.isFinite(shown)) {
          continue;
        }
        maxDiff = Math.max(maxDiff, Math.abs(actual - shown));
        sampled += 1;
      }

      return {
        gymType,
        sampled,
        startActual,
        endActual: Number(stats.energy.current),
        maxDiff,
      };
    }

    const byGym = [0, 1, 2].map(runGym);
    stats.energy.coffee.isActive = false;
    stats.energy.coffee.isCooldown = false;
    return byGym;
  });

  for (const gym of result) {
    expect(gym.sampled).toBeGreaterThan(60);
    expect(gym.endActual).toBeGreaterThan(gym.startActual);
    expect(gym.maxDiff).toBeLessThanOrEqual(0.11);
  }
});
