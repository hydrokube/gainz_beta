import { expect, test } from "@playwright/test";

test("campaign growth uses softcap behavior instead of hard cap", async ({ page }) => {
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

  const metrics = await page.evaluate(() => {
    const belowSoftcap = applySoftcap(5e5, 1e6, 0.5);
    const aboveSoftcap = applySoftcap(1e220, 1e200, 0.5);

    checks.gymType = 0;
    gym.advertising.campaignGrowth = 1e220;
    gym.advertising.employees.coordinators.current = 1;
    gym.advertising.employees.managers.current = 0;
    stats.strength = 0;
    stats.endurance = 0;
    stats.agility = 0;
    stats.intelligence = 0;

    return {
      belowSoftcap,
      aboveSoftcap,
      campaignFormula: gymCampaignFormula(),
    };
  });

  expect(metrics.belowSoftcap).toBe(5e5);
  expect(metrics.aboveSoftcap).toBeGreaterThan(1e200);
  expect(metrics.aboveSoftcap).toBeLessThan(1e220);
  expect(metrics.campaignFormula).toBeGreaterThan(1e200);
  expect(metrics.campaignFormula).toBeLessThan(1e220);
  expect(errors).toEqual([]);
});
