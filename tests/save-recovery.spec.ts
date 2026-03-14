import { expect, test } from "@playwright/test";

test("corrupt saves are backed up and cleared safely", async ({ page }) => {
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

  const recoveryInfo = await page.evaluate(() => {
    localStorage.setItem(saveName, "{bad json");
    load(null, false, false);

    const activeSave = localStorage.getItem(saveName);
    const backupRaw = localStorage.getItem(saveName + "_corrupt_backup");
    const backup = backupRaw ? JSON.parse(backupRaw) : null;
    const warningVisible = $("#saveRecoveryAlert").length > 0;

    return {
      activeSaveCleared: activeSave === null,
      backupExists: backup != null,
      backupReason: backup ? backup.reason : null,
      warningVisible: warningVisible,
    };
  });

  expect(recoveryInfo.activeSaveCleared).toBe(true);
  expect(recoveryInfo.backupExists).toBe(true);
  expect(recoveryInfo.backupReason).toBe("json_parse_error");
  expect(recoveryInfo.warningVisible).toBe(true);

  expect(errors).toEqual([]);
});
