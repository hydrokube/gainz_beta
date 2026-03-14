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

test("global upgrade id 29 doubles gym member growth without creating invalid gym.members.increase", async ({
  page,
}) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");
  await page.waitForFunction(() => typeof globalUpgradeClick === "function");

  const result = await page.evaluate(() => {
    if (Array.isArray(window.__gainzAssertLog)) {
      window.__gainzAssertLog.length = 0;
    }

    const upgrade = prestige.upgrades.find((entry) => entry.id === 29);
    if (!upgrade) {
      return { missingUpgrade: true };
    }

    upgrade.isPurchased = false;
    gym.members.growth = 0.015;
    delete gym.members.increase;

    const button = document.createElement("button");
    button.id = "globalUpgradeBtn29";
    document.body.appendChild(button);
    globalUpgradeClick(button, true);
    button.remove();

    assertValidState("global_upgrade_29_regression", { strict: true });

    const assertionPaths = Array.isArray(window.__gainzAssertLog)
      ? window.__gainzAssertLog
          .filter(
            (entry) =>
              typeof entry.path === "string" &&
              (entry.path === "gym.members.growth" || entry.path === "gym.members.increase"),
          )
          .map((entry) => entry.path)
      : [];

    return {
      missingUpgrade: false,
      isPurchased: upgrade.isPurchased,
      membersGrowth: gym.members.growth,
      hasMembersIncreaseField: Object.prototype.hasOwnProperty.call(gym.members, "increase"),
      assertionPaths,
    };
  });

  expect(result.missingUpgrade).toBe(false);
  expect(result.isPurchased).toBe(true);
  expect(result.membersGrowth).toBeCloseTo(0.03, 10);
  expect(result.hasMembersIncreaseField).toBe(false);
  expect(result.assertionPaths).toEqual([]);
});
