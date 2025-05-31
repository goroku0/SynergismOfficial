import '@ungap/custom-elements'
import Decimal, { type DecimalSource } from 'break_eternity.js'
import LZString from 'lz-string'

import {
  autoAscensionChallengeSweepUnlock,
  CalcECC,
  challenge15ScoreMultiplier,
  challengeDisplay,
  challengeRequirement,
  getChallengeConditions,
  getMaxChallenges,
  highestChallengeRewards,
  runChallengeSweep
} from './Challenges'
import { btoa, cleanString, isDecimal, sortWithIndices, sumContents } from './Utility'
import { blankGlobals, Globals as G } from './Variables'

import {
  ascensionAchievementCheck,
  buildingAchievementCheck,
  challengeachievementcheck,
  resetachievementcheck
} from './Achievements'
import { antSacrificePointsToMultiplier, calculateCrumbToCoinExp } from './Ants'
import {
  buyCrystalUpgrades,
  buyRuneBonusLevels,
  buyTesseractBuilding} from './Buy'
import { buyParticleBuilding } from './mod/Buy_moded'
import { buyMax } from './mod/Buy_moded'
import {
  calculateAnts,
  calculateCubeBlessings,
  calculateGlobalSpeedMult,
  calculateGoldenQuarks,
  calculateObtainium,
  calculateOfferings,
  calculateOffline,
  calculateRuneLevels,
  calculateTotalAcceleratorBoost,
  calculateTotalCoinOwned,
  dailyResetCheck,
  exitOffline} from './Calculate'
import {
  corruptionButtonsAdd,
  corruptionLoadLoadout,
  CorruptionLoadout,
  corruptionLoadoutTableCreate,
  corruptionLoadoutTableUpdate,
  CorruptionSaves,
  corruptionsSchema,
  corruptionStatsUpdate,
  updateCorruptionLoadoutNames,
  updateUndefinedLoadouts
} from './Corruptions'
import { updateCubeUpgradeBG } from './Cubes'
import { generateEventHandlers } from './EventListeners'
import { addTimers, automaticTools } from './Helper'
import { resetHistoryRenderAllTables } from './History'
import { calculateHypercubeBlessings } from './Hypercubes'
import { calculatePlatonicBlessings } from './PlatonicCubes'
import { buyResearch, maxRoombaResearchIndex, updateResearchBG } from './Research'
import { autoResearchEnabled } from './Research'
import {
  reset,
  resetrepeat,
  singularity,
  updateAutoCubesOpens,
  updateAutoReset,
  updateSingularityAchievements,
  updateSingularityGlobalPerks,
  updateTesseractAutoBuyAmount
} from './Reset'
import { redeemShards } from './Runes'
import { c15RewardUpdate } from './Statistics'
import {
  toggleTalismanBuy,
  updateTalismanAppearance,
  updateTalismanInventory
} from './Talismans'
import { calculatetax } from './Tax'
import { calculateTesseractBlessings } from './Tesseracts'
import {
  autoCubeUpgradesToggle,
  autoPlatonicUpgradesToggle,
  toggleAntAutoSacrifice,
  toggleAntMaxBuy,
  toggleAscStatPerSecond,
  toggleauto,
  toggleAutoAscend,
  toggleAutoChallengeModeText,
  toggleChallenges,
  toggleShops,
  updateAutoChallenge,
  updateRuneBlessingBuyAmount
} from './Toggles'
import type { OneToFive, Player, resetNames, ZeroToFour } from './types/Synergism'
import {
  Alert,
  buttoncolorchange,
  changeTabColor,
  Confirm,
  htmlInserts,
  Notification,
  revealStuff,
  showCorruptionStatsLoadouts,
  updateAchievementBG,
  updateChallengeDisplay,
  updateChallengeLevel
} from './UpdateHTML'
import {
  ascendBuildingDR,
  categoryUpgrades,
  upgradeupdate
} from './Upgrades'
// import { LegacyShopUpgrades } from './types/LegacySynergism';

import i18next from 'i18next'
import rfdc from 'rfdc'
import {
  BlueberryUpgrade,
  blueberryUpgradeData,
  displayProperLoadoutCount,
  updateBlueberryLoadoutCount
} from './BlueberryUpgrades'
import { DOMCacheGetOrSet } from './Cache/DOM'
import {
  campaignIconHTMLUpdates,
  CampaignManager,
  campaignTokenRewardHTMLUpdate,
  createCampaignIconHTMLS
} from './Campaign'
import { dev, lastUpdated, prod, testing, version } from './Config'
import { WowCubes, WowHypercubes, WowPlatonicCubes, WowTesseracts } from './CubeExperimental'
import { eventCheck } from './Event'
import {
  AbyssHepteract,
  AcceleratorBoostHepteract,
  AcceleratorHepteract,
  ChallengeHepteract,
  ChronosHepteract,
  HepteractCraft,
  HyperrealismHepteract,
  MultiplierHepteract,
  QuarkHepteract,
  toggleAutoBuyOrbs
} from './Hepteracts'
import { disableHotkeys } from './Hotkeys'
import { init as i18nInit } from './i18n'
import { handleLogin } from './Login'
import { octeractData, OcteractUpgrade } from './Octeracts'
import { updatePlatonicUpgradeBG } from './Platonic'
import { initializePCoinCache, PCoinUpgradeEffects } from './PseudoCoinUpgrades'
import { getQuarkBonus, QuarkHandler } from './Quark'
import { initRedAmbrosiaUpgrades } from './RedAmbrosiaUpgrades'
import { playerJsonSchema } from './saves/PlayerJsonSchema'
import { playerUpdateVarSchema } from './saves/PlayerUpdateVarSchema'
import { getFastForwardTotalMultiplier, singularityData, SingularityUpgrade } from './singularity'
import { SingularityChallenge, singularityChallengeData } from './SingularityChallenges'
import { changeSubTab, changeTab, getActiveSubTab, Tabs } from './Tabs'
import { settingAnnotation, toggleIconSet, toggleTheme } from './Themes'
import { clearTimeout, clearTimers, setInterval, setTimeout } from './Timers'
import { format_decimalNew, is_decimalNew, to_number, updateAccelerator, updateAll, updateAllMultiplier, updateCoin, updateGlobalCoinMultiplier } from './mod/try_break_eternity'

export const player: Player = {
  firstPlayed: new Date().toISOString(),
  worlds: new QuarkHandler(0),
  coins: new Decimal('1e2'),
  coinsThisPrestige: new Decimal('1e2'),
  coinsThisTranscension: new Decimal('1e2'),
  coinsThisReincarnation: new Decimal('1e2'),
  coinsTotal: new Decimal('100'),

  firstOwnedCoin: new Decimal('0'),
  firstGeneratedCoin: new Decimal('0'),
  firstCostCoin: new Decimal('100'),
  firstProduceCoin: new Decimal('0.25'),

  secondOwnedCoin: new Decimal('0'),
  secondGeneratedCoin: new Decimal('0'),
  secondCostCoin: new Decimal('1e3'),
  secondProduceCoin: new Decimal('2.5'),

  thirdOwnedCoin: new Decimal('0'),
  thirdGeneratedCoin: new Decimal('0'),
  thirdCostCoin: new Decimal('2e4'),
  thirdProduceCoin: new Decimal('25'),

  fourthOwnedCoin: new Decimal('0'),
  fourthGeneratedCoin: new Decimal('0'),
  fourthCostCoin: new Decimal('4e5'),
  fourthProduceCoin: new Decimal('250'),

  fifthOwnedCoin: new Decimal('0'),
  fifthGeneratedCoin: new Decimal('0'),
  fifthCostCoin: new Decimal('8e6'),
  fifthProduceCoin: new Decimal('2500'),

  firstOwnedDiamonds: new Decimal('0'),
  firstGeneratedDiamonds: new Decimal('0'),
  firstCostDiamonds: new Decimal('100'),
  firstProduceDiamonds: new Decimal('0.05'),

  secondOwnedDiamonds: new Decimal('0'),
  secondGeneratedDiamonds: new Decimal('0'),
  secondCostDiamonds: new Decimal('1e5'),
  secondProduceDiamonds: new Decimal('0.0005'),

  thirdOwnedDiamonds: new Decimal('0'),
  thirdGeneratedDiamonds: new Decimal('0'),
  thirdCostDiamonds: new Decimal('1e15'),
  thirdProduceDiamonds: new Decimal('0.00005'),

  fourthOwnedDiamonds: new Decimal('0'),
  fourthGeneratedDiamonds: new Decimal('0'),
  fourthCostDiamonds: new Decimal('1e40'),
  fourthProduceDiamonds: new Decimal('0.000005'),

  fifthOwnedDiamonds: new Decimal('0'),
  fifthGeneratedDiamonds: new Decimal('0'),
  fifthCostDiamonds: new Decimal('1e100'),
  fifthProduceDiamonds: new Decimal('0.000005'),

  firstOwnedMythos: new Decimal('0'),
  firstGeneratedMythos: new Decimal('0'),
  firstCostMythos: new Decimal('1'),
  firstProduceMythos: new Decimal('1'),

  secondOwnedMythos: new Decimal('0'),
  secondGeneratedMythos: new Decimal('0'),
  secondCostMythos: new Decimal('100'),
  secondProduceMythos: new Decimal('0.01'),

  thirdOwnedMythos: new Decimal('0'),
  thirdGeneratedMythos: new Decimal('0'),
  thirdCostMythos: new Decimal('1e4'),
  thirdProduceMythos: new Decimal('0.001'),

  fourthOwnedMythos: new Decimal('0'),
  fourthGeneratedMythos: new Decimal('0'),
  fourthCostMythos: new Decimal('1e8'),
  fourthProduceMythos: new Decimal('0.0002'),

  fifthOwnedMythos: new Decimal('0'),
  fifthGeneratedMythos: new Decimal('0'),
  fifthCostMythos: new Decimal('1e16'),
  fifthProduceMythos: new Decimal('0.00004'),

  firstOwnedParticles: new Decimal('0'),
  firstGeneratedParticles: new Decimal('0'),
  firstCostParticles: new Decimal('1'),
  firstProduceParticles: new Decimal('0.25'),

  secondOwnedParticles: new Decimal('0'),
  secondGeneratedParticles: new Decimal('0'),
  secondCostParticles: new Decimal('100'),
  secondProduceParticles: new Decimal('0.2'),

  thirdOwnedParticles: new Decimal('0'),
  thirdGeneratedParticles: new Decimal('0'),
  thirdCostParticles: new Decimal('1e4'),
  thirdProduceParticles: new Decimal('0.15'),

  fourthOwnedParticles: new Decimal('0'),
  fourthGeneratedParticles: new Decimal('0'),
  fourthCostParticles: new Decimal('1e8'),
  fourthProduceParticles: new Decimal('0.1'),

  fifthOwnedParticles: new Decimal('0'),
  fifthGeneratedParticles: new Decimal('0'),
  fifthCostParticles: new Decimal('1e16'),
  fifthProduceParticles: new Decimal('0.5'),

  firstOwnedAnts: 0,
  firstGeneratedAnts: new Decimal('0'),
  firstCostAnts: new Decimal('1e700'),
  firstProduceAnts: 0.0001,

  secondOwnedAnts: 0,
  secondGeneratedAnts: new Decimal('0'),
  secondCostAnts: new Decimal('3'),
  secondProduceAnts: 0.00005,

  thirdOwnedAnts: 0,
  thirdGeneratedAnts: new Decimal('0'),
  thirdCostAnts: new Decimal('100'),
  thirdProduceAnts: 0.00002,

  fourthOwnedAnts: 0,
  fourthGeneratedAnts: new Decimal('0'),
  fourthCostAnts: new Decimal('1e4'),
  fourthProduceAnts: 0.00001,

  fifthOwnedAnts: 0,
  fifthGeneratedAnts: new Decimal('0'),
  fifthCostAnts: new Decimal('1e12'),
  fifthProduceAnts: 0.000005,

  sixthOwnedAnts: 0,
  sixthGeneratedAnts: new Decimal('0'),
  sixthCostAnts: new Decimal('1e36'),
  sixthProduceAnts: 0.000002,

  seventhOwnedAnts: 0,
  seventhGeneratedAnts: new Decimal('0'),
  seventhCostAnts: new Decimal('1e100'),
  seventhProduceAnts: 0.000001,

  eighthOwnedAnts: 0,
  eighthGeneratedAnts: new Decimal('0'),
  eighthCostAnts: new Decimal('1e300'),
  eighthProduceAnts: 0.00000001,

  ascendBuilding1: {
    cost: 1,
    owned: 0,
    generated: new Decimal('0'),
    multiplier: 0.01
  },
  ascendBuilding2: {
    cost: 10,
    owned: 0,
    generated: new Decimal('0'),
    multiplier: 0.01
  },
  ascendBuilding3: {
    cost: 100,
    owned: 0,
    generated: new Decimal('0'),
    multiplier: 0.01
  },
  ascendBuilding4: {
    cost: 1000,
    owned: 0,
    generated: new Decimal('0'),
    multiplier: 0.01
  },
  ascendBuilding5: {
    cost: 10000,
    owned: 0,
    generated: new Decimal('0'),
    multiplier: 0.01
  },

  multiplierCost: new Decimal('1e4'),
  multiplierBought: new Decimal('0'),

  acceleratorCost: new Decimal('500'),
  acceleratorBought: new Decimal('0'),

  acceleratorBoostBought: new Decimal('0'),
  acceleratorBoostCost: new Decimal('1e3'),

  upgrades: Array(141).fill(0) as number[],

  prestigeCount: 0,
  transcendCount: 0,
  reincarnationCount: 0,

  prestigePoints: new Decimal('0'),
  transcendPoints: new Decimal('0'),
  reincarnationPoints: new Decimal('0'),

  prestigeShards: new Decimal('0'),
  transcendShards: new Decimal('0'),
  reincarnationShards: new Decimal('0'),

  toggles: {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
    13: false,
    14: false,
    15: false,
    16: false,
    17: false,
    18: false,
    19: false,
    20: false,
    21: false,
    22: false,
    23: false,
    24: false,
    25: false,
    26: false,
    27: false,
    28: true,
    29: true,
    30: true,
    31: true,
    32: true,
    33: true,
    34: true,
    35: true,
    36: false,
    37: false,
    38: false,
    39: true,
    40: true,
    41: true,
    42: false,
    43: false
  },

  challengecompletions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  highestchallengecompletions: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  challenge15Exponent: 0,
  highestChallenge15Exponent: 0,

  retrychallenges: false,
  currentChallenge: {
    transcension: 0,
    reincarnation: 0,
    ascension: 0
  },
  researchPoints: 0,
  obtainiumtimer: 0,
  obtainiumpersecond: 0,
  maxobtainiumpersecond: 0,
  maxobtainium: 0,
  // Ignore the first index. The other 25 are shaped in a 5x5 grid similar to the production appearance
  // dprint-ignore
  researches: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0,
  ],

  unlocks: {
    coinone: false,
    cointwo: false,
    cointhree: false,
    coinfour: false,
    prestige: false,
    generation: false,
    transcend: false,
    reincarnate: false,
    rrow1: false,
    rrow2: false,
    rrow3: false,
    rrow4: false
  },
  achievements: Array(281).fill(0) as number[],

  achievementPoints: 0,

  prestigenomultiplier: true,
  prestigenoaccelerator: true,
  transcendnomultiplier: true,
  transcendnoaccelerator: true,
  reincarnatenomultiplier: true,
  reincarnatenoaccelerator: true,
  prestigenocoinupgrades: true,
  transcendnocoinupgrades: true,
  transcendnocoinorprestigeupgrades: true,
  reincarnatenocoinupgrades: true,
  reincarnatenocoinorprestigeupgrades: true,
  reincarnatenocoinprestigeortranscendupgrades: true,
  reincarnatenocoinprestigetranscendorgeneratorupgrades: true,

  crystalUpgrades: [0, 0, 0, 0, 0, 0, 0, 0],
  crystalUpgradesCost: [7, 15, 20, 40, 100, 200, 500, 1000],

  runelevels: [1, 1, 1, 1, 1, 0, 0],
  runeexp: [0, 0, 0, 0, 0, 0, 0],
  runeshards: 0,
  maxofferings: 0,
  offeringpersecond: 0,

  prestigecounter: 0,
  transcendcounter: 0,
  reincarnationcounter: 0,
  offlinetick: Date.now(),

  prestigeamount: 0,
  transcendamount: 0,
  reincarnationamount: 0,

  fastestprestige: 9999999999,
  fastesttranscend: 99999999999,
  fastestreincarnate: 999999999999,

  resettoggle1: 1,
  resettoggle2: 1,
  resettoggle3: 1,
  resettoggle4: 1,

  tesseractAutoBuyerToggle: 0,
  tesseractAutoBuyerAmount: 0,

  coinbuyamount: 1,
  crystalbuyamount: 1,
  mythosbuyamount: 1,
  particlebuyamount: 1,
  offeringbuyamount: 1,
  tesseractbuyamount: 1,

  shoptoggles: {
    coin: true,
    prestige: true,
    transcend: true,
    generators: true,
    reincarnate: true
  },

  // create a Map with keys defaulting to false
  codes: new Map(Array.from({ length: 48 }, (_, i) => [i + 1, false])),

  loaded1009: true,
  loaded1009hotfix1: true,
  loaded10091: true,
  loaded1010: true,
  loaded10101: true,

  shopUpgrades: {
    offeringPotion: 1,
    obtainiumPotion: 1,
    offeringEX: 0,
    offeringAuto: 0,
    obtainiumEX: 0,
    obtainiumAuto: 0,
    instantChallenge: 0,
    antSpeed: 0,
    cashGrab: 0,
    shopTalisman: 0,
    seasonPass: 0,
    challengeExtension: 0,
    challengeTome: 0,
    cubeToQuark: 0,
    tesseractToQuark: 0,
    hypercubeToQuark: 0,
    seasonPass2: 0,
    seasonPass3: 0,
    chronometer: 0,
    infiniteAscent: 0,
    calculator: 0,
    calculator2: 0,
    calculator3: 0,
    calculator4: 0,
    calculator5: 0,
    calculator6: 0,
    calculator7: 0,
    constantEX: 0,
    powderEX: 0,
    chronometer2: 0,
    chronometer3: 0,
    seasonPassY: 0,
    seasonPassZ: 0,
    challengeTome2: 0,
    instantChallenge2: 0,
    cashGrab2: 0,
    chronometerZ: 0,
    cubeToQuarkAll: 0,
    offeringEX2: 0,
    obtainiumEX2: 0,
    seasonPassLost: 0,
    powderAuto: 0,
    challenge15Auto: 0,
    extraWarp: 0,
    autoWarp: 0,
    improveQuarkHept: 0,
    improveQuarkHept2: 0,
    improveQuarkHept3: 0,
    improveQuarkHept4: 0,
    shopImprovedDaily: 0,
    shopImprovedDaily2: 0,
    shopImprovedDaily3: 0,
    shopImprovedDaily4: 0,
    offeringEX3: 0,
    obtainiumEX3: 0,
    improveQuarkHept5: 0,
    seasonPassInfinity: 0,
    chronometerInfinity: 0,
    shopSingularityPenaltyDebuff: 0,
    shopAmbrosiaLuckMultiplier4: 0,
    shopOcteractAmbrosiaLuck: 0,
    shopAmbrosiaGeneration1: 0,
    shopAmbrosiaGeneration2: 0,
    shopAmbrosiaGeneration3: 0,
    shopAmbrosiaGeneration4: 0,
    shopAmbrosiaLuck1: 0,
    shopAmbrosiaLuck2: 0,
    shopAmbrosiaLuck3: 0,
    shopAmbrosiaLuck4: 0,
    shopCashGrabUltra: 0,
    shopAmbrosiaAccelerator: 0,
    shopEXUltra: 0,
    shopChronometerS: 0,
    shopAmbrosiaUltra: 0,
    shopSingularitySpeedup: 0,
    shopSingularityPotency: 0,
    shopSadisticRune: 0,
    shopRedLuck1: 0,
    shopRedLuck2: 0,
    shopRedLuck3: 0,
    shopInfiniteShopUpgrades: 0
  },

  shopPotionsConsumed: {
    offering: 0,
    obtainium: 0
  },

  shopBuyMaxToggle: false,
  shopHideToggle: false,
  shopConfirmationToggle: true,
  autoPotionTimer: 0,
  autoPotionTimerObtainium: 0,

  autoSacrificeToggle: false,
  autoBuyFragment: false,
  autoFortifyToggle: false,
  autoEnhanceToggle: false,
  autoResearchToggle: false,
  researchBuyMaxToggle: false,
  autoResearchMode: 'manual',
  autoResearch: 0,
  autoSacrifice: 0,
  sacrificeTimer: 0,
  quarkstimer: 90000,
  goldenQuarksTimer: 90000,

  antPoints: new Decimal('1'),
  antUpgrades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  antSacrificePoints: 0,
  antSacrificeTimer: 0,
  antSacrificeTimerReal: 0,

  talismanLevels: [0, 0, 0, 0, 0, 0, 0],
  talismanRarity: [1, 1, 1, 1, 1, 1, 1],
  talismanOne: [null, -1, 1, 1, 1, -1],
  talismanTwo: [null, 1, 1, -1, -1, 1],
  talismanThree: [null, 1, -1, 1, 1, -1],
  talismanFour: [null, -1, -1, 1, 1, 1],
  talismanFive: [null, 1, 1, -1, -1, 1],
  talismanSix: [null, 1, 1, 1, -1, -1],
  talismanSeven: [null, -1, 1, -1, 1, 1],
  talismanShards: 0,
  commonFragments: 0,
  uncommonFragments: 0,
  rareFragments: 0,
  epicFragments: 0,
  legendaryFragments: 0,
  mythicalFragments: 0,

  buyTalismanShardPercent: 10,

  autoAntSacrifice: false,
  autoAntSacTimer: 900,
  autoAntSacrificeMode: 0,
  antMax: false,

  ascensionCount: 0,
  ascensionCounter: 0,
  ascensionCounterReal: 0,
  ascensionCounterRealReal: 0,
  // dprint-ignore
  cubeUpgrades: [
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ],
  cubeUpgradesBuyMaxToggle: false,
  autoCubeUpgradesToggle: false,
  autoPlatonicUpgradesToggle: false,
  platonicUpgrades: [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ],
  wowCubes: new WowCubes(0),
  wowTesseracts: new WowTesseracts(0),
  wowHypercubes: new WowHypercubes(0),
  wowPlatonicCubes: new WowPlatonicCubes(0),
  saveOfferingToggle: false,
  wowAbyssals: 0,
  wowOcteracts: 0,
  totalWowOcteracts: 0,
  cubeBlessings: {
    accelerator: 0,
    multiplier: 0,
    offering: 0,
    runeExp: 0,
    obtainium: 0,
    antSpeed: 0,
    antSacrifice: 0,
    antELO: 0,
    talismanBonus: 0,
    globalSpeed: 0
  },
  tesseractBlessings: {
    accelerator: 0,
    multiplier: 0,
    offering: 0,
    runeExp: 0,
    obtainium: 0,
    antSpeed: 0,
    antSacrifice: 0,
    antELO: 0,
    talismanBonus: 0,
    globalSpeed: 0
  },
  hypercubeBlessings: {
    accelerator: 0,
    multiplier: 0,
    offering: 0,
    runeExp: 0,
    obtainium: 0,
    antSpeed: 0,
    antSacrifice: 0,
    antELO: 0,
    talismanBonus: 0,
    globalSpeed: 0
  },
  platonicBlessings: {
    cubes: 0,
    tesseracts: 0,
    hypercubes: 0,
    platonics: 0,
    hypercubeBonus: 0,
    taxes: 0,
    scoreBonus: 0,
    globalSpeed: 0
  },

  hepteractCrafts: {
    chronos: ChronosHepteract,
    hyperrealism: HyperrealismHepteract,
    quark: QuarkHepteract,
    challenge: ChallengeHepteract,
    abyss: AbyssHepteract,
    accelerator: AcceleratorHepteract,
    acceleratorBoost: AcceleratorBoostHepteract,
    multiplier: MultiplierHepteract
  },

  ascendShards: new Decimal('0'),
  autoAscend: false,
  autoAscendMode: 'c10Completions',
  autoAscendThreshold: 1,
  autoOpenCubes: false,
  openCubes: 0,
  autoOpenTesseracts: false,
  openTesseracts: 0,
  autoOpenHypercubes: false,
  openHypercubes: 0,
  autoOpenPlatonicsCubes: false,
  openPlatonicsCubes: 0,
  roombaResearchIndex: 0,
  ascStatToggles: {
    // false here means show per second
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  },

  corruptions: {
    next: new CorruptionLoadout(corruptionsSchema.parse({})),
    used: new CorruptionLoadout(corruptionsSchema.parse({})),
    saves: new CorruptionSaves({
      'Loadout 1': corruptionsSchema.parse({}),
      'Loadout 2': corruptionsSchema.parse({}),
      'Loadout 3': corruptionsSchema.parse({}),
      'Loadout 4': corruptionsSchema.parse({}),
      'Loadout 5': corruptionsSchema.parse({}),
      'Loadout 6': corruptionsSchema.parse({}),
      'Loadout 7': corruptionsSchema.parse({}),
      'Loadout 8': corruptionsSchema.parse({}),
      'Loadout 9': corruptionsSchema.parse({}),
      'Loadout 10': corruptionsSchema.parse({}),
      'Loadout 11': corruptionsSchema.parse({}),
      'Loadout 12': corruptionsSchema.parse({}),
      'Loadout 13': corruptionsSchema.parse({}),
      'Loadout 14': corruptionsSchema.parse({}),
      'Loadout 15': corruptionsSchema.parse({}),
      'Loadout 16': corruptionsSchema.parse({})
    }),
    showStats: true
  },

  campaigns: new CampaignManager(),
  constantUpgrades: [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  history: { ants: [], ascend: [], reset: [], singularity: [] },
  historyShowPerSecond: false,

  autoChallengeRunning: false,
  autoChallengeIndex: 1,
  autoChallengeToggles: [
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false
  ],
  autoChallengeStartExponent: 10,
  autoChallengeTimer: {
    start: 10,
    exit: 2,
    enter: 2
  },

  runeBlessingLevels: [0, 0, 0, 0, 0, 0],
  runeSpiritLevels: [0, 0, 0, 0, 0, 0],
  runeBlessingBuyAmount: 0,
  runeSpiritBuyAmount: 0,

  autoTesseracts: [false, false, false, false, false, false],

  saveString: 'Synergism-$VERSION$-$TIME$.txt',
  exporttest: !testing,

  dayCheck: null,
  dayTimer: 0,
  cubeOpenedDaily: 0,
  cubeQuarkDaily: 0,
  tesseractOpenedDaily: 0,
  tesseractQuarkDaily: 0,
  hypercubeOpenedDaily: 0,
  hypercubeQuarkDaily: 0,
  platonicCubeOpenedDaily: 0,
  platonicCubeQuarkDaily: 0,
  overfluxOrbs: 0,
  overfluxOrbsAutoBuy: false,
  overfluxPowder: 0,
  dailyPowderResetUses: 1,
  autoWarpCheck: false,
  loadedOct4Hotfix: false,
  loadedNov13Vers: true,
  loadedDec16Vers: true,
  loadedV253: true,
  loadedV255: true,
  loadedV297Hotfix1: true,
  loadedV2927Hotfix1: true,
  loadedV2930Hotfix1: true,
  loadedV2931Hotfix1: true,
  loadedV21003Hotfix1: true,
  loadedV21007Hotfix1: true,
  version,
  rngCode: 0,
  promoCodeTiming: {
    time: 0
  },
  singularityCount: 0,
  highestSingularityCount: 0,
  singularityCounter: 0,
  goldenQuarks: 0,
  quarksThisSingularity: 0,
  totalQuarksEver: 0,
  hotkeys: {},
  theme: 'Dark Mode',
  iconSet: 1,
  notation: 'Default',

  singularityUpgrades: {
    goldenQuarks1: new SingularityUpgrade(
      singularityData.goldenQuarks1,
      'goldenQuarks1'
    ),
    goldenQuarks2: new SingularityUpgrade(
      singularityData.goldenQuarks2,
      'goldenQuarks2'
    ),
    goldenQuarks3: new SingularityUpgrade(
      singularityData.goldenQuarks3,
      'goldenQuarks3'
    ),
    starterPack: new SingularityUpgrade(
      singularityData.starterPack,
      'starterPack'
    ),
    wowPass: new SingularityUpgrade(singularityData.wowPass, 'wowPass'),
    cookies: new SingularityUpgrade(singularityData.cookies, 'cookies'),
    cookies2: new SingularityUpgrade(singularityData.cookies2, 'cookies2'),
    cookies3: new SingularityUpgrade(singularityData.cookies3, 'cookies3'),
    cookies4: new SingularityUpgrade(singularityData.cookies4, 'cookies4'),
    cookies5: new SingularityUpgrade(singularityData.cookies5, 'cookies5'),
    ascensions: new SingularityUpgrade(
      singularityData.ascensions,
      'ascensions'
    ),
    corruptionFourteen: new SingularityUpgrade(
      singularityData.corruptionFourteen,
      'corruptionFourteen'
    ),
    corruptionFifteen: new SingularityUpgrade(
      singularityData.corruptionFifteen,
      'corruptionFifteen'
    ),
    singOfferings1: new SingularityUpgrade(
      singularityData.singOfferings1,
      'singOfferings1'
    ),
    singOfferings2: new SingularityUpgrade(
      singularityData.singOfferings2,
      'singOfferings2'
    ),
    singOfferings3: new SingularityUpgrade(
      singularityData.singOfferings3,
      'singOfferings3'
    ),
    singObtainium1: new SingularityUpgrade(
      singularityData.singObtainium1,
      'singObtainium1'
    ),
    singObtainium2: new SingularityUpgrade(
      singularityData.singObtainium2,
      'singObtainium2'
    ),
    singObtainium3: new SingularityUpgrade(
      singularityData.singObtainium3,
      'singObtainium3'
    ),
    singCubes1: new SingularityUpgrade(
      singularityData.singCubes1,
      'singCubes1'
    ),
    singCubes2: new SingularityUpgrade(
      singularityData.singCubes2,
      'singCubes2'
    ),
    singCubes3: new SingularityUpgrade(
      singularityData.singCubes3,
      'singCubes3'
    ),
    singBonusTokens1: new SingularityUpgrade(
      singularityData.singBonusTokens1,
      'singBonusTokens1'
    ),
    singBonusTokens2: new SingularityUpgrade(
      singularityData.singBonusTokens2,
      'singBonusTokens2'
    ),
    singBonusTokens3: new SingularityUpgrade(
      singularityData.singBonusTokens3,
      'singBonusTokens3'
    ),
    singBonusTokens4: new SingularityUpgrade(
      singularityData.singBonusTokens4,
      'singBonusTokens4'
    ),
    singCitadel: new SingularityUpgrade(
      singularityData.singCitadel,
      'singCitadel'
    ),
    singCitadel2: new SingularityUpgrade(
      singularityData.singCitadel2,
      'singCitadel2'
    ),
    octeractUnlock: new SingularityUpgrade(
      singularityData.octeractUnlock,
      'octeractUnlock'
    ),
    singOcteractPatreonBonus: new SingularityUpgrade(
      singularityData.singOcteractPatreonBonus,
      'singOcteractPatreonBonus'
    ),
    intermediatePack: new SingularityUpgrade(
      singularityData.intermediatePack,
      'intermediatePack'
    ),
    advancedPack: new SingularityUpgrade(
      singularityData.advancedPack,
      'advancedPack'
    ),
    expertPack: new SingularityUpgrade(
      singularityData.expertPack,
      'expertPack'
    ),
    masterPack: new SingularityUpgrade(
      singularityData.masterPack,
      'masterPack'
    ),
    divinePack: new SingularityUpgrade(
      singularityData.divinePack,
      'divinePack'
    ),
    wowPass2: new SingularityUpgrade(singularityData.wowPass2, 'wowPass2'),
    potionBuff: new SingularityUpgrade(
      singularityData.potionBuff,
      'potionBuff'
    ),
    potionBuff2: new SingularityUpgrade(
      singularityData.potionBuff2,
      'potionBuff2'
    ),
    potionBuff3: new SingularityUpgrade(
      singularityData.potionBuff3,
      'potionBuff3'
    ),
    singChallengeExtension: new SingularityUpgrade(
      singularityData.singChallengeExtension,
      'singChallengeExtension'
    ),
    singChallengeExtension2: new SingularityUpgrade(
      singularityData.singChallengeExtension2,
      'singChallengeExtension2'
    ),
    singChallengeExtension3: new SingularityUpgrade(
      singularityData.singChallengeExtension3,
      'singChallengeExtension3'
    ),
    singQuarkImprover1: new SingularityUpgrade(
      singularityData.singQuarkImprover1,
      'singQuarkImprover1'
    ),
    singQuarkHepteract: new SingularityUpgrade(
      singularityData.singQuarkHepteract,
      'singQuarkHepteract'
    ),
    singQuarkHepteract2: new SingularityUpgrade(
      singularityData.singQuarkHepteract2,
      'singQuarkHepteract2'
    ),
    singQuarkHepteract3: new SingularityUpgrade(
      singularityData.singQuarkHepteract3,
      'singQuarkHepteract3'
    ),
    singOcteractGain: new SingularityUpgrade(
      singularityData.singOcteractGain,
      'singOcteractGain'
    ),
    singOcteractGain2: new SingularityUpgrade(
      singularityData.singOcteractGain2,
      'singOcteractGain2'
    ),
    singOcteractGain3: new SingularityUpgrade(
      singularityData.singOcteractGain3,
      'singOcteractGain3'
    ),
    singOcteractGain4: new SingularityUpgrade(
      singularityData.singOcteractGain4,
      'singOcteractGain4'
    ),
    singOcteractGain5: new SingularityUpgrade(
      singularityData.singOcteractGain5,
      'singOcteractGain5'
    ),
    wowPass3: new SingularityUpgrade(singularityData.wowPass3, 'wowPass3'),
    ultimatePen: new SingularityUpgrade(
      singularityData.ultimatePen,
      'ultimatePen'
    ),
    platonicTau: new SingularityUpgrade(
      singularityData.platonicTau,
      'platonicTau'
    ),
    platonicAlpha: new SingularityUpgrade(
      singularityData.platonicAlpha,
      'platonicAlpha'
    ),
    platonicDelta: new SingularityUpgrade(
      singularityData.platonicDelta,
      'platonicDelta'
    ),
    platonicPhi: new SingularityUpgrade(
      singularityData.platonicPhi,
      'platonicPhi'
    ),
    singFastForward: new SingularityUpgrade(
      singularityData.singFastForward,
      'singFastForward'
    ),
    singFastForward2: new SingularityUpgrade(
      singularityData.singFastForward2,
      'singFastForward2'
    ),
    singAscensionSpeed: new SingularityUpgrade(
      singularityData.singAscensionSpeed,
      'singAscensionSpeed'
    ),
    singAscensionSpeed2: new SingularityUpgrade(
      singularityData.singAscensionSpeed2,
      'singAscensionSpeed2'
    ),
    halfMind: new SingularityUpgrade(singularityData.halfMind, 'halfMind'),
    oneMind: new SingularityUpgrade(singularityData.oneMind, 'oneMind'),
    wowPass4: new SingularityUpgrade(singularityData.wowPass4, 'wowPass4'),
    offeringAutomatic: new SingularityUpgrade(
      singularityData.offeringAutomatic,
      'offeringAutomatic'
    ),
    blueberries: new SingularityUpgrade(
      singularityData.blueberries,
      'blueberries'
    ),
    singAmbrosiaLuck: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck,
      'singAmbrosiaLuck'
    ),
    singAmbrosiaLuck2: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck2,
      'singAmbrosiaLuck2'
    ),
    singAmbrosiaLuck3: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck3,
      'singAmbrosiaLuck3'
    ),
    singAmbrosiaLuck4: new SingularityUpgrade(
      singularityData.singAmbrosiaLuck4,
      'singAmbrosiaLuck4'
    ),
    singAmbrosiaGeneration: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration,
      'singAmbrosiaGeneration'
    ),
    singAmbrosiaGeneration2: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration2,
      'singAmbrosiaGeneration2'
    ),
    singAmbrosiaGeneration3: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration3,
      'singAmbrosiaGeneration3'
    ),
    singAmbrosiaGeneration4: new SingularityUpgrade(
      singularityData.singAmbrosiaGeneration4,
      'singAmbrosiaGeneration4'
    ),
    singInfiniteShopUpgrades: new SingularityUpgrade(
      singularityData.singInfiniteShopUpgrades,
      'singInfiniteShopUpgrades'
    )
  },

  octeractUpgrades: {
    octeractStarter: new OcteractUpgrade(
      octeractData.octeractStarter,
      'octeractStarter'
    ),
    octeractGain: new OcteractUpgrade(
      octeractData.octeractGain,
      'octeractGain'
    ),
    octeractGain2: new OcteractUpgrade(
      octeractData.octeractGain2,
      'octeractGain2'
    ),
    octeractQuarkGain: new OcteractUpgrade(
      octeractData.octeractQuarkGain,
      'octeractQuarkGain'
    ),
    octeractQuarkGain2: new OcteractUpgrade(
      octeractData.octeractQuarkGain2,
      'octeractQuarkGain2'
    ),
    octeractCorruption: new OcteractUpgrade(
      octeractData.octeractCorruption,
      'octeractCorruption'
    ),
    octeractGQCostReduce: new OcteractUpgrade(
      octeractData.octeractGQCostReduce,
      'octeractGQCostReduce'
    ),
    octeractExportQuarks: new OcteractUpgrade(
      octeractData.octeractExportQuarks,
      'octeractExportQuarks'
    ),
    octeractImprovedDaily: new OcteractUpgrade(
      octeractData.octeractImprovedDaily,
      'octeractImprovedDaily'
    ),
    octeractImprovedDaily2: new OcteractUpgrade(
      octeractData.octeractImprovedDaily2,
      'octeractImprovedDaily2'
    ),
    octeractImprovedDaily3: new OcteractUpgrade(
      octeractData.octeractImprovedDaily3,
      'octeractImprovedDaily3'
    ),
    octeractImprovedQuarkHept: new OcteractUpgrade(
      octeractData.octeractImprovedQuarkHept,
      'octeractImprovedQuarkHept'
    ),
    octeractImprovedGlobalSpeed: new OcteractUpgrade(
      octeractData.octeractImprovedGlobalSpeed,
      'octeractImprovedGlobalSpeed'
    ),
    octeractImprovedAscensionSpeed: new OcteractUpgrade(
      octeractData.octeractImprovedAscensionSpeed,
      'octeractImprovedAscensionSpeed'
    ),
    octeractImprovedAscensionSpeed2: new OcteractUpgrade(
      octeractData.octeractImprovedAscensionSpeed2,
      'octeractImprovedAscensionSpeed2'
    ),
    octeractImprovedFree: new OcteractUpgrade(
      octeractData.octeractImprovedFree,
      'octeractImprovedFree'
    ),
    octeractImprovedFree2: new OcteractUpgrade(
      octeractData.octeractImprovedFree2,
      'octeractImprovedFree2'
    ),
    octeractImprovedFree3: new OcteractUpgrade(
      octeractData.octeractImprovedFree3,
      'octeractImprovedFree3'
    ),
    octeractImprovedFree4: new OcteractUpgrade(
      octeractData.octeractImprovedFree4,
      'octeractImprovedFree4'
    ),
    octeractSingUpgradeCap: new OcteractUpgrade(
      octeractData.octeractSingUpgradeCap,
      'octeractSingUpgradeCap'
    ),
    octeractOfferings1: new OcteractUpgrade(
      octeractData.octeractOfferings1,
      'octeractOfferings1'
    ),
    octeractObtainium1: new OcteractUpgrade(
      octeractData.octeractObtainium1,
      'octeractObtainium1'
    ),
    octeractAscensions: new OcteractUpgrade(
      octeractData.octeractAscensions,
      'octeractAscensions'
    ),
    octeractAscensions2: new OcteractUpgrade(
      octeractData.octeractAscensions2,
      'octeractAscensions2'
    ),
    octeractAscensionsOcteractGain: new OcteractUpgrade(
      octeractData.octeractAscensionsOcteractGain,
      'octeractAscensionsOcteractGain'
    ),
    octeractFastForward: new OcteractUpgrade(
      octeractData.octeractFastForward,
      'octeractFastForward'
    ),
    octeractAutoPotionSpeed: new OcteractUpgrade(
      octeractData.octeractAutoPotionSpeed,
      'octeractAutoPotionSpeed'
    ),
    octeractAutoPotionEfficiency: new OcteractUpgrade(
      octeractData.octeractAutoPotionEfficiency,
      'octeractAutoPotionEfficiency'
    ),
    octeractOneMindImprover: new OcteractUpgrade(
      octeractData.octeractOneMindImprover,
      'octeractOneMindImprover'
    ),
    octeractAmbrosiaLuck: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck,
      'octeractAmbrosiaLuck'
    ),
    octeractAmbrosiaLuck2: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck2,
      'octeractAmbrosiaLuck2'
    ),
    octeractAmbrosiaLuck3: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck3,
      'octeractAmbrosiaLuck3'
    ),
    octeractAmbrosiaLuck4: new OcteractUpgrade(
      octeractData.octeractAmbrosiaLuck4,
      'octeractAmbrosiaLuck4'
    ),
    octeractAmbrosiaGeneration: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration,
      'octeractAmbrosiaGeneration'
    ),
    octeractAmbrosiaGeneration2: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration2,
      'octeractAmbrosiaGeneration2'
    ),
    octeractAmbrosiaGeneration3: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration3,
      'octeractAmbrosiaGeneration3'
    ),
    octeractAmbrosiaGeneration4: new OcteractUpgrade(
      octeractData.octeractAmbrosiaGeneration4,
      'octeractAmbrosiaGeneration4'
    ),
    octeractBonusTokens1: new OcteractUpgrade(
      octeractData.octeractBonusTokens1,
      'octeractBonusTokens1'
    ),
    octeractBonusTokens2: new OcteractUpgrade(
      octeractData.octeractBonusTokens2,
      'octeractBonusTokens2'
    ),
    octeractBonusTokens3: new OcteractUpgrade(
      octeractData.octeractBonusTokens3,
      'octeractBonusTokens3'
    ),
    octeractBonusTokens4: new OcteractUpgrade(
      octeractData.octeractBonusTokens4,
      'octeractBonusTokens4'
    ),
    octeractBlueberries: new OcteractUpgrade(
      octeractData.octeractBlueberries,
      'octeractBlueberries'
    ),
    octeractInfiniteShopUpgrades: new OcteractUpgrade(
      octeractData.octeractInfiniteShopUpgrades,
      'octeractInfiniteShopUpgrades'
    )
  },

  dailyCodeUsed: false,
  hepteractAutoCraftPercentage: 50,
  octeractTimer: 0,
  insideSingularityChallenge: false,

  singularityChallenges: {
    noSingularityUpgrades: new SingularityChallenge(
      singularityChallengeData.noSingularityUpgrades,
      'noSingularityUpgrades'
    ),
    oneChallengeCap: new SingularityChallenge(
      singularityChallengeData.oneChallengeCap,
      'oneChallengeCap'
    ),
    noOcteracts: new SingularityChallenge(
      singularityChallengeData.noOcteracts,
      'noOcteracts'
    ),
    limitedAscensions: new SingularityChallenge(
      singularityChallengeData.limitedAscensions,
      'limitedAscensions'
    ),
    noAmbrosiaUpgrades: new SingularityChallenge(
      singularityChallengeData.noAmbrosiaUpgrades,
      'noAmbrosiaUpgrades'
    ),
    limitedTime: new SingularityChallenge(
      singularityChallengeData.limitedTime,
      'limitedTime'
    ),
    sadisticPrequel: new SingularityChallenge(
      singularityChallengeData.sadisticPrequel,
      'sadisticPrequel'
    )
  },

  ambrosia: 0,
  lifetimeAmbrosia: 0,
  ambrosiaRNG: 0,
  blueberryTime: 0,
  visitedAmbrosiaSubtab: false,
  visitedAmbrosiaSubtabRed: false,
  spentBlueberries: 0,
  blueberryUpgrades: {
    ambrosiaTutorial: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaTutorial,
      'ambrosiaTutorial'
    ),
    ambrosiaQuarks1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarks1,
      'ambrosiaQuarks1'
    ),
    ambrosiaCubes1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubes1,
      'ambrosiaQuarks1'
    ),
    ambrosiaLuck1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuck1,
      'ambrosiaLuck1'
    ),
    ambrosiaCubeQuark1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubeQuark1,
      'ambrosiaCubeQuark1'
    ),
    ambrosiaLuckQuark1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuckQuark1,
      'ambrosiaLuckQuark1'
    ),
    ambrosiaLuckCube1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuckCube1,
      'ambrosiaLuckCube1'
    ),
    ambrosiaQuarkCube1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarkCube1,
      'ambrosiaQuarkCube1'
    ),
    ambrosiaCubeLuck1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubeLuck1,
      'ambrosiaCubeLuck1'
    ),
    ambrosiaQuarkLuck1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarkLuck1,
      'ambrosiaQuarkLuck1'
    ),
    ambrosiaQuarks2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarks2,
      'ambrosiaQuarks2'
    ),
    ambrosiaCubes2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubes2,
      'ambrosiaQuarks2'
    ),
    ambrosiaLuck2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuck2,
      'ambrosiaLuck2'
    ),
    ambrosiaQuarks3: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaQuarks3,
      'ambrosiaQuarks3'
    ),
    ambrosiaCubes3: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaCubes3,
      'ambrosiaQuarks3'
    ),
    ambrosiaLuck3: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaLuck3,
      'ambrosiaLuck3'
    ),
    ambrosiaPatreon: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaPatreon,
      'ambrosiaPatreon'
    ),
    ambrosiaObtainium1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaObtainium1,
      'ambrosiaObtainium1'
    ),
    ambrosiaOffering1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaOffering1,
      'ambrosiaOffering1'
    ),
    ambrosiaHyperflux: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaHyperflux,
      'ambrosiaHyperflux'
    ),
    ambrosiaBaseObtainium1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaBaseObtainium1,
      'ambrosiaBaseObtainium1'
    ),
    ambrosiaBaseOffering1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaBaseOffering1,
      'ambrosiaBaseOffering1'
    ),
    ambrosiaBaseObtainium2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaBaseObtainium2,
      'ambrosiaBaseObtainium2'
    ),
    ambrosiaBaseOffering2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaBaseOffering2,
      'ambrosiaBaseOffering2'
    ),
    ambrosiaSingReduction1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaSingReduction1,
      'ambrosiaSingReduction1'
    ),
    ambrosiaInfiniteShopUpgrades1: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaInfiniteShopUpgrades1,
      'ambrosiaInfiniteShopUpgrades'
    ),
    ambrosiaInfiniteShopUpgrades2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaInfiniteShopUpgrades2,
      'ambrosiaInfiniteShopUpgrades2'
    ),
    ambrosiaSingReduction2: new BlueberryUpgrade(
      blueberryUpgradeData.ambrosiaSingReduction2,
      'ambrosiaSingReduction2'
    )
  },

  blueberryLoadouts: {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {},
    9: {},
    10: {},
    11: {},
    12: {},
    13: {},
    14: {},
    15: {},
    16: {}
  },
  blueberryLoadoutMode: 'saveTree',

  redAmbrosia: 0,
  lifetimeRedAmbrosia: 0,
  redAmbrosiaTime: 0,
  // NOTE: This only keeps track of the total number of Red Ambrosia
  // Invested, because I realized that keeping classes on the player is generally a bad idea
  redAmbrosiaUpgrades: {
    'tutorial': 0,
    'conversionImprovement1': 0,
    'conversionImprovement2': 0,
    'conversionImprovement3': 0,
    'freeTutorialLevels': 0,
    'freeLevelsRow2': 0,
    'freeLevelsRow3': 0,
    'freeLevelsRow4': 0,
    'freeLevelsRow5': 0,
    'blueberryGenerationSpeed': 0,
    'blueberryGenerationSpeed2': 0,
    'regularLuck': 0,
    'regularLuck2': 0,
    'redGenerationSpeed': 0,
    'redLuck': 0,
    'redAmbrosiaCube': 0,
    'redAmbrosiaObtainium': 0,
    'redAmbrosiaOffering': 0,
    'redAmbrosiaCubeImprover': 0,
    'viscount': 0,
    'infiniteShopUpgrades': 0,
    'redAmbrosiaAccelerator': 0
  },

  singChallengeTimer: 0,

  lastExportedSave: 0,

  seed: Array.from({ length: 3 }, () => Date.now())
}

export const deepClone = () =>
  rfdc({
    proto: false,
    circles: false,
    constructorHandlers: [
      [Decimal, (o: DecimalSource) => new Decimal(o)],
      [QuarkHandler, (o: QuarkHandler) => new QuarkHandler(o.valueOf())],
      [WowCubes, (o: WowCubes) => new WowCubes(o.valueOf())],
      [WowTesseracts, (o: WowTesseracts) => new WowTesseracts(o.valueOf())],
      [WowHypercubes, (o: WowHypercubes) => new WowHypercubes(o.valueOf())],
      [WowPlatonicCubes, (o: WowPlatonicCubes) => new WowPlatonicCubes(o.valueOf())],
      [HepteractCraft, (o: HepteractCraft) => new HepteractCraft(o.valueOf())],
      [CorruptionLoadout, (o: CorruptionLoadout) => new CorruptionLoadout(o.loadout)],
      [CorruptionSaves, (o: CorruptionSaves) => new CorruptionSaves(o.corrSaveData)],
      [CampaignManager, (o: CampaignManager) => new CampaignManager(o.campaignManagerData)],
      [SingularityUpgrade, (o: SingularityUpgrade) => new SingularityUpgrade(o.valueOf(), o.key())],
      [OcteractUpgrade, (o: OcteractUpgrade) => new OcteractUpgrade(o.valueOf(), o.key())],
      [SingularityChallenge, (o: SingularityChallenge) => new SingularityChallenge(o.valueOf(), o.key())],
      [BlueberryUpgrade, (o: BlueberryUpgrade) => new BlueberryUpgrade(o.valueOf(), o.key())]
    ]
  })

export const blankSave = deepClone()(player)

export const saveSynergy = (button?: boolean) => {
  player.offlinetick = Date.now()
  player.loaded1009 = true
  player.loaded1009hotfix1 = true

  const p = playerJsonSchema.parse(player)
  const save = btoa(JSON.stringify(p))
  if (save !== null) {
    localStorage.setItem('Synergysave2', save)
  } else {
    void Alert(i18next.t('testing.errorSaving'))
    return false
  }

  if (button) {
    const el = DOMCacheGetOrSet('saveinfo')
    el.textContent = i18next.t('testing.gameSaved')
    setTimeout(() => (el.textContent = ''), 4000)
  }

  return true
}

const loadSynergy = () => {
  const saveString = localStorage.getItem('Synergysave2')
  const data = saveString ? JSON.parse(atob(saveString)) : null

  if (testing || !prod) {
    Object.defineProperties(window, {
      player: { value: player },
      G: { value: G },
      Decimal: { value: Decimal },
      i18n: { value: i18next }
    })

    if (data && testing) {
      data.exporttest = false
    }
  }

  Object.assign(G, { ...blankGlobals })

  if (data) {
    if ((data.exporttest === false || data.exporttest === 'NO!') && !testing) {
      return Alert(i18next.t('testing.saveInLive2'))
    }

    // size before loading
    const size = player.codes.size

    const oldPromoKeys = Object.keys(data).filter((k) => k.includes('offerpromo'))
    if (oldPromoKeys.length > 0) {
      oldPromoKeys.forEach((k) => {
        const value = data[k]
        const num = +k.replace(/[^\d]/g, '')
        player.codes.set(num, Boolean(value))
      })
    }

    const validatedPlayer = playerUpdateVarSchema.safeParse(data)

    if (validatedPlayer.success) {
      Object.assign(player, validatedPlayer.data)
    } else {
      console.log(validatedPlayer.error)
      console.log(data)
      clearTimers()
      return
    }

    player.lastExportedSave = data.lastExportedSave ?? 0

    if (data.offerpromo24used !== undefined) {
      player.codes.set(25, false)
    }

    // sets all non-existent codes to default value false
    if (player.codes.size < size) {
      for (let i = player.codes.size + 1; i <= size; i++) {
        if (!player.codes.has(i)) {
          player.codes.set(i, false)
        }
      }
    }

    // sets all non-existent codes to default value false
    if (player.codes.size < size) {
      for (let i = player.codes.size + 1; i <= size; i++) {
        if (!player.codes.has(i)) {
          player.codes.set(i, false)
        }
      }
    }

    // TODO(@KhafraDev): remove G.currentSingChallenge
    // fix current sing challenge blank
    if (player.insideSingularityChallenge) {
      const challenges = Object.keys(player.singularityChallenges)
      for (let i = 0; i < challenges.length; i++) {
        if (player.singularityChallenges[challenges[i]].enabled) {
          G.currentSingChallenge = singularityChallengeData[challenges[i]].HTMLTag
          break
        }
      }
    }

    if (!('rngCode' in data)) {
      player.rngCode = 0
    }

    if (data.loaded1009 === undefined || !data.loaded1009) {
      player.loaded1009 = false
    }
    if (data.loaded1009hotfix1 === undefined || !data.loaded1009hotfix1) {
      player.loaded1009hotfix1 = false
    }
    if (data.loaded10091 === undefined) {
      player.loaded10091 = false
    }
    if (data.loaded1010 === undefined) {
      player.loaded1010 = false
    }
    if (data.loaded10101 === undefined) {
      player.loaded10101 = false
    }

    if (typeof player.researches[76] === 'undefined') {
      player.codes.set(13, false)
      player.researches.push(
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      )
      player.achievements.push(
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      )
      player.maxofferings = player.runeshards
      player.maxobtainium = player.researchPoints
      player.researchPoints += 51200 * player.researches[50]
      player.researches[50] = 0
    }

    player.maxofferings = player.maxofferings || 0
    player.maxobtainium = player.maxobtainium || 0
    player.runeshards = player.runeshards || 0
    player.researchPoints = player.researchPoints || 0

    if (
      !data.loaded1009
      || data.loaded1009hotfix1 === null
      || data.shopUpgrades?.offeringPotion === undefined
    ) {
      player.firstOwnedParticles = new Decimal('0')
      player.secondOwnedParticles = new Decimal('0')
      player.thirdOwnedParticles = new Decimal('0')
      player.fourthOwnedParticles = new Decimal('0')
      player.fifthOwnedParticles = new Decimal('0')
      player.firstCostParticles = new Decimal('1')
      player.secondCostParticles = new Decimal('1e2')
      player.thirdCostParticles = new Decimal('1e4')
      player.fourthCostParticles = new Decimal('1e8')
      player.fifthCostParticles = new Decimal('1e16')
      player.autoSacrificeToggle = false
      player.autoResearchToggle = false
      player.autoResearchMode = 'manual'
      player.autoResearch = 0
      player.autoSacrifice = 0
      player.sacrificeTimer = 0
      player.loaded1009 = true
      player.codes.set(18, false)
    }
    if (!data.loaded1009hotfix1) {
      player.loaded1009hotfix1 = true
      player.codes.set(19, true)
      player.firstOwnedParticles = new Decimal('0')
      player.secondOwnedParticles = new Decimal('0')
      player.thirdOwnedParticles = new Decimal('0')
      player.fourthOwnedParticles = new Decimal('0')
      player.fifthOwnedParticles = new Decimal('0')
      player.firstCostParticles = new Decimal('1')
      player.secondCostParticles = new Decimal('1e2')
      player.thirdCostParticles = new Decimal('1e4')
      player.fourthCostParticles = new Decimal('1e8')
      player.fifthCostParticles = new Decimal('1e16')
    }
    if (
      data.loaded10091 === undefined
      || !data.loaded10091
      || player.researches[86] > 100
      || player.researches[87] > 100
      || player.researches[88] > 100
      || player.researches[89] > 100
      || player.researches[90] > 10
    ) {
      player.loaded10091 = true
      player.researchPoints += 7.5e8 * player.researches[82]
      player.researchPoints += 2e8 * player.researches[83]
      player.researchPoints += 4.5e9 * player.researches[84]
      player.researchPoints += 2.5e7 * player.researches[86]
      player.researchPoints += 7.5e7 * player.researches[87]
      player.researchPoints += 3e8 * player.researches[88]
      player.researchPoints += 1e9 * player.researches[89]
      player.researchPoints += 2.5e7 * player.researches[90]
      player.researchPoints += 1e8 * player.researches[91]
      player.researchPoints += 2e9 * player.researches[92]
      player.researchPoints += 9e9 * player.researches[93]
      player.researchPoints += 7.25e10 * player.researches[94]
      player.researches[86] = 0
      player.researches[87] = 0
      player.researches[88] = 0
      player.researches[89] = 0
      player.researches[90] = 0
      player.researches[91] = 0
      player.researches[92] = 0
    }

    // const shop = data.shopUpgrades as LegacyShopUpgrades & Player['shopUpgrades'];
    if (
      data.achievements?.[169] === undefined
      || typeof player.achievements[169] === 'undefined'
      //    (shop.antSpeed === undefined && shop.antSpeedLevel === undefined) ||
      //    (shop.antSpeed === undefined && typeof shop.antSpeedLevel === 'undefined') ||
      || data.loaded1010 === undefined
      || data.loaded1010 === false
    ) {
      player.loaded1010 = true
      player.codes.set(21, false)

      player.firstOwnedAnts = 0
      player.firstGeneratedAnts = new Decimal('0')
      player.firstCostAnts = new Decimal('1e700')
      player.firstProduceAnts = 0.0001

      player.secondOwnedAnts = 0
      player.secondGeneratedAnts = new Decimal('0')
      player.secondCostAnts = new Decimal('3')
      player.secondProduceAnts = 0.00005

      player.thirdOwnedAnts = 0
      player.thirdGeneratedAnts = new Decimal('0')
      player.thirdCostAnts = new Decimal('100')
      player.thirdProduceAnts = 0.00002

      player.fourthOwnedAnts = 0
      player.fourthGeneratedAnts = new Decimal('0')
      player.fourthCostAnts = new Decimal('1e4')
      player.fourthProduceAnts = 0.00001

      player.fifthOwnedAnts = 0
      player.fifthGeneratedAnts = new Decimal('0')
      player.fifthCostAnts = new Decimal('1e12')
      player.fifthProduceAnts = 0.000005

      player.sixthOwnedAnts = 0
      player.sixthGeneratedAnts = new Decimal('0')
      player.sixthCostAnts = new Decimal('1e36')
      player.sixthProduceAnts = 0.000002

      player.seventhOwnedAnts = 0
      player.seventhGeneratedAnts = new Decimal('0')
      player.seventhCostAnts = new Decimal('1e100')
      player.seventhProduceAnts = 0.000001

      player.eighthOwnedAnts = 0
      player.eighthGeneratedAnts = new Decimal('0')
      player.eighthCostAnts = new Decimal('1e300')
      player.eighthProduceAnts = 0.00000001

      player.achievements.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
      player.antPoints = new Decimal('1')

      player.upgrades[38] = 0
      player.upgrades[39] = 0
      player.upgrades[40] = 0

      player.upgrades[76] = 0
      player.upgrades[77] = 0
      player.upgrades[78] = 0
      player.upgrades[79] = 0
      player.upgrades[80] = 0

      //    player.shopUpgrades.antSpeed = 0;
      //    player.shopUpgrades.shopTalisman = 0;

      player.antUpgrades = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

      player.unlocks.rrow4 = false
      player.researchPoints += 3e7 * player.researches[50]
      player.researchPoints += 2e9 * player.researches[96]
      player.researchPoints += 5e9 * player.researches[97]
      player.researchPoints += 3e10 * player.researches[98]
      player.researches[50] = 0
      player.researches[96] = 0
      player.researches[97] = 0
      player.researches[98] = 0
      player.researches.push(
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      )

      player.talismanLevels = [0, 0, 0, 0, 0, 0, 0]
      player.talismanRarity = [1, 1, 1, 1, 1, 1, 1]

      player.talismanShards = 0
      player.commonFragments = 0
      player.uncommonFragments = 0
      player.rareFragments = 0
      player.epicFragments = 0
      player.legendaryFragments = 0
      player.mythicalFragments = 0
      player.buyTalismanShardPercent = 10

      player.talismanOne = [null, -1, 1, 1, 1, -1]
      player.talismanTwo = [null, 1, 1, -1, -1, 1]
      player.talismanThree = [null, 1, -1, 1, 1, -1]
      player.talismanFour = [null, -1, -1, 1, 1, 1]
      player.talismanFive = [null, 1, 1, -1, -1, 1]
      player.talismanSix = [null, 1, 1, 1, -1, -1]
      player.talismanSeven = [null, -1, 1, -1, 1, 1]

      player.antSacrificePoints = 0
      player.antSacrificeTimer = 0

      player.obtainiumpersecond = 0
      player.maxobtainiumpersecond = 0
    }

    if (data.loaded10101 === undefined || data.loaded10101 === false) {
      player.loaded10101 = true

      // dprint-ignore
      const refundThese = [
        0, 31, 32, 61, 62, 63, 64, 76, 77, 78, 79, 80, 81, 98, 104, 105, 106,
        107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
        121, 122, 123, 125,
      ];
      // dprint-ignore
      const refundReward = [
        0, 2, 20, 5, 10, 80, 5e3, 1e7, 1e7, 2e7, 3e7, 4e7, 2e8, 3e10, 1e11,
        1e12, 2e11, 1e12, 2e10, 2e11, 1e12, 2e13, 5e13, 1e14, 2e14, 5e14, 1e15,
        2e15, 1e16, 1e15, 1e16, 1e14, 1e15, 1e15, 1e20,
      ];
      for (let i = 1; i < refundThese.length; i++) {
        player.researchPoints += player.researches[refundThese[i]] * refundReward[i]
        player.researches[refundThese[i]] = 0
      }
      player.autoAntSacrifice = false
      player.antMax = false
    }

    if (player.firstOwnedAnts < 1 && player.firstCostAnts.gte('1e1200')) {
      player.firstCostAnts = new Decimal('1e700')
      player.firstOwnedAnts = 0
    }

    // checkVariablesOnLoad(data)

    if (player.ascensionCount === 0) {
      if (player.prestigeCount > 0) {
        player.ascensionCounter = 86400 * 90
      }
      /*player.cubeUpgrades = [null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];*/

      if (player.singularityCount === 0) {
        player.cubeUpgrades = [...blankSave.cubeUpgrades]
      }
      player.wowCubes = new WowCubes(0)
      player.wowTesseracts = new WowTesseracts(0)
      player.wowHypercubes = new WowHypercubes(0)
      player.wowPlatonicCubes = new WowPlatonicCubes(0)
      player.cubeBlessings = {
        accelerator: 0,
        multiplier: 0,
        offering: 0,
        runeExp: 0,
        obtainium: 0,
        antSpeed: 0,
        antSacrifice: 0,
        antELO: 0,
        talismanBonus: 0,
        globalSpeed: 0
      }
    }

    if (player.transcendCount < 0) {
      player.transcendCount = 0
    }
    if (player.reincarnationCount < 0) {
      player.reincarnationCount = 0
    }
    if (player.runeshards < 0) {
      player.runeshards = 0
    }
    if (player.researchPoints < 0) {
      player.researchPoints = 0
    }

    if (player.resettoggle1 === 0) {
      player.resettoggle1 = 1
      player.resettoggle2 = 1
      player.resettoggle3 = 1
      player.resettoggle4 = 1
    }
    if (player.tesseractAutoBuyerToggle === 0) {
      player.tesseractAutoBuyerToggle = 1
    }
    if (player.reincarnationCount < 0.5 && player.unlocks.rrow4) {
      player.unlocks = {
        coinone: false,
        cointwo: false,
        cointhree: false,
        coinfour: false,
        prestige: false,
        generation: false,
        transcend: false,
        reincarnate: false,
        rrow1: false,
        rrow2: false,
        rrow3: false,
        rrow4: false
      }
    }

    if (!Number.isInteger(player.ascendBuilding1.cost)) {
      player.ascendBuilding1.cost = 1
      player.ascendBuilding1.owned = 0
      player.ascendBuilding2.cost = 10
      player.ascendBuilding2.owned = 0
      player.ascendBuilding3.cost = 100
      player.ascendBuilding3.owned = 0
      player.ascendBuilding4.cost = 1000
      player.ascendBuilding4.owned = 0
      player.ascendBuilding5.cost = 10000
      player.ascendBuilding5.owned = 0
    }

    if (!player.dayCheck) {
      player.dayCheck = new Date()
    }
    if (typeof player.dayCheck === 'string') {
      player.dayCheck = new Date(player.dayCheck)
      if (isNaN(player.dayCheck.getTime())) {
        player.dayCheck = new Date()
      }
    }
    // Measures for people who play the past
    let updatedLast = lastUpdated
    if (!isNaN(updatedLast.getTime())) {
      updatedLast = new Date(
        updatedLast.getFullYear(),
        updatedLast.getMonth(),
        updatedLast.getDate() - 1
      )
      if (player.dayCheck.getTime() < updatedLast.getTime()) {
        player.dayCheck = updatedLast
      }
    } else if (player.dayCheck.getTime() < 1654009200000) {
      player.dayCheck = new Date('06/01/2022 00:00:00')
    }
    // Calculate daily
    player.dayCheck = new Date(
      player.dayCheck.getFullYear(),
      player.dayCheck.getMonth(),
      player.dayCheck.getDate()
    )

    player.corruptions.used = new CorruptionLoadout(player.corruptions.used.loadout)
    // This is needed to fix saves that had issues with not resetting corruption at the singularity
    player.corruptions.used.setCorruptionLevelsWithChallengeRequirement(player.corruptions.used.loadout)

    for (let i = 1; i <= 5; i++) {
      const ascendBuildingI = `ascendBuilding${i as OneToFive}` as const
      player[ascendBuildingI].generated = new Decimal(
        player[ascendBuildingI].generated
      )
    }

    while (typeof player.achievements[252] === 'undefined') {
      player.achievements.push(0)
    }
    while (typeof player.researches[200] === 'undefined') {
      player.researches.push(0)
    }
    while (typeof player.upgrades[140] === 'undefined') {
      player.upgrades.push(0)
    }

    if (
      player.saveString === ''
      || player.saveString === 'Synergism-v1011Test.txt'
    ) {
      player.saveString = player.singularityCount === 0
        ? 'Synergism-$VERSION$-$TIME$.txt'
        : 'Synergism-$VERSION$-$TIME$-$SING$.txt'
    }
    ;(DOMCacheGetOrSet('saveStringInput') as HTMLInputElement).value = cleanString(player.saveString)

    for (let j = 1; j < 126; j++) {
      upgradeupdate(j, true)
    }

    for (let j = 1; j <= 200; j++) {
      updateResearchBG(j)
    }
    for (let j = 1; j < player.cubeUpgrades.length; j++) {
      updateCubeUpgradeBG(j)
    }
    const platUpg = document.querySelectorAll('button[id^="platUpg"]')
    for (let j = 1; j <= platUpg.length; j++) {
      updatePlatonicUpgradeBG(j)
    }

    const q = [
      'coin',
      'crystal',
      'mythos',
      'particle',
      'offering',
      'tesseract'
    ] as const
    if (
      player.coinbuyamount !== 1
      && player.coinbuyamount !== 10
      && player.coinbuyamount !== 100
      && player.coinbuyamount !== 1000
    ) {
      player.coinbuyamount = 1
    }
    if (
      player.crystalbuyamount !== 1
      && player.crystalbuyamount !== 10
      && player.crystalbuyamount !== 100
      && player.crystalbuyamount !== 1000
    ) {
      player.crystalbuyamount = 1
    }
    if (
      player.mythosbuyamount !== 1
      && player.mythosbuyamount !== 10
      && player.mythosbuyamount !== 100
      && player.mythosbuyamount !== 1000
    ) {
      player.mythosbuyamount = 1
    }
    if (
      player.particlebuyamount !== 1
      && player.particlebuyamount !== 10
      && player.particlebuyamount !== 100
      && player.particlebuyamount !== 1000
    ) {
      player.particlebuyamount = 1
    }
    if (
      player.offeringbuyamount !== 1
      && player.offeringbuyamount !== 10
      && player.offeringbuyamount !== 100
      && player.offeringbuyamount !== 1000
    ) {
      player.offeringbuyamount = 1
    }
    if (
      player.tesseractbuyamount !== 1
      && player.tesseractbuyamount !== 10
      && player.tesseractbuyamount !== 100
      && player.tesseractbuyamount !== 1000
    ) {
      player.tesseractbuyamount = 1
    }
    for (let j = 0; j <= 5; j++) {
      for (let k = 0; k < 4; k++) {
        let d = ''
        if (k === 0) {
          d = 'one'
        }
        if (k === 1) {
          d = 'ten'
        }
        if (k === 2) {
          d = 'hundred'
        }
        if (k === 3) {
          d = 'thousand'
        }
        const e = `${q[j]}${d}`
        DOMCacheGetOrSet(e).style.backgroundColor = ''
      }
      let c = ''
      const curBuyAmount = player[`${q[j]}buyamount` as const]
      if (curBuyAmount === 1) {
        c = 'one'
      }
      if (curBuyAmount === 10) {
        c = 'ten'
      }
      if (curBuyAmount === 100) {
        c = 'hundred'
      }
      if (curBuyAmount === 1000) {
        c = 'thousand'
      }

      const b = `${q[j]}${c}`
      DOMCacheGetOrSet(b).style.backgroundColor = 'green'
    }

    const testArray = []
    // Creates a copy of research costs array
    for (let i = 0; i < G.researchBaseCosts.length; i++) {
      testArray.push(G.researchBaseCosts[i])
    }
    // Sorts the above array, and returns the index order of sorted array
    G.researchOrderByCost = sortWithIndices(testArray)
    player.roombaResearchIndex = 0

    // June 09, 2021: Updated toggleShops() and removed boilerplate - Platonic
    toggleShops()
    getChallengeConditions()
    updateChallengeDisplay()
    revealStuff()
    toggleauto()

    // Challenge summary should be displayed
    if (player.currentChallenge.transcension > 0) {
      challengeDisplay(player.currentChallenge.transcension)
    } else if (player.currentChallenge.reincarnation > 0) {
      challengeDisplay(player.currentChallenge.reincarnation)
    } else if (player.currentChallenge.ascension > 0) {
      challengeDisplay(player.currentChallenge.ascension)
    } else {
      challengeDisplay(1)
    }

    corruptionStatsUpdate()
    updateUndefinedLoadouts() // Monetization update added more corruption loadout slots
    updateBlueberryLoadoutCount() // Monetization update also added more Blueberry loadout slots

    const corrs = 1 + 8 + PCoinUpgradeEffects.CORRUPTION_LOADOUT_SLOT_QOL
    // const corrs = Math.min(8, Object.keys(player.corruptionLoadouts).length) + 1
    for (let i = 0; i < corrs; i++) {
      corruptionLoadoutTableUpdate(true, i)
      corruptionLoadoutTableUpdate(false, i)
    }

    showCorruptionStatsLoadouts()
    updateCorruptionLoadoutNames()

    // For blueberry upgrades!
    displayProperLoadoutCount()

    DOMCacheGetOrSet('researchrunebonus').textContent = i18next.t(
      'runes.thanksResearches',
      {
        percent: format(100 * G.effectiveLevelMult - 100, 4, true)
      }
    )

    DOMCacheGetOrSet('talismanlevelup').style.display = 'none'
    DOMCacheGetOrSet('talismanrespec').style.display = 'none'

    DOMCacheGetOrSet('antSacrificeSummary').style.display = 'none'

    // This must be initialized at the beginning of the calculation
    c15RewardUpdate()

    calculatePlatonicBlessings()
    calculateHypercubeBlessings()
    calculateTesseractBlessings()
    calculateCubeBlessings()
    updateTalismanAppearance(0)
    updateTalismanAppearance(1)
    updateTalismanAppearance(2)
    updateTalismanAppearance(3)
    updateTalismanAppearance(4)
    updateTalismanAppearance(5)
    updateTalismanAppearance(6)
    for (const id in player.ascStatToggles) {
      toggleAscStatPerSecond(+id) // toggle each stat twice to make sure the displays are correct and match what they used to be
      toggleAscStatPerSecond(+id)
    }

    // Strictly check the input and data with values other than numbers
    const omit = /e\+/
    let inputd = player.autoChallengeTimer.start
    let inpute = Number(
      (DOMCacheGetOrSet('startAutoChallengeTimerInput') as HTMLInputElement)
        .value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(
        DOMCacheGetOrSet('startAutoChallengeTimerInput') as HTMLInputElement
      ).value = `${player.autoChallengeTimer.start || blankSave.autoChallengeTimer.start}`.replace(omit, 'e')
      updateAutoChallenge(1)
    }

    DOMCacheGetOrSet('startTimerValue').innerHTML = i18next.t(
      'challenges.timeStartSweep',
      {
        time: format(player.autoChallengeTimer.start, 2, true)
      }
    )

    inputd = player.autoChallengeTimer.exit
    inpute = Number(
      (DOMCacheGetOrSet('exitAutoChallengeTimerInput') as HTMLInputElement)
        .value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(
        DOMCacheGetOrSet('exitAutoChallengeTimerInput') as HTMLInputElement
      ).value = `${player.autoChallengeTimer.exit || blankSave.autoChallengeTimer.exit}`.replace(omit, 'e')
      updateAutoChallenge(2)
    }

    DOMCacheGetOrSet('exitTimerValue').innerHTML = i18next.t(
      'challenges.timeExitChallenge',
      {
        time: format(player.autoChallengeTimer.exit, 2, true)
      }
    )

    inputd = player.autoChallengeTimer.enter
    inpute = Number(
      (DOMCacheGetOrSet('enterAutoChallengeTimerInput') as HTMLInputElement)
        .value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(
        DOMCacheGetOrSet('enterAutoChallengeTimerInput') as HTMLInputElement
      ).value = `${player.autoChallengeTimer.enter || blankSave.autoChallengeTimer.enter}`.replace(omit, 'e')
      updateAutoChallenge(3)
    }

    DOMCacheGetOrSet('enterTimerValue').innerHTML = i18next.t(
      'challenges.timeEnterChallenge',
      {
        time: format(player.autoChallengeTimer.enter, 2, true)
      }
    )

    inputd = player.prestigeamount
    inpute = Number(
      (DOMCacheGetOrSet('prestigeamount') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('prestigeamount') as HTMLInputElement).value = `${
        player.prestigeamount || blankSave.prestigeamount
      }`.replace(omit, 'e')
      updateAutoReset(1)
    }
    inputd = player.transcendamount
    inpute = Number(
      (DOMCacheGetOrSet('transcendamount') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('transcendamount') as HTMLInputElement).value = `${
        player.transcendamount || blankSave.transcendamount
      }`.replace(omit, 'e')
      updateAutoReset(2)
    }
    inputd = player.reincarnationamount
    inpute = Number(
      (DOMCacheGetOrSet('reincarnationamount') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('reincarnationamount') as HTMLInputElement).value = `${
        player.reincarnationamount || blankSave.reincarnationamount
      }`.replace(omit, 'e')
      updateAutoReset(3)
    }
    inputd = player.autoAscendThreshold
    inpute = Number(
      (DOMCacheGetOrSet('ascensionAmount') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('ascensionAmount') as HTMLInputElement).value = `${
        player.autoAscendThreshold || blankSave.autoAscendThreshold
      }`.replace(omit, 'e')
      updateAutoReset(4)
    }
    inputd = player.autoAntSacTimer
    inpute = Number(
      (DOMCacheGetOrSet('autoAntSacrificeAmount') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('autoAntSacrificeAmount') as HTMLInputElement).value = `${
        player.autoAntSacTimer || blankSave.autoAntSacTimer
      }`.replace(
        omit,
        'e'
      )
      updateAutoReset(5)
    }
    inputd = player.tesseractAutoBuyerAmount
    inpute = Number(
      (DOMCacheGetOrSet('tesseractAmount') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('tesseractAmount') as HTMLInputElement).value = `${
        player.tesseractAutoBuyerAmount || blankSave.tesseractAutoBuyerAmount
      }`.replace(omit, 'e')
      updateTesseractAutoBuyAmount()
    }
    inputd = player.openCubes
    inpute = Number(
      (DOMCacheGetOrSet('cubeOpensInput') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('cubeOpensInput') as HTMLInputElement).value = `${player.openCubes || blankSave.openCubes}`
        .replace(omit, 'e')
      updateAutoCubesOpens(1)
    }
    inputd = player.openTesseracts
    inpute = Number(
      (DOMCacheGetOrSet('tesseractsOpensInput') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('tesseractsOpensInput') as HTMLInputElement).value = `${
        player.openTesseracts || blankSave.openTesseracts
      }`.replace(omit, 'e')
      updateAutoCubesOpens(2)
    }
    inputd = player.openHypercubes
    inpute = Number(
      (DOMCacheGetOrSet('hypercubesOpensInput') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('hypercubesOpensInput') as HTMLInputElement).value = `${
        player.openHypercubes || blankSave.openHypercubes
      }`.replace(omit, 'e')
      updateAutoCubesOpens(3)
    }
    inputd = player.openPlatonicsCubes
    inpute = Number(
      (DOMCacheGetOrSet('platonicCubeOpensInput') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('platonicCubeOpensInput') as HTMLInputElement).value = `${
        player.openPlatonicsCubes || blankSave.openPlatonicsCubes
      }`.replace(
        omit,
        'e'
      )
      updateAutoCubesOpens(4)
    }
    inputd = player.runeBlessingBuyAmount
    inpute = Number(
      (DOMCacheGetOrSet('buyRuneBlessingInput') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('buyRuneBlessingInput') as HTMLInputElement).value = `${
        player.runeBlessingBuyAmount || blankSave.runeBlessingBuyAmount
      }`.replace(omit, 'e')
      updateRuneBlessingBuyAmount(1)
    }

    DOMCacheGetOrSet('buyRuneBlessingToggle').innerHTML = i18next.t(
      'runes.blessings.buyUpTo',
      {
        amount: format(player.runeBlessingBuyAmount)
      }
    )

    inputd = player.runeSpiritBuyAmount
    inpute = Number(
      (DOMCacheGetOrSet('buyRuneSpiritInput') as HTMLInputElement).value
    )
    if (inpute !== inputd || isNaN(inpute + inputd)) {
      ;(DOMCacheGetOrSet('buyRuneSpiritInput') as HTMLInputElement).value = `${
        player.runeSpiritBuyAmount || blankSave.runeSpiritBuyAmount
      }`.replace(omit, 'e')
      updateRuneBlessingBuyAmount(2)
    }
    DOMCacheGetOrSet('buyRuneSpiritToggleValue').innerHTML = i18next.t(
      'runes.spirits.buyUpTo',
      {
        amount: format(player.runeSpiritBuyAmount, 0, true)
      }
    )

    if (player.resettoggle1 === 1) {
      DOMCacheGetOrSet('prestigeautotoggle').textContent = i18next.t('toggles.modeAmount')
    }
    if (player.resettoggle2 === 1) {
      DOMCacheGetOrSet('transcendautotoggle').textContent = i18next.t('toggles.modeAmount')
    }
    if (player.resettoggle3 === 1) {
      DOMCacheGetOrSet('reincarnateautotoggle').textContent = i18next.t('toggles.modeAmount')
    }
    if (player.resettoggle4 === 1) {
      DOMCacheGetOrSet('tesseractautobuymode').textContent = i18next.t('toggles.modeAmount')
    }

    if (player.resettoggle1 === 2) {
      DOMCacheGetOrSet('prestigeautotoggle').textContent = i18next.t('toggles.modeTime')
    }
    if (player.resettoggle2 === 2) {
      DOMCacheGetOrSet('transcendautotoggle').textContent = i18next.t('toggles.modeTime')
    }
    if (player.resettoggle3 === 2) {
      DOMCacheGetOrSet('reincarnateautotoggle').textContent = i18next.t('toggles.modeTime')
    }
    if (player.resettoggle4 === 2) {
      DOMCacheGetOrSet('tesseractautobuymode').textContent = i18next.t(
        'toggles.modePercentage'
      )
    }

    if (player.tesseractAutoBuyerToggle === 1) {
      DOMCacheGetOrSet('tesseractautobuytoggle').textContent = i18next.t(
        'runes.talismans.autoBuyOn'
      )
      DOMCacheGetOrSet('tesseractautobuytoggle').style.border = '2px solid green'
    }
    if (player.tesseractAutoBuyerToggle === 2) {
      DOMCacheGetOrSet('tesseractautobuytoggle').textContent = i18next.t(
        'runes.talismans.autoBuyOff'
      )
      DOMCacheGetOrSet('tesseractautobuytoggle').style.border = '2px solid red'
    }

    if (player.autoOpenCubes) {
      DOMCacheGetOrSet('openCubes').textContent = i18next.t('wowCubes.autoOn', {
        percent: format(player.openCubes, 0)
      })
      DOMCacheGetOrSet('openCubes').style.border = '1px solid green'
      DOMCacheGetOrSet('cubeOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openCubes').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openCubes').style.border = '1px solid red'
      DOMCacheGetOrSet('cubeOpensInput').style.border = '1px solid red'
    }
    if (player.autoOpenTesseracts) {
      DOMCacheGetOrSet('openTesseracts').textContent = i18next.t(
        'wowCubes.autoOn',
        {
          percent: format(player.openTesseracts, 0)
        }
      )
      DOMCacheGetOrSet('openTesseracts').style.border = '1px solid green'
      DOMCacheGetOrSet('tesseractsOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openTesseracts').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openTesseracts').style.border = '1px solid red'
      DOMCacheGetOrSet('tesseractsOpensInput').style.border = '1px solid red'
    }
    if (player.autoOpenHypercubes) {
      DOMCacheGetOrSet('openHypercubes').textContent = i18next.t(
        'wowCubes.autoOn',
        {
          percent: format(player.openHypercubes, 0)
        }
      )
      DOMCacheGetOrSet('openHypercubes').style.border = '1px solid green'
      DOMCacheGetOrSet('hypercubesOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openHypercubes').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openHypercubes').style.border = '1px solid red'
      DOMCacheGetOrSet('hypercubesOpensInput').style.border = '1px solid red'
    }
    if (player.autoOpenPlatonicsCubes) {
      DOMCacheGetOrSet('openPlatonicCube').textContent = i18next.t(
        'wowCubes.autoOn',
        {
          percent: format(player.openPlatonicsCubes, 0)
        }
      )
      DOMCacheGetOrSet('openPlatonicCube').style.border = '1px solid green'
      DOMCacheGetOrSet('platonicCubeOpensInput').style.border = '1px solid green'
    } else {
      DOMCacheGetOrSet('openPlatonicCube').textContent = i18next.t('wowCubes.autoOff')
      DOMCacheGetOrSet('openPlatonicCube').style.border = '1px solid red'
      DOMCacheGetOrSet('platonicCubeOpensInput').style.border = '1px solid red'
    }

    if (player.autoResearchToggle) {
      DOMCacheGetOrSet('toggleautoresearch').textContent = i18next.t(
        'researches.automaticOn'
      )
    } else {
      DOMCacheGetOrSet('toggleautoresearch').textContent = i18next.t(
        'researches.automaticOff'
      )
    }
    if (player.autoResearchMode === 'cheapest') {
      DOMCacheGetOrSet('toggleautoresearchmode').textContent = i18next.t(
        'researches.autoModeCheapest'
      )
    } else {
      DOMCacheGetOrSet('toggleautoresearchmode').textContent = i18next.t(
        'researches.autoModeManual'
      )
    }
    if (player.autoSacrificeToggle) {
      DOMCacheGetOrSet('toggleautosacrifice').textContent = i18next.t(
        'runes.blessings.autoRuneOn'
      )
      DOMCacheGetOrSet('toggleautosacrifice').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('toggleautosacrifice').textContent = i18next.t(
        'runes.blessings.autoRuneOff'
      )
      DOMCacheGetOrSet('toggleautosacrifice').style.border = '2px solid red'
    }
    if (player.autoBuyFragment) {
      DOMCacheGetOrSet('toggleautoBuyFragments').textContent = i18next.t(
        'runes.talismans.autoBuyOn'
      )
      DOMCacheGetOrSet('toggleautoBuyFragments').style.border = '2px solid white'
      DOMCacheGetOrSet('toggleautoBuyFragments').style.color = 'orange'
    } else {
      DOMCacheGetOrSet('toggleautoBuyFragments').textContent = i18next.t(
        'runes.talismans.autoBuyOff'
      )
      DOMCacheGetOrSet('toggleautoBuyFragments').style.border = '2px solid orange'
      DOMCacheGetOrSet('toggleautoBuyFragments').style.color = 'white'
    }
    if (player.autoFortifyToggle) {
      DOMCacheGetOrSet('toggleautofortify').textContent = i18next.t(
        'runes.autoFortifyOn'
      )
      DOMCacheGetOrSet('toggleautofortify').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('toggleautofortify').textContent = i18next.t(
        'runes.autoFortifyOff'
      )
      DOMCacheGetOrSet('toggleautofortify').style.border = '2px solid red'
    }
    if (player.autoEnhanceToggle) {
      DOMCacheGetOrSet('toggleautoenhance').textContent = i18next.t(
        'runes.autoEnhanceOn'
      )
      DOMCacheGetOrSet('toggleautoenhance').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('toggleautoenhance').textContent = i18next.t(
        'runes.autoEnhanceOff'
      )
      DOMCacheGetOrSet('toggleautoenhance').style.border = '2px solid red'
    }
    player.saveOfferingToggle = false // Lint doesnt like it being inside if
    DOMCacheGetOrSet('saveOffToggle').textContent = i18next.t(
      'toggles.saveOfferingsOff'
    )
    DOMCacheGetOrSet('saveOffToggle').style.color = 'white'
    if (player.autoAscend) {
      DOMCacheGetOrSet('ascensionAutoEnable').textContent = i18next.t(
        'corruptions.autoAscend.on'
      )
      DOMCacheGetOrSet('ascensionAutoEnable').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('ascensionAutoEnable').textContent = i18next.t(
        'corruptions.autoAscend.off'
      )
      DOMCacheGetOrSet('ascensionAutoEnable').style.border = '2px solid red'
    }
    if (player.shopConfirmationToggle) {
      DOMCacheGetOrSet('toggleConfirmShop').textContent = i18next.t(
        'shop.shopConfirmationOn'
      )
    } else {
      DOMCacheGetOrSet('toggleConfirmShop').textContent = i18next.t(
        'shop.shopConfirmationOff'
      )
    }
    switch (player.shopBuyMaxToggle) {
      case false:
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buy1')
        break
      case 'TEN':
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buy10')
        break
      case true:
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buyMax')
        break
      case 'ANY':
        DOMCacheGetOrSet('toggleBuyMaxShopText').textContent = i18next.t('shop.buyAny')
    }
    if (player.shopHideToggle) {
      DOMCacheGetOrSet('toggleHideShop').textContent = i18next.t('shop.hideMaxedOn')
    } else {
      DOMCacheGetOrSet('toggleHideShop').textContent = i18next.t('shop.hideMaxedOff')
    }
    if (player.researchBuyMaxToggle) {
      DOMCacheGetOrSet('toggleresearchbuy').textContent = i18next.t(
        'researches.upgradeMax'
      )
    } else {
      DOMCacheGetOrSet('toggleresearchbuy').textContent = i18next.t(
        'researches.upgradeOne'
      )
    }
    if (player.cubeUpgradesBuyMaxToggle) {
      DOMCacheGetOrSet('toggleCubeBuy').textContent = i18next.t(
        'toggles.upgradeMaxIfPossible'
      )
    } else {
      DOMCacheGetOrSet('toggleCubeBuy').textContent = i18next.t(
        'toggles.upgradeOneLevelWow'
      )
    }
    autoCubeUpgradesToggle(false)
    autoPlatonicUpgradesToggle(false)

    for (let i = 1; i <= 2; i++) {
      toggleAntMaxBuy()
      toggleAntAutoSacrifice(0)
      toggleAntAutoSacrifice(1)
    }

    for (let i = 1; i <= 2; i++) {
      toggleAutoAscend(0)
      toggleAutoAscend(1)
    }

    DOMCacheGetOrSet('historyTogglePerSecondButton').textContent = player.historyShowPerSecond
      ? i18next.t('history.perSecondOn')
      : i18next.t('history.perSecondOff')

    DOMCacheGetOrSet('historyTogglePerSecondButton').style.borderColor = player.historyShowPerSecond ? 'green' : 'red'

    // If auto research is enabled and runing; Make sure there is something to try to research if possible
    if (
      player.autoResearchToggle
      && autoResearchEnabled()
      && player.autoResearchMode === 'cheapest'
    ) {
      player.autoResearch = G.researchOrderByCost[player.roombaResearchIndex]
    }

    player.autoResearch = Math.min(200, player.autoResearch)
    player.autoSacrifice = Math.min(5, player.autoSacrifice)

    if (player.researches[61] === 0) {
      DOMCacheGetOrSet('automaticobtainium').textContent = i18next.t(
        'main.buyResearch3x11'
      )
    }

    if (player.autoSacrificeToggle && player.autoSacrifice > 0.5) {
      DOMCacheGetOrSet(`rune${player.autoSacrifice}`).style.backgroundColor = 'orange'
    }

    if (player.autoWarpCheck) {
      DOMCacheGetOrSet('warpAuto').textContent = i18next.t('general.autoOnColon')
      DOMCacheGetOrSet('warpAuto').style.border = '2px solid green'
    } else {
      DOMCacheGetOrSet('warpAuto').textContent = i18next.t(
        'general.autoOffColon'
      )
      DOMCacheGetOrSet('warpAuto').style.border = '2px solid red'
    }
    DOMCacheGetOrSet('autoHepteractPercentage').textContent = i18next.t(
      'wowCubes.hepteractForge.autoSetting',
      {
        x: `${player.hepteractAutoCraftPercentage}`
      }
    )
    DOMCacheGetOrSet('hepteractToQuarkTradeAuto').textContent = player.overfluxOrbsAutoBuy
      ? i18next.t('general.autoOnColon')
      : i18next.t('general.autoOffColon')
    DOMCacheGetOrSet('hepteractToQuarkTradeAuto').style.border = `2px solid ${
      player.overfluxOrbsAutoBuy ? 'green' : 'red'
    }`
    toggleAutoBuyOrbs(true, true)

    DOMCacheGetOrSet('blueberryToggleMode').innerHTML = player.blueberryLoadoutMode === 'saveTree'
      ? i18next.t('ambrosia.loadouts.save')
      : i18next.t('ambrosia.loadouts.load')

    toggleTalismanBuy(player.buyTalismanShardPercent)
    updateTalismanInventory()
    calculateObtainium()
    calculateAnts()
    calculateRuneLevels()
    resetHistoryRenderAllTables()
    updateSingularityAchievements()
    updateSingularityGlobalPerks()

    // Update the Sing requirements on reload for a challenge if applicable
    if (G.currentSingChallenge !== undefined) {
      const sing = player.singularityChallenges[G.currentSingChallenge].computeSingularityRquirement()
      player.singularityCount = sing
    }
  }

  updateAchievementBG()
  if (player.currentChallenge.reincarnation) {
    resetrepeat('reincarnationChallenge')
  } else if (player.currentChallenge.transcension) {
    resetrepeat('transcensionChallenge')
  }

  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()
  player.dayTimer = 60 * 60 * 24 - (s + 60 * m + 60 * 60 * h)
}

// dprint-ignore
const FormatList = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qt",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
  "UDc",
  "DDc",
  "TDc",
  "QaDc",
  "QtDc",
  "SxDc",
  "SpDc",
  "OcDc",
  "NoDc",
  "Vg",
  "UVg",
  "DVg",
  "TVg",
  "QaVg",
  "QtVg",
  "SxVg",
  "SpVg",
  "OcVg",
  "NoVg",
  "Tg",
  "UTg",
  "DTg",
  "TTg",
  "QaTg",
  "QtTg",
  "SxTg",
  "SpTg",
  "OTg",
  "NTg",
  "Qd",
  "UQd",
  "DQd",
  "TQd",
  "QaQd",
  "QtQd",
  "SxQd",
  "SpQd",
  "OcQd",
  "NoQd",
  "Qi",
  "UQi",
  "DQi",
  "TQi",
  "QaQi",
  "QtQi",
  "SxQi",
  "SpQi",
  "OQi",
  "NQi",
  "Se",
  "USe",
  "DSe",
  "TSe",
  "QaSe",
  "QtSe",
  "SxSe",
  "SpSe",
  "OcSe",
  "NoSe",
  "St",
  "USt",
  "DSt",
  "TSt",
  "QaSt",
  "QtSt",
  "SxSt",
  "SpSt",
  "OcSt",
  "NoSt",
  "Ocg",
  "UOcg",
  "DOcg",
  "TOcg",
  "QaOcg",
  "QtOcg",
  "SxOcg",
  "SpOcg",
  "OcOcg",
  "NoOcg",
  "Nono",
  "UNono",
  "DNono",
  "TNono",
  "QaNono",
  "QtNono",
  "SxNono",
  "SpNono",
  "OcNono",
  "NoNono",
  "Ce",
];

// Bad browsers (like Safari) only recently implemented this.
const supportsFormatToParts = typeof Intl.NumberFormat.prototype.formatToParts === 'function'

// In some browsers, this will return an empty-1 length array (?), causing a "TypeError: Cannot read property 'value' of undefined"
// if we destructure it... To reproduce: ` const [ { value } ] = []; `
// https://discord.com/channels/677271830838640680/730669616870981674/830218436201283584
const IntlFormatter = !supportsFormatToParts
  ? null
  : Intl.NumberFormat()
    .formatToParts(1000.1)
    .filter((part) => part.type === 'decimal' || part.type === 'group')

// gets the system number delimiter and decimal values, defaults to en-US
const [{ value: group }, { value: dec }] = IntlFormatter?.length !== 2
  ? [{ value: ',' }, { value: '.' }]
  : IntlFormatter

// Number.toLocaleString opts for 2 decimal places
const locOpts = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

const padEvery = (str: string, places = 3) => {
  let step = 1
  let newStr = ''
  const strParts = str.split('.')
  // don't take any decimal places
  for (let i = strParts[0].length - 1; i >= 0; i--) {
    // pad every [places] places if we aren't at the beginning of the string
    if (step++ === places && i !== 0) {
      step = 1
      newStr = group + str[i] + newStr
    } else {
      newStr = str[i] + newStr
    }
  }
  // re-add decimal places
  if (typeof strParts[1] !== 'undefined') {
    newStr += dec + strParts[1]
  } // see https://www.npmjs.com/package/flatstr

  ;(newStr as unknown as number) | 0
  return newStr
}

/**
 * This function displays the numbers such as 1,234 or 1.00e1234 or 1.00e1.234M.
 * @param input value to format
 * @param accuracy
 * how many decimal points that are to be displayed (Values <10 if !long, <1000 if long).
 * only works up to 305 (308 - 3), however it only worked up to ~14 due to rounding errors regardless
 * @param long dictates whether or not a given number displays as scientific at 1,000,000. This auto defaults to short if input >= 1e7
 */
export const format = (
  input:
    | Decimal
    | number
    | { [Symbol.toPrimitive]: unknown }
    | null
    | undefined,
  accuracy = 0,
  long = false,
  truncate = true,
  fractional = false
): string => {
  if (is_decimalNew(input)) {
    return format_decimalNew(input)
  }
  if (input == null) {
    return '0 [null]'
  }

  if (typeof input === 'object' && Symbol.toPrimitive in input) {
    input = Number(input)
  }

  if (
    // invalid parameter
    (typeof input !== 'number')
    || isNaN(input as number)
  ) {
    return isNaN(input as number) ? '0 [NaN]' : '0 [und.]'
  } else if (
    // this case handles numbers less than 1e-6 and greater than 0
    typeof input === 'number'
    && player.notation === 'Default'
    && input < (!fractional ? 1e-3 : 1e-15) // arbitrary number, don't change 1e-3
    && input > 0 // don't handle negative numbers, probably could be removed
  ) {
    return input.toExponential(accuracy)
  }

  let power!: number
  let mantissa!: number
  if (typeof input === 'number') {
    if (input === 0) {
      return '0'
    }

    // Gets power and mantissa if input is of type number and isn't 0
    power = Math.floor(Math.log10(Math.abs(input)))
    mantissa = input / Math.pow(10, power)
  }

  // This prevents numbers from jittering between two different powers by rounding errors
  if (mantissa > 9.9999999) {
    mantissa = 1
    ;++power
  }

  if (mantissa < 1 && mantissa > 0.9999999) {
    mantissa = 1
  }

  // If the power is less than 15 it's effectively 0

  if (power < -15) {
    return '0'
  }
  if (player.notation === 'Pure Engineering') {
    const powerOver = power % 3 < 0 ? 3 + (power % 3) : power % 3
    power = power - powerOver
    mantissa = mantissa * Math.pow(10, powerOver)
  }
  if (
    player.notation === 'Pure Scientific'
    || player.notation === 'Pure Engineering'
  ) {
    if (power >= 1e6) {
      if (!Number.isFinite(power)) {
        return 'Infinity'
      }
      return `E${format(power, 3)}`
    }
    accuracy = power === 2 && accuracy > 2 ? 2 : accuracy
    if (power >= 6 || power < 0) {
      accuracy = accuracy < 2 ? 2 : accuracy
      // Makes the power group 3 with commas
      const mantissaLook = (
        Math.floor(mantissa * Math.pow(10, accuracy)) / Math.pow(10, accuracy)
      ).toLocaleString(undefined, locOpts)
      const powerLook = padEvery(power.toString())
      // returns format (1.23e456,789)
      return `${mantissaLook}e${powerLook}`
    }
    mantissa = mantissa * Math.pow(10, power)
    if (mantissa - Math.floor(mantissa) > 0.9999999) {
      mantissa = Math.ceil(mantissa)
    }
    const mantissaLook = (
      Math.floor(mantissa * Math.pow(10, accuracy)) / Math.pow(10, accuracy)
    ).toLocaleString(undefined, {
      minimumFractionDigits: accuracy,
      maximumFractionDigits: accuracy
    })
    return `${mantissaLook}`
  }
  // If the power is negative, then we will want to address that separately.
  if (power < 0 && !isDecimal(input) && fractional) {
    if (power <= -15) {
      return `${format(mantissa, accuracy, long)} / ${
        Math.pow(
          10,
          -power - 15
        )
      }Qa`
    }
    if (power <= -12) {
      return `${format(mantissa, accuracy, long)} / ${
        Math.pow(
          10,
          -power - 12
        )
      }T`
    }
    if (power <= -9) {
      return `${format(mantissa, accuracy, long)} / ${
        Math.pow(
          10,
          -power - 9
        )
      }B`
    }
    if (power <= -6) {
      return `${format(mantissa, accuracy, long)} / ${
        Math.pow(
          10,
          -power - 6
        )
      }M`
    }
    if (power <= -3) {
      return `${format(mantissa, accuracy, long)} / ${
        Math.pow(
          10,
          -power - 3
        )
      }K`
    }
    return `${format(mantissa, accuracy, long)} / ${Math.pow(10, -power)}`
  } else if (power < 6 || (long && power < 12)) {
    // If the power is less than 6 or format long and less than 12 use standard formatting (1,234,567)
    // Gets the standard representation of the number, safe as power is guaranteed to be > -12 and < 12
    let standard = mantissa * Math.pow(10, power)
    let standardString: string
    // Rounds up if the number experiences a rounding error
    if (standard - Math.floor(standard) > 0.9999999) {
      standard = Math.ceil(standard)
    }
    // If the power is less than 1 or format long and less than 3 apply toFixed(accuracy) to get decimal places
    if ((power < 2 || (long && power < 3)) && accuracy > 0) {
      standardString = standard.toFixed(
        power === 2 && accuracy > 2 ? 2 : accuracy
      )
    } else {
      // If it doesn't fit those criteria drop the decimal places
      standard = Math.floor(standard)
      standardString = standard.toString()
    }

    // Split it on the decimal place
    return padEvery(standardString)
  } else if (power < 1e6) {
    // If the power is less than 1e6 then apply standard scientific notation
    // Makes mantissa be rounded down to 2 decimal places
    const mantissaLook = (Math.floor(mantissa * 100) / 100).toLocaleString(
      undefined,
      locOpts
    )
    // Makes the power group 3 with commas
    const powerLook = padEvery(power.toString())
    // returns format (1.23e456,789)
    return `${mantissaLook}e${powerLook}`
  } else if (power >= 1e6) {
    if (!Number.isFinite(power)) {
      return 'Infinity'
    }

    // if the power is greater than 1e6 apply notation scientific notation
    // Makes mantissa be rounded down to 2 decimal places
    const mantissaLook = testing && truncate
      ? ''
      : (Math.floor(mantissa * 100) / 100).toLocaleString(undefined, locOpts)

    // Drops the power down to 4 digits total but never greater than 1000 in increments that equate to notations, (1234000 -> 1.234) ( 12340000 -> 12.34) (123400000 -> 123.4) (1234000000 -> 1.234)
    const powerDigits = Math.ceil(Math.log10(power))
    let powerFront = ((powerDigits - 1) % 3) + 1
    let powerLook = power / Math.pow(10, powerDigits - powerFront)
    if (powerLook === 1000) {
      powerLook = 1
      powerFront = 1
    }

    const powerLookF = powerLook.toLocaleString(undefined, {
      minimumFractionDigits: 4 - powerFront,
      maximumFractionDigits: 4 - powerFront
    })
    const powerLodge = Math.floor(Math.log10(power) / 3)
    // Return relevant notations alongside the "look" power based on what the power actually is
    if (typeof FormatList[powerLodge] === 'string') {
      return `${mantissaLook}e${powerLookF}${FormatList[powerLodge]}`
    }

    // If it doesn't fit a notation then default to mantissa e power
    return `e${power.toExponential(2)}`
  } else {
    return '0 [und.]'
  }
}

export const formatTimeShort = (
  seconds: number,
  msMaxSeconds?: number
): string => {
  return (
    (seconds >= 86400 ? `${format(Math.floor(seconds / 86400))}d` : '')
    + (seconds >= 3600 ? `${format(Math.floor(seconds / 3600) % 24)}h` : '')
    + (seconds >= 60 ? `${format(Math.floor(seconds / 60) % 60)}m` : '')
    + (seconds >= 8640000
      ? ''
      : `${
        format(Math.floor(seconds) % 60)
        + (msMaxSeconds && seconds < msMaxSeconds // Don't show seconds when you're over 100 days, like honestly
          ? `.${
            Math.floor((seconds % 1) * 1000)
              .toString()
              .padStart(3, '0')
          }`
          : '')
      }s`)
  )
}

export const updateAllTick = (): void => {
  updateAccelerator()

}

export const multipliers = (): void => {
  let crystalExponent = 1 / 3
  crystalExponent += Math.min(
    10
      + (0.05 * player.researches[129] * Math.log(player.commonFragments + 1))
        / Math.log(4)
      + ((20 * player.corruptions.used.totalCorruptionDifficultyMultiplier)
        * G.effectiveRuneSpiritPower[3]),
    0.05 * player.crystalUpgrades[3]
  )
  crystalExponent += 0.04 * CalcECC('transcend', player.challengecompletions[3])
  crystalExponent += 0.08 * player.researches[28]
  crystalExponent += 0.08 * player.researches[29]
  crystalExponent += 0.04 * player.researches[30]
  crystalExponent += 8 * player.cubeUpgrades[17]
  G.prestigeMultiplier = Decimal.pow(
    player.prestigeShards,
    crystalExponent
  ).add(1)

  let c7 = 1
  if (player.currentChallenge.reincarnation === 7) {
    c7 = 0.05
  }
  if (player.currentChallenge.reincarnation === 8) {
    c7 = 0
  }

  G.buildingPower = 1
    + (1 - Math.pow(2, -1 / 160))
      * c7
      * to_number(Decimal.log(player.reincarnationShards.add(1), 10))
      * (1
        + (1 / 20) * player.researches[36]
        + (1 / 40) * player.researches[37]
        + (1 / 40) * player.researches[38])
    + (((c7 + 0.2) * 0.25) / 1.2)
      * CalcECC('reincarnation', player.challengecompletions[8])

  G.buildingPower = Math.pow(
    G.buildingPower,
    1 + player.cubeUpgrades[12] * 0.09
  )
  G.buildingPower = Math.pow(
    G.buildingPower,
    1 + player.cubeUpgrades[36] * 0.05
  )
  G.reincarnationMultiplier = Decimal.pow(G.buildingPower, G.totalCoinOwned)

  G.antMultiplier = Decimal.pow(
    Decimal.max(1, player.antPoints),
    calculateCrumbToCoinExp()
  )

  updateGlobalCoinMultiplier()

  G.globalCrystalMultiplier = new Decimal(1)
  if (player.achievements[36] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(2)
  }
  if (player.achievements[37] > 0.5 && player.prestigePoints.gte(10)) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
      Decimal.log(player.prestigePoints.add(1), 10)
    )
  }
  if (player.achievements[44] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
      Decimal.pow((G.rune3level / 2) * G.effectiveLevelMult, 2)
        .times(Decimal.pow(2, (G.rune3level * G.effectiveLevelMult) / 2 - 8))
        .add(1)
    )
  }
  if (player.upgrades[36] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
      Decimal.min('1e5000', Decimal.pow(player.prestigePoints, 1 / 500))
    )
  }
  if (player.upgrades[63] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
      Decimal.min('1e6000', Decimal.pow(player.reincarnationPoints.add(1), 6))
    )
  }
  if (player.researches[39] > 0.5) {
    G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
      Decimal.pow(G.reincarnationMultiplier, 1 / 50)
    )
  }

  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.min(
      Decimal.pow(10, 50 + 2 * player.crystalUpgrades[0]),
      Decimal.pow(1.05, player.achievementPoints * player.crystalUpgrades[0])
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.min(
      Decimal.pow(10, 100 + 5 * player.crystalUpgrades[1]),
      Decimal.pow(
        Decimal.log(player.coins.add(1), 10),
        player.crystalUpgrades[1] / 3
      )
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.pow(
      1
        + Math.min(
          0.12
            + 0.88 * player.upgrades[122]
            + (0.001
                * player.researches[129]
                * Math.log(player.commonFragments + 1))
              / Math.log(4),
          0.001 * player.crystalUpgrades[2]
        ),
      player.firstOwnedDiamonds
        .add(player.secondOwnedDiamonds)
        .add(player.thirdOwnedDiamonds)
        .add(player.fourthOwnedDiamonds)
        .add(player.fifthOwnedDiamonds)
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.pow(
      1.01,
      (player.challengecompletions[1]
        + player.challengecompletions[2]
        + player.challengecompletions[3]
        + player.challengecompletions[4]
        + player.challengecompletions[5])
        * player.crystalUpgrades[4]
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.pow(10, CalcECC('transcend', player.challengecompletions[5]))
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.pow(
      1e4,
      player.researches[5]
        * (1 + (1 / 2) * CalcECC('ascension', player.challengecompletions[14]))
    )
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.pow(2.5, player.researches[26])
  )
  G.globalCrystalMultiplier = G.globalCrystalMultiplier.times(
    Decimal.pow(2.5, player.researches[27])
  )

  G.globalMythosMultiplier = new Decimal(1)

  if (player.upgrades[37] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.times(
      Decimal.pow(Decimal.log(player.prestigePoints.add(10), 10), 2)
    )
  }
  if (player.upgrades[42] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.times(
      Decimal.min(
        1e50,
        Decimal.pow(player.prestigePoints.add(1), 1 / 50)
          .dividedBy(2.5)
          .add(1)
      )
    )
  }
  if (player.upgrades[47] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier
      .times(Decimal.pow(1.05, player.achievementPoints))
      .times(player.achievementPoints + 1)
  }
  if (player.upgrades[51] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.times(
      Decimal.pow(G.totalAcceleratorBoost, 2)
    )
  }
  if (player.upgrades[52] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.times(
      Decimal.pow(G.globalMythosMultiplier, 0.025)
    )
  }
  if (player.upgrades[64] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.times(
      Decimal.pow(player.reincarnationPoints.add(1), 2)
    )
  }
  if (player.researches[40] > 0.5) {
    G.globalMythosMultiplier = G.globalMythosMultiplier.times(
      Decimal.pow(G.reincarnationMultiplier, 1 / 250)
    )
  }
  G.grandmasterMultiplier = new Decimal(1)
  G.totalMythosOwned = player.firstOwnedMythos
    .add(player.secondOwnedMythos)
    .add(player.thirdOwnedMythos)
    .add(player.fourthOwnedMythos)
    .add(player.fifthOwnedMythos)

  G.mythosBuildingPower = 1 + CalcECC('transcend', player.challengecompletions[3]) / 200
  G.challengeThreeMultiplier = Decimal.pow(
    G.mythosBuildingPower,
    G.totalMythosOwned
  )

  G.grandmasterMultiplier = G.grandmasterMultiplier.times(
    G.challengeThreeMultiplier
  )

  G.mythosupgrade13 = new Decimal(1)
  G.mythosupgrade14 = new Decimal(1)
  G.mythosupgrade15 = new Decimal(1)
  if (player.upgrades[53] === 1) {
    G.mythosupgrade13 = G.mythosupgrade13.times(
      Decimal.min('1e1250', Decimal.pow(G.acceleratorEffect, 1 / 125))
    )
  }
  if (player.upgrades[54] === 1) {
    G.mythosupgrade14 = G.mythosupgrade14.times(
      Decimal.min('1e2000', Decimal.pow(G.multiplierEffect, 1 / 180))
    )
  }
  if (player.upgrades[55] === 1) {
    G.mythosupgrade15 = G.mythosupgrade15.times(
      Decimal.pow('1e1000', Math.min(1000, G.buildingPower - 1))
    )
  }

  G.globalConstantMult = new Decimal('1')
  G.globalConstantMult = G.globalConstantMult.times(
    Decimal.pow(
      1.05
        + 0.01 * player.achievements[270]
        + 0.001 * player.platonicUpgrades[18],
      player.constantUpgrades[1]
    )
  )
  G.globalConstantMult = G.globalConstantMult.times(
    Decimal.pow(
      1
        + 0.001
          * Math.min(
            100
              + 10 * player.achievements[270]
              + 10 * player.shopUpgrades.constantEX
              + 1000 * (G.challenge15Rewards.exponent.value - 1)
              + 3 * player.platonicUpgrades[18],
            player.constantUpgrades[2]
          ),
      ascendBuildingDR()
    )
  )
  G.globalConstantMult = G.globalConstantMult.times(
    1 + (2 / 100) * player.researches[139]
  )
  G.globalConstantMult = G.globalConstantMult.times(
    1 + (3 / 100) * player.researches[154]
  )
  G.globalConstantMult = G.globalConstantMult.times(
    1 + (4 / 100) * player.researches[169]
  )
  G.globalConstantMult = G.globalConstantMult.times(
    1 + (5 / 100) * player.researches[184]
  )
  G.globalConstantMult = G.globalConstantMult.times(
    1 + (10 / 100) * player.researches[199]
  )
  G.globalConstantMult = G.globalConstantMult.times(
    G.challenge15Rewards.constantBonus.value
  )
  if (player.platonicUpgrades[5] > 0) {
    G.globalConstantMult = G.globalConstantMult.times(2)
  }
  if (player.platonicUpgrades[10] > 0) {
    G.globalConstantMult = G.globalConstantMult.times(10)
  }
  if (player.platonicUpgrades[15] > 0) {
    G.globalConstantMult = G.globalConstantMult.times(1e250)
  }
  G.globalConstantMult = G.globalConstantMult.times(
    Decimal.pow(player.overfluxPowder + 1, 10 * player.platonicUpgrades[16])
  )
}

export const resourceGain = (dt: number): void => {
  calculateTotalCoinOwned()
  calculateTotalAcceleratorBoost()

  updateAllTick()
  updateAllMultiplier()
  multipliers()
  calculatetax()

  updateCoin(dt)

  resetCurrency()
  if (player.upgrades[93] === 1 && player.coinsThisPrestige.gte(1e16)) {
    player.prestigePoints = player.prestigePoints.add(
      Decimal.floor(G.prestigePointGain.dividedBy(4000).times(dt / 0.025))
    )
  }
  if (player.upgrades[100] === 1 && player.coinsThisTranscension.gte(1e100)) {
    player.transcendPoints = player.transcendPoints.add(
      Decimal.floor(G.transcendPointGain.dividedBy(4000).times(dt / 0.025))
    )
  }
  if (player.cubeUpgrades[28] > 0 && player.transcendShards.gte(1e300)) {
    player.reincarnationPoints = player.reincarnationPoints.add(
      Decimal.floor(G.reincarnationPointGain.dividedBy(4000).times(dt / 0.025))
    )
  }
  G.produceFirstDiamonds = player.firstGeneratedDiamonds
    .add(player.firstOwnedDiamonds)
    .times(player.firstProduceDiamonds)
    .times(G.globalCrystalMultiplier)
  G.produceSecondDiamonds = player.secondGeneratedDiamonds
    .add(player.secondOwnedDiamonds)
    .times(player.secondProduceDiamonds)
    .times(G.globalCrystalMultiplier)
  G.produceThirdDiamonds = player.thirdGeneratedDiamonds
    .add(player.thirdOwnedDiamonds)
    .times(player.thirdProduceDiamonds)
    .times(G.globalCrystalMultiplier)
  G.produceFourthDiamonds = player.fourthGeneratedDiamonds
    .add(player.fourthOwnedDiamonds)
    .times(player.fourthProduceDiamonds)
    .times(G.globalCrystalMultiplier)
  G.produceFifthDiamonds = player.fifthGeneratedDiamonds
    .add(player.fifthOwnedDiamonds)
    .times(player.fifthProduceDiamonds)
    .times(G.globalCrystalMultiplier)

  player.fourthGeneratedDiamonds = player.fourthGeneratedDiamonds.add(
    G.produceFifthDiamonds.times(dt / 0.025)
  )
  player.thirdGeneratedDiamonds = player.thirdGeneratedDiamonds.add(
    G.produceFourthDiamonds.times(dt / 0.025)
  )
  player.secondGeneratedDiamonds = player.secondGeneratedDiamonds.add(
    G.produceThirdDiamonds.times(dt / 0.025)
  )
  player.firstGeneratedDiamonds = player.firstGeneratedDiamonds.add(
    G.produceSecondDiamonds.times(dt / 0.025)
  )
  G.produceDiamonds = G.produceFirstDiamonds

  if (
    player.currentChallenge.transcension !== 3
    && player.currentChallenge.reincarnation !== 10
  ) {
    player.prestigeShards = player.prestigeShards.add(
      G.produceDiamonds.times(dt / 0.025)
    )
  }

  G.produceFifthMythos = player.fifthGeneratedMythos
    .add(player.fifthOwnedMythos)
    .times(player.fifthProduceMythos)
    .times(G.globalMythosMultiplier)
    .times(G.grandmasterMultiplier)
    .times(G.mythosupgrade15)
  G.produceFourthMythos = player.fourthGeneratedMythos
    .add(player.fourthOwnedMythos)
    .times(player.fourthProduceMythos)
    .times(G.globalMythosMultiplier)
  G.produceThirdMythos = player.thirdGeneratedMythos
    .add(player.thirdOwnedMythos)
    .times(player.thirdProduceMythos)
    .times(G.globalMythosMultiplier)
    .times(G.mythosupgrade14)
  G.produceSecondMythos = player.secondGeneratedMythos
    .add(player.secondOwnedMythos)
    .times(player.secondProduceMythos)
    .times(G.globalMythosMultiplier)
  G.produceFirstMythos = player.firstGeneratedMythos
    .add(player.firstOwnedMythos)
    .times(player.firstProduceMythos)
    .times(G.globalMythosMultiplier)
    .times(G.mythosupgrade13)
  player.fourthGeneratedMythos = player.fourthGeneratedMythos.add(
    G.produceFifthMythos.times(dt / 0.025)
  )
  player.thirdGeneratedMythos = player.thirdGeneratedMythos.add(
    G.produceFourthMythos.times(dt / 0.025)
  )
  player.secondGeneratedMythos = player.secondGeneratedMythos.add(
    G.produceThirdMythos.times(dt / 0.025)
  )
  player.firstGeneratedMythos = player.firstGeneratedMythos.add(
    G.produceSecondMythos.times(dt / 0.025)
  )

  G.produceMythos = new Decimal('0')
  G.produceMythos = player.firstGeneratedMythos
    .add(player.firstOwnedMythos)
    .times(player.firstProduceMythos)
    .times(G.globalMythosMultiplier)
    .times(G.mythosupgrade13)
  G.producePerSecondMythos = G.produceMythos.times(40)

  let pm = new Decimal('1')
  if (player.upgrades[67] > 0.5) {
    pm = pm.times(
      Decimal.pow(
        1.03,
        player.firstOwnedParticles
          .add(player.secondOwnedParticles)
          .add(player.thirdOwnedParticles)
          .add(player.fourthOwnedParticles)
          .add(player.fifthOwnedParticles)
      )
    )
  }
  G.produceFifthParticles = player.fifthGeneratedParticles
    .add(player.fifthOwnedParticles)
    .times(player.fifthProduceParticles)
  G.produceFourthParticles = player.fourthGeneratedParticles
    .add(player.fourthOwnedParticles)
    .times(player.fourthProduceParticles)
  G.produceThirdParticles = player.thirdGeneratedParticles
    .add(player.thirdOwnedParticles)
    .times(player.thirdProduceParticles)
  G.produceSecondParticles = player.secondGeneratedParticles
    .add(player.secondOwnedParticles)
    .times(player.secondProduceParticles)
  G.produceFirstParticles = player.firstGeneratedParticles
    .add(player.firstOwnedParticles)
    .times(player.firstProduceParticles)
    .times(pm)
  player.fourthGeneratedParticles = player.fourthGeneratedParticles.add(
    G.produceFifthParticles.times(dt / 0.025)
  )
  player.thirdGeneratedParticles = player.thirdGeneratedParticles.add(
    G.produceFourthParticles.times(dt / 0.025)
  )
  player.secondGeneratedParticles = player.secondGeneratedParticles.add(
    G.produceThirdParticles.times(dt / 0.025)
  )
  player.firstGeneratedParticles = player.firstGeneratedParticles.add(
    G.produceSecondParticles.times(dt / 0.025)
  )

  G.produceParticles = new Decimal('0')
  G.produceParticles = player.firstGeneratedParticles
    .add(player.firstOwnedParticles)
    .times(player.firstProduceParticles)
    .times(pm)
  G.producePerSecondParticles = G.produceParticles.times(40)

  if (
    player.currentChallenge.transcension !== 3
    && player.currentChallenge.reincarnation !== 10
  ) {
    player.transcendShards = player.transcendShards.add(
      G.produceMythos.times(dt / 0.025)
    )
  }
  if (player.currentChallenge.reincarnation !== 10) {
    player.reincarnationShards = player.reincarnationShards.add(
      G.produceParticles.times(dt / 0.025)
    )
  }

  createAnts(dt)
  for (let i = 1; i <= 5; i++) {
    G.ascendBuildingProduction[G.ordinals[(5 - i) as ZeroToFour]] = player[
      `ascendBuilding${(6 - i) as OneToFive}` as const
    ].generated
      .add(player[`ascendBuilding${(6 - i) as OneToFive}` as const].owned)
      .times(player[`ascendBuilding${i as OneToFive}` as const].multiplier)
      .times(G.globalConstantMult)

    if (i !== 5) {
      const fiveMinusI = (5 - i) as 1 | 2 | 3 | 4
      player[`ascendBuilding${fiveMinusI}` as const].generated = player[
        `ascendBuilding${fiveMinusI}` as const
      ].generated.add(
        G.ascendBuildingProduction[G.ordinals[fiveMinusI]].times(dt)
      )
    }
  }

  player.ascendShards = player.ascendShards.add(
    G.ascendBuildingProduction.first.times(dt)
  )

  if (player.ascensionCount > 0) {
    ascensionAchievementCheck(2)
  }

  if (
    player.researches[71] > 0.5
    && player.challengecompletions[1]
      < Math.min(
        player.highestchallengecompletions[1],
        25 + 5 * player.researches[66] + 925 * player.researches[105]
      )
    && player.coins.gte(
      Decimal.pow(
        10,
        1.25
          * G.challengeBaseRequirements[0]
          * Math.pow(1 + player.challengecompletions[1], 2)
      )
    )
  ) {
    player.challengecompletions[1] += 1
    challengeachievementcheck(1, true)
    updateChallengeLevel(1)
  }
  if (
    player.researches[72] > 0.5
    && player.challengecompletions[2]
      < Math.min(
        player.highestchallengecompletions[2],
        25 + 5 * player.researches[67] + 925 * player.researches[105]
      )
    && player.coins.gte(
      Decimal.pow(
        10,
        1.6
          * G.challengeBaseRequirements[1]
          * Math.pow(1 + player.challengecompletions[2], 2)
      )
    )
  ) {
    player.challengecompletions[2] += 1
    challengeachievementcheck(2, true)
    updateChallengeLevel(2)
  }
  if (
    player.researches[73] > 0.5
    && player.challengecompletions[3]
      < Math.min(
        player.highestchallengecompletions[3],
        25 + 5 * player.researches[68] + 925 * player.researches[105]
      )
    && player.coins.gte(
      Decimal.pow(
        10,
        1.7
          * G.challengeBaseRequirements[2]
          * Math.pow(1 + player.challengecompletions[3], 2)
      )
    )
  ) {
    player.challengecompletions[3] += 1
    challengeachievementcheck(3, true)
    updateChallengeLevel(3)
  }
  if (
    player.researches[74] > 0.5
    && player.challengecompletions[4]
      < Math.min(
        player.highestchallengecompletions[4],
        25 + 5 * player.researches[69] + 925 * player.researches[105]
      )
    && player.coins.gte(
      Decimal.pow(
        10,
        1.45
          * G.challengeBaseRequirements[3]
          * Math.pow(1 + player.challengecompletions[4], 2)
      )
    )
  ) {
    player.challengecompletions[4] += 1
    challengeachievementcheck(4, true)
    updateChallengeLevel(4)
  }
  if (
    player.researches[75] > 0.5
    && player.challengecompletions[5]
      < Math.min(
        player.highestchallengecompletions[5],
        25 + 5 * player.researches[70] + 925 * player.researches[105]
      )
    && player.coins.gte(
      Decimal.pow(
        10,
        2
          * G.challengeBaseRequirements[4]
          * Math.pow(1 + player.challengecompletions[5], 2)
      )
    )
  ) {
    player.challengecompletions[5] += 1
    challengeachievementcheck(5, true)
    updateChallengeLevel(5)
  }

  const chal = player.currentChallenge.transcension
  const reinchal = player.currentChallenge.reincarnation
  const ascendchal = player.currentChallenge.ascension
  if (chal !== 0) {
    if (
      player.coinsThisTranscension.gte(
        challengeRequirement(chal, player.challengecompletions[chal], chal)
      )
    ) {
      void resetCheck('transcensionChallenge', false)
      G.autoChallengeTimerIncrement = 0
    }
  }
  if (reinchal < 9 && reinchal !== 0) {
    if (
      player.transcendShards.gte(
        challengeRequirement(
          reinchal,
          player.challengecompletions[reinchal],
          reinchal
        )
      )
    ) {
      void resetCheck('reincarnationChallenge', false)
      G.autoChallengeTimerIncrement = 0
    }
  }
  if (reinchal >= 9) {
    if (
      player.coins.gte(
        challengeRequirement(
          reinchal,
          player.challengecompletions[reinchal],
          reinchal
        )
      )
    ) {
      void resetCheck('reincarnationChallenge', false)
      G.autoChallengeTimerIncrement = 0
    }
  }
  if (ascendchal !== 0 && ascendchal < 15) {
    if (
      player.challengecompletions[10]
        >= (challengeRequirement(
        ascendchal,
        player.challengecompletions[ascendchal],
        ascendchal
      ) as unknown as number)
    ) {
      void resetCheck('ascensionChallenge', false)
      challengeachievementcheck(ascendchal, true)
    }
  }
  if (ascendchal === 15) {
    if (
      player.coins.gte(
        challengeRequirement(
          ascendchal,
          player.challengecompletions[ascendchal],
          ascendchal
        )
      )
    ) {
      void resetCheck('ascensionChallenge', false)
    }
  }
}

export const updateAntMultipliers = (): void => {
  // Update 2.5.0: Updated to have a base of 10 instead of 1x
  G.globalAntMult = new Decimal(10)
  // Update 2.9.0: Updated to give a 5x multiplier no matter what
  G.globalAntMult = G.globalAntMult.times(5)
  G.globalAntMult = G.globalAntMult.times(
    1
      + (1 / 2500)
        * Math.pow(
          G.rune5level
            * G.effectiveLevelMult
            * (1
              + (player.researches[84] / 200)
                * (1
                  + (1
                    * G.effectiveRuneSpiritPower[5]
                    * player.corruptions.used.totalCorruptionDifficultyMultiplier))),
          2
        )
  )
  if (player.upgrades[76] === 1) {
    G.globalAntMult = G.globalAntMult.times(5)
  }
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(
      1
        + player.upgrades[77] / 250
        + player.researches[96] / 5000
        + player.cubeUpgrades[65] / 250,
      player.firstOwnedAnts
        + player.secondOwnedAnts
        + player.thirdOwnedAnts
        + player.fourthOwnedAnts
        + player.fifthOwnedAnts
        + player.sixthOwnedAnts
        + player.seventhOwnedAnts
        + player.eighthOwnedAnts
    )
  )
  G.globalAntMult = G.globalAntMult.times(
    1
      + player.upgrades[78]
        * 0.005
        * Math.pow(Math.log10(player.maxofferings + 1), 2)
  )
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(
      1.11 + player.researches[101] / 1000 + player.researches[162] / 10000,
      player.antUpgrades[0]! + G.bonusant1
    )
  )
  G.globalAntMult = G.globalAntMult.times(
    antSacrificePointsToMultiplier(player.antSacrificePoints)
  )
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(
      Math.max(1, player.researchPoints),
      G.effectiveRuneBlessingPower[5]
    )
  )
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(1 + G.runeSum / 100, G.talisman6Power)
  )
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(1.1, CalcECC('reincarnation', player.challengecompletions[9]))
  )
  G.globalAntMult = G.globalAntMult.times(G.cubeBonusMultiplier[6])
  if (player.achievements[169] === 1) {
    G.globalAntMult = G.globalAntMult.times(
      Decimal.log(player.antPoints.add(10), 10)
    )
  }
  if (player.achievements[171] === 1) {
    G.globalAntMult = G.globalAntMult.times(1.16666)
  }
  if (player.achievements[172] === 1) {
    G.globalAntMult = G.globalAntMult.times(
      1
        + 2 * (1 - Math.pow(2, -Math.min(1, player.reincarnationcounter / 7200)))
    )
  }
  if (player.upgrades[39] === 1) {
    G.globalAntMult = G.globalAntMult.times(1.6)
  }
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(
      1 + 0.1 * to_number(Decimal.log(player.ascendShards.add(1), 10)),
      player.constantUpgrades[5]
    )
  )
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(1e5, CalcECC('ascension', player.challengecompletions[11]))
  )
  if (player.researches[147] > 0) {
    G.globalAntMult = G.globalAntMult.times(
      Decimal.log(player.antPoints.add(10), 10)
    )
  }
  if (player.researches[177] > 0) {
    G.globalAntMult = G.globalAntMult.times(
      Decimal.pow(
        Decimal.log(player.antPoints.add(10), 10),
        player.researches[177]
      )
    )
  }

  if (player.currentChallenge.ascension === 12) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.5)
  }
  if (player.currentChallenge.ascension === 13) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.23)
  }
  if (player.currentChallenge.ascension === 14) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.2)
  }

  if (player.currentChallenge.ascension !== 15) {
    G.globalAntMult = Decimal.pow(
      G.globalAntMult,
      1 - (0.9 / 90) * Math.min(99, player.corruptions.used.totalLevels)
    )
  } else {
    // C15 used to have 9 corruptions set to 11, which above would provide a power of 0.01. Now it's hardcoded this way.
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.01)
  }

  G.globalAntMult = Decimal.pow(
    G.globalAntMult,
    G.extinctionMultiplier[player.corruptions.used.extinction]
  )
  G.globalAntMult = G.globalAntMult.times(G.challenge15Rewards.antSpeed.value)
  // V2.5.0: Moved ant shop upgrade as 'uncorruptable'
  G.globalAntMult = G.globalAntMult.times(
    Decimal.pow(1.2, player.shopUpgrades.antSpeed)
  )

  if (player.platonicUpgrades[12] > 0) {
    G.globalAntMult = G.globalAntMult.times(
      Decimal.pow(
        1 + (1 / 100) * player.platonicUpgrades[12],
        sumContents(player.highestchallengecompletions)
      )
    )
  }
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[10] > 0
  ) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 1.25)
  }
  if (player.achievements[274] > 0) {
    G.globalAntMult = G.globalAntMult.times(4.44)
  }

  if (player.corruptions.used.extinction >= 14) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.02)
  }
  if (player.corruptions.used.extinction >= 15) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.02)
  }
  if (player.corruptions.used.extinction >= 16) {
    G.globalAntMult = Decimal.pow(G.globalAntMult, 0.02)
  }

  if (player.octeractUpgrades.octeractStarter.getEffect().bonus) {
    G.globalAntMult = G.globalAntMult.times(100000)
  }

  if (player.highestSingularityCount >= 30) {
    G.globalAntMult = G.globalAntMult.times(1000)
  }

  if (player.highestSingularityCount >= 70) {
    G.globalAntMult = G.globalAntMult.times(1000)
  }

  if (player.highestSingularityCount >= 100) {
    G.globalAntMult = G.globalAntMult.times(1e6)
  }
}

export const createAnts = (dt: number): void => {
  updateAntMultipliers()
  G.antEightProduce = player.eighthGeneratedAnts
    .add(player.eighthOwnedAnts)
    .times(player.eighthProduceAnts)
    .times(G.globalAntMult)
  G.antSevenProduce = player.seventhGeneratedAnts
    .add(player.seventhOwnedAnts)
    .times(player.seventhProduceAnts)
    .times(G.globalAntMult)
  G.antSixProduce = player.sixthGeneratedAnts
    .add(player.sixthOwnedAnts)
    .times(player.sixthProduceAnts)
    .times(G.globalAntMult)
  G.antFiveProduce = player.fifthGeneratedAnts
    .add(player.fifthOwnedAnts)
    .times(player.fifthProduceAnts)
    .times(G.globalAntMult)
  G.antFourProduce = player.fourthGeneratedAnts
    .add(player.fourthOwnedAnts)
    .times(player.fourthProduceAnts)
    .times(G.globalAntMult)
  G.antThreeProduce = player.thirdGeneratedAnts
    .add(player.thirdOwnedAnts)
    .times(player.thirdProduceAnts)
    .times(G.globalAntMult)
  G.antTwoProduce = player.secondGeneratedAnts
    .add(player.secondOwnedAnts)
    .times(player.secondProduceAnts)
    .times(G.globalAntMult)
  G.antOneProduce = player.firstGeneratedAnts
    .add(player.firstOwnedAnts)
    .times(player.firstProduceAnts)
    .times(G.globalAntMult)
  player.seventhGeneratedAnts = player.seventhGeneratedAnts.add(
    G.antEightProduce.times(dt / 1)
  )
  player.sixthGeneratedAnts = player.sixthGeneratedAnts.add(
    G.antSevenProduce.times(dt / 1)
  )
  player.fifthGeneratedAnts = player.fifthGeneratedAnts.add(
    G.antSixProduce.times(dt / 1)
  )
  player.fourthGeneratedAnts = player.fourthGeneratedAnts.add(
    G.antFiveProduce.times(dt / 1)
  )
  player.thirdGeneratedAnts = player.thirdGeneratedAnts.add(
    G.antFourProduce.times(dt / 1)
  )
  player.secondGeneratedAnts = player.secondGeneratedAnts.add(
    G.antThreeProduce.times(dt / 1)
  )
  player.firstGeneratedAnts = player.firstGeneratedAnts.add(
    G.antTwoProduce.times(dt / 1)
  )

  player.antPoints = player.antPoints.add(G.antOneProduce.times(dt / 1))
}

export const resetCurrency = (): void => {
  let prestigePow = 0.5 + CalcECC('transcend', player.challengecompletions[5]) / 100
  let transcendPow = 0.03

  // Calculates the conversion exponent for resets (Challenges 5 and 10 reduce the exponent accordingly).
  if (player.currentChallenge.transcension === 5) {
    prestigePow = 0.01 / (1 + player.challengecompletions[5])
    transcendPow = 0.001
  }
  if (player.currentChallenge.reincarnation === 10) {
    prestigePow = 1e-4 / (1 + player.challengecompletions[10])
    transcendPow = 0.001
  }
  prestigePow *= G.deflationMultiplier[player.corruptions.used.deflation]
  // Prestige Point Formulae
  G.prestigePointGain = Decimal.floor(
    Decimal.pow(player.coinsThisPrestige.dividedBy(1e12), prestigePow)
  )
  if (
    player.upgrades[16] > 0.5
    && player.currentChallenge.transcension !== 5
    && player.currentChallenge.reincarnation !== 10
  ) {
    G.prestigePointGain = G.prestigePointGain.times(
      Decimal.min(
        Decimal.pow(10, 1e33),
        Decimal.pow(
          G.acceleratorEffect,
          (1 / 3) * G.deflationMultiplier[player.corruptions.used.deflation]
        )
      )
    )
  }

  // Transcend Point Formulae
  G.transcendPointGain = Decimal.floor(
    Decimal.pow(player.coinsThisTranscension.dividedBy(1e100), transcendPow))
  if (
    player.upgrades[44] > 0.5
    && player.currentChallenge.transcension !== 5
    && player.currentChallenge.reincarnation !== 10
  ) {
    G.transcendPointGain = G.transcendPointGain.times(
      Decimal.min(1e6, Decimal.pow(1.01, player.transcendCount))
    )
  }

  // Reincarnation Point Formulae
  G.reincarnationPointGain = Decimal.floor(
    Decimal.pow(player.transcendShards.dividedBy(1e300), 0.01)
  )
  if (player.currentChallenge.reincarnation !== 0) {
    G.reincarnationPointGain = Decimal.pow(G.reincarnationPointGain, 0.01)
  }
  if (player.achievements[50] === 1) {
    G.reincarnationPointGain = G.reincarnationPointGain.times(2)
  }
  if (player.upgrades[65] > 0.5) {
    G.reincarnationPointGain = G.reincarnationPointGain.times(5)
  }
  if (player.currentChallenge.ascension === 12) {
    G.reincarnationPointGain = new Decimal('0')
  }
}

export const resetCheck = async (
  i: resetNames,
  manual = true,
  leaving = false
): Promise<void> => {
  if (i === 'prestige') {
    if (player.coinsThisPrestige.gte(1e16) || G.prestigePointGain.gte(100)) {
      if (manual) {
        void resetConfirmation('prestige')
      } else {
        resetachievementcheck(1)
        reset('prestige')
      }
    }
  }
  if (i === 'transcension') {
    if (
      (player.coinsThisTranscension.gte(1e100)
        || G.transcendPointGain.gte(0.5))
      && player.currentChallenge.transcension === 0
    ) {
      if (manual) {
        void resetConfirmation('transcend')
      }
      if (!manual) {
        resetachievementcheck(2)
        reset('transcension')
      }
    }
  }
  if (
    i === 'transcensionChallenge'
    && player.currentChallenge.transcension !== 0
  ) {
    const q = player.currentChallenge.transcension
    const maxCompletions = getMaxChallenges(q)
    const reqCheck = (comp: number) => player.coinsThisTranscension.gte(challengeRequirement(q, comp, q))
    if (
      reqCheck(player.challengecompletions[q])
      && player.challengecompletions[q] < maxCompletions
    ) {
      let maxInc = 1
      if (player.shopUpgrades.instantChallenge > 0) {
        maxInc = 10
      }
      if (player.shopUpgrades.instantChallenge2 > 0) {
        maxInc += player.highestSingularityCount
      }
      if (player.currentChallenge.ascension === 13) {
        maxInc = 1
      }
      let counter = 0
      let comp = player.challengecompletions[q]
      while (counter < maxInc) {
        if (reqCheck(comp) && comp < maxCompletions) {
          comp++
        }
        counter++
      }
      player.challengecompletions[q] = comp
      challengeDisplay(q, false)
      updateChallengeLevel(q)
    }
    if (
      player.challengecompletions[q] > player.highestchallengecompletions[q]
    ) {
      while (
        player.challengecompletions[q] > player.highestchallengecompletions[q]
      ) {
        player.highestchallengecompletions[q] += 1
        highestChallengeRewards(q, player.highestchallengecompletions[q])
      }
      calculateCubeBlessings()
    }
    challengeachievementcheck(q)
    if (
      !player.retrychallenges
      || manual
      || (player.autoChallengeRunning
        && player.challengecompletions[q] >= maxCompletions)
    ) {
      toggleAutoChallengeModeText('ENTER')
      player.currentChallenge.transcension = 0
      updateChallengeDisplay()
    }
    if (player.shopUpgrades.instantChallenge === 0 || leaving) {
      reset('transcensionChallenge', false, 'leaveChallenge')
      player.transcendCount -= 1
    }
  }

  if (i === 'reincarnation') {
    if (
      G.reincarnationPointGain.gt(0.5)
      && player.currentChallenge.transcension === 0
      && player.currentChallenge.reincarnation === 0
    ) {
      if (manual) {
        void resetConfirmation('reincarnate')
      }
      if (!manual) {
        resetachievementcheck(3)
        reset('reincarnation')
      }
    }
  }
  if (
    i === 'reincarnationChallenge'
    && player.currentChallenge.reincarnation !== 0
  ) {
    const q = player.currentChallenge.reincarnation
    const maxCompletions = getMaxChallenges(q)
    const reqCheck = (comp: number) => {
      if (q <= 8) {
        return player.transcendShards.gte(challengeRequirement(q, comp, q))
      } else {
        // challenges 9 and 10
        return player.coins.gte(challengeRequirement(q, comp, q))
      }
    }
    if (
      reqCheck(player.challengecompletions[q])
      && player.challengecompletions[q] < maxCompletions
    ) {
      let maxInc = 1
      if (player.shopUpgrades.instantChallenge > 0) {
        maxInc = 10
      }
      if (player.shopUpgrades.instantChallenge2 > 0) {
        maxInc += player.highestSingularityCount
      }
      if (player.currentChallenge.ascension === 13) {
        maxInc = 1
      }
      let counter = 0
      let comp = player.challengecompletions[q]
      while (counter < maxInc) {
        if (reqCheck(comp) && comp < maxCompletions) {
          comp++
        }
        counter++
      }
      player.challengecompletions[q] = comp
      challengeDisplay(q, false)
      updateChallengeLevel(q)
    }
    if (
      player.challengecompletions[q] > player.highestchallengecompletions[q]
    ) {
      while (
        player.challengecompletions[q] > player.highestchallengecompletions[q]
      ) {
        player.highestchallengecompletions[q] += 1
        highestChallengeRewards(q, player.highestchallengecompletions[q])
      }
      calculateHypercubeBlessings()
      calculateTesseractBlessings()
      calculateCubeBlessings()
    }
    challengeachievementcheck(q)
    if (
      !player.retrychallenges
      || manual
      || (player.autoChallengeRunning
        && player.challengecompletions[q] >= maxCompletions)
    ) {
      toggleAutoChallengeModeText('ENTER')
      player.currentChallenge.reincarnation = 0
      if (player.shopUpgrades.instantChallenge > 0) {
        for (let i = 1; i <= 5; i++) {
          player.challengecompletions[i] = player.highestchallengecompletions[i]
        }
      }
      updateChallengeDisplay()
      calculateRuneLevels()
      calculateAnts()
    }
    if (player.shopUpgrades.instantChallenge === 0 || leaving) {
      reset('reincarnationChallenge', false, 'leaveChallenge')
      player.reincarnationCount -= 1
    }
  }

  if (i === 'ascension') {
    if (
      player.achievements[141] > 0
      && (!player.toggles[31] || player.challengecompletions[10] > 0)
    ) {
      if (manual) {
        void resetConfirmation('ascend')
      }
    }
  }

  if (i === 'ascensionChallenge' && player.currentChallenge.ascension !== 0) {
    let conf = true
    if (manual) {
      if (player.challengecompletions[11] === 0 || player.toggles[31]) {
        conf = await Confirm(i18next.t('main.exitAscensionChallenge'))
      }
    }
    if (!conf) {
      return
    }
    const a = player.currentChallenge.ascension
    const maxCompletions = getMaxChallenges(a)

    if (a !== 0 && a < 15) {
      if (
        player.challengecompletions[10]
          >= (challengeRequirement(
          a,
          player.challengecompletions[a],
          a
        ) as unknown as number)
        && player.challengecompletions[a] < maxCompletions
      ) {
        player.challengecompletions[a] += 1
        updateChallengeLevel(a)
        challengeDisplay(a, false)
      }
      challengeachievementcheck(a, true)
    }
    if (a === 15) {
      const c15SM = challenge15ScoreMultiplier()
      if (
        player.coins.gte(
          challengeRequirement(a, player.challengecompletions[a], a)
        )
        && player.challengecompletions[a] < maxCompletions
      ) {
        player.challengecompletions[a] += 1
        updateChallengeLevel(a)
        challengeDisplay(a, false)
      }
      if (
        (manual || leaving || player.shopUpgrades.challenge15Auto > 0) // removed a check that ensures always all lv11.. did not seem necessary
      ) {
        if (
          player.coins.gte(Decimal.pow(10, player.challenge15Exponent / c15SM))
        ) {
          player.challenge15Exponent = Decimal.log(player.coins.add(1), 10).mul(c15SM)
          c15RewardUpdate()
        }
      }
    }

    if (
      player.challengecompletions[a] > player.highestchallengecompletions[a]
    ) {
      player.highestchallengecompletions[a] += 1
      player.wowHypercubes.add(1)
      if (player.highestchallengecompletions[a] >= maxCompletions) {
        leaving = true
      }
    }

    if (!player.retrychallenges || manual || leaving) {
      if (
        !(
          !manual
          && (autoAscensionChallengeSweepUnlock()
            || !player.autoChallengeRunning) // If not autochallenge, don't reset
          && player.autoAscend
          && player.challengecompletions[11] > 0
          && player.cubeUpgrades[10] > 0
        )
      ) {
        player.currentChallenge.ascension = 0
        updateChallengeDisplay()
      }
    }

    if ((player.shopUpgrades.instantChallenge2 === 0 && a !== 15) || manual) {
      reset('ascensionChallenge', false)
    }
  }

  if (i === 'singularity') {
    if (player.runelevels[6] === 0) {
      return Alert(i18next.t('main.noAntiquity'))
    }

    const thankSing = 300

    if (player.insideSingularityChallenge) {
      return Alert(i18next.t('main.insideSingularityChallenge'))
    }

    if (player.singularityCount >= thankSing) {
      return Alert(i18next.t('main.gameBeat'))
    }

    let confirmed = false
    const nextSingularityNumber = player.singularityCount + 1 + getFastForwardTotalMultiplier()

    if (!player.toggles[33] && player.singularityCount > 0) {
      confirmed = await Confirm(
        i18next.t('main.singularityConfirm0', {
          x: format(nextSingularityNumber),
          y: format(calculateGoldenQuarks(), 2, true)
        })
      )
    } else {
      await Alert(
        i18next.t('main.singularityMessage1', {
          x: format(player.singularityCount)
        })
      )
      await Alert(i18next.t('main.singularityMessage2'))
      await Alert(i18next.t('main.singularityMessage3'))
      await Alert(
        i18next.t('main.singularityMessage4', {
          x: format(nextSingularityNumber),
          y: format(calculateGoldenQuarks(), 2, true),
          z: format(getQuarkBonus())
        })
      )
      await Alert(i18next.t('main.singularityMessage5'))

      confirmed = await Confirm(i18next.t('main.singularityConfirm1'))
      if (confirmed) {
        confirmed = await Confirm(i18next.t('main.singularityConfirm2'))
      }
      if (confirmed) {
        confirmed = await Confirm(i18next.t('main.singularityConfirm3'))
      }
    }

    if (!confirmed) {
      return Alert(i18next.t('main.singularityCancelled'))
    } else {
      singularity()
      saveSynergy()
      return Alert(
        i18next.t('main.welcomeToSingularity', {
          x: format(player.singularityCount)
        })
      )
    }
  }
}

export const resetConfirmation = async (i: string): Promise<void> => {
  if (i === 'prestige') {
    if (player.toggles[28]) {
      const r = await Confirm(i18next.t('main.prestigePrompt'))
      if (r) {
        resetachievementcheck(1)
        reset('prestige')
      }
    } else {
      resetachievementcheck(1)
      reset('prestige')
    }
  }
  if (i === 'transcend') {
    if (player.toggles[29]) {
      const z = await Confirm(i18next.t('main.transcendPrompt'))
      if (z) {
        resetachievementcheck(2)
        reset('transcension')
      }
    } else {
      resetachievementcheck(2)
      reset('transcension')
    }
  }
  if (i === 'reincarnate') {
    if (player.currentChallenge.ascension !== 12) {
      if (player.toggles[30]) {
        const z = await Confirm(i18next.t('main.reincarnatePrompt'))
        if (z) {
          resetachievementcheck(3)
          reset('reincarnation')
        }
      } else {
        resetachievementcheck(3)
        reset('reincarnation')
      }
    }
  }
  if (i === 'ascend') {
    const z = !player.toggles[31] || (await Confirm(i18next.t('main.ascendPrompt')))
    if (z) {
      reset('ascension')
    }
  }
}

export const updateEffectiveLevelMult = (): void => {
  G.effectiveLevelMult = 1
  G.effectiveLevelMult *= 1
    + (player.researches[4] / 10)
      * (1 + (1 / 2) * CalcECC('ascension', player.challengecompletions[14])) // Research 1x4
  G.effectiveLevelMult *= 1 + player.researches[21] / 100 // Research 2x6
  G.effectiveLevelMult *= 1 + player.researches[90] / 100 // Research 4x15
  G.effectiveLevelMult *= 1 + player.researches[131] / 200 // Research 6x6
  G.effectiveLevelMult *= 1 + ((player.researches[161] / 200) * 3) / 5 // Research 7x11
  G.effectiveLevelMult *= 1 + ((player.researches[176] / 200) * 2) / 5 // Research 8x1
  G.effectiveLevelMult *= 1 + ((player.researches[191] / 200) * 1) / 5 // Research 8x16
  G.effectiveLevelMult *= 1 + ((player.researches[146] / 200) * 4) / 5 // Research 6x21
  G.effectiveLevelMult *= 1
    + ((0.01 * Math.log(player.talismanShards + 1)) / Math.log(4))
      * Math.min(1, player.constantUpgrades[9])
  G.effectiveLevelMult *= G.challenge15Rewards.runeBonus.value
}

export const fastUpdates = (): void => {
  updateAll()
  htmlInserts()
}

export const slowUpdates = (): void => {
  buttoncolorchange()
  buildingAchievementCheck()
}

export const constantIntervals = (): void => {
  setInterval(saveSynergy, 5000)
  setInterval(slowUpdates, 200)
  setInterval(fastUpdates, 50)
  setInterval(campaignIconHTMLUpdates, 15000)

  if (!G.timeWarp) {
    exitOffline()
  }
}

let lastUpdate = 0

export const createTimer = (): void => {
  lastUpdate = performance.now()
  setInterval(tick, 5)
}

const dt = 5
const filterStrength = 20
let deltaMean = 0

const loadingDate = new Date()
const loadingBasePerfTick = performance.now()

// performance.now() doesn't always reset on reload, so we capture a "base value"
// to keep things stable
// The returned time is pinned to when the page itself was loaded to remain
// resilient against changed system clocks
export const getTimePinnedToLoadDate = () => {
  return loadingDate.getTime() + (performance.now() - loadingBasePerfTick)
}

const tick = () => {
  const now = performance.now()
  let delta = now - lastUpdate
  // compute pseudo-average delta cf. https://stackoverflow.com/a/5111475/343834
  deltaMean += (delta - deltaMean) / filterStrength
  let dtEffective: number
  while (delta > 5) {
    // tack will compute dtEffective milliseconds of game time
    dtEffective = dt
    // If the mean lag (deltaMean) is more than a whole frame (16ms), compensate by computing deltaMean - dt ms, up to 1 hour
    dtEffective += deltaMean > 16 ? Math.min(3600 * 1000, deltaMean - dt) : 0
    // compute at max delta ms to avoid negative delta
    dtEffective = Math.min(delta, dtEffective)
    // run tack and record timings
    tack(dtEffective / 1000)
    lastUpdate += dtEffective
    delta -= dtEffective
  }
}

const tack = (dt: number) => {
  if (!G.timeWarp) {
    // Adds Resources (coins, ants, etc)
    const timeMult = calculateGlobalSpeedMult()
    resourceGain(dt * timeMult)
    // Adds time (in milliseconds) to all reset functions, and quarks timer.
    addTimers('prestige', dt)
    addTimers('transcension', dt)
    addTimers('reincarnation', dt)
    addTimers('ascension', dt)
    addTimers('quarks', dt)
    addTimers('goldenQuarks', dt)
    addTimers('octeracts', dt)
    addTimers('singularity', dt)
    addTimers('autoPotion', dt)
    addTimers('ambrosia', dt)
    addTimers('redAmbrosia', dt)

    // Triggers automatic rune sacrifice (adds milliseconds to payload timer)
    if (player.shopUpgrades.offeringAuto > 0 && player.autoSacrificeToggle) {
      automaticTools('runeSacrifice', dt)
    }

    // Triggers automatic ant sacrifice (adds milliseonds to payload timers)
    if (player.achievements[173] === 1) {
      automaticTools('antSacrifice', dt)
    }

    /*Triggers automatic obtainium gain if research [2x11] is unlocked,
        Otherwise it just calculates obtainium multiplier values. */
    if (player.researches[61] === 1) {
      automaticTools('addObtainium', dt)
    } else {
      calculateObtainium()
    }

    // Automatically tries and buys researches lol
    if (
      player.autoResearchToggle
      && player.autoResearch > 0
      && player.autoResearch <= maxRoombaResearchIndex(player)
      && (autoResearchEnabled() || player.autoResearchMode === 'manual')
    ) {
      // buyResearch() probably shouldn't even be called if player.autoResearch exceeds the highest unlocked research
      let counter = 0
      const maxCount = 1 + player.challengecompletions[14]
      while (counter < maxCount) {
        if (player.autoResearch > 0) {
          const linGrowth = player.autoResearch === 200 ? 0.01 : 0
          if (!buyResearch(player.autoResearch, true, linGrowth)) {
            break
          }
        } else {
          break
        }
        counter++
      }
    }
  }

  // Adds an offering every 2 seconds
  if (player.highestchallengecompletions[3] > 0) {
    automaticTools('addOfferings', dt / 2)
  }

  // Adds an offering every 1/(cube upgrade 1x2) seconds. It shares a timer with the one above.
  if (player.cubeUpgrades[2] > 0) {
    automaticTools('addOfferings', dt * player.cubeUpgrades[2])
  }

  runChallengeSweep(dt)

  // Check for automatic resets
  // Auto Prestige. === 1 indicates amount, === 2 indicates time.
  if (player.resettoggle1 === 1 || player.resettoggle1 === 0) {
    if (
      player.toggles[15]
      && player.achievements[43] === 1
      && G.prestigePointGain.gte(
        player.prestigePoints.times(Decimal.pow(10, player.prestigeamount))
      )
      && player.coinsThisPrestige.gte(1e16)
    ) {
      resetachievementcheck(1)
      reset('prestige', true)
    }
  }
  if (player.resettoggle1 === 2) {
    G.autoResetTimers.prestige += dt
    const time = Math.max(0.01, player.prestigeamount)
    if (
      player.toggles[15]
      && player.achievements[43] === 1
      && G.autoResetTimers.prestige >= time
      && player.coinsThisPrestige.gte(1e16)
    ) {
      resetachievementcheck(1)
      reset('prestige', true)
    }
  }

  if (player.resettoggle2 === 1 || player.resettoggle2 === 0) {
    if (
      player.toggles[21]
      && player.upgrades[89] === 1
      && G.transcendPointGain.gte(
        player.transcendPoints.times(Decimal.pow(10, player.transcendamount))
      )
      && player.coinsThisTranscension.gte(1e100)
      && player.currentChallenge.transcension === 0
    ) {
      resetachievementcheck(2)
      reset('transcension', true)
    }
  }
  if (player.resettoggle2 === 2) {
    G.autoResetTimers.transcension += dt
    const time = Math.max(0.01, player.transcendamount)
    if (
      player.toggles[21]
      && player.upgrades[89] === 1
      && G.autoResetTimers.transcension >= time
      && player.coinsThisTranscension.gte(1e100)
      && player.currentChallenge.transcension === 0
    ) {
      resetachievementcheck(2)
      reset('transcension', true)
    }
  }

  if (player.currentChallenge.ascension !== 12) {
    G.autoResetTimers.reincarnation += dt
    if (player.resettoggle3 === 2) {
      const time = Math.max(0.01, player.reincarnationamount)
      if (
        player.toggles[27]
        && player.researches[46] > 0.5
        && player.transcendShards.gte('1e300')
        && G.autoResetTimers.reincarnation >= time
        && player.currentChallenge.transcension === 0
        && player.currentChallenge.reincarnation === 0
      ) {
        resetachievementcheck(3)
        reset('reincarnation', true)
      }
    }
    if (player.resettoggle3 === 1 || player.resettoggle3 === 0) {
      if (
        player.toggles[27]
        && player.researches[46] > 0.5
        && G.reincarnationPointGain.gte(
          player.reincarnationPoints
            .add(1)
            .times(Decimal.pow(10, player.reincarnationamount))
        )
        && player.transcendShards.gte(1e300)
        && player.currentChallenge.transcension === 0
        && player.currentChallenge.reincarnation === 0
      ) {
        resetachievementcheck(3)
        reset('reincarnation', true)
      }
    }
  }
  calculateOfferings()
}

export const synergismHotkeys = (event: KeyboardEvent, key: string): void => {
  if (!player.toggles[40]) {
    return
  }

  const types = {
    coin: 'Coin',
    diamond: 'Diamonds',
    mythos: 'Mythos',
    particle: 'Particles',
    tesseract: 'Tesseracts'
  } as const

  const type = types[G.buildingSubTab]

  if (event.shiftKey) {
    let num = Number(key) - 1
    if (key === 'BACKQUOTE') {
      num = -1
    }
    if (player.challengecompletions[11] > 0 && !isNaN(num)) {
      if (num >= 0 && num < 8 + PCoinUpgradeEffects.CORRUPTION_LOADOUT_SLOT_QOL) {
        if (player.toggles[41]) {
          void Notification(
            i18next.t('main.corruptionLoadoutApplied', {
              x: num + 1,
              y: player.corruptions.saves.saves[num].name
            }),
            5000
          )
        }
        corruptionLoadLoadout(num)
      } else {
        if (player.toggles[41]) {
          void Notification(i18next.t('main.allCorruptionsZero'), 5000)
        }
        player.corruptions.next.resetCorruptions()
      }
      event.preventDefault()
    }
    return
  }

  switch (key) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5': {
      const num = Number(key) as OneToFive

      if (G.currentTab === Tabs.Buildings) {
        if (type === 'Particles') {
          buyParticleBuilding(num)
        } else if (type === 'Tesseracts') {
          buyTesseractBuilding(num)
        } else {
          buyMax(num, type)
        }
      }
      if (G.currentTab === Tabs.Upgrades) {
        categoryUpgrades(num, false)
      }
      if (G.currentTab === Tabs.Runes) {
        if (getActiveSubTab() === 0) {
          redeemShards(num)
        } else if (getActiveSubTab() === 2) {
          buyRuneBonusLevels('Blessings', num)
        } else if (getActiveSubTab() === 3) {
          buyRuneBonusLevels('Spirits', num)
        }
      }
      if (G.currentTab === Tabs.Challenges) {
        toggleChallenges(num)
        challengeDisplay(num)
      }
      break
    }

    case '6':
      if (G.currentTab === Tabs.Upgrades) {
        categoryUpgrades(6, false)
      }
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(1)
      }
      if (G.currentTab === Tabs.Challenges && player.reincarnationCount > 0) {
        toggleChallenges(6)
        challengeDisplay(6)
      }
      break
    case '7':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(2)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[113] === 1) {
        toggleChallenges(7)
        challengeDisplay(7)
      }
      break
    case '8':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(3)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[120] === 1) {
        toggleChallenges(8)
        challengeDisplay(8)
      }
      break
    case '9':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(4)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[127] === 1) {
        toggleChallenges(9)
        challengeDisplay(9)
      }
      break
    case '0':
      if (G.currentTab === Tabs.Buildings && G.buildingSubTab === 'diamond') {
        buyCrystalUpgrades(5)
      }
      if (G.currentTab === Tabs.Challenges && player.achievements[134] === 1) {
        toggleChallenges(10)
        challengeDisplay(10)
      }
      break
  }
}

export const showExitOffline = () => {
  const el = DOMCacheGetOrSet('exitOffline')
  el.style.visibility = 'visible'
  setTimeout(() => el.focus(), 100)
}

/**
 * Reloads shit.
 * @param reset if this param is passed, offline progression will not be calculated.
 */
export const reloadShit = (reset = false) => {
  clearTimers()

  // Shows a reset button when page loading seems to stop or cause an error
  const preloadDeleteGame = setTimeout(
    () => (DOMCacheGetOrSet('preloadDeleteGame').style.display = 'block'),
    10000
  )

  disableHotkeys()

  const saveObject = localStorage.getItem('Synergysave2')

  if (saveObject) {
    const dec = LZString.decompressFromBase64(saveObject)
    const isLZString = dec !== ''

    if (isLZString) {
      if (!dec) {
        return Alert(i18next.t('save.loadFailed'))
      }

      const saveString = btoa(dec)

      if (saveString === null) {
        return Alert(i18next.t('save.loadFailed'))
      }

      localStorage.clear()
      localStorage.setItem('Synergysave2', saveString)
      Alert(i18next.t('main.transferredFromLZ'))
    }

    loadSynergy()
  }

  initRedAmbrosiaUpgrades(player.redAmbrosiaUpgrades)

  if (!reset) {
    calculateOffline()
  } else {
    if (!player.singularityChallenges.limitedTime.rewards.preserveQuarks) {
      player.worlds.reset()
    }

    if (!saveSynergy()) {
      return
    }
  }

  toggleTheme(true)
  settingAnnotation()
  toggleIconSet()
  toggleauto()
  htmlInserts()
  createTimer()

  // Reset Displays
  changeTab(Tabs.Buildings)

  changeSubTab(Tabs.Buildings, { page: 0 })
  changeSubTab(Tabs.Runes, { page: 0 }) // Set 'runes' subtab back to 'runes' tab
  changeSubTab(Tabs.Challenges, { page: 0 }) // Set 'challenges' subtab back to 'normal' tab
  changeSubTab(Tabs.WowCubes, { page: 0 }) // Set 'cube tribues' subtab back to 'cubes' tab
  changeSubTab(Tabs.Corruption, { page: 0 }) // set 'corruption main'
  changeSubTab(Tabs.Singularity, { page: 0 }) // set 'singularity main'
  changeSubTab(Tabs.Settings, { page: 0 }) // set 'statistics main'

  dailyResetCheck()
  setInterval(dailyResetCheck, 30000)

  constantIntervals()
  changeTabColor()

  eventCheck()
    .catch(() => {})
    .finally(() => {
      setInterval(
        () =>
          eventCheck().catch((error: Error) => {
            console.error(error)
          }),
        1000 * 60 * 5
      )
    })
  showExitOffline()
  campaignIconHTMLUpdates()
  campaignTokenRewardHTMLUpdate()
  clearTimeout(preloadDeleteGame)

  if (localStorage.getItem('pleaseStar') === null) {
    void Alert(i18next.t('main.starRepo'))
    localStorage.setItem('pleaseStar', '')
  }

  // All versions of Chrome and Firefox supported by the game have this API,
  // but not all versions of Edge and Safari do.
  if (
    typeof navigator.storage?.persist === 'function'
    && typeof navigator.storage?.persisted === 'function'
  ) {
    navigator.storage.persisted()
      .then((persistent) => persistent ? Promise.resolve(false) : navigator.storage.persist())
      .then((isPersistentNow) => {
        if (isPersistentNow) {
          void Alert(i18next.t('main.dataPersistent'))
        }
      })
  }

  const saveType = DOMCacheGetOrSet('saveType') as HTMLInputElement
  saveType.checked = localStorage.getItem('copyToClipboard') !== null
}

window.addEventListener('load', async () => {
  if (dev) {
    const { worker } = await import('./mock/browser')
    await worker.start({
      serviceWorker: {
        url: './mockServiceWorker.js'
      }
    })
  }

  await i18nInit()
  handleLogin().catch(console.error)

  try {
    await initializePCoinCache()
  } catch (e) {
    console.error(e)
    const response = await Confirm(
      'PseudoCoin bonuses weren\'t fetched, if you have purchased upgrades they will not take effect. '
        + 'Press OK to continue to the game without upgrades.'
    )

    if (!response) return
  }

  const ver = DOMCacheGetOrSet('versionnumber')
  const addZero = (n: number) => `${n}`.padStart(2, '0')
  if (ver instanceof HTMLElement) {
    const textUpdate = !isNaN(lastUpdated.getTime())
      ? ` [Last Update: ${addZero(lastUpdated.getHours())}:${
        addZero(
          lastUpdated.getMinutes()
        )
      } UTC ${addZero(lastUpdated.getDate())}-${
        lastUpdated.toLocaleString(
          'en-us',
          { month: 'short' }
        )
      }-${lastUpdated.getFullYear()}].`
      : ''
    ver.textContent = `You're ${testing ? 'testing' : 'playing'} v${version} - The Alternate Reality${textUpdate} ${
      testing ? i18next.t('testing.saveInLive') : ''
    }`
  }
  document.title = `Synergism v${version}`

  generateEventHandlers()
  corruptionButtonsAdd()
  corruptionLoadoutTableCreate()
  createCampaignIconHTMLS()
  initRedAmbrosiaUpgrades(player.redAmbrosiaUpgrades)
  reloadShit()
}, { once: true })

window.addEventListener('unload', () => {
  // This fixes a bug in Chrome (who would have guessed?) that
  // wouldn't properly load elements if the user scrolled down
  // and reloaded a page. Why is this a bug, Chrome? Why would
  // a page that is reloaded be affected by what the user did
  // beforehand? How does anyone use this buggy browser???????
  window.scrollTo(0, 0)
})
