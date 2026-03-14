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

test("stress simulation keeps economy resources valid", async ({ page }) => {
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
  await page.goto("/?deterministic=1&seed=1337");

  const result = await page.evaluate(() => {
    function runCheckInBurst() {
      for (let loops = 0; loops < 6; loops += 1) {
        autobuyUpgrades(upgrades, "upgrade", stats.money);
        autobuyUpgrades(bodyweight.upgrades, "bwUpgrade", stats.money);
        autobuyUpgrades(job.upgrades, "jobUpgrade", job.followers);
        autobuyUpgrades(research.upgrades, "resUpgrade", research.points);

        if (checks.gymType !== -1) {
          autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
          autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
          autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
          autobuyUpgrades(gym.bw.upgrades, "bwUpgrade", stats.money);
          autobuyUpgrades(gym.bw.gymUpgrades, "gymBwUpgrade", stats.money);
          autobuyUpgrades(gym.bw.adUpgrades, "adBwUpgrade", gym.advertising.influence);
        }
      }

      if (!$("#coffeeBtn").hasClass("disabled")) {
        $("#coffeeBtn").click();
      }
      if (!$("#payDayBtn").hasClass("disabled")) {
        $("#payDayBtn").click();
      }
    }

    window.__gainzAssertLog.length = 0;
    runCheckInBurst();

    applyOfflineProgress(2 * 3600);
    for (let i = 0; i < 8; i += 1) {
      window.__gainzTest.fastForward(5 * 60 * 1000, 1000);
      runCheckInBurst();
      if (checks.isPrestige) {
        newGym(0);
      }
    }

    assertValidState("stress_sim_validation", { strict: true });

    const criticalValues = [
      stats.money,
      stats.energy.current,
      stats.strength,
      stats.endurance,
      stats.agility,
      stats.intelligence,
      job.followers,
      job.views,
      research.points,
      gym.members.current,
      gym.advertising.influence,
      prestige.current,
      prestige.bw.current,
      prestige.lifting.current,
      lifting.comps.competitions.current,
      bodyweight.gang.strength,
      bodyweight.gang.members,
    ];

    return {
      assertionCount: window.__gainzAssertLog.length,
      firstAssertion: window.__gainzAssertLog[0] || null,
      allFinite: criticalValues.every((value) => Number.isFinite(value)),
      allNonNegative: criticalValues.every((value) => value >= 0),
    };
  });

  expect(result.assertionCount).toBe(0);
  expect(result.firstAssertion).toBeNull();
  expect(result.allFinite).toBe(true);
  expect(result.allNonNegative).toBe(true);
  expect(errors).toEqual([]);
});
