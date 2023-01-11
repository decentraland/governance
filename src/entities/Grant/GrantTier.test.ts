import { def, get } from 'bdd-lazy-var/getter'

import { GrantTier, TransparencyOneTimePaymentTier } from './GrantTier'
import { GrantTierType } from './types'

describe('entities/GrantTier', () => {
  describe('getTierFromBudget', () => {
    def('tierType', () => GrantTier.getTypeFromBudget(get.budget))
    describe('Invalid budget when budget is less than 0', () => {
      def('budget', () => -1)
      it('throw error', () => {
        expect(() => get.tierType).toThrowError('Grant budget is not valid')
      })
    })
    describe('Invalid budget when budget is more than 240000', () => {
      def('budget', () => 240001)
      it('throw error', () => {
        expect(() => get.tierType).toThrowError('Grant budget is not valid')
      })
    })
    describe('Lower tier budget within budget size', () => {
      def('budget', () => 15000)
      it('should return a GrantTier with lower tier type', () => {
        expect(get.tierType).toBe(GrantTierType.LowerTier)
      })
    })
    describe('Lower tier budget on budget size upper limit', () => {
      def('budget', () => 20000)
      it('should return a GrantTier with lower tier type', () => {
        expect(get.tierType).toBe(GrantTierType.LowerTier)
      })
    })
    describe('Higher tier budget on budget size lower limit', () => {
      def('budget', () => 20001)
      it('should return a GrantTier with higher tier type', () => {
        expect(get.tierType).toBe(GrantTierType.HigherTier)
      })
    })
    describe('Higher tier budget within budget size', () => {
      def('budget', () => 200000)
      it('should return a GrantTier with higher tier type', () => {
        expect(get.tierType).toBe(GrantTierType.HigherTier)
      })
    })
  })

  describe('getVPThreshold', () => {
    def('vpThreshold', () => GrantTier.getVPThreshold(get.budget))
    describe('15000 budget', () => {
      def('budget', () => 15000)
      it('should return 2000000', () => {
        expect(get.vpThreshold).toBe(2000000)
      })
    })
    describe('60000 budget', () => {
      def('budget', () => 60000)
      it('should return 3600000', () => {
        expect(get.vpThreshold).toBe(3600000)
      })
    })
    describe('120000 budget', () => {
      def('budget', () => 120000)
      it('should return 6000000', () => {
        expect(get.vpThreshold).toBe(6000000)
      })
    })
    describe('240000 budget', () => {
      def('budget', () => 240000)
      it('should return 10800000', () => {
        expect(get.vpThreshold).toBe(10800000)
      })
    })
  })

  describe('isOneTimePaymentTier', () => {
    def('isOneTimePaymentTier', () => GrantTier.isOneTimePaymentTier(get.tierType))
    describe('Tier 1 type', () => {
      def('tierType', () => GrantTierType.Tier1)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(true)
      })
    })
    describe('Tier 1 transparency type', () => {
      def('tierType', () => TransparencyOneTimePaymentTier.Tier1)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(true)
      })
    })
    describe('Tier 2 type', () => {
      def('tierType', () => GrantTierType.Tier2)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(true)
      })
    })
    describe('Tier 2 transparency type', () => {
      def('tierType', () => TransparencyOneTimePaymentTier.Tier2)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(true)
      })
    })
    describe('Tier 3 type', () => {
      def('tierType', () => GrantTierType.Tier3)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
    describe('Tier 3 type', () => {
      def('tierType', () => GrantTierType.Tier3)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
    describe('Tier 4 type', () => {
      def('tierType', () => GrantTierType.Tier4)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
    describe('Tier 5 type', () => {
      def('tierType', () => GrantTierType.Tier5)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
    describe('Tier 6 type', () => {
      def('tierType', () => GrantTierType.Tier6)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
    describe('Lower tier type', () => {
      def('tierType', () => GrantTierType.LowerTier)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
    describe('Higher tier type', () => {
      def('tierType', () => GrantTierType.HigherTier)
      it('should return true', () => {
        expect(get.isOneTimePaymentTier).toBe(false)
      })
    })
  })
})

// describe('getVPThreshold', () => {
//   test('lowerTier', () => {
//     def('tierType', () => TIERS[0].type)
//     const budget = 10000
//     expect(get.grantType.getVPThreshold(budget)).toEqual(2000000)
//   })
//   test('higherTier', () => {
//     def('tierType', () => TIERS[1].type)
//     const budget = 10000
//     expect(get.grantType.getVPThreshold(budget)).toEqual(2000000)
//   })
// })
