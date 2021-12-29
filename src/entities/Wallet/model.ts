import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { WalletAttributes } from './types'

export default class WalletModel extends Model<WalletAttributes> {
  static tableName = 'wallets'
  static withTimestamps = false
  static primaryKey = 'id'

  static async findWallet(id: string) {
    const wallet: WalletAttributes | undefined = await WalletModel.findOne(id)
    if (!wallet) {
      throw new Error(`Could not find wallet with id ${id}`)
    }
    return wallet
  }
}
