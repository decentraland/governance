import VoteModel from '../../entities/Votes/model'

export class VoteService {
  static async getVotes(proposal_id: string) {
    const proposalVotes = await VoteModel.getVotes(proposal_id)
    return proposalVotes?.votes ? proposalVotes.votes : await VoteModel.createEmpty(proposal_id)
  }
}
