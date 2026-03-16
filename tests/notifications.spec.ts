import { expect, test } from "@playwright/test";

test("timed alert cards render with severity styling and dismiss cleanly", async ({ page }) => {
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
    showNotificationCard({
      id: "notifInfo",
      severity: "info",
      title: "Info Title",
      message: "Info Body",
      timeoutMs: 0,
    });
    showNotificationCard({
      id: "notifStory",
      severity: "story",
      title: "Story Title",
      message: "Story Body",
      timeoutMs: 0,
    });
    showNotificationCard({
      id: "notifCritical",
      severity: "critical",
      title: "Critical Title",
      message: "Critical Body",
      timeoutMs: 0,
    });

    return {
      stackCount: document.querySelectorAll("#notifInfo, #notifStory, #notifCritical").length,
      infoClass: document.querySelector("#notifInfo")?.className ?? "",
      storyClass: document.querySelector("#notifStory")?.className ?? "",
      criticalClass: document.querySelector("#notifCritical")?.className ?? "",
    };
  });

  expect(beforeDismiss.stackCount).toBe(3);
  expect(beforeDismiss.infoClass).toContain("gainz-alert-card--info");
  expect(beforeDismiss.storyClass).toContain("gainz-alert-card--story");
  expect(beforeDismiss.criticalClass).toContain("gainz-alert-card--critical");

  await page.evaluate(() => {
    closeNotificationCard("notifStory");
  });

  await page.evaluate(() => {
    window.__gainzTest.fastForward(1_000, 50);
  });

  const afterDismiss = await page.evaluate(() => {
    return {
      stackCount: document.querySelectorAll("#notifInfo, #notifStory, #notifCritical").length,
      storyPresent: document.querySelector("#notifStory") !== null,
    };
  });

  expect(afterDismiss.stackCount).toBe(2);
  expect(afterDismiss.storyPresent).toBe(false);
  expect(errors).toEqual([]);
});

test("notification timeout configuration uses severity defaults", async ({ page }) => {
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

  const initial = await page.evaluate(() => {
    const timeoutInfo = getNotificationTimeout("info");
    const timeoutCritical = getNotificationTimeout("critical");

    showNotificationCard({
      id: "timeoutInfo",
      severity: "info",
      title: "Info",
      message: "Info timeout",
      timeoutMs: 0,
    });
    showNotificationCard({
      id: "timeoutCritical",
      severity: "critical",
      title: "Critical",
      message: "Critical timeout",
      timeoutMs: 0,
    });

    return {
      timeoutInfo,
      timeoutCritical,
      infoPresent: document.querySelector("#timeoutInfo") !== null,
      criticalPresent: document.querySelector("#timeoutCritical") !== null,
    };
  });

  expect(initial.timeoutInfo).toBe(5000);
  expect(initial.timeoutCritical).toBe(12000);
  expect(initial.infoPresent).toBe(true);
  expect(initial.criticalPresent).toBe(true);
  expect(errors).toEqual([]);
});

test("event log stores notification history and clears unread state when opened", async ({ page }) => {
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

  const beforeOpen = await page.evaluate(() => {
    showNotificationCard({
      id: "logStory",
      severity: "story",
      title: "Story Logged",
      message: "Story entry body",
      timeoutMs: 0,
    });
    showNotificationCard({
      id: "logInfo",
      severity: "info",
      category: "offline",
      title: "Offline Logged",
      message: "Offline entry body",
      timeoutMs: 0,
    });
    save(true);
    load(null, false, false);

    return {
      entryCount: stats.notificationLog.entries.length,
      unreadCount: getNotificationUnreadCount(),
      buttonText: $("#notificationInboxButton").text(),
    };
  });

  expect(beforeOpen.entryCount).toBeGreaterThanOrEqual(2);
  expect(beforeOpen.unreadCount).toBeGreaterThanOrEqual(1);
  expect(beforeOpen.buttonText).toContain("Event Log");

  await page.click("#notificationInboxButton");

  const afterOpen = await page.evaluate(() => {
    return {
      unreadCount: getNotificationUnreadCount(),
      unreadBadgeHidden: $("#notificationInboxUnread").hasClass("d-none"),
      listText: $("#notificationInboxList").text(),
    };
  });

  expect(afterOpen.unreadCount).toBe(0);
  expect(afterOpen.unreadBadgeHidden).toBe(true);
  expect(afterOpen.listText).toContain("Story Logged");
  expect(afterOpen.listText).toContain("Offline Logged");
  expect(errors).toEqual([]);
});
