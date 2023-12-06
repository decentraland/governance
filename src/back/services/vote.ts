import { getQueryTimestamp } from '../../clients/SnapshotGraphql'
import { SnapshotVote } from '../../clients/SnapshotTypes'
import { VOTES_VP_THRESHOLD } from '../../constants'
import VoteModel from '../../entities/Votes/model'
import { Participation, VoteCount, Voter } from '../../entities/Votes/types'
import CacheService, { TTL_1_HS, TTL_24_HS } from '../../services/CacheService'
import { SnapshotService } from '../../services/SnapshotService'
import Time from '../../utils/date/Time'
import { getAMonthAgo, getAWeekAgo } from '../../utils/date/aMonthAgo'
import { getPreviousMonthStartAndEnd } from '../../utils/date/getPreviousMonthStartAndEnd'

const DEFAULT_TOP_VOTERS_LIMIT = 5

export class VoteService {
  static async getVotes(proposal_id: string) {
    const proposalVotes = await VoteModel.getVotes(proposal_id)
    return proposalVotes?.votes ? proposalVotes.votes : await VoteModel.createEmpty(proposal_id)
  }

  static async getTopVotersForLast30Days(limit = DEFAULT_TOP_VOTERS_LIMIT) {
    const end = Time().utc().toDate()
    const start = getAMonthAgo(end)

    const rankedVoters = await this.getRankedVotersWithCache(start, end)
    return rankedVoters.slice(0, limit)
  }

  static async getTopVotersForPreviousMonth(limit = DEFAULT_TOP_VOTERS_LIMIT) {
    const today = Time.utc().toDate()
    const { start, end } = getPreviousMonthStartAndEnd(today)

    const rankedVoters = await this.getRankedVotersForDates(start, end)
    return rankedVoters.slice(0, limit)
  }

  static async getParticipation(): Promise<Participation> {
    const now = Time().utc().toDate()
    const aMonthAgo = getAMonthAgo(now)
    const aWeekAgo = getAWeekAgo(now)

    const startKey = aMonthAgo.toISOString().split('T')[0]
    const endKey = now.toISOString().split('T')[0]
    const cacheKey = `participation-${startKey}-${endKey}`

    const cachedData = CacheService.get<Participation>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    const votes = await SnapshotService.getVotesByDates(aMonthAgo, now)

    const aMonthAgoTimestamp = getQueryTimestamp(aMonthAgo.getTime())
    const aWeekAgoTimestamp = getQueryTimestamp(aWeekAgo.getTime())

    const last30DaysVotes = this.countHighQualityVotes(votes, aMonthAgoTimestamp)
    const lastWeekVotes = this.countHighQualityVotes(votes, aWeekAgoTimestamp)

    const participation = { last30Days: last30DaysVotes, lastWeek: lastWeekVotes }
    CacheService.set(cacheKey, participation, TTL_1_HS)

    return participation
  }

  private static countHighQualityVotes(votes: SnapshotVote[], timestamp: number) {
    return votes.filter((vote) => vote.created >= timestamp && vote.vp && vote.vp >= VOTES_VP_THRESHOLD).length
  }

  private static async getRankedVotersWithCache(start: Date, end: Date) {
    const startKey = start.toISOString().split('T')[0]
    const endKey = end.toISOString().split('T')[0]
    const cacheKey = `top-voters-${startKey}-${endKey}`
    const cachedData = CacheService.get<Voter[]>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    const rankedVoters = await this.getRankedVotersForDates(start, end)
    CacheService.set(cacheKey, rankedVoters, TTL_24_HS)

    return rankedVoters
  }

  private static async getRankedVotersForDates(start: Date, end: Date) {
    const votes = await SnapshotService.getVotesByDates(start, end)
    return this.getSortedVoteCountPerUser(votes)
  }

  public static getSortedVoteCountPerUser(votes: SnapshotVote[]) {
    const votesByUser = votes
      .filter((vote) => vote.vp && vote.vp > VOTES_VP_THRESHOLD)
      .reduce((acc, vote) => {
        const address = vote.voter.toLowerCase()
        if (!acc[address]) {
          acc[address] = {
            votes: 1,
            lastVoted: vote.created,
          }
        } else {
          acc[address] = {
            votes: acc[address].votes + 1,
            lastVoted: acc[address].lastVoted < vote.created ? vote.created : acc[address].lastVoted,
          }
        }
        return acc
      }, {} as Record<string, VoteCount>)

    const voteCountPerUser = Object.entries(votesByUser).map<Voter>(([address, voteCount]) => ({
      address,
      ...voteCount,
    }))
    return voteCountPerUser.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes
      }
      return a.lastVoted - b.lastVoted
    })
  }
}
