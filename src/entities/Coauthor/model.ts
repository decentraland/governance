import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, conditional, join, objectValues, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { ProposalAttributes } from '../Proposal/types'

import { CoauthorAttributes, CoauthorStatus } from './types'

export default class CoauthorModel extends Model<CoauthorAttributes> {
  static tableName = 'coauthors'
  static withTimestamps = false
  static primaryKey = 'proposal_id'

  static async findByColumn(columnName: string, value: string, status?: CoauthorStatus): Promise<CoauthorAttributes[]> {
    const query = SQL`
      SELECT *
      FROM ${table(this)}
      WHERE lower(${columns([columnName])}) = lower(${value})
      ${conditional(!!status, SQL` AND "status" = ${status}`)}
    `
    return await this.query(query)
  }

  static async findCoauthors(proposalId: string, status?: CoauthorStatus): Promise<CoauthorAttributes[]> {
    return await this.findByColumn('proposal_id', proposalId, status)
  }

  static async findProposals(userAddress: string, status?: CoauthorStatus): Promise<CoauthorAttributes[]> {
    return await this.findByColumn('address', userAddress, status)
  }

  static async createMultiple(proposalId: string, userAddresses: string[]): Promise<void> {
    const coauthors = userAddresses.map<CoauthorAttributes>((address) => ({
      proposal_id: proposalId,
      address: address.toLowerCase(),
      status: CoauthorStatus.PENDING,
    }))

    const cols = ['proposal_id', 'address', 'status']
    const query = SQL`
        INSERT INTO ${table(this)} ${columns(cols)}
        VALUES
        ${objectValues(cols, coauthors)}
    `
    await this.query(query)
  }

  static async findAllCoauthors(proposals: ProposalAttributes[], status?: CoauthorStatus): Promise<string[]> {
    const query = SQL`
        SELECT address
        FROM ${table(this)}
        WHERE proposal_id IN (${join(
          proposals.map((proposal) => SQL`${proposal.id}`),
          SQL`, `
        )})
            ${conditional(!!status, SQL` AND status = ${status}`)}
    `

    const result = await this.namedQuery('find_all_coauthors', query)
    return result.map((row) => row.address)
  }
}
