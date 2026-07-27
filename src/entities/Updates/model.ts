import crypto from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, objectValues, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'project_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  // Replace a project's pending updates atomically: the DELETE runs in a data-modifying CTE in the
  // same statement as the INSERT, so a crash can't drop the old rows without writing the new ones.
  static async replacePendingUpdates(projectId: string, updates: UpdateAttributes[]) {
    if (updates.length === 0) {
      return await this.delete<UpdateAttributes>({ project_id: projectId, status: UpdateStatus.Pending })
    }

    const keys = Object.keys(updates[0])
    const query = SQL`
      WITH deleted AS (
        DELETE FROM ${table(this)}
        WHERE "project_id" = ${projectId} AND "status" = ${UpdateStatus.Pending}
      )
      INSERT INTO ${table(this)} ${columns(keys)}
      VALUES ${objectValues(keys, updates)}
    `
    return await this.namedRowCount('replace_pending_updates', query)
  }

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
