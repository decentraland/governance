import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, conditional, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

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
      INSERT INTO ${table(this)} (address, discord_id, discord_verification_date, is_discord_notifications_active) 
      VALUES (${address.toLowerCase()}, ${discord_id}, ${new Date().toISOString()}, true)
      ON CONFLICT (address)
      DO UPDATE SET
        discord_id = EXCLUDED.discord_id,
        discord_verification_date = EXCLUDED.discord_verification_date,
        is_discord_notifications_active = EXCLUDED.is_discord_notifications_active
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

  static async getActiveDiscordIds(addresses: string[]): Promise<ValidatedDiscordAccount[]> {
    return await this.getDiscordIds(addresses, true)
  }

  static async getDiscordIds(addresses: string[], shouldDiscordBeActive = false): Promise<ValidatedDiscordAccount[]> {
    if (addresses.length === 0) return Promise.resolve([])

    const query = SQL`
      SELECT address, forum_id, discord_id, is_discord_notifications_active FROM ${table(
        this
      )} WHERE address IN (${join(
      addresses.map((addr) => SQL`${addr.toLowerCase()}`),
      SQL`,`
    )}) AND discord_id IS NOT NULL ${conditional(
      shouldDiscordBeActive,
      SQL`AND is_discord_notifications_active = true`
    )}
    `
    return await this.namedQuery('get_discord_ids_by_addresses', query)
  }

  static async updateDiscordActiveStatus(address: string, is_discord_notifications_active: boolean) {
    const query = SQL`
      UPDATE ${table(this)} 
      SET is_discord_notifications_active = ${is_discord_notifications_active}
      WHERE address = ${address.toLowerCase()} AND discord_id IS NOT NULL
    `
    return await this.namedQuery('update_discord_active_status', query)
  }

  static async isValidated(address: string, accounts: Set<AccountType>): Promise<boolean> {
    const columnMap: Record<AccountType, string> = {
      [AccountType.Forum]: 'forum_id',
      [AccountType.Discord]: 'discord_id',
      [AccountType.Push]: 'NOT_IMPLEMENTED',
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

  static async unlinkAccount(address: string, accountType: AccountType) {
    let query

    switch (accountType) {
      case AccountType.Forum:
        query = SQL`
        UPDATE ${table(this)}
        SET forum_id = NULL, forum_verification_date = NULL
        WHERE address = ${address.toLowerCase()}
      `
        break
      case AccountType.Discord:
        query = SQL`
        UPDATE ${table(this)}
        SET discord_id = NULL, discord_verification_date = NULL, is_discord_notifications_active = NULL
        WHERE address = ${address.toLowerCase()}
      `
        break
      default:
        throw new Error(`Unlinking account type ${accountType} is not supported`)
    }

    return await this.namedQuery('unlink_account', query)
  }
}
