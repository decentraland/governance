import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import {
  SQL,
  columns,
  conditional,
  join,
  limit,
  objectValues,
  offset,
  table,
} from 'decentraland-gatsby/dist/entities/Database/utils'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { QueryPart } from 'decentraland-server/dist/db/types'
import isEthereumAddress from 'validator/lib/isEthereumAddress'
import isUUID from 'validator/lib/isUUID'

import CoauthorModel from '../Coauthor/model'
import SubscriptionModel from '../Subscription/model'

import { CoauthorStatus } from './../Coauthor/types'

import tsquery from './tsquery'
import { ProposalAttributes, ProposalStatus, isProposalStatus, isProposalType } from './types'
import { SITEMAP_ITEMS_PER_PAGE } from './utils'

export type FilterProposalList = {
  type: string
  user: string
  status: string
  subscribed: string
  coauthor: boolean
  search?: string
  timeFrame?: string
  timeFrameKey?: string
  order?: 'ASC' | 'DESC'
  snapshotIds?: string
}

export type FilterPagination = {
  limit: number
  offset: number
}

const VALID_TIMEFRAME_KEYS = ['created_at', 'finish_at']
const VALID_ORDER_DIRECTION = ['ASC', 'DESC']

export default class ProposalModel extends Model<ProposalAttributes> {
  static tableName = 'proposals'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getProposal(id: string) {
    if (!isUUID(id || '')) {
      throw new Error(`Not found proposal: "${id}"`)
    }

    const proposal = await this.findOne<ProposalAttributes>({ id, deleted: false })
    if (!proposal) {
      throw new Error(`Not found proposal: "${id}"`)
    }

    return this.parse(proposal)
  }

  static parse(proposal: ProposalAttributes): ProposalAttributes {
    return {
      ...proposal,
      configuration: JSON.parse(proposal.configuration),
      snapshot_proposal: JSON.parse(proposal.snapshot_proposal),
    }
  }

  static create<U extends QueryPart = any>(proposal: U): Promise<U> {
    const keys = Object.keys(proposal).map((key) => key.replace(/\W/gi, ''))

    const sql = SQL`
        INSERT INTO ${table(this)} ${columns(keys)}
        VALUES
        ${objectValues(keys, [proposal])}
    `

    return this.query(sql) as any
  }

  static update<U extends QueryPart = any, P extends QueryPart = any>(
    changes: Partial<U>,
    conditions: Partial<P>
  ): Promise<U> {
    const changesKeys = Object.keys(changes).map((key) => key.replace(/\W/gi, ''))
    const conditionsKeys = Object.keys(conditions).map((key) => key.replace(/\W/gi, ''))
    if (changesKeys.length === 0) {
      throw new Error(`Missing update changes`)
    }

    if (conditionsKeys.length === 0) {
      throw new Error(`Missing update conditions`)
    }

    const sql = SQL`
        UPDATE ${table(this)}
        SET ${join(
          changesKeys.map((key) => SQL`"${SQL.raw(key)}" = ${changes[key]}`),
          SQL`,`
        )}
        WHERE ${join(
          conditionsKeys.map((key) => SQL`"${SQL.raw(key)}" = ${conditions[key]}`),
          SQL`,`
        )}
    `

    return this.query(sql) as any
  }

  static async countAll() {
    return this.count<ProposalAttributes>({ deleted: false })
  }

  static async findFromSnapshotIds(ids: string[]): Promise<ProposalAttributes[]> {
    const query = SQL`
        SELECT *
        FROM ${table(ProposalModel)}
        WHERE "snapshot_id" IN (${join(
          ids.map((id) => SQL`${id}`),
          SQL`, `
        )})`

    const results = await this.query(query)
    return results.map((item) => ProposalModel.parse(item))
  }

  static async getSitemapProposals(page: number): Promise<{ id: string }[]> {
    const query = SQL`
        SELECT id
        FROM ${table(ProposalModel)}
        WHERE "deleted" = FALSE
        ORDER BY created_at ASC
        OFFSET ${page * SITEMAP_ITEMS_PER_PAGE} LIMIT ${SITEMAP_ITEMS_PER_PAGE}
    `

    return this.query(query)
  }

  static async activateProposals() {
    const query = SQL`
        UPDATE ${table(ProposalModel)}
        SET "status"     = ${ProposalStatus.Active},
            "updated_at" = now()
        WHERE "deleted" = FALSE
          AND "status" = ${ProposalStatus.Pending}
          AND "start_at" >= now()
    `

    return this.rowCount(query)
  }

  static async getFinishedProposals() {
    const query = SQL`
        SELECT *
        FROM ${table(ProposalModel)}
        WHERE "deleted" = FALSE
          AND "status" IN (${ProposalStatus.Active}, ${ProposalStatus.Pending})
          AND "finish_at" <= (now() + interval '1 minute')
    `

    const result = await this.query(query)
    return result.map(ProposalModel.parse)
  }

  static async finishProposal(proposal_ids: string[], status: ProposalStatus) {
    const valid_ids = (proposal_ids || []).filter((id) => isUUID(id))
    if (valid_ids.length === 0) {
      return 0
    }

    const ids = valid_ids.map((id) => SQL`${id}`)

    const query = SQL`
        UPDATE ${table(ProposalModel)}
        SET "status"     = ${status},
            "updated_at" = ${new Date()}
        WHERE "deleted" = FALSE
          AND "status" IN (${ProposalStatus.Active}, ${ProposalStatus.Pending})
          AND "id" IN (${join(ids)})
    `

    return this.rowCount(query)
  }

  static async getProposalTotal(filter: Partial<FilterProposalList> = {}): Promise<number> {
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

    if (filter.coauthor && !filter.user) {
      return 0
    }

    const timeFrame = this.parseTimeframe(filter.timeFrame)
    const timeFrameKey = filter.timeFrameKey || 'created_at'
    const sqlSnapshotIds = filter.snapshotIds ? filter.snapshotIds?.split(',').map((id) => SQL`${id}`) : null
    const sqlSnapshotIdsJoin = sqlSnapshotIds ? join(sqlSnapshotIds) : null

    if (!VALID_TIMEFRAME_KEYS.includes(timeFrameKey)) {
      return 0
    }

    const result = await this.query(SQL`
    SELECT COUNT(*) as "total"
    FROM ${table(ProposalModel)} p
        ${conditional(!!filter.subscribed, SQL`INNER JOIN ${table(SubscriptionModel)} s ON s."proposal_id" = p."id"`)} 
        ${conditional(!!filter.coauthor, SQL`INNER JOIN ${table(CoauthorModel)} c ON c."proposal_id" = p."id"`)}
      ${conditional(
        !!filter.search,
        SQL`, ts_rank_cd(p.textsearch, to_tsquery(${tsquery(filter.search || '')})) AS "rank"`
      )}
    WHERE "deleted" = FALSE 
    ${conditional(!!filter.snapshotIds, SQL`AND p."snapshot_id" IN (${sqlSnapshotIdsJoin})`)} 
    ${conditional(!!filter.user && !filter.coauthor, SQL`AND p."user" = ${filter.user}`)} 
    ${conditional(
      !!filter.coauthor,
      SQL`AND lower(c."address") = lower(${filter.user}) AND (CASE WHEN p."finish_at" < NOW() THEN c."status" IN (${CoauthorStatus.APPROVED}, ${CoauthorStatus.REJECTED}) ELSE TRUE END)`
    )}
    ${conditional(!!filter.type, SQL`AND p."type" = ${filter.type}`)} 
    ${conditional(!!filter.status, SQL`AND p."status" = ${filter.status}`)} 
    ${conditional(!!filter.subscribed, SQL`AND s."user" = ${filter.subscribed}`)} 
    ${conditional(!!timeFrame && timeFrameKey === 'created_at', SQL`AND p."created_at" > ${timeFrame}`)} 
    ${conditional(
      !!timeFrame && timeFrameKey === 'finish_at',
      SQL`AND p."finish_at" > NOW() AND p."finish_at" < ${timeFrame}`
    )}
    ${conditional(!!filter.search, SQL`AND "rank" > 0`)}`)

    return (!!result && result[0] && Number(result[0].total)) || 0
  }

  static async getProposalList(filter: Partial<FilterProposalList & FilterPagination> = {}) {
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

    if (filter.coauthor && !filter.user) {
      return []
    }

    const timeFrame = this.parseTimeframe(filter.timeFrame)
    const timeFrameKey = filter.timeFrameKey || 'created_at'
    const orderDirection = filter.order || 'DESC'

    if (!VALID_TIMEFRAME_KEYS.includes(timeFrameKey) || !VALID_ORDER_DIRECTION.includes(orderDirection)) {
      return []
    }

    const orderBy = filter.search ? '"rank"' : `p.${timeFrameKey}`

    const sqlSnapshotIds = filter.snapshotIds?.split(',').map((id) => SQL`${id}`)
    const sqlSnapshotIdsJoin = sqlSnapshotIds ? join(sqlSnapshotIds) : null

    const proposals = await this.query(SQL`
    SELECT p.*
    FROM ${table(ProposalModel)} p
        ${conditional(!!filter.subscribed, SQL`INNER JOIN ${table(SubscriptionModel)} s ON s."proposal_id" = p."id"`)}
        ${conditional(!!filter.coauthor, SQL`INNER JOIN ${table(CoauthorModel)} c ON c."proposal_id" = p."id"`)} 
        ${conditional(
          !!filter.search,
          SQL`, ts_rank_cd(textsearch, to_tsquery(${tsquery(filter.search || '')})) AS "rank"`
        )}
    WHERE "deleted" = FALSE 
    ${conditional(!!sqlSnapshotIds, SQL`AND p."snapshot_id" IN (${sqlSnapshotIdsJoin})`)} 
    ${conditional(!!filter.user && !filter.coauthor, SQL`AND p."user" = ${filter.user}`)} 
    ${conditional(
      !!filter.coauthor,
      SQL`AND lower(c."address") = lower(${filter.user}) AND (CASE WHEN p."finish_at" < NOW() THEN c."status" IN (${CoauthorStatus.APPROVED}, ${CoauthorStatus.REJECTED}) ELSE TRUE END)`
    )}
    ${conditional(!!filter.type, SQL`AND "type" = ${filter.type}`)} 
    ${conditional(!!filter.status, SQL`AND "status" = ${filter.status}`)} 
    ${conditional(!!filter.subscribed, SQL`AND s."user" = ${filter.subscribed}`)} 
    ${conditional(!!timeFrame && timeFrameKey === 'created_at', SQL`AND p."created_at" > ${timeFrame}`)} 
    ${conditional(
      !!timeFrame && timeFrameKey === 'finish_at',
      SQL`AND p."finish_at" > NOW() AND p."finish_at" < ${timeFrame}`
    )}
    ${conditional(!!filter.search, SQL`AND "rank" > 0`)}
    ORDER BY ${conditional(!!filter.coauthor, SQL`CASE c.status WHEN 'PENDING' THEN 1 END,`)} 
    ${SQL.raw(orderBy)} ${SQL.raw(orderDirection)} 
    ${limit(filter.limit, {
      min: 0,
      max: 100,
      defaultValue: 100,
    })} ${offset(filter.offset)}`)

    return proposals.map(this.parse)
  }

  private static parseTimeframe(timeFrame?: string | null) {
    const date = Time.utc()
    switch (timeFrame) {
      case '3months':
        return date.subtract(90, 'days').toDate()
      case 'month':
        return date.subtract(30, 'days').toDate()
      case 'week':
        return date.subtract(1, 'week').toDate()
      case '2days':
        return date.add(2, 'days').toDate()
      default:
        return null
    }
  }

  static textsearch(title: string, description: string, user: string, vesting_address: string | null) {
    return SQL`(${join(
      [
        SQL`setweight(to_tsvector(${title}), 'A')`,
        SQL`setweight(to_tsvector(${user}), 'B')`,
        SQL`setweight(to_tsvector(${vesting_address || ''}), 'B')`,
        SQL`setweight(to_tsvector(${description || ''}), 'C')`,
      ],
      SQL` || `
    )})`
  }
}
