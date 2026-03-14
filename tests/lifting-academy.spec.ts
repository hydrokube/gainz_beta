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

test("legacy competition progress migrates one-time into academy credits", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.liftingAcademyMigrationV1 = false;
    lifting.comps.competitions.current = 1000;
    lifting.comps.conferences.current = 200;
    lifting.comps.regionalConferences.current = 50;
    lifting.comps.stateConferences.current = 10;
    lifting.comps.nationalConferences.current = 2;
    lifting.comps.worldConferences.current = 1;

    ensureLiftingAcademyState();
    lifting.comps.academy.credits = 0;
    lifting.comps.academy.totalCreditsEarned = 0;

    migrateLegacyCompetitionToAcademyCredits();
    const firstCredits = lifting.comps.academy.credits;

    migrateLegacyCompetitionToAcademyCredits();

    return {
      firstCredits,
      secondCredits: lifting.comps.academy.credits,
      competitions: lifting.comps.competitions.current,
      conferences: lifting.comps.conferences.current,
      migrated: checks.liftingAcademyMigrationV1,
    };
  });

  expect(result.firstCredits).toBeGreaterThan(0);
  expect(result.secondCredits).toBe(result.firstCredits);
  expect(result.competitions).toBe(0);
  expect(result.conferences).toBe(0);
  expect(result.migrated).toBe(true);
});

test("academy season completion grants credits and leadership", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    prestige.lifting.leadership = 0;

    const academy = ensureLiftingAcademyState();
    academy.phase = 3;
    academy.credits = 0;
    academy.totalCreditsEarned = 0;
    academy.seasonsCompleted = 0;
    academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
    academy.progress = academy.phaseTarget - 0.01;

    advanceAcademySeason(1);

    return {
      phase: academy.phase,
      seasonsCompleted: academy.seasonsCompleted,
      credits: academy.credits,
      leadership: prestige.lifting.leadership,
    };
  });

  expect(result.phase).toBe(0);
  expect(result.seasonsCompleted).toBe(1);
  expect(result.credits).toBeGreaterThan(0);
  expect(result.leadership).toBeGreaterThan(0);
});

test("academy season rewards stop once season cap is reached", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    prestige.lifting.leadership = 0;

    const academy = ensureLiftingAcademyState();
    academy.phase = 3;
    academy.seasonsCompleted = 9;
    academy.credits = 0;
    academy.totalCreditsEarned = 0;
    academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
    academy.progress = academy.phaseTarget - 0.01;

    advanceAcademySeason(1);
    const creditsAtCap = academy.credits;
    const leadershipAtCap = prestige.lifting.leadership;

    advanceAcademySeason(5000);

    return {
      seasonCap: getAcademySeasonCap(),
      seasonsCompleted: academy.seasonsCompleted,
      phase: academy.phase,
      creditsAtCap,
      creditsAfterExtra: academy.credits,
      leadershipAtCap,
      leadershipAfterExtra: prestige.lifting.leadership,
    };
  });

  expect(result.seasonCap).toBe(10);
  expect(result.seasonsCompleted).toBe(10);
  expect(result.phase).toBe(3);
  expect(result.creditsAtCap).toBeGreaterThan(0);
  expect(result.creditsAfterExtra).toBe(result.creditsAtCap);
  expect(result.leadershipAtCap).toBeGreaterThan(0);
  expect(result.leadershipAfterExtra).toBe(result.leadershipAtCap);
});

test("academy automation auto-configures camp and buys affordable upgrades", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    checks.conferenceBuyerOn = true;

    const academy = ensureLiftingAcademyState();
    academy.credits = 1000;
    academy.autoCampConfigured = false;
    academy.camp.totalPoints = 10;
    academy.camp.unspentPoints = 10;
    academy.camp.strength = 0;
    academy.camp.technique = 0;
    academy.camp.recovery = 0;
    academy.camp.promotion = 0;
    academy.upgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    runAcademyAutomation();

    return {
      autoCampConfigured: academy.autoCampConfigured,
      unspent: academy.camp.unspentPoints,
      purchased: academy.upgrades.filter((upgrade) => upgrade.isPurchased).length,
    };
  });

  expect(result.autoCampConfigured).toBe(true);
  expect(result.unspent).toBe(0);
  expect(result.purchased).toBeGreaterThan(0);
});

test("judge whisperer grants additional academy camp allocation points", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const academy = ensureLiftingAcademyState();
    academy.camp.strength = 3;
    academy.camp.technique = 3;
    academy.camp.recovery = 2;
    academy.camp.promotion = 2;
    academy.camp.unspentPoints = 0;

    const judgeWhisperer = prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 1);
    if (judgeWhisperer) {
      judgeWhisperer.isPurchased = true;
    }

    ensureLiftingAcademyState();

    return {
      totalPoints: academy.camp.totalPoints,
      unspentPoints: academy.camp.unspentPoints,
    };
  });

  expect(result.totalPoints).toBe(14);
  expect(result.unspentPoints).toBe(4);
});

test("sponsor liaison increases season progress but does not increase leadership rewards", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    stats.strength = 1e6;
    stats.endurance = 1e6;
    stats.agility = 1e6;
    stats.intelligence = 1e6;
    lifting.bench.weight = 1e6;
    lifting.rows.weight = 1e6;
    lifting.ohp.weight = 1e6;
    lifting.squats.weight = 1e6;
    lifting.dls.weight = 1e6;
    lifting.curls.weight = 1e6;

    const academy = ensureLiftingAcademyState();
    academy.upgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    const baselineProgress = getAcademySeasonProgressPerSecond();
    const baselineLeadershipReward = getAcademyMeetLeadershipReward();

    const sponsor = academy.upgrades.find((upgrade) => upgrade.id === 3);
    if (sponsor) {
      sponsor.isPurchased = true;
    }

    return {
      baselineProgress,
      sponsorProgress: getAcademySeasonProgressPerSecond(),
      baselineLeadershipReward,
      sponsorLeadershipReward: getAcademyMeetLeadershipReward(),
    };
  });

  expect(result.sponsorProgress).toBeGreaterThan(result.baselineProgress);
  expect(result.sponsorLeadershipReward).toBeCloseTo(result.baselineLeadershipReward, 10);
});

test("academy season pacing is eased above raw Layer 1 pacing", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    prestige.bw.total = 0;
    prestige.lifting.total = 0;
    prestige.cardio.total = 0;
    prestige.yoga.total = 0;

    return {
      rawPacing: getLayer1PacingMultiplier(),
      academyPacing: getAcademySeasonPacingMultiplier(),
    };
  });

  expect(result.academyPacing).toBeGreaterThanOrEqual(result.rawPacing);
  expect(result.academyPacing).toBeGreaterThanOrEqual(0.72);
});

test("academy experience multiplier scales with lifting completion depth", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    prestige.lifting.total = 1;
    const freshMultiplier = getAcademyExperienceProgressMultiplier();

    prestige.lifting.total = 8;
    const midMultiplier = getAcademyExperienceProgressMultiplier();

    prestige.lifting.total = 14;
    const maxMultiplier = getAcademyExperienceProgressMultiplier();

    return { freshMultiplier, midMultiplier, maxMultiplier };
  });

  expect(result.freshMultiplier).toBeLessThan(result.midMultiplier);
  expect(result.midMultiplier).toBeLessThan(result.maxMultiplier);
  expect(result.freshMultiplier).toBeCloseTo(0.16, 8);
  expect(result.maxMultiplier).toBeGreaterThan(1);
});

test("camp expansion repeatable spends academy credits and grants +1 camp point per level", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    const academy = ensureLiftingAcademyState();
    academy.repeatables.campPointBoostLevel = 0;
    academy.credits = 5000;
    academy.camp.strength = 2;
    academy.camp.technique = 2;
    academy.camp.recovery = 2;
    academy.camp.promotion = 2;
    academy.camp.unspentPoints = 2;

    ensureLiftingAcademyState();
    const beforeCredits = academy.credits;
    const beforeTotalPoints = academy.camp.totalPoints;
    const beforeUnspent = academy.camp.unspentPoints;

    academyCampPointBoostClick();
    ensureLiftingAcademyState();

    return {
      level: academy.repeatables.campPointBoostLevel,
      beforeCredits,
      afterCredits: academy.credits,
      beforeTotalPoints,
      afterTotalPoints: academy.camp.totalPoints,
      beforeUnspent,
      afterUnspent: academy.camp.unspentPoints,
      nextCost: getAcademyCampPointBoostCost(),
    };
  });

  expect(result.level).toBe(1);
  expect(result.afterCredits).toBeLessThan(result.beforeCredits);
  expect(result.afterTotalPoints).toBe(result.beforeTotalPoints + 1);
  expect(result.afterUnspent).toBe(result.beforeUnspent + 1);
  expect(result.nextCost).toBeGreaterThan(70);
});

test("academy auto-camp allocation rotates evenly when new points are gained incrementally", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    const academy = ensureLiftingAcademyState();
    prestige.lifting.leadershipUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });
    academy.repeatables.campPointBoostLevel = 0;
    academy.camp.totalPoints = 10;
    academy.camp.strength = 3;
    academy.camp.technique = 3;
    academy.camp.recovery = 2;
    academy.camp.promotion = 2;
    academy.camp.autoNextTrackIndex = 0;
    academy.camp.unspentPoints = 0;
    academy.autoCampConfigured = false;

    const snapshots = [];
    for (let i = 0; i < 4; i += 1) {
      academy.repeatables.campPointBoostLevel += 1;
      academy.autoCampConfigured = false;
      autoConfigureAcademyCamp();
      snapshots.push({
        strength: academy.camp.strength,
        technique: academy.camp.technique,
        recovery: academy.camp.recovery,
        promotion: academy.camp.promotion,
        nextIndex: academy.camp.autoNextTrackIndex,
      });
    }

    return snapshots;
  });

  expect(result[0]).toMatchObject({ strength: 3, technique: 3, recovery: 3, promotion: 2 });
  expect(result[1]).toMatchObject({ strength: 3, technique: 3, recovery: 3, promotion: 3 });
  expect(result[2]).toMatchObject({ strength: 4, technique: 3, recovery: 3, promotion: 3 });
  expect(result[3]).toMatchObject({ strength: 4, technique: 4, recovery: 3, promotion: 3, nextIndex: 2 });
});

test("academy passively generates credits over time before season completion", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    const unlock = prestige.lifting.upgrades.find((upgrade) => upgrade.id === 0);
    if (unlock) {
      unlock.isPurchased = true;
    }
    const academy = ensureLiftingAcademyState();
    academy.credits = 0;
    academy.totalCreditsEarned = 0;
    academy.phase = 0;
    academy.progress = 0;
    academy.seasonsCompleted = 0;
    academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);

    const beforeCredits = academy.credits;
    const beforeSeasons = academy.seasonsCompleted;
    advanceAcademySeason(30);

    return {
      beforeCredits,
      afterCredits: academy.credits,
      beforeSeasons,
      afterSeasons: academy.seasonsCompleted,
      passiveRate: getAcademyPassiveCreditsPerSecond(),
    };
  });

  expect(result.passiveRate).toBeGreaterThan(0);
  expect(result.afterCredits).toBeGreaterThan(result.beforeCredits);
  expect(result.afterSeasons).toBeGreaterThanOrEqual(result.beforeSeasons);
});

test("academy upgrade button is clickable when affordable and spends credits", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    const unlock = prestige.lifting.upgrades.find((upgrade) => upgrade.id === 0);
    if (unlock) {
      unlock.isPurchased = true;
    }

    const academy = ensureLiftingAcademyState();
    academy.credits = 200;
    academy.upgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });
    updateAcademyUpgradeButtons();

    const beforeCredits = academy.credits;
    const button = document.querySelector("#academyUpgradeBtn0") as HTMLButtonElement | null;
    if (!button) {
      return { missing: true };
    }
    const disabledBefore = button.disabled;
    button.click();

    return {
      missing: false,
      disabledBefore,
      purchased: academy.upgrades.find((upgrade) => upgrade.id === 0)?.isPurchased ?? false,
      beforeCredits,
      afterCredits: academy.credits,
      disabledAfter: button.disabled,
      buttonLabelAfter: button.textContent ?? "",
    };
  });

  expect(result.missing).toBe(false);
  expect(result.disabledBefore).toBe(false);
  expect(result.purchased).toBe(true);
  expect(result.afterCredits).toBeLessThan(result.beforeCredits);
  expect(result.disabledAfter).toBe(true);
  expect(result.buttonLabelAfter).toContain("Purchased");
});
