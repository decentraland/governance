import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { NewPendingBid, PendingBidsAttributes } from './types'

const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY

export default class PendingBidsModel extends Model<PendingBidsAttributes> {
  static tableName = 'pending_bids'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingBid({ tender_id, author_address, bid_proposal_data, publish_at }: NewPendingBid) {
    if (!DB_ENCRYPTION_KEY) throw new Error('DB_ENCRYPTION_KEY is not set')

    const query = SQL`INSERT INTO ${table(this)} 
    (tender_id, author_address, bid_proposal_data, publish_at, created_at) 
    VALUES (
      ${tender_id}, 
      ${author_address.toLowerCase()}, 
      pgp_sym_encrypt(${bid_proposal_data}, ${DB_ENCRYPTION_KEY}), 
      ${publish_at},
      now()
      )
    `

    return await this.namedQuery('create_pending_bid', query)
  }

  static async getBidsByTender(tender_id: string) {
    return
  }
}
