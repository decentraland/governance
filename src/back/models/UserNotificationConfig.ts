import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

export type UserNotificationConfigAttributes = {
  address: string
  last_notification_id: number
}

export default class UserNotificationConfigModel extends Model<UserNotificationConfigAttributes> {
  static tableName = 'user_notification_config'
  static withTimestamps = false
  static primaryKey = 'address'
}
