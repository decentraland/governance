import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { BalanceAttributes } from './types'

export default class BalanceModel extends Model<BalanceAttributes> {
  static tableName = 'balances'
  static withTimestamps = false
  static primaryKey = 'id'
}
