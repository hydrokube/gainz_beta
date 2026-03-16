var energyTimerId;
var pushupTimerId;
var rowTimerId;
var dipTimerId;
var pullupTimerId;
var bwRdlTimerId;
var bwSquatTimerId;
var makeVideoTimerId;
var influencerId;
var oneSecondTimerId;
var browseRedditTimerId;
var codeBotsTimerId;
var coffeeTimerId;
var payDayTimerId;
var saveName;
var saveTimerId;
var trainerTimerId;
var createClassesTimerId;
var runCampaignTimerId;
var designAdTimerId;
var fightGangTimerId;
var refreshId;
var energyUiRefreshId;
var offlineAlertTimerId;

var liftingBenchTimerId;
var liftingRowTimerId;
var liftingOhpTimerId;
var liftingSquatsTimerId;
var liftingDlsTimerId;
var liftingCurlsTimerId;
var yogaSunTimerId;
var yogaVinyasaTimerId;
var yogaBalanceTimerId;
var yogaMobilityTimerId;
var yogaCoreTimerId;
var yogaBreathTimerId;
var yogaContinuousTimerId;
var cardioTreadmillTimerId;
var cardioBikeTimerId;
var cardioRowTimerId;
var cardioSprintsTimerId;
var cardioHillsTimerId;
var cardioRecoveryTimerId;
var cardioContinuousTimerId;
var CURRENT_SAVE_VERSION = 1;
var OFFLINE_MAX_SECONDS = 60 * 60 * 8;
var hiddenAtTimestamp = null;
var visibilityCatchupBound = false;
var debugPanelEnabled = false;
var debugSpeedMultiplier = 1;
var DEBUG_SPEED_STORAGE_KEY = "gainz_debug_speed";
var debugEffectiveSpeed = 1;
var debugEffectiveSample = {
    realMs: null,
    runSeconds: null,
};
var exerciseCompletionPulseById = {};
var exerciseDisplayCycleStartById = {};
var energyDisplayCurrent = null;
var PRESTIGE_INTERNAL_DECIMALS = 4;
var PRESTIGE_DISPLAY_DECIMALS = 2;
var PRESTIGE_COMPARISON_EPSILON = 1e-9;
var YOGA_CONTINUOUS_TICK_SECONDS = 0.05;
var YOGA_CONTINUOUS_REAL_INTERVAL_MS = 50;
var YOGA_TIER_ENERGY_MULTIPLIER = 1.45;
var YOGA_PRECISION_FORM_ENERGY_MULTIPLIER = 1.5;
var FLOW_MAX_ENERGY_TO_SPEED_RATIO = 2;
var FLOW_RECOVERY_TO_SPEED_RATIO = 1.2;
var FLOW_EFFECTIVE_SOFTCAP_START = 20;
var FLOW_EFFECTIVE_SOFTCAP_SCALE = 7;
var FLOW_EFFECTIVE_SOFTCAP_STAGE2_START = 45;
var FLOW_EFFECTIVE_SOFTCAP_STAGE2_SCALE = 5;
var FLOW_EFFECTIVE_SOFTCAP_STAGE2_CURVE = 25;
var CONFIDENCE_EFFECTIVE_SOFTCAP_START = 24;
var CONFIDENCE_EFFECTIVE_SOFTCAP_SCALE = 16;
var CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_START = 40;
var CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_SCALE = 12;
var CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_CURVE = 40;
var LEADERSHIP_EFFECTIVE_SOFTCAP_START = 24;
var LEADERSHIP_EFFECTIVE_SOFTCAP_SCALE = 16;
var LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_START = 40;
var LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_SCALE = 12;
var LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_CURVE = 40;
var YOGA_ROUTE_DEFINITIONS = [
    {
        id: "grounded",
        name: "Grounded Sequence",
        risk: "steady",
        progressMultiplier: 0.98,
        rewardMultiplier: 0.94,
        drift: 0.008,
        pressure: 0.009,
    },
    {
        id: "rhythm",
        name: "Rhythm Ladder",
        risk: "balanced",
        progressMultiplier: 1.16,
        rewardMultiplier: 1.12,
        drift: 0.013,
        pressure: 0.013,
    },
    {
        id: "apex",
        name: "Apex Hold Chain",
        risk: "high",
        progressMultiplier: 1.3,
        rewardMultiplier: 1.26,
        drift: 0.019,
        pressure: 0.018,
    },
];
var YOGA_REPEATABLE_RECOVERY_STEP = 0.0025;
var CARDIO_CONTINUOUS_TICK_SECONDS = 0.05;
var CARDIO_CONTINUOUS_REAL_INTERVAL_MS = 50;
var PASSIVE_CONFIDENCE_RATE_PER_SECOND = 0.00003;
var PASSIVE_LEADERSHIP_RATE_PER_SECOND = 0.00003;
var PASSIVE_FLOW_RATE_PER_SECOND = 0.00003;
var PASSIVE_PACE_RATE_PER_SECOND = 0.00003;
var PACE_MAX_ENERGY_TO_SPEED_RATIO = 0.75;
var PACE_RECOVERY_TO_SPEED_RATIO = 1;
var PACE_EFFECTIVE_SOFTCAP_START = 18;
var PACE_EFFECTIVE_SOFTCAP_SCALE = 8;
var PACE_EFFECTIVE_SOFTCAP_STAGE2_START = 40;
var PACE_EFFECTIVE_SOFTCAP_STAGE2_SCALE = 6;
var PACE_EFFECTIVE_SOFTCAP_STAGE2_CURVE = 30;
var CARDIO_RACE_DEFINITIONS = [
    {
        id: "neighborhood_heat",
        name: "Neighborhood Heat",
        label: "Heat",
        desc: "Short local race with a forgiving field.",
        progressMultiplier: 0.96,
        rewardMultiplier: 0.92,
        distanceMultiplier: 0.92,
        rivalMultipliers: [0.86, 0.89],
    },
    {
        id: "city_circuit",
        name: "City Circuit",
        label: "Circuit",
        desc: "Balanced pacing race with a steady pack.",
        progressMultiplier: 1.05,
        rewardMultiplier: 1.04,
        distanceMultiplier: 1,
        rivalMultipliers: [0.93, 0.97],
    },
    {
        id: "final_stretch",
        name: "Final Stretch",
        label: "Finale",
        desc: "Faster field, higher Pace reward, less room to fade.",
        progressMultiplier: 1.12,
        rewardMultiplier: 1.14,
        distanceMultiplier: 1.08,
        rivalMultipliers: [1.01, 1.05],
    },
];
var ACADEMY_CAMP_POINT_REPEATABLE_BASE_COST = 70;
var ACADEMY_CAMP_POINT_REPEATABLE_GROWTH = 1.5;
var ACADEMY_CAMP_POINT_REPEATABLE_CURVE = 0.05;
var OFFLINE_GANG_AUTOABSORB_INTERVAL_SECONDS = 90;
var repeatingUpgradeDefinitions = {
    global: [
        {
            id: "global_franchise_tempo",
            name: "Franchise Tempo",
            desc: "Adds +0.40% global action speed per level.",
            requires: {
                text: "Requires Street Legend and Meet Legend.",
                allOf: [
                    { type: "prestige_upgrade", scope: "bodyweight", upgradeId: 20 },
                    { type: "prestige_upgrade", scope: "lifting", upgradeId: 19 },
                ],
            },
            cost: {
                baseCost: 72,
                growth: 1.62,
                curve: 0.14,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.004,
            },
        },
        {
            id: "global_recovery_grid",
            name: "Recovery Grid",
            desc: "Adds +0.30% energy recovery per level across all gyms.",
            requires: {
                text: "Requires Street Legend, Meet Legend, and Global Upgrade 31.",
                allOf: [
                    { type: "prestige_upgrade", scope: "bodyweight", upgradeId: 20 },
                    { type: "prestige_upgrade", scope: "lifting", upgradeId: 19 },
                    { type: "prestige_upgrade", scope: "global", upgradeId: 31 },
                ],
            },
            cost: {
                baseCost: 90,
                growth: 1.68,
                curve: 0.15,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.003,
            },
        },
        {
            id: "global_market_engine",
            name: "Market Engine",
            desc: "Adds +0.35% gym money and influence growth per level.",
            requires: {
                text: "Requires Global Upgrade 32.",
                allOf: [
                    { type: "prestige_upgrade", scope: "global", upgradeId: 32 },
                ],
            },
            cost: {
                baseCost: 108,
                growth: 1.72,
                curve: 0.16,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.0035,
            },
        },
    ],
    bodyweight: [
        {
            id: "bodyweight_street_tempo",
            name: "Street Tempo",
            desc: "Street Legend gains +0.60% action speed per level.",
            requires: {
                text: "Requires Street Legend.",
                allOf: [
                    { type: "prestige_upgrade", scope: "bodyweight", upgradeId: 20 },
                ],
            },
            cost: {
                baseCost: 28,
                growth: 1.52,
                curve: 0.12,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.006,
            },
        },
    ],
    lifting: [
        {
            id: "lifting_rep_reclamation",
            name: "Rep Reclamation",
            desc: "Meet Legend overflow retention gets +2.00% stronger per level.",
            requires: {
                text: "Requires Meet Legend.",
                allOf: [
                    { type: "prestige_upgrade", scope: "lifting", upgradeId: 19 },
                ],
            },
            cost: {
                baseCost: 28,
                growth: 1.52,
                curve: 0.12,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.02,
            },
        },
    ],
    yoga: [
        {
            id: "yoga_studio_capacity",
            name: "Studio Capacity",
            desc: "Adds +0.90% max energy and +0.25% energy recovery per level across all gyms.",
            requires: {
                text: "Requires Recovery Protocol.",
                allOf: [
                    { type: "prestige_upgrade", scope: "yoga", upgradeId: 19 },
                ],
            },
            cost: {
                baseCost: 24,
                growth: 1.7,
                curve: 0.12,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.009,
            },
        },
    ],
    cardio: [
        {
            id: "cardio_endurance_engine",
            name: "Endurance Engine",
            desc: "Endurance Engine gains +0.50% action speed and +0.80% max energy per level.",
            requires: {
                text: "Requires Endurance Engine.",
                allOf: [
                    { type: "prestige_upgrade", scope: "cardio", upgradeId: 19 },
                ],
            },
            cost: {
                baseCost: 24,
                growth: 1.7,
                curve: 0.12,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.005,
            },
        },
    ],
    flow: [
        {
            id: "flow_resonance_stack",
            name: "Resonance Stack",
            desc: "Flow effects become +0.70% stronger per level.",
            requires: {
                text: "Requires Breath Economics.",
                allOf: [
                    { type: "prestige_upgrade", scope: "flow_shop", upgradeId: 0 },
                ],
            },
            cost: {
                baseCost: 3,
                growth: 1.7,
                curve: 0.08,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.007,
            },
        },
    ],
    pace: [
        {
            id: "pace_negative_split",
            name: "Negative Split",
            desc: "Pace effects become +0.60% stronger per level.",
            requires: {
                text: "Requires Split Tracking.",
                allOf: [
                    { type: "prestige_upgrade", scope: "pace_shop", upgradeId: 0 },
                ],
            },
            cost: {
                baseCost: 3,
                growth: 1.7,
                curve: 0.08,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.006,
            },
        },
    ],
    confidence: [
        {
            id: "confidence_sharp_focus",
            name: "Sharp Focus",
            desc: "Boosts confidence point effectiveness.",
            requires: {
                text: "Requires Swagger Science.",
                allOf: [
                    { type: "prestige_upgrade", scope: "confidence_shop", upgradeId: 0 },
                ],
            },
            cost: {
                baseCost: 2,
                growth: 1.6,
                curve: 0.05,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.0075,
            },
        },
    ],
    leadership: [
        {
            id: "leadership_command_stack",
            name: "Command Stack",
            desc: "Boosts leadership point effectiveness.",
            requires: {
                text: "Requires Executive Presence.",
                allOf: [
                    { type: "prestige_upgrade", scope: "leadership_shop", upgradeId: 0 },
                ],
            },
            cost: {
                baseCost: 2,
                growth: 1.6,
                curve: 0.05,
            },
            effect: {
                type: "additive",
                base: 1,
                step: 0.0075,
            },
        },
    ],
};
var layer1GymAccelerationBudget = {
    pacingTargets: {
        layer0FirstPrestigeHours: [7, 9],
        layer1FirstPrestigeHours: [7, 9],
        layer1RunTrendHours: [
            [7, 9],
            [5, 7],
            [4, 6],
        ],
    },
    gyms: {
        bodyweight: {
            gymType: 0,
            key: "bodyweight",
            label: "Bodyweight",
            identity: "Fast cadence, but with controlled run-over-run speedup.",
            runScale: 3.4,
            baseMultiplier: 0.037,
            multiplierScale: 0.062,
            globalRunScale: 2.25,
            globalMultiplierScale: 0.024,
            run1Weight: 0.4,
            run2Weight: 0.65,
            cap: 1.05,
            idleScale: 0.08,
        },
        lifting: {
            gymType: 1,
            key: "lifting",
            label: "Lifting",
            identity: "Slower ramp with stable long-run conversion.",
            runScale: 2.9,
            baseMultiplier: 0.047,
            multiplierScale: 0.072,
            globalRunScale: 1.9,
            globalMultiplierScale: 0.02,
            run1Weight: 0.4,
            run2Weight: 0.64,
            cap: 0.84,
            idleScale: 0.1,
        },
        cardio: {
            gymType: 3,
            key: "cardio",
            label: "Cardio",
            identity: "Faster active cadence with smaller idle contribution.",
            runScale: 3,
            baseMultiplier: 0.04,
            multiplierScale: 0.07,
            globalRunScale: 2.5,
            globalMultiplierScale: 0.018,
            cap: 0.86,
            idleScale: 0.06,
        },
        yoga: {
            gymType: 2,
            key: "yoga",
            label: "Yoga",
            identity: "Steadier cadence and stronger idle conversion.",
            runScale: 3.2,
            baseMultiplier: 0.0195,
            multiplierScale: 0.16,
            globalRunScale: 2,
            globalMultiplierScale: 0.016,
            run1Weight: 0.42,
            run2Weight: 0.68,
            cap: 0.82,
            idleScale: 0.12,
        },
    },
};
var math = window.gainzMath || window.math;

if (!math || typeof math.evaluate !== "function") {
    math = {
        evaluate: function (value) {
            let parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
        },
        format: function (value) {
            return String(value);
        },
        random: function (min, max) {
            if (min == null && max == null) {
                return Math.random();
            }

            let normalizedMin = Number(min);
            let normalizedMax = Number(max);

            if (max == null) {
                normalizedMax = normalizedMin;
                normalizedMin = 0;
            }

            return normalizedMin + Math.random() * (normalizedMax - normalizedMin);
        },
        add: function (a, b) {
            return Number(a) + Number(b);
        },
        sub: function (a, b) {
            return Number(a) - Number(b);
        },
        mul: function (a, b) {
            return Number(a) * Number(b);
        },
        div: function (a, b) {
            let denominator = Number(b);
            if (denominator === 0) {
                return 0;
            }
            return Number(a) / denominator;
        },
        log10: function (value) {
            let normalized = Number(value);
            if (!Number.isFinite(normalized) || normalized <= 0) {
                return 0;
            }
            return Math.log10(normalized);
        },
        min: function (a, b) {
            return Math.min(a, b);
        },
        max: function (a, b) {
            return Math.max(a, b);
        },
        floor: function (value) {
            return Math.floor(value);
        },
        abs: function (value) {
            return Math.abs(value);
        },
        pow: function (value, power) {
            return Math.pow(value, power);
        },
    };
}

//#region notes

/* 

TODO:

    consider a spending area for the special 4 stats?

    spend unused prestige points on generators
    issue with clicking fitness

    1. 25% speed increase for all bar fill
    2. double money
    3. double research/influence

Future

    yoga
        Run through routines and different types of yoga
        Flexibility that increases a stat or resource of your choice, unlock ability to add another eventually. 
        What to do for competition-style stuff?
    cardio  
        exercises are of varying speeds, run through different types of training before upgrading. 
        Setup races and compete in them to increase
        overall tick speed for that run
        speed stat that grows and adds to all tick speeds

Challenges could be per prestige 2

*/

//#endregion

//#region saving and loading

switch (window.location.pathname) {
    case "/gainz/":
        saveName = "gainz";
        break;
    case "/gainz_beta/":
        saveName = "gainz_beta";
        break;
    default:
        saveName = "gainz_local";
}

var hasBootstrapped = false;

function bootstrapGame() {
    if (hasBootstrapped) {
        return;
    }
    hasBootstrapped = true;
    load(null, false, true);
    setupRefresh();
    setupEnergyUiRefresh();
    setupVisibilityCatchup();
    setupDebugPanel();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapGame, { once: true });
}
else {
    bootstrapGame();
}

function exportSave() {
    let saveData = localStorage.getItem(saveName);
    let base64Save = btoa(saveData);
    $("#exportImportArea").val(base64Save);
}

function importSave() {
    try {

        if (confirm("Are you sure you want to import this save?")) {
            let base64Save = $("#exportImportArea").val();
            let decryptedSave = atob(base64Save);
            if (decryptedSave.includes("gameVersion")) {
                localStorage.setItem(saveName, decryptedSave);

                load($("#loadBtn"), false, false);
            }
            else {
                $("#resetWrapper").html("<div id='resetAlert' class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Not a valid save.</strong><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>")
            }
        }
    }
    catch (ex) {
        console.log(ex);
        $("#resetWrapper").html("<div id='resetAlert' class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Couldn't import your save.</strong><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>")
    }
}

function save(silent) {
    if (silent == null) {
        silent = false;
    }

    let date = new Date();
    stats.saveTime = date.getTime();

    let bodyweightPrep = JSON.parse(JSON.stringify(bodyweight));
    let upgradesPrep = JSON.parse(JSON.stringify(upgrades));
    let jobPrep = JSON.parse(JSON.stringify(job));
    let researchPrep = JSON.parse(JSON.stringify(research));
    let gymPrep = JSON.parse(JSON.stringify(gym));
    let prestigePrep = JSON.parse(JSON.stringify(prestige));
    let cardioPrep = JSON.parse(JSON.stringify(cardio));

    trimUpgradeSaveData(bodyweightPrep.upgrades);
    trimUpgradeSaveData(upgradesPrep);
    trimUpgradeSaveData(jobPrep.upgrades);
    trimUpgradeSaveData(researchPrep.upgrades);
    trimUpgradeSaveData(gymPrep.upgrades);
    trimUpgradeSaveData(gymPrep.gymUpgrades);
    trimUpgradeSaveData(gymPrep.adUpgrades);
    trimUpgradeSaveData(gymPrep.bw.upgrades);
    trimUpgradeSaveData(gymPrep.bw.gymUpgrades);
    trimUpgradeSaveData(gymPrep.bw.adUpgrades);
    trimUpgradeSaveData(gymPrep.lifting.upgrades);
    trimUpgradeSaveData(gymPrep.lifting.gymUpgrades);
    trimUpgradeSaveData(gymPrep.lifting.adUpgrades);
    trimUpgradeSaveData(gymPrep.yoga.upgrades);
    trimUpgradeSaveData(gymPrep.yoga.gymUpgrades);
    trimUpgradeSaveData(gymPrep.yoga.adUpgrades);
    trimUpgradeSaveData(gymPrep.cardio.upgrades);
    trimUpgradeSaveData(gymPrep.cardio.gymUpgrades);
    trimUpgradeSaveData(gymPrep.cardio.adUpgrades);
    trimUpgradeSaveData(prestigePrep.upgrades);
    trimUpgradeSaveData(prestigePrep.bw.upgrades);
    trimUpgradeSaveData(prestigePrep.lifting.upgrades);
    trimUpgradeSaveData(prestigePrep.bw.confidenceUpgrades);
    trimUpgradeSaveData(prestigePrep.lifting.leadershipUpgrades);
    trimUpgradeSaveData(prestigePrep.yoga.upgrades);
    trimUpgradeSaveData(prestigePrep.yoga.flowUpgrades);
    trimUpgradeSaveData(prestigePrep.cardio.upgrades);
    trimUpgradeSaveData(prestigePrep.cardio.paceUpgrades);

    let savePayload = [stats, bodyweightPrep, upgradesPrep, jobPrep, researchPrep, checks, gymPrep, prestigePrep, lifting, yoga, cardioPrep, null, null, null, null, null, null, null, null, null];
    let saveData = {
        saveVersion: CURRENT_SAVE_VERSION,
        savedAt: stats.saveTime,
        payload: savePayload,
    };
    localStorage.setItem(saveName, JSON.stringify(saveData));

    if (!silent) {
        $("#saveWrapper").html("<div id='saveAlert' class='alert alert-success alert-dismissible fade show' role='alert'><strong>Saved</strong><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>")
        $("#saveAlert").alert();
        setTimeout(function () {
            $("#saveAlert").alert('close');
        }, 5000);
    }
}

function migrateSaveData(rawSaveData) {
    if (rawSaveData == null) {
        return {
            saveObject: null,
            payload: null,
            migrated: false,
        };
    }

    let working = rawSaveData;
    let migrated = false;

    if (Array.isArray(working)) {
        working = {
            saveVersion: 0,
            payload: working,
        };
        migrated = true;
    }

    if (working.payload == null || !Array.isArray(working.payload)) {
        return {
            saveObject: null,
            payload: null,
            migrated: false,
        };
    }

    if (typeof working.saveVersion !== "number") {
        working.saveVersion = 0;
        migrated = true;
    }

    while (working.saveVersion < CURRENT_SAVE_VERSION) {
        switch (working.saveVersion) {
            case 0:
                working = {
                    saveVersion: 1,
                    savedAt: (working.payload[0] != null && working.payload[0].saveTime != null) ? working.payload[0].saveTime : Date.now(),
                    payload: working.payload,
                };
                migrated = true;
                break;
            default:
                return {
                    saveObject: null,
                    payload: null,
                    migrated: false,
                };
        }
    }

    return {
        saveObject: working,
        payload: working.payload,
        migrated: migrated,
    };
}

function backupCorruptSave(rawSave, reason) {
    try {
        let backupData = {
            backedUpAt: Date.now(),
            reason: reason,
            rawSave: rawSave,
        };
        localStorage.setItem(saveName + "_corrupt_backup", JSON.stringify(backupData));
    }
    catch (ex) {
        console.log(ex);
    }
}

function loadReset() {
    clearInterval(energyTimerId);
    clearInterval(pushupTimerId);
    clearInterval(rowTimerId);
    clearInterval(dipTimerId);
    clearInterval(pullupTimerId);
    clearInterval(bwRdlTimerId);
    clearInterval(bwSquatTimerId);
    clearInterval(makeVideoTimerId);
    clearInterval(influencerId);
    clearInterval(oneSecondTimerId);
    clearInterval(browseRedditTimerId);
    clearInterval(codeBotsTimerId);
    clearInterval(coffeeTimerId);
    clearInterval(payDayTimerId);
    clearInterval(trainerTimerId);
    clearInterval(createClassesTimerId);
    clearInterval(runCampaignTimerId);
    clearInterval(designAdTimerId);
    clearInterval(fightGangTimerId);
    clearInterval(liftingBenchTimerId);
    clearInterval(liftingRowTimerId);
    clearInterval(liftingOhpTimerId);
    clearInterval(liftingSquatsTimerId);
    clearInterval(liftingDlsTimerId);
    clearInterval(liftingCurlsTimerId);
    clearInterval(yogaSunTimerId);
    clearInterval(yogaVinyasaTimerId);
    clearInterval(yogaBalanceTimerId);
    clearInterval(yogaMobilityTimerId);
    clearInterval(yogaCoreTimerId);
    clearInterval(yogaBreathTimerId);
    clearInterval(yogaContinuousTimerId);
    clearInterval(cardioTreadmillTimerId);
    clearInterval(cardioBikeTimerId);
    clearInterval(cardioRowTimerId);
    clearInterval(cardioSprintsTimerId);
    clearInterval(cardioHillsTimerId);
    clearInterval(cardioRecoveryTimerId);
    clearInterval(cardioContinuousTimerId);
    yogaContinuousTimerId = null;
    cardioContinuousTimerId = null;
    exerciseCompletionPulseById = {};
    exerciseDisplayCycleStartById = {};
    energyDisplayCurrent = null;
    $("#work-tab").addClass("d-none");
    $("#followerWrap").addClass("d-none");
    $("#research-tab").addClass("d-none");
    $("#researchText").addClass("d-none");
    $("#bwRows").addClass("d-none");
    $("#bwDips").addClass("d-none");
    $("#bwPullups").addClass("d-none");
    $("#bwRdl").addClass("d-none");
    $("#bwSquats").addClass("d-none");
    $("#influencerWrap").addClass("d-none");
    $("#botWrap").addClass("d-none");
    $("#jobUpgrades").html("");
    $("#upgrades").html("");
    $("#resUpgrades").html("");
    $("#coffee").addClass("d-none");
    $("#payDay").addClass("d-none");
    $("#story").html("");
    $("#upgrades").html("");
    $("#jobUpgrades").html("");
    $("#resUpgrades").html("");
    $("#globalUpgrades").html("");
    $("#globalBwUpgrades").html("");
    $("#globalLiftingUpgrades").html("");
    $("#globalYogaUpgrades").html("");
    $("#globalCardioUpgrades").html("");
    $("#gymUpgrades").html("");
    $("#gymBwUpgrades").html("");
    $("#adUpgrades").html("");
    $("#adBwUpgrades").html("");
    $("#research-tab").html("Research");
    $("#influenceText").addClass("d-none")

    $("#gym-tab").addClass("d-none");
    $("#openGym-tab").addClass("d-none");
    $("#phase1Research").removeClass("d-none");
    $("#phase2Research").addClass("d-none");
    $("#gang-tab").addClass("d-none");
    $("#comp-tab").addClass("d-none");
    $("#gangRivalWrap").removeClass("d-none");
    $("#gangCompleteWrap").addClass("d-none");
    $("#confidenceWrap").addClass("d-none");
    $("#leadershipWrap").addClass("d-none");
    $("#flowWrap").addClass("d-none");
    $("#paceWrap").addClass("d-none");
    $("#autoBuyers").html("");
    $(".gymTierFocus").addClass("d-none");
    $("#bwWorkoutWrap").addClass("d-none");
    $("#liftingWorkoutWrap").addClass("d-none");
    $("#yogaWorkoutWrap").addClass("d-none");
    $("#cardioWorkoutWrap").addClass("d-none");
    $("#globalLiftingUpgradesModalTrigger").addClass("d-none");
    $("#globalYogaUpgradesModalTrigger").addClass("d-none");
    $("#globalCardioUpgradesModalTrigger").addClass("d-none");
    $("#newGymLifting").addClass("d-none");
    $("#newGymYoga").addClass("d-none");
    $("#newGymCardio").addClass("d-none");
    $("#createCompBtn").removeClass("d-none");
    $("#liftingCompWrap").addClass("d-none");
    $("#academyUpgradeCol").addClass("d-none");
    $("#yogaFlowWrap").addClass("d-none");
    $("#flowUpgradeCol").addClass("d-none");
    $("#cardioRaceWrap").addClass("d-none");
}

function load(button, prestigeCheck, firstLoad) {
    let recoveredCorruptSave = false;
    let offlineSeconds = 0;
    if (!prestigeCheck) {
        let rawSaveString = localStorage.getItem(saveName);
        let rawSaveData = null;
        if (rawSaveString != null) {
            try {
                rawSaveData = JSON.parse(rawSaveString);
            }
            catch (ex) {
                console.log(ex);
                backupCorruptSave(rawSaveString, "json_parse_error");
                localStorage.removeItem(saveName);
                recoveredCorruptSave = true;
                rawSaveData = null;
            }
        }
        let migration = migrateSaveData(rawSaveData);
        if (rawSaveData != null && migration.saveObject == null) {
            backupCorruptSave(rawSaveData, "invalid_save_schema");
            localStorage.removeItem(saveName);
            recoveredCorruptSave = true;
        }
        let saveData = migration.payload;
        if (migration.migrated && migration.saveObject != null) {
            localStorage.setItem(saveName, JSON.stringify(migration.saveObject));
        }

        let skipOfflineCatchup = window.__gainzSkipOfflineOnLoad === true;
        if (skipOfflineCatchup) {
            window.__gainzSkipOfflineOnLoad = false;
        }

        if (!skipOfflineCatchup && saveData != null && saveData[0] != null && saveData[0].saveTime != null) {
            let elapsedSeconds = Math.floor((Date.now() - saveData[0].saveTime) / 1000);
            if (Number.isFinite(elapsedSeconds) && elapsedSeconds > 0) {
                offlineSeconds = Math.min(elapsedSeconds, OFFLINE_MAX_SECONDS);
            }
        }

        // fix issue with upgrades not registering by updating all upgrades before loading
        bodyweight.upgrades = JSON.parse(JSON.stringify(baseBodyweight.upgrades));
        upgrades = JSON.parse(JSON.stringify(baseUpgrades));
        job.upgrades = JSON.parse(JSON.stringify(baseJob.upgrades));
        research.upgrades = JSON.parse(JSON.stringify(baseResearch.upgrades));

        gym.upgrades = JSON.parse(JSON.stringify(baseGym.upgrades));
        gym.gymUpgrades = JSON.parse(JSON.stringify(baseGym.gymUpgrades));
        gym.adUpgrades = JSON.parse(JSON.stringify(baseGym.adUpgrades));

        gym.bw.upgrades = JSON.parse(JSON.stringify(baseGym.bw.upgrades));
        gym.bw.gymUpgrades = JSON.parse(JSON.stringify(baseGym.bw.gymUpgrades));
        gym.bw.adUpgrades = JSON.parse(JSON.stringify(baseGym.bw.adUpgrades));

        gym.lifting.upgrades = JSON.parse(JSON.stringify(baseGym.lifting.upgrades));
        gym.lifting.gymUpgrades = JSON.parse(JSON.stringify(baseGym.lifting.gymUpgrades));
        gym.lifting.adUpgrades = JSON.parse(JSON.stringify(baseGym.lifting.adUpgrades));

        gym.yoga.upgrades = JSON.parse(JSON.stringify(baseGym.yoga.upgrades));
        gym.yoga.gymUpgrades = JSON.parse(JSON.stringify(baseGym.yoga.gymUpgrades));
        gym.yoga.adUpgrades = JSON.parse(JSON.stringify(baseGym.yoga.adUpgrades));

        gym.cardio.upgrades = JSON.parse(JSON.stringify(baseGym.cardio.upgrades));
        gym.cardio.gymUpgrades = JSON.parse(JSON.stringify(baseGym.cardio.gymUpgrades));
        gym.cardio.adUpgrades = JSON.parse(JSON.stringify(baseGym.cardio.adUpgrades));

        prestige.upgrades = JSON.parse(JSON.stringify(basePrestige.upgrades));
        prestige.bw.upgrades = JSON.parse(JSON.stringify(basePrestige.bw.upgrades));
        prestige.lifting.upgrades = JSON.parse(JSON.stringify(basePrestige.lifting.upgrades));
        prestige.bw.confidenceUpgrades = JSON.parse(JSON.stringify(basePrestige.bw.confidenceUpgrades));
        prestige.lifting.leadershipUpgrades = JSON.parse(JSON.stringify(basePrestige.lifting.leadershipUpgrades));
        prestige.yoga.upgrades = JSON.parse(JSON.stringify(basePrestige.yoga.upgrades));
        prestige.yoga.flowUpgrades = JSON.parse(JSON.stringify(basePrestige.yoga.flowUpgrades));
        prestige.cardio.upgrades = JSON.parse(JSON.stringify(basePrestige.cardio.upgrades));
        prestige.cardio.paceUpgrades = JSON.parse(JSON.stringify(basePrestige.cardio.paceUpgrades));

        if (button != null) {
            loadReset();
        }

        try {
            if (saveData != null) {
                if (saveData[5].gymType == -1) {
                    saveData[1].upgrades = updateUpgradesAfterLoad(bodyweight.upgrades, saveData[1].upgrades);
                    saveData[2] = updateUpgradesAfterLoad(upgrades, saveData[2]);
                    saveData[3].upgrades = updateUpgradesAfterLoad(job.upgrades, saveData[3].upgrades);
                    saveData[4].upgrades = updateUpgradesAfterLoad(research.upgrades, saveData[4].upgrades);
                }
                else {
                    if (saveData[6] != null) {
                        saveData[6].upgrades = updateUpgradesAfterLoad(gym.upgrades, saveData[6].upgrades);
                        saveData[6].gymUpgrades = updateUpgradesAfterLoad(gym.gymUpgrades, saveData[6].gymUpgrades);
                        saveData[6].adUpgrades = updateUpgradesAfterLoad(gym.adUpgrades, saveData[6].adUpgrades);

                        saveData[6].bw.upgrades = updateUpgradesAfterLoad(gym.bw.upgrades, saveData[6].bw.upgrades);
                        saveData[6].bw.gymUpgrades = updateUpgradesAfterLoad(gym.bw.gymUpgrades, saveData[6].bw.gymUpgrades);
                        saveData[6].bw.adUpgrades = updateUpgradesAfterLoad(gym.bw.adUpgrades, saveData[6].bw.adUpgrades);

                        saveData[6].lifting.upgrades = updateUpgradesAfterLoad(gym.lifting.upgrades, saveData[6].lifting.upgrades);
                        saveData[6].lifting.gymUpgrades = updateUpgradesAfterLoad(gym.lifting.gymUpgrades, saveData[6].lifting.gymUpgrades);
                        saveData[6].lifting.adUpgrades = updateUpgradesAfterLoad(gym.lifting.adUpgrades, saveData[6].lifting.adUpgrades);

                        saveData[6].yoga.upgrades = updateUpgradesAfterLoad(gym.yoga.upgrades, saveData[6].yoga.upgrades);
                        saveData[6].yoga.gymUpgrades = updateUpgradesAfterLoad(gym.yoga.gymUpgrades, saveData[6].yoga.gymUpgrades);
                        saveData[6].yoga.adUpgrades = updateUpgradesAfterLoad(gym.yoga.adUpgrades, saveData[6].yoga.adUpgrades);

                        saveData[6].cardio.upgrades = updateUpgradesAfterLoad(gym.cardio.upgrades, saveData[6].cardio.upgrades);
                        saveData[6].cardio.gymUpgrades = updateUpgradesAfterLoad(gym.cardio.gymUpgrades, saveData[6].cardio.gymUpgrades);
                        saveData[6].cardio.adUpgrades = updateUpgradesAfterLoad(gym.cardio.adUpgrades, saveData[6].cardio.adUpgrades);
                    }
                }

                if (saveData[7] != null) {
                    saveData[7].upgrades = updateUpgradesAfterLoad(prestige.upgrades, saveData[7].upgrades);
                    saveData[7].bw.upgrades = updateUpgradesAfterLoad(prestige.bw.upgrades, saveData[7].bw.upgrades);
                    saveData[7].lifting.upgrades = updateUpgradesAfterLoad(prestige.lifting.upgrades, saveData[7].lifting.upgrades);
                    saveData[7].bw.confidenceUpgrades = updateUpgradesAfterLoad(
                        prestige.bw.confidenceUpgrades,
                        Array.isArray(saveData[7].bw.confidenceUpgrades) ? saveData[7].bw.confidenceUpgrades : []
                    );
                    saveData[7].lifting.leadershipUpgrades = updateUpgradesAfterLoad(
                        prestige.lifting.leadershipUpgrades,
                        Array.isArray(saveData[7].lifting.leadershipUpgrades) ? saveData[7].lifting.leadershipUpgrades : []
                    );
                    saveData[7].yoga.upgrades = updateUpgradesAfterLoad(prestige.yoga.upgrades, saveData[7].yoga.upgrades);
                    saveData[7].yoga.flowUpgrades = updateUpgradesAfterLoad(
                        prestige.yoga.flowUpgrades,
                        Array.isArray(saveData[7].yoga.flowUpgrades) ? saveData[7].yoga.flowUpgrades : []
                    );
                    saveData[7].cardio.upgrades = updateUpgradesAfterLoad(prestige.cardio.upgrades, saveData[7].cardio.upgrades);
                    saveData[7].cardio.paceUpgrades = updateUpgradesAfterLoad(
                        prestige.cardio.paceUpgrades,
                        Array.isArray(saveData[7].cardio.paceUpgrades) ? saveData[7].cardio.paceUpgrades : []
                    );
                }

                $.extend(true, stats, saveData[0]);
                $.extend(true, bodyweight, saveData[1]);
                $.extend(true, upgrades, saveData[2]);
                $.extend(true, job, saveData[3]);
                $.extend(true, research, saveData[4]);
                $.extend(true, checks, saveData[5]);
                if (saveData[6] != null) {
                    $.extend(true, gym, saveData[6]);
                }
                else {
                    gym = JSON.parse(JSON.stringify(baseGym));
                }
                if (saveData[7] != null) {
                    $.extend(true, prestige, saveData[7]);
                }
                else {
                    prestige = JSON.parse(JSON.stringify(basePrestige));
                }
                if (saveData[8] != null) {
                    $.extend(true, lifting, saveData[8]);
                }
                else {
                    lifting = JSON.parse(JSON.stringify(baseLifting));
                }
                if (saveData[9] != null) {
                    $.extend(true, yoga, saveData[9]);
                }
                else {
                    yoga = JSON.parse(JSON.stringify(baseYoga));
                }
                if (saveData[10] != null) {
                    $.extend(true, cardio, saveData[10]);
                }
                else {
                    cardio = JSON.parse(JSON.stringify(baseCardio));
                }
            }
        }
        catch (ex) {
            console.log(ex);
            firstLoad = false;
            $("#story").prepend("<div id='error' class='alert alert-danger alert-dismissible fade show fixed-bottom' role='alert'><strong>Something went wrong loading your save!</strong> This is likely a bug - come on the discord chat and ask me for help. Resetting game progress will likely fix the issue if you don't mind losing progress.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
            // input error message warning user that saving is off
        }

        if (stats.repeatingUpgrades == null || typeof stats.repeatingUpgrades !== "object") {
            stats.repeatingUpgrades = {};
        }
        ensureRunTracker();
        ensureLayer2PrestigeState();
        ensureLiftingAcademyState();
        migrateLegacyCompetitionToAcademyCredits();
        ensureCardioIntervalState();

        if (recoveredCorruptSave) {
            $("#story").prepend("<div id='saveRecoveryAlert' class='alert alert-warning alert-dismissible fade show fixed-bottom' role='alert'><strong>Recovered from a corrupted save.</strong> Your previous save was backed up and reset to keep the game stable.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
        }
    }

    $('[data-toggle="tooltip"]').tooltip();

    setupEnergyTimer();

    if (checks.gymType == -1 || checks.gymType == 0) {
        startStop(bodyweight.pushups, pushupTimerId, true);
        $("#bwWorkoutWrap").removeClass("d-none");
    }

    if (checks.gymType == 0) {
        $("#bwRows").removeClass("d-none");
        $("#bwDips").removeClass("d-none");
        $("#bwPullups").removeClass("d-none");
        $("#bwRdl").removeClass("d-none");
        $("#bwSquats").removeClass("d-none");
        startStop(bodyweight.rows, rowTimerId, true);
        startStop(bodyweight.dips, dipTimerId, true);
        startStop(bodyweight.pullups, pullupTimerId, true);
        startStop(bodyweight.squats, bwSquatTimerId, true);
        startStop(bodyweight.rdl, bwRdlTimerId, true);
    }
    else if (checks.gymType == 1) {
        $("#liftingWorkoutWrap").removeClass("d-none");
        startStop(lifting.bench, liftingBenchTimerId, true);
        startStop(lifting.rows, liftingRowTimerId, true);
        startStop(lifting.ohp, liftingOhpTimerId, true);
        startStop(lifting.squats, liftingSquatsTimerId, true);
        startStop(lifting.dls, liftingDlsTimerId, true);
        startStop(lifting.curls, liftingCurlsTimerId, true);
    }
    else if (checks.gymType == 2) {
        $("#yogaWorkoutWrap").removeClass("d-none");
        startStop(yoga.sun, yogaSunTimerId, true);
        startStop(yoga.vinyasa, yogaVinyasaTimerId, true);
        startStop(yoga.balance, yogaBalanceTimerId, true);
        startStop(yoga.mobility, yogaMobilityTimerId, true);
        startStop(yoga.core, yogaCoreTimerId, true);
        startStop(yoga.breath, yogaBreathTimerId, true);
    }
    else if (checks.gymType == 3) {
        $("#cardioWorkoutWrap").removeClass("d-none");
        startStop(cardio.treadmill, cardioTreadmillTimerId, true);
        startStop(cardio.bike, cardioBikeTimerId, true);
        startStop(cardio.row, cardioRowTimerId, true);
        startStop(cardio.sprints, cardioSprintsTimerId, true);
        startStop(cardio.hills, cardioHillsTimerId, true);
        startStop(cardio.recovery, cardioRecoveryTimerId, true);
    }

    setupOneSecondTimer();

    if (offlineSeconds > 0) {
        let moneyBeforeOffline = stats.money;
        let researchBeforeOffline = research.points;
        let influenceBeforeOffline = gym.advertising.influence;
        let confidenceBeforeOffline = prestige.bw.confidence;
        let leadershipBeforeOffline = prestige.lifting.leadership;
        let flowBeforeOffline = prestige.yoga.flow;
        let paceBeforeOffline = prestige.cardio.pace;

        applyOfflineProgress(offlineSeconds);
        let moneyGain = stats.money - moneyBeforeOffline;
        let researchGain = research.points - researchBeforeOffline;
        let influenceGain = gym.advertising.influence - influenceBeforeOffline;
        let confidenceGain = prestige.bw.confidence - confidenceBeforeOffline;
        let leadershipGain = prestige.lifting.leadership - leadershipBeforeOffline;
        let flowGain = prestige.yoga.flow - flowBeforeOffline;
        let paceGain = prestige.cardio.pace - paceBeforeOffline;
        showOfflineSummary(offlineSeconds, moneyGain, researchGain, influenceGain, confidenceGain, leadershipGain, flowGain, paceGain);
        save(true);
    }


    if (checks.gymType == -1) {
        if (!checks.story1) {
            $("#story").prepend("<div id='story1' class='alert alert-primary alert-dismissible fade show fixed-bottom' role='alert'><strong>Wow I'm out of shape!</strong> I'll do some pushups to get stronger.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
        }
        if (checks.story2) {
            $("#work-tab").removeClass("d-none");
            $("#followerWrap").removeClass("d-none");
            setupMakeVideoTimer();
        }

        if (checks.story4) {
            setupBrowseRedditTimer();
            $("#research-tab").removeClass("d-none");
            $("#researchText").removeClass("d-none");
        }
        if (bodyweight.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 1 })[0].isPurchased) {
            $("#bwRows").removeClass("d-none");
            startStop(bodyweight.rows, rowTimerId, true);
        }
        if (research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 4 })[0].isPurchased) {
            $("#bwDips").removeClass("d-none");
            startStop(bodyweight.dips, dipTimerId, true);
        }
        if (bodyweight.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 4 })[0].isPurchased) {
            $("#bwPullups").removeClass("d-none");
            startStop(bodyweight.pullups, pullupTimerId, true);
        }
        if (research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 11 })[0].isPurchased) {
            $("#bwRdl").removeClass("d-none");
            $("#bwSquats").removeClass("d-none");
            startStop(bodyweight.squats, bwSquatTimerId, true);
            startStop(bodyweight.rdl, bwRdlTimerId, true);
        }
        if (research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 10 })[0].isPurchased) {
            $("#influencerWrap").removeClass("d-none");
            setupInfluencerTimer();
        }
        if (research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 13 })[0].isPurchased) {
            $("#botWrap").removeClass("d-none");
            setupCodeBotsTimer();
        }
        if (checks.story5) {
            $("#openGym-tab").removeClass("d-none");
            if (checks.gymType == -1) {
                checks.isPrestige = true;
            }
            updatePrestigeValues();
        }

        writeAllUpgrades(upgrades, bodyweight.upgrades, "upgrades", "upgrade", "bwUpgrade", "upgradeClick", "bwUpgradeClick");
        writeAllUpgrades(job.upgrades, null, "jobUpgrades", "jobUpgrade", null, "jobUpgradeClick", null);
        writeAllUpgrades(research.upgrades, null, "resUpgrades", "resUpgrade", null, "resUpgradeClick", null);

        if (upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
            $("#coffee").removeClass("d-none");
        }
        if (job.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 29 })[0].isPurchased) {
            $("#payDay").removeClass("d-none");
        }
    }
    else {
        $("#coffee").removeClass("d-none");
        $("#payDay").removeClass("d-none");
        $("#openGym-tab").removeClass("d-none");
        $("#gym-tab").removeClass("d-none");
        $("#research-tab").removeClass("d-none");
        $("#researchText").removeClass("d-none");
        $("#phase1Research").addClass("d-none");
        $("#phase2Research").removeClass("d-none");
        $("#influence").removeClass("d-none");
        $("#research-tab").html("Advertising");
        $("#researchText").addClass("d-none");
        $("#influenceText").removeClass("d-none");

        updatePrestigeValues();
        setupTrainerTimer();
        setupClassesTimer();
        setupCampaignTimer();
        setupAdTimer();

        updateAutobuyerToggles();
        if (prestige.bw.confidence > 0) {
            $("#confidenceWrap").removeClass("d-none");
        }
        if (prestige.lifting.leadership > 0) {
            $("#leadershipWrap").removeClass("d-none");
        }

        let trainerFocusUpgrade = prestige.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 25 });
        if (trainerFocusUpgrade[0] && trainerFocusUpgrade[0].isPurchased) {
            $(".gymTierFocus").removeClass("d-none");
            focusMemberTier(gym.members.focusId);
        }

        let liftingGymUpgrade = prestige.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 26 });
        if (liftingGymUpgrade[0] && liftingGymUpgrade[0].isPurchased) {
            $("#globalLiftingUpgradesModalTrigger").removeClass("d-none");
            $("#newGymLifting").removeClass("d-none");
        }
        let yogaGymUpgrade = prestige.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 33 });
        if (yogaGymUpgrade[0] && yogaGymUpgrade[0].isPurchased) {
            $("#globalYogaUpgradesModalTrigger").removeClass("d-none");
            $("#newGymYoga").removeClass("d-none");
        }
        if (checks.gymType == 2) {
            $("#globalYogaUpgradesModalTrigger").removeClass("d-none");
            $("#newGymYoga").removeClass("d-none");
        }
        let cardioGymUpgrade = prestige.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 43 });
        if (cardioGymUpgrade[0] && cardioGymUpgrade[0].isPurchased) {
            $("#globalCardioUpgradesModalTrigger").removeClass("d-none");
            $("#newGymCardio").removeClass("d-none");
        }
        if (checks.gymType == 3) {
            $("#globalCardioUpgradesModalTrigger").removeClass("d-none");
            $("#newGymCardio").removeClass("d-none");
        }
    }

    writeAllPrestigeUpgrades(prestige.upgrades, "globalUpgrades", "globalUpgrade", "globalUpgradeClick", prestige.current);
    writeAllPrestigeUpgrades(prestige.bw.upgrades, "globalBwUpgrades", "globalBwUpgrade", "globalBwUpgradeClick", prestige.bw.current);
    writeAllPrestigeUpgrades(prestige.lifting.upgrades, "globalLiftingUpgrades", "globalLiftingUpgrade", "globalLiftingUpgradeClick", prestige.lifting.current);
    writeAllPrestigeUpgrades(prestige.yoga.upgrades, "globalYogaUpgrades", "globalYogaUpgrade", "globalYogaUpgradeClick", prestige.yoga.current);
    writeAllPrestigeUpgrades(prestige.cardio.upgrades, "globalCardioUpgrades", "globalCardioUpgrade", "globalCardioUpgradeClick", prestige.cardio.current);
    writeMetaPointShop(
        "globalBwUpgrades",
        "confidenceShopUpgrades",
        "Confidence Shop",
        "Confidence",
        "confidenceShopPoints",
        prestige.bw.confidenceUpgrades,
        "confidenceUpgrade",
        "confidenceUpgradeClick",
        prestige.bw.confidence
    );
    writeMetaPointShop(
        "globalLiftingUpgrades",
        "leadershipShopUpgrades",
        "Leadership Shop",
        "Leadership",
        "leadershipShopPoints",
        prestige.lifting.leadershipUpgrades,
        "leadershipUpgrade",
        "leadershipUpgradeClick",
        prestige.lifting.leadership
    );
    writeMetaPointShop(
        "globalYogaUpgrades",
        "flowShopUpgrades",
        "Flow Shop",
        "Flow",
        "flowShopPoints",
        prestige.yoga.flowUpgrades,
        "flowUpgrade",
        "flowUpgradeClick",
        prestige.yoga.flow
    );
    writeMetaPointShop(
        "globalCardioUpgrades",
        "paceShopUpgrades",
        "Pace Shop",
        "Pace",
        "paceShopPoints",
        prestige.cardio.paceUpgrades,
        "paceUpgrade",
        "paceUpgradeClick",
        prestige.cardio.pace
    );
    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
    updateRepeatingUpgradeButtons("globalBwUpgrades", "bodyweight", prestige.bw.current);
    updateRepeatingUpgradeButtons("globalLiftingUpgrades", "lifting", prestige.lifting.current);
    updateRepeatingUpgradeButtons("globalYogaUpgrades", "yoga", prestige.yoga.current);
    updateRepeatingUpgradeButtons("globalCardioUpgrades", "cardio", prestige.cardio.current);
    updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
    updateRepeatingUpgradeButtons("confidenceShopUpgrades", "confidence", prestige.bw.confidence);
    updateRepeatingUpgradeButtons("leadershipShopUpgrades", "leadership", prestige.lifting.leadership);

    switch (checks.gymType) {
        case 0:
            writeAllUpgrades(gym.upgrades, gym.bw.upgrades, "upgrades", "upgrade", "bwUpgrade", "phase2UpgradeClick", "phase2BwUpgradeClick");
            writeAllUpgrades(gym.gymUpgrades, gym.bw.gymUpgrades, "gymUpgrades", "gymUpgrade", "gymBwUpgrade", "gymUpgradeClick", "gymBwUpgradeClick");
            writeAllUpgrades(gym.adUpgrades, gym.bw.adUpgrades, "adUpgrades", "adUpgrade", "adBwUpgrade", "adUpgradeClick", "adBwUpgradeClick");
            if (prestige.bw.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                $("#gang-tab").removeClass("d-none");
                $("#gangName").html(bodyweight.gang.name);
            }
            break;
        case 1:
            $("#liftingWorkoutWrap").removeClass("d-none");
            startStop(lifting.bench, liftingBenchTimerId, true);
            startStop(lifting.rows, liftingRowTimerId, true);
            startStop(lifting.ohp, liftingOhpTimerId, true);
            startStop(lifting.squats, liftingSquatsTimerId, true);
            startStop(lifting.dls, liftingDlsTimerId, true);
            startStop(lifting.curls, liftingCurlsTimerId, true);

            writeAllUpgrades(gym.upgrades, gym.lifting.upgrades, "upgrades", "upgrade", "liftingUpgrade", "phase2UpgradeClick", "phase2LiftingUpgradeClick");
            writeAllUpgrades(gym.gymUpgrades, gym.lifting.gymUpgrades, "gymUpgrades", "gymUpgrade", "gymLiftingUpgrade", "gymUpgradeClick", "gymLiftingUpgradeClick");
            writeAllUpgrades(gym.adUpgrades, gym.lifting.adUpgrades, "adUpgrades", "adUpgrade", "adLiftingUpgrade", "adUpgradeClick", "adLiftingUpgradeClick");
            if (prestige.lifting.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                $("#comp-tab").removeClass("d-none");
            }
            break;
        case 2:
            $("#yogaWorkoutWrap").removeClass("d-none");
            startStop(yoga.sun, yogaSunTimerId, true);
            startStop(yoga.vinyasa, yogaVinyasaTimerId, true);
            startStop(yoga.balance, yogaBalanceTimerId, true);
            startStop(yoga.mobility, yogaMobilityTimerId, true);
            startStop(yoga.core, yogaCoreTimerId, true);
            startStop(yoga.breath, yogaBreathTimerId, true);

            writeAllUpgrades(gym.upgrades, gym.yoga.upgrades, "upgrades", "upgrade", "yogaUpgrade", "phase2UpgradeClick", "phase2YogaUpgradeClick");
            writeAllUpgrades(gym.gymUpgrades, gym.yoga.gymUpgrades, "gymUpgrades", "gymUpgrade", "gymYogaUpgrade", "gymUpgradeClick", "gymYogaUpgradeClick");
            writeAllUpgrades(gym.adUpgrades, gym.yoga.adUpgrades, "adUpgrades", "adUpgrade", "adYogaUpgrade", "adUpgradeClick", "adYogaUpgradeClick");
            if (prestige.yoga.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                $("#comp-tab").removeClass("d-none");
            }
            break;
        case 3:
            $("#cardioWorkoutWrap").removeClass("d-none");
            startStop(cardio.treadmill, cardioTreadmillTimerId, true);
            startStop(cardio.bike, cardioBikeTimerId, true);
            startStop(cardio.row, cardioRowTimerId, true);
            startStop(cardio.sprints, cardioSprintsTimerId, true);
            startStop(cardio.hills, cardioHillsTimerId, true);
            startStop(cardio.recovery, cardioRecoveryTimerId, true);

            writeAllUpgrades(gym.upgrades, gym.cardio.upgrades, "upgrades", "upgrade", "cardioUpgrade", "phase2UpgradeClick", "phase2CardioUpgradeClick");
            writeAllUpgrades(gym.gymUpgrades, gym.cardio.gymUpgrades, "gymUpgrades", "gymUpgrade", "gymCardioUpgrade", "gymUpgradeClick", "gymCardioUpgradeClick");
            writeAllUpgrades(gym.adUpgrades, gym.cardio.adUpgrades, "adUpgrades", "adUpgrade", "adCardioUpgrade", "adUpgradeClick", "adCardioUpgradeClick");
            if (prestige.cardio.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                $("#comp-tab").removeClass("d-none");
            }
            break;
        default:
    }

    if (stats.energy.coffee.isActive || stats.energy.coffee.isCooldown) {
        setupCoffeeTimer();
    }
    if (stats.payday.isCooldown) {
        setupPayDayTimer();
    }

    if (button != null) {
        $("#loadWrapper").html("<div id='loadAlert' class='alert alert-info alert-dismissible fade show' role='alert'><strong>Loaded.</strong><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>")
        $("#loadAlert").alert();
        setTimeout(function () {
            $("#loadAlert").alert('close');
        }, 5000);
    }
    if (firstLoad) {
        saveTimerId = setInterval(function () {
            save();
        }, 30000);
    }
}

function getNextUnabsorbedGangRivalId() {
    for (let i = 0; i < bodyweight.gang.rivals.length; i++) {
        if (!bodyweight.gang.rivals[i].isAbsorbed) {
            return i;
        }
    }
    return -1;
}

function tryOfflineAutoAbsorbGangRival() {
    if (checks.gymType != 0 || !checks.absorbGangsOn) {
        return false;
    }

    let rivalId = getNextUnabsorbedGangRivalId();
    if (rivalId < 0) {
        return false;
    }

    let rival = bodyweight.gang.rivals[rivalId];
    bodyweight.gang.rivalId = rivalId;
    let playerPower = gangPower(bodyweight.gang.strength, bodyweight.gang.members);
    let rivalPower = gangPower(rival.strength, rival.members);
    if (math.mul(playerPower, 0.4) < rivalPower) {
        return false;
    }

    rival.isAbsorbed = true;
    rival.isDefeated = true;
    stats.money = math.add(stats.money, rival.members);
    addRunGain("moneyEarned", rival.members);
    bodyweight.gang.members = math.add(bodyweight.gang.members, rival.members);
    prestige.bw.confidence = math.add(prestige.bw.confidence, getConfidencePerGangAbsorb());
    return true;
}

function buyCompetitionOffline(compType) {
    return false;
}

function runOfflineConferenceAutobuyer() {
    runAcademyAutomation();
    runYogaAutomation();
}

function applyOfflineProgress(seconds) {
    let gangAutoAbsorbTimerSeconds = 0;
    for (let i = 0; i < seconds; i++) {
        addRunSeconds(1);
        if (checks.gymType == -1) {
            let videoIncome = jobMoneyPerSecond();
            if (math.add(stats.money, videoIncome) > 0) {
                stats.money = math.add(stats.money, videoIncome);
                addRunGain("moneyEarned", videoIncome);
            }
            else {
                stats.money = 0;
            }

            job.followerGrowth = math.add(job.followerGrowth, followerGrowthPerSecond());
            let researchGain = researchPointsPerSecond();
            research.points = math.add(research.points, researchGain);
            addRunGain("researchEarned", researchGain);
            research.postGrowth = math.add(research.postGrowth, postGrowthPerSecond());
        }
        else {
            let gymMoneyGain = gymMoneyPerSecond();
            stats.money = math.add(stats.money, gymMoneyGain);
            stats.money = math.min(stats.money, 1e200);
            addRunGain("moneyEarned", gymMoneyGain);

            let influenceGain = gymInfluencePerSecond();
            gym.advertising.influence = math.add(gym.advertising.influence, influenceGain);
            gym.advertising.influence = math.min(gym.advertising.influence, 1e200);
            addRunGain("influenceEarned", influenceGain);

            let totalToAdd = gymMembersPerSecond();
            gym.members.current = math.add(gym.members.current, totalToAdd);
            gym.members.tiers[0].current = math.add(gym.members.tiers[0].current, totalToAdd);
            gym.advertising.campaignGrowth = math.add(gym.advertising.campaignGrowth, gymCampaignGrowthPerSecond());
            gym.advertising.campaignGrowth = applySoftcap(gym.advertising.campaignGrowth, 1e200, 0.5);

            let gangStrengthGrowth = gangStrengthPerSecond();
            bodyweight.gang.strength = math.add(bodyweight.gang.strength, gangStrengthGrowth);
            bodyweight.gang.strength = math.min(bodyweight.gang.strength, 1e100);

            let gangMemberGrowth = gangMembersPerSecond();
            bodyweight.gang.members = math.add(bodyweight.gang.members, gangMemberGrowth);
            bodyweight.gang.members = math.min(bodyweight.gang.members, 1e100);

            for (let j = 0; j < bodyweight.gang.rivals.length; j++) {
                bodyweight.gang.rivals[j].strength = math.add(
                    bodyweight.gang.rivals[j].strength,
                    math.mul(bodyweight.gang.rivals[j].strengthAmount, bodyweight.gang.on)
                );
                bodyweight.gang.rivals[j].members = math.add(
                    bodyweight.gang.rivals[j].members,
                    math.mul(bodyweight.gang.rivals[j].memberAmount, bodyweight.gang.on)
                );
            }

            advanceAcademySeason(1);
            advanceYogaBreathCycle(1);
            advanceCardioInterval(1);
            runOfflineConferenceAutobuyer();

            if (checks.gymType == 0 && checks.absorbGangsOn) {
                gangAutoAbsorbTimerSeconds += 1;
                if (gangAutoAbsorbTimerSeconds >= OFFLINE_GANG_AUTOABSORB_INTERVAL_SECONDS) {
                    tryOfflineAutoAbsorbGangRival();
                    gangAutoAbsorbTimerSeconds = 0;
                }
            }
            else {
                gangAutoAbsorbTimerSeconds = 0;
            }
        }

        applyPassiveMetaGeneration(1);
    }

    assertValidState("offline_progress", { strict: true });
}

function applyBackgroundCatchup(seconds) {
    let catchupSeconds = Math.min(Math.max(0, Math.floor(seconds)), OFFLINE_MAX_SECONDS);
    if (catchupSeconds <= 0) {
        return;
    }

    let moneyBeforeCatchup = stats.money;
    let researchBeforeCatchup = research.points;
    let influenceBeforeCatchup = gym.advertising.influence;
    let confidenceBeforeCatchup = prestige.bw.confidence;
    let leadershipBeforeCatchup = prestige.lifting.leadership;
    let flowBeforeCatchup = prestige.yoga.flow;
    let paceBeforeCatchup = prestige.cardio.pace;

    applyOfflineProgress(catchupSeconds);

    let moneyGain = stats.money - moneyBeforeCatchup;
    let researchGain = research.points - researchBeforeCatchup;
    let influenceGain = gym.advertising.influence - influenceBeforeCatchup;
    let confidenceGain = prestige.bw.confidence - confidenceBeforeCatchup;
    let leadershipGain = prestige.lifting.leadership - leadershipBeforeCatchup;
    let flowGain = prestige.yoga.flow - flowBeforeCatchup;
    let paceGain = prestige.cardio.pace - paceBeforeCatchup;

    showOfflineSummary(
        catchupSeconds,
        moneyGain,
        researchGain,
        influenceGain,
        confidenceGain,
        leadershipGain,
        flowGain,
        paceGain
    );
    save(true);
}

function setupVisibilityCatchup() {
    if (visibilityCatchupBound || typeof document === "undefined") {
        return;
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            hiddenAtTimestamp = Date.now();
            return;
        }

        if (hiddenAtTimestamp != null) {
            let elapsedSeconds = Math.floor((Date.now() - hiddenAtTimestamp) / 1000);
            hiddenAtTimestamp = null;
            applyBackgroundCatchup(elapsedSeconds);
        }
    });

    visibilityCatchupBound = true;
}

function formatSummaryNumber(value) {
    let parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
        return "0";
    }

    if (Math.abs(parsedValue) < 1000000) {
        return parsedValue.toFixed(2);
    }

    return math.format(parsedValue, 3);
}

function formatOfflineDuration(seconds) {
    let totalSeconds = Math.max(0, Math.floor(seconds));
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
        return hours + "h " + minutes + "m";
    }
    if (minutes > 0) {
        return minutes + "m " + remainingSeconds + "s";
    }
    return remainingSeconds + "s";
}

function showOfflineSummary(
    offlineSeconds,
    moneyGain,
    researchGain,
    influenceGain,
    confidenceGain = 0,
    leadershipGain = 0,
    flowGain = 0,
    paceGain = 0
) {
    let durationText = formatOfflineDuration(offlineSeconds);
    let detailText = "Money +" + formatSummaryNumber(moneyGain);
    if (checks.gymType == -1) {
        detailText += " | Research +" + formatSummaryNumber(researchGain);
    }
    else {
        detailText += " | Influence +" + formatSummaryNumber(influenceGain);
    }
    if (confidenceGain > 0) {
        detailText += " | Confidence +" + formatSummaryNumber(confidenceGain);
    }
    if (leadershipGain > 0) {
        detailText += " | Leadership +" + formatSummaryNumber(leadershipGain);
    }
    if (flowGain > 0) {
        detailText += " | Flow +" + formatSummaryNumber(flowGain);
    }
    if (paceGain > 0) {
        detailText += " | Pace +" + formatSummaryNumber(paceGain);
    }

    $("#offlineProgressAlert").remove();
    $("#story").prepend("<div id='offlineProgressAlert' class='alert alert-info alert-dismissible fade show fixed-bottom' role='alert'><strong>Offline progress applied (" + durationText + ").</strong> " + detailText + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");

    if (offlineAlertTimerId != null) {
        clearTimeout(offlineAlertTimerId);
    }
    offlineAlertTimerId = setTimeout(function () {
        $("#offlineProgressAlert").alert("close");
    }, 9000);
}

function sanitizeDebugSpeedMultiplier(multiplier) {
    let parsed = Number(multiplier);
    if (!Number.isFinite(parsed)) {
        return 1;
    }

    if (parsed < 1) {
        return 1;
    }

    if (parsed > 1000) {
        return 1000;
    }

    return parsed;
}

function getScaledTimerDelay(baseDelayMs) {
    let delay = Number(baseDelayMs);
    if (!Number.isFinite(delay) || delay <= 0) {
        delay = 1;
    }

    let scaledDelay = delay / math.mul(debugSpeedMultiplier, getGymMasteryActionSpeedMultiplier());
    if (scaledDelay < 1) {
        return 1;
    }

    return scaledDelay;
}

function getDebugSampleTimeMs() {
    if (typeof performance !== "undefined" && performance != null && typeof performance.now === "function") {
        return performance.now();
    }

    return Date.now();
}

function resetDebugEffectiveSpeedSample() {
    debugEffectiveSpeed = debugSpeedMultiplier;
    debugEffectiveSample.realMs = null;
    debugEffectiveSample.runSeconds = null;
}

function updateDebugEffectiveSpeedEstimate() {
    if (!debugPanelEnabled) {
        return;
    }

    let runTracker = ensureRunTracker();
    let nowMs = getDebugSampleTimeMs();
    let nowRunSeconds = math.evaluate(runTracker.runSeconds);

    if (debugEffectiveSample.realMs == null || debugEffectiveSample.runSeconds == null) {
        debugEffectiveSample.realMs = nowMs;
        debugEffectiveSample.runSeconds = nowRunSeconds;
        return;
    }

    let elapsedRealSeconds = (nowMs - debugEffectiveSample.realMs) / 1000;
    if (!Number.isFinite(elapsedRealSeconds) || elapsedRealSeconds < 0.25) {
        return;
    }

    let elapsedRunSeconds = nowRunSeconds - debugEffectiveSample.runSeconds;
    if (!Number.isFinite(elapsedRunSeconds) || elapsedRunSeconds < 0) {
        debugEffectiveSample.realMs = nowMs;
        debugEffectiveSample.runSeconds = nowRunSeconds;
        return;
    }

    let sampleMultiplier = elapsedRunSeconds / elapsedRealSeconds;
    if (Number.isFinite(sampleMultiplier) && sampleMultiplier >= 0) {
        debugEffectiveSpeed = sampleMultiplier;
    }

    debugEffectiveSample.realMs = nowMs;
    debugEffectiveSample.runSeconds = nowRunSeconds;

    if ($("#debugSpeedEffectiveValue").length > 0) {
        $("#debugSpeedEffectiveValue").html(debugEffectiveSpeed.toFixed(1) + "x");
    }
}

function clearRuntimeIntervalsForDebugSpeed() {
    clearInterval(refreshId);
    clearInterval(energyUiRefreshId);
    clearInterval(energyTimerId);
    clearInterval(pushupTimerId);
    clearInterval(rowTimerId);
    clearInterval(dipTimerId);
    clearInterval(pullupTimerId);
    clearInterval(bwSquatTimerId);
    clearInterval(bwRdlTimerId);
    clearInterval(oneSecondTimerId);
    clearInterval(makeVideoTimerId);
    clearInterval(influencerId);
    clearInterval(browseRedditTimerId);
    clearInterval(codeBotsTimerId);
    clearInterval(coffeeTimerId);
    clearInterval(payDayTimerId);
    clearInterval(trainerTimerId);
    clearInterval(createClassesTimerId);
    clearInterval(runCampaignTimerId);
    clearInterval(designAdTimerId);
    clearInterval(liftingBenchTimerId);
    clearInterval(liftingRowTimerId);
    clearInterval(liftingOhpTimerId);
    clearInterval(liftingSquatsTimerId);
    clearInterval(liftingDlsTimerId);
    clearInterval(liftingCurlsTimerId);
    clearInterval(yogaSunTimerId);
    clearInterval(yogaVinyasaTimerId);
    clearInterval(yogaBalanceTimerId);
    clearInterval(yogaMobilityTimerId);
    clearInterval(yogaCoreTimerId);
    clearInterval(yogaBreathTimerId);
    clearInterval(yogaContinuousTimerId);
    clearInterval(cardioTreadmillTimerId);
    clearInterval(cardioBikeTimerId);
    clearInterval(cardioRowTimerId);
    clearInterval(cardioSprintsTimerId);
    clearInterval(cardioHillsTimerId);
    clearInterval(cardioRecoveryTimerId);
    clearInterval(cardioContinuousTimerId);
    yogaContinuousTimerId = null;
    cardioContinuousTimerId = null;
    energyUiRefreshId = null;
}

function restartRuntimeIntervalsForDebugSpeed() {
    clearRuntimeIntervalsForDebugSpeed();
    energyDisplayCurrent = stats.energy.current;

    setupRefresh();
    setupEnergyUiRefresh();
    setupEnergyTimer();
    setupOneSecondTimer();

    if ((checks.gymType == -1 || checks.gymType == 0) && !bodyweight.pushups.isStopped) {
        setupPushupTimer();
    }

    if (checks.gymType == -1) {
        let rowsUnlocked = bodyweight.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 1 });
        let dipsUnlocked = research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 4 });
        let pullupsUnlocked = bodyweight.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 4 });
        let lowerBodyUnlocked = research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 11 });

        if (rowsUnlocked[0] && rowsUnlocked[0].isPurchased && !bodyweight.rows.isStopped) {
            setupRowTimer();
        }
        if (dipsUnlocked[0] && dipsUnlocked[0].isPurchased && !bodyweight.dips.isStopped) {
            setupDipTimer();
        }
        if (pullupsUnlocked[0] && pullupsUnlocked[0].isPurchased && !bodyweight.pullups.isStopped) {
            setupPullupTimer();
        }
        if (lowerBodyUnlocked[0] && lowerBodyUnlocked[0].isPurchased) {
            if (!bodyweight.squats.isStopped) {
                setupBwSquatTimer();
            }
            if (!bodyweight.rdl.isStopped) {
                setupBwRdlTimer();
            }
        }
    }
    else if (checks.gymType == 0) {
        if (!bodyweight.rows.isStopped) {
            setupRowTimer();
        }
        if (!bodyweight.dips.isStopped) {
            setupDipTimer();
        }
        if (!bodyweight.pullups.isStopped) {
            setupPullupTimer();
        }
        if (!bodyweight.squats.isStopped) {
            setupBwSquatTimer();
        }
        if (!bodyweight.rdl.isStopped) {
            setupBwRdlTimer();
        }
    }
    else if (checks.gymType == 1) {
        if (!lifting.bench.isStopped) {
            setupLiftingBenchTimer();
        }
        if (!lifting.rows.isStopped) {
            setupLiftingRowTimer();
        }
        if (!lifting.ohp.isStopped) {
            setupLiftingOhpTimer();
        }
        if (!lifting.squats.isStopped) {
            setupLiftingSquatsTimer();
        }
        if (!lifting.dls.isStopped) {
            setupLiftingDlsTimer();
        }
        if (!lifting.curls.isStopped) {
            setupLiftingCurlsTimer();
        }
    }
    else if (checks.gymType == 2) {
        if (!yoga.sun.isStopped) {
            setupYogaSunTimer();
        }
        if (!yoga.vinyasa.isStopped) {
            setupYogaVinyasaTimer();
        }
        if (!yoga.balance.isStopped) {
            setupYogaBalanceTimer();
        }
        if (!yoga.mobility.isStopped) {
            setupYogaMobilityTimer();
        }
        if (!yoga.core.isStopped) {
            setupYogaCoreTimer();
        }
        if (!yoga.breath.isStopped) {
            setupYogaBreathTimer();
        }
    }
    else if (checks.gymType == 3) {
        if (!cardio.treadmill.isStopped) {
            setupCardioTreadmillTimer();
        }
        if (!cardio.bike.isStopped) {
            setupCardioBikeTimer();
        }
        if (!cardio.row.isStopped) {
            setupCardioRowTimer();
        }
        if (!cardio.sprints.isStopped) {
            setupCardioSprintsTimer();
        }
        if (!cardio.hills.isStopped) {
            setupCardioHillsTimer();
        }
        if (!cardio.recovery.isStopped) {
            setupCardioRecoveryTimer();
        }
    }

    if (checks.gymType == -1) {
        if (checks.story2) {
            setupMakeVideoTimer();
        }
        if (checks.story4) {
            setupBrowseRedditTimer();
        }

        let influencerUpgrade = research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 10 });
        if (influencerUpgrade[0] && influencerUpgrade[0].isPurchased) {
            setupInfluencerTimer();
        }

        let botsUpgrade = research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 13 });
        if (botsUpgrade[0] && botsUpgrade[0].isPurchased) {
            setupCodeBotsTimer();
        }
    }
    else {
        setupTrainerTimer();
        setupClassesTimer();
        setupCampaignTimer();
        setupAdTimer();
    }

    if (stats.energy.coffee.isActive || stats.energy.coffee.isCooldown) {
        setupCoffeeTimer();
    }

    if (stats.payday.isCooldown) {
        setupPayDayTimer();
    }
}

function updateDebugSpeedButtons() {
    let options = [1, 5, 20, 60, 100, 250, 500, 1000];
    for (let i = 0; i < options.length; i++) {
        let value = options[i];
        let button = $("#debugSpeed" + value + "Btn");
        if (button.length == 0) {
            continue;
        }

        if (debugSpeedMultiplier == value) {
            button.removeClass("btn-secondary").addClass("btn-primary");
        }
        else {
            button.removeClass("btn-primary").addClass("btn-secondary");
        }
    }
}

function refreshDebugPanelState() {
    if (debugPanelEnabled) {
        $("#debugPanel").removeClass("d-none");
        $("#debugStatus").html("Enabled");
    }
    else {
        $("#debugPanel").addClass("d-none");
        $("#debugStatus").html("Disabled");
    }

    $("#debugSpeedValue").html(debugSpeedMultiplier + "x");
    if ($("#debugSpeedEffectiveValue").length > 0) {
        $("#debugSpeedEffectiveValue").html(debugEffectiveSpeed.toFixed(1) + "x");
    }
    updateDebugSpeedButtons();
}

function setDebugSpeedMultiplier(multiplier) {
    if (!debugPanelEnabled) {
        return;
    }

    let nextMultiplier = sanitizeDebugSpeedMultiplier(multiplier);
    let isChanged = nextMultiplier !== debugSpeedMultiplier;
    debugSpeedMultiplier = nextMultiplier;
    localStorage.setItem(DEBUG_SPEED_STORAGE_KEY, debugSpeedMultiplier.toString());

    if (isChanged) {
        restartRuntimeIntervalsForDebugSpeed();
    }

    resetDebugEffectiveSpeedSample();
    refreshDebugPanelState();
}

function debugSkipProgression() {
    if (!debugPanelEnabled) {
        return;
    }

    if (checks.gymType == -1) {
        checks.story1 = true;
        checks.story2 = true;
        checks.story3 = true;
        checks.story4 = true;
        checks.story5 = true;
        checks.isPrestige = true;

        stats.money = Math.max(stats.money, 250000);
        stats.strength = Math.max(stats.strength, 250);
        stats.endurance = Math.max(stats.endurance, 250);
        stats.agility = Math.max(stats.agility, 250);
        stats.intelligence = Math.max(stats.intelligence, 250);

        job.views = Math.max(job.views, 50000);
        job.followers = Math.max(job.followers, 7500);
        research.points = Math.max(research.points, 5000);
        research.posts = Math.max(research.posts, 5000);

        $("#work-tab").removeClass("d-none");
        $("#followerWrap").removeClass("d-none");
        $("#research-tab").removeClass("d-none");
        $("#researchText").removeClass("d-none");
        $("#openGym-tab").removeClass("d-none");
    }
    else {
        checks.isPrestige = true;

        stats.money = Math.max(stats.money, 1000000);
        gym.members.current = Math.max(gym.members.current, 5000);
        gym.classes = Math.max(gym.classes, 5000);
        gym.advertising.influence = Math.max(gym.advertising.influence, 25000);
        gym.advertising.campaignGrowth = Math.max(gym.advertising.campaignGrowth, 10000);
    }

    updatePrestigeValues();
    assertValidState("debug_skip_progression", { strict: true });
    $("#story").prepend("<div id='debugSkipAlert' class='alert alert-warning alert-dismissible fade show fixed-bottom' role='alert'><strong>Debug progression skip applied.</strong> Resources and progression flags were advanced.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
}

function markUpgradesActive(upgradeArray) {
    if (!Array.isArray(upgradeArray)) {
        return;
    }

    for (let i = 0; i < upgradeArray.length; i++) {
        upgradeArray[i].isActive = true;
    }
}

function debugForceUnlocks() {
    if (!debugPanelEnabled) {
        return;
    }

    checks.story1 = true;
    checks.story2 = true;
    checks.story3 = true;
    checks.story4 = true;
    checks.story5 = true;
    checks.isPrestige = true;

    markUpgradesActive(upgrades);
    markUpgradesActive(bodyweight.upgrades);
    markUpgradesActive(job.upgrades);
    markUpgradesActive(research.upgrades);
    markUpgradesActive(gym.upgrades);
    markUpgradesActive(gym.gymUpgrades);
    markUpgradesActive(gym.adUpgrades);
    markUpgradesActive(gym.bw.upgrades);
    markUpgradesActive(gym.bw.gymUpgrades);
    markUpgradesActive(gym.bw.adUpgrades);
    markUpgradesActive(gym.lifting.upgrades);
    markUpgradesActive(gym.lifting.gymUpgrades);
    markUpgradesActive(gym.lifting.adUpgrades);
    markUpgradesActive(gym.yoga.upgrades);
    markUpgradesActive(gym.yoga.gymUpgrades);
    markUpgradesActive(gym.yoga.adUpgrades);
    markUpgradesActive(gym.cardio.upgrades);
    markUpgradesActive(gym.cardio.gymUpgrades);
    markUpgradesActive(gym.cardio.adUpgrades);
    markUpgradesActive(prestige.upgrades);
    markUpgradesActive(prestige.bw.upgrades);
    markUpgradesActive(prestige.lifting.upgrades);
    markUpgradesActive(prestige.yoga.upgrades);
    markUpgradesActive(prestige.cardio.upgrades);
    markUpgradesActive(prestige.bw.confidenceUpgrades);
    markUpgradesActive(prestige.lifting.leadershipUpgrades);
    markUpgradesActive(prestige.yoga.flowUpgrades);
    markUpgradesActive(prestige.cardio.paceUpgrades);

    $("#work-tab").removeClass("d-none");
    $("#research-tab").removeClass("d-none");
    $("#researchText").removeClass("d-none");
    $("#openGym-tab").removeClass("d-none");
    $("#gym-tab").removeClass("d-none");
    $("#gang-tab").removeClass("d-none");
    $("#comp-tab").removeClass("d-none");
    $("#globalLiftingUpgradesModalTrigger").removeClass("d-none");
    $("#newGymLifting").removeClass("d-none");
    $("#globalYogaUpgradesModalTrigger").removeClass("d-none");
    $("#newGymYoga").removeClass("d-none");
    $("#globalCardioUpgradesModalTrigger").removeClass("d-none");
    $("#newGymCardio").removeClass("d-none");

    $("#bwRows").removeClass("d-none");
    $("#bwDips").removeClass("d-none");
    $("#bwPullups").removeClass("d-none");
    $("#bwRdl").removeClass("d-none");
    $("#bwSquats").removeClass("d-none");
    $("#influencerWrap").removeClass("d-none");
    $("#botWrap").removeClass("d-none");

    updatePrestigeValues();
    restartRuntimeIntervalsForDebugSpeed();
    assertValidState("debug_force_unlocks", { strict: true });
    $("#story").prepend("<div id='debugForceUnlockAlert' class='alert alert-info alert-dismissible fade show fixed-bottom' role='alert'><strong>Debug force unlocks applied.</strong> Upgrade visibility and progression gates are now unlocked.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
}

function applyPrestigeJump(target, jumpRuns) {
    for (let i = 0; i < jumpRuns; i++) {
        target.current += target.total + 1;
        target.total += 1;
    }
}

function debugPrestigeJump() {
    if (!debugPanelEnabled) {
        return;
    }

    let jumpRuns = 5;
    checks.isPrestige = true;
    applyPrestigeJump(prestige, jumpRuns);

    switch (checks.gymType) {
        case -1:
        case 0:
            applyPrestigeJump(prestige.bw, jumpRuns);
            break;
        case 1:
            applyPrestigeJump(prestige.lifting, jumpRuns);
            break;
        case 2:
            applyPrestigeJump(prestige.yoga, jumpRuns);
            break;
        case 3:
            applyPrestigeJump(prestige.cardio, jumpRuns);
            break;
        default:
    }

    updatePrestigeValues();
    checkPrestigeUpgradeDisable(prestige.upgrades, prestige.current, "globalUpgrade");
    checkPrestigeUpgradeDisable(prestige.bw.upgrades, prestige.bw.current, "globalBwUpgrade");
    checkPrestigeUpgradeDisable(prestige.lifting.upgrades, prestige.lifting.current, "globalLiftingUpgrade");
    checkPrestigeUpgradeDisable(prestige.yoga.upgrades, prestige.yoga.current, "globalYogaUpgrade");
    checkPrestigeUpgradeDisable(prestige.yoga.flowUpgrades, prestige.yoga.flow, "flowUpgrade");
    checkPrestigeUpgradeDisable(prestige.bw.confidenceUpgrades, prestige.bw.confidence, "confidenceUpgrade");
    checkPrestigeUpgradeDisable(prestige.lifting.leadershipUpgrades, prestige.lifting.leadership, "leadershipUpgrade");
    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
    updateRepeatingUpgradeButtons("globalBwUpgrades", "bodyweight", prestige.bw.current);
    updateRepeatingUpgradeButtons("globalLiftingUpgrades", "lifting", prestige.lifting.current);
    updateRepeatingUpgradeButtons("globalYogaUpgrades", "yoga", prestige.yoga.current);
    updateRepeatingUpgradeButtons("globalCardioUpgrades", "cardio", prestige.cardio.current);
    updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
    updateRepeatingUpgradeButtons("confidenceShopUpgrades", "confidence", prestige.bw.confidence);
    updateRepeatingUpgradeButtons("leadershipShopUpgrades", "leadership", prestige.lifting.leadership);
    assertValidState("debug_prestige_jump", { strict: true });
    $("#story").prepend("<div id='debugPrestigeJumpAlert' class='alert alert-info alert-dismissible fade show fixed-bottom' role='alert'><strong>Debug prestige jump applied.</strong> Added 5 prestige cycles worth of points for the current layer.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
}

function setupDebugPanel() {
    let enabledByQuery = false;
    let speedByQuery = null;
    try {
        let params = new URL(window.location.href).searchParams;
        enabledByQuery = params.get("debug") === "1";
        speedByQuery = params.get("debugSpeed");
    }
    catch (ex) {
        enabledByQuery = false;
        speedByQuery = null;
    }

    let enabledByStorage = localStorage.getItem("gainz_debug_enabled") === "1";
    debugPanelEnabled = enabledByQuery || enabledByStorage;

    if (enabledByQuery) {
        localStorage.setItem("gainz_debug_enabled", "1");
    }

    let storedSpeed = localStorage.getItem(DEBUG_SPEED_STORAGE_KEY);
    let effectiveSpeed = speedByQuery != null ? speedByQuery : storedSpeed;

    if (debugPanelEnabled) {
        debugSpeedMultiplier = sanitizeDebugSpeedMultiplier(effectiveSpeed);
        localStorage.setItem(DEBUG_SPEED_STORAGE_KEY, debugSpeedMultiplier.toString());
        if (debugSpeedMultiplier != 1) {
            restartRuntimeIntervalsForDebugSpeed();
        }
        resetDebugEffectiveSpeedSample();
    }
    else {
        debugSpeedMultiplier = 1;
        localStorage.removeItem(DEBUG_SPEED_STORAGE_KEY);
        resetDebugEffectiveSpeedSample();
    }

    refreshDebugPanelState();
}

function reset() {
    if (confirm("Are you sure you want to reset your save data?")) {
        localStorage.removeItem(saveName);

        stats = JSON.parse(JSON.stringify(baseStats));
        bodyweight = JSON.parse(JSON.stringify(baseBodyweight));
        upgrades = JSON.parse(JSON.stringify(baseUpgrades));
        job = JSON.parse(JSON.stringify(baseJob));
        research = JSON.parse(JSON.stringify(baseResearch));
        checks = JSON.parse(JSON.stringify(baseChecks));
        gym = JSON.parse(JSON.stringify(baseGym));
        prestige = JSON.parse(JSON.stringify(basePrestige));

        save();
        loadReset();
        load(null, false, false);

        $("#resetWrapper").html("<div id='resetAlert' class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Game Reset.</strong><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>")
        $("#resetAlert").alert();
        setTimeout(function () {
            $("#resetAlert").alert('close');
        }, 5000);
    }
}

//#endregion

if (window.__gainzAssertLog == null) {
    window.__gainzAssertLog = [];
}

var MAX_SANITIZED_RESOURCE_VALUE = Number.MAX_VALUE;

function logAssertionIssue(context, path, value, resolution) {
    window.__gainzAssertLog.push({
        at: Date.now(),
        context: context,
        path: path,
        value: value,
        resolution: resolution,
    });

    if (window.__gainzAssertLog.length > 500) {
        window.__gainzAssertLog.shift();
    }
}

function shouldAllowNegativeResourceValue(path) {
    return path === "bodyweight.gang.rivalId" ||
        path === "bodyweight.gang.playerFightPowerTemp" ||
        path === "bodyweight.gang.rivalFightPowerTemp";
}

function sanitizeResourceValue(context, path, value, options) {
    let allowNegative = options != null && options.allowNegative === true;

    if (!Number.isFinite(value)) {
        logAssertionIssue(context, path, value, "reset_to_zero_non_finite");
        return 0;
    }
    if (value < 0 && !allowNegative) {
        logAssertionIssue(context, path, value, "clamp_to_zero_negative");
        return 0;
    }
    if (value > MAX_SANITIZED_RESOURCE_VALUE) {
        logAssertionIssue(context, path, value, "clamp_to_max_overflow");
        return MAX_SANITIZED_RESOURCE_VALUE;
    }
    return value;
}

function sanitizeNumericTree(context, path, value, seen) {
    if (value == null || typeof value !== "object") {
        return;
    }

    if (seen.has(value)) {
        return;
    }
    seen.add(value);

    let keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let childPath = path + "." + key;
        let childValue = value[key];

        if (typeof childValue === "number") {
            value[key] = sanitizeResourceValue(context, childPath, childValue, {
                allowNegative: shouldAllowNegativeResourceValue(childPath),
            });
        }
        else if (childValue != null && typeof childValue === "object") {
            sanitizeNumericTree(context, childPath, childValue, seen);
        }
    }
}

function sanitizeStrictEconomyState(context) {
    let seen = new WeakSet();
    sanitizeNumericTree(context, "stats", stats, seen);
    sanitizeNumericTree(context, "job", job, seen);
    sanitizeNumericTree(context, "research", research, seen);
    sanitizeNumericTree(context, "gym", gym, seen);
    sanitizeNumericTree(context, "bodyweight", bodyweight, seen);
    sanitizeNumericTree(context, "lifting", lifting, seen);
    sanitizeNumericTree(context, "prestige", prestige, seen);
}

function applySoftcap(value, start, power) {
    let normalizedValue = math.evaluate(value);
    let normalizedStart = math.evaluate(start);
    let normalizedPower = math.evaluate(power);

    if (!Number.isFinite(normalizedValue) || !Number.isFinite(normalizedStart) || !Number.isFinite(normalizedPower)) {
        return 0;
    }

    if (normalizedStart <= 0 || normalizedPower <= 0) {
        return normalizedValue;
    }

    if (normalizedValue <= normalizedStart) {
        return normalizedValue;
    }

    let ratio = math.div(normalizedValue, normalizedStart);
    return math.mul(normalizedStart, math.pow(ratio, normalizedPower));
}

function normalizeModifierList(values) {
    if (values == null) {
        return [];
    }

    if (Array.isArray(values)) {
        return values;
    }

    return [values];
}

function sumModifierValues(values) {
    let normalized = normalizeModifierList(values);
    let total = 0;
    for (let i = 0; i < normalized.length; i++) {
        let nextValue = math.evaluate(normalized[i]);
        if (Number.isFinite(nextValue)) {
            total = math.add(total, nextValue);
        }
    }
    return total;
}

function multiplyModifierValues(values) {
    let normalized = normalizeModifierList(values);
    let total = 1;
    for (let i = 0; i < normalized.length; i++) {
        let nextValue = math.evaluate(normalized[i]);
        if (Number.isFinite(nextValue)) {
            total = math.mul(total, nextValue);
        }
    }
    return total;
}

function applyModifierPipeline(baseValue, options) {
    let config = options || {};
    let base = math.evaluate(baseValue);
    let additive = sumModifierValues(config.additive);
    let multiplicative = multiplyModifierValues(config.multiplicative);
    let exponential = multiplyModifierValues(config.exponential);
    let globalModifier = multiplyModifierValues(config.global);
    let layerModifier = multiplyModifierValues(config.layer);

    let value = math.mul(math.add(base, additive), multiplicative);
    let safeBase = math.max(0, value);
    value = math.pow(safeBase, exponential);
    value = math.mul(value, globalModifier);
    value = math.mul(value, layerModifier);
    return value;
}

function getTotalStats() {
    return math.add(
        math.add(stats.strength, stats.endurance),
        math.add(stats.agility, stats.intelligence)
    );
}

function getAllStatMultiplier() {
    return applyModifierPipeline(1, {
        additive: [math.mul(getTotalStats(), stats.allStatBoost)],
    });
}

function getIntelligenceMultiplier() {
    return applyModifierPipeline(1, {
        additive: [math.mul(stats.intelligence, stats.intelligenceBoost)],
    });
}

function getStrengthPostMultiplier() {
    return applyModifierPipeline(1, {
        additive: [math.mul(math.mul(stats.strength, stats.strengthBoost), research.postStrengthMod)],
    });
}

function getConfidenceMultiplier() {
    let confidenceBoost = math.mul(
        math.add(prestige.bw.confidenceBoost, getConfidenceShopBoostBonus()),
        getRepeatingConfidencePerPointMultiplier()
    );
    let effectiveConfidence = getEffectiveConfidenceForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectiveConfidence, confidenceBoost)],
    });
}

function getLeadershipMultiplier() {
    let leadershipBoost = math.mul(
        math.add(prestige.lifting.leadershipBoost, getLeadershipShopBoostBonus()),
        getRepeatingLeadershipPerPointMultiplier()
    );
    let effectiveLeadership = getEffectiveLeadershipForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectiveLeadership, leadershipBoost)],
    });
}

function getFlowMultiplier() {
    let flowBoost = getFlowPerPointBonus();
    let effectiveFlow = getEffectiveFlowForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectiveFlow, flowBoost)],
    });
}

function getFlowMaxEnergyMultiplier() {
    let flowBoost = math.mul(getFlowPerPointBonus(), FLOW_MAX_ENERGY_TO_SPEED_RATIO);
    let effectiveFlow = getEffectiveFlowForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectiveFlow, flowBoost)],
    });
}

function getFlowEnergyRecoveryMultiplier() {
    let flowBoost = math.mul(getFlowPerPointBonus(), FLOW_RECOVERY_TO_SPEED_RATIO);
    let effectiveFlow = getEffectiveFlowForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectiveFlow, flowBoost)],
    });
}

function getPaceMultiplier() {
    let paceBoost = getPacePerPointBonus();
    let effectivePace = getEffectivePaceForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectivePace, paceBoost)],
    });
}

function getPaceMaxEnergyMultiplier() {
    let paceBoost = math.mul(getPacePerPointBonus(), PACE_MAX_ENERGY_TO_SPEED_RATIO);
    let effectivePace = getEffectivePaceForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectivePace, paceBoost)],
    });
}

function getPaceEnergyRecoveryMultiplier() {
    let paceBoost = math.mul(getPacePerPointBonus(), PACE_RECOVERY_TO_SPEED_RATIO);
    let effectivePace = getEffectivePaceForBonuses();
    return applyModifierPipeline(1, {
        additive: [math.mul(effectivePace, paceBoost)],
    });
}

function getFlowPerPointBonus() {
    if (!hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 1)) {
        return 0;
    }
    return math.mul(math.add(prestige.yoga.flowBoost, getFlowShopBoostBonus()), getRepeatingFlowEffectMultiplier());
}

function getPacePerPointBonus() {
    if (!hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 1)) {
        return 0;
    }
    return math.mul(math.add(prestige.cardio.paceBoost, getPaceShopBoostBonus()), getRepeatingPaceEffectMultiplier());
}

function applyMetaTwoStageSoftcap(rawValue, stage1Start, stage1Scale, stage2Start, stage2Scale, stage2Curve) {
    let clampedRaw = math.max(0, rawValue);
    if (clampedRaw <= stage1Start) {
        return clampedRaw;
    }

    let stage1Input = math.min(clampedRaw, stage2Start);
    let stage1Overflow = math.sub(stage1Input, stage1Start);
    let stage1Value = math.add(stage1Start, math.mul(stage1Scale, math.log10(math.add(1, stage1Overflow))));
    if (clampedRaw <= stage2Start) {
        return stage1Value;
    }

    let stage2Overflow = math.sub(clampedRaw, stage2Start);
    let normalizedOverflow = math.div(stage2Overflow, math.max(1, stage2Curve));
    return math.add(stage1Value, math.mul(stage2Scale, math.log10(math.add(1, normalizedOverflow))));
}

function getEffectiveFlowForBonuses() {
    return applyMetaTwoStageSoftcap(
        prestige.yoga.flow,
        FLOW_EFFECTIVE_SOFTCAP_START,
        FLOW_EFFECTIVE_SOFTCAP_SCALE,
        FLOW_EFFECTIVE_SOFTCAP_STAGE2_START,
        FLOW_EFFECTIVE_SOFTCAP_STAGE2_SCALE,
        FLOW_EFFECTIVE_SOFTCAP_STAGE2_CURVE
    );
}

function getEffectiveConfidenceForBonuses() {
    return applyMetaTwoStageSoftcap(
        prestige.bw.confidence,
        CONFIDENCE_EFFECTIVE_SOFTCAP_START,
        CONFIDENCE_EFFECTIVE_SOFTCAP_SCALE,
        CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_START,
        CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_SCALE,
        CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_CURVE
    );
}

function getEffectiveLeadershipForBonuses() {
    return applyMetaTwoStageSoftcap(
        prestige.lifting.leadership,
        LEADERSHIP_EFFECTIVE_SOFTCAP_START,
        LEADERSHIP_EFFECTIVE_SOFTCAP_SCALE,
        LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_START,
        LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_SCALE,
        LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_CURVE
    );
}

function getEffectivePaceForBonuses() {
    return applyMetaTwoStageSoftcap(
        prestige.cardio.pace,
        PACE_EFFECTIVE_SOFTCAP_START,
        PACE_EFFECTIVE_SOFTCAP_SCALE,
        PACE_EFFECTIVE_SOFTCAP_STAGE2_START,
        PACE_EFFECTIVE_SOFTCAP_STAGE2_SCALE,
        PACE_EFFECTIVE_SOFTCAP_STAGE2_CURVE
    );
}

function formatTooltipPercentValue(decimalValue) {
    let percentValue = math.mul(decimalValue, 100);
    if (percentValue < 1000000) {
        return percentValue.toFixed(2);
    }
    return math.format(percentValue, 3);
}

function formatTooltipMultiplierValue(value) {
    if (value < 1000000) {
        return value.toFixed(4);
    }
    return math.format(value, 3);
}

function updateMetaPointTooltips() {
    let confidenceBoostPerPoint = math.mul(
        math.add(prestige.bw.confidenceBoost, getConfidenceShopBoostBonus()),
        getRepeatingConfidencePerPointMultiplier()
    );
    let confidenceMultiplier = getConfidenceMultiplier();
    let confidenceTotalBoost = math.max(0, math.sub(confidenceMultiplier, 1));
    let effectiveConfidence = getEffectiveConfidenceForBonuses();
    let confidenceTitle = "Confidence boosts gym progression and persists through prestiges." +
        "<br />Effective confidence: " + formatTooltipMultiplierValue(effectiveConfidence) + " (diminishing returns after " + CONFIDENCE_EFFECTIVE_SOFTCAP_START + ", stronger after " + CONFIDENCE_EFFECTIVE_SOFTCAP_STAGE2_START + ")" +
        "<br />Current per point: +" + formatTooltipPercentValue(confidenceBoostPerPoint) + "%" +
        "<br />Current total boost: +" + formatTooltipPercentValue(confidenceTotalBoost) + "% (" + formatTooltipMultiplierValue(confidenceMultiplier) + "x)";
    $("#confidenceTooltip").prop("title", confidenceTitle).tooltip("_fixTitle");

    let leadershipBoostPerPoint = math.mul(
        math.add(prestige.lifting.leadershipBoost, getLeadershipShopBoostBonus()),
        getRepeatingLeadershipPerPointMultiplier()
    );
    let leadershipMultiplier = getLeadershipMultiplier();
    let leadershipTotalBoost = math.max(0, math.sub(leadershipMultiplier, 1));
    let effectiveLeadership = getEffectiveLeadershipForBonuses();
    let leadershipTitle = "Leadership boosts stat gain and persists through prestiges." +
        "<br />Effective leadership: " + formatTooltipMultiplierValue(effectiveLeadership) + " (diminishing returns after " + LEADERSHIP_EFFECTIVE_SOFTCAP_START + ", stronger after " + LEADERSHIP_EFFECTIVE_SOFTCAP_STAGE2_START + ")" +
        "<br />Current per point: +" + formatTooltipPercentValue(leadershipBoostPerPoint) + "%" +
        "<br />Current total boost: +" + formatTooltipPercentValue(leadershipTotalBoost) + "% (" + formatTooltipMultiplierValue(leadershipMultiplier) + "x)";
    $("#leadershipTooltip").prop("title", leadershipTitle).tooltip("_fixTitle");

    if ($("#flowTooltip").length > 0) {
        let flowSpeedPerPoint = getFlowPerPointBonus();
        let flowMaxPerPoint = math.mul(flowSpeedPerPoint, FLOW_MAX_ENERGY_TO_SPEED_RATIO);
        let flowRecoveryPerPoint = math.mul(flowSpeedPerPoint, FLOW_RECOVERY_TO_SPEED_RATIO);
        let effectiveFlow = getEffectiveFlowForBonuses();
        let flowSpeedMultiplier = getFlowMultiplier();
        let flowMaxMultiplier = getFlowMaxEnergyMultiplier();
        let flowRecoveryMultiplier = getFlowEnergyRecoveryMultiplier();
        let flowTitle = "Flow boosts all gym progression and persists through prestiges." +
            "<br />Effective Flow: " + formatTooltipMultiplierValue(effectiveFlow) + " (diminishing returns after " + FLOW_EFFECTIVE_SOFTCAP_START + ", stronger after " + FLOW_EFFECTIVE_SOFTCAP_STAGE2_START + ")" +
            "<br />Per point action speed: +" + formatTooltipPercentValue(flowSpeedPerPoint) + "%" +
            "<br />Per point max energy: +" + formatTooltipPercentValue(flowMaxPerPoint) + "%" +
            "<br />Per point energy recovery: +" + formatTooltipPercentValue(flowRecoveryPerPoint) + "%" +
            "<br />Current action speed: +" + formatTooltipPercentValue(math.max(0, math.sub(flowSpeedMultiplier, 1))) + "% (" + formatTooltipMultiplierValue(flowSpeedMultiplier) + "x)" +
            "<br />Current max energy: +" + formatTooltipPercentValue(math.max(0, math.sub(flowMaxMultiplier, 1))) + "% (" + formatTooltipMultiplierValue(flowMaxMultiplier) + "x)" +
            "<br />Current energy recovery: +" + formatTooltipPercentValue(math.max(0, math.sub(flowRecoveryMultiplier, 1))) + "% (" + formatTooltipMultiplierValue(flowRecoveryMultiplier) + "x)";
        $("#flowTooltip").prop("title", flowTitle).tooltip("_fixTitle");
    }

    if ($("#paceTooltip").length > 0) {
        let paceSpeedPerPoint = getPacePerPointBonus();
        let paceMaxPerPoint = math.mul(paceSpeedPerPoint, PACE_MAX_ENERGY_TO_SPEED_RATIO);
        let paceRecoveryPerPoint = math.mul(paceSpeedPerPoint, PACE_RECOVERY_TO_SPEED_RATIO);
        let effectivePace = getEffectivePaceForBonuses();
        let paceSpeedMultiplier = getPaceMultiplier();
        let paceMaxMultiplier = getPaceMaxEnergyMultiplier();
        let paceRecoveryMultiplier = getPaceEnergyRecoveryMultiplier();
        let paceTitle = "Pace rewards long cardio runs and persists through prestiges." +
            "<br />Effective Pace: " + formatTooltipMultiplierValue(effectivePace) + " (diminishing returns after " + PACE_EFFECTIVE_SOFTCAP_START + ", stronger after " + PACE_EFFECTIVE_SOFTCAP_STAGE2_START + ")" +
            "<br />Per point action speed: +" + formatTooltipPercentValue(paceSpeedPerPoint) + "%" +
            "<br />Per point max energy: +" + formatTooltipPercentValue(paceMaxPerPoint) + "%" +
            "<br />Per point energy recovery: +" + formatTooltipPercentValue(paceRecoveryPerPoint) + "%" +
            "<br />Current action speed: +" + formatTooltipPercentValue(math.max(0, math.sub(paceSpeedMultiplier, 1))) + "% (" + formatTooltipMultiplierValue(paceSpeedMultiplier) + "x)" +
            "<br />Current max energy: +" + formatTooltipPercentValue(math.max(0, math.sub(paceMaxMultiplier, 1))) + "% (" + formatTooltipMultiplierValue(paceMaxMultiplier) + "x)" +
            "<br />Current energy recovery: +" + formatTooltipPercentValue(math.max(0, math.sub(paceRecoveryMultiplier, 1))) + "% (" + formatTooltipMultiplierValue(paceRecoveryMultiplier) + "x)";
        $("#paceTooltip").prop("title", paceTitle).tooltip("_fixTitle");
    }
}

function hasConfidenceShopUpgrade(upgradeId) {
    return hasPurchasedPrestigeUpgrade(prestige.bw.confidenceUpgrades, upgradeId);
}

function hasLeadershipShopUpgrade(upgradeId) {
    return hasPurchasedPrestigeUpgrade(prestige.lifting.leadershipUpgrades, upgradeId);
}

function hasFlowShopUpgrade(upgradeId) {
    return hasPurchasedPrestigeUpgrade(prestige.yoga.flowUpgrades, upgradeId);
}

function hasPaceShopUpgrade(upgradeId) {
    return hasPurchasedPrestigeUpgrade(prestige.cardio.paceUpgrades, upgradeId);
}

function getConfidenceShopBoostBonus() {
    return hasConfidenceShopUpgrade(0) ? 0.02 : 0;
}

function getLeadershipShopBoostBonus() {
    return hasLeadershipShopUpgrade(0) ? 0.02 : 0;
}

function getFlowShopBoostBonus() {
    return hasFlowShopUpgrade(0) ? 0.001 : 0;
}

function getPaceShopBoostBonus() {
    return hasPaceShopUpgrade(0) ? 0.001 : 0;
}

function getRepeatingConfidencePerPointMultiplier() {
    let def = getRepeatingUpgradeDefinition("confidence", "confidence_sharp_focus");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingLeadershipPerPointMultiplier() {
    let def = getRepeatingUpgradeDefinition("leadership", "leadership_command_stack");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingGlobalActionSpeedMultiplier() {
    let def = getRepeatingUpgradeDefinition("global", "global_franchise_tempo");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingGlobalRecoveryMultiplier() {
    let def = getRepeatingUpgradeDefinition("global", "global_recovery_grid");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingGlobalGymEconomyMultiplier() {
    let def = getRepeatingUpgradeDefinition("global", "global_market_engine");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingBodyweightActionSpeedMultiplier() {
    let def = getRepeatingUpgradeDefinition("bodyweight", "bodyweight_street_tempo");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingLiftingOverflowMultiplier() {
    let def = getRepeatingUpgradeDefinition("lifting", "lifting_rep_reclamation");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingYogaMaxEnergyMultiplier() {
    let def = getRepeatingUpgradeDefinition("yoga", "yoga_studio_capacity");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingYogaRecoveryMultiplier() {
    let def = getRepeatingUpgradeDefinition("yoga", "yoga_studio_capacity");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    let level = normalizeRepeatingLevel(state.level);
    return applyModifierPipeline(1, {
        additive: [math.mul(level, YOGA_REPEATABLE_RECOVERY_STEP)],
    });
}

function getRepeatingFlowEffectMultiplier() {
    let def = getRepeatingUpgradeDefinition("flow", "flow_resonance_stack");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingCardioActionSpeedMultiplier() {
    let def = getRepeatingUpgradeDefinition("cardio", "cardio_endurance_engine");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getRepeatingCardioMaxEnergyMultiplier() {
    let def = getRepeatingUpgradeDefinition("cardio", "cardio_endurance_engine");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    let level = normalizeRepeatingLevel(state.level);
    return applyModifierPipeline(1, {
        additive: [math.mul(level, 0.008)],
    });
}

function getRepeatingPaceEffectMultiplier() {
    let def = getRepeatingUpgradeDefinition("pace", "pace_negative_split");
    if (def == null) {
        return 1;
    }
    let state = getRepeatingUpgradeState(def.id);
    return getRepeatingUpgradeEffect(def, state.level);
}

function getConfidenceShopMemberGrowthMultiplier() {
    return hasConfidenceShopUpgrade(1) ? 1.28 : 1;
}

function getConfidenceShopTrainingMultiplier() {
    return hasConfidenceShopUpgrade(2) ? 1.25 : 1;
}

function getConfidenceShopGangMultiplier() {
    return hasConfidenceShopUpgrade(3) ? 1.35 : 1;
}

function getConfidenceShopMinigamePointMultiplier() {
    return hasConfidenceShopUpgrade(4) ? 1.5 : 1;
}

function getLeadershipShopCompetitionMultiplier() {
    return 1;
}

function getLeadershipShopInfluenceMultiplier() {
    return hasLeadershipShopUpgrade(2) ? 1.25 : 1;
}

function getLeadershipShopCampaignGrowthMultiplier() {
    return hasLeadershipShopUpgrade(2) ? 1.25 : 1;
}

function getLeadershipShopMemberMoneyMultiplier() {
    return hasLeadershipShopUpgrade(3) ? 1.15 : 1;
}

function getLeadershipShopMinigamePointMultiplier() {
    return hasLeadershipShopUpgrade(4) ? 1.5 : 1;
}

function getFlowShopEnergyMultiplier() {
    return hasFlowShopUpgrade(1) ? 1.2 : 1;
}

function getFlowShopActionSpeedMultiplier() {
    return hasFlowShopUpgrade(2) ? 1.15 : 1;
}

function getFlowShopBreathProgressMultiplier() {
    return hasFlowShopUpgrade(3) ? 1.3 : 1;
}

function getFlowShopPerfectAnchorMultiplier() {
    return hasFlowShopUpgrade(4) ? 1.5 : 1;
}

function getPaceShopRecoveryMultiplier() {
    return hasPaceShopUpgrade(1) ? 1.2 : 1;
}

function getPaceShopActionSpeedMultiplier() {
    return hasPaceShopUpgrade(2) ? 1.12 : 1;
}

function getPaceShopIntervalMultiplier() {
    return hasPaceShopUpgrade(3) ? 1.35 : 1;
}

function getPaceShopRewardMultiplier() {
    return hasPaceShopUpgrade(4) ? 1.5 : 1;
}

function getConfidencePerGangAbsorb() {
    return math.mul(0.1, getConfidenceShopMinigamePointMultiplier());
}

function getLeadershipPerWorldConference() {
    return math.mul(0.1, getLeadershipShopMinigamePointMultiplier());
}

function ensureLiftingAcademyState() {
    if (lifting.comps == null || typeof lifting.comps !== "object") {
        lifting.comps = {};
    }

    if (lifting.comps.academy == null || typeof lifting.comps.academy !== "object") {
        lifting.comps.academy = JSON.parse(JSON.stringify(baseLifting.comps.academy));
    }

    let academy = lifting.comps.academy;
    if (academy.camp == null || typeof academy.camp !== "object") {
        academy.camp = JSON.parse(JSON.stringify(baseLifting.comps.academy.camp));
    }
    if (!Array.isArray(academy.upgrades)) {
        academy.upgrades = JSON.parse(JSON.stringify(baseLifting.comps.academy.upgrades));
    }
    if (academy.repeatables == null || typeof academy.repeatables !== "object") {
        academy.repeatables = JSON.parse(JSON.stringify(baseLifting.comps.academy.repeatables));
    }

    academy.credits = sanitizeResourceValue("academy_state", "lifting.comps.academy.credits", academy.credits);
    academy.totalCreditsEarned = sanitizeResourceValue("academy_state", "lifting.comps.academy.totalCreditsEarned", academy.totalCreditsEarned);
    academy.seasonsCompleted = math.floor(math.max(0, sanitizeResourceValue("academy_state", "lifting.comps.academy.seasonsCompleted", academy.seasonsCompleted)));
    academy.seasonsCompleted = math.min(academy.seasonsCompleted, getAcademySeasonCap());
    academy.phase = math.floor(math.max(0, math.min(3, sanitizeResourceValue("academy_state", "lifting.comps.academy.phase", academy.phase))));
    academy.progress = sanitizeResourceValue("academy_state", "lifting.comps.academy.progress", academy.progress);
    academy.phaseTarget = math.max(1, getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted));
    academy.progressBoost = math.max(1, sanitizeResourceValue("academy_state", "lifting.comps.academy.progressBoost", academy.progressBoost));
    academy.unlockGrantApplied = academy.unlockGrantApplied === true;
    academy.repeatables.campPointBoostLevel = math.max(
        0,
        math.floor(
            sanitizeResourceValue(
                "academy_state",
                "lifting.comps.academy.repeatables.campPointBoostLevel",
                academy.repeatables.campPointBoostLevel
            )
        )
    );

    academy.camp.totalPoints = getAcademyCampTotalPoints();
    academy.camp.unspentPoints = math.max(0, math.floor(sanitizeResourceValue("academy_state", "lifting.comps.academy.camp.unspentPoints", academy.camp.unspentPoints)));
    academy.camp.strength = math.max(0, math.floor(sanitizeResourceValue("academy_state", "lifting.comps.academy.camp.strength", academy.camp.strength)));
    academy.camp.technique = math.max(0, math.floor(sanitizeResourceValue("academy_state", "lifting.comps.academy.camp.technique", academy.camp.technique)));
    academy.camp.recovery = math.max(0, math.floor(sanitizeResourceValue("academy_state", "lifting.comps.academy.camp.recovery", academy.camp.recovery)));
    academy.camp.promotion = math.max(0, math.floor(sanitizeResourceValue("academy_state", "lifting.comps.academy.camp.promotion", academy.camp.promotion)));
    academy.camp.autoNextTrackIndex = math.max(
        0,
        math.min(
            3,
            math.floor(
                sanitizeResourceValue(
                    "academy_state",
                    "lifting.comps.academy.camp.autoNextTrackIndex",
                    academy.camp.autoNextTrackIndex
                )
            )
        )
    );

    let allocated = academy.camp.strength + academy.camp.technique + academy.camp.recovery + academy.camp.promotion;
    if (allocated > academy.camp.totalPoints) {
        let overflow = allocated - academy.camp.totalPoints;
        academy.camp.promotion = math.max(0, academy.camp.promotion - overflow);
        allocated = academy.camp.strength + academy.camp.technique + academy.camp.recovery + academy.camp.promotion;
    }
    academy.camp.unspentPoints = math.max(0, academy.camp.totalPoints - allocated);

    for (let i = 0; i < academy.upgrades.length; i++) {
        if (academy.upgrades[i].isPurchased !== true) {
            academy.upgrades[i].isPurchased = false;
        }
    }

    if (academy.seasonsCompleted >= getAcademySeasonCap()) {
        academy.phase = 3;
        academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
        academy.progress = academy.phaseTarget;
    }
    else if (academy.progress > academy.phaseTarget) {
        academy.progress = academy.phaseTarget;
    }

    return academy;
}

function getAcademyPhaseName(phase) {
    switch (phase) {
        case 0:
            return "Base";
        case 1:
            return "Build";
        case 2:
            return "Peak";
        case 3:
            return "Meet";
        default:
            return "Base";
    }
}

function getAcademyPhaseTarget(phase, seasonsCompleted) {
    let baseByPhase = [95, 135, 185, 245];
    let normalizedPhase = math.max(0, math.min(3, math.floor(phase)));
    let completed = math.max(0, math.floor(math.evaluate(seasonsCompleted)));
    let baseTarget = baseByPhase[normalizedPhase];
    let linearRamp = math.mul(completed, 9);
    let lateRamp = completed > 6 ? math.mul(math.pow(completed - 6, 2), 4) : 0;
    return math.add(baseTarget, math.add(linearRamp, lateRamp));
}

function calculateLegacyCompetitionAcademyGrant() {
    let weighted = 0;
    weighted = math.add(weighted, lifting.comps.competitions.current || 0);
    weighted = math.add(weighted, math.mul(lifting.comps.conferences.current || 0, 5));
    weighted = math.add(weighted, math.mul(lifting.comps.regionalConferences.current || 0, 25));
    weighted = math.add(weighted, math.mul(lifting.comps.stateConferences.current || 0, 125));
    weighted = math.add(weighted, math.mul(lifting.comps.nationalConferences.current || 0, 625));
    weighted = math.add(weighted, math.mul(lifting.comps.worldConferences.current || 0, 3125));

    if (weighted <= 0) {
        return 0;
    }

    let grant = math.floor(math.mul(math.log10(math.add(weighted, 1)), 22));
    return math.max(0, grant);
}

function zeroLegacyCompetitionState() {
    lifting.comps.competitions.current = 0;
    lifting.comps.conferences.current = 0;
    lifting.comps.regionalConferences.current = 0;
    lifting.comps.stateConferences.current = 0;
    lifting.comps.nationalConferences.current = 0;
    lifting.comps.worldConferences.current = 0;
}

function migrateLegacyCompetitionToAcademyCredits() {
    ensureLiftingAcademyState();
    if (checks.liftingAcademyMigrationV1) {
        return;
    }

    let grant = calculateLegacyCompetitionAcademyGrant();
    if (grant > 0) {
        lifting.comps.academy.credits = math.add(lifting.comps.academy.credits, grant);
        lifting.comps.academy.totalCreditsEarned = math.add(lifting.comps.academy.totalCreditsEarned, grant);
    }

    zeroLegacyCompetitionState();
    checks.liftingAcademyMigrationV1 = true;
}

function hasAcademyUpgrade(upgradeId) {
    let academy = ensureLiftingAcademyState();
    for (let i = 0; i < academy.upgrades.length; i++) {
        if (academy.upgrades[i].id === upgradeId && academy.upgrades[i].isPurchased) {
            return true;
        }
    }
    return false;
}

function getAcademySeasonCap() {
    return 10;
}

function getAcademyCampPointBoostLevel() {
    if (lifting == null || lifting.comps == null || lifting.comps.academy == null) {
        return 0;
    }
    let repeatables = lifting.comps.academy.repeatables;
    if (repeatables == null || typeof repeatables !== "object") {
        return 0;
    }
    return math.max(0, math.floor(math.evaluate(repeatables.campPointBoostLevel || 0)));
}

function getAcademyCampPointBoostCost(level) {
    let currentLevel = level == null ? getAcademyCampPointBoostLevel() : math.max(0, math.floor(math.evaluate(level)));
    let geometric = math.pow(ACADEMY_CAMP_POINT_REPEATABLE_GROWTH, currentLevel);
    let curve = math.add(1, math.mul(currentLevel, ACADEMY_CAMP_POINT_REPEATABLE_CURVE));
    return math.max(1, math.floor(math.mul(ACADEMY_CAMP_POINT_REPEATABLE_BASE_COST, math.mul(geometric, curve))));
}

function getAcademyCampPointRepeatableBonus() {
    return getAcademyCampPointBoostLevel();
}

function getLeadershipShopAcademyCampPointBonus() {
    if (prestige == null || prestige.lifting == null || !Array.isArray(prestige.lifting.leadershipUpgrades)) {
        return 0;
    }
    return hasLeadershipShopUpgrade(1) ? 4 : 0;
}

function getAcademyCampTotalPoints() {
    let basePoints = 10;
    if (baseLifting != null && baseLifting.comps != null && baseLifting.comps.academy != null && baseLifting.comps.academy.camp != null) {
        basePoints = math.max(0, math.floor(math.evaluate(baseLifting.comps.academy.camp.totalPoints)));
    }
    return math.max(
        0,
        math.floor(
            math.add(
                basePoints,
                math.add(getLeadershipShopAcademyCampPointBonus(), getAcademyCampPointRepeatableBonus())
            )
        )
    );
}

function getAcademyCampStrengthMultiplier() {
    let academy = ensureLiftingAcademyState();
    return math.add(1, math.mul(Math.sqrt(math.evaluate(academy.camp.strength)), 0.125));
}

function getAcademyCampTechniqueCostMultiplier() {
    let academy = ensureLiftingAcademyState();
    let reduction = math.mul(Math.sqrt(math.evaluate(academy.camp.technique)), 0.06);
    return math.max(0.75, math.sub(1, reduction));
}

function getAcademyCampRecoveryActionSpeedMultiplier() {
    let academy = ensureLiftingAcademyState();
    return math.add(1, math.mul(Math.sqrt(math.evaluate(academy.camp.recovery)), 0.05));
}

function getAcademyCampPromotionCreditMultiplier() {
    let academy = ensureLiftingAcademyState();
    return math.add(1, math.mul(Math.sqrt(math.evaluate(academy.camp.promotion)), 0.07));
}

function getAcademyCampPromotionLeadershipMultiplier() {
    let academy = ensureLiftingAcademyState();
    return math.add(1, math.mul(Math.sqrt(math.evaluate(academy.camp.promotion)), 0.06));
}

function getAcademyUpgradeProgressMultiplier() {
    return hasAcademyUpgrade(0) ? 1.3 : 1;
}

function getAcademyUpgradeRecoveryMultiplier() {
    return hasAcademyUpgrade(1) ? 1.18 : 1;
}

function getAcademyUpgradeCreditRewardMultiplier() {
    return hasAcademyUpgrade(2) ? 1.25 : 1;
}

function getAcademyUpgradeLeadershipRewardMultiplier() {
    return 1;
}

function getAcademyUpgradeSponsorProgressMultiplier() {
    if (!hasAcademyUpgrade(3)) {
        return 1;
    }
    let statsProgressMulti = math.add(1, math.mul(math.log10(math.add(getTotalStats(), 1)), 0.28));
    return math.min(3.2, statsProgressMulti);
}

function getAcademyExperienceProgressMultiplier() {
    let liftingRuns = math.max(0, math.floor(math.evaluate(prestige.lifting.total || 0)));
    let completedAfterUnlock = math.max(0, math.sub(liftingRuns, 1));
    let earlyRamp = math.mul(math.min(completedAfterUnlock, 6), 0.11);
    let lateRamp = math.mul(math.max(0, math.sub(completedAfterUnlock, 6)), 0.053);
    return math.min(1.35, math.add(0.16, math.add(earlyRamp, lateRamp)));
}

function getAcademySeasonPacingMultiplier() {
    let pacing = math.max(0, getLayer1PacingMultiplier());
    let eased = math.pow(pacing, 0.45);
    return math.max(0.72, eased);
}

function getAcademyUpgradeEffectiveCost(upgrade) {
    if (upgrade == null) {
        return 0;
    }
    let adjusted = math.mul(math.evaluate(upgrade.cost), getAcademyCampTechniqueCostMultiplier());
    return math.max(1, math.floor(adjusted));
}

function getAcademyEffectiveActionSpeedMultiplier() {
    if (checks.gymType !== 1) {
        return 1;
    }
    return math.mul(getAcademyCampRecoveryActionSpeedMultiplier(), getAcademyUpgradeRecoveryMultiplier());
}

function adjustAcademyCampAllocation(track, delta) {
    let academy = ensureLiftingAcademyState();
    if (academy.camp[track] == null) {
        return;
    }

    if (delta > 0) {
        if (academy.camp.unspentPoints <= 0) {
            return;
        }
        academy.camp[track] += 1;
        academy.camp.unspentPoints -= 1;
    }
    else if (delta < 0) {
        if (academy.camp[track] <= 0) {
            return;
        }
        academy.camp[track] -= 1;
        academy.camp.unspentPoints += 1;
    }

    academy.autoCampConfigured = true;
}

function resetAcademyCampAllocation() {
    let academy = ensureLiftingAcademyState();
    academy.camp.strength = 0;
    academy.camp.technique = 0;
    academy.camp.recovery = 0;
    academy.camp.promotion = 0;
    academy.camp.unspentPoints = academy.camp.totalPoints;
    academy.camp.autoNextTrackIndex = 0;
    academy.autoCampConfigured = false;
}

function academyCampPointBoostClick() {
    let academy = ensureLiftingAcademyState();
    let currentLevel = getAcademyCampPointBoostLevel();
    let cost = getAcademyCampPointBoostCost(currentLevel);
    let currentCredits = math.evaluate(academy.credits);
    if (currentCredits < cost) {
        return;
    }

    academy.credits = math.sub(currentCredits, cost);
    academy.repeatables.campPointBoostLevel = currentLevel + 1;
    academy.autoCampConfigured = false;
    ensureLiftingAcademyState();
    writeCompInfo();
}

function getAcademySeasonProgressPerSecond() {
    let academy = ensureLiftingAcademyState();
    let baseProgress = math.add(0.56, math.mul(math.log10(math.add(getLiftingTotalWeight(), 1)), 0.16));
    return applyModifierPipeline(baseProgress, {
        multiplicative: [
            getAcademyExperienceProgressMultiplier(),
            getAcademyCampStrengthMultiplier(),
            getAcademyUpgradeProgressMultiplier(),
            getAcademyUpgradeSponsorProgressMultiplier(),
            academy.progressBoost,
        ],
        layer: [getAcademySeasonPacingMultiplier()],
    });
}

function getAcademyPassiveCreditsPerSecond() {
    if (!hasPurchasedPrestigeUpgrade(prestige.lifting.upgrades, 0)) {
        return 0;
    }

    let baseCredits = math.add(0.02, math.mul(math.log10(math.add(getLiftingTotalWeight(), 1)), 0.005));
    return applyModifierPipeline(baseCredits, {
        multiplicative: [getAcademyCampPromotionCreditMultiplier()],
        layer: [getAcademySeasonPacingMultiplier()],
    });
}

function getAcademyMeetCreditReward() {
    let academy = ensureLiftingAcademyState();
    let base = math.add(12, math.mul(math.log10(math.add(getLiftingTotalWeight(), 1)), 9));
    base = math.add(base, math.mul(academy.seasonsCompleted, 1.75));
    return applyModifierPipeline(base, {
        multiplicative: [
            getAcademyCampPromotionCreditMultiplier(),
            getAcademyUpgradeCreditRewardMultiplier(),
        ],
    });
}

function getAcademyMeetLeadershipReward() {
    let base = getLeadershipPerWorldConference();
    return applyModifierPipeline(base, {
        multiplicative: [
            getAcademyCampPromotionLeadershipMultiplier(),
            getAcademyUpgradeLeadershipRewardMultiplier(),
        ],
    });
}

function advanceAcademySeason(seconds) {
    if (checks.gymType !== 1) {
        return;
    }

    let academy = ensureLiftingAcademyState();
    let seasonCap = getAcademySeasonCap();
    if (academy.seasonsCompleted >= seasonCap) {
        academy.seasonsCompleted = seasonCap;
        academy.phase = 3;
        academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
        academy.progress = academy.phaseTarget;
        return;
    }

    let ticks = math.max(0, Math.floor(seconds));
    if (ticks <= 0) {
        return;
    }

    for (let i = 0; i < ticks; i++) {
        if (academy.seasonsCompleted >= seasonCap) {
            break;
        }
        let passiveCredits = getAcademyPassiveCreditsPerSecond();
        if (passiveCredits > 0) {
            academy.credits = math.add(academy.credits, passiveCredits);
            academy.totalCreditsEarned = math.add(academy.totalCreditsEarned, passiveCredits);
        }
        academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
        let progressGain = getAcademySeasonProgressPerSecond();
        academy.progress = math.add(academy.progress, progressGain);

        while (academy.progress >= academy.phaseTarget) {
            let overflow = math.max(0, math.sub(academy.progress, academy.phaseTarget));
            if (academy.phase < 3) {
                academy.phase += 1;
                academy.progress = overflow;
                academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
            }
            else {
                let rewardCredits = getAcademyMeetCreditReward();
                academy.credits = math.add(academy.credits, rewardCredits);
                academy.totalCreditsEarned = math.add(academy.totalCreditsEarned, rewardCredits);
                prestige.lifting.leadership = math.add(prestige.lifting.leadership, getAcademyMeetLeadershipReward());
                academy.seasonsCompleted += 1;
                if (academy.seasonsCompleted >= seasonCap) {
                    academy.seasonsCompleted = seasonCap;
                    academy.phase = 3;
                    academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
                    academy.progress = academy.phaseTarget;
                    break;
                }
                academy.phase = 0;
                academy.progress = overflow;
                academy.phaseTarget = getAcademyPhaseTarget(academy.phase, academy.seasonsCompleted);
            }
        }
    }
}

function academyUpgradeClick(upgradeId) {
    let academy = ensureLiftingAcademyState();
    let targetId = math.floor(math.evaluate(upgradeId));
    for (let i = 0; i < academy.upgrades.length; i++) {
        let upgrade = academy.upgrades[i];
        if (upgrade.id !== targetId) {
            continue;
        }
        let currentCredits = math.evaluate(academy.credits);
        let cost = getAcademyUpgradeEffectiveCost(upgrade);
        if (upgrade.isPurchased || currentCredits < cost) {
            return;
        }
        upgrade.isPurchased = true;
        academy.credits = math.sub(currentCredits, cost);
        updateAcademyUpgradeButtons();
        return;
    }
}

function updateAcademyUpgradeButtons() {
    let academy = ensureLiftingAcademyState();
    if ($("#academyUpgrades").length === 0) {
        return;
    }

    for (let i = 0; i < academy.upgrades.length; i++) {
        let upgrade = academy.upgrades[i];
        let wrapperId = "academyUpgrade" + upgrade.id;
        let buttonId = "academyUpgradeBtn" + upgrade.id;
        let descId = "academyUpgradeDesc" + upgrade.id;

        if ($("#" + wrapperId).length === 0) {
            $("#academyUpgrades").append(
                "<div id='" + wrapperId + "'>" +
                "<button type='button' id='" + buttonId + "' class='btn btn-block btn-secondary disabled' onclick='academyUpgradeClick(" + upgrade.id + ")'></button>" +
                "<p id='" + descId + "'></p>" +
                "</div>"
            );
        }

        let currentCredits = math.evaluate(academy.credits);
        let cost = getAcademyUpgradeEffectiveCost(upgrade);
        let affordable = currentCredits >= cost;
        let buttonLabel = upgrade.isPurchased ? (upgrade.name + " (Purchased)") : upgrade.name;

        $("#" + buttonId)
            .html(buttonLabel)
            .removeClass("btn-primary btn-secondary btn-success disabled")
            .addClass(upgrade.isPurchased ? "btn-success disabled" : (affordable ? "btn-primary" : "btn-secondary disabled"))
            .prop("disabled", upgrade.isPurchased || !affordable);

        $("#" + descId).html(
            "<strong>Cost: " + (cost < 1000000 ? cost.toFixed(2) : math.format(cost, 3)) + " Academy Credits</strong> - " + upgrade.desc
        );
    }
}

function updateFlowUpgradeButtons() {
    if ($("#flowUpgrades").length === 0) {
        return;
    }

    for (let i = 0; i < prestige.yoga.flowUpgrades.length; i++) {
        let upgrade = prestige.yoga.flowUpgrades[i];
        let wrapperId = "flowUpgrade" + upgrade.id;
        let buttonId = "flowUpgradeBtn" + upgrade.id;
        let descId = "flowUpgradeDesc" + upgrade.id;

        if ($("#" + wrapperId).length === 0) {
            $("#flowUpgrades").append(
                "<div id='" + wrapperId + "'>" +
                "<button type='button' id='" + buttonId + "' class='btn btn-block btn-secondary disabled' onclick='flowUpgradeClick(this, false)'></button>" +
                "<p id='" + descId + "'></p>" +
                "</div>"
            );
        }

        let currentFlow = math.evaluate(prestige.yoga.flow);
        let affordable = currentFlow >= upgrade.cost;
        let buttonLabel = upgrade.isPurchased ? (upgrade.name + " (Purchased)") : upgrade.name;

        $("#" + buttonId)
            .html(buttonLabel)
            .removeClass("btn-primary btn-secondary btn-success disabled")
            .addClass(upgrade.isPurchased ? "btn-success disabled" : (affordable ? "btn-primary" : "btn-secondary disabled"))
            .prop("disabled", upgrade.isPurchased || !affordable);

        $("#" + descId).html(
            "<strong>Cost: " + (upgrade.cost < 1000000 ? upgrade.cost.toFixed(2) : math.format(upgrade.cost, 3)) + " Flow</strong> - " + upgrade.desc
        );
    }

    updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
}

function updatePaceUpgradeButtons() {
    if ($("#paceUpgrades").length === 0) {
        return;
    }

    for (let i = 0; i < prestige.cardio.paceUpgrades.length; i++) {
        let upgrade = prestige.cardio.paceUpgrades[i];
        let wrapperId = "paceUpgrade" + upgrade.id;
        let buttonId = "paceUpgradeBtn" + upgrade.id;
        let descId = "paceUpgradeDesc" + upgrade.id;

        if ($("#" + wrapperId).length === 0) {
            $("#paceUpgrades").append(
                "<div id='" + wrapperId + "'>" +
                "<button type='button' id='" + buttonId + "' class='btn btn-block btn-secondary disabled' onclick='paceUpgradeClick(this, false)'></button>" +
                "<p id='" + descId + "'></p>" +
                "</div>"
            );
        }

        let currentPace = math.evaluate(prestige.cardio.pace);
        let affordable = currentPace >= upgrade.cost;
        let buttonLabel = upgrade.isPurchased ? (upgrade.name + " (Purchased)") : upgrade.name;

        $("#" + buttonId)
            .html(buttonLabel)
            .removeClass("btn-primary btn-secondary btn-success disabled")
            .addClass(upgrade.isPurchased ? "btn-success disabled" : (affordable ? "btn-primary" : "btn-secondary disabled"))
            .prop("disabled", upgrade.isPurchased || !affordable);

        $("#" + descId).html(
            "<strong>Cost: " + (upgrade.cost < 1000000 ? upgrade.cost.toFixed(2) : math.format(upgrade.cost, 3)) + " Pace</strong> - " + upgrade.desc
        );
    }

    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
}

function autoConfigureAcademyCamp() {
    let academy = ensureLiftingAcademyState();
    if (academy.autoCampConfigured || academy.camp.unspentPoints <= 0) {
        return;
    }

    let order = ["strength", "technique", "recovery", "promotion"];
    let nextIndex = math.max(0, math.min(order.length - 1, math.floor(math.evaluate(academy.camp.autoNextTrackIndex || 0))));
    while (academy.camp.unspentPoints > 0) {
        let minValue = Math.min(
            academy.camp.strength,
            academy.camp.technique,
            academy.camp.recovery,
            academy.camp.promotion
        );
        let selectedOffset = 0;
        for (let offset = 0; offset < order.length; offset++) {
            let idx = (nextIndex + offset) % order.length;
            let trackName = order[idx];
            if (academy.camp[trackName] === minValue) {
                selectedOffset = offset;
                break;
            }
        }
        let selectedIndex = (nextIndex + selectedOffset) % order.length;
        let track = order[selectedIndex];
        academy.camp[track] += 1;
        academy.camp.unspentPoints -= 1;
        nextIndex = (selectedIndex + 1) % order.length;
    }
    academy.camp.autoNextTrackIndex = nextIndex;
    academy.autoCampConfigured = true;
}

function autoBuyAcademyUpgrades() {
    let academy = ensureLiftingAcademyState();
    let hasCoreProgressUpgrades = hasAcademyUpgrade(0) && hasAcademyUpgrade(1);
    for (let i = 0; i < academy.upgrades.length; i++) {
        let cost = getAcademyUpgradeEffectiveCost(academy.upgrades[i]);
        if (!academy.upgrades[i].isPurchased && math.evaluate(academy.credits) >= cost) {
            academyUpgradeClick(academy.upgrades[i].id);
        }
    }

    if (hasCoreProgressUpgrades) {
        let repeatableCost = getAcademyCampPointBoostCost();
        if (math.evaluate(academy.credits) >= repeatableCost) {
            academyCampPointBoostClick();
            autoConfigureAcademyCamp();
        }
    }
}

function runAcademyAutomation() {
    if (!checks.conferenceBuyerOn || checks.gymType !== 1) {
        return;
    }
    autoConfigureAcademyCamp();
    autoBuyAcademyUpgrades();
}

function runYogaAutomation() {
    if (!checks.breathBuyerOn || checks.gymType !== 2) {
        return;
    }
}

function runCardioAutomation() {
    if (!checks.paceBuyerOn || checks.gymType !== 3) {
        return;
    }
    let intervalState = ensureCardioIntervalState();
    if (intervalState.activeRaceId === "") {
        selectCardioRace(intervalState.autoRaceIndex, true);
    }
}

function getNutritionistMultiplier() {
    return applyModifierPipeline(1, {
        additive: [math.mul(gym.employees.nutritionists.current, gym.employees.nutritionists.boost)],
    });
}

function getManagerMultiplier() {
    return applyModifierPipeline(1, {
        additive: [math.mul(gym.advertising.employees.managers.current, gym.advertising.employees.managers.boost)],
    });
}

function getClassMoneyMultiplier() {
    return applyModifierPipeline(1, {
        additive: [math.mul(gym.classes, gym.money.classMultiplier)],
    });
}

function getCompetitionMoneyMultiplier() {
    let hasCompetitionUpgrade = prestige.lifting.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased;
    if (!hasCompetitionUpgrade) {
        return 1;
    }

    if (lifting.comps.competitions.current > 0) {
        return math.pow(lifting.comps.competitions.current, 0.015);
    }

    let academy = ensureLiftingAcademyState();
    let seasonMultiplier = math.pow(math.add(math.min(academy.seasonsCompleted, getAcademySeasonCap()), 1), 0.05);
    return math.mul(seasonMultiplier, getAcademyCampPromotionCreditMultiplier());
}

function getLayer1GymProfileByType(gymType) {
    let profiles = layer1GymAccelerationBudget.gyms;
    for (let profileKey in profiles) {
        if (!Object.prototype.hasOwnProperty.call(profiles, profileKey)) {
            continue;
        }
        if (profiles[profileKey].gymType === gymType) {
            return profiles[profileKey];
        }
    }
    return null;
}

function getActiveLayer1GymProfile() {
    return getLayer1GymProfileByType(checks.gymType);
}

function isLayer1GymActive() {
    return getActiveLayer1GymProfile() != null;
}

function getLayer1CompletedRuns() {
    let total = math.add(prestige.bw.total, prestige.lifting.total);
    total = math.add(total, prestige.yoga.total);
    total = math.add(total, prestige.cardio.total);
    return math.max(0, math.sub(total, 1));
}

function getLayer1GymTotalByType(gymType) {
    switch (gymType) {
        case 0:
            return prestige.bw.total;
        case 1:
            return prestige.lifting.total;
        case 2:
            return prestige.yoga.total;
        case 3:
            return prestige.cardio.total;
        default:
            return 0;
    }
}

function getLayer1CompletedRunsForGym(gymType) {
    let baseline = gymType === 0 ? 1 : 0;
    let total = math.floor(math.evaluate(getLayer1GymTotalByType(gymType)));
    return math.max(0, math.sub(total, baseline));
}

function hasPurchasedPrestigeUpgrade(upgradeArray, upgradeId) {
    if (!Array.isArray(upgradeArray)) {
        return false;
    }

    for (let i = 0; i < upgradeArray.length; i++) {
        if (upgradeArray[i].id === upgradeId && upgradeArray[i].isPurchased) {
            return true;
        }
    }

    return false;
}

function getLayer1ModifierMasteryBonus() {
    let bonus = 0;
    if (hasPurchasedPrestigeUpgrade(prestige.bw.upgrades, 20)) {
        bonus = math.add(bonus, 0.05);
    }
    if (hasPurchasedPrestigeUpgrade(prestige.lifting.upgrades, 19)) {
        bonus = math.add(bonus, 0.05);
    }
    if (hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 19)) {
        bonus = math.add(bonus, 0.05);
    }
    return bonus;
}

function hasMovementEconomyMastery() {
    return hasPurchasedPrestigeUpgrade(prestige.bw.upgrades, 20);
}

function hasNoWastedRepsMastery() {
    return hasPurchasedPrestigeUpgrade(prestige.lifting.upgrades, 19);
}

function getGymMasteryActionSpeedMultiplier() {
    let multiplier = 1;
    if (hasMovementEconomyMastery()) {
        multiplier = math.mul(multiplier, 1.08);
    }
    if (hasEnduranceEngineMastery()) {
        multiplier = math.mul(multiplier, 1.06);
    }
    multiplier = math.mul(multiplier, getFlowMultiplier());
    multiplier = math.mul(multiplier, getPaceMultiplier());
    multiplier = math.mul(multiplier, getFlowShopActionSpeedMultiplier());
    multiplier = math.mul(multiplier, getPaceShopActionSpeedMultiplier());
    multiplier = math.mul(multiplier, getAcademyEffectiveActionSpeedMultiplier());
    multiplier = math.mul(multiplier, getRepeatingBodyweightActionSpeedMultiplier());
    multiplier = math.mul(multiplier, getRepeatingCardioActionSpeedMultiplier());
    multiplier = math.mul(multiplier, getRepeatingGlobalActionSpeedMultiplier());
    return applySoftcap(multiplier, 3.4, 0.56);
}

function getGymMasteryOverflowRetention() {
    if (!hasNoWastedRepsMastery()) {
        return 0;
    }
    let retention = 0.25;
    retention = math.mul(retention, getRepeatingLiftingOverflowMultiplier());
    return math.min(retention, 0.85);
}

function getPassiveConfidencePerSecond() {
    if (hasPurchasedPrestigeUpgrade(prestige.bw.upgrades, 21)) {
        return PASSIVE_CONFIDENCE_RATE_PER_SECOND;
    }
    return 0;
}

function getPassiveLeadershipPerSecond() {
    if (hasPurchasedPrestigeUpgrade(prestige.lifting.upgrades, 20)) {
        return PASSIVE_LEADERSHIP_RATE_PER_SECOND;
    }
    return 0;
}

function getPassiveFlowPerSecond() {
    if (hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 20)) {
        return PASSIVE_FLOW_RATE_PER_SECOND;
    }
    return 0;
}

function getPassivePacePerSecond() {
    if (hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 20)) {
        return PASSIVE_PACE_RATE_PER_SECOND;
    }
    return 0;
}

function applyPassiveMetaGeneration(seconds) {
    let elapsed = math.max(0, math.evaluate(seconds));
    if (!Number.isFinite(elapsed) || elapsed <= 0) {
        return;
    }

    let passiveConfidenceGain = math.mul(getPassiveConfidencePerSecond(), elapsed);
    if (passiveConfidenceGain > 0) {
        prestige.bw.confidence = math.add(prestige.bw.confidence, passiveConfidenceGain);
    }

    let passiveLeadershipGain = math.mul(getPassiveLeadershipPerSecond(), elapsed);
    if (passiveLeadershipGain > 0) {
        prestige.lifting.leadership = math.add(prestige.lifting.leadership, passiveLeadershipGain);
    }

    let passiveFlowGain = math.mul(getPassiveFlowPerSecond(), elapsed);
    if (passiveFlowGain > 0) {
        prestige.yoga.flow = math.add(prestige.yoga.flow, passiveFlowGain);
    }

    let passivePaceGain = math.mul(getPassivePacePerSecond(), elapsed);
    if (passivePaceGain > 0) {
        prestige.cardio.pace = math.add(prestige.cardio.pace, passivePaceGain);
    }
}

function getYogaRecoveryProtocolEnergyMultiplier() {
    return hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 19) ? 1.12 : 1;
}

function hasEnduranceEngineMastery() {
    return hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 19);
}

function getLayer1PacingMultiplier() {
    let profile = getActiveLayer1GymProfile();
    if (profile == null) {
        return 1;
    }

    let masteryBonus = getLayer1ModifierMasteryBonus();
    let localCompletedRuns = getLayer1CompletedRunsForGym(checks.gymType);
    let globalCompletedRuns = getLayer1CompletedRuns();
    let baseMultiplier = Number.isFinite(profile.baseMultiplier) ? profile.baseMultiplier : 1;
    baseMultiplier = math.max(0, baseMultiplier);
    let localScaling = math.log10(math.add(math.mul(localCompletedRuns, profile.runScale), 1));
    let localRampWeight = 1;
    let run1Weight = Number.isFinite(profile.run1Weight) ? profile.run1Weight : 0.45;
    let run2Weight = Number.isFinite(profile.run2Weight) ? profile.run2Weight : 0.75;
    if (localCompletedRuns <= 0) {
        localRampWeight = 0;
    }
    else if (localCompletedRuns === 1) {
        localRampWeight = run1Weight;
    }
    else if (localCompletedRuns === 2) {
        localRampWeight = run2Weight;
    }
    let multiplier = math.add(baseMultiplier, math.mul(profile.multiplierScale, math.mul(localScaling, localRampWeight)));

    let globalRunScale = Number.isFinite(profile.globalRunScale) ? profile.globalRunScale : 0;
    let globalMultiplierScale = Number.isFinite(profile.globalMultiplierScale) ? profile.globalMultiplierScale : 0;
    if (globalRunScale > 0 && globalMultiplierScale > 0) {
        let globalScaling = math.log10(math.add(math.mul(globalCompletedRuns, globalRunScale), 1));
        // Freshly unlocked gyms should not get full cross-gym acceleration immediately.
        let crossGymWeight = 0;
        if (localCompletedRuns === 1) {
            crossGymWeight = 0.22;
        }
        else if (localCompletedRuns === 2) {
            crossGymWeight = 0.48;
        }
        else if (localCompletedRuns >= 3) {
            crossGymWeight = 0.8;
        }
        multiplier = math.add(multiplier, math.mul(globalMultiplierScale, math.mul(globalScaling, crossGymWeight)));
    }

    // Keep very deep endgame loops from collapsing too hard before Layer 2.
    if (localCompletedRuns > 10) {
        let lateSoftcapStart = math.add(baseMultiplier, 0.1);
        multiplier = applySoftcap(multiplier, lateSoftcapStart, 0.8);
        if (localCompletedRuns > 14) {
            multiplier = applySoftcap(multiplier, math.add(lateSoftcapStart, 0.025), 0.72);
        }
    }

    return math.min(math.add(multiplier, masteryBonus), math.add(profile.cap, masteryBonus));
}

function getLayer0PacingMultiplier() {
    if (checks.gymType !== -1) {
        return 1;
    }

    return 0.13;
}

function getLayer1IdleScaleForGym(gymType, fallbackScale) {
    let profile = getLayer1GymProfileByType(gymType);
    if (profile == null || !Number.isFinite(profile.idleScale)) {
        return fallbackScale;
    }
    return profile.idleScale;
}

function getLongIdleBonus(runMinutes, scale) {
    let normalizedScale = math.max(0, math.evaluate(scale));
    return math.add(1, math.mul(normalizedScale, math.log10(math.add(runMinutes, 1))));
}

function jobMoneyPerSecond() {
    return applyModifierPipeline(0, {
        additive: [math.mul(job.views, job.moneyGrowth)],
        layer: [getLayer0PacingMultiplier()],
    });
}

function followerGrowthPerSecond() {
    return applyModifierPipeline(0, {
        additive: [math.mul(job.influencers, job.influencerMulti)],
        global: [getAllStatMultiplier()],
        layer: [getLayer0PacingMultiplier()],
    });
}

function researchPointsPerSecond() {
    return applyModifierPipeline(0, {
        additive: [math.mul(research.posts, research.pointGrowth)],
        layer: [getLayer0PacingMultiplier()],
    });
}

function postGrowthPerSecond() {
    return applyModifierPipeline(0, {
        additive: [math.mul(research.bots, research.botMulti)],
        multiplicative: [getStrengthPostMultiplier()],
        layer: [getLayer0PacingMultiplier()],
    });
}

function gangStrengthPerSecond() {
    return applyModifierPipeline(bodyweight.gang.strengthAmount, {
        multiplicative: [
            applyModifierPipeline(1, { additive: [math.mul(stats.strength, stats.strengthBoost)] }),
            getConfidenceShopGangMultiplier(),
        ],
        layer: [bodyweight.gang.on, getLayer1PacingMultiplier()],
    });
}

function gangMembersPerSecond() {
    return applyModifierPipeline(bodyweight.gang.memberAmount, {
        multiplicative: [getIntelligenceMultiplier(), getConfidenceShopGangMultiplier()],
        layer: [bodyweight.gang.on, getLayer1PacingMultiplier()],
    });
}

function competitionGainPerSecond(sourceCurrent, weight, modifier) {
    return applyModifierPipeline(sourceCurrent, {
        multiplicative: [
            applyModifierPipeline(1, {
                additive: [math.mul(weight, modifier)],
            }),
            getLeadershipShopCompetitionMultiplier(),
        ],
        layer: [getLayer1PacingMultiplier()],
    });
}

function createDefaultLayer2PrestigeState() {
    return {
        current: 0,
        total: 0,
        spent: 0,
        upgrades: [],
    };
}

function ensureLayer2PrestigeState() {
    if (prestige.layer2 == null || typeof prestige.layer2 !== "object") {
        prestige.layer2 = createDefaultLayer2PrestigeState();
    }

    if (!Array.isArray(prestige.layer2.upgrades)) {
        prestige.layer2.upgrades = [];
    }

    prestige.layer2.current = normalizePrestigePoints(prestige.layer2.current);
    prestige.layer2.spent = normalizePrestigePoints(prestige.layer2.spent);

    let total = math.evaluate(prestige.layer2.total);
    if (!Number.isFinite(total) || total < 0) {
        total = 0;
    }
    prestige.layer2.total = Math.floor(total);

    return prestige.layer2;
}

function createDefaultRunTracker() {
    return {
        runSeconds: 0,
        moneyEarned: 0,
        followersEarned: 0,
        researchEarned: 0,
        influenceEarned: 0,
    };
}

function ensureRunTracker() {
    if (stats.runTracker == null || typeof stats.runTracker !== "object") {
        stats.runTracker = createDefaultRunTracker();
    }

    let defaults = createDefaultRunTracker();
    let keys = Object.keys(defaults);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = math.evaluate(stats.runTracker[key]);
        if (!Number.isFinite(value) || value < 0) {
            stats.runTracker[key] = 0;
        }
    }

    return stats.runTracker;
}

function addRunGain(field, amount) {
    let runTracker = ensureRunTracker();
    let gain = math.evaluate(amount);
    if (!Number.isFinite(gain) || gain <= 0) {
        return 0;
    }

    runTracker[field] = math.add(runTracker[field], gain);
    return gain;
}

function addRunSeconds(seconds) {
    return addRunGain("runSeconds", seconds);
}

function normalizeRepeatingLevel(level) {
    let normalized = math.floor(math.max(0, math.evaluate(level)));
    if (!Number.isFinite(normalized) || normalized < 0) {
        return 0;
    }
    return normalized;
}

function getRepeatingUpgradeCost(definition, level) {
    if (definition == null || definition.cost == null) {
        return 0;
    }

    let currentLevel = normalizeRepeatingLevel(level);
    let baseCost = math.evaluate(definition.cost.baseCost || 0);
    let growth = math.evaluate(definition.cost.growth || 1);
    let curve = math.evaluate(definition.cost.curve || 0);

    return applyModifierPipeline(baseCost, {
        multiplicative: [
            math.pow(growth, currentLevel),
            math.pow(math.add(currentLevel, 1), curve),
        ],
    });
}

function getRepeatingUpgradeEffect(definition, level) {
    if (definition == null || definition.effect == null) {
        return 0;
    }

    let currentLevel = normalizeRepeatingLevel(level);
    let effectType = definition.effect.type || "additive";

    switch (effectType) {
        case "multiplicative":
            return math.pow(math.evaluate(definition.effect.base || 1), currentLevel);
        case "hybrid_log":
            return applyModifierPipeline(1, {
                additive: [
                    math.mul(
                        math.evaluate(definition.effect.scale || 0),
                        math.log10(math.add(1, math.mul(currentLevel, math.evaluate(definition.effect.slope || 1))))
                    ),
                ],
            });
        case "additive":
        default:
            return applyModifierPipeline(math.evaluate(definition.effect.base || 0), {
                additive: [math.mul(math.evaluate(definition.effect.step || 0), currentLevel)],
            });
    }
}

function getRepeatingUpgradeState(upgradeId) {
    if (stats.repeatingUpgrades == null || typeof stats.repeatingUpgrades !== "object") {
        stats.repeatingUpgrades = {};
    }

    if (stats.repeatingUpgrades[upgradeId] == null) {
        stats.repeatingUpgrades[upgradeId] = {
            level: 0,
        };
    }

    return stats.repeatingUpgrades[upgradeId];
}

function getRepeatingUpgradeDefinition(scope, upgradeId) {
    let scoped = repeatingUpgradeDefinitions[scope];
    if (scoped == null) {
        return null;
    }

    for (let i = 0; i < scoped.length; i++) {
        if (scoped[i].id === upgradeId) {
            return scoped[i];
        }
    }

    return null;
}

function isRepeatingRequirementMet(requirement) {
    if (requirement == null || typeof requirement !== "object") {
        return true;
    }

    if (requirement.type !== "prestige_upgrade") {
        return true;
    }

    switch (requirement.scope) {
        case "global":
            return hasPurchasedPrestigeUpgrade(prestige.upgrades, requirement.upgradeId);
        case "bodyweight":
            return hasPurchasedPrestigeUpgrade(prestige.bw.upgrades, requirement.upgradeId);
        case "lifting":
            return hasPurchasedPrestigeUpgrade(prestige.lifting.upgrades, requirement.upgradeId);
        case "yoga":
            return hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, requirement.upgradeId);
        case "cardio":
            return hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, requirement.upgradeId);
        case "confidence_shop":
            return hasPurchasedPrestigeUpgrade(prestige.bw.confidenceUpgrades, requirement.upgradeId);
        case "leadership_shop":
            return hasPurchasedPrestigeUpgrade(prestige.lifting.leadershipUpgrades, requirement.upgradeId);
        case "flow_shop":
            return hasPurchasedPrestigeUpgrade(prestige.yoga.flowUpgrades, requirement.upgradeId);
        case "pace_shop":
            return hasPurchasedPrestigeUpgrade(prestige.cardio.paceUpgrades, requirement.upgradeId);
        default:
            return true;
    }
}

function areRepeatingUpgradeRequirementsMet(definition) {
    if (definition == null || definition.requires == null || !Array.isArray(definition.requires.allOf)) {
        return true;
    }

    for (let i = 0; i < definition.requires.allOf.length; i++) {
        if (!isRepeatingRequirementMet(definition.requires.allOf[i])) {
            return false;
        }
    }

    return true;
}

function normalizePrestigePoints(value) {
    let normalized = math.evaluate(value);
    if (!Number.isFinite(normalized) || normalized < 0) {
        return 0;
    }

    let precision = Math.pow(10, PRESTIGE_INTERNAL_DECIMALS);
    return Math.round(normalized * precision) / precision;
}

function canAffordPrestigeCost(points, cost) {
    return normalizePrestigePoints(points) + PRESTIGE_COMPARISON_EPSILON >= math.evaluate(cost);
}

function getRepeatingUpgradePoints(scope) {
    switch (scope) {
        case "global":
            return normalizePrestigePoints(prestige.current);
        case "bodyweight":
            return normalizePrestigePoints(prestige.bw.current);
        case "lifting":
            return normalizePrestigePoints(prestige.lifting.current);
        case "yoga":
            return normalizePrestigePoints(prestige.yoga.current);
        case "cardio":
            return normalizePrestigePoints(prestige.cardio.current);
        case "flow":
            return normalizePrestigePoints(prestige.yoga.flow);
        case "pace":
            return normalizePrestigePoints(prestige.cardio.pace);
        case "confidence":
            return normalizePrestigePoints(prestige.bw.confidence);
        case "leadership":
            return normalizePrestigePoints(prestige.lifting.leadership);
        default:
            return 0;
    }
}

function setRepeatingUpgradePoints(scope, value) {
    let normalized = normalizePrestigePoints(value);
    switch (scope) {
        case "global":
            prestige.current = normalized;
            break;
        case "bodyweight":
            prestige.bw.current = normalized;
            break;
        case "lifting":
            prestige.lifting.current = normalized;
            break;
        case "yoga":
            prestige.yoga.current = normalized;
            break;
        case "cardio":
            prestige.cardio.current = normalized;
            break;
        case "flow":
            prestige.yoga.flow = normalized;
            break;
        case "pace":
            prestige.cardio.pace = normalized;
            break;
        case "confidence":
            prestige.bw.confidence = normalized;
            break;
        case "leadership":
            prestige.lifting.leadership = normalized;
            break;
        default:
    }
}

function getRepeatingUpgradeContainerId(divText) {
    return divText + "Repeating";
}

function getRepeatingUpgradeElementId(scope, upgradeId) {
    return "repeating_" + scope + "_" + upgradeId;
}

function getRepeatingUpgradeButtonId(scope, upgradeId) {
    return getRepeatingUpgradeElementId(scope, upgradeId) + "_btn";
}

function getRepeatingUpgradeDescId(scope, upgradeId) {
    return getRepeatingUpgradeElementId(scope, upgradeId) + "_desc";
}

function getRepeatingScopePointsLabel(scope) {
    switch (scope) {
        case "global":
            return "Global Points";
        case "bodyweight":
            return "Bodyweight Points";
        case "lifting":
            return "Lifting Points";
        case "yoga":
            return "Yoga Points";
        case "cardio":
            return "Cardio Points";
        case "flow":
            return "Flow";
        case "pace":
            return "Pace";
        case "confidence":
            return "Confidence Points";
        case "leadership":
            return "Leadership Points";
        default:
            return "Points";
    }
}

function getRepeatingScopeHeaderClass(scope) {
    switch (scope) {
        case "global":
            return "text-warning";
        case "bodyweight":
            return "text-info";
        case "lifting":
            return "text-danger";
        case "yoga":
            return "text-warning";
        case "cardio":
            return "text-danger";
        case "flow":
            return "text-info";
        case "pace":
            return "text-danger";
        case "confidence":
            return "text-success";
        case "leadership":
            return "text-primary";
        default:
            return "text-info";
    }
}

function getRepeatingScopeAffordableButtonClass(scope) {
    switch (scope) {
        case "global":
            return "btn-warning";
        case "bodyweight":
            return "btn-info";
        case "lifting":
            return "btn-danger";
        case "yoga":
            return "btn-warning";
        case "cardio":
            return "btn-danger";
        case "flow":
            return "btn-success";
        case "pace":
            return "btn-danger";
        case "confidence":
            return "btn-success";
        case "leadership":
            return "btn-primary";
        default:
            return "btn-primary";
    }
}

function ensureRepeatingUpgradeSection(divText, scope) {
    let scoped = repeatingUpgradeDefinitions[scope];
    if (scoped == null || scoped.length === 0) {
        return;
    }

    let sectionId = getRepeatingUpgradeContainerId(divText);
    let pointsLabel = getRepeatingScopePointsLabel(scope);
    let headerClass = getRepeatingScopeHeaderClass(scope);
    if ($("#" + sectionId).length === 0) {
        $("#" + divText).append(
            "<hr />" +
            "<h6 class='" + headerClass + "'>Repeatable Upgrades (" + pointsLabel + ")</h6>" +
            "<div id='" + sectionId + "' class='row'></div>"
        );
    }

    for (let i = 0; i < scoped.length; i++) {
        let def = scoped[i];
        let cardId = getRepeatingUpgradeElementId(scope, def.id);
        if ($("#" + cardId).length > 0) {
            continue;
        }

        $("#" + sectionId).append(
            "<div class='col-md-4'>" +
            "<div id='" + cardId + "'>" +
            "<button type='button' id='" + getRepeatingUpgradeButtonId(scope, def.id) + "' class='btn btn-block btn-secondary disabled' onclick=\"repeatingUpgradeClick('" + scope + "','" + def.id + "')\"></button>" +
            "<p id='" + getRepeatingUpgradeDescId(scope, def.id) + "'></p>" +
            "</div>" +
            "</div>"
        );
    }
}

function updateRepeatingUpgradeButtons(divText, scope, points) {
    let scoped = repeatingUpgradeDefinitions[scope];
    if (scoped == null || scoped.length === 0) {
        return;
    }

    ensureRepeatingUpgradeSection(divText, scope);

    for (let i = 0; i < scoped.length; i++) {
        let def = scoped[i];
        let state = getRepeatingUpgradeState(def.id);
        let level = normalizeRepeatingLevel(state.level);
        state.level = level;

        let cost = getRepeatingUpgradeCost(def, level);
        let currentEffect = getRepeatingUpgradeEffect(def, level);
        let nextEffect = getRepeatingUpgradeEffect(def, level + 1);
        let buttonId = getRepeatingUpgradeButtonId(scope, def.id);
        let descId = getRepeatingUpgradeDescId(scope, def.id);
        let requirementsMet = areRepeatingUpgradeRequirementsMet(def);
        let canBuy = requirementsMet && canAffordPrestigeCost(points, cost);
        let buyClass = getRepeatingScopeAffordableButtonClass(scope);
        let requirementText = "";
        if (!requirementsMet && def.requires != null && typeof def.requires.text === "string") {
            requirementText = "<br /><span class='text-warning'>" + def.requires.text + "</span>";
        }

        $("#" + buttonId)
            .html(def.name + " (Lv. " + level + ")")
            .removeClass("btn-primary btn-info btn-success btn-warning btn-danger btn-dark btn-secondary disabled")
            .addClass(canBuy ? buyClass : "btn-secondary disabled")
            .prop("disabled", !canBuy);

        $("#" + descId).html(
            "<strong>Cost: " + (cost < 1000000 ? cost.toFixed(2) : math.format(cost, 3)) + " points</strong>" +
            "<br />Current effect: " + (currentEffect < 1000000 ? currentEffect.toFixed(4) : math.format(currentEffect, 3)) + "x" +
            "<br />Next effect: " + (nextEffect < 1000000 ? nextEffect.toFixed(4) : math.format(nextEffect, 3)) + "x" +
            "<br />" + def.desc +
            requirementText
        );
    }
}

function repeatingUpgradeClick(scope, upgradeId) {
    let def = getRepeatingUpgradeDefinition(scope, upgradeId);
    if (def == null) {
        return;
    }

    let state = getRepeatingUpgradeState(upgradeId);
    let level = normalizeRepeatingLevel(state.level);
    let cost = getRepeatingUpgradeCost(def, level);
    let points = getRepeatingUpgradePoints(scope);

    if (!areRepeatingUpgradeRequirementsMet(def) || !canAffordPrestigeCost(points, cost)) {
        return;
    }

    setRepeatingUpgradePoints(scope, math.sub(points, cost));
    state.level = math.add(level, 1);

    updatePrestigeValues();
    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
    updateRepeatingUpgradeButtons("globalBwUpgrades", "bodyweight", prestige.bw.current);
    updateRepeatingUpgradeButtons("globalLiftingUpgrades", "lifting", prestige.lifting.current);
    updateRepeatingUpgradeButtons("globalYogaUpgrades", "yoga", prestige.yoga.current);
    updateRepeatingUpgradeButtons("globalCardioUpgrades", "cardio", prestige.cardio.current);
    updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
    updateRepeatingUpgradeButtons("confidenceShopUpgrades", "confidence", prestige.bw.confidence);
    updateRepeatingUpgradeButtons("leadershipShopUpgrades", "leadership", prestige.lifting.leadership);
}

window.__gainzRepeatingUpgrades = {
    definitions: repeatingUpgradeDefinitions,
    normalizeLevel: normalizeRepeatingLevel,
    getCost: getRepeatingUpgradeCost,
    getEffect: getRepeatingUpgradeEffect,
    getState: getRepeatingUpgradeState,
    getDefinition: getRepeatingUpgradeDefinition,
    getPoints: getRepeatingUpgradePoints,
};

window.__gainzEconomyBudget = {
    layer1: layer1GymAccelerationBudget,
    getLayer1ProfileByType: getLayer1GymProfileByType,
    getActiveLayer1Profile: getActiveLayer1GymProfile,
};

function assertValidState(context, options) {
    let source = context || "unknown";
    let strictMode = options != null && options.strict === true;

    stats.money = sanitizeResourceValue(source, "stats.money", stats.money);
    stats.energy.current = sanitizeResourceValue(source, "stats.energy.current", stats.energy.current);
    stats.energy.max = sanitizeResourceValue(source, "stats.energy.max", stats.energy.max);
    stats.strength = sanitizeResourceValue(source, "stats.strength", stats.strength);
    stats.endurance = sanitizeResourceValue(source, "stats.endurance", stats.endurance);
    stats.agility = sanitizeResourceValue(source, "stats.agility", stats.agility);
    stats.intelligence = sanitizeResourceValue(source, "stats.intelligence", stats.intelligence);

    job.followers = sanitizeResourceValue(source, "job.followers", job.followers);
    job.views = sanitizeResourceValue(source, "job.views", job.views);
    job.influencers = sanitizeResourceValue(source, "job.influencers", job.influencers);

    research.points = sanitizeResourceValue(source, "research.points", research.points);
    research.posts = sanitizeResourceValue(source, "research.posts", research.posts);
    research.bots = sanitizeResourceValue(source, "research.bots", research.bots);

    gym.members.current = sanitizeResourceValue(source, "gym.members.current", gym.members.current);
    gym.members.capacity = sanitizeResourceValue(source, "gym.members.capacity", gym.members.capacity);
    gym.advertising.influence = sanitizeResourceValue(source, "gym.advertising.influence", gym.advertising.influence);
    gym.advertising.campaigns = sanitizeResourceValue(source, "gym.advertising.campaigns", gym.advertising.campaigns);
    gym.advertising.ads = sanitizeResourceValue(source, "gym.advertising.ads", gym.advertising.ads);
    gym.advertising.campaignGrowth = sanitizeResourceValue(source, "gym.advertising.campaignGrowth", gym.advertising.campaignGrowth);

    prestige.current = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.current", prestige.current));
    prestige.bw.current = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.bw.current", prestige.bw.current));
    prestige.lifting.current = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.lifting.current", prestige.lifting.current));
    prestige.yoga.current = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.yoga.current", prestige.yoga.current));
    prestige.cardio.current = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.cardio.current", prestige.cardio.current));
    prestige.bw.confidence = sanitizeResourceValue(source, "prestige.bw.confidence", prestige.bw.confidence);
    prestige.lifting.leadership = sanitizeResourceValue(source, "prestige.lifting.leadership", prestige.lifting.leadership);
    prestige.yoga.flow = sanitizeResourceValue(source, "prestige.yoga.flow", prestige.yoga.flow);
    prestige.cardio.pace = sanitizeResourceValue(source, "prestige.cardio.pace", prestige.cardio.pace);
    let layer2State = ensureLayer2PrestigeState();
    layer2State.current = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.layer2.current", layer2State.current));
    layer2State.spent = normalizePrestigePoints(sanitizeResourceValue(source, "prestige.layer2.spent", layer2State.spent));
    layer2State.total = Math.floor(sanitizeResourceValue(source, "prestige.layer2.total", layer2State.total));

    let runTracker = ensureRunTracker();
    runTracker.runSeconds = sanitizeResourceValue(source, "stats.runTracker.runSeconds", runTracker.runSeconds);
    runTracker.moneyEarned = sanitizeResourceValue(source, "stats.runTracker.moneyEarned", runTracker.moneyEarned);
    runTracker.followersEarned = sanitizeResourceValue(source, "stats.runTracker.followersEarned", runTracker.followersEarned);
    runTracker.researchEarned = sanitizeResourceValue(source, "stats.runTracker.researchEarned", runTracker.researchEarned);
    runTracker.influenceEarned = sanitizeResourceValue(source, "stats.runTracker.influenceEarned", runTracker.influenceEarned);

    if (strictMode) {
        sanitizeStrictEconomyState(source);
        prestige.current = normalizePrestigePoints(prestige.current);
        prestige.bw.current = normalizePrestigePoints(prestige.bw.current);
        prestige.lifting.current = normalizePrestigePoints(prestige.lifting.current);
        prestige.yoga.current = normalizePrestigePoints(prestige.yoga.current);
        prestige.cardio.current = normalizePrestigePoints(prestige.cardio.current);
        layer2State.current = normalizePrestigePoints(layer2State.current);
        layer2State.spent = normalizePrestigePoints(layer2State.spent);
        layer2State.total = Math.floor(layer2State.total);
    }
}

function renderEnergyProgressBar() {
    if (stats == null || stats.energy == null) {
        return;
    }

    if (!Number.isFinite(energyDisplayCurrent) || energyDisplayCurrent == null) {
        energyDisplayCurrent = stats.energy.current;
    }

    energyDisplayCurrent = math.max(0, math.min(stats.energy.max, stats.energy.current));

    let energyCurrent = energyDisplayCurrent < 1000000 ? energyDisplayCurrent.toFixed(2) : math.format(energyDisplayCurrent, 3);
    let energyMax = stats.energy.max < 1000000 ? stats.energy.max.toFixed(2) : math.format(stats.energy.max, 3);
    let energyPercent = stats.energy.max > 0 ? (energyDisplayCurrent / stats.energy.max) * 100 : 0;
    $("#energyProgress").attr("aria-valuenow", energyCurrent);
    $("#energyProgress").attr("aria-valuemax", energyMax);
    $("#energyProgress").css("width", energyPercent + "%");
    $("#energyProgress").html("&nbsp;");
    if ($("#energyProgressValue").length > 0) {
        $("#energyProgressValue").html(energyCurrent + "/" + energyMax);
    }
}

function setupEnergyUiRefresh() {
    if (energyUiRefreshId != null) {
        clearInterval(energyUiRefreshId);
    }

    renderEnergyProgressBar();

    energyUiRefreshId = setInterval(function () {
        renderEnergyProgressBar();
    }, 50);
}

function setupRefresh() {
    refreshId = setInterval(function () {
        let energyPerSecond = math.evaluate(
            math.mul(
                (stats.energy.increase * ((stats.agility * stats.agilityBoost) + 1)) * 2,
                math.mul(
                    math.mul(math.mul(getYogaRecoveryProtocolEnergyMultiplier(), getFlowShopEnergyMultiplier()), getPaceShopRecoveryMultiplier()),
                    math.mul(
                        math.mul(getFlowEnergyRecoveryMultiplier(), getPaceEnergyRecoveryMultiplier()),
                        math.mul(getRepeatingYogaRecoveryMultiplier(), getRepeatingGlobalRecoveryMultiplier())
                    )
                )
            )
        );
        stats.energy.max = math.evaluate(
            stats.energy.originalMax *
            ((stats.endurance * stats.enduranceBoost) + 1) *
            getFlowMaxEnergyMultiplier() *
            getPaceMaxEnergyMultiplier() *
            getRepeatingYogaMaxEnergyMultiplier() *
            getRepeatingCardioMaxEnergyMultiplier() *
            (hasEnduranceEngineMastery() ? 1.10 : 1)
        );
        if (stats.energy.current > stats.energy.max) {
            stats.energy.current = stats.energy.max;
        }

        renderEnergyProgressBar();

        if (stats.energy.coffee.isActive == true) {
            $("#coffeeBtn").html("COFFEE ACTIVATED! - " + (stats.energy.coffee.timer - stats.energy.coffee.current) + "s");
            $("#coffeeBtn").addClass("disabled");
            energyPerSecond *= stats.energy.coffee.boost;
        }
        else if (stats.energy.coffee.isCooldown == true) {
            $("#coffeeBtn").html("coffee gone - " + (stats.energy.coffee.cooldown - stats.energy.coffee.current) + "s");
            $("#coffeeBtn").addClass("disabled");
        }
        else {
            $("#coffeeBtn").html("Drink Coffee");
            $("#coffeeBtn").removeClass("disabled");
            clearInterval(coffeeTimerId);
        }

        if (stats.payday.isCooldown == true) {
            $("#payDayBtn").html("waiting for pay day - " + (stats.payday.cooldown - stats.payday.current) + "s");
            $("#payDayBtn").addClass("disabled");
        }
        else {
            $("#payDayBtn").html("Pay Day!");
            $("#payDayBtn").removeClass("disabled");
            clearInterval(payDayTimerId);
        }

        energyPerSecond < 1000000 ? $("#energyPerSecond").html("<span class='text-success'>(" + energyPerSecond.toFixed(2) + "/s)</span>") : "<span class='text-success'>(" + math.format(energyPerSecond, 3) + "/s)</span>";

        if (checks.isResting) {
            $("#resting").html(" <em>(Resting)</em>");
            if (checks.story1 == false) {
                checks.story1 = true;
            }
            if (checks.story2 == false) {
                setupStory2();
            }
        }
        else {
            $("#resting").html("");
        }

        stats.strength < 1000000 ? $("#strength").html(stats.strength.toFixed(2)) : $("#strength").html(math.format(stats.strength, 3));
        stats.endurance < 1000000 ? $("#endurance").html(stats.endurance.toFixed(2)) : $("#endurance").html(math.format(stats.endurance, 3));
        stats.agility < 1000000 ? $("#agility").html(stats.agility.toFixed(2)) : $("#agility").html(math.format(stats.agility, 3));
        stats.intelligence < 1000000 ? $("#intelligence").html(stats.intelligence.toFixed(2)) : $("#intelligence").html(math.format(stats.intelligence, 3));

        let strengthMod = math.evaluate((stats.strength * stats.strengthBoost) + 1);
        let enduranceMod = math.evaluate((stats.endurance * stats.enduranceBoost) + 1);
        let agilitymod = math.evaluate((stats.agility * stats.agilityBoost) + 1);
        let intMod = math.evaluate((stats.intelligence * stats.intelligenceBoost) + 1);
        let allMod = getAllStatMultiplier();

        strengthMod < 1000000 ? $("#strengthMod").html(strengthMod.toFixed(2)) : $("#strengthMod").html(math.format(strengthMod, 3));
        enduranceMod < 1000000 ? $("#enduranceMod").html(enduranceMod.toFixed(2)) : $("#enduranceMod").html(math.format(enduranceMod, 3));
        agilitymod < 1000000 ? $("#agilityMod").html(agilitymod.toFixed(2)) : $("#agilityMod").html(math.format(agilitymod, 3));
        intMod < 1000000 ? $("#intMod").html(intMod.toFixed(2)) : $("#intMod").html(math.format(intMod, 3));
        allMod < 1000000 ? $("#allMod").html(allMod.toFixed(2)) : $("#allMod").html(math.format(allMod, 3));

        if (isLayer1GymActive()) {
            let completedRuns = Math.floor(getLayer1CompletedRuns());
            $("#layer1CompletedRuns").html(completedRuns);
        }
        else {
            $("#layer1CompletedRuns").html("0");
        }
        $("#layer1PacingModifierRow").addClass("d-none");

        if (checks.gymType == -1 || checks.gymType == 0) {
            bodyweight.pushups.isStopped ? $("#startStopPushups").html("Start").removeClass("text-danger") : $("#startStopPushups").html("Stop").addClass("text-danger")
            bodyweight.rows.isStopped ? $("#startStopRows").html("Start").removeClass("text-danger") : $("#startStopRows").html("Stop").addClass("text-danger")
            bodyweight.dips.isStopped ? $("#startStopDips").html("Start").removeClass("text-danger") : $("#startStopDips").html("Stop").addClass("text-danger")
            bodyweight.pullups.isStopped ? $("#startStopPullups").html("Start").removeClass("text-danger") : $("#startStopPullups").html("Stop").addClass("text-danger")
            bodyweight.squats.isStopped ? $("#startStopBwSquats").html("Start").removeClass("text-danger") : $("#startStopBwSquats").html("Stop").addClass("text-danger")
            bodyweight.rdl.isStopped ? $("#startStopBwRdls").html("Start").removeClass("text-danger") : $("#startStopBwRdls").html("Stop").addClass("text-danger")

            let finalMessage = "Energy and stat growth is doubled every progression.";
            refreshProgressBarsAndStats("pushup", bodyweight.pushups, "Incline Pushups -> Pushups -> Diamond Pushups -> Pseudo Planche Pushups -> Planche Pushups<br /><br />", finalMessage);
            refreshProgressBarsAndStats("row", bodyweight.rows, "Incline Rows -> Horizontal Rows -> Tuck Front Lever Rows -> Advanced Tuck Front Lever Rows -> Front Lever Rows<br /><br />", finalMessage);
            refreshProgressBarsAndStats("dip", bodyweight.dips, "Support Holds -> Dip Negatives -> Dips -> Ring Dips -> Rings Turned-Out Dips<br /><br />", finalMessage);
            refreshProgressBarsAndStats("pullup", bodyweight.pullups, "Arch Hangs -> Pullup Negatives -> Pullups -> Assisted One-Arm Pullups -> One-Arm Pullups<br /><br />", finalMessage);
            refreshProgressBarsAndStats("bwSquat", bodyweight.squats, "Assisted Squat -> Squat -> Split Squat -> Bulgarian Split Squat -> Pistol Squat<br /><br />", finalMessage);
            refreshProgressBarsAndStats("bwRdl", bodyweight.rdl, "Romanian Deadlifts (No Weight) -> Single-Legged Deadlifts -> Banded Nordic Curl Negatives -> Banded Nordic Curls -> Nordic Curls<br /><br />", finalMessage);
        }
        else if (checks.gymType == 1) {
            lifting.bench.isStopped ? $("#startStopLiftingBench").html("Start").removeClass("text-danger") : $("#startStopLiftingBench").html("Stop").addClass("text-danger");
            lifting.rows.isStopped ? $("#startStopLiftingRow").html("Start").removeClass("text-danger") : $("#startStopLiftingRow").html("Stop").addClass("text-danger")
            lifting.ohp.isStopped ? $("#startStopliftingOhp").html("Start").removeClass("text-danger") : $("#startStopliftingOhp").html("Stop").addClass("text-danger")
            lifting.squats.isStopped ? $("#startStopliftingSquats").html("Start").removeClass("text-danger") : $("#startStopliftingSquats").html("Stop").addClass("text-danger")
            lifting.dls.isStopped ? $("#startStopliftingDls").html("Start").removeClass("text-danger") : $("#startStopliftingDls").html("Stop").addClass("text-danger")
            lifting.curls.isStopped ? $("#startStopliftingCurls").html("Start").removeClass("text-danger") : $("#startStopliftingCurls").html("Stop").addClass("text-danger")
            let finalMessage = "Energy and stat growth are multiplied by 1.02 each weight increase.";
            refreshProgressBarsAndStats("liftingBench", lifting.bench, "", finalMessage);
            refreshProgressBarsAndStats("liftingRow", lifting.rows, "", finalMessage);
            refreshProgressBarsAndStats("liftingOhp", lifting.ohp, "", finalMessage);
            refreshProgressBarsAndStats("liftingSquats", lifting.squats, "", finalMessage);
            refreshProgressBarsAndStats("liftingDls", lifting.dls, "", finalMessage);
            refreshProgressBarsAndStats("liftingCurls", lifting.curls, "", finalMessage);
        }
        else if (checks.gymType == 2) {
            yoga.sun.isStopped ? $("#startStopYogaSun").html("Start").removeClass("text-danger") : $("#startStopYogaSun").html("Stop").addClass("text-danger");
            yoga.vinyasa.isStopped ? $("#startStopYogaVinyasa").html("Start").removeClass("text-danger") : $("#startStopYogaVinyasa").html("Stop").addClass("text-danger");
            yoga.balance.isStopped ? $("#startStopYogaBalance").html("Start").removeClass("text-danger") : $("#startStopYogaBalance").html("Stop").addClass("text-danger");
            yoga.mobility.isStopped ? $("#startStopYogaMobility").html("Start").removeClass("text-danger") : $("#startStopYogaMobility").html("Stop").addClass("text-danger");
            yoga.core.isStopped ? $("#startStopYogaCore").html("Start").removeClass("text-danger") : $("#startStopYogaCore").html("Stop").addClass("text-danger");
            yoga.breath.isStopped ? $("#startStopYogaBreath").html("Start").removeClass("text-danger") : $("#startStopYogaBreath").html("Stop").addClass("text-danger");
            let finalMessage = "Energy and stat growth is doubled every progression.";
            refreshProgressBarsAndStats("yogaSun", yoga.sun, "", finalMessage);
            refreshProgressBarsAndStats("yogaVinyasa", yoga.vinyasa, "", finalMessage);
            refreshProgressBarsAndStats("yogaBalance", yoga.balance, "", finalMessage);
            refreshProgressBarsAndStats("yogaMobility", yoga.mobility, "", finalMessage);
            refreshProgressBarsAndStats("yogaCore", yoga.core, "", finalMessage);
            refreshProgressBarsAndStats("yogaBreath", yoga.breath, "", finalMessage);
        }
        else if (checks.gymType == 3) {
            cardio.treadmill.isStopped ? $("#startStopCardioTreadmill").html("Start").removeClass("text-danger") : $("#startStopCardioTreadmill").html("Stop").addClass("text-danger");
            cardio.bike.isStopped ? $("#startStopCardioBike").html("Start").removeClass("text-danger") : $("#startStopCardioBike").html("Stop").addClass("text-danger");
            cardio.row.isStopped ? $("#startStopCardioRow").html("Start").removeClass("text-danger") : $("#startStopCardioRow").html("Stop").addClass("text-danger");
            cardio.sprints.isStopped ? $("#startStopCardioSprints").html("Start").removeClass("text-danger") : $("#startStopCardioSprints").html("Stop").addClass("text-danger");
            cardio.hills.isStopped ? $("#startStopCardioHills").html("Start").removeClass("text-danger") : $("#startStopCardioHills").html("Stop").addClass("text-danger");
            cardio.recovery.isStopped ? $("#startStopCardioRecovery").html("Start").removeClass("text-danger") : $("#startStopCardioRecovery").html("Stop").addClass("text-danger");
            let finalMessage = "Energy and stat growth is doubled every progression.";
            refreshProgressBarsAndStats("cardioTreadmill", cardio.treadmill, "", finalMessage);
            refreshProgressBarsAndStats("cardioBike", cardio.bike, "", finalMessage);
            refreshProgressBarsAndStats("cardioRow", cardio.row, "", finalMessage);
            refreshProgressBarsAndStats("cardioSprints", cardio.sprints, "", finalMessage);
            refreshProgressBarsAndStats("cardioHills", cardio.hills, "", finalMessage);
            refreshProgressBarsAndStats("cardioRecovery", cardio.recovery, "", finalMessage);
        }

        if (checks.gymType == -1) {
            $("#makeVideoProgress").css("width", ((job.makeVideo.current / job.makeVideo.max) * 100) + "%");
            $("#influencerProgress").css("width", ((job.recruitInfluencers.current / job.recruitInfluencers.max) * 100) + "%");
            $("#browseRedditProgress").css("width", ((research.browseReddit.current / research.browseReddit.max) * 100) + "%");
            $("#codeBotsProgress").css("width", ((research.codeBots.current / research.codeBots.max) * 100) + "%");

            if (job.views > 5000 && !checks.story3) {
                $("#story").prepend("<div id='story3' class='alert alert-primary alert-dismissible fade show fixed-bottom' role='alert'><strong>It might take a while to become popular</strong>. Let's see if there's anything I can buy in the meantime to get harder better faster stronger. (check workout tab)<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
                checks.story3 = true;
            }

            let moneyPerSecond = jobMoneyPerSecond();
            stats.money < 1000000 ? $("#money").html(stats.money.toFixed(2)) : $("#money").html(math.format(stats.money, 3));
            moneyPerSecond < 1000000 ? $("#money").append(" <span class='text-success'>(" + moneyPerSecond.toFixed(2) + "/s)</span>") : $("#money").append(" <span class='text-success'>(" + math.format(moneyPerSecond, 3) + "/s)</span>");

            let viewsPerSecond = math.evaluate(((job.viewGrowth * (job.followers + followerFormula())) + 1) / ((job.makeVideo.max / job.makeVideo.increase) / (job.makeVideo.speed / 1000)) * job.makeVideo.speedModifier);
            job.views < 1000000 ? $("#views").html(job.views.toFixed(2)) : $("#views").html(math.format(job.views, 3));
            viewsPerSecond < 1000000 ? $("#views").append(" <span class='text-success'>(" + viewsPerSecond.toFixed(3) + "/s)</span>") : $("#views").append(" <span class='text-success'>(" + math.format(viewsPerSecond, 3) + "/s)</span>");

            let followersPerSecond = math.evaluate((followerFormula()) / ((job.makeVideo.max / job.makeVideo.increase) / (job.makeVideo.speed / 1000)) * job.makeVideo.speedModifier);
            job.followers < 1000000 ? $(".followers").html(job.followers.toFixed(2)) : $(".followers").html(math.format(job.followers, 3));
            followersPerSecond < 1000000 ? $(".followers").append(" <span class='text-success'>(" + followersPerSecond.toFixed(3) + "/s)</span>") : $(".followers").append(" <span class='text-success'>(" + math.format(followersPerSecond, 3) + "/s)</span>");

            let followerGrowthRate = followerGrowthPerSecond();
            followerFormula() < 1000000 ? $("#followerGrowth").html(followerFormula().toFixed(4)) : $("#followerGrowth").html(math.format(followerFormula(), 3));
            if (followerGrowthRate > 0) {
                followerGrowthRate < 1000000 ? $("#followerGrowth").append(" <span class='text-success'>(" + followerGrowthRate.toFixed(4) + "/s)</span>") : $("#followerGrowth").append(" <span class='text-success'>(" + math.format(followerGrowthRate, 3) + "/s)</span>");
            }

            let influencersPerSecond = math.evaluate(job.influencerGrowth / ((job.recruitInfluencers.max / job.recruitInfluencers.increase) / (job.recruitInfluencers.speed / 1000)) * job.recruitInfluencers.speedModifier);
            job.influencers < 1000000 ? $("#influencers").html(job.influencers.toFixed(2)) : $("#influencers").html(math.format(job.influencers, 3));
            influencersPerSecond < 1000000 ? $("#influencers").append(" <span class='text-success'>(" + influencersPerSecond.toFixed(4) + "/s)</span>") : $("#influencers").append(" <span class='text-success'>(" + math.format(influencersPerSecond, 3) + "/s)</span>");

            let postsPerSecond = math.evaluate(postFormula() / ((research.browseReddit.max / research.browseReddit.increase) / (research.browseReddit.speed / 1000)) * research.browseReddit.speedModifier);
            research.posts < 1000000 ? $("#posts").html(research.posts.toFixed(2)) : $("#posts").html(math.format(research.posts, 3));
            postsPerSecond < 1000000 ? $("#posts").append(" <span class='text-success'>(" + postsPerSecond.toFixed(2) + "/s)</span>") : $("#posts").append(" <span class='text-success'>(" + math.format(postsPerSecond, 3) + "/s)</span>");

            let postGrowthRate = postGrowthPerSecond();
            postFormula() < 1000000 ? $("#postGrowth").html(postFormula().toFixed(4)) : $("#postGrowth").html(math.format(postFormula(), 3));
            if (postGrowthRate > 0) {
                postGrowthRate < 1000000 ? $("#postGrowth").append(" <span class='text-success'>(" + postGrowthRate.toFixed(4) + "/s)</span>") : $("#postGrowth").append(" <span class='text-success'>(" + math.format(postGrowthRate, 3) + "/s)</span>");
            }

            let researchRate = researchPointsPerSecond();
            research.points < 1000000 ? $("#research").html(research.points.toFixed(2)) : $("#research").html(math.format(research.points, 3));
            researchRate < 1000000 ? $("#research").append(" <span class='text-success'>(" + researchRate.toFixed(3) + "/s)</span>") : $("#research").append(" <span class='text-success'>(" + math.format(researchRate, 3) + "/s)</span>");

            let botsPerSecond = math.evaluate(research.botGrowth / ((research.codeBots.max / research.codeBots.increase) / (research.codeBots.speed / 1000)) * research.codeBots.speedModifier);
            research.bots < 1000000 ? $("#bots").html(research.bots.toFixed(2)) : $("#bots").html(math.format(research.bots, 3));
            botsPerSecond < 1000000 ? $("#bots").append(" <span class='text-success'>(" + botsPerSecond.toFixed(4) + "/s)</span>") : $("#bots").append(" <span class='text-success'>(" + math.format(botsPerSecond, 3) + "/s)</span>");

            checkUpgradeDisable(upgrades, stats.money, "upgrade", false);
            checkUpgradeDisable(bodyweight.upgrades, stats.money, "bwUpgrade", false);
            checkUpgradeDisable(job.upgrades, job.followers, "jobUpgrade", true);
            checkUpgradeDisable(research.upgrades, research.points, "resUpgrade", false);
        }
        else {
            $("#trainMembersProgress").css("width", ((gym.trainMembers.current / gym.trainMembers.max) * 100) + "%");
            $("#createClassesProgress").css("width", ((gym.createClasses.current / gym.createClasses.max) * 100) + "%");
            $("#runCampaignProgress").css("width", ((gym.runCampaigns.current / gym.runCampaigns.max) * 100) + "%");
            $("#designAdProgress").css("width", ((gym.designAds.current / gym.designAds.max) * 100) + "%");

            stats.money < 1000000 ? $("#money").html(stats.money.toFixed(2)) : $("#money").html(math.format(stats.money, 3));
            gymMoneyPerSecond() < 1000000 ? $("#money").append(" <span class='text-success'>(" + gymMoneyPerSecond().toFixed(3) + "/s)</span>") : $("#money").append(" <span class='text-success'>(" + math.format(gymMoneyPerSecond(), 3) + "/s)</span>");

            gym.members.current < 1000000 ? $("#members").html(gym.members.current.toFixed(2)) : $("#members").html(math.format(gym.members.current, 3));
            gymMembersPerSecond < 1000000 ? $("#members").append(" <span class='text-success'>(" + gymMembersPerSecond().toFixed(3) + "/s)</span>") : $("#members").append(" <span class='text-success'>(" + math.format(gymMembersPerSecond(), 3) + "/s)</span>");
            gym.members.capacity < 1000000 ? $("#capacity").html(gym.members.capacity.toFixed(2)) : $("#capacity").html(math.format(gym.members.capacity, 3));

            gymMembersTrainedPerSecond() < 1000000 ? $("#trainedPerSecond").html(" <span class='text-success'>(" + gymMembersTrainedPerSecond().toFixed(4) + "/s)</span>") : $("#trainedPerSecond").html(" <span class='text-success'>(" + math.format(gymMembersTrainedPerSecond(), 3) + "/s)</span>");

            gym.classes < 1000000 ? $("#classes").html(gym.classes.toFixed(2)) : $("#classes").html(math.format(gym.classes, 3));
            gymClassesPerSecond() < 1000000 ? $("#classes").append(" <span class='text-success'>(" + gymClassesPerSecond().toFixed(2) + "/s)</span>") : $("#classes").append(" <span class='text-success'>(" + math.format(gymClassesPerSecond(), 3) + "/s)</span>");

            gym.advertising.influence < 1000000 ? $("#influence").html(gym.advertising.influence.toFixed(2)) : $("#influence").html(math.format(gym.advertising.influence, 3));
            gymInfluencePerSecond() < 1000000 ? $("#influence").append(" <span class='text-success'>(" + gymInfluencePerSecond().toFixed(3) + "/s)</span>") : $("#influence").append(" <span class='text-success'>(" + math.format(gymInfluencePerSecond(), 3) + "/s)</span>");

            gym.advertising.campaigns < 1000000 ? $("#campaigns").html(gym.advertising.campaigns.toFixed(2)) : $("#campaigns").html(math.format(gym.advertising.campaigns, 3));
            gymCampaignsPerSecond() < 1000000 ? $("#campaigns").append(" <span class='text-success'>(" + gymCampaignsPerSecond().toFixed(3) + "/s)</span>") : $("#campaigns").append(" <span class='text-success'>(" + math.format(gymCampaignsPerSecond(), 3) + "/s)</span>");

            gymCampaignFormula() < 1000000 ? $("#campaignGrowth").html(gymCampaignFormula().toFixed(2)) : $("#campaignGrowth").html(math.format(gymCampaignFormula(), 3));
            gymCampaignGrowthPerSecond() < 1000000 ? $("#campaignGrowth").append(" <span class='text-success'>(" + gymCampaignGrowthPerSecond().toFixed(4) + "/s)</span>") : $("#campaignGrowth").append(" <span class='text-success'>(" + math.format(gymCampaignGrowthPerSecond(), 3) + "/s)</span>");

            gym.advertising.ads < 1000000 ? $("#adsDesigned").html(gym.advertising.ads.toFixed(2)) : $("#adsDesigned").html(math.format(gym.advertising.ads, 3));
            gymAdsPerSecond() < 1000000 ? $("#adsDesigned").append(" <span class='text-success'>(" + gymAdsPerSecond().toFixed(3) + "/s)</span>") : $("#adsDesigned").append(" <span class='text-success'>(" + math.format(gymAdsPerSecond(), 3) + "/s)</span>");

            checkUpgradeDisable(gym.upgrades, stats.money, "upgrade", false);

            checkUpgradeDisable(gym.gymUpgrades, stats.money, "gymUpgrade", false);
            checkUpgradeDisable(gym.adUpgrades, gym.advertising.influence, "adUpgrade", false);

            checkEmployeeDisable(gym.employees.sales, stats.money, "sales");
            checkEmployeeDisable(gym.employees.trainers, stats.money, "trainer");
            checkEmployeeDisable(gym.employees.coordinators, stats.money, "coordinator");
            checkEmployeeDisable(gym.employees.nutritionists, stats.money, "nutritionist");
            checkEmployeeDisable(gym.advertising.employees.coordinators, stats.money, "adCoordinator");
            checkEmployeeDisable(gym.advertising.employees.designers, stats.money, "designer");
            checkEmployeeDisable(gym.advertising.employees.managers, stats.money, "manager");

            $("#nutritionistMulti").html(math.evaluate(gym.employees.nutritionists.boost * 100))
            $("#managerMulti").html(math.evaluate(gym.advertising.employees.managers.boost * 100))

            if (prestige.bw.confidence > 0) {
                $("#confidenceWrap").removeClass("d-none");
            }
            $("#confidence").html(formatMetaPoints(prestige.bw.confidence));

            if (prestige.lifting.leadership > 0) {
                $("#leadershipWrap").removeClass("d-none");
            }
            $("#leadership").html(formatMetaPoints(prestige.lifting.leadership));
            if (prestige.yoga.flow > 0 || hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0)) {
                $("#flowWrap").removeClass("d-none");
            }
            $("#flow").html(formatMetaPoints(prestige.yoga.flow));
            if (prestige.cardio.pace > 0 || hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 0)) {
                $("#paceWrap").removeClass("d-none");
            }
            $("#pace").html(formatMetaPoints(prestige.cardio.pace));

            checkPrestigeUpgradeDisable(prestige.bw.confidenceUpgrades, prestige.bw.confidence, "confidenceUpgrade");
            checkPrestigeUpgradeDisable(prestige.lifting.leadershipUpgrades, prestige.lifting.leadership, "leadershipUpgrade");
            checkPrestigeUpgradeDisable(prestige.yoga.upgrades, prestige.yoga.current, "globalYogaUpgrade");
            checkPrestigeUpgradeDisable(prestige.yoga.flowUpgrades, prestige.yoga.flow, "flowUpgrade");
            checkPrestigeUpgradeDisable(prestige.cardio.upgrades, prestige.cardio.current, "globalCardioUpgrade");
            checkPrestigeUpgradeDisable(prestige.cardio.paceUpgrades, prestige.cardio.pace, "paceUpgrade");

            for (let i = 0; i < gym.members.tiers.length; i++) {
                let amountAtTier = math.evaluate(gym.members.tiers[i].current * ((gym.money.growth * (gym.members.tiers[i].multiplier * (i + 1)))));
                $("#gymMemberTier" + i).html(gym.members.tiers[i].current.toFixed(3));
                amountAtTier < 1000000 ? $("#gymAmountTier" + i).html("<span class='text-success'>$" + amountAtTier.toFixed(4) + "/s</span>") : $("#gymAmountTier").html("<span class='text-success'>$" + math.format(gymAdsPerSecond(), 3) + "/s</span>");
            }

            let classMulti = getClassMoneyMultiplier();
            classMulti < 1000000 ? $("#classMulti").html(classMulti.toFixed(3) + "x") : $("#classMulti").html(math.format(classMulti, 3) + "x");
            updateMinigameTabLabel();

            let yogaUnlockPurchased = hasPurchasedPrestigeUpgrade(prestige.upgrades, 33);
            if (yogaUnlockPurchased || checks.gymType === 2) {
                $("#globalYogaUpgradesModalTrigger").removeClass("d-none");
                $("#newGymYoga").removeClass("d-none");
            }
            else {
                $("#globalYogaUpgradesModalTrigger").addClass("d-none");
                $("#newGymYoga").addClass("d-none");
            }
            let cardioUnlockPurchased = hasPurchasedPrestigeUpgrade(prestige.upgrades, 43);
            if (cardioUnlockPurchased || checks.gymType === 3) {
                $("#globalCardioUpgradesModalTrigger").removeClass("d-none");
                $("#newGymCardio").removeClass("d-none");
            }
            else {
                $("#globalCardioUpgradesModalTrigger").addClass("d-none");
                $("#newGymCardio").addClass("d-none");
            }

            switch (checks.gymType) {
                case 0:
                    if (prestige.bw.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                        writeGangInfo();
                    }
                    checkUpgradeDisable(gym.bw.upgrades, stats.money, "bwUpgrade", false);
                    checkUpgradeDisable(gym.bw.gymUpgrades, stats.money, "gymBwUpgrade", false);
                    checkUpgradeDisable(gym.bw.adUpgrades, gym.advertising.influence, "adBwUpgrade", false);
                    break;
                case 1:
                    checkUpgradeDisable(gym.lifting.upgrades, stats.money, "liftingUpgrade", false);
                    checkUpgradeDisable(gym.lifting.gymUpgrades, stats.money, "gymLiftingUpgrade", false);
                    checkUpgradeDisable(gym.lifting.adUpgrades, gym.advertising.influence, "adLiftingUpgrade", false);
                    if (prestige.lifting.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                        writeCompInfo();
                    }
                    
                    break;
                case 2:
                    checkUpgradeDisable(gym.yoga.upgrades, stats.money, "yogaUpgrade", false);
                    checkUpgradeDisable(gym.yoga.gymUpgrades, stats.money, "gymYogaUpgrade", false);
                    checkUpgradeDisable(gym.yoga.adUpgrades, gym.advertising.influence, "adYogaUpgrade", false);
                    if (prestige.yoga.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                        writeCompInfo();
                    }
                    break;
                case 3:
                    checkUpgradeDisable(gym.cardio.upgrades, stats.money, "cardioUpgrade", false);
                    checkUpgradeDisable(gym.cardio.gymUpgrades, stats.money, "gymCardioUpgrade", false);
                    checkUpgradeDisable(gym.cardio.adUpgrades, gym.advertising.influence, "adCardioUpgrade", false);
                    if (prestige.cardio.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 0 })[0].isPurchased) {
                        writeCompInfo();
                    }
                    break;
                default:
            }
        }

        updateDebugEffectiveSpeedEstimate();
        assertValidState("setup_refresh");
    }, 50);
}

//#region energy

function setupEnergyTimer() {
    energyTimerId = setInterval(function () {
        // Keep energy max derived in the runtime loop so deterministic simulations
        // can run without UI-refresh intervals.
        stats.energy.max = math.evaluate(
            stats.energy.originalMax *
            ((stats.endurance * stats.enduranceBoost) + 1) *
            getFlowMaxEnergyMultiplier() *
            getPaceMaxEnergyMultiplier() *
            getRepeatingYogaMaxEnergyMultiplier() *
            getRepeatingCardioMaxEnergyMultiplier() *
            (hasEnduranceEngineMastery() ? 1.10 : 1)
        );
        if (stats.energy.current > stats.energy.max) {
            stats.energy.current = stats.energy.max;
        }

        if (stats.energy.current < stats.energy.max) {
            let increase = math.evaluate(
                math.mul(
                    (stats.energy.increase * ((stats.agility * stats.agilityBoost) + 1)),
                math.mul(
                    math.mul(math.mul(getYogaRecoveryProtocolEnergyMultiplier(), getFlowShopEnergyMultiplier()), getPaceShopRecoveryMultiplier()),
                    math.mul(
                        math.mul(getFlowEnergyRecoveryMultiplier(), getPaceEnergyRecoveryMultiplier()),
                        math.mul(getRepeatingYogaRecoveryMultiplier(), getRepeatingGlobalRecoveryMultiplier())
                    )
                )
            )
        );
            if (math.evaluate(stats.energy.current + increase) > stats.energy.max) {
                stats.energy.current = stats.energy.max;
            }
            else {
                if (stats.energy.coffee.isActive) {
                    if ((stats.energy.current + (increase * stats.energy.coffee.boost)) > stats.energy.max) {
                        stats.energy.current = stats.energy.max;
                    }
                    else {
                        stats.energy.current = math.add(stats.energy.current, math.mul(increase, stats.energy.coffee.boost));
                    }
                }
                else {
                    stats.energy.current = math.add(stats.energy.current, increase);
                }
            }
        }
        else {
            checks.isResting = false;
        }

        renderEnergyProgressBar();
    }, getScaledTimerDelay(stats.energy.speed))
}

function drinkCoffee() {
    if (!$("#coffeeBtn").hasClass("disabled")) {
        $("#coffeeBtn").addClass("disabled");
        stats.energy.coffee.total += 1;
        stats.energy.coffee.isActive = true;
        stats.energy.coffee.isCooldown = true;
        setupCoffeeTimer();
    }
}

function getPayDay() {
    if (!$("#payDayBtn").hasClass("disabled")) {
        $("#payDayBtn").addClass("disabled");
        stats.payday.total += 1;
        stats.payday.isCooldown = true;
        if (checks.gymType == -1) {
            let paydayIncome = math.mul(jobMoneyPerSecond(), stats.payday.boost);
            if (math.add(stats.money, paydayIncome) > 0) {
                stats.money = math.add(stats.money, paydayIncome);
                addRunGain("moneyEarned", paydayIncome);
            }
            else {
                stats.money = 0;
            }
        }
        else {
            let paydayIncome = math.mul(gymMoneyPerSecond(), stats.payday.boost);
            stats.money = math.add(stats.money, paydayIncome);
            stats.money = math.min(stats.money, 1e200);
            addRunGain("moneyEarned", paydayIncome);
        }
        setupPayDayTimer();
    }
}

function setupCoffeeTimer() {
    coffeeTimerId = setInterval(function () {
        if (stats.energy.coffee.current < stats.energy.coffee.timer) {
            stats.energy.coffee.current += 1;
        }
        else {
            stats.energy.coffee.isActive = false;
            if (stats.energy.coffee.current < stats.energy.coffee.cooldown) {
                stats.energy.coffee.current += 1;
            }
            else {
                stats.energy.coffee.current = 0;
                stats.energy.coffee.isCooldown = false;
            }
        }
    }, getScaledTimerDelay(1000));
}

function setupPayDayTimer() {
    payDayTimerId = setInterval(function () {
        if (stats.payday.current < stats.payday.cooldown) {
            stats.payday.current += 1;
        }
        else {
            stats.payday.current = 0;
            stats.payday.isCooldown = false;
        }
    }, getScaledTimerDelay(1000));
}

//#endregion

//#region generic functions

function trimUpgradeSaveData(upgradeArray) {
    for (let i = 0; i < upgradeArray.length; i++) {
        upgradeArray[i].name = "";
        upgradeArray[i].desc = "";
    }
}

function writeMetaPointShop(parentDivText, divText, titleText, pointsLabel, pointsTextId, upgradeArray, buttonPrefix, clickFunction, points) {
    if (!Array.isArray(upgradeArray) || upgradeArray.length === 0) {
        return;
    }

    $("#" + parentDivText).append("<hr /><h6>" + titleText + "</h6><p class='text-info'>" + pointsLabel + ": <span id='" + pointsTextId + "'>" + formatPrestigePoints(points) + "</span></p><div id='" + divText + "'></div>");
    writeAllPrestigeUpgrades(upgradeArray, divText, buttonPrefix, clickFunction, points);
}

function writeAllUpgrades(array1, array2, divText, text1, text2, function1, function2) {
    tempUpgrades = array1;
    if (array2 != null) {
        tempUpgrades = tempUpgrades.concat(array2);
    }
    tempUpgrades.sort(function (a, b) {
        return a.name < b.name ? 1 : -1
    });
    tempUpgrades.sort(function (a, b) {
        return a.cost > b.cost ? 1 : -1
    });

    if (array2 != null) {
        for (let i = 0; i < tempUpgrades.length; i++) {
            for (let j = 0; j < array1.length; j++) {
                if (tempUpgrades[i] == array1[j]) {
                    let active = "";
                    if (!array1[j].isActive) {
                        active = "d-none";
                    }
                    $("#" + divText).append("<div class='" + active + "' id='" + text1 + "" + array1[j].id + "'><button type='button' id='" + text1 + "Btn" + array1[j].id + "' class='btn btn-secondary btn-block disabled' onclick='" + function1 + "(this);'>" + array1[j].name + "</button><p id='" + text1 + "Desc" + array1[j].id + "'>" + array1[j].desc + "</p></div>");
                }
            }

            for (let j = 0; j < array2.length; j++) {
                if (tempUpgrades[i] == array2[j]) {
                    let active = "";
                    if (!array2[j].isActive) {
                        active = "d-none";
                    }
                    $("#" + divText).append("<div class='" + active + "' id='" + text2 + "" + array2[j].id + "'><button type='button' id='" + text2 + "Btn" + array2[j].id + "' class='btn btn-secondary btn-block disabled' onclick='" + function2 + "(this);'>" + array2[j].name + "</button><p id='" + text2 + "Desc" + array2[j].id + "'>" + array2[j].desc + "</p></div>");
                }
            }
        }
    }
    else {
        for (let i = 0; i < tempUpgrades.length; i++) {
            let active = "";
            if (!tempUpgrades[i].isActive) {
                active = "d-none";
            }
            $("#" + divText).append("<div class='" + active + "' id='" + text1 + "" + tempUpgrades[i].id + "'><button type='button' id='" + text1 + "Btn" + tempUpgrades[i].id + "' class='btn btn-secondary btn-block disabled' onclick='" + function1 + "(this);'>" + tempUpgrades[i].name + "</button><p id='" + text1 + "Desc" + tempUpgrades[i].id + "'>" + tempUpgrades[i].desc + "</p></div>");
        }
    }
}

function writeAllPrestigeUpgrades(array1, divText, text1, function1, points) {
    tempUpgrades = array1;
    tempUpgrades.sort(function (a, b) {
        return a.name < b.name ? 1 : -1
    });
    tempUpgrades.sort(function (a, b) {
        return a.cost > b.cost ? 1 : -1
    });


    // split into 3 columns
    let rowId = 0;
    for (let i = 0; i < tempUpgrades.length; i++) {
        let classes = "";
        if (tempUpgrades[i].isPurchased) {
            classes = " btn-success disabled";
        }
        else if (points >= tempUpgrades[i].cost) {
            classes = " btn-primary";
        }
        else {
            classes = " btn-secondary disabled";
        }
        if (((i + 3) % 3) == 0) {
            rowId += 1;
            $("#" + divText).append("<div id='" + divText + "Row" + rowId + "' class='row'></div>");
        }
        $("#" + divText + "Row" + rowId).append("<div class='col'><div id='" + text1 + "" + tempUpgrades[i].id + "'><button type='button' id='" + text1 + "Btn" + tempUpgrades[i].id + "' class='btn btn-block" + classes + "' onclick='" + function1 + "(this, false);'>" + tempUpgrades[i].name + "</button><p id='" + text1 + "Desc" + tempUpgrades[i].id + "'>" + tempUpgrades[i].desc + "</p></div></div>");
    }
    if (((tempUpgrades.length) % 3) == 1) {
        $("#" + divText + "Row" + rowId).append("<div class='col'></div><div class='col'></div>");
    }
    else if (((tempUpgrades.length) % 3) == 2) {
        $("#" + divText + "Row" + rowId).append("<div class='col'></div>");
    }
}

function updateUpgradesAfterLoad(upgradeArray, saveDataArray) {
    try {
        let purchasedArray = [];
        let purchased = false;
        let active = false;
        for (let i = 0; upgradeArray.length > i; i++) {
            purchased = false;
            active = false;
            for (let j = 0; saveDataArray.length > j; j++) {
                if (upgradeArray[i].id == saveDataArray[j].id) {
                    if (saveDataArray[j].isPurchased) {
                        purchased = true;
                    }
                    if (saveDataArray[j].isActive) {
                        active = true;
                    }
                    if (purchased || active) {
                        let valueToPush = new Array();
                        valueToPush[0] = upgradeArray[i].id;
                        valueToPush[1] = saveDataArray[j].isPurchased;
                        valueToPush[2] = saveDataArray[j].isActive
                        purchasedArray.push(valueToPush);
                    }
                }
            }
        }
        saveDataArray = JSON.parse(JSON.stringify(upgradeArray));

        for (let i = 0; saveDataArray.length > i; i++) {
            for (let j = 0; purchasedArray.length > j; j++) {
                if (saveDataArray[i].id == purchasedArray[j][0]) {
                    if (purchasedArray[j][1] == true) {
                        saveDataArray[i].isPurchased = true;
                    }
                    if (purchasedArray[j][2] == true) {
                        saveDataArray[i].isActive = true;
                    }
                }
            }
        }
        upgradeArray = JSON.parse(JSON.stringify(saveDataArray));
        return upgradeArray;
    }
    catch (ex) {
        console.log(ex);
    }
}

function checkUpgradeDisable(upgradeArray, points, text, jobCheck) {
    for (let i = 0; i < upgradeArray.length; i++) {
        if (points > (upgradeArray[i].cost / 4) && !upgradeArray[i].isPurchased) {
            upgradeArray[i].isActive = true;
            if (jobCheck) {
                if ((upgradeArray[i].id == 3 && bodyweight.upgrades.filter(function (upgradeArray) { return upgradeArray.id == 1 })[0].isPurchased) || upgradeArray[i].id != 3) {
                    $("#" + text + upgradeArray[i].id).removeClass("d-none");
                }
                else {
                    $("#" + text + upgradeArray[i].id).addClass("d-none");
                }
            }
            else {
                $("#" + text + upgradeArray[i].id).removeClass("d-none");
            }

            if (points >= upgradeArray[i].cost) {
                $("#" + text + "Btn" + upgradeArray[i].id).removeClass("disabled").removeClass("btn-secondary").addClass("btn-primary");
            }
            else {
                $("#" + text + "Btn" + upgradeArray[i].id).addClass("disabled").removeClass("btn-primary").addClass("btn-secondary");
            }
        }
        else {
            if (upgradeArray[i].isPurchased) {
                $("#" + text + upgradeArray[i].id).addClass("d-none");
            }
            else if (upgradeArray[i].isActive) {
                $("#" + text + "Btn" + upgradeArray[i].id).addClass("disabled").removeClass("btn-primary").addClass("btn-secondary");
            }
        }
    }
}

function checkEmployeeDisable(employee, points, text) {
    let cost = getEmployeeCost(employee);
    cost < 1000000 ? $("#" + text + "Cost").html(cost.toFixed(0)) : $("#" + text + "Cost").html(math.format(cost, 3));
    $("#" + text + "Owned").html(employee.current);
    if (points >= cost) {
        $("#" + text + "Btn").removeClass("disabled").removeClass("btn-secondary").addClass("btn-outline-warning");
    }
    else {
        $("#" + text + "Btn").addClass("disabled").removeClass("btn-outline-warning").addClass("btn-secondary");
    }
}

function checkLiftingCompDisable(compType, text, previousCompType, text2) {
    let cost = compType.cost
    cost < 1000000 ? $("#" + text + "Cost").html(cost.toFixed(0)) : $("#" + text + "Cost").html(math.format(cost, 3));
    $("#" + text + "Owned").html(compType.current);
    if (lifting.comps.competitions.current >= cost && !compType.hidden) {
        if (previousCompType != null) {
            previousCompType.hidden = true;
        }
        $("#" + text + "Btn").removeClass("disabled").removeClass("btn-secondary").addClass("btn-outline-warning");
    }
    else {
        $("#" + text + "Btn").addClass("disabled").removeClass("btn-outline-warning").addClass("btn-secondary");
    }
    if (previousCompType != null && previousCompType.hidden) {
        $("#" + text2 + "Wrap").addClass("d-none");
        $("#" + text2 + "Btn").addClass("disabled");
    }
    else if (previousCompType != null) {
        $("#" + text2 + "Wrap").removeClass("d-none");
    }
    else {
        if (compType.current > 0) {
            $("#createCompBtn").addClass("d-none");
        }
    }
}

function checkPrestigeUpgradeDisable(upgradeArray, points, text) {
    let normalizedPoints = normalizePrestigePoints(points);
    for (let i = 0; i < upgradeArray.length; i++) {
        if (!upgradeArray[i].isPurchased) {
            upgradeArray[i].isActive = true;

            if (canAffordPrestigeCost(normalizedPoints, upgradeArray[i].cost)) {
                $("#" + text + "Btn" + upgradeArray[i].id).removeClass("disabled").removeClass("btn-secondary").addClass("btn-primary");
            }
            else {
                $("#" + text + "Btn" + upgradeArray[i].id).addClass("disabled").removeClass("btn-primary").addClass("btn-secondary");
            }
        }
        else {
            $("#" + text + "Btn" + upgradeArray[i].id).addClass("disabled").removeClass("btn-secondary").removeClass("btn-primary").addClass("btn-success");
        }
    }
}

function fightGang() {
    if (!$("#gangFightBtn").hasClass("disabled")) {
        $("#gangFightBtn").addClass("disabled");
        $("#gangFight").removeClass("d-none");
        let found = false;
        bodyweight.gang.playerFightPowerTemp = gangPower(bodyweight.gang.strength, bodyweight.gang.members);
        for (let i = 0; i < bodyweight.gang.rivals.length; i++) {
            if (!bodyweight.gang.rivals[i].isAbsorbed && !found) {
                found = true;
                bodyweight.gang.rivalFightPowerTemp = gangPower(bodyweight.gang.rivals[i].strength, bodyweight.gang.rivals[i].members);
                bodyweight.gang.rivalId = i;
            }
        }


        fightGangTimerId = setInterval(function () {
            let playerValue = math.evaluate(gangPower(bodyweight.gang.strength, bodyweight.gang.members));
            let rivalValue = math.evaluate(gangPower(bodyweight.gang.rivals[bodyweight.gang.rivalId].strength, bodyweight.gang.rivals[bodyweight.gang.rivalId].members));

            let playerRandom = math.random(0, playerValue);
            let rivalRandom = math.random(0, rivalValue);

            let combined = bodyweight.gang.playerFightPowerTemp + bodyweight.gang.rivalFightPowerTemp;

            if (playerRandom >= rivalRandom) {
                let rivalPowerSwing = math.mul(gangPower(bodyweight.gang.rivals[bodyweight.gang.rivalId].strength, bodyweight.gang.rivals[bodyweight.gang.rivalId].members), 0.06);
                bodyweight.gang.playerFightPowerTemp = math.add(bodyweight.gang.playerFightPowerTemp, rivalPowerSwing);
                bodyweight.gang.rivalFightPowerTemp = math.sub(bodyweight.gang.rivalFightPowerTemp, rivalPowerSwing);
            }
            else {
                let playerPowerSwing = math.mul(gangPower(bodyweight.gang.strength, bodyweight.gang.members), 0.06);
                bodyweight.gang.playerFightPowerTemp = math.sub(bodyweight.gang.playerFightPowerTemp, playerPowerSwing);
                bodyweight.gang.rivalFightPowerTemp = math.add(bodyweight.gang.rivalFightPowerTemp, playerPowerSwing);
            }
            let winner = false;
            // is there a winner
            if (bodyweight.gang.rivalFightPowerTemp < 0) {
                if (math.mul(gangPower(bodyweight.gang.strength, bodyweight.gang.members), 0.4) >= gangPower(bodyweight.gang.rivals[bodyweight.gang.rivalId].strength, bodyweight.gang.rivals[bodyweight.gang.rivalId].members)) {
                    bodyweight.gang.rivals[bodyweight.gang.rivalId].isAbsorbed = true;
                    let confidenceGain = getConfidencePerGangAbsorb();
                    $("#gangWinLoseMessage").prepend("<div id='gangWinLoseAlert' class='alert alert-success alert-dismissible fade show' role='alert'><strong>All of the " + bodyweight.gang.rivals[bodyweight.gang.rivalId].name + " have joined me now!</strong> I've gained " + confidenceGain.toFixed(2) + " confidence and they brought along $" + bodyweight.gang.rivals[bodyweight.gang.rivalId].members.toFixed(2) + "! On to the next contender.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
                    stats.money = math.add(stats.money, bodyweight.gang.rivals[bodyweight.gang.rivalId].members);
                    addRunGain("moneyEarned", bodyweight.gang.rivals[bodyweight.gang.rivalId].members);
                    bodyweight.gang.members = math.add(bodyweight.gang.members, bodyweight.gang.rivals[bodyweight.gang.rivalId].members);

                    // gain confidence points
                    prestige.bw.confidence = math.add(prestige.bw.confidence, confidenceGain);

                }
                else {
                    $("#gangWinLoseMessage").prepend("<div id='gangWinLoseAlert' class='alert alert-success alert-dismissible fade show' role='alert'><strong>Success!</strong> 10% of their members joined me!<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
                }

                setTimeout(function () {
                    $("#gangWinLoseAlert").alert('close');
                }, 10000);

                let members = math.mul(bodyweight.gang.rivals[bodyweight.gang.rivalId].members, 0.1);
                bodyweight.gang.members = math.add(bodyweight.gang.members, members);
                bodyweight.gang.rivals[bodyweight.gang.rivalId].members = math.sub(bodyweight.gang.rivals[bodyweight.gang.rivalId].members, members);
                bodyweight.gang.rivals[bodyweight.gang.rivalId].isDefeated = true;

                winner = true;
            }
            else if (bodyweight.gang.playerFightPowerTemp < 0) {
                $("#gangWinLoseMessage").append("<div id='gangWinLoseAlert' class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Failure!</strong> 10% of my members left to join them!<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");

                setTimeout(function () {
                    $("#gangWinLoseAlert").alert('close');
                }, 10000);

                let members = math.mul(bodyweight.gang.members, 0.1);
                bodyweight.gang.members = math.sub(bodyweight.gang.members, members);
                bodyweight.gang.rivals[bodyweight.gang.rivalId].members = math.add(bodyweight.gang.rivals[bodyweight.gang.rivalId].members, members);
                winner = true;
            }

            if (winner) {
                $("#gangFight").addClass("d-none");
                $("#gangFightBtn").removeClass("disabled");
                clearInterval(fightGangTimerId);
            }
            else {
                $("#gangFightProgress").css("width", ((bodyweight.gang.playerFightPowerTemp / combined) * 100) + "%");
            }
        }, getScaledTimerDelay(50));
    }
}

function addGangStrength() {
    bodyweight.gang.strength = math.add(bodyweight.gang.strength, gangStrengthPerSecond());
    writeGangInfo();
}

function addGangMembers() {
    bodyweight.gang.members = math.add(bodyweight.gang.members, gangMembersPerSecond());
    writeGangInfo();
}

function gangPower(strength, members) {
    return math.mul(strength, members);
}

function changeGangName() {
    bodyweight.gang.name = $("#gangNameInput").val();
    $("#gangName").html(bodyweight.gang.name);
    $("#editGangNameGroup").addClass("d-none");
}

function editGangName() {
    $("#editGangNameGroup").removeClass("d-none");
}
function writeGangInfo() {
    let _gangPower = gangPower(bodyweight.gang.strength, bodyweight.gang.members)
    bodyweight.gang.strength < 1000000 ? $("#gangStrength").html(bodyweight.gang.strength.toFixed(2)) : $("#gangStrength").html(math.format(bodyweight.gang.strength, 3));
    bodyweight.gang.members < 1000000 ? $("#gangMembers").html(bodyweight.gang.members.toFixed(2)) : $("#gangMembers").html(math.format(bodyweight.gang.members, 3));
    _gangPower < 1000000 ? $("#gangPower").html(_gangPower.toFixed(2)) : $("#gangPower").html(math.format(_gangPower, 3));

    let found = false;
    for (let i = 0; i < bodyweight.gang.rivals.length; i++) {
        if (!bodyweight.gang.rivals[i].isAbsorbed && !found) {
            found = true;
            let rivalPower = gangPower(bodyweight.gang.rivals[i].strength, bodyweight.gang.rivals[i].members);
            $("#rivalGangName").html(bodyweight.gang.rivals[i].name);
            $("#rivalGangDesc").html(bodyweight.gang.rivals[i].desc);
            bodyweight.gang.rivals[i].strength < 1000000 ? $("#rivalGangStrength").html(bodyweight.gang.rivals[i].strength.toFixed(2)) : $("#rivalGangStrength").html(math.format(bodyweight.gang.rivals[i].strength, 3));
            bodyweight.gang.rivals[i].members < 1000000 ? $("#rivalGangMembers").html(bodyweight.gang.rivals[i].members.toFixed(2)) : $("#rivalGangMembers").html(math.format(bodyweight.gang.rivals[i].members, 3));
            rivalPower < 1000000 ? $("#rivalGangPower").html(rivalPower.toFixed(2)) : $("#rivalGangPower").html(math.format(rivalPower, 3));

            if (math.mul(_gangPower, 0.4) >= rivalPower) {
                $("#gangFightBtn").html("Absorb Gang");
            }
            else {
                $("#gangFightBtn").html("Compete Against Gang");
            }
        }
    }
    if (!found) {
        $("#gangRivalWrap").addClass("d-none");
        $("#gangCompleteWrap").removeClass("d-none");
    }
}

function ordinalSuffix(value) {
    let mod100 = value % 100;
    if (mod100 >= 11 && mod100 <= 13) {
        return "th";
    }
    switch (value % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

function writeCompInfo() {
    if (checks.gymType === 3) {
        $("#liftingCompWrap").addClass("d-none");
        $("#academyUpgradeCol").addClass("d-none");
        $("#yogaFlowWrap").addClass("d-none");
        $("#flowUpgradeCol").addClass("d-none");
        $("#cardioRaceWrap").removeClass("d-none");

        let intervalState = ensureCardioIntervalState();
        let activeRace = getActiveCardioRaceDefinition(intervalState);
        let runPaceCap = getCardioPaceRunCap();
        $("#cardioRaceName").html(activeRace == null ? "No race selected" : activeRace.name);
        $("#cardioRacePlace").html((intervalState.currentPlace || 3) + ordinalSuffix(intervalState.currentPlace || 3));
        $("#cardioRaceFatigue").html((math.mul(intervalState.fatigue || 0, 100)).toFixed(1) + "%");
        $("#cardioRaceCompleted").html(math.floor(intervalState.totalRaces));
        $("#cardioRaceQuality").html((math.mul(intervalState.averageQuality || 0, 100)).toFixed(1) + "%");
        $("#cardioRaceLastQuality").html((math.mul(intervalState.lastQuality || 0, 100)).toFixed(1) + "%");
        $("#cardioRaceYouBar").css("width", (math.min(1, intervalState.playerProgress || 0) * 100) + "%");
        $("#cardioRaceRival1Bar").css("width", (math.min(1, intervalState.rival1Progress || 0) * 100) + "%");
        $("#cardioRaceRival2Bar").css("width", (math.min(1, intervalState.rival2Progress || 0) * 100) + "%");
        $("#cardioRaceYouText").html((math.mul(math.min(1, intervalState.playerProgress || 0), 100)).toFixed(1) + "%");
        $("#cardioRaceRival1Text").html((math.mul(math.min(1, intervalState.rival1Progress || 0), 100)).toFixed(1) + "%");
        $("#cardioRaceRival2Text").html((math.mul(math.min(1, intervalState.rival2Progress || 0), 100)).toFixed(1) + "%");
        $("#cardioRaceCycleProgress").css("width", (math.min(1, math.div(intervalState.runEarned, runPaceCap)) * 100) + "%");

        for (let optionIndex = 0; optionIndex < CARDIO_RACE_DEFINITIONS.length; optionIndex++) {
            let button = $("#cardioRaceOption" + optionIndex);
            if (button.length === 0) {
                continue;
            }
            let option = CARDIO_RACE_DEFINITIONS[optionIndex];
            let paceBonus = math.mul(math.sub(option.progressMultiplier, 1), 100);
            let rewardBonus = math.mul(math.sub(option.rewardMultiplier, 1), 100);
            let isActive = intervalState.activeRaceId === option.id;
            let canSelect = intervalState.activeRaceId === "";
            button.html(option.name + " - " + option.desc + " (" + (paceBonus >= 0 ? "+" : "") + paceBonus.toFixed(0) + "% speed, " + (rewardBonus >= 0 ? "+" : "") + rewardBonus.toFixed(0) + "% Pace)");
            button.removeClass("btn-outline-danger btn-success btn-secondary disabled");
            button.addClass(isActive ? "btn-success" : (canSelect ? "btn-outline-danger" : "btn-secondary"));
            button.prop("disabled", !canSelect);
            if (!canSelect) {
                button.addClass("disabled");
            }
        }

        let actionButtons = [
            { button: $("#cardioRacePushBtn"), action: "push", enabledClass: "btn-warning", idleClass: "btn-outline-warning" },
            { button: $("#cardioRaceSettleBtn"), action: "settle", enabledClass: "btn-info", idleClass: "btn-outline-info" },
            { button: $("#cardioRaceRecoverBtn"), action: "recover", enabledClass: "btn-success", idleClass: "btn-outline-success" },
        ];
        let hasActiveRace = activeRace != null;
        for (let actionIndex = 0; actionIndex < actionButtons.length; actionIndex++) {
            let actionButton = actionButtons[actionIndex];
            if (actionButton.button.length === 0) {
                continue;
            }
            actionButton.button.prop("disabled", !hasActiveRace);
            actionButton.button.toggleClass("disabled", !hasActiveRace);
            actionButton.button.removeClass(actionButton.enabledClass + " " + actionButton.idleClass);
            actionButton.button.addClass(hasActiveRace && intervalState.lastAction === actionButton.action ? actionButton.enabledClass : actionButton.idleClass);
        }

        let resetButton = $("#cardioRaceResetBtn");
        let canReset = activeRace != null;
        resetButton.prop("disabled", !canReset);
        resetButton.toggleClass("disabled", !canReset);

        let runEarnedText = intervalState.runEarned < 1000000 ? intervalState.runEarned.toFixed(2) : math.format(intervalState.runEarned, 3);
        if (intervalState.runEarned >= runPaceCap) {
            $("#cardioRaceHint").html("Pace cap reached for this run. Keep training for cardio points.");
        }
        else if (activeRace == null) {
            $("#cardioRaceHint").html("Pick a race, then use Push, Settle, and Recover to fight for position.");
        }
        else {
            let leaderProgress = math.max(intervalState.rival1Progress || 0, intervalState.rival2Progress || 0);
            let gap = math.sub(intervalState.playerProgress || 0, leaderProgress);
            let statusText = gap >= 0 ? "You are leading." : ("You trail by " + (math.mul(math.abs(gap), 100)).toFixed(1) + "%.");
            $("#cardioRaceHint").html(statusText + " Last finish quality " + (math.mul(intervalState.lastQuality || 0, 100)).toFixed(1) + "%, run Pace " + runEarnedText + ".");
        }
        return;
    }

    if (checks.gymType === 2) {
        $("#liftingCompWrap").addClass("d-none");
        $("#academyUpgradeCol").addClass("d-none");
        $("#yogaFlowWrap").removeClass("d-none");
        $("#flowUpgradeCol").removeClass("d-none");
        $("#cardioRaceWrap").addClass("d-none");

        let flowState = ensureYogaFlowState();
        if (flowState.draftOptions.length < 3) {
            generateYogaRouteDraftOptions(flowState);
        }
        let runFlowCap = getYogaFlowRunCap();
        let activeRoute = getActiveYogaRouteOption(flowState);
        if ($("#yogaRouteStability").length > 0) {
            $("#yogaRouteStability").html((math.mul(flowState.routeStability || 0, 100)).toFixed(1) + "%");
        }
        $("#yogaBreathPhase").html(activeRoute == null ? "No route selected" : (activeRoute.name + " (" + activeRoute.risk + ")"));
        $("#yogaBreathProgressText").html((math.mul(flowState.routeProgress || 0, 100)).toFixed(1) + "%");
        $("#yogaBreathCycles").html(math.floor(flowState.totalCycles));
        $("#yogaBreathQuality").html((math.mul(flowState.averageQuality || 0, 100)).toFixed(1) + "%");
        $("#yogaBreathPerfect").html(math.floor(flowState.perfectAnchors));
        $("#yogaBreathCycleProgress").css("width", (math.min(1, math.div(flowState.runEarned, runFlowCap)) * 100) + "%");
        for (let optionIndex = 0; optionIndex < 3; optionIndex++) {
            let button = $("#yogaRouteOption" + optionIndex);
            if (button.length === 0) {
                continue;
            }
            let option = flowState.draftOptions[optionIndex];
            if (option == null) {
                button.html("Route unavailable")
                    .addClass("disabled btn-secondary")
                    .removeClass("btn-outline-info btn-success")
                    .prop("disabled", true);
                continue;
            }

            let paceBonus = math.mul(math.sub(option.progressMultiplier, 1), 100);
            let rewardBonus = math.mul(math.sub(option.rewardMultiplier, 1), 100);
            let paceText = (paceBonus >= 0 ? "+" : "") + paceBonus.toFixed(0) + "% pace";
            let rewardText = (rewardBonus >= 0 ? "+" : "") + rewardBonus.toFixed(0) + "% flow";
            button.html(option.name + " (" + option.risk + ") - " + paceText + ", " + rewardText);
            let isActive = flowState.activeDraftIndex === optionIndex;
            let canSelect = flowState.activeDraftIndex === -1;
            button.removeClass("btn-outline-info btn-success btn-secondary disabled");
            button.addClass(isActive ? "btn-success" : (canSelect ? "btn-outline-info" : "btn-secondary"));
            button.prop("disabled", !canSelect);
            if (!canSelect) {
                button.addClass("disabled");
            }
        }

        let stabilizeButton = $("#yogaBreathAnchorBtn");
        if (stabilizeButton.length > 0) {
            let canStabilize = activeRoute != null;
            stabilizeButton.prop("disabled", !canStabilize);
            stabilizeButton.toggleClass("disabled", !canStabilize);
            stabilizeButton.html(canStabilize ? "Center Breath" : "Select Route First");
        }

        let runEarnedText = flowState.runEarned < 1000000 ? flowState.runEarned.toFixed(2) : math.format(flowState.runEarned, 3);
        if (flowState.runEarned >= runFlowCap) {
            $("#yogaBreathHint").html("Route cap reached for this run. Keep training for yoga points.");
        }
        else if (activeRoute == null) {
            $("#yogaBreathHint").html("Pick one route. Safer routes are steadier, riskier routes finish faster.");
        }
        else {
            let qualityText = (math.mul(flowState.lastPhaseQuality || 0, 100)).toFixed(1) + "%";
            $("#yogaBreathHint").html("Steady the route as needed (last quality " + qualityText + ", route gain " + runEarnedText + ").");
        }
        updateFlowUpgradeButtons();
        return;
    }

    $("#liftingCompWrap").removeClass("d-none");
    $("#academyUpgradeCol").removeClass("d-none");
    $("#yogaFlowWrap").addClass("d-none");
    $("#flowUpgradeCol").addClass("d-none");
    $("#cardioRaceWrap").addClass("d-none");

    let academy = ensureLiftingAcademyState();
    let seasonCap = getAcademySeasonCap();
    let seasonCapReached = academy.seasonsCompleted >= seasonCap;
    academy.credits < 1000000 ? $("#academyCredits").html(academy.credits.toFixed(2)) : $("#academyCredits").html(math.format(academy.credits, 3));
    let passiveCreditsPerSecond = getAcademyPassiveCreditsPerSecond();
    passiveCreditsPerSecond < 1000000
        ? $("#academyCreditsPerSecond").html(passiveCreditsPerSecond.toFixed(3))
        : $("#academyCreditsPerSecond").html(math.format(passiveCreditsPerSecond, 3));
    $("#academyPhase").html(seasonCapReached ? "Complete" : getAcademyPhaseName(academy.phase));
    if (seasonCapReached) {
        $("#academyProgress").html("Season cap reached");
    }
    else {
        let progressFormat = academy.progress < 1000000 ? academy.progress.toFixed(2) : math.format(academy.progress, 3);
        let targetFormat = academy.phaseTarget < 1000000 ? academy.phaseTarget.toFixed(2) : math.format(academy.phaseTarget, 3);
        $("#academyProgress").html(progressFormat + " / " + targetFormat);
    }
    $("#academySeasonsCompleted").html(academy.seasonsCompleted + " / " + seasonCap);
    $("#academyMoneyMulti").html(getCompetitionMoneyMultiplier().toFixed(2));

    $("#academyCampUnspent").html(academy.camp.unspentPoints);
    $("#academyCampStrength").html(academy.camp.strength);
    $("#academyCampTechnique").html(academy.camp.technique);
    $("#academyCampRecovery").html(academy.camp.recovery);
    $("#academyCampPromotion").html(academy.camp.promotion);
    let campPointBoostLevel = getAcademyCampPointBoostLevel();
    let campPointBoostCost = getAcademyCampPointBoostCost(campPointBoostLevel);
    let canAffordCampPointBoost = math.evaluate(academy.credits) >= campPointBoostCost;
    $("#academyCampPointBoostLevel").html(campPointBoostLevel);
    $("#academyCampPointBoostBtn")
        .html("Camp Expansion +" + (campPointBoostLevel + 1))
        .removeClass("btn-primary btn-secondary disabled")
        .addClass(canAffordCampPointBoost ? "btn-primary" : "btn-secondary disabled")
        .prop("disabled", !canAffordCampPointBoost);
    $("#academyCampPointBoostDesc").html(
        "<strong>Cost: " + (campPointBoostCost < 1000000 ? campPointBoostCost.toFixed(2) : math.format(campPointBoostCost, 3)) + " Academy Credits</strong> - Adds +1 permanent training-camp point."
    );

    updateAcademyUpgradeButtons();
}

function updateMinigameTabLabel() {
    if (checks.gymType === 3) {
        $("#comp-tab").html("Race Day");
        return;
    }
    if (checks.gymType === 2) {
        $("#comp-tab").html("Yoga Draft");
        return;
    }
    if (checks.gymType === 1) {
        $("#comp-tab").html("Lifting Academy");
        return;
    }
    $("#comp-tab").html("Minigame");
}

function calculateGlobalPrestigeGain() {
    return math.add(prestige.total, 1);
}

function getBodyweightTotalReps() {
    return math.add(
        math.add(
            math.add(bodyweight.pushups.total, bodyweight.rows.total),
            math.add(bodyweight.dips.total, bodyweight.pullups.total)
        ),
        math.add(bodyweight.squats.total, bodyweight.rdl.total)
    );
}

function calculateBodyweightPrestigeGain() {
    if (checks.gymType === -1 || checks.gymType === 0) {
        return math.add(prestige.bw.total, 1);
    }

    return 0;
}

function getLiftingTotalReps() {
    return math.add(
        math.add(
            math.add(lifting.bench.total, lifting.rows.total),
            math.add(lifting.ohp.total, lifting.squats.total)
        ),
        math.add(lifting.dls.total, lifting.curls.total)
    );
}

function getLiftingTotalWeight() {
    return math.add(
        math.add(
            math.add(lifting.bench.weight, lifting.rows.weight),
            math.add(lifting.ohp.weight, lifting.squats.weight)
        ),
        math.add(lifting.dls.weight, lifting.curls.weight)
    );
}

function getYogaTotalReps() {
    return math.add(
        math.add(
            math.add(yoga.sun.total, yoga.vinyasa.total),
            math.add(yoga.balance.total, yoga.mobility.total)
        ),
        math.add(yoga.core.total, yoga.breath.total)
    );
}

function ensureYogaFlowState() {
    if (yoga.flow == null || typeof yoga.flow !== "object") {
        yoga.flow = JSON.parse(JSON.stringify(baseYoga.flow));
    }

    if (!Array.isArray(yoga.flow.tracks) || yoga.flow.tracks.length !== 4) {
        yoga.flow.tracks = [0.65, 0.65, 0.65, 0.65];
    }

    for (let i = 0; i < yoga.flow.tracks.length; i++) {
        yoga.flow.tracks[i] = math.max(0, math.min(1, sanitizeResourceValue("yoga_flow", "yoga.flow.tracks[" + i + "]", yoga.flow.tracks[i])));
    }

    if (!Array.isArray(yoga.flow.draftOptions)) {
        yoga.flow.draftOptions = [];
    }

    for (let i = 0; i < yoga.flow.draftOptions.length; i++) {
        yoga.flow.draftOptions[i] = sanitizeYogaRouteOption(yoga.flow.draftOptions[i], i);
    }

    yoga.flow.activeDraftIndex = math.floor(sanitizeResourceValue("yoga_flow", "yoga.flow.activeDraftIndex", yoga.flow.activeDraftIndex == null ? -1 : yoga.flow.activeDraftIndex, { allowNegative: true }));
    if (yoga.flow.activeDraftIndex < -1 || yoga.flow.activeDraftIndex >= yoga.flow.draftOptions.length) {
        yoga.flow.activeDraftIndex = -1;
    }

    yoga.flow.currentPhase = math.max(0, math.min(2, math.floor(sanitizeResourceValue("yoga_flow", "yoga.flow.currentPhase", yoga.flow.currentPhase))));
    yoga.flow.routeProgress = math.max(0, math.min(1, sanitizeResourceValue("yoga_flow", "yoga.flow.routeProgress", yoga.flow.routeProgress || 0)));
    yoga.flow.progress = math.max(0, math.min(1, sanitizeResourceValue("yoga_flow", "yoga.flow.progress", yoga.flow.progress || yoga.flow.routeProgress)));
    yoga.flow.target = 1;
    yoga.flow.routeStability = math.max(0, math.min(1, sanitizeResourceValue("yoga_flow", "yoga.flow.routeStability", yoga.flow.routeStability || 0.72)));
    yoga.flow.routePressure = math.max(0, sanitizeResourceValue("yoga_flow", "yoga.flow.routePressure", yoga.flow.routePressure || 0));
    yoga.flow.routeSteadyActions = math.max(0, sanitizeResourceValue("yoga_flow", "yoga.flow.routeSteadyActions", yoga.flow.routeSteadyActions || 0));
    yoga.flow.routeDrift = sanitizeResourceValue("yoga_flow", "yoga.flow.routeDrift", yoga.flow.routeDrift || 0, { allowNegative: true });
    yoga.flow.currentRouteName = typeof yoga.flow.currentRouteName === "string" ? yoga.flow.currentRouteName : "";
    yoga.flow.currentRouteRisk = typeof yoga.flow.currentRouteRisk === "string" ? yoga.flow.currentRouteRisk : "steady";
    yoga.flow.currentCycle = math.max(0, sanitizeResourceValue("yoga_flow", "yoga.flow.currentCycle", yoga.flow.currentCycle || 0));
    yoga.flow.qualitySamples = math.max(0, math.floor(sanitizeResourceValue("yoga_flow", "yoga.flow.qualitySamples", yoga.flow.qualitySamples || 0)));
    yoga.flow.totalCycles = math.max(0, math.floor(sanitizeResourceValue("yoga_flow", "yoga.flow.totalCycles", yoga.flow.totalCycles || 0)));
    yoga.flow.perfectAnchors = math.max(0, math.floor(sanitizeResourceValue("yoga_flow", "yoga.flow.perfectAnchors", yoga.flow.perfectAnchors || 0)));
    yoga.flow.averageQuality = math.max(0, math.min(1, sanitizeResourceValue("yoga_flow", "yoga.flow.averageQuality", yoga.flow.averageQuality || 0)));
    yoga.flow.lastPhaseQuality = math.max(0, math.min(1, sanitizeResourceValue("yoga_flow", "yoga.flow.lastPhaseQuality", yoga.flow.lastPhaseQuality || 0)));
    yoga.flow.lastPhaseAnchored = yoga.flow.lastPhaseAnchored === true;
    yoga.flow.autoAnchorArmed = yoga.flow.autoAnchorArmed === true;
    yoga.flow.runEarned = normalizePrestigePoints(sanitizeResourceValue("yoga_flow", "yoga.flow.runEarned", yoga.flow.runEarned || 0));

    if (yoga.flow.draftOptions.length < 3) {
        generateYogaRouteDraftOptions(yoga.flow);
    }

    return yoga.flow;
}

function getYogaFlowRunCap() {
    return 1;
}

function getYogaFlowRunTimingTuningMultiplier() {
    // Keep fresh unlock near prestige timing, while preventing mid/max content
    // from capping Flow far too early in the run.
    let completedYogaRuns = math.max(0, math.floor(prestige.yoga.total || 0));
    if (completedYogaRuns >= 12) {
        return 0.31;
    }
    if (completedYogaRuns >= 6) {
        return 0.43;
    }
    return 1.46;
}

function getYogaRouteDefinitionById(routeId) {
    for (let i = 0; i < YOGA_ROUTE_DEFINITIONS.length; i++) {
        if (YOGA_ROUTE_DEFINITIONS[i].id === routeId) {
            return YOGA_ROUTE_DEFINITIONS[i];
        }
    }
    return YOGA_ROUTE_DEFINITIONS[0];
}

function buildYogaRouteOption(definition, slotIndex) {
    // Keep route rolls tighter so early Yoga pacing is less volatile run-to-run.
    let progressVariance = math.random(0.92, 1.08);
    let rewardVariance = math.random(0.92, 1.08);
    let driftVariance = math.random(0.92, 1.08);
    let pressureVariance = math.random(0.92, 1.08);

    return {
        id: definition.id,
        name: definition.name,
        risk: definition.risk,
        progressMultiplier: math.max(0.6, math.mul(definition.progressMultiplier, progressVariance)),
        rewardMultiplier: math.max(0.6, math.mul(definition.rewardMultiplier, rewardVariance)),
        drift: math.max(0.001, math.mul(definition.drift, driftVariance)),
        pressure: math.max(0.001, math.mul(definition.pressure, pressureVariance)),
        slot: slotIndex,
    };
}

function sanitizeYogaRouteOption(option, slotIndex) {
    if (option == null || typeof option !== "object") {
        return buildYogaRouteOption(YOGA_ROUTE_DEFINITIONS[slotIndex % YOGA_ROUTE_DEFINITIONS.length], slotIndex);
    }

    let definition = getYogaRouteDefinitionById(typeof option.id === "string" ? option.id : YOGA_ROUTE_DEFINITIONS[slotIndex % YOGA_ROUTE_DEFINITIONS.length].id);
    return {
        id: definition.id,
        name: typeof option.name === "string" && option.name.length > 0 ? option.name : definition.name,
        risk: typeof option.risk === "string" && option.risk.length > 0 ? option.risk : definition.risk,
        progressMultiplier: math.max(0.6, sanitizeResourceValue("yoga_flow", "yoga.flow.draftOptions[" + slotIndex + "].progressMultiplier", option.progressMultiplier || definition.progressMultiplier)),
        rewardMultiplier: math.max(0.6, sanitizeResourceValue("yoga_flow", "yoga.flow.draftOptions[" + slotIndex + "].rewardMultiplier", option.rewardMultiplier || definition.rewardMultiplier)),
        drift: math.max(0.001, sanitizeResourceValue("yoga_flow", "yoga.flow.draftOptions[" + slotIndex + "].drift", option.drift || definition.drift)),
        pressure: math.max(0.001, sanitizeResourceValue("yoga_flow", "yoga.flow.draftOptions[" + slotIndex + "].pressure", option.pressure || definition.pressure)),
        slot: slotIndex,
    };
}

function generateYogaRouteDraftOptions(flowState) {
    let order = [0, 1, 2];
    for (let i = order.length - 1; i > 0; i--) {
        let j = math.floor(math.random(0, i + 1));
        let temp = order[i];
        order[i] = order[j];
        order[j] = temp;
    }

    flowState.draftOptions = [];
    for (let i = 0; i < order.length; i++) {
        let definition = YOGA_ROUTE_DEFINITIONS[order[i] % YOGA_ROUTE_DEFINITIONS.length];
        flowState.draftOptions.push(buildYogaRouteOption(definition, i));
    }

    flowState.activeDraftIndex = -1;
    flowState.routeProgress = 0;
    flowState.progress = 0;
    flowState.routeSteadyActions = 0;
    flowState.routePressure = 0;
    flowState.routeDrift = 0;
    flowState.currentRouteName = "Choose a route";
    flowState.currentRouteRisk = "draft";
    flowState.currentPhase = 0;
}

function getActiveYogaRouteOption(flowState) {
    if (flowState.activeDraftIndex < 0 || flowState.activeDraftIndex >= flowState.draftOptions.length) {
        return null;
    }
    return flowState.draftOptions[flowState.activeDraftIndex];
}

function getYogaBreathPhaseName(phase) {
    let flowState = ensureYogaFlowState();
    let option = flowState.draftOptions[phase];
    if (option == null) {
        return "Drafting";
    }
    return option.name;
}

function getYogaBreathPhaseTarget() {
    return 1;
}

function getYogaStabilityControlPower() {
    let base = math.add(0.03, math.mul(math.log10(math.add(getYogaTotalReps(), 1)), 0.006));
    if (hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 17)) {
        base = math.mul(base, 2);
    }

    return applyModifierPipeline(base, {
        multiplicative: [getFlowShopBreathProgressMultiplier()],
        layer: [getLayer1PacingMultiplier()],
    });
}

function getYogaBreathProgressPerSecond() {
    if (checks.gymType !== 2 || !hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0)) {
        return 0;
    }

    // Tuned so a normal yoga run can usually finish the Flow run-cap around prestige-ready timing.
    let base = math.add(0.0045, math.mul(math.log10(math.add(getYogaTotalReps(), 1)), 0.00078));
    if (hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 17)) {
        base = math.mul(base, 1.65);
    }

    return applyModifierPipeline(base, {
        multiplicative: [getFlowShopBreathProgressMultiplier()],
        layer: [getLayer1PacingMultiplier()],
    });
}

function selectYogaRoute(routeIndex, fromAutomation) {
    if (checks.gymType !== 2 || !hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0)) {
        return false;
    }

    let flowState = ensureYogaFlowState();
    let index = math.floor(routeIndex);
    if (index < 0 || index >= flowState.draftOptions.length) {
        return false;
    }
    if (flowState.activeDraftIndex !== -1 && !fromAutomation) {
        return false;
    }

    let option = flowState.draftOptions[index];
    flowState.activeDraftIndex = index;
    flowState.currentPhase = index;
    flowState.routeProgress = 0;
    flowState.progress = 0;
    flowState.routeStability = math.max(0.55, math.min(0.9, math.add(0.62, math.mul(getYogaStabilityControlPower(), 0.7))));
    flowState.routePressure = option.pressure;
    flowState.routeDrift = 0;
    flowState.routeSteadyActions = 0;
    flowState.currentRouteName = option.name;
    flowState.currentRouteRisk = option.risk;
    flowState.lastPhaseAnchored = false;
    flowState.autoAnchorArmed = false;
    return true;
}

function getYogaAutomationRouteIndex(flowState) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < flowState.draftOptions.length; i++) {
        let option = flowState.draftOptions[i];
        let riskPenalty = math.add(math.mul(option.drift, 18), math.mul(option.pressure, 24));
        let score = math.sub(math.mul(option.rewardMultiplier, option.progressMultiplier), riskPenalty);
        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }
    return bestIndex;
}

function stabilizeYogaRoute(fromAutomation) {
    if (checks.gymType !== 2 || !hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0)) {
        return false;
    }

    let flowState = ensureYogaFlowState();
    if (flowState.activeDraftIndex < 0) {
        return false;
    }

    let bonus = fromAutomation === true ? 0.08 : 0.18;
    bonus = math.mul(bonus, math.add(1, math.mul(getYogaStabilityControlPower(), 2.2)));
    flowState.routeStability = math.max(0, math.min(1, math.add(flowState.routeStability, bonus)));
    flowState.routeSteadyActions = math.add(flowState.routeSteadyActions, fromAutomation === true ? 0.35 : 1);
    flowState.lastPhaseAnchored = true;
    return true;
}

function getYogaStabilityQuality(flowState) {
    let activeOption = getActiveYogaRouteOption(flowState);
    let baseQuality = flowState.routeStability;
    let steadyBonus = math.min(0.2, math.mul(flowState.routeSteadyActions, 0.028));
    let pressurePenalty = activeOption == null ? 0 : math.min(0.18, math.mul(activeOption.pressure, 3.6));
    let quality = math.add(baseQuality, math.sub(steadyBonus, pressurePenalty));
    return math.max(0.05, math.min(1, quality));
}

function getYogaFlowRewardForCycle(quality, perfectAnchors, routeOption) {
    let normalizedQuality = math.max(0.1, math.min(1, quality));
    let option = routeOption == null ? { rewardMultiplier: 1 } : routeOption;
    let flowState = ensureYogaFlowState();
    let completedYogaRuns = math.max(0, math.floor(prestige.yoga.total || 0));
    let baseReward = math.add(0.11, math.mul(getYogaBreathProgressPerSecond(), 20));
    let qualityMultiplier = math.add(0.78, math.mul(normalizedQuality, 1.02));
    let consistencyBonus = math.add(1, math.mul(math.min(1, math.div(perfectAnchors, 20)), 0.22));
    // Keep later runs faster, but avoid making early-flow timing depend too heavily on deep completion stacks.
    let yogaDepthBonus = math.add(1, math.mul(math.min(1, math.div(prestige.yoga.total, 8)), 0.25));
    let reward = math.mul(
        math.mul(
            math.mul(math.mul(baseReward, option.rewardMultiplier), qualityMultiplier),
            consistencyBonus
        ),
        yogaDepthBonus
    );
    if (completedYogaRuns < 6 && flowState.totalCycles >= 2) {
        // Fresh yoga unlocks often land just short of a full Flow point. Give the
        // closing route a modest kick without speeding up the early upgrade snowball.
        reward = math.mul(reward, 1.2);
    }
    return math.mul(reward, getYogaFlowRunTimingTuningMultiplier());
}

function applyYogaFlowRewardWithCap(reward) {
    let flowState = ensureYogaFlowState();
    let runCap = getYogaFlowRunCap();
    let remaining = math.max(0, math.sub(runCap, flowState.runEarned));
    if (remaining <= 0) {
        return 0;
    }

    let granted = math.min(reward, remaining);
    prestige.yoga.flow = math.add(prestige.yoga.flow, granted);
    flowState.runEarned = normalizePrestigePoints(math.add(flowState.runEarned, granted));
    yoga.flow.points = prestige.yoga.flow;
    return granted;
}

function completeYogaRoute(flowState, routeOption) {
    let quality = getYogaStabilityQuality(flowState);
    flowState.totalCycles = math.add(flowState.totalCycles, 1);
    flowState.currentCycle = math.add(flowState.currentCycle, 1);
    flowState.qualitySamples = math.add(flowState.qualitySamples, 1);
    flowState.lastPhaseQuality = quality;

    if (flowState.averageQuality <= 0) {
        flowState.averageQuality = quality;
    }
    else {
        flowState.averageQuality = math.add(math.mul(flowState.averageQuality, 0.88), math.mul(quality, 0.12));
    }

    if (quality >= 0.82) {
        flowState.perfectAnchors = math.add(flowState.perfectAnchors, 1);
    }

    let reward = getYogaFlowRewardForCycle(quality, flowState.perfectAnchors, routeOption);
    if (flowState.lastPhaseAnchored && quality >= 0.74) {
        reward = math.mul(reward, getFlowShopPerfectAnchorMultiplier());
    }
    applyYogaFlowRewardWithCap(reward);

    flowState.lastPhaseAnchored = false;
    flowState.autoAnchorArmed = false;
    generateYogaRouteDraftOptions(flowState);
}

function anchorYogaBreathPhase(fromAutomation) {
    stabilizeYogaRoute(fromAutomation === true);
}

function getCardioExerciseList() {
    return [cardio.treadmill, cardio.bike, cardio.row, cardio.sprints, cardio.hills, cardio.recovery];
}

function getActiveCardioExercises() {
    return getCardioExerciseList().filter(function (exercise) {
        return exercise != null && !exercise.isStopped;
    });
}

function getCardioExerciseCycleMs(exercise) {
    let scaledSpeedMs = math.max(1, math.div(exercise.speed, exercise.speedModifier));
    let ticksPerCycle = math.max(1, math.div(exercise.max, exercise.increase));
    return math.max(1, math.mul(scaledSpeedMs, ticksPerCycle));
}

function buildCardioExerciseTickState(exercise, tickSeconds) {
    let cycleMs = getCardioExerciseCycleMs(exercise);
    let cycleSeconds = math.max(0.001, math.div(cycleMs, 1000));
    let progressPerSecond = math.div(exercise.max, cycleSeconds);
    let progressGain = math.mul(progressPerSecond, tickSeconds);
    let energyPerSecond = math.div(exercise.energy, cycleSeconds);
    let requestedEnergy = math.mul(energyPerSecond, tickSeconds);
    if (requestedEnergy <= 0 || progressGain <= 0) {
        return null;
    }
    return {
        exercise: exercise,
        progressGain: progressGain,
        requestedEnergy: requestedEnergy,
    };
}

function ensureCardioIntervalState() {
    if (cardio.interval == null || typeof cardio.interval !== "object") {
        cardio.interval = JSON.parse(JSON.stringify(baseCardio.interval));
    }

    if (cardio.interval.activeRaceId == null) {
        if (typeof cardio.interval.activeGhostId === "string") {
            cardio.interval.activeRaceId = cardio.interval.activeGhostId;
        }
        else if (typeof cardio.interval.activePlanId === "string") {
            cardio.interval.activeRaceId = cardio.interval.activePlanId;
        }
    }
    if (cardio.interval.autoRaceIndex == null) {
        if (cardio.interval.autoGhostIndex != null) {
            cardio.interval.autoRaceIndex = cardio.interval.autoGhostIndex;
        }
        else {
            cardio.interval.autoRaceIndex = cardio.interval.autoPlanIndex == null ? 1 : cardio.interval.autoPlanIndex;
        }
    }
    if (cardio.interval.lastAction == null) {
        let legacyAction = typeof cardio.interval.lastAction === "string" ? cardio.interval.lastAction : "hold";
        cardio.interval.lastAction = legacyAction === "hold" ? "settle" : legacyAction;
    }
    if (cardio.interval.playerProgress == null) {
        cardio.interval.playerProgress = cardio.interval.checkpointProgress || cardio.interval.segmentProgress || 0;
    }
    if (cardio.interval.rival1Progress == null) {
        cardio.interval.rival1Progress = math.max(0, math.sub(cardio.interval.playerProgress || 0, 0.03));
    }
    if (cardio.interval.rival2Progress == null) {
        cardio.interval.rival2Progress = math.max(0, math.sub(cardio.interval.playerProgress || 0, 0.06));
    }
    if (cardio.interval.totalRaces == null) {
        cardio.interval.totalRaces = cardio.interval.totalPlans || 0;
    }
    if (cardio.interval.currentPlace == null) {
        cardio.interval.currentPlace = 3;
    }
    if (cardio.interval.raceSeconds == null) {
        cardio.interval.raceSeconds = 0;
    }

    cardio.interval.activeRaceId = typeof cardio.interval.activeRaceId === "string" ? cardio.interval.activeRaceId : "";
    cardio.interval.playerProgress = math.max(0, math.min(1.25, sanitizeResourceValue("cardio_interval", "cardio.interval.playerProgress", cardio.interval.playerProgress || 0)));
    cardio.interval.rival1Progress = math.max(0, math.min(1.25, sanitizeResourceValue("cardio_interval", "cardio.interval.rival1Progress", cardio.interval.rival1Progress || 0)));
    cardio.interval.rival2Progress = math.max(0, math.min(1.25, sanitizeResourceValue("cardio_interval", "cardio.interval.rival2Progress", cardio.interval.rival2Progress || 0)));
    cardio.interval.totalRaces = math.max(0, math.floor(sanitizeResourceValue("cardio_interval", "cardio.interval.totalRaces", cardio.interval.totalRaces || 0)));
    cardio.interval.averageQuality = math.max(0, math.min(1, sanitizeResourceValue("cardio_interval", "cardio.interval.averageQuality", cardio.interval.averageQuality || 0)));
    cardio.interval.qualitySamples = math.max(0, math.floor(sanitizeResourceValue("cardio_interval", "cardio.interval.qualitySamples", cardio.interval.qualitySamples || 0)));
    cardio.interval.lastQuality = math.max(0, math.min(1, sanitizeResourceValue("cardio_interval", "cardio.interval.lastQuality", cardio.interval.lastQuality || 0)));
    cardio.interval.runEarned = normalizePrestigePoints(sanitizeResourceValue("cardio_interval", "cardio.interval.runEarned", cardio.interval.runEarned || 0));
    cardio.interval.autoRaceIndex = math.max(0, math.min(CARDIO_RACE_DEFINITIONS.length - 1, math.floor(sanitizeResourceValue("cardio_interval", "cardio.interval.autoRaceIndex", cardio.interval.autoRaceIndex == null ? 1 : cardio.interval.autoRaceIndex))));
    cardio.interval.fatigue = math.max(0, math.min(1.25, sanitizeResourceValue("cardio_interval", "cardio.interval.fatigue", cardio.interval.fatigue || 0)));
    cardio.interval.currentPlace = math.max(1, math.min(3, math.floor(sanitizeResourceValue("cardio_interval", "cardio.interval.currentPlace", cardio.interval.currentPlace || 3))));
    cardio.interval.raceSeconds = math.max(0, sanitizeResourceValue("cardio_interval", "cardio.interval.raceSeconds", cardio.interval.raceSeconds || 0));
    cardio.interval.lastAction = ["push", "settle", "recover"].indexOf(cardio.interval.lastAction) >= 0 ? cardio.interval.lastAction : "settle";
    return cardio.interval;
}

function getCardioPaceRunCap() {
    return 1;
}

function getCardioRaceDefinitionById(raceId) {
    for (let i = 0; i < CARDIO_RACE_DEFINITIONS.length; i++) {
        if (CARDIO_RACE_DEFINITIONS[i].id === raceId) {
            return CARDIO_RACE_DEFINITIONS[i];
        }
    }
    return null;
}

function getActiveCardioRaceDefinition(intervalState) {
    return getCardioRaceDefinitionById(intervalState.activeRaceId);
}

function getCardioTotalReps() {
    return math.add(
        math.add(
            math.add(cardio.treadmill.total, cardio.bike.total),
            math.add(cardio.row.total, cardio.sprints.total)
        ),
        math.add(cardio.hills.total, cardio.recovery.total)
    );
}

function getCardioRaceProgressPerSecond() {
    if (checks.gymType !== 3 || !hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 0)) {
        return 0;
    }

    let base = math.add(0.0072, math.mul(math.log10(math.add(getCardioTotalReps(), 1)), 0.0014));
    if (hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 17)) {
        base = math.mul(base, 1.35);
    }
    return applyModifierPipeline(base, {
        multiplicative: [getPaceShopIntervalMultiplier()],
        layer: [getLayer1PacingMultiplier()],
    });
}

function getCardioRaceBaseSpeed() {
    let activeExercises = getActiveCardioExercises().length;
    let trainingScore = math.log10(math.add(getCardioTotalReps(), 1));
    let baseSpeed = math.add(0.88, math.mul(activeExercises, 0.03));
    baseSpeed = math.add(baseSpeed, math.mul(trainingScore, 0.045));
    if (hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 17)) {
        baseSpeed = math.add(baseSpeed, 0.08);
    }
    return math.max(0.7, math.min(1.6, baseSpeed));
}

function getCardioRaceLeaderProgress(intervalState) {
    return math.max(intervalState.playerProgress || 0, math.max(intervalState.rival1Progress || 0, intervalState.rival2Progress || 0));
}

function getCardioRacePlace(intervalState) {
    let ahead = 0;
    if ((intervalState.rival1Progress || 0) > (intervalState.playerProgress || 0)) {
        ahead += 1;
    }
    if ((intervalState.rival2Progress || 0) > (intervalState.playerProgress || 0)) {
        ahead += 1;
    }
    return ahead + 1;
}

function getCardioRacePlayerSpeed(intervalState, raceDefinition) {
    let base = getCardioRaceProgressPerSecond();
    let speedFactor = math.div(getCardioRaceBaseSpeed(), math.max(0.4, raceDefinition.distanceMultiplier));
    let actionModifier = 0;
    if (intervalState.lastAction === "push") {
        actionModifier = 0.22;
    }
    else if (intervalState.lastAction === "recover") {
        actionModifier = -0.14;
    }
    else {
        actionModifier = 0.02;
    }
    let cadenceBonus = hasPaceShopUpgrade(3) ? 0.05 : 0;
    let fatiguePenalty = math.mul(intervalState.fatigue || 0, 0.34);
    let multiplier = math.max(0.58, math.min(1.48, math.add(1, math.add(actionModifier, math.add(cadenceBonus, math.mul(fatiguePenalty, -1))))));
    return math.mul(base, math.mul(raceDefinition.progressMultiplier, math.mul(speedFactor, multiplier)));
}

function getCardioRaceRivalSpeed(intervalState, raceDefinition, rivalIndex) {
    let base = getCardioRaceProgressPerSecond();
    let rivalMultiplier = raceDefinition.rivalMultipliers[rivalIndex];
    let raceSeconds = intervalState.raceSeconds || 0;
    let wave = math.add(1, math.mul(0.06, Math.sin(math.add(math.div(raceSeconds, 5), math.mul(rivalIndex + 1, 1.9)))));
    return math.mul(base, math.mul(rivalMultiplier, math.mul(raceDefinition.progressMultiplier, math.div(wave, math.max(0.4, raceDefinition.distanceMultiplier)))));
}

function getCardioRaceQuality(intervalState) {
    let place = getCardioRacePlace(intervalState);
    let placeQuality = place === 1 ? 0.9 : (place === 2 ? 0.66 : 0.44);
    let playerProgress = math.min(1, intervalState.playerProgress || 0);
    let leadProgress = math.min(1, getCardioRaceLeaderProgress(intervalState));
    let closenessBonus = math.mul(math.max(0, math.sub(playerProgress, math.sub(leadProgress, 0.08))), 0.16);
    let fatiguePenalty = math.mul(intervalState.fatigue || 0, 0.16);
    let quality = math.add(placeQuality, math.add(math.mul(playerProgress, 0.08), math.sub(closenessBonus, fatiguePenalty)));
    if (hasPaceShopUpgrade(3)) {
        quality = math.add(quality, 0.04);
    }
    return math.max(0.12, math.min(0.98, quality));
}

function getCardioPaceRewardForRace(raceDefinition, quality) {
    let baseReward = math.add(0.065, math.mul(getCardioRaceProgressPerSecond(), 4.5));
    let reward = math.mul(baseReward, raceDefinition.rewardMultiplier);
    reward = math.mul(reward, math.add(0.82, quality));
    reward = math.mul(reward, getPaceShopRewardMultiplier());
    return reward;
}

function applyCardioPaceRewardWithCap(reward) {
    let intervalState = ensureCardioIntervalState();
    let runCap = getCardioPaceRunCap();
    let remaining = math.max(0, math.sub(runCap, intervalState.runEarned));
    if (remaining <= 0) {
        return 0;
    }
    let granted = math.min(reward, remaining);
    prestige.cardio.pace = math.add(prestige.cardio.pace, granted);
    intervalState.runEarned = normalizePrestigePoints(math.add(intervalState.runEarned, granted));
    return granted;
}

function selectCardioRace(raceIndex, fromAutomation) {
    if (checks.gymType !== 3 || !hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 0)) {
        return false;
    }
    let intervalState = ensureCardioIntervalState();
    let index = math.floor(raceIndex);
    if (index < 0 || index >= CARDIO_RACE_DEFINITIONS.length) {
        return false;
    }
    if (intervalState.activeRaceId !== "" && !fromAutomation) {
        return false;
    }
    let raceDefinition = CARDIO_RACE_DEFINITIONS[index];
    intervalState.activeRaceId = raceDefinition.id;
    intervalState.playerProgress = 0;
    intervalState.rival1Progress = 0;
    intervalState.rival2Progress = 0;
    intervalState.autoRaceIndex = index;
    intervalState.fatigue = math.min(intervalState.fatigue || 0, 0.12);
    intervalState.currentPlace = 3;
    intervalState.raceSeconds = 0;
    intervalState.lastAction = "settle";
    return true;
}

function resetCardioRace() {
    let intervalState = ensureCardioIntervalState();
    intervalState.activeRaceId = "";
    intervalState.playerProgress = 0;
    intervalState.rival1Progress = 0;
    intervalState.rival2Progress = 0;
    intervalState.fatigue = 0;
    intervalState.currentPlace = 3;
    intervalState.raceSeconds = 0;
    intervalState.lastAction = "settle";
}

function setCardioRaceAction(action) {
    let intervalState = ensureCardioIntervalState();
    if (intervalState.activeRaceId === "" || ["push", "settle", "recover"].indexOf(action) < 0) {
        return false;
    }
    intervalState.lastAction = action;
    return true;
}

function pushCardioRace() {
    return setCardioRaceAction("push");
}

function settleCardioRace() {
    return setCardioRaceAction("settle");
}

function recoverCardioRace() {
    return setCardioRaceAction("recover");
}

function applyCardioRaceAutomation(intervalState) {
    let leaderProgress = math.max(intervalState.rival1Progress || 0, intervalState.rival2Progress || 0);
    let playerGap = math.sub(leaderProgress, intervalState.playerProgress || 0);
    if (intervalState.fatigue >= 0.72) {
        intervalState.lastAction = "recover";
    }
    else if (playerGap > 0.06) {
        intervalState.lastAction = "push";
    }
    else if (playerGap < -0.08) {
        intervalState.lastAction = "recover";
    }
    else {
        intervalState.lastAction = "settle";
    }
}

function updateCardioRaceState(intervalState, raceDefinition) {
    let action = intervalState.lastAction || "hold";

    if (action === "push") {
        intervalState.fatigue = math.add(intervalState.fatigue, 0.018);
    }
    else if (action === "recover") {
        intervalState.fatigue = math.sub(intervalState.fatigue, 0.026);
    }
    else {
        intervalState.fatigue = math.sub(intervalState.fatigue, 0.008);
    }

    intervalState.fatigue = math.max(0, math.min(1.2, intervalState.fatigue));

    intervalState.playerProgress = math.add(intervalState.playerProgress || 0, getCardioRacePlayerSpeed(intervalState, raceDefinition));
    intervalState.rival1Progress = math.add(intervalState.rival1Progress || 0, getCardioRaceRivalSpeed(intervalState, raceDefinition, 0));
    intervalState.rival2Progress = math.add(intervalState.rival2Progress || 0, getCardioRaceRivalSpeed(intervalState, raceDefinition, 1));
    intervalState.playerProgress = math.max(0, math.min(1.25, intervalState.playerProgress));
    intervalState.rival1Progress = math.max(0, math.min(1.25, intervalState.rival1Progress));
    intervalState.rival2Progress = math.max(0, math.min(1.25, intervalState.rival2Progress));
    intervalState.currentPlace = getCardioRacePlace(intervalState);
    intervalState.raceSeconds = math.add(intervalState.raceSeconds || 0, 1);
}

function completeCardioRace(intervalState, raceDefinition) {
    let quality = getCardioRaceQuality(intervalState);
    intervalState.totalRaces = math.add(intervalState.totalRaces, 1);
    intervalState.qualitySamples = math.add(intervalState.qualitySamples, 1);
    intervalState.lastQuality = quality;
    if (intervalState.averageQuality <= 0) {
        intervalState.averageQuality = quality;
    }
    else {
        intervalState.averageQuality = math.add(math.mul(intervalState.averageQuality, 0.86), math.mul(quality, 0.14));
    }
    applyCardioPaceRewardWithCap(getCardioPaceRewardForRace(raceDefinition, quality));
    resetCardioRace();
}

function advanceCardioInterval(seconds) {
    if (checks.gymType !== 3 || !hasPurchasedPrestigeUpgrade(prestige.cardio.upgrades, 0)) {
        return;
    }

    let intervalState = ensureCardioIntervalState();
    let ticks = math.max(0, math.floor(seconds));
    for (let i = 0; i < ticks; i++) {
        if (intervalState.activeRaceId === "") {
            if (checks.paceBuyerOn) {
                selectCardioRace(intervalState.autoRaceIndex, true);
            }
            else {
                continue;
            }
        }

        let raceDefinition = getActiveCardioRaceDefinition(intervalState);
        if (raceDefinition == null) {
            resetCardioRace();
            continue;
        }

        if (checks.paceBuyerOn) {
            applyCardioRaceAutomation(intervalState);
        }

        updateCardioRaceState(intervalState, raceDefinition);

        if (getCardioRaceLeaderProgress(intervalState) >= 1) {
            completeCardioRace(intervalState, raceDefinition);
        }
    }
}

function getCardioGhostDefinitionById(ghostId) { return getCardioRaceDefinitionById(ghostId); }
function getActiveCardioGhostDefinition(intervalState) { return getActiveCardioRaceDefinition(intervalState); }
function getCardioGhostProgressPerSecond() { return getCardioRaceProgressPerSecond(); }
function getCardioGhostBaseEnginePace() { return getCardioRaceBaseSpeed(); }
function getCardioGhostTargetPace(intervalState, raceDefinition) { return getCardioRaceLeaderProgress(intervalState); }
function getCardioGhostQuality(intervalState) { return getCardioRaceQuality(intervalState); }
function getCardioPaceRewardForGhostRace(raceDefinition, quality) { return getCardioPaceRewardForRace(raceDefinition, quality); }
function selectCardioGhost(ghostIndex, fromAutomation) { return selectCardioRace(ghostIndex, fromAutomation); }
function resetCardioGhostRace() { return resetCardioRace(); }
function pushCardioGhostRace() { return pushCardioRace(); }
function holdCardioGhostRace() { return settleCardioRace(); }
function recoverCardioGhostRace() { return recoverCardioRace(); }
function selectCardioPlan(planIndex, fromAutomation) { return selectCardioRace(planIndex, fromAutomation); }
function resetCardioPlan() { return resetCardioRace(); }

function advanceYogaBreathCycle(seconds) {
    if (checks.gymType !== 2 || !hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 0)) {
        return;
    }

    let flowState = ensureYogaFlowState();
    let ticks = math.max(0, math.floor(seconds));

    for (let i = 0; i < ticks; i++) {
        if (flowState.activeDraftIndex < 0) {
            if (flowState.draftOptions.length < 3) {
                generateYogaRouteDraftOptions(flowState);
            }
            if (checks.breathBuyerOn && hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 18)) {
                let autoPickIndex = getYogaAutomationRouteIndex(flowState);
                selectYogaRoute(autoPickIndex, true);
            }
            continue;
        }

        let routeOption = getActiveYogaRouteOption(flowState);
        if (routeOption == null) {
            generateYogaRouteDraftOptions(flowState);
            continue;
        }

        let controlPower = getYogaStabilityControlPower();
        let drift = math.random(math.mul(routeOption.drift, -1), routeOption.drift);
        let pressure = math.max(0.001, math.sub(routeOption.pressure, math.mul(controlPower, 0.35)));
        flowState.routePressure = pressure;
        flowState.routeDrift = drift;
        flowState.routeStability = math.max(0, math.min(1, math.add(flowState.routeStability, math.sub(drift, pressure))));

        if (checks.breathBuyerOn && hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 18)) {
            let shouldStabilize = flowState.routeStability < 0.48 || (flowState.routeProgress > 0.75 && flowState.routeStability < 0.62);
            if (shouldStabilize) {
                stabilizeYogaRoute(true);
            }
        }

        let qualityFactor = math.max(0.2, math.add(0.35, math.mul(flowState.routeStability, 0.8)));
        let progressGain = math.mul(getYogaBreathProgressPerSecond(), math.mul(routeOption.progressMultiplier, qualityFactor));
        flowState.routeProgress = math.add(flowState.routeProgress, progressGain);
        flowState.progress = math.max(0, math.min(1, flowState.routeProgress));

        if (flowState.routeProgress >= 1) {
            completeYogaRoute(flowState, routeOption);
            if (checks.breathBuyerOn && hasPurchasedPrestigeUpgrade(prestige.yoga.upgrades, 18)) {
                let nextAutoPick = getYogaAutomationRouteIndex(flowState);
                selectYogaRoute(nextAutoPick, true);
            }
        }
    }
}

function getLiftingCompetitionChainProgress() {
    return math.add(
        math.add(
            lifting.comps.conferences.current,
            math.mul(lifting.comps.regionalConferences.current, 3)
        ),
        math.add(
            math.mul(lifting.comps.stateConferences.current, 9),
            math.add(
                math.mul(lifting.comps.nationalConferences.current, 27),
                math.mul(lifting.comps.worldConferences.current, 81)
            )
        )
    );
}

function calculateLiftingPrestigeGain() {
    if (checks.gymType === 1) {
        return math.add(prestige.lifting.total, 1);
    }

    return 0;
}

function getPurchasedUpgradeCostTotal(upgradeArray) {
    if (!Array.isArray(upgradeArray)) {
        return 0;
    }

    let total = 0;
    for (let i = 0; i < upgradeArray.length; i++) {
        if (upgradeArray[i].isPurchased) {
            total = math.add(total, math.evaluate(upgradeArray[i].cost || 0));
        }
    }

    return total;
}

function getRepeatingUpgradeSpent(scope) {
    let scoped = repeatingUpgradeDefinitions[scope];
    if (scoped == null || scoped.length === 0) {
        return 0;
    }

    let total = 0;
    for (let i = 0; i < scoped.length; i++) {
        let def = scoped[i];
        let state = getRepeatingUpgradeState(def.id);
        let level = normalizeRepeatingLevel(state.level);
        for (let levelIndex = 0; levelIndex < level; levelIndex++) {
            total = math.add(total, getRepeatingUpgradeCost(def, levelIndex));
        }
    }

    return total;
}

function estimateLayer1PointsSpent() {
    let total = 0;
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.upgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.bw.upgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.lifting.upgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.yoga.upgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.cardio.upgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.bw.confidenceUpgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.lifting.leadershipUpgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.yoga.flowUpgrades));
    total = math.add(total, getPurchasedUpgradeCostTotal(prestige.cardio.paceUpgrades));
    total = math.add(total, getRepeatingUpgradeSpent("global"));
    total = math.add(total, getRepeatingUpgradeSpent("bodyweight"));
    total = math.add(total, getRepeatingUpgradeSpent("lifting"));
    total = math.add(total, getRepeatingUpgradeSpent("yoga"));
    total = math.add(total, getRepeatingUpgradeSpent("cardio"));
    total = math.add(total, getRepeatingUpgradeSpent("flow"));
    total = math.add(total, getRepeatingUpgradeSpent("pace"));
    total = math.add(total, getRepeatingUpgradeSpent("confidence"));
    total = math.add(total, getRepeatingUpgradeSpent("leadership"));
    return total;
}

function calculateLayer2PrestigeGain() {
    let runTracker = ensureRunTracker();
    let runHours = math.div(runTracker.runSeconds, 3600);
    let l1PointsSpent = estimateLayer1PointsSpent();
    let l1Mastery = math.mul(
        math.pow(math.add(getTotalStats(), 1), 0.5),
        math.mul(
            math.pow(math.add(gangPower(bodyweight.gang.strength, bodyweight.gang.members), 1), 0.25),
            math.pow(math.add(lifting.comps.competitions.current, 1), 0.25)
        )
    );
    let l1TotalPrestiges = math.add(prestige.total, math.add(prestige.bw.total, prestige.lifting.total));

    let score = math.mul(
        math.mul(
            math.pow(math.add(l1PointsSpent, 1), 0.55),
            math.pow(math.add(l1Mastery, 1), 0.35)
        ),
        math.pow(math.add(l1TotalPrestiges, 1), 0.1)
    );
    let timeBonus = math.add(1, math.mul(0.2, math.sub(1, Math.exp(math.mul(-1, math.div(runHours, 8))))));
    let adjusted = math.max(0, math.sub(math.log10(math.add(math.mul(score, timeBonus), 1)), 2.2));
    let rawGain = math.pow(adjusted, 1.45);
    return math.div(math.floor(math.mul(rawGain, 100)), 100);
}

function formatPrestigePoints(value) {
    let normalized = normalizePrestigePoints(value);
    if (normalized < 1000000) {
        return normalized.toFixed(PRESTIGE_DISPLAY_DECIMALS);
    }

    return math.format(normalized, 3);
}

function formatMetaPoints(value) {
    let rawValue = math.evaluate(value);
    if (!Number.isFinite(rawValue) || rawValue < 0) {
        rawValue = 0;
    }

    if (rawValue > 0 && rawValue < 0.01) {
        return rawValue.toFixed(5);
    }

    let normalized = normalizePrestigePoints(rawValue);
    if (normalized < 1000000) {
        return normalized.toFixed(PRESTIGE_DISPLAY_DECIMALS);
    }

    return math.format(normalized, 3);
}

function hasLayer1PrestigeUnlock() {
    let prestigeUnlock = gym.adUpgrades.filter(function (upgradeArray) { return upgradeArray.id == 14 });
    return prestigeUnlock[0] != null && prestigeUnlock[0].isPurchased;
}

function updatePrestigeValues() {
    let globalGainPreview = calculateGlobalPrestigeGain();
    let bwGainPreview = calculateBodyweightPrestigeGain();
    let liftingGainPreview = calculateLiftingPrestigeGain();

    if (checks.gymType != -1) {
        checks.isPrestige = hasLayer1PrestigeUnlock();
    }

    $("#pointsReceived").html(formatPrestigePoints(globalGainPreview));
    checks.gymType == 0 || checks.gymType == -1
        ? $("#bwPointsReceived").html(formatPrestigePoints(bwGainPreview))
        : $("#bwPointsReceived").html(formatPrestigePoints(0));
    checks.gymType == 1
        ? $("#liftingPointsReceived").html(formatPrestigePoints(liftingGainPreview))
        : $("#liftingPointsReceived").html(formatPrestigePoints(0));
    checks.gymType == 2
        ? $("#yogaPointsReceived").html(formatPrestigePoints(prestige.yoga.total + 1))
        : $("#yogaPointsReceived").html(formatPrestigePoints(0));
    checks.gymType == 3
        ? $("#cardioPointsReceived").html(formatPrestigePoints(prestige.cardio.total + 1))
        : $("#cardioPointsReceived").html(formatPrestigePoints(0));
    $("#layer2PointsReceived").html(formatPrestigePoints(0));

    $("#pointsOwned").html(formatPrestigePoints(prestige.current));
    $("#bwPointsOwned").html(formatPrestigePoints(prestige.bw.current));
    $("#liftingPointsOwned").html(formatPrestigePoints(prestige.lifting.current));
    $("#yogaPointsOwned").html(formatPrestigePoints(prestige.yoga.current));
    $("#cardioPointsOwned").html(formatPrestigePoints(prestige.cardio.current));
    $("#layer2PointsOwned").html(formatPrestigePoints(0));
    if ($("#confidenceShopPoints").length > 0) {
        $("#confidenceShopPoints").html(formatMetaPoints(prestige.bw.confidence));
    }
    if ($("#leadershipShopPoints").length > 0) {
        $("#leadershipShopPoints").html(formatMetaPoints(prestige.lifting.leadership));
    }
    if ($("#flowShopPoints").length > 0) {
        $("#flowShopPoints").html(formatMetaPoints(prestige.yoga.flow));
    }
    if ($("#paceShopPoints").length > 0) {
        $("#paceShopPoints").html(formatMetaPoints(prestige.cardio.pace));
    }
    updateMetaPointTooltips();
    updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
    updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
    updateRepeatingUpgradeButtons("confidenceShopUpgrades", "confidence", prestige.bw.confidence);
    updateRepeatingUpgradeButtons("leadershipShopUpgrades", "leadership", prestige.lifting.leadership);

    if (checks.isPrestige) {
        $("#prestigeReady").removeClass("d-none");
    }
    else {
        $("#prestigeReady").addClass("d-none");
    }
}

function startStop(exercise, timerId, load) {
    if (exercise.id >= 12 && exercise.id <= 17) {
        if ((exercise.isStopped && !load) || (load && !exercise.isStopped)) {
            setupYogaContinuousTimer();
            if (!load) {
                exercise.isStopped = false;
            }
        }
        else {
            if (!load) {
                exercise.isStopped = true;
            }
            stopYogaContinuousTimerIfIdle();
        }
        return;
    }
    if (exercise.id >= 18 && exercise.id <= 23) {
        if ((exercise.isStopped && !load) || (load && !exercise.isStopped)) {
            setupCardioContinuousTimer();
            if (!load) {
                exercise.isStopped = false;
            }
        }
        else {
            if (!load) {
                exercise.isStopped = true;
            }
            stopCardioContinuousTimerIfIdle();
        }
        return;
    }

    if ((exercise.isStopped && !load) || (load && !exercise.isStopped)) {
        clearInterval(timerId);
        switch (exercise.id) {
            case 0:
                setupPushupTimer();
                break;
            case 1:
                setupRowTimer();
                break;
            case 2:
                setupDipTimer();
                break;
            case 3:
                setupPullupTimer();
                break;
            case 4:
                setupBwSquatTimer();
                break;
            case 5:
                setupBwRdlTimer();
                break;
            case 6:
                setupLiftingBenchTimer();
                break;
            case 7:
                setupLiftingRowTimer();
                break;
            case 8:
                setupLiftingOhpTimer();
                break;
            case 9:
                setupLiftingSquatsTimer();
                break;
            case 10:
                setupLiftingDlsTimer();
                break;
            case 11:
                setupLiftingCurlsTimer();
                break;
            default:
        }
        if (!load) {
            exercise.isStopped = false;
        }
    }
    else {
        clearInterval(timerId);
        if (!load) {
            exercise.isStopped = true;
        }
    }
}

function completeExerciseCycle(exercise, completionOverflow) {
    let totalToAdd = applyModifierPipeline(1, {
        additive: [math.mul(stats.strength, stats.strengthBoost)],
        layer: [getLayer0PacingMultiplier()],
    });
    exercise.total = math.add(exercise.total, totalToAdd);
    exercise.total = math.min(exercise.total, 1e200);
    if (checks.gymType == -1 || checks.gymType == 0 || checks.gymType == 2 || checks.gymType == 3) {
        if (exercise.total > exercise.tiers[exercise.tier].upgrade && exercise.tier != 4) {
            exercise.strength = math.mul(exercise.strength, exercise.tiers[exercise.tier].multiplier);
            exercise.endurance = math.mul(exercise.endurance, exercise.tiers[exercise.tier].multiplier);
            exercise.agility = math.mul(exercise.agility, exercise.tiers[exercise.tier].multiplier);
            exercise.energy = math.mul(exercise.energy, checks.gymType === 2 ? YOGA_TIER_ENERGY_MULTIPLIER : (checks.gymType === 3 ? 1.55 : 2));
            exercise.tier = math.add(exercise.tier, 1);
        }
    }
    else if (checks.gymType == 1) {
        if (exercise.weight < exercise.maxWeight) {
            exercise.repsToNext = math.add(exercise.repsToNext, totalToAdd);
            if (exercise.repsToNext >= exercise.repsToNextBase) {
                let repsOverflow = math.max(0, math.sub(exercise.repsToNext, exercise.repsToNextBase));
                exercise.repsToNextBase = math.add(exercise.repsToNextBase, 1);
                exercise.repsToNext = math.mul(repsOverflow, getGymMasteryOverflowRetention());
                let maxRepsCarry = math.max(0, math.sub(exercise.repsToNextBase, 0.000001));
                exercise.repsToNext = math.min(exercise.repsToNext, maxRepsCarry);
                exercise.strength = math.mul(exercise.strength, exercise.multi);
                exercise.endurance = math.mul(exercise.endurance, exercise.multi);
                exercise.agility = math.mul(exercise.agility, exercise.multi);
                exercise.energy = math.mul(exercise.energy, exercise.multi);
                exercise.weight = math.add(exercise.weight, exercise.weightIncrease);
            }
        }
    }
    let strengthGain = applyModifierPipeline(exercise.strength, {
        multiplicative: [getIntelligenceMultiplier()],
        layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier(), getLayer0PacingMultiplier()],
    });
    let enduranceGain = applyModifierPipeline(exercise.endurance, {
        multiplicative: [getIntelligenceMultiplier()],
        layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier(), getLayer0PacingMultiplier()],
    });
    let agilityGain = applyModifierPipeline(exercise.agility, {
        multiplicative: [getIntelligenceMultiplier()],
        layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier(), getLayer0PacingMultiplier()],
    });

    stats.strength = math.add(stats.strength, strengthGain);
    stats.strength = math.min(stats.strength, 1e200);
    stats.endurance = math.add(stats.endurance, enduranceGain);
    stats.endurance = math.min(stats.endurance, 1e200);
    stats.agility = math.add(stats.agility, agilityGain);
    stats.agility = math.min(stats.agility, 1e200);
    exercise.current = math.mul(completionOverflow, getGymMasteryOverflowRetention());
    let maxCarry = math.max(0, math.sub(exercise.max, 0.000001));
    exercise.current = math.min(exercise.current, maxCarry);
    if (checks.gymType === 2 || checks.gymType === 3) {
        exerciseDisplayCycleStartById[exercise.id] = exercise.current;
    }
    markExerciseCompletionPulse(exercise.id);
}

function getYogaExerciseList() {
    return [yoga.sun, yoga.vinyasa, yoga.balance, yoga.mobility, yoga.core, yoga.breath];
}

function getActiveYogaExercises() {
    return getYogaExerciseList().filter(function (exercise) {
        return exercise != null && !exercise.isStopped;
    });
}

function getYogaExerciseCycleMs(exercise) {
    let scaledSpeedMs = math.max(1, math.div(exercise.speed, exercise.speedModifier));
    let ticksPerCycle = math.max(1, math.div(exercise.max, exercise.increase));
    return math.max(1, math.mul(scaledSpeedMs, ticksPerCycle));
}

function buildYogaExerciseTickState(exercise, tickSeconds) {
    let cycleMs = getYogaExerciseCycleMs(exercise);
    let cycleSeconds = math.max(0.001, math.div(cycleMs, 1000));
    let progressPerSecond = math.div(exercise.max, cycleSeconds);
    let progressGain = math.mul(progressPerSecond, tickSeconds);
    let energyPerSecond = math.div(exercise.energy, cycleSeconds);
    let requestedEnergy = math.mul(energyPerSecond, tickSeconds);

    if (requestedEnergy <= 0 || progressGain <= 0) {
        return null;
    }

    return {
        exercise: exercise,
        progressGain: progressGain,
        requestedEnergy: requestedEnergy,
    };
}

function markExerciseCompletionPulse(exerciseId) {
    if (exerciseId == null) {
        return;
    }
    // Hold full bar for a couple refresh frames so completion is visible
    // before any overflow carry starts the next rep bar.
    exerciseCompletionPulseById[exerciseId] = 2;
}

function consumeExerciseCompletionPulse(exerciseId) {
    if (exerciseId == null) {
        return false;
    }
    let pulse = exerciseCompletionPulseById[exerciseId];
    if (pulse == null || pulse <= 0) {
        return false;
    }
    exerciseCompletionPulseById[exerciseId] = pulse - 1;
    return true;
}

function runYogaContinuousTick(deltaSeconds, exerciseList) {
    let tickSeconds = math.max(0.001, math.evaluate(deltaSeconds || YOGA_CONTINUOUS_TICK_SECONDS));
    let sourceExercises = Array.isArray(exerciseList) ? exerciseList : getActiveYogaExercises();
    let tickStates = [];
    let totalRequestedEnergy = 0;

    for (let i = 0; i < sourceExercises.length; i++) {
        let exercise = sourceExercises[i];
        if (exercise == null || exercise.isStopped) {
            continue;
        }
        let tickState = buildYogaExerciseTickState(exercise, tickSeconds);
        if (tickState == null) {
            continue;
        }
        tickStates.push(tickState);
        totalRequestedEnergy = math.add(totalRequestedEnergy, tickState.requestedEnergy);
    }

    if (tickStates.length === 0 || totalRequestedEnergy <= 0) {
        return;
    }

    let availableEnergy = math.max(0, stats.energy.current);
    if (checks.isResting) {
        // Match baseline resting behavior: once resting starts, wait for a full refill.
        if (availableEnergy + 1e-9 < stats.energy.max) {
            return;
        }
        checks.isResting = false;
    }

    if (availableEnergy <= 0) {
        checks.isResting = true;
        return;
    }

    let spendRatio = math.min(1, math.div(availableEnergy, totalRequestedEnergy));
    if (spendRatio <= 0) {
        checks.isResting = true;
        return;
    }

    let spentEnergy = math.mul(totalRequestedEnergy, spendRatio);
    stats.energy.current = math.max(0, math.sub(stats.energy.current, spentEnergy));
    renderEnergyProgressBar();

    for (let i = 0; i < tickStates.length; i++) {
        let tickState = tickStates[i];
        let adjustedProgressGain = math.mul(tickState.progressGain, spendRatio);
        if (adjustedProgressGain <= 0) {
            continue;
        }

        let exercise = tickState.exercise;
        let nextProgress = math.add(exercise.current, adjustedProgressGain);
        if (nextProgress < exercise.max) {
            exercise.current = nextProgress;
            continue;
        }

        let completionOverflow = math.max(0, math.sub(nextProgress, exercise.max));
        completeExerciseCycle(exercise, completionOverflow);
    }

    checks.isResting = spendRatio < 1 || stats.energy.current <= 0;
}

function yogaExerciseTick(exercise, deltaSeconds) {
    runYogaContinuousTick(deltaSeconds, [exercise]);
}

function cardioExerciseTick(exercise, deltaSeconds) {
    runCardioContinuousTick(deltaSeconds, [exercise]);
}

function exerciseTick(exercise) {
    if (checks.gymType === 2 && exercise.id >= 12 && exercise.id <= 17) {
        yogaExerciseTick(exercise, YOGA_CONTINUOUS_TICK_SECONDS);
        return;
    }
    if (checks.gymType === 3 && exercise.id >= 18 && exercise.id <= 23) {
        cardioExerciseTick(exercise, CARDIO_CONTINUOUS_TICK_SECONDS);
        return;
    }

    if (checks.isResting) {
        if (stats.energy.current + 1e-9 < stats.energy.max) {
            return;
        }
        checks.isResting = false;
    }

    if (stats.energy.current < exercise.energy && exercise.current == 0) {
        checks.isResting = true;
    }

    if (!checks.isResting) {
        if (exercise.current == 0) {
            stats.energy.current = math.sub(stats.energy.current, exercise.energy);
            renderEnergyProgressBar();
        }
        if (exercise.current < exercise.max) {
            exercise.current = math.add(exercise.current, exercise.increase);
        }
        else {
            let completionOverflow = math.max(0, math.sub(exercise.current, exercise.max));
            completeExerciseCycle(exercise, completionOverflow);
        }
    }
}

function setupOneSecondTimer() {
    oneSecondTimerId = setInterval(function () {
        addRunSeconds(1);
        if (checks.gymType == -1) {
            let videoIncome = jobMoneyPerSecond();
            if (math.add(stats.money, videoIncome) > 0) {
                stats.money = math.add(stats.money, videoIncome);
                addRunGain("moneyEarned", videoIncome);
            }
            else {
                stats.money = 0;
            }

            job.followerGrowth = math.add(job.followerGrowth, followerGrowthPerSecond());
            let researchGain = researchPointsPerSecond();
            research.points = math.add(research.points, researchGain);
            addRunGain("researchEarned", researchGain);
            research.postGrowth = math.add(research.postGrowth, postGrowthPerSecond());
        }
        else {
            let gymMoneyGain = gymMoneyPerSecond();
            stats.money = math.add(stats.money, gymMoneyGain);
            stats.money = math.min(stats.money, 1e200);
            addRunGain("moneyEarned", gymMoneyGain);

            let influenceGain = gymInfluencePerSecond();
            gym.advertising.influence = math.add(gym.advertising.influence, influenceGain);
            gym.advertising.influence = math.min(gym.advertising.influence, 1e200);
            addRunGain("influenceEarned", influenceGain);

            let totalToAdd = gymMembersPerSecond();
            gym.members.current = math.add(gym.members.current, totalToAdd);
            gym.members.tiers[0].current = math.add(gym.members.tiers[0].current, totalToAdd);
            gym.advertising.campaignGrowth = math.add(gym.advertising.campaignGrowth, gymCampaignGrowthPerSecond());
            gym.advertising.campaignGrowth = applySoftcap(gym.advertising.campaignGrowth, 1e200, 0.5);

            // street gang
            let gangStrengthGrowth = gangStrengthPerSecond();
            bodyweight.gang.strength = math.add(bodyweight.gang.strength, gangStrengthGrowth);
            bodyweight.gang.strength = math.min(bodyweight.gang.strength, 1e100);

            let gangMemberGrowth = gangMembersPerSecond();
            bodyweight.gang.members = math.add(bodyweight.gang.members, gangMemberGrowth);
            bodyweight.gang.members = math.min(bodyweight.gang.members, 1e100);

            for (let i = 0; i < bodyweight.gang.rivals.length; i++) {
                bodyweight.gang.rivals[i].strength = math.add(
                    bodyweight.gang.rivals[i].strength,
                    math.mul(bodyweight.gang.rivals[i].strengthAmount, bodyweight.gang.on)
                );
                bodyweight.gang.rivals[i].members = math.add(
                    bodyweight.gang.rivals[i].members,
                    math.mul(bodyweight.gang.rivals[i].memberAmount, bodyweight.gang.on)
                );
            }

            advanceAcademySeason(1);
            advanceYogaBreathCycle(1);
            advanceCardioInterval(1);


            // check for autoclickers
            if (checks.bwGymBuyerOn && checks.gymType == 0) {
                autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
            }
            if (checks.bwUpgradeBuyerOn && checks.gymType == 0) {
                autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
                autobuyUpgrades(gym.bw.upgrades, "bwUpgrade", stats.money);
            }
            if (checks.bwAdBuyerOn && checks.gymType == 0) {
                autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
            }
            if (checks.liftingGymBuyerOn && checks.gymType == 1) {
                autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
            }
            if (checks.liftingUpgradeBuyerOn && checks.gymType == 1) {
                autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
                autobuyUpgrades(gym.lifting.upgrades, "liftingUpgrade", stats.money);
            }
            if (checks.liftingAdBuyerOn && checks.gymType == 1) {
                autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
            }
            if (checks.yogaGymBuyerOn && checks.gymType == 2) {
                autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
            }
            if (checks.yogaUpgradeBuyerOn && checks.gymType == 2) {
                autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
                autobuyUpgrades(gym.yoga.upgrades, "yogaUpgrade", stats.money);
            }
            if (checks.yogaAdBuyerOn && checks.gymType == 2) {
                autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
            }
            if (checks.cardioGymBuyerOn && checks.gymType == 3) {
                autobuyUpgrades(gym.gymUpgrades, "gymUpgrade", stats.money);
            }
            if (checks.cardioUpgradeBuyerOn && checks.gymType == 3) {
                autobuyUpgrades(gym.upgrades, "upgrade", stats.money);
                autobuyUpgrades(gym.cardio.upgrades, "cardioUpgrade", stats.money);
            }
            if (checks.cardioAdBuyerOn && checks.gymType == 3) {
                autobuyUpgrades(gym.adUpgrades, "adUpgrade", gym.advertising.influence);
            }
            if (checks.gymSalesBuyerOn) {
                autobuyEmployees(gym.employees.sales, "salesBtn", stats.money);
            }
            if (checks.gymTrainerBuyerOn) {
                autobuyEmployees(gym.employees.trainers, "trainerBtn", stats.money);
            }
            if (checks.gymCoordinatorBuyerOn) {
                autobuyEmployees(gym.employees.coordinators, "coordinatorBtn", stats.money);
            }
            if (checks.gymNutritionistBuyerOn) {
                autobuyEmployees(gym.employees.nutritionists, "nutritionistBtn", stats.money);
            }
            if (checks.adCoordinatorBuyerOn) {
                autobuyEmployees(gym.advertising.employees.coordinators, "adCoordinatorBtn", stats.money);
            }
            if (checks.adDesignerBuyerOn) {
                autobuyEmployees(gym.advertising.employees.designers, "designerBtn", stats.money);
            }
            if (checks.adManagerBuyerOn) {
                autobuyEmployees(gym.advertising.employees.managers, "managerBtn", stats.money);
            }
            if (checks.coffeeClickerOn) {
                $("#coffeeBtn").click();
            }

            let found = false;
            for (let i = 0; i < bodyweight.gang.rivals.length; i++) {
                if (!bodyweight.gang.rivals[i].isAbsorbed && !found) {
                    found = true;
                    bodyweight.gang.rivalId = i;
                }
            }

            if (checks.absorbGangsOn && checks.gymType == 0 && found && math.mul(gangPower(bodyweight.gang.strength, bodyweight.gang.members), 0.4) >= gangPower(bodyweight.gang.rivals[bodyweight.gang.rivalId].strength, bodyweight.gang.rivals[bodyweight.gang.rivalId].members)) {
                $("#gangFightBtn").click();
            }

            runAcademyAutomation();
            runYogaAutomation();
            runCardioAutomation();
        }

        applyPassiveMetaGeneration(1);

        updatePrestigeValues();
        assertValidState("one_second_tick", { strict: true });
    }, getScaledTimerDelay(1000));
}

function autobuyUpgrades(upgradeArray, text, points) {
    for (let i = 0; i < upgradeArray.length; i++) {
        if (!upgradeArray[i].isPurchased && points >= upgradeArray[i].cost) {
            $("#" + text + "Btn" + upgradeArray[i].id).click();
            points -= upgradeArray[i].cost;
        }
    }
}
function autobuyEmployees(employee, text) {
    if (stats.money >= getEmployeeCost(employee)) {
        $("#" + text).click();
    }
}

function autobuyConferences(compType, text) {
    if (lifting.comps.competitions.current >= compType.cost) {
        $("#" + text).click();
    }
}

function refreshProgressBarsAndStats(text, exercise, progression, finalMessage) {
    let strength = applyModifierPipeline(exercise.strength, {
        multiplicative: [getIntelligenceMultiplier()],
        layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier()],
    });
    var strengthFormat = strength < 1000000 ? strength.toFixed(2) : math.format(strength, 3);
    let endurance = applyModifierPipeline(exercise.endurance, {
        multiplicative: [getIntelligenceMultiplier()],
        layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier()],
    });
    var enduranceFormat = endurance < 1000000 ? endurance.toFixed(2) : math.format(endurance, 3);
    let agility = applyModifierPipeline(exercise.agility, {
        multiplicative: [getIntelligenceMultiplier()],
        layer: [getLeadershipMultiplier(), getLayer1PacingMultiplier()],
    });
    var agilityFormat = agility < 1000000 ? agility.toFixed(2) : math.format(agility, 3);
    var totalFormat = exercise.total < 1000000 ? exercise.total.toFixed(2) : math.format(exercise.total, 3);

    let progressPercent = math.max(0, math.min(100, (exercise.current / exercise.max) * 100));
    if (checks.gymType === 2 || checks.gymType === 3) {
        let displayStart = exerciseDisplayCycleStartById[exercise.id];
        if (displayStart == null || !Number.isFinite(displayStart) || displayStart < 0 || displayStart >= exercise.max || exercise.current < displayStart) {
            displayStart = 0;
            exerciseDisplayCycleStartById[exercise.id] = 0;
        }
        let denominator = math.max(0.000001, math.sub(exercise.max, displayStart));
        let adjustedCurrent = math.max(0, math.sub(exercise.current, displayStart));
        progressPercent = math.max(0, math.min(100, math.mul(math.div(adjustedCurrent, denominator), 100)));
    }
    if (consumeExerciseCompletionPulse(exercise.id)) {
        progressPercent = 100;
    }
    $("#" + text + "Progress").css("width", progressPercent + "%");
    if (checks.gymType == -1 || checks.gymType == 0 || checks.gymType == 2 || checks.gymType == 3) {
        $("#" + text + "UpgradeProgress").css("width", ((exercise.total / exercise.tiers[exercise.tier].upgrade) * 100) + "%");
        $("#" + text + "Text").html(exercise.tiers[exercise.tier].name);
    }
    else if (checks.gymType == 1) {
        $("#" + text + "UpgradeProgress").css("width", ((exercise.repsToNext / exercise.repsToNextBase) * 100) + "%");
        $("#" + text + "Text").html(exercise.name + " (" + exercise.weight + "lbs)");
    }

    $("#" + text + "Tooltip").prop("title", progression + "Energy: " + exercise.energy.toFixed(2) + "<br />Strength: " + strengthFormat + "<br />Endurance: " + enduranceFormat + "<br />Agility: " + agilityFormat + "<br />Total Reps:" + totalFormat + "<br /><br />" + finalMessage).tooltip("_fixTitle");
}

function toggleAlert(alert) {
    $(alert).tooltip("toggle");
}

function buyLiftingComp(button, compType) {
    if (!$(button).hasClass("disabled")) {
        if (lifting.comps.competitions.current >= compType.cost) {
            if (compType.id == 5 && compType.current < 10) {
                prestige.lifting.leadership = math.add(prestige.lifting.leadership, getLeadershipPerWorldConference());
            }
            compType.current += 1;
            lifting.comps.competitions.current -= compType.cost;
            compType.cost *= compType.multi;

            switch (compType.id) {
                case 1:
                    break;
                default:
            }
        }
    }
}

function addCompetition() {
    lifting.comps.competitions.current += 1;
}

//#endregion

//#region bodyweight

function setupPushupTimer() {
    pushupTimerId = setInterval(function () {
        exerciseTick(bodyweight.pushups);
    }, getScaledTimerDelay(bodyweight.pushups.speed / bodyweight.pushups.speedModifier));
}
function setupRowTimer() {
    rowTimerId = setInterval(function () {
        exerciseTick(bodyweight.rows);
    }, getScaledTimerDelay(bodyweight.rows.speed / bodyweight.rows.speedModifier));
}

function setupDipTimer() {
    dipTimerId = setInterval(function () {
        exerciseTick(bodyweight.dips);
    }, getScaledTimerDelay(bodyweight.dips.speed / bodyweight.dips.speedModifier));
}

function setupPullupTimer() {
    pullupTimerId = setInterval(function () {
        exerciseTick(bodyweight.pullups);
    }, getScaledTimerDelay(bodyweight.pullups.speed / bodyweight.pullups.speedModifier));
}

function setupBwRdlTimer() {
    bwRdlTimerId = setInterval(function () {
        exerciseTick(bodyweight.rdl);
    }, getScaledTimerDelay(bodyweight.rdl.speed / bodyweight.rdl.speedModifier));
}

function setupBwSquatTimer() {
    bwSquatTimerId = setInterval(function () {
        exerciseTick(bodyweight.squats);
    }, getScaledTimerDelay(bodyweight.squats.speed / bodyweight.squats.speedModifier));
}

function setupLiftingBenchTimer() {
    liftingBenchTimerId = setInterval(function () {
        exerciseTick(lifting.bench);
    }, getScaledTimerDelay(lifting.bench.speed / lifting.bench.speedModifier));
}

function setupLiftingRowTimer() {
    liftingRowTimerId = setInterval(function () {
        exerciseTick(lifting.rows);
    }, getScaledTimerDelay(lifting.rows.speed / lifting.rows.speedModifier));
}

function setupLiftingOhpTimer() {
    liftingOhpTimerId = setInterval(function () {
        exerciseTick(lifting.ohp);
    }, getScaledTimerDelay(lifting.ohp.speed / lifting.ohp.speedModifier));
}

function setupLiftingSquatsTimer() {
    liftingSquatsTimerId = setInterval(function () {
        exerciseTick(lifting.squats);
    }, getScaledTimerDelay(lifting.squats.speed / lifting.squats.speedModifier));
}

function setupLiftingDlsTimer() {
    liftingDlsTimerId = setInterval(function () {
        exerciseTick(lifting.dls);
    }, getScaledTimerDelay(lifting.dls.speed / lifting.dls.speedModifier));
}

function setupLiftingCurlsTimer() {
    liftingCurlsTimerId = setInterval(function () {
        exerciseTick(lifting.curls);
    }, getScaledTimerDelay(lifting.curls.speed / lifting.curls.speedModifier));
}

function setupYogaContinuousTimer() {
    if (yogaContinuousTimerId != null) {
        return;
    }

    let lastTickSampleMs = getDebugSampleTimeMs();
    yogaContinuousTimerId = setInterval(function () {
        let nowSampleMs = getDebugSampleTimeMs();
        let elapsedRealMs = nowSampleMs - lastTickSampleMs;
        lastTickSampleMs = nowSampleMs;

        if (!Number.isFinite(elapsedRealMs) || elapsedRealMs <= 0) {
            elapsedRealMs = YOGA_CONTINUOUS_REAL_INTERVAL_MS;
        }

        // Offline progression is handled separately; keep runtime catch-up bounded.
        elapsedRealMs = math.min(elapsedRealMs, 250);

        let speedScale = math.mul(debugSpeedMultiplier, getGymMasteryActionSpeedMultiplier());
        let tickSeconds = math.max(0.001, math.mul(math.div(elapsedRealMs, 1000), speedScale));
        runYogaContinuousTick(tickSeconds);
    }, YOGA_CONTINUOUS_REAL_INTERVAL_MS);

    yogaSunTimerId = yogaContinuousTimerId;
    yogaVinyasaTimerId = yogaContinuousTimerId;
    yogaBalanceTimerId = yogaContinuousTimerId;
    yogaMobilityTimerId = yogaContinuousTimerId;
    yogaCoreTimerId = yogaContinuousTimerId;
    yogaBreathTimerId = yogaContinuousTimerId;
}

function stopYogaContinuousTimerIfIdle() {
    if (getActiveYogaExercises().length > 0) {
        return;
    }

    if (yogaContinuousTimerId != null) {
        clearInterval(yogaContinuousTimerId);
    }
    yogaContinuousTimerId = null;
    yogaSunTimerId = null;
    yogaVinyasaTimerId = null;
    yogaBalanceTimerId = null;
    yogaMobilityTimerId = null;
    yogaCoreTimerId = null;
    yogaBreathTimerId = null;
    checks.isResting = false;
}

function setupYogaSunTimer() {
    setupYogaContinuousTimer();
}

function setupYogaVinyasaTimer() {
    setupYogaContinuousTimer();
}

function setupYogaBalanceTimer() {
    setupYogaContinuousTimer();
}

function setupYogaMobilityTimer() {
    setupYogaContinuousTimer();
}

function setupYogaCoreTimer() {
    setupYogaContinuousTimer();
}

function setupYogaBreathTimer() {
    setupYogaContinuousTimer();
}

function runCardioContinuousTick(deltaSeconds, exerciseList) {
    let tickSeconds = math.max(0.001, math.evaluate(deltaSeconds || CARDIO_CONTINUOUS_TICK_SECONDS));
    let sourceExercises = Array.isArray(exerciseList) ? exerciseList : getActiveCardioExercises();
    let tickStates = [];
    let totalRequestedEnergy = 0;

    for (let i = 0; i < sourceExercises.length; i++) {
        let exercise = sourceExercises[i];
        if (exercise == null || exercise.isStopped) {
            continue;
        }
        let tickState = buildCardioExerciseTickState(exercise, tickSeconds);
        if (tickState == null) {
            continue;
        }
        tickStates.push(tickState);
        totalRequestedEnergy = math.add(totalRequestedEnergy, tickState.requestedEnergy);
    }

    if (tickStates.length === 0 || totalRequestedEnergy <= 0) {
        return;
    }

    let availableEnergy = math.max(0, stats.energy.current);
    if (checks.isResting) {
        if (availableEnergy + 1e-9 < stats.energy.max) {
            return;
        }
        checks.isResting = false;
    }

    if (availableEnergy <= 0) {
        checks.isResting = true;
        return;
    }

    let spendRatio = math.min(1, math.div(availableEnergy, totalRequestedEnergy));
    if (spendRatio <= 0) {
        checks.isResting = true;
        return;
    }

    let spentEnergy = math.mul(totalRequestedEnergy, spendRatio);
    stats.energy.current = math.max(0, math.sub(stats.energy.current, spentEnergy));
    renderEnergyProgressBar();

    for (let i = 0; i < tickStates.length; i++) {
        let tickState = tickStates[i];
        let adjustedProgressGain = math.mul(tickState.progressGain, spendRatio);
        if (adjustedProgressGain <= 0) {
            continue;
        }

        let exercise = tickState.exercise;
        let nextProgress = math.add(exercise.current, adjustedProgressGain);
        if (nextProgress < exercise.max) {
            exercise.current = nextProgress;
            continue;
        }

        let completionOverflow = math.max(0, math.sub(nextProgress, exercise.max));
        completeExerciseCycle(exercise, completionOverflow);
    }

    checks.isResting = spendRatio < 1 || stats.energy.current <= 0;
}

function setupCardioContinuousTimer() {
    if (cardioContinuousTimerId != null) {
        return;
    }

    let lastTickSampleMs = getDebugSampleTimeMs();
    cardioContinuousTimerId = setInterval(function () {
        let nowSampleMs = getDebugSampleTimeMs();
        let elapsedRealMs = nowSampleMs - lastTickSampleMs;
        lastTickSampleMs = nowSampleMs;

        if (!Number.isFinite(elapsedRealMs) || elapsedRealMs <= 0) {
            elapsedRealMs = CARDIO_CONTINUOUS_REAL_INTERVAL_MS;
        }

        elapsedRealMs = math.min(elapsedRealMs, 250);

        let speedScale = math.mul(debugSpeedMultiplier, getGymMasteryActionSpeedMultiplier());
        let tickSeconds = math.max(0.001, math.mul(math.div(elapsedRealMs, 1000), speedScale));
        runCardioContinuousTick(tickSeconds);
    }, CARDIO_CONTINUOUS_REAL_INTERVAL_MS);

    cardioTreadmillTimerId = cardioContinuousTimerId;
    cardioBikeTimerId = cardioContinuousTimerId;
    cardioRowTimerId = cardioContinuousTimerId;
    cardioSprintsTimerId = cardioContinuousTimerId;
    cardioHillsTimerId = cardioContinuousTimerId;
    cardioRecoveryTimerId = cardioContinuousTimerId;
}

function stopCardioContinuousTimerIfIdle() {
    if (getActiveCardioExercises().length > 0) {
        return;
    }

    if (cardioContinuousTimerId != null) {
        clearInterval(cardioContinuousTimerId);
    }
    cardioContinuousTimerId = null;
    cardioTreadmillTimerId = null;
    cardioBikeTimerId = null;
    cardioRowTimerId = null;
    cardioSprintsTimerId = null;
    cardioHillsTimerId = null;
    cardioRecoveryTimerId = null;
    checks.isResting = false;
}

function setupCardioTreadmillTimer() {
    setupCardioContinuousTimer();
}

function setupCardioBikeTimer() {
    setupCardioContinuousTimer();
}

function setupCardioRowTimer() {
    setupCardioContinuousTimer();
}

function setupCardioSprintsTimer() {
    setupCardioContinuousTimer();
}

function setupCardioHillsTimer() {
    setupCardioContinuousTimer();
}

function setupCardioRecoveryTimer() {
    setupCardioContinuousTimer();
}


//#endregion

//#region phase 2

function newGym(type) {
    if (checks.isPrestige) {
        if (confirm("Are you sure you want to select this type of gym?")) {
            checks.isPrestige = false;
            // points
            let repeatingUpgradeState = JSON.parse(JSON.stringify(stats.repeatingUpgrades || {}));

            prestige.current = normalizePrestigePoints(math.add(prestige.current, math.add(prestige.total, 1)));
            prestige.total = math.add(prestige.total, 1);
            let gang = bodyweight.gang.name;
            switch (checks.gymType) {
                case -1:
                    prestige.bw.current = normalizePrestigePoints(math.add(prestige.bw.current, math.add(prestige.bw.total, 1)));
                    prestige.bw.total = math.add(prestige.bw.total, 1);
                    break;
                case 0:
                    prestige.bw.current = normalizePrestigePoints(math.add(prestige.bw.current, math.add(prestige.bw.total, 1)));
                    prestige.bw.total = math.add(prestige.bw.total, 1);
                    break;
                case 1:
                    prestige.lifting.current = normalizePrestigePoints(math.add(prestige.lifting.current, math.add(prestige.lifting.total, 1)));
                    prestige.lifting.total = math.add(prestige.lifting.total, 1);
                    break;
                case 2:
                    prestige.yoga.current = normalizePrestigePoints(math.add(prestige.yoga.current, math.add(prestige.yoga.total, 1)));
                    prestige.yoga.total = math.add(prestige.yoga.total, 1);
                    break;
                case 3:
                    prestige.cardio.current = normalizePrestigePoints(math.add(prestige.cardio.current, math.add(prestige.cardio.total, 1)));
                    prestige.cardio.total = math.add(prestige.cardio.total, 1);
                    break;
                default:
            }

            // set gym type
            checks.gymType = type;
            // reset game
            stats = JSON.parse(JSON.stringify(baseStats));
            bodyweight = JSON.parse(JSON.stringify(baseBodyweight));
            upgrades = JSON.parse(JSON.stringify(baseUpgrades));
            job = JSON.parse(JSON.stringify(baseJob));
            research = JSON.parse(JSON.stringify(baseResearch));
            gym = JSON.parse(JSON.stringify(baseGym));
            lifting = JSON.parse(JSON.stringify(baseLifting));
            yoga = JSON.parse(JSON.stringify(baseYoga));
            cardio = JSON.parse(JSON.stringify(baseCardio));
            stats.repeatingUpgrades = repeatingUpgradeState;

            bodyweight.gang.name = gang;
            $("#gym-tab").removeClass("d-none");
            checks.story6 = true;

            loadReset();
            load(null, true, false);

            // apply existing prestige upgrades
            reapplyPrestige(prestige.upgrades, "globalUpgrade", -1);
            switch (checks.gymType) {
                case 0:
                    reapplyPrestige(prestige.bw.upgrades, "globalBwUpgrade", 0);
                    break;
                case 1:
                    reapplyPrestige(prestige.lifting.upgrades, "globalLiftingUpgrade", 1);
                    break;
                case 2:
                    reapplyPrestige(prestige.yoga.upgrades, "globalYogaUpgrade", 2);
                    break;
                case 3:
                    reapplyPrestige(prestige.cardio.upgrades, "globalCardioUpgrade", 3);
                    break;
                default:
            }

            gym.members.focusId = 0;
            focusMemberTier(0);

            $("#story").prepend("<div id='story6' class='alert alert-primary alert-dismissible fade show fixed-bottom' role='alert'><strong>My new gym is open!</strong> I can now train my replacement before opening another franchise location.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
            updatePrestigeValues();
            updateAutobuyerToggles();
        }
    }
}

function reapplyPrestige(upgradeArray, text, type) {
    for (let i = 0; i < upgradeArray.length; i++) {

        if (upgradeArray[i].isPurchased) {
            switch (type) {
                case -1:
                    globalUpgradeClick($("#" + text + "Btn" + upgradeArray[i].id), true);
                    break;
                case 0:
                    globalBwUpgradeClick($("#" + text + "Btn" + upgradeArray[i].id), true);
                    break;
                case 1:
                    globalLiftingUpgradeClick($("#" + text + "Btn" + upgradeArray[i].id), true);
                    break;
                case 2:
                    globalYogaUpgradeClick($("#" + text + "Btn" + upgradeArray[i].id), true);
                    break;
                case 3:
                    globalCardioUpgradeClick($("#" + text + "Btn" + upgradeArray[i].id), true);
                    break;
                default:
            }

        }
    }
}

function updateAutobuyerToggles() {
    $("#autoBuyers").html("");
    if (
        checks.liftingAdBuyer || checks.liftingGymBuyer || checks.liftingUpgradeBuyer ||
        checks.yogaAdBuyer || checks.yogaGymBuyer || checks.yogaUpgradeBuyer || checks.breathBuyer ||
        checks.cardioAdBuyer || checks.cardioGymBuyer || checks.cardioUpgradeBuyer || checks.paceBuyer ||
        checks.conferenceBuyer || checks.absorbGangs || checks.coffeeClicker ||
        checks.bwAdBuyer || checks.bwUpgradeBuyer || checks.bwGymBuyer ||
        checks.gymSalesBuyer || checks.gymTrainerBuyer || checks.gymCoordinatorBuyer ||
        checks.gymNutritionistBuyer || checks.adCoordinatorBuyer || checks.adDesignerBuyer ||
        checks.adManagerBuyer
    ) {
        $("#autoBuyers").append("<h5>Autobuyers</h5>");
        $("#autoBuyers").append("<div class='form-group' id='autoBuyerGroup'></div>");
    }
    if (checks.bwUpgradeBuyer && checks.gymType == 0) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='bwUpgradeBuyer' onchange='toggleAutobuyer(0);'" + (checks.bwUpgradeBuyerOn ? " checked" : "") + "><label class='form-check-label' for='bwUpgradeBuyer'>Buy Workout Upgrades</label></div>");
    }
    if (checks.bwGymBuyer && checks.gymType == 0) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='bwGymBuyer' onchange='toggleAutobuyer(1);'" + (checks.bwGymBuyerOn ? " checked" : "") + "><label class='form-check-label' for='bwGymBuyer'>Buy Gym Upgrades</label></div>");
    }
    if (checks.bwAdBuyer && checks.gymType == 0) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='bwAdBuyer' onchange='toggleAutobuyer(2);'" + (checks.bwAdBuyerOn ? " checked" : "") + "><label class='form-check-label' for='bwAdBuyer'>Buy Advertising Upgrades</label></div>");
    }
    if (checks.liftingUpgradeBuyer && checks.gymType == 1) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='liftingUpgradeBuyer' onchange='toggleAutobuyer(12);'" + (checks.liftingUpgradeBuyerOn ? " checked" : "") + "><label class='form-check-label' for='liftingUpgradeBuyer'>Buy Workout Upgrades</label></div>");
    }
    if (checks.liftingGymBuyer && checks.gymType == 1) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='liftingGymBuyer' onchange='toggleAutobuyer(13);'" + (checks.liftingGymBuyerOn ? " checked" : "") + "><label class='form-check-label' for='liftingGymBuyer'>Buy Gym Upgrades</label></div>");
    }
    if (checks.liftingAdBuyer && checks.gymType == 1) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='liftingAdBuyer' onchange='toggleAutobuyer(14);'" + (checks.liftingAdBuyerOn ? " checked" : "") + "><label class='form-check-label' for='liftingAdBuyer'>Buy Advertising Upgrades</label></div>");
    }
    if (checks.yogaUpgradeBuyer && checks.gymType == 2) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='yogaUpgradeBuyer' onchange='toggleAutobuyer(16);'" + (checks.yogaUpgradeBuyerOn ? " checked" : "") + "><label class='form-check-label' for='yogaUpgradeBuyer'>Buy Workout Upgrades</label></div>");
    }
    if (checks.yogaGymBuyer && checks.gymType == 2) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='yogaGymBuyer' onchange='toggleAutobuyer(17);'" + (checks.yogaGymBuyerOn ? " checked" : "") + "><label class='form-check-label' for='yogaGymBuyer'>Buy Gym Upgrades</label></div>");
    }
    if (checks.yogaAdBuyer && checks.gymType == 2) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='yogaAdBuyer' onchange='toggleAutobuyer(18);'" + (checks.yogaAdBuyerOn ? " checked" : "") + "><label class='form-check-label' for='yogaAdBuyer'>Buy Advertising Upgrades</label></div>");
    }
    if (checks.breathBuyer && checks.gymType == 2) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='breathBuyer' onchange='toggleAutobuyer(19);'" + (checks.breathBuyerOn ? " checked" : "") + "><label class='form-check-label' for='breathBuyer'>Route Automation</label></div>");
    }
    if (checks.cardioUpgradeBuyer && checks.gymType == 3) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='cardioUpgradeBuyer' onchange='toggleAutobuyer(20);'" + (checks.cardioUpgradeBuyerOn ? " checked" : "") + "><label class='form-check-label' for='cardioUpgradeBuyer'>Buy Workout Upgrades</label></div>");
    }
    if (checks.cardioGymBuyer && checks.gymType == 3) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='cardioGymBuyer' onchange='toggleAutobuyer(21);'" + (checks.cardioGymBuyerOn ? " checked" : "") + "><label class='form-check-label' for='cardioGymBuyer'>Buy Gym Upgrades</label></div>");
    }
    if (checks.cardioAdBuyer && checks.gymType == 3) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='cardioAdBuyer' onchange='toggleAutobuyer(22);'" + (checks.cardioAdBuyerOn ? " checked" : "") + "><label class='form-check-label' for='cardioAdBuyer'>Buy Advertising Upgrades</label></div>");
    }
    if (checks.paceBuyer && checks.gymType == 3) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='paceBuyer' onchange='toggleAutobuyer(23);'" + (checks.paceBuyerOn ? " checked" : "") + "><label class='form-check-label' for='paceBuyer'>Race Day Automation</label></div>");
    }
    if (checks.gymSalesBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='gymSalesBuyer' onchange='toggleAutobuyer(3);'" + (checks.gymSalesBuyerOn ? " checked" : "") + "><label class='form-check-label' for='gymSalesBuyer'>Buy Sales Representatives</label></div>");
    }
    if (checks.gymTrainerBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='gymTrainerBuyer' onchange='toggleAutobuyer(4);'" + (checks.gymTrainerBuyerOn ? " checked" : "") + "><label class='form-check-label' for='gymTrainerBuyer'>Buy Trainers</label></div>");
    }
    if (checks.gymCoordinatorBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='gymCoordinatorBuyer' onchange='toggleAutobuyer(5);'" + (checks.gymCoordinatorBuyerOn ? " checked" : "") + "><label class='form-check-label' for='gymCoordinatorBuyer'>Buy Program Coordinators</label></div>");
    }
    if (checks.gymNutritionistBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='gymNutritionistBuyer' onchange='toggleAutobuyer(6);'" + (checks.gymNutritionistBuyerOn ? " checked" : "") + "><label class='form-check-label' for='gymNutritionistBuyer'>Buy Nutritionists</label></div>");
    }
    if (checks.adCoordinatorBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='adCoordinatorBuyer' onchange='toggleAutobuyer(7);'" + (checks.adCoordinatorBuyerOn ? " checked" : "") + "><label class='form-check-label' for='adCoordinatorBuyer'>Buy Ad Coordinators</label></div>");
    }
    if (checks.adDesignerBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='adDesignerBuyer' onchange='toggleAutobuyer(8);'" + (checks.adDesignerBuyerOn ? " checked" : "") + "><label class='form-check-label' for='adDesignerBuyer'>Buy Ad Designers</label></div>");
    }
    if (checks.adManagerBuyer) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='adManagerBuyer' onchange='toggleAutobuyer(9);'" + (checks.adManagerBuyerOn ? " checked" : "") + "><label class='form-check-label' for='adManagerBuyer'>Buy Marketing Managers</label></div>");
    }
    if (checks.coffeeClicker) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='coffeeBuyer' onchange='toggleAutobuyer(10);'" + (checks.coffeeClickerOn ? " checked" : "") + "><label class='form-check-label' for='coffeeBuyer'>Click Coffee</label></div>");
    }
    if (checks.absorbGangs && checks.gymType == 0) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='absorbGangs' onchange='toggleAutobuyer(11);'" + (checks.absorbGangsOn ? " checked" : "") + "><label class='form-check-label' for='absorbGangs'>Absorb Gangs</label></div>");
    }
    if (checks.conferenceBuyer && checks.gymType == 1) {
        $("#autoBuyerGroup").append("<div class='form-group form-check'><input type='checkbox' class='form-check-input' id='buyConferences' onchange='toggleAutobuyer(15);'" + (checks.conferenceBuyerOn ? " checked" : "") + "><label class='form-check-label' for='buyConferences'>Academy Automation</label></div>");
    }
}

function toggleAutobuyer(buyerId) {
    switch (buyerId) {
        case 0:
            checks.bwUpgradeBuyerOn ? checks.bwUpgradeBuyerOn = false : checks.bwUpgradeBuyerOn = true;
            break;
        case 1:
            checks.bwGymBuyerOn ? checks.bwGymBuyerOn = false : checks.bwGymBuyerOn = true;
            break;
        case 2:
            checks.bwAdBuyerOn ? checks.bwAdBuyerOn = false : checks.bwAdBuyerOn = true;
            break;
        case 3:
            checks.gymSalesBuyerOn ? checks.gymSalesBuyerOn = false : checks.gymSalesBuyerOn = true;
            break;
        case 4:
            checks.gymTrainerBuyerOn ? checks.gymTrainerBuyerOn = false : checks.gymTrainerBuyerOn = true;
            break;
        case 5:
            checks.gymCoordinatorBuyerOn ? checks.gymCoordinatorBuyerOn = false : checks.gymCoordinatorBuyerOn = true;
            break;
        case 6:
            checks.gymNutritionistBuyerOn ? checks.gymNutritionistBuyerOn = false : checks.gymNutritionistBuyerOn = true;
            break;
        case 7:
            checks.adCoordinatorBuyerOn ? checks.adCoordinatorBuyerOn = false : checks.adCoordinatorBuyerOn = true;
            break;
        case 8:
            checks.adDesignerBuyerOn ? checks.adDesignerBuyerOn = false : checks.adDesignerBuyerOn = true;
            break;
        case 9:
            checks.adManagerBuyerOn ? checks.adManagerBuyerOn = false : checks.adManagerBuyerOn = true;
            break;
        case 10:
            checks.coffeeClickerOn ? checks.coffeeClickerOn = false : checks.coffeeClickerOn = true;
            break;
        case 11:
            checks.absorbGangsOn ? checks.absorbGangsOn = false : checks.absorbGangsOn = true;
            break;
        case 12:
            checks.liftingUpgradeBuyerOn ? checks.liftingUpgradeBuyerOn = false : checks.liftingUpgradeBuyerOn = true;
            break;
        case 13:
            checks.liftingGymBuyerOn ? checks.liftingGymBuyerOn = false : checks.liftingGymBuyerOn = true;
            break;
        case 14:
            checks.liftingAdBuyerOn ? checks.liftingAdBuyerOn = false : checks.liftingAdBuyerOn = true;
            break;
        case 15:
            checks.conferenceBuyerOn ? checks.conferenceBuyerOn = false : checks.conferenceBuyerOn = true;
            break;
        case 16:
            checks.yogaUpgradeBuyerOn ? checks.yogaUpgradeBuyerOn = false : checks.yogaUpgradeBuyerOn = true;
            break;
        case 17:
            checks.yogaGymBuyerOn ? checks.yogaGymBuyerOn = false : checks.yogaGymBuyerOn = true;
            break;
        case 18:
            checks.yogaAdBuyerOn ? checks.yogaAdBuyerOn = false : checks.yogaAdBuyerOn = true;
            break;
        case 19:
            checks.breathBuyerOn ? checks.breathBuyerOn = false : checks.breathBuyerOn = true;
            break;
        case 20:
            checks.cardioUpgradeBuyerOn ? checks.cardioUpgradeBuyerOn = false : checks.cardioUpgradeBuyerOn = true;
            break;
        case 21:
            checks.cardioGymBuyerOn ? checks.cardioGymBuyerOn = false : checks.cardioGymBuyerOn = true;
            break;
        case 22:
            checks.cardioAdBuyerOn ? checks.cardioAdBuyerOn = false : checks.cardioAdBuyerOn = true;
            break;
        case 23:
            checks.paceBuyerOn ? checks.paceBuyerOn = false : checks.paceBuyerOn = true;
            break;
        default:
    }
}

function hireEmployee(button, employee) {
    if (!$(button).hasClass("disabled")) {
        if (stats.money >= getEmployeeCost(employee)) {
            stats.money = math.sub(stats.money, getEmployeeCost(employee));
            employee.cost *= employee.costMultiplier;
            employee.current = math.add(employee.current, 1);
        }
    }
}

function gymMoneyPerSecond() {
    let total = 0;
    let classMultiplier = getClassMoneyMultiplier();
    let competitionMultiplier = getCompetitionMoneyMultiplier();
    let layer1PacingMultiplier = getLayer1PacingMultiplier();
    let leadershipMoneyMultiplier = getLeadershipShopMemberMoneyMultiplier();
    let globalEconomyMultiplier = getRepeatingGlobalGymEconomyMultiplier();

    for (let i = 0; i < gym.members.tiers.length; i++) {
        let tierIncome = applyModifierPipeline(gym.members.tiers[i].current, {
            multiplicative: [
                gym.money.growth,
                math.mul(gym.members.tiers[i].multiplier, (i + 1)),
            ],
            global: [classMultiplier, leadershipMoneyMultiplier, globalEconomyMultiplier],
            layer: [competitionMultiplier, layer1PacingMultiplier],
        });
        total = math.add(total, tierIncome);
    }

    return math.add(total, gym.money.flatIncrease);
}

function gymInfluencePerSecond() {
    return applyModifierPipeline(0, {
        additive: [math.mul(gym.advertising.campaigns, math.mul(gym.advertising.influenceGrowth, getLeadershipShopInfluenceMultiplier()))],
        global: [getRepeatingGlobalGymEconomyMultiplier()],
        layer: [getLayer1PacingMultiplier()],
    });
}
function gymCampaignsPerSecond() {
    let increase = math.evaluate(gym.advertising.employees.coordinators.current * gym.runCampaigns.barIncrease);
    return math.evaluate(gymCampaignFormula() / ((gym.runCampaigns.max / increase) / (gym.runCampaigns.speed / 1000)) * gym.runCampaigns.speedModifier);
}
function gymCampaignGrowthPerSecond() {
    return applyModifierPipeline(0, {
        additive: [math.mul(gym.advertising.ads, math.mul(gym.advertising.adMulti, getLeadershipShopCampaignGrowthMultiplier()))],
    });
}
function gymAdsPerSecond() {
    let increase = math.evaluate(gym.advertising.employees.designers.current * gym.designAds.barIncrease);
    return math.evaluate(gymAdFormula() / ((gym.designAds.max / increase) / (gym.designAds.speed / 1000)) * gym.designAds.speedModifier);
}
function gymCampaignFormula() {
    let total = applyModifierPipeline(gym.advertising.campaignGrowth, {
        multiplicative: [gym.advertising.employees.coordinators.current],
        global: [getManagerMultiplier(), getAllStatMultiplier()],
        layer: [getLayer1PacingMultiplier()],
    });
    return applySoftcap(total, 1e200, 0.5);
}
function gymAdFormula() {
    return applyModifierPipeline(gym.advertising.adGrowth, {
        multiplicative: [gym.advertising.employees.designers.current],
        global: [getManagerMultiplier(), getAllStatMultiplier()],
        layer: [getLayer1PacingMultiplier()],
    });
}
function gymMembersPerSecond() {
    if (gym.members.current >= gym.members.capacity) {
        return 0;
    }
    else {
        let salesComponent = math.mul(
            math.mul(gym.employees.sales.boost, gym.employees.sales.current),
            getNutritionistMultiplier()
        );
        let total = applyModifierPipeline(gym.members.growth, {
            additive: [salesComponent],
            global: [getAllStatMultiplier(), getConfidenceMultiplier(), getConfidenceShopMemberGrowthMultiplier()],
            layer: [getLayer1PacingMultiplier()],
        });
        if ((total + gym.members.current) > gym.members.capacity) {
            return math.evaluate(gym.members.capacity - gym.members.current);
        }
        else {
            return total;
        }
    }
}

function focusMemberTier(tier) {
    gym.members.focusId = tier;
    for (let i = 0; i < gym.members.tiers.length; i++) {
        if (i != 8) {
            if (i == tier) {
                $("#gymFocusTier" + i).html("<em>focused</em>");
            }
            else {
                $("#gymFocusTier" + i).html("<a class='text-info' href='#' onclick='focusMemberTier(" + i + ");'>focus</a>");
            }
        }
    }
}

function trainMembersFormula() {
    return applyModifierPipeline(gym.trainMembers.trainAmount, {
        multiplicative: [gym.employees.trainers.current, getNutritionistMultiplier(), getConfidenceShopTrainingMultiplier()],
        global: [getAllStatMultiplier(), getConfidenceMultiplier()],
    });
}

function gymMembersTrainedPerSecond() {
    let increase = math.evaluate(gym.employees.trainers.current * gym.trainMembers.barIncrease);
    return math.evaluate(trainMembersFormula() / ((gym.trainMembers.max / increase) / (gym.trainMembers.speed / 1000)) * gym.trainMembers.speedModifier);
}

function createClassesFormula() {
    return applyModifierPipeline(gym.createClasses.classAmount, {
        multiplicative: [gym.employees.coordinators.current, getNutritionistMultiplier(), getConfidenceShopTrainingMultiplier()],
        global: [getAllStatMultiplier(), getConfidenceMultiplier()],
    });
}

function gymClassesPerSecond() {
    let increase = math.evaluate(gym.employees.coordinators.current * gym.createClasses.barIncrease);
    return math.evaluate(createClassesFormula() / ((gym.createClasses.max / increase) / (gym.createClasses.speed / 1000)) * gym.createClasses.speedModifier);
}

function getEmployeeCost(employee) {
    return employee.cost;
}

function setupTrainerTimer() {
    trainerTimerId = setInterval(function () {
        let increase = math.evaluate(gym.employees.trainers.current * gym.trainMembers.barIncrease);
        if (gym.trainMembers.current < gym.trainMembers.max) {
            gym.trainMembers.current += increase;
        }
        else {
            gym.trainMembers.total += 1;
            // implement training
            let totalToTrain = trainMembersFormula();
            let totalToTrainOriginal = trainMembersFormula();
            for (let i = gym.members.focusId; i < gym.members.tiers.length; i++) {
                if (totalToTrain > 0) {
                    if (i != 8) {
                        if (gym.members.tiers[i].current >= totalToTrain) {
                            gym.members.tiers[i + 1].current += totalToTrain;
                            gym.members.tiers[i].current -= totalToTrain;
                            totalToTrain = 0;
                        }
                        else {
                            totalToTrain -= gym.members.tiers[i].current;
                            gym.members.tiers[i + 1].current += gym.members.tiers[i].current;
                            gym.members.tiers[i].current = 0;
                        }
                    }
                    else {
                        if (totalToTrain == totalToTrainOriginal) {
                            focusMemberTier(0);
                        }
                    }
                }
            }

            gym.trainMembers.current = 0;
        }
    }, getScaledTimerDelay(gym.trainMembers.speed / gym.trainMembers.speedModifier));
}

function setupClassesTimer() {
    createClassesTimerId = setInterval(function () {
        let increase = math.evaluate(gym.employees.coordinators.current * gym.createClasses.barIncrease);
        if (gym.createClasses.current < gym.createClasses.max) {
            gym.createClasses.current = math.add(gym.createClasses.current, increase);
        }
        else {
            gym.createClasses.total = math.add(gym.createClasses.total, 1);
            gym.classes = math.add(gym.classes, createClassesFormula());
            gym.classes = math.min(gym.classes, 1e200);
            gym.createClasses.current = 0;
        }
    }, getScaledTimerDelay(gym.createClasses.speed / gym.createClasses.speedModifier));
}

function setupCampaignTimer() {
    runCampaignTimerId = setInterval(function () {
        let increase = math.evaluate(gym.advertising.employees.coordinators.current * gym.runCampaigns.barIncrease);
        if (gym.runCampaigns.current < gym.runCampaigns.max) {
            gym.runCampaigns.current = math.add(gym.runCampaigns.current, increase);
        }
        else {
            gym.runCampaigns.total = math.add(gym.runCampaigns.total, 1);
            gym.advertising.campaigns = math.add(gym.advertising.campaigns, gymCampaignFormula());
            gym.advertising.campaigns = math.min(gym.advertising.campaigns, 1e200);
            stats.intelligence = math.add(
                stats.intelligence,
                math.mul(
                    gym.runCampaigns.intelligence,
                    math.mul(
                        math.add(math.mul(stats.intelligence, stats.intelligenceBoost), 1),
                        math.add(math.mul(prestige.lifting.leadership, prestige.lifting.leadershipBoost), 1)
                    )
                )
            );
            stats.intelligence = math.min(stats.intelligence, 1e200);
            gym.runCampaigns.current = 0;
        }
    }, getScaledTimerDelay(gym.runCampaigns.speed / gym.runCampaigns.speedModifier));
}

function setupAdTimer() {
    designAdTimerId = setInterval(function () {
        let increase = math.evaluate(gym.advertising.employees.designers.current * gym.designAds.barIncrease);
        if (gym.designAds.current < gym.designAds.max) {
            gym.designAds.current = math.add(gym.designAds.current, increase);
        }
        else {
            gym.designAds.total = math.add(gym.designAds.total, 1);
            gym.advertising.ads = math.add(gym.advertising.ads, gymAdFormula());
            gym.advertising.ads = math.min(gym.advertising.ads, 1e200);
            stats.intelligence = math.add(
                stats.intelligence,
                math.mul(
                    gym.designAds.intelligence,
                    math.mul(
                        math.add(math.mul(stats.intelligence, stats.intelligenceBoost), 1),
                        math.add(math.mul(prestige.lifting.leadership, prestige.lifting.leadershipBoost), 1)
                    )
                )
            );
            stats.intelligence = math.min(stats.intelligence, 1e200);
            gym.designAds.current = 0;
        }
    }, getScaledTimerDelay(gym.designAds.speed / gym.designAds.speedModifier));
}

function gymUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("gymUpgradeBtn")[1]);
        let upgrade = gym.gymUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    gym.members.capacity *= 2;
                    break;
                case 1:
                    gym.members.capacity *= 2;
                    break;
                case 2:
                    gym.members.capacity *= 2;
                    break;
                case 3:
                    gym.members.capacity *= 2;
                    break;
                case 4:
                    gym.members.capacity *= 2;
                    break;
                case 5:
                    gym.members.capacity *= 2;
                    break;
                case 6:
                    gym.employees.nutritionists.boost *= 2;
                    break;
                case 7:
                    gym.employees.sales.boost *= 2;
                    break;
                case 8:
                    gym.trainMembers.trainAmount *= 2;
                    break;
                case 9:
                    stats.allStatBoost *= 2;
                    break;
                case 10:
                    gym.designAds.intelligence *= 2;
                    gym.runCampaigns.intelligence *= 2;
                    break;
                case 11:
                    stats.allStatBoost *= 2;
                    break;
                case 12:
                    gym.designAds.intelligence *= 2;
                    gym.runCampaigns.intelligence *= 2;
                    break;
                case 13:
                    gym.employees.sales.boost *= 2;
                    break;
                case 14:
                    gym.employees.nutritionists.boost *= 2;
                    break;
                case 15:
                    gym.money.classMultiplier *= 2;
                    break;
                case 16:
                    gym.createClasses.classAmount *= 2;
                    break;
                case 17:
                    gym.employees.sales.cost /= 2;
                    break;
                case 18:
                    gym.employees.trainers.cost /= 2;
                    break;
                case 19:
                    gym.employees.coordinators.cost /= 2;
                    break;
                case 20:
                    gym.employees.nutritionists.cost /= 2;
                    break;
                case 21:
                    gym.money.growth *= 2;
                    break;
                case 22:
                    gym.members.capacity *= 2;
                    break;
                case 23:
                    gym.advertising.influenceGrowth *= 2;
                    break;
                case 24:
                    gym.designAds.intelligence *= 2;
                    gym.runCampaigns.intelligence *= 2;
                    break;
                default:
            }
        }
    }
}

function gymBwUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("gymBwUpgradeBtn")[1]);
        let upgrade = gym.bw.gymUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {

                default:
            }
        }
    }
}

function gymLiftingUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("gymLiftingUpgradeBtn")[1]);
        let upgrade = gym.lifting.gymUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {

                default:
            }
        }
    }
}

function gymYogaUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("gymYogaUpgradeBtn")[1]);
        let upgrade = gym.yoga.gymUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {

                default:
            }
        }
    }
}

function adUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("adUpgradeBtn")[1]);
        let upgrade = gym.adUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (gym.advertising.influence >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            gym.advertising.influence -= upgrade[0].cost;
            switch (upgrade[0].id) {
                case 0:
                    gym.money.growth *= 2;
                    break;
                case 1:
                    stats.energy.increase *= 2;
                    break;
                case 2:
                    gym.advertising.influenceGrowth *= 2;
                    break;
                case 3:
                    gym.money.growth *= 2;
                    break;
                case 4:
                    stats.strengthBoost *= 2;
                    break;
                case 5:
                    gym.advertising.influenceGrowth *= 2;
                    break;
                case 6:
                    stats.agilityBoost *= 2;
                    break;
                case 7:
                    stats.enduranceBoost *= 2;
                    break;
                case 8:
                    stats.intelligenceBoost *= 2;
                    break;
                case 9:
                    gym.members.capacity *= 2;
                    break;
                case 10:
                    gym.designAds.intelligence *= 2;
                    gym.runCampaigns.intelligence *= 2;
                    break;
                case 11:
                    gym.advertising.adMulti *= 2;
                    break;
                case 12:
                    gym.advertising.adGrowth *= 2;
                    break;
                case 13:
                    gym.advertising.employees.managers.boost *= 2;
                    break;
                case 14:
                    checks.isPrestige = true;
                    updatePrestigeValues();
                    checkPrestigeUpgradeDisable(prestige.upgrades, prestige.current, "globalUpgrade");
                    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
                    break;
                case 15:
                    gym.advertising.campaignGrowth *= 2;
                    break;
                case 16:
                    stats.allStatBoost *= 2;
                    break;
                case 17:
                    gym.trainMembers.trainAmount *= 2;
                    break;
                case 18:
                    gym.money.classMultiplier *= 2;
                    break;
                case 19:
                    stats.energy.increase *= 2;
                    break;
                case 20:
                    gym.advertising.employees.managers.boost *= 2;
                    break;
                default:
            }
        }
    }
}

function adBwUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("adBwUpgradeBtn")[1]);
        let upgrade = gym.bw.adUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (gym.advertising.influence >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            gym.advertising.influence -= upgrade[0].cost;
            switch (upgrade[0].id) {
                default:
            }
        }
    }
}

function adLiftingUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("adLiftingUpgradeBtn")[1]);
        let upgrade = gym.lifting.adUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (gym.advertising.influence >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            gym.advertising.influence -= upgrade[0].cost;
            switch (upgrade[0].id) {
                default:
            }
        }
    }
}

function phase2UpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("upgradeBtn")[1]);
        let upgrade = gym.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    stats.energy.coffee.boost *= 2;
                    break;
                case 1:
                    stats.energy.increase *= 2;
                    break;
                case 2:
                    stats.strengthBoost *= 2;
                    break;
                case 3:
                    stats.enduranceBoost *= 2;
                    break;
                case 4:
                    stats.agilityBoost *= 2;
                    break;
                case 5:
                    stats.intelligenceBoost *= 2;
                    break;
                case 6:
                    stats.energy.increase *= 2;
                    break;
                case 7:
                    stats.strengthBoost *= 2;
                    break;
                case 8:
                    stats.agilityBoost *= 2;
                    break;
                case 9:
                    stats.enduranceBoost *= 2;
                    break;
                case 10:
                    stats.intelligenceBoost *= 2;
                    break;
                case 11:
                    stats.allStatBoost *= 2;
                    break;
                case 12:
                    stats.energy.coffee.timer *= 2;
                    break;
                default:
            }
        }
    }
}

function phase2BwUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("bwUpgradeBtn")[1]);
        let upgrade = gym.bw.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    bodyweight.pushups.speedModifier *= 2;
                    startStop(bodyweight.pushups, pushupTimerId, true);
                    break;
                case 1:
                    bodyweight.pushups.energy /= 2;
                    bodyweight.rows.energy /= 2;
                    break;
                case 2:
                    bodyweight.rows.speedModifier *= 2;
                    startStop(bodyweight.rows, rowTimerId, true);
                    break;
                case 3:
                    bodyweight.pullups.speedModifier *= 2;
                    startStop(bodyweight.pullups, pullupTimerId, true);
                    break;
                case 4:
                    bodyweight.dips.speedModifier *= 2;
                    startStop(bodyweight.dips, dipTimerId, true);
                    break;
                case 5:
                    bodyweight.pullups.energy /= 2;
                    break;
                case 6:
                    bodyweight.dips.energy /= 2;
                    break;
                case 7:
                    bodyweight.squats.speedModifier *= 2;
                    startStop(bodyweight.squats, bwSquatTimerId, true);
                    break;
                case 8:
                    bodyweight.rdl.speedModifier *= 2;
                    startStop(bodyweight.rdl, bwRdlTimerId, true);
                    break;
                case 9:
                    bodyweight.rdl.energy /= 2;
                    bodyweight.squats.energy /= 2;
                    break;
                case 10:
                    bodyweight.pushups.energy *= 2;
                    bodyweight.pushups.strength *= 2;
                    bodyweight.pushups.endurance *= 2;
                    bodyweight.pushups.agility *= 2;
                    bodyweight.rows.energy *= 2;
                    bodyweight.rows.strength *= 2;
                    bodyweight.rows.endurance *= 2;
                    bodyweight.rows.agility *= 2;
                    break;
                case 11:
                    bodyweight.dips.energy *= 2;
                    bodyweight.dips.strength *= 2;
                    bodyweight.dips.endurance *= 2;
                    bodyweight.dips.agility *= 2;
                    bodyweight.pullups.energy *= 2;
                    bodyweight.pullups.strength *= 2;
                    bodyweight.pullups.endurance *= 2;
                    bodyweight.pullups.agility *= 2;
                    break;
                case 12:
                    bodyweight.squats.energy *= 2;
                    bodyweight.squats.strength *= 2;
                    bodyweight.squats.endurance *= 2;
                    bodyweight.squats.agility *= 2;
                    bodyweight.rdl.energy *= 2;
                    bodyweight.rdl.strength *= 2;
                    bodyweight.rdl.endurance *= 2;
                    bodyweight.rdl.agility *= 2;
                    break;
                default:
            }
        }
    }
}

function phase2LiftingUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("liftingUpgradeBtn")[1]);
        let upgrade = gym.lifting.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    lifting.bench.speedModifier *= 2;
                    startStop(lifting.bench, liftingBenchTimerId, true);
                    break;
                case 1:
                    lifting.bench.energy /= 2;
                    lifting.rows.energy /= 2;
                    break;
                case 2:
                    lifting.rows.speedModifier *= 2;
                    startStop(lifting.rows, liftingRowTimerId, true);
                    break;
                case 3:
                    lifting.ohp.speedModifier *= 2;
                    startStop(lifting.ohp, liftingOhpTimerId, true);
                    break;
                case 4:
                    lifting.curls.speedModifier *= 2;
                    startStop(lifting.curls, liftingCurlsTimerId, true);
                    break;
                case 5:
                    lifting.ohp.energy /= 2;
                    break;
                case 6:
                    lifting.curls.energy /= 2;
                    break;
                case 7:
                    lifting.squats.speedModifier *= 2;
                    startStop(lifting.squats, liftingSquatsTimerId, true);
                    break;
                case 8:
                    lifting.dls.speedModifier *= 2;
                    startStop(lifting.dls, liftingDlsTimerId, true);
                    break;
                case 9:
                    lifting.squats.energy /= 2;
                    lifting.dls.energy /= 2;
                    break;
                case 10:
                    lifting.bench.energy *= 2;
                    lifting.bench.strength *= 2;
                    lifting.bench.endurance *= 2;
                    lifting.bench.agility *= 2;
                    lifting.rows.energy *= 2;
                    lifting.rows.strength *= 2;
                    lifting.rows.endurance *= 2;
                    lifting.rows.agility *= 2;
                    break;
                case 11:
                    lifting.ohp.energy *= 2;
                    lifting.ohp.strength *= 2;
                    lifting.ohp.endurance *= 2;
                    lifting.ohp.agility *= 2;
                    lifting.curls.energy *= 2;
                    lifting.curls.strength *= 2;
                    lifting.curls.endurance *= 2;
                    lifting.curls.agility *= 2;
                    break;
                case 12:
                    lifting.squats.energy *= 2;
                    lifting.squats.strength *= 2;
                    lifting.squats.endurance *= 2;
                    lifting.squats.agility *= 2;
                    lifting.dls.energy *= 2;
                    lifting.dls.strength *= 2;
                    lifting.dls.endurance *= 2;
                    lifting.dls.agility *= 2;
                    break;
                default:
            }
        }
    }
}

function phase2YogaUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("yogaUpgradeBtn")[1]);
        let upgrade = gym.yoga.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    yoga.sun.speedModifier *= 2;
                    startStop(yoga.sun, yogaSunTimerId, true);
                    break;
                case 1:
                    yoga.sun.energy /= 2;
                    yoga.vinyasa.energy /= 2;
                    break;
                case 2:
                    yoga.vinyasa.speedModifier *= 2;
                    startStop(yoga.vinyasa, yogaVinyasaTimerId, true);
                    break;
                case 3:
                    yoga.balance.speedModifier *= 2;
                    startStop(yoga.balance, yogaBalanceTimerId, true);
                    break;
                case 4:
                    yoga.mobility.speedModifier *= 2;
                    startStop(yoga.mobility, yogaMobilityTimerId, true);
                    break;
                case 5:
                    yoga.balance.energy /= 2;
                    break;
                case 6:
                    yoga.mobility.energy /= 2;
                    break;
                case 7:
                    yoga.core.speedModifier *= 2;
                    startStop(yoga.core, yogaCoreTimerId, true);
                    break;
                case 8:
                    yoga.breath.speedModifier *= 2;
                    startStop(yoga.breath, yogaBreathTimerId, true);
                    break;
                case 9:
                    yoga.core.energy /= 2;
                    yoga.breath.energy /= 2;
                    break;
                case 10:
                    yoga.sun.energy = math.mul(yoga.sun.energy, YOGA_PRECISION_FORM_ENERGY_MULTIPLIER);
                    yoga.sun.strength *= 2;
                    yoga.sun.endurance *= 2;
                    yoga.sun.agility *= 2;
                    yoga.vinyasa.energy = math.mul(yoga.vinyasa.energy, YOGA_PRECISION_FORM_ENERGY_MULTIPLIER);
                    yoga.vinyasa.strength *= 2;
                    yoga.vinyasa.endurance *= 2;
                    yoga.vinyasa.agility *= 2;
                    break;
                case 11:
                    yoga.balance.energy = math.mul(yoga.balance.energy, YOGA_PRECISION_FORM_ENERGY_MULTIPLIER);
                    yoga.balance.strength *= 2;
                    yoga.balance.endurance *= 2;
                    yoga.balance.agility *= 2;
                    yoga.mobility.energy = math.mul(yoga.mobility.energy, YOGA_PRECISION_FORM_ENERGY_MULTIPLIER);
                    yoga.mobility.strength *= 2;
                    yoga.mobility.endurance *= 2;
                    yoga.mobility.agility *= 2;
                    break;
                case 12:
                    yoga.core.energy = math.mul(yoga.core.energy, YOGA_PRECISION_FORM_ENERGY_MULTIPLIER);
                    yoga.core.strength *= 2;
                    yoga.core.endurance *= 2;
                    yoga.core.agility *= 2;
                    yoga.breath.energy = math.mul(yoga.breath.energy, YOGA_PRECISION_FORM_ENERGY_MULTIPLIER);
                    yoga.breath.strength *= 2;
                    yoga.breath.endurance *= 2;
                    yoga.breath.agility *= 2;
                    break;
                default:
            }
        }
    }
}

function phase2CardioUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("cardioUpgradeBtn")[1]);
        let upgrade = gym.cardio.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    cardio.treadmill.speedModifier *= 2;
                    startStop(cardio.treadmill, cardioTreadmillTimerId, true);
                    break;
                case 1:
                    cardio.treadmill.energy /= 2;
                    cardio.bike.energy /= 2;
                    break;
                case 2:
                    cardio.bike.speedModifier *= 2;
                    startStop(cardio.bike, cardioBikeTimerId, true);
                    break;
                case 3:
                    cardio.row.speedModifier *= 2;
                    startStop(cardio.row, cardioRowTimerId, true);
                    break;
                case 4:
                    cardio.sprints.speedModifier *= 2;
                    startStop(cardio.sprints, cardioSprintsTimerId, true);
                    break;
                case 5:
                    cardio.row.energy /= 2;
                    break;
                case 6:
                    cardio.sprints.energy /= 2;
                    break;
                case 7:
                    cardio.hills.speedModifier *= 2;
                    startStop(cardio.hills, cardioHillsTimerId, true);
                    break;
                case 8:
                    cardio.recovery.speedModifier *= 2;
                    startStop(cardio.recovery, cardioRecoveryTimerId, true);
                    break;
                case 9:
                    cardio.hills.energy /= 2;
                    cardio.recovery.energy /= 2;
                    break;
                case 10:
                    cardio.treadmill.energy *= 1.5;
                    cardio.treadmill.strength *= 2;
                    cardio.treadmill.endurance *= 2;
                    cardio.treadmill.agility *= 2;
                    cardio.bike.energy *= 1.5;
                    cardio.bike.strength *= 2;
                    cardio.bike.endurance *= 2;
                    cardio.bike.agility *= 2;
                    break;
                case 11:
                    cardio.row.energy *= 1.5;
                    cardio.row.strength *= 2;
                    cardio.row.endurance *= 2;
                    cardio.row.agility *= 2;
                    cardio.sprints.energy *= 1.5;
                    cardio.sprints.strength *= 2;
                    cardio.sprints.endurance *= 2;
                    cardio.sprints.agility *= 2;
                    break;
                case 12:
                    cardio.hills.energy *= 1.5;
                    cardio.hills.strength *= 2;
                    cardio.hills.endurance *= 2;
                    cardio.hills.agility *= 2;
                    cardio.recovery.energy *= 1.5;
                    cardio.recovery.strength *= 2;
                    cardio.recovery.endurance *= 2;
                    cardio.recovery.agility *= 2;
                    break;
                default:
            }
        }
    }
}

function globalUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("globalUpgradeBtn")[1]);
        let upgrade = prestige.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.current = normalizePrestigePoints(math.sub(prestige.current, upgrade[0].cost));
        }
        switch (upgrade[0].id) {
            case 0:
                gym.employees.sales.current += 1;
                gym.employees.trainers.current += 1;
                gym.employees.nutritionists.current += 1;
                gym.employees.coordinators.current += 1;
                stats.money = math.add(stats.money, 10);
                break;
            case 1:
                gym.money.flatIncrease += .10;
                break;
            case 2:
                stats.energy.increase *= 2;
                stats.energy.originalMax *= 2;
                stats.energy.current = stats.energy.originalMax;
                break;
            case 3:
                gym.advertising.employees.coordinators.current += 1;
                gym.advertising.employees.managers.current += 1;
                gym.advertising.employees.designers.current += 1;
                stats.money = math.add(stats.money, 10);
                break;
            case 4:
                gym.members.capacity *= 2;
                break;
            case 5:
                gym.trainMembers.trainAmount *= 2;
                break;
            case 6:
                stats.strength = math.add(stats.strength, 10);
                stats.endurance = math.add(stats.endurance, 10);
                stats.agility = math.add(stats.agility, 10);
                stats.intelligence = math.add(stats.intelligence, 10);
                break;
            case 7:
                if (!checks.gymSalesBuyer) {
                    checks.gymSalesBuyerOn = true;
                }
                checks.gymSalesBuyer = true;
                updateAutobuyerToggles();
                break;
            case 8:
                if (!checks.gymTrainerBuyer) {
                    checks.gymTrainerBuyerOn = true;
                }
                checks.gymTrainerBuyer = true;
                updateAutobuyerToggles();
                break;
            case 9:
                if (!checks.adCoordinatorBuyer) {
                    checks.adCoordinatorBuyerOn = true;
                }
                checks.adCoordinatorBuyer = true;
                updateAutobuyerToggles();
                break;
            case 10:
                if (!checks.gymCoordinatorBuyer) {
                    checks.gymCoordinatorBuyerOn = true;
                }
                checks.gymCoordinatorBuyer = true;
                updateAutobuyerToggles();
                break;
            case 11:
                if (!checks.adDesignerBuyer) {
                    checks.adDesignerBuyerOn = true;
                }
                checks.adDesignerBuyer = true;
                updateAutobuyerToggles();
                break;
            case 12:
                if (!checks.gymNutritionistBuyer) {
                    checks.gymNutritionistBuyerOn = true;
                }
                checks.gymNutritionistBuyer = true;
                updateAutobuyerToggles();
                break;
            case 13:
                if (!checks.adManagerBuyer) {
                    checks.adManagerBuyerOn = true;
                }
                checks.adManagerBuyer = true;
                updateAutobuyerToggles();
                break;
            case 14:
                stats.strengthBoost *= 2;
                break;
            case 15:
                stats.enduranceBoost *= 2;
                break;
            case 16:
                stats.agilityBoost *= 2;
                break;
            case 17:
                stats.intelligenceBoost *= 2;
                break;
            case 18:
                stats.allStatBoost *= 2;
                break;
            case 19:
                gym.money.flatIncrease += .10;
                break;
            case 20:
                gym.employees.sales.current += 1;
                gym.employees.trainers.current += 1;
                gym.employees.nutritionists.current += 1;
                gym.employees.coordinators.current += 1;
                stats.money = math.add(stats.money, 50);
                break;
            case 21:
                gym.advertising.employees.coordinators.current += 1;
                gym.advertising.employees.managers.current += 1;
                gym.advertising.employees.designers.current += 1;
                stats.money = math.add(stats.money, 50);
                break;
            case 22:
                stats.strength = math.add(stats.strength, 100);
                stats.endurance = math.add(stats.endurance, 100);
                stats.agility = math.add(stats.agility, 100);
                stats.intelligence = math.add(stats.intelligence, 100);
                break;
            case 23:
                gym.designAds.intelligence *= 2;
                gym.runCampaigns.intelligence *= 2;
                break;
            case 24:
                if (!checks.coffeeClicker) {
                    checks.coffeeClickerOn = true;
                }
                checks.coffeeClicker = true;
                updateAutobuyerToggles();
                break;
            case 25:
                $(".gymTierFocus").removeClass("d-none");
                focusMemberTier(0);
                break;
            case 26:
                $("#globalLiftingUpgradesModalTrigger").removeClass("d-none");
                $("#newGymLifting").removeClass("d-none");
                break;
            case 27:
                gym.advertising.adGrowth *= 2;
                break;
            case 28:
                gym.advertising.influenceGrowth *= 2;
                break;
            case 29:
                gym.members.growth *= 2;
                break;
            case 30:
                gym.money.growth *= 2;
                break;
            case 31:
                gym.employees.nutritionists.boost *= 2;
                break;
            case 32:
                gym.advertising.employees.managers.boost *= 2;
                break;
            case 33:
                $("#globalYogaUpgradesModalTrigger").removeClass("d-none");
                $("#newGymYoga").removeClass("d-none");
                break;
            case 34:
                gym.advertising.adMulti *= 2;
                break;
            case 35:
                gym.money.classMultiplier *= 2;
                break;
            case 36:
                gym.trainMembers.trainAmount *= 2;
                break;
            case 37:
                gym.createClasses.classAmount *= 2;
                break;
            case 38:
                gym.advertising.campaignGrowth *= 2;
                break;
            case 39:
                stats.energy.increase *= 1.5;
                break;
            case 40:
                gym.employees.sales.boost *= 1.5;
                break;
            case 41:
                gym.createClasses.barIncrease *= 1.5;
                gym.runCampaigns.barIncrease *= 1.5;
                break;
            case 42:
                gym.trainMembers.barIncrease *= 1.5;
                gym.designAds.barIncrease *= 1.5;
                break;
            case 43:
                $("#globalCardioUpgradesModalTrigger").removeClass("d-none");
                $("#newGymCardio").removeClass("d-none");
                break;
            case 44:
                gym.members.growth *= 1.5;
                gym.employees.sales.boost *= 1.5;
                break;
            case 45:
                gym.money.classMultiplier *= 1.5;
                gym.createClasses.classAmount *= 1.5;
                break;
            case 46:
                gym.advertising.campaignGrowth *= 1.5;
                gym.advertising.adMulti *= 1.5;
                break;
            default:
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.upgrades, prestige.current, "globalUpgrade");
        updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
    }
}

function adYogaUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("adYogaUpgradeBtn")[1]);
        let upgrade = gym.yoga.adUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (gym.advertising.influence >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            gym.advertising.influence -= upgrade[0].cost;
            switch (upgrade[0].id) {
                default:
            }
        }
    }
}

function adCardioUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("adCardioUpgradeBtn")[1]);
        let upgrade = gym.cardio.adUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (gym.advertising.influence >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            gym.advertising.influence -= upgrade[0].cost;
        }
    }
}

function globalBwUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("globalBwUpgradeBtn")[1]);
        let upgrade = prestige.bw.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.bw.current = normalizePrestigePoints(math.sub(prestige.bw.current, upgrade[0].cost));
        }
        switch (upgrade[0].id) {
            case 0:
                $("#gang-tab").removeClass("d-none");
                $("#gangName").html(bodyweight.gang.name);
                bodyweight.gang.on = 1;
                break;
            case 1:
                prestige.bw.confidenceBoost = 0;
                prestige.bw.confidenceBoost += .02;
                break;
            case 2:
                bodyweight.pushups.energy /= 2;
                break;
            case 3:
                bodyweight.rows.energy /= 2;
                break;
            case 4:
                bodyweight.dips.energy /= 2;
                break;
            case 5:
                bodyweight.pullups.energy /= 2;
                break;
            case 6:
                bodyweight.pushups.strength *= 2;
                bodyweight.pushups.endurance *= 2;
                bodyweight.pushups.agility *= 2;
                break;
            case 7:
                bodyweight.rows.strength *= 2;
                bodyweight.rows.endurance *= 2;
                bodyweight.rows.agility *= 2;
                break;
            case 8:
                bodyweight.squats.energy /= 2;
                break;
            case 9:
                bodyweight.rdl.energy /= 2;
                break;
            case 10:
                bodyweight.dips.strength *= 2;
                bodyweight.dips.endurance *= 2;
                bodyweight.dips.agility *= 2;
                break;
            case 11:
                bodyweight.pullups.strength *= 2;
                bodyweight.pullups.endurance *= 2;
                bodyweight.pullups.agility *= 2;
                break;
            case 12:
                bodyweight.squats.strength *= 2;
                bodyweight.squats.endurance *= 2;
                bodyweight.squats.agility *= 2;
                break;
            case 13:
                bodyweight.rdl.strength *= 2;
                bodyweight.rdl.endurance *= 2;
                bodyweight.rdl.agility *= 2;
                break;
            case 14:
                if (!checks.bwUpgradeBuyer) {
                    checks.bwUpgradeBuyerOn = true;
                }
                checks.bwUpgradeBuyer = true;
                updateAutobuyerToggles();
                break;
            case 15:
                if (!checks.bwGymBuyer) {
                    checks.bwGymBuyerOn = true;
                }
                checks.bwGymBuyer = true;
                updateAutobuyerToggles();
                break;
            case 16:
                if (!checks.bwAdBuyer) {
                    checks.bwAdBuyerOn = true;
                }
                checks.bwAdBuyer = true;
                updateAutobuyerToggles();
                break;
            case 17:
                bodyweight.gang.memberAmount *= 2;
                break;
            case 18:
                bodyweight.gang.strengthAmount *= 2;
                break;
            case 19:
                if (!checks.absorbGangs) {
                    checks.absorbGangsOn = true;
                }
                checks.absorbGangs = true;
                updateAutobuyerToggles();
                break;
            case 20:
                // Passive layer modifier bonus is computed dynamically.
                break;
            case 21:
                // Passive confidence generation is computed per second.
                break;
            default:
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.bw.upgrades, prestige.bw.current, "globalBwUpgrade");
        updateRepeatingUpgradeButtons("globalBwUpgrades", "bodyweight", prestige.bw.current);
    }
}

function globalLiftingUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("globalLiftingUpgradeBtn")[1]);
        let upgrade = prestige.lifting.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.lifting.current = normalizePrestigePoints(math.sub(prestige.lifting.current, upgrade[0].cost));
        }
        switch (upgrade[0].id) {
            case 0:
                $("#comp-tab").removeClass("d-none");
                ensureLiftingAcademyState();
                if (!lifting.comps.academy.unlockGrantApplied) {
                    lifting.comps.academy.credits = math.add(lifting.comps.academy.credits, 25);
                    lifting.comps.academy.totalCreditsEarned = math.add(lifting.comps.academy.totalCreditsEarned, 25);
                    lifting.comps.academy.unlockGrantApplied = true;
                }
                break;
            case 1:
                prestige.lifting.leadershipBoost = 0;
                prestige.lifting.leadershipBoost += .02;
                break;
            case 2:
                lifting.bench.energy /= 2;
                break;
            case 3:
                lifting.rows.energy /= 2;
                break;
            case 4:
                lifting.ohp.energy /= 2;
                break;
            case 5:
                lifting.curls.energy /= 2;
                break;
            case 6:
                lifting.bench.strength *= 2;
                lifting.bench.endurance *= 2;
                lifting.bench.agility *= 2;
                break;
            case 7:
                lifting.rows.strength *= 2;
                lifting.rows.endurance *= 2;
                lifting.rows.agility *= 2;
                break;
            case 8:
                lifting.squats.energy /= 2;
                break;
            case 9:
                lifting.dls.energy /= 2;
                break;
            case 10:
                lifting.ohp.strength *= 2;
                lifting.ohp.endurance *= 2;
                lifting.ohp.agility *= 2;
                break;
            case 11:
                lifting.curls.strength *= 2;
                lifting.curls.endurance *= 2;
                lifting.curls.agility *= 2;
                break;
            case 12:
                lifting.squats.strength *= 2;
                lifting.squats.endurance *= 2;
                lifting.squats.agility *= 2;
                break;
            case 13:
                lifting.dls.strength *= 2;
                lifting.dls.endurance *= 2;
                lifting.dls.agility *= 2;
                break;
            case 14:
                if (!checks.liftingUpgradeBuyer) {
                    checks.liftingUpgradeBuyerOn = true;
                }
                checks.liftingUpgradeBuyer = true;
                updateAutobuyerToggles();
                break;
            case 15:
                if (!checks.liftingGymBuyer) {
                    checks.liftingGymBuyerOn = true;
                }
                checks.liftingGymBuyer = true;
                updateAutobuyerToggles();
                break;
            case 16:
                if (!checks.liftingAdBuyer) {
                    checks.liftingAdBuyerOn = true;
                }
                checks.liftingAdBuyer = true;
                updateAutobuyerToggles();
                break;
            case 17:
                ensureLiftingAcademyState();
                lifting.comps.academy.progressBoost *= 2.1;
                break;
            case 18:
                if (!checks.conferenceBuyer) {
                    checks.conferenceBuyerOn = true;
                }
                checks.conferenceBuyer = true;
                ensureLiftingAcademyState();
                lifting.comps.academy.credits = math.add(lifting.comps.academy.credits, 10);
                updateAutobuyerToggles();
                break;
            case 19:
                // Passive layer modifier bonus is computed dynamically.
                break;
            case 20:
                // Passive leadership generation is computed per second.
                break;
            default:
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.lifting.upgrades, prestige.lifting.current, "globalLiftingUpgrade");
        updateRepeatingUpgradeButtons("globalLiftingUpgrades", "lifting", prestige.lifting.current);
    }
}

function globalYogaUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("globalYogaUpgradeBtn")[1]);
        let upgrade = prestige.yoga.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (upgrade[0] == null) {
            return;
        }
        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.yoga.current = normalizePrestigePoints(math.sub(prestige.yoga.current, upgrade[0].cost));
        }
        switch (upgrade[0].id) {
            case 0:
                $("#comp-tab").removeClass("d-none");
                break;
            case 1:
                prestige.yoga.flowBoost = 0;
                prestige.yoga.flowBoost += .0015;
                break;
            case 2:
                yoga.sun.energy /= 2;
                break;
            case 3:
                yoga.vinyasa.energy /= 2;
                break;
            case 4:
                yoga.balance.energy /= 2;
                break;
            case 5:
                yoga.mobility.energy /= 2;
                break;
            case 6:
                yoga.sun.strength *= 2;
                yoga.sun.endurance *= 2;
                yoga.sun.agility *= 2;
                break;
            case 7:
                yoga.vinyasa.strength *= 2;
                yoga.vinyasa.endurance *= 2;
                yoga.vinyasa.agility *= 2;
                break;
            case 8:
                yoga.core.energy /= 2;
                break;
            case 9:
                yoga.breath.energy /= 2;
                break;
            case 10:
                yoga.balance.strength *= 2;
                yoga.balance.endurance *= 2;
                yoga.balance.agility *= 2;
                break;
            case 11:
                yoga.mobility.strength *= 2;
                yoga.mobility.endurance *= 2;
                yoga.mobility.agility *= 2;
                break;
            case 12:
                yoga.core.strength *= 2;
                yoga.core.endurance *= 2;
                yoga.core.agility *= 2;
                break;
            case 13:
                yoga.breath.strength *= 2;
                yoga.breath.endurance *= 2;
                yoga.breath.agility *= 2;
                break;
            case 14:
                if (!checks.yogaUpgradeBuyer) {
                    checks.yogaUpgradeBuyerOn = true;
                }
                checks.yogaUpgradeBuyer = true;
                updateAutobuyerToggles();
                break;
            case 15:
                if (!checks.yogaGymBuyer) {
                    checks.yogaGymBuyerOn = true;
                }
                checks.yogaGymBuyer = true;
                updateAutobuyerToggles();
                break;
            case 16:
                if (!checks.yogaAdBuyer) {
                    checks.yogaAdBuyerOn = true;
                }
                checks.yogaAdBuyer = true;
                updateAutobuyerToggles();
                break;
            case 17:
                // Yoga stability progression bonus is computed dynamically.
                break;
            case 18:
                if (!checks.breathBuyer) {
                    checks.breathBuyerOn = true;
                }
                checks.breathBuyer = true;
                updateAutobuyerToggles();
                break;
            case 19:
                // Recovery Protocol effect is computed dynamically.
                break;
            case 20:
                // Passive Flow generation is computed per second.
                break;
            default:
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.yoga.upgrades, prestige.yoga.current, "globalYogaUpgrade");
        updateRepeatingUpgradeButtons("globalYogaUpgrades", "yoga", prestige.yoga.current);
    }
}

function globalCardioUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("globalCardioUpgradeBtn")[1]);
        let upgrade = prestige.cardio.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (upgrade[0] == null) {
            return;
        }
        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.cardio.current = normalizePrestigePoints(math.sub(prestige.cardio.current, upgrade[0].cost));
        }
        switch (upgrade[0].id) {
            case 0:
                $("#comp-tab").removeClass("d-none");
                break;
            case 1:
                prestige.cardio.paceBoost = 0;
                prestige.cardio.paceBoost += .0015;
                break;
            case 2:
                cardio.treadmill.energy /= 2;
                break;
            case 3:
                cardio.bike.energy /= 2;
                break;
            case 4:
                cardio.row.energy /= 2;
                break;
            case 5:
                cardio.sprints.energy /= 2;
                break;
            case 6:
                cardio.treadmill.strength *= 2;
                cardio.treadmill.endurance *= 2;
                cardio.treadmill.agility *= 2;
                break;
            case 7:
                cardio.bike.strength *= 2;
                cardio.bike.endurance *= 2;
                cardio.bike.agility *= 2;
                break;
            case 8:
                cardio.hills.energy /= 2;
                break;
            case 9:
                cardio.recovery.energy /= 2;
                break;
            case 10:
                cardio.row.strength *= 2;
                cardio.row.endurance *= 2;
                cardio.row.agility *= 2;
                break;
            case 11:
                cardio.sprints.strength *= 2;
                cardio.sprints.endurance *= 2;
                cardio.sprints.agility *= 2;
                break;
            case 12:
                cardio.hills.strength *= 2;
                cardio.hills.endurance *= 2;
                cardio.hills.agility *= 2;
                break;
            case 13:
                cardio.recovery.strength *= 2;
                cardio.recovery.endurance *= 2;
                cardio.recovery.agility *= 2;
                break;
            case 14:
                if (!checks.cardioUpgradeBuyer) {
                    checks.cardioUpgradeBuyerOn = true;
                }
                checks.cardioUpgradeBuyer = true;
                updateAutobuyerToggles();
                break;
            case 15:
                if (!checks.cardioGymBuyer) {
                    checks.cardioGymBuyerOn = true;
                }
                checks.cardioGymBuyer = true;
                updateAutobuyerToggles();
                break;
            case 16:
                if (!checks.cardioAdBuyer) {
                    checks.cardioAdBuyerOn = true;
                }
                checks.cardioAdBuyer = true;
                updateAutobuyerToggles();
                break;
            case 17:
                break;
            case 18:
                if (!checks.paceBuyer) {
                    checks.paceBuyerOn = true;
                }
                checks.paceBuyer = true;
                updateAutobuyerToggles();
                break;
            case 19:
                break;
            case 20:
                break;
            default:
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.cardio.upgrades, prestige.cardio.current, "globalCardioUpgrade");
        updateRepeatingUpgradeButtons("globalCardioUpgrades", "cardio", prestige.cardio.current);
    }
}

function flowUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        if (typeof buttonId !== "string") {
            return;
        }
        let id = parseInt(buttonId.split("flowUpgradeBtn")[1]);
        let upgrade = prestige.yoga.flowUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (upgrade[0] == null) {
            return;
        }

        if (!prestigeCheck && !canAffordPrestigeCost(prestige.yoga.flow, upgrade[0].cost)) {
            return;
        }

        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.yoga.flow = normalizePrestigePoints(math.sub(prestige.yoga.flow, upgrade[0].cost));
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.yoga.flowUpgrades, prestige.yoga.flow, "flowUpgrade");
        updateRepeatingUpgradeButtons("flowShopUpgrades", "flow", prestige.yoga.flow);
    }
}

function paceUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        if (typeof buttonId !== "string") {
            return;
        }
        let id = parseInt(buttonId.split("paceUpgradeBtn")[1]);
        let upgrade = prestige.cardio.paceUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (upgrade[0] == null) {
            return;
        }

        if (!prestigeCheck && !canAffordPrestigeCost(prestige.cardio.pace, upgrade[0].cost)) {
            return;
        }

        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.cardio.pace = normalizePrestigePoints(math.sub(prestige.cardio.pace, upgrade[0].cost));
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.cardio.paceUpgrades, prestige.cardio.pace, "paceUpgrade");
        updateRepeatingUpgradeButtons("paceShopUpgrades", "pace", prestige.cardio.pace);
    }
}

function confidenceUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        if (typeof buttonId !== "string") {
            return;
        }
        let id = parseInt(buttonId.split("confidenceUpgradeBtn")[1]);
        let upgrade = prestige.bw.confidenceUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (upgrade[0] == null) {
            return;
        }

        if (!prestigeCheck && !canAffordPrestigeCost(prestige.bw.confidence, upgrade[0].cost)) {
            return;
        }

        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.bw.confidence = normalizePrestigePoints(math.sub(prestige.bw.confidence, upgrade[0].cost));
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.bw.confidenceUpgrades, prestige.bw.confidence, "confidenceUpgrade");
        updateRepeatingUpgradeButtons("confidenceShopUpgrades", "confidence", prestige.bw.confidence);
    }
}

function leadershipUpgradeClick(button, prestigeCheck) {
    if (!$(button).hasClass("disabled") || prestigeCheck) {
        let buttonId = $(button).attr("id");
        if (typeof buttonId !== "string") {
            return;
        }
        let id = parseInt(buttonId.split("leadershipUpgradeBtn")[1]);
        let upgrade = prestige.lifting.leadershipUpgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (upgrade[0] == null) {
            return;
        }

        if (!prestigeCheck && !canAffordPrestigeCost(prestige.lifting.leadership, upgrade[0].cost)) {
            return;
        }

        upgrade[0].isPurchased = true;
        if (!prestigeCheck) {
            prestige.lifting.leadership = normalizePrestigePoints(math.sub(prestige.lifting.leadership, upgrade[0].cost));
        }
        if (id === 1) {
            let academy = ensureLiftingAcademyState();
            academy.autoCampConfigured = false;
        }

        updatePrestigeValues();
        checkPrestigeUpgradeDisable(prestige.lifting.leadershipUpgrades, prestige.lifting.leadership, "leadershipUpgrade");
        updateRepeatingUpgradeButtons("leadershipShopUpgrades", "leadership", prestige.lifting.leadership);
    }
}

//#endregion

//#region phase 1

function setupMakeVideoTimer() {
    makeVideoTimerId = setInterval(function () {
        if (job.makeVideo.current < job.makeVideo.max) {
            job.makeVideo.current = math.add(job.makeVideo.current, job.makeVideo.increase);
        }
        else {
            job.makeVideo.total = math.add(job.makeVideo.total, 1);
            let followerGain = followerFormula();
            job.followers = math.add(job.followers, followerGain);
            addRunGain("followersEarned", followerGain);
            job.views = math.add(job.views, math.add(math.mul(job.viewGrowth, job.followers), 1));
            job.makeVideo.current = 0;
        }
    }, getScaledTimerDelay(job.makeVideo.speed / job.makeVideo.speedModifier));
}

function setupInfluencerTimer() {
    influencerId = setInterval(function () {
        if (job.recruitInfluencers.current < job.recruitInfluencers.max) {
            job.recruitInfluencers.current = math.add(job.recruitInfluencers.current, job.recruitInfluencers.increase);
        }
        else {
            job.recruitInfluencers.total = math.add(job.recruitInfluencers.total, 1);
            job.influencers = math.add(job.influencers, job.influencerGrowth);
            job.recruitInfluencers.current = 0;
        }
    }, getScaledTimerDelay(job.recruitInfluencers.speed / job.recruitInfluencers.speedModifier));
}

function setupBrowseRedditTimer() {
    browseRedditTimerId = setInterval(function () {
        if (research.browseReddit.current < research.browseReddit.max) {
            research.browseReddit.current = math.add(research.browseReddit.current, research.browseReddit.increase);
        }
        else {
            research.browseReddit.total = math.add(research.browseReddit.total, 1);
            research.posts = math.add(research.posts, postFormula());
            stats.intelligence = math.add(
                stats.intelligence,
                math.mul(research.browseReddit.intelligence, math.add(math.mul(stats.intelligence, stats.intelligenceBoost), 1))
            );
            research.browseReddit.current = 0;
        }
    }, getScaledTimerDelay(research.browseReddit.speed / research.browseReddit.speedModifier));
}

function setupCodeBotsTimer() {
    codeBotsTimerId = setInterval(function () {
        if (research.codeBots.current < research.codeBots.max) {
            research.codeBots.current = math.add(research.codeBots.current, research.codeBots.increase);
        }
        else {
            research.codeBots.total = math.add(research.codeBots.total, 1);
            research.bots = math.add(research.bots, research.botGrowth);
            stats.intelligence = math.add(
                stats.intelligence,
                math.mul(research.codeBots.intelligence, math.add(math.mul(stats.intelligence, stats.intelligenceBoost), 1))
            );
            research.codeBots.current = 0;
        }
    }, getScaledTimerDelay(research.codeBots.speed / research.codeBots.speedModifier));
}

function followerFormula() {
    return applyModifierPipeline(job.followerGrowth, {
        additive: [
            math.mul(bodyweight.pushups.total, job.pushupFollowerMod),
            math.mul(bodyweight.rows.total, job.rowFollowerMod),
            math.mul(bodyweight.dips.total, job.dipFollowerMod),
            math.mul(bodyweight.pullups.total, job.pullupFollowerMod),
            math.mul(bodyweight.squats.total, job.bwSquatFollowerMod),
            math.mul(bodyweight.rdl.total, job.bwRdlFollowerMod),
            math.mul(research.posts, job.postFollowerMod),
        ],
        global: [getAllStatMultiplier()],
    });
}

function postFormula() {
    return applyModifierPipeline(research.postGrowth, {
        multiplicative: [getStrengthPostMultiplier()],
    });
}

function setupStory2() {
    checks.story2 = true;
    $("#story").prepend("<div id='story2' class='alert alert-primary alert-dismissible fade show fixed-bottom' role='alert'><strong>I need a break!</strong> I'm actually so strong now, I should start a YouTube channel! (check work tab)<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
    $("#work-tab").removeClass("d-none");
    $("#followerWrap").removeClass("d-none");
    setupMakeVideoTimer();
}

function upgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("upgradeBtn")[1]);
        let upgrade = upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    $("#coffee").removeClass("d-none");
                    break;
                case 1:
                    stats.energy.coffee.boost *= 2;
                    break;
                case 2:
                    stats.energy.increase *= 2;
                    break;
                case 3:
                    stats.strengthBoost *= 2;
                    break;
                case 4:
                    stats.enduranceBoost *= 2;
                    break;
                case 5:
                    stats.agilityBoost *= 2;
                    break;
                case 6:
                    stats.intelligenceBoost *= 2;
                    break;
                case 7:
                    stats.allStatBoost *= 2;
                    break;
                case 8:
                    stats.energy.increase *= 2;
                    break;
                case 9:
                    stats.strengthBoost *= 2;
                    break;
                case 10:
                    stats.agilityBoost *= 2;
                    break;
                case 11:
                    stats.enduranceBoost *= 2;
                    break;
                case 12:
                    stats.intelligenceBoost *= 2;
                    break;
                default:
            }
        }
    }
}

function bwUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("bwUpgradeBtn")[1]);
        let upgrade = bodyweight.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (stats.money >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            stats.money = math.sub(stats.money, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    bodyweight.pushups.speedModifier *= 2;
                    startStop(bodyweight.pushups, pushupTimerId, true);
                    break;
                case 1:
                    $("#bwRows").removeClass("d-none");
                    startStop(bodyweight.rows, rowTimerId, true);
                    break;
                case 2:
                    bodyweight.pushups.energy /= 2;
                    bodyweight.rows.energy /= 2;
                    break;
                case 3:
                    bodyweight.rows.speedModifier *= 2;
                    startStop(bodyweight.rows, rowTimerId, true);
                    break;
                case 4:
                    $("#bwPullups").removeClass("d-none");
                    startStop(bodyweight.pullups, pullupTimerId, true);
                    break;
                case 5:
                    bodyweight.pullups.speedModifier *= 2;
                    startStop(bodyweight.pullups, pullupTimerId, true);
                    break;
                case 6:
                    bodyweight.dips.speedModifier *= 2;
                    startStop(bodyweight.dips, dipTimerId, true);
                    break;
                case 7:
                    bodyweight.pullups.energy /= 2;
                    break;
                case 8:
                    bodyweight.dips.energy /= 2;
                    break;
                case 9:
                    bodyweight.squats.speedModifier *= 2;
                    startStop(bodyweight.squats, bwSquatTimerId, true);
                    break;
                case 10:
                    bodyweight.rdl.speedModifier *= 2;
                    startStop(bodyweight.rdl, bwRdlTimerId, true);
                    break;
                case 11:
                    bodyweight.rdl.energy /= 2;
                    bodyweight.squats.energy /= 2;
                    break;
                case 12:
                    bodyweight.pushups.energy *= 2;
                    bodyweight.pushups.strength *= 2;
                    bodyweight.pushups.endurance *= 2;
                    bodyweight.pushups.agility *= 2;
                    bodyweight.rows.energy *= 2;
                    bodyweight.rows.strength *= 2;
                    bodyweight.rows.endurance *= 2;
                    bodyweight.rows.agility *= 2;
                    break;
                case 13:
                    bodyweight.dips.energy *= 2;
                    bodyweight.dips.strength *= 2;
                    bodyweight.dips.endurance *= 2;
                    bodyweight.dips.agility *= 2;
                    bodyweight.pullups.energy *= 2;
                    bodyweight.pullups.strength *= 2;
                    bodyweight.pullups.endurance *= 2;
                    bodyweight.pullups.agility *= 2;
                    break;
                case 14:
                    bodyweight.squats.energy *= 2;
                    bodyweight.squats.strength *= 2;
                    bodyweight.squats.endurance *= 2;
                    bodyweight.squats.agility *= 2;
                    bodyweight.rdl.energy *= 2;
                    bodyweight.rdl.strength *= 2;
                    bodyweight.rdl.endurance *= 2;
                    bodyweight.rdl.agility *= 2;
                    break;
                default:
            }
        }
    }
}

function jobUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("jobUpgradeBtn")[1]);
        let upgrade = job.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (job.followers >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            job.followers = math.sub(job.followers, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    job.views = math.add(job.views, 5000);
                    break;
                case 1:
                    job.makeVideo.speedModifier *= 2;
                    clearInterval(makeVideoTimerId);
                    setupMakeVideoTimer();
                    break;
                case 2:
                    job.pushupFollowerMod += .0001;
                    break;
                case 3:
                    job.rowFollowerMod += .0001;
                    break;
                case 4:
                    setupBrowseRedditTimer();
                    $("#research-tab").removeClass("d-none");
                    $("#researchText").removeClass("d-none");
                    $("#story").prepend("<div id='story4' class='alert alert-primary alert-dismissible fade show fixed-bottom' role='alert'><strong>Why do my followers keep leaving?</strong> I'll browse Reddit for some insights and fitness information. (check research tab)<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
                    checks.story4 = true;
                    break;
                case 5:
                    job.viewGrowth *= 2;
                    break;
                case 6:
                    job.moneyGrowth *= 2;
                    break;
                case 7:
                    stats.allStatBoost *= 2;
                    break;
                case 8:
                    research.browseReddit.intelligence *= 2;
                    research.codeBots.intelligence *= 2;
                    break;
                case 9:
                    job.viewGrowth *= 2;
                    break;
                case 10:
                    job.pullupFollowerMod += .0001;
                    break;
                case 11:
                    job.dipFollowerMod += .0001;
                    break;
                case 12:
                    job.bwSquatFollowerMod += .0001;
                    break;
                case 13:
                    job.bwRdlFollowerMod += .0001;
                    break;
                case 14:
                    job.postFollowerMod += .0001;
                    break;
                case 15:
                    job.viewGrowth *= 2;
                    break;
                case 16:
                    job.influencerGrowth *= 2;
                    break;
                case 17:
                    job.influencerMulti *= 2;
                    break;
                case 18:
                    stats.allStatBoost *= 2;
                    break;
                case 19:
                    job.influencerGrowth *= 2;
                    break;
                case 20:
                    job.viewGrowth *= 2;
                    break;
                case 21:
                    job.viewGrowth *= 2;
                    break;
                case 22:
                    job.followerGrowth *= 2;
                    break;
                case 23:
                    research.browseReddit.intelligence *= 2;
                    research.codeBots.intelligence *= 2;
                    break;
                case 24:
                    job.viewGrowth *= 2;
                    break;
                case 25:
                    research.pointGrowth *= 2;
                    break;
                case 26:
                    job.moneyGrowth *= 2;
                    break;
                case 27:
                    research.pointGrowth *= 2;
                    break;
                case 28:
                    job.moneyGrowth *= 2;
                    break;
                case 29:
                    $("#payDay").removeClass("d-none");
                    break;
                default:
            }
        }
    }
}

function resUpgradeClick(button) {
    if (!$(button).hasClass("disabled")) {
        let buttonId = $(button).attr("id");
        let id = parseInt(buttonId.split("resUpgradeBtn")[1]);
        let upgrade = research.upgrades.filter(function (upgradeArray) { return upgradeArray.id == id });
        if (research.points >= upgrade[0].cost) {
            upgrade[0].isPurchased = true;
            research.points = math.sub(research.points, upgrade[0].cost);
            switch (upgrade[0].id) {
                case 0:
                    job.followerGrowth *= 2;
                    break;
                case 1:
                    stats.energy.increase *= 2;
                    break;
                case 2:
                    research.pointGrowth *= 2;
                    break;
                case 3:
                    job.moneyGrowth *= 2;
                    break;
                case 4:
                    $("#bwDips").removeClass("d-none");
                    startStop(bodyweight.dips, dipTimerId, true);
                    break;
                case 5:
                    stats.strengthBoost *= 2;
                    break;
                case 6:
                    research.pointGrowth *= 2;
                    break;
                case 7:
                    stats.agilityBoost *= 2;
                    break;
                case 8:
                    stats.enduranceBoost *= 2;
                    break;
                case 9:
                    stats.intelligenceBoost *= 2;
                    break;
                case 10:
                    $("#influencerWrap").removeClass("d-none");
                    setupInfluencerTimer();
                    break;
                case 11:
                    $("#bwRdl").removeClass("d-none");
                    $("#bwSquats").removeClass("d-none");
                    startStop(bodyweight.squats, bwSquatTimerId, true);
                    startStop(bodyweight.rdl, bwRdlTimerId, true);
                    break;
                case 12:
                    research.browseReddit.intelligence *= 2;
                    research.codeBots.intelligence *= 2;
                    break;
                case 13:
                    $("#botWrap").removeClass("d-none");
                    setupCodeBotsTimer();
                    break;
                case 14:
                    research.botMulti *= 2;
                    break;
                case 15:
                    research.botGrowth *= 2;
                    break;
                case 16:
                    research.browseReddit.speedModifier *= 2;
                    clearInterval(browseRedditTimerId);
                    setupBrowseRedditTimer();
                    break;
                case 17:
                    $("#openGym-tab").removeClass("d-none");
                    $("#story").prepend("<div id='story5' class='alert alert-primary alert-dismissible fade show fixed-bottom' role='alert'><strong>I'm so rich and strong now</strong>! It's time to fulfill my dream and open a gym. (check Open Gym tab)<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>");
                    checks.isPrestige = true;
                    checks.story5 = true;
                    updatePrestigeValues();
                    checkPrestigeUpgradeDisable(prestige.upgrades, prestige.current, "globalUpgrade");
                    updateRepeatingUpgradeButtons("globalUpgrades", "global", prestige.current);
                    break;
                case 18:
                    research.postStrengthMod += 1;
                    break;
                case 19:
                    stats.allStatBoost *= 2;
                    break;
                case 20:
                    job.followerGrowth *= 2;
                    break;
                case 21:
                    job.influencerMulti *= 2;
                    break;
                case 22:
                    stats.energy.increase *= 2;
                    break;
                default:
            }
        }
    }
}

//#endregion

