import { expect, test } from "@playwright/test";

async function bootChooser(page) {
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

  return errors;
}

test("gym chooser cards use distinct gym colors", async ({ page }) => {
  const errors = await bootChooser(page);

  await page.evaluate(() => {
    checks.isPrestige = true;
    $("#prestigeReady").removeClass("d-none");
    $("#newGymLifting").removeClass("d-none");
    $("#newGymYoga").removeClass("d-none");
    $("#newGymCardio").removeClass("d-none");
    $("#gymChooserModal").modal("show");
  });

  const classes = await page.evaluate(() => {
    return {
      bodyweight: $("#newGymBodyweight").attr("class"),
      lifting: $("#newGymLifting").attr("class"),
      yoga: $("#newGymYoga").attr("class"),
      cardio: $("#newGymCardio").attr("class"),
    };
  });

  expect(classes.bodyweight).toContain("gym-choice-card--bodyweight");
  expect(classes.lifting).toContain("gym-choice-card--lifting");
  expect(classes.yoga).toContain("gym-choice-card--yoga");
  expect(classes.cardio).toContain("gym-choice-card--cardio");
  expect(errors).toEqual([]);
});

test("active branch says more premium currency is available only when the minigame still has room", async ({ page }) => {
  const errors = await bootChooser(page);

  await page.evaluate(() => {
    checks.isPrestige = true;
    checks.gymType = 0;
    prestige.bw.total = 3;
    prestige.bw.confidence = 0.4;

    bodyweight.gang.rivals.forEach((rival, index) => {
      rival.isAbsorbed = index !== 0;
    });

    $("#prestigeReady").removeClass("d-none");
    updateGymChooserModal();
  });

  const hint = await page.evaluate(() => $("#newGymBodyweightHint").text());
  expect(hint).toContain("More Confidence available this run");
  expect(errors).toEqual([]);
});

test("active branch says premium currency is capped when the run payout is exhausted", async ({ page }) => {
  const errors = await bootChooser(page);

  await page.evaluate(() => {
    checks.isPrestige = true;
    checks.gymType = 0;
    prestige.bw.total = 3;
    prestige.bw.confidence = 1;

    bodyweight.gang.rivals.forEach((rival) => {
      rival.isAbsorbed = true;
    });

    $("#prestigeReady").removeClass("d-none");
    updateGymChooserModal();
  });

  const chooserInfo = await page.evaluate(() => {
    return {
      chooserCtaText: $("#openGymChooserButton").text(),
      bodyweightCurrency: $("#newGymBodyweightCurrency").text(),
      bodyweightHint: $("#newGymBodyweightHint").text(),
    };
  });

  expect(chooserInfo.chooserCtaText).toContain("Choose Gym");
  expect(chooserInfo.bodyweightCurrency).toContain("Confidence");
  expect(chooserInfo.bodyweightHint).toContain("Confidence is capped for this run");
  expect(errors).toEqual([]);
});
