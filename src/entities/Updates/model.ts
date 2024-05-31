import crypto from 'crypto'
import { Model } from 'decentraland-gatsby/dist/entities/Database/model'

import { type VestingInfo } from '../../clients/VestingData'
import Time from '../../utils/date/Time'
import { getMonthsBetweenDates } from '../../utils/date/getMonthsBetweenDates'

import { UpdateAttributes, UpdateStatus } from './types'

export default class UpdateModel extends Model<UpdateAttributes> {
  static tableName = 'project_updates'
  static withTimestamps = false
  static primaryKey = 'id'

  static async createPendingUpdates(proposalId: string, vestingContractData: VestingInfo) {
    if (proposalId.length < 0) throw new Error('Unable to create updates for empty proposal id')

    const now = new Date()
    const updatesQuantity = this.getAmountOfUpdates(vestingContractData)
    const firstUpdateStartingDate = Time.utc(vestingContractData.vestingStartAt).startOf('day')

    await UpdateModel.delete<UpdateAttributes>({ proposal_id: proposalId, status: UpdateStatus.Pending })

    const updates = Array.from(Array(updatesQuantity), (_, index) => {
      const update: UpdateAttributes = {
        id: crypto.randomUUID(),
        proposal_id: proposalId,
        status: UpdateStatus.Pending,
        due_date: this.getDueDate(firstUpdateStartingDate, index),
        created_at: now,
        updated_at: now,
      }

      return update
    })
    return await this.createMany(updates)
  }

  public static getAmountOfUpdates(vestingDates: VestingInfo) {
    const exactDuration = getMonthsBetweenDates(
      new Date(vestingDates.vestingStartAt),
      new Date(vestingDates.vestingFinishAt)
    )
    return exactDuration.months + (exactDuration.extraDays > 0 ? 1 : 0)
  }

  public static getDueDate(startingDate: Time.Dayjs, index: number) {
    return startingDate.add(1 + index, 'months').toDate()
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
}
