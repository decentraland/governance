import { GrantTier, TransparencyOneTimePaymentTier } from './GrantTier'
import { GrantTierType } from './types'

describe('entities/GrantTier', () => {
  describe('getTierFromBudget', () => {
    const typeFromBudget = (budget: number) => GrantTier.getTypeFromBudget(budget)

    describe('Invalid budget when budget is less than 0', () => {
      const budget = -1
      it('throw error', () => {
        expect(() => typeFromBudget(budget)).toThrow('Grant budget is not valid')
      })
    })
    describe('Invalid budget when budget is more than 240000', () => {
      const budget = 240001
      it('throw error', () => {
        expect(() => typeFromBudget(budget)).toThrow('Grant budget is not valid')
      })
    })
    describe('Lower tier budget within budget size', () => {
      const budget = 15000
      it('should return a GrantTier with lower tier type', () => {
        expect(typeFromBudget(budget)).toBe(GrantTierType.LowerTier)
      })
    })
    describe('Lower tier budget on budget size upper limit', () => {
      const budget = 20000
      it('should return a GrantTier with lower tier type', () => {
        expect(typeFromBudget(budget)).toBe(GrantTierType.LowerTier)
      })
    })
    describe('Higher tier budget on budget size lower limit', () => {
      const budget = 20001
      it('should return a GrantTier with higher tier type', () => {
        expect(typeFromBudget(budget)).toBe(GrantTierType.HigherTier)
      })
    })
    describe('Higher tier budget within budget size', () => {
      const budget = 200000
      it('should return a GrantTier with higher tier type', () => {
        expect(typeFromBudget(budget)).toBe(GrantTierType.HigherTier)
      })
    })
  })

  describe('getVPThreshold', () => {
    const vpThreshold = (budget: number) => GrantTier.getVPThreshold(budget)

    describe('15000 budget', () => {
      const budget = 15000
      it('should return 2000000', () => {
        expect(vpThreshold(budget)).toBe(2000000)
      })
    })
    describe('60000 budget', () => {
      const budget = 60000
      it('should return 3600000', () => {
        expect(vpThreshold(budget)).toBe(3600000)
      })
    })
    describe('120000 budget', () => {
      const budget = 120000
      it('should return 6000000', () => {
        expect(vpThreshold(budget)).toBe(6000000)
      })
    })
    describe('240000 budget', () => {
      const budget = 240000
      it('should return 10800000', () => {
        expect(vpThreshold(budget)).toBe(10800000)
      })
    })
  })

  describe('isOneTimePaymentTier', () => {
    const isOneTimePaymentTier = (tierType: GrantTierType | TransparencyOneTimePaymentTier) =>
      GrantTier.isOneTimePaymentTier(tierType)

    describe('Tier 1 type', () => {
      const tierType = GrantTierType.Tier1
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(true)
      })
    })
    describe('Tier 1 transparency type', () => {
      const tierType = TransparencyOneTimePaymentTier.Tier1
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(true)
      })
    })
    describe('Tier 2 type', () => {
      const tierType = GrantTierType.Tier2
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(true)
      })
    })
    describe('Tier 2 transparency type', () => {
      const tierType = TransparencyOneTimePaymentTier.Tier2
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(true)
      })
    })
    describe('Tier 3 type', () => {
      const tierType = GrantTierType.Tier3
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
    describe('Tier 3 type', () => {
      const tierType = GrantTierType.Tier3
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
    describe('Tier 4 type', () => {
      const tierType = GrantTierType.Tier4
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
    describe('Tier 5 type', () => {
      const tierType = GrantTierType.Tier5
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
    describe('Tier 6 type', () => {
      const tierType = GrantTierType.Tier6
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
    describe('Lower tier type', () => {
      const tierType = GrantTierType.LowerTier
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
    describe('Higher tier type', () => {
      const tierType = GrantTierType.HigherTier
      it('should return true', () => {
        expect(isOneTimePaymentTier(tierType)).toBe(false)
      })
    })
  })

  describe('Project duration limits', () => {
    const projectDurationLimits = (budget: number) => GrantTier.getProjectDurationsLimits(budget)

    describe('for a lower tier type', () => {
      const budget = 15000
      it('should return 1 and 6 months', () => {
        expect(projectDurationLimits(budget).min).toBe(1)
        expect(projectDurationLimits(budget).max).toBe(6)
      })
    })
    describe('for a higher tier type', () => {
      const budget = 50000
      it('should return 3 and 12 months', () => {
        expect(projectDurationLimits(budget).min).toBe(3)
        expect(projectDurationLimits(budget).max).toBe(12)
      })
    })
  })
})
