import { Model } from 'decentraland-gatsby/dist/entities/Database/model'
import { v1 as uuid } from 'uuid'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'proposal_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingUpdates(proposalId: string, duration: string) {
    const updatesQuantity = duration // TODO: Validate duration is between 1-12?
    const now = new Date()

    return Array.from(Array(updatesQuantity), async (_, index) => {
      const update: UpdateAttributes = {
        id: uuid(),
        proposal_id: proposalId,
        status: UpdateStatus.Pending,
        due_date: new Date(new Date().setMonth(now.getMonth() + index + 1)),
        created_at: now,
        updated_at: now,
      }

      await this.create(update)
    })
  }

  static async createUpdate(
    update: Omit<UpdateAttributes, 'id' | 'status' | 'due_date' | 'completion_date' | 'created_at' | 'updated_at'>
  ) {
    const now = new Date()

    return await this.create({
      id: uuid(),
      status: UpdateStatus.Done,
      due_date: undefined,
      completion_date: now,
      created_at: now,
      updated_at: now,
      ...update,
    })
  }
}
