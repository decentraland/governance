import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, objectValues, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { CoauthorAttributes, CoauthorStatus } from './types'

export default class CoauthorModel extends Model<CoauthorAttributes> {
  static tableName = 'coauthors'
  static withTimestamps = false
  static primaryKey = 'proposal_id'

  static async findByColumn(columnName: string, value: string): Promise<CoauthorAttributes[]> {
    const query = SQL`
      SELECT *
      FROM ${table(this)}
      WHERE lower(${columns([columnName])}) = lower(${value})
    `
    return await this.query(query)
  }

  static async findCoauthors(proposalId: string): Promise<CoauthorAttributes[]> {
    return await this.findByColumn('proposal_id', proposalId)
  }

  static async findProposals(userAddress: string): Promise<CoauthorAttributes[]> {
    return await this.findByColumn('coauthor_address', userAddress)
  }

  static async createMultiple(proposalId: string, userAddresses: string[]): Promise<void> {
    const coauthors = userAddresses.map<CoauthorAttributes>((address) => ({
      proposal_id: proposalId,
      coauthor_address: address.toLowerCase(),
      status: CoauthorStatus.PENDING,
    }))

    const cols = ['proposal_id', 'coauthor_address', 'status']
    const query = SQL`
        INSERT INTO ${table(this)} ${columns(cols)}
        VALUES
        ${objectValues(cols, coauthors)}
    `
    await this.query(query)
  }
}
