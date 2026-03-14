import { expect, test } from "@playwright/test";

test("legacy array saves migrate to versioned save schema", async ({ page }) => {
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

  const migrationInfo = await page.evaluate(() => {
    save();
    const currentVersioned = JSON.parse(localStorage.getItem(saveName));
    const legacyArray = currentVersioned.payload;

    localStorage.setItem(saveName, JSON.stringify(legacyArray));
    load(null, false, false);

    const migrated = JSON.parse(localStorage.getItem(saveName));
    return {
      isArray: Array.isArray(migrated),
      saveVersion: migrated.saveVersion,
      hasSavedAt: typeof migrated.savedAt === "number",
      payloadIsArray: Array.isArray(migrated.payload),
      payloadLength: Array.isArray(migrated.payload) ? migrated.payload.length : 0,
    };
  });

  expect(migrationInfo.isArray).toBe(false);
  expect(migrationInfo.saveVersion).toBe(1);
  expect(migrationInfo.hasSavedAt).toBe(true);
  expect(migrationInfo.payloadIsArray).toBe(true);
  expect(migrationInfo.payloadLength).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});
