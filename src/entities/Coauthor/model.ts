import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { CoauthorAttributes } from './types'

export default class CoauthorModel extends Model<CoauthorAttributes> {
  static tableName = 'coauthors'
  static withTimestamps = false
  static primaryKey = 'proposal_id'

  static async findCoauthors(proposalId: string): Promise<CoauthorAttributes[]> {
    const query = SQL`
      SELECT *
      FROM ${table(CoauthorModel)}
      WHERE "proposal_id" = ${proposalId}
    `
    return await this.query(query)
  }

  static async findProposals(userAddress: string): Promise<CoauthorAttributes[]> {
    const query = SQL`
      SELECT *
      FROM ${table(CoauthorModel)}
      WHERE "coauthor_address" = ${userAddress}
    `
    return await this.query(query)
  }
}
