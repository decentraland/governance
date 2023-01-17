import {
  GRANT_PROPOSAL_MIN_BUDGET,
  MAX_HIGH_TIER_PROJECT_DURATION,
  MAX_LOWER_TIER_GRANT_FUNDING,
  MAX_LOW_TIER_PROJECT_DURATION,
  MIN_HIGH_TIER_PROJECT_DURATION,
  MIN_LOW_TIER_PROJECT_DURATION,
} from './constants'
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

    return budget > GRANT_PROPOSAL_MIN_BUDGET && budget <= MAX_LOWER_TIER_GRANT_FUNDING
      ? GrantTierType.LowerTier
      : GrantTierType.HigherTier
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

  static getProjectDurationsLimits(budget: number): { min: number; max: number } {
    const type = GrantTier.getTypeFromBudget(budget)
    switch (type) {
      case GrantTierType.HigherTier:
        return { min: MIN_HIGH_TIER_PROJECT_DURATION, max: MAX_HIGH_TIER_PROJECT_DURATION }
      case GrantTierType.LowerTier:
      default:
        return { min: MIN_LOW_TIER_PROJECT_DURATION, max: MAX_LOW_TIER_PROJECT_DURATION }
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
