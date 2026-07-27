import crypto from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { SQL, columns, objectValues, table } from 'decentraland-gatsby/dist/entities/Database/utils'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'project_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  // Builds a single statement that atomically replaces a project's pending updates: the DELETE runs
  // in a data-modifying CTE alongside the INSERT, so the old rows can't be dropped without writing
  // the new ones. Returned as a query so it can also run on a transaction client.
  static getReplacePendingUpdatesQuery(projectId: string, updates: UpdateAttributes[]) {
    if (updates.length === 0) {
      return SQL`DELETE FROM ${table(this)} WHERE "project_id" = ${projectId} AND "status" = ${UpdateStatus.Pending}`
    }

    const keys = Object.keys(updates[0])
    return SQL`
      WITH deleted AS (
        DELETE FROM ${table(this)}
        WHERE "project_id" = ${projectId} AND "status" = ${UpdateStatus.Pending}
      )
      INSERT INTO ${table(this)} ${columns(keys)}
      VALUES ${objectValues(keys, updates)}
    `
  }

  static async replacePendingUpdates(projectId: string, updates: UpdateAttributes[]) {
    return await this.namedRowCount('replace_pending_updates', this.getReplacePendingUpdatesQuery(projectId, updates))
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
