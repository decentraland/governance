import Time from 'decentraland-gatsby/dist/utils/date/Time'

import { ProposalService } from './ProposalService'

jest.mock('../constants', () => ({
  DISCORD_SERVICE_ENABLED: false,
}))

describe('ProposalService', () => {
  describe('getActiveGrantsWindowStartDate', () => {
    const NOW = Time.utc('2023-01-15 00:00:00Z').toDate()
    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers('modern').setSystemTime(NOW)
    })
    it('returns the current date minus the grant proposal duration in seconds', () => {
      expect(new Date().toUTCString()).toEqual(NOW.toUTCString())
      expect(ProposalService.getActiveGrantsWindowStartDate('1209600').toISOString()).toEqual(
        '2023-01-01T00:00:00.000Z'
      )
    })
  })
})
