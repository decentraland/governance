import { getProposalsMinAndMaxDates } from './utils'

const MIN_DATE = new Date('01-01-2023')
const MIDDLE_DATE = new Date('01-03-2023')
const MAX_DATE = new Date('02-05-2023')

describe('getProposalsMinAndMaxDates', () => {
  describe('given a list of proposals with different start dates', () => {
    it('returns the min and max start dates', () => {
      const PROPOSALS = [{ start_at: MIDDLE_DATE }, { start_at: MIN_DATE }, { start_at: MAX_DATE }]
      expect(getProposalsMinAndMaxDates(PROPOSALS)).toEqual({
        minDate: MIN_DATE,
        maxDate: MAX_DATE,
      })
    })
  })
  describe('given a list of proposals with same start dates', () => {
    it('returns the same min and max start dates', () => {
      const PROPOSALS = [{ start_at: MIN_DATE }, { start_at: MIN_DATE }, { start_at: MIN_DATE }]
      expect(getProposalsMinAndMaxDates(PROPOSALS)).toEqual({
        minDate: MIN_DATE,
        maxDate: MIN_DATE,
      })
    })
  })
})
