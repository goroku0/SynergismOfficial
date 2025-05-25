import Decimal from 'break_eternity.js'
import type DecimalOld from 'break_infinity.js'
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
    let playercoins = to_break_eternity(player.coins)
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
    let playerprestige = to_break_eternity(player.prestigePoints)
    a = a.add(
      Decimal.min(
        500,
        Decimal.floor(Decimal.log(playerprestige.add(1), 1e25))
      )
    )
  }
  if (player.upgrades[45] !== 0) {
    let playertranscend = to_break_eternity(player.transcendShards)
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
  a = Decimal.floor(Decimal.min(1e100, a))

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

const to_break_eternity = (value: DecimalOld): Decimal => {
  return Decimal.pow(2, value.log2())
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