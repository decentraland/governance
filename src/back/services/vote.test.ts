import { def, get } from 'bdd-lazy-var/getter'

import { SnapshotService } from '../../services/SnapshotService'
import Time from '../../utils/date/Time'
import { getPreviousMonthStartAndEnd } from '../../utils/date/getPreviousMonthStartAndEnd'
import { SNAPSHOT_VOTES_30_DAYS } from '../../utils/votes/Votes-30days'
import { SNAPSHOT_VOTES_AUGUST_2023 } from '../../utils/votes/Votes-August-2023'

import { VoteService } from './vote'

import clearAllMocks = jest.clearAllMocks

describe('getTopVoters', () => {
  describe('when fetching top voters for August 2023', () => {
    const firstOfAugust = Time.utc('2023-08-01T00:00:00.000Z').toDate()
    const { start, end } = getPreviousMonthStartAndEnd(firstOfAugust)
    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(SnapshotService, 'getAllVotesBetweenDates').mockResolvedValue(SNAPSHOT_VOTES_AUGUST_2023)
    })

    describe('when fetching the top 3 voters', () => {
      def('topVoters', async () => await VoteService.getTopVoters(start, end, 3))

      it('should return the top 3 voters sorted by votes in descending order', async () => {
        expect(await get.topVoters).toEqual([
          {
            address: '0x613e052555ac74ff6af0fc64e40e8035c1e9dcf8',
            votes: 95,
          },
          {
            address: '0xd6eff8f07caf3443a1178407d3de4129149d6ef6',
            votes: 85,
          },
          {
            address: '0x0749d1abb5ca9128432b612644c0ea1e9c6cc9af',
            votes: 84,
          },
        ])
      })
    })

    describe('when called with the default params', () => {
      def('topVoters', async () => await VoteService.getTopVoters(start, end))

      it('should return the top 5 voters sorted by votes in descending order', async () => {
        expect(await get.topVoters).toEqual([
          {
            address: '0x613e052555ac74ff6af0fc64e40e8035c1e9dcf8',
            votes: 95,
          },
          {
            address: '0xd6eff8f07caf3443a1178407d3de4129149d6ef6',
            votes: 85,
          },
          {
            address: '0x0749d1abb5ca9128432b612644c0ea1e9c6cc9af',
            votes: 84,
          },
          {
            address: '0x4599acc33c2c8f47dcb9646d5120a874fcb6b1d6',
            votes: 82,
          },
          {
            address: '0xa2f8cd45cd7ea14bce6e87f177cf9df928a089a5',
            votes: 80,
          },
        ])
      })
      describe('when there are no votes on the selected time period', () => {
        beforeEach(() => {
          clearAllMocks()
          jest.spyOn(SnapshotService, 'getAllVotesBetweenDates').mockResolvedValue([])
        })

        it('should return an empty array', async () => {
          expect(await get.topVoters).toEqual([])
        })
      })
    })
  })

  describe('when fetching the top 10 voters for a random month span', () => {
    const septemberSeventh = Time.utc('2023-09-07T00:00:00.000Z')
    const aMonthBefore = septemberSeventh.subtract(1, 'month').startOf('day').toDate()
    beforeAll(() => {
      jest.clearAllMocks()
      jest.spyOn(SnapshotService, 'getAllVotesBetweenDates').mockResolvedValue(SNAPSHOT_VOTES_30_DAYS)
    })

    describe('when fetching the top 10 voters', () => {
      def('topVoters', async () => await VoteService.getTopVoters(aMonthBefore, septemberSeventh.toDate(), 10))

      it('should return the top 3 voters sorted by votes in descending order', async () => {
        expect(await get.topVoters).toEqual([
          { address: '0x0749d1abb5ca9128432b612644c0ea1e9c6cc9af', votes: 83 },
          { address: '0xa2f8cd45cd7ea14bce6e87f177cf9df928a089a5', votes: 83 },
          { address: '0x338571a641d8c43f9e5a306300c5d89e0cb2cfaf', votes: 83 },
          { address: '0x4599acc33c2c8f47dcb9646d5120a874fcb6b1d6', votes: 83 },
          { address: '0x613e052555ac74ff6af0fc64e40e8035c1e9dcf8', votes: 82 },
          { address: '0x8218a2445679e38f358e42f88fe2125c98440d59', votes: 75 },
          { address: '0xd6eff8f07caf3443a1178407d3de4129149d6ef6', votes: 74 },
          { address: '0x247e0896706bb09245549e476257a0a1129db418', votes: 74 },
          { address: '0x26871b48edad35f81901ab9002e656e594397e7d', votes: 74 },
          { address: '0x2684a202a374d87bb321a744482b89bf6deaf8bd', votes: 73 },
        ])
      })
    })
  })
})
