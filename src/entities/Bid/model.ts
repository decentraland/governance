import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { BidAttributes, BidStatus, NewBid } from './types'

const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY

function checkEncryptionKey() {
  if (!DB_ENCRYPTION_KEY) throw new Error('DB_ENCRYPTION_KEY is not set')
}

export default class PendingBidsModel extends Model<BidAttributes> {
  static tableName = 'pending_bids'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createBid({ linked_proposal_id, author_address, bid_proposal_data, publish_at, status }: NewBid) {
    checkEncryptionKey()

    const query = SQL`
    INSERT INTO ${table(this)} (tender_id, author_address, bid_proposal_data, publish_at, created_at, status) 
    VALUES (
      ${linked_proposal_id}, 
      ${author_address.toLowerCase()}, 
      pgp_sym_encrypt(${bid_proposal_data}, ${DB_ENCRYPTION_KEY}), 
      ${publish_at},
      (now() at time zone 'utc'),
      ${status}
      )
    `

    return await this.namedQuery('create_pending_bid', query)
  }

  static async getBidsInfoByTender(
    tender_id: string
  ): Promise<Pick<BidAttributes, 'author_address' | 'publish_at' | 'created_at'>[]> {
    const query = SQL`
    SELECT created_at, publish_at, author_address 
    FROM ${table(this)} 
    WHERE tender_id = ${tender_id} AND status = ${BidStatus.Pending} 
    ORDER BY created_at ASC`
    return await this.namedQuery('get_bids_by_tender', query)
  }
  static async getBidsReadyToPublish(): Promise<
    Pick<BidAttributes, 'author_address' | 'tender_id' | 'bid_proposal_data'>[]
  > {
    checkEncryptionKey()

    const query = SQL`
    SELECT author_address, tender_id, pgp_sym_decrypt(bid_proposal_data::bytea, ${DB_ENCRYPTION_KEY}) as bid_proposal_data 
    FROM ${table(this)} 
    WHERE publish_at <= (now() at time zone 'utc') AND status = ${BidStatus.Pending}`

    const bids = await this.namedQuery('get_bids_ready_to_publish', query)

    return bids.map(({ author_address, tender_id, bid_proposal_data }) => ({
      author_address,
      tender_id,
      bid_proposal_data: JSON.parse(bid_proposal_data),
    }))
  }

  static async rejectBidsFromTenders(tender_ids: string[]) {
    const query = SQL`
    UPDATE ${table(this)} 
    SET status = ${BidStatus.Rejected} 
    WHERE tender_id IN (${join(
      tender_ids.map((id) => SQL`${id}`),
      SQL`, `
    )}) AND status = ${BidStatus.Pending}`

    return await this.namedQuery('reject_bids_from_tenders', query)
  }

  static async removePendingBid(author_address: string, tender_id: string) {
    const query = SQL`
    DELETE FROM ${table(this)} 
    WHERE author_address = ${author_address.toLowerCase()} 
      AND tender_id = ${tender_id} 
      AND status = ${BidStatus.Pending}`

    return await this.namedQuery('remove_pending_bid', query)
  }
}
