import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { TokenAttributes } from './types'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'
import { ChainId } from '@dcl/schemas'

export default class TokenModel extends Model<TokenAttributes> {
  static tableName = 'tokens'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getContracts(chainId:ChainId) {
    const query = SQL`
      SELECT "contract"
      FROM ${table(TokenModel)}
      WHERE
        "network" = ${chainId}
        AND "contract" != (${'NATIVE'})
      ORDER BY name
    `

    let contracts = await this.query(query)
    return contracts.map(c => c.contract)
  }

  static async findMatchingToken(network: ChainId, contractAddress: string) {
    let token = await TokenModel.findOne<TokenAttributes>({ network: network, contract: contractAddress })
    if (!token) {
      throw new Error(`Could not find matching token for contract ${contractAddress} in network ${network}`)
    }
    return token
  }

  static async getTokenList(): Promise<Partial<TokenAttributes>[]>{
    const query = SQL`
      SELECT DISTINCT name, decimals, symbol
      FROM ${table(TokenModel)} as t
      GROUP BY name, decimals, symbol
      ORDER BY name
    `

    let tokens = await this.query(query)
    return tokens.map(t => {return {name: t.name, decimals: t.decimals, symbol: t.symbol}})
  }

  static async findToken(id: string) {
    let token = await TokenModel.findOne<TokenAttributes>({ id: id })
    if (!token) {
      throw new Error(`Could not find token with id ${id}`)
    }
    return token
  }

}
