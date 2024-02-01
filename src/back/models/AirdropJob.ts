import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { AirdropJobStatus } from '../types/AirdropJob'

export type AirdropJobAttributes = {
  id: string
  badge_spec: string
  recipients: string[]
  status: AirdropJobStatus
  error?: string
  created_at: Date
  updated_at: Date
}

export default class AirdropJobModel extends Model<AirdropJobAttributes> {
  static tableName = 'airdrop_jobs'
  static withTimestamps = false
  static primaryKey = 'id'

  static async getPending() {
    const query = SQL`
        SELECT *
        FROM ${table(AirdropJobModel)}
        WHERE 
          "status" IN (${AirdropJobStatus.PENDING})
    `

    const result = await this.namedQuery<AirdropJobAttributes>('get_pending_airdrop_jobs', query)
    return result
  }

  static async getAll() {
    const query = SQL`
        SELECT *
        FROM ${table(AirdropJobModel)}
    `

    const result = await this.namedQuery<AirdropJobAttributes>('get_all_airdrop_jobs', query)
    return result
  }
}
