import { def, get } from 'bdd-lazy-var/getter'

import { SnapshotService } from '../../services/SnapshotService'
import Time from '../../utils/date/Time'
import { getPreviousMonthStartAndEnd } from '../../utils/date/getPreviousMonthStartAndEnd'
import { SNAPSHOT_VOTES_AUGUST_2023 } from '../../utils/votes/utils.testData'

import { VoteService } from './vote'

describe('getTopVoters', () => {
  const firstOfAugust = Time.utc('2023-08-1T00:00:000Z').toDate()
  const { start, end } = getPreviousMonthStartAndEnd(firstOfAugust)

  beforeAll(() => {
    jest.spyOn(SnapshotService, 'getAllVotesBetweenDates').mockResolvedValue(SNAPSHOT_VOTES_AUGUST_2023)
  })

  describe('when fetching the top 3', () => {
    def('topVoters', async () => await VoteService.getTopVoters(start, end, 3))

    it('should return the top 3 voters sorted by votes in descending order', async () => {
      expect(await get.topVoters).toEqual([
        {
          address: '0xa2f8cd45cd7ea14bce6e87f177cf9df928a089a5',
          votes: 79,
        },
        {
          address: '0x2684a202a374d87bb321a744482b89bf6deaf8bd',
          votes: 75,
        },
        {
          address: '0x8218a2445679e38f358e42f88fe2125c98440d59',
          votes: 73,
        },
      ])
    })
  })

  describe('when called with the default params', () => {
    def('topVoters', async () => await VoteService.getTopVoters(start, end))

    it('should return the top 5 voters sorted by votes in descending order', async () => {
      expect(await get.topVoters).toEqual([
        {
          address: '0xa2f8cd45cd7ea14bce6e87f177cf9df928a089a5',
          votes: 79,
        },
        {
          address: '0x2684a202a374d87bb321a744482b89bf6deaf8bd',
          votes: 75,
        },
        {
          address: '0x8218a2445679e38f358e42f88fe2125c98440d59',
          votes: 73,
        },
        {
          address: '0xa77294828d42b538890fa6e97adffe9305536171',
          votes: 53,
        },
        {
          address: '0x4534c46ea854c9a302d3dc95b2d3253ae6a28abc',
          votes: 21,
        },
      ])
    })
  })
})
