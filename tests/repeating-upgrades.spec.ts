import { expect, test } from "@playwright/test";

test("repeating upgrade schema exposes deterministic cost/effect evaluators", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await page.route("https://www.googletagmanager.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: "",
      contentType: "application/javascript",
    });
  });

  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const defs = window.__gainzRepeatingUpgrades.definitions;
    const def = {
      id: "test_repeatable",
      cost: {
        baseCost: 100,
        growth: 1.5,
        curve: 0.4,
      },
      effect: {
        type: "multiplicative",
        base: 1.03,
      },
    };

    const level = 7;
    const cost = window.__gainzRepeatingUpgrades.getCost(def, level);
    const expectedCost =
      def.cost.baseCost *
      Math.pow(def.cost.growth, level) *
      Math.pow(level + 1, def.cost.curve);

    const effect = window.__gainzRepeatingUpgrades.getEffect(def, level);
    const expectedEffect = Math.pow(def.effect.base, level);

    const state = window.__gainzRepeatingUpgrades.getState(def.id);

    return {
      definitionCount: defs.global.length,
      globalDefinitionIds: defs.global.map((entry) => entry.id),
      bodyweightDefinitionCount: defs.bodyweight.length,
      liftingDefinitionCount: defs.lifting.length,
      yogaDefinitionCount: defs.yoga.length,
      flowDefinitionCount: defs.flow.length,
      confidenceDefinitionCount: defs.confidence.length,
      leadershipDefinitionCount: defs.leadership.length,
      cost,
      expectedCost,
      effect,
      expectedEffect,
      stateLevel: state.level,
      stateExists: !!stats.repeatingUpgrades[def.id],
    };
  });

  expect(result.definitionCount).toBe(3);
  expect(result.globalDefinitionIds).toEqual(
    expect.arrayContaining([
      "global_franchise_tempo",
      "global_recovery_grid",
      "global_market_engine",
    ]),
  );
  expect(result.bodyweightDefinitionCount).toBe(1);
  expect(result.liftingDefinitionCount).toBe(1);
  expect(result.yogaDefinitionCount).toBe(1);
  expect(result.flowDefinitionCount).toBe(1);
  expect(result.confidenceDefinitionCount).toBe(1);
  expect(result.leadershipDefinitionCount).toBe(1);
  expect(result.cost).toBeCloseTo(result.expectedCost, 8);
  expect(result.effect).toBeCloseTo(result.expectedEffect, 8);
  expect(result.stateLevel).toBe(0);
  expect(result.stateExists).toBeTruthy();
  expect(errors).toEqual([]);
});

test("mastery repeaters require capstones and measurably increase action speed / overflow retention", async ({
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

  await page.route("https://www.googletagmanager.com/**", async (route) => {
    await route.fulfill({
      status: 204,
      body: "",
      contentType: "application/javascript",
    });
  });

  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    stats.repeatingUpgrades = {};
    prestige.current = 1000;
    prestige.bw.current = 1000;
    prestige.lifting.current = 1000;

    const globalDefId = "global_franchise_tempo";
    const bodyweightDefId = "bodyweight_street_tempo";
    const liftingDefId = "lifting_rep_reclamation";

    prestige.bw.upgrades.find((upgrade) => upgrade.id === 20).isPurchased = false;
    prestige.lifting.upgrades.find((upgrade) => upgrade.id === 19).isPurchased = false;

    const lockedGlobalLevelBefore = window.__gainzRepeatingUpgrades.getState(globalDefId).level;
    repeatingUpgradeClick("global", globalDefId);
    const lockedGlobalLevelAfter = window.__gainzRepeatingUpgrades.getState(globalDefId).level;

    const baseActionSpeed = getGymMasteryActionSpeedMultiplier();
    const baseOverflowRetention = getGymMasteryOverflowRetention();

    prestige.bw.upgrades.find((upgrade) => upgrade.id === 20).isPurchased = true;
    prestige.lifting.upgrades.find((upgrade) => upgrade.id === 19).isPurchased = true;

    const unlockedActionSpeedBefore = getGymMasteryActionSpeedMultiplier();
    const unlockedOverflowBefore = getGymMasteryOverflowRetention();

    repeatingUpgradeClick("bodyweight", bodyweightDefId);
    repeatingUpgradeClick("global", globalDefId);
    repeatingUpgradeClick("lifting", liftingDefId);

    const upgradedActionSpeed = getGymMasteryActionSpeedMultiplier();
    const upgradedOverflowRetention = getGymMasteryOverflowRetention();

    return {
      lockedGlobalLevelBefore,
      lockedGlobalLevelAfter,
      baseActionSpeed,
      baseOverflowRetention,
      unlockedActionSpeedBefore,
      unlockedOverflowBefore,
      upgradedActionSpeed,
      upgradedOverflowRetention,
      bodyweightLevel: window.__gainzRepeatingUpgrades.getState(bodyweightDefId).level,
      globalLevel: window.__gainzRepeatingUpgrades.getState(globalDefId).level,
      liftingLevel: window.__gainzRepeatingUpgrades.getState(liftingDefId).level,
    };
  });

  expect(result.lockedGlobalLevelAfter).toBe(result.lockedGlobalLevelBefore);
  expect(result.baseActionSpeed).toBeCloseTo(1, 8);
  expect(result.baseOverflowRetention).toBeCloseTo(0, 8);
  expect(result.unlockedActionSpeedBefore).toBeGreaterThan(1);
  expect(result.unlockedOverflowBefore).toBeGreaterThan(0);
  expect(result.upgradedActionSpeed).toBeGreaterThan(result.unlockedActionSpeedBefore);
  expect(result.upgradedOverflowRetention).toBeGreaterThan(result.unlockedOverflowBefore);
  expect(result.bodyweightLevel).toBe(1);
  expect(result.globalLevel).toBe(1);
  expect(result.liftingLevel).toBe(1);
  expect(errors).toEqual([]);
});
