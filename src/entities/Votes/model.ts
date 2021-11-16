import { createHash } from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table, join } from 'decentraland-gatsby/dist/entities/Database/utils'
import { VoteAttributes } from './types'
import { ProposalAttributes } from '../Proposal/types'


export default class VotesModel extends Model<VoteAttributes> {
  static tableName = 'scores'
  static withTimestamps = false
  static primaryKey = 'proposal_id'

  static parse(score: VoteAttributes): VoteAttributes {
    return {
      ...score,
      votes: JSON.parse(score.votes)
    }
  }

  static hashVotes(votes: any) {
    const hasher = createHash('sha1')
    hasher.update(JSON.stringify(votes))
    return hasher.digest('hex')
  }

  static async getVotes(proposal_id: string) {
    const result = await this.findOne<VoteAttributes>({ proposal_id })
    return result ? this.parse(result) : null
  }

  static async createEmpty(proposal_id: string) {
    const newScore = this.newScoreFor(proposal_id)
    await this.create(newScore)
    return newScore
  }

  static async safelyGetVotesFor(proposal: ProposalAttributes<any>) {
    let proposalVotes: VoteAttributes | null = await VotesModel.getVotes(proposal.id)
    return proposalVotes === null || proposalVotes.votes === {} ? await VotesModel.createEmpty(proposal.id) : proposalVotes.votes
  }

  static newScoreFor(proposal_id: string) {
    const votes = {}
    const hash = this.hashVotes(votes)
    const newScore: VoteAttributes = {
      proposal_id,
      hash,
      votes: JSON.stringify(votes),
      created_at: new Date,
      updated_at: new Date,
    }
    return newScore
  }

  static async findAny(ids: string[]): Promise<VoteAttributes[]> {
    const query = SQL`
      SELECT *
      FROM ${table(VotesModel)}
      WHERE "proposal_id" IN (${join(ids.map(id => SQL`${id}`), SQL`, `)})`

    const results = await this.query(query)
    return results.map(score => VotesModel.parse(score))
  }
}
