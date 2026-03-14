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

test("lifting upgrade id 12 doubles deadlift stats without creating invalid aggregate lifting fields", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");
  await page.waitForFunction(() => typeof phase2LiftingUpgradeClick === "function");

  const result = await page.evaluate(() => {
    if (Array.isArray(window.__gainzAssertLog)) {
      window.__gainzAssertLog.length = 0;
    }

    stats.money = 1e9;
    checks.gymType = 1;

    const upgrade = gym.lifting.upgrades.find((entry) => entry.id === 12);
    if (!upgrade) {
      return { missingUpgrade: true };
    }

    upgrade.isPurchased = false;

    lifting.squats.energy = 8;
    lifting.squats.strength = 2;
    lifting.squats.endurance = 3;
    lifting.squats.agility = 4;

    lifting.dls.energy = 10;
    lifting.dls.strength = 5;
    lifting.dls.endurance = 6;
    lifting.dls.agility = 7;

    delete lifting.strength;
    delete lifting.endurance;
    delete lifting.agility;

    const button = document.createElement("button");
    button.id = "liftingUpgradeBtn12";
    document.body.appendChild(button);
    phase2LiftingUpgradeClick(button);
    button.remove();

    assertValidState("lifting_upgrade_regression", { strict: true });

    const liftingAssertionPaths = Array.isArray(window.__gainzAssertLog)
      ? window.__gainzAssertLog
          .filter((entry) => typeof entry.path === "string" && entry.path.startsWith("lifting."))
          .map((entry) => entry.path)
      : [];

    return {
      missingUpgrade: false,
      isPurchased: upgrade.isPurchased,
      squats: {
        energy: lifting.squats.energy,
        strength: lifting.squats.strength,
        endurance: lifting.squats.endurance,
        agility: lifting.squats.agility,
      },
      dls: {
        energy: lifting.dls.energy,
        strength: lifting.dls.strength,
        endurance: lifting.dls.endurance,
        agility: lifting.dls.agility,
      },
      hasAggregateLiftingStrength: Object.prototype.hasOwnProperty.call(lifting, "strength"),
      hasAggregateLiftingEndurance: Object.prototype.hasOwnProperty.call(lifting, "endurance"),
      hasAggregateLiftingAgility: Object.prototype.hasOwnProperty.call(lifting, "agility"),
      liftingAssertionPaths,
    };
  });

  expect(result.missingUpgrade).toBe(false);
  expect(result.isPurchased).toBe(true);

  expect(result.squats.energy).toBe(16);
  expect(result.squats.strength).toBe(4);
  expect(result.squats.endurance).toBe(6);
  expect(result.squats.agility).toBe(8);

  expect(result.dls.energy).toBe(20);
  expect(result.dls.strength).toBe(10);
  expect(result.dls.endurance).toBe(12);
  expect(result.dls.agility).toBe(14);

  expect(result.hasAggregateLiftingStrength).toBe(false);
  expect(result.hasAggregateLiftingEndurance).toBe(false);
  expect(result.hasAggregateLiftingAgility).toBe(false);
  expect(result.liftingAssertionPaths).toEqual([]);
});
