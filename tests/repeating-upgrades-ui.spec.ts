import { expect, test } from "@playwright/test";

test("global repeatable upgrade UI renders and unlock gating works", async ({ page }) => {
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

  await page.evaluate(() => {
    prestige.current = 1e12;
    stats.repeatingUpgrades = {};
    prestige.bw.upgrades.find((upgrade) => upgrade.id === 20).isPurchased = false;
    prestige.lifting.upgrades.find((upgrade) => upgrade.id === 19).isPurchased = false;
    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
  });

  const button = page.locator("#repeating_global_global_franchise_tempo_btn");
  const heading = page.locator("#globalUpgradesRepeating").locator("xpath=preceding-sibling::h6[1]");
  await expect(button).toHaveCount(1);
  await expect(button).toHaveClass(/disabled/);
  await expect(heading).toContainText("Repeatable Upgrades (Global Points)");
  await expect(page.locator("#globalUpgradesRepeating")).toHaveCount(1);

  await page.evaluate(() => {
    prestige.bw.upgrades.find((upgrade) => upgrade.id === 20).isPurchased = true;
    prestige.lifting.upgrades.find((upgrade) => upgrade.id === 19).isPurchased = true;
    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
  });

  await expect(button).toHaveClass(/btn-warning/);
  await expect(button).not.toHaveClass(/disabled/);
  expect(errors).toEqual([]);
});

test("cardio and pace repeatables update immediately after purchase", async ({ page }) => {
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

  await page.evaluate(() => {
    prestige.cardio.current = 1e12;
    prestige.cardio.pace = 1e12;
    stats.repeatingUpgrades = {};

    prestige.cardio.upgrades.find((upgrade) => upgrade.id === 19).isPurchased = true;
    prestige.cardio.paceUpgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;

    updateRepeatingUpgradeButtons("globalCardioUpgrades", "cardio", prestige.cardio.current);
    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
  });

  const cardioButton = page.locator("#repeating_cardio_cardio_endurance_engine_btn");
  const paceButton = page.locator("#repeating_pace_pace_negative_split_btn");

  await expect(cardioButton).toHaveText(/Lv\. 0/);
  await expect(paceButton).toHaveText(/Lv\. 0/);

  await page.evaluate(() => {
    repeatingUpgradeClick("cardio", "cardio_endurance_engine");
    repeatingUpgradeClick("pace", "pace_negative_split");
  });

  await expect(cardioButton).toHaveText(/Lv\. 1/);
  await expect(paceButton).toHaveText(/Lv\. 1/);
  await expect(cardioButton).not.toHaveClass(/disabled/);
  await expect(paceButton).not.toHaveClass(/disabled/);
  expect(errors).toEqual([]);
});
