import { expect, test } from "@playwright/test";

test("seeded RNG reproduces deterministic sequences", async ({ page }) => {
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

  await page.goto("/?deterministic=1&seed=1337");

  const deterministicEnabled = await page.evaluate(() => {
    return window.__gainzRandom.isDeterministic();
  });
  expect(deterministicEnabled).toBe(true);

  const firstSequence = await page.evaluate(() => {
    return [math.random(0, 1), math.random(0, 1), math.random(0, 1), math.random(0, 1)];
  });

  await page.evaluate(() => {
    window.__gainzRandom.setSeed(1337);
  });

  const secondSequence = await page.evaluate(() => {
    return [math.random(0, 1), math.random(0, 1), math.random(0, 1), math.random(0, 1)];
  });

  expect(secondSequence).toEqual(firstSequence);

  await page.evaluate(() => {
    window.__gainzRandom.setDeterministicMode(false);
  });
  const deterministicDisabled = await page.evaluate(() => {
    return window.__gainzRandom.isDeterministic();
  });
  expect(deterministicDisabled).toBe(false);

  expect(errors).toEqual([]);
});
