import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { decrypt, inBackground } from '../../helpers'

import { DiscourseAttributes } from './types'

const EXPIRATION_DAYS_AMOUNT = 30

export default class DiscourseModel extends Model<DiscourseAttributes> {
  static tableName = 'discourse'
  static withTimestamps = false
  static primaryKey = 'address'

  static async createConnection(attributes: Omit<DiscourseAttributes, 'expiration_date'>) {
    const now = new Date()
    const { address, forum_id, user_api_key_encrypted } = attributes

    const expiration_date = new Date(now.setDate(now.getDate() + EXPIRATION_DAYS_AMOUNT)).toISOString()

    const query = SQL`INSERT INTO ${table(this)} ${columns([
      'address',
      'forum_id',
      'user_api_key_encrypted',
      'expiration_date',
    ])} VALUES (${address.toLowerCase()}, ${forum_id}, ${user_api_key_encrypted}, ${expiration_date})
    ON CONFLICT (address) DO UPDATE SET
    forum_id = ${forum_id},
    user_api_key_encrypted = ${user_api_key_encrypted},
    expiration_date = ${expiration_date}`

    return await this.namedQuery('upsert_discourse_connection', query)
  }

  static async getAddressesByForumId(forum_ids: number[] | string[]): Promise<{ address: string; forum_id: number }[]> {
    if (forum_ids.length === 0) return Promise.resolve([])

    const query = SQL`SELECT address, forum_id FROM ${table(this)} WHERE forum_id IN (${join(
      forum_ids.map((id) => SQL`${id}`),
      SQL`,`
    )})`
    return await this.namedQuery('get_addresses_by_forum_ids', query)
  }

  static async getUserApiKey(address: string, privateKey: string) {
    const addressLc = address.toLowerCase()
    const row = await this.findOne<DiscourseAttributes>(addressLc)
    if (!row) {
      throw new Error('No connection found')
    }

    const { user_api_key_encrypted, expiration_date } = row
    if (new Date(expiration_date) < new Date()) {
      throw new Error('Connection expired')
    }

    const key = decrypt(user_api_key_encrypted, privateKey)
    const expDate = new Date(expiration_date)
    inBackground(async () =>
      this.update(
        { expiration_date: new Date(expDate.setDate(expDate.getDate() + 1)).toISOString() },
        { address: addressLc }
      )
    )

    return key
  }
}
