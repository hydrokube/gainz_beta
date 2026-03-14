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

test("page loads with no console or page errors", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`console: ${msg.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  await stubAnalytics(page);

  await page.goto("/");
  await expect(page).toHaveTitle(/Idle Gainz/i);
  await expect(page.getByRole("tab", { name: "Workout" })).toBeVisible();

  expect(errors).toEqual([]);
});

test("debug panel stays hidden by default and appears behind debug flag", async ({ page }) => {
  await stubAnalytics(page);

  await page.goto("/");
  await page.getByRole("tab", { name: "Options" }).click();
  await expect(page.locator("#debugPanel")).toBeHidden();

  await page.goto("/?debug=1");
  await page.getByRole("tab", { name: "Options" }).click();
  await expect(page.locator("#debugPanel")).toBeVisible();
  await expect(page.locator("#debugStatus")).toHaveText("Enabled");
});
