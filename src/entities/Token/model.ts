import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { TokenAttributes } from './types'

export default class TokenModel extends Model<TokenAttributes> {
  static tableName = 'tokens'
  static withTimestamps = false
  static primaryKey = 'id'
}
