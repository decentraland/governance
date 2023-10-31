import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, join, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { BidStatus, UnpublishedBidAttributes } from './types'

const DB_ENCRYPTION_KEY = String(process.env.DB_ENCRYPTION_KEY || '')

function checkEncryptionKey() {
  if (!DB_ENCRYPTION_KEY || DB_ENCRYPTION_KEY.length === 0) throw new Error('DB_ENCRYPTION_KEY is not set')
}

export default class UnpublishedBidModel extends Model<UnpublishedBidAttributes> {
  static tableName = 'unpublished_bids'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createBid({
    linked_proposal_id,
    author_address,
    bid_proposal_data,
    publish_at,
    status,
  }: Omit<UnpublishedBidAttributes, 'id' | 'created_at'>) {
    checkEncryptionKey()

    const query = SQL`
    INSERT INTO ${table(this)} (linked_proposal_id, author_address, bid_proposal_data, publish_at, created_at, status) 
    VALUES (
      ${linked_proposal_id}, 
      ${author_address.toLowerCase()}, 
      pgp_sym_encrypt(${bid_proposal_data}, ${DB_ENCRYPTION_KEY}::text), 
      ${publish_at},
      now(),
      ${status}
      )
    `

    return await this.namedQuery('create_pending_bid', query)
  }

  static async getBidsInfoByTender(
    linked_proposal_id: string,
    status = BidStatus.Pending
  ): Promise<Pick<UnpublishedBidAttributes, 'author_address' | 'publish_at' | 'created_at'>[]> {
    const query = SQL`
    SELECT created_at, publish_at, author_address 
    FROM ${table(this)} 
    WHERE linked_proposal_id = ${linked_proposal_id} AND status = ${status} 
    ORDER BY created_at ASC`
    return await this.namedQuery('get_bids_by_tender', query)
  }

  static async getBidsReadyToPublish(): Promise<Omit<UnpublishedBidAttributes, 'status'>[]> {
    checkEncryptionKey()

    const query = SQL`
    SELECT id, created_at, author_address, publish_at, linked_proposal_id, pgp_sym_decrypt(bid_proposal_data::bytea, ${DB_ENCRYPTION_KEY}::text) as bid_proposal_data 
    FROM ${table(this)} 
    WHERE publish_at <= now() AND status = ${BidStatus.Pending}`

    const bids = await this.namedQuery('get_bids_ready_to_publish', query)

    return bids.map(({ id, created_at, author_address, linked_proposal_id, bid_proposal_data, publish_at }) => ({
      id,
      created_at,
      author_address,
      publish_at,
      linked_proposal_id,
      bid_proposal_data: JSON.parse(bid_proposal_data),
    }))
  }

  static async rejectBidsFromTenders(linked_proposal_ids: string[]) {
    if (linked_proposal_ids.length === 0) return []

    checkEncryptionKey()

    const decryptedBidsToRejectQuery = SQL`
    SELECT id, pgp_sym_decrypt(bid_proposal_data::bytea, ${DB_ENCRYPTION_KEY}::text) as bid_proposal_data
    FROM ${table(this)}
    WHERE linked_proposal_id IN (${join(
      linked_proposal_ids.map((id) => SQL`${id}`),
      SQL`, `
    )}) AND status = ${BidStatus.Pending}
    `
    const decryptedBids = await this.namedQuery('decrypt_bids_to_reject', decryptedBidsToRejectQuery)

    const rejectBidsFromTendersQuery = SQL`
    UPDATE ${table(this)} as t
    SET status = ${BidStatus.Rejected}, bid_proposal_data = c.bid_proposal_data
    FROM (values
      ${join(
        decryptedBids.map(({ id, bid_proposal_data }) => SQL`(${id}, ${bid_proposal_data})`),
        SQL`, `
      )}) as c(id, bid_proposal_data)
    WHERE t.id = c.id::integer`

    return await this.namedQuery('reject_bids_from_tenders', rejectBidsFromTendersQuery)
  }

  static async removePendingBid(author_address: string, linked_proposal_id: string) {
    const query = SQL`
    DELETE FROM ${table(this)} 
    WHERE author_address = ${author_address.toLowerCase()} 
      AND linked_proposal_id = ${linked_proposal_id} 
      AND status = ${BidStatus.Pending}`

    return await this.namedQuery('remove_pending_bid', query)
  }

  static async getOpenTendersTotal() {
    const query = SQL`
    SELECT COUNT(DISTINCT linked_proposal_id) AS total
    FROM ${table(this)} WHERE status = ${BidStatus.Pending};`

    return (await this.namedQuery('get_open_tenders_count', query))[0]
  }
}
