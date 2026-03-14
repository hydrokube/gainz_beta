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

test("confidence and leadership shops render and spend their currencies", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    const hasConfidenceShop = Array.isArray(prestige.bw.confidenceUpgrades)
      && prestige.bw.confidenceUpgrades.length > 0
      && document.querySelector("#confidenceUpgradeBtn0") != null;
    const hasLeadershipShop = Array.isArray(prestige.lifting.leadershipUpgrades)
      && prestige.lifting.leadershipUpgrades.length > 0
      && document.querySelector("#leadershipUpgradeBtn0") != null;

    prestige.bw.confidence = 2;
    prestige.lifting.leadership = 2;
    checkPrestigeUpgradeDisable(prestige.bw.confidenceUpgrades, prestige.bw.confidence, "confidenceUpgrade");
    checkPrestigeUpgradeDisable(
      prestige.lifting.leadershipUpgrades,
      prestige.lifting.leadership,
      "leadershipUpgrade",
    );

    const confidenceButton = document.querySelector("#confidenceUpgradeBtn0");
    const leadershipButton = document.querySelector("#leadershipUpgradeBtn0");
    if (confidenceButton) {
      confidenceUpgradeClick(confidenceButton, false);
    }
    if (leadershipButton) {
      leadershipUpgradeClick(leadershipButton, false);
    }

    return {
      hasConfidenceShop,
      hasLeadershipShop,
      confidencePurchased:
        prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 0)?.isPurchased ?? false,
      leadershipPurchased:
        prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 0)?.isPurchased ?? false,
      confidenceRemaining: prestige.bw.confidence,
      leadershipRemaining: prestige.lifting.leadership,
    };
  });

  expect(result.hasConfidenceShop).toBe(true);
  expect(result.hasLeadershipShop).toBe(true);
  expect(result.confidencePurchased).toBe(true);
  expect(result.leadershipPurchased).toBe(true);
  expect(result.confidenceRemaining).toBeCloseTo(1, 8);
  expect(result.leadershipRemaining).toBeCloseTo(1, 8);
});

test("meta shops apply member growth and academy-camp bonuses", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 1;
    gym.members.current = 0;
    gym.members.capacity = 1e12;
    gym.employees.sales.current = 0;
    gym.employees.nutritionists.current = 0;
    prestige.bw.confidence = 10;
    prestige.bw.confidenceBoost = 0;
    prestige.bw.confidenceUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    prestige.lifting.leadership = 10;
    prestige.lifting.leadershipBoost = 0;
    prestige.lifting.leadershipUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });
    ensureLiftingAcademyState();

    const baselineMemberGain = gymMembersPerSecond();
    const baselineCampPoints = getAcademyCampTotalPoints();

    prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 1).isPurchased = true;
    prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 1).isPurchased = true;

    const boostedMemberGain = gymMembersPerSecond();
    const boostedCampPoints = getAcademyCampTotalPoints();

    return {
      baselineMemberGain,
      boostedMemberGain,
      baselineCampPoints,
      boostedCampPoints,
    };
  });

  expect(result.boostedMemberGain).toBeGreaterThan(result.baselineMemberGain * 1.25);
  expect(result.boostedCampPoints).toBeGreaterThanOrEqual(result.baselineCampPoints + 4);
});

test("confidence and leadership shop effects still apply in non-lifting/non-bodyweight gym contexts", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    checks.gymType = 2;

    gym.members.current = 0;
    gym.members.capacity = 1e12;
    gym.members.growth = 0.02;
    gym.employees.sales.current = 8;
    gym.employees.sales.boost = 0.03;
    gym.employees.nutritionists.current = 0;

    gym.trainMembers.trainAmount = 0.02;
    gym.employees.trainers.current = 8;
    gym.createClasses.classAmount = 0.01;
    gym.employees.coordinators.current = 8;

    gym.members.tiers.forEach((tier, idx) => {
      tier.current = idx === 0 ? 120 : 0;
      tier.multiplier = idx === 0 ? 1 : tier.multiplier;
    });
    gym.money.growth = 0.03;
    gym.money.flatIncrease = 0;
    gym.classes = 0;

    gym.advertising.campaigns = 200;
    gym.advertising.influenceGrowth = 0.02;
    gym.advertising.ads = 100;
    gym.advertising.adMulti = 0.02;

    prestige.bw.confidence = 10;
    prestige.bw.confidenceBoost = 0.02;
    prestige.bw.confidenceUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    prestige.lifting.leadership = 10;
    prestige.lifting.leadershipBoost = 0.02;
    prestige.lifting.leadershipUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    const baselineMemberGain = gymMembersPerSecond();
    const baselineTrainingGain = trainMembersFormula();
    const baselineMoneyGain = gymMoneyPerSecond();
    const baselineInfluenceGain = gymInfluencePerSecond();

    prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 1).isPurchased = true;
    prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 2).isPurchased = true;
    prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 2).isPurchased = true;
    prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 3).isPurchased = true;

    const boostedMemberGain = gymMembersPerSecond();
    const boostedTrainingGain = trainMembersFormula();
    const boostedMoneyGain = gymMoneyPerSecond();
    const boostedInfluenceGain = gymInfluencePerSecond();

    return {
      baselineMemberGain,
      boostedMemberGain,
      baselineTrainingGain,
      boostedTrainingGain,
      baselineMoneyGain,
      boostedMoneyGain,
      baselineInfluenceGain,
      boostedInfluenceGain,
    };
  });

  expect(result.boostedMemberGain).toBeGreaterThan(result.baselineMemberGain * 1.2);
  expect(result.boostedTrainingGain).toBeGreaterThan(result.baselineTrainingGain * 1.2);
  expect(result.boostedMoneyGain).toBeGreaterThan(result.baselineMoneyGain * 1.1);
  expect(result.boostedInfluenceGain).toBeGreaterThan(result.baselineInfluenceGain * 1.2);
});

test("meta minigame upgrades increase confidence/leadership point awards and repeatable sinks spend points", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    prestige.bw.confidence = 10;
    prestige.lifting.leadership = 10;
    stats.repeatingUpgrades = {};

    const baselineConfidenceGain = getConfidencePerGangAbsorb();
    const baselineLeadershipGain = getLeadershipPerWorldConference();

    prestige.bw.confidenceUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });
    prestige.lifting.leadershipUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;
    prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 4).isPurchased = true;
    prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;
    prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 4).isPurchased = true;

    const boostedConfidenceGain = getConfidencePerGangAbsorb();
    const boostedLeadershipGain = getLeadershipPerWorldConference();

    updateRepeatingUpgradeButtons("confidenceShopUpgrades", "confidence", prestige.bw.confidence);
    updateRepeatingUpgradeButtons("leadershipShopUpgrades", "leadership", prestige.lifting.leadership);

    const confidenceBeforeRepeat = prestige.bw.confidence;
    const leadershipBeforeRepeat = prestige.lifting.leadership;
    repeatingUpgradeClick("confidence", "confidence_sharp_focus");
    repeatingUpgradeClick("leadership", "leadership_command_stack");

    return {
      baselineConfidenceGain,
      boostedConfidenceGain,
      baselineLeadershipGain,
      boostedLeadershipGain,
      confidenceAfterRepeat: prestige.bw.confidence,
      leadershipAfterRepeat: prestige.lifting.leadership,
      confidenceRepeatSpent: confidenceBeforeRepeat - prestige.bw.confidence,
      leadershipRepeatSpent: leadershipBeforeRepeat - prestige.lifting.leadership,
      confidenceRepeatLevel:
        window.__gainzRepeatingUpgrades.getState("confidence_sharp_focus").level,
      leadershipRepeatLevel:
        window.__gainzRepeatingUpgrades.getState("leadership_command_stack").level,
      confidenceRepeatButtonClass:
        document.querySelector("#repeating_confidence_confidence_sharp_focus_btn")?.className ?? "",
      leadershipRepeatButtonClass:
        document.querySelector("#repeating_leadership_leadership_command_stack_btn")?.className ?? "",
      confidenceRepeatHeader:
        document.querySelector("#confidenceShopUpgradesRepeating")?.previousElementSibling?.textContent ?? "",
      leadershipRepeatHeader:
        document.querySelector("#leadershipShopUpgradesRepeating")?.previousElementSibling?.textContent ?? "",
    };
  });

  expect(result.boostedConfidenceGain).toBeGreaterThan(result.baselineConfidenceGain * 1.45);
  expect(result.boostedLeadershipGain).toBeGreaterThan(result.baselineLeadershipGain * 1.45);
  expect(result.confidenceRepeatSpent).toBeGreaterThan(0);
  expect(result.leadershipRepeatSpent).toBeGreaterThan(0);
  expect(result.confidenceRepeatLevel).toBe(1);
  expect(result.leadershipRepeatLevel).toBe(1);
  expect(result.confidenceRepeatButtonClass).toContain("btn-success");
  expect(result.leadershipRepeatButtonClass).toContain("btn-primary");
  expect(result.confidenceRepeatHeader).toContain("Confidence Points");
  expect(result.leadershipRepeatHeader).toContain("Leadership Points");
});

test("confidence and leadership stat tooltips reflect live per-point and total boost values", async ({ page }) => {
  await stubAnalytics(page);
  await page.goto("/?deterministic=1");

  const result = await page.evaluate(() => {
    prestige.bw.confidence = 12;
    prestige.lifting.leadership = 9;
    prestige.bw.confidenceBoost = 0.02;
    prestige.lifting.leadershipBoost = 0.02;
    stats.repeatingUpgrades = {};

    prestige.bw.confidenceUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });
    prestige.lifting.leadershipUpgrades.forEach((upgrade) => {
      upgrade.isPurchased = false;
    });

    prestige.bw.confidenceUpgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;
    prestige.lifting.leadershipUpgrades.find((upgrade) => upgrade.id === 0).isPurchased = true;
    window.__gainzRepeatingUpgrades.getState("confidence_sharp_focus").level = 3;
    window.__gainzRepeatingUpgrades.getState("leadership_command_stack").level = 2;

    updatePrestigeValues();

    return {
      confidenceTitle:
        document.querySelector("#confidenceTooltip")?.getAttribute("data-original-title")
        ?? document.querySelector("#confidenceTooltip")?.getAttribute("title")
        ?? "",
      leadershipTitle:
        document.querySelector("#leadershipTooltip")?.getAttribute("data-original-title")
        ?? document.querySelector("#leadershipTooltip")?.getAttribute("title")
        ?? "",
    };
  });

  expect(result.confidenceTitle).toContain("Current per point");
  expect(result.confidenceTitle).toContain("Current total boost");
  expect(result.confidenceTitle).toContain("%");
  expect(result.leadershipTitle).toContain("Current per point");
  expect(result.leadershipTitle).toContain("Current total boost");
  expect(result.leadershipTitle).toContain("%");
});
