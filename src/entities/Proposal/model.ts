import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { conditional, SQL, table, limit, offset, join, columns, objectValues } from 'decentraland-gatsby/dist/entities/Database/utils'
import { isProposalStatus, isProposalType, ProposalAttributes, ProposalStatus } from './types'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'
import SubscriptionModel from '../Subscription/model'
import { SITEMAP_ITEMS_PER_PAGE } from "./utils"
import tsquery from "./tsquery"
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { QueryPart } from "decentraland-server/dist/db/types"

export type FilterProposalList = {
  type: string,
  user: string,
  status: string,
  subscribed: string,
  search?: string,
  timeFrame?: string,
  order?: "ASC" | "DESC"
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

  static create<U extends QueryPart = any>(proposal: U): Promise<U> {
    const keys = Object.keys(proposal)
      .map(key => key.replace(/\W/gi, ''))

    const sql = SQL`
      INSERT INTO ${table(this)} ${columns(keys)}
      VALUES ${objectValues(keys, [ proposal ])}
    `

    return this.query(sql) as any
  }

  static update<U extends QueryPart = any, P extends QueryPart = any>(changes: Partial<U>, conditions: Partial<P>): Promise<U> {
    const changesKeys = Object.keys(changes).map(key => key.replace(/\W/gi, ''))
    const conditionsKeys = Object.keys(conditions).map(key => key.replace(/\W/gi, ''))
    if (changesKeys.length === 0) {
      throw new Error(`Missing update changes`)
    }

    if (conditionsKeys.length === 0) {
      throw new Error(`Missing update conditions`)
    }

    const sql = SQL`
      UPDATE ${table(this)}
      SET
        ${join(changesKeys.map(key => SQL`"${SQL.raw(key)}" = ${changes[key]}`), SQL`,`)}
      WHERE
        ${join(conditionsKeys.map(key => SQL`"${SQL.raw(key)}" = ${conditions[key]}`), SQL`,`)}
    `

    return this.query(sql) as any
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

    let timeFrame = this.parseTimeframe(filter.timeFrame)

    const result = await this.query(SQL`
      SELECT COUNT(*) as "total"
      FROM ${table(ProposalModel)} p
      ${conditional(!!filter.subscribed, SQL`INNER JOIN ${table(SubscriptionModel)} s ON s."proposal_id" = p."id"`)}
      ${conditional(!!filter.search, SQL`, ts_rank_cd(p.textsearch, to_tsquery(${tsquery(filter.search || '')})) AS "rank"`)}
      WHERE "deleted" = FALSE
      ${conditional(!!filter.user, SQL`AND p."user" = ${filter.user}`)}
      ${conditional(!!filter.type, SQL`AND p."type" = ${filter.type}`)}
      ${conditional(!!filter.status, SQL`AND p."status" = ${filter.status}`)}
      ${conditional(!!filter.subscribed, SQL`AND s."user" = ${filter.subscribed}`)}
      ${conditional(!!timeFrame, SQL`AND "created_at" > ${timeFrame}`)}
      ${conditional(!!filter.search, SQL`AND "rank" > 0`)}
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

    let timeFrame = this.parseTimeframe(filter.timeFrame)

    const orderBy = filter.search ? '"rank"' : 'p.created_at'
    const orderDirection = filter.order || 'DESC'

    const proposals = await this.query(SQL`
      SELECT p.*
      FROM ${table(ProposalModel)} p
      ${conditional(!!filter.subscribed, SQL`INNER JOIN ${table(SubscriptionModel)} s ON s."proposal_id" = p."id"`)}
      ${conditional(!!filter.search, SQL`, ts_rank_cd(textsearch, to_tsquery(${tsquery(filter.search || '')})) AS "rank"`)}
      WHERE "deleted" = FALSE
      ${conditional(!!filter.user, SQL`AND "user" = ${filter.user}`)}
      ${conditional(!!filter.type, SQL`AND "type" = ${filter.type}`)}
      ${conditional(!!filter.status, SQL`AND "status" = ${filter.status}`)}
      ${conditional(!!filter.subscribed, SQL`AND s."user" = ${filter.subscribed}`)}
      ${conditional(!!timeFrame, SQL`AND "created_at" > ${timeFrame}`)}
      ${conditional(!!filter.search, SQL`AND "rank" > 0`)}
      ORDER BY ${SQL.raw(orderBy)} ${SQL.raw(orderDirection)}
      ${limit(filter.limit, { min: 0, max: 100, defaultValue: 100 })}
      ${offset(filter.offset)}
    `)

    return proposals.map(this.parse)
  }

  private static parseTimeframe(timeFrame?:string|null) {
    let date = Time.utc()
    switch (timeFrame) {
      case '3months':
        return date.subtract(90, 'days').toDate()
      case 'month':
        return date.subtract(30, 'days').toDate()
      case 'week':
        return date.subtract(1, 'week').toDate()
      default:
        return null
    }
  }

  static textsearch(proposal: ProposalAttributes) {
    return SQL`(${join([
      SQL`setweight(to_tsvector(${proposal.title}), 'A')`,
      SQL`setweight(to_tsvector(${proposal.user}), 'B')`,
      SQL`setweight(to_tsvector(${proposal.vesting_address || ''}), 'B')`,
      SQL`setweight(to_tsvector(${proposal.description || ''}), 'C')`,
    ], SQL` || `)})`
  }
}
