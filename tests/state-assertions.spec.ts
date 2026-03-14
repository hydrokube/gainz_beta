import { expect, test } from "@playwright/test";

test("invalid states are logged and clamped safely", async ({ page }) => {
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

  const assertionInfo = await page.evaluate(() => {
    window.__gainzAssertLog.length = 0;
    stats.money = -50;
    stats.energy.current = Infinity;
    research.points = NaN;
    lifting.comps.conferences.current = Infinity;
    bodyweight.gang.rivals[0].members = -10;
    assertValidState("test_assertions", { strict: true });

    return {
      money: stats.money,
      energyCurrent: stats.energy.current,
      researchPoints: research.points,
      conferenceCurrent: lifting.comps.conferences.current,
      rivalMembers: bodyweight.gang.rivals[0].members,
      assertionCount: window.__gainzAssertLog.length,
      firstIssuePath: window.__gainzAssertLog[0] ? window.__gainzAssertLog[0].path : null,
    };
  });

  expect(assertionInfo.money).toBe(0);
  expect(assertionInfo.energyCurrent).toBe(0);
  expect(assertionInfo.researchPoints).toBe(0);
  expect(assertionInfo.conferenceCurrent).toBe(0);
  expect(assertionInfo.rivalMembers).toBe(0);
  expect(assertionInfo.assertionCount).toBeGreaterThan(0);
  expect(assertionInfo.firstIssuePath).not.toBeNull();

  expect(errors).toEqual([]);
});
