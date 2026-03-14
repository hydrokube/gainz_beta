import { expect, test } from "@playwright/test";

test("modifier pipeline enforces base/add/mult/exp/global/layer order", async ({ page }) => {
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
    const ordered = applyModifierPipeline(2, {
      additive: [3],
      multiplicative: [5],
      exponential: [2],
      global: [7],
      layer: [11],
    });

    const expected = (((2 + 3) * 5) ** 2) * 7 * 11;

    stats.strength = 10;
    stats.endurance = 20;
    stats.agility = 30;
    stats.intelligence = 40;
    stats.allStatBoost = 0.1;
    const allStatMultiplier = getAllStatMultiplier();
    const expectedAllStatMultiplier = 1 + ((10 + 20 + 30 + 40) * 0.1);

    return {
      ordered,
      expected,
      allStatMultiplier,
      expectedAllStatMultiplier,
    };
  });

  expect(metrics.ordered).toBe(metrics.expected);
  expect(metrics.allStatMultiplier).toBe(metrics.expectedAllStatMultiplier);
  expect(errors).toEqual([]);
});
