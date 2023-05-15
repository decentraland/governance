import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { UserAttributes } from './types'

export default class UserModel extends Model<UserAttributes> {
  static tableName = 'users'
  static withTimestamps = false
  static primaryKey = 'address'

  static async createConnection(address: string, forum_id: number) {
    const query = SQL`INSERT INTO ${table(this)} (address, forum_id, verification_date) 
    VALUES (${address.toLowerCase()}, ${forum_id}, ${new Date().toISOString()})`

    return await this.namedQuery('create_connection', query)
  }

  static async getAddressesByForumId(forum_ids: number[] | string[]): Promise<{ address: string; forum_id: number }[]> {
    if (forum_ids.length === 0) return Promise.resolve([])

    const query = SQL`SELECT address, forum_id FROM ${table(this)} WHERE forum_id IN (${join(
      forum_ids.map((id) => SQL`${id}`),
      SQL`,`
    )})`
    return await this.namedQuery('get_addresses_by_forum_ids', query)
  }

  static async isProfileValidated(address: string): Promise<boolean> {
    const query = SQL`SELECT count(forum_id) as is_validated FROM ${table(
      this
    )} WHERE address = ${address.toLowerCase()}`
    const result = await this.namedQuery('get_forum_id', query)
    return result[0]?.is_validated > 0
  }

  // TODO: REMOVE BEFORE PRODUCTION
  static async deleteConnection(address: string) {
    const query = SQL`DELETE FROM ${table(this)} WHERE address = ${address.toLowerCase()}`
    return await this.namedQuery('delete_connection', query)
  }
}
