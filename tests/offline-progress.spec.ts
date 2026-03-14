import { expect, test } from "@playwright/test";

test("offline progress grants simulated gains based on elapsed save time", async ({ page }) => {
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

  const gainedMoney = await page.evaluate(() => {
    checks.gymType = -1;
    stats.money = 0;
    job.views = 1000;
    save(true);

    const saveObject = JSON.parse(localStorage.getItem(saveName));
    saveObject.payload[0].saveTime = Date.now() - 10 * 1000;
    saveObject.payload[0].money = 0;
    localStorage.setItem(saveName, JSON.stringify(saveObject));

    load(null, false, false);
    return stats.money;
  });

  expect(gainedMoney).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
