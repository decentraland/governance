import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { conditional, SQL, table, limit, offset, join } from 'decentraland-gatsby/dist/entities/Database/utils'
import { isProposalStatus, isProposalType, ProposalAttributes, ProposalStatus } from './types'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

export default class ProposalModel extends Model<ProposalAttributes> {
  static tableName = 'proposals'
  static withTimestamps = false
  static primaryKey = 'id'

  static parse(proposal: ProposalAttributes): ProposalAttributes {
    return {
      ...proposal,
      configuration: JSON.parse(proposal.configuration),
      snapshot_proposal: JSON.parse(proposal.snapshot_proposal)
    }
  }

  static async activateProposals() {
    const query = SQL`
      UPDATE ${table(ProposalModel)}
      SET
        "status" = ${ProposalStatus.Active},
        "updated_at" = now()
      WHERE
        "deleted" = FALSE
        AND "status" = ${ProposalStatus.Pending}
        AND "start_at" <= now()
    `

    return this.rowCount(query)
  }

  static async getFinishedProposal() {
    const query = SQL`
      SELECT *
      FROM ${table(ProposalModel)}
      WHERE
        "deleted" = FALSE
        AND "status" IN (${ProposalStatus.Active}, ${ProposalStatus.Pending})
        AND "finish_at" <= now()
    `

    const result = await this.query(query)
    return result.map(ProposalModel.parse)
  }

  static async finishProposal(proposal_ids: string[], status: ProposalStatus) {
    const valid_ids = (proposal_ids || []).filter(id => isUUID(id))
    if (valid_ids.length === 0) {
      return 0
    }

    const ids = valid_ids.map(id => SQL`${id}`)

    const query = SQL`
      UPDATE ${table(ProposalModel)}
      SET
        "status" = ${status},
        "updated_at" = ${new Date}
      WHERE
        "deleted" = FALSE
        AND "status" IN (${ProposalStatus.Active}, ${ProposalStatus.Pending})
        AND "id" IN (${join(ids)})
    `

    return this.rowCount(query)
  }

  static async enactProposal() {}

  static async getProposalList(filter: { type?: string, user?: string, status?: string, limit?: number, offset?: number } = {}) {
    if (filter.user && !isEthereumAddress(filter.user)) {
      return []
    }

    if (filter.type && !isProposalType(filter.type)) {
      return []
    }

    if (filter.status && !isProposalStatus(filter.status)) {
      return []
    }

    const proposals = await this.query(SQL`
      SELECT *
      FROM ${table(ProposalModel)}
      WHERE "deleted" = FALSE
      ${conditional(!!filter.user, SQL`AND "user" = ${filter.user}`)}
      ${conditional(!!filter.type, SQL`AND "type" = ${filter.type}`)}
      ${conditional(!!filter.status, SQL`AND "status" = ${filter.status}`)}
      ORDER BY "created_at" DESC
      ${limit(filter.limit, { min: 0, max: 100, defaultValue: 100 })}
      ${offset(filter.offset)}
    `)

    return proposals.map(this.parse)
  }
}