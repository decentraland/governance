import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { AccountType, UserAttributes, ValidatedDiscordAccount, ValidatedForumAccount } from './types'

export default class UserModel extends Model<UserAttributes> {
  static tableName = 'users'
  static withTimestamps = false
  static primaryKey = 'address'

  static async createForumConnection(address: string, forum_id: string) {
    const query = SQL`
    INSERT INTO ${table(this)} (address, forum_id, forum_verification_date) 
    VALUES (${address.toLowerCase()}, ${forum_id}, ${new Date().toISOString()})
    ON CONFLICT (address)
    DO UPDATE SET
      forum_id = EXCLUDED.forum_id,
      forum_verification_date = EXCLUDED.forum_verification_date
    `

    return await this.namedQuery('create_connection', query)
  }

  static async createDiscordConnection(address: string, discord_id: string) {
    const query = SQL`
      INSERT INTO ${table(this)} (address, discord_id, discord_verification_date) 
      VALUES (${address.toLowerCase()}, ${discord_id}, ${new Date().toISOString()})
      ON CONFLICT (address)
      DO UPDATE SET
        discord_id = EXCLUDED.discord_id,
        discord_verification_date = EXCLUDED.discord_verification_date
    `

    return await this.namedQuery('create_discord_connection', query)
  }

  static async getAddressesByForumId(forum_ids: number[] | string[]): Promise<ValidatedForumAccount[]> {
    if (forum_ids.length === 0) return Promise.resolve([])

    const query = SQL`SELECT address, forum_id, discord_id FROM ${table(this)} WHERE forum_id IN (${join(
      forum_ids.map((id) => SQL`${id}`),
      SQL`,`
    )})`
    return await this.namedQuery('get_addresses_by_forum_ids', query)
  }

  static async getDiscordIdsByAddresses(addresses: string[]): Promise<ValidatedDiscordAccount[]> {
    if (addresses.length === 0) return Promise.resolve([])

    const query = SQL`
      SELECT address, forum_id, discord_id FROM ${table(this)} WHERE address IN (${join(
      addresses.map((addr) => SQL`${addr.toLowerCase()}`),
      SQL`,`
    )})
    `
    return await this.namedQuery('get_discord_ids_by_addresses', query)
  }

  static async isValidated(address: string, accounts: Set<AccountType>): Promise<boolean> {
    const columnMap: Record<AccountType, string> = {
      [AccountType.Forum]: 'forum_id',
      [AccountType.Discord]: 'discord_id',
      [AccountType.Twitter]: 'NOT_IMPLEMENTED',
    }

    if (accounts.size === 0) {
      throw new Error('No accounts provided')
    }

    const countClauses = [...accounts].map((account) => {
      const column = columnMap[account]
      if (!column) throw new Error(`Account ${account} not implemented`)
      return SQL`COUNT(CASE WHEN ${columns([column])} IS NOT NULL THEN 1 ELSE NULL END)`
    })
    const query = SQL`
      SELECT ${join(countClauses, SQL` + `)} as total_no_null_columns 
      FROM ${table(this)} 
      WHERE address = ${address.toLowerCase()}
    `
    const result = await this.namedQuery('get_user_validated', query)
    return result[0]?.total_no_null_columns === String(accounts.size)
  }
}
