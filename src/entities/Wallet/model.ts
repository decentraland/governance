import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { WalletAttributes } from './types'

export default class WalletModel extends Model<WalletAttributes> {
  static tableName = 'wallets'
  static withTimestamps = false
  static primaryKey = 'id'
}
