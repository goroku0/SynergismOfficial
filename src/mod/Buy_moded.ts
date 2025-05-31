import Decimal, { type DecimalSource } from 'break_eternity.js'
import { player, updateAllTick } from '../Synergism'
import { smallestDecimal, smallestInc } from '../Utility'
import { CalcECC } from '../Challenges'
import { Globals as G } from '../Variables'
import { achievementaward } from '../Achievements'
import { buyProducerTypes, getOriginalCostAndNum, getReductionValue, fact100exponent, known_log10s, mythosAndParticleBuildingCosts } from '../Buy'
import type { OneToFive, ZeroToFour } from '../types/Synergism'
import { updateAllMultiplier } from './try_break_eternity'
import { reset } from '../Reset'


export const buyAccelerator = (autobuyer?: boolean) => {
  const buyStart = player.acceleratorBought
  const buymax = Decimal.pow(10, 15)

  // If at least buymax, we will use a different formulae
  let hibuy = player.coins.log10()
  const log10QuadrillionCost = Decimal.log10(getCostAccelerator(buymax))
  if (buyStart.gte(buymax) || hibuy.gte(log10QuadrillionCost)) {
    const diminishingExponent = 1 / 8

    hibuy = hibuy.div(log10QuadrillionCost)
    hibuy = hibuy.pow(diminishingExponent).max(1).mul(buymax)

    player.acceleratorBought = hibuy
    player.acceleratorCost = player.coins
    return
  }

  // Start buying at the current amount bought + 1
  const buydefault = buyStart.add(smallestDecimal(buyStart))
  let buyTo = buydefault

  const cashToBuy = player.coins
  let step = 1
  while (true) {
    const cost = getCostAccelerator(buyTo.add(step))
    if (cost.lte(cashToBuy)) {
      buyTo = buyTo.add(step)
      step *= 2
    } else if (step > 1) {
      step = Math.floor(step / 2)
    } else {
      break
    }
  }

  if (!autobuyer && (player.coinbuyamount as number | string) !== 'max') {
    if (player.acceleratorBought.add(player.coinbuyamount).lt(buyTo)) {
      buyTo = player.acceleratorBought.add(player.coinbuyamount)
    }
  }

  let buyFrom = Decimal.max(buyTo.sub(6).sub(smallestDecimal(buyTo)), buydefault)
  let thisCost = getCostAccelerator(buyFrom)
  while (buyFrom.lte(buyTo) && player.coins.gt(thisCost)) {
    player.coins = player.coins.sub(thisCost)
    player.acceleratorBought = buyFrom
    buyFrom = buyFrom.add(smallestDecimal(buyFrom))
    thisCost = getCostAccelerator(buyFrom)
    player.acceleratorCost = thisCost
    if (buyFrom.gt(buymax)) {
      return
    }
  }

  player.prestigenoaccelerator = false
  player.transcendnoaccelerator = false
  player.reincarnatenoaccelerator = false
  updateAllTick()
  if (player.acceleratorBought.gte(5) && player.achievements[148] === 0) {
    achievementaward(148)
  }
  if (player.acceleratorBought.gte(25) && player.achievements[149] === 0) {
    achievementaward(149)
  }
  if (player.acceleratorBought.gte(100) && player.achievements[150] === 0) {
    achievementaward(150)
  }
  if (player.acceleratorBought.gte(666) && player.achievements[151] === 0) {
    achievementaward(151)
  }
  if (player.acceleratorBought.gte(2000) && player.achievements[152] === 0) {
    achievementaward(152)
  }
  if (player.acceleratorBought.gte(12500) && player.achievements[153] === 0) {
    achievementaward(153)
  }
  if (player.acceleratorBought.gte(100000) && player.achievements[154] === 0) {
    achievementaward(154)
  }
}

const getCostAccelerator = (buyingTo: Decimal): Decimal => {
  buyingTo = buyingTo.sub(1)
  const originalCost = 500
  let cost = new Decimal(originalCost)
  cost = cost.times(Decimal.pow(4 / G.costDivisor, buyingTo))

  if (buyingTo.gt(125 + 5 * CalcECC('transcend', player.challengecompletions[4]))) {
    const num = buyingTo.sub(125 + 5 * CalcECC('transcend', player.challengecompletions[4]))
    const factorialBit = new Decimal(num).factorial()
    const multBit = Decimal.pow(4, num)
    cost = cost.times(multBit.times(factorialBit))
  }

  if (buyingTo.gt(2000 + 5 * CalcECC('transcend', player.challengecompletions[4]))) {
    const sumNum = buyingTo.sub(2000 + 5 * CalcECC('transcend', player.challengecompletions[4]))
    const sumBit = sumNum.mul(sumNum.add(1)).div(2)
    cost = cost.times(Decimal.pow(2, sumBit))
  }

  if (player.currentChallenge.transcension === 4) {
    const sumBit = buyingTo.mul(buyingTo.add(1)).div(2)
    cost = cost.times(Decimal.pow(10, sumBit))
  }

  if (player.currentChallenge.reincarnation === 8) {
    const sumBit = buyingTo.mul(buyingTo.add(1)).div(2)
    cost = cost.times(Decimal.pow(1e50, sumBit))
  }

  return cost

}


export const buyMax = (index: OneToFive, type: keyof typeof buyProducerTypes) => {
  const zeroIndex = index - 1 as ZeroToFour
  const pos = G.ordinals[zeroIndex]
  const [originalCost, num] = getOriginalCostAndNum(index, type)

  const buymax = Decimal.pow(10, 15)
  const r = getReductionValue()
  const tag = buyProducerTypes[type][0]

  const posOwnedType = `${pos}Owned${type}` as const

  const buyStart = player[posOwnedType]

  // If at least buymax, we will use a different formulae
  let hibuy = player[tag].log10()
  const log10QuadrillionCost = Decimal.log10(getCostInternal(originalCost, buymax, type, num, r))
  if (buyStart.gte(buymax) || hibuy.gte(log10QuadrillionCost)) {
    const diminishingExponent = 1 / 8
    
    hibuy = hibuy.div(log10QuadrillionCost)
    hibuy = hibuy.pow(diminishingExponent).max(1).mul(buymax)

    player[posOwnedType] = hibuy
    player[`${pos}Cost${type}` as const] = player[tag]
    return
  }

  // Start buying at the current amount bought + 1
  const buydefault = buyStart.add(smallestDecimal(buyStart))
  let buyTo = buydefault

  const cashToBuy = player[tag]
  let step = 1
  while (true) {
    const cost = getCostInternal(originalCost, buyTo.add(step), type, num, r)
    if (cost.lte(cashToBuy)) {
      buyTo = buyTo.add(step)
      step *= 2
    } else if (step > 1) {
      step = Math.floor(step / 2)
    } else {
      break
    }
  }

  let buyFrom = Decimal.max(buyTo.sub(6).sub(smallestDecimal(buyTo)), buydefault)
  let thisCost = getCostInternal(originalCost, buyFrom, type, num, r)
  while (buyFrom.lte(buyTo) && player[tag].gt(thisCost)) {
    player[tag] = player[tag].sub(thisCost)
    player[posOwnedType] = buyFrom
    buyFrom = buyFrom.add(smallestDecimal(buyFrom))
    thisCost = getCostInternal(originalCost, buyFrom, type, num, r)
    player[`${pos}Cost${type}` as const] = thisCost
    if (buyFrom.gt(buymax)) {
      return
    }
  }
}

export const getCostInternal = (
  originalCost: DecimalSource,
  buyingTo: Decimal,
  type: keyof typeof buyProducerTypes,
  num: number,
  r: number
): Decimal => {
  // It's 0 indexed by mistake so you have to subtract 1 somewhere.
  buyingTo = buyingTo.sub(1)
  // Accounts for the multiplies by 1.25^num buyingTo times
  let cost = new Decimal(originalCost)
  let mlog10125 = buyingTo.mul(num)
  let fastFactMultBuyTo = 0
  // floored r value gets used a lot in removing calculations
  let fr = Decimal.floor(r * 1000)
  if (buyingTo.gte(r * 1000)) {
    // This code is such a mess at this point, just know that this is equivalent to what it was before
    ; ++fastFactMultBuyTo
    cost = cost.div(fr.factorial())
    cost = cost.mul(Decimal.pow(10, 
      new Decimal(-3 + Math.log10(1 + (num / 2)))
      .mul(buyingTo.sub(fr))))
  }

  fr = Decimal.floor(r * 5000)
  if (buyingTo.gte(r * 5000)) {
    // This code is such a mess at this point, just know that this is equivalent to what it was before
    ; ++fastFactMultBuyTo
    cost = cost.div(fr.factorial())
    cost = cost.mul(Decimal.pow(10, (
      buyingTo.sub(fr).sub(1)
    )
      .mul(known_log10s[10 + num * 10] + 1)
      .add(1)))
  }

  fr = Decimal.floor(r * 20000)
  if (buyingTo.gte(r * 20000)) {
    // This code is such a mess at this point, just know that this is equivalent to what it was before
    fastFactMultBuyTo += 3
    cost = cost.div(fr.factorial().pow(3))
    cost = cost.mul(Decimal.pow(10, (
      buyingTo.sub(fr))
      .mul(known_log10s[100 + (100 * num)] + 5))
    )
  }

  fr = Decimal.floor(r * 250000)
  if (buyingTo.gte(r * 250000)) {
    // 1.03^x*1.03^y = 1.03^(x+y), we'll abuse this for this section of the algorithm
    // 1.03^(x+y-((number of terms)250000*r))
    // up to 250003 case
    // assume r = 1 for this case
    // (1.03^250000-250000)(1.03^250001-250000)(1.03^250002-250000)(1.03^250003) = (1.03^0*1.03^1*1.03^2*1.03^3)
    // so in reality we just need to take buyingTo - fr and sum the power up to it
    // (1.03^(sum from 0 to buyingTo - fr)) is the multiplier
    // so (1.03^( (buyingTo-fr)(buyingTo-fr+1)/2 )
    // god damn that was hard to make an algo for
    cost = cost.mul(Decimal.pow(10, (
      buyingTo.sub(fr))
      .mul(Decimal.log10(1.03))
      .mul(buyingTo.sub(fr).add(1).div(2))))
  }
  // Applies the factorials from earlier without computing them 5 times
  cost = cost.mul(buyingTo.factorial().pow(fastFactMultBuyTo))
  let fastFactMultBuyTo100 = 0
  if ((player.currentChallenge.transcension === 4) && (type === 'Coin' || type === 'Diamonds')) {
    // you would not fucking believe how long it took me to figure this out
    // (100*costofcurrent + 10000)^n = (((100+buyingTo)!/100!)*100^buyingTo)^n
    ; ++fastFactMultBuyTo100
    if (buyingTo.gte(1000 - (10 * player.challengecompletions[4]))) {
      // and I changed this to be a summation of all the previous buys 1.25 to the sum from 1 to buyingTo
      mlog10125 = mlog10125.add(buyingTo.mul(buyingTo.add(1)).div(2))
    }
  }
  if ((player.currentChallenge.reincarnation === 10) && (type === 'Coin' || type === 'Diamonds')) {
    // you would not fucking believe how long it took me to figure this out
    // (100*costofcurrent + 10000)^n = (((100+buyingTo)!/100!)*100^buyingTo)^n
    ; ++fastFactMultBuyTo100
    if (buyingTo.gte(r * 25000)) {
      // and I changed this to be a summation of all the previous buys 1.25 to the sum from 1 to buyingTo
      mlog10125 = mlog10125.add(buyingTo.mul(buyingTo.add(1)).div(2))
    }
  }
  // Applies the factorial w/ formula from earlier n times to avoid multiple computations
  cost = cost.mul(Decimal.pow(10,
    (buyingTo.add(100).factorial().log10().sub(fact100exponent).add(buyingTo.mul(2)))
      .mul(1.25 + (player.challengecompletions[4] / 4))
      .mul(fastFactMultBuyTo100)
  ))
  // Applies all the Math.log10(1.25)s from earlier n times to avoid multiple computations
  // log10(1.25)
  cost = cost.mul(Decimal.pow(10, mlog10125.mul(known_log10s[1.25])))
  fr = Decimal.floor(r * 1000 * player.challengecompletions[8])
  if (player.currentChallenge.reincarnation === 8 && (type === 'Coin' || type === 'Diamonds' || type === 'Mythos')
    && buyingTo.gte(1000 * player.challengecompletions[8] * r)) {
    cost = cost.mul(Decimal.pow(10,
      buyingTo.sub(fr)
        .mul((buyingTo.sub(fr).add(1)).div(2).mul(known_log10s[2])
          .sub(known_log10s[1 + (player.challengecompletions[8] / 2)])
        )))
  }
  return cost
}


export const buyParticleBuilding = (
  index: OneToFive,
  autobuyer = false
) => {
  const zeroIndex = index - 1 as ZeroToFour
  const originalCost = mythosAndParticleBuildingCosts[zeroIndex]
  const pos = G.ordinals[zeroIndex]
  const key = `${pos}OwnedParticles` as const
  const buyStart = player[key]
  const buymax = Decimal.pow(10, 15)
  // If at least buymax, we will use a different formulae
  let hibuy = Decimal.log10(player.reincarnationPoints)
  const log10QuadrillionCost = Decimal.log10(getParticleCost(originalCost, buymax))
  if (buyStart.gte(buymax) || hibuy.gte(log10QuadrillionCost)) {
    const diminishingExponent = 1 / 8
    
    hibuy = hibuy.div(log10QuadrillionCost)
    hibuy = hibuy.pow(diminishingExponent).max(1).mul(buymax)

    player[key] = hibuy
    player[`${pos}CostParticles` as const] = player.reincarnationPoints
    return
  }

  // Start buying at the current amount bought + 1
  const buydefault = buyStart.add(smallestDecimal(buyStart))
  let buyTo = buydefault

  let cashToBuy = getParticleCost(originalCost, buyTo)
  while (player.reincarnationPoints.gte(cashToBuy)) {
    // then multiply by 4 until it reaches just above the amount needed
    buyTo = buyTo.mul(4)
    cashToBuy = getParticleCost(originalCost, buyTo)
  }
  let stepdown = Decimal.floor(buyTo.div(8))
  while (stepdown.gte(smallestDecimal(buyTo))) {
    // if step down would push it below out of expense range then divide step down by 2
    if (getParticleCost(originalCost, buyTo.sub(stepdown)).lte(player.reincarnationPoints)) {
      stepdown = Decimal.floor(stepdown.div(2))
    } else {
      buyTo = buyTo.sub(Decimal.max(smallestDecimal(buyTo), stepdown))
    }
  }

  if (!autobuyer) {
    if (buyStart.add(player.particlebuyamount).lt(buyTo)) {
      buyTo = buyStart.add(player.particlebuyamount).add(smallestDecimal(player[key].add(player.particlebuyamount)))
    }
  }

  // go down by 7 steps below the last one able to be bought and spend the cost of 25 up to the one that you started with and stop if coin goes below requirement
  let buyFrom = Decimal.max(buyTo.sub(6).sub(smallestDecimal(buyTo)), buydefault)
  let thisCost = getParticleCost(originalCost, buyFrom)
  while (buyFrom.lte(buyTo) && player.reincarnationPoints.gt(thisCost)) {
    player.reincarnationPoints = player.reincarnationPoints.sub(thisCost)
    player[key] = buyFrom
    buyFrom = buyFrom.add(smallestDecimal(buyFrom))
    thisCost = getParticleCost(originalCost, buyFrom)
    player[`${pos}CostParticles` as const] = thisCost
  }
}
export const getParticleCost = (originalCost: DecimalSource, buyTo: Decimal): Decimal => {
  buyTo = buyTo.sub(1)
  originalCost = new Decimal(originalCost)
  let cost = originalCost.times(Decimal.pow(2, buyTo))

  const DR = (player.currentChallenge.ascension !== 15) ? 325000 : 1000

  if (buyTo.gt(DR)) {
    cost = cost.times(Decimal.pow(1.001, (buyTo.sub(DR)).mul((buyTo.sub(DR).add(1)).div(2))))
  }
  return cost
}

export const buyMultiplier = (autobuyer?: boolean) => {
  const buyStart = player.multiplierBought
  const buymax = Decimal.pow(10, 15)

  // If at least buymax, we will use a different formulae
  let hibuy = player.coins.log10()
  const log10QuadrillionCost = Decimal.log10(getCostMultiplier(buymax))
  if (buyStart.gte(buymax) || hibuy.gte(log10QuadrillionCost)) {
    const diminishingExponent = 1 / 8

    hibuy = hibuy.div(log10QuadrillionCost)
    hibuy = hibuy.pow(diminishingExponent).max(1).mul(buymax)

    player.multiplierBought = hibuy
    player.multiplierCost = player.coins
    return
  }

  // Start buying at the current amount bought + 1
  const buydefault = buyStart.add(smallestDecimal(buyStart))
  let buyTo = buydefault

  const cashToBuy = player.coins
  let step = 1
  while (true) {
    const cost = getCostMultiplier(buyTo.add(step))
    if (cost.lte(cashToBuy)) {
      buyTo = buyTo.add(step)
      step *= 2
    } else if (step > 1) {
      step = Math.floor(step / 2)
    } else {
      break
    }
  }

  if (!autobuyer && (player.coinbuyamount as number | string) !== 'max') {
    if (player.multiplierBought.add(player.coinbuyamount).lt(buyTo)) {
      buyTo = player.multiplierBought.add(player.coinbuyamount)
    }
  }


  let buyFrom = Decimal.max(buyTo.sub(6).sub(smallestDecimal(buyTo)),
    buydefault)
  let thisCost = getCostMultiplier(buyFrom)
  while (buyFrom.lte(buyTo) && player.coins.gt(thisCost)) {
    player.coins = player.coins.sub(thisCost)
    player.multiplierBought = buyFrom
    buyFrom = buyFrom.add(smallestDecimal(buyFrom))
    thisCost = getCostMultiplier(buyFrom)
    player.multiplierCost = thisCost
    if (buyFrom.gt(buymax)) {
      return
    }
  }

  player.prestigenomultiplier = false
  player.transcendnomultiplier = false
  player.reincarnatenomultiplier = false
  updateAllMultiplier()
  if (player.multiplierBought.gte(2) && player.achievements[155] === 0) {
    achievementaward(155)
  }
  if (player.multiplierBought.gte(20) && player.achievements[156] === 0) {
    achievementaward(156)
  }
  if (player.multiplierBought.gte(100) && player.achievements[157] === 0) {
    achievementaward(157)
  }
  if (player.multiplierBought.gte(500) && player.achievements[158] === 0) {
    achievementaward(158)
  }
  if (player.multiplierBought.gte(2000) && player.achievements[159] === 0) {
    achievementaward(159)
  }
  if (player.multiplierBought.gte(12500) && player.achievements[160] === 0) {
    achievementaward(160)
  }
  if (player.multiplierBought.gte(100000) && player.achievements[161] === 0) {
    achievementaward(161)
  }
}
export const getCostMultiplier = (buyingTo: Decimal): Decimal => {
  buyingTo = buyingTo.sub(1)

  const originalCost = 1e4
  let cost = new Decimal(originalCost)

  cost = cost.times(Decimal.pow(10, buyingTo.div(G.costDivisor)))

  if (buyingTo.gt(75 + 2 * CalcECC('transcend', player.challengecompletions[4]))) {
    const num = buyingTo.sub(75 + 2 * CalcECC('transcend', player.challengecompletions[4]))
    const factorialBit = new Decimal(num).factorial()
    const powBit = Decimal.pow(10, num)
    cost = cost.times(factorialBit.times(powBit))
  }

  if (buyingTo.gt(2000 + 2 * CalcECC('transcend', player.challengecompletions[4]))) {
    const sumNum = buyingTo.sub(2000 + 2 * CalcECC('transcend', player.challengecompletions[4]))
    const sumBit = sumNum.mul(sumNum.add(1)).div(2)
    cost = cost.times(Decimal.pow(2, sumBit))
  }
  if (player.currentChallenge.transcension === 4) {
    const sumBit = buyingTo.times(buyingTo.plus(1)).div(2)
    cost = cost.times(Decimal.pow(10, sumBit))
  }
  if (player.currentChallenge.reincarnation === 8) {
    const sumBit = buyingTo.times(buyingTo.plus(1)).div(2)
    cost = cost.times(Decimal.pow(1e50, sumBit))
  }
  const buymax = Decimal.pow(10, 15)
  if (buyingTo.gt(buymax)) {
    const diminishingExponent = 1 / 8

    const QuadrillionCost = getCostMultiplier(buymax)

    const newCost = QuadrillionCost.pow(Decimal.pow(buyingTo.div(buymax), 1 / diminishingExponent))
    const newExtra = newCost.exponent - Math.floor(newCost.exponent)
    newCost.exponent = Math.floor(newCost.exponent)
    newCost.mantissa *= Math.pow(10, newExtra)
    newCost.normalize()
    return Decimal.max(cost, newCost)
  }
  return cost
}


export const boostAccelerator = (automated?: boolean) => {
  let buyamount = 1
  if (player.upgrades[46] === 1) {
    buyamount = automated ? 9999 : player.coinbuyamount
  }

  if (player.upgrades[46] < 1) {
    while (player.prestigePoints.gte(player.acceleratorBoostCost) && G.ticker < buyamount) {
      if (player.prestigePoints.gte(player.acceleratorBoostCost)) {
        player.acceleratorBoostBought = player.acceleratorBoostBought.add(1)
        player.acceleratorBoostCost = player.acceleratorBoostCost.times(1e10).times(
          Decimal.pow(10, player.acceleratorBoostBought)
        )
        if (player.acceleratorBoostBought.gt(1000 * (1 + 2 * G.effectiveRuneBlessingPower[4]))) {
          player.acceleratorBoostCost = player.acceleratorBoostCost.times(
            Decimal.pow(
              10,
              Decimal.pow(player.acceleratorBoostBought.sub(1000 * (1 + 2 * G.effectiveRuneBlessingPower[4])), 2)
              .div(1 + 2 * G.effectiveRuneBlessingPower[4])
            )
          )
        }
        player.transcendnoaccelerator = false
        player.reincarnatenoaccelerator = false
        if (player.upgrades[46] < 0.5) {
          for (let j = 21; j < 41; j++) {
            player.upgrades[j] = 0
          }
          reset('prestige')
          player.prestigePoints = new Decimal(0)
        }
      }
    }
  } else {
    const buyStart = player.acceleratorBoostBought
    const buymax = Math.pow(10, 15)

    // If at least buymax, we will use a different formulae
    let hibuy = player.prestigePoints.log10()
    const log10QuadrillionCost = Decimal.log10(getAcceleratorBoostCost(buymax))
    if (buyStart.gt(buymax) || hibuy.gt(log10QuadrillionCost)) {
      const diminishingExponent = 1 / 8

      hibuy = hibuy.div(log10QuadrillionCost)
      hibuy = hibuy.pow(diminishingExponent).max(1).mul(buymax)

      player.acceleratorBoostBought = hibuy
      player.acceleratorBoostCost = player.prestigePoints
      return
    }

    // Start buying at the current amount bought + 1
    const buystartnum = buyStart.toNumber()
    const buydefault = buystartnum + smallestInc(buystartnum)
    let buyInc = 1

    let cost = getAcceleratorBoostCost(buystartnum + buyInc)
    while (player.prestigePoints.gte(cost)) {
      buyInc *= 4
      cost = getAcceleratorBoostCost(buystartnum + buyInc)
    }
    let stepdown = Math.floor(buyInc / 8)
    while (stepdown >= smallestInc(buyInc)) {
      // if step down would push it below out of expense range then divide step down by 2
      if (getAcceleratorBoostCost(buystartnum + buyInc - stepdown).lte(player.prestigePoints)) {
        stepdown = Math.floor(stepdown / 2)
      } else {
        buyInc = buyInc - Math.max(smallestInc(buyInc), stepdown)
      }
    }
    // go down by 7 steps below the last one able to be bought and spend the cost of 25 up to the one that you started with and stop if coin goes below requirement
    let buyFrom = Math.max(buystartnum + buyInc - 6 - smallestInc(buyInc), buydefault)
    let thisCost = getAcceleratorBoostCost(player.acceleratorBoostBought.toNumber())
    while (buyFrom <= buystartnum + buyInc && player.prestigePoints.gt(getAcceleratorBoostCost(buyFrom))) {
      player.prestigePoints = player.prestigePoints.sub(thisCost)
      player.acceleratorBoostBought = new Decimal(buyFrom)
      buyFrom = buyFrom + smallestInc(buyFrom)
      thisCost = getAcceleratorBoostCost(buyFrom)
      player.acceleratorBoostCost = thisCost

      player.transcendnoaccelerator = false
      player.reincarnatenoaccelerator = false
      if (buyFrom >= buymax) {
        return
      }
    }
  }

  G.ticker = 0
  if (player.acceleratorBoostBought.gte(2) && player.achievements[162] === 0) {
    achievementaward(162)
  }
  if (player.acceleratorBoostBought.gte(10) && player.achievements[163] === 0) {
    achievementaward(163)
  }
  if (player.acceleratorBoostBought.gte(50) && player.achievements[164] === 0) {
    achievementaward(164)
  }
  if (player.acceleratorBoostBought.gte(200) && player.achievements[165] === 0) {
    achievementaward(165)
  }
  if (player.acceleratorBoostBought.gte(1000) && player.achievements[166] === 0) {
    achievementaward(166)
  }
  if (player.acceleratorBoostBought.gte(5000) && player.achievements[167] === 0) {
    achievementaward(167)
  }
  if (player.acceleratorBoostBought.gte(15000) && player.achievements[168] === 0) {
    achievementaward(168)
  }
}
export const getAcceleratorBoostCost = (level = 1): Decimal => {
  // formula starts at 0 but buying starts at 1
  level--
  const base = new Decimal(1e3)
  const eff = 1 + 2 * G.effectiveRuneBlessingPower[4]
  const linSum = (n: number) => n * (n + 1) / 2
  const sqrSum = (n: number) => n * (n + 1) * (2 * n + 1) / 6
  let cost = base
  if (level > 1000 * eff) {
    cost = base.times(Decimal.pow(
      10,
      10 * level
      + linSum(level) // each level increases the exponent by 1 more each time
      + sqrSum(level - 1000 * eff) / eff
    )) // after cost delay is passed each level increases the cost by the square each time
  } else {
    cost = base.times(Decimal.pow(10, 10 * level + linSum(level)))
  }
  return cost
}

