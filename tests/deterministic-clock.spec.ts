import { expect, test } from "@playwright/test";

test("deterministic mode supports manual tick stepping", async ({ page }) => {
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

  const deterministicEnabled = await page.evaluate(() => {
    return !!window.__gainzClock && window.__gainzClock.isDeterministic();
  });
  expect(deterministicEnabled).toBe(true);

  const existingTimerCount = await page.evaluate(() => {
    return window.__gainzClock.timerCount();
  });
  expect(existingTimerCount).toBeGreaterThan(0);

  await page.evaluate(() => {
    window.__clockProbeTicks = 0;
    window.setInterval(() => {
      window.__clockProbeTicks += 1;
    }, 100);
  });

  await page.evaluate(() => {
    window.__gainzClock.step(99);
  });
  const probeBeforeTick = await page.evaluate(() => window.__clockProbeTicks);
  expect(probeBeforeTick).toBe(0);

  await page.evaluate(() => {
    window.__gainzClock.step(1);
  });
  const probeAfterTick = await page.evaluate(() => window.__clockProbeTicks);
  expect(probeAfterTick).toBe(1);

  expect(errors).toEqual([]);
});
