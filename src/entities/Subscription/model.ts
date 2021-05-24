import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SubscriptionAttributes } from './types'

export default class SubscriptionModel extends Model<SubscriptionAttributes> {
  static tableName = 'proposal_subscriptions'
  static withTimestamps = false
  static primaryKey = 'proposal_id'
}