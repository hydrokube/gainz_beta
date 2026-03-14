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

test("exercise stat gains use modifier pipeline ordering", async ({ page }) => {
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

  const results = await page.evaluate(() => {
    checks.gymType = 0;

    stats.energy.current = 1e9;
    stats.strength = 100;
    stats.endurance = 200;
    stats.agility = 300;
    stats.intelligence = 400;
    stats.intelligenceBoost = 0.01;

    prestige.lifting.leadership = 20;
    prestige.lifting.leadershipBoost = 0.05;

    const exercise = bodyweight.pushups;
    exercise.current = exercise.max;
    exercise.total = 0;
    exercise.energy = 1;
    exercise.strength = 0.5;
    exercise.endurance = 0.25;
    exercise.agility = 0.125;
    exercise.tier = 0;

    const strengthBefore = stats.strength;
    const enduranceBefore = stats.endurance;
    const agilityBefore = stats.agility;
    const totalBefore = exercise.total;

    const expectedStrengthGain = applyModifierPipeline(exercise.strength, {
      multiplicative: [getIntelligenceMultiplier()],
      layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier()],
    });

    const expectedEnduranceGain = applyModifierPipeline(exercise.endurance, {
      multiplicative: [getIntelligenceMultiplier()],
      layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier()],
    });

    const expectedAgilityGain = applyModifierPipeline(exercise.agility, {
      multiplicative: [getIntelligenceMultiplier()],
      layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier()],
    });

    const expectedTotalGain = applyModifierPipeline(1, {
      additive: [stats.strength * stats.strengthBoost],
    });

    exerciseTick(exercise);

    return {
      strengthDelta: stats.strength - strengthBefore,
      enduranceDelta: stats.endurance - enduranceBefore,
      agilityDelta: stats.agility - agilityBefore,
      totalDelta: exercise.total - totalBefore,
      expectedStrengthGain,
      expectedEnduranceGain,
      expectedAgilityGain,
      expectedTotalGain,
    };
  });

  expect(results.strengthDelta).toBeCloseTo(results.expectedStrengthGain, 10);
  expect(results.enduranceDelta).toBeCloseTo(results.expectedEnduranceGain, 10);
  expect(results.agilityDelta).toBeCloseTo(results.expectedAgilityGain, 10);
  expect(results.totalDelta).toBeCloseTo(results.expectedTotalGain, 10);
  expect(errors).toEqual([]);
});

test("gym economy formulas use modifier pipeline ordering", async ({ page }) => {
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

  const results = await page.evaluate(() => {
    checks.gymType = 0;

    stats.strength = 10;
    stats.endurance = 10;
    stats.agility = 10;
    stats.intelligence = 10;
    stats.allStatBoost = 0.01;

    prestige.bw.confidence = 5;
    prestige.bw.confidenceBoost = 0.02;

    gym.classes = 25;
    gym.money.classMultiplier = 0.05;
    gym.money.growth = 2;
    gym.money.flatIncrease = 3;

    gym.members.tiers.forEach((tier) => {
      tier.current = 0;
    });
    gym.members.tiers[0].current = 100;
    gym.members.growth = 1;
    gym.members.current = 0;
    gym.members.capacity = 1e12;

    gym.employees.sales.current = 4;
    gym.employees.sales.boost = 2;
    gym.employees.nutritionists.current = 3;
    gym.employees.nutritionists.boost = 0.5;

    prestige.lifting.upgrades
      .filter((upgrade) => upgrade.id === 0)
      .forEach((upgrade) => {
        upgrade.isPurchased = true;
      });
    lifting.comps.competitions.current = 5000;

    const classMultiplier = 1 + (gym.classes * gym.money.classMultiplier);
    const compMultiplier = Math.pow(lifting.comps.competitions.current, 0.015);
    const layer1Multiplier = getLayer1PacingMultiplier();
    const expectedMoney =
      (gym.members.tiers[0].current * gym.money.growth * (gym.members.tiers[0].multiplier * 1) * classMultiplier * compMultiplier * layer1Multiplier) +
      gym.money.flatIncrease;

    const allStatMultiplier = 1 + ((stats.strength + stats.endurance + stats.agility + stats.intelligence) * stats.allStatBoost);
    const confidenceMultiplier = 1 + (prestige.bw.confidence * prestige.bw.confidenceBoost);
    const nutritionistMultiplier = 1 + (gym.employees.nutritionists.current * gym.employees.nutritionists.boost);
    const expectedMembersPerSecond =
      (gym.members.growth + ((gym.employees.sales.boost * gym.employees.sales.current) * nutritionistMultiplier)) *
      allStatMultiplier *
      confidenceMultiplier *
      layer1Multiplier;

    return {
      moneyPerSecond: gymMoneyPerSecond(),
      membersPerSecond: gymMembersPerSecond(),
      expectedMoney,
      expectedMembersPerSecond,
    };
  });

  expect(results.moneyPerSecond).toBeCloseTo(results.expectedMoney, 8);
  expect(results.membersPerSecond).toBeCloseTo(results.expectedMembersPerSecond, 8);
  expect(errors).toEqual([]);
});
