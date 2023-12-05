import CacheService from '../../services/CacheService'
import { SnapshotService } from '../../services/SnapshotService'
import { SNAPSHOT_VOTES_30_DAYS } from '../../utils/votes/Votes-30days'
import { SNAPSHOT_VOTES_AUGUST_2023 } from '../../utils/votes/Votes-August-2023'

import { VoteService } from './vote'

const FIRST_OF_AUGUST_2023 = new Date(2023, 7, 1)
const SECOND_OF_AUGUST_2023 = new Date(2023, 7, 2)
const FIRST_OF_SEPTEMBER_2023 = new Date(2023, 8, 1)

describe('getTopVoters', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(FIRST_OF_AUGUST_2023)
  })

  describe('when fetching top voters for August 2023', () => {
    beforeEach(() => {
      jest.spyOn(SnapshotService, 'getVotesByDates').mockResolvedValue(SNAPSHOT_VOTES_AUGUST_2023)
    })

    describe('when fetching the top 3 voters', () => {
      const topVoters = async () => await VoteService.getTopVotersForLast30Days(3)

      it('should return the top 3 voters sorted by votes in descending order', async () => {
        expect(await topVoters()).toEqual([
          {
            address: '0x4534c46ea854c9a302d3dc95b2d3253ae6a28abc',
            lastVoted: 1693517160,
            votes: 9,
          },
          {
            address: '0x2ae9070b029d05d8e6516aec0475002c53595a9d',
            lastVoted: 1693523735,
            votes: 6,
          },
          {
            address: '0x703b6e7d10f9ab127bcfcb2dd9985b6b24ba1152',
            lastVoted: 1693518089,
            votes: 3,
          },
        ])
      })

      describe('if the same request has been made before', () => {
        beforeEach(() => {
          jest.clearAllMocks()
          jest.spyOn(SnapshotService, 'getVotesByDates').mockResolvedValue([])
        })

        it('should return the cached votes', async () => {
          expect(SnapshotService.getVotesByDates).not.toHaveBeenCalled()
          expect(await topVoters()).toEqual([
            {
              address: '0x4534c46ea854c9a302d3dc95b2d3253ae6a28abc',
              lastVoted: 1693517160,
              votes: 9,
            },
            {
              address: '0x2ae9070b029d05d8e6516aec0475002c53595a9d',
              lastVoted: 1693523735,
              votes: 6,
            },
            {
              address: '0x703b6e7d10f9ab127bcfcb2dd9985b6b24ba1152',
              lastVoted: 1693518089,
              votes: 3,
            },
          ])
        })

        describe('if the dates change', () => {
          beforeAll(() => {
            jest.setSystemTime(SECOND_OF_AUGUST_2023)
          })

          it('re-fetches data for the first call', async () => {
            await VoteService.getTopVotersForLast30Days(3)
            expect(SnapshotService.getVotesByDates).toHaveBeenCalledTimes(1)
          })

          it('returns cached votes for subsequent calls', async () => {
            await VoteService.getTopVotersForLast30Days(3)
            expect(SnapshotService.getVotesByDates).toHaveBeenCalledTimes(0)
          })
        })
      })
    })

    describe('when called with the default params', () => {
      beforeAll(() => {
        jest.setSystemTime(FIRST_OF_AUGUST_2023)
      })

      const getTopVoters = async () => await VoteService.getTopVotersForLast30Days()

      it('should return the top 5 voters sorted by votes in descending order', async () => {
        expect(await getTopVoters()).toEqual([
          {
            address: '0x4534c46ea854c9a302d3dc95b2d3253ae6a28abc',
            lastVoted: 1693517160,
            votes: 9,
          },
          {
            address: '0x2ae9070b029d05d8e6516aec0475002c53595a9d',
            lastVoted: 1693523735,
            votes: 6,
          },
          {
            address: '0x703b6e7d10f9ab127bcfcb2dd9985b6b24ba1152',
            lastVoted: 1693518089,
            votes: 3,
          },
          {
            address: '0x15f51853d17e89d97980883eef4c6aba6ba82ed5',
            lastVoted: 1692744184,
            votes: 1,
          },
          {
            address: '0xc95ed3844cfc92e68ab7b0cd72e832a3f6eb0259',
            lastVoted: 1692744186,
            votes: 1,
          },
        ])
      })

      describe('when there are no votes on the selected time period', () => {
        beforeEach(() => {
          jest.clearAllMocks()
          jest.spyOn(SnapshotService, 'getVotesByDates').mockResolvedValue([])
          CacheService.flush()
        })

        it('should return an empty array', async () => {
          expect(await getTopVoters()).toEqual([])
        })
      })
    })
  })

  describe('when fetching the top 10 voters for a random month span', () => {
    beforeAll(() => {
      jest.clearAllMocks()
      jest.spyOn(SnapshotService, 'getVotesByDates').mockResolvedValue(SNAPSHOT_VOTES_30_DAYS)
      CacheService.flush()
    })

    describe('when fetching the top 10 voters', () => {
      const getTopVoters = async () => await VoteService.getTopVotersForLast30Days(10)

      it('should return the top 10 voters sorted by votes in descending order', async () => {
        const topVoters = await getTopVoters()
        expect(topVoters).toEqual([
          {
            address: '0x338571a641d8c43f9e5a306300c5d89e0cb2cfaf',
            lastVoted: 1691429934,
            votes: 11,
          },
          {
            address: '0x2f30998c61b21179aa237f77fd578ba8679eb43d',
            lastVoted: 1691434211,
            votes: 11,
          },
          {
            address: '0xa8f98b7b2039256ba66a12fead20e750ecf9670d',
            lastVoted: 1691415396,
            votes: 8,
          },
          {
            address: '0xed7461fd98758a84b76d6e941cbb92891443c36f',
            lastVoted: 1691432207,
            votes: 6,
          },
          {
            address: '0x26871b48edad35f81901ab9002e656e594397e7d',
            lastVoted: 1691420208,
            votes: 5,
          },
          {
            address: '0x613e052555ac74ff6af0fc64e40e8035c1e9dcf8',
            lastVoted: 1691417293,
            votes: 4,
          },
          {
            address: '0x1d7886346175e34c614b71d0e2369c7f0e350d07',
            lastVoted: 1691438203,
            votes: 4,
          },
          {
            address: '0xca204bba80813f79c97a7240d662773d626d23ba',
            lastVoted: 1691369051,
            votes: 3,
          },
          {
            address: '0x501956ace74edb360c56d0c0fa74b0066fd6f486',
            lastVoted: 1691432175,
            votes: 3,
          },
          {
            address: '0x7bbea9c18cd0541acab8c19da2b11d0c03faef1c',
            lastVoted: 1691432462,
            votes: 3,
          },
        ])
        expect(topVoters[0].lastVoted).toBeLessThan(topVoters[1].lastVoted)
      })
    })
  })
})

describe('getSortedCountPerUser', () => {
  it('sorts the vote count per user and chronologically', () => {
    const sortedVotes = VoteService.getSortedVoteCountPerUser(SNAPSHOT_VOTES_AUGUST_2023)
    expect(sortedVotes).toEqual([
      {
        address: '0x4534c46ea854c9a302d3dc95b2d3253ae6a28abc',
        lastVoted: 1693517160,
        votes: 9,
      },
      {
        address: '0x2ae9070b029d05d8e6516aec0475002c53595a9d',
        lastVoted: 1693523735,
        votes: 6,
      },
      {
        address: '0x703b6e7d10f9ab127bcfcb2dd9985b6b24ba1152',
        lastVoted: 1693518089,
        votes: 3,
      },
      {
        address: '0x15f51853d17e89d97980883eef4c6aba6ba82ed5',
        lastVoted: 1692744184,
        votes: 1,
      },
      {
        address: '0xc95ed3844cfc92e68ab7b0cd72e832a3f6eb0259',
        lastVoted: 1692744186,
        votes: 1,
      },
      {
        address: '0x003a3eb1a1d2ad3bea19ae06324727beeeec2e34',
        lastVoted: 1693001196,
        votes: 1,
      },
    ])

    expect(sortedVotes[3].votes).toEqual(sortedVotes[4].votes)
    expect(sortedVotes[3].lastVoted).toBeLessThan(sortedVotes[4].lastVoted)
    expect(sortedVotes[4].votes).toEqual(sortedVotes[5].votes)
    expect(sortedVotes[4].lastVoted).toBeLessThan(sortedVotes[5].lastVoted)
  })
})

describe('getParticipation', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(FIRST_OF_SEPTEMBER_2023)
  })

  describe('when fetching participation on August 2023', () => {
    beforeEach(() => {
      jest.spyOn(SnapshotService, 'getVotesByDates').mockResolvedValue(SNAPSHOT_VOTES_AUGUST_2023)
    })

    it('should return the vote count for last 30 days and last week', async () => {
      expect(await VoteService.getParticipation()).toEqual({
        last30Days: 21,
        lastWeek: 14,
      })
    })
  })
})
