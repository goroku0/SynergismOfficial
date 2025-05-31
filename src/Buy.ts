import Decimal from 'break_eternity.js'
import i18next from 'i18next'
import { achievementaward } from './Achievements'
import { DOMCacheGetOrSet } from './Cache/DOM'
import { calculateRuneBonuses, calculateSummationLinear } from './Calculate'
import { CalcECC } from './Challenges'
import { format, player } from './Synergism'
import type { FirstToFifth, OneToFive, ZeroToFour } from './types/Synergism'
import { crystalupgradedescriptions, upgradeupdate } from './Upgrades'
import { Globals as G, Upgrade } from './Variables'
import { getCostInternal } from './mod/Buy_moded'

export const getReductionValue = () => {
  let reduction = 1
  reduction += Math.min(1e15, (G.rune4level * G.effectiveLevelMult) / 160)
  reduction += (player.researches[56] + player.researches[57] + player.researches[58] + player.researches[59]
    + player.researches[60]) / 200
  reduction += CalcECC('transcend', player.challengecompletions[4]) / 200
  reduction += Math.min(99999.9, (3 * (player.antUpgrades[7 - 1]! + G.bonusant7)) / 100)
  return reduction
}

/*
// Uses same as Decimal prototype but does so without creating new objects
Decimal.prototype.factorial = function () {
  // Using Stirling's Approximation.
  // https://en.wikipedia.org/wiki/Stirling%27s_approximation#Versions_suitable_for_calculators
  var n = this.toNumber() + 1;
  return Decimal.pow(n / Math.E * Math.sqrt(n * Math.sinh(1 / n) + 1 / (810 * Math.pow(n, 6))), n).mul(Math.sqrt(2 * Math.PI / n));
};
*/

const mantissaFactorialPartExtra = Math.log10(2 * Math.PI)
const exponentFactorialPartExtra = Math.log10(Math.E)

export const factorialByExponent = (fact: number) => {
  if (++fact === 0) {
    return 0
  }
  return ((Math.log10(fact * Math.sqrt(fact * Math.sinh(1 / fact) + 1 / (810 * Math.pow(fact, 6))))
    - exponentFactorialPartExtra) * fact) + ((mantissaFactorialPartExtra - Math.log10(fact)) / 2)
}

export const fact100exponent = Math.log10(9.332621544394e+157)

// system of equations
// 16 digits of precision
// log10(1.25)xn = log10(x)+16
// see: https://www.wolframalpha.com/input/?i=log10%28x%29%2B16+%3D+log10%281.25%29x
// xn ~= 188.582
// x ~= 188.582/n
export const precision16_loss_addition_of_ones = 188.582
export const known_log10s = (() => {
  // needed logs
  const needed = [1.03, 1.25]
  const nums = [1, 2, 3, 4, 5, 6, 10, 15]
  for (const num of nums) {
    needed.push(100 + (100 * num))
    needed.push(10 + (10 * num))
  }

  // Gets all possible challenge 8 completion amounts
  const chalcompletions = 1000
  for (let i = 0; i < chalcompletions; ++i) {
    needed.push(1 + (i / 2))
  }

  // constructing all logs
  const obj: Record<number, number> = {}
  for (const need of needed) {
    if (typeof obj[need] === 'undefined') {
      obj[need] = Math.log10(need)
    }
  }
  return obj
})()

const coinBuildingCosts = [100, 1000, 2e4, 4e5, 8e6] as const
const diamondBuildingCosts = [100, 1e5, 1e15, 1e40, 1e100] as const
export const mythosAndParticleBuildingCosts = [1, 1e2, 1e4, 1e8, 1e16] as const

export const getOriginalCostAndNum = (index: OneToFive, type: keyof typeof buyProducerTypes) => {
  const originalCostArray = type === 'Coin'
    ? coinBuildingCosts
    : type === 'Diamonds'
    ? diamondBuildingCosts
    : mythosAndParticleBuildingCosts
  const num = type === 'Coin' ? index : index * (index + 1) / 2
  const originalCost = originalCostArray[index - 1 as ZeroToFour]
  return [originalCost, num] as const
}

export const getCost = (index: OneToFive, type: keyof typeof buyProducerTypes, buyingTo: Decimal, r?: number) => {
  const [originalCost, num] = getOriginalCostAndNum(index, type)
  return getCostInternal(originalCost, buyingTo, type, num, r ?? getReductionValue())
}

export const buyProducerTypes = {
  Diamonds: ['prestigePoints', 'crystal'],
  Mythos: ['transcendPoints', 'mythos'],
  Particles: ['reincarnationPoints', 'particle'],
  Coin: ['coins', 'coin']
} as const

export const buyProducer = (
  pos: FirstToFifth,
  type: keyof typeof buyProducerTypes,
  num: number,
  autobuyer?: boolean
) => {
  const [tag, amounttype] = buyProducerTypes[type]
  const buythisamount = autobuyer ? 500 : player[`${amounttype}buyamount` as const]
  let r = 1
  r += (G.rune4level * G.effectiveLevelMult) / 160
  r += (player.researches[56] + player.researches[57] + player.researches[58] + player.researches[59]
    + player.researches[60]) / 200
  r += CalcECC('transcend', player.challengecompletions[4]) / 200
  r += (3 * (G.bonusant7 + player.antUpgrades[7 - 1]!)) / 100

  const posCostType = `${pos}Cost${type}` as const
  const posOwnedType = `${pos}Owned${type}` as const

  while (
    player[tag].gt(player[posCostType]) && G.ticker < buythisamount
  ) {
    player[tag] = player[tag].sub(player[posCostType])
    player[posOwnedType] = player[posOwnedType].add(1)
    player[posCostType] = player[posCostType].times(Decimal.pow(1.25, num))
    player[posCostType] = player[posCostType].add(1)
    if (player[posOwnedType].gte(1000 * r)) {
      player[posCostType] = player[posCostType].times(player[posOwnedType]).dividedBy(1000).times(1 + num / 2)
    }
    if (player[posOwnedType].gte(5000 * r)) {
      player[posCostType] = player[posCostType].times(player[posOwnedType]).times(10).times(10 + num * 10)
    }
    if (player[posOwnedType].gte(20000 * r)) {
      player[posCostType] = player[posCostType].times(Decimal.pow(player[posOwnedType], 3)).times(100000).times(
        100 + num * 100
      )
    }
    if (player[posOwnedType].gte(250000 * r)) {
      player[posCostType] = player[posCostType].times(Decimal.pow(1.03, player[posOwnedType].sub(250000 * r)))
    }
    if (player.currentChallenge.transcension === 4 && (type === 'Coin' || type === 'Diamonds')) {
      player[posCostType] = player[posCostType].times(
        Decimal.pow(player[posOwnedType].times(100).add(10000), 1.25 + 1 / 4 * player.challengecompletions[4])
      )
      if (player[posOwnedType].gte(1000 - (10 * player.challengecompletions[4]))) {
        player[posCostType] = player[posCostType].times(Decimal.pow(1.25, player[posOwnedType]))
      }
    }
    if (
      player.currentChallenge.reincarnation === 8 && (type === 'Coin' || type === 'Diamonds' || type === 'Mythos')
      && player[posOwnedType].gte(1000 * player.challengecompletions[8] * r)
    ) {
      player[posCostType] = player[posCostType].times(
        Decimal.pow(
          2,
          (player[posOwnedType].sub(1000 * player.challengecompletions[8] * r))
            .div(1 + (player.challengecompletions[8] / 2))
        )
      )
    }
    G.ticker += 1
  }
  G.ticker = 0
}

export const buyUpgrades = (type: Upgrade, pos: number, state?: boolean) => {
  const currency = type
  if (player[currency].gt(Decimal.pow(10, G.upgradeCosts[pos])) && player.upgrades[pos] === 0) {
    player[currency] = player[currency].sub(Decimal.pow(10, G.upgradeCosts[pos]))
    player.upgrades[pos] = 1
    upgradeupdate(pos, state)
  }

  if (type === Upgrade.transcend) {
    player.reincarnatenocoinprestigeortranscendupgrades = false
    player.reincarnatenocoinprestigetranscendorgeneratorupgrades = false
  }
  if (type === Upgrade.prestige) {
    player.transcendnocoinorprestigeupgrades = false
    player.reincarnatenocoinorprestigeupgrades = false
    player.reincarnatenocoinprestigeortranscendupgrades = false
    player.reincarnatenocoinprestigetranscendorgeneratorupgrades = false
  }
  if (type === Upgrade.coin) {
    player.prestigenocoinupgrades = false
    player.transcendnocoinupgrades = false
    player.transcendnocoinorprestigeupgrades = false
    player.reincarnatenocoinupgrades = false
    player.reincarnatenocoinorprestigeupgrades = false
    player.reincarnatenocoinprestigeortranscendupgrades = false
    player.reincarnatenocoinprestigetranscendorgeneratorupgrades = false
  }
}

export const calculateCrystalBuy = (i: number) => {
  const u = i - 1
  const exponent = Decimal.log(player.prestigeShards.add(1), 10).toNumber()

  const toBuy = Math.floor(
    Math.pow(Math.max(0, 2 * (exponent - G.crystalUpgradesCost[u]) / G.crystalUpgradeCostIncrement[u] + 1 / 4), 1 / 2)
      + 1 / 2
  )
  return toBuy
}

export const buyCrystalUpgrades = (i: number, auto = false) => {
  const u = i - 1

  let c = 0
  c += Math.floor(G.rune3level / 16 * G.effectiveLevelMult) * 100 / 100
  if (player.upgrades[73] > 0.5 && player.currentChallenge.reincarnation !== 0) {
    c += 10
  }

  const toBuy = calculateCrystalBuy(i)

  if (toBuy + c > player.crystalUpgrades[u]) {
    player.crystalUpgrades[u] = 100 / 100 * (toBuy + c)
    if (toBuy > 0) {
      player.prestigeShards = player.prestigeShards.sub(
        Decimal.pow(
          10,
          G.crystalUpgradesCost[u] + G.crystalUpgradeCostIncrement[u] * (1 / 2 * Math.pow(toBuy - 1 / 2, 2) - 1 / 8)
        )
      )
      if (!auto) {
        crystalupgradedescriptions(i)
      }
    }
  }
}

export const tesseractBuildingCosts = [1, 10, 100, 1000, 10000] as const

// The nth tesseract building of tier i costs
//   tesseractBuildingCosts[i-1] * n^3.
// so the first n tesseract buildings of tier i costs
//   cost(n) = tesseractBuildingCosts[i-1] * (n * (n+1) / 2)^2
// in total. Use cost(owned+buyAmount) - cost(owned) to figure the cost of
// buying multiple buildings.

export type TesseractBuildings = [number | null, number | null, number | null, number | null, number | null]

const buyTessBuildingsToCheapestPrice = (
  ownedBuildings: TesseractBuildings,
  cheapestPrice: number
): [number, TesseractBuildings] => {
  const buyToBuildings = ownedBuildings.map((currentlyOwned, index) => {
    if (currentlyOwned === null) {
      return null
    }
    // thisPrice >= cheapestPrice = tesseractBuildingCosts[index] * (buyTo+1)^3
    // buyTo = cuberoot(cheapestPrice / tesseractBuildingCosts[index]) - 1
    // If buyTo has a fractional part, we want to round UP so that this
    // price costs more than the cheapest price.
    // If buyTo doesn't have a fractional part, thisPrice = cheapestPrice.
    const buyTo = Math.ceil(Math.pow(cheapestPrice / tesseractBuildingCosts[index], 1 / 3) - 1)
    // It could be possible that cheapestPrice is less than the CURRENT
    // price of this building, so take the max of the number of buildings
    // we currently have.
    return Math.max(currentlyOwned, buyTo)
  }) as TesseractBuildings

  let price = 0
  for (let i = 0; i < ownedBuildings.length; i++) {
    const buyFrom = ownedBuildings[i]
    const buyTo = buyToBuildings[i]
    if (buyFrom === null || buyTo === null) {
      continue
    }
    price += tesseractBuildingCosts[i]
      * (Math.pow(buyTo * (buyTo + 1) / 2, 2) - Math.pow(buyFrom * (buyFrom + 1) / 2, 2))
  }

  return [price, buyToBuildings]
}

/**
 * Calculate the result of repeatedly buying the cheapest tesseract building,
 * given an initial list of owned buildings and a budget.
 *
 * This function is pure and does not rely on any global state other than
 * constants for ease of testing.
 *
 * For tests:
 * calculateInBudget([0, 0, 0, 0, 0], 100) = [3, 1, 0, 0, 0]
 * calculateInBudget([null, 0, 0, 0, 0], 100) = [null, 2, 0, 0, 0]
 * calculateInBudget([3, 1, 0, 0, 0], 64+80-1) = [4, 1, 0, 0, 0]
 * calculateInBudget([3, 1, 0, 0, 0], 64+80) = [4, 2, 0, 0, 0]
 * calculateInBudget([9, 100, 100, 0, 100], 1000) = [9, 100, 100, 1, 100]
 * calculateInBudget([9, 100, 100, 0, 100], 2000) = [10, 100, 100, 1, 100]
 *
 * and calculateInBudget([0, 0, 0, 0, 0], 1e46) should run in less than a
 * second.
 *
 * @param ownedBuildings The amount of buildings owned, or null if the building
 * should not be bought.
 * @param budget The number of tesseracts to spend.
 * @returns The amount of buildings owned after repeatedly buying the cheapest
 * building with the budget.
 */
export const calculateTessBuildingsInBudget = (
  ownedBuildings: TesseractBuildings,
  budget: number
): TesseractBuildings => {
  // Nothing is affordable.
  // Also catches the case when budget <= 0, and all values are null.
  let minCurrentPrice: number | null = null
  for (let i = 0; i < ownedBuildings.length; i++) {
    const owned = ownedBuildings[i]
    if (owned === null) {
      continue
    }
    const price = tesseractBuildingCosts[i] * Math.pow(owned + 1, 3)
    if (minCurrentPrice === null || price < minCurrentPrice) {
      minCurrentPrice = price
    }
  }

  if (minCurrentPrice === null || minCurrentPrice > budget) {
    return ownedBuildings
  }

  // Every time the cheapest building is bought, the cheapest price either
  // stays constant (if there are two or more cheapest buildings), or
  // increases.
  //
  // Additionally, given the price of a building, calculating
  // - the amount of buildings needed to hit that price and
  // - the cumulative cost to buy to that amount of buildings
  // can be done with a constant number of floating point operations.
  //
  // Therefore, by binary searching over "cheapest price when finished", we
  // are able to efficiently (O(log budget)) determine the number of buildings
  // owned after repeatedly buying the cheapest building. Calculating the
  // cheapest building and buying one at a time would take O(budget^(1/4))
  // time - and as the budget could get very large (this is Synergism after
  // all), this is probably too slow.
  //
  // That is, we have a function f(cheapestPrice) which returns the cost of
  // buying buildings until all prices to buy are cheapestPrice or higher, and
  // we want to find the maximum value of cheapestPrice such that
  // f(cheapestPrice) <= budget.
  // In this case, f(x) = buyTessBuildingsToCheapestPrice(ownedBuildings, x)[0].

  // f(minCurrentPrice) = 0 < budget. We also know that we can definitely buy
  // at least one thing.
  let lo = minCurrentPrice
  // Do an exponential search to find the upper bound.
  let hi = lo * 2
  while (buyTessBuildingsToCheapestPrice(ownedBuildings, hi)[0] <= budget) {
    lo = hi
    hi *= 2
  }
  // Invariant:
  // f(lo) <= budget < f(hi).
  while (hi - lo > 0.5) {
    const mid = lo + (hi - lo) / 2
    // It's possible to get into an infinite loop if mid here is equal to
    // the boundaries, even if hi !== lo (due to floating point inaccuracy).
    if (mid === lo || mid === hi) {
      break
    }
    if (buyTessBuildingsToCheapestPrice(ownedBuildings, mid)[0] <= budget) {
      lo = mid
    } else {
      hi = mid
    }
  }

  // Binary search is done (with lo being the best candidate).
  const [cost, buildings] = buyTessBuildingsToCheapestPrice(ownedBuildings, lo)

  // Note that this has a slight edge case when 2 <= N <= 5 buildings are the
  // same price, and it is optimal to buy only M < N of them at that price.
  // The result of this edge case is that we can finish the binary search with
  // a set of buildings which are affordable, but more buildings can still be
  // bought. To fix this, we greedily buy the cheapest building one at a time,
  // which should take 4 or less iterations to run out of budget.
  let remainingBudget = budget - cost
  const currentPrices = buildings.map((num, index) => {
    if (num === null) {
      return null
    }
    return tesseractBuildingCosts[index] * Math.pow(num + 1, 3)
  })

  for (let iteration = 1; iteration <= 5; iteration++) {
    let minimum: { price: number; index: number } | null = null
    for (let index = 0; index < currentPrices.length; index++) {
      const price = currentPrices[index]
      if (price === null) {
        continue
      }
      // <= is used instead of < to prioritise the higher tier buildings
      // over the lower tier ones if they have the same price.
      if (minimum === null || price <= minimum.price) {
        minimum = { price, index }
      }
    }
    if (minimum !== null && minimum.price <= remainingBudget) {
      remainingBudget -= minimum.price
      // buildings[minimum.index] should always be a number.
      // In extreme situations (when buildings[minimum.index] is bigger
      // than Number.MAX_SAFE_INTEGER), this below increment won't work.
      // However, that requires 1e47 tesseracts to get to, which shouldn't
      // ever happen.
      buildings[minimum.index]!++
      currentPrices[minimum.index] = tesseractBuildingCosts[minimum.index] * Math.pow(buildings[minimum.index]! + 1, 3)
    } else {
      // Can't afford cheapest any more - break.
      break
    }
  }

  return buildings
}

/**
 * @param index Which tesseract building to get the cost of.
 * @param amount The amount to buy. Defaults to tesseract buy amount.
 * @param checkCanAfford Whether to limit the purchase amount to the number of buildings the player can afford.
 * @returns A pair of [number of buildings after purchase, cost of purchase].
 */
export const getTesseractCost = (
  index: OneToFive,
  amount?: number,
  checkCanAfford = true,
  buyFrom?: number
): [number, number] => {
  amount ??= player.tesseractbuyamount
  buyFrom ??= player[`ascendBuilding${index}` as const].owned
  const intCost = tesseractBuildingCosts[index - 1]
  const subCost = intCost * Math.pow(buyFrom * (buyFrom + 1) / 2, 2)

  let actualBuy: number
  if (checkCanAfford) {
    const buyTo = Math.floor(
      -1 / 2 + 1 / 2 * Math.pow(1 + 8 * Math.pow((Number(player.wowTesseracts) + subCost) / intCost, 1 / 2), 1 / 2)
    )
    actualBuy = Math.min(buyTo, buyFrom + amount)
  } else {
    actualBuy = buyFrom + amount
  }
  const actualCost = intCost * Math.pow(actualBuy * (actualBuy + 1) / 2, 2) - subCost
  return [actualBuy, actualCost]
}

export const buyTesseractBuilding = (index: OneToFive, amount = player.tesseractbuyamount) => {
  const intCost = tesseractBuildingCosts[index - 1]
  const ascendBuildingIndex = `ascendBuilding${index}` as const
  // Destructuring FTW!
  const [buyTo, actualCost] = getTesseractCost(index, amount)

  player[ascendBuildingIndex].owned = buyTo
  player.wowTesseracts.sub(actualCost)
  player[ascendBuildingIndex].cost = intCost * Math.pow(1 + buyTo, 3)
}

export const buyRuneBonusLevels = (type: 'Blessings' | 'Spirits', index: number) => {
  const unlocked = type === 'Spirits' ? player.challengecompletions[12] > 0 : player.achievements[134] === 1
  if (unlocked && isFinite(player.runeshards) && player.runeshards > 0) {
    let baseCost: number
    let baseLevels: number
    let levelCap: number
    if (type === 'Spirits') {
      baseCost = G.spiritBaseCost
      baseLevels = player.runeSpiritLevels[index]
      levelCap = player.runeSpiritBuyAmount
    } else {
      baseCost = G.blessingBaseCost
      baseLevels = player.runeBlessingLevels[index]
      levelCap = player.runeBlessingBuyAmount
    }

    const [level, cost] = calculateSummationLinear(baseLevels, baseCost, player.runeshards, levelCap)
    if (type === 'Spirits') {
      player.runeSpiritLevels[index] = level
    } else {
      player.runeBlessingLevels[index] = level
    }

    player.runeshards -= cost

    if (player.runeshards < 0) {
      player.runeshards = 0
    }

    updateRuneBlessing(type, index)
  }
}

export const updateRuneBlessing = (type: 'Blessings' | 'Spirits', index: number) => {
  if (index === 1) {
    const requirementArray = [0, 1e5, 1e8, 1e11]
    for (let i = 1; i <= 3; i++) {
      if (player.runeBlessingLevels[1] >= requirementArray[i] && player.achievements[231 + i] < 1) {
        achievementaward(231 + i)
      }
      if (player.runeSpiritLevels[1] >= 10 * requirementArray[i] && player.achievements[234 + i] < 1) {
        achievementaward(234 + i)
      }
    }
    if (player.runeBlessingLevels[1] >= 1e22 && player.achievements[245] < 1) {
      achievementaward(245)
    }
  }

  calculateRuneBonuses()

  if (type === 'Blessings') {
    const blessingMultiplierArray = [0, 8, 10, 6.66, 2, 1]
    const t = (index === 5) ? 1 : 0
    DOMCacheGetOrSet(`runeBlessingPower${index}Value1`).innerHTML = i18next.t('runes.blessings.blessingPower', {
      reward: i18next.t(`runes.blessings.rewards.${index - 1}`),
      value: format(G.runeBlessings[index]),
      speed: format(1 - t + blessingMultiplierArray[index] * G.effectiveRuneBlessingPower[index], 4, true)
    })
  } else if (type === 'Spirits') {
    const spiritMultiplierArray = [0, 1, 1, 20, 1, 100]
    spiritMultiplierArray[index] *= player.corruptions.used.totalCorruptionDifficultyScore / 400
    const t = (index === 3) ? 1 : 0

    DOMCacheGetOrSet(`runeSpiritPower${index}Value1`).innerHTML = i18next.t('runes.spirits.spiritPower', {
      reward: i18next.t(`runes.spirits.rewards.${index - 1}`),
      value: format(G.runeSpirits[index]),
      speed: format(1 - t + spiritMultiplierArray[index] * G.effectiveRuneSpiritPower[index], 4, true)
    })
  }
}

export const buyAllBlessings = (type: 'Blessings' | 'Spirits', percentage = 100, auto = false) => {
  const unlocked = type === 'Spirits' ? player.challengecompletions[12] > 0 : player.achievements[134] === 1
  if (unlocked) {
    const runeshards = Math.floor(player.runeshards / 100 * percentage / 5)
    for (let index = 1; index < 6; index++) {
      if (isFinite(player.runeshards) && player.runeshards > 0) {
        let baseCost: number
        let baseLevels: number
        const levelCap = 1e300
        if (type === 'Spirits') {
          baseCost = G.spiritBaseCost
          baseLevels = player.runeSpiritLevels[index]
        } else {
          baseCost = G.blessingBaseCost
          baseLevels = player.runeBlessingLevels[index]
        }

        const [level, cost] = calculateSummationLinear(baseLevels, baseCost, runeshards, levelCap)
        if (level > baseLevels && (!auto || (level - baseLevels) * 10000 > baseLevels)) {
          if (type === 'Spirits') {
            player.runeSpiritLevels[index] = level
          } else {
            player.runeBlessingLevels[index] = level
          }

          player.runeshards -= cost

          if (player.runeshards < 0) {
            player.runeshards = 0
          }

          updateRuneBlessing(type, index)
        }
      }
    }
  }
}
