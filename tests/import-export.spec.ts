import { expect, test } from "@playwright/test";

test("exported save code can be imported back into the game", async ({ page }) => {
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
  const exportInfo = await page.evaluate(() => {
    stats.money = 1234.56;
    job.followers = 789;
    checks.story2 = true;
    save(true);
    exportSave();

    return {
      code: String($("#exportImportArea").val() || ""),
      originalMoney: stats.money,
      originalFollowers: job.followers,
    };
  });

  expect(exportInfo.code.length).toBeGreaterThan(0);

  await page.evaluate(() => {
    stats.money = 0;
    job.followers = 0;
    save(true);
  });

  const importInfo = await page.evaluate(({ code }) => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    $("#exportImportArea").val(`\n  ${code}\n`);
    importSave();
    window.confirm = originalConfirm;

    return {
      money: stats.money,
      followers: job.followers,
      loadAlertVisible: $("#loadAlert").length > 0,
    };
  }, { code: exportInfo.code });

  expect(importInfo.money).toBe(exportInfo.originalMoney);
  expect(importInfo.followers).toBe(exportInfo.originalFollowers);
  expect(importInfo.loadAlertVisible).toBe(true);
  expect(errors).toEqual([]);
});

test("malformed imported save code shows a visible critical notification and does not replace state", async ({ page }) => {
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

  const info = await page.evaluate(() => {
    stats.money = 321;
    job.followers = 654;
    save(true);

    const originalConfirm = window.confirm;
    window.confirm = () => true;
    $("#exportImportArea").val("not-a-real-save");
    importSave();
    window.confirm = originalConfirm;

    return {
      money: stats.money,
      followers: job.followers,
      alertVisible: $("#importSaveError").length > 0,
      alertText: $("#importSaveError").text(),
      alertClass: $("#importSaveError").attr("class") || "",
    };
  });

  expect(info.money).toBe(321);
  expect(info.followers).toBe(654);
  expect(info.alertVisible).toBe(true);
  expect(info.alertText).toContain("Couldn't import save.");
  expect(info.alertClass).toContain("gainz-alert-card--critical");
  expect(errors).toEqual([]);
});
