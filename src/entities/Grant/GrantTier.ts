import { TIERS } from './constants'
import { GrantTierType } from './types'

enum TransparencyOneTimePaymentTier {
  Tier1 = 'Tier 1',
  Tier2 = 'Tier 2',
}

export class GrantTier {
  public type: GrantTierType
  private min: number
  private max: number

  constructor(tier: string) {
    const currentTier = TIERS.find((_tier) => _tier.type === tier)

    if (!currentTier) {
      throw new Error('Invalid tier')
    }

    this.type = currentTier?.type
    this.min = currentTier.min
    this.max = currentTier.max
  }

  static getTierFromBudget(budget: number) {
    const THE_TIER = GrantTierType.LowerTier // TODO: Calculate tier from budget
    return new GrantTier(THE_TIER)
  }

  getVPThreshold(proposalBudget: number) {
    if (this.type === GrantTierType.HigherTier) {
      return 1200000 + proposalBudget * 40
    }

    // lower_tier
    return 2000000
  }

  isSizeValid(size: number) {
    if (size >= this.min && size < this.max) {
      return true
    }

    return false
  }

  isOneTimePaymentTier() {
    const type = this.type as GrantTierType | TransparencyOneTimePaymentTier
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
