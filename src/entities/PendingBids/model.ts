import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { NewPendingBid, PendingBidsAttributes } from './types'

const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY

function checkEncryptionKey() {
  if (!DB_ENCRYPTION_KEY) throw new Error('DB_ENCRYPTION_KEY is not set')
}

export default class PendingBidsModel extends Model<PendingBidsAttributes> {
  static tableName = 'pending_bids'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingBid({ tender_id, author_address, bid_proposal_data, publish_at }: NewPendingBid) {
    checkEncryptionKey()

    const query = SQL`
    INSERT INTO ${table(this)} (tender_id, author_address, bid_proposal_data, publish_at, created_at) 
    VALUES (
      ${tender_id}, 
      ${author_address.toLowerCase()}, 
      pgp_sym_encrypt(${bid_proposal_data}, ${DB_ENCRYPTION_KEY}), 
      ${publish_at},
      (now() at time zone 'utc')
      )
    `

    return await this.namedQuery('create_pending_bid', query)
  }

  static async getBidsInfoByTender(
    tender_id: string
  ): Promise<Pick<PendingBidsAttributes, 'author_address' | 'publish_at' | 'created_at'>[]> {
    const query = SQL`
    SELECT created_at, publish_at, author_address 
    FROM ${table(this)} 
    WHERE tender_id = ${tender_id} order by created_at asc`
    return await this.namedQuery('get_bids_by_tender', query)
  }
  static async getBidsReadyToPublish(): Promise<
    Pick<PendingBidsAttributes, 'author_address' | 'tender_id' | 'bid_proposal_data'>[]
  > {
    checkEncryptionKey()

    const query = SQL`
    SELECT author_address, tender_id, pgp_sym_decrypt(bid_proposal_data::bytea, ${DB_ENCRYPTION_KEY}) as bid_proposal_data 
    FROM ${table(this)} 
    WHERE publish_at <= (now() at time zone 'utc')`

    const bids = await this.namedQuery('get_bids_ready_to_publish', query)

    return bids.map(({ author_address, tender_id, bid_proposal_data }) => ({
      author_address,
      tender_id,
      bid_proposal_data: JSON.parse(bid_proposal_data),
    }))
  }
}
