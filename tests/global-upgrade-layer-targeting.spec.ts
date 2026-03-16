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

test("late global upgrades target intended layer 1 and global runtime systems without mutating layer 0 loops", async ({
  page,
}) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");
  await page.waitForFunction(() => typeof globalUpgradeClick === "function");

  const result = await page.evaluate(() => {
    const upgrade27 = prestige.upgrades.find((entry) => entry.id === 27);
    const upgrade28 = prestige.upgrades.find((entry) => entry.id === 28);
    const upgrade30 = prestige.upgrades.find((entry) => entry.id === 30);
    const upgrade34 = prestige.upgrades.find((entry) => entry.id === 34);
    const upgrade35 = prestige.upgrades.find((entry) => entry.id === 35);
    const upgrade36 = prestige.upgrades.find((entry) => entry.id === 36);
    const upgrade37 = prestige.upgrades.find((entry) => entry.id === 37);
    const upgrade38 = prestige.upgrades.find((entry) => entry.id === 38);
    const upgrade39 = prestige.upgrades.find((entry) => entry.id === 39);
    const upgrade44 = prestige.upgrades.find((entry) => entry.id === 44);
    const upgrade45 = prestige.upgrades.find((entry) => entry.id === 45);
    const upgrade46 = prestige.upgrades.find((entry) => entry.id === 46);
    if (!upgrade27 || !upgrade28 || !upgrade30 || !upgrade34 || !upgrade35 || !upgrade36 || !upgrade37 || !upgrade38 || !upgrade39 || !upgrade44 || !upgrade45 || !upgrade46) {
      return { missing: true };
    }

    upgrade27.isPurchased = false;
    upgrade28.isPurchased = false;
    upgrade30.isPurchased = false;
    upgrade34.isPurchased = false;
    upgrade35.isPurchased = false;
    upgrade36.isPurchased = false;
    upgrade37.isPurchased = false;
    upgrade38.isPurchased = false;
    upgrade39.isPurchased = false;
    upgrade44.isPurchased = false;
    upgrade45.isPurchased = false;
    upgrade46.isPurchased = false;

    research.pointGrowth = 0.123;
    job.moneyGrowth = 0.456;
    gym.advertising.adGrowth = 0.07;
    gym.advertising.influenceGrowth = 0.02;
    gym.money.growth = 0.03;
    gym.advertising.adMulti = 0.00003;
    gym.money.classMultiplier = 0.002;
    gym.trainMembers.trainAmount = 11;
    gym.createClasses.classAmount = 7;
    gym.advertising.campaignGrowth = 13;
    stats.energy.increase = 1.6;
    gym.employees.sales.boost = 0.09;

    const before = {
      researchPointGrowth: research.pointGrowth,
      jobMoneyGrowth: job.moneyGrowth,
      adGrowth: gym.advertising.adGrowth,
      influenceGrowth: gym.advertising.influenceGrowth,
      gymMoneyGrowth: gym.money.growth,
      adMulti: gym.advertising.adMulti,
      classMultiplier: gym.money.classMultiplier,
      trainAmount: gym.trainMembers.trainAmount,
      classAmount: gym.createClasses.classAmount,
      campaignGrowth: gym.advertising.campaignGrowth,
      energyIncrease: stats.energy.increase,
      salesBoost: gym.employees.sales.boost,
    };

    [27, 28, 30, 34, 35, 36, 37, 38, 39, 44, 45, 46].forEach((id) => {
      const button = document.createElement("button");
      button.id = `globalUpgradeBtn${id}`;
      document.body.appendChild(button);
      globalUpgradeClick(button, true);
      button.remove();
    });

    const after = {
      researchPointGrowth: research.pointGrowth,
      jobMoneyGrowth: job.moneyGrowth,
      adGrowth: gym.advertising.adGrowth,
      influenceGrowth: gym.advertising.influenceGrowth,
      gymMoneyGrowth: gym.money.growth,
      adMulti: gym.advertising.adMulti,
      classMultiplier: gym.money.classMultiplier,
      trainAmount: gym.trainMembers.trainAmount,
      classAmount: gym.createClasses.classAmount,
      campaignGrowth: gym.advertising.campaignGrowth,
      energyIncrease: stats.energy.increase,
      salesBoost: gym.employees.sales.boost,
    };

    return { missing: false, before, after };
  });

  expect(result.missing).toBe(false);
  expect(result.after.adGrowth).toBeCloseTo(result.before.adGrowth * 2, 10);
  expect(result.after.influenceGrowth).toBeCloseTo(result.before.influenceGrowth * 2, 10);
  expect(result.after.gymMoneyGrowth).toBeCloseTo(result.before.gymMoneyGrowth * 2, 10);
  expect(result.after.trainAmount).toBeCloseTo(result.before.trainAmount * 2, 10);
  expect(result.after.classAmount).toBeCloseTo(result.before.classAmount * 3, 10);
  expect(result.after.campaignGrowth).toBeCloseTo(result.before.campaignGrowth * 3, 10);
  expect(result.after.energyIncrease).toBeCloseTo(result.before.energyIncrease * 1.5, 10);
  expect(result.after.salesBoost).toBeCloseTo(result.before.salesBoost * 1.5, 10);
  expect(result.after.researchPointGrowth).toBeCloseTo(result.before.researchPointGrowth, 10);
  expect(result.after.jobMoneyGrowth).toBeCloseTo(result.before.jobMoneyGrowth, 10);
  expect(result.after.classMultiplier).toBeCloseTo(result.before.classMultiplier * 3, 10);
  expect(result.after.adMulti).toBeCloseTo(result.before.adMulti * 3, 10);
});
