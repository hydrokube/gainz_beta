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

test("offline progress awards confidence from gang auto-absorb automation", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 0;
    checks.absorbGangsOn = true;
    prestige.bw.confidence = 0;

    bodyweight.gang.strength = 1_000_000_000;
    bodyweight.gang.members = 1_000_000_000;
    for (let i = 0; i < bodyweight.gang.rivals.length; i += 1) {
      bodyweight.gang.rivals[i].isAbsorbed = true;
      bodyweight.gang.rivals[i].isDefeated = true;
    }

    bodyweight.gang.rivals[0].isAbsorbed = false;
    bodyweight.gang.rivals[0].isDefeated = false;
    bodyweight.gang.rivals[0].strength = 1;
    bodyweight.gang.rivals[0].members = 100;

    applyOfflineProgress(OFFLINE_GANG_AUTOABSORB_INTERVAL_SECONDS);

    return {
      confidence: prestige.bw.confidence,
      rivalAbsorbed: bodyweight.gang.rivals[0].isAbsorbed,
    };
  });

  expect(result.rivalAbsorbed).toBe(true);
  expect(result.confidence).toBeCloseTo(0.1, 8);
});

test("offline progress awards leadership from academy season completion and runs academy automation", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    checks.conferenceBuyerOn = true;
    prestige.lifting.leadership = 0;

    const academy = ensureLiftingAcademyState();
    academy.phase = 3;
    academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
    academy.progress = academy.phaseTarget - 0.01;
    academy.camp.totalPoints = 10;
    academy.camp.unspentPoints = 10;
    academy.camp.strength = 0;
    academy.camp.technique = 0;
    academy.camp.recovery = 0;
    academy.camp.promotion = 0;
    academy.autoCampConfigured = false;

    applyOfflineProgress(1);

    return {
      leadership: prestige.lifting.leadership,
      autoConfigured: academy.autoCampConfigured,
      unspentPoints: academy.camp.unspentPoints,
    };
  });

  expect(result.leadership).toBeGreaterThan(0);
  expect(result.autoConfigured).toBe(true);
  expect(result.unspentPoints).toBe(0);
});
