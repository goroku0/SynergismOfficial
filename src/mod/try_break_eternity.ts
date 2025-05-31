import Decimal, { type DecimalSource } from 'break_eternity.js'
import DecimalOld from 'break_infinity.js'
import { player, resetCheck, updateEffectiveLevelMult } from '../Synergism'
import { Globals as G } from '../Variables'
import {
  autoAscensionChallengeSweepUnlock,
  CalcECC,
  challenge15ScoreMultiplier,
  getNextChallenge} from '../Challenges'
import {
  hepteractEffective} from '../Hepteracts'
import { calculateRuneLevels, calculateSigmoidExponential, isShopTalismanUnlocked } from '../Calculate'
import { achievementaward } from '../Achievements'
import { autoBuyAnts } from '../Ants'
import { autoUpgrades } from '../Automation'
import { buyCrystalUpgrades, type TesseractBuildings, calculateTessBuildingsInBudget, buyTesseractBuilding, getReductionValue, getCost } from '../Buy'
import { boostAccelerator } from './Buy_moded'
import { buyMultiplier } from './Buy_moded'
import { buyParticleBuilding } from './Buy_moded'
import { buyMax } from './Buy_moded'
import { reset } from '../Reset'
import { c15RewardUpdate } from '../Statistics'
import { buyTalismanEnhance, calculateMaxTalismanLevel, buyTalismanLevels, updateTalismanInventory } from '../Talismans'
import type { OneToFive, ZeroToFour } from '../types/Synergism'
import { revealStuff, updateChallengeLevel } from '../UpdateHTML'
import { getConstUpgradeMetadata, buyConstantUpgrades } from '../Upgrades'
import { buyAccelerator } from './Buy_moded'

export const updateAccelerator = (): void => {
  let a = new Decimal(0)

  G.totalAccelerator = new Decimal(player.acceleratorBought)
  G.costDivisor = 1

  if (player.upgrades[8] !== 0) {
    a = a.add(Decimal.floor(player.multiplierBought.div(7)))
  }
  if (player.upgrades[21] !== 0) {
    a = a.add(5)
  }
  if (player.upgrades[22] !== 0) {
    a = a.add(4)
  }
  if (player.upgrades[23] !== 0) {
    a = a.add(3)
  }
  if (player.upgrades[24] !== 0) {
    a = a.add(2)
  }
  if (player.upgrades[25] !== 0) {
    a = a.add(1)
  }
  if (player.upgrades[27] !== 0) {
    const playercoins = player.coins
    a = a.add(
      Decimal.min(250, Decimal.floor(Decimal.log(playercoins.add(1), 1e3)))
        .add(
          Decimal.min(
            1750,
            Decimal.max(
              0,
              Decimal.floor(Decimal.log(playercoins.add(1), 1e15)).sub(50)
            )
          )
        )
    )
  }
  if (player.upgrades[29] !== 0) {
    a = a.add(
      Decimal.floor(
        Decimal.min(
          2000,
          player.firstOwnedCoin
            .add(player.secondOwnedCoin)
            .add(player.thirdOwnedCoin)
            .add(player.fourthOwnedCoin)
            .add(player.fifthOwnedCoin)
            .div(80)
        )
      )
    )
  }
  if (player.upgrades[32] !== 0) {
    const playerprestige = player.prestigePoints
    a = a.add(
      Decimal.min(
        500,
        Decimal.floor(Decimal.log(playerprestige.add(1), 1e25))
      )
    )
  }
  if (player.upgrades[45] !== 0) {
    const playertranscend = player.transcendShards
    a = a.add(
      Decimal.min(
        2500,
        Decimal.floor(Decimal.log(playertranscend.add(1), 10))
      )
    )
  }
  if (player.achievements[5] !== 0) {
    a = a.add(Decimal.floor(player.firstOwnedCoin.div(500)))
  }
  if (player.achievements[12] !== 0) {
    a = a.add(Decimal.floor(player.secondOwnedCoin.div(500)))
  }
  if (player.achievements[19] !== 0) {
    a = a.add(Decimal.floor(player.thirdOwnedCoin.div(500)))
  }
  if (player.achievements[26] !== 0) {
    a = a.add(Decimal.floor(player.fourthOwnedCoin.div(500)))
  }
  if (player.achievements[33] !== 0) {
    a = a.add(Decimal.floor(player.fifthOwnedCoin.div(500)))
  }
  if (player.achievements[60] !== 0) {
    a = a.add(2)
  }
  if (player.achievements[61] !== 0) {
    a = a.add(2)
  }
  if (player.achievements[62] !== 0) {
    a = a.add(2)
  }

  a = a.add(Decimal.mul(5, CalcECC('transcend', player.challengecompletions[2])))
  G.freeUpgradeAccelerator = a
  a = a.add(
    Decimal.mul(
      G.totalAcceleratorBoost,
      (4
        + 2 * player.researches[18]
        + 2 * player.researches[19]
        + 3 * player.researches[20]
        + G.cubeBonusMultiplier[1])
    )
  )
  if (player.unlocks.prestige) {
    a = a.add(
      Decimal.floor(
        Decimal.pow(
          (G.rune1level * G.effectiveLevelMult) / 4,
          1.25
        )
      )
    )
    a = a.mul(1 + ((G.rune1level * 1) / 400) * G.effectiveLevelMult)
  }

  calculateAcceleratorMultiplier()
  a = a.mul(G.acceleratorMultiplier)
  a = Decimal.pow(
    a,
    Decimal.min(
      1,
      (1 + player.platonicUpgrades[6] / 30)
        * G.viscosityPower[player.corruptions.used.viscosity]
    )
  )
  a = a.add(Decimal.mul(2000, hepteractEffective('accelerator')))
  a = a.mul(G.challenge15Rewards.accelerator.value)
  a = a.mul(1 + (3 / 10000) * hepteractEffective('accelerator'))
  a = Decimal.floor(a)

  if (player.corruptions.used.viscosity >= 15) {
    a = Decimal.pow(a, 0.2)
  }
  if (player.corruptions.used.viscosity >= 16) {
    a = new Decimal(1)
  }

  G.freeAccelerator = a
  G.totalAccelerator = Decimal.add(G.totalAccelerator, G.freeAccelerator)

  G.tuSevenMulti = 1

  if (player.upgrades[46] > 0.5) {
    G.tuSevenMulti = 1.05
  }

  G.acceleratorPower = Decimal.pow(
    new Decimal(1.1)
      .add(
        new Decimal(G.tuSevenMulti)
          .mul(G.totalAcceleratorBoost)
          .div(100)
          .mul(
            new Decimal(1)
              .add(
                new Decimal(CalcECC('transcend', player.challengecompletions[2])).div(20)
              )
          )
      ),
    new Decimal(1).add(
      new Decimal(0.04).mul(CalcECC('reincarnation', player.challengecompletions[7]))
    )
  )
  G.acceleratorPower = G.acceleratorPower
    .add(
      new Decimal(1)
        .div(200)
        .mul(
          Decimal.floor(
            new Decimal(CalcECC('transcend', player.challengecompletions[2])).div(2)
          )
        )
        .mul(100)
        .div(100)
    )
  for (let i = 1; i <= 5; i++) {
    if (player.achievements[7 * i - 4] > 0) {
      G.acceleratorPower = G.acceleratorPower
        .add(new Decimal(0.0005).mul(i))
    }
  }
  
  // No MA and Sadistic will always overwrite Transcend challenges starting in v2.0.0
  if (
    player.currentChallenge.reincarnation !== 7
    && player.currentChallenge.reincarnation !== 10
  ) {
    if (player.currentChallenge.transcension === 1) {
      G.acceleratorPower = Decimal.mul(G.acceleratorPower, 25 / (50 + player.challengecompletions[1]))
      G.acceleratorPower = Decimal.add(G.acceleratorPower, 0.55)
      G.acceleratorPower = Decimal.max(1, G.acceleratorPower)
    }
    if (player.currentChallenge.transcension === 2) {
      G.acceleratorPower = new Decimal(1)
    }
    if (player.currentChallenge.transcension === 3) {
      G.acceleratorPower = new Decimal(1.05)
        .add(new Decimal(2)
          .mul(G.tuSevenMulti)
          .mul(G.totalAcceleratorBoost.div(300))
          .mul(1 + CalcECC('transcend', player.challengecompletions[2]) / 20))
  }
  }
  if (player.currentChallenge.reincarnation === 7) {
    G.acceleratorPower = new Decimal(1)
  }
  if (player.currentChallenge.reincarnation === 10) {
    G.acceleratorPower = new Decimal(1)
  }

  if (player.currentChallenge.transcension !== 1) {
    G.acceleratorEffect = Decimal.pow(G.acceleratorPower, G.totalAccelerator)
  }

  if (player.currentChallenge.transcension === 1) {
    G.acceleratorEffect = Decimal.pow(
      G.acceleratorPower,
      G.totalAccelerator.add(G.totalMultiplier)
    )
  }
  G.acceleratorEffectDisplay = G.acceleratorPower.mul(100).sub(100)
  if (player.currentChallenge.reincarnation === 10) {
    G.acceleratorEffect = new Decimal(1)
  }
  G.generatorPower = new Decimal(1)
  if (
    player.upgrades[11] > 0.5
    && player.currentChallenge.reincarnation !== 7
  ) {
    G.generatorPower = Decimal.pow(1.02, G.totalAccelerator)
  }
}


export const updateGlobalCoinMultiplier = (): void => {
  let s = new Decimal(1)
  s = s.times(G.acceleratorEffect)
  s = s.times(G.multiplierEffect)
  s = s.times(G.prestigeMultiplier)
  s = s.times(G.reincarnationMultiplier)
  s = s.times(G.antMultiplier)
  // PLAT - check
  const first6CoinUp = G.totalCoinOwned.add(1).times(
    Decimal.min(1e30, Decimal.pow(1.008, G.totalCoinOwned))
  )

  if (player.highestSingularityCount > 0) {
    s = s.times(
      Math.pow(player.goldenQuarks + 1, 1.5)
        * Math.pow(player.highestSingularityCount + 1, 2)
    )
  }
  if (player.upgrades[6] > 0.5) {
    s = s.times(first6CoinUp)
  }
  if (player.upgrades[12] > 0.5) {
    s = s.times(Decimal.min(1e4, Decimal.pow(1.01, player.prestigeCount)))
  }
  if (player.upgrades[20] > 0.5) {
    // PLAT - check
    s = s.times(Decimal.pow(G.totalCoinOwned.div(4).add(1), 10))
  }
  if (player.upgrades[41] > 0.5) {
    s = s.times(
      Decimal.min(1e30, Decimal.pow(player.transcendPoints.add(1), 1 / 2))
    )
  }
  if (player.upgrades[43] > 0.5) {
    s = s.times(Decimal.min(1e30, Decimal.pow(1.01, player.transcendCount)))
  }
  if (player.upgrades[48] > 0.5) {
    s = s.times(
      Decimal.pow(
      Decimal.div(Decimal.mul(G.totalMultiplier, G.totalAccelerator), 1000).add(1),
      8
      )
    )
  }
  if (player.currentChallenge.reincarnation === 6) {
    s = s.dividedBy(1e250)
  }
  if (player.currentChallenge.reincarnation === 7) {
    s = s.dividedBy('1e1250')
  }
  if (player.currentChallenge.reincarnation === 9) {
    s = s.dividedBy('1e2000000')
  }
  if (player.currentChallenge.reincarnation === 10) {
    s = s.dividedBy('1e12500000')
  }
  const c = Decimal.pow(s, 1 + 0.001 * player.researches[17])
  let lol = Decimal.pow(c, 1 + 0.025 * player.upgrades[123])
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[5] > 0
  ) {
    lol = Decimal.pow(lol, 1.1)
  }
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[14] > 0
  ) {
    lol = Decimal.pow(
      lol,
      new Decimal(1)
      .add(
        new Decimal(1)
        .div(20)
        .mul(player.corruptions.used.recession)
          .mul(Decimal.log(player.coins.add(1), 10))
        .div(
          new Decimal(1e7).add(Decimal.log(player.coins.add(1), 10))
        )
      )
    )
  }
  if (
    player.currentChallenge.ascension === 15
    && player.platonicUpgrades[15] > 0
  ) {
    lol = Decimal.pow(lol, 1.1)
  }
  lol = Decimal.pow(lol, G.challenge15Rewards.coinExponent.value)
  G.globalCoinMultiplier = lol
  G.globalCoinMultiplier = Decimal.pow(
    G.globalCoinMultiplier,
    G.recessionPower[player.corruptions.used.recession]
  )
  
  G.coinOneMulti = new Decimal(1)
  if (player.upgrades[1] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.times(first6CoinUp)
  }
  if (player.upgrades[10] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.times(
      Decimal.pow(2, Decimal.min(50, player.secondOwnedCoin.div(15)))
    )
  }
  if (player.upgrades[56] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.times('1e5000')
  }

  G.coinTwoMulti = new Decimal(1)
  if (player.upgrades[2] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times(first6CoinUp)
  }
  if (player.upgrades[13] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times(
      Decimal.min(
        1e50,
        Decimal.pow(
          player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1),
          4 / 3
        ).times(1e10)
      )
    )
  }
  if (player.upgrades[19] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times(
      Decimal.min(1e200, player.transcendPoints.times(1e30).add(1))
    )
  }
  if (player.upgrades[57] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times('1e7500')
  }

  G.coinThreeMulti = new Decimal(1)
  if (player.upgrades[3] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.times(first6CoinUp)
  }
  if (player.upgrades[18] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.times(
      Decimal.min(1e125, player.transcendShards.add(1))
    )
  }
  if (player.upgrades[58] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.times('1e15000')
  }

  G.coinFourMulti = new Decimal(1)
  if (player.upgrades[4] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.times(first6CoinUp)
  }
  if (player.upgrades[17] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.times(1e100)
  }
  if (player.upgrades[59] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.times('1e25000')
  }

  G.coinFiveMulti = new Decimal(1)
  if (player.upgrades[5] > 0.5) {
    G.coinFiveMulti = G.coinFiveMulti.times(first6CoinUp)
  }
  if (player.upgrades[60] > 0.5) {
    G.coinFiveMulti = G.coinFiveMulti.times('1e35000')
  }

}


export const updateCoin = (dt: number): void => {
  if (G.produceTotal.gte(0.001)) {
    const addcoin = Decimal.min(
      G.produceTotal.dividedBy(G.taxdivisor),
      Decimal.pow(10, new Decimal(G.maxexponent)
        .sub(Decimal.log(G.taxdivisorcheck, 10))
      )
    ).times(dt / 0.025)
    player.coins = player.coins.add(addcoin)
    player.coinsThisPrestige = player.coinsThisPrestige.add(addcoin)
    player.coinsThisTranscension = player.coinsThisTranscension.add(addcoin)
    player.coinsThisReincarnation = player.coinsThisReincarnation.add(addcoin)
    player.coinsTotal = player.coinsTotal.add(addcoin)
  }
}

export const to_break_eternity = (value: DecimalOld): Decimal => {
  return Decimal.pow(2, value.log2())
}
export const to_break_infinity = (value: Decimal): DecimalOld => {
  const exponent = value.log10()
  if (exponent.gt(1e300)) {
    return DecimalOld.pow(10, 1e300)
  }
  return DecimalOld.pow(10, exponent.toNumber())
}
export const to_number = (value: Decimal): number => {
  if (value.gte(1e300)) {
    return Number.MAX_VALUE
  }
  if (value.lte(-1e300)) {
    return Number.MIN_VALUE
  }
  return value.toNumber()
}
export const to_decimalNew = (value: DecimalSource): Decimal => {
  return new Decimal(value)
}
export const is_decimalNew = (value: unknown): value is Decimal => {
  return value instanceof Decimal
    || (typeof value === 'object'
      && value !== null
      && Object.keys(value).length === 3
      && 'sign' in value
      && 'mag' in value
      && 'layer' in value)
}
export const format_decimalNew = (value: Decimal): string => {
  const str = value.toString()
  return str.replace(/(\d*\.\d+|\d+)(e[+-]?\d+)?/gi, (_match, numPart, expPart) => {
    const value = Number.parseFloat(numPart)
    if (value > 1e6) {
      return value.toExponential(2)
    }
    const formatted = Number.parseFloat(numPart).toFixed(2)
    return expPart ? `${formatted}${expPart}` : formatted
  })
}
  

const calculateAcceleratorMultiplier = () => {
  G.acceleratorMultiplier = 1
  G.acceleratorMultiplier *= 1 + player.achievements[60] / 100
  G.acceleratorMultiplier *= 1 + player.achievements[61] / 100
  G.acceleratorMultiplier *= 1 + player.achievements[62] / 100
  G.acceleratorMultiplier *= 1
    + (1 / 5)
    * player.researches[1]
    * (1 + (1 / 2) * CalcECC('ascension', player.challengecompletions[14]))
  G.acceleratorMultiplier *= 1
    + (1 / 20) * player.researches[6]
    + (1 / 25) * player.researches[7]
    + (1 / 40) * player.researches[8]
    + (3 / 200) * player.researches[9]
    + (1 / 200) * player.researches[10]
  G.acceleratorMultiplier *= 1 + (1 / 20) * player.researches[86]
  G.acceleratorMultiplier *= 1 + (1 / 100) * player.researches[126]
  G.acceleratorMultiplier *= 1 + (0.8 / 100) * player.researches[141]
  G.acceleratorMultiplier *= 1 + (0.6 / 100) * player.researches[156]
  G.acceleratorMultiplier *= 1 + (0.4 / 100) * player.researches[171]
  G.acceleratorMultiplier *= 1 + (0.2 / 100) * player.researches[186]
  G.acceleratorMultiplier *= 1 + (0.01 / 100) * player.researches[200]
  G.acceleratorMultiplier *= 1 + (0.01 / 100) * player.cubeUpgrades[50]
  G.acceleratorMultiplier *= Math.pow(
    1.01,
    player.upgrades[21]
    + player.upgrades[22]
    + player.upgrades[23]
    + player.upgrades[24]
    + player.upgrades[25]
  )
  if (
    (player.currentChallenge.transcension !== 0
      || player.currentChallenge.reincarnation !== 0)
    && player.upgrades[50] > 0.5
  ) {
    G.acceleratorMultiplier *= 1.25
  }
}
export const updateAllMultiplier = (): void => {
  let a = new Decimal(0)

  if (player.upgrades[7] > 0) {
    a = a.add(Decimal.min(
      4,
      Decimal.floor(Decimal.log(player.fifthOwnedCoin.add(1), 10)).add(1)
    ))
  }
  if (player.upgrades[9] > 0) {
    a = a.add(Decimal.floor(player.acceleratorBought.div(10)))
  }
  if (player.upgrades[21] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[22] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[23] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[24] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[25] > 0) {
    a = a.add(1)
  }
  if (player.upgrades[28] > 0) {
    a = a.add(Decimal.min(
      1000,
      Decimal.floor(
        player.firstOwnedCoin
          .add(player.secondOwnedCoin)
          .add(player.thirdOwnedCoin)
          .add(player.fourthOwnedCoin)
          .add(player.fifthOwnedCoin)
          .div(160)
      )
    ))
  }
  if (player.upgrades[30] > 0) {
    a = a.add(Decimal.min(75, Decimal.floor(Decimal.log(player.coins.add(1), 1e10)))
      .add(Decimal.min(925, Decimal.floor(Decimal.log(player.coins.add(1), 1e30)))))
  }
  if (player.upgrades[33] > 0) {
    a = a.add(G.totalAcceleratorBoost)
  }
  if (player.upgrades[49] > 0) {
    a = a.add(Decimal.min(
      50,
      Decimal.floor(Decimal.log(player.transcendPoints.add(1), 1e10))
    ))
  }
  if (player.upgrades[68] > 0) {
    a = a.add(Decimal.min(2500, Decimal.floor((to_number(Decimal.log(G.taxdivisor, 10)) * 1) / 1000)))
  }
  if (player.challengecompletions[1] > 0) {
    a = a.add(1)
  }
  if (player.achievements[6] > 0.5) {
    a = a.add(Decimal.floor(player.firstOwnedCoin.div(1000)))
  }
  if (player.achievements[13] > 0.5) {
    a = a.add(Decimal.floor(player.secondOwnedCoin.div(1000)))
  }
  if (player.achievements[20] > 0.5) {
    a = a.add(Decimal.floor(player.thirdOwnedCoin.div(1000)))
  }
  if (player.achievements[27] > 0.5) {
    a = a.add(Decimal.floor(player.fourthOwnedCoin.div(1000)))
  }
  if (player.achievements[34] > 0.5) {
    a = a.add(Decimal.floor(player.fifthOwnedCoin.div(1000)))
  }
  if (player.achievements[57] > 0.5) {
    a = a.add(1)
  }
  if (player.achievements[58] > 0.5) {
    a = a.add(1)
  }
  if (player.achievements[59] > 0.5) {
    a = a.add(1)
  }
  a = a.add(
    20
    * player.researches[94]
    * Math.floor(
      (G.rune1level
        + G.rune2level
        + G.rune3level
        + G.rune4level
        + G.rune5level)
      / 8
    )
  )

  G.freeUpgradeMultiplier = a

  if (player.achievements[38] > 0.5) {
    a = a.add(
      (Math.floor(
        (Math.floor((G.rune2level / 10) * G.effectiveLevelMult)
          * Math.floor(1 + (G.rune2level / 10) * G.effectiveLevelMult))
        / 2
      )
        * 100)
      / 100
    )
  }

  a = a.mul(1 + player.achievements[57] / 100)
  a = a.mul(1 + player.achievements[58] / 100)
  a = a.mul(1 + player.achievements[59] / 100)
  a = a.mul(Decimal.pow(
    1.01,
    player.upgrades[21]
    + player.upgrades[22]
    + player.upgrades[23]
    + player.upgrades[24]
    + player.upgrades[25]
  ))
  a = a.mul(1 + 0.03 * player.upgrades[34] + 0.02 * player.upgrades[35])
  a = a.mul(
    1
    + (1 / 5)
    * player.researches[2]
    * (1 + (1 / 2) * CalcECC('ascension', player.challengecompletions[14]))
  )
  a = a.mul(
    1
    + (1 / 20) * player.researches[11]
    + (1 / 25) * player.researches[12]
    + (1 / 40) * player.researches[13]
    + (3 / 200) * player.researches[14]
    + (1 / 200) * player.researches[15]
  )
  a = a.mul(1 + (G.rune2level / 400) * G.effectiveLevelMult)
  a = a.mul(1 + (1 / 20) * player.researches[87])
  a = a.mul(1 + (1 / 100) * player.researches[128])
  a = a.mul(1 + (0.8 / 100) * player.researches[143])
  a = a.mul(1 + (0.6 / 100) * player.researches[158])
  a = a.mul(1 + (0.4 / 100) * player.researches[173])
  a = a.mul(1 + (0.2 / 100) * player.researches[188])
  a = a.mul(1 + (0.01 / 100) * player.researches[200])
  a = a.mul(1 + (0.01 / 100) * player.cubeUpgrades[50])
  a = a.mul(calculateSigmoidExponential(
    40,
    (((player.antUpgrades[4]! + G.bonusant5) / 1000) * 40) / 39
  ))
  a = a.mul(G.cubeBonusMultiplier[2])
  if ((player.currentChallenge.transcension !== 0
    || player.currentChallenge.reincarnation !== 0)
    && player.upgrades[50] > 0.5) {
    a = a.mul(1.25)
  }
  a = Decimal.pow(
    a,
    Math.min(
      1,
      (1 + player.platonicUpgrades[6] / 30)
      * G.viscosityPower[player.corruptions.used.viscosity]
    )
  )
  a = a.add(1000 * hepteractEffective('multiplier'))
  a = a.mul(G.challenge15Rewards.multiplier.value)
  a = a.mul(1 + (3 / 10000) * hepteractEffective('multiplier'))

  if (player.corruptions.used.viscosity >= 15) {
    a = Decimal.pow(a, 0.2)
  }
  if (player.corruptions.used.viscosity >= 16) {
    a = new Decimal(1)
  }

  G.freeMultiplier = a
  G.totalMultiplier = G.freeMultiplier.add(player.multiplierBought)

  G.challengeOneLog = 3

  let b = new Decimal(0)
  let c = new Decimal(0)
  b = b.add(Decimal.log(player.transcendShards.add(1), 3))
  b = b.mul(1 + (11 * player.researches[33]) / 100)
  b = b.mul(1 + (11 * player.researches[34]) / 100)
  b = b.mul(1 + (11 * player.researches[35]) / 100)
  b = b.mul(1 + player.researches[89] / 5)
  b = b.mul(1 + 10 * G.effectiveRuneBlessingPower[2])

  c = c.add(Decimal.floor(
    b.mul(0.1 * CalcECC('transcend', player.challengecompletions[1]))
  ))
  c = c.add(CalcECC('transcend', player.challengecompletions[1]) * 10)
  G.freeMultiplierBoost = c
  G.totalMultiplierBoost = Decimal.pow(
    Decimal.floor(b).add(c),
    1 + CalcECC('reincarnation', player.challengecompletions[7]) * 0.04
  )

  let c7 = 1
  if (player.challengecompletions[7] > 0.5) {
    c7 = 1.25
  }

  G.multiplierPower = Decimal.add(2, Decimal.mul(0.005, G.totalMultiplierBoost).mul(c7))

  // No MA and Sadistic will always override Transcend Challenges starting in v2.0.0
  if (player.currentChallenge.reincarnation !== 7
    && player.currentChallenge.reincarnation !== 10) {
    if (player.currentChallenge.transcension === 1) {
      G.multiplierPower = new Decimal(1)
    }
    if (player.currentChallenge.transcension === 2) {
      G.multiplierPower = new Decimal(1.25)
        .add(new Decimal(0.0012).mul(b.add(c)).mul(c7))
    }
  }

  if (player.currentChallenge.reincarnation === 7) {
    G.multiplierPower = new Decimal(1)
  }
  if (player.currentChallenge.reincarnation === 10) {
    G.multiplierPower = new Decimal(1)
  }

  G.multiplierEffect = Decimal.pow(G.multiplierPower, G.totalMultiplier)
}

export const updateAll = (): void => {
  G.uFourteenMulti = new Decimal(1)
  G.uFifteenMulti = new Decimal(1)

  if (player.upgrades[14] > 0.5) {
    G.uFourteenMulti = Decimal.pow(1.15, G.freeAccelerator)
  }
  if (player.upgrades[15] > 0.5) {
    G.uFifteenMulti = Decimal.pow(1.15, G.freeAccelerator)
  }

  if (!player.unlocks.coinone && player.coins.gte(500)) {
    player.unlocks.coinone = true
    revealStuff()
  }
  if (!player.unlocks.cointwo && player.coins.gte(10000)) {
    player.unlocks.cointwo = true
    revealStuff()
  }
  if (!player.unlocks.cointhree && player.coins.gte(100000)) {
    player.unlocks.cointhree = true
    revealStuff()
  }
  if (!player.unlocks.coinfour && player.coins.gte(4e6)) {
    player.unlocks.coinfour = true
    revealStuff()
  }
  if (player.achievements[169] === 0 && player.antPoints.gte(3)) {
    achievementaward(169)
  }
  if (player.achievements[170] === 0 && player.antPoints.gte(1e5)) {
    achievementaward(170)
  }
  if (player.achievements[171] === 0 && player.antPoints.gte(666666666)) {
    achievementaward(171)
  }
  if (player.achievements[172] === 0 && player.antPoints.gte(1e20)) {
    achievementaward(172)
  }
  if (player.achievements[173] === 0 && player.antPoints.gte(1e40)) {
    achievementaward(173)
  }
  if (player.achievements[174] === 0 && player.antPoints.gte('1e500')) {
    achievementaward(174)
  }
  if (player.achievements[175] === 0 && player.antPoints.gte('1e2500')) {
    achievementaward(175)
  }

  if (player.researches[200] >= 1e5 && player.achievements[250] < 1) {
    achievementaward(250)
  }
  if (player.cubeUpgrades[50] >= 1e5 && player.achievements[251] < 1) {
    achievementaward(251)
  }

  // Autobuy "Upgrades" Tab
  autoUpgrades()

  // Autobuy "Building" Tab
  if (player.toggles[1]
    && player.upgrades[81] === 1
    && player.coins.gt(player.firstCostCoin)) {
    buyMax(1, 'Coin')
  }
  if (player.toggles[2]
    && player.upgrades[82] === 1
    && player.coins.gt(player.secondCostCoin)) {
    buyMax(2, 'Coin')
  }
  if (player.toggles[3]
    && player.upgrades[83] === 1
    && player.coins.gt(player.thirdCostCoin)) {
    buyMax(3, 'Coin')
  }
  if (player.toggles[4]
    && player.upgrades[84] === 1
    && player.coins.gt(player.fourthCostCoin)) {
    buyMax(4, 'Coin')
  }
  if (player.toggles[5]
    && player.upgrades[85] === 1
    && player.coins.gt(player.fifthCostCoin)) {
    buyMax(5, 'Coin')
  }
  if (player.toggles[6]
    && player.upgrades[86] === 1
    && player.coins.gt(player.acceleratorCost)) {
    buyAccelerator(true)
  }
  if (player.toggles[7]
    && player.upgrades[87] === 1
    && player.coins.gt(player.multiplierCost)) {
    buyMultiplier(true)
  }
  if (player.toggles[8]
    && player.upgrades[88] === 1
    && player.prestigePoints.gt(player.acceleratorBoostCost)) {
    boostAccelerator(true)
  }

  // Autobuy "Prestige" Tab
  if (player.toggles[10]
    && player.achievements[78] === 1
    && player.prestigePoints.gt(player.firstCostDiamonds)) {
    buyMax(1, 'Diamonds')
  }
  if (player.toggles[11]
    && player.achievements[85] === 1
    && player.prestigePoints.gt(player.secondCostDiamonds)) {
    buyMax(2, 'Diamonds')
  }
  if (player.toggles[12]
    && player.achievements[92] === 1
    && player.prestigePoints.gt(player.thirdCostDiamonds)) {
    buyMax(3, 'Diamonds')
  }
  if (player.toggles[13]
    && player.achievements[99] === 1
    && player.prestigePoints.gt(player.fourthCostDiamonds)) {
    buyMax(4, 'Diamonds')
  }
  if (player.toggles[14]
    && player.achievements[106] === 1
    && player.prestigePoints.gt(player.fifthCostDiamonds)) {
    buyMax(5, 'Diamonds')
  }

  updateEffectiveLevelMult() // update before prism rune, fixes c15 bug

  let c = 0
  c += (Math.floor((G.rune3level / 16) * G.effectiveLevelMult) * 100) / 100
  if (player.upgrades[73] > 0.5
    && player.currentChallenge.reincarnation !== 0) {
    c += 10
  }
  if (player.achievements[79] > 0.5
    && player.prestigeShards.gte(
      Decimal.pow(
        10,
        G.crystalUpgradesCost[0]
        + G.crystalUpgradeCostIncrement[0]
        * Math.floor(Math.pow(player.crystalUpgrades[0] - 0.5 - c, 2) / 2)
      )
    )) {
    buyCrystalUpgrades(1, true)
  }
  if (player.achievements[86] > 0.5
    && player.prestigeShards.gte(
      Decimal.pow(
        10,
        G.crystalUpgradesCost[1]
        + G.crystalUpgradeCostIncrement[1]
        * Math.floor(Math.pow(player.crystalUpgrades[1] - 0.5 - c, 2) / 2)
      )
    )) {
    buyCrystalUpgrades(2, true)
  }
  if (player.achievements[93] > 0.5
    && player.prestigeShards.gte(
      Decimal.pow(
        10,
        G.crystalUpgradesCost[2]
        + G.crystalUpgradeCostIncrement[2]
        * Math.floor(Math.pow(player.crystalUpgrades[2] - 0.5 - c, 2) / 2)
      )
    )) {
    buyCrystalUpgrades(3, true)
  }
  if (player.achievements[100] > 0.5
    && player.prestigeShards.gte(
      Decimal.pow(
        10,
        G.crystalUpgradesCost[3]
        + G.crystalUpgradeCostIncrement[3]
        * Math.floor(Math.pow(player.crystalUpgrades[3] - 0.5 - c, 2) / 2)
      )
    )) {
    buyCrystalUpgrades(4, true)
  }
  if (player.achievements[107] > 0.5
    && player.prestigeShards.gte(
      Decimal.pow(
        10,
        G.crystalUpgradesCost[4]
        + G.crystalUpgradeCostIncrement[4]
        * Math.floor(Math.pow(player.crystalUpgrades[4] - 0.5 - c, 2) / 2)
      )
    )) {
    buyCrystalUpgrades(5, true)
  }

  // Autobuy "Transcension" Tab
  if (player.toggles[16]
    && player.upgrades[94] === 1
    && player.transcendPoints.gt(player.firstCostMythos)) {
    buyMax(1, 'Mythos')
  }
  if (player.toggles[17]
    && player.upgrades[95] === 1
    && player.transcendPoints.gt(player.secondCostMythos)) {
    buyMax(2, 'Mythos')
  }
  if (player.toggles[18]
    && player.upgrades[96] === 1
    && player.transcendPoints.gt(player.thirdCostMythos)) {
    buyMax(3, 'Mythos')
  }
  if (player.toggles[19]
    && player.upgrades[97] === 1
    && player.transcendPoints.gt(player.fourthCostMythos)) {
    buyMax(4, 'Mythos')
  }
  if (player.toggles[20]
    && player.upgrades[98] === 1
    && player.transcendPoints.gt(player.fifthCostMythos)) {
    buyMax(5, 'Mythos')
  }

  // Autobuy "Reincarnation" Tab
  if (player.toggles[22]
    && player.cubeUpgrades[7] === 1
    && player.reincarnationPoints.gt(player.firstCostParticles)) {
    buyParticleBuilding(1, true)
  }
  if (player.toggles[23]
    && player.cubeUpgrades[7] === 1
    && player.reincarnationPoints.gt(player.secondCostParticles)) {
    buyParticleBuilding(2, true)
  }
  if (player.toggles[24]
    && player.cubeUpgrades[7] === 1
    && player.reincarnationPoints.gt(player.thirdCostParticles)) {
    buyParticleBuilding(3, true)
  }
  if (player.toggles[25]
    && player.cubeUpgrades[7] === 1
    && player.reincarnationPoints.gt(player.fourthCostParticles)) {
    buyParticleBuilding(4, true)
  }
  if (player.toggles[26]
    && player.cubeUpgrades[7] === 1
    && player.reincarnationPoints.gt(player.fifthCostParticles)) {
    buyParticleBuilding(5, true)
  }

  // Autobuy "ascension" tab
  if (player.researches[175] > 0) {
    for (let i = 1; i <= 10; i++) {
      if (player.ascendShards.gte(getConstUpgradeMetadata(i).pop()!)) {
        buyConstantUpgrades(i, true)
      }
    }
  }

  // Autobuy tesseract buildings (Mode: AMOUNT)
  if (player.researches[190] > 0
    && player.tesseractAutoBuyerToggle === 1
    && player.resettoggle4 < 2) {
    const ownedBuildings: TesseractBuildings = [null, null, null, null, null]
    for (let i = 1; i <= 5; i++) {
      if (player.autoTesseracts[i]) {
        ownedBuildings[i - 1] = player[`ascendBuilding${i as OneToFive}` as const].owned
      }
    }
    const budget = Number(player.wowTesseracts) - player.tesseractAutoBuyerAmount
    const buyToBuildings = calculateTessBuildingsInBudget(
      ownedBuildings,
      budget
    )
    // Prioritise buying buildings from highest tier to lowest,
    // in case there are any off-by-ones or floating point errors.
    for (let i = 5; i >= 1; i--) {
      const buyFrom = ownedBuildings[i - 1]
      const buyTo = buyToBuildings[i - 1]
      if (buyFrom !== null && buyTo !== null && buyTo !== buyFrom) {
        buyTesseractBuilding(i as OneToFive, buyTo - buyFrom)
      }
    }
  }

  // Talismans
  if (player.researches[130] > 0 || player.researches[135] > 0) {
    const talismansUnlocked = [
      player.achievements[119] > 0,
      player.achievements[126] > 0,
      player.achievements[133] > 0,
      player.achievements[140] > 0,
      player.achievements[147] > 0,
      player.antUpgrades[11]! > 0 || player.ascensionCount > 0,
      isShopTalismanUnlocked()
    ]
    let upgradedTalisman = false

    // First, we need to enhance all of the talismans. Then, we can fortify all of the talismans.
    // If we were to do this in one loop, the players resources would be drained on individual expensive levels
    // of early talismans before buying important enhances for the later ones. This results in drastically
    // reduced overall gains when talisman resources are scarce.
    if (player.autoEnhanceToggle && player.researches[135] > 0) {
      for (let i = 0; i < talismansUnlocked.length; ++i) {
        if (talismansUnlocked[i] && player.talismanRarity[i] < 6) {
          upgradedTalisman = buyTalismanEnhance(i, true) || upgradedTalisman
        }
      }
    }

    if (player.autoFortifyToggle && player.researches[130] > 0) {
      for (let i = 0; i < talismansUnlocked.length; ++i) {
        const maxTalismanLevel = calculateMaxTalismanLevel(i)
        if (talismansUnlocked[i]
          && player.talismanLevels[i] < maxTalismanLevel) {
          upgradedTalisman = buyTalismanLevels(i, true) || upgradedTalisman
        }
      }
    }

    // Recalculate talisman-related upgrades and display on success
    if (upgradedTalisman) {
      updateTalismanInventory()
      calculateRuneLevels()
    }
  }

  // Generation
  if (player.upgrades[101] > 0.5) {
    player.fourthGeneratedCoin = player.fourthGeneratedCoin.add(
      player.fifthGeneratedCoin
        .add(player.fifthOwnedCoin)
        .times(G.uFifteenMulti)
        .times(G.generatorPower)
    )
  }
  if (player.upgrades[102] > 0.5) {
    player.thirdGeneratedCoin = player.thirdGeneratedCoin.add(
      player.fourthGeneratedCoin
        .add(player.fourthOwnedCoin)
        .times(G.uFourteenMulti)
        .times(G.generatorPower)
    )
  }
  if (player.upgrades[103] > 0.5) {
    player.secondGeneratedCoin = player.secondGeneratedCoin.add(
      player.thirdGeneratedCoin
        .add(player.thirdOwnedCoin)
        .times(G.generatorPower)
    )
  }
  if (player.upgrades[104] > 0.5) {
    player.firstGeneratedCoin = player.firstGeneratedCoin.add(
      player.secondGeneratedCoin
        .add(player.secondOwnedCoin)
        .times(G.generatorPower)
    )
  }
  if (player.upgrades[105] > 0.5) {
    player.fifthGeneratedCoin = player.fifthGeneratedCoin.add(
      player.firstOwnedCoin
    )
  }
  let p = 1
  p += (1 / 100)
    * (player.achievements[71]
      + player.achievements[72]
      + player.achievements[73]
      + player.achievements[74]
      + player.achievements[75]
      + player.achievements[76]
      + player.achievements[77])

  let a = 0
  if (player.upgrades[106] > 0.5) {
    a += 0.1
  }
  if (player.upgrades[107] > 0.5) {
    a += 0.15
  }
  if (player.upgrades[108] > 0.5) {
    a += 0.25
  }
  if (player.upgrades[109] > 0.5) {
    a += 0.25
  }
  if (player.upgrades[110] > 0.5) {
    a += 0.25
  }
  a *= p

  let b = 0
  if (player.upgrades[111] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[112] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[113] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[114] > 0.5) {
    b += 0.08
  }
  if (player.upgrades[115] > 0.5) {
    b += 0.08
  }
  b *= p

  c = 0
  if (player.upgrades[116] > 0.5) {
    c += 0.05
  }
  if (player.upgrades[117] > 0.5) {
    c += 0.05
  }
  if (player.upgrades[118] > 0.5) {
    c += 0.05
  }
  if (player.upgrades[119] > 0.5) {
    c += 0.05
  }
  if (player.upgrades[120] > 0.5) {
    c += 0.05
  }
  c *= p

  if (a !== 0) {
    player.fifthGeneratedCoin = player.fifthGeneratedCoin.add(
      Decimal.pow(
        player.firstGeneratedDiamonds.add(player.firstOwnedDiamonds).add(1),
        a
      )
    )
  }
  if (b !== 0) {
    player.fifthGeneratedDiamonds = player.fifthGeneratedDiamonds.add(
      Decimal.pow(
        player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1),
        b
      )
    )
  }
  if (c !== 0) {
    player.fifthGeneratedMythos = player.fifthGeneratedMythos.add(
      Decimal.pow(
        player.firstGeneratedParticles.add(player.firstOwnedParticles).add(1),
        c
      )
    )
  }

  if (player.runeshards > player.maxofferings) {
    player.maxofferings = player.runeshards
  }
  if (player.researchPoints > player.maxobtainium) {
    player.maxobtainium = player.researchPoints
  }

  if (isNaN(player.runeshards)) {
    player.runeshards = 0
  }
  if (player.runeshards > 1e300) {
    player.runeshards = 1e300
  }
  if (isNaN(player.researchPoints)) {
    player.researchPoints = 0
  }
  if (player.researchPoints > 1e300) {
    player.researchPoints = 1e300
  }

  G.optimalOfferingTimer = 600
    + 30 * player.researches[85]
    + 0.4 * G.rune5level
    + 120 * player.shopUpgrades.offeringEX
  G.optimalObtainiumTimer = 3600 + 120 * player.shopUpgrades.obtainiumEX
  autoBuyAnts()

  if (player.autoAscend
    && player.challengecompletions[11] > 0
    && player.cubeUpgrades[10] > 0
    && player.currentChallenge.reincarnation !== 10) {
    let ascension = false
    if (player.autoAscendMode === 'c10Completions'
      && player.challengecompletions[10] >= Math.max(1, player.autoAscendThreshold)) {
      ascension = true
    }
    if (player.autoAscendMode === 'realAscensionTime'
      && player.ascensionCounterRealReal
      >= Math.max(0.1, player.autoAscendThreshold)) {
      ascension = true
    }
    if (ascension && player.challengecompletions[10] > 0) {
      // Auto Ascension and Auto Challenge Sweep enables rotation of the Ascension Challenge
      if (autoAscensionChallengeSweepUnlock()
        && player.currentChallenge.ascension !== 0
        && player.retrychallenges
        && player.researches[150] === 1
        && player.autoChallengeRunning) {
        let nextChallenge = getNextChallenge(
          player.currentChallenge.ascension + 1,
          false,
          11,
          15
        )
        if (nextChallenge <= 15
          && player.currentChallenge.ascension !== nextChallenge) {
          void resetCheck('ascensionChallenge', false, true)
          player.currentChallenge.ascension = nextChallenge
          reset('ascensionChallenge', false)
        } else {
          nextChallenge = getNextChallenge(
            player.currentChallenge.ascension + 1,
            true,
            11,
            15
          )
          void resetCheck('ascensionChallenge', false, true)
          player.currentChallenge.ascension = nextChallenge <= 15 ? nextChallenge : 0
          reset('ascensionChallenge', false)
        }
      } else {
        if (player.currentChallenge.ascension !== 0) {
          void resetCheck('ascensionChallenge', false, true)
          reset('ascensionChallenge', false)
        } else {
          reset('ascension', false)
        }
      }
    }
  }

  let metaData = null
  if (player.researches[175] > 0) {
    for (let i = 1; i <= 10; i++) {
      metaData = getConstUpgradeMetadata(i)
      if (player.ascendShards.gte(metaData[1])) {
        buyConstantUpgrades(i, true)
      }
    }
  }

  const reductionValue = getReductionValue()
  if (reductionValue !== G.prevReductionValue) {
    G.prevReductionValue = reductionValue
    const resources = ['Coin', 'Diamonds', 'Mythos'] as const

    for (let res = 0; res < resources.length; ++res) {
      const resource = resources[res]
      for (let ord = 0; ord < 5; ++ord) {
        const num = G.ordinals[ord as ZeroToFour]
        player[`${num}Cost${resource}` as const] = getCost(
          (ord + 1) as OneToFive,
          resource,
          player[`${num}Owned${resource}` as const].add(1),
          reductionValue
        )
      }
    }

    for (let i = 0; i <= 4; i++) {
      const particleOriginalCost = [1, 1e2, 1e4, 1e8, 1e16]
      const num = G.ordinals[i as ZeroToFour]
      const buyTo = player[`${num}OwnedParticles`].add(1)
      player[`${num}CostParticles` as const] = new Decimal(
        Decimal.pow(2, buyTo.sub(1)).times(
          Decimal.pow(
            1.001,
            (Decimal.max(0, buyTo.sub(325000)).mul(Decimal.max(0, buyTo.sub(325000).add(1)))).div(2)
          )
        )
      ).times(particleOriginalCost[i])
    }
  }

  // Challenge 15 autoupdate
  if (player.shopUpgrades.challenge15Auto > 0
    && player.currentChallenge.ascension === 15) {
    const c15SM = challenge15ScoreMultiplier()
    if (player.coins.gte(Decimal.pow(10, player.challenge15Exponent / c15SM))) {
      player.challenge15Exponent = to_number(Decimal.log(player.coins.add(1), 10)) * c15SM
      c15RewardUpdate()
      updateChallengeLevel(15)
    }
  }
}

