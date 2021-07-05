import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { conditional, SQL, table, limit, offset, join } from 'decentraland-gatsby/dist/entities/Database/utils'
import { isProposalStatus, isProposalType, ProposalAttributes, ProposalStatus, ProposalType } from './types'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'
import SubscriptionModel from '../Subscription/model'
import { SITEMAP_ITEMS_PER_PAGE } from './utils'

export type FilterProposalList = {
  type: string,
  user: string,
  status: string,
  subscribed: string,
}

export type FilterPaginatation = {
  limit: number,
  offset: number
}

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

  static async countAll() {
    return this.count<ProposalAttributes>({ deleted: false })
  }

  static async getSitemapProposals(page: number): Promise<{ id: string }[]> {
    const query = SQL`
      SELECT id FROM ${table(ProposalModel)}
      WHERE "deleted" = FALSE
      ORDER BY created_at ASC
      OFFSET ${page * SITEMAP_ITEMS_PER_PAGE}
      LIMIT ${SITEMAP_ITEMS_PER_PAGE}
    `

    return this.query(query)
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
        AND "start_at" >= now()
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
        AND "finish_at" <= (now() + interval '1 minute')
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

  static async getProposalTotal(filter: Partial<FilterProposalList> = {}) {
    if (filter.user && !isEthereumAddress(filter.user)) {
      return 0
    }

    if (filter.subscribed && !isEthereumAddress(filter.subscribed)) {
      return 0
    }

    if (filter.type && !isProposalType(filter.type)) {
      return 0
    }

    if (filter.status && !isProposalStatus(filter.status)) {
      return 0
    }

    const result = await this.query(SQL`
      SELECT COUNT(*) as "total"
      FROM ${table(ProposalModel)} p
      ${conditional(!!filter.subscribed, SQL`INNER JOIN ${table(SubscriptionModel)} s ON s."proposal_id" = p."id"`)}
      WHERE "deleted" = FALSE
      ${conditional(!!filter.user, SQL`AND p."user" = ${filter.user}`)}
      ${conditional(!!filter.type, SQL`AND p."type" = ${filter.type}`)}
      ${conditional(!!filter.status, SQL`AND p."status" = ${filter.status}`)}
      ${conditional(!!filter.subscribed, SQL`AND s."user" = ${filter.subscribed}`)}
    `)

    return result && result[0] && Number(result[0].total) || 0
  }

  static async getProposalList(filter: Partial<FilterProposalList & FilterPaginatation> = {}) {
    if (filter.user && !isEthereumAddress(filter.user)) {
      return []
    }

    if (filter.subscribed && !isEthereumAddress(filter.subscribed)) {
      return []
    }

    if (filter.type && !isProposalType(filter.type)) {
      return []
    }

    if (filter.status && !isProposalStatus(filter.status)) {
      return []
    }

    const proposals = await this.query(SQL`
      SELECT p.*
      FROM ${table(ProposalModel)} p
      ${conditional(!!filter.subscribed, SQL`INNER JOIN ${table(SubscriptionModel)} s ON s."proposal_id" = p."id"`)}
      WHERE "deleted" = FALSE
      ${conditional(!!filter.user, SQL`AND "user" = ${filter.user}`)}
      ${conditional(!!filter.type, SQL`AND "type" = ${filter.type}`)}
      ${conditional(!!filter.status, SQL`AND "status" = ${filter.status}`)}
      ${conditional(!!filter.subscribed, SQL`AND s."user" = ${filter.subscribed}`)}
      ORDER BY "created_at" DESC
      ${limit(filter.limit, { min: 0, max: 100, defaultValue: 100 })}
      ${offset(filter.offset)}
    `)

    return proposals.map(this.parse)
  }
}