import { SnapshotVote } from '../../clients/SnapshotTypes'
import { VOTES_VP_THRESHOLD } from '../../constants'
import VoteModel from '../../entities/Votes/model'
import { VoteCount, Voter } from '../../entities/Votes/types'
import { SnapshotService } from '../../services/SnapshotService'

const DEFAULT_TOP_VOTERS_LIMIT = 5

export class VoteService {
  static async getVotes(proposal_id: string) {
    const proposalVotes = await VoteModel.getVotes(proposal_id)
    return proposalVotes?.votes ? proposalVotes.votes : await VoteModel.createEmpty(proposal_id)
  }

  static async getTopVoters(start: Date, end: Date, limit = DEFAULT_TOP_VOTERS_LIMIT) {
    const votes = await SnapshotService.getVotesByDates(start, end)
    return this.getSortedVoteCountPerUser(votes).slice(0, limit)
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
