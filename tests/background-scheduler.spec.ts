import { expect, test } from "@playwright/test";

test("background catchup works without hacktimer dependency", async ({ page }) => {
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

  const backgroundInfo = await page.evaluate(() => {
    const hasHackTimerScript = Array.from(document.scripts).some((script) => {
      return script.src.includes("hacktimer.min.js");
    });

    checks.gymType = -1;
    stats.money = 0;
    job.views = 1000;
    applyBackgroundCatchup(10);

    return {
      hasHackTimerScript,
      moneyAfterCatchup: stats.money,
      summaryVisible: $("#offlineProgressAlert").length > 0,
    };
  });

  expect(backgroundInfo.hasHackTimerScript).toBe(false);
  expect(backgroundInfo.moneyAfterCatchup).toBeGreaterThan(0);
  expect(backgroundInfo.summaryVisible).toBe(true);

  expect(errors).toEqual([]);
});
