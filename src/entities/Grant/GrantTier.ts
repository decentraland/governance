import { GrantTierType } from './types'
import { isValidGrantBudget } from './utils'

export enum TransparencyOneTimePaymentTier {
  Tier1 = 'Tier 1',
  Tier2 = 'Tier 2',
}

export class GrantTier {
  static getTypeFromBudget(budget: number) {
    if (!isValidGrantBudget(budget)) {
      throw new Error('Grant budget is not valid')
    }

    return budget > 0 && budget <= 20000 ? GrantTierType.LowerTier : GrantTierType.HigherTier
  }

  static getVPThreshold(budget: number) {
    const type = GrantTier.getTypeFromBudget(budget)
    switch (type) {
      case GrantTierType.HigherTier:
        return 1200000 + budget * 40
      case GrantTierType.LowerTier:
      default:
        return 2000000
    }
  }

  static isOneTimePaymentTier(type: GrantTierType | TransparencyOneTimePaymentTier) {
    switch (type) {
      case GrantTierType.Tier1:
      case GrantTierType.Tier2:
      case TransparencyOneTimePaymentTier.Tier1:
      case TransparencyOneTimePaymentTier.Tier2:
        return true
      default:
        return false
    }
  }
}
