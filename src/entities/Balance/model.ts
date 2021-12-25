import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { BalanceAttributes } from './types'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

export default class BalanceModel extends Model<BalanceAttributes> {
  static tableName = 'balances'
  static withTimestamps = false
  static primaryKey = 'id'

  static async findLatest(wallet_id:string, token_id:string):Promise<BalanceAttributes | undefined> {
    const query = SQL`
      SELECT b.*
      FROM ${table(BalanceModel)} b
      WHERE
        "wallet_id" = ${wallet_id}
        AND "token_id" = ${token_id}
      ORDER BY "created_at" DESC
      LIMIT 1
    `
    let result = await this.query<BalanceAttributes>(query)
    return result.pop()
  }
}
