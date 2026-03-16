import { expect, test } from "@playwright/test";

test("offline progress summary alert is shown after applying offline gains", async ({ page }) => {
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

  const summaryInfo = await page.evaluate(() => {
    checks.gymType = -1;
    stats.money = 0;
    job.views = 1000;
    research.points = 0;
    save(true);

    const saveObject = JSON.parse(localStorage.getItem(saveName));
    saveObject.payload[0].saveTime = Date.now() - 15 * 1000;
    localStorage.setItem(saveName, JSON.stringify(saveObject));

    load(null, false, false);

    const alertText = $("#offlineProgressAlert").text();
    return {
      alertVisible: $("#offlineProgressAlert").length > 0,
      alertText: alertText,
      alertClass: $("#offlineProgressAlert").attr("class") || "",
      hasOfflineLogEntry: (stats.notificationLog?.entries || []).some((entry) =>
        entry && entry.category === "offline" && String(entry.title || "").includes("Offline progress applied")
      ),
    };
  });

  expect(summaryInfo.alertVisible).toBe(true);
  expect(summaryInfo.alertText).toContain("Offline progress applied");
  expect(summaryInfo.alertText).toContain("Money +");
  expect(summaryInfo.alertClass).toContain("gainz-alert-card--info");
  expect(summaryInfo.hasOfflineLogEntry).toBe(true);

  expect(errors).toEqual([]);
});

test("offline summary alert does not stack and auto-dismisses after timeout", async ({ page }) => {
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

  const beforeDismiss = await page.evaluate(() => {
    showOfflineSummary(30, 10, 0, 0);
    showOfflineSummary(60, 20, 0, 0);
    return {
      alertCount: document.querySelectorAll("#offlineProgressAlert").length,
    };
  });

  expect(beforeDismiss.alertCount).toBe(1);

  const afterDismiss = await page.evaluate(() => {
    window.__gainzTest.fastForward(10_000, 50);
    return {
      alertCount: document.querySelectorAll("#offlineProgressAlert").length,
    };
  });

  expect(afterDismiss.alertCount).toBe(0);
  expect(errors).toEqual([]);
});
