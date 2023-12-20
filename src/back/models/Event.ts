import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { Event } from '../../shared/types/events'

export default class EventModel extends Model<Event> {
  static tableName = 'events'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getLatest(): Promise<Event[]> {
    const query = SQL`
      SELECT *
      FROM ${table(EventModel)}
      WHERE created_at >= NOW() - INTERVAL '7 day'
      ORDER BY created_at DESC
    `
    const result = await this.namedQuery<Event>('get_latest_events', query)
    return result
  }

  static async deleteOldEvents() {
    const query = SQL`
      DELETE
      FROM ${table(EventModel)}
      WHERE created_at < NOW() - INTERVAL '7 day'
    `
    await this.namedQuery('delete_old_events', query)
  }
}
