import { ProposalGrantTier, ProposalGrantTierValues } from './types'
import { isGrantSizeValid } from './utils'

describe('isGrantSizeValid', () => {
  let tier: ProposalGrantTier | null, size: string | number

  describe('for the lower tier ', () => {
    beforeAll(() => {
      tier = ProposalGrantTier.Tier1
    })

    describe('when the grant size is inside the tier limits ', () => {
      beforeAll(() => {
        size = 800
      })
      it('should say it is valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(true)
      })
    })

    describe('when the grant size is zero ', () => {
      beforeAll(() => {
        size = 0
      })
      it('should say it is not valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(false)
      })
    })

    describe('when the grant size is negative ', () => {
      beforeAll(() => {
        size = -100
      })
      it('should say it is not valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(false)
      })
    })

    describe('when the grant size is equal to the upper limit', () => {
      beforeAll(() => {
        size = ProposalGrantTierValues[ProposalGrantTier.Tier1]
      })
      it('should say it valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(true)
      })
    })

    describe('when the grant size is above the upper limit', () => {
      beforeAll(() => {
        size = ProposalGrantTierValues[ProposalGrantTier.Tier1] + 1
      })
      it('should say it is not valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(false)
      })
    })
  })

  describe('when no tier is provided', () => {
    beforeAll(() => {
      tier = null
      size = 100
    })

    it('should say it is not valid', () => {
      expect(isGrantSizeValid(tier, size)).toBe(false)
    })
  })

  describe('for the upper tier ', () => {
    beforeAll(() => {
      tier = ProposalGrantTier.Tier6
    })

    describe('when the grant size is inside the tier limits ', () => {
      beforeAll(() => {
        size = ProposalGrantTierValues[ProposalGrantTier.Tier5] + 500
      })
      it('should say it is valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(true)
      })
    })

    describe('when the grant is below the lower limit ', () => {
      beforeAll(() => {
        size = ProposalGrantTierValues[ProposalGrantTier.Tier5] - 500
      })
      it('should say it is not valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(false)
      })
    })

    describe('when the grant is equal to the lower limit ', () => {
      beforeAll(() => {
        size = ProposalGrantTierValues[ProposalGrantTier.Tier5]
      })
      it('should say it is not valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(false)
      })
    })

    describe('when the grant size is above the upper limit ', () => {
      beforeAll(() => {
        size = ProposalGrantTierValues[ProposalGrantTier.Tier6] + 500
      })
      it('should say it is not valid', () => {
        expect(isGrantSizeValid(tier, size)).toBe(false)
      })
    })
  })
})
