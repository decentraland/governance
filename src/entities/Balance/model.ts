import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { BalanceAttributes } from './types'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

export default class BalanceModel extends Model<BalanceAttributes> {
  static tableName = 'balances'
  static withTimestamps = false
  static primaryKey = 'id'

  static async findLatest(wallet_id: string, token_id: string): Promise<BalanceAttributes | undefined> {
    const query = SQL`
        SELECT b.*
        FROM ${table(BalanceModel)} b
        WHERE "wallet_id" = ${wallet_id}
          AND "token_id" = ${token_id}
        ORDER BY "created_at" DESC
        LIMIT 1
    `
    let result = await this.query<BalanceAttributes>(query)
    return result.pop()
  }

  static async findLatestBalances(): Promise<BalanceAttributes[]> {
    const query = SQL`
        SELECT b.*
        FROM public.balances as b
                 INNER JOIN
             (SELECT b.wallet_id,
                     b.token_id,
                     max(b.created_at) as max_time
              FROM public.balances as b
                       INNER JOIN public.wallets as w
                                  ON w.id = b.wallet_id
                       INNER JOIN public.tokens as t
                                  ON t.id = b.token_id
              WHERE t.network = w.network
              GROUP BY b.wallet_id, b.token_id) as latestBalances
             ON b.wallet_id = latestBalances.wallet_id
                 AND b.token_id = latestBalances.token_id
                 AND b.created_at = latestBalances.max_time;
    `
    return await this.query<BalanceAttributes>(query)
  }
}
