import { expect, test } from "@playwright/test";

test("test hooks support deterministic stepping and snapshot restore", async ({ page }) => {
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

  await page.goto("/?deterministic=1&seed=77");

  const hasHooks = await page.evaluate(() => {
    return (
      !!window.__gainzTest &&
      typeof window.__gainzTest.stepTicks === "function" &&
      typeof window.__gainzTest.fastForward === "function" &&
      typeof window.__gainzTest.setNow === "function" &&
      typeof window.__gainzTest.snapshot === "function"
    );
  });
  expect(hasHooks).toBe(true);

  await page.evaluate(() => {
    window.__hookProbeTicks = 0;
    window.setInterval(() => {
      window.__hookProbeTicks += 1;
    }, 100);
  });

  await page.evaluate(() => {
    window.__gainzTest.stepTicks(2, 50);
  });
  const probeAfterTicks = await page.evaluate(() => window.__hookProbeTicks);
  expect(probeAfterTicks).toBe(1);

  await page.evaluate(() => {
    window.__gainzTest.fastForward(250, 50);
  });
  const nowAfterFastForward = await page.evaluate(() => window.__gainzTest.now());
  expect(nowAfterFastForward).toBe(350);

  await page.evaluate(() => {
    window.__gainzTest.setNow(500);
  });
  const nowAfterSetNow = await page.evaluate(() => window.__gainzTest.now());
  expect(nowAfterSetNow).toBe(500);

  const beforeSnapshot = await page.evaluate(() => {
    const snap = window.__gainzTest.snapshot();
    stats.money = 99999;
    window.__gainzTest.restore(snap);
    return stats.money;
  });
  expect(beforeSnapshot).not.toBe(99999);

  expect(errors).toEqual([]);
});
