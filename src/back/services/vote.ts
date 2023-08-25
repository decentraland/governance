import { SnapshotVote } from '../../clients/SnapshotGraphqlTypes'
import { VOTES_VP_THRESHOLD } from '../../constants'
import VoteModel from '../../entities/Votes/model'
import { Voter } from '../../entities/Votes/types'
import { SnapshotService } from '../../services/SnapshotService'

const DEFAULT_TOP_VOTERS_LIMIT = 5

export class VoteService {
  static async getVotes(proposal_id: string) {
    const proposalVotes = await VoteModel.getVotes(proposal_id)
    return proposalVotes?.votes ? proposalVotes.votes : await VoteModel.createEmpty(proposal_id)
  }

  static async getTopVoters(start: Date, end: Date, limit = DEFAULT_TOP_VOTERS_LIMIT) {
    const votes = await SnapshotService.getAllVotesBetweenDates(new Date(start), new Date(end))
    return this.countVotesByUser(votes).slice(0, limit)
  }

  private static countVotesByUser(votes: SnapshotVote[]) {
    const votesByUser = votes
      .filter((vote) => vote.vp && vote.vp > VOTES_VP_THRESHOLD)
      .reduce((acc, vote) => {
        const address = vote.voter.toLowerCase()
        acc[address] = (acc[address] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return Object.entries(votesByUser).map<Voter>(([address, votes]) => ({ address, votes }))
  }
}
