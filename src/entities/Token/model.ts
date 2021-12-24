import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { TokenAttributes } from './types'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import { ChainId } from '@dcl/schemas'

export default class TokenModel extends Model<TokenAttributes> {
  static tableName = 'tokens'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getNonNativeContracts(chainId:ChainId) {
    const query = SQL`
      SELECT "contract"
      FROM ${table(TokenModel)}
      WHERE
        "network" = ${chainId}
        AND "contract" NOT IN (${"ether"}, ${"matic"})
    `

    let contracts = await this.query(query)
    return contracts.map(c => c.contract)
  }
}
