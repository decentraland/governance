import crypto from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'project_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createUpdate(
    update: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'>
  ): Promise<UpdateAttributes> {
    const now = new Date()

    return await this.create({
      id: crypto.randomUUID(),
      status: UpdateStatus.Done,
      due_date: undefined,
      completion_date: now,
      created_at: now,
      updated_at: now,
      ...update,
    })
  }

  static async getUpdatesWithoutForumPost() {
    const query = SQL`
      SELECT * 
      FROM ${table(this)}
      WHERE health IS NOT NULL
        AND discourse_topic_id IS NULL
        AND completion_date > '2023-08-10'
    `
    return this.namedQuery<UpdateAttributes>('get_updates_without_forum_post', query)
  }
}
