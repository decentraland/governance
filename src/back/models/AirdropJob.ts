import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

type AirdropAttributes = {
  id: string
  badge_spec: string
  recipients: string[]
  status: AirdropJobStatus
  error: string
  created_at: Date
  updated_at: Date
}

export enum AirdropJobStatus {
  PENDING = 'pending',
  FINISHED = 'finished',
  FAILED = 'failed',
}

export default class AirdropJob extends Model<AirdropAttributes> {
  static tableName = 'airdrop_jobs'
  static withTimestamps = false
  static primaryKey = 'id'
}
