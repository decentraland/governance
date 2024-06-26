import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, conditional, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { Event, EventFilter, EventType } from '../../shared/types/events'

const LATEST_EVENTS_LIMIT = 50

export default class EventModel extends Model<Event> {
  static tableName = 'events'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getAll(): Promise<Event[]> {
    const query = SQL`
      SELECT *
      FROM ${table(EventModel)}
      ORDER BY created_at DESC
    `
    const result = await this.namedQuery<Event>('get_all_events', query)
    return result
  }

  static async getLatest(filters?: EventFilter): Promise<Event[]> {
    const { event_type } = filters || {}
    const query = SQL`
      SELECT *
      FROM ${table(EventModel)}
      WHERE created_at >= NOW() - INTERVAL '7 day'
      ${conditional(
        !!event_type,
        SQL`AND event_type IN (${join(event_type?.map((type) => SQL`${type}`) || [], SQL`, `)})`
      )}
      ORDER BY created_at DESC
      LIMIT ${LATEST_EVENTS_LIMIT}
    `
    const result = await this.namedQuery<Event>('get_latest_events', query)
    return result
  }

  static async isDiscourseEventRegistered(discourseEventId: string) {
    const query = SQL`
      SELECT count(*)
      FROM ${table(EventModel)}
      WHERE
          event_type = ${EventType.ProposalCommented} AND 
          (event_data ->>'discourse_event_id') = ${discourseEventId}
    `
    const count = (await this.namedQuery<{ count: string }>('find_discourse_event_id', query))[0].count
    return Number(count) !== 0
  }

  static async isDelegationTxRegistered(txHash: string) {
    const query = SQL`
      SELECT count(*)
      FROM ${table(EventModel)}
      WHERE
          event_type IN (${EventType.DelegationSet}, ${EventType.DelegationClear}) AND 
          (event_data ->>'transaction_hash') = ${txHash}
    `
    const count = (await this.namedQuery<{ count: string }>('find_delegation_tx', query))[0].count
    return Number(count) !== 0
  }
}
