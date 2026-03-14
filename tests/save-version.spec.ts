import { expect, test } from "@playwright/test";

test("new saves include schema version metadata", async ({ page }) => {
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

  const saveInfo = await page.evaluate(() => {
    save();
    const raw = localStorage.getItem(saveName);
    const parsed = JSON.parse(raw);
    return {
      hasVersion: typeof parsed.saveVersion === "number",
      saveVersion: parsed.saveVersion,
      hasSavedAt: typeof parsed.savedAt === "number",
      payloadIsArray: Array.isArray(parsed.payload),
      payloadLength: Array.isArray(parsed.payload) ? parsed.payload.length : 0,
    };
  });

  expect(saveInfo.hasVersion).toBe(true);
  expect(saveInfo.saveVersion).toBe(1);
  expect(saveInfo.hasSavedAt).toBe(true);
  expect(saveInfo.payloadIsArray).toBe(true);
  expect(saveInfo.payloadLength).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});
