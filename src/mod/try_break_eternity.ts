import Decimal, { type DecimalSource } from 'break_eternity.js'
import DecimalOld from 'break_infinity.js'
import { player } from '../Synergism'
import { Globals as G } from '../Variables'
import {
  CalcECC} from '../Challenges'
import {
  hepteractEffective} from '../Hepteracts'

export const updateAccelerator = (): void => {
  let a = new Decimal(0)

  G.totalAccelerator = new Decimal(player.acceleratorBought)
  G.costDivisor = 1

  if (player.upgrades[8] !== 0) {
    a = a.add(Decimal.floor(player.multiplierBought / 7))
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
    const playercoins = to_break_eternity(player.coins)
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
          (player.firstOwnedCoin
            + player.secondOwnedCoin
            + player.thirdOwnedCoin
            + player.fourthOwnedCoin
            + player.fifthOwnedCoin)
            / 80
        )
      )
    )
  }
  if (player.upgrades[32] !== 0) {
    const playerprestige = to_break_eternity(player.prestigePoints)
    a = a.add(
      Decimal.min(
        500,
        Decimal.floor(Decimal.log(playerprestige.add(1), 1e25))
      )
    )
  }
  if (player.upgrades[45] !== 0) {
    const playertranscend = to_break_eternity(player.transcendShards)
    a = a.add(
      Decimal.min(
        2500,
        Decimal.floor(Decimal.log(playertranscend.add(1), 10))
      )
    )
  }
  if (player.achievements[5] !== 0) {
    a = a.add(Decimal.floor(player.firstOwnedCoin / 500))
  }
  if (player.achievements[12] !== 0) {
    a = a.add(Decimal.floor(player.secondOwnedCoin / 500))
  }
  if (player.achievements[19] !== 0) {
    a = a.add(Decimal.floor(player.thirdOwnedCoin / 500))
  }
  if (player.achievements[26] !== 0) {
    a = a.add(Decimal.floor(player.fourthOwnedCoin / 500))
  }
  if (player.achievements[33] !== 0) {
    a = a.add(Decimal.floor(player.fifthOwnedCoin / 500))
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
  G.acceleratorPower = Decimal.min(1e300, G.acceleratorPower)
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
  s = s.times(to_break_eternity(G.multiplierEffect))
  s = s.times(to_break_eternity(G.prestigeMultiplier))
  s = s.times(to_break_eternity(G.reincarnationMultiplier))
  s = s.times(to_break_eternity(G.antMultiplier))
  // PLAT - check
  const first6CoinUp = new Decimal(G.totalCoinOwned + 1).times(
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
    s = s.times(Decimal.pow(G.totalCoinOwned / 4 + 1, 10))
  }
  if (player.upgrades[41] > 0.5) {
    s = s.times(
      Decimal.min(1e30, Decimal.pow(to_break_eternity(player.transcendPoints.add(1)), 1 / 2))
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
          .mul(Decimal.log(to_break_eternity(player.coins).add(1), 10))
        .div(
          new Decimal(1e7).add(Decimal.log(to_break_eternity(player.coins).add(1), 10))
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
  G.globalCoinMultiplier = to_break_infinity(lol)
  G.globalCoinMultiplier = DecimalOld.pow(
    G.globalCoinMultiplier,
    G.recessionPower[player.corruptions.used.recession]
  )
  
  G.coinOneMulti = new DecimalOld(1)
  if (player.upgrades[1] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.times(to_break_infinity(first6CoinUp))
  }
  if (player.upgrades[10] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.times(
      DecimalOld.pow(2, Math.min(50, player.secondOwnedCoin / 15))
    )
  }
  if (player.upgrades[56] > 0.5) {
    G.coinOneMulti = G.coinOneMulti.times('1e5000')
  }

  G.coinTwoMulti = new DecimalOld(1)
  if (player.upgrades[2] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times(to_break_infinity(first6CoinUp))
  }
  if (player.upgrades[13] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times(
      DecimalOld.min(
        1e50,
        DecimalOld.pow(
          player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1),
          4 / 3
        ).times(1e10)
      )
    )
  }
  if (player.upgrades[19] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times(
      DecimalOld.min(1e200, player.transcendPoints.times(1e30).add(1))
    )
  }
  if (player.upgrades[57] > 0.5) {
    G.coinTwoMulti = G.coinTwoMulti.times('1e7500')
  }

  G.coinThreeMulti = new DecimalOld(1)
  if (player.upgrades[3] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.times(to_break_infinity(first6CoinUp))
  }
  if (player.upgrades[18] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.times(
      DecimalOld.min(1e125, player.transcendShards.add(1))
    )
  }
  if (player.upgrades[58] > 0.5) {
    G.coinThreeMulti = G.coinThreeMulti.times('1e15000')
  }

  G.coinFourMulti = new DecimalOld(1)
  if (player.upgrades[4] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.times(to_break_infinity(first6CoinUp))
  }
  if (player.upgrades[17] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.times(1e100)
  }
  if (player.upgrades[59] > 0.5) {
    G.coinFourMulti = G.coinFourMulti.times('1e25000')
  }

  G.coinFiveMulti = new DecimalOld(1)
  if (player.upgrades[5] > 0.5) {
    G.coinFiveMulti = G.coinFiveMulti.times(to_break_infinity(first6CoinUp))
  }
  if (player.upgrades[60] > 0.5) {
    G.coinFiveMulti = G.coinFiveMulti.times('1e35000')
  }

}


const to_break_eternity = (value: DecimalOld): Decimal => {
  return Decimal.pow(2, value.log2())
}
export const to_break_infinity = (value: Decimal): DecimalOld => {
  const exponent = value.log10()
  if (exponent.gt(1e300)) {
    return DecimalOld.pow(2, 1e300)
  }
  return DecimalOld.pow(2, exponent.toNumber())
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